function closeAll() { shopAnchor = null; invOpen = skillOpen = vendorOpen = stashOpen = smithOpen = enchantOpen = gambleOpen = jewelerOpen = alchemistOpen = false;[invPanel, statsPanel, skillPanel, vendorPanel, stashPanel, smithPanel, enchantPanel, gamblePanel, jewelerPanel, alchemistPanel].forEach(p => p.style.display = 'none'); tooltip.style.display = 'none'; }
/* Diablo-3 dual-pane: shops dock left and open the inventory on the right so gear + trading sit side by side.
   Only one shop is open at a time, so renderOpenShop() refreshes whichever it is — call it after any
   inventory mutation from the right pane to keep the shop's item indices fresh (see equipFromInv/unequip). */
function openShopWithInv() { invOpen = true; invPanel.style.display = 'block'; statsPanel.style.display = 'block'; setInvTab('items'); }
function renderOpenShop() { if (vendorOpen) renderVendor(); else if (smithOpen) renderSmith(); else if (enchantOpen) renderEnchanter(); else if (gambleOpen) renderGamble(); else if (jewelerOpen) renderJeweler(); else if (alchemistOpen) renderAlchemist(); }
function toggleInv() { const o = !invOpen; closeAll(); if (o) { invOpen = true; invPanel.style.display = 'block'; statsPanel.style.display = 'block'; setInvTab('items'); } }
let _skTab = 'abilities';
function setSkillTab(name) {
  _skTab = name;
  document.querySelectorAll('#skillTabs .tab').forEach(t => t.classList.toggle('on', t.dataset.sktab === name));
  document.querySelectorAll('#skillPanel .skPane').forEach(p => p.style.display = (p.dataset.skpane === name) ? 'block' : 'none');
  if (name === 'forest') renderSkillTree(); else if (name === 'journal') renderJournal(); else renderAbilities();
}
function renderJournal() {
  const host = document.getElementById('journalBody'); if (!host || !character) return;
  const a = character.ach || { u: {}, n: {} };
  const done = ACH_DEFS.filter(d => a.u[d.id]).length;
  const note = document.getElementById('journalNote'); if (note) note.textContent = ACH_DEFS.length + '개 중 ' + done + '개 달성 — 해금할 때마다 골드 또는 ✦ 가루를 줍니다.';
  let h = '';
  for (const d of ACH_DEFS) {
    const un = !!a.u[d.id]; const need = d.n || 1; const cur = un ? need : Math.min(a.n[d.ev] || 0, need);
    const pct = d.check ? (un ? 100 : 0) : Math.round(cur / need * 100);
    const rew = d.reward ? ((d.reward.gold ? '+' + d.reward.gold + 'g ' : '') + (d.reward.dust ? '+' + d.reward.dust + '✦' : '')) : '';
    h += `<div class="row" style="align-items:center${un ? '' : ';opacity:.62'}">
      <div class="ric" style="font-size:22px">${d.ico}</div>
      <div style="flex:1;min-width:0">
        <div class="rname" style="color:${un ? '#ffe27a' : '#c8b89a'}">${d.name} ${un ? '✓' : ''}</div>
        <div style="color:#8a7a5a;font-size:11px">${d.desc}${d.check ? '' : ' · ' + cur + '/' + need}</div>
        <div style="height:4px;background:rgba(0,0,0,.45);border-radius:2px;margin-top:3px"><div style="height:100%;width:${pct}%;background:${un ? '#5ad65a' : '#8a6a2a'};border-radius:2px"></div></div>
      </div>
      <div class="rprice" style="color:#b9a6ff;font-size:11px">${rew}</div>
    </div>`;
  }
  host.innerHTML = h;
}
function toggleSkill(tab) { const o = !skillOpen; closeAll(); if (o) { skillOpen = true; skillPanel.style.display = 'block'; setSkillTab(tab || _skTab); } }
function openSkillPanel(tab) { if (!skillOpen) toggleSkill(tab); else setSkillTab(tab); }
function openVendor(tier) { closeAll(); openShopWithInv(); vendorTier = tier || 1; vendorOpen = true; vendorPanel.style.display = 'block'; if (!vendorStock.length || vendorStockTier !== vendorTier) refreshVendor(vendorTier); setVendorTab('buy'); }
function openStash() { closeAll(); stashOpen = true; stashPanel.style.display = 'block'; renderStash(); }
function openSmith() { closeAll(); openShopWithInv(); smithOpen = true; smithPick = null; smithPanel.style.display = 'block'; setSmithTab('upgrade'); }
function openAlchemist() { closeAll(); openShopWithInv(); alchemistOpen = true; alchemistPanel.style.display = 'block'; renderAlchemist(); }
function renderAlchemist() {
  const body = document.getElementById('alchemistBody');
  let html = `<div style="color:#ffe27a;margin-bottom:10px">보유 골드: ${player.gold}</div><div class="tier">포션</div>`;
  const ptCost = 200 * Math.pow(2, character.potionTier || 0), ptMax = (character.potionTier || 0) >= POTION_TIER_MAX, ptPct = Math.round((POTION_PCT + (character.potionTier || 0) * POTION_TIER_PCT) * 100);
  html += `<div class="row"><div class="ric">⚗️</div><div class="rname">포션 강도 <span style="color:#8a7a5a;font-size:11px">(${character.potionTier || 0}단계 · 최대치의 ${ptPct}% 회복)</span></div>${ptMax ? '<div class="rprice">MAX</div>' : `<div class="rprice">${ptCost} g</div><div class="rbtn${player.gold >= ptCost ? '' : ' dis'}" id="upPotTier">강화</div>`}</div>`;
  const pcCost = 150 + ((character.potionCap || 10) - 10) * 40, pcMax = (character.potionCap || 10) >= POTION_CAP_MAX;
  html += `<div class="row"><div class="ric">🎒</div><div class="rname">포션 소지량 <span style="color:#8a7a5a;font-size:11px">(종류별 ${character.potionCap || 10}개 소지)</span></div>${pcMax ? '<div class="rprice">MAX</div>' : `<div class="rprice">${pcCost} g</div><div class="rbtn${player.gold >= pcCost ? '' : ' dis'}" id="upPotCap">+2</div>`}</div>`;
  body.innerHTML = html;
  const upt = document.getElementById('upPotTier'); if (upt) upt.onclick = () => { if (player.gold < ptCost || (character.potionTier || 0) >= POTION_TIER_MAX) return; player.gold -= ptCost; character.potionTier = (character.potionTier || 0) + 1; goldTxt.textContent = player.gold + ' g'; sfx('potion'); renderAlchemist(); updateGlobes(); saveProgress(false); };
  const upc = document.getElementById('upPotCap'); if (upc) upc.onclick = () => { if (player.gold < pcCost || (character.potionCap || 10) >= POTION_CAP_MAX) return; player.gold -= pcCost; character.potionCap = (character.potionCap || 10) + 2; goldTxt.textContent = player.gold + ' g'; renderAlchemist(); saveProgress(false); };
}
const ENCHANT_POOL = ['dmg', 'hp', 'mp', 'armor', 'str', 'dex', 'vit', 'eng', 'crit', 'ias', 'ms', 'allstats', 'allRes', 'critDmg', 'leech', 'manaLeech', 'skillranks', 'skilldmg', 'activeskill', 'fireDmg', 'coldDmg', 'lightDmg', 'poisonDmg', 'hpregen', 'mpregen', 'mf', 'gf', 'dodge', 'flatDR', 'cdr', 'lifeOnHit'];
/* Anvil pattern (same as the Smith): no gear list — click a piece in the inventory pane (renderInv routes
   clicks here while enchantOpen) and the Enchanter acts on that one selection. enchantPickWhere() doubles as a
   liveness check: if the picked item was dropped/equipped-away it returns null and we drop the selection. */
