const puppeteer = require('puppeteer-core'); const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' });
  const p = await b.newPage(); await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await p.goto('http://localhost:8776/', { waitUntil: 'networkidle2' }); await sleep(1500);
  const M = () => p.evaluate(() => {
    const sc = [...document.querySelectorAll('*')].filter(e => { const s = getComputedStyle(e); return /(auto|scroll)/.test(s.overflowY) && e.scrollHeight > e.clientHeight + 50; }).sort((a, b) => b.scrollHeight - a.scrollHeight)[0];
    const top = t => { const e = [...document.querySelectorAll('body *')].filter(x => x.children.length === 0 && x.innerText?.trim() === t)[0]; if (!e) return null; const r = e.getBoundingClientRect(); return Math.round(r.top + (sc ? sc.scrollTop : 0)); };
    return { scroller: sc ? sc.tagName + ' h' + sc.scrollHeight + ' c' + sc.clientHeight : null, y: Object.fromEntries(['이너뷰티 점수', '분석 정확도', '아침 체크인', '트러블 없던 날', '이너뷰티', '식단', '회복', '오늘의 60초', '온보딩 보기'].map(t => [t, top(t)])) };
  });
  console.log('초기', JSON.stringify(await M()));
  // 체크인 4문항: 가운데(3번째) 답을 4번 누름
  for (let i = 1; i <= 4; i++) {
    const ok = await p.evaluate(() => { const c = [...document.querySelectorAll('body *')].filter(e => getComputedStyle(e).cursor === 'pointer' && (e.getAttribute('aria-label') || '').length > 0); const r = e => e.getBoundingClientRect(); const face = c.filter(e => { const q = r(e); return q.width > 50 && q.width < 90 && Math.abs(q.width - q.height) < 6 && q.top > 150 && q.top < 800; }); if (face.length < 3) return face.length; face[2].click(); return 'ok'; });
    console.log('답', i, ok); await sleep(1200);
    await p.screenshot({ path: `shots/checkin-done-${i}.png` });
  }
  const t = await p.evaluate(() => document.body.innerText.split('\n').map(s => s.trim()).filter(Boolean));
  const i0 = t.findIndex(x => x.includes('체크인')); console.log('완료 뒤 텍스트:', t.slice(i0, i0 + 30).join(' | '));
  console.log('완료 뒤', JSON.stringify(await M()));
  await b.close();
})();
