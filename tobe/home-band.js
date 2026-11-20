/* TO-BE 홈 · 이너뷰티 카드 제목 옆 인포(ⓘ) → 「점수 단계」 바텀시트.
   단계는 구간 자 기준(기획-홈구조-고객관점.md): 85 이상 매우 좋음 · 75 이상 좋음 · 60 이상 보통 · 그 아래 개선 필요. 구간 분포가 확정되면 숫자만 바꾸면 됨. 설명 문구는 시안. */
(function () {
  var BANDS = [
    { n: '매우 좋음', r: '85 ~ 100점', c: '#6495DE', d: '지금 관리가 몸 상태에 아주 잘 맞고 있어요' },
    { n: '좋음', r: '75 ~ 84점', c: '#6CC189', d: '꾸준한 관리가 점수로 이어지고 있어요' },
    { n: '보통', r: '60 ~ 74점', c: '#F9C65B', d: '기본은 갖췄어요. 조금씩 더 올려 볼 수 있어요' },
    { n: '개선 필요', r: '0 ~ 59점', c: '#F28A6A', d: '기록과 관리를 차근차근 채워 가는 단계예요' }
  ];
  var CUR = '보통';
  var ICON = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="6.6" stroke="currentColor" stroke-width="1.4"/><path d="M8 7.2v3.6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="8" cy="5.1" r=".95" fill="currentColor"/></svg>';
  function close() { [].forEach.call(document.querySelectorAll('.tb-scrim.bd,.tb-sheet.bd'), function (x) { x.remove(); }); document.removeEventListener('keydown', esc, true); }
  function esc(e) { if (e.key === 'Escape') close(); }
  function open() {
    close();
    var s = document.createElement('div'); s.className = 'tb-sheet bd'; s.setAttribute('role', 'dialog'); s.setAttribute('aria-label', '이너뷰티 점수 단계');
    s.innerHTML = '<div class="grab"></div><h4>이너뷰티 점수 단계</h4><p>점수는 100점 만점이고, 아래 4단계로 나뉘어요</p><ul class="bd-list">' +
      BANDS.map(function (b) {
        var on = b.n === CUR;
        return '<li class="bd-row' + (on ? ' on' : '') + '"><i style="background:' + b.c + '"></i><div class="tx"><div class="hd"><b>' + b.n + '</b><span>' + b.r + '</span>' + (on ? '<em>지금 여기예요</em>' : '') + '</div><div class="ds">' + b.d + '</div></div></li>';
      }).join('') + '</ul><div class="act"><button class="cancel">닫기</button></div>';
    var sc = document.createElement('div'); sc.className = 'tb-scrim bd'; sc.onclick = close;
    s.addEventListener('click', function (e) { if (e.target.closest('.cancel')) close(); });
    document.body.appendChild(sc); document.body.appendChild(s); document.addEventListener('keydown', esc, true);
    var b = s.querySelector('.cancel'); if (b) b.focus();
  }
  function init() {
    var g = document.querySelector('.tb-score .tb-goal'); if (!g || g.querySelector('.tb-info')) return;
    var b = document.createElement('button'); b.type = 'button'; b.className = 'tb-info'; b.setAttribute('aria-label', '이너뷰티 점수 단계 안내'); b.innerHTML = ICON;
    g.appendChild(b);
  }
  document.addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('.tb-info'); if (b) { e.preventDefault(); e.stopPropagation(); open(); } }, true);
  if (document.readyState !== 'loading') setTimeout(init, 0); else document.addEventListener('DOMContentLoaded', init);
  setTimeout(init, 600); setTimeout(init, 1500);
})();
