// graph*.json (crawl 결과) → mermaid 플로우차트 텍스트 (flow-*.mmd)
const fs = require('fs');
const NAMES = {
  '/': '홈', '/record': '기록', '/content': '콘텐츠', '/ai': 'AI', '/shop': '쇼핑', '/my': '마이', '/my/alarm': '알림',
  '/report': '결과지', '/goal/score': '이너뷰티 점수 상세', '/completeness': '분석 정확도', '/onboarding': '온보딩',
  '/record/checkin': '컨디션 통계(체크인)', '/record/diet': '식단 상세', '/record/diet/add': '식단 기록하기',
  '/record/sleep': '수면 상세', '/record/sleep/add': '수면 기록하기', '/record/fasting': '단식 상세', '/record/fasting/start': '단식 시작',
  '/record/supplement': '영양제', '/record/steps': '걸음', '/record/exercise': '운동', '/record/sun': '자외선 차단',
  '/record/weight': '체중', '/record/bowel': '배변', '/record/period': '생리 주기', '/planet/allostar': '알로스타 행성',
};
const dec = s => { try { return decodeURIComponent(s); } catch { return s; } };
const name = p => { p = dec(p.split('?')[0]); if (NAMES[p]) return NAMES[p]; if (p.startsWith('/care/')) return '케어 상세 · ' + p.slice(6); if (p.startsWith('/shorts/')) return '숏츠 ' + p.slice(8); return p; };
const TAB = new Set(['콘텐츠', '기록', '홈', 'AI', '쇼핑']);
const id = p => 'n' + [...dec(p.split('?')[0])].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
const files = fs.readdirSync('.').filter(f => /^graph.*\.json$/.test(f));
const edges = new Map(), nodes = new Map(), overlays = [];
for (const f of files) {
  const g = JSON.parse(fs.readFileSync(f, 'utf8')), from = dec(g.start);
  nodes.set(from, name(from));
  for (const c of g.cands) {
    if (c.skipped || c.error) continue;
    if (TAB.has(c.label)) continue;                        // 하단 탭은 한 줄로 묶음
    const label = c.label.replace(/["|<>\[\]{}()]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 22);
    if (c.kind === 'route') {
      const to = dec(c.path.split('?')[0]); if (to === from) continue;
      nodes.set(to, name(to)); edges.set(from + '>' + to + '>' + label, { from, to, label });
    } else if (c.kind === 'overlay') overlays.push({ from, label, added: (c.added || []).slice(0, 3).join(' · ') });
  }
}
let m = 'flowchart LR\n';
for (const [p, n] of nodes) m += `  ${id(p)}["${n}"]\n`;
m += '  tab(["하단 탭: 콘텐츠 · 기록 · 홈 · AI · 쇼핑"])\n';
const seen = new Set();
for (const e of edges.values()) { const k = e.from + '>' + e.to; if (seen.has(k)) { continue; } seen.add(k); m += `  ${id(e.from)} -->|"${e.label}"| ${id(e.to)}\n`; }
m += `  ${id('/')} -.- tab\n  ${id('/record')} -.- tab\n`;
fs.writeFileSync('flow-all.mmd', m);
fs.writeFileSync('overlays.json', JSON.stringify(overlays, null, 1));
console.log('nodes', nodes.size, 'edges', seen.size, 'overlays', overlays.length);
