const puppeteer = require('puppeteer-core');
(async () => {
  const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' });
  const g = await b.newPage(); await g.setViewport({ width: 390, height: 844 });
  await g.goto('http://localhost:8775/tobe/_orig/tobe-home.html', { waitUntil: 'networkidle2' }); await new Promise(r => setTimeout(r, 1200));
  const out = await g.evaluate(() => {
    const h = [...document.querySelectorAll('div,h1,h2,h3,h4,span')].find(x => x.children.length === 0 && (x.innerText || '').trim() === '오늘의 60초');
    if (!h) return '제목 요소를 못 찾음';
    let e = h; const rows = [];
    for (let i = 0; i < 8 && e; i++, e = e.parentElement) {
      const t = e.innerText || '';
      rows.push(`${i}: h${Math.round(e.getBoundingClientRect().height)} kids${e.children.length} 온보딩:${t.includes('온보딩 보기')} 점수:${t.includes('이너뷰티 점수')} 발효:${t.includes('발효식품')}`);
    }
    return rows.join('\n');
  });
  console.log(out); await b.close();
})();
