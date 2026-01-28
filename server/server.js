import http from 'http';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();


const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

// Простая модель
const clothingSchema = new mongoose.Schema({
  name: String,
  category: String,
  color: String,
  season: [String],
  material: String,
  style: String,
  condition: String,
  imageBase64: String,
  notes: String,
  userId: { type: String, default: 'default' },
  createdAt: { type: Date, default: Date.now }
});

const ClothingItem = mongoose.model('ClothingItem', clothingSchema);

// Подключаемся к MongoDB
console.log('🔗 Connecting to MongoDB...');

// Async IIFE для инициализации
(async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000
    });
    console.log('✅ MongoDB connected');
    
    // Создаём HTTP сервер ПОСЛЕ успешного подключения
    const server = http.createServer(async (req, res) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Content-Type', 'application/json');

      // Health check
      if (req.url === '/health' && req.method === 'GET') {
        res.writeHead(200);
        res.end(JSON.stringify({ status: 'OK' }));
        return;
      }

      // GET /api/wardrobe
      if (req.url === '/api/wardrobe' && req.method === 'GET') {
        try {
          const items = await ClothingItem.find({ userId: 'default' }).sort({ createdAt: -1 });
          res.writeHead(200);
          res.end(JSON.stringify(items));
        } catch (err) {
          res.writeHead(500);
          res.end(JSON.stringify({ error: err.message }));
        }
        return;
      }

      // POST /api/wardrobe
      if (req.url === '/api/wardrobe' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
          try {
            const item = new ClothingItem(JSON.parse(body));
            await item.save();
            res.writeHead(201);
            res.end(JSON.stringify(item));
          } catch (err) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: err.message }));
          }
        });
        return;
      }

      // DELETE /api/wardrobe/:id
      if (req.url.startsWith('/api/wardrobe/') && req.method === 'DELETE') {
        const id = req.url.split('/').pop();
        try {
          await ClothingItem.findByIdAndDelete(id);
          res.writeHead(200);
          res.end(JSON.stringify({ ok: true }));
        } catch (err) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: err.message }));
        }
        return;
      }

      // 404
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Not found' }));
    });

    server.listen(PORT, 'localhost', () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log(`📊 Health: http://localhost:${PORT}/health`);
      console.log(`📚 API: http://localhost:${PORT}/api/wardrobe`);
    });

    server.on('error', (err) => {
      console.error('❌ Server error:', err.message);
      process.exit(1);
    });
  } catch (err) {
    console.error('❌ MongoDB error:', err.message);
    process.exit(1);
  }
})();
