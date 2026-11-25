const puppeteer = require('puppeteer-core'); const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' });
  const g = await b.newPage(); await g.setViewport({ width: 390, height: 844 });
  await g.goto('http://localhost:8776/goal/score', { waitUntil: 'networkidle2' }); await sleep(2000);
  const labels = await g.evaluate(() => [...document.querySelectorAll('[aria-label]')].map(e => e.getAttribute('aria-label') + ' [' + (e.getAttribute('role') || e.tagName) + ']'));
  console.log(labels.join('\n'));
  const expanded = () => g.evaluate(() => [...document.querySelectorAll('[aria-expanded]')].map(e => (e.getAttribute('aria-label') || e.innerText.split('\n')[0]).slice(0, 14) + '=' + e.getAttribute('aria-expanded')).join(' | '));
  console.log('처음:', await expanded());
  await g.evaluate(() => { const e = [...document.querySelectorAll('[aria-label]')].find(x => x.getAttribute('aria-label').startsWith('진정')); if (e) e.click(); }); await sleep(800);
  console.log('진정 누름:', await expanded());
  console.log('집중 줄 아래 글:', await g.evaluate(() => { const t = document.body.innerText.split('\n').map(s => s.trim()).filter(Boolean); const i = t.indexOf('회복력'); return t.slice(i, i + 14).join(' | '); }));
  await b.close();
})();
