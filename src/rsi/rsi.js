const config = require('../config/config');
const BybitClient = require('../api/bybit_service');
const { getRsi } = require('./rsi_value');
const { sendRSItop } = require('../notifier/send_signal/send_rsi_signal');


const bybitClient = new BybitClient(config.BYBIT_API_KEY, config.BYBIT_SECRET_KEY);


function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


async function updateCandleForSymbol(interval, symbol) {

    console.log(`Processing symbol: ${symbol}`);

    await delay(300);

    const sampleCandles = await bybitClient.getCandles(symbol, interval, 200);
    console.log(`Fetched ${sampleCandles.length} candles for ${symbol}`);

    
   console.log('All symbols processed.');

   return sampleCandles;
}

async function testRsi() {

    const uniqueSymbols = await bybitClient.getTopTradingVolume(15);

    for (const symbol of uniqueSymbols) {
        console.log('testRsi() started.');
        const ohlc =  await updateCandleForSymbol('15', symbol.symbol);
  
    console.log(`testRsi() received ${uniqueSymbols.length} symbols for RSI analysis.`);

    const rsiValue = await getRsi(ohlc);

   
    if (rsiValue === null) {
      console.log(`Symbol: ${symbol.symbol}, RSI: Not enough data, interval: 15m`);
      continue;
    }

    if (rsiValue > 65 || rsiValue < 35) {
      try {
        await sendRSItop(symbol.symbol, '15');
      } catch (err) {
        console.error(`Failed to send signal for ${symbol}:`, err.message);
      }
    }
    console.log(`Symbol: ${symbol.symbol}, RSI: ${rsiValue}, interval: 15m`);
    };
  
  console.log('testRsi() finished.');
}

module.exports = {
  testRsi
};
