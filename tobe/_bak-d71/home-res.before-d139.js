/* D81 · 결과지 버튼 알림. 새 분석 결과가 있으면(기본) 말풍선 「내 결과지를 확인해 보세요」가 4초 떴다 사라지고 주황 NEW 점이 남음. 누르면 점 삭제. 주소 ?res=seen 이면 아무것도 안 붙음(확인한 뒤) */
(function () {
  var done = false;
  function init() {
    var r = document.querySelector('.tb-res'); if (!r || done) return;
    if (/[?&]res=seen/.test(location.search)) { done = true; return; }
    var par = r.offsetParent || r.parentElement; if (!par) return;
    var rr = r.getBoundingClientRect(), pr = par.getBoundingClientRect(); if (!rr.width) return;
    done = true;
    var dot = document.createElement('i'); dot.className = 'rs-dot'; r.appendChild(dot);
    r.setAttribute('aria-label', '새 결과지 보기');
    /* D121: 「내 결과지를 확인해 보세요」 말풍선 삭제(NEW 점만 남김). 되돌리려면 백업 home-res.before-d121.js 복원 */
    r.addEventListener('click', function () { dot.remove(); r.setAttribute('aria-label', '결과지 보기'); }, true);
  }
  if (document.readyState !== 'loading') setTimeout(init, 0); else document.addEventListener('DOMContentLoaded', init);
  setTimeout(init, 600); setTimeout(init, 1500);
})();

/* D94 · 캐릭터 뒤 후광 + 반짝임 */
(function () {
  function glowInit() {
    if (document.querySelector('.tb-glow')) return;
    var st = document.querySelector('.tb-stage') || document.querySelector('.tb-char'); if (!st) return;
    var w = document.createElement('div'); w.className = 'tb-glow'; w.setAttribute('aria-hidden', 'true');
    var stars = [[84, 92, 16, 0], [288, 80, 20, .6], [58, 152, 11, 1.2], [318, 146, 12, 1.8], [134, 60, 11, .3], [250, 58, 10, 1.5]];
    w.innerHTML = '<div class="halo"></div>' + stars.map(function (a) { return '<i class="st" style="left:' + a[0] + 'px;top:' + a[1] + 'px;width:' + a[2] + 'px;height:' + a[2] + 'px;animation-delay:' + a[3] + 's"></i>'; }).join('');
    st.parentElement.insertBefore(w, st);
  }
  if (document.readyState !== 'loading') setTimeout(glowInit, 0); else document.addEventListener('DOMContentLoaded', glowInit);
  setTimeout(glowInit, 600); setTimeout(glowInit, 1500);
})();

/* D115 · 하단 「오늘의 60초」(콘텐츠) 제외: 제목 줄과 바로 아래 카드 줄에 .tb-c60을 붙여 숨김(11/23 회의: 큐레이션이 안 되면 콘텐츠 탭과 겹치므로 이번 개발에서는 빼기). 되돌리려면 이 블록 삭제 */
(function () {
  function hide60() {
    var h = [].filter.call(document.querySelectorAll('h1'), function (e) { return /60초/.test(e.textContent || ''); })[0]; if (!h) return;
    var row = h.parentElement && h.parentElement.parentElement; if (!row || row.classList.contains('tb-c60')) return;
    row.classList.add('tb-c60'); if (row.nextElementSibling) row.nextElementSibling.classList.add('tb-c60');
  }
  if (document.readyState !== 'loading') setTimeout(hide60, 0); else document.addEventListener('DOMContentLoaded', hide60);
  setTimeout(hide60, 600); setTimeout(hide60, 1500);
})();

/* D117(D114 복원) · 비코 말풍선(11/23 회의 ④): 이름표에는 짧은 상태만 두고, 캐릭터를 누르면 비코가 상태 이유를 말풍선으로 말한다(「나 지금 졸려 · 수면 시간이 부족해」).
   체크인 전 · 후로 문구가 달라지고, 3.5초 뒤 사라지며 다시 누르면 닫힘. 문구의 수면 값은 시안(실제 연동은 확인 필요) */
