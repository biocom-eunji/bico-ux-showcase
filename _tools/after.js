const puppeteer = require('puppeteer-core'); const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' });
  const p = await b.newPage(); await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await p.goto('http://localhost:8776/', { waitUntil: 'networkidle2' }); await sleep(1500);
  for (let i = 0; i < 4; i++) { await p.evaluate(() => { const c = [...document.querySelectorAll('body *')].filter(e => getComputedStyle(e).cursor === 'pointer' && (e.getAttribute('aria-label') || '').length > 0).filter(e => { const q = e.getBoundingClientRect(); return q.width > 50 && q.width < 90 && Math.abs(q.width - q.height) < 6 && q.top > 150 && q.top < 800; }); c[2].click(); }); await sleep(1200); }
  await sleep(3500);
  const t = await p.evaluate(() => document.body.innerText.split('\n').map(s => s.trim()).filter(Boolean));
  const i0 = t.findIndex(x => x.includes('를 위해 오늘 할 일')); console.log(t.slice(i0 - 2, i0 + 40).join(' | '));
  await p.evaluate(() => { const sc = [...document.querySelectorAll('*')].filter(e => /(auto|scroll)/.test(getComputedStyle(e).overflowY) && e.scrollHeight > e.clientHeight + 50)[0]; sc.scrollTop = 650; }); await sleep(500);
  await p.screenshot({ path: 'shots/after-checkin-scroll.png' });
  await b.close();
})();
