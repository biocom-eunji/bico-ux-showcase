const puppeteer = require('puppeteer-core');
(async () => {
  const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' });
  const p = await b.newPage(); await p.setViewport({ width: 390, height: 844 });
  await p.goto('http://localhost:8775/tobe/tobe-home.html', { waitUntil: 'networkidle2' }); await new Promise(r => setTimeout(r, 1500));
  console.log(await p.evaluate(() => {
    const out = [];
    const walk = (e, d, path) => {
      const r = e.getBoundingClientRect(); const cs = getComputedStyle(e);
      const t = (e.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 28);
      out.push(`${'  '.repeat(d)}${path} ${e.tagName.toLowerCase()} ${e.getAttribute('aria-label') ? '[' + e.getAttribute('aria-label').slice(0, 22) + ']' : ''} y${Math.round(r.top)} h${Math.round(r.height)} w${Math.round(r.width)} pos:${cs.position} "${t}"`);
      if (d < 6) [...e.children].forEach((c, i) => walk(c, d + 1, path + '>' + (i + 1)));
    };
    const sc = [...document.querySelectorAll('*')].filter(e => /(auto|scroll)/.test(getComputedStyle(e).overflowY) && e.scrollHeight > e.clientHeight + 50)[0];
    walk(sc, 0, 'sc');
    return 'scroller: ' + (sc && sc.tagName) + '\n' + out.filter(l => /y-?\d+ h\d+/.test(l)).slice(0, 120).join('\n');
  }));
  await b.close();
})();
