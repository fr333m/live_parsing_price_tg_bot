const { startAddContract, handleIntervalCallback, handleAddContractsMessage } = require('./updateRsi');

const registerCommands = (bot) => {
  bot.command('update_rsi', startAddContract);
  
  bot.action(/^interval_/, handleIntervalCallback);
  bot.on('text', handleAddContractsMessage);

  console.log('✅ RSI Update handlers registered');
};

module.exports = { registerCommands };