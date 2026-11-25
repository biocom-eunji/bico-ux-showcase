const puppeteer = require('puppeteer-core'); const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' });
  const g = await b.newPage(); await g.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 }); const errs = []; g.on('pageerror', e => errs.push(e.message.slice(0, 90)));
  await g.goto('http://localhost:8775/tobe/tobe-home.html', { waitUntil: 'networkidle2' }); await sleep(1500);
  const bars = () => g.evaluate(() => [...document.querySelector('[aria-label^="트러블 없던 날"]').querySelectorAll('div')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 30 && r.width < 45 && r.height > 8 && !e.children.length; }).map(e => { const c = getComputedStyle(e); return Math.round(e.getBoundingClientRect().height) + (c.borderTopStyle === 'dashed' ? 'dash' : ':' + c.backgroundColor.replace('rgba(22, 35, 43, 0.16)', '회색')); }).join(' '));
  console.log('체크인 전', await bars());
  await g.evaluate(() => { const sc = [...document.querySelectorAll('*')].filter(e => /(auto|scroll)/.test(getComputedStyle(e).overflowY) && e.scrollHeight > e.clientHeight + 50)[0]; sc.scrollTop = 300; }); await sleep(400);
  await g.screenshot({ path: 'shots/tobe-week-before.png', clip: { x: 0, y: 380, width: 390, height: 300 } });
  await g.evaluate(() => document.querySelector('[aria-label^="트러블 없던 날"]').scrollIntoView({ block: 'center' }));
  await g.screenshot({ path: 'shots/tobe-week-before.png' });
  await g.goto('http://localhost:8775/tobe/tobe-home.html', { waitUntil: 'networkidle2' }); await sleep(1200);
  for (let i = 0; i < 4; i++) { await g.evaluate(() => document.querySelectorAll('[role=radio]')[2].click()); await sleep(500); } await sleep(3800);
  console.log('체크인 뒤', await bars());
  await g.evaluate(() => document.querySelector('[aria-label^="트러블 없던 날"]').scrollIntoView({ block: 'center' })); await sleep(300);
  await g.screenshot({ path: 'shots/tobe-week-after.png' }); console.log(errs); await b.close();
})();
