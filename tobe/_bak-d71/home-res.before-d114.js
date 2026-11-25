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
    b.style.left = (rr.right - pr.left - b.offsetWidth + 4) + 'px';
    setTimeout(function () { b.classList.add('on'); }, 350);
    setTimeout(function () { b.classList.remove('on'); setTimeout(function () { b.remove(); }, 350); }, 4350);
    r.addEventListener('click', function () { dot.remove(); b.remove(); r.setAttribute('aria-label', '결과지 보기'); }, true);
  }
  if (document.readyState !== 'loading') setTimeout(init, 0); else document.addEventListener('DOMContentLoaded', init);
  setTimeout(init, 600); setTimeout(init, 1500);
})();

/* D91 · 라벨 시안 C: 왼쪽 「LV 6」 블록 + 이름 · 상태 · 막대 + 「120 남음」. 원래 자식(이름 · 상태 · 막대)은 그대로 두고 블록과 남은 값만 덧붙임(체크인 뒤 상태 글자 갱신은 원래 요소가 그대로 맡음) */
(function () {
  function lvInit() {
    var s = document.querySelector('.tb-state'); if (!s || s.querySelector('.lvblk')) return;
    var tag = s.querySelector('.tb-lvtag'), m = tag && (tag.textContent || '').match(/(\d+)/); if (!m) return;
    var blk = document.createElement('div'); blk.className = 'lvblk'; blk.setAttribute('aria-hidden', 'true'); blk.innerHTML = '<small>LV</small><b>' + m[1] + '</b>';
    var rem = document.createElement('span'); rem.className = 'lvrem'; rem.textContent = '120 XP 남음';
    var bar = s.querySelector('.tb-lvbar');   /* D99: XP 바를 5칸 알약으로 (76% = 3칸 + 4번째 80%) */
    if (bar) { bar.innerHTML = ''; [100, 100, 100, 80, 0].forEach(function (f) { var c = document.createElement('s'); c.style.setProperty('--f', f + '%'); bar.appendChild(c); }); }
    s.insertBefore(blk, s.firstChild); s.appendChild(rem);
    s.setAttribute('aria-label', '레벨 ' + m[1] + ' 비코, 다음 레벨까지 120 XP');
  }
  if (document.readyState !== 'loading') setTimeout(lvInit, 0); else document.addEventListener('DOMContentLoaded', lvInit);
  setTimeout(lvInit, 600); setTimeout(lvInit, 1500);
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
