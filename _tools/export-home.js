const puppeteer = require('puppeteer-core'); const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' });
  const g = await b.newPage(); await g.setViewport({ width: 1000, height: 1000, deviceScaleFactor: 2 });
  await g.goto('http://localhost:8775/index.html', { waitUntil: 'networkidle2' }); await sleep(3500);
  const A = await (await g.$('#asis')).contentFrame(), T = await (await g.$('#tobe')).contentFrame();
  const m = f => f.evaluate(() => { const sc = [...document.querySelectorAll('*')].filter(e => /(auto|scroll)/.test(getComputedStyle(e).overflowY) && e.scrollHeight > e.clientHeight + 50)[0]; const y = t => { const e = [...document.querySelectorAll('*')].find(x => !x.children.length && (x.innerText || '').trim() === t); return e ? Math.round(e.getBoundingClientRect().top + sc.scrollTop) : null; }; return { 높이: sc.scrollHeight, 점수: y('이너뷰티 점수'), 체크인: y('아침 체크인'), 이너뷰티: y('이너뷰티'), 첫할일: (() => { const e = document.querySelector('[aria-label^="23시 30분"]'); return e ? Math.round(e.getBoundingClientRect().top + sc.scrollTop) : null; })() }; });
  console.log('전 AS-IS', JSON.stringify(await m(A))); console.log('전 TO-BE', JSON.stringify(await m(T)));
  await g.click('#pinBtn'); await sleep(400);                       // 점 숨김
  await g.screenshot({ path: '../export/home-1-체크인전.png', clip: { x: 0, y: 0, width: 1000, height: 960 } });
  for (let i = 0; i < 4; i++) { await A.evaluate(() => document.querySelectorAll('[role=radio]')[2].click()); await sleep(800); } await sleep(4000);
  console.log('후 AS-IS', JSON.stringify(await m(await (await g.$('#asis')).contentFrame()))); console.log('후 TO-BE', JSON.stringify(await m(await (await g.$('#tobe')).contentFrame())));
  await g.screenshot({ path: '../export/home-2-체크인후.png', clip: { x: 0, y: 0, width: 1000, height: 960 } });
  await b.close();
})();
