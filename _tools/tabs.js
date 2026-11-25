const puppeteer = require('puppeteer-core');
(async () => {
  const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' });
  const p = await b.newPage();
  await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  const errs = []; p.on('pageerror', e => errs.push(e.message.slice(0, 120)));
  await p.goto('http://localhost:8776/', { waitUntil: 'networkidle2' }); await new Promise(r => setTimeout(r, 2000));
  for (const name of ['기록', '홈']) {
    const ok = await p.evaluate(n => { const el = [...document.querySelectorAll('div,a')].filter(e => e.children.length <= 3 && e.innerText?.trim() === n).pop(); if (!el) return false; el.click(); return true; }, name);
    await new Promise(r => setTimeout(r, 1500));
    console.log(name, ok, await p.evaluate(() => location.pathname + ' | ' + document.body.innerText.slice(0, 80).replace(/\n/g, ' / ')));
    await p.screenshot({ path: `shots/tab-${name}.png` });
  }
  console.log(errs);
  await b.close();
})();
