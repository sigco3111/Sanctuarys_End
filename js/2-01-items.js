/* ================= ITEMS ================= */
const SLOTS = ['weapon', 'offhand', 'helm', 'armor', 'gloves', 'boots', 'ring', 'amulet'];

/* ---- floor bounties: optional per-floor goal that pays a bonus (soft gate; portal stays open) ----
   Pure (no THREE/DOM) so tests/objectives.test.js can load them from the browser-free prefix. */
function rollFloorObjective(depth) {
  if (depth <= 1 || depth % 5 === 0 || depth === 666 || depth === COW_DEPTH) return null; // boss floors + the opening floor get no bounty
  const r = Math.random();
  if (r < 0.35) return { kind: 'champion', done: false };
  if (r < 0.55) return { kind: 'elites', target: randi(2, 3), count: 0, done: false };
  if (r < 0.7) return { kind: 'shrines', target: 2, count: 0, done: false };
  return { kind: 'slay', target: clamp(6 + (depth >> 1), 6, 18), count: 0, done: false };
}
/* Wild-region hunt: the overworld counterpart to floor bounties (rolled per enterWild). */
function rollWildObjective(lvl) {
  if (Math.random() < 0.5) return { kind: 'hunt', target: randi(8, 14), count: 0, done: false };
  return { kind: 'stalker', done: false };
}
// Advance a bounty by one signal ('kill' | 'champion' | 'elite' | 'shrine'); returns true on the transition to complete (once).
function bountyProgress(obj, kind) {
  if (!obj || obj.done) return false;
  if (obj.kind === 'slay' && kind === 'kill') { if (++obj.count >= obj.target) { obj.done = true; return true; } return false; }
  if (obj.kind === 'champion' && kind === 'champion') { obj.done = true; return true; }
  if (obj.kind === 'elites' && kind === 'elite') { if (++obj.count >= obj.target) { obj.done = true; return true; } return false; }
  if (obj.kind === 'shrines' && kind === 'shrine') { if (++obj.count >= obj.target) { obj.done = true; return true; } return false; }
  if (obj.kind === 'hunt' && kind === 'kill') { if (++obj.count >= obj.target) { obj.done = true; return true; } return false; }
  if (obj.kind === 'stalker' && kind === 'champion') { obj.done = true; return true; }
  return false;
}
const SLOT_ICON = { weapon: '⚔️', offhand: '🔰', helm: '🪖', armor: '🛡️', gloves: '🧤', boots: '🥾', ring: '💍', amulet: '📿' };
const SLOT_NAME = { weapon: '무기', offhand: '보조장비', helm: '투구', armor: '갑옷', gloves: '장갑', boots: '장화', ring: '반지', amulet: '목걸이' };
const BASE_NAMES = { weapon: ['검', '도끼', '철퇴', '단검', '대검', '전투 망치', '육도', '시미터', '도리깨', '글레이브'], offhand: ['버클러', '카이트 방패', '고서', '마법서', '화살통', '볼트 통'], helm: ['모자', '투구', '두건', '관', '바이저', '바르뷔트', '살레'], armor: ['튜닉', '사슬 갑옷', '판금 갑옷', '로브', '흉갑', '브리건딘', '호버크'], gloves: ['장갑', '건틀릿', '손보호대', '팔보호대'], boots: ['부츠', '각반', '철신', '발보호대'], ring: ['반지', '고리 반지', '인장 반지', '고리'], amulet: ['아뮬렛', '펜던트', '부적', '참'] };
/* Class-flavored weapon base names (cosmetic only — base does not affect stats; baseStat comes from ilvl/rarity).
   Lets the visible weapon model be loot-driven for every class: mages roll caster bases, rogues ranged, warriors melee. */
const WEAPON_BASES = {
  melee: ['검', '도끼', '철퇴', '단검', '대검', '전투 망치', '육도', '시미터', '도리깨', '글레이브'],
  caster: ['지팡이', '완드', '홀', '마법봉', '첨탑 지팡이', '가지 지팡이'],
  ranged: ['활', '석궁', '장궁', '단궁', '리커브', '사냥활'],
};
const CLASS_WEAPON_FAMILY = { warrior: 'melee', mage: 'caster', rogue: 'ranged', barbarian: 'melee' };
function pickWeaponBase() { return choice(WEAPON_BASES[CLASS_WEAPON_FAMILY[(typeof character !== 'undefined' && character && character.class)] || 'melee']); }
/* ---- offhands: class-flavored kinds. Shields roll armor + Block %, tomes/quivers roll a guaranteed
   kit affix instead of a base stat. Kind stored on the item (it.ohKind) so folding never re-derives it. */
const OFFHAND_KINDS = {
  melee: { kind: 'shield', names: ['버클러', '카이트 방패', '타워 방패', '아이기스', '보루 방패'] },
  caster: { kind: 'tome', names: ['고서', '마법서', '전서', '주문서'] },
  ranged: { kind: 'quiver', names: ['화살통', '볼트 통', '화살 제작 도구', '화살 주머니'] },
};
function offhandSpec() { return OFFHAND_KINDS[CLASS_WEAPON_FAMILY[(typeof character !== 'undefined' && character && character.class)] || 'melee']; }
/* Weapon subtype identity, derived at READ time from it.base so items saved before subtypes existed need no new
   field: an attack-interval multiplier (<1 = faster, >1 = slower-but-heavier). 2H is a stored roll flag (it.h2),
   never derived from the name — an old saved "War Hammer" stays one-handed. */
