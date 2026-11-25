/* D81 · 결과지 버튼 알림. 새 분석 결과가 있으면(기본) 말풍선 「새 분석 결과가 도착했어요!」가 4초 떴다 사라지고 주황 NEW 점이 남음. 누르면 점 삭제. 주소 ?res=seen 이면 아무것도 안 붙음(확인한 뒤) */
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
    var b = document.createElement('div'); b.className = 'rs-bub'; b.setAttribute('role', 'status'); b.textContent = '새 분석 결과가 도착했어요!';
    par.appendChild(b);
    b.style.top = (rr.top - pr.top - 40) + 'px';
    b.style.left = (rr.right - pr.left - b.offsetWidth + 4) + 'px';
    setTimeout(function () { b.classList.add('on'); }, 350);
    setTimeout(function () { b.classList.remove('on'); setTimeout(function () { b.remove(); }, 350); }, 4350);
    r.addEventListener('click', function () { dot.remove(); b.remove(); r.setAttribute('aria-label', '결과지 보기'); }, true);
  }
  if (document.readyState !== 'loading') setTimeout(init, 0); else document.addEventListener('DOMContentLoaded', init);
  setTimeout(init, 600); setTimeout(init, 1500);
})();
