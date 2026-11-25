/* D79 · 결과지 버튼 상태(시안 B). 주소 ?res=seen 이면 확인한 뒤(원형 + 글자), 없으면 새 결과지(알약 + NEW 점 → 4초 뒤 원형으로 줄어듦). 누르면 점이 사라짐 */
(function () {
  function init() {
    var r = document.querySelector('.tb-res'); if (!r || r.querySelector('.rs-box')) return;
    var img = r.querySelector('img'), src = img ? img.getAttribute('src') : '';
    var seen = /[?&]res=seen/.test(location.search);
    r.insertAdjacentHTML('beforeend', '<span class="rs-box"><img alt="" src="' + src + '"><span class="rs-tx">새로 도착</span><i class="rs-dot"></i></span><span class="rs-lb">결과지</span>');
    r.setAttribute('aria-label', seen ? '결과지 보기' : '새 결과지 보기');
    if (!seen) {
      r.classList.add('rs-new', 'rs-open');
      setTimeout(function () { r.classList.remove('rs-open'); }, 4000);
      r.addEventListener('click', function () { r.classList.remove('rs-new', 'rs-open'); r.setAttribute('aria-label', '결과지 보기'); }, true);
    }
  }
  if (document.readyState !== 'loading') setTimeout(init, 0); else document.addEventListener('DOMContentLoaded', init);
  setTimeout(init, 600);
})();
