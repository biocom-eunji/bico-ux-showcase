const puppeteer = require('puppeteer-core'); const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' });
  const p = await b.newPage(); await p.setViewport({ width: 390, height: 844 });
  await p.goto('http://localhost:8776/', { waitUntil: 'networkidle2' }); await sleep(1500);
  const dump = () => p.evaluate(() => [...document.querySelectorAll('[aria-label]')].map(e => e.getAttribute('aria-label') + ' [' + e.tagName + (e.getAttribute('role') ? ' ' + e.getAttribute('role') : '') + ']'));
  console.log('전:', (await dump()).join('\n'));
  for (let i = 0; i < 4; i++) { await p.evaluate(() => { const c = [...document.querySelectorAll('body *')].filter(e => getComputedStyle(e).cursor === 'pointer' && (e.getAttribute('aria-label') || '').length > 0).filter(e => { const q = e.getBoundingClientRect(); return q.width > 50 && q.width < 90 && Math.abs(q.width - q.height) < 6 && q.top > 150 && q.top < 800; }); c[2].click(); }); await sleep(1200); }
  await sleep(3500);
  console.log('\n후:', (await dump()).filter(x => /할 일|고정|확정|밤|종이|탄수|잠자리|다 하면|\+/.test(x)).join('\n'));
  await b.close();
})();