const WEAPON_SPEED = { 단검: 0.85, 완드: 0.85, 단궁: 0.9, 대검: 0.92, 시미터: 0.92, 리커브: 0.95, 마법봉: 0.95, '가지 지팡이': 0.98, 검: 1, 활: 1, '사냥활': 1, 홀: 1, 도끼: 1.02, 도리깨: 1.05, '첨탑 지팡이': 1.05, 장궁: 1.06, 철퇴: 1.08, 지팡이: 1.08, 육도: 1.1, 석궁: 1.1, 글레이브: 1.15, '전투 망치': 1.18 };
/** @param {{base?:string}|null|undefined} it @returns {number} */
const weaponSpeed = it => (it && it.base && WEAPON_SPEED[it.base]) || 1;
const PREFIX = ['견고한', '잔인한', '맹렬한', '빛나는', '고대의', '야만의', '축복받은', '울부짖는', '음산한', '찬란한'];
const SUFFIX = ['곰의', '화염의', '활력의', '여우의', '힘의', '올빼미의', '수호의', '분노의', '늑대의', '파멸의'];
const AFFIXES = {
  dmg: { label: '공격력', roll: il => randi(2, 4 + Math.round(il * 1.1)) }, hp: { label: '생명력', roll: il => randi(8, 18 + Math.round(il * 2)) }, mp: { label: '마나', roll: il => randi(5, 10 + Math.round(il * 1.4)) }, armor: { label: '방어력', roll: il => randi(2, 5 + Math.round(il * 1.2)) }, str: { label: '힘', roll: il => randi(1, 2 + Math.round(il * 0.4)) }, dex: { label: '민첩', roll: il => randi(1, 2 + Math.round(il * 0.4)) }, vit: { label: '활력', roll: il => randi(1, 2 + Math.round(il * 0.4)) }, eng: { label: '에너지', roll: il => randi(1, 2 + Math.round(il * 0.4)) }, crit: { label: '치명타 확률 %', roll: il => randi(2, 5) }, ias: { label: '공격 속도 %', roll: il => randi(3, 7) }, ms: { label: '이동 속도 %', roll: il => randi(3, 8) }, leech: { label: '생명력 흡수 %', roll: il => randi(1, 3) }, allstats: { label: '모든 능력치', roll: il => randi(1, 1 + Math.round(il * 0.25)) }, thorns: { label: '가시 반사', roll: il => randi(2, 5 + Math.round(il * 0.6)) },
  fireRes: { label: '화염 저항 %', roll: il => randi(4, 9 + Math.round(il * 0.4)) }, coldRes: { label: '냉기 저항 %', roll: il => randi(4, 9 + Math.round(il * 0.4)) }, poisonRes: { label: '독 저항 %', roll: il => randi(4, 9 + Math.round(il * 0.4)) }, lightRes: { label: '번개 저항 %', roll: il => randi(4, 9 + Math.round(il * 0.4)) },
  allRes: { label: '모든 저항 %', roll: il => randi(2, 4 + Math.round(il * 0.25)) },
  critDmg: { label: '치명타 피해 %', roll: il => randi(8, 15 + Math.round(il * 1.0)) },
  manaLeech: { label: '마나 흡수 %', roll: il => randi(1, 3) }, leechAll: { label: '생명력·마나 흡수 %', roll: il => randi(1, 2) },
  burnOnHit: { label: '적중 시 화상 확률 %', roll: il => randi(8, 16 + Math.round(il * 0.3)) }, bleedOnHit: { label: '적중 시 출혈 확률 %', roll: il => randi(8, 16 + Math.round(il * 0.3)) },
  skillranks: { label: '스킬 +', roll: il => randi(1, 1 + Math.round(il * 0.08)) },
  skilldmg: { label: '스킬 피해 %', roll: il => randi(5, 9 + Math.round(il * 0.3)) },
  activeskill: { label: '액티브 스킬 피해 %', roll: il => randi(8, 14 + Math.round(il * 0.4)) },
  fireDmg: { label: '화염 피해 %', roll: il => randi(6, 12 + Math.round(il * 0.4)) },
  coldDmg: { label: '냉기 피해 %', roll: il => randi(6, 12 + Math.round(il * 0.4)) },
  lightDmg: { label: '번개 피해 %', roll: il => randi(6, 12 + Math.round(il * 0.4)) },
  poisonDmg: { label: '독 피해 %', roll: il => randi(6, 12 + Math.round(il * 0.4)) },
  hpregen: { label: '초당 생명력 재생', roll: il => randi(2, 4 + Math.round(il * 0.5)) },
  mpregen: { label: '초당 마나 재생', roll: il => randi(1, 2 + Math.round(il * 0.4)) },
  mf: { label: '매직 파인드 %', roll: il => randi(5, 10 + Math.round(il * 0.3)) },
  gf: { label: '골드 획득 %', roll: il => randi(6, 12 + Math.round(il * 0.4)) },
  dodge: { label: '회피 %', roll: il => randi(2, 4 + Math.round(il * 0.15)) },
  flatDR: { label: '피해 감소 %', roll: il => randi(2, 4 + Math.round(il * 0.15)) },
  cdr: { label: '재사용 대기시간 감소 %', roll: il => randi(3, 6 + Math.round(il * 0.2)) },
  lifeOnHit: { label: '적중 시 생명력', roll: il => randi(2, 4 + Math.round(il * 0.5)) }
};
const AFFIX_KEYS = Object.keys(AFFIXES);
// tooltip grouping: off=offense, def=defense, res=resistance, util=utility
const AFFIX_CAT = { dmg: 'off', crit: 'off', ias: 'off', critDmg: 'off', leech: 'off', skillranks: 'off', skilldmg: 'off', activeskill: 'off', fireDmg: 'off', coldDmg: 'off', lightDmg: 'off', poisonDmg: 'off', burnOnHit: 'off', bleedOnHit: 'off', hp: 'def', armor: 'def', thorns: 'def', hpregen: 'def', fireRes: 'res', coldRes: 'res', poisonRes: 'res', lightRes: 'res', allRes: 'res', mp: 'util', str: 'util', dex: 'util', vit: 'util', eng: 'util', ms: 'util', allstats: 'util', manaLeech: 'util', leechAll: 'util', mpregen: 'util', mf: 'util', gf: 'util', dodge: 'def', flatDR: 'def', cdr: 'off', lifeOnHit: 'off' };
const AFFIX_CAT_ORD = { off: 1, def: 2, res: 3, util: 4 };
const RARITY_AFFIX = { common: [0, 0], magic: [1, 2], rare: [3, 5], set: [2, 3], unique: [4, 6] };
const RCOL = { common: 0xc8b89a, magic: 0x4a6ad0, rare: 0xd0b020, set: 0x40c040, unique: 0xb06010 };
const RTIER = { common: 1, magic: 2, rare: 3, set: 4, unique: 5 };
/* rarity now scales raw power: multiplier on base stat AND each rolled affix value (uniques keep hand-tuned values) */
const RARITY_MULT = { common: 1.0, magic: 1.18, rare: 1.4, set: 1.55, unique: 1.7 };
const RARITY_NAME = { common: '일반', magic: '마법', rare: '레어', set: '세트', unique: '유니크' };
function baseStatRoll(slot, ilvl, rarity) { const m = RARITY_MULT[rarity] || 1; if (slot === 'weapon') return Math.round((4 + ilvl * 1.3 + rand(0, 4)) * m); if (slot !== 'ring' && slot !== 'amulet' && slot !== 'offhand') return Math.round((2 + ilvl * 0.9 + rand(0, 3)) * m); return 0; } /* offhand base stat is kind-dependent — rolled by applyOffhandKind, not here */
/* Stamp an offhand's kind identity onto a freshly rolled item: shields get an armor base + Block %, tomes/quivers a guaranteed kit affix. */
function applyOffhandKind(item, spec, ilvl, rarity) {
  item.ohKind = spec.kind;
  if (spec.kind === 'shield') { item.baseStat = Math.round((2 + ilvl * 0.9 + rand(0, 3)) * (RARITY_MULT[rarity] || 1)); item.block = randi(6, 10 + Math.round(ilvl * 0.25)); }
  else { const gk = spec.kind === 'tome' ? (Math.random() < 0.5 ? 'skilldmg' : 'mp') : (Math.random() < 0.5 ? 'ias' : 'dmg'); item.affixes[gk] = affixRoll(gk, ilvl, rarity); }
}
function affixRoll(k, ilvl, rarity) { return Math.max(1, Math.round(AFFIXES[k].roll(ilvl) * (RARITY_MULT[rarity] || 1))); }
const UNIQUE_DEFS = [
  { slot: 'weapon', name: '핏빛 송곳니', base: 14, affixes: { dmg: 12, crit: 8 }, effect: 'lifesteal', effVal: 0.12, desc: '근접·주문으로 가한 피해의 12%를 회복합니다.' },
  { slot: 'armor', name: '가시 갑주', base: 14, affixes: { armor: 18, vit: 10 }, effect: 'thorns', effVal: 14, desc: '근접 공격자에게 피해 14를 반사합니다.' },
  { slot: 'helm', name: '대마법사의 관', base: 8, affixes: { eng: 12, mp: 30 }, effect: 'allskills', effVal: 1, desc: '모든 스킬 등급 +1.' },
  { slot: 'boots', name: '바람걸음 각반', base: 8, affixes: { dex: 10 }, effect: 'movespeed', effVal: 0.25, desc: '이동 속도 +25%.' },
  { slot: 'amulet', name: '사신의 눈', base: 0, affixes: { crit: 10, dmg: 8 }, effect: 'critdmg', effVal: 1, desc: '치명타 피해가 2배가 아닌 3배가 됩니다.' },
  { slot: 'ring', name: '흡혈의 고리', base: 0, affixes: { hp: 20, dmg: 4 }, effect: 'lifesteal', effVal: 0.06, desc: '가한 피해의 6%를 회복합니다.' },
  { slot: 'gloves', name: '분노의 건틀릿', base: 8, affixes: { dmg: 10, str: 8 }, effect: 'lifesteal', effVal: 0.05, desc: '가한 피해의 5%를 회복합니다.' },
  { slot: 'helm', name: '악의의 얼굴', base: 9, affixes: { vit: 8, armor: 8 }, effect: 'thorns', effVal: 18, desc: '근접 공격자에게 피해 18을 반사합니다.' },
  { slot: 'weapon', name: '폭풍소환사', base: 13, affixes: { dmg: 10, ias: 8 }, effect: 'haste', effVal: 0.15, desc: '공격 속도 +15%.' },
  { slot: 'weapon', name: '세계를 가르는 자', base: 16, affixes: { dmg: 14, str: 8 }, effect: 'pierce', effVal: 2, desc: '공격이 적 2명을 추가로 관통합니다.' },
  { slot: 'ring', name: '잿불 고리', base: 0, affixes: { dmg: 6, crit: 6 }, effect: 'deathnova', effVal: 0.5, desc: '처치한 적이 폭발해 주변 적에게 내 피해의 50%를 입힙니다.' },
  { slot: 'amulet', name: '산의 심장', base: 0, affixes: { vit: 14, allRes: 10 }, effect: 'thorns', effVal: 16, desc: '근접 공격자에게 피해 16을 반사합니다.' },
  { slot: 'boots', name: '유령 장화', base: 7, affixes: { dex: 8, ms: 10 }, effect: 'movespeed', effVal: 0.2, desc: '이동 속도 +20%.' },
  { slot: 'gloves', name: '탐욕의 손아귀', base: 7, affixes: { dmg: 8, leechAll: 2 }, effect: 'lifesteal', effVal: 0.06, desc: '가한 피해의 6%를 회복합니다.' },
  { slot: 'helm', name: '파멸의 왕관', base: 9, affixes: { eng: 10, critDmg: 30 }, effect: 'critdmg', effVal: 1, desc: '치명타 피해가 2배가 아닌 3배가 됩니다.' },
  { slot: 'armor', name: '영원한 아이기스', base: 16, affixes: { armor: 20, allRes: 12, vit: 12 }, effect: 'thorns', effVal: 12, desc: '근접 공격자에게 피해 12를 반사합니다.' },
  { slot: 'weapon', name: '공허관통자', base: 15, affixes: { dmg: 12, crit: 6 }, effect: 'pierce', effVal: 2, desc: '공격이 적 2명을 추가로 관통합니다.' },
  { slot: 'gloves', name: '폭풍의 손아귀', base: 8, affixes: { ias: 10, dex: 8 }, effect: 'haste', effVal: 0.12, desc: '공격 속도 +12%.' },
  { slot: 'boots', name: '폭풍추적자 부츠', base: 7, affixes: { ms: 12, dex: 6 }, effect: 'movespeed', effVal: 0.22, desc: '이동 속도 +22%.' },
  { slot: 'amulet', name: '아이기스 펜던트', base: 0, affixes: { vit: 12, allRes: 8 }, effect: 'manaShield', effVal: 0.25, desc: '받는 피해의 25%를 마나로 흡수합니다.' },
  { slot: 'ring', name: '핏빛 고리', base: 0, affixes: { hp: 24, dmg: 5 }, effect: 'lifesteal', effVal: 0.07, desc: '가한 피해의 7%를 회복합니다.' },
  /* v50: build-transforming uniques on effect keys recompute already resolves but no item granted */
  { slot: 'amulet', name: '아르콘의 메아리', base: 0, affixes: { eng: 14, skilldmg: 12 }, effect: 'echo', effVal: 1, desc: '주문이 메아리쳐 한 번 더 시전됩니다.' },
  { slot: 'armor', name: '서리심장 껍질', base: 15, affixes: { armor: 16, coldRes: 15 }, effect: 'chillaura', effVal: 1, desc: '가까운 적이 당신의 존재만으로 냉기에 걸립니다.' },
  { slot: 'weapon', name: '대재앙의 칼날', base: 15, affixes: { dmg: 12, fireDmg: 10 }, effect: 'deathnova', effVal: 0.9, desc: '처치한 적이 폭발해 내 피해의 90%를 입힙니다.' },
  { slot: 'offhand', name: '최후의 파수대의 아이기스', base: 12, affixes: { vit: 12, allRes: 8 }, effect: 'manaShield', effVal: 0.35, desc: '받는 피해의 35%를 마나로 흡수합니다.' },
];
/* Legendary effects that can land on deep RARES (ilvl 12+, ~8%): drawn from effect keys that already resolve
   in recompute/combat, at ~60% of unique magnitudes — build-bending without replacing uniques. */
