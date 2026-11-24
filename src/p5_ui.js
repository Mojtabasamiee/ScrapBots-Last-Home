/* ============================================================
   RENDER + UI SCREENS + MAIN LOOP
   ============================================================ */
function rr(c, x, y, w, h, r) { c.beginPath(); c.roundRect(x, y, w, h, r); }
function panel(c, x, y, w, h, opts) {
  opts = opts || {};
  c.fillStyle = opts.bg || 'rgba(14,20,32,0.86)';
  rr(c, x, y, w, h, opts.r || 18); c.fill();
  c.strokeStyle = opts.border || 'rgba(120,150,200,0.35)'; c.lineWidth = 2; c.stroke();
}
function btnDraw(c, b, label, opts) {
  opts = opts || {};
  const en = b.enabled !== false;
  const px = b.pressed ? 2 : 0;
  c.save(); c.translate(px, px);
  c.globalAlpha = en ? 1 : 0.45;
  const g = c.createLinearGradient(0, b.y, 0, b.y + b.h);
  const base = opts.col || '#e2952f';
  g.addColorStop(0, shade(base, 1.18)); g.addColorStop(1, base);
  c.fillStyle = b.pressed ? shade(base, 0.82) : g;
  rr(c, b.x, b.y, b.w, b.h, opts.r || 14); c.fill();
  c.strokeStyle = 'rgba(0,0,0,0.35)'; c.lineWidth = 2;
  rr(c, b.x, b.y, b.w, b.h, opts.r || 14); c.stroke();
  if (opts.icon) { opts.icon(c, b.x + b.w / 2, b.y + b.h / 2); }
  c.fillStyle = opts.textCol || '#1c1508';
  c.font = `bold ${opts.fs || 26}px Vazirmatn`; c.textAlign = 'center'; c.textBaseline = 'middle';
  const ty = opts.icon ? b.y + b.h - 20 : b.y + b.h / 2;
  c.fillText(label, b.x + b.w / 2, ty);
  c.restore();
}
function shade(hex, k) {
  const r = clamp(Math.round(parseInt(hex.slice(1, 3), 16) * k), 0, 255);
  const g = clamp(Math.round(parseInt(hex.slice(3, 5), 16) * k), 0, 255);
  const b = clamp(Math.round(parseInt(hex.slice(5, 7), 16) * k), 0, 255);
  return `rgb(${r},${g},${b})`;
}
function title(c, txt, y, size, col) {
  c.fillStyle = col || '#ffd66b';
  c.font = `bold ${size || 64}px Vazirmatn`;
  c.textAlign = 'center'; c.textBaseline = 'middle';
  c.save();
  c.shadowColor = 'rgba(0,0,0,0.6)'; c.shadowBlur = 8; c.shadowOffsetY = 3;
  c.fillText(txt, DW / 2, y);
  c.restore();
}
function iconHome(c, x, y, s) {
  c.save(); c.translate(x, y); c.scale(s || 1, s || 1);
  c.fillStyle = '#5a4632'; c.beginPath(); c.moveTo(-16, 2); c.lineTo(0, -16); c.lineTo(16, 2); c.closePath(); c.fill();
  c.fillStyle = '#c96a2a'; c.fillRect(-12, 2, 24, 14);
  c.fillStyle = '#ffd66b'; c.fillRect(-4, 6, 8, 10);
  c.restore();
}
function iconWrench(c, x, y, s) {
  c.save(); c.translate(x, y); c.rotate(-0.7); c.scale(s || 1, s || 1);
  c.fillStyle = '#2b2f36';
  c.fillRect(-3, -12, 6, 20);
  c.beginPath(); c.arc(0, 14, 7, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#c8d2de'; c.fillRect(-3, -12, 6, 6);
  c.restore();
}
function iconPause(c, x, y, s) {
  c.save(); c.translate(x, y); c.scale(s || 1, s || 1);
  c.fillStyle = '#fff';
  c.fillRect(-8, -10, 6, 20); c.fillRect(2, -10, 6, 20);
  c.restore();
}
function iconPlay(c, x, y, s) {
  c.save(); c.translate(x, y); c.scale(s || 1, s || 1);
  c.fillStyle = '#fff';
  c.beginPath(); c.moveTo(-7, -10); c.lineTo(10, 0); c.lineTo(-7, 10); c.closePath(); c.fill();
  c.restore();
}
function drawStars(c, x, y, n, size, filled) {
  for (let i = 0; i < n; i++) {
    const sx = x + (i - (n - 1) / 2) * size * 1.5;
    c.save(); c.translate(sx, y);
    c.beginPath();
    for (let k = 0; k < 5; k++) {
      const a = -Math.PI / 2 + k * Math.PI * 2 / 5;
      const a2 = a + Math.PI / 5;
      const r1 = size, r2 = size * 0.45;
      if (k === 0) c.moveTo(Math.cos(a) * r1, Math.sin(a) * r1);
      c.lineTo(Math.cos(a2) * r2, Math.sin(a2) * r2);
      c.lineTo(Math.cos(a + Math.PI * 2 / 5) * r1, Math.sin(a + Math.PI * 2 / 5) * r1);
    }
    c.closePath();
    c.fillStyle = (filled === undefined || i < filled) ? '#ffd66b' : 'rgba(255,255,255,0.18)';
    c.fill();
    c.strokeStyle = 'rgba(0,0,0,0.4)'; c.lineWidth = 1.5; c.stroke();
    c.restore();
  }
}

/* ============================================================
   SCREEN MANAGER
   ============================================================ */
const Screen = {
  cur: 'boot',
  overlay: null,          /* dialog ids: settings, pause, results, defeat, briefing, unlockCard, seasonEnd, intro, exit, confirmReset, help */
  overlayData: null,
  storyStep: 0,
  set(s) { this.cur = s; clearButtons(); TAP_ACTION = null; },
  showOverlay(o, data) { this.overlay = o; this.overlayData = data || null; clearButtons(); TAP_ACTION = null; },
  hideOverlay() { this.overlay = null; this.overlayData = null; clearButtons(); TAP_ACTION = null; }
};

/* ============================================================
   MAIN MENU
   ============================================================ */
let menuT = 0;
function drawMainMenu(c, dt) {
  menuT += dt;
  const th = THEMES[0];
  const g = c.createLinearGradient(0, 0, 0, DH);
  g.addColorStop(0, th.sky[0]); g.addColorStop(0.6, th.sky[1]); g.addColorStop(1, th.sky[2]);
  c.fillStyle = g; c.fillRect(0, 0, DW, DH);
  /* stars */
  for (let i = 0; i < 30; i++) {
    const x = (i * 173 + 40) % DW, y = (i * 97) % 260;
    c.fillStyle = `rgba(255,255,255,${0.06 + (i % 5) * 0.02})`;
    c.beginPath(); c.arc(x, y, 1.4, 0, Math.PI * 2); c.fill();
  }
  /* house */
  c.fillStyle = '#8a7355'; c.fillRect(90, 380, 420, 320);
  c.fillStyle = '#6e5a3f'; c.beginPath(); c.moveTo(60, 380); c.lineTo(300, 240); c.lineTo(540, 380); c.closePath(); c.fill();
  c.fillStyle = '#5a4632'; c.fillRect(230, 520, 120, 180);
  c.fillStyle = '#ffd66b'; c.fillRect(250, 560, 30, 36);
  const blink = (Math.sin(menuT * 2.4) + 1) / 2;
  c.fillStyle = `rgba(255,214,107,${0.3 + blink * 0.6})`; c.fillRect(320, 470, 40, 34);
  c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(140, 470, 40, 60);
  /* moon */
  c.fillStyle = 'rgba(255,240,200,0.9)'; c.beginPath(); c.arc(1380, 140, 46, 0, Math.PI * 2); c.fill();
  c.fillStyle = th.sky[1]; c.beginPath(); c.arc(1360, 128, 40, 0, Math.PI * 2); c.fill();
  /* ground */
  c.fillStyle = '#3a5530'; c.fillRect(0, 700, DW, DH - 700);
  c.fillStyle = '#4a6b3a';
  for (let i = 0; i < 40; i++) { c.beginPath(); c.ellipse((i * 211) % DW, 710 + (i * 53) % 170, 20, 5, 0, 0, Math.PI * 2); c.fill(); }
  /* scrap robots idling */
  c.save(); c.translate(700, 706); c.scale(1.15, 1.15);
  ROBOT_ART.canSlinger(c, menuT, 1, { x: menuT * 2, firing: false, fT: 0 });
  c.restore();
  c.save(); c.translate(880, 706); c.scale(1.1, 1.1);
  ROBOT_ART.dynamo(c, menuT * 0.7, 1, { x: menuT * 1.6 });
  c.restore();
  c.save(); c.translate(1030, 704); c.scale(1.05, 1.05);
  ROBOT_ART.spring(c, menuT * 0.5, 1, { x: 0 });
  c.restore();
  /* title */
  c.save();
  c.textAlign = 'center';
  c.font = 'bold 96px Vazirmatn'; c.fillStyle = '#ffd66b';
  c.shadowColor = 'rgba(0,0,0,0.7)'; c.shadowBlur = 12; c.shadowOffsetY = 4;
  c.fillText(T('title'), DW - 330, 150);
  c.font = 'bold 58px Vazirmatn'; c.fillStyle = '#ffb35e';
  c.fillText(T('subtitle'), DW - 330, 220);
  c.restore();
  /* buttons — right column (RTL) */
  clearButtons();
  const bx = DW - 470, bw = 420, bh = 62, gap = 14;
  let by = 268;
  const mk = (label, col, fn, opts) => {
    const b = addButton(bx, by, bw, bh, fn, Object.assign({ col }, opts || {}));
    btnDraw(c, b, label, { col, fs: 27 }); by += bh + gap;
  };
  mk(T('start'), '#e2952f', () => { Screen.set('story'); Screen.storyStep = 0; });
  mk(T('cont'), '#5b7fa6', () => { startBattle(Math.min(SAVE.unlockedStage, 20)); });
  mk(T('garage'), '#4a7a5e', () => { Screen.set('garage'); });
  mk(T('stages'), '#8a6fd1', () => { Screen.set('stageSelect'); });
  mk(T('collection'), '#a8551f', () => { Screen.set('collection'); });
  mk(T('settings'), '#6b7280', () => { Screen.showOverlay('settings'); });
  /* bolts display */
  panel(c, 40, 30, 220, 56, { bg: 'rgba(10,14,22,0.7)', r: 14 });
  c.fillStyle = '#ffd66b'; c.beginPath(); c.arc(80, 58, 16, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#b0453a'; c.font = 'bold 18px Vazirmatn'; c.textAlign = 'center'; c.fillText('B', 80, 60);
  c.fillStyle = '#fff'; c.font = 'bold 26px Vazirmatn'; c.textAlign = 'left';
  c.fillText(numStr(SAVE.bolts), 108, 66);
  return 'menu';
}

/* ============================================================
   STORY INTRO
   ============================================================ */
function drawStory(c) {
  c.fillStyle = '#060a12'; c.fillRect(0, 0, DW, DH);
  const step = Screen.storyStep;
  const lines = [T('storyA'), T('storyB'), T('storyC'), T('storyD')];
  clearButtons();
  panel(c, 200, 260, DW - 400, 300, { r: 24 });
  c.fillStyle = '#e8eef6'; c.font = '30px Vazirmatn'; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.fillText(lines[step], DW / 2, 410);
  c.fillStyle = 'rgba(255,255,255,0.35)';
  c.font = '22px Vazirmatn';
  c.fillText(T('tapCont'), DW / 2, 520);
  /* illustration */
  c.save(); c.translate(DW / 2 - 260, 620); c.scale(0.9, 0.9);
  ROBOT_ART.canSlinger(c, performance.now() / 1000, 1, { x: 0 });
  c.restore();
  c.save(); c.translate(DW / 2 + 260, 620); c.scale(0.9, 0.9);
  ROBOT_ART.dynamo(c, performance.now() / 1000, 1, { x: 0 });
  c.restore();
  const b = addButton(0, 0, DW, DH, () => {
    Screen.storyStep++;
    if (Screen.storyStep >= 4) { SAVE.introSeen = true; persist(); startBattle(Math.min(SAVE.unlockedStage, 20)); }
  });
  TAP_ACTION = () => b.onClick();
  return 'story';
}

/* ============================================================
   STAGE SELECT
   ============================================================ */
function drawStageSelect(c) {
  c.fillStyle = '#0e1520'; c.fillRect(0, 0, DW, DH);
  c.fillStyle = 'rgba(255,255,255,0.03)';
  for (let i = 0; i < 60; i++) { c.beginPath(); c.arc((i * 149) % DW, (i * 233) % DH, 1.2, 0, Math.PI * 2); c.fill(); }
  title(c, T('stages'), 60, 44);
  clearButtons();
  const cw = 240, chh = 260, gx = 18, gy = 30;
  const cols = 5;
  for (let i = 0; i < 20; i++) {
    const st = STAGES[i];
    const row = Math.floor(i / cols), col = i % cols;
    /* RTL: right to left */
    const x = DW - 130 - (col + 1) * cw - col * gx;
    const y = 110 + row * (chh + gy);
    const unlocked = (i + 1) <= SAVE.unlockedStage;
    const stars = SAVE.stageStars[i + 1] || 0;
    const area = stageArea(i + 1);
    const areaCols = ['#3a5530', '#31363f', '#3c3344', '#16283a'];
    panel(c, x, y, cw, chh, { bg: unlocked ? 'rgba(20,28,42,0.9)' : 'rgba(12,16,24,0.85)', border: unlocked ? THEMES[area].accent : 'rgba(90,100,120,0.3)', r: 16 });
    c.fillStyle = areaCols[area]; rr(c, x + 12, y + 12, cw - 24, 84, 10); c.fill();
    /* mini env icon */
    c.fillStyle = THEMES[area].accent;
    c.globalAlpha = unlocked ? 0.8 : 0.25;
    c.beginPath(); c.roundRect(x + 22, y + 22, cw - 44, 64, 8); c.fill();
    c.globalAlpha = 1;
    c.fillStyle = unlocked ? '#fff' : '#8a93a2';
    c.font = 'bold 30px Vazirmatn'; c.textAlign = 'center';
    c.fillText(numStr(i + 1), x + cw / 2, y + 62);
    c.font = '17px Vazirmatn'; c.fillStyle = unlocked ? '#e8eef6' : '#6b7280';
    c.fillText(SAVE.settings.lang === 'fa' ? st.nameFa : st.nameEn, x + cw / 2, y + 122, cw - 30);
    c.font = '14px Vazirmatn'; c.fillStyle = THEMES[area].accent;
    c.fillText(T('area') + ': ' + T('a' + (area + 1)), x + cw / 2, y + 148, cw - 30);
    if (unlocked) {
      drawStars(c, x + cw / 2, y + 192, 3, 11, stars);
      c.font = '14px Vazirmatn'; c.fillStyle = '#9fb0c6';
      c.fillText(T('best') + ': ' + numStr(SAVE.stageBest[i + 1] || 0), x + cw / 2, y + 226);
      const pb = addButton(x, y, cw, chh, () => { startBattle(i + 1); });
      pb.hover = true;
    } else {
      c.save(); c.translate(x + cw / 2, y + 188); c.scale(1.4, 1.4);
      c.fillStyle = '#5d626b'; c.beginPath(); c.roundRect(-9, -6, 18, 16, 3); c.fill();
      c.strokeStyle = '#5d626b'; c.lineWidth = 3.5; c.beginPath(); c.arc(0, -8, 6, Math.PI, Math.PI * 2); c.stroke();
      c.restore();
      c.font = '15px Vazirmatn'; c.fillStyle = '#6b7280';
      c.fillText(T('locked'), x + cw / 2, y + 226);
    }
  }
  backBtn(c, () => Screen.set('menu'));
  return 'stageSelect';
}
function backBtn(c, fn) {
  const b = addButton(DW - 150, DH - 76, 120, 52, fn, { col: '#6b7280' });
  btnDraw(c, b, T('back'), { col: '#6b7280', fs: 22 });
}

/* ============================================================
   GARAGE (upgrades)
   ============================================================ */
let garageSel = 0;
function drawGarage(c, dt) {
  c.fillStyle = '#101822'; c.fillRect(0, 0, DW, DH);
  c.fillStyle = '#1a2530'; c.fillRect(0, 0, DW, 90);
  title(c, T('garage'), 48, 40, '#ffd66b');
  c.textAlign = 'left'; c.fillStyle = '#ffd66b'; c.font = 'bold 24px Vazirmatn';
  c.fillText('⬢ ' + numStr(SAVE.bolts), 60, 52);
  clearButtons();
  /* robot grid (RTL order): 6 per row */
  const list = ROBOT_LIST;
  const cw = 150, chh = 150, gap = 16;
  for (let i = 0; i < list.length; i++) {
    const row = Math.floor(i / 6), col = i % 6;
    const x = DW - 100 - (col + 1) * cw - col * gap;
    const y = 108 + row * (chh + gap);
    const R = list[i];
    const unlocked = SAVE.robotUnlocked[R.id];
    const sel = i === garageSel;
    panel(c, x, y, cw, chh, { bg: sel ? 'rgba(60,80,110,0.95)' : 'rgba(20,28,40,0.9)', border: sel ? '#ffd66b' : (unlocked ? 'rgba(120,150,200,0.4)' : 'rgba(80,90,110,0.3)'), r: 14 });
    c.save(); c.translate(x + cw / 2, y + chh - 26); c.scale(1.15, 1.15);
    if (unlocked) { ROBOT_ART[R.id](c, performance.now() / 1000, SAVE.robotLevels[R.id] || 1, { x: 0 }); }
    else { c.globalAlpha = 0.35; ROBOT_ART[R.id](c, 0, 1, { x: 0 }); c.globalAlpha = 1; }
    c.restore();
    if (!unlocked) {
      c.fillStyle = 'rgba(6,10,18,0.55)'; rr(c, x + 6, y + 6, cw - 12, chh - 12, 12); c.fill();
      c.fillStyle = '#c8d2de'; c.font = 'bold 30px Vazirmatn'; c.textAlign = 'center';
      c.fillText('🔒', x + cw / 2, y + 62);
      c.font = '13px Vazirmatn'; c.fillStyle = '#9fb0c6';
      c.fillText(T('stage') + ' ' + numStr(R.unlock), x + cw / 2, y + 88);
    } else {
      c.fillStyle = '#ffd66b'; c.font = 'bold 15px Vazirmatn'; c.textAlign = 'center';
      c.fillText(T('lvl') + ' ' + numStr(SAVE.robotLevels[R.id] || 1), x + cw / 2, y + 24);
    }
    const pb = addButton(x, y, cw, chh, () => { garageSel = i; });
  }
  /* detail panel */
  const R = ROBOT_LIST[garageSel];
  const unlocked = SAVE.robotUnlocked[R.id];
  const lvl = SAVE.robotLevels[R.id] || 1;
  const py = 108 + 2 * 166 + 6;
  panel(c, 60, py, DW - 120, DH - py - 90, { r: 18 });
  const px = DW - 240;
  c.save(); c.translate(px, py + 210); c.scale(1.6, 1.6);
  if (unlocked) ROBOT_ART[R.id](c, performance.now() / 1000, lvl, { x: 0 });
  c.restore();
  const isFa = SAVE.settings.lang === 'fa';
  c.fillStyle = '#fff'; c.textAlign = 'right'; c.font = 'bold 30px Vazirmatn';
  c.fillText(unlocked ? (isFa ? R.fa : R.en) : '???', DW - 340, py + 44);
  c.font = '19px Vazirmatn'; c.fillStyle = '#9fb0c6';
  c.fillText((isFa ? R.descFa : R.descEn), DW - 340, py + 76, 800);
  c.fillStyle = '#ffd66b'; c.font = '20px Vazirmatn';
  c.fillText(T('role') + ': ' + (isFa ? R.roleFa : R.roleEn), DW - 340, py + 106, 800);
  c.fillStyle = '#b8d8e8';
  c.fillText(T('ability') + ': ' + (isFa ? R.abFa : R.abEn), DW - 340, py + 136, 800);
  if (unlocked) {
    /* stats with before/after */
    const L = R.levels[lvl - 1], Ln = R.levels[Math.min(lvl, 2)];
    const statTxt = (k) => {
      let a, b, unit = '';
      if (k === 'hp') { a = L.hp || R.levels[0].hp; b = Ln.hp || R.levels[0].hp; unit = ''; }
      else { a = L[k]; b = Ln[k]; }
      return { a, b, changed: a !== b && lvl < 3 };
    };
    const rows = [];
    rows.push({ k: 'hp', label: T('hp') });
    if (R.mainStat === 'dmg') rows.push({ k: 'dmg', label: T('dmg') });
    if (R.mainStat === 'prod') { rows.push({ k: 'prod', label: T('prod') }); }
    if (R.mainStat === 'heal') rows.push({ k: 'heal', label: T('role') });
    if (R.mainStat === 'slow') rows.push({ k: 'slow', label: T('role') });
    if (R.mainStat === 'dur') rows.push({ k: 'dur', label: T('role') });
    let sy = py + 170;
    for (const row of rows) {
      const s = statTxt(row.k);
      if (s.a === undefined) continue;
      c.fillStyle = '#e8eef6'; c.font = '18px Vazirmatn'; c.textAlign = 'right';
      const label = row.label + ': ' + numStr(s.a) + (row.k === 'slow' ? '%' : '');
      c.fillText(label, DW - 340, sy, 400);
      if (s.changed) {
        const lw = c.measureText(label).width;
        c.fillStyle = '#6ee6a0';
        c.fillText('→ ' + numStr(s.b) + (row.k === 'slow' ? '%' : ''), DW - 340 - lw - 10, sy, 220);
      }
      sy += 28;
    }
    /* upgrade button */
    if (lvl < 3) {
      const cost = R.upCost[lvl - 1];
      const can = SAVE.bolts >= cost;
      const ub = addButton(140, py + 120, 300, 66, () => {
        if (SAVE.bolts >= cost) { SAVE.bolts -= cost; SAVE.robotLevels[R.id] = lvl + 1; persist(); AudioSys.sfx('upgrade'); burst(DW - 240, py + 140, '#ffd66b', 20, 150, 0.7, 4); }
      }, { enabled: can });
      btnDraw(c, ub, T('upgrade') + ' (' + numStr(cost) + ' ⬢)', { col: can ? '#e2952f' : '#4a5058', fs: 24, textCol: '#fff' });
      c.fillStyle = can ? '#6ee6a0' : '#ff6b6b'; c.font = '17px Vazirmatn'; c.textAlign = 'center';
      c.fillText(numStr(SAVE.bolts) + ' ⬢ ' + (can ? '✓' : '✗'), 290, py + 210);
    } else {
      c.fillStyle = '#ffd66b'; c.font = 'bold 24px Vazirmatn'; c.textAlign = 'center';
      c.fillText('★ ' + T('maxed') + ' ★', 290, py + 160);
    }
  } else {
    c.fillStyle = '#9fb0c6'; c.font = '22px Vazirmatn'; c.textAlign = 'center';
    c.fillText(T('lockedStg'), DW / 2, py + 170);
  }
  backBtn(c, () => Screen.set('menu'));
  return 'garage';
}

/* ============================================================
   COLLECTION
   ============================================================ */
let colSel = -1;
function drawCollection(c) {
  c.fillStyle = '#101a14'; c.fillRect(0, 0, DW, DH);
  title(c, T('collection'), 60, 44, '#6ee6a0');
  clearButtons();
  const cw = 220, chh = 240, gap = 20;
  const perRow = 4;
  for (let i = 0; i < 12; i++) {
    const R = ROBOT_LIST[i];
    const row = Math.floor(i / perRow), col = i % perRow;
    const x = DW / 2 - (perRow * cw + (perRow - 1) * gap) / 2 + (col * (cw + gap)) + 40;
    const y = 110 + row * (chh + gap + 16);
    const unlocked = SAVE.robotUnlocked[R.id];
    panel(c, x, y, cw, chh, { bg: 'rgba(16,26,20,0.9)', border: unlocked ? '#4a7a5e' : 'rgba(80,90,110,0.3)', r: 16 });
    c.save(); c.translate(x + cw / 2, y + chh - 40); c.scale(1.25, 1.25);
    c.globalAlpha = unlocked ? 1 : 0.3;
    ROBOT_ART[R.id](c, performance.now() / 1000, SAVE.robotLevels[R.id] || 1, { x: 0 });
    c.globalAlpha = 1;
    c.restore();
    if (!unlocked) {
      c.fillStyle = '#9fb0c6'; c.font = 'bold 22px Vazirmatn'; c.textAlign = 'center';
      c.fillText('🔒', x + cw / 2, y + 34);
      c.font = '14px Vazirmatn';
      c.fillText(T('unlockNext') + ' → ' + T('stage') + ' ' + numStr(R.unlock), x + cw / 2, y + 56);
    }
    c.fillStyle = unlocked ? '#e8eef6' : '#6b7280';
    c.font = 'bold 19px Vazirmatn'; c.textAlign = 'center';
    c.fillText(SAVE.settings.lang === 'fa' ? R.fa : R.en, x + cw / 2, y + chh - 4);
    const pb = addButton(x, y, cw, chh, () => { colSel = i; Screen.showOverlay('robotCard', R); });
  }
  backBtn(c, () => Screen.set('menu'));
  if (Screen.overlay === 'robotCard') drawRobotCardOverlay(c);
  return 'collection';
}
function drawRobotCardOverlay(c) {
  const R = Screen.overlayData;
  dim(c);
  panel(c, DW / 2 - 420, 130, 840, 620, { r: 24 });
  const isFa = SAVE.settings.lang === 'fa';
  c.fillStyle = '#ffd66b'; c.font = 'bold 34px Vazirmatn'; c.textAlign = 'center';
  c.fillText(isFa ? R.fa : R.en, DW / 2, 190);
  c.save(); c.translate(DW / 2, 400); c.scale(2.2, 2.2);
  ROBOT_ART[R.id](c, performance.now() / 1000, SAVE.robotLevels[R.id] || 1, { x: 0 });
  c.restore();
  c.fillStyle = '#9fb0c6'; c.font = '19px Vazirmatn';
  c.fillText(isFa ? R.descFa : R.descEn, DW / 2, 470, 700);
  c.fillStyle = '#ffd66b';
  c.fillText(T('role') + ': ' + (isFa ? R.roleFa : R.roleEn), DW / 2, 510);
  c.fillStyle = '#b8d8e8';
  c.fillText(T('ability') + ': ' + (isFa ? R.abFa : R.abEn), DW / 2, 545, 720);
  c.fillStyle = '#6ee6a0'; c.font = '18px Vazirmatn';
  c.fillText(T('howUse') + ': ' + (isFa ? R.useFa : R.useEn), DW / 2, 585, 720);
  c.fillStyle = '#e8eef6';
  c.fillText(T('cost') + ': ' + numStr(R.cost) + ' ' + T('spark'), DW / 2, 620);
  const b = addButton(DW / 2 - 100, 660, 200, 54, () => { colSel = -1; Screen.hideOverlay(); });
  btnDraw(c, b, T('confirm'), { col: '#e2952f', fs: 22 });
}

/* ============================================================
   SETTINGS
   ============================================================ */
function drawSettingsPanel(c) {
  const w = 700, h = 560, x = DW / 2 - w / 2, y = DH / 2 - h / 2;
  dim(c);
  panel(c, x, y, w, h, { r: 24 });
  title(c, T('settings'), y + 56, 40);
  clearButtons();
  const slider = (yy, label, key) => {
    c.fillStyle = '#e8eef6'; c.font = '22px Vazirmatn'; c.textAlign = 'right';
    c.fillText(label, x + w - 50, yy);
    const sx = x + 80, sw = w - 240, sy = yy - 8;
    c.fillStyle = 'rgba(255,255,255,0.15)'; rr(c, sx, sy, sw, 16, 8); c.fill();
    const v = SAVE.settings[key];
    c.fillStyle = '#ffd66b'; rr(c, sx, sy, sw * v, 16, 8); c.fill();
    c.beginPath(); c.arc(sx + sw * v, sy + 8, 14, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#fff'; c.beginPath(); c.arc(sx + sw * v, sy + 8, 9, 0, Math.PI * 2); c.fill();
    const sb = addButton(sx - 20, sy - 20, sw + 40, 56, (p) => {
      if (p) { SAVE.settings[key] = clamp((p.x - sx) / sw, 0, 1); AudioSys.applyVolumes(); persist(); }
    });
    sb.dragSlider = { key, sx, sw, sy };
  };
  slider(y + 130, T('music'), 'music');
  slider(y + 200, T('sfx'), 'sfx');
  /* quality */
  c.fillStyle = '#e8eef6'; c.font = '22px Vazirmatn'; c.textAlign = 'right';
  c.fillText(T('quality'), x + w - 50, y + 275);
  const qOpts = [['low', T('low')], ['med', T('med')], ['high', T('high')]];
  qOpts.forEach(([k, lbl], i) => {
    const qy = y + 250, qx = x + 60 + i * 150;
    const on = SAVE.settings.quality === k;
    const b = addButton(qx, qy, 130, 46, () => { SAVE.settings.quality = k; persist(); bgCache.theme = -1; }, { col: on ? '#e2952f' : '#4a5058' });
    btnDraw(c, b, lbl, { col: on ? '#e2952f' : '#4a5058', fs: 20, textCol: on ? '#fff' : '#c8d2de' });
  });
  /* language */
  c.fillStyle = '#e8eef6'; c.font = '22px Vazirmatn'; c.textAlign = 'right';
  c.fillText(T('lang'), x + w - 50, y + 345);
  const faB = addButton(x + 210, y + 322, 130, 46, () => { SAVE.settings.lang = 'fa'; persist(); }, { col: '#4a7a5e' });
  btnDraw(c, faB, 'فارسی', { col: SAVE.settings.lang === 'fa' ? '#4a7a5e' : '#4a5058', fs: 20, textCol: '#fff' });
  const enB = addButton(x + 60, y + 322, 130, 46, () => { SAVE.settings.lang = 'en'; persist(); }, { col: '#4a7a5e' });
  btnDraw(c, enB, 'English', { col: SAVE.settings.lang === 'en' ? '#4a7a5e' : '#4a5058', fs: 20, textCol: '#fff' });
  /* help + reset */
  const hb = addButton(x + w - 320, y + 400, 270, 52, () => { Screen.showOverlay('help'); });
  btnDraw(c, hb, T('help'), { col: '#5b7fa6', fs: 22, textCol: '#fff' });
  const rb = addButton(x + 50, y + 400, 270, 52, () => { Screen.showOverlay('confirmReset'); });
  btnDraw(c, rb, T('reset'), { col: '#8a3a34', fs: 22, textCol: '#fff' });
  const cb = addButton(DW / 2 - 100, y + h - 72, 200, 54, () => { Screen.hideOverlay(); persist(); });
  btnDraw(c, cb, T('confirm'), { col: '#e2952f', fs: 22 });
  if (Screen.overlay === 'confirmReset') {
    dim(c);
    panel(c, DW / 2 - 260, 300, 520, 240, { r: 20 });
    c.fillStyle = '#fff'; c.font = 'bold 26px Vazirmatn'; c.textAlign = 'center';
    c.fillText(T('resetQ'), DW / 2, 380);
    const yb = addButton(DW / 2 - 180, 430, 160, 54, () => { SAVE = defaultSave(); persist(); Screen.hideOverlay(); });
    btnDraw(c, yb, T('yes'), { col: '#8a3a34', fs: 22, textCol: '#fff' });
    const nb = addButton(DW / 2 + 20, 430, 160, 54, () => { Screen.hideOverlay(); });
    btnDraw(c, nb, T('no'), { col: '#4a5058', fs: 22, textCol: '#fff' });
  }
  if (Screen.overlay === 'help') {
    dim(c);
    panel(c, DW / 2 - 380, 180, 760, 480, { r: 22 });
    c.fillStyle = '#e8eef6'; c.font = '20px Vazirmatn'; c.textAlign = 'center';
    const lines = wrapText(c, T('helpText'), 690);
    let ly = 260;
    for (const ln of lines) { c.fillText(ln, DW / 2, ly); ly += 36; }
    const b = addButton(DW / 2 - 100, 560, 200, 54, () => { Screen.hideOverlay(); });
    btnDraw(c, b, T('confirm'), { col: '#e2952f', fs: 22 });
  }
}
function wrapText(c, txt, maxW) {
  const words = txt.split(' '); const lines = []; let cur = '';
  for (const w of words) {
    const t = cur ? cur + ' ' + w : w;
    if (c.measureText(t).width > maxW) { lines.push(cur); cur = w; } else cur = t;
  }
  if (cur) lines.push(cur);
  return lines;
}
function dim(c) { c.fillStyle = 'rgba(4,8,14,0.72)'; c.fillRect(0, 0, DW, DH); }

/* ============================================================
   BATTLE RENDER
   ============================================================ */
function drawBattle(c, dt) {
  const B = BATTLE;
  clearButtons();
  const shake = B.homeShake > 0 ? B.homeShake * 8 : 0;
  c.save();
  c.translate(rndR(-shake, shake), rndR(-shake, shake));
  const bg = renderBackground(B.theme);
  c.drawImage(bg, 0, 0);
  /* deploy highlights */
  if (B.selected) {
    c.fillStyle = 'rgba(255,214,107,0.13)';
    for (let l = 0; l < LANES; l++) for (let col = 0; col < COLS; col++) {
      const blocked = B.st.blocked && B.st.blocked.some(([bc, bl]) => bc === col && bl === l);
      const occupied = B.bots.some(b => !b.dead && b.col === col && b.lane === l);
      if (!blocked && !occupied) {
        c.fillStyle = 'rgba(255,214,107,0.10)';
        rr(c, FIELD_X0 + col * CELL_W + 3, FIELD_Y0 + l * CELL_H + 3, CELL_W - 6, CELL_H - 6, 8); c.fill();
        c.strokeStyle = 'rgba(255,214,107,0.4)'; c.lineWidth = 1.5;
        rr(c, FIELD_X0 + col * CELL_W + 3, FIELD_Y0 + l * CELL_H + 3, CELL_W - 6, CELL_H - 6, 8); c.stroke();
      }
    }
  }
  /* blocked cells */
  if (B.st.blocked) {
    for (const [bc, bl] of B.st.blocked) {
      const x = FIELD_X0 + bc * CELL_W, y = FIELD_Y0 + bl * CELL_H;
      c.fillStyle = 'rgba(30,24,20,0.75)';
      rr(c, x + 8, y + 8, CELL_W - 16, CELL_H - 16, 10); c.fill();
      /* rubble */
      c.fillStyle = '#4a4440';
      c.beginPath(); c.arc(x + CELL_W / 2 - 20, y + CELL_H - 30, 16, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.arc(x + CELL_W / 2 + 12, y + CELL_H - 34, 12, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.arc(x + CELL_W / 2 - 2, y + CELL_H - 44, 10, 0, Math.PI * 2); c.fill();
      c.strokeStyle = 'rgba(255,110,110,0.7)'; c.lineWidth = 3;
      c.beginPath(); c.moveTo(x + 20, y + 20); c.lineTo(x + CELL_W - 20, y + CELL_H - 20);
      c.moveTo(x + CELL_W - 20, y + 20); c.lineTo(x + 20, y + CELL_H - 20); c.stroke();
    }
  }
  /* boss warnings */
  if (B.bossWarn) {
    const wx = FIELD_X0 + B.bossWarn.col * CELL_W + CELL_W / 2;
    const wy = FIELD_Y0 + B.bossWarn.lane * CELL_H + CELL_H / 2;
    const k = 1 - B.bossWarn.t / 1.2;
    c.strokeStyle = `rgba(255,80,80,${0.4 + Math.sin(B.time * 12) * 0.3})`;
    c.lineWidth = 4;
    c.beginPath(); c.arc(wx, wy, 60 * (1 - k * 0.5), 0, Math.PI * 2); c.stroke();
    c.fillStyle = 'rgba(255,80,80,0.15)';
    c.beginPath(); c.arc(wx, wy, 55, 0, Math.PI * 2); c.fill();
  }
  if (B.shock) {
    const k = 1 - B.shock.t / 0.9;
    c.strokeStyle = `rgba(255,160,80,${(1 - k) * 0.8})`; c.lineWidth = 8;
    c.beginPath(); c.arc(B.shock.x, FIELD_Y0 + 2.5 * CELL_H, k * CELL_W * 2.6, 0, Math.PI * 2); c.stroke();
  }
  /* entities */
  for (const b of B.bots) b.draw(c, B.time);
  for (const e of B.enemies) e.draw(c, B.time);
  for (const u of B.emerg) u.draw(c, B.time);
  /* shots */
  for (const s of B.shots) {
    if (s.kind === 'bomb') {
      c.fillStyle = '#3a3d44'; c.beginPath(); c.arc(s.x, s.y, 10, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#ffd66b'; c.beginPath(); c.arc(s.x + 6, s.y - 6, 3, 0, Math.PI * 2); c.fill();
    } else if (s.kind === 'pellet') {
      c.fillStyle = '#c8d2de'; c.beginPath(); c.arc(s.x, s.y, 6, 0, Math.PI * 2); c.fill();
      c.fillStyle = 'rgba(200,210,222,0.4)'; c.beginPath(); c.arc(s.x - 12, s.y, 4, 0, Math.PI * 2); c.fill();
    } else if (s.kind === 'boltP') {
      c.save(); c.translate(s.x, s.y);
      c.fillStyle = '#d9b44a'; c.beginPath(); c.roundRect(-14, -4, 28, 8, 4); c.fill();
      c.fillStyle = '#8a93a2'; c.beginPath(); c.moveTo(14, -6); c.lineTo(22, 0); c.lineTo(14, 6); c.closePath(); c.fill();
      c.restore();
    } else if (s.kind === 'needle') {
      c.save(); c.translate(s.x, s.y);
      c.fillStyle = '#9fc4e8'; c.beginPath(); c.moveTo(-12, 0); c.lineTo(12, -4); c.lineTo(12, 4); c.closePath(); c.fill();
      c.restore();
    }
  }
  for (const bm of B.beams) {
    c.save();
    c.strokeStyle = bm.col; c.lineWidth = 6; c.globalAlpha = bm.life / 0.22;
    c.beginPath(); c.moveTo(bm.x1, bm.y1); c.lineTo(bm.x2, bm.y2); c.stroke();
    c.strokeStyle = '#fff'; c.lineWidth = 2; c.stroke();
    c.restore();
  }
  drawParticles(c);
  /* floaters */
  c.textAlign = 'center';
  for (const f of floaters) {
    c.globalAlpha = clamp(f.life, 0, 1);
    c.fillStyle = f.col; c.font = `bold ${f.size}px Vazirmatn`;
    c.fillText(f.txt, f.x, f.y);
    c.globalAlpha = 1;
  }
  c.restore();
  /* HUD */
  drawHUD(c);
  /* bottom bar */
  drawCardBar(c);
  /* emergency buttons */
  drawEmergencyBtns(c);
  /* toast */
  if (B.toastT > 0) {
    c.globalAlpha = clamp(B.toastT * 2, 0, 1);
    panel(c, DW / 2 - 240, 200, 480, 60, { r: 14, bg: 'rgba(90,30,30,0.9)' });
    c.fillStyle = '#fff'; c.font = 'bold 24px Vazirmatn'; c.textAlign = 'center';
    c.fillText(B.toast, DW / 2, 240);
    c.globalAlpha = 1;
  }
  /* tutorial */
  if (B.tutorialStep >= 0 && B.stageN === 1) {
    const tips = [T('s1t1'), T('s1t2'), T('s1t3'), T('s1t4')];
    const tip = tips[Math.min(B.tutorialStep, 3)];
    const tw = 640;
    panel(c, DW / 2 - tw / 2, 130, tw, 64, { r: 14, bg: 'rgba(20,40,70,0.92)', border: '#4ac3ff' });
    c.fillStyle = '#e8f4ff'; c.font = '21px Vazirmatn'; c.textAlign = 'center';
    c.fillText(tip, DW / 2, 172);
  }
  if (B.stageN === 2 && B.time < 8 && B.time > 2) {
    const tw = 640;
    panel(c, DW / 2 - tw / 2, 130, tw, 64, { r: 14, bg: 'rgba(20,40,70,0.92)', border: '#4ac3ff' });
    c.fillStyle = '#e8f4ff'; c.font = '21px Vazirmatn'; c.textAlign = 'center';
    c.fillText(T('s2t'), DW / 2, 172);
  }
  if (B.stageN === 3 && B.time < 8 && B.time > 2) {
    const tw = 640;
    panel(c, DW / 2 - tw / 2, 130, tw, 64, { r: 14, bg: 'rgba(20,40,70,0.92)', border: '#4ac3ff' });
    c.fillStyle = '#e8f4ff'; c.font = '21px Vazirmatn'; c.textAlign = 'center';
    c.fillText(T('s3t'), DW / 2, 172);
  }
  /* camo warning */
  if (B.st.camo && B.enemies.some(e => e.isCamoHidden() && B.time < 6)) {
    panel(c, DW / 2 - 280, 110, 560, 50, { r: 12, bg: 'rgba(60,20,60,0.9)', border: '#c98db4' });
    c.fillStyle = '#f2d8ec'; c.font = '18px Vazirmatn'; c.textAlign = 'center';
    c.fillText(T('camoWarn'), DW / 2, 142);
  }
  /* briefing overlay */
  if (Screen.overlay === 'briefing') drawBriefing(c);
  if (Screen.overlay === 'unlockCard') drawUnlockCard(c);
  if (Screen.overlay === 'pause') drawPausePanel(c);
  if (Screen.overlay === 'results') drawResults(c);
  if (Screen.overlay === 'defeat') drawDefeat(c);
  if (Screen.overlay === 'seasonEnd') drawSeasonEnd(c);
  if (Screen.overlay === 'exitGame') drawExit(c);
  return 'battle';
}
function drawHUD(c) {
  const B = BATTLE;
  c.fillStyle = 'rgba(8,12,20,0.82)'; c.fillRect(0, 0, DW, HUD_H);
  /* home health (RTL: right side) */
  const hpX = DW - 40;
  c.fillStyle = '#e8eef6'; c.font = '16px Vazirmatn'; c.textAlign = 'right';
  c.fillText(T('homeHP'), hpX - 230, 30);
  c.fillStyle = 'rgba(255,255,255,0.15)'; rr(c, hpX - 540, 38, 540, 22, 11); c.fill();
  const hpk = clamp(B.homeHp / B.maxHomeHp, 0, 1);
  c.fillStyle = hpk > 0.4 ? '#6ee6a0' : '#ff5e5e';
  rr(c, hpX - 540, 38, 540 * hpk, 22, 11); c.fill();
  iconHome(c, hpX - 556, 50, 0.9);
  /* spark counter */
  c.fillStyle = '#ffd66b'; c.beginPath(); c.arc(hpX - 600, 50, 20, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#b0453a'; c.font = 'bold 20px Vazirmatn'; c.textAlign = 'center'; c.fillText('⚡', hpX - 600, 57);
  c.fillStyle = '#ffd66b'; c.font = 'bold 28px Vazirmatn';
  c.fillText(numStr(Math.floor(B.spark)), hpX - 640, 60);
  /* stage + wave */
  c.fillStyle = '#e8eef6'; c.font = 'bold 20px Vazirmatn';
  c.fillText(T('stage') + ' ' + numStr(B.stageN) + ' — ' + (SAVE.settings.lang === 'fa' ? B.st.nameFa : B.st.nameEn), DW - 620, 34);
  c.fillStyle = '#9fb0c6'; c.font = '17px Vazirmatn';
  c.fillText(T('wave') + ': ' + numStr(Math.min(B.wave + 1, B.waveTotal)) + '/' + numStr(B.waveTotal), DW - 620, 62);
  /* kills */
  c.fillStyle = '#9fb0c6';
  c.fillText(T('killCount') + ': ' + numStr(B.kills), DW - 1000, 60);
  /* pause button */
  const pb = addButton(DW - 64, 14, 50, 50, () => { if (!B.over) { B.paused = true; Screen.showOverlay('pause'); } }, { col: '#4a5058' });
  c.save();
  c.fillStyle = 'rgba(255,255,255,0.9)';
  rr(c, DW - 64, 14, 50, 50, 12); c.fill();
  c.fillStyle = '#0e1520';
  c.fillRect(DW - 50, 26, 7, 26); c.fillRect(DW - 38, 26, 7, 26);
  c.restore();
  /* boss bar */
  if (B.st.boss) {
    const boss = B.enemies.find(e => e.type === 'boss');
    if (boss && !boss.dead) {
      panel(c, DW / 2 - 320, 12, 640, 40, { r: 12, bg: 'rgba(40,10,14,0.9)', border: '#ff5e5e' });
      const k = clamp(boss.hp / boss.maxHp, 0, 1);
      c.fillStyle = 'rgba(255,255,255,0.12)'; rr(c, DW / 2 - 300, 22, 600, 20, 10); c.fill();
      c.fillStyle = boss.phase === 3 ? '#ff2e2e' : boss.phase === 2 ? '#ff7a3c' : '#e04b4b';
      rr(c, DW / 2 - 300, 22, 600 * k, 20, 10); c.fill();
      c.fillStyle = '#fff'; c.font = 'bold 15px Vazirmatn'; c.textAlign = 'center';
      c.fillText(SAVE.settings.lang === 'fa' ? 'نگهبان هسته — فاز ' + faNum(boss.phase) : 'Core Guardian — Phase ' + boss.phase, DW / 2, 37);
    }
  }
}
function drawCardBar(c) {
  const B = BATTLE;
  c.fillStyle = 'rgba(8,12,20,0.88)'; c.fillRect(0, DH - BAR_H, DW, BAR_H);
  /* RTL: cards laid right to left */
  const avail = ROBOT_LIST.filter(r => SAVE.robotUnlocked[r.id]);
  const n = avail.length;
  const cw = Math.min(150, (DW - 40) / n - 10);
  const cy = DH - BAR_H + 14, chh = BAR_H - 28;
  avail.forEach((R, i) => {
    const x = DW - 20 - (i + 1) * cw - i * 8;
    const cool = B.cardCool[R.id] || 0;
    const can = B.spark >= R.cost && cool <= 0;
    const sel = B.selected === R.id;
    c.save();
    panel(c, x, cy, cw, chh, { bg: sel ? 'rgba(80,110,60,0.95)' : can ? 'rgba(28,38,56,0.95)' : 'rgba(18,22,32,0.9)', border: sel ? '#6ee6a0' : can ? 'rgba(120,150,200,0.5)' : 'rgba(70,80,100,0.3)', r: 14 });
    c.save(); c.translate(x + cw / 2, cy + chh - 46); c.scale(0.95, 0.95);
    ROBOT_ART[R.id](c, B.time, SAVE.robotLevels[R.id] || 1, { x: 0 });
    c.restore();
    if (cool > 0) {
      c.fillStyle = 'rgba(8,12,20,0.7)';
      rr(c, x + 4, cy + 4, cw - 8, chh - 8, 12); c.fill();
      c.fillStyle = '#c8d2de'; c.font = 'bold 30px Vazirmatn'; c.textAlign = 'center';
      c.fillText(numStr(Math.ceil(cool)), x + cw / 2, cy + chh / 2 - 10);
    }
    c.fillStyle = can ? '#ffd66b' : '#ff6b6b'; c.font = 'bold 19px Vazirmatn'; c.textAlign = 'center';
    c.fillText('⚡' + numStr(R.cost), x + cw / 2, cy + 22);
    c.fillStyle = '#c8d2de'; c.font = '13px Vazirmatn';
    c.fillText(SAVE.settings.lang === 'fa' ? R.fa : R.en, x + cw / 2, cy + chh - 6, cw - 12);
    c.restore();
    const b = addButton(x, cy, cw, chh, () => {
      if (!can) { if (B.spark < R.cost) { showToast(T('noSpark')); AudioSys.sfx('hit'); } return; }
      B.selected = (B.selected === R.id) ? null : R.id;
    });
  });
  /* deselect hint */
  if (B.selected) {
    c.fillStyle = '#6ee6a0'; c.font = '18px Vazirmatn'; c.textAlign = 'center';
    c.fillText(T('s1t2'), DW / 2, DH - BAR_H + 24);
  }
}
function drawEmergencyBtns(c) {
  const B = BATTLE;
  for (let l = 0; l < LANES; l++) {
    const used = B.laneUsed[l];
    const y = laneCenterY(l);
    const x = 92;
    const b = addButton(x - 30, y - 26, 60, 52, () => {
      if (used || B.over) return;
      B.laneUsed[l] = true;
      B.emerg.push(new EmergencyUnit(l));
      AudioSys.sfx('emergency');
    }, { enabled: !used });
    c.save();
    c.globalAlpha = used ? 0.25 : 1;
    c.fillStyle = used ? '#3a3d44' : '#e04b4b';
    rr(c, x - 30, y - 26, 60, 52, 12); c.fill();
    c.strokeStyle = '#ffd66b'; c.lineWidth = 2; rr(c, x - 30, y - 26, 60, 52, 12); c.stroke();
    iconWrench(c, x, y - 8, 0.9);
    c.fillStyle = '#ffd66b'; c.font = 'bold 12px Vazirmatn'; c.textAlign = 'center';
    c.fillText(T('eBtn'), x, y + 18);
    c.restore();
  }
}
/* pause */
function drawPausePanel(c) {
  dim(c);
  const w = 460, h = 420, x = DW / 2 - w / 2, y = DH / 2 - h / 2;
  panel(c, x, y, w, h, { r: 24 });
  title(c, T('pause'), y + 70, 44);
  clearButtons();
  const items = [
    [T('resume'), '#4a7a5e', () => { BATTLE.paused = false; Screen.hideOverlay(); }],
    [T('restart'), '#5b7fa6', () => { const s = BATTLE.stageN; Screen.hideOverlay(); startBattle(s); }],
    [T('settings'), '#6b7280', () => { Screen.showOverlay('pauseSettings'); }],
    [T('toMenu'), '#8a3a34', () => { BATTLE.paused = false; BATTLE.over = true; Screen.hideOverlay(); Screen.set('menu'); AudioSys.startMusic('menu'); }],
  ];
  let yy = y + 120;
  for (const [lbl, col, fn] of items) {
    const b = addButton(x + 80, yy, w - 160, 60, fn);
    btnDraw(c, b, lbl, { col, fs: 24, textCol: '#fff' });
    yy += 72;
  }
  if (Screen.overlay === 'pauseSettings') { BATTLE.paused = true; drawSettingsPanel(c); }
}
/* results */
function drawResults(c) {
  const B = BATTLE, R = B.result;
  dim(c);
  const w = 720, h = 560, x = DW / 2 - w / 2, y = 110;
  panel(c, x, y, w, h, { r: 26, bg: 'rgba(16,26,20,0.95)', border: '#4a7a5e' });
  title(c, T('victory'), y + 74, 50, '#6ee6a0');
  drawStars(c, DW / 2, y + 128, 3, 20, R.stars);
  /* arin + robots celebrating */
  c.save(); c.translate(x + 170, y + 240); c.scale(1.15, 1.15);
  ROBOT_ART.canSlinger(c, B.time, 2, { x: 0 });
  c.restore();
  c.save(); c.translate(x + 330, y + 238); c.scale(1.1, 1.1);
  ROBOT_ART.dynamo(c, B.time, 1, { x: 0 });
  c.restore();
  if (rnd() < 0.2) burst(x + 250, y + 150, '#ffd66b', 3, 60, 0.8, 3);
  /* stats + breakdown, single RTL column on the right */
  const bx = x + w - 60;
  c.textAlign = 'right';
  c.fillStyle = '#e8eef6'; c.font = '21px Vazirmatn';
  c.fillText(T('killCount') + ': ' + numStr(B.kills), bx, y + 205);
  c.fillText(T('homeHP') + ': ' + numStr(Math.round(R.hpPct * 100)) + '٪', bx, y + 238);
  c.fillStyle = '#ffd66b'; c.font = '19px Vazirmatn';
  c.fillText(T('reward') + ':', bx, y + 282);
  c.fillStyle = '#9fb0c6'; c.font = '17px Vazirmatn';
  c.fillText(T('base') + ' +' + numStr(R.base), bx, y + 312);
  c.fillText(T('hpBonus') + ' +' + numStr(R.hpBonus), bx, y + 338);
  c.fillText(T('killBonus') + ' +' + numStr(R.killBonus), bx, y + 364);
  /* total bar */
  c.fillStyle = 'rgba(255,214,107,0.12)'; rr(c, x + 50, y + 396, w - 100, 58, 14); c.fill();
  c.fillStyle = '#ffd66b'; c.font = 'bold 28px Vazirmatn'; c.textAlign = 'center';
  c.fillText(T('total') + ': ⬢ ' + numStr(R.total), DW / 2, y + 425);
  clearButtons();
  const nb = addButton(x + w / 2 - 260, y + h - 90, 240, 56, () => {
    Screen.hideOverlay();
    const nxt = Math.min(20, B.stageN + 1);
    const unlockR = stageRobotUnlock(B.stageN);
    if (unlockR) Screen.showOverlay('unlockCard', unlockR);
    else if (nxt <= 20) startBattle(nxt);
    else Screen.set('menu');
  }, { col: '#4a7a5e' });
  btnDraw(c, nb, B.stageN < 20 ? T('next') : T('confirm'), { col: '#4a7a5e', fs: 22, textCol: '#fff' });
  const rp = addButton(x + w / 2 + 20, y + h - 90, 240, 56, () => { const s = B.stageN; Screen.hideOverlay(); startBattle(s); }, { col: '#5b7fa6' });
  btnDraw(c, rp, T('replay'), { col: '#5b7fa6', fs: 22, textCol: '#fff' });
  if (Screen.overlay === 'unlockCard') drawUnlockCard(c);
  if (Screen.overlay === 'seasonEnd') drawSeasonEnd(c);
}
function drawUnlockCard(c) {
  const R = Screen.overlayData;
  dim(c);
  const w = 640, h = 600, x = DW / 2 - w / 2, y = 100;
  panel(c, x, y, w, h, { r: 26, bg: 'rgba(40,30,10,0.96)', border: '#ffd66b' });
  title(c, T('newRobotCard'), y + 56, 38, '#ffd66b');
  c.save(); c.translate(DW / 2, y + 210); c.scale(1.8, 1.8);
  ROBOT_ART[R.id](c, performance.now() / 1000, 1, { x: 0 });
  c.restore();
  const isFa = SAVE.settings.lang === 'fa';
  c.fillStyle = '#fff'; c.font = 'bold 30px Vazirmatn'; c.textAlign = 'center';
  c.fillText(isFa ? R.fa : R.en, DW / 2, y + 330);
  c.fillStyle = '#ffd66b'; c.font = '19px Vazirmatn';
  c.fillText((isFa ? R.roleFa : R.roleEn), DW / 2, y + 362);
  c.fillStyle = '#e8eef6'; c.font = '17px Vazirmatn';
  let ly = y + 396;
  for (const ln of wrapText(c, T('ability') + ': ' + (isFa ? R.abFa : R.abEn), 540)) { c.fillText(ln, DW / 2, ly); ly += 26; }
  ly += 6;
  c.fillStyle = '#9fb0c6';
  for (const ln of wrapText(c, T('howUse') + ': ' + (isFa ? R.useFa : R.useEn), 540)) { c.fillText(ln, DW / 2, ly); ly += 24; }
  clearButtons();
  const b = addButton(DW / 2 - 110, y + h - 76, 220, 54, () => {
    Screen.hideOverlay();
    /* route after unlock card */
    if (BATTLE && BATTLE.over && BATTLE.won) {
      if (BATTLE.stageN === 20) Screen.showOverlay('seasonEnd');
      else startBattle(Math.min(20, BATTLE.stageN + 1));
    } else Screen.set('menu');
  }, { col: '#e2952f' });
  btnDraw(c, b, T('tapCont'), { col: '#e2952f', fs: 20, textCol: '#fff' });
}
function drawBriefing(c) {
  const id = BATTLE.briefing;
  const D = ENEMY_LIST[id];
  const isFa = SAVE.settings.lang === 'fa';
  dim(c);
  const w = 680, h = 600, x = DW / 2 - w / 2, y = 100;
  panel(c, x, y, w, h, { r: 26, bg: 'rgba(30,14,16,0.96)', border: '#ff5e5e' });
  title(c, T('enemyBrief'), y + 56, 38, '#ff5e5e');
  c.save(); c.translate(DW / 2, y + 200); c.scale(1.6, 1.6);
  ENEMY_ART[id](c, performance.now() / 1000, { x: performance.now() / 60, camo: false, shieldT: 0, cmdT: 0, pulseT: 0, healT: 0, chargeT: 0, phase: 1, boostT: 0 });
  c.restore();
  c.fillStyle = '#fff'; c.font = 'bold 28px Vazirmatn'; c.textAlign = 'center';
  c.fillText(isFa ? D.fa : D.en, DW / 2, y + 330);
  c.fillStyle = '#e8eef6'; c.font = '17px Vazirmatn';
  let ly = y + 372;
  for (const ln of wrapText(c, isFa ? D.briefFa : D.briefEn, 580)) { c.fillText(ln, DW / 2, ly); ly += 25; }
  ly += 8;
  c.fillStyle = '#6ee6a0';
  for (const ln of wrapText(c, (isFa ? 'راه مقابله: ' : 'Counter: ') + (isFa ? D.counterFa : D.counterEn), 580)) { c.fillText(ln, DW / 2, ly); ly += 25; }
  clearButtons();
  const b = addButton(DW / 2 - 110, y + h - 76, 220, 54, () => { BATTLE.briefing = null; SAVE.briefingsSeen[id] = true; persist(); Screen.hideOverlay(); }, { col: '#e2952f' });
  btnDraw(c, b, T('skip'), { col: '#e2952f', fs: 20, textCol: '#fff' });
}
function drawDefeat(c) {
  const B = BATTLE;
  dim(c);
  const w = 560, h = 420, x = DW / 2 - w / 2, y = 200;
  panel(c, x, y, w, h, { r: 26, bg: 'rgba(30,12,12,0.95)', border: '#ff5e5e' });
  title(c, T('defeat'), y + 90, 56, '#ff5e5e');
  c.fillStyle = '#e8eef6'; c.font = '20px Vazirmatn'; c.textAlign = 'center';
  c.fillText(T('homeHP') + ': ۰', DW / 2, y + 150);
  clearButtons();
  const items = [
    [T('retry'), '#e2952f', () => { const s = B.stageN; Screen.hideOverlay(); startBattle(s); }],
    [T('toStages'), '#5b7fa6', () => { Screen.hideOverlay(); Screen.set('stageSelect'); AudioSys.startMusic('menu'); }],
    [T('toMenu'), '#8a3a34', () => { Screen.hideOverlay(); Screen.set('menu'); }],
  ];
  let yy = y + 190;
  for (const [lbl, col, fn] of items) {
    const b = addButton(x + 90, yy, w - 180, 58, fn);
    btnDraw(c, b, lbl, { col, fs: 23, textCol: '#fff' });
    yy += 70;
  }
}
function drawSeasonEnd(c) {
  dim(c);
  const w = 760, h = 640, x = DW / 2 - w / 2, y = 90;
  panel(c, x, y, w, h, { r: 26, bg: 'rgba(10,20,14,0.97)', border: '#ffd66b' });
  title(c, T('seasonDone'), y + 90, 48, '#ffd66b');
  /* robots lineup */
  const ids = ['canSlinger', 'dynamo', 'spring', 'barrel', 'window'];
  ids.forEach((id, i) => {
    c.save(); c.translate(x + 130 + i * 125, y + 240); c.scale(1.15, 1.15);
    ROBOT_ART[id](c, performance.now() / 1000 + i, 2, { x: 0 });
    c.restore();
  });
  panel(c, x + 80, y + 300, w - 160, 120, { r: 16, bg: 'rgba(40,40,10,0.8)', border: '#6ee6a0' });
  c.fillStyle = '#6ee6a0'; c.font = '19px Vazirmatn'; c.textAlign = 'center';
  const msg = T('encMsg');
  const lines = wrapText(c, msg, w - 200);
  let ly = y + 340;
  for (const ln of lines) { c.fillText(ln, DW / 2, ly); ly += 30; }
  c.fillStyle = '#ffd66b'; c.font = 'bold 24px Vazirmatn';
  c.fillText(T('s2teaser'), DW / 2, y + 480);
  c.fillStyle = '#9fb0c6'; c.font = '18px Vazirmatn';
  c.fillText(T('replaysUnlockedAll'), DW / 2, y + 520);
  clearButtons();
  const b = addButton(DW / 2 - 130, y + h - 80, 260, 58, () => {
    Screen.hideOverlay();
    Screen.set('menu');
    AudioSys.startMusic('menu');
  }, { col: '#e2952f' });
  btnDraw(c, b, T('tapCont'), { col: '#e2952f', fs: 21, textCol: '#fff' });
}
function drawExit(c) {
  c.fillStyle = '#060a12'; c.fillRect(0, 0, DW, DH);
  c.fillStyle = '#ffd66b'; c.font = 'bold 40px Vazirmatn'; c.textAlign = 'center';
  c.fillText(T('bye'), DW / 2, DH / 2 - 20);
  c.fillStyle = '#9fb0c6'; c.font = '20px Vazirmatn';
  c.fillText(T('exitTip'), DW / 2, DH / 2 + 30);
  clearButtons();
  addButton(0, 0, DW, DH, () => {
    if (window.AndroidBridge && AndroidBridge.exit) AndroidBridge.exit();
  });
}

/* ============================================================
   MAIN LOOP
   ============================================================ */
let lastT = 0;
function frame(ts) {
  const dt = Math.min(0.05, (ts - lastT) / 1000 || 0.016);
  lastT = ts;
  ctx.save();
  ctx.setTransform(VIEW.s, 0, 0, VIEW.s, VIEW.ox, VIEW.oy);
  /* letterbox background */
  ctx.fillStyle = '#060a12';
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
  /* portrait guard */
  if (VIEW.cssS && window.innerWidth < window.innerHeight * 0.99) {
    ctx.fillStyle = '#0a1220'; ctx.fillRect(0, 0, DW, DH);
    iconHome(ctx, DW / 2, 260, 3);
    title(ctx, T('rotate'), 450, 52);
    ctx.fillStyle = '#9fb0c6'; ctx.font = '24px Vazirmatn'; ctx.textAlign = 'center';
    ctx.fillText(T('rotateSub'), DW / 2, 520);
    /* animated rotate hint */
    const k = (Math.sin(ts / 600) + 1) / 2;
    ctx.save(); ctx.translate(DW / 2, 640); ctx.rotate(k * Math.PI / 2 - Math.PI / 4);
    ctx.strokeStyle = '#ffd66b'; ctx.lineWidth = 6; ctx.strokeRect(-60, -36, 120, 72);
    ctx.restore();
    ctx.restore();
    requestAnimationFrame(frame);
    return;
  }
  let mode = Screen.cur;
  if (Screen.overlay === 'settings' || Screen.overlay === 'pauseSettings') {
    if (Screen.cur === 'battle') { drawBattle(ctx, dt); drawSettingsPanel(ctx); }
    else { drawMainMenu(ctx, 0); drawSettingsPanel(ctx); }
  } else if (Screen.cur === 'menu') mode = drawMainMenu(ctx, dt);
  else if (Screen.cur === 'story') mode = drawStory(ctx);
  else if (Screen.cur === 'stageSelect') mode = drawStageSelect(ctx);
  else if (Screen.cur === 'garage') mode = drawGarage(ctx, dt);
  else if (Screen.cur === 'collection') mode = drawCollection(ctx);
  else if (Screen.cur === 'battle') {
    updateBattle(dt);
    mode = drawBattle(ctx, dt);
    /* auto-show briefing at battle start */
    if (BATTLE.briefing && Screen.overlay !== 'briefing') Screen.showOverlay('briefing');
  } else if (Screen.cur === 'boot') {
    ctx.fillStyle = '#060a12'; ctx.fillRect(0, 0, DW, DH);
    title(ctx, T('title'), 380, 72);
    ctx.fillStyle = '#9fb0c6'; ctx.font = '26px Vazirmatn'; ctx.textAlign = 'center';
    ctx.fillText(T('tapCont'), DW / 2, 470);
    clearButtons();
    addButton(0, 0, DW, DH, () => { AudioSys.init(); Screen.set('menu'); });
  } else {
    mode = drawMainMenu(ctx, dt);
  }
  updateParticles(dt);
  ctx.restore();
  requestAnimationFrame(frame);
}

/* ---------- boot ---------- */
loadSave();
Screen.set('boot');
document.getElementById('boot').style.display = 'none';
requestAnimationFrame(frame);
