/* TO-BE 홈 · 아침 체크인 4문항 → 완료 상태(할 일 카드)
   AS-IS에서 떠 둔 화면(home-done.json)을 그대로 쓰고, 결정 사항(D4)만 얹는다.
   - 표정을 누르면 다음 문항으로 넘어가고, 4번째 답에서 완료 상태가 된다.
   - D9: 표정 아래 글자에 가운데 「보통」 추가.
   - D8: 7칸 색을 회색 하나로(주황 · 연보라 뺌).
   - D5: 완료 상태에서 「트러블 없던 날」 7칸은 할 일 카드 아래로 내린다.
   - D4: 완료 상태의 「알로에게 묻기」 칩은 빼고, 할 일 카드 아래에 「알로에게 더 물어보기 ›」를 둔다. */
(function () {
  var URL_JSON = 'http://localhost:8775/tobe/home-done.json';
  var NAV = { '23시 30분 전에 잠자리에 들기': '/record/sleep/add', '2주 정제 탄수화물 줄여 보기': '/record/diet/add', '잠들기 전 종이책 읽기': '/record/sleep/add' };
  var data = null, step = 0, done = false;
  var quiet = false, instant = /[?&]done=1/.test(location.search);       /* D53: 쇼케이스 「홈(문진 후)」 — 문진 없이 바로 완료 화면 */
  fetch(URL_JSON).then(function (r) { return r.json(); }).then(function (d) { data = d; });
  if (instant) { var tries = 0, iv = setInterval(function () {
    if (++tries > 60) { clearInterval(iv); return; }
    if (!data || done || !document.querySelector('.tb-ck') || !document.querySelector('.tb-ck [role=radio]')) return;
    clearInterval(iv); quiet = true; try { finishNow(); } finally { quiet = false; }
  }, 200); }

  function block() {                                    // 문항 영역(진행 점 · 질문 · 표정 5개)
    var ck0 = document.querySelector('.tb-ck');          // D21: 라벨을 숨긴 뒤에는 카드 바로 아래 자식 중 표정이 있는 것이 문항 영역
    if (ck0) { var q = document.querySelector('[role=radio]'); while (q && q.parentElement !== ck0) q = q.parentElement; return q; }
    var e = document.querySelector('[role=radio]'), blk = e;
    for (var n = 0; n < 12 && e; n++, e = e.parentElement) { if ((e.innerText || '').indexOf('아침 체크인') >= 0) break; blk = e; }
    return blk;
  }
  function leaf(text) {
    return [].filter.call(document.querySelectorAll('div'), function (x) { return !x.children.length && (x.innerText || '').trim() === text; })[0];
  }
  function parse(html) { var t = document.createElement('div'); t.innerHTML = html; return t.firstElementChild; }

  /* D8 · 트러블 없던 날 7칸 색 (정책 10-2 · 막대 높이는 답을 나타낸다)
     - 나쁜 쪽 색은 회색 하나, 주황은 표식(집중 · 중요 · 과민식품 점) 전용이라 막대에서 뺀다.
     - 연보라 · 주황으로 나뉘던 막대를 같은 회색으로, 패널은 보라빛 없는 중립색으로 맞춘다. 점선 칸(아직 답 없음)은 그대로.
     - 좋은 날(머리 숫자 {n}/7일에 세는 날)만 앱의 초록(#0e9f6e)을 쓴다. 지금 데이터는 좋은 날이 0일이라 초록 칸은 없다. */
  var GRAY = 'rgba(22,35,43,.16)';
  function recolorWeek(root) {
    var btn = root.querySelector('[aria-label^="트러블 없던 날"]'); if (!btn) return;
    btn.style.background = 'rgba(22,35,43,.045)';
    [].forEach.call(btn.querySelectorAll('div'), function (e) {
      var bg = getComputedStyle(e).backgroundColor;
      if (bg === 'rgba(79, 107, 237, 0.25)' || bg === 'rgb(243, 176, 138)') e.style.backgroundColor = GRAY;
      var t = e.firstChild;   // 「0」은 「/ 7일」 칸과 같은 요소 안의 글자 노드다
      if (t && t.nodeType === 3 && t.textContent.trim() === '0') e.style.color = '#16232b';
    });
  }
  recolorWeek(document);

  /* D9 · 표정 5개 아래 글자: 양 끝 「나쁨 · 좋음」에 가운데 「보통」을 더한다(정책 7-1: 가운데 = 안 답함과 같음).
     「나쁨」 「좋음」 글자 칸을 복제해 가운데에 끼우므로 글꼴과 색은 그대로다. */
  function addMid(root) {
    var bad = leafIn(root, '나쁨'), good = leafIn(root, '좋음');
    if (!bad || !good || root.querySelector('.tb-mid')) return;
    var row = bad.parentElement; while (row && !row.contains(good)) row = row.parentElement;
    if (!row) return;
    var kids = [].slice.call(row.children), a = kids.filter(function (k) { return k.contains(bad); })[0], z = kids.filter(function (k) { return k.contains(good); })[0];
    var m = z.cloneNode(true); m.classList.add('tb-mid'); var lf = m.children.length ? leafIn(m, '좋음') : m; if (lf) lf.textContent = '보통';   // 복제한 칸이 글자 요소 자체일 수도 있다
    row.insertBefore(m, z);
  }
  addMid(document);

  /* D21 · 체크인 카드를 bico-renewal-v4 구조로: 아바타 + 제목 + 「4문항 · 완료하면 +10 P」 → 분절 진행 막대 → 질문 → 표정 5개.
     「아침 체크인」 라벨과 구분선은 뺀다. 「트러블 없던 날」은 카드 밖 아래 별도 카드로 뺀다(정책 10-2 유지, 체크인 카드는 v4처럼 컴팩트). */
  var CK_IMG = 'http://localhost:8775/tobe/icons/bico2_still_sleep.png';
  function findCkCard() {
    var r = document.querySelector('[role=radio]');
    for (var e = r, n = 0; e && n < 14; n++, e = e.parentElement) { if ((e.innerText || '').indexOf('아침 체크인') >= 0 && getComputedStyle(e).borderTopWidth !== '0px') return e; }
    return null;
  }
  function setupCheckin() {
    var card = document.querySelector('.tb-ck') || findCkCard(); if (!card) return;
    if (!card.classList.contains('tb-ck')) {
      card.classList.add('tb-ck');
      var kids = [].slice.call(card.children);
      var label = kids.filter(function (k) { return k.innerText.trim() === '아침 체크인'; })[0];
      var title = kids.filter(function (k) { return k.innerText.trim() === '체크인하면 비코가 깨어나요'; })[0];
      if (label) label.style.display = 'none';
      if (title) {
        title.style.display = 'none';
        title.insertAdjacentHTML('afterend', '<div class="tb-ckh"><span class="av"><img src="' + CK_IMG + '" alt=""></span><span class="tx"><b class="tt">체크인하면 비코가 깨어나요</b><span class="sb">4문항에 답해 주세요</span></span><span class="rw" aria-label="완료하면 10포인트"><i></i>+10</span></div>');
      }
      var wk = card.querySelector('[aria-label^="트러블 없던 날"]');
      if (wk) { wk.classList.add('tb-wk'); card.parentNode.insertBefore(wk, card.nextSibling); }
    }
    var pr = card.querySelector('[aria-label$="번째 질문"]');                         // 진행: 점 → 분절 막대(지난 문항 + 지금 문항은 민트)
    if (pr) {
      var m = (pr.getAttribute('aria-label') || '').match(/(\d+)\/(\d+)/), cur = m ? +m[1] : 1;
      pr.style.setProperty('flex', 'none', 'important'); pr.style.setProperty('gap', '6px', 'important');
      [].forEach.call(pr.children, function (d, i) {      // D47: 카드 밖 아래 캐러셀 점(지금 = 긴 민트 알약 · 지난 = 연한 민트 · 앞으로 = 회색)
        d.style.setProperty('flex', 'none', 'important'); d.style.setProperty('width', i === cur - 1 ? '18px' : '6px', 'important'); d.style.setProperty('height', '6px', 'important');
        d.style.setProperty('border-radius', '3px', 'important'); d.style.setProperty('background-color', i === cur - 1 ? '#22c3bc' : (i < cur - 1 ? '#9fdcd6' : '#d4d6db'), 'important');
      });
    }
    enhanceBlock(card);
  }

  function next() {
    step++;
    if (step < 4) { var b = block(); if (b) b.outerHTML = data.blocks[step]; addMid(document); setupCheckin(); }
    else finish();
  }
  function finishNow() {
    done = true;
    var old = document.querySelector('.tb-ck') || document.querySelector('[aria-label^="트러블 없던 날"]').parentElement;
    var wk0 = document.querySelector('.tb-wk'); if (wk0) wk0.remove();                  // 카드 밖으로 뺐던 7칸은 완료 카드가 자기 7칸을 가진다(D5)
    var card = parse(data.cardHtml);
    var ask = card.querySelector('[aria-label^="알로에게 묻기"]'); if (ask) ask.style.display = 'none';                 // D4: 위쪽 칩은 뺌
    [].forEach.call(card.querySelectorAll('[aria-label]'), function (e) { var p = NAV[e.getAttribute('aria-label')]; if (p) e.setAttribute('data-nav', p); });
    var more = document.createElement('div'); more.className = 'tb-ask-more'; more.setAttribute('data-nav', '/ai'); more.setAttribute('role', 'button');
    more.innerHTML = '알로에게 더 물어보기 <span>›</span>'; card.appendChild(more);                                       // D4: 완료 뒤 한 줄
    var tr = card.querySelector('[aria-label^="트러블 없던 날"]');                                                     // D5: 7칸은 할 일 카드 아래로
    if (tr) { tr.style.marginTop = '14px'; card.appendChild(tr); }
    old.replaceWith(card);
    card.classList.add('tb-tasks');
    var cs = document.querySelector('.tb-cta .sub'); if (cs) cs.textContent = '2점 올릴 수 있어요 · 내일 반영';   // D38: 체크인 뒤에만 보상 문구
    tidyTasks(card); intify(card); reskinTasks(card);
    var tk = location.search.match(/[?&]tasks=(\d)/); if (tk) setDoneCount(card, +tk[1]);
    recolorWeek(card);
    var st = leaf('쿨쿨 자는 중'); if (st) st.textContent = data.status;                                               // 비코 상태 줄
    var ch = document.querySelector('.tb-char'); if (ch) { var w = parse(data.awakeHtml); if (w) ch.innerHTML = w.innerHTML; }
    var pt = document.querySelector('.tb-pt'); if (pt) pt.innerHTML = '<i class="coin"></i>' + data.points;
    if (!quiet) toast('체크인 완료 · +10P', '오늘 표정이 비코에게 나타났어요 · 목표 점수에 들어가요');
  }
  /* D6 · 할 일 카드 정리 (정책 8-3)
     - 아래 줄은 「지금 {값}」 또는 「아직 기록 없음」 + 꼬리표. 긴 설명 문장은 솔루션 화면(상세)에 속하므로 카드에서 뺀다.
     - ▲(오를 값 0.5 미만) 뱃지를 +n.n 뱃지와 같은 알약 모양으로 맞춘다(지금은 혼자 큰 원 버튼처럼 보임). 뜻은 그대로다. */
  function leafIn(root, text) {
    return [].filter.call(root.querySelectorAll('div'), function (x) { return !x.children.length && (x.innerText || '').trim() === text; })[0];
  }
  function intify(root) {          // D36: 화면에 소수점을 두지 않는다(+1.7 → +2 · +1.2 → +1)
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null), n, list = [];
    while ((n = w.nextNode())) list.push(n);
    list.forEach(function (t) { if (/\d\.\d/.test(t.nodeValue)) t.nodeValue = t.nodeValue.replace(/(\d+)\.(\d)/g, function (m, a, b) { return String(Math.round(parseFloat(a + '.' + b))); }); });
  }
  function tidyTasks(card) {
    [].forEach.call(card.querySelectorAll('div'), function (x) {
      if (x.children.length) return;
      var t = (x.innerText || '').trim();
      if (t.indexOf('흰쌀에 잡곡') === 0 || t.indexOf('잠들기 전 화면 대신') === 0) x.textContent = '아직 기록 없음';
    });
    var gain = leafIn(card, '+1.2'), tri = leafIn(card, '▲');
    if (gain && tri) {
      var el = tri;
      while (el.parentElement && el.parentElement !== card && el.parentElement.getBoundingClientRect().width < 90) el = el.parentElement;
      var np = gain.parentElement.cloneNode(true), lf = leafIn(np, '+1.2'); if (lf) lf.textContent = '▲';
      el.replaceWith(np);
    }
  }
  /* D51 · D59 · 오늘 할 일 카드 정돈
     D51: 한 카드 안 목록 · 칩 → 회색 글자 · 값은 알약 없이 · 군더더기 「오늘」 삭제
     D59: 집중 회복력 연결 · 값 단위(+1점) · 행 끝 › · 「0/3 완료」를 제목 줄로 · 「이번 주 고정」을 서브줄로 · 완료 상태(체크 원 + 「했어요」 + 아래로 이동 + 진행 갱신) */
  function reskinTasks(card) {
    var hdr = card.firstElementChild; if (hdr) hdr.style.setProperty('display', 'none', 'important');
    var tt = null;
    [].forEach.call(card.children, function (c) {
      if ((c.innerText || '').trim().slice(-11) === '를 위해 오늘 할 일') {
        tt = c; c.classList.add('tb-tt'); var sp = c.querySelector('span'); if (sp) { sp.style.setProperty('color', 'inherit', 'important'); sp.style.setProperty('font-size', 'inherit', 'important'); sp.style.setProperty('line-height', 'inherit', 'important'); }
      }
    });
    var prog = leafIn(card, '0/3');
    var cnt = leafIn(card, '다 하면 내일 +2');
    if (cnt) { cnt.textContent = '다 하면 내일 +2점이 반영돼요'; cnt.classList.add('tb-sub'); var row = cnt.parentElement; row.classList.add('tb-cnt'); row.parentElement.classList.add('tb-list'); }
    if (prog && tt) { prog.classList.add('tb-prog'); prog.textContent = '0/3 완료'; tt.appendChild(prog); }
    [].forEach.call(card.querySelectorAll('button[data-nav]'), function (b, i) {
      b.classList.add('tb-task'); b.setAttribute('data-ti', i);
      var ico = b.firstElementChild; if (ico) ico.classList.add('tb-ico');
      var val = b.lastElementChild, vt = '';
      if (val && val !== b.children[1]) { val.classList.add('tb-val'); vt = (leafOf(val).innerText || '').trim(); }
      var tx = b.children[1], eb = tx && tx.firstElementChild, sub = tx && tx.children[2];
      b.setAttribute('data-k', /sleep/.test(b.getAttribute('data-nav') || '') ? 'sleep' : 'meal');
      if (eb) eb.style.setProperty('display', 'none', 'important');
      if (sub) {
        var lf = leafOf(sub), cur = (lf.innerText || '').trim(), m = vt.match(/^\+(\d+)/), html;
        var tags = [].map.call(sub.querySelectorAll('[style*="79, 107, 237"]'), function (c) { return (c.innerText || '').trim(); });
        var mt = tags[0] ? '<b class="tb-m">' + tags[0] + '</b>' : '';
        if (vt === '밤에 확정') { html = '자정에 확정 · ' + mt; b.classList.add('tb-chal'); }   // D74: 챌린지형(자정에 판정)
        else if (m) html = '하면 내일 아침 ' + mt + ' <b class="tb-g">+' + m[1] + '</b>';
        else html = (/^지금/.test(cur) ? cur + ' · ' : '하면 내일 아침 ') + mt;
        lf.classList.add('tb-subleaf'); lf.innerHTML = html; b.setAttribute('data-sub', html);
        [].forEach.call(sub.querySelectorAll('[style*="79, 107, 237"]'), function (c) { c.style.setProperty('display', 'none', 'important'); });
      }
      var cta = document.createElement('span'); cta.className = 'tb-cta2'; cta.setAttribute('aria-hidden', 'true'); cta.textContent = '기록'; b.appendChild(cta);
      var dn = document.createElement('span'); dn.className = 'tb-donetx'; dn.setAttribute('aria-hidden', 'true'); dn.textContent = '했어요'; b.appendChild(dn);
      if (b.classList.contains('tb-chal')) { cta.textContent = '지키는 중'; dn.textContent = '지켰어요'; }   // D74: 챌린지는 「기록」 버튼 대신 상태 알약
    });
    refreshTasks(card);
  }
  /* 완료 상태(D59 P6): 기록하면 정책상 자동 완료. 시안에서는 「n/3 완료」 글자를 누르면 하나씩 완료로 넘겨 볼 수 있고, 주소에 ?tasks=1~3을 붙이면 그 수만큼 완료된 채로 열림 */
  function refreshTasks(card) {
    var rows = [].slice.call(card.querySelectorAll('.tb-task')).sort(function (a, b) { return a.getAttribute('data-ti') - b.getAttribute('data-ti'); });
    if (!rows.length) return;
    var list = rows[0].parentElement, n = 0;
    rows.forEach(function (b) {
      var on = b.classList.contains('tb-done'), val = b.querySelector('.tb-val');
      if (on) n++;
      var sl = b.querySelector('.tb-subleaf'); if (sl) sl.innerHTML = on ? (b.classList.contains('tb-chal') ? '오늘 지켰어요' : '오늘 기록했어요') : (b.getAttribute('data-sub') || '');
      b.setAttribute('aria-label', (b.getAttribute('aria-label') || '').replace(/ · (했어요|지켰어요)$/, '') + (on ? (b.classList.contains('tb-chal') ? ' · 지켰어요' : ' · 했어요') : ''));
    });
    rows.filter(function (b) { return !b.classList.contains('tb-done'); }).concat(rows.filter(function (b) { return b.classList.contains('tb-done'); })).forEach(function (b) { list.appendChild(b); });
    var total = rows.length, all = n === total;
    var prog = card.querySelector('.tb-prog'); if (prog) { prog.textContent = n + '/' + total + ' 완료'; prog.classList.toggle('all', all); }
    var sub = card.querySelector('.tb-sub'); if (sub) { sub.textContent = all ? '오늘 할 일을 모두 했어요 · 내일 아침 +2점이 반영돼요' : '다 하면 내일 +2점이 반영돼요'; sub.classList.toggle('all', all); }
    var cs = document.querySelector('.tb-cta .sub'); if (cs) cs.textContent = all ? '오늘 할 일을 모두 했어요 · 내일 반영' : '2점 올릴 수 있어요 · 내일 반영';
  }
  function setDoneCount(card, k) {
    var rows = [].slice.call(card.querySelectorAll('.tb-task')).sort(function (a, b) { return a.getAttribute('data-ti') - b.getAttribute('data-ti'); });
    rows.forEach(function (b, i) { b.classList.toggle('tb-done', i < k); });
    refreshTasks(card);
  }
  function toast(a, b) {
    var t = document.createElement('div'); t.className = 'tb-toast'; t.innerHTML = '<b>' + a + '</b><span>' + b + '</span>';
    document.body.appendChild(t); setTimeout(function () { t.remove(); }, 3200);
  }

  /* D22 · 체크인 카드 사용성 · 직관성 · 심미성
     - 문항별 양끝 글자(문항마다 「나쁨/좋음」 대신 실제 뜻) · 누르는 표정의 뜻 미리 보기 한 줄
     - 선택 피드백(민트 채움) → 0.26초 뒤 슬라이드로 다음 문항 · 「이전」 · 지난 문항 진행 칸 누르면 이동
     - 완료 연출: 아바타가 깨어나고 +10이 헤더 포인트 칩으로 날아간 뒤 할 일 카드로 이어짐 */
  var LABELS = [
    ['전혀 아니에요', '별로 아니에요', '보통이에요', '그런 편이에요', '아주 그래요'],
    ['많이 올라왔어요', '몇 개 올라왔어요', '한두 개 올라왔어요', '거의 없었어요', '전혀 없었어요'],
    ['아주 그래요', '그래요', '조금 그래요', '거의 아니에요', '전혀 아니에요'],
    ['아주 그래요', '그래요', '조금 그래요', '거의 아니에요', '전혀 아니에요']
  ];
  var AWAKE_IMG = 'http://localhost:8776/assets/assets/cell/bico3_idle.48349d69146c60ca6cc024310447e714.webp';
  var locked = false, answers = [];
  function leafOf(n) { while (n && n.children.length) n = n.children[0]; return n; }
  function enhanceBlock(card) {
    var rg = card.querySelector('[role=radiogroup]'); if (!rg) return;
    var L = LABELS[step] || LABELS[0], row = rg.nextElementSibling;
    if (row && !row.classList.contains('tb-lab')) {
      row.classList.add('tb-lab'); var want = [L[0], L[2], L[4]];
      [].forEach.call(row.children, function (k, i) { if (want[i] != null) { var lf = leafOf(k); if (lf) lf.textContent = want[i]; k.style.textAlign = ['left', 'center', 'right'][i]; } });
    }
    var pr = card.querySelector('[aria-label$="번째 질문"]');
    if (pr) {
      [].forEach.call(pr.children, function (s, i) { s.classList.toggle('tb-cur', i === step); s.classList.toggle('tb-pass', i < step); });   // D47: 캐러셀 점(현재 · 지나간 · 앞으로)
      var row2 = pr.parentElement, oldp = row2.querySelector('.tb-prev'); if (oldp) oldp.remove();
      var CH = function (d) { return '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + d + '"/></svg>'; };
      var oldn = row2.querySelector('.tb-next'); if (oldn) oldn.remove();
      if (step > 0) { var btn = document.createElement('button'); btn.className = 'tb-prev'; btn.type = 'button'; btn.innerHTML = CH('M10 3.5 5.5 8l4.5 4.5'); btn.setAttribute('aria-label', '이전 문항으로'); row2.insertBefore(btn, row2.lastElementChild); }
      if (step < 3 && answers[step] != null) { var nb2 = document.createElement('button'); nb2.className = 'tb-next'; nb2.type = 'button'; nb2.innerHTML = CH('M6 3.5 10.5 8 6 12.5'); nb2.setAttribute('aria-label', '다음 문항으로'); row2.insertBefore(nb2, row2.lastElementChild); }   // D48: 이 문항에 답한 뒤 이전으로 돌아왔을 때만 보임
    }
    if (answers[step] != null && rg.children[answers[step]]) rg.children[answers[step]].classList.add('tb-sel');
  }
  function gotoStep(n) {
    if (!data || done || locked || n < 0 || n > 3) return;
    step = n; var b = block(); if (b) b.outerHTML = data.blocks[n];
    addMid(document); setupCheckin();
    var nb = block(); if (nb) nb.classList.add('tb-in');
  }
  function celebrate(cb) {
    var card = document.querySelector('.tb-ck'), reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!card || reduce || !card.animate) { cb(); return; }
    var av = card.querySelector('.tb-ckh .av'), img = av && av.querySelector('img');
    if (img) img.src = AWAKE_IMG;
    if (av) av.classList.add('tb-wake');
    var tt = card.querySelector('.tb-ckh .tt'), sb = card.querySelector('.tb-ckh .sb');
    if (tt) tt.textContent = '비코가 깨어났어요!'; if (sb) sb.textContent = '오늘 체크인을 마쳤어요';
    var rw = card.querySelector('.tb-ckh .rw'); if (rw) setTimeout(function () { rw.classList.add('got'); /* D50: 「받음」 글자 없이 +10 칩 색만 바뀜 */ }, 500);
    var pt = document.querySelector('.tb-pt'), from = (card.querySelector('.tb-ckh .rw') || av || card).getBoundingClientRect(), to = pt && pt.getBoundingClientRect();
    if (to) {
      var c = document.createElement('div'); c.className = 'tb-coin'; c.innerHTML = '<i></i><b>+10</b>'; document.body.appendChild(c);
      var sx = from.left + from.width / 2, sy = from.top + from.height / 2, ex = to.left + 22, ey = to.top + to.height / 2;
      c.style.left = sx + 'px'; c.style.top = sy + 'px';
      var a = c.animate([
        { transform: 'translate(-50%,-50%) scale(.6)', opacity: 0 },
        { transform: 'translate(-50%,-110%) scale(1.15)', opacity: 1, offset: .28 },
        { transform: 'translate(-50%,-110%) scale(1.15)', opacity: 1, offset: .5 },
        { transform: 'translate(calc(-50% + ' + (ex - sx) + 'px),calc(-50% + ' + (ey - sy) + 'px)) scale(.5)', opacity: .9 }
      ], { duration: 1000, easing: 'cubic-bezier(.4,0,.2,1)' });
      a.onfinish = function () { c.remove(); if (pt) { pt.classList.add('tb-pop'); setTimeout(function () { pt.classList.remove('tb-pop'); }, 400); } };
    }
    setTimeout(function () { card.classList.add('tb-ck-out'); setTimeout(cb, 180); }, 1050);
  }
  function finish() { done = true; celebrate(finishNow); }
  setupCheckin();                                          // 첫 화면(LABELS 등을 정의한 뒤에 한 번)

  document.addEventListener('click', function (e) {
    var pg = e.target && e.target.closest ? e.target.closest('.tb-prog') : null;
    if (pg) { var cd = pg.closest('.tb-tasks'), k = cd.querySelectorAll('.tb-task.tb-done').length; setDoneCount(cd, k >= cd.querySelectorAll('.tb-task').length ? 0 : k + 1); }
  });
  document.addEventListener('click', function (e) {
    var t = e.target; if (!t || !t.closest || !data || done) return;
    var prev = t.closest('.tb-prev'); if (prev) { e.preventDefault(); e.stopPropagation(); gotoStep(step - 1); return; }
    var nxt = t.closest('.tb-next'); if (nxt) { e.preventDefault(); e.stopPropagation(); gotoStep(step + 1); return; }
    var seg = t.closest('[aria-label$="번째 질문"] > div');
    if (seg) { var si = [].indexOf.call(seg.parentElement.children, seg); if (si < step) { e.preventDefault(); e.stopPropagation(); gotoStep(si); } return; }
    var r = t.closest('[role=radio]'); if (!r || locked) return;
    e.preventDefault();
    var g = r.parentElement; answers[step] = [].indexOf.call(g.children, r);
    [].forEach.call(g.children, function (c) { c.classList.remove('tb-sel'); }); r.classList.add('tb-sel');
    locked = true;
    setTimeout(function () {
      var b = block(); if (b && step < 3) b.classList.add('tb-out');   // 마지막 문항은 그대로 두고 완료 연출로 이어짐
      setTimeout(function () { next(); locked = false; if (!done) { var nb = block(); if (nb) nb.classList.add('tb-in'); } }, 140);
    }, 260);
  }, true);
})();
