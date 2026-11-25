const puppeteer = require('puppeteer-core');
(async () => {
  const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' });
  const p = await b.newPage();
  await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  const errs = [], reqs = [];
  p.on('pageerror', e => errs.push('pageerror: ' + e.message.slice(0, 150)));
  p.on('requestfailed', r => reqs.push('fail: ' + r.url().slice(0, 120)));
  p.on('response', r => { if (r.status() >= 400) reqs.push(r.status() + ' ' + r.url().slice(0, 120)); });
  await p.goto('http://localhost:8776/', { waitUntil: 'networkidle2', timeout: 60000 }).catch(e => errs.push('goto: ' + e.message));
  await new Promise(r => setTimeout(r, 3000));
  await p.screenshot({ path: 'shots/home.png', fullPage: false });
  const info = await p.evaluate(() => ({ url: location.href, text: document.body.innerText.slice(0, 600), links: [...document.querySelectorAll('a[href]')].map(a => a.getAttribute('href')).slice(0, 20) }));
  console.log(JSON.stringify(info, null, 1)); console.log(errs.slice(0, 8), reqs.slice(0, 12));
  await b.close();
})();
