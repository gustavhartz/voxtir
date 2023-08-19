const { spawn } = require('child_process');

async function runCommands() {
  const serverProcess = spawn('npm', ['run', 'generate', '&', 'npm', 'run', 'tsc', '&', 'npm', 'run', 'dev'], {
    cwd: './server',
    shell: true,
    stdio: 'inherit',
  });

  const dockerProcess = spawn('docker-compose', ['up'], {
    shell: true,
    stdio: 'inherit',
  });

  await new Promise((resolve) => serverProcess.on('close', resolve));

  const prismaStudioProcess = spawn('npx', ['prisma', 'studio'], {
    cwd: './server',
    shell: true,
    stdio: 'inherit',
  });
}

runCommands();
