const puppeteer = require('puppeteer-core'); const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' });
  const g = await b.newPage(); await g.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 }); const errs = []; g.on('pageerror', e => errs.push(e.message.slice(0, 90)));
  await g.goto('http://localhost:8775/tobe/tobe-home.html', { waitUntil: 'networkidle2' }); await sleep(1500);
  const info = () => g.evaluate(() => { const r = [...document.querySelectorAll('[role=radio]')].map(e => Math.round(e.getBoundingClientRect().left + e.getBoundingClientRect().width / 2)); const m = document.querySelector('.tb-mid'); const mr = m && m.getBoundingClientRect(); return JSON.stringify({ 가운데표정x: r[2], 보통글자x: mr && Math.round(mr.left + mr.width / 2), 글자: [...document.querySelectorAll('div')].filter(x => !x.children.length && ['나쁨', '보통', '좋음'].includes((x.innerText || '').trim()) && x.getBoundingClientRect().top > 500).map(x => x.innerText.trim()).join('/') }); });
  console.log('1/4', await info());
  await g.evaluate(() => document.querySelector('[aria-label^="1/4"]').scrollIntoView({ block: 'center' })); await sleep(300);
  await g.screenshot({ path: 'shots/tobe-mid-q1.png', clip: { x: 0, y: 200, width: 390, height: 300 } });
  await g.evaluate(() => document.querySelectorAll('[role=radio]')[2].click()); await sleep(700);
  console.log('2/4', await info());
  await g.screenshot({ path: 'shots/tobe-mid-q2.png' }); console.log(errs); await b.close();
})();