const RARE_EFFECTS = [
  { effect: 'lifesteal', effVal: 0.05, desc: '가한 피해의 5%를 회복합니다.' },
  { effect: 'thorns', effVal: 10, desc: '근접 공격자에게 피해 10을 반사합니다.' },
  { effect: 'haste', effVal: 0.08, desc: '공격 속도 +8%.' },
  { effect: 'pierce', effVal: 1, desc: '공격이 적 1명을 추가로 관통합니다.' },
  { effect: 'deathnova', effVal: 0.3, desc: '처치한 적이 폭발해 내 피해의 30%를 입힙니다.' },
  { effect: 'manaShield', effVal: 0.15, desc: '받는 피해의 15%를 마나로 흡수합니다.' },
  { effect: 'movespeed', effVal: 0.12, desc: '이동 속도 +12%.' },
];
const SET_DEFS = {
  warden: { name: "감시자의 경계", pieces: ['helm', 'armor', 'gloves', 'boots'], bonuses: { 2: { vit: 15, armor: 12 }, 3: { str: 12, hp: 40 }, 4: { vit: 30, armor: 30, effect: 'thorns', effVal: 12 } } },
  conjurer: { name: "소환술사의 예복", pieces: ['helm', 'armor', 'amulet', 'ring'], bonuses: { 2: { eng: 18, mp: 30 }, 3: { eng: 30 }, 4: { mp: 60, effect: 'allskills', effVal: 1 } } },
  shadow: { name: '그림자 무희', pieces: ['weapon', 'gloves', 'boots', 'ring'], bonuses: { 2: { dex: 15, crit: 6 }, 3: { dmg: 14 }, 4: { crit: 12, effect: 'critdmg', effVal: 1 } } },
  emberwalker: { name: '잿불 걸음꾼', pieces: ['weapon', 'helm', 'gloves', 'boots'], bonuses: { 2: { ias: 8, crit: 5 }, 3: { dmg: 16 }, 4: { burnOnHit: 25, effect: 'haste', effVal: 0.12 } } },
  stoneguard: { name: '바위 수호자', pieces: ['helm', 'armor', 'boots', 'amulet'], bonuses: { 2: { armor: 18, vit: 12 }, 3: { hp: 60 }, 4: { allRes: 15, effect: 'manaShield', effVal: 0.2 } } },
  /* v50: six-piece class-themed sets (possible now that the offhand slot exists) */
  juggernaut: { name: "거신의 결의", pieces: ['weapon', 'offhand', 'helm', 'armor', 'gloves', 'boots'], bonuses: { 2: { str: 15, armor: 15 }, 4: { hp: 80, dmg: 12 }, 6: { dmg: 25, effect: 'lifesteal', effVal: 0.1 } } },
  stormcaller: { name: "폭풍술사의 의복", pieces: ['weapon', 'offhand', 'helm', 'armor', 'ring', 'amulet'], bonuses: { 2: { eng: 18, mp: 25 }, 4: { skilldmg: 15, cdr: 8 }, 6: { skilldmg: 25, effect: 'echo', effVal: 1 } } },
  nightprowler: { name: "야행자의 도구", pieces: ['weapon', 'offhand', 'gloves', 'boots', 'ring', 'amulet'], bonuses: { 2: { dex: 15, ias: 8 }, 4: { crit: 8, ms: 10 }, 6: { critDmg: 40, effect: 'critdmg', effVal: 1 } } },
};
/* ---------- gems + sockets (slot-dependent: a gem's effect depends on where it's socketed) ----------
   A socketed gem grants one EXISTING affix key, so it folds into recompute's bonus map for free.
   Storage: item.sockets = [null | {t,q}] (optional/additive); character.gems = { 'ruby:0': count } pouch. */
