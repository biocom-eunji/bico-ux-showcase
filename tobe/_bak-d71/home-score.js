/* TO-BE 홈 · 점수 카드 동작(D14): 분석 정확도 「올리는 법」 펼침 · 목표 바꾸기 시트(고르고 「바꾸기」를 눌러야 바뀜).
   목표별 점수 · 하위 지표는 정책이 정한 값이 없어 시안에서는 목표 이름만 바꾸고 안내를 띄운다. */
(function () {
  var GOALS = ['다이어트', '피부', '장', '웰니스', '근육'], cur = '피부';
  function toast(a, b) {
    var t = document.createElement('div'); t.className = 'tb-toast'; t.innerHTML = '<b>' + a + '</b><span>' + b + '</span>';
    document.body.appendChild(t); setTimeout(function () { t.remove(); }, 2600);
  }
  function closeSheet() { [].forEach.call(document.querySelectorAll('.tb-scrim,.tb-sheet'), function (x) { x.remove(); }); }
  function openSheet() {
    var pick = cur;
    var s = document.createElement('div'); s.className = 'tb-sheet'; s.setAttribute('role', 'dialog'); s.setAttribute('aria-label', '목표 바꾸기');
    function draw() {
      s.innerHTML = '<div class="grab"></div><h4>목표 바꾸기</h4><p>바꾸면 점수 · 하위 지표 · 올리는 법이 그 목표 기준으로 바뀌어요</p>' +
        GOALS.map(function (g) { return '<button class="tb-opt' + (g === pick ? ' on' : '') + '" data-g="' + g + '" role="radio" aria-checked="' + (g === pick) + '">' + g + '<i class="r"></i></button>'; }).join('') +
        '<div class="act"><button class="cancel">취소</button><button class="go"' + (pick === cur ? ' disabled' : '') + '>바꾸기</button></div>';
    }
    draw();
    var sc = document.createElement('div'); sc.className = 'tb-scrim'; sc.onclick = closeSheet;
    s.addEventListener('click', function (e) {
      var o = e.target.closest('.tb-opt'); if (o) { pick = o.getAttribute('data-g'); draw(); return; }
      if (e.target.closest('.cancel')) { closeSheet(); return; }
      var go = e.target.closest('.go'); if (go && !go.disabled) {
        cur = pick; var n = document.querySelector('.goalname'); if (n) n.textContent = cur; closeSheet();
        if (cur !== '피부') toast(cur + ' 목표로 바꿨어요(시안)', '점수 · 하위 지표 · 올리는 법이 그 목표 기준으로 바뀌어요');
      }
    });
    document.body.appendChild(sc); document.body.appendChild(s);
  }
  document.addEventListener('click', function (e) {
    var cta = e.target.closest && e.target.closest('.tb-cta');
    if (cta) {                                                    // D38: 집중 + 행동 버튼은 점수 상세가 아니라 오늘 할 일(체크인 전에는 체크인 카드)로
      e.preventDefault(); e.stopPropagation();
      var tg = document.querySelector('.tb-tasks') || document.querySelector('.tb-ck');
      if (tg && tg.scrollIntoView) tg.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    var h = e.target.closest && e.target.closest('.tb-acc-h');
    if (h) {
      e.preventDefault(); e.stopPropagation();
      var open = h.getAttribute('aria-expanded') !== 'true';
      h.setAttribute('aria-expanded', String(open));
      var p = document.getElementById('tb-acc-p'); if (p) { if (open) p.removeAttribute('hidden'); else p.setAttribute('hidden', ''); }
      return;
    }
    var mo = e.target.closest && e.target.closest('.tb-more');
    if (mo) {
      e.preventDefault(); e.stopPropagation();
      var ps = mo.closest('.tb-parts'), open2 = ps.classList.toggle('open');
      mo.setAttribute('aria-expanded', String(open2)); mo.querySelector('.lb').textContent = open2 ? '접기' : '지표 3개 더 보기';
      return;
    }
    if (e.target.closest && e.target.closest('[data-sheet="goal"]')) { e.preventDefault(); e.stopPropagation(); openSheet(); }
  }, true);
})();
