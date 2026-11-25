const puppeteer = require('puppeteer-core'); const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' });
  const g = await b.newPage(); await g.setViewport({ width: 1100, height: 980 }); const errs = []; g.on('pageerror', e => errs.push(e.message.slice(0, 90)));
  await g.goto('http://localhost:8775/index.html#/goal/score', { waitUntil: 'networkidle2' }); await sleep(4500);
  const A = await (await g.$('#asis')).contentFrame();
  console.log('경로', await g.evaluate(() => document.getElementById('asisPath').textContent), '| AS-IS 점', await A.evaluate(() => [...document.querySelectorAll('.uxpin')].map(d => d.getAttribute('aria-label').slice(0, 14)).join(' / ')));
  await g.screenshot({ path: 'shots/shell-goal-1.png' });
  // 스크롤해서 아래쪽 점 확인
  await A.evaluate(() => { const sc = [...document.querySelectorAll('*')].filter(e => /(auto|scroll)/.test(getComputedStyle(e).overflowY) && e.scrollHeight > e.clientHeight + 50)[0]; sc.scrollTop = 99999; }); await sleep(800);
  console.log('아래로 스크롤 뒤 점', await A.evaluate(() => [...document.querySelectorAll('.uxpin')].map(d => d.getAttribute('aria-label').slice(0, 12)).join(' / ')));
  const d = await A.evaluate(() => { const e = [...document.querySelectorAll('.uxpin')].find(x => x.getAttribute('aria-label').includes('할 일 카드 모양')); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left + 7, y: r.top + 7 }; });
  if (d) { const f = await (await g.$('#asis')).boundingBox(); const sc = f.width / 390; await g.mouse.move(f.x + d.x * sc, f.y + d.y * sc); await sleep(500); }
  await g.screenshot({ path: 'shots/shell-goal-2.png' }); console.log(errs); await b.close();
})();
