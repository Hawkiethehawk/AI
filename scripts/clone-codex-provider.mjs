import { createHash, randomBytes } from "node:crypto";
import {
  createReadStream,
  createWriteStream,
  existsSync,
} from "node:fs";
import {
  mkdir,
  open,
  rename,
  stat,
  unlink,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { backup, DatabaseSync } from "node:sqlite";

const CODEX_DIR = "C:\\Users\\cy\\.codex";
const DATABASE_PATH = path.join(CODEX_DIR, "state_5.sqlite");
const BACKUP_ROOT = "E:\\LLM-Sandbox\\Codex\\migration-logs";
const SOURCE_PROVIDER = "openai";
const TARGET_PROVIDER = "custom";

function timestampForPath() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

function uuidV7() {
  const bytes = randomBytes(16);
  let timestamp = BigInt(Date.now());

  for (let index = 5; index >= 0; index -= 1) {
    bytes[index] = Number(timestamp & 0xffn);
    timestamp >>= 8n;
  }

  bytes[6] = (bytes[6] & 0x0f) | 0x70;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = bytes.toString("hex");
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20),
  ].join("-");
}

async function sha256(filePath) {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(filePath)) {
    hash.update(chunk);
  }
  return hash.digest("hex");
}

async function readFirstLine(filePath) {
  const handle = await open(filePath, "r");
  const chunks = [];
  let position = 0;

  try {
    while (true) {
      const buffer = Buffer.allocUnsafe(64 * 1024);
      const { bytesRead } = await handle.read(buffer, 0, buffer.length, position);

      if (bytesRead === 0) {
        const line = Buffer.concat(chunks).toString("utf8");
        return { bodyOffset: position, line, newline: "" };
      }

      const content = buffer.subarray(0, bytesRead);
      const newlineIndex = content.indexOf(0x0a);

      if (newlineIndex >= 0) {
        chunks.push(content.subarray(0, newlineIndex));
        let lineBuffer = Buffer.concat(chunks);
        let newline = "\n";

        if (lineBuffer.at(-1) === 0x0d) {
          lineBuffer = lineBuffer.subarray(0, lineBuffer.length - 1);
          newline = "\r\n";
        }

        return {
          bodyOffset: position + newlineIndex + 1,
          line: lineBuffer.toString("utf8"),
          newline,
        };
      }

      chunks.push(content);
      position += bytesRead;
      if (position > 16 * 1024 * 1024) {
        throw new Error(`Session metadata line is unexpectedly large: ${filePath}`);
      }
    }
  } finally {
    await handle.close();
  }
}

function replaceMappedIds(value, idMap) {
  if (typeof value === "string") {
    return idMap.get(value) ?? value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => replaceMappedIds(item, idMap));
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        replaceMappedIds(item, idMap),
      ]),
    );
  }
  return value;
}

function replaceIdsInStructuredString(value, idMap) {
  if (typeof value !== "string" || !value.startsWith("{")) {
    return value;
  }

  try {
    return JSON.stringify(replaceMappedIds(JSON.parse(value), idMap));
  } catch {
    return value;
  }
}

async function cloneSessionFile(entry, idMap) {
  const { bodyOffset, line, newline } = await readFirstLine(entry.sourcePath);
  const metadata = JSON.parse(line);

  if (
    metadata.type !== "session_meta" ||
    metadata.payload?.model_provider !== SOURCE_PROVIDER ||
    ![metadata.payload?.id, metadata.payload?.session_id].includes(entry.sourceId)
  ) {
    throw new Error(`Unexpected session metadata: ${entry.sourcePath}`);
  }

  metadata.payload = replaceMappedIds(metadata.payload, idMap);
  metadata.payload.id = entry.targetId;
  metadata.payload.session_id = entry.targetId;
  metadata.payload.model_provider = TARGET_PROVIDER;

  const temporaryPath = `${entry.targetPath}.clone-tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(metadata)}${newline}`, {
    flag: "wx",
  });

  try {
    if (bodyOffset < entry.sourceSize) {
      await pipeline(
        createReadStream(entry.sourcePath, { start: bodyOffset }),
        createWriteStream(temporaryPath, { flags: "a" }),
      );
    }
    await rename(temporaryPath, entry.targetPath);
  } catch (error) {
    await unlink(temporaryPath).catch(() => {});
    throw error;
  }
}

