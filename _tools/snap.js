// AS-IS 화면을 TO-BE 초안(정적 HTML 복제)으로 떠서 tobe/tobe-<키>.html 로 저장한다.
// 스타일은 CSSOM에서 모아 한 덩어리로 넣고, 눌리는 요소에는 data-nav(이동 주소)를 붙인다.
const puppeteer = require('puppeteer-core'), fs = require('fs'), path = require('path');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const OUT = path.join(__dirname, '..', 'tobe');
const SCREENS = [
  { route: '/', key: 'home', graph: 'graph-home.json' },
  { route: '/goal/score', key: 'goal-score', graph: 'graph_goal_score.json' },
  { route: '/record/diet/add', key: 'diet-add', graph: 'graph_record_diet_add.json' },
];
const TABS = { '콘텐츠': '/content', '기록': '/record', '홈': '/', 'AI': '/ai', '쇼핑': '/shop' };
(async () => {
  const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' });
  for (const s of SCREENS) {
    const g = JSON.parse(fs.readFileSync(path.join(__dirname, s.graph), 'utf8'));
    const nav = { ...TABS };
    for (const c of g.cands) if (c.kind === 'route' && c.label && c.path !== s.route) nav[c.label] = decodeURIComponent(c.path.split('?')[0]);
    const p = await b.newPage(); await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
    await p.goto('http://localhost:8776' + s.route, { waitUntil: 'networkidle2' }); await sleep(2500);
    const html = await p.evaluate((nav, key) => {
      const css = [...document.styleSheets].map(ss => { try { return [...ss.cssRules].map(r => r.cssText).join('\n'); } catch { return ''; } }).join('\n');
      // 크롤과 같은 방식으로 눌리는 요소의 이름을 만들어 이동 주소를 붙인다 (복제 전에 원본에 표시)
      for (const el of document.querySelectorAll('body *')) {
        if (getComputedStyle(el).cursor !== 'pointer') continue;
        if (el.parentElement && getComputedStyle(el.parentElement).cursor === 'pointer') continue;
        const r = el.getBoundingClientRect(); if (r.width < 8 || r.height < 8) continue;
        const l = (el.getAttribute('aria-label') || el.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 40);
        const k = Object.keys(nav).find(k => l === k || (l.length >= 4 && (l.startsWith(k) || k.startsWith(l))));
        if (k) el.setAttribute('data-nav', nav[k]);
      }
      const root = document.documentElement.cloneNode(true);
      root.querySelectorAll('script,style,link[rel=stylesheet],.uxpin,noscript').forEach(e => e.remove());
      const head = root.querySelector('head');
      head.insertAdjacentHTML('afterbegin', '<base href="http://localhost:8776/"><meta charset="utf-8">');
      head.insertAdjacentHTML('beforeend', '<style>' + css + '</style>');
      root.querySelector('body').insertAdjacentHTML('beforeend', '<script src="http://localhost:8775/ux-pins.js"></script><script src="http://localhost:8775/ux-bridge.js"></script>');
      root.querySelectorAll('[data-nav]').forEach(e => { e.style.cursor = 'pointer'; });
      return '<!doctype html>\n<html lang="ko">' + root.innerHTML + '</html>';
    }, nav, s.key);
    // 원본은 tobe/_orig/ 에 보관하고, 고친 TO-BE 파일은 --force 없이는 덮어쓰지 않는다
    fs.mkdirSync(path.join(OUT, '_orig'), { recursive: true });
    fs.writeFileSync(path.join(OUT, '_orig', `tobe-${s.key}.html`), html);
    const dest = path.join(OUT, `tobe-${s.key}.html`);
    if (!fs.existsSync(dest) || process.argv.includes('--force')) fs.writeFileSync(dest, html); else console.log('  (고친 파일이라 덮어쓰지 않음: ' + s.key + ')');
    console.log(s.key, Math.round(html.length / 1024) + 'KB', '이동', Object.keys(nav).length);
    await p.close();
  }
  fs.writeFileSync(path.join(OUT, 'tobe-other.html'), `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>@font-face{font-family:Pretendard;font-weight:400;src:url(http://localhost:8776/assets/assets/fonts/Pretendard-Medium.7305f90c923d4409825ec2f4380b63d6.ttf)}body{margin:0;font-family:Pretendard,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;background:#f5f6f8;color:#1c2230;text-align:center}.b{padding:24px}.b p{color:#6b7385;font-size:14px;line-height:1.6}a{display:inline-block;margin-top:14px;padding:10px 18px;border-radius:999px;background:#1c2230;color:#fff;text-decoration:none;font-size:14px}</style></head><body><div class="b"><h2>이번 범위 밖 화면이에요</h2><p>TO-BE는 홈 · 점수 상세 · 식단 기록하기만 다뤄요.<br>왼쪽 AS-IS에서는 이 화면을 그대로 볼 수 있어요.</p><a href="#" data-nav="/">홈으로</a></div><script src="http://localhost:8775/ux-bridge.js"></script></body></html>`);
  await b.close();
})();
