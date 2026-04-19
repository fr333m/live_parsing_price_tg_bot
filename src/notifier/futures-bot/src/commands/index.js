const updateRsi = require('./updateRsi');


const registerCommands = (bot) => {
    bot.command('update_rsi', updateRsi);
    console.log('✅ Все команды успешно зарегистрированы');
};

module.exports = { registerCommands };