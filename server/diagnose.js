import http from 'http';
import fs from 'fs';
import path from 'path';

const logFile = path.join(process.cwd(), 'server.log');

const log = (msg) => {
  const timestamp = new Date().toISOString();
  fs.appendFileSync(logFile, `${timestamp} ${msg}\n`);
  console.log(msg);
};

log('1. Скрипт запущен');

const server = http.createServer((req, res) => {
  log(`2. Запрос: ${req.method} ${req.url}`);
  res.writeHead(200);
  res.end('OK');
});

log('3. Сервер создан');

server.listen(3000, '127.0.0.1', () => {
  log('4. Слушаю на 127.0.0.1:3000');
});

server.on('error', (err) => {
  log(`5. Ошибка: ${err.code} ${err.message}`);
});

log('6. Скрипт инициализирован');
