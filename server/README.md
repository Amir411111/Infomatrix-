# ClothMatch Backend

Node.js + Express + MongoDB сервер для приложения ClothMatch.

## Структура

```
server/
├── index.js              # Главный файл сервера
├── package.json          # Зависимости
├── .env                  # Переменные окружения (не коммитить!)
├── .env.example          # Пример .env
├── models/
│   └── ClothingItem.js   # Mongoose модель для вещей
├── routes/
│   └── wardrobe.js       # API маршруты для гардероба
└── middleware/           # Пользовательские middleware (если нужны)
```

## Быстрый старт

```bash
npm install
npm start       # Начать сервер
npm run dev     # Режим разработки с автоперезагрузкой
```

## Переменные окружения

Скопируйте `.env.example` в `.env` и заполните:

```env
MONGODB_URI=mongodb+srv://...
PORT=3000
NODE_ENV=development
```

## API Маршруты

### Получить все вещи
```
GET /api/wardrobe
```

### Получить вещь по ID
```
GET /api/wardrobe/:id
```

### Добавить новую вещь
```
POST /api/wardrobe
Body: {
  "name": "string",
  "category": "tops|bottoms|dresses|outerwear|shoes|accessories",
  "color": "string",
  "season": ["spring", "summer", "autumn", "winter"],
  "imageBase64": "string (опционально)",
  "material": "string (опционально)",
  "style": "string (опционально)",
  "condition": "new|good|fair|worn (опционально)",
  "notes": "string (опционально)"
}
```

### Обновить вещь
```
PUT /api/wardrobe/:id
Body: { ...поля для обновления }
```

### Удалить вещь
```
DELETE /api/wardrobe/:id
```

### Получить вещи по категории
```
GET /api/wardrobe/category/:category
```

## Тестирование

Используйте Postman или curl для тестирования:

```bash
# Health check
curl http://localhost:3000/health

# Получить все вещи
curl http://localhost:3000/api/wardrobe

# Добавить вещь
curl -X POST http://localhost:3000/api/wardrobe \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Рубашка",
    "category": "tops",
    "color": "blue",
    "season": ["spring", "summer"]
  }'
```

## Логирование

Все ошибки логируются в console. Для production добавьте:
- Morgan для HTTP логирования
- Winston для файловых логов
- Sentry для мониторинга ошибок

## Развёртывание

Для production:
1. Используйте Heroku, Railway, или другой Node.js хостинг
2. Установите переменные окружения на хостинге
3. Убедитесь, что MongoDB Atlas IP whitelist обновлён
4. Добавьте HTTPS и аутентификацию

---

Подробнее см. [DATABASE_SETUP.md](../DATABASE_SETUP.md)