let enchantPick = null;
function openEnchanter() { closeAll(); openShopWithInv(); enchantOpen = true; enchantPanel.style.display = 'block'; enchantPick = null; renderEnchanter(); }
function enchantPickWhere() { if (!enchantPick) return null; for (const s of SLOTS) { if (character.equipment[s] === enchantPick) return 'eq'; } return character.inventory.indexOf(enchantPick) >= 0 ? 'inv' : null; }
function selectEnchantItem(it) { enchantPick = it; renderEnchanter(); }
function renderEnchanter() {
  if (invOpen) renderInv(); /* paired inventory pane: refresh contents + selection highlight */
  const body = document.getElementById('enchantBody'), where = enchantPickWhere(); if (!where) enchantPick = null; const it = enchantPick;
  let html = `<div style="color:#ffe27a;margin-bottom:8px">보유 골드: ${player.gold}</div>`;
  if (!it) { html += `<div class="smithSlot empty">인벤토리에서 아이템을 클릭하세요 →</div>`; }
  else {
    const ecost = enchantCost(it), cur = it.enchant && AFFIXES[it.enchant.key] ? `<div class="aff" style="color:#9f6aff">✦ +${it.enchant.val} ${AFFIXES[it.enchant.key].label} (current)</div>` : '';
    html += `<div class="smithSlot"><div class="ric" style="font-size:30px">${SLOT_ICON[it.slot]}</div><div style="flex:1"><div class="rname rc-${it.rarity}">${it.name}</div><div style="color:#8a7a5a;font-size:11px;text-transform:capitalize">${RARITY_NAME[it.rarity] || it.rarity} · ${SLOT_NAME[it.slot] || it.slot}${where === 'eq' ? ' · 장착 중' : ''}</div>${cur}</div></div>`;
    html += `<div class="smithAct"><span>능력치 부여${it.enchant ? ' (현재 속성 덮어쓰기)' : ''}</span><span class="rprice">${ecost} g</span></div>`;
    html += `<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px">`;
    ENCHANT_POOL.forEach(k => { if (!AFFIXES[k]) return; html += `<div class="rbtn${player.gold >= ecost ? '' : ' dis'}" data-aff="${k}" style="flex:0 0 auto;border-color:#6a4aa0">${AFFIXES[k].label}</div>`; });
    html += `</div>`;
  }
  body.innerHTML = html;
  if (it) { const rn = body.querySelector('.smithSlot .rname'); if (rn) bindTip(rn, it); }
  body.querySelectorAll('[data-aff]').forEach(b => b.onclick = () => { const tgt = enchantPick; if (!tgt) return; const k = b.dataset.aff, ecost = enchantCost(tgt); if (player.gold < ecost) return; player.gold -= ecost; tgt.enchant = { key: k, val: affixRoll(k, tgt.ilvl, tgt.rarity) }; goldTxt.textContent = player.gold + ' g'; if (enchantPickWhere() === 'eq') recompute(); sfx('potion'); showMsg(tgt.name + ' · 마법부여: +' + tgt.enchant.val + ' ' + AFFIXES[k].label); renderEnchanter(); saveProgress(false); });
}
let jewelerStock = [], socketPick = null;
/* Jeweler socketing uses the same anvil liveness pattern as the Smith: socketWhere() returns where the picked
   item lives, or null if it was dropped/sold/equipped-away (then we drop the selection). */
