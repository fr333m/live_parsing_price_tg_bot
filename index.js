const { createBot } = require('./src/notifier/futures-bot/src/bot');
const {testRsi} = require('./src/rsi/rsi');
testRsi();

console.log('🚀 Запуск бота...');

const bot = createBot();
let isBotRunning = false;

bot.launch()
    .then(() => {
        isBotRunning = true;
        console.log('✅ Бот успешно запущен!');
        console.log('📌 Используй /start для проверки');
    })
    .catch((err) => {
        console.error('❌ Ошибка при запуске бота:', err);
        console.error('⚠️ Проверьте:');
        console.error('   1. Интернет соединение');
        console.error('   2. Токен Telegram бота (config/config.js)');
        console.error('   3. Доступность Telegram API');
        isBotRunning = false;
    });

// Graceful shutdown
process.once('SIGINT', () => {
    if (isBotRunning) {
        bot.stop('SIGINT');
    } else {
        console.log('⚠️ Бот не был запущен, завершение процесса...');
        process.exit(0);
    }
});
process.once('SIGTERM', () => {
    if (isBotRunning) {
        bot.stop('SIGTERM');
    } else {
        console.log('⚠️ Бот не был запущен, завершение процесса...');
        process.exit(0);
    }
});