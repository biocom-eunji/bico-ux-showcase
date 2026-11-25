const puppeteer = require('puppeteer-core'); const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' });
  const p = await b.newPage(); await p.setViewport({ width: 1100, height: 980 });
  const errs = []; p.on('pageerror', e => errs.push(e.message.slice(0, 100))); p.on('console', m => m.type() === 'error' && errs.push('console: ' + m.text().slice(0, 100)));
  await p.goto('http://localhost:8775/index.html', { waitUntil: 'networkidle2' }); await sleep(3500);
  const fr = async id => (await (await p.$('#' + id)).contentFrame());
  const A = await fr('asis'), T = await fr('tobe');
  const cnt = async f => f.evaluate(() => document.querySelectorAll('.uxpin').length);
  console.log('초기 점 수 asis/tobe:', await cnt(A), await cnt(T), '| tobe 글자:', (await T.evaluate(() => document.body.innerText.slice(0, 40).replace(/\n/g, ' '))));
  await p.screenshot({ path: 'shots/shell-1-home.png' });
  // 점에 마우스 올리기(첫 점)
  const box = await A.evaluate(() => { const d = document.querySelectorAll('.uxpin')[2]; const r = d.getBoundingClientRect(); return { x: r.left + 7, y: r.top + 7, t: d.getAttribute('aria-label') }; });
  const ifr = await (await p.$('#asis')).boundingBox(); const sc = ifr.width / 390;
  await p.mouse.move(ifr.x + box.x * sc, ifr.y + box.y * sc); await sleep(500);
  console.log('말풍선:', await p.evaluate(() => { const b = document.getElementById('bubble'); return b.style.display + ' | ' + b.innerText.replace(/\n/g, ' / ').slice(0, 120); }));
  await p.screenshot({ path: 'shots/shell-2-bubble.png' });
  // AS-IS에서 점수 카드 눌러 이동 → TO-BE 동기화
  await p.mouse.move(5, 5);
  await A.evaluate(() => document.querySelector('[aria-label^="이너뷰티 점수"]').click()); await sleep(2500);
  console.log('이동 후 현재:', await p.evaluate(() => document.getElementById('asisPath').textContent), '| tobe src:', await p.evaluate(() => document.getElementById('tobe').getAttribute('src')));
  console.log('점수상세 tobe 글자:', (await (await fr('tobe')).evaluate(() => document.body.innerText.slice(0, 50).replace(/\n/g, ' '))));
  await p.screenshot({ path: 'shots/shell-3-score.png' });
  // TO-BE에서 링크 눌러 이동 → AS-IS 동기화
  const T2 = await fr('tobe');
  await T2.evaluate(() => document.querySelector('[data-nav="/record/diet/add"]').click()); await sleep(3000);
  console.log('TO-BE 클릭 후:', await p.evaluate(() => document.getElementById('asisPath').textContent), '| asis url:', (await fr('asis')).url());
  await p.screenshot({ path: 'shots/shell-4-diet.png' });
  console.log('오류:', errs.slice(0, 6));
  await b.close();
})();
