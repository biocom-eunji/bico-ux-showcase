/* 홈 캐릭터 「또잉또잉」 — AS-IS와 같은 인터랙션. 캐릭터를 눌렀다 떼면 아래로 7px 찌그러졌다(가로 +6% · 세로 -8%) 감쇠 스프링으로 위아래 튕기며 약 1.2초 안에 멈춤.
   AS-IS(bico-renewal)에서 측정한 값: 시작 ty=+7px · 주기 약 0.28초 · 반주기마다 진폭 약 48%로 감소. 캐릭터 상태(자는 · 깬)가 바뀌어도 되도록 위임 리스너로 붙임 */
(function () {
  if (window.__tbBoing) return; window.__tbBoing = true;
  var A = 7, DECAY = 5.24, OMEGA = 22.4, DUR = 1.2, STEPS = 40;
  var frames = [];
  for (var i = 0; i <= STEPS; i++) {
    var t = DUR * i / STEPS, ty = A * Math.exp(-DECAY * t) * Math.cos(OMEGA * t);
    frames.push({ transform: 'translateY(' + ty.toFixed(2) + 'px) scaleX(' + (1 + 0.0088 * ty).toFixed(4) + ') scaleY(' + (1 - 0.0118 * ty).toFixed(4) + ')' });
  }
  frames[STEPS].transform = 'translateY(0px) scaleX(1) scaleY(1)';
  function boing(el) {
    var body = el && el.firstElementChild; if (!body || !body.animate) return;
    if (body.__boing) body.__boing.cancel();
    body.__boing = body.animate(frames, { duration: DUR * 1000, easing: 'linear' });
  }
  function find(e) { var n = e.target.closest && e.target.closest('.tb-char [role="img"]'); return n; }
  document.addEventListener('click', function (e) { boing(find(e)); }, true);
  document.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { var n = find(e); if (n) { e.preventDefault(); boing(n); } } }, true);
  document.addEventListener('mouseover', function (e) { var n = find(e); if (n) n.style.cursor = 'pointer'; }, true);
})();