const GEMS = {
  ruby: { name: '루비', ico: '🔺', weapon: { key: 'fireDmg', vals: [5, 9, 14, 20, 28] }, gear: { key: 'hp', vals: [15, 28, 45, 68, 100] }, jewelry: { key: 'str', vals: [3, 6, 9, 13, 18] } },
  sapphire: { name: '사파이어', ico: '🔷', weapon: { key: 'coldDmg', vals: [5, 9, 14, 20, 28] }, gear: { key: 'mp', vals: [10, 20, 32, 48, 70] }, jewelry: { key: 'allRes', vals: [3, 6, 9, 13, 18] } },
  topaz: { name: '토파즈', ico: '🟡', weapon: { key: 'lightDmg', vals: [5, 9, 14, 20, 28] }, gear: { key: 'lightRes', vals: [5, 9, 14, 20, 28] }, jewelry: { key: 'eng', vals: [3, 6, 9, 13, 18] } },
  emerald: { name: '에메랄드', ico: '🟢', weapon: { key: 'poisonDmg', vals: [5, 9, 14, 20, 28] }, gear: { key: 'dex', vals: [3, 6, 9, 13, 18] }, jewelry: { key: 'poisonRes', vals: [5, 9, 14, 20, 28] } },
  amethyst: { name: '자수정', ico: '🟣', weapon: { key: 'dmg', vals: [3, 6, 10, 15, 22] }, gear: { key: 'armor', vals: [8, 16, 26, 40, 58] }, jewelry: { key: 'vit', vals: [3, 6, 9, 13, 18] } },
  diamond: { name: '다이아몬드', ico: '⬜', weapon: { key: 'critDmg', vals: [6, 11, 17, 25, 35] }, gear: { key: 'allRes', vals: [3, 6, 9, 13, 18] }, jewelry: { key: 'crit', vals: [2, 3, 4, 5, 7] } },
  onyx: { name: '오닉스', ico: '⬛', weapon: { key: 'crit', vals: [2, 3, 4, 5, 7] }, gear: { key: 'thorns', vals: [4, 8, 13, 20, 30] }, jewelry: { key: 'critDmg', vals: [6, 11, 17, 25, 35] } },
};
const GEM_KEYS = Object.keys(GEMS);
const GEM_TIER = ['금 간', '흠 있는', '', '완벽한', '최상급']; // q index 0..4; '' = plain name
const gemCat = s => s === 'weapon' ? 'weapon' : (s === 'ring' || s === 'amulet') ? 'jewelry' : 'gear';
const gemName = g => (GEM_TIER[g.q] ? GEM_TIER[g.q] + ' ' : '') + (GEMS[g.t] ? GEMS[g.t].name : g.t);
const gemEff = (slot, g) => GEMS[g.t] && GEMS[g.t][gemCat(slot)]; // {key,vals} this gem grants in this slot
const SOCKET_MAX = { weapon: 3, offhand: 2, armor: 3, helm: 2, gloves: 2, boots: 2, ring: 1, amulet: 1 };
function rollSockets(slot, rarity) {
  const max = SOCKET_MAX[slot] || 0; if (!max) return [];
  const p = ({ common: 0.10, magic: 0.22, rare: 0.38, set: 0.30, unique: 0.30 })[rarity] || 0;
  let n = 0; for (let i = 0; i < max; i++) { if (Math.random() < p) n++; else break; } // streak roll → most items 0-1
  return Array(n).fill(null);
}
// Pure helper (lives above the THREE marker → sandbox-testable). Folds socketed gems into a bonus map; the
// item's slot decides each gem's effect. Gems are flat — callers must NOT multiply by upFactor.
function gemFold(it, bonus) { if (!it.sockets) return; for (const g of it.sockets) { if (!g) continue; const e = gemEff(it.slot, g); if (e) bonus[e.key] = (bonus[e.key] || 0) + e.vals[g.q]; } }
let _itemId = 1;
function rollRarity() { const r = Math.random(); if (r < 0.40) return 'common'; if (r < 0.73) return 'magic'; if (r < 0.92) return 'rare'; if (r < 0.98) return 'set'; return 'unique'; }
let lootLuck = 0; // gear Magic Find, owned by recompute
let zoneLuck = 0; // depth-based zone luck, owned by setScale — composes additively with lootLuck in luckyRarity
const RARITY_LADDER = ['common', 'magic', 'rare', 'set', 'unique'];
/* ---- achievement journal (pure data + engine; browser-free — tests/achievements.test.js) ----
   _ev (15-combat.js) calls achBump on every watched event. Counters live in character.ach.n keyed by EVENT
   (shared by every def watching that event); unlocks in character.ach.u. Threshold defs (`n`) unlock when the
   counter reaches n; stat defs (`check`) re-test the character when their event fires. */
