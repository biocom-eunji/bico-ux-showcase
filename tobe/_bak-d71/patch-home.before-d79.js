// _orig/tobe-home.html(AS-IS 복제)에 tobe/home-top.css · home-top.html 을 붙여 tobe/tobe-home.html 을 만든다.
// 고칠 때: home-top.css · home-top.html 을 수정하고 `node patch-home.js` 만 다시 돌린다.
const puppeteer = require('puppeteer-core'), fs = require('fs'), path = require('path');
const T = path.join(__dirname, '..', 'tobe');
const V = process.argv[2] || '';   // 시안 이름(A · B). 비우면 쇼케이스용 tobe-home.html
const html = fs.readFileSync(path.join(T, V ? 'home-top-' + V + '.html' : 'home-top.html'), 'utf8').split('<!--SPLIT-->');
(async () => {
  const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' });
  const p = await b.newPage(); await p.setViewport({ width: 390, height: 844 });
  await p.goto('http://localhost:8775/tobe/_orig/tobe-home.html', { waitUntil: 'networkidle2' }); await new Promise(r => setTimeout(r, 1200));
  const out = await p.evaluate((hdrHtml, heroHtml, bandHtml, V, careHtml) => {
    const char = document.querySelector('[aria-label="자고 있는 비코"]').parentElement.parentElement;   // 캐릭터 묶음
    const hero = char.parentElement, k = hero.children;
    ['tb-bg', 'tb-plat', 'tb-char', 'tb-ovl', 'tb-lvl', 'tb-res', 'tb-box', 'tb-state', 'tb-oldscore'].forEach((c, i) => k[i].classList.add(c));
    hero.classList.add('tb-hero');
    const bell = document.querySelector('[aria-label="알림"]'), hdr = bell.parentElement.parentElement; hdr.classList.add('tb-hdr'); { const lg = hdr.querySelector('svg'); if (lg) lg.classList.add('tb-logo'); }
    // D31: 알림 · 마이 아이콘을 은지님이 준 Figma 아이콘(tobe/icons/bell.svg · my.svg)으로 교체. 색은 파일 원래 색 그대로
    { const BELL = '<svg class="tb-ic tb-ic-bell" aria-hidden="true" width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_2563_58164)"><path d="M25.5994 32.127C25.5994 35.22 23.0924 37.727 19.9994 37.727C16.9064 37.727 14.3994 35.22 14.3994 32.127H25.5994Z" fill="#A3BBD3"/><path d="M16.623 5.65044C16.623 3.78544 18.135 2.27344 20 2.27344C21.865 2.27344 23.377 3.78544 23.377 5.65044H16.624H16.623Z" fill="#A3BBD3"/><path d="M6.10359 18.8237C6.10359 10.8427 12.8316 4.43373 20.9246 4.95773C28.3106 5.43573 33.8956 11.8987 33.8956 19.2997V25.3787L36.2596 29.4727C36.9406 30.6527 36.0896 32.1277 34.7266 32.1277H5.27159C3.90959 32.1277 3.05759 30.6527 3.73859 29.4727L6.10259 25.3787L6.10359 18.8237Z" fill="#BED3E6"/></g><defs><clipPath id="clip0_2563_58164"><rect width="40" height="40" fill="white"/></clipPath></defs></svg>';
      const USER = '<svg class="tb-ic tb-ic-my" aria-hidden="true" width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_2563_42758)"><path d="M19.9996 19.3039C24.0865 19.3039 27.3996 15.9908 27.3996 11.9039C27.3996 7.817 24.0865 4.50391 19.9996 4.50391C15.9127 4.50391 12.5996 7.817 12.5996 11.9039C12.5996 15.9908 15.9127 19.3039 19.9996 19.3039Z" fill="#4A8BEE"/><path d="M19.9995 21.5684C10.0535 21.5684 6.18555 28.3504 6.18555 31.5044C6.18555 34.6584 14.4205 35.4984 19.9995 35.4984C25.5785 35.4984 33.8135 34.6584 33.8135 31.5044C33.8135 28.3504 29.9455 21.5684 19.9995 21.5684Z" fill="#4A8BEE"/></g><defs><clipPath id="clip0_2563_42758"><rect width="40" height="40" fill="white"/></clipPath></defs></svg>';
      [[bell, BELL], [document.querySelector('[aria-label="마이"]'), USER]].forEach(([b, svg]) => { const o = b && b.querySelector('svg'); if (o) o.outerHTML = svg; }); }
    document.querySelector('[aria-label$="목표 바꾸기"]').classList.add('tb-oldgoal');
    hdr.insertAdjacentHTML('beforeend', hdrHtml);
    hero.insertAdjacentHTML('beforeend', heroHtml);
    // D11: 캐릭터 뒤 원형 글로우 + 받침판(원판)을 bico-renewal-v4 구조로 교체. 캐릭터 176px 기준(중심 195,142)으로 v4 비율을 옮김
    const stage = '<svg class="tb-stage" width="390" height="330" style="position:absolute;left:0;top:0;pointer-events:none"><defs>' +
      '<radialGradient id="tb-glow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#FFFBEA" stop-opacity="0.9"/><stop offset="0.45" stop-color="#FFF8DD" stop-opacity="0.42"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="tb-contact" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#6FA79B" stop-opacity="0.22"/><stop offset="1" stop-color="#6FA79B" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="tb-ped-top" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFEFA"/><stop offset="1" stop-color="#FAF5EA"/></linearGradient>' +
      '<linearGradient id="tb-ped-side" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D9F6EE"/><stop offset="1" stop-color="#B7EBDD"/></linearGradient></defs>' +
      '<ellipse cx="195" cy="142" rx="185" ry="176" fill="url(#tb-glow)"/><ellipse cx="195" cy="206.5" rx="82.6" ry="16.6" fill="url(#tb-contact)"/>' +
      '<ellipse cx="195" cy="197.5" rx="73.7" ry="12.8" fill="url(#tb-ped-side)"/><ellipse cx="195" cy="192.6" rx="73.7" ry="12.8" fill="url(#tb-ped-top)"/></svg>';
    hero.querySelector('.tb-plat').insertAdjacentHTML('beforebegin', stage);
    // D12: 결과지 · 보관함 아이콘을 bico-renewal-v4 아이콘으로 교체
    [['.tb-res', 'ic_heartbeat.ef22029fd4b4c63b214503ead8576cee.svg'], ['.tb-box', 'ic_chest.ff3750e411ba148a008eb90dcc8aed38.svg']].forEach(([sel, f]) => {
      const s = hero.querySelector(sel + ' svg'); if (!s) return;
      const i = document.createElement('img'); i.src = 'http://localhost:8775/tobe/icons/' + f; i.width = i.height = 28; i.style.display = 'block'; s.replaceWith(i);
    });
    // D10: 레벨을 캐릭터 라벨 안으로(「Lv.6 비코 • 쿨쿨 자는 중」) + 아래 가장자리 성장 막대
    const st = hero.querySelector('.tb-state');
    st.insertAdjacentHTML('afterbegin', '<div class="tb-lvtag">Lv.6</div>');
    st.setAttribute('data-nav', '/record'); st.setAttribute('role', 'button'); st.setAttribute('aria-label', '레벨 6, 다음 레벨까지 62퍼센트, 기록 탭으로');   // D19: 이름표 전체를 한 버튼으로(레벨 글자만 누르던 16px 영역 해소)
    st.insertAdjacentHTML('beforeend', '<i class="tb-lvbar"><i></i></i>');
    // 이너뷰티 제목 아래 「11-11 밤 초안 · 어제보다 …」 줄을 숨기고 새 띠로 바꾼다
    const leaf = [...document.querySelectorAll('div')].find(x => x.children.length === 0 && (x.innerText || '').startsWith('어제보다'));
    const row = leaf.parentElement; row.classList.add('tb-oldband');   // D13: 새 띠는 만들지 않음(점수 카드의 「이유」 줄로 이동)
    // D3: 관리 타일 변화 표시를 한 가지 모양으로 — 「어제와 같음」은 「—」로, 회복 타일의 「할 일 +1.2」는 뺀다
    const flat = [...document.querySelectorAll('div')].find(x => x.children.length === 0 && (x.innerText || '').trim() === '어제와 같음');
    if (flat) { flat.textContent = '—'; flat.parentElement.classList.add('tb-flat'); }
    const gain = [...document.querySelectorAll('div')].find(x => x.children.length === 0 && (x.innerText || '').trim() === '할 일 +1.2');
    if (gain) gain.parentElement.classList.add('tb-hide');
    // D4: 체크인 카드에서 「알로에게 묻기」 칩을 뺀다(체크인 전 상태)
    const ask = document.querySelector('[aria-label^="알로에게 묻기"]'); if (ask) ask.classList.add('tb-hide');
    // D7(오늘의 60초 숨김)은 2026-11-16 철회했다: 홈에서 콘텐츠를 유지한다.
    // D24: 이너뷰티 타일 5개 → 한 카드 안 정렬된 행(아이콘은 원래 타일 것을 그대로 가져옴, 이동 경로는 data-nav)
    if (careHtml) {
      const names = ['식단', '영양', '스킨케어', '배변', '회복'], icons = {};
      names.forEach(n => { const b = [...document.querySelectorAll('button')].find(x => (x.getAttribute('aria-label') || '').startsWith(n + ' ')); const sv = b && b.querySelector('svg'); icons[n] = sv ? sv.outerHTML : ''; });
      const b1 = [...document.querySelectorAll('button')].find(x => (x.getAttribute('aria-label') || '').startsWith('식단 '));
      let ch = careHtml; names.forEach(n => { ch = ch.replace('{{ic:' + n + '}}', icons[n]); });
      b1.parentElement.parentElement.innerHTML = ch;
      const hd = [...document.querySelectorAll('*')].find(e => !e.children.length && e.textContent.trim() === '이너뷰티' && !e.closest('.tb-hero') && !e.closest('.tb-care'));
      if (hd) hd.style.display = 'none';
    }
    document.querySelectorAll('.uxpin').forEach(e => e.remove()); document.querySelectorAll('.ux-on').forEach(e => e.classList.remove('ux-on'));
    const css = '<link rel="stylesheet" href="http://localhost:8775/tobe/home-top.css"><link rel="stylesheet" href="http://localhost:8775/tobe/shadcn-skin.css">' + (V ? '<link rel="stylesheet" href="http://localhost:8775/tobe/variant-' + V + '.css">' : '');
    document.head.insertAdjacentHTML('beforeend', css);
    document.body.insertAdjacentHTML('beforeend', '<script src="http://localhost:8775/tobe/home-checkin.js"></' + 'script><script src="http://localhost:8775/tobe/home-score.js"></' + 'script><script src="http://localhost:8775/tobe/shadcn-skin.js"></' + 'script>');   // shadcn/ui 스킨(라디우스 · 글자 · 위계)
    return '<!doctype html>\n<html lang="ko">' + document.documentElement.innerHTML + '</html>';
  }, html[0], html[1], html[2], V, html[3] || '');
  fs.writeFileSync(path.join(T, V ? 'tobe-home-' + V + '.html' : 'tobe-home.html'), out);
  console.log('tobe-home.html', Math.round(out.length / 1024) + 'KB');
  await b.close();
})();
