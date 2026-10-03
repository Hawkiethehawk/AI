import asyncio
import datetime as dt
import os
from pathlib import Path

import httpx


BASE_URL = "http://127.0.0.1:8900"
BOOK_ID = "7241590549344422923"
REPO_ROOT = Path(__file__).resolve().parents[2]
OUTPUT_PATH = REPO_ROOT / "output" / "text" / "高武：从杀鸡开始横推星空 - 叶灵渡.txt"
PARTIAL_PATH = OUTPUT_PATH.with_suffix(".txt.part")


async def fetch_chapter(client, semaphore, index, chapter):
    async with semaphore:
        last_error = ""
        for attempt in range(4):
            try:
                response = await client.get(
                    f"{BASE_URL}/content",
                    params={"chapter_id": chapter["id"]},
                    timeout=75.0,
                )
                payload = response.json()
                content = payload.get("data", {}).get("content", "") if payload.get("code") == 0 else ""
                if content.strip():
                    return index, chapter["title"], content, ""
                last_error = payload.get("msg", "正文为空")
            except Exception as exc:
                last_error = str(exc)
            await asyncio.sleep(0.8 * (attempt + 1))
        return index, chapter["title"], "", last_error


async def main():
    info_response = httpx.get(
        f"{BASE_URL}/info",
        params={"book_id": BOOK_ID},
        timeout=30.0,
        trust_env=False,
    )
    info_payload = info_response.json()
    if info_payload.get("code") != 0:
        raise RuntimeError(info_payload.get("msg", "无法获取书籍信息"))

    book = info_payload["data"]
    chapters = book["chapters"]
    failed_chapters = []
    semaphore = asyncio.Semaphore(16)

    with PARTIAL_PATH.open("w", encoding="utf-8", newline="\n") as output:
        output.write(f"{book['title']}\n")
        output.write(f"作者：{book['author']}\n")
        output.write(f"来源：https://fanqienovel.com/page/{BOOK_ID}\n")
        output.write(f"导出时间：{dt.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        output.write("\n" + "=" * 48 + "\n\n")

        async with httpx.AsyncClient(trust_env=False) as client:
            batch_size = 64
            for start in range(0, len(chapters), batch_size):
                batch = chapters[start : start + batch_size]
                results = await asyncio.gather(
                    *[
                        fetch_chapter(client, semaphore, start + offset, chapter)
                        for offset, chapter in enumerate(batch)
                    ]
                )
                for _, title, content, error in sorted(results):
                    output.write(title + "\n\n")
                    if content:
                        output.write(content.rstrip() + "\n\n")
                    else:
                        failed_chapters.append((title, error))
                        output.write("[本章正文获取失败。]\n\n")
                    output.write("\n")
                output.flush()
                print(
                    f"PROGRESS={min(start + len(batch), len(chapters))}/{len(chapters)}; "
                    f"FAILED={len(failed_chapters)}",
                    flush=True,
                )

        if failed_chapters:
            output.write("\n" + "=" * 48 + "\n")
            output.write(f"导出说明：以下 {len(failed_chapters)} 章未能获取正文。\n")
            for title, error in failed_chapters:
                output.write(f"- {title}：{error}\n")

    os.replace(PARTIAL_PATH, OUTPUT_PATH)
    print(f"COMPLETE={OUTPUT_PATH}; FAILED={len(failed_chapters)}", flush=True)


if __name__ == "__main__":
    asyncio.run(main())