const ACH_DEFS = [
  { id: 'first_blood', name: '첫 처치', ico: '🗡️', ev: 'kill', n: 1, desc: '몬스터 1마리 처치.', reward: { gold: 50 } },
  { id: 'slayer', name: '학살자', ico: '⚔️', ev: 'kill', n: 100, desc: '몬스터 100마리 처치.', reward: { gold: 250 } },
  { id: 'butcher', name: '도살자', ico: '🪓', ev: 'kill', n: 1000, desc: '몬스터 1,000마리 처치.', reward: { gold: 1200, dust: 20 } },
  { id: 'exterminator', name: '박멸자', ico: '💀', ev: 'kill', n: 10000, desc: '몬스터 10,000마리 처치.', reward: { gold: 5000, dust: 80 } },
  { id: 'elite_hunter', name: '엘리트 사냥꾼', ico: '🏹', ev: 'killElite', n: 25, desc: '엘리트 25마리 처치.', reward: { gold: 400, dust: 10 } },
  { id: 'nemesis', name: '천적', ico: '☠️', ev: 'killElite', n: 250, desc: '엘리트 250마리 처치.', reward: { gold: 2000, dust: 40 } },
  { id: 'guardians_bane', name: '수호자의 파멸', ico: '👑', ev: 'killBoss', n: 1, desc: '던전 수호자 처치.', reward: { gold: 200 } },
  { id: 'boss_breaker', name: '보스 파괴자', ico: '🔨', ev: 'killBoss', n: 25, desc: '수호자 25마리 처치.', reward: { gold: 2500, dust: 50 } },
  { id: 'greedslayer', name: '탐욕 사냥꾼', ico: '👺', ev: 'goblin', n: 1, desc: '보물 고블린이 도망치기 전에 포획.', reward: { gold: 300 } },
  { id: 'bounty_hunter', name: '현상금 사냥꾼', ico: '📜', ev: 'bounty', n: 10, desc: '층 현상금 10회 완료.', reward: { gold: 600, dust: 15 } },
  { id: 'communer', name: '교감자', ico: '🔮', ev: 'shrine', n: 10, desc: '신단 10회 교감.', reward: { gold: 400 } },
  { id: 'treasure_seeker', name: '보물 탐색가', ico: '🧰', ev: 'chest', n: 5, desc: '던전 보물상자 5개 열기.', reward: { gold: 500, dust: 10 } },
  { id: 'spellslinger', name: '주문 사수', ico: '✨', ev: 'cast', n: 500, desc: '스킬 500회 시전.', reward: { dust: 20 } },
  { id: 'seasoned', name: '베테랑', ico: '🎖️', ev: 'levelup', check: ch => (ch.level || 1) >= 25, desc: '레벨 25 달성.', reward: { gold: 800 } },
  { id: 'paragon', name: '심연의 파라곤', ico: '🏅', ev: 'levelup', check: ch => (ch.level || 1) >= 50, desc: '레벨 50 달성.', reward: { gold: 3000, dust: 60 } },
  { id: 'delver', name: '탐험가', ico: '🕳️', ev: 'depth', check: ch => (ch.maxDepth || 0) >= 10, desc: '깊이 10 도달.', reward: { gold: 300 } },
  { id: 'abysswalker', name: '심연 보행자', ico: '🌑', ev: 'depth', check: ch => (ch.maxDepth || 0) >= 25, desc: '깊이 25 도달.', reward: { gold: 900, dust: 15 } },
  { id: 'voidtreader', name: '공허를 밟는 자', ico: '🌀', ev: 'depth', check: ch => (ch.maxDepth || 0) >= 50, desc: '깊이 50 도달.', reward: { gold: 2500, dust: 40 } },
  { id: 'bottomless', name: '바닥없는 자', ico: '😈', ev: 'depth', check: ch => (ch.maxDepth || 0) >= 100, desc: '깊이 100 도달.', reward: { gold: 6000, dust: 100 } },
  { id: 'chosen_by_fate', name: '운명의 선택', ico: '🌟', ev: 'pickupUnique', n: 1, desc: '유니크 아이템 획득.', reward: { dust: 15 } },
  { id: 'collector', name: '수집가', ico: '🟢', ev: 'pickupSet', n: 1, desc: '세트 아이템 획득.', reward: { dust: 10 } },
  { id: 'gemcutter', name: '보석 세공사의 친구', ico: '💎', ev: 'pickupGem', n: 10, desc: '보석 10개 획득.', reward: { gold: 350 } },
];
const ACH_EV_INDEX = {};
for (const d of ACH_DEFS) (ACH_EV_INDEX[d.ev] = ACH_EV_INDEX[d.ev] || []).push(d);
/** Pure: bump the counter for `ev` on ch.ach and return newly unlocked defs (empty when nothing fires). */
function achApplyEvent(ch, ev) {
  if (!ch || !ch.ach || !ch.ach.u || !ch.ach.n) return [];
  const defs = ACH_EV_INDEX[ev]; if (!defs) return [];
  ch.ach.n[ev] = (ch.ach.n[ev] || 0) + 1;
  const out = [];
  for (const d of defs) { if (ch.ach.u[d.id]) continue; const ok = d.check ? d.check(ch) : ch.ach.n[ev] >= (d.n || 1); if (ok) { ch.ach.u[d.id] = 1; out.push(d); } }
  return out;
}
/* Runtime glue for _ev: applies the event to the live character and pays/announces unlocks. Browser globals
   are typeof-guarded so this browser-free prefix file stays loadable in the test harness. */
