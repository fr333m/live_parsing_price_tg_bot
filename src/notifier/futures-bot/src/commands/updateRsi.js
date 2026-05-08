const {testRsi} = require('../../../../rsi/rsi');

const userStates = new Map(); // userId → { step, data }

// ================== Утилиты ==================
const getUserId = (ctx) => ctx.from?.id;
const getMessageText = (ctx) => ctx.message?.text?.trim() || '';

const resetUserState = (userId) => {
  userStates.delete(userId);
};

// ================== Клавиатура таймфреймов ==================
const getIntervalsKeyboard = () => ({
  reply_markup: {
    inline_keyboard: [
      [
        { text: "1m",  callback_data: "interval_1" },
        { text: "5m",  callback_data: "interval_5" },
        { text: "15m", callback_data: "interval_15" },
      ],
      [
        { text: "30m", callback_data: "interval_30" },
        { text: "1h",  callback_data: "interval_60" },
        { text: "4h",  callback_data: "interval_240" },
      ]
    ]
  }
});

// ================== Валидация ==================
const validateInterval = (text) => {
  const val = text.toLowerCase().trim();
  const map = {
    '1m': '1', '5m': '5', '15m': '15', '30m': '30',
    '1h': '60', '4h': '240'
  };
  
  if (map[val]) return { isValid: true, value: map[val] };
  if (['1','5','15','30','60','240'].includes(val)) return { isValid: true, value: val };

  return { 
    isValid: false, 
    error: '❌ Неверный таймфрейм.\nДоступно: 1m, 5m, 15m, 30m, 1h, 4h' 
  };
};

const validateQuantity = (text) => {
  const normalized = text.replace(',', '.');
  const qty = Number(normalized);

  if (!Number.isFinite(qty) || qty < 1|| qty > 50) {
    return { 
      isValid: false, 
      error: '❌ Укажите количество от 1 до 50\nПример: 1 или 50' 
    };
  }
  return { isValid: true, value: qty };
};

// ================== Основные обработчики ==================
const startAddContract = async (ctx) => {
  const userId = getUserId(ctx);
  if (!userId) return;

  userStates.set(userId, {
    step: 'interval',
    data: {}
  });

  await ctx.reply('1/2 Выберите таймфрейм:', getIntervalsKeyboard());
};

// Обработка нажатия на кнопку таймфрейма
const handleIntervalCallback = async (ctx) => {
  try {
    const userId = getUserId(ctx);
    const data = ctx.callbackQuery.data;
    const rawInterval = data.replace('interval_', '');

    const state = userStates.get(userId);
    if (!state) {
      await ctx.answerCbQuery('Сессия истекла');
      await ctx.reply('Сессия истекла. Начните заново — /update_rsi');
      return;
    }

    state.data.interval = rawInterval;   // '1', '5', '15', '30', '60', '240'
    state.step = 'quantity';
    userStates.set(userId, state);

    await ctx.answerCbQuery(`✅ ${rawInterval}`);
    
    await ctx.editMessageText(
      `Таймфрейм: <b>${rawInterval}</b>\n\n` +
      '2/2 Введите количество контрактов (от 0.001 до 5):',
      { parse_mode: 'HTML' }
    );
  } catch (error) {
    console.error('Ошибка в handleIntervalCallback:', error);
    await ctx.answerCbQuery('Ошибка');
  }
};

// Обработка текстовых сообщений
const handleAddContractsMessage = async (ctx) => {
  const userId = getUserId(ctx);
  const text = getMessageText(ctx);

  if (!userId || !text || text.startsWith('/')) return;

  const state = userStates.get(userId);
  if (!state) return;

  // Шаг 1 — Таймфрейм (если вводят текстом)
  if (state.step === 'interval') {
    const result = validateInterval(text);
    
    if (!result.isValid) {
      await ctx.reply(result.error);
      return;
    }

    state.data.interval = result.value;
    state.step = 'quantity';
    userStates.set(userId, state);

    await ctx.reply(
      `Таймфрейм: <b>${result.value}</b>\n\n` +
      '2/2 Введите количество контрактов:',
      { parse_mode: 'HTML' }
    );
    return;
  }

  // Шаг 2 — Количество контрактов
  if (state.step === 'quantity') {
    const result = validateQuantity(text);

    if (!result.isValid) {
      await ctx.reply(result.error);
      return;
    }

    const interval = state.data.interval;
    const quantity = result.value;

    try {
      console.log(`[RSI UPDATE] testRsi('${interval}', '${quantity}')`);

      // ← Вот как ты просил:
      await testRsi(interval, quantity.toString());

      await ctx.reply(`✅ Успешно обновлено!\nТаймфрейм: ${interval} | Кол-во: ${quantity}`);

      resetUserState(userId);
    } catch (error) {
      console.error('Ошибка при вызове testRsi:', error);
      await ctx.reply('❌ Ошибка при обновлении. Попробуйте позже.');
      resetUserState(userId);
    }
  }
};

module.exports = {
  startAddContract,
  handleIntervalCallback,
  handleAddContractsMessage

};
