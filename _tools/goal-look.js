const puppeteer = require('puppeteer-core'); const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' });
  const g = await b.newPage(); await g.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  await g.goto('http://localhost:8776/goal/score', { waitUntil: 'networkidle2' }); await sleep(2000);
  const h = await g.evaluate(() => [...document.querySelectorAll('*')].filter(e => e.scrollHeight > e.clientHeight + 50).map(e => e.scrollHeight).sort((a, b) => b - a)[0]);
  console.log('scrollHeight', h);
  await g.setViewport({ width: 390, height: Math.min(h + 20, 4200), deviceScaleFactor: 1 }); await sleep(1500);
  await g.screenshot({ path: 'shots/goal-asis-full.png' });
  console.log(await g.evaluate(() => {
    const out = []; const seen = new Set();
    for (const e of document.querySelectorAll('body *')) { if (e.children.length) continue; const t = (e.innerText || '').trim(); if (!t) continue; const r = e.getBoundingClientRect(); out.push(Math.round(r.top) + '\t' + t.slice(0, 60)); }
    return out.join('\n');
  }));
  await b.close();
})();