function cloneThreadRow(row, entry, idMap) {
  return {
    ...row,
    id: entry.targetId,
    rollout_path: entry.targetPath,
    model_provider: TARGET_PROVIDER,
    source: replaceIdsInStructuredString(row.source, idMap),
    thread_source: replaceIdsInStructuredString(row.thread_source, idMap),
  };
}

async function main() {
  const backupDirectory = path.join(
    BACKUP_ROOT,
    `codex-${SOURCE_PROVIDER}-to-${TARGET_PROVIDER}-clone-${timestampForPath()}`,
  );
  await mkdir(backupDirectory, { recursive: true });

  const database = new DatabaseSync(DATABASE_PATH);
  database.exec("PRAGMA busy_timeout = 30000");

  let entries = [];
  let databaseCommitted = false;

  try {
    const columns = database
      .prepare("PRAGMA table_info(threads)")
      .all()
      .map((column) => column.name);
    const sourceRows = database
      .prepare(
        "SELECT * FROM threads WHERE model_provider = ? ORDER BY created_at, id",
      )
      .all(SOURCE_PROVIDER);

    if (sourceRows.length === 0) {
      throw new Error(`No ${SOURCE_PROVIDER} sessions were found.`);
    }

    const existingIds = new Set(
      database
        .prepare("SELECT id FROM threads")
        .all()
        .map((row) => row.id),
    );
    const idMap = new Map();

    for (const row of sourceRows) {
      let targetId;
      do {
        targetId = uuidV7();
      } while (existingIds.has(targetId));
      existingIds.add(targetId);
      idMap.set(row.id, targetId);
    }

    for (const row of sourceRows) {
      if (!existsSync(row.rollout_path)) {
        throw new Error(`Missing source session: ${row.rollout_path}`);
      }

      const sourceInfo = await stat(row.rollout_path);
      const targetId = idMap.get(row.id);
      const targetName = path
        .basename(row.rollout_path)
        .replace(row.id, targetId);

      if (targetName === path.basename(row.rollout_path)) {
        throw new Error(`Session ID is absent from filename: ${row.rollout_path}`);
      }

      const targetPath = path.join(path.dirname(row.rollout_path), targetName);
      if (existsSync(targetPath)) {
        throw new Error(`Clone target already exists: ${targetPath}`);
      }

      entries.push({
        sourceId: row.id,
        targetId,
        sourcePath: row.rollout_path,
        targetPath,
        sourceSize: sourceInfo.size,
        sourceModifiedAt: sourceInfo.mtime.toISOString(),
        sourceHash: await sha256(row.rollout_path),
        archived: row.archived,
      });
    }

    const manifestPath = path.join(backupDirectory, "clone-manifest.json");
    await writeFile(
      manifestPath,
      JSON.stringify(
        {
          createdAt: new Date().toISOString(),
          sourceProvider: SOURCE_PROVIDER,
          targetProvider: TARGET_PROVIDER,
          databasePath: DATABASE_PATH,
          status: "prepared",
          entries,
        },
        null,
        2,
      ),
      "utf8",
    );

    await backup(database, path.join(backupDirectory, "state_5.before.sqlite"));

    for (let index = 0; index < entries.length; index += 1) {
      await cloneSessionFile(entries[index], idMap);
      if ((index + 1) % 20 === 0 || index + 1 === entries.length) {
        console.log(`Cloned ${index + 1}/${entries.length} session files`);
      }
    }

    const sourceChanges = [];
    const invalidCloneFiles = [];
    for (const entry of entries) {
      const currentSourceInfo = await stat(entry.sourcePath);
      const currentSourceHash = await sha256(entry.sourcePath);
      if (
        currentSourceInfo.size !== entry.sourceSize ||
        currentSourceInfo.mtime.toISOString() !== entry.sourceModifiedAt ||
        currentSourceHash !== entry.sourceHash
      ) {
        sourceChanges.push(entry.sourcePath);
      }

      const clonedInfo = await stat(entry.targetPath);
      const clonedHeader = await readFirstLine(entry.targetPath);
      const clonedMetadata = JSON.parse(clonedHeader.line);
      const expectedSize =
        Buffer.byteLength(`${clonedHeader.line}${clonedHeader.newline}`) +
        entry.sourceSize -
        (await readFirstLine(entry.sourcePath)).bodyOffset;

      if (
        clonedInfo.size !== expectedSize ||
        clonedMetadata.type !== "session_meta" ||
        clonedMetadata.payload?.id !== entry.targetId ||
        clonedMetadata.payload?.session_id !== entry.targetId ||
        clonedMetadata.payload?.model_provider !== TARGET_PROVIDER
      ) {
        invalidCloneFiles.push(entry.targetPath);
      }
    }

    if (sourceChanges.length > 0) {
      throw new Error(
        `Source sessions changed during cloning: ${sourceChanges.join(", ")}`,
      );
    }
    if (invalidCloneFiles.length > 0) {
      throw new Error(
        `Cloned session file verification failed: ${invalidCloneFiles.join(", ")}`,
      );
    }

    const placeholders = columns.map(() => "?").join(", ");
    const insertThread = database.prepare(
      `INSERT INTO threads (${columns.join(", ")}) VALUES (${placeholders})`,
    );
    const sourceRowsById = new Map(sourceRows.map((row) => [row.id, row]));
    const spawnEdges = database
      .prepare(
        `SELECT parent_thread_id, child_thread_id, status
         FROM thread_spawn_edges`,
      )
      .all()
      .filter(
        (edge) =>
          idMap.has(edge.parent_thread_id) && idMap.has(edge.child_thread_id),
      );
    const dynamicTools = database
      .prepare("SELECT * FROM thread_dynamic_tools")
      .all()
      .filter((tool) => idMap.has(tool.thread_id));

    const dynamicToolColumns = database
      .prepare("PRAGMA table_info(thread_dynamic_tools)")
      .all()
      .map((column) => column.name);
    const insertDynamicTool = database.prepare(
      `INSERT INTO thread_dynamic_tools (${dynamicToolColumns.join(", ")})
       VALUES (${dynamicToolColumns.map(() => "?").join(", ")})`,
    );
    const insertSpawnEdge = database.prepare(
      `INSERT INTO thread_spawn_edges
       (parent_thread_id, child_thread_id, status) VALUES (?, ?, ?)`,
    );

    database.exec("BEGIN IMMEDIATE");
    try {
      for (const entry of entries) {
        const clonedRow = cloneThreadRow(
          sourceRowsById.get(entry.sourceId),
          entry,
          idMap,
        );
        insertThread.run(...columns.map((column) => clonedRow[column]));
      }

      for (const tool of dynamicTools) {
        const clonedTool = { ...tool, thread_id: idMap.get(tool.thread_id) };
        insertDynamicTool.run(
          ...dynamicToolColumns.map((column) => clonedTool[column]),
        );
      }

      for (const edge of spawnEdges) {
        insertSpawnEdge.run(
          idMap.get(edge.parent_thread_id),
          idMap.get(edge.child_thread_id),
          edge.status,
        );
      }

      database.exec("COMMIT");
      databaseCommitted = true;
    } catch (error) {
      database.exec("ROLLBACK");
      throw error;
    }

    const clonedIds = new Set(entries.map((entry) => entry.targetId));
    const clonedRows = database
      .prepare("SELECT id, model_provider, rollout_path FROM threads")
      .all()
      .filter((row) => clonedIds.has(row.id));
    const invalidClones = clonedRows.filter(
      (row) =>
        row.model_provider !== TARGET_PROVIDER || !existsSync(row.rollout_path),
    );

    if (
      clonedRows.length !== entries.length ||
      invalidClones.length > 0
    ) {
      throw new Error("Cloned session verification failed.");
    }

    await writeFile(
      manifestPath,
      JSON.stringify(
        {
          createdAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          sourceProvider: SOURCE_PROVIDER,
          targetProvider: TARGET_PROVIDER,
          databasePath: DATABASE_PATH,
          databaseBackup: path.join(
            backupDirectory,
            "state_5.before.sqlite",
          ),
          status: "completed",
          sourceSessionCount: sourceRows.length,
          clonedSessionCount: clonedRows.length,
          clonedSpawnEdgeCount: spawnEdges.length,
          clonedDynamicToolCount: dynamicTools.length,
          sourceFilesVerifiedUnchanged: sourceChanges.length === 0,
          entries,
        },
        null,
        2,
      ),
      "utf8",
    );

    console.log(
      JSON.stringify(
        {
          status: "completed",
          backupDirectory,
          sourceSessionsPreserved: sourceRows.length,
          customClonesCreated: clonedRows.length,
          clonedSpawnEdges: spawnEdges.length,
        },
        null,
        2,
      ),
    );
  } catch (error) {
    if (!databaseCommitted) {
      for (const entry of entries) {
        await unlink(entry.targetPath).catch(() => {});
      }
    }
    throw error;
  } finally {
    database.close();
  }
}

await main();