function selectSocketItem(it) { socketPick = it; renderJeweler(); }
function socketWhere() { if (!socketPick) return null; for (const s of SLOTS) if (character.equipment[s] === socketPick) return 'eq'; return character.inventory.indexOf(socketPick) >= 0 ? 'inv' : null; }
function openGambler() { closeAll(); openShopWithInv(); gambleOpen = true; gamblePanel.style.display = 'block'; renderGamble(); }
function renderGamble() {
  if (invOpen) renderInv(); /* show the gambled item in the paired inventory pane */
  const body = document.getElementById('gambleBody'); const tier = (curTownArea && curTownArea.tier) || 0; const il = player.level + 1 + tier * 2, cost = 50 + player.level * 15 + tier * 150;
  body.innerHTML = `<div style="color:#ffe27a;margin-bottom:10px">보유 골드: ${player.gold}</div>`;
  const row = document.createElement('div'); row.className = 'row'; row.innerHTML = `<div class="ric">🎲</div><div class="rname">미지의 아이템 <span style="color:#8a7a5a;font-size:11px">(아이템 레벨 ~${il}${tier ? ' · 확률 상승' : ''})</span></div><div class="rprice">${cost} g</div><div class="rbtn${player.gold >= cost && character.inventory.length < character.invMax ? '' : ' dis'}" id="gambleRoll">굴리기</div>`; body.appendChild(row);
  const gb = document.getElementById('gambleRoll'); if (gb) gb.onclick = () => { if (player.gold < cost || character.inventory.length >= character.invMax) return; player.gold -= cost; const it = rollItem(il, null, 0.1 + tier * 0.12); character.inventory.push(it); goldTxt.textContent = player.gold + ' g'; sfx('potion'); showMsg('도박 결과: ' + it.name); renderGamble(); updatePips(); saveProgress(false); };
}
function refreshJeweler(tier) { jewelerStock = []; const il = Math.max(1, player.level) + tier * 3; jewelerStock.push(rollItem(il, 'ring', 0.15 + tier * 0.1)); jewelerStock.push(rollItem(il, 'amulet', 0.15 + tier * 0.1)); jewelerStock.push(rollItem(il, 'ring', 0.05)); jewelerStock.push(rollItem(il, 'amulet', 0.05)); }
function openJeweler() { closeAll(); openShopWithInv(); jewelerOpen = true; socketPick = null; jewelerPanel.style.display = 'block'; refreshJeweler((curTownArea && curTownArea.tier) || 0); setJewelerTab('buy'); }
let jewelerTab = 'buy';
function setJewelerTab(t) { if (!['buy', 'reroll', 'socket', 'combine'].includes(t)) t = 'buy'; jewelerTab = t;[['Buy', '구입'], ['Reroll', '재추첨'], ['Socket', '소켓'], ['Combine', '합성']].forEach(([n, kn]) => { const el = document.getElementById('jewelerTab' + n); if (el) { el.textContent = kn; el.classList.toggle('on', t === n.toLowerCase()); } }); renderJeweler(); }
function renderJeweler() {
  if (invOpen) renderInv(); /* show jewelry changes in the paired inventory pane */
  const body = document.getElementById('jewelerBody');
  const DESC = { buy: '방문할 때마다 새로 들어오는 반지와 목걸이 — 좋은 마을일수록 좋은 물건을 파합니다.', reroll: '보유한 반지나 목걸이의 모든 속성 수치를 골드로 재추첨합니다.', socket: '인벤토리에서 소켓이 있는 아이템을 클릭한 뒤, 보석 주머니의 보석을 끼우거나 빼내세요. 소켓 추가는 대장장이에게.', combine: '같은 보석 3개를 합쳐 다음 등급 1개로 만듭니다. 최대 완벽한 등급까지.' };
  body.innerHTML = `<div style="color:#ffe27a;margin-bottom:6px">Your gold: ${player.gold}</div><div style="color:#8a7a5a;font-size:12px;margin-bottom:12px">${DESC[jewelerTab]}</div>`;
  if (jewelerTab === 'buy') {
    jewelerStock.forEach((it, idx) => { const price = buyPrice(it); const row = document.createElement('div'); row.className = 'row'; row.innerHTML = `<div class="ric">${SLOT_ICON[it.slot]}</div><div class="rname rc-${it.rarity}">${it.name}</div><div class="rprice">${price} g</div><div class="rbtn${player.gold >= price && character.inventory.length < character.invMax ? '' : ' dis'}" data-jbuy="${idx}">구입</div>`; bindTip(row.querySelector('.rname'), it); body.appendChild(row); });
    if (!jewelerStock.length) { const d = document.createElement('div'); d.style.color = '#6a5a44'; d.textContent = '매진 — 다음 방문 때 다시 오세요.'; body.appendChild(d); }
    body.querySelectorAll('[data-jbuy]').forEach(b => b.onclick = () => { const idx = +b.dataset.jbuy; const it = jewelerStock[idx]; if (!it) return; const price = buyPrice(it); if (player.gold < price || character.inventory.length >= character.invMax) return; player.gold -= price; character.inventory.push(it); jewelerStock.splice(idx, 1); goldTxt.textContent = player.gold + ' g'; sfx('potion'); showMsg('구입: ' + it.name); renderJeweler(); updatePips(); saveProgress(false); });
  } else if (jewelerTab === 'reroll') {
    const accs = []; for (const s of ['ring', 'amulet']) { if (character.equipment[s]) accs.push({ it: character.equipment[s], where: 'eq' }); } character.inventory.forEach(it => { if (it.slot === 'ring' || it.slot === 'amulet') accs.push({ it, where: 'inv' }); });
    if (!accs.length) { const d = document.createElement('div'); d.style.color = '#6a5a44'; d.textContent = '재추첨할 반지나 목걸이가 없습니다.'; body.appendChild(d); }
    accs.forEach((e, i) => { const it = e.it, cost = enchantCost(it), hasAff = Object.keys(it.affixes || {}).length > 0; const row = document.createElement('div'); row.className = 'row'; row.innerHTML = `<div class="ric">${SLOT_ICON[it.slot]}</div><div class="rname rc-${it.rarity}">${it.name}<span style="color:#8a7a5a;font-size:11px"> ${e.where === 'eq' ? '· 장착 중' : ''}</span></div>${hasAff ? `<div class="rprice">${cost} g</div><div class="rbtn${player.gold >= cost ? '' : ' dis'}" data-jrr="${i}">재추첨</div>` : '<div class="rprice" style="color:#6a5a44">속성 없음</div>'}`; bindTip(row.querySelector('.rname'), it); body.appendChild(row); });
    body.querySelectorAll('[data-jrr]').forEach(b => b.onclick = () => { const e = accs[+b.dataset.jrr], it = e.it; const keys = Object.keys(it.affixes || {}); const cost = enchantCost(it); if (!keys.length || player.gold < cost) return; player.gold -= cost; for (const k of keys) it.affixes[k] = affixRoll(k, it.ilvl, it.rarity); goldTxt.textContent = player.gold + ' g'; if (e.where === 'eq') recompute(); sfx('potion'); showMsg(it.name + ' · 속성 재추첨됨'); renderJeweler(); saveProgress(false); });
  } else if (jewelerTab === 'socket') {
    const gems = character.gems || {}; const pouchKeys = Object.keys(gems).filter(k => gems[k] > 0);
    const sw = socketWhere(); if (!sw) socketPick = null; const sit = socketPick;
    if (!sit) { const d = document.createElement('div'); d.style.color = '#6a5a44'; d.textContent = pouchKeys.length ? '인벤토리에서 소켓이 있는 아이템을 클릭하세요 →' : '몬스터에게서 보석을 얻은 뒤 소켓이 있는 아이템을 클릭하세요 →'; body.appendChild(d); }
    else if (!(sit.sockets && sit.sockets.length)) { const d = document.createElement('div'); d.style.color = '#6a5a44'; d.innerHTML = `<span class="rname rc-${sit.rarity}">${sit.name}</span> 에는 소켓이 없습니다 — 대장장이에게 추가하세요.`; body.appendChild(d); }
    else {
      const hdr = document.createElement('div'); hdr.className = 'row'; hdr.innerHTML = `<div class="ric">${SLOT_ICON[sit.slot]}</div><div class="rname rc-${sit.rarity}" style="flex:1">${sit.name}${sw === 'eq' ? ' <span style="color:#8a7a5a;font-size:11px">· 장착 중</span>' : ''}</div>`; bindTip(hdr.querySelector('.rname'), sit); body.appendChild(hdr);
      sit.sockets.forEach((g, i) => { const row = document.createElement('div'); row.className = 'row'; if (g) { const e = gemEff(sit.slot, g); row.innerHTML = `<div class="ric">${GEMS[g.t].ico}</div><div class="rname" style="flex:1">${gemName(g)} <span style="color:#8a7a5a;font-size:11px">+${e.vals[g.q]} ${AFFIXES[e.key].label}</span></div><div class="rbtn" data-unsock="${i}" style="border-color:#6a4aa0">빼기</div>`; } else { row.innerHTML = `<div class="ric">◯</div><div class="rname" style="flex:1;color:#8a7a5a">빈 소켓</div>`; } body.appendChild(row); });
      if (sit.sockets.some(g => !g)) {
        if (pouchKeys.length) { const pk = document.createElement('div'); pk.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;margin-top:6px'; pouchKeys.forEach(k => { const t = k.split(':')[0], q = +k.split(':')[1]; if (!GEMS[t]) return; const e = gemEff(sit.slot, { t, q }); pk.innerHTML += `<div class="rbtn" data-gem="${k}" style="flex:0 0 auto;border-color:#3a6a8a">${GEMS[t].ico} ${gemName({ t, q })} ×${gems[k]} <span style="color:#8a7a5a">+${e.vals[q]} ${AFFIXES[e.key].label}</span></div>`; }); body.appendChild(pk); }
        else { const d = document.createElement('div'); d.style.color = '#6a5a44'; d.textContent = '주머니에 보석이 없습니다.'; body.appendChild(d); }
      }
    }
    body.querySelectorAll('[data-gem]').forEach(b => b.onclick = () => { const tgt = socketPick; if (!tgt || !tgt.sockets) return; const k = b.dataset.gem, t = k.split(':')[0], q = +k.split(':')[1], g = character.gems || {}; if (!g[k]) return; const idx = tgt.sockets.findIndex(x => !x); if (idx < 0) return; tgt.sockets[idx] = { t, q }; g[k]--; if (g[k] <= 0) delete g[k]; if (socketWhere() === 'eq') recompute(); sfx('potion'); showMsg(tgt.name + ' · ' + gemName({ t, q }) + ' 장착'); renderJeweler(); updatePips(); saveProgress(false); });
    body.querySelectorAll('[data-unsock]').forEach(b => b.onclick = () => { const tgt = socketPick; if (!tgt || !tgt.sockets) return; const i = +b.dataset.unsock, g = tgt.sockets[i]; if (!g) return; const k = g.t + ':' + g.q; character.gems = character.gems || {}; character.gems[k] = (character.gems[k] || 0) + 1; tgt.sockets[i] = null; if (socketWhere() === 'eq') recompute(); sfx('potion'); showMsg(gemName(g) + ' 제거됨'); renderJeweler(); saveProgress(false); });
  } else {
    const gems = character.gems || {}; const combineable = Object.keys(gems).filter(k => gems[k] >= 3 && +k.split(':')[1] < 4);
    if (!combineable.length) { const d = document.createElement('div'); d.style.color = '#6a5a44'; d.textContent = '합성할 것이 없습니다 — 같은 보석 같은 등급 3개가 필요합니다.'; body.appendChild(d); }
    combineable.forEach(k => { const t = k.split(':')[0], q = +k.split(':')[1]; if (!GEMS[t]) return; const row = document.createElement('div'); row.className = 'row'; row.innerHTML = `<div class="ric">${GEMS[t].ico}</div><div class="rname" style="flex:1">${gemName({ t, q })} ×${gems[k]} → ${gemName({ t, q: q + 1 })}</div><div class="rbtn" data-comb="${k}" style="border-color:#6a4aa0">3개 합성</div>`; body.appendChild(row); });
    body.querySelectorAll('[data-comb]').forEach(b => b.onclick = () => { const k = b.dataset.comb, t = k.split(':')[0], q = +k.split(':')[1], g = character.gems; if (!g || g[k] < 3 || q >= 4) return; g[k] -= 3; if (g[k] <= 0) delete g[k]; const nk = t + ':' + (q + 1); g[nk] = (g[nk] || 0) + 1; sfx('level'); showMsg('합성 완료 → ' + gemName({ t, q: q + 1 })); renderJeweler(); saveProgress(false); });
  }
}
const POTION_TIER_MAX = 8, POTION_CAP_MAX = 30;
let smithTab = 'upgrade', smithPick = null;
function setSmithTab(t) { if (t !== 'reforge' && t !== 'salvage' && t !== 'socket') t = 'upgrade';smithTab = t;[['Upgrade', '강화'], ['Reforge', '재련'], ['Salvage', '분해'], ['Socket', '소켓']].forEach(([n, kn]) => { const el = document.getElementById('smithTab' + n); if (el) { el.textContent = kn; el.classList.toggle('on', t === n.toLowerCase()); } }); renderSmith(); }
/* Diablo-3/4 anvil: the Smith no longer lists gear — you click a piece in the inventory pane (renderInv
   routes clicks here while smithOpen) and the Smith acts on that one selection. smithPickWhere() doubles as a
   liveness check: if the picked item was salvaged/dropped it returns null and we drop the selection. */
function smithPickWhere() { if (!smithPick) return null; for (const s of SLOTS) { if (character.equipment[s] === smithPick) return 'eq'; } return character.inventory.indexOf(smithPick) >= 0 ? 'inv' : null; }
function selectSmithItem(it) { smithPick = it; renderSmith(); }
function smithAction() {
  const it = smithPick, where = smithPickWhere(); if (!it || !where) { smithPick = null; renderSmith(); return; }
  if (smithTab === 'upgrade') { if ((it.upgrade || 0) >= upgradeMax(it)) return; const cost = upgradeCost(it); if (player.gold < cost) return; player.gold -= cost; it.upgrade = (it.upgrade || 0) + 1; if (where === 'eq') recompute(); sfx('level'); showMsg(it.name + ' → +' + it.upgrade); }
  else if (smithTab === 'reforge') { if (!reforgeable(it)) return; const rc = reforgeCost(it); if (player.gold < rc.gold || (character.materials || 0) < rc.dust) return; player.gold -= rc.gold; character.materials = (character.materials || 0) - rc.dust; const before = it.rarity; reforgeItem(it); if (where === 'eq') { recompute(); attachHeroWeapon(); } sfx('level'); showMsg(it.rarity !== before ? (it.name + ' → ' + (RARITY_NAME[it.rarity] || it.rarity) + '!') : ('재련 완료: ' + it.name)); }
  else if (smithTab === 'socket') { const max = SOCKET_MAX[it.slot] || 0, cur = (it.sockets || []).length; if (cur >= max) return; const cost = { dust: 6 + (RTIER[it.rarity] || 1) * 4, gold: Math.round(itemScore(it) * 0.2) + 20 }; if (player.gold < cost.gold || (character.materials || 0) < cost.dust) return; player.gold -= cost.gold; character.materials = (character.materials || 0) - cost.dust; (it.sockets = it.sockets || []).push(null); if (where === 'eq') recompute(); sfx('level'); showMsg(it.name + ' → 소켓 추가됨'); }
  else { if (where !== 'inv') return; if (it.lock) { showMsg('🔒 ' + it.name + ' 잠겨 있습니다'); return; } const du = dustValue(it); if ((RTIER[it.rarity] || 1) >= 3 && !confirm(it.name + ' (' + (RARITY_NAME[it.rarity] || it.rarity) + ')을(를) 가루 ' + du + '개로 분해할까요? 아이템은 파괴됩니다.')) return; const idx = character.inventory.indexOf(it); if (idx < 0) return; character.materials = (character.materials || 0) + du; character.inventory.splice(idx, 1); smithPick = null; sfx('potion'); showMsg('분해: +' + du + '✦'); }
  goldTxt.textContent = player.gold + ' g'; renderSmith(); updatePips(); saveProgress(false);
}
function renderSmith() {
  if (invOpen) renderInv(); /* paired inventory pane: refresh contents + selection highlight */
  const body = document.getElementById('smithBody'), where = smithPickWhere(); if (!where) smithPick = null; const it = smithPick;
  const DESC = { upgrade: '인벤토리에서 장비를 선택한 뒤 더 강하게 벼려내세요 — 강화할 때마다 기본 능력이 오르고, 등급이 높을수록 더 많이 오릅니다.', reforge: `장비를 선택한 뒤 골드 + ✦ 가루로 속성을 다시 뽑습니다 — ${Math.round(REFORGE_RARITY_UP * 100)}% 확률로 등급이 오릅니다. 세트와 유니크 장비는 재련할 수 없습니다.`, salvage: '소지품의 장비를 선택해 ✦ 가루로 분해합니다 — 골드는 들지 않습니다. 장착 중인 장비는 분해할 수 없습니다.', socket: '장비를 선택한 뒤 골드 + ✦ 가루로 빈 소켓을 추가합니다. 부위별 최대: 무기/갑옷 3개, 투구/장갑/장화 2개, 장신구 1개. 소켓에 끼울 보석은 보석상에게.' };
  let html = `<div style="color:#ffe27a;margin-bottom:8px">보유 골드: ${player.gold} <span style="color:#b9a6ff">· ✦ 가루 ${character.materials || 0}</span></div>`;
  html += `<div style="color:#8a7a5a;font-size:12px;margin-bottom:12px">${DESC[smithTab]}</div>`;
  if (!it) { html += `<div class="smithSlot empty">인벤토리에서 아이템을 클릭하세요 →</div>`; }
  else {
    html += `<div class="smithSlot"><div class="ric" style="font-size:30px">${SLOT_ICON[it.slot]}</div><div style="flex:1"><div class="rname rc-${it.rarity}">${it.name}${it.upgrade ? ' <span style="color:#ffcf6a">+' + it.upgrade + '</span>' : ''}</div><div style="color:#8a7a5a;font-size:11px;text-transform:capitalize">${RARITY_NAME[it.rarity] || it.rarity} · ${SLOT_NAME[it.slot] || it.slot}${where === 'eq' ? ' · 장착 중' : ''}</div>${affixLines(it)}</div></div>`;
    if (smithTab === 'upgrade') {
      const lvl = it.upgrade || 0, max = upgradeMax(it), atMax = lvl >= max, cost = upgradeCost(it), cur = Math.round((upFactor(it) - 1) * 100), nxt = Math.round((upFactor({ upgrade: lvl + 1 }) - 1) * 100);
      html += atMax ? `<div class="smithAct">최대로 강화됨 — <b>+${cur}%</b> (최대 ${max})</div>` : `<div class="smithAct"><span>+${cur}% → <b>+${nxt}%</b></span><span class="rprice">${cost} g</span><div class="rbtn${player.gold >= cost ? '' : ' dis'}" id="smithDo">강화</div></div>`;
    } else if (smithTab === 'reforge') {
      if (!reforgeable(it)) html += `<div class="smithAct" style="color:#6a5a44">${RARITY_NAME[it.rarity] || it.rarity} 장비는 재련할 수 없습니다 — 일반, 마법, 레어만 가능합니다.</div>`;
      else {
        const rc = reforgeCost(it), can = player.gold >= rc.gold && (character.materials || 0) >= rc.dust; html += `<div class="smithAct"><span>모든 속성 재추첨</span><span class="rprice">${rc.gold}g · ${rc.dust}✦</span><div class="rbtn${can ? '' : ' dis'}" id="smithDo" style="border-color:#6a4aa0">재련</div></div>`;
        // targeted Dust crafting: reroll ONE affix's value, or imbue a chosen affix (best of two rolls)
        const keys = Object.keys(it.affixes || {}).filter(k => AFFIXES[k]); const dust = character.materials || 0;
        html += `<div class="ptsNote" style="margin-top:12px">지정 제작 — ✦ 가루만 사용</div>`;
        const rrc = rerollAffixCost(it);
        for (const k of keys) html += `<div class="row"><div class="rname">+${it.affixes[k]} ${AFFIXES[k].label}</div><div class="rprice">${rrc}✦</div><div class="rbtn${dust >= rrc ? '' : ' dis'}" data-raffix="${k}">재추첨</div></div>`;
        const ic = imbueAffixCost(it);
        html += `<div class="row"><div class="rname">주입 <span style="color:#8a7a5a;font-size:11px">(선택한 속성 추가 또는 교체 — 두 번 굴려 좋은 쪽 적용)</span></div><select id="imbueSel" style="background:#0d0a06;border:1px solid #4a3a5a;color:#d8c8ff;border-radius:4px;padding:4px;max-width:170px">${AFFIX_KEYS.map(k => `<option value="${k}">${AFFIXES[k].label}</option>`).join('')}</select><div class="rprice">${ic}✦</div><div class="rbtn${dust >= ic ? '' : ' dis'}" id="imbueDo">주입</div></div>`;
      }
    } else if (smithTab === 'socket') {
      const max = SOCKET_MAX[it.slot] || 0, cur = (it.sockets || []).length;
      if (!max) html += `<div class="smithAct" style="color:#6a5a44">이 부위에는 소켓을 뚫을 수 없습니다.</div>`;
      else if (cur >= max) html += `<div class="smithAct" style="color:#6a5a44">소켓이 가득 찼습니다 — ${cur}/${max}.</div>`;
      else { const cost = { dust: 6 + (RTIER[it.rarity] || 1) * 4, gold: Math.round(itemScore(it) * 0.2) + 20 }, can = player.gold >= cost.gold && (character.materials || 0) >= cost.dust; html += `<div class="smithAct"><span>소켓 추가 (${cur}/${max})</span><span class="rprice">${cost.gold}g · ${cost.dust}✦</span><div class="rbtn${can ? '' : ' dis'}" id="smithDo" style="border-color:#3a6a8a">소켓 추가</div></div>`; }
    } else {
      if (where === 'eq') html += `<div class="smithAct" style="color:#6a5a44">장착 중 — 분해하려면 먼저 해제하세요.</div>`;
      else html += `<div class="smithAct"><span>가루로 분해</span><span class="rprice">+${dustValue(it)}✦</span><div class="rbtn" id="smithDo" style="border-color:#7a3a28">분해</div></div>`;
    }
  }
  body.innerHTML = html;
  if (it) { const rn = body.querySelector('.smithSlot .rname'); if (rn) bindTip(rn, it); const db = document.getElementById('smithDo'); if (db) db.onclick = smithAction; }
  if (it && smithTab === 'reforge' && reforgeable(it)) {
    body.querySelectorAll('[data-raffix]').forEach(b => { b.onclick = () => { const c = rerollAffixCost(it); if ((character.materials || 0) < c) return; if (!rerollAffix(it, b.dataset.raffix)) return; character.materials -= c; if (where === 'eq') recompute(); sfx('level'); renderSmith(); updatePips(); saveProgress(false); }; });
    const ib = document.getElementById('imbueDo'); if (ib) ib.onclick = () => { const sel = /** @type {HTMLSelectElement|null} */ (document.getElementById('imbueSel')); const c = imbueAffixCost(it); if (!sel || (character.materials || 0) < c) return; if (!imbueAffix(it, sel.value)) return; character.materials -= c; if (where === 'eq') recompute(); sfx('level'); renderSmith(); updatePips(); saveProgress(false); };
  }
  if (smithTab === 'salvage') {
    const isJunk = j => (j.rarity === 'common' || j.rarity === 'magic') && !j.lock;
    const junk = character.inventory.filter(isJunk);
    if (junk.length) {
      const jd = junk.reduce((s, j) => s + dustValue(j), 0); const bar = document.createElement('div'); bar.className = 'row'; bar.style.marginTop = '14px'; bar.style.background = 'rgba(40,30,16,.55)';
      bar.innerHTML = `<div class="rname" style="flex:1">소지품 잡동사니 <span style="color:#8a7a5a;font-size:11px">(일반/마법 ${junk.length}개 · 🔒 잠긴 것은 유지)</span></div><div class="rbtn" id="smithSalvageJunk" style="border-color:#6a4aa0">잡동사니 분해 +${jd}✦</div>`; body.appendChild(bar);
      document.getElementById('smithSalvageJunk').onclick = () => { const jk = character.inventory.filter(isJunk); if (!jk.length) return; const d = jk.reduce((s, j) => s + dustValue(j), 0); if (jk.includes(smithPick)) smithPick = null; character.materials = (character.materials || 0) + d; character.inventory = character.inventory.filter(j => !isJunk(j)); sfx('potion'); showMsg('잡동사니 분해: +' + d + '✦'); renderSmith(); updatePips(); saveProgress(false); };
    }
  }
}
function affixLines(it) { let s = ''; if (it.slot === 'weapon' && it.baseStat) { const ws = weaponSpeed(it); s += `<div class="base">피해 ${it.baseStat}${it.h2 ? ' · 양손' : ''}${ws < 1 ? ' · 빠름' : ws > 1 ? ' · 느림' : ''}</div>`; } else if (it.baseStat) s += `<div class="base">방어도 ${it.baseStat}</div>`; if (it.block) s += `<div class="base">막기 ${it.block}%</div>`; const keys = Object.keys(it.affixes).sort((a, b) => (AFFIX_CAT_ORD[AFFIX_CAT[a]] || 5) - (AFFIX_CAT_ORD[AFFIX_CAT[b]] || 5)); for (const k of keys) s += `<div class="aff aff-${AFFIX_CAT[k] || 'util'}">+${it.affixes[k]} ${AFFIXES[k].label}</div>`; if (it.enchant && it.enchant.key && AFFIXES[it.enchant.key]) s += `<div class="aff" style="color:#9f6aff">✦ +${it.enchant.val} ${AFFIXES[it.enchant.key].label} (마법부여)</div>`; if (it.sockets && it.sockets.length) s += `<div class="aff aff-util">` + it.sockets.map(g => { if (!g) return '◯ (비어 있음)'; const e = gemEff(it.slot, g); return `${GEMS[g.t].ico} +${e.vals[g.q]} ${AFFIXES[e.key].label}`; }).join(' · ') + `</div>`; return s; }
function statBundle(it) { const b = {}; if (it.baseStat) b[it.slot === 'weapon' ? '피해' : '방어도'] = (b[it.slot === 'weapon' ? '피해' : '방어도'] || 0) + it.baseStat; if (it.block) b['막기'] = (b['막기'] || 0) + it.block; for (const k in it.affixes) { const l = AFFIXES[k] ? AFFIXES[k].label : k; b[l] = (b[l] || 0) + it.affixes[k]; } if (it.enchant && it.enchant.key && AFFIXES[it.enchant.key]) { const l = AFFIXES[it.enchant.key].label; b[l] = (b[l] || 0) + (it.enchant.val || 0); } if (it.sockets) for (const g of it.sockets) { if (g) { const e = gemEff(it.slot, g); if (e) { const l = AFFIXES[e.key].label; b[l] = (b[l] || 0) + e.vals[g.q]; } } } return b; }
function tooltipHTML(it) {
  const eq = character.equipment[it.slot]; let html = `<div class="tname rc-${it.rarity}">${it.name}${it.upgrade ? ' <span style="color:#ffcf6a">+' + it.upgrade + '</span>' : ''}</div><div class="tslot rc-${it.rarity}">${RARITY_NAME[it.rarity] || it.rarity} · ${SLOT_NAME[it.slot] || it.slot} · 아이템 레벨 ${it.ilvl}${it.upgrade ? ' · +' + Math.round((upFactor(it) - 1) * 100) + '% 강화됨' : ''}</div>${affixLines(it)}`;
  if (it.effect) html += `<div style="color:#ffcf6a;margin-top:4px">★ ${it.effectDesc}</div>`;
  if (it.lock) html += `<div style="color:#9fd8ff;font-size:11px;margin-top:3px">🔒 잠김 — 판매와 분해에서 보호됩니다 (우클릭으로 해제)</div>`;
  if (it.set) {
    const sd = SET_DEFS[it.set]; if (sd) {
      const owned = SLOTS.reduce((n, s) => n + (character.equipment[s] && character.equipment[s].set === it.set ? 1 : 0), 0); html += `<div style="color:#5ad65a;margin-top:6px">${sd.name} (${owned}/${sd.pieces.length})</div>`;
      for (const thr in sd.bonuses) { const bb = sd.bonuses[thr]; const parts = []; for (const k in bb) { if (k === 'effect') parts.push(bb.effect + (bb.effVal ? ' ' + bb.effVal : '')); else if (k !== 'effVal') parts.push('+' + bb[k] + ' ' + ((AFFIXES[k] && AFFIXES[k].label) || k)); } html += `<div style="font-size:11px;color:${owned >= +thr ? '#5ad65a' : '#5a6a5a'}">${thr}세트: ${parts.join(', ')}</div>`; }
    }
  }
  if (eq && eq !== it) {
    const a = statBundle(it), b = statBundle(eq); const keys = [...new Set([...Object.keys(a), ...Object.keys(b)])]; let rows = '';
    for (const k of keys) { const d = (a[k] || 0) - (b[k] || 0); if (d === 0) continue; const c = d > 0 ? '#7fd07f' : '#d07f7f'; rows += `<div style="color:${c};font-size:11px">${d > 0 ? '▲ +' : '▼ '}${d} ${k}</div>`; }
    const ds = itemScore(it) - itemScore(eq); const v = ds > 0 ? `<span style="color:#7fd07f">▲ 상위 (+${ds})</span>` : ds < 0 ? `<span style="color:#d07f7f">▼ 하위 (${ds})</span>` : `<span style="color:#c8b89a">≈ 비슷함</span>`;
    html += `<div class="cmp"><div style="margin-bottom:3px">장착 아이템과 비교 <span class="rc-${eq.rarity}">${eq.name}</span></div>${rows}<div style="margin-top:4px">${v}</div></div>`;
  }
  return html;
}
function bindTip(el, it) { el.onmouseenter = e => { tooltip.innerHTML = tooltipHTML(it); tooltip.style.display = 'block'; moveTip(e); }; el.onmousemove = moveTip; el.onmouseleave = () => tooltip.style.display = 'none'; }
function moveTip(e) { const pad = 14; let x = e.clientX - tooltip.offsetWidth - pad; if (x < 8) x = e.clientX + pad; x = clamp(x, 8, Math.max(8, innerWidth - tooltip.offsetWidth - 8)); tooltip.style.left = x + 'px'; tooltip.style.top = clamp(e.clientY - 20, 8, Math.max(8, innerHeight - tooltip.offsetHeight - 8)) + 'px'; }
function charSheetHTML() {
  /** @type {Effects} */ const e = player.effects || {};
  const em = player.elemMult || {};
  const pct = v => Math.round(v) + '%';
  const row = (lbl, val, cls) => `<div class="statrow${cls ? ' ' + cls : ''}"><span>${lbl}</span><b>${val}</b></div>`;
  const sec = (title, rows) => rows ? `<div class="statsec"><div class="statsec-h">${title}</div><div class="statgrid">${rows}</div></div>` : '';
  // Offense — every item-grantable stat always shown, 0/baseline when nothing grants it
  let off = row('피해', player.dmg) + row('치명타 확률', pct(player.crit * 100)) + row('치명타 피해', '×' + ((e.critdmg ? 3 : 2) + (e.critDmgPct || 0) / 100).toFixed(2)) + row('공격 속도', (1000 / player.attackRate).toFixed(2) + '/초');
  off += row('생명력 흡수', pct((e.lifesteal || 0) * 100));
  off += row('스킬 피해', '+' + pct(((player.skillMult || 1) - 1) * 100));
  off += row('선택 스킬', '+' + pct(((player.activeSkillDmg || 1) - 1) * 100));
  off += row('+ 모든 스킬', e.allskills || 0);
  off += row('재사용 대기시간 감소', '+' + pct((player.cdr || 0) * 100));
  off += row('적중 시 생명력', Math.round(e.lifeOnHit || 0));
  for (const [k, lbl] of [['fire', '화염 피해'], ['frost', '냉기 피해'], ['lightning', '번개 피해'], ['poison', '독 피해']]) off += row(lbl, '+' + pct(((em[k] || 1) - 1) * 100));
  // Defense
  const redux = Math.min(75, Math.round(player.armor / (player.armor + 40) * 100));
  let def = row('생명력', player.hpMax) + row('방어도', player.armor + ' (' + redux + '% 감소)');
  def += row('가시', Math.round(e.thorns || 0));
  def += row('마나 보호막', pct((e.manaShield || 0) * 100));
  def += row('생명력 재생', ((player.hpRegen || 0) * 1000).toFixed(1) + '/초');
  def += row('회피', pct((e.dodge || 0) * 100));
  def += row('막기', pct((e.block || 0) * 100));
  def += row('피해 감소', pct((e.flatDR || 0) * 100));
  // Resistances — effective = element + all, capped at 75%
  const ar = e.allRes || 0, rres = k => Math.min(75, Math.round((e[k] || 0) + ar));
  const res = row('화염', rres('fireRes') + '%', 'res-fire') + row('냉기', rres('frostRes') + '%', 'res-cold') + row('번개', rres('lightningRes') + '%', 'res-light') + row('독', rres('poisonRes') + '%', 'res-poison');
  // Utility
  let util = row('마나', player.mpMax);
  util += row('이동 속도', '+' + pct((e.movespeed || 0) * 100));
  util += row('마나 흡수', pct((e.manaleech || 0) * 100));
  util += row('마나 재생', ((player.mpRegen || 0) * 1000).toFixed(1) + '/초');
  util += row('마법 아이템 발견', '+' + pct(((zoneLuck || 0) + (lootLuck || 0)) * 100));
  util += row('골드 발견', '+' + pct((player.goldFind || 0) * 100));
  util += row('STR', player.str) + row('DEX', player.dex) + row('VIT', player.vit) + row('ENG', player.eng);
  return `<div class="statname"><b>${escapeHtml(character.name)}</b> · 레벨 ${player.level}</div>` + sec('공격', off) + sec('방어', def) + sec('저항', res) + sec('보조', util);
}
let invTab = 'items';
function setInvTab(t) {
  invTab = t === 'gems' ? 'gems' : 'items';
  document.querySelectorAll('#invTabs .tab').forEach(el => el.classList.toggle('on', el.dataset.invtab === invTab));
  const ig = document.getElementById('invGrid'), gg = document.getElementById('gemGrid'), hint = document.getElementById('invHint');
  if (ig) ig.style.display = invTab === 'items' ? 'grid' : 'none';
  if (gg) gg.style.display = invTab === 'gems' ? 'grid' : 'none';
  if (hint) hint.textContent = invTab === 'gems' ? '보석은 제한 없이 쌓입니다 — 능력치는 마우스를 올려 확인하세요. 보석상에서 장비에 장착할 수 있습니다.' : '소지품 아이템을 클릭하면 장착 • 장착 아이템을 클릭하면 해제 • 비교는 마우스 오버';
  renderInv();
}
/* Gems aren't equippable — they show their effect for each socket category (a gem grants a different stat in a
   weapon vs armor vs jewelry), so the tooltip lists all three at the gem's quality. */
function gemTipHTML(t, q, n) {
  const G = GEMS[t]; if (!G) return '';
  const qn = ['금 간', '흠 있는', '보통', '완벽한', '최상급'][q] || '보통';
  let rows = '';
  for (const [c, lbl] of [['weapon', '무기에 장착 시'], ['gear', '갑옷/장비에 장착 시'], ['jewelry', '반지/목걸이에 장착 시']]) { const e = G[c]; if (!e) continue; const a = AFFIXES[e.key]; rows += `<div class="aff aff-util">${lbl}: <b>+${e.vals[q]}</b> ${a ? a.label : e.key}</div>`; }
  return `<div class="tname" style="color:#9fe8ff">${G.ico} ${gemName({ t, q })}</div><div class="tslot">보석 · ${qn} 등급 · ×${n} 보유</div>${rows}`;
}
function renderInv() {
  const eg = document.getElementById('equipGrid'); eg.innerHTML = '';
  for (const s of SLOTS) { const it = character.equipment[s]; const c = document.createElement('div'); c.className = 'cell' + (it ? ' r-' + it.rarity : ''); c.style.gridArea = s; c.innerHTML = `<span class="lbl">${SLOT_NAME[s] || s}</span>${it ? SLOT_ICON[s] : '<span style="opacity:.25">' + SLOT_ICON[s] + '</span>'}${it && it.lock ? '<span style="position:absolute;top:1px;right:3px;font-size:9px">🔒</span>' : ''}`; if (it) { bindTip(c, it); c.onclick = () => smithOpen ? selectSmithItem(it) : enchantOpen ? selectEnchantItem(it) : jewelerOpen && jewelerTab === 'socket' ? selectSocketItem(it) : unequip(s); c.oncontextmenu = e => { e.preventDefault(); it.lock = !it.lock; showMsg(it.lock ? '🔒 ' + it.name + ' 잠김' : it.name + ' 잠금 해제'); renderInv(); saveProgress(false); }; if ((smithOpen && smithPick === it) || (enchantOpen && enchantPick === it) || (jewelerOpen && jewelerTab === 'socket' && socketPick === it)) c.classList.add('smithSel'); } eg.appendChild(c); }
  document.getElementById('charStats').innerHTML = charSheetHTML();
  const ig = document.getElementById('invGrid'); ig.innerHTML = ''; for (let i = 0; i < character.invMax; i++) { const it = character.inventory[i]; const c = document.createElement('div'); c.className = 'cell' + (it ? ' r-' + it.rarity : ''); if (it) { const up = itemScore(it) > itemScore(character.equipment[it.slot]); c.innerHTML = (up ? '<span class="upg">▲</span>' : '') + SLOT_ICON[it.slot] + (it.lock ? '<span style="position:absolute;top:1px;right:3px;font-size:9px">🔒</span>' : ''); if (up) c.classList.add('isupg'); bindTip(c, it); c.onclick = () => smithOpen ? selectSmithItem(it) : enchantOpen ? selectEnchantItem(it) : jewelerOpen && jewelerTab === 'socket' ? selectSocketItem(it) : equipFromInv(i); c.oncontextmenu = e => { e.preventDefault(); it.lock = !it.lock; showMsg(it.lock ? '🔒 ' + it.name + ' 잠김' : it.name + ' 잠금 해제'); renderInv(); if (vendorOpen) renderVendor(); saveProgress(false); }; if ((smithOpen && smithPick === it) || (enchantOpen && enchantPick === it) || (jewelerOpen && jewelerTab === 'socket' && socketPick === it)) c.classList.add('smithSel'); } ig.appendChild(c); }
  const gg = document.getElementById('gemGrid');
  if (gg) {
    gg.innerHTML = ''; const gems = character.gems || {}; const keys = Object.keys(gems).filter(k => gems[k] > 0).sort();
    if (!keys.length) gg.innerHTML = '<div class="invHint" style="grid-column:1/-1;text-align:center;padding:10px 0">아직 보석이 없습니다 — 처치한 적이 떨어뜨립니다.</div>';
    else for (const k of keys) { const t = k.split(':')[0], q = +k.split(':')[1], n = gems[k]; if (!GEMS[t]) continue; const c = document.createElement('div'); c.className = 'cell'; c.style.cursor = 'default'; c.innerHTML = `${GEMS[t].ico}<span class="gcount">${n}</span>`; const html = gemTipHTML(t, q, n); c.onmouseenter = e => { tooltip.innerHTML = html; tooltip.style.display = 'block'; moveTip(e); }; c.onmousemove = moveTip; c.onmouseleave = () => tooltip.style.display = 'none'; gg.appendChild(c); }
  }
  goldTxt.textContent = player.gold + ' g'; const _dt = document.getElementById('dustTxt'); if (_dt) _dt.textContent = '가루 ' + (character.materials || 0); /* currency bar lives at the bottom of the inventory now */
}
function equipFromInv(i) {
  const it = character.inventory[i]; if (!it) return; const eq = character.equipment;
  // two-handed exclusion: a 2H weapon and an offhand can never coexist
  if (it.slot === 'offhand' && eq.weapon && eq.weapon.h2) { showMsg('양손 무기에는 두 손이 모두 필요합니다'); return; }
  if (it.slot === 'weapon' && it.h2 && eq.offhand) {
    if (character.inventory.length >= character.invMax) { showMsg('소지품이 가득 참 — 먼저 보조장비를 넣으세요'); return; }
    character.inventory.push(eq.offhand); eq.offhand = null; showMsg('보조장비를 넣었습니다');
  }
  const prev = eq[it.slot]; eq[it.slot] = it; character.inventory.splice(i, 1); if (prev) character.inventory.push(prev); recompute(); attachHeroWeapon(); renderInv(); renderOpenShop(); tooltip.style.display = 'none'; saveProgress(false);
}
function unequip(s) { const it = character.equipment[s]; if (!it) return; if (character.inventory.length >= character.invMax) { showMsg('소지품이 가득 찼습니다'); return; } character.inventory.push(it); character.equipment[s] = null; recompute(); attachHeroWeapon(); renderInv(); renderOpenShop(); tooltip.style.display = 'none'; saveProgress(false); }
let ptT = { x: 0, y: 0, s: 1 };
const PT_NAMES = { str: '힘', dex: '민첩', vit: '활력', eng: '에너지', hp: '생명력', mp: '마나', dmg: '피해', armor: '방어도', crit: '치명타 확률', meleePct: '% 근접 피해', spellPct: '% 주문 피해', armorPct: '% 방어도', hpPct: '% 생명력', allskills: '모든 스킬', pierce: '관통', lifesteal: '생명력 흡수', movespeed: '% 이동 속도', thorns: '가시' };
function ptNote() { document.getElementById('skillPtsNote').textContent = '사용 가능 포인트 ' + character.skillPoints + '개 · 드래그로 이동 · 스크롤로 확대'; }
function renderSkillTree() {
  ptNote(); const start = PTREE.nodes[PTREE.starts[character.class]]; ptT = { x: -start.x, y: -start.y, s: 1.1 };
  const c = document.getElementById('skillTree');
  c.innerHTML = `<div id="ptVp" style="position:relative;width:100%;height:calc(100vh - 250px);min-height:340px;overflow:hidden;border:1px solid #2a2218;border-radius:8px;background:radial-gradient(circle at 50% 45%,#161109,#080604);cursor:grab"><svg id="ptSvg" width="100%" height="100%" viewBox="-260 -260 520 520"><defs><filter id="pg" x="-90%" y="-90%" width="280%" height="280%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><g id="ptG"></g></svg></div>`;
  buildPTreeSvg(); attachPTreeEvents();
}
function applyPT() { const g = document.getElementById('ptG'); if (g) g.setAttribute('transform', `scale(${ptT.s}) translate(${ptT.x} ${ptT.y})`); }
function buildPTreeSvg() {
  const g = document.getElementById('ptG'); if (!g) return; const alloc = new Set(character.passives || []); let edges = '', circles = '', drawn = new Set();
  for (const id in PTREE.adj) { for (const nb of PTREE.adj[id]) { const key = id < nb ? id + '|' + nb : nb + '|' + id; if (drawn.has(key)) continue; drawn.add(key); const a = PTREE.nodes[id], b = PTREE.nodes[nb]; if (!a || !b) continue; const on = alloc.has(id) && alloc.has(nb); edges += `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${on ? '#c4a060' : '#2a241c'}" stroke-width="${on ? 3 : 2}"/>`; } }
  for (const id in PTREE.nodes) {
    const n = PTREE.nodes[id]; const allocated = alloc.has(id); const adjA = PTREE.adj[id].some(x => alloc.has(x)); const can = !allocated && character.skillPoints > 0 && adjA;
    const r = n.type === 'keystone' ? 15 : n.type === 'notable' ? 11 : n.type === 'start' ? 12 : 6.5;
    const fill = allocated ? (n.type === 'keystone' ? '#ffcf3a' : n.type === 'notable' ? '#e6b84d' : '#c8ad7a') : '#16110a';
    const stroke = n.type === 'start' ? '#ffe27a' : allocated ? '#ffe9a8' : can ? '#e6b84d' : adjA ? '#7a663f' : '#352c20';
    circles += `<circle data-pt="${id}" cx="${n.x}" cy="${n.y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${can ? 3 : 2}" ${can ? 'filter="url(#pg)"' : ''} style="cursor:pointer"/>`;
    if (n.type === 'notable' || n.type === 'keystone') circles += `<text x="${n.x}" y="${n.y - r - 3}" text-anchor="middle" fill="#cdb084" font-size="9" font-family="'Noto Serif KR',Georgia" style="pointer-events:none">${n.label}</text>`;
  }
  g.innerHTML = edges + circles; applyPT();
  g.querySelectorAll('[data-pt]').forEach(el => {
    const id = el.getAttribute('data-pt'); const n = PTREE.nodes[id];
    el.onmouseenter = e => { tooltip.innerHTML = ptTip(n); tooltip.style.display = 'block'; moveTip(e); }; el.onmousemove = moveTip; el.onmouseleave = () => tooltip.style.display = 'none';
    el.onclick = ev => { ev.stopPropagation(); ptClick(id); };
  });
}
function ptTip(n) {
  let lines = ''; for (const k in n.mods) { if (k === 'critdmg') { lines += '<div style="color:#b8a888">치명타가 3배 피해를 줍니다</div>'; continue; } let v = n.mods[k]; if (k === 'movespeed' || k === 'lifesteal') v = Math.round(v * 100) + '%'; lines += `<div style="color:#b8a888">+${v} ${PT_NAMES[k] || k}</div>`; }
  const t = n.type === 'keystone' ? '핵심' : n.type === 'notable' ? '주요' : n.type === 'start' ? '클래스 시작' : '패시브';
  return `<div class="tname" style="color:${n.type === 'keystone' ? '#ffcf3a' : '#e6b84d'}">${n.label || t}</div><div class="tslot">${t}</div>${lines || '<div style="color:#8a7a5a">연결 노드</div>'}`;
}
function ptClick(id) {
  const start = PTREE.starts[character.class]; const alloc = character.passives || (character.passives = []); const has = alloc.includes(id);
  if (!has) { if (character.skillPoints <= 0) return; if (!PTREE.adj[id].some(x => alloc.includes(x))) return; alloc.push(id); character.skillPoints--; }
  else { if (id === start) return; const rest = new Set(alloc.filter(x => x !== id)); const seen = new Set([start]), q = [start]; while (q.length) { const cur = q.shift(); for (const nb of PTREE.adj[cur]) if (rest.has(nb) && !seen.has(nb)) { seen.add(nb); q.push(nb); } } if (seen.size !== rest.size) return; character.passives = alloc.filter(x => x !== id); character.skillPoints++; }
  recompute(); buildPTreeSvg(); renderSkillbar(); updatePips(); ptNote(); saveProgress(false);
}
function attachPTreeEvents() {
  // Use element-level on* handlers (like attachRuneEvents) — every panel render used to add fresh anonymous
  // window mousemove/mouseup listeners that were never removed, leaking listeners and pinning each detached tree.
  const vp = document.getElementById('ptVp'); if (!vp) return; let drag = false, lx = 0, ly = 0;
  vp.onmousedown = e => { drag = true; lx = e.clientX; ly = e.clientY; vp.style.cursor = 'grabbing'; };
  vp.onmousemove = e => { if (!drag) return; const dx = e.clientX - lx, dy = e.clientY - ly; lx = e.clientX; ly = e.clientY; const rect = vp.getBoundingClientRect(); ptT.x += dx / rect.width * 520 / ptT.s; ptT.y += dy / rect.height * 520 / ptT.s; applyPT(); };
  vp.onmouseup = () => { drag = false; vp.style.cursor = 'grab'; }; vp.onmouseleave = () => { drag = false; vp.style.cursor = 'grab'; };
  vp.onwheel = e => { e.preventDefault(); ptT.s = clamp(ptT.s * (e.deltaY < 0 ? 1.12 : 0.89), 0.55, 2.4); applyPT(); };
}
document.getElementById('resetSkills').onclick = () => { const start = PTREE.starts[character.class]; const refund = (character.passives || []).filter(x => x !== start).length; character.passives = [start]; character.skillPoints += refund; recompute(); buildPTreeSvg(); renderSkillbar(); updatePips(); ptNote(); saveProgress(false); };
/* ---------- Abilities tab: loadout assignment + per-skill rune trees ---------- */
let _abilSlotSel = 1, _runeViewId = null, rT = { x: 0, y: 0, s: 1 };
