const getIntervalsKeyboard = () => {
  const intervals = ['1', '5', '15', '30', '1h', '4h'];
  
  const buttons = intervals.map((interval) =>
    Markup.button.callback(
      interval,
      `interval_${interval}`
    )
  );

  // Разделяем кнопки по 3 в ряду
  const keyboard = [];
  for (let i = 0; i < buttons.length; i += 3) {
    keyboard.push(buttons.slice(i, i + 3));
  }

  return Markup.inlineKeyboard(keyboard);
};

module.exports = {
    getIntervalsKeyboard
}