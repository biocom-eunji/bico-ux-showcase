/* TO-BE 홈 · shadcn/ui 스킨 (zinc 중립 팔레트 · 작은 라디우스 · 14px 기준 글자 · 굵기와 색으로 위계)
   근거: 지금은 라디우스가 굵고 글자가 전반적으로 크며 위계가 약해 한 화면이 복잡해 보임.
   shadcn/ui 기준: radius 8~12px(rounded-md/xl) · 1px 테두리 + shadow-sm · text-xs 12 / sm 14 / base 16 · font-medium~semibold · muted-foreground #71717a
   이 앱은 굵기마다 글꼴 이름이 따로고(원본 JS 상태가 계속 다시 그려지므로) 클래스가 아닌 계산된 값 기준으로 덮어쓰고, 다시 그려질 때마다 한 번 더 돌린다. */
(function () {
  var FG = '#171719', MUTED = '#72747b', BORDER = '#e4e4e7';
  var SIZE = { 52: 44, 28: 20, 22: 20, 20: 16, 18: 16, 17: 16, 9: 11 };      /* D65: 글자 크기는 11 · 12 · 14 · 16 (+ 숫자 표시용 20 · 44) */
  var SKIP = '.tb-care,.tb-score,.tb-sheet,.tb-char,.tb-plat,.tb-bg,.tb-ovl,.tb-toast,[aria-label="자고 있는 비코"]';
  var SHADOW = '0 0 0 1px ' + BORDER + ', 0 1px 2px rgba(9,9,11,.04)';
  var busy = false, queued = false;

  function famOf(c) { return (c.fontFamily.split(',')[0] || '').replace(/["']/g, '').trim(); }
  function gray(rgb) { var m = rgb.match(/[\d.]+/g); if (!m) return false; var r = +m[0], g = +m[1], b = +m[2], a = m[3] === undefined ? 1 : +m[3]; return a > 0.3 && Math.max(r, g, b) < 150 && Math.max(r, g, b) - Math.min(r, g, b) < 46; }   // 어두운 회색 계열만(흰 글자 · 색 글자는 그대로)
  function rad(r, w, h) {                                     // 모서리 하나를 shadcn 값으로
    if (r <= 4) return r;
    if (Math.abs(w - h) < 3 && r >= Math.min(w, h) / 2 - 1) return w >= 40 ? 12 : r;   // 작은 원(점 · 코인 · 아바타)은 그대로, 큰 원(표정 버튼)은 12px 사각형
    if (h <= 10) return r;                                    // 막대(진행 · 게이지)는 그대로
    if (r >= h / 2 - 1 && w > h * 1.2) return 6;              // 알약 → 작은 뱃지(rounded-md)
    if (r >= 14 && h >= 56 && w >= 140) return 12;            // 카드(rounded-xl)
    return 8;                                                 // 버튼 · 칩 · 타일 안쪽 요소(rounded-lg)
  }

  /* 메인 민트 키컬러(D12): 앱 원래 청록(#14B8A6 계열)을 bico-renewal-v4 키컬러로 바꾼다
     키 #22C3BC · 진한 민트(글자 · 아이콘) #157D78 · 연한 배경은 키 색의 16%. D64부터 초록(#0E9F6E · #047857)도 브랜드 민트로 바꾼다(TO-BE에서는 이 초록을 쓰지 않음). */
  var KEY = [34, 195, 188], DARK = KEY;        /* D64: 진한 청록도 브랜드 민트 하나로 */
  var TEAL_MAIN = ['20,184,166', '15,157,138', '20,168,161', '19,191,170', '99,220,212', '34,195,188', '14,159,110', '4,120,87', '21,125,120'], TEAL_DARK = ['14,124,114', '11,111,96', '13,110,106'];
  function mapColor(v) {                                         // 'rgb(a,b,c)' · 'rgba(a,b,c,d)' → 새 색(바꿀 게 없으면 null)
    var m = v && v.match(/^rgba?\(\s*(\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/); if (!m) return null;
    var k = m[1] + ',' + m[2] + ',' + m[3], a = m[4] === undefined ? 1 : +m[4], to = TEAL_MAIN.indexOf(k) >= 0 ? KEY : TEAL_DARK.indexOf(k) >= 0 ? DARK : null;
    if (!to || a === 0) return null;
    if (a < 0.3) a = 0.16;                                      // 연한 배경은 한 가지 농도로
    return a === 1 ? 'rgb(' + to.join(',') + ')' : 'rgba(' + to.join(',') + ',' + a + ')';
  }
  function hexRgb(h) { var n = parseInt(h.slice(1), 16); return 'rgb(' + (n >> 16 & 255) + ',' + (n >> 8 & 255) + ',' + (n & 255) + ')'; }
  function recolorSvg() {                                        // 아이콘 · 로고 · 하단 탭(svg 속성 색)
    [].forEach.call(document.querySelectorAll('svg:not(.tb-stage) *'), function (e) {
      ['fill', 'stroke'].forEach(function (a) {
        var v = e.getAttribute(a); if (!v || v[0] !== '#' || v.length !== 7) return;
        var m = mapColor(hexRgb(v).replace(/\((\d+),(\d+),(\d+)\)/, '($1, $2, $3)').replace(/ /g, ''));
        if (m) e.setAttribute(a, m.indexOf('rgba') === 0 ? v : '#' + ('000000' + ((+m.match(/\d+/g)[0] << 16) | (+m.match(/\d+/g)[1] << 8) | +m.match(/\d+/g)[2]).toString(16)).slice(-6));
      });
    });
    [].forEach.call(document.querySelectorAll('svg:not(.tb-stage) [color],svg[color]'), function (e) {   // 아이콘 라이브러리가 쓰는 color 속성
      var v = e.getAttribute('color'); if (v && v[0] === '#' && v.length === 7) { var m = mapColor(hexRgb(v)); if (m && m.indexOf('rgba') < 0) e.setAttribute('color', '#' + ('000000' + ((+m.match(/\d+/g)[0] << 16) | (+m.match(/\d+/g)[1] << 8) | +m.match(/\d+/g)[2]).toString(16)).slice(-6)); }
    });
  }

  function skin() {
    busy = true;
    recolorSvg();
    var all = document.querySelectorAll('body *');
    for (var i = 0; i < all.length; i++) {
      var e = all[i];
      if (e.tagName === 'SCRIPT' || e.tagName === 'STYLE' || e.tagName === 'svg' || e.closest('svg') || e.closest(SKIP)) continue;
      var c = getComputedStyle(e), rc = e.getBoundingClientRect();
      if (!rc.width || !rc.height) continue;

      /* 0) 키컬러: 글자 · 테두리 · 배경 */
      var kc;
      if (!e.hasAttribute('data-sk-k')) {
        var any = false;
        if ((kc = mapColor(c.color)) && e.textContent.trim()) { e.style.color = kc; any = true; }
        if (parseFloat(c.borderTopWidth) > 0 && (kc = mapColor(c.borderTopColor))) { e.style.borderColor = kc; any = true; }
        if ((kc = mapColor(c.backgroundColor))) { e.style.backgroundColor = kc; any = true; }
        if (any) e.setAttribute('data-sk-k', '1');
      }

      /* 1) 라디우스 */
      var tl = parseFloat(c.borderTopLeftRadius) || 0, tr = parseFloat(c.borderTopRightRadius) || 0, bl = parseFloat(c.borderBottomLeftRadius) || 0, br = parseFloat(c.borderBottomRightRadius) || 0;
      if (Math.max(tl, tr, bl, br) > 4 && !e.hasAttribute('data-sk-r')) {
        e.setAttribute('data-sk-r', '1');
        e.style.borderTopLeftRadius = rad(tl, rc.width, rc.height) + 'px'; e.style.borderTopRightRadius = rad(tr, rc.width, rc.height) + 'px';
        e.style.borderBottomLeftRadius = rad(bl, rc.width, rc.height) + 'px'; e.style.borderBottomRightRadius = rad(br, rc.width, rc.height) + 'px';
      }
      /* 2) 그림자는 얇은 링 + shadow-sm */
      if (c.boxShadow !== 'none' && !e.hasAttribute('data-sk-s') && !/inset/.test(c.boxShadow) && rc.height > 20) { e.setAttribute('data-sk-s', '1'); e.style.boxShadow = SHADOW; }
      /* 3) 글자: 크기 · 굵기 · 색 */
      if (!e.children.length && e.textContent.trim() && !e.hasAttribute('data-sk-t')) {
        e.setAttribute('data-sk-t', '1');
        var px = Math.round(parseFloat(c.fontSize)), fam = famOf(c);
        if (SIZE[px] && !(e.closest('.tb-score') && px === 52 && false)) e.style.fontSize = SIZE[px] + 'px';
        var big = px >= 16;
        if (fam === 'Pretendard-ExtraBold') e.style.fontFamily = (px === 52 ? 'Pretendard-Bold' : 'Pretendard-SemiBold') + ',sans-serif';
        else if (fam === 'Pretendard-Bold') e.style.fontFamily = (big ? 'Pretendard-SemiBold' : 'Pretendard-Medium') + ',sans-serif';
        else if (fam === 'Pretendard-SemiBold' && px <= 13) e.style.fontFamily = 'Pretendard-Medium,sans-serif';
        if (gray(c.color) && !e.closest('.tb-score,.tb-sheet')) {
          if (px <= 13 && px !== 11 || px === 11) e.style.color = MUTED;          // 작은 글자 = 보조 정보
          else if (px >= 14) e.style.color = FG;                                 // 큰 글자 = 주 정보
        }
      }
    }
    busy = false;
  }

  /* 위계를 직접 정하는 곳: 낮출 것은 낮추고, 중요한 것은 그대로 */
  function hierarchy() {
    var L = function (t) { return [].filter.call(document.querySelectorAll('div'), function (x) { return !x.children.length && (x.textContent || '').trim() === t; })[0]; };
    var d = L('오늘의 60초'); if (d) { d.style.fontSize = '16px'; d.style.color = '#171719'; }      // 콘텐츠 영역은 한 단계 낮춤
    var s = L('최근 7일'); if (s) s.style.color = MUTED;
    [].forEach.call(document.querySelectorAll('div'), function (x) {
      if (x.children.length) return; var t = (x.textContent || '').trim();
      if (t === '최근 7일' || t === '온보딩 보기' || t === '시연 초기화') { x.style.color = MUTED; x.style.fontSize = '12px'; }
      if (t === '전체 보기 ›') { x.style.color = MUTED; x.style.fontSize = '12px'; }
    });
    var ck = L('체크인하면 비코가 깨어나요'); if (ck) { ck.style.fontSize = '14px'; }                // 질문이 주인공, 안내 제목은 한 단계 낮춤
    var tl = L('트러블 없던 날'); if (tl) { tl.style.fontSize = '12px'; tl.style.color = MUTED; }
  }

  /* D65 토큰 정리: 계산된 값이 정해진 단계에서 벗어나면 가장 가까운 단계로(글자 크기 11/12/14/16 · 글자 회색 3단계 · 선/면 회색 2단계)
     직접 만든 요소는 CSS에서 이미 맞춰 두었고, 여기서는 앱 원본(atomic 클래스)과 스킨이 만든 값을 맞춘다. 이전에 넣은 값은 매번 지우고 다시 계산해서 상태가 바뀌어도 어긋나지 않는다 */
  var NZ = ['font-size', 'color', 'background-color', 'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color'];
  var FSN = { 9: 11, 10: 11, 13: 12, 15: 14, 17: 16, 18: 16, 22: 20 };
  function nums(v) { var m = v && v.match(/[\d.]+/g); return m ? m.map(Number) : null; }
  function neutral(v, opaque) { var n = nums(v); if (!n || n.length < 3) return null; if (opaque && n.length > 3 && n[3] < 0.98) return null; if (n.length > 3 && n[3] < 0.3) return null; var mx = Math.max(n[0], n[1], n[2]), mn = Math.min(n[0], n[1], n[2]); return mx - mn < 30 ? mx : null; }
  function textTone(v) { var m = neutral(v, false); if (m === null || m > 200) return null; return m <= 45 ? '#171719' : m <= 105 ? '#5a5c63' : '#72747b'; }
  function lineTone(v) { var m = neutral(v, true); if (m === null || m < 205 || m > 252) return null; return m >= 240 ? '#f6f8f9' : '#e4e4e7'; }
  function barFill(v) { var m = neutral(v, true); return m !== null && m >= 100 && m < 205 ? '#72747b' : null; }
  function normalize() {
    var all = document.querySelectorAll('body *'), i, k, e, c, rc, set, t;
    for (i = 0; i < all.length; i++) {
      e = all[i];
      if (e.hasAttribute('data-nz')) { e.getAttribute('data-nz').split(',').forEach(function (p) { e.style.removeProperty(p); }); e.removeAttribute('data-nz'); }
    }
    for (i = 0; i < all.length; i++) {
      e = all[i];
      if (e.tagName === 'SCRIPT' || e.tagName === 'STYLE' || e.tagName === 'svg' || e.closest('svg') || e.closest('.tb-toast')) continue;
      rc = e.getBoundingClientRect(); if (!rc.width || !rc.height) continue;
      c = getComputedStyle(e); set = [];
      t = (e.textContent || '').trim();
      if (!e.children.length && t.length > 1) {
        var px = Math.round(parseFloat(c.fontSize) * 2) / 2, to = FSN[px] || (px === 10.5 || px === 12.5 ? (px === 10.5 ? 11 : 12) : 0);
        if (to) { e.style.setProperty('font-size', to + 'px', 'important'); set.push('font-size'); }
        if ((k = textTone(c.color))) { e.style.setProperty('color', k, 'important'); set.push('color'); }
      }
      if ((k = lineTone(c.backgroundColor)) || (rc.height <= 10 && (k = barFill(c.backgroundColor)))) { e.style.setProperty('background-color', k, 'important'); set.push('background-color'); }
      else if (rc.height <= 10 && (k = barFill(c.backgroundColor))) { e.style.setProperty('background-color', k, 'important'); set.push('background-color'); }
      ['top', 'right', 'bottom', 'left'].forEach(function (sd) {
        if (parseFloat(c['border' + sd[0].toUpperCase() + sd.slice(1) + 'Width']) > 0 && (k = lineTone(c['border' + sd[0].toUpperCase() + sd.slice(1) + 'Color']))) { e.style.setProperty('border-' + sd + '-color', k, 'important'); set.push('border-' + sd + '-color'); }
      });
      if (set.length) e.setAttribute('data-nz', set.join(','));
    }
  }

  function run() { if (busy) return; busy = true; skin(); hierarchy(); normalize(); busy = false; }
  function sched() { if (queued) return; queued = true; requestAnimationFrame(function () { queued = false; run(); }); }

  var mo = new MutationObserver(function (m) {
    for (var i = 0; i < m.length; i++) if (m[i].addedNodes.length) { sched(); return; }
  });
  function start() { run(); mo.observe(document.body, { childList: true, subtree: true }); setTimeout(run, 400); setTimeout(run, 1200); }
  if (document.readyState === 'complete') start(); else addEventListener('load', start);
})();
