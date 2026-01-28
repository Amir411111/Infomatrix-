const http = require('http');
const mongoose = require('mongoose');
require('dotenv').config();

const PORT = 3000;
const MONGODB_URI = process.env.MONGODB_URI;

console.log('🔗 Connecting to MongoDB...');
mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000
}).then(() => {
  console.log('✅ MongoDB connected');

  const server = http.createServer((req, res) => {
    console.log(`📨 ${req.method} ${req.url}`);
    
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    
    if (req.url === '/health') {
      res.end(JSON.stringify({ ok: true }));
    } else if (req.url === '/api/wardrobe' && req.method === 'GET') {
      res.end(JSON.stringify([]));
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Not found' }));
    }
  });

  server.listen(PORT, 'localhost', () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
  });

  server.on('error', (err) => {
    console.error('❌ Server error:', err.message);
    process.exit(1);
  });
}).catch(err => {
  console.error('❌ MongoDB error:', err.message);
  process.exit(1);
});

setTimeout(() => {
  console.error('⏱️ Startup timeout');
  process.exit(1);
}, 10000);
