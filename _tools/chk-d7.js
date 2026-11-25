const puppeteer = require('puppeteer-core');
(async () => {
  const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' });
  const g = await b.newPage(); await g.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  const errs = []; g.on('pageerror', e => errs.push(e.message.slice(0, 90)));
  const url = process.argv[2];
  await g.goto(url, { waitUntil: 'networkidle2' }); await new Promise(r => setTimeout(r, 1500));
  const info = await g.evaluate(() => {
    const sc = [...document.querySelectorAll('*')].filter(e => /(auto|scroll)/.test(getComputedStyle(e).overflowY) && e.scrollHeight > e.clientHeight + 50)[0];
    const t = document.body.innerText; const h = sc.scrollHeight; sc.scrollTop = 99999;
    return JSON.stringify({ scrollH: h, 오늘의60초: t.includes('오늘의 60초'), 발효식품: t.includes('발효식품'), 온보딩: t.includes('온보딩 보기') });
  });
  console.log(url.includes('tobe') ? 'TO-BE' : 'AS-IS', info, errs);
  await new Promise(r => setTimeout(r, 500)); await g.screenshot({ path: process.argv[3] });
  await b.close();
})();
