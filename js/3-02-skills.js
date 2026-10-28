/* ================= SKILLS ================= */
const SKILLDEFS = {
  strike: { name: '타격', ico: '⚔', type: 'active', kind: 'melee', cost: 0, cd: 0, maxRank: 1, req: 1, granted: true, desc: '기본 근접 공격.' },
  fireball: { name: '화염구', ico: '🔥', type: 'active', kind: 'fire', elem: 'fire', onHit: 'burn', cost: 8, cd: 600, maxRank: 5, req: 1, granted: true, desc: '불의 구체를 날립니다. 등급 상승 시 피해 증가.' },
  frost: { name: '서리', ico: '❄', type: 'active', kind: 'frost', elem: 'cold', onHit: 'chill', cost: 12, cd: 1100, maxRank: 5, req: 1, granted: true, desc: '적을 느리게 하는 냉기 탄환. 등급 상승 시 피해·감속 증가.' },
  nova: { name: '노바', ico: '✦', type: 'active', kind: 'nova', elem: 'fire', onHit: 'burn', cost: 20, cd: 2600, maxRank: 5, req: 1, granted: true, desc: '화염 탄환의 고리. 등급 상승 시 탄환 수 증가.' },
  chain: { name: '연쇄 번개', ico: '⚡', type: 'active', kind: 'chain', cost: 18, cd: 1400, maxRank: 5, req: 8, granted: false, desc: '적 사이를 튀어 오르는 번개. 등급 상승 시 튀는 횟수 증가.' },
  toughness: { name: '강인함', ico: '🪨', type: 'passive', maxRank: 5, req: 2, granted: false, desc: '등급당 생명력 +8%.' },
  precision: { name: '정밀함', ico: '🎯', type: 'passive', maxRank: 5, req: 4, granted: false, desc: '등급당 치명타 확률 +2%.' },
  meditation: { name: '명상', ico: '🌀', type: 'passive', maxRank: 5, req: 6, granted: false, desc: '등급당 마나 재생 +40%.' },
  cleave: { name: '베어내기', ico: '🪓', type: 'active', kind: 'cleave', cost: 6, cd: 500, maxRank: 1, req: 1, granted: false, desc: '전방의 모든 적을 쓸어버리는 근접 공격.' },
  multishot: { name: '다중 사격', ico: '🏹', type: 'active', kind: 'multishot', elem: 'poison', onHit: 'poison', cost: 6, cd: 450, maxRank: 1, req: 1, granted: false, desc: '독 바른 단검 세 자루를 부채꼴로 던집니다.' },
  whirlwind: { name: '회전베기', ico: '🌀', type: 'active', kind: 'whirl', cost: 14, cd: 900, maxRank: 5, req: 5, granted: false, desc: '회전하며 주변 모든 적을 벱니다. 등급 상승 시 피해 증가.' },
  volley: { name: '일제 투척', ico: '🎯', type: 'active', kind: 'volley', elem: 'phys', onHit: 'bleed', cost: 10, cd: 700, maxRank: 5, req: 5, granted: false, desc: '출혈을 일으키는 단검 다섯 자루를 부채꼴로 던집니다. 등급 상승 시 피해 증가.' },
  berserk: { name: '광기', ico: '💢', type: 'passive', maxRank: 5, req: 3, granted: false, desc: '등급당 근접 피해 +6%.' },
  arcanemind: { name: '비전의 정신', ico: '🔮', type: 'passive', maxRank: 5, req: 3, granted: false, desc: '등급당 주문 피해 +6%.' },
  swiftness: { name: '신속함', ico: '💨', type: 'passive', maxRank: 5, req: 3, granted: false, desc: '등급당 이동 속도 +4%.' },
  leap: { name: '도약', ico: '🦿', type: 'active', kind: 'leap', cost: 12, cd: 1200, maxRank: 5, req: 7, granted: false, desc: '커서 위치로 뛰어 착지하며 적을 강타합니다.' },
  meteor: { name: '운석', ico: '☄️', type: 'active', kind: 'meteor', elem: 'fire', onHit: 'burn', cost: 24, cd: 2400, maxRank: 5, req: 10, granted: false, desc: '커서 위치에 운석을 불러내는 강력한 화염 광역 공격.' },
  blink: { name: '점멸', ico: '✨', type: 'active', kind: 'blink', cost: 8, cd: 1000, maxRank: 1, req: 7, granted: false, desc: '커서 방향으로 짧은 거리를 순간이동합니다.' },
  frostnova: { name: '서리 폭발', ico: '🌨️', type: 'active', kind: 'frostnova', elem: 'cold', onHit: 'chill', cost: 16, cd: 1500, maxRank: 5, req: 3, granted: false, desc: '주변 적에게 피해를 주고 느리게 하는 빙결 폭발.' },
  ironskin: { name: '철피', ico: '🧱', type: 'passive', maxRank: 5, req: 5, granted: false, desc: '등급당 방어력 +10%.' },
  bloodlust: { name: '피의 갈망', ico: '🩸', type: 'passive', maxRank: 5, req: 9, granted: false, desc: '등급당 생명력 흡수 +2%.' },
  piercing: { name: '관통 사격', ico: '➹', type: 'passive', maxRank: 3, req: 5, granted: false, desc: '등급당 단검이 적 1명을 추가로 관통합니다.' },
  deadlyaim: { name: '치명적 조준', ico: '👁️', type: 'passive', maxRank: 5, req: 9, granted: false, desc: '등급당 치명타 확률 +2%.' },
  // ---- expanded actives (auto-granted by class level) ----
  groundslam: { name: '지면 강타', ico: '🪨', type: 'active', kind: 'groundslam', onHit: 'stun', cost: 14, cd: 1400, maxRank: 5, req: 1, granted: false, desc: '부채꼴 범위의 지면을 내리쳐 피해를 주고 짧게 기절·넉백·감속시킵니다. 등급 상승 시 피해 증가.' },
  charge: { name: '돌진', ico: '🐗', type: 'active', kind: 'charge', cost: 12, cd: 1600, maxRank: 5, req: 1, granted: false, desc: '커서 방향으로 돌진하며 부딪힌 적에게 피해를 주고 느리게 합니다.' },
  warcry: { name: '전투 함성', ico: '📢', type: 'active', kind: 'warcry', cost: 16, cd: 9000, maxRank: 5, req: 1, granted: false, desc: '8초간 포효: 근접 피해가 늘고 받는 피해가 줄어듭니다. 등급 상승 시 효과 증가.' },
  arcaneorb: { name: '비전 구슬', ico: '🔮', type: 'active', kind: 'arcaneorb', cost: 16, cd: 900, maxRank: 5, req: 1, granted: false, desc: '적을 관통하는 느리고 강력한 구슬. 등급 상승 시 피해 증가.' },
  blizzard: { name: '눈보라', ico: '🌨️', type: 'active', kind: 'blizzard', elem: 'cold', onHit: 'chill', cost: 26, cd: 3000, maxRank: 5, req: 1, granted: false, desc: '몇 초에 걸쳐 커서 위치에 얼음 폭풍을 불러옵니다. 등급 상승 시 피해 증가.' },
  teleportstorm: { name: '순간이동 폭풍', ico: '🌀', type: 'active', kind: 'teleportstorm', cost: 18, cd: 1600, maxRank: 5, req: 1, granted: false, desc: '커서 위치로 점멸하며 출발점과 도착점 양쪽의 적을 폭발시킵니다.' },
  shadowstep: { name: '그림자 걸음', ico: '🗡️', type: 'active', kind: 'shadowstep', cost: 12, cd: 1100, maxRank: 5, req: 1, granted: false, desc: '가장 가까운 적에게 점멸해 확정 치명타로 타격합니다. 등급 상승 시 피해 증가.' },
  fanofknives: { name: '칼날 부채', ico: '🔪', type: 'active', kind: 'fanofknives', elem: 'phys', onHit: 'bleed', cost: 16, cd: 1200, maxRank: 5, req: 1, granted: false, desc: '사방으로 단검을 뿌려 적에게 출혈을 일으킵니다. 등급 상승 시 피해 증가.' },
  secondwind: { name: '재기의 숨결', ico: '💗', type: 'active', kind: 'secondwind', cost: 0, cd: 6000, maxRank: 5, req: 1, granted: false, desc: '모든 마나를 소모해 그 일부만큼 생명력을 회복합니다. 등급 상승 시 전환율 증가.' },
  // ---- barbarian kit (v50) ----
  rend: { name: '찢어발기기', ico: '🩸', type: 'active', kind: 'rend', elem: 'phys', onHit: 'bleed', cost: 6, cd: 500, maxRank: 5, req: 1, granted: false, desc: '넓은 부채꼴로 살점을 찢어 적에게 출혈을 일으킵니다. 등급 상승 시 피해 증가.' },
  frenzy: { name: '광란', ico: '💢', type: 'active', kind: 'frenzy', cost: 12, cd: 8000, maxRank: 5, req: 1, granted: false, desc: '살육의 리듬에 몰입해 8초간 공격 속도가 크게 빨라집니다. 등급 상승 시 속도 증가.' },
  shockwave: { name: '충격파', ico: '💥', type: 'active', kind: 'shockwave', elem: 'phys', cost: 16, cd: 1300, maxRank: 5, req: 1, granted: false, desc: '모든 것을 관통하며 적을 밀어내는 굴러가는 힘의 파도를 일으킵니다. 등급 상승 시 피해 증가.' },
};
const ACTIVE_ORDER = ['strike', 'cleave', 'rend', 'whirlwind', 'leap', 'groundslam', 'charge', 'warcry', 'frenzy', 'shockwave', 'multishot', 'volley', 'fanofknives', 'shadowstep', 'blink', 'teleportstorm', 'fireball', 'frost', 'frostnova', 'nova', 'chain', 'meteor', 'arcaneorb', 'blizzard', 'secondwind'];
const CLASSES = {
  warrior: { name: '전사', col: 0x9a3020, base: { str: 18, dex: 10, vit: 16, eng: 6 }, grow: { hp: 24, mp: 5, dmg: 4 }, dmgMult: 1.15, granted: ['cleave'], blurb: '난전꾼 — 높은 생명력, 강력한 근접 공격, 베어내기 보유.' },
  mage: { name: '마법사', col: 0x2a3aaa, base: { str: 8, dex: 10, vit: 10, eng: 20 }, grow: { hp: 14, mp: 12, dmg: 2 }, spellMult: 1.3, granted: ['fireball', 'frost'], blurb: '유리 대포 — 주문 피해는 강력하지만 생명력이 낮습니다.' },
  rogue: { name: '도적', col: 0x2a7a3a, base: { str: 12, dex: 20, vit: 11, eng: 9 }, grow: { hp: 18, mp: 7, dmg: 3 }, critBonus: 0.08, granted: ['multishot'], blurb: '신속 — 치명타와 속도, 단검을 던집니다.' },
  barbarian: { name: '야만용사', col: 0x8a5a20, base: { str: 20, dex: 12, vit: 14, eng: 4 }, grow: { hp: 22, mp: 4, dmg: 5 }, dmgMult: 1.1, critBonus: 0.04, granted: ['rend'], blurb: '분노의 화신 — 빠르고 강한 근접 공격, 출혈과 충격파.' },
};
// active skills unlock automatically by level per class; the forest below holds passive power
const CLASS_ACTIVES = {
  warrior: { strike: 1, cleave: 1, groundslam: 3, charge: 5, whirlwind: 6, warcry: 9, leap: 10, secondwind: 12 },
  mage: { strike: 1, fireball: 1, frost: 2, frostnova: 4, arcaneorb: 4, nova: 6, blink: 8, chain: 10, blizzard: 13, meteor: 14 },
  rogue: { strike: 1, multishot: 1, shadowstep: 5, volley: 6, fanofknives: 7, blink: 8, teleportstorm: 9, secondwind: 12 },
  barbarian: { strike: 1, rend: 1, groundslam: 2, frenzy: 4, charge: 5, shockwave: 7, whirlwind: 8, warcry: 10, leap: 11, secondwind: 12 },
};
// Auto-grant only the level-1 starting kit. Higher abilities are unlocked by spending an ability point (see unlockAbility).
function syncActives() { const m = CLASS_ACTIVES[character.class] || CLASS_ACTIVES.warrior; for (const id in m) { if (m[id] <= 1 && (character.skills[id] || 0) < 1) character.skills[id] = 1; } }
// Class abilities, ordered by their unlock level (drives the Abilities-tab list).
function classAbilities() { const m = CLASS_ACTIVES[(character && character.class) || 'warrior'] || CLASS_ACTIVES.warrior; return Object.keys(m).filter(id => id !== 'strike').sort((a, b) => m[a] - m[b]); }
// ---- the passive "forest": a connected web of nodes you path through ----
const PTREE = (() => {
  const nodes = {}, adj = {};
  const N = (id, x, y, type, mods, label) => { nodes[id] = { id, x, y, type: type || 'minor', mods: mods || {}, label: label || '' }; adj[id] = adj[id] || []; };
  const L = (a, b) => { (adj[a] = adj[a] || []); (adj[b] = adj[b] || []); if (!adj[a].includes(b)) adj[a].push(b); if (!adj[b].includes(a)) adj[b].push(a); };
  N('hub', 0, 0, 'minor', {}, '교차로');
  /* v50: four sectors at 45°/135°/225°/315° (the fury sector joined for the barbarian). All pre-v50 node ids
     and their adjacency survive — only x/y positions moved — so saved passives arrays stay valid. */
  const sec = {
    str: { ang: Math.PI * 0.75, minors: [{ str: 4 }, { vit: 6 }, { dmg: 2 }, { armor: 6 }], notable: { str: 14, hpPct: 8, meleePct: 8 }, nl: '전투 단련', key: { armorPct: 25, hpPct: 15 }, kl: '저거너트' },
    dex: { ang: Math.PI * 0.25, minors: [{ dex: 4 }, { crit: 2 }, { dmg: 2 }, { vit: 4 }], notable: { dex: 14, crit: 6 }, nl: '정밀', key: { crit: 14, pierce: 1 }, kl: '명사수' },
    int: { ang: -Math.PI * 0.75, minors: [{ eng: 4 }, { mp: 12 }, { spellPct: 4 }, { crit: 1 }], notable: { eng: 14, spellPct: 12, mp: 20 }, nl: '주문 직조자', key: { allskills: 1, spellPct: 20 }, kl: '대마법사' },
    fury: { ang: -Math.PI * 0.25, minors: [{ str: 3, dex: 3 }, { hp: 14 }, { crit: 2 }, { dmg: 3 }], notable: { str: 10, dex: 10, meleePct: 10 }, nl: '피의 격노', key: { haste: 0.12, meleePct: 15 }, kl: '광전사' },
  };
  const starts = { warrior: 'start_str', mage: 'start_int', rogue: 'start_dex', barbarian: 'start_fury' };
  for (const k in sec) {
    const s = sec[k], ga = s.ang;
    N('gw_' + k, Math.cos(ga) * 70, Math.sin(ga) * 70, 'minor', s.minors[0], ''); L('hub', 'gw_' + k);
    N(starts[Object.keys(starts).find(c => starts[c] === 'start_' + k)] || 'start_' + k, Math.cos(ga) * 34, Math.sin(ga) * 34, 'start', {}, '시작'); L('start_' + k, 'gw_' + k);
    const rings = [140, 210, 285, 360]; let prev = 'gw_' + k;
    rings.forEach((R, i) => {
      const ax = 'ax_' + k + '_' + i, x = Math.cos(ga) * R, y = Math.sin(ga) * R; let type = 'minor', mods = s.minors[(i + 1) % 4], label = '';
      if (i === 2) { type = 'notable'; mods = s.notable; label = s.nl; } if (i === 3) { type = 'keystone'; mods = s.key; label = s.kl; }
      N(ax, x, y, type, mods, label); L(prev, ax); prev = ax;
      if (i < 3) { for (const sg of [-1, 1]) { const a2 = ga + sg * 0.32, sx = Math.cos(a2) * R, sy = Math.sin(a2) * R, sid = 'sd_' + k + '_' + i + '_' + (sg > 0 ? 'p' : 'n'); N(sid, sx, sy, 'minor', s.minors[(i + (sg > 0 ? 2 : 3)) % 4], ''); L(ax, sid); } }
    });
    for (const sg of [-1, 1]) { let p2 = 'gw_' + k; for (let j = 0; j < 3; j++) { const ba = ga + sg * 0.66, R2 = 130 + j * 72, x = Math.cos(ba) * R2, y = Math.sin(ba) * R2, id = 'br_' + k + '_' + (sg > 0 ? 'p' : 'n') + '_' + j; N(id, x, y, 'minor', j === 1 ? { vit: 6 } : s.minors[j % 4], ''); L(p2, id); p2 = id; } }
  }
  L('gw_str', 'gw_int'); L('gw_int', 'gw_dex'); L('gw_dex', 'gw_str'); L('gw_dex', 'gw_fury'); L('gw_fury', 'gw_int'); /* pre-v50 triangle kept (save adjacency) + fury ring links */
  // ---- outer ring of powerful keystones + inter-sector clusters ----
  const A = { str: Math.PI * 0.75, dex: Math.PI * 0.25, int: -Math.PI * 0.75, fury: -Math.PI * 0.25 };
  const AK = (id, ang, R, type, mods, label) => { nodes[id] = { id, x: Math.cos(ang) * R, y: Math.sin(ang) * R, type, mods, label }; adj[id] = adj[id] || []; };
  AK('ks_titan', A.str + 0.24, 440, 'keystone', { hpPct: 35, armorPct: 25, movespeed: -0.12 }, '티탄'); L('ax_str_3', 'ks_titan');
  AK('ks_blood', A.str - 0.24, 440, 'keystone', { lifesteal: 0.15, meleePct: 12 }, '피의 굶주림'); L('ax_str_3', 'ks_blood');
  AK('ks_exec', A.dex + 0.24, 440, 'keystone', { crit: 12, critdmg: true, pierce: 1 }, '처형인'); L('ax_dex_3', 'ks_exec');
  AK('ks_tempo', A.dex - 0.24, 440, 'keystone', { haste: 0.30, movespeed: 0.15 }, '템포'); L('ax_dex_3', 'ks_tempo');
  AK('ks_echo', A.int + 0.24, 440, 'keystone', { echo: true, spellPct: 12 }, '주문 메아리'); L('ax_int_3', 'ks_echo');
  AK('ks_glass', A.int - 0.24, 440, 'keystone', { dmgPct: 55, hpPct: -40 }, '유리 대포'); L('ax_int_3', 'ks_glass');
  AK('nt_top', Math.PI * 0.5, 250, 'notable', { meleePct: 10, spellPct: 10, crit: 4 }, '전쟁광'); L('sd_str_2_n', 'nt_top'); L('sd_dex_2_p', 'nt_top');
  AK('ks_chain', Math.PI * 0.5, 360, 'keystone', { deathnova: 0.9 }, '연쇄 반응'); L('nt_top', 'ks_chain');
  AK('nt_right', 0, 250, 'notable', { dex: 10, eng: 10, crit: 3 }, '교활한 자'); L('sd_dex_2_n', 'nt_right'); L('sd_fury_2_p', 'nt_right'); /* v50: re-anchored dex↔fury (was dex↔int before the fury sector existed) */
  AK('ks_aegis', 0, 360, 'keystone', { manaShield: 0.4, mp: 50 }, '아이기스'); L('nt_right', 'ks_aegis');
  AK('nt_left', Math.PI, 250, 'notable', { str: 10, vit: 10, armor: 8 }, '보루'); L('sd_str_2_p', 'nt_left'); L('sd_int_2_n', 'nt_left');
  AK('ks_frost', Math.PI, 360, 'keystone', { chillaura: true, spellPct: 8, eng: 8 }, '동상'); L('nt_left', 'ks_frost');
  AK('nt_bottom', -Math.PI * 0.5, 250, 'notable', { vit: 10, str: 6, dex: 6 }, '전쟁 결속'); L('sd_fury_2_n', 'nt_bottom'); L('sd_int_2_p', 'nt_bottom');
  AK('ks_ward', -Math.PI * 0.5, 360, 'keystone', { thorns: 18, hpPct: 12 }, '응징'); L('nt_bottom', 'ks_ward');
  AK('ks_rage', A.fury + 0.24, 440, 'keystone', { haste: 0.2, meleePct: 12 }, '난동'); L('ax_fury_3', 'ks_rage');
  AK('ks_stone', A.fury - 0.24, 440, 'keystone', { thorns: 24, armorPct: 20 }, '석화'); L('ax_fury_3', 'ks_stone');
  return { nodes, adj, starts };
})();
function defaultSkillRanks() { const o = {}; for (const id in SKILLDEFS) o[id] = (id === 'strike') ? 1 : 0; return o; }
/* ---- skill-rank spending (v50): actives grow past rank 1 with ability points. Buying rank r+1 costs r points
   (1+2+3+4 = 10 to max a rank-5 skill — comparable to a full rune tree, so ranks-vs-runes is a real choice).
   SKILL_COEF.coef(rank) already scales damage with rank, so this re-activates the vestigial maxRank axis. */
function rankUpCost(cur) { return Math.max(1, cur); }
function canRankUp(ch, id) {
  const def = SKILLDEFS[id]; if (!def || def.type !== 'active') return false;
  const cur = (ch.skills && ch.skills[id]) || 0; if (cur < 1 || cur >= (def.maxRank || 1)) return false;
  return (ch.abilityPoints || 0) >= rankUpCost(cur);
}
// V7 action-bar loadout: 6 fixed slots [LMB basic, RMB, key1..4]. Backfill from currently-unlocked actives;
// RMB (slot 1) preferentially takes the old activeSkillId so existing characters keep their "selected" skill.
function defaultLoadout(ch) {
  const lo = ['strike', null, null, null, null, null];
  const unlocked = ACTIVE_ORDER.filter(id => id !== 'strike' && ch.skills && ch.skills[id] >= 1);
  if (ch.activeSkillId && ch.activeSkillId !== 'strike' && unlocked.indexOf(ch.activeSkillId) >= 0) lo[1] = ch.activeSkillId;
  let s = 1;
  for (const id of unlocked) {
    if (id === lo[1]) continue;
    while (s < 6 && lo[s]) s++;
    if (s >= 6) break;
    lo[s] = id; s++;
  }
  return lo;
}
