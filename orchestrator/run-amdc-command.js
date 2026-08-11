const path = require('path');
const { spawnSync } = require('child_process');

const script = process.argv[2];
if (!script) {
  console.error('Usage: node orchestrator/run-amdc-command.js <npm-script>');
  process.exit(2);
}
if (!/^[A-Za-z0-9:_-]+$/.test(script)) {
  console.error('Invalid AMDC npm script name');
  process.exit(2);
}

const projectDir = path.resolve(__dirname, '..', 'apps', 'AMDC');
const result = spawnSync('npm', ['--prefix', projectDir, 'run', script], {
  cwd: projectDir,
  env: { ...process.env, AMDC_PROJECT_DIR: projectDir },
  stdio: 'inherit',
  shell: true,
});

if (result.error) {
  console.error(`AMDC command failed to start: ${result.error.message}`);
  process.exit(1);
}
process.exit(result.status == null ? 1 : result.status);
