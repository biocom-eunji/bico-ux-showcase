const puppeteer = require('puppeteer-core'); const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' });
  const p = await b.newPage(); await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  const done = async () => { await p.goto('http://localhost:8776/', { waitUntil: 'networkidle2' }); await sleep(1500); for (let i = 0; i < 4; i++) { await p.evaluate(() => document.querySelectorAll('[role=radio]')[2].click()); await sleep(900); } await sleep(3800); };
  const labels = ['23시 30분 전에 잠자리에 들기', '2주 정제 탄수화물 줄여 보기', '잠들기 전 종이책 읽기'];
  const lines = () => p.evaluate(() => document.body.innerText.split('\n').map(s => s.trim()).filter(Boolean));
  for (const l of labels) {
    await done();
    const before = new Set(await lines());
    // 카드 전체를 눌러 봄
    const h = await p.$(`[aria-label="${l}"]`);
    await p.evaluate(e => e.scrollIntoView({ block: 'center' }), h); await sleep(300);
    const info = await p.evaluate(e => ({ html: e.innerText.replace(/\n/g, ' | '), kids: e.querySelectorAll('[role],button,[tabindex]').length, rect: JSON.stringify(e.getBoundingClientRect()) }), h);
    await h.click(); await sleep(1500);
    const path = await p.evaluate(() => location.pathname), after = await lines();
    console.log(`[${l}] → ${path} | 새 글: ${after.filter(x => !before.has(x)).slice(0, 8).join(' / ')} | ${info.html.slice(0, 90)}`);
    await p.screenshot({ path: `shots/task-${labels.indexOf(l)}.png` });
  }
  // 첫 카드의 ▲ 아이콘만 따로
  await done();
  const tri = await p.evaluate(() => { const c = document.querySelector('[aria-label="23시 30분 전에 잠자리에 들기"]'); const k = [...c.querySelectorAll('*')].filter(e => e.getBoundingClientRect().width < 60 && e.getBoundingClientRect().width > 30 && getComputedStyle(e).cursor === 'pointer'); return k.map(e => e.tagName + ' ' + (e.getAttribute('aria-label') || '') + ' ' + Math.round(e.getBoundingClientRect().left)); });
  console.log('▲ 후보', tri);
  await b.close();
})();
