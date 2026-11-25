// 홈·기록에서 눌리는 요소를 모두 눌러 보고, 이동/오버레이를 graph.json 에 기록한다 (로컬 사본에서만)
const puppeteer = require('puppeteer-core'), fs = require('fs');
const BASE = 'http://localhost:8776', START = process.argv[2] || '/', OUT = process.argv[3] || 'graph-home.json';
const SKIP = /시연 초기화|초기화|삭제|로그아웃|탈퇴/;
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' });
  const p = await b.newPage(); await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  const load = async () => { await p.goto(BASE + START, { waitUntil: 'networkidle2' }); await sleep(1500); };
  const lines = () => p.evaluate(() => document.body.innerText.split('\n').map(s => s.trim()).filter(Boolean));
  await load();
  const cands = await p.evaluate(() => {
    const out = []; let n = 0;
    for (const el of document.querySelectorAll('body *')) {
      if (getComputedStyle(el).cursor !== 'pointer') continue;
      if (el.parentElement && getComputedStyle(el.parentElement).cursor === 'pointer') continue;
      const r = el.getBoundingClientRect(); if (r.width < 8 || r.height < 8) continue;
      el.setAttribute('data-cid', String(n));
      const label = (el.getAttribute('aria-label') || el.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 40) || '(아이콘)';
      out.push({ cid: n++, label, y: Math.round(r.top + scrollY), w: Math.round(r.width), h: Math.round(r.height) });
    }
    return out;
  });
  console.log('후보', cands.length);
  const base = await lines(), res = [];
  for (const c of cands) {
    if (SKIP.test(c.label)) { res.push({ ...c, skipped: true }); continue; }
    await load();
    await p.evaluate(() => { let n = 0; for (const el of document.querySelectorAll('body *')) { if (getComputedStyle(el).cursor !== 'pointer') continue; if (el.parentElement && getComputedStyle(el.parentElement).cursor === 'pointer') continue; const r = el.getBoundingClientRect(); if (r.width < 8 || r.height < 8) continue; el.setAttribute('data-cid', String(n++)); } });
    const h = await p.$(`[data-cid="${c.cid}"]`); if (!h) { res.push({ ...c, error: '요소 없음' }); continue; }
    const before = new Set(await lines());
    try { await p.evaluate(e => e.scrollIntoView({ block: 'center' }), h); await sleep(300); await h.click(); } catch (e) { res.push({ ...c, error: String(e.message).slice(0, 60) }); continue; }
    await sleep(1200);
    const path = await p.evaluate(() => location.pathname + location.search);
    const after = await lines(), added = after.filter(l => !before.has(l)).slice(0, 12), gone = [...before].filter(l => !after.includes(l)).length;
    const shot = `shots/${START.replace(/\W/g, '') || 'home'}-${c.cid}.png`;
    await p.screenshot({ path: shot });
    res.push({ ...c, path, kind: path !== START ? 'route' : (added.length ? 'overlay' : 'none'), added, gone, shot });
    console.log(c.cid, c.label, '→', path, added.length ? `(+${added.length})` : '');
  }
  fs.writeFileSync(OUT, JSON.stringify({ start: START, cands: res }, null, 1));
  await b.close();
})();
