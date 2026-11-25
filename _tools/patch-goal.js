// _orig/tobe-goal-score.html(AS-IS 복제)에 결정(D10~)을 적용해 tobe/tobe-goal-score.html 을 만든다.
// D10: 화면 순서를 정책 10-3대로 — 머리 · 정확도 줄 → 점수 흐름 → 이번 주 움직임 → 하위 지표 → 올리려면
const puppeteer = require('puppeteer-core'), fs = require('fs'), path = require('path');
const T = path.join(__dirname, '..', 'tobe');
(async () => {
  const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' });
  const p = await b.newPage(); await p.setViewport({ width: 390, height: 844 });
  await p.goto('http://localhost:8775/tobe/_orig/tobe-goal-score.html', { waitUntil: 'networkidle2' }); await new Promise(r => setTimeout(r, 1200));
  const out = await p.evaluate(() => {
    const card = title => {                                   // 제목 글자에서 카드 폭(330px 이상)까지 올라간 요소
      let e = [...document.querySelectorAll('div,h1,h2,h3,span')].find(x => x.children.length === 0 && (x.innerText || '').trim() === title);
      while (e && e.parentElement && e.getBoundingClientRect().width < 330) e = e.parentElement; return e;
    };
    const week = card('이번 주 움직임'), flow = card('점수 흐름');
    if (!week || !flow || week.parentElement !== flow.parentElement) return { error: '카드를 못 찾았거나 같은 열이 아님' };
    week.parentElement.insertBefore(flow, week);              // D10: 점수 흐름을 이번 주 움직임 앞으로
    document.querySelectorAll('.uxpin').forEach(e => e.remove()); document.querySelectorAll('.ux-on').forEach(e => e.classList.remove('ux-on'));
    return { html: '<!doctype html>\n<html lang="ko">' + document.documentElement.innerHTML + '</html>' };
  });
  if (out.error) { console.error(out.error); process.exit(1); }
  fs.writeFileSync(path.join(T, 'tobe-goal-score.html'), out.html);
  console.log('tobe-goal-score.html', Math.round(out.html.length / 1024) + 'KB'); await b.close();
})();
