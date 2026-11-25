const puppeteer = require('puppeteer-core');
(async () => {
  const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' });
  const g = await b.newPage(); await g.setViewport({ width: 390, height: 844 });
  await g.goto('http://localhost:8775/tobe/_orig/tobe-home.html', { waitUntil: 'networkidle2' }); await new Promise(r => setTimeout(r, 1200));
  console.log(await g.evaluate(() => {
    const btn = document.querySelector('[aria-label^="트러블 없던 날"]'); const out = [];
    const walk = (e, d) => { const c = getComputedStyle(e), r = e.getBoundingClientRect();
      const bg = c.backgroundColor, bd = c.borderTopStyle + ' ' + c.borderTopColor;
      if (bg !== 'rgba(0, 0, 0, 0)' || c.borderTopStyle === 'dashed' || e.children.length === 0)
        out.push('  '.repeat(d) + e.tagName.toLowerCase() + ` ${Math.round(r.width)}x${Math.round(r.height)} bg:${bg} bd:${c.borderTopStyle === 'none' ? '-' : bd} color:${c.color} "${(e.innerText || '').trim().slice(0, 10)}"`);
      [...e.children].forEach(k => walk(k, d + 1)); };
    walk(btn, 0); return out.join('\n');
  }));
  await b.close();
})();