(function () {
  var timer = null;
  function say() { var s = document.querySelector('.tb-state'), k = s && s.children[3], st = k ? (k.textContent || '').trim() : ''; return document.querySelector('.tb-tasks') ? [st || '눈이 졸려 보여요', '수면이 부족했어요'] : [st || '쿨쿨 자는 중', '체크인하면 깨어나요']; }   /* D117: 상태 글자는 이름표에서 빼고 말풍선으로 */
  function close() { var o = document.querySelector('.bk-bub'); if (o) { o.classList.remove('on'); setTimeout(function () { o.remove(); }, 250); } clearTimeout(timer); }
  document.addEventListener('click', function (e) {
    var n = e.target.closest && e.target.closest('.tb-char [role="img"]');
    if (!n) { if (!(e.target.closest && e.target.closest('.bk-bub'))) close(); return; }
    if (document.querySelector('.bk-bub.on')) { close(); return; }
    var hero = document.querySelector('.tb-hero'); if (!hero) return;
    var hr = hero.getBoundingClientRect(), cr = n.getBoundingClientRect(), t = say();
    var b = document.createElement('div'); b.className = 'bk-bub'; b.setAttribute('role', 'status');
    b.innerHTML = '<b>' + t[0] + '</b><span>' + t[1] + '</span>';
    hero.appendChild(b);
    b.style.top = Math.max(6, cr.top - hr.top + 2) + 'px'; b.style.left = Math.round((hr.width - b.offsetWidth) / 2) + 'px';
    setTimeout(function () { b.classList.add('on'); }, 30);
    timer = setTimeout(close, 3500);
  }, true);
})();


/* D119 · 비코 이름 수정: 이름표의 이름을 누르면 그 자리에서 입력(최대 8자, Enter · 바깥 누름으로 저장, 빈 값이면 이전 이름). 저장은 이 브라우저(시안). 실제는 서버 저장 + 금칙어 · 글자 수 정책 확인 필요 */
(function () {
  var KEY = 'bico-name', cur = null;
  function nameEl() { var s = document.querySelector('.tb-state'); return s && s.children[1]; }
  function apply() { var n = nameEl(); if (!n || n.querySelector('input')) return; try { var v = localStorage.getItem(KEY); if (v && n.textContent !== v) n.textContent = v; } catch (e) {} }
  function finish(inp, ok) {
    var n = inp.parentElement, v = ok ? inp.value.trim().slice(0, 8) : '', old = inp.getAttribute('data-old');
    var nv = v || old; n.textContent = nv; cur = null;
    try { localStorage.setItem(KEY, nv); } catch (e) {}
    document.querySelectorAll('.tb-state').forEach(function (s) { s.setAttribute('aria-label', nv + ' 이름 수정'); });
  }
  document.addEventListener('click', function (e) {
    var n = nameEl(); if (!n || !e.target.closest || e.target.closest('input.bk-nm')) return;
    var r = n.getBoundingClientRect(); if (!(e.clientX >= r.left - 4 && e.clientX <= r.right + 4 && e.clientY >= r.top - 6 && e.clientY <= r.bottom + 6 && e.target.closest('.tb-state'))) return;   /* ::after 덮개 때문에 좌표로 판정 */
    e.stopPropagation(); if (cur) return;
    var old = n.textContent.trim(), inp = document.createElement('input');
    inp.className = 'bk-nm'; inp.maxLength = 8; inp.value = old; inp.setAttribute('data-old', old); inp.setAttribute('aria-label', '비코 이름 (최대 8자)');
    n.textContent = ''; n.appendChild(inp); cur = inp; inp.focus(); inp.select();
    inp.addEventListener('keydown', function (k) { if (k.key === 'Enter') inp.blur(); else if (k.key === 'Escape') { inp.value = old; inp.blur(); } });
    inp.addEventListener('blur', function () { finish(inp, true); });
  }, true);
  if (document.readyState !== 'loading') setTimeout(apply, 0); else document.addEventListener('DOMContentLoaded', apply);
  setTimeout(apply, 600); setTimeout(apply, 1500);
})();

/* D122 · 홈 상단 카드 순서 변경: 「오늘 체크인」 카드를 위(캐릭터 바로 아래), 「이너뷰티 점수」 카드를 그 아래로. 체크인 카드(문진 후엔 오늘 할 일 카드)와 7칸 줄을 점수 카드 앞으로 옮김. 되돌리려면 이 블록과 home-top.css 끝 D122 블록 삭제 */
(function () {
  function swap() {
    var hero = document.querySelector('.tb-hero'), sc = document.querySelector('.tb-score'); if (!hero || !sc || sc.parentElement !== hero) return;
    var ck = document.querySelector('.tb-ck') || document.querySelector('.tb-tasks'); if (!ck || ck.parentElement === hero) return;
    var wk = document.querySelector('.tb-wk');
    hero.insertBefore(ck, sc); if (wk && wk.parentElement !== hero) hero.insertBefore(wk, sc);
    /* D126: 점수 카드 삭제(CSS)라 하단 구역으로 옮기지 않음 */ void 0;   /* D123: 점수 카드를 반투명 하단 구역(내 목표 자세히 보기가 있는 곳) 안으로 */
  }
  if (document.readyState !== 'loading') setTimeout(swap, 0); else document.addEventListener('DOMContentLoaded', swap);
  setTimeout(swap, 300); setTimeout(swap, 800); setTimeout(swap, 1600);
})();
