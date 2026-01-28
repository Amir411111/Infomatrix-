const http = require('http');

const PORT = 3000;

console.log('1. Creating server...');

const server = http.createServer((req, res) => {
  console.log(`📨 ${req.method} ${req.url}`);
  res.writeHead(200);
  res.end('OK');
});

console.log('2. Server created, calling listen()...');

server.listen(PORT, 'localhost');

console.log('3. listen() called');

server.on('listening', () => {
  console.log('✅ Server is listening on http://localhost:' + PORT);
});

server.on('error', (err) => {
  console.error('❌ Error:', err.message);
});

console.log('4. Script initialized');

// Check if listening
setTimeout(() => {
  console.log('⏱️ 5 seconds passed');
}, 5000);
