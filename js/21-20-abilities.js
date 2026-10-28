function renderAbilities() {
  const host = document.getElementById('abilTree'); if (!host || !character) return;
  if (!Array.isArray(character.loadout) || character.loadout.length !== 6) character.loadout = defaultLoadout(character);
  const owned = unlockedActives();
  if (!_runeViewId || (_runeViewId !== 'strike' && owned.indexOf(_runeViewId) < 0)) _runeViewId = character.loadout[_abilSlotSel] || owned[0] || 'strike';
  const ap = character.abilityPoints || 0;
  const note = document.getElementById('abilNote'); if (note) note.textContent = `어빌리티 포인트 ${ap}개 · 어빌리티를 해금하거나 룬 트리에 사용하세요`;
  const slotLab = ['LMB', 'RMB', slotKeyLabel(2), slotKeyLabel(3), slotKeyLabel(4), slotKeyLabel(5)];
  let h = '<div class="abilSlots">';
  for (let i = 0; i < 6; i++) {
    const id = character.loadout[i], def = id ? SKILLDEFS[id] : null;
    h += `<div class="abilSlot${i === 0 ? ' basic' : ''}${i === _abilSlotSel ? ' sel' : ''}" data-slot="${i}"><span class="slk">${slotLab[i]}</span>${def ? `<span class="sli">${def.ico}</span>` : '<span class="sle">＋</span>'}</div>`;
  }
  h += '</div>';
  h += `<div class="abilBar"><span class="abilHint"><b>${slotLab[_abilSlotSel]}</b> 슬롯에 스킬을 넣거나, 슬롯을 클릭해 룬 트리를 보세요.</span><span id="runeReset">↺ 모든 룬 환급 (무료)</span></div>`;
  h += '<div class="abilPick">';
  const acts = (CLASS_ACTIVES[character.class] || {});
  const list = classAbilities();
  for (const id of owned) if (list.indexOf(id) < 0) list.push(id); // keep any owned active not in the class list assignable
  for (const id of list) {
    const def = SKILLDEFS[id]; if (!def) continue;
    const req = acts[id] || def.req || 1;
    const ownedSkill = (character.skills[id] || 0) >= 1, onBar = character.loadout.indexOf(id) >= 0;
    let cls = 'abilChip', tag = '';
    if (ownedSkill) { if (onBar) cls += ' on'; }
    else if (player.level >= req) { cls += ' unlock'; tag = '<span class="ct">해금 · 1 pt</span>'; }
    else { cls += ' locked'; tag = `<span class="ct">Lv ${req}</span>`; }
    h += `<div class="${cls}" data-skill="${id}">${def.ico} ${def.name}${tag}</div>`;
  }
  h += '</div>';
  // Techniques: the classic trained passives (pre-v49 skill system, still consumed by recompute) — finally rankable again
  const techs = Object.keys(SKILLDEFS).filter(tid => SKILLDEFS[tid].type === 'passive');
  if (techs.length) {
    h += '<div class="ptsNote" style="margin-top:10px">기법 — 단련하는 패시브 · 랭크당 1 pt</div><div class="abilPick">';
    for (const tid of techs) { const td = SKILLDEFS[tid]; const r = character.skills[tid] || 0, max = td.maxRank || 1; const lockd = player.level < (td.req || 1); h += `<div class="abilChip${r >= max ? ' on' : lockd ? ' locked' : r > 0 ? ' on' : ' unlock'}" data-tech="${tid}">${td.ico} ${td.name}<span class="ct">${lockd ? 'Lv ' + td.req : r + '/' + max}</span></div>`; }
    h += '</div>';
  }
  h += '<div id="runeWrap"></div>';
  host.innerHTML = h;
  host.querySelectorAll('.abilSlot').forEach(el => { const i = +el.dataset.slot; el.onclick = () => { if (i === 0) { _runeViewId = 'strike'; } else { _abilSlotSel = i; if (character.loadout[i]) _runeViewId = character.loadout[i]; } renderAbilities(); }; });
  host.querySelectorAll('.abilChip[data-skill]').forEach(el => { const id = el.dataset.skill; el.onmouseenter = ev => { tooltip.innerHTML = skillTip(id); tooltip.style.display = 'block'; moveTip(ev); }; el.onmousemove = moveTip; el.onmouseleave = () => tooltip.style.display = 'none'; el.onclick = () => { if ((character.skills[id] || 0) >= 1) { setLoadoutSlot(_abilSlotSel, id); _runeViewId = id; saveProgress(false); renderAbilities(); } else { unlockAbility(id); } }; });
  host.querySelectorAll('.abilChip[data-tech]').forEach(el => { const tid = el.dataset.tech; const td = SKILLDEFS[tid]; el.onmouseenter = ev => { const r = character.skills[tid] || 0; tooltip.innerHTML = `<div class="tname">${td.ico} ${td.name}</div><div class="tslot">기법 · 랭크 ${r}/${td.maxRank || 1}</div><div style="margin-top:4px">${td.desc}</div><div style="color:#8a7a5a;font-size:11px;margin-top:3px">클릭하여 단련 — 랭크당 어빌리티 포인트 1개.</div>`; tooltip.style.display = 'block'; moveTip(ev); }; el.onmousemove = moveTip; el.onmouseleave = () => tooltip.style.display = 'none'; el.onclick = () => rankUpTech(tid); });
  const rr = document.getElementById('runeReset'); if (rr) rr.onclick = refundRunes;
  renderRuneView();
}
function renderRuneView() {
  const wrap = document.getElementById('runeWrap'); if (!wrap) return; const id = _runeViewId, tree = id && SKILL_RUNES[id];
  if (!tree) { wrap.innerHTML = `<div class="abilHint" style="text-align:center;padding:20px">${id === 'strike' ? '기본 공격 — 항상 왼쪽 클릭에 배정되어 있으며, 사용할 룬이 없습니다.' : '룬 트리를 보려면 스킬을 선택하세요.'}</div>`; return; }
  if ((character.skills[id] || 0) < 1) { wrap.innerHTML = `<div class="abilHint" style="text-align:center;padding:20px">룬을 사용하려면 이 어빌리티를 먼저 해금하세요.</div>`; return; }
  const def = SKILLDEFS[id]; rT = { x: 0, y: -20, s: 1 };
  const curR = character.skills[id] || 0, maxR = def.maxRank || 1, upCost = rankUpCost(curR);
  const rankBit = maxR > 1 ? ` <span style="color:#8a7a5a">· 랭크 ${curR}/${maxR}</span>` + (curR < maxR ? ` <span class="rbtn${(character.abilityPoints || 0) >= upCost ? '' : ' dis'}" id="rankUpBtn" style="margin-left:8px;font-size:11px;padding:2px 8px">랭크 업 · ${upCost} pt</span>` : ' <span style="color:#5ad65a">MAX</span>') : '';
  wrap.innerHTML = `<div class="ptsNote" style="margin:8px 0 4px">${def.ico} ${def.name} — 룬 트리${rankBit}</div><div id="rVp" style="position:relative;width:100%;height:calc(100vh - 400px);min-height:240px;overflow:hidden;border:1px solid #2a2218;border-radius:8px;background:radial-gradient(circle at 50% 45%,#161109,#080604);cursor:grab"><svg id="rSvg" width="100%" height="100%" viewBox="-200 -150 400 380"><defs><filter id="rg" x="-90%" y="-90%" width="280%" height="280%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><g id="rG"></g></svg></div>`;
  const rub = document.getElementById('rankUpBtn'); if (rub) rub.onclick = () => rankUpAbility(id);
  buildRuneSvg(id); attachRuneEvents();
}
function applyR() { const g = document.getElementById('rG'); if (g) g.setAttribute('transform', `scale(${rT.s}) translate(${rT.x} ${rT.y})`); }
function attachRuneEvents() {
  const vp = document.getElementById('rVp'); if (!vp) return; let drag = false, lx = 0, ly = 0;
  vp.onmousedown = e => { drag = true; lx = e.clientX; ly = e.clientY; vp.style.cursor = 'grabbing'; };
  vp.onmousemove = e => { if (!drag) return; const dx = e.clientX - lx, dy = e.clientY - ly; lx = e.clientX; ly = e.clientY; const r = vp.getBoundingClientRect(); rT.x += dx / r.width * 400 / rT.s; rT.y += dy / r.height * 380 / rT.s; applyR(); };
  vp.onmouseup = () => { drag = false; vp.style.cursor = 'grab'; }; vp.onmouseleave = () => { drag = false; vp.style.cursor = 'grab'; };
  vp.onwheel = e => { e.preventDefault(); rT.s = clamp(rT.s * (e.deltaY < 0 ? 1.12 : 0.89), 0.6, 2.2); applyR(); };
}
function buildRuneSvg(id) {
  const g = document.getElementById('rG'); if (!g) return; const tree = SKILL_RUNES[id]; const alloc = (character.skillRunes && character.skillRunes[id]) || {};
  let edges = '', circles = '', drawn = new Set();
  for (const a in tree.adj) for (const b of tree.adj[a]) { const key = a < b ? a + '|' + b : b + '|' + a; if (drawn.has(key)) continue; drawn.add(key); const na = tree.nodes[a], nb = tree.nodes[b]; if (!na || !nb) continue; const on = (alloc[a] > 0) && (alloc[b] > 0); edges += `<line x1="${na.x}" y1="${na.y}" x2="${nb.x}" y2="${nb.y}" stroke="${on ? '#c4a060' : '#2a241c'}" stroke-width="${on ? 3 : 2}"/>`; }
  for (const nid in tree.nodes) {
    const n = tree.nodes[nid]; const ranks = alloc[nid] || 0; const allocated = ranks > 0; const can = canAllocRune(id, nid);
    const r = n.type === 'keystone' ? 14 : n.type === 'notable' ? 11 : 7;
    const fill = allocated ? (n.type === 'keystone' ? '#ffcf3a' : n.type === 'notable' ? '#e6b84d' : '#c8ad7a') : '#16110a';
    const stroke = allocated ? '#ffe9a8' : can ? '#e6b84d' : '#352c20';
    circles += `<circle data-rn="${nid}" cx="${n.x}" cy="${n.y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${can ? 3 : 2}" ${can ? 'filter="url(#rg)"' : ''} style="cursor:pointer"/>`;
    circles += `<text x="${n.x}" y="${n.y - r - 3}" text-anchor="middle" fill="#cdb084" font-size="8.5" font-family="'Noto Serif KR',Georgia" style="pointer-events:none">${n.label}${n.max > 1 ? ' ' + ranks + '/' + n.max : ''}</text>`;
  }
  g.innerHTML = edges + circles; applyR();
  g.querySelectorAll('[data-rn]').forEach(el => { const nid = el.getAttribute('data-rn'), n = tree.nodes[nid]; el.onmouseenter = e => { tooltip.innerHTML = runeTip(n, id, nid); tooltip.style.display = 'block'; moveTip(e); }; el.onmousemove = moveTip; el.onmouseleave = () => tooltip.style.display = 'none'; el.onclick = ev => { ev.stopPropagation(); runeClick(id, nid); }; });
}
function runeTip(node, id, nid) {
  const ranks = (character.skillRunes && character.skillRunes[id] && character.skillRunes[id][nid]) || 0; const m = node.mod || {};
  const t = node.type === 'keystone' ? '핵심' : node.type === 'notable' ? '주요 룬' : '룬'; const per = node.max > 1 ? ' / 랭크' : '';
  let lines = '';
  if (m.dmgMult) lines += `<div style="color:#b8a888">피해 +${Math.round(m.dmgMult * 100)}%${per}</div>`;
  if (m.cdrMult) lines += `<div style="color:#b8a888">재사용 대기시간 ${Math.round(m.cdrMult * 100)}%${per}</div>`;
  if (m.costMult) lines += `<div style="color:#b8a888">마나 소모 ${Math.round(m.costMult * 100)}%${per}</div>`;
  if (m.addProj) lines += `<div style="color:#b8a888">투사체/튕김 +${m.addProj}${per}</div>`;
  if (m.addHits) lines += `<div style="color:#b8a888">타격 +${m.addHits}${per}</div>`;
  if (m.addRadius) lines += `<div style="color:#b8a888">범위 +${m.addRadius}${per}</div>`;
  if (m.addSlow) lines += `<div style="color:#b8a888">강화된 둔화${per}</div>`;
  if (m.addDuration) lines += `<div style="color:#b8a888">지속시간 +${(m.addDuration / 1000).toFixed(1)}초${per}</div>`;
  if (m.pierce) lines += `<div style="color:#b8a888">관통 +${m.pierce}${per}</div>`;
  if (node.flags) for (const f of node.flags) { const fi = RUNE_FLAG_INFO[f]; if (fi) lines += `<div style="color:#9f6aff">${fi[1]}</div>`; }
  let foot = '';
  if (player.level < (node.lvlreq || 0)) foot = `<div style="color:#d07f7f;font-size:11px;margin-top:3px">레벨 ${node.lvlreq} 필요</div>`;
  else if (node.excl) foot = `<div style="color:#8a7a5a;font-size:11px;margin-top:3px">상호 배타 — 이 그룹에서 하나만 선택 가능</div>`;
  return `<div class="tname" style="color:${node.type === 'keystone' ? '#ffcf3a' : '#e6b84d'}">${node.label}</div><div class="tslot">${t} · ${node.cost} pt${node.cost > 1 ? 's' : ''}${node.max > 1 ? ' · ' + ranks + '/' + node.max : ''}</div>${lines || '<div style="color:#8a7a5a">연결 노드</div>'}${foot}`;
}
function runeClick(id, nid) {
  const tree = SKILL_RUNES[id]; if (!tree) return; const node = tree.nodes[nid];
  if (!canAllocRune(id, nid)) { if (player.level < (node.lvlreq || 0)) showMsg('레벨 ' + node.lvlreq + ' 필요'); else if ((character.abilityPoints || 0) < node.cost) showMsg('어빌리티 포인트가 부족합니다'); else if (node.excl) showMsg('이 슬롯의 룬은 이미 선택했습니다'); return; }
  if (!character.skillRunes[id]) character.skillRunes[id] = {};
  character.skillRunes[id][nid] = (character.skillRunes[id][nid] || 0) + 1; character.abilityPoints -= node.cost;
  invalidateRunes(); buildRuneSvg(id); renderSkillbar(); updatePips();
  const ap = character.abilityPoints || 0, note = document.getElementById('abilNote'); if (note) note.textContent = `어빌리티 포인트 ${ap}개 · 슬롯을 클릭한 뒤 배정할 스킬을 클릭하세요`;
  sfx('potion'); saveProgress(false);
}
function refundRunes() {
  let refunded = 0; for (const sid in (character.skillRunes || {})) { const tree = SKILL_RUNES[sid]; if (!tree) continue; for (const nid in character.skillRunes[sid]) { const node = tree.nodes[nid]; if (node) refunded += (character.skillRunes[sid][nid] || 0) * node.cost; } }
  character.skillRunes = {}; character.abilityPoints = (character.abilityPoints || 0) + refunded; invalidateRunes(); renderSkillbar(); updatePips(); renderAbilities(); showMsg('어빌리티 포인트 ' + refunded + '개 환급됨'); saveProgress(false);
}
let vendorStock = [], vendorTab = 'buy', vendorTier = 1, vendorStockTier = 1, _relicOfDay = null;
function refreshVendor(tier) { tier = tier || 1; vendorStockTier = tier; vendorStock = []; const bump = (tier - 1) * 7, q = tier >= 2 ? 0.35 : 0; for (let i = 0; i < 6; i++) vendorStock.push(rollItem(Math.max(1, player.level + randi(-1, 2)) + bump, null, q)); if (tier >= 2) _relicOfDay = buildUnique(choice(UNIQUE_DEFS), Math.max(3, player.level + 2)); }
function _giveBought(it) { if (character.inventory.length >= character.invMax) { showMsg('소지품이 가득 찼습니다'); return false; } character.inventory.push(it); showMsg(it.name + ' 획득'); if (invOpen) renderInv(); updatePips(); return true; }
function renderVendor() {
  if (invOpen) renderInv(); /* keep the paired inventory pane in sync after a buy/sell */
  const body = document.getElementById('vendorBody'); body.innerHTML = `<div style="color:#ffe27a;margin-bottom:10px">보유 골드: ${player.gold} <span style="color:#b9a6ff">· ✦ 가루 ${character.materials || 0}</span></div>`;
  if (vendorTier >= 2) body.innerHTML += `<div style="color:#ff6ad0;margin-bottom:8px;font-size:13px">✦ 특별한 상품 — 더 희귀하고, 아이템 레벨이 높고, 값은 비쌉니다.</div>`;
  if (vendorTab === 'buy') {
    body.innerHTML += `<div style="color:#9a8a6a;margin-bottom:8px;font-size:13px">포션이 필요한가요? 마을의 🔥 가마솥에서 무료로 보충하세요.</div>`;
    if (vendorTier >= 2) { /* the Exotic Merchant is the Dust shop — the sink the salvage economy feeds. NOTE: appended via createElement AFTER every innerHTML+= write (innerHTML re-parses the body and would strip these handlers). */
      const dust = character.materials || 0;
      if (!_relicOfDay) _relicOfDay = buildUnique(choice(UNIQUE_DEFS), Math.max(3, player.level + 2));
      const caches = [
        { ico: '🟠', name: '특별한 궤짝', sub: '무작위 유니크 1개', cost: 120, act: () => _giveBought(buildUnique(choice(UNIQUE_DEFS), Math.max(3, player.level + randi(1, 3)))) },
        { ico: '🟢', name: '세트 궤짝', sub: '무작위 세트 부위 1개', cost: 80, act: () => { const sid = choice(Object.keys(SET_DEFS)); return _giveBought(buildSetItem(sid, choice(SET_DEFS[sid].pieces), Math.max(3, player.level + randi(1, 3)))); } },
        { ico: '💎', name: '보석 궤짝', sub: '등급 있는 보석 3개', cost: 45, act: () => { character.gems = character.gems || {}; for (let i = 0; i < 3; i++) { const g = choice(GEM_KEYS) + ':' + randi(1, 2); character.gems[g] = (character.gems[g] || 0) + 1; } showMsg('보석 3개를 챙겼습니다'); if (invOpen) renderInv(); return true; } },
      ];
      caches.forEach((c, i) => { const row = document.createElement('div'); row.className = 'row'; row.innerHTML = `<div class="ric">${c.ico}</div><div class="rname">${c.name} <span style="color:#8a7a5a;font-size:11px">(${c.sub})</span></div><div class="rprice" style="color:#b9a6ff">${c.cost}✦</div><div class="rbtn${dust >= c.cost ? '' : ' dis'}" data-cache="${i}">구입</div>`; row.querySelector('.rbtn').onclick = () => { if ((character.materials || 0) < c.cost) return; if (!c.act()) return; character.materials -= c.cost; sfx('gold'); renderVendor(); updatePips(); saveProgress(false); }; body.appendChild(row); });
      { const row = document.createElement('div'); row.className = 'row'; row.style.background = 'rgba(40,20,40,.4)'; row.innerHTML = `<div class="ric">☀️</div><div class="rname rc-unique">오늘의 유물: ${_relicOfDay.name} <span style="color:#8a7a5a;font-size:11px">(재입고로 교체)</span></div><div class="rprice" style="color:#b9a6ff">200✦</div><div class="rbtn${(character.materials || 0) >= 200 ? '' : ' dis'}" data-relic="1">구입</div>`; bindTip(row.querySelector('.rname'), _relicOfDay); row.querySelector('.rbtn').onclick = () => { if ((character.materials || 0) < 200 || !_relicOfDay) return; if (!_giveBought(_relicOfDay)) return; character.materials -= 200; _relicOfDay = buildUnique(choice(UNIQUE_DEFS), Math.max(3, player.level + 2)); sfx('gold'); renderVendor(); updatePips(); saveProgress(false); }; body.appendChild(row); }
    }
    const reCost = 40 + player.level * 8; const reRow = document.createElement('div'); reRow.className = 'row'; reRow.innerHTML = `<div class="ric">🔄</div><div class="rname">상품 재입고 <span style="color:#8a7a5a;font-size:11px">(상인의 아이템을 다시 뽑습니다)</span></div><div class="rprice">${reCost} g</div><div class="rbtn${player.gold >= reCost ? '' : ' dis'}" id="restockBtn">재입고</div>`; body.appendChild(reRow);
    document.getElementById('restockBtn').onclick = () => { if (player.gold < reCost) return; player.gold -= reCost; refreshVendor(vendorTier); goldTxt.textContent = player.gold + ' g'; renderVendor(); saveProgress(false); }; /* pass the active tier so a paid reroll at an Exotic (tier ≥ 2) merchant keeps its premium stock instead of silently dropping to tier 1 */
    vendorStock.forEach((it, idx) => { const price = buyPrice(it); const row = document.createElement('div'); row.className = 'row'; row.innerHTML = `<div class="ric">${SLOT_ICON[it.slot]}</div><div class="rname rc-${it.rarity}">${it.name}</div><div class="rprice">${price} g</div><div class="rbtn${player.gold >= price && character.inventory.length < character.invMax ? '' : ' dis'}" data-buy="${idx}">구입</div>`; bindTip(row.querySelector('.rname'), it); body.appendChild(row); });
    body.querySelectorAll('[data-buy]').forEach(b => b.onclick = () => { const idx = +b.dataset.buy; const it = vendorStock[idx]; const price = buyPrice(it); if (player.gold < price || character.inventory.length >= character.invMax) return; player.gold -= price; character.inventory.push(it); vendorStock.splice(idx, 1); goldTxt.textContent = player.gold + ' g'; renderVendor(); updatePips(); saveProgress(false); });
  } else if (vendorTab === 'sell') {
    if (!character.inventory.length) body.innerHTML += `<div style="color:#6a5a44">소지품이 비어 있습니다.</div>`;
    /* selling pays GOLD ONLY — Dust comes from salvaging at the Smith, so the two currencies have distinct
       faucets and salvage is never strictly dominated. Locked (🔒) items are excluded from every sell path. */
    const isJunk = it => (it.rarity === 'common' || it.rarity === 'magic') && !it.lock;
    const sellable = character.inventory.filter(it => !it.lock);
    const junkTotal = character.inventory.filter(isJunk).reduce((s, it) => s + sellValue(it), 0), allTotal = sellable.reduce((s, it) => s + sellValue(it), 0), junkCnt = character.inventory.filter(isJunk).length;
    if (character.inventory.length) {
      const bar = document.createElement('div'); bar.className = 'row'; bar.style.background = 'rgba(40,30,16,.55)';
      bar.innerHTML = `<div class="rname" style="flex:1">일괄 판매 <span style="color:#8a7a5a;font-size:11px">(🔒 잠긴 아이템은 유지 · ✦ 가루는 대장장이에서 분해)</span></div><div class="rbtn${junkCnt ? '' : ' dis'}" id="sellJunk">잡동사니 판매 (${junkTotal}g)</div><div class="rbtn${allTotal ? '' : ' dis'}" id="sellAll" style="margin-left:6px;border-color:#7a3a28">모두 판매 (${allTotal}g)</div>`; body.appendChild(bar);
      const sj = document.getElementById('sellJunk'); if (sj) sj.onclick = () => { if (!junkCnt) return; player.gold += junkTotal; character.inventory = character.inventory.filter(it => !isJunk(it)); goldTxt.textContent = player.gold + ' g'; showMsg('잡동사니 판매: +' + junkTotal + 'g'); renderVendor(); updatePips(); saveProgress(false); };
      const sa = document.getElementById('sellAll'); if (sa) sa.onclick = () => { if (!allTotal) return; if (!confirm('소지품 아이템 ' + sellable.length + '개를 ' + allTotal + 'g에 판매할까요?\n레어, 세트, 유니크 장비도 포함됩니다 (잠긴 아이템은 유지).')) return; player.gold += allTotal; character.inventory = character.inventory.filter(it => it.lock); goldTxt.textContent = player.gold + ' g'; showMsg('모두 판매: +' + allTotal + 'g'); renderVendor(); updatePips(); saveProgress(false); };
    }
    character.inventory.forEach((it, idx) => { const price = sellValue(it); const row = document.createElement('div'); row.className = 'row'; row.innerHTML = `<div class="ric">${SLOT_ICON[it.slot]}</div><div class="rname rc-${it.rarity}">${it.lock ? '🔒 ' : ''}${it.name}</div><div class="rprice">${price} g</div><div class="rbtn${it.lock ? ' dis' : ''}" data-sell="${idx}">판매</div>`; bindTip(row.querySelector('.rname'), it); body.appendChild(row); });
    body.querySelectorAll('[data-sell]').forEach(b => b.onclick = () => { const idx = +b.dataset.sell; const it = character.inventory[idx]; if (!it || it.lock) return; player.gold += sellValue(it); character.inventory.splice(idx, 1); goldTxt.textContent = player.gold + ' g'; renderVendor(); updatePips(); saveProgress(false); });
  }
}
function setVendorTab(t) { if (t !== 'sell') t = 'buy'; vendorTab = t;[['Buy', '구입'], ['Sell', '판매']].forEach(([n, kn]) => { const el = document.getElementById('tab' + n); el.textContent = kn; el.classList.toggle('on', t === n.toLowerCase()); }); renderVendor(); }
document.getElementById('tabBuy').onclick = () => setVendorTab('buy');
document.getElementById('tabSell').onclick = () => setVendorTab('sell');
document.getElementById('smithTabUpgrade').onclick = () => setSmithTab('upgrade');
document.getElementById('smithTabReforge').onclick = () => setSmithTab('reforge');
document.getElementById('smithTabSocket').onclick = () => setSmithTab('socket');
document.getElementById('smithTabSalvage').onclick = () => setSmithTab('salvage');
document.getElementById('jewelerTabBuy').onclick = () => setJewelerTab('buy');
document.getElementById('jewelerTabReroll').onclick = () => setJewelerTab('reroll');
document.getElementById('jewelerTabSocket').onclick = () => setJewelerTab('socket');
document.getElementById('jewelerTabCombine').onclick = () => setJewelerTab('combine');
document.querySelectorAll('#invTabs .tab').forEach(el => el.onclick = () => setInvTab(el.dataset.invtab));
let stashTab = 0; // 3 tabs × 80 slots — the stash stays ONE flat array; tabs are slice views (save-compatible)
function renderStash() {
  const bp = document.getElementById('bpGrid'), st = document.getElementById('stGrid'); bp.innerHTML = ''; st.innerHTML = '';
  const lockBadge = it => (it && it.lock ? '<span style="position:absolute;top:1px;right:3px;font-size:9px">🔒</span>' : '');
  const sn = document.getElementById('stashNote'); if (sn) { let gems = 0; for (const k in (character.gems || {})) gems += character.gems[k]; sn.textContent = `창고 ${character.stash.length}/${character.stashMax} · ✦ 가루 ${character.materials || 0} · 💎 보석 ${gems}개`; }
  const tabs = document.getElementById('stashTabs');
  if (tabs) { tabs.innerHTML = ''; const pages = Math.ceil(STASH_CAP / 80); for (let t = 0; t < pages; t++) { const b = document.createElement('div'); b.className = 'tab' + (stashTab === t ? ' on' : ''); const lo = t * 80; b.textContent = '탭 ' + (t + 1) + (character.stashMax <= lo ? ' 🔒' : ''); b.onclick = () => { stashTab = t; renderStash(); }; tabs.appendChild(b); } }
  for (let i = 0; i < character.invMax; i++) { const it = character.inventory[i]; const c = document.createElement('div'); c.className = 'cell' + (it ? ' r-' + it.rarity : ''); c.innerHTML = it ? SLOT_ICON[it.slot] + lockBadge(it) : ''; if (it) { bindTip(c, it); c.onclick = () => { if (character.stash.length >= character.stashMax) { showMsg('창고가 가득 찼습니다'); return; } character.stash.push(it); character.inventory.splice(i, 1); renderStash(); saveProgress(false); }; c.oncontextmenu = e => { e.preventDefault(); it.lock = !it.lock; renderStash(); saveProgress(false); }; } bp.appendChild(c); }
  const start = stashTab * 80;
  for (let k = 0; k < 80; k++) {
    const i = start + k; const c = document.createElement('div');
    if (i >= character.stashMax) { c.className = 'cell'; c.style.opacity = '0.22'; c.title = '아래에서 창고 칸을 확장하세요'; st.appendChild(c); continue; }
    const it = character.stash[i]; c.className = 'cell' + (it ? ' r-' + it.rarity : ''); c.innerHTML = it ? SLOT_ICON[it.slot] + lockBadge(it) : '';
    if (it) { bindTip(c, it); c.onclick = () => { if (character.inventory.length >= character.invMax) { showMsg('소지품이 가득 찼습니다'); return; } character.inventory.push(it); character.stash.splice(i, 1); renderStash(); updatePips(); saveProgress(false); }; c.oncontextmenu = e => { e.preventDefault(); it.lock = !it.lock; renderStash(); saveProgress(false); }; }
    st.appendChild(c);
  }
  const sb = document.getElementById('slotBuyBar'); if (sb) {
    const bpCost = 100 + (character.invMax - 40) * 25, stCost = 100 + (character.stashMax - 40) * 25, bpMax = character.invMax >= INV_CAP, stMax = character.stashMax >= STASH_CAP;
    sb.innerHTML = `<div class="row" style="flex:1"><div class="rname">🎒 소지품 ${character.invMax}/${INV_CAP}</div>${bpMax ? '<div class="rprice">MAX</div>' : `<div class="rprice">${bpCost} g</div><div class="rbtn${player.gold >= bpCost ? '' : ' dis'}" id="buyBp">+4</div>`}</div>` +
      `<div class="row" style="flex:1"><div class="rname">📦 창고 ${character.stashMax}/${STASH_CAP}</div>${stMax ? '<div class="rprice">MAX</div>' : `<div class="rprice">${stCost} g</div><div class="rbtn${player.gold >= stCost ? '' : ' dis'}" id="buySt">+4</div>`}</div>`;
    const bbp = document.getElementById('buyBp'); if (bbp) bbp.onclick = () => { if (player.gold < bpCost || character.invMax >= INV_CAP) return; player.gold -= bpCost; character.invMax = Math.min(INV_CAP, character.invMax + 4); goldTxt.textContent = player.gold + ' g'; renderStash(); saveProgress(false); };
    const bst = document.getElementById('buySt'); if (bst) bst.onclick = () => { if (player.gold < stCost || character.stashMax >= STASH_CAP) return; player.gold -= stCost; character.stashMax = Math.min(STASH_CAP, character.stashMax + 4); goldTxt.textContent = player.gold + ' g'; renderStash(); saveProgress(false); };
  }
}

let _fps = 60, _errCount = 0, _lastErr = '', _lastErrAt = 0, _frame = 0;
