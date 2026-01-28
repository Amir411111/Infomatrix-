import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import wardrobeRoutes from './routes/wardrobe.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

console.log('🔧 Initializing server...');
console.log('MongoDB URI:', MONGODB_URI ? 'Configured ✓' : 'NOT CONFIGURED ✗');

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
}));
app.use(express.json({ limit: '50mb' })); // Для больших изображений в base64

// Явно обрабатываем OPTIONS запросы для preflight
app.options('*', cors());

// Simple request logger to debug CORS/preflight issues
app.use((req, res, next) => {
  console.log(`➡️  ${req.method} ${req.originalUrl} - headers:`, {
    origin: req.headers.origin,
    'access-control-request-method': req.headers['access-control-request-method'],
    'access-control-request-headers': req.headers['access-control-request-headers'],
  });
  next();
});

// Дополнительный middleware для явной обработки OPTIONS
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.sendStatus(200);
  }
  next();
});

// Root endpoint
app.get('/', (req, res) => {
  console.log('✓ GET /');
  res.json({ 
    status: 'OK', 
    message: 'ClothMatch Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      wardrobe: '/api/wardrobe'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('✓ GET /health');
  res.json({ status: 'OK', message: 'Server is running' });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  console.log('✓ GET /api/test');
  res.json({ status: 'OK', message: 'API test' });
});

// Маршруты
console.log('📚 Registering wardrobe routes...');
app.use('/api/wardrobe', wardrobeRoutes);
console.log('✓ Wardrobe routes registered');

// Обработка ошибок для неизвестных маршрутов
app.use((req, res) => {
  console.log('⚠️  GET', req.path, '- Route not found');
  res.status(404).json({ error: 'Route not found' });
});

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Подключение к MongoDB и запуск сервера
const startServer = async () => {
  try {
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI не установлен в .env файле');
    }

    console.log('\n🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });
    console.log('✅ MongoDB подключена успешно\n');
    console.log('>>> BEFORE app.listen()');

    const server = app.listen(PORT, 'localhost', () => {
      console.log(`✅ Сервер запущен на http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`📚 API: http://localhost:${PORT}/api/wardrobe`);
      console.log('\n🎉 Ready for requests!\n');
    });

    console.log('>>> AFTER app.listen()');

    server.on('error', (err) => {
      console.error('❌ Server error:', err.message);
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use`);
      }
    });
  } catch (error) {
    console.error('❌ Ошибка при запуске сервера:', error.message);
    process.exit(1);
  }
};

startServer();
