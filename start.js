const { exec } = require('child_process');
const net = require('net');

function findFreePort(startPort) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(startPort, () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
    server.on('error', () => {
      findFreePort(startPort + 1).then(resolve);
    });
  });
}

async function start() {
  const port = await findFreePort(8081);
  console.log(`Starting Expo on port ${port}`);
  const { spawn } = require('child_process');
  const expo = spawn('npx', ['expo', 'start', '--port', port.toString()], {
    stdio: 'inherit',
    shell: true
  });
  
  expo.on('close', (code) => {
    console.log(`Expo process exited with code ${code}`);
  });
}

start();