function achBump(ev) {
  if (typeof character === 'undefined' || !character) return;
  const ups = achApplyEvent(character, ev);
  for (const d of ups) {
    if (typeof showMsg === 'function') showMsg('🏆 ' + d.name + ' — ' + d.desc);
    if (typeof sfx === 'function') sfx('level');
    if (d.reward) {
      if (d.reward.gold && typeof player !== 'undefined') { player.gold += d.reward.gold; if (typeof goldTxt !== 'undefined' && goldTxt) goldTxt.textContent = player.gold + ' G'; }
      if (d.reward.dust) character.materials = (character.materials || 0) + d.reward.dust;
    }
  }
  if (ups.length && typeof saveProgress === 'function') saveProgress(false);
}
function bumpRarity(r, n) { let i = RARITY_LADDER.indexOf(r); i = Math.min(RARITY_LADDER.length - 1, i + n); return RARITY_LADDER[i]; }
function depthQuality() { const d = (typeof depth === 'number' ? depth : 0); return (typeof zone !== 'undefined' && zone === 'dungeon') ? Math.min(0.4, d * 0.02) : 0; }
function luckyRarity(bonus) { let r = rollRarity(); const p = Math.min(0.8, (zoneLuck || 0) + (lootLuck || 0) + (bonus || 0)); if (p > 0) { if (Math.random() < p) r = bumpRarity(r, 1); if (Math.random() < p * 0.35) r = bumpRarity(r, 1); } return r; }
function buildUnique(def, ilvl) { const a = {}; for (const k in def.affixes) a[k] = def.affixes[k]; return { id: _itemId++, slot: def.slot, rarity: 'unique', ilvl, base: def.name, baseStat: def.base ? Math.round(def.base + ilvl * 0.8) : 0, affixes: a, effect: def.effect, effVal: def.effVal, effectDesc: def.desc, upgrade: 0, sockets: rollSockets(def.slot, 'unique'), name: '\u2726 ' + def.name }; }
function buildSetItem(sid, slot, ilvl) {
  const sd = SET_DEFS[sid]; const base = (slot === 'weapon') ? pickWeaponBase() : choice(BASE_NAMES[slot]);
  const item = { id: _itemId++, slot, rarity: 'set', ilvl, base, affixes: {}, baseStat: baseStatRoll(slot, ilvl, 'set'), set: sid, upgrade: 0, sockets: rollSockets(slot, 'set'), name: sd.name + ' ' + base };
  const pool = [...AFFIX_KEYS]; const [lo, hi] = RARITY_AFFIX.set; const cnt = randi(lo, hi); for (let i = 0; i < cnt; i++) { const k = pool.splice(randi(0, pool.length - 1), 1)[0]; item.affixes[k] = affixRoll(k, ilvl, 'set'); } return item;
}
function rollItem(ilvl, forceSlot, quality) {
  const slot = forceSlot || choice(SLOTS); let rarity = luckyRarity(depthQuality() + (quality || 0));
  if (rarity === 'unique') { const opts = UNIQUE_DEFS.filter(u => u.slot === slot); if (opts.length) return buildUnique(choice(opts), ilvl); rarity = 'rare'; }
  if (rarity === 'set') { const setOpts = []; for (const sid in SET_DEFS) { if (SET_DEFS[sid].pieces.includes(slot)) setOpts.push(sid); } if (setOpts.length) return buildSetItem(choice(setOpts), slot, ilvl); rarity = 'rare'; }
  const spec = slot === 'offhand' ? offhandSpec() : null;
  const base = (slot === 'weapon') ? pickWeaponBase() : spec ? choice(spec.names) : choice(BASE_NAMES[slot]);
  const item = { id: _itemId++, slot, rarity, ilvl, base, affixes: {}, baseStat: baseStatRoll(slot, ilvl, rarity), upgrade: 0, sockets: rollSockets(slot, rarity) };
  if (spec) applyOffhandKind(item, spec, ilvl, rarity);
  else if (slot === 'weapon' && !WEAPON_BASES.caster.includes(base) && Math.random() < 0.4) { item.h2 = true; item.baseStat = Math.round(item.baseStat * 1.4); } // two-handed roll: locks the offhand, hits ~40% harder
  const [lo, hi] = RARITY_AFFIX[rarity]; const count = randi(lo, hi); const pool = [...AFFIX_KEYS];
  for (let i = 0; i < count; i++) { if (!pool.length) break; const k = pool.splice(randi(0, pool.length - 1), 1)[0]; item.affixes[k] = affixRoll(k, ilvl, rarity); }
  if (rarity === 'rare' && ilvl >= 12 && Math.random() < 0.08) { const fx = choice(RARE_EFFECTS); item.effect = fx.effect; item.effVal = fx.effVal; item.effectDesc = '⚜ ' + fx.desc; } // legendary-touched rare
  let name = base;
  if (rarity === 'magic') { name = (Math.random() < .5 ? choice(PREFIX) + ' ' : '') + base; if (name === base) name = choice(SUFFIX) + ' ' + base; }
  else if (rarity === 'rare') { name = choice(PREFIX) + ' ' + choice(SUFFIX) + ' ' + base; }
  item.name = name; return item;
}
const UPGRADE_CAP = { common: 5, magic: 6, rare: 8, set: 8, unique: 10 };
/* The item helpers below are annotated with JSDoc as worked examples of the zero-build type-checking
   set up in jsconfig.json — the `Item` shape lives in types/game.d.ts. See types/README.md. */
