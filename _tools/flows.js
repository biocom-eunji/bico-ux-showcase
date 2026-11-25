const puppeteer = require('puppeteer-core');
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' });
  const p = await b.newPage(); await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  const txt = () => p.evaluate(() => document.body.innerText.split('\n').map(s => s.trim()).filter(Boolean));
  const clickText = async (t, nth = 0) => { const h = await p.evaluateHandle((t, n) => { const els = [...document.querySelectorAll('body *')].filter(e => getComputedStyle(e).cursor === 'pointer' && (e.getAttribute('aria-label') || e.innerText || '').trim().startsWith(t)); return els[n]; }, t, nth); const el = h.asElement(); if (!el) return false; await p.evaluate(e => e.scrollIntoView({ block: 'center' }), el); await sleep(300); await el.click(); await sleep(1200); return true; };
  // 1) 아침 체크인: 4문항 끝까지
  await p.goto('http://localhost:8776/', { waitUntil: 'networkidle2' }); await sleep(1500);
  for (let i = 1; i <= 5; i++) {
    const t = await txt(); const i0 = t.findIndex(x => /^\d\/4$/.test(x));
    console.log(`[체크인 ${i}]`, i0 >= 0 ? t.slice(i0 - 2, i0 + 4).join(' | ') : t.slice(t.findIndex(x => x.includes('체크인')) , t.findIndex(x => x.includes('체크인')) + 8).join(' | '));
    if (!(await clickText('보통이에요'))) break;
    await p.screenshot({ path: `shots/checkin-step${i}.png` });
  }
  console.log('url', await p.evaluate(() => location.pathname));
  // 2) 식단 기록: 아침 선택 후 시트 내용
  await p.goto('http://localhost:8776/record/diet/add', { waitUntil: 'networkidle2' }); await sleep(1500);
  await clickText('아침'); console.log('[식단/아침]', (await txt()).slice(0, 30).join(' | '));
  await p.screenshot({ path: 'shots/diet-add-meal.png' });
  const opts = await p.evaluate(() => [...document.querySelectorAll('body *')].filter(e => getComputedStyle(e).cursor === 'pointer').map(e => (e.getAttribute('aria-label') || e.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 30)).filter(Boolean));
  console.log('눌리는 것', [...new Set(opts)].join(' / '));
  await b.close();
})();
