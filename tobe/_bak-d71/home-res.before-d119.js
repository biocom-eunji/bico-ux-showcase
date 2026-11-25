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
    var b = document.createElement('div'); b.className = 'rs-bub'; b.setAttribute('role', 'status'); b.textContent = '내 결과지를 확인해 보세요';
    par.appendChild(b);
    /* D103: 버튼이 화면 위쪽(헤더 바로 아래)에 있으면 말풍선은 버튼 아래에 띄우고 꼬리는 위로 */
    b.style.top = (rr.top - pr.top < 80 ? rr.bottom - pr.top + 10 : rr.top - pr.top - 40) + 'px';
    b.style.left = Math.max(8, (rr.left - pr.left + rr.width / 2 < pr.width / 2 ? rr.left - pr.left - 4 : rr.right - pr.left - b.offsetWidth + 4)) + 'px';   /* D116: 결과지가 왼쪽이면 말풍선도 왼쪽 정렬 */
    setTimeout(function () { b.classList.add('on'); }, 350);
    setTimeout(function () { b.classList.remove('on'); setTimeout(function () { b.remove(); }, 350); }, 4350);
    r.addEventListener('click', function () { dot.remove(); b.remove(); r.setAttribute('aria-label', '결과지 보기'); }, true);
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