/** @param {{upgrade?:number}|null} it @returns {number} */
const upFactor = it => 1 + ((it && it.upgrade) || 0) * 0.08;
/** @param {Item} it @returns {number} */
const upgradeMax = it => UPGRADE_CAP[it.rarity] || 5;
/** @param {*} it @returns {number} */
function itemScore(it) { if (!it) return 0; let s = it.baseStat * (it.slot === 'weapon' ? 3 : 2); const W = { dmg: 3, hp: 1, crit: 5, ias: 4, ms: 3, leech: 6, allstats: 5, thorns: 1, fireRes: 2, coldRes: 2, poisonRes: 2, lightRes: 2, allRes: 4, critDmg: 5, manaLeech: 4, leechAll: 7, burnOnHit: 5, bleedOnHit: 5, skilldmg: 6, activeskill: 6, skillranks: 25, fireDmg: 5, coldDmg: 5, lightDmg: 5, poisonDmg: 5, hpregen: 4, mpregen: 3, mf: 3, gf: 2, dodge: 5, flatDR: 6, cdr: 6, lifeOnHit: 4 }; for (const k in it.affixes) s += it.affixes[k] * (W[k] || 2); if (it.block) s += it.block * 3; if (it.sockets) for (const g of it.sockets) { if (g) { const e = gemEff(it.slot, g); if (e) s += e.vals[g.q] * (W[e.key] || 2); } else s += 3; } if (it.effect) s += 40; if (it.set) s += 15; return Math.round(s * upFactor(it)); }
const upgradeCost = it => Math.round(itemScore(it) * (1 + ((it.upgrade) || 0)) * 0.5) + 15;
const enchantAffixes = it => Object.keys(it.affixes || {}).filter(k => AFFIXES[k]);
const enchantCost = it => Math.round(itemScore(it) * 0.35) + 25;
/* ---- Crafting: salvage → Dust, and Reforge (reroll an item's rolled affixes, small chance to bump rarity) ----
   Reforge only touches common/magic/rare gear: set/unique affixes are hand-tuned identity, not rerollable. */
