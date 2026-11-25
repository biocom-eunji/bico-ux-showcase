const puppeteer = require('puppeteer-core'); const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' });
  const g = await b.newPage(); await g.setViewport({ width: 390, height: 844 });
  await g.goto('http://localhost:8776/goal/score', { waitUntil: 'networkidle2' }); await sleep(2500);
  const pos = await g.evaluate(() => { const t = [...document.querySelectorAll('div')].find(x => !x.children.length && (x.innerText || '').trim() === '23시 30분 전에 잠자리에 들기'); t.scrollIntoView({ block: 'center' }); const r = t.getBoundingClientRect(); return { x: 40, y: r.top + r.height / 2 }; });
  const before = await g.evaluate(() => document.body.innerText.length);
  await g.mouse.click(pos.x, pos.y); await sleep(1500);
  console.log('원 위치 클릭 → 경로:', await g.evaluate(() => location.pathname), '| 글자 수 변화:', before, '→', await g.evaluate(() => document.body.innerText.length));
  const done = await g.evaluate(() => /했어요|완료/.test(document.body.innerText));
  console.log('완료 표시 생김:', done);
  await b.close();
})();
