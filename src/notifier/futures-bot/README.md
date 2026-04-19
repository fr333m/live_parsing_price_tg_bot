# Futures Bot

Telegram бот для отслеживания фьючерсов и RSI сигналов.

## Установка

```bash
npm install
```

## Конфигурация

1. Копируй `.env.example` в `.env`:
```bash
cp .env.example .env
```

2. Добавь свой `BOT_TOKEN` от BotFather в Telegram

## Запуск

### Разработка
```bash
npm run dev
```

### Продакшн
```bash
npm start
```

## Структура проекта

- `src/index.js` - Точка входа
- `src/bot.js` - Создание и регистрация бота
- `src/config.js` - Конфигурация и переменные окружения
- `src/database/` - SQLite база данных
- `src/commands/` - Telegram команды
- `src/middlewares/` - Общие middlewares
- `src/utils/` - Вспомогательные функции
- `src/keyboards/` - Inline клавиатуры

## Команды

- `/start` - Начало работы
- `/list` - Список контрактов
- `/delete` - Удалить контракт
- `/tracking` - Отслеживаемые контракты
- `/rsi` - Обновить RSI
