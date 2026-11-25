const puppeteer = require('puppeteer-core'); const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' });
  const g = await b.newPage(); await g.setViewport({ width: 390, height: 844 });
  await g.goto('http://localhost:8776/goal/score', { waitUntil: 'networkidle2' }); await sleep(2500);
  const Q = { 장: '장이 편하고 배변이 편안해요?', 음식: '먹고 나서 불편한 반응이 적은 편이에요?', 진정: '트러블이나 붉어짐이 덜 올라와요?', 탄수: '먹은 것이 당으로 크게 출렁이지 않아요?', 회복: '쉬고 나면 다시 기운이 차요?' };
  const open = () => g.evaluate(Q => { const t = document.body.innerText; return Object.entries(Q).filter(([k, v]) => t.includes(v)).map(([k]) => k).join(',') || '(없음)'; }, Q);
  console.log('처음 열려 있는 줄:', await open());
  const click = async lab => { const h = await g.$(`[aria-label^="${lab}"]`); await h.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(300); await h.click(); await sleep(900); };
  await click('장 73'); console.log('장 누른 뒤:', await open());
  await click('진정 56'); console.log('진정 누른 뒤:', await open());
  await click('진정 56'); console.log('진정 다시 누른 뒤:', await open());
  await click('회복력 44'); console.log('회복력 누른 뒤:', await open());
  const t = await g.evaluate(() => { const l = document.body.innerText.split('\n').map(s => s.trim()).filter(Boolean); const i = l.indexOf('쉬고 나면 다시 기운이 차요?'); return l.slice(i, i + 16).join(' | '); });
  console.log('회복력 펼침 내용:', t);
  await b.close();
})();
