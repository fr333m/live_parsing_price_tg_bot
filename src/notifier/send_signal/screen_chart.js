const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const fs = require('fs');
const path = require('path');

// Настраиваем пути на диске E
const BASE_DIR = 'E:\\puppeteer-temp';
const USER_DATA_DIR = path.join(BASE_DIR, 'user-data');
const CACHE_DIR = path.join(BASE_DIR, 'cache');
const TMP_DIR = path.join(BASE_DIR, 'tmp');

// Создаём папки, если их нет
[BASE_DIR, USER_DATA_DIR, CACHE_DIR, TMP_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

function cleanDirs() {
  [USER_DATA_DIR, CACHE_DIR, TMP_DIR].forEach(dir => {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
    fs.mkdirSync(dir, { recursive: true });
  });
}

async function getBybitChartScreenshot(symbol, interval) {
  // cleanDirs();
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      `--user-data-dir=${USER_DATA_DIR}`,
      `--disk-cache-dir=${CACHE_DIR}`,
      `--disk-cache-size=500000000`,
      '--disable-dev-shm-usage'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  const url = `https://www.bybit.com/trade/usdt/${symbol}`;
  await page.goto(url, { waitUntil: 'networkidle2' });

  try {
    await new Promise(r => setTimeout(r, 8000)); // 8 сек на TradingView

    const selector = '.chart'; // ← замени после инспекта
    await page.waitForSelector(selector, { timeout: 30000 });

    const chartElement = await page.$(selector);
    if (!chartElement) throw new Error('График не найден');

    const boundingBox = await chartElement.boundingBox();
    if (!boundingBox) throw new Error('Не удалось получить координаты графика');

    const centerX = boundingBox.x + boundingBox.width / 2;
    const centerY = boundingBox.y + boundingBox.height / 2;

    await page.mouse.move(centerX, centerY);

    // Если interval === 5, кликаем на элемент по XPath перед зумом
    if (interval === '1') {
      const selectorTf = 'div#sfeKlineArea > div > div.tv-self--fullscreen-wrap > div.self-tv_tool-header > div > div.flex-align-center.no-shrink.margin-right-8 > div.flex.f-12 > div.self-tool--time-intervals > div:nth-child(2)';
      const element = await page.$(selectorTf);
      if (element) await element.click();
    }
    if (interval === '5') {
      const selectorTf = 'div#sfeKlineArea > div > div.tv-self--fullscreen-wrap > div.self-tv_tool-header > div > div.flex-align-center.no-shrink.margin-right-8 > div.flex.f-12 > div.self-tool--time-intervals > div:nth-child(3)';
      const element = await page.$(selectorTf);
      if (element) await element.click();
    }
    if (interval === '15') {
      const selectorTf = 'div#sfeKlineArea > div > div.tv-self--fullscreen-wrap > div.self-tv_tool-header > div > div.flex-align-center.no-shrink.margin-right-8 > div.flex.f-12 > div.self-tool--time-intervals > div:nth-child(4)';
      const element = await page.$(selectorTf);
      if (element) await element.click();
    }
    if (interval === '30') {
      const selectorTf = 'div#sfeKlineArea > div > div.tv-self--fullscreen-wrap > div.self-tv_tool-header > div > div.flex-align-center.no-shrink.margin-right-8 > div.flex.f-12 > div.self-tool--time-intervals > div:nth-child(5)';
      const element = await page.$(selectorTf);
      if (element) await element.click();
    }
    

    // === ЗУМ (Ctrl + колесо) ===
    await page.keyboard.down('ControlLeft');
    for (let i = 0; i < 3; i++) {
      await page.mouse.wheel({ deltaY: -120 });
      await new Promise(r => setTimeout(r, 600));
    }
    await page.keyboard.up('ControlLeft');

    await new Promise(r => setTimeout(r, 2000)); // пауза после зума

    // === СДВИГ ГРАФИКА ВЛЕВО (drag ЛКМ вправо) ===
    await page.mouse.move(centerX, centerY);
    await page.mouse.down();
    await page.mouse.move(centerX - 400, centerY, { steps: 20 });
    await new Promise(r => setTimeout(r, 1000));
    await page.mouse.up();

    await new Promise(r => setTimeout(r, 2000)); // пауза после сдвига

    // Скриншот
    const screenshotBuffer = await chartElement.screenshot({
      type: 'png',
      omitBackground: true
    });


    await browser.close();
    return screenshotBuffer;
  } catch (error) {
    await page.screenshot({ path: `error_${symbol}.png`, fullPage: true });
    console.log(`Ошибка! Полный скриншот: error_${symbol}.png`);
    await browser.close();
    throw error;
  }
}


module.exports = { getBybitChartScreenshot };