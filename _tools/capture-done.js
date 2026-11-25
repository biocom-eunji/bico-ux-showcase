// AS-IS에서 아침 체크인 4문항과 완료 뒤 모습을 떠서 tobe/home-done.json · home-done.css 로 저장한다.
const puppeteer = require('puppeteer-core'), fs = require('fs'), path = require('path');
const sleep = ms => new Promise(r => setTimeout(r, ms)), T = path.join(__dirname, '..', 'tobe');
(async () => {
  const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' });
  const p = await b.newPage(); await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await p.goto('http://localhost:8776/', { waitUntil: 'networkidle2' }); await sleep(1800);
  const rules = () => p.evaluate(() => [...document.styleSheets].flatMap(ss => { try { return [...ss.cssRules].map(r => r.cssText); } catch { return []; } }));
  const S0 = new Set(await rules());
  const qs = [], blocks = [];
  for (let i = 1; i <= 4; i++) {
    const q = await p.evaluate(() => {
      const radios = [...document.querySelectorAll('[role=radio]')];
      const lab = document.querySelector('[aria-label$="번째 질문"]');
      const card = radios[0].closest('div[class]');
      let e = radios[0]; for (let n = 0; n < 6 && e; n++, e = e.parentElement) { if (/\d\/4/.test(e.innerText || '') ) break; }
      const lines = (e.innerText || '').split('\n').map(s => s.trim()).filter(Boolean);
      return { step: lab && lab.getAttribute('aria-label'), lines: lines.slice(0, 8), labels: radios.map(r => r.getAttribute('aria-label')) };
    });
    qs.push(q); console.log(i, JSON.stringify(q));
    blocks.push(await p.evaluate(() => {   // 문항 영역(진행 점 · 질문 · 표정 5개)의 HTML
      let e = document.querySelector('[role=radio]'); let blk = e;
      for (let n = 0; n < 12 && e; n++, e = e.parentElement) { if ((e.innerText || '').includes('아침 체크인')) break; blk = e; }
      return blk.outerHTML.replace(/ data-nav="[^"]*"/g, '');
    }));
    await p.evaluate(() => document.querySelectorAll('[role=radio]')[2].click()); await sleep(1300);
  }
  await sleep(3500);
  const S1 = await rules(); const diff = S1.filter(r => !S0.has(r));
  fs.writeFileSync(path.join(T, 'home-done.css'), diff.join('\n'));
  const out = await p.evaluate(() => {
    const strip = h => h.replace(/ data-nav="[^"]*"/g, '');
    const trouble = document.querySelector('[aria-label^="트러블 없던 날"]');
    const card = trouble.parentElement;                                // 체크인 · 할 일 카드(알로 카드)
    const status = [...document.querySelectorAll('div')].find(x => x.children.length === 0 && /^(쿨쿨|눈이|반짝|막 깨어|조금)/.test((x.innerText || '').trim()));
    const pts = document.querySelector('[aria-label^="포인트"]');
    const awake = document.querySelector('[aria-label$="비코"]');
    return { cardHtml: strip(card.outerHTML), cardClass: card.className, status: status && status.innerText, statusBefore: '쿨쿨 자는 중', points: pts && pts.innerText.trim(), awakeAria: awake && awake.getAttribute('aria-label'), awakeHtml: awake && awake.parentElement.parentElement.outerHTML, lines: card.innerText.split('\n').map(s => s.trim()).filter(Boolean) };
  });
  fs.writeFileSync(path.join(T, 'home-done.json'), JSON.stringify({ questions: qs, blocks, ...out }, null, 1));
  console.log('규칙 차이', diff.length, '| 상태줄', out.status, '| 포인트', out.points, '| 비코 aria', out.awakeAria, '| 카드 html', Math.round(out.cardHtml.length / 1024) + 'KB');
  console.log(out.lines.join(' | '));
  await b.close();
})();
