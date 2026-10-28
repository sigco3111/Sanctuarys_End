// ---- waypoint fast-travel ----
const wpModal = document.getElementById('wpModal');
function addWpRow(icon, name, sub, fn) { const d = document.createElement('div'); d.className = 'wprow'; d.innerHTML = `<div class="wic">${icon}</div><div class="winfo"><div class="wn">${name}</div><div class="ws">${sub}</div></div><div class="wbtn">이동</div>`; d.querySelector('.wbtn').onclick = fn; document.getElementById('wpList').appendChild(d); }
// Depth picker: lets the player jump to ANY depth they've already reached (1..maxDepth), via quick chips,
// a clamped number input, or Enter. Never allows exceeding maxDepth, so it can't be used to skip ahead.
function addDepthRow() {
  const max = Math.max(1, (character && character.maxDepth) || 1); const d = document.createElement('div'); d.className = 'wprow';
  const bosses = []; for (let b = 5; b <= max; b += 5) bosses.push(b); const quick = [...new Set([1, ...bosses.slice(-3), max])].filter(n => n >= 1 && n <= max).sort((a, b) => a - b);
  let chips = ''; for (const n of quick) chips += `<span class="wbtn dpchip" data-d="${n}" style="padding:3px 9px;margin:0 4px 4px 0;display:inline-block">${n === max ? '★ ' : ''}${n}</span>`;
  d.innerHTML = `<div class="wic">⬇️</div><div class="winfo"><div class="wn">깊이로 이동</div><div class="ws">이미 도달한 깊이로 이동할 수 있습니다 (1–${max})</div><div style="margin-top:6px">${chips}</div></div><div style="display:flex;flex-direction:column;gap:5px;align-items:flex-end"><input id="dpInput" type="number" min="1" max="${max}" value="${max}" style="width:66px;background:#0d0a06;border:1px solid #3a5a7a;color:#cfe2ff;border-radius:4px;padding:5px 6px;font-size:13px"><div class="wbtn" id="dpGo">내려가기</div></div>`;
  document.getElementById('wpList').appendChild(d);
  const go = v => travelTo('descent', 'depth', clamp(Math.round(+v || 1), 1, max));
  d.querySelector('#dpGo').onclick = () => go(document.getElementById('dpInput').value);
  d.querySelector('#dpInput').onkeydown = e => { if (e.key === 'Enter') go(e.target.value); };
  d.querySelectorAll('.dpchip').forEach(el => { el.onclick = () => go(el.dataset.d); });
}
function renderWaypoints() {
  const list = document.getElementById('wpList'); list.innerHTML = '';
  for (const r of REGIONS) {
    const here = (zone === 'wild' && curRegion && curRegion.id === r.id);
    const disc = r.town === 'town' || (character && character.discovered && character.discovered[r.town]);
    if (!disc) { addWpRow('❓', r.name + ' — 미발견', '야생을 뚫고 나아가 도달하세요', () => showMsg('야생 깊숙이 나아가 ' + r.name + '을(를) 찾으세요')); continue; }
    addWpRow('🌲', r.name + (here ? ' (현재 위치)' : ''), '야생 · Lv ' + r.lvl, () => travelTo(r.id));
  }
  for (const a of AREAS) {
    if (a.kind === 'wild') continue;
    if (a.kind === 'dungeon') { addWpRow('🕳️', '디센트 — 깊이 1', '던전 입구', () => travelTo('descent', 'start')); if (character && character.maxDepth > 1) { addWpRow('🔥', '디센트 — 깊이 ' + character.maxDepth, '가장 깊은 체크포인트', () => travelTo('descent', 'deep')); addDepthRow(); } if (character && character.flags && character.flags.sigil) addWpRow('😈', '인페르노 — 깊이 666', '인장 너머에서 벨페고르가 기다립니다', () => travelTo('descent', 'depth', 666)); continue; }
    if (character && character.discovered && !character.discovered[a.id]) { addWpRow('❓', a.name + ' — 미발견', '야생에서 차원문을 찾으세요', () => showMsg('야생에서 ' + a.name + '을(를) 찾으세요')); continue; }
    const here = (zone === 'town' && curTownArea && curTownArea.id === a.id);
    const icon = a.tier >= 2 ? '🔥' : a.tier >= 1 ? '🏰' : '🏡'; const sub = a.tier >= 2 ? '엔드게임 거점 · 특별한 상품' : a.tier >= 1 ? '거점 · 고급 상품' : '안전 거점 · 상인과 창고';
    addWpRow(icon, a.name + (here ? ' (현재 위치)' : ''), sub, () => travelTo(a.id));
  }
}
function openWaypoints() { if (!running) return; renderWaypoints(); wpModal.style.display = 'block'; syncBackdrop(); }
function closeWaypoints() { wpModal.style.display = 'none'; syncBackdrop(); }
document.getElementById('wpBtn').onclick = openWaypoints;
document.getElementById('wpClose').onclick = closeWaypoints;
// Waypoint / Sound / Debug hotkeys handled by the unified keybind dispatcher above
addEventListener('beforeunload', () => { flushSaveProgress(); }); // unconditional: flushSaveProgress() commits live player state (not just a pending debounce), and runs regardless of `running` since gameOver() clears it before its own save
document.getElementById('backdrop').onclick = () => { if (wpModal && wpModal.style.display === 'block') closeWaypoints(); else if (mpModal && mpModal.style.display === 'block') closeMP(); else if (settingsModal && settingsModal.style.display === 'block') closeSettings(); else if (helpModal && helpModal.style.display === 'block') closeHelp(); };