const DUST_VALUE = { common: 1, magic: 3, rare: 8, set: 15, unique: 25 };
const dustValue = it => DUST_VALUE[it.rarity] || 1;
const REFORGE_RARITY_UP = 0.15; /* chance a reforge promotes one tier first (common→magic→rare, capped at rare = more affix slots) */
const reforgeable = it => !!it && (it.rarity === 'common' || it.rarity === 'magic' || it.rarity === 'rare');
const reforgeCost = it => ({ dust: 4 + (RTIER[it.rarity] || 1) * 4, gold: Math.round(itemScore(it) * 0.15) + 15 });
function reforgeName(it) { const base = it.base || it.name; if (it.rarity === 'rare') return choice(PREFIX) + ' ' + choice(SUFFIX) + ' ' + base; if (it.rarity === 'magic') { let n = (Math.random() < 0.5 ? choice(PREFIX) + ' ' : '') + base; if (n === base) n = choice(SUFFIX) + ' ' + base; return n; } return base; }
/** Reroll it.affixes in place (fresh random set per the item's rarity), with REFORGE_RARITY_UP chance to bump one
 *  tier first. Preserves id/slot/ilvl/base/upgrade/enchant; rerolls baseStat to match (possibly new) rarity. */
function reforgeItem(it) {
  if (it.rarity !== 'rare' && Math.random() < REFORGE_RARITY_UP) it.rarity = bumpRarity(it.rarity, 1);
  if (it.slot !== 'offhand') { it.baseStat = baseStatRoll(it.slot, it.ilvl, it.rarity); if (it.h2) it.baseStat = Math.round(it.baseStat * 1.4); } /* offhand base+block are kind identity (applyOffhandKind); two-handers keep their damage premium */
  it.affixes = {};
  const [lo, hi] = RARITY_AFFIX[it.rarity]; const cnt = randi(lo, hi); const pool = [...AFFIX_KEYS];
  for (let i = 0; i < cnt; i++) { if (!pool.length) break; const k = pool.splice(randi(0, pool.length - 1), 1)[0]; it.affixes[k] = affixRoll(k, it.ilvl, it.rarity); }
  if (it.slot === 'offhand' && (it.ohKind === 'tome' || it.ohKind === 'quiver')) applyOffhandKind(it, { kind: it.ohKind }, it.ilvl, it.rarity); /* re-guarantee the kit affix the wipe above destroyed — a reforged common tome must never come out stat-less */
  it.name = reforgeName(it);
  return it;
}
/* ---- targeted Dust crafting (Smith · Reforge tab): per-affix surgery instead of the full random reroll ----
   Same rarity gate as reforge (common/magic/rare — set/unique affixes are hand-tuned identity). Dust-only. */
const rerollAffixCost = it => 8 + (RTIER[it.rarity] || 1) * 3;
const imbueAffixCost = it => 20 + (RTIER[it.rarity] || 1) * 5;
/** Reroll ONE affix's value in place — key kept, sibling affixes untouched. */
function rerollAffix(it, key) { if (!it || !it.affixes || !(key in it.affixes) || !AFFIXES[key]) return false; it.affixes[key] = affixRoll(key, it.ilvl, it.rarity); return true; }
/** Add (or replace) a CHOSEN affix at a best-of-two roll. */
function imbueAffix(it, key) { if (!it || !AFFIXES[key]) return false; if (!it.affixes) it.affixes = {}; it.affixes[key] = Math.max(affixRoll(key, it.ilvl, it.rarity), affixRoll(key, it.ilvl, it.rarity)); return true; }
/** @param {Item} it @returns {number} */
function sellValue(it) { return Math.max(2, Math.round(itemScore(it) * 0.5)); }
/** @param {Item} it @returns {number} */
function buyPrice(it) { return Math.round(sellValue(it) * 3) + 8; }
/** @param {LootFilter|null} lf @param {Item} it @returns {boolean} */
function lootPasses(lf, it) { if (!lf) return true; if (lf.rarity && lf.rarity[it.rarity] === false) return false; if (lf.slot && lf.slot[it.slot] === false) return false; if ((it.ilvl || 0) < (lf.minIlvl || 0) && it.rarity !== 'set' && it.rarity !== 'unique') return false; return true; }
const POTION_PRICE = 25, MANA_POTION_PRICE = 20;
