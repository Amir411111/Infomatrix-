import http from 'http';

process.stdout.write('1. Создаю сервер\n');

const server = http.createServer((req, res) => {
  process.stdout.write(`Запрос к ${req.url}\n`);
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.end(JSON.stringify({ok: true}));
});

process.stdout.write('2. Сервер создан, начинаю слушать\n');

const PORT = 3000;
server.listen(PORT, '0.0.0.0');

server.on('listening', () => {
  process.stdout.write('3. ✅ Сервер запущен на ' + PORT + '\n');
});

server.on('error', (err) => {
  process.stderr.write('4. ❌ Ошибка сервера: ' + err.message + ' (' + err.code + ')\n');
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  process.stderr.write('5. ❌ Необработанная ошибка: ' + err.message + '\n');
  process.exit(1);
});

process.stdout.write('6. Скрипт загружен\n');
