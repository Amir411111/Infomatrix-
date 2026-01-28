import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  console.log('GET / - запрос к корневому маршруту');
  res.json({ message: 'Backend работает!' });
});

app.get('/test', (req, res) => {
  console.log('GET /test - тестовый запрос');
  res.json({ message: 'Тест успешен!' });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Тестовый сервер запущен на http://localhost:${PORT}`);
});
