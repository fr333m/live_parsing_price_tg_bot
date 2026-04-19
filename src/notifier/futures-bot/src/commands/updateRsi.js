const {testRsi} = require('../../../../rsi/rsi');

const updateRsi = async (ctx) => {
    try {
        await ctx.reply('🔄 Запускаю обновление RSI...');

        await testRsi();

        await ctx.reply('✅ RSI успешно обновлён!');
        
    } catch (error) {
        console.error('Ошибка в /update_rsi:', error);
        await ctx.reply('❌ Произошла ошибка при обновлении RSI.');
    }
};

module.exports = updateRsi;