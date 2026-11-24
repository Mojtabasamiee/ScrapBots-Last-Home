/* ============================================================
   ART — vector-drawn characters, environments, effects
   Player robots face RIGHT (+x), enemies face LEFT (−x).
   ============================================================ */
const SCRAP = { orange: '#c96a2a', orange2: '#a8551f', yellow: '#d9b44a', gray: '#8a8f98', gray2: '#5d626b', blue: '#5b7fa6', rust: '#7e4a22', tape: '#b8b0a0', dark: '#3a3d44' };
const GLOSS = { white: '#eef2f7', silver: '#cdd6e0', pblue: '#9fc4e8', violet: '#8a6fd1', red: '#e04b4b', dark2: '#2b3242', led: '#4ac3ff' };

function wheelDraw(c, x, y, r, ang, opts) {
  opts = opts || {};
  c.save(); c.translate(x, y); c.rotate(ang);
  c.fillStyle = opts.tire || '#22242a';
  c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2); c.fill();
  c.fillStyle = opts.rim || '#9aa1ad';
  c.beginPath(); c.arc(0, 0, r * 0.62, 0, Math.PI * 2); c.fill();
  c.strokeStyle = opts.spoke || '#3a3d44'; c.lineWidth = Math.max(1.5, r * 0.16);
  for (let i = 0; i < 4; i++) {
    c.beginPath(); c.moveTo(-r * 0.5, 0); c.lineTo(r * 0.5, 0);
    c.stroke(); c.rotate(Math.PI / 4);
  }
  c.fillStyle = opts.hub || '#2e3138';
  c.beginPath(); c.arc(0, 0, r * 0.2, 0, Math.PI * 2); c.fill();
  c.restore();
}
function trackDraw(c, x, y, w, h, ang) {
  c.save(); c.translate(x, y);
  c.fillStyle = '#23262d';
  c.beginPath(); c.roundRect(-w / 2, -h / 2, w, h, h / 2); c.fill();
  const n = Math.max(4, Math.floor(w / (h * 0.9)));
  for (let i = 0; i < n; i++) {
    const px = -w / 2 + h / 2 + (w - h) * i / Math.max(1, n - 1);
    wheelDraw(c, px, 0, h * 0.3, ang, { rim: '#8a93a2' });
  }
  c.strokeStyle = '#3d434f'; c.lineWidth = 2;
  c.beginPath(); c.roundRect(-w / 2, -h / 2, w, h, h / 2); c.stroke();
  c.restore();
}
function boltHead(c, x, y, r) {
  c.fillStyle = '#b9c1cc'; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
  c.strokeStyle = '#5d626b'; c.lineWidth = 1.5; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.stroke();
  c.beginPath(); c.moveTo(x - r * 0.7, y); c.lineTo(x + r * 0.7, y); c.stroke();
}
function scratchLine(c, x1, y1, x2, y2, col) {
  c.strokeStyle = col; c.lineWidth = 1; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
}

/* ---------- PLAYER ROBOT ART (origin at feet-center, facing +x) ---------- */
const ROBOT_ART = {
  canSlinger(c, t, lvl, st) {
    const recoil = st && st.firing ? 5 : 0;
    wheelDraw(c, -22, -14, 15, st ? -st.x * 0.06 : 0, { rim: '#c9a54e' });
    wheelDraw(c, 20, -13, 12, st ? -st.x * 0.06 : 0, { rim: '#7fa3c4' });
    c.fillStyle = SCRAP.orange; c.beginPath(); c.roundRect(-26, -58, 52, 44, 7); c.fill();
    c.fillStyle = SCRAP.orange2; c.fillRect(-26, -58, 52, 7);
    c.strokeStyle = SCRAP.rust; c.lineWidth = 2;
    for (let i = -1; i <= 1; i++) { c.beginPath(); c.moveTo(-24, -46 + i * 11); c.lineTo(24, -46 + i * 11); c.stroke(); }
    scratchLine(c, -18, -52, -10, -30, '#e0b98a'); scratchLine(c, 8, -50, 15, -32, '#8a5a30');
    c.fillStyle = SCRAP.gray2; c.fillRect(26 - recoil, -50, 20, 8);
    c.fillStyle = SCRAP.gray; c.fillRect(42 - recoil, -52, 10, 12);
    c.fillStyle = SCRAP.yellow; c.beginPath(); c.arc(48 - recoil, -46, 4, 0, Math.PI * 2); c.fill();
    c.save(); c.translate(-14, -62); c.rotate(-0.15);
    c.fillStyle = SCRAP.gray; c.beginPath(); c.roundRect(-7, -12, 14, 16, 3); c.fill();
    c.fillStyle = '#ffe9a8'; c.beginPath(); c.arc(0, 4, 5, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#ffcf5e'; c.beginPath(); c.arc(0, 4, 2.5, 0, Math.PI * 2); c.fill(); c.restore();
    c.strokeStyle = '#e04b4b'; c.lineWidth = 2.4;
    c.beginPath(); c.moveTo(-26, -40); c.quadraticCurveTo(-36, -36, -34, -26); c.stroke();
    c.strokeStyle = '#4ac3ff';
    c.beginPath(); c.moveTo(-26, -36); c.quadraticCurveTo(-38, -30, -33, -20); c.stroke();
    c.fillStyle = SCRAP.gray; c.save(); c.translate(12, -62); c.rotate(0.6);
    c.beginPath(); c.moveTo(0, 0); c.lineTo(12, 0); c.lineTo(12, 5); c.lineTo(0, 5); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(12, 2.5); c.lineTo(18, 0); c.lineTo(12, 5); c.closePath(); c.fill(); c.restore();
    boltHead(c, -20, -22, 3.5); boltHead(c, 16, -20, 3);
    c.fillStyle = SCRAP.tape; c.fillRect(-24, -30, 12, 6);
    if (lvl >= 2) { c.fillStyle = '#4ac3ff'; c.beginPath(); c.arc(-6, -26, 3, 0, Math.PI * 2); c.fill(); }
    if (lvl >= 3) { c.fillStyle = SCRAP.yellow; c.fillRect(-4, -66, 10, 4); c.fillStyle = '#ffe9a8'; c.fillRect(-3, -70, 8, 4); }
  },
  dynamo(c, t, lvl, st) {
    wheelDraw(c, -26, -12, 12, st ? -st.x * 0.06 : 0, { rim: '#c96a2a' });
    wheelDraw(c, -8, -11, 10, st ? -st.x * 0.06 : 0, { rim: '#5b7fa6' });
    wheelDraw(c, 10, -11, 11, st ? -st.x * 0.06 : 0, { rim: '#c9a54e' });
    wheelDraw(c, 26, -12, 12, st ? -st.x * 0.06 : 0, { rim: '#7fa3c4' });
    c.fillStyle = '#4a6b4f'; c.beginPath(); c.roundRect(-30, -52, 60, 40, 6); c.fill();
    c.fillStyle = '#3a553f'; c.beginPath(); c.roundRect(-30, -52, 60, 8, 6); c.fill();
    c.strokeStyle = '#2c3f31'; c.lineWidth = 1.5;
    for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(-22, -40 + i * 10); c.lineTo(22, -40 + i * 10); c.stroke(); }
    c.save(); c.translate(2, -60); c.rotate(-0.18);
    c.fillStyle = '#2e4a6b'; c.fillRect(-18, -12, 36, 13);
    c.strokeStyle = '#87b7e0'; c.lineWidth = 1.4;
    for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(-18 + i * 9 + 4, -12); c.lineTo(-18 + i * 9 + 4, 1); c.stroke(); }
    c.fillStyle = 'rgba(160,210,255,0.5)'; c.beginPath(); c.moveTo(-18, -12); c.lineTo(-6, -12); c.lineTo(-12, 1); c.lineTo(-18, 1); c.closePath(); c.fill();
    c.restore();
    c.save(); c.translate(-34, -34);
    c.rotate(t * 3);
    c.fillStyle = SCRAP.gray; c.beginPath(); c.arc(0, 0, 9, 0, Math.PI * 2); c.fill();
    c.fillStyle = SCRAP.gray2; c.fillRect(-2, -9, 4, 18);
    c.restore();
    c.strokeStyle = SCRAP.orange; c.lineWidth = 2.5;
    c.beginPath(); c.moveTo(-30, -34); c.lineTo(-26, -34); c.stroke();
    const blink = (Math.sin(t * 5) + 1) / 2;
    c.fillStyle = `rgba(255,214,90,${0.4 + blink * 0.6})`;
    c.beginPath(); c.arc(14, -58, 5, 0, Math.PI * 2); c.fill();
    c.fillStyle = SCRAP.dark; c.beginPath(); c.arc(14, -58, 3, 0, Math.PI * 2); c.fill();
    c.strokeStyle = '#e04b4b'; c.lineWidth = 2; c.beginPath(); c.moveTo(30, -46); c.quadraticCurveTo(40, -42, 38, -30); c.stroke();
    if (lvl >= 2) { c.fillStyle = '#ffe9a8'; c.beginPath(); c.arc(-14, -46, 3, 0, Math.PI * 2); c.fill(); }
    if (lvl >= 3) { c.fillStyle = SCRAP.blue; c.fillRect(-8, -26, 16, 5); }
  },
  spring(c, t, lvl, st, ext) {
    ext = ext || 0;
    wheelDraw(c, -20, -12, 13, st ? -st.x * 0.06 : 0, { rim: '#d9b44a' });
    wheelDraw(c, 18, -12, 13, st ? -st.x * 0.06 : 0, { rim: '#8a8f98' });
    c.fillStyle = SCRAP.gray2; c.beginPath(); c.roundRect(-28, -24, 56, 12, 4); c.fill();
    c.strokeStyle = SCRAP.gray; c.lineWidth = 4;
    const coils = 5, top = -66, bot = -24, mid = bot + (top - bot) * 0.5 + ext * 10;
    c.beginPath(); c.moveTo(-26 + ext * 6, bot);
    for (let i = 0; i < coils; i++) {
      const yy = bot + (top - bot) * i / coils;
      c.quadraticCurveTo(-34 + ext * 8 - i * 0, yy + 7, -26 + ext * 6, yy + (top - bot) / coils);
    }
    c.stroke();
    c.strokeStyle = SCRAP.orange2; c.lineWidth = 3;
    c.beginPath(); c.moveTo(-26 + ext * 6, bot);
    for (let i = 0; i < coils; i++) {
      const yy = bot + (top - bot) * i / coils;
      c.quadraticCurveTo(-18 + ext * 4, yy + 7, -26 + ext * 6, yy + (top - bot) / coils);
    }
    c.stroke();
    c.fillStyle = SCRAP.blue; c.beginPath(); c.roundRect(-20 + ext * 6, -80, 40, 16, 5); c.fill();
    c.fillStyle = '#d9e6f2'; c.beginPath(); c.arc(-2 + ext * 6, -72, 4.5, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#39485e'; c.beginPath(); c.arc(6 + ext * 6, -72, 3, 0, Math.PI * 2); c.fill();
    c.fillStyle = SCRAP.gray; c.fillRect(24 + ext * 6, -58, 14, 30);
    c.fillStyle = SCRAP.orange; c.beginPath(); c.roundRect(34 + ext * 6, -62, 10, 38, 3); c.fill();
    c.strokeStyle = SCRAP.yellow; c.lineWidth = 3;
    c.beginPath(); c.moveTo(-14, -36); c.lineTo(-30, -50); c.stroke();
    c.beginPath(); c.moveTo(6, -36); c.lineTo(16, -52); c.stroke();
    if (lvl >= 2) { boltHead(c, -12, -20, 3.5); boltHead(c, 10, -20, 3.5); }
    if (lvl >= 3) { c.fillStyle = SCRAP.yellow; c.fillRect(-30 + ext * 6, -18, 60, 4); }
  },
  barrel(c, t, lvl, st) {
    const recoil = st && st.firing ? 6 : 0;
    wheelDraw(c, -24, -16, 18, st ? -st.x * 0.05 : 0, { rim: '#c96a2a' });
    wheelDraw(c, 20, -16, 18, st ? -st.x * 0.05 : 0, { rim: '#5b7fa6' });
    wheelDraw(c, -34, -10, 9, st ? -st.x * 0.08 : 0, {});
    c.fillStyle = '#7a5230'; c.beginPath(); c.roundRect(-28, -66, 56, 50, 8); c.fill();
    c.fillStyle = '#65431f'; c.fillRect(-28, -66, 56, 9);
    c.strokeStyle = '#5a3a18'; c.lineWidth = 2.5;
    c.beginPath(); c.moveTo(-28, -52); c.lineTo(28, -52); c.stroke();
    c.beginPath(); c.moveTo(-28, -28); c.lineTo(28, -28); c.stroke();
    c.fillStyle = '#d9b44a';
    c.save(); c.translate(-16, -42);
    for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(-6, i * 6); c.lineTo(6, i * 6 - 5); c.lineWidth = 3; c.strokeStyle = '#d9b44a'; c.stroke(); }
    c.restore();
    c.fillStyle = SCRAP.gray2; c.fillRect(-2 - recoil, -84, 26, 12);
    c.save(); c.translate(24 - recoil, -80); c.rotate(-0.22);
    c.fillStyle = SCRAP.gray; c.fillRect(0, -6, 22, 12);
    c.fillStyle = SCRAP.dark; c.beginPath(); c.arc(24, 0, 7, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#171a20'; c.beginPath(); c.arc(24, 0, 4, 0, Math.PI * 2); c.fill();
    c.restore();
    c.save(); c.translate(-8, -72);
    c.fillStyle = SCRAP.orange; c.fillRect(-4, -10, 8, 14); c.beginPath(); c.arc(0, -12, 5, 0, Math.PI * 2); c.fill();
    c.strokeStyle = '#8a5a30'; c.lineWidth = 2; c.beginPath(); c.moveTo(-4, -8); c.lineTo(4, 2); c.stroke();
    c.restore();
    if (lvl >= 2) { c.fillStyle = '#4ac3ff'; c.fillRect(-22, -64, 8, 4); }
    if (lvl >= 3) { boltHead(c, 16, -34, 4); c.fillStyle = SCRAP.tape; c.fillRect(10, -30, 14, 6); }
  },
  window(c, t, lvl, st) {
    wheelDraw(c, -18, -12, 14, st ? -st.x * 0.05 : 0, { rim: '#7fa3c4' });
    wheelDraw(c, 16, -12, 14, st ? -st.x * 0.05 : 0, { rim: '#c9a54e' });
    c.fillStyle = '#7a5a3a'; c.beginPath(); c.roundRect(-30, -76, 60, 64, 5); c.fill();
    c.fillStyle = 'rgba(190,220,235,0.35)'; c.fillRect(-24, -70, 48, 52);
    c.strokeStyle = '#9c7a4e'; c.lineWidth = 3;
    c.strokeRect(-24, -70, 48, 52);
    c.beginPath(); c.moveTo(0, -70); c.lineTo(0, -18); c.moveTo(-24, -44); c.lineTo(24, -44); c.stroke();
    boltHead(c, -26, -72, 4.5); boltHead(c, 26, -72, 4.5); boltHead(c, -26, -16, 4.5); boltHead(c, 26, -16, 4.5);
    c.fillStyle = 'rgba(210,235,250,0.5)'; c.beginPath(); c.moveTo(24, -66); c.lineTo(36, -58); c.lineTo(36, -20); c.lineTo(24, -16); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(255,255,255,0.6)'; c.lineWidth = 2;
    c.beginPath(); c.moveTo(27, -60); c.lineTo(33, -46); c.lineTo(28, -32); c.stroke();
    c.fillStyle = '#39485e'; c.fillRect(-12, -14, 24, 8);
    const blink = (Math.sin(t * 2.4) + 1) / 2;
    c.fillStyle = `rgba(74,195,255,${0.3 + blink * 0.5})`;
    c.beginPath(); c.arc(-14, -44, 3.5, 0, Math.PI * 2); c.fill();
    if (lvl >= 2) { c.fillStyle = SCRAP.orange; c.fillRect(-30, -80, 60, 4); }
    if (lvl >= 3) { boltHead(c, 0, -76, 4); c.fillStyle = '#4ac3ff'; c.fillRect(-18, -12, 8, 4); }
  },
  coil(c, t, lvl, st) {
    wheelDraw(c, -24, -13, 14, st ? -st.x * 0.05 : 0, { rim: '#8a8f98' });
    wheelDraw(c, 22, -13, 14, st ? -st.x * 0.05 : 0, { rim: '#c9a54e' });
    wheelDraw(c, 38, -10, 8, st ? -st.x * 0.08 : 0, {});
    c.fillStyle = '#6b7280'; c.beginPath(); c.roundRect(-30, -56, 60, 44, 6); c.fill();
    c.fillStyle = '#575e6b'; c.fillRect(-30, -56, 60, 10);
    c.strokeStyle = '#42474f'; c.lineWidth = 1.5;
    for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(-24, -40 + i * 10); c.lineTo(24, -40 + i * 10); c.stroke(); }
    const glow = st && st.charging ? 0.9 : 0.4;
    c.save(); c.translate(0, -66);
    for (let i = 0; i < 3; i++) {
      c.strokeStyle = `rgba(90,160,255,${glow - i * 0.18})`; c.lineWidth = 4;
      c.beginPath(); c.ellipse(0, -i * 5, 18 - i * 3, 5, 0, 0, Math.PI * 2); c.stroke();
    }
    c.fillStyle = `rgba(140,200,255,${glow})`;
    c.beginPath(); c.arc(0, -10, 6 + Math.sin(t * 6) * (st && st.charging ? 2 : 0), 0, Math.PI * 2); c.fill();
    c.restore();
    c.strokeStyle = SCRAP.gray; c.lineWidth = 2.5;
    c.beginPath(); c.moveTo(-18, -56); c.lineTo(-26, -78); c.lineTo(-14, -84); c.stroke();
    c.fillStyle = SCRAP.dark; c.beginPath(); c.arc(-14, -84, 3, 0, Math.PI * 2); c.fill();
    c.fillStyle = SCRAP.tape; c.fillRect(-24, -30, 12, 6);
    if (lvl >= 2) { c.fillStyle = '#4ac3ff'; c.beginPath(); c.arc(20, -46, 3.5, 0, Math.PI * 2); c.fill(); }
    if (lvl >= 3) { c.fillStyle = SCRAP.yellow; c.fillRect(-14, -20, 28, 5); }
  },
  wrench(c, t, lvl, st) {
    const swing = st && st.firing ? Math.sin(st.fT * Math.PI) : 0;
    wheelDraw(c, -22, -11, 12, st ? -st.x * 0.06 : 0, { rim: '#c96a2a' });
    wheelDraw(c, 0, -10, 11, st ? -st.x * 0.06 : 0, { rim: '#d9b44a' });
    wheelDraw(c, 22, -11, 12, st ? -st.x * 0.06 : 0, { rim: '#8a8f98' });
    c.fillStyle = '#b0453a'; c.beginPath(); c.roundRect(-30, -58, 60, 46, 6); c.fill();
    c.fillStyle = '#933a30'; c.fillRect(-30, -58, 60, 9);
    c.strokeStyle = '#7a2f26'; c.lineWidth = 1.5;
    c.strokeRect(-22, -46, 44, 22);
    c.fillStyle = '#ffe9a8'; c.beginPath(); c.arc(12, -52, 6, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#ffcf5e'; c.beginPath(); c.arc(12, -52, 3, 0, Math.PI * 2); c.fill();
    c.save(); c.translate(30, -48); c.rotate(-0.5 - swing * 1.4);
    c.fillStyle = SCRAP.gray; c.fillRect(0, -3, 26, 6);
    c.beginPath(); c.moveTo(26, -6); c.lineTo(38, -6); c.lineTo(38, 8); c.lineTo(26, 8); c.closePath(); c.fill();
    c.fillStyle = '#575e6b'; c.fillRect(31, -2, 8, 5);
    c.restore();
    c.save(); c.translate(-30, -50); c.rotate(0.4 + swing * 0.8);
    c.fillStyle = SCRAP.gray; c.fillRect(-20, -3, 22, 6);
    c.fillStyle = SCRAP.gray2; c.beginPath(); c.roundRect(-34, -8, 14, 16, 3); c.fill();
    c.restore();
    c.fillStyle = SCRAP.gray; c.save(); c.translate(6, -62); c.rotate(0.5);
    c.beginPath(); c.moveTo(0, 0); c.lineTo(10, 0); c.lineTo(10, 4); c.lineTo(0, 4); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(10, 2); c.lineTo(15, 0); c.lineTo(10, 4); c.closePath(); c.fill(); c.restore();
    if (lvl >= 2) { boltHead(c, -18, -30, 4); boltHead(c, 14, -26, 4); }
    if (lvl >= 3) { c.fillStyle = SCRAP.yellow; c.fillRect(-26, -66, 12, 5); }
  },
  projector(c, t, lvl, st) {
    wheelDraw(c, -16, -10, 11, st ? -st.x * 0.06 : 0, { rim: '#c9a54e' });
    wheelDraw(c, 14, -10, 11, st ? -st.x * 0.06 : 0, { rim: '#5b7fa6' });
    c.fillStyle = SCRAP.gray2; c.fillRect(-6, -40, 10, 30);
    c.fillStyle = SCRAP.gray; c.beginPath(); c.roundRect(-18, -44, 34, 8, 3); c.fill();
    c.save(); c.translate(10, -56); c.rotate(Math.sin(t * 1.4) * 0.12 - 0.1);
    c.fillStyle = '#4a5568'; c.beginPath(); c.roundRect(-12, -14, 30, 26, 6); c.fill();
    c.fillStyle = '#ffe9a8'; c.beginPath(); c.arc(16, 0, 8, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#ffcf5e'; c.beginPath(); c.arc(16, 0, 4.5, 0, Math.PI * 2); c.fill();
    c.strokeStyle = '#39485e'; c.lineWidth = 2; c.beginPath(); c.arc(16, 0, 8, 0, Math.PI * 2); c.stroke();
    c.restore();
    c.strokeStyle = SCRAP.gray; c.lineWidth = 2;
    c.beginPath(); c.moveTo(-6, -44); c.lineTo(-6, -56); c.stroke();
    c.save(); c.translate(-22, -52);
    c.fillStyle = 'rgba(200,225,240,0.55)'; c.beginPath(); c.roundRect(-8, -12, 16, 20, 3); c.fill();
    c.strokeStyle = '#9fb6c6'; c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(-5, -12); c.lineTo(4, 2); c.moveTo(2, -8); c.lineTo(-5, -2); c.stroke();
    c.restore();
    c.strokeStyle = '#5b7fa6'; c.lineWidth = 2.5;
    c.beginPath(); c.moveTo(-14, -12); c.quadraticCurveTo(-26, -20, -30, -34); c.stroke();
    if (lvl >= 2) { c.fillStyle = '#4ac3ff'; c.beginPath(); c.arc(-4, -48, 3, 0, Math.PI * 2); c.fill(); }
    if (lvl >= 3) { c.fillStyle = SCRAP.yellow; c.fillRect(-16, -16, 26, 4); }
  },
  welder(c, t, lvl, st) {
    wheelDraw(c, -20, -11, 12, st ? -st.x * 0.06 : 0, { rim: '#8a8f98' });
    wheelDraw(c, 18, -11, 12, st ? -st.x * 0.06 : 0, { rim: '#c9a54e' });
    c.fillStyle = '#7a4a3a'; c.beginPath(); c.roundRect(-28, -56, 56, 44, 6); c.fill();
    c.fillStyle = '#5e382c'; c.fillRect(-28, -56, 56, 8);
    c.fillStyle = '#39485e'; c.beginPath(); c.roundRect(-20, -46, 24, 20, 4); c.fill();
    c.strokeStyle = '#52627a'; c.lineWidth = 1.2;
    for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(-18, -43 + i * 5); c.lineTo(2, -43 + i * 5); c.stroke(); }
    c.fillStyle = SCRAP.yellow; c.beginPath(); c.arc(16, -36, 5, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#39485e'; c.beginPath(); c.arc(16, -36, 2.2, 0, Math.PI * 2); c.fill();
    c.save(); c.translate(2, -66);
    c.fillStyle = SCRAP.gray2; c.beginPath(); c.roundRect(-12, -10, 24, 16, 5); c.fill();
    c.fillStyle = '#2e3138'; c.beginPath(); c.roundRect(-8, -6, 16, 10, 3); c.fill();
    c.fillStyle = '#171a20'; c.fillRect(-5, -3, 10, 3);
    c.restore();
    c.strokeStyle = SCRAP.orange; c.lineWidth = 4;
    c.beginPath(); c.moveTo(28, -46); c.lineTo(44, -40); c.stroke();
    c.strokeStyle = SCRAP.gray; c.lineWidth = 3;
    c.beginPath(); c.moveTo(44, -40); c.lineTo(44, -34); c.stroke();
    if (st && st.healing) {
      for (let i = 0; i < 3; i++) {
        const a = t * 8 + i * 2.1;
        c.fillStyle = '#ffcf5e';
        c.beginPath(); c.arc(46, -38 + Math.sin(a) * 6, 1.6, 0, Math.PI * 2); c.fill();
      }
    }
    if (lvl >= 2) { c.fillStyle = '#4ac3ff'; c.fillRect(-14, -26, 8, 4); }
    if (lvl >= 3) { c.fillStyle = SCRAP.tape; c.fillRect(-24, -20, 14, 6); boltHead(c, 20, -26, 3.5); }
  },
  frost(c, t, lvl, st) {
    wheelDraw(c, -24, -12, 12, st ? -st.x * 0.05 : 0, { tire: '#2b2e33', rim: '#9fc4e8' });
    wheelDraw(c, -8, -11, 10, st ? -st.x * 0.05 : 0, { tire: '#2b2e33', rim: '#9fc4e8' });
    wheelDraw(c, 8, -11, 10, st ? -st.x * 0.05 : 0, { tire: '#2b2e33', rim: '#9fc4e8' });
    wheelDraw(c, 24, -12, 12, st ? -st.x * 0.05 : 0, { tire: '#2b2e33', rim: '#9fc4e8' });
    c.fillStyle = '#9fb6c6'; c.beginPath(); c.roundRect(-30, -58, 56, 46, 8); c.fill();
    c.fillStyle = '#8aa2b2'; c.fillRect(-30, -58, 56, 9);
    c.fillStyle = '#6e8694'; c.beginPath(); c.roundRect(-22, -48, 16, 26, 3); c.fill();
    c.fillStyle = '#b8d8e8'; c.beginPath(); c.roundRect(2, -48, 18, 18, 3); c.fill();
    c.fillStyle = '#39485e'; c.fillRect(6, -44, 10, 4);
    c.fillStyle = '#4a7a9e'; c.beginPath(); c.roundRect(-40, -52, 12, 30, 4); c.fill();
    c.fillStyle = '#a8d8f0'; c.fillRect(-37, -48, 6, 10);
    c.fillStyle = SCRAP.gray; c.fillRect(26, -52, 18, 8);
    c.beginPath(); c.moveTo(44, -52); c.lineTo(50, -50); c.lineTo(50, -46); c.lineTo(44, -44); c.closePath(); c.fill();
    c.save(); c.translate(-44, -44); c.rotate(t * 6);
    c.fillStyle = SCRAP.gray; for (let i = 0; i < 3; i++) { c.rotate(Math.PI * 2 / 3); c.fillRect(-2, -8, 4, 8); }
    c.restore();
    if (st && st.firing) {
      c.fillStyle = 'rgba(170,220,250,0.5)';
      for (let i = 0; i < 3; i++) {
        c.beginPath(); c.arc(52 + i * 7 + Math.sin(t * 9 + i) * 2, -48 + Math.cos(t * 7 + i * 2) * 4, 3.5 - i * 0.7, 0, Math.PI * 2); c.fill();
      }
    }
    if (lvl >= 2) { c.fillStyle = '#4ac3ff'; c.beginPath(); c.arc(16, -60, 3.5, 0, Math.PI * 2); c.fill(); }
    if (lvl >= 3) { c.fillStyle = '#b8d8e8'; c.fillRect(-26, -20, 40, 4); }
  },
  pipe(c, t, lvl, st) {
    const recoil = st && st.firing ? 6 : 0;
    wheelDraw(c, -26, -12, 13, st ? -st.x * 0.05 : 0, { rim: '#c96a2a' });
    wheelDraw(c, -4, -10, 10, st ? -st.x * 0.05 : 0, { rim: '#8a8f98' });
    wheelDraw(c, 18, -12, 14, st ? -st.x * 0.05 : 0, { rim: '#d9b44a' });
    c.fillStyle = '#7e8794'; c.beginPath(); c.roundRect(-28, -50, 52, 38, 5); c.fill();
    c.fillStyle = '#6a7381'; c.fillRect(-28, -50, 52, 8);
    c.fillStyle = SCRAP.orange; c.fillRect(-22, -44, 12, 26);
    c.strokeStyle = '#8a5a30'; c.lineWidth = 1.5; c.strokeRect(-22, -44, 12, 26);
    c.save(); c.translate(10 - recoil, -46);
    c.fillStyle = '#8a93a2'; c.fillRect(0, -5, 30, 10);
    c.fillStyle = '#5d626b'; c.fillRect(28, -7, 8, 14);
    c.fillStyle = '#2e3138'; c.beginPath(); c.arc(38, 0, 4.5, 0, Math.PI * 2); c.fill();
    c.restore();
    c.strokeStyle = SCRAP.gray; c.lineWidth = 4;
    c.beginPath(); c.moveTo(-28, -34);
    for (let i = 0; i < 4; i++) c.quadraticCurveTo(-34 - i, -28 - i * 6, -28, -22 - i * 6);
    c.stroke();
    c.fillStyle = SCRAP.gray2; c.beginPath(); c.roundRect(-10, -64, 26, 10, 3); c.fill();
    c.strokeStyle = '#ffe9a8'; c.lineWidth = 1.5;
    c.beginPath(); c.arc(2, -59, 3.5, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.moveTo(2, -59); c.lineTo(4.5, -61.5); c.stroke();
    if (lvl >= 2) { boltHead(c, 16, -36, 4); boltHead(c, -16, -34, 3.5); }
    if (lvl >= 3) { c.fillStyle = SCRAP.yellow; c.fillRect(-6, -24, 22, 4); }
  },
  hacker(c, t, lvl, st) {
    wheelDraw(c, -18, -9, 9, st ? -st.x * 0.06 : 0, { rim: '#8a8f98' });
    wheelDraw(c, 16, -9, 9, st ? -st.x * 0.06 : 0, { rim: '#c9a54e' });
    c.fillStyle = '#4a5058'; c.beginPath(); c.roundRect(-26, -56, 52, 46, 5); c.fill();
    c.fillStyle = '#3c414a'; c.fillRect(-26, -56, 52, 8);
    c.fillStyle = '#23262d'; c.beginPath(); c.roundRect(8, -52, 14, 20, 2); c.fill();
    c.fillStyle = '#39485e'; for (let i = 0; i < 4; i++) c.fillRect(9, -50 + i * 5, 12, 3);
    c.fillStyle = '#171a20'; c.beginPath(); c.roundRect(-22, -52, 24, 18, 2); c.fill();
    const flick = 0.5 + ((Math.sin(t * 3) + 1) / 2) * 0.5;
    c.fillStyle = `rgba(80,240,120,${flick})`;
    const codeRows = 3;
    for (let i = 0; i < codeRows; i++) {
      const w = 8 + ((Math.floor(t * 4 + i * 7) % 9)) * 1.2;
      c.fillRect(-20, -49 + i * 5.5, w, 2.4);
    }
    c.fillStyle = '#39485e'; c.beginPath(); c.roundRect(-20, -30, 44, 9, 2); c.fill();
    c.fillStyle = '#23262d';
    for (let i = 0; i < 6; i++) c.fillRect(-18 + i * 7, -28.5, 5, 6);
    c.strokeStyle = SCRAP.gray; c.lineWidth = 2;
    c.beginPath(); c.moveTo(-22, -56); c.lineTo(-30, -74); c.lineTo(-24, -80); c.stroke();
    c.fillStyle = '#4ac3ff'; c.beginPath(); c.arc(-24, -80, 2.5, 0, Math.PI * 2); c.fill();
    if (lvl >= 2) { c.fillStyle = '#50f078'; c.beginPath(); c.arc(20, -58, 3, 0, Math.PI * 2); c.fill(); }
    if (lvl >= 3) { c.fillStyle = SCRAP.tape; c.fillRect(-24, -22, 16, 5); boltHead(c, 18, -26, 3.5); }
  },
};

/* ---------- ENEMY ART (origin feet-center, facing −x) ---------- */
const ENEMY_ART = {
  roller(c, t, e) {
    wheelDraw(c, -18, -14, 15, -e.x * 0.055, { tire: '#15171c', rim: '#c8d2de' });
    wheelDraw(c, 18, -14, 15, -e.x * 0.055, { tire: '#15171c', rim: '#c8d2de' });
    c.fillStyle = GLOSS.white; c.beginPath(); c.ellipse(0, -34, 30, 24, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = GLOSS.silver; c.beginPath(); c.ellipse(0, -34, 30, 24, 0, Math.PI, Math.PI * 2); c.fill();
    c.fillStyle = '#dfe7ef'; c.beginPath(); c.ellipse(-8, -42, 12, 6, -0.4, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#3d4654'; c.beginPath(); c.roundRect(-22, -42, 16, 12, 3); c.fill();
    c.fillStyle = '#6ee0ff'; c.fillRect(-20, -40, 5, 3); c.fillRect(-13, -40, 5, 3);
    c.strokeStyle = GLOSS.silver; c.lineWidth = 2;
    c.beginPath(); c.moveTo(8, -56); c.lineTo(12, -66); c.stroke();
    c.fillStyle = '#ff5e5e'; c.beginPath(); c.arc(12, -66, 2.5, 0, Math.PI * 2); c.fill();
    c.strokeStyle = '#b9c6d6'; c.lineWidth = 1.5;
    c.beginPath(); c.ellipse(0, -34, 30, 24, 0, 0, Math.PI * 2); c.stroke();
  },
  capsule(c, t, e) {
    wheelDraw(c, -22, -12, 11, -e.x * 0.05, { tire: '#15171c', rim: '#9fc4e8' });
    wheelDraw(c, -8, -11, 9, -e.x * 0.05, { tire: '#15171c', rim: '#9fc4e8' });
    wheelDraw(c, 8, -11, 9, -e.x * 0.05, { tire: '#15171c', rim: '#9fc4e8' });
    wheelDraw(c, 22, -12, 11, -e.x * 0.05, { tire: '#15171c', rim: '#9fc4e8' });
    c.fillStyle = GLOSS.white; c.beginPath(); c.roundRect(-30, -58, 60, 46, 22); c.fill();
    c.fillStyle = GLOSS.pblue; c.beginPath(); c.roundRect(-30, -58, 20, 46, 16); c.fill();
    c.strokeStyle = '#7ea8d0'; c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(-8, -56); c.lineTo(-8, -14); c.moveTo(8, -56); c.lineTo(8, -14); c.stroke();
    c.fillStyle = '#39485e'; c.beginPath(); c.roundRect(4, -46, 16, 14, 3); c.fill();
    c.fillStyle = '#6ee0ff'; c.fillRect(7, -43, 4, 4); c.fillRect(13, -43, 4, 4);
    c.fillStyle = GLOSS.pblue; c.beginPath(); c.roundRect(30, -54, 14, 40, 4); c.fill();
    c.fillStyle = 'rgba(159,196,232,0.75)'; c.beginPath(); c.roundRect(32, -50, 10, 32, 3); c.fill();
    c.strokeStyle = '#87b7e0'; c.lineWidth = 1.4;
    c.beginPath(); c.moveTo(35, -48); c.lineTo(35, -20); c.stroke();
    const glow = (Math.sin(t * 4) + 1) / 2;
    c.strokeStyle = `rgba(110,224,255,${0.4 + glow * 0.5})`; c.lineWidth = 2.5;
    c.beginPath(); c.moveTo(-24, -30); c.quadraticCurveTo(0, -24, 26, -30); c.stroke();
  },
  needle(c, t, e) {
    wheelDraw(c, -20, -13, 14, -e.x * 0.055, { tire: '#15171c', rim: '#c8d2de' });
    wheelDraw(c, 14, -12, 13, -e.x * 0.055, { tire: '#15171c', rim: '#c8d2de' });
    wheelDraw(c, -34, -10, 7, -e.x * 0.08, { tire: '#15171c', rim: '#9fc4e8' });
    c.fillStyle = GLOSS.silver; c.beginPath(); c.roundRect(-38, -44, 72, 26, 12); c.fill();
    c.fillStyle = GLOSS.white; c.beginPath(); c.roundRect(-38, -44, 72, 12, 10); c.fill();
    c.fillStyle = '#dfe7ef'; c.beginPath(); c.ellipse(-10, -40, 14, 5, -0.3, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#3d4654'; c.fillRect(6, -40, 16, 6);
    c.fillStyle = '#6ee0ff'; c.fillRect(8, -39, 5, 3);
    c.save(); c.translate(-6, -52);
    c.fillStyle = GLOSS.dark2; c.beginPath(); c.roundRect(-10, -8, 24, 14, 4); c.fill();
    c.fillStyle = '#8a93a2'; c.fillRect(-26, -4, 20, 6);
    c.fillStyle = '#39485e'; c.fillRect(-30, -3, 6, 4);
    c.restore();
    c.strokeStyle = '#b9c6d6'; c.lineWidth = 1.5;
    c.beginPath(); c.roundRect(-38, -44, 72, 26, 12); c.stroke();
  },
  jet(c, t, e) {
    const boost = e.boostT > 0;
    wheelDraw(c, -24, -11, 10, -e.x * 0.09, { tire: '#15171c', rim: '#6ee0ff' });
    wheelDraw(c, -9, -10, 9, -e.x * 0.09, { tire: '#15171c', rim: '#6ee0ff' });
    wheelDraw(c, 8, -10, 9, -e.x * 0.09, { tire: '#15171c', rim: '#6ee0ff' });
    wheelDraw(c, 23, -11, 10, -e.x * 0.09, { tire: '#15171c', rim: '#6ee0ff' });
    c.fillStyle = '#5b8fd4'; c.beginPath(); c.moveTo(-40, -30); c.quadraticCurveTo(-20, -62, 16, -54); c.quadraticCurveTo(38, -48, 40, -30); c.quadraticCurveTo(20, -18, -40, -22); c.closePath(); c.fill();
    c.fillStyle = GLOSS.white; c.beginPath(); c.moveTo(-36, -30); c.quadraticCurveTo(-18, -56, 14, -50); c.quadraticCurveTo(34, -45, 34, -30); c.quadraticCurveTo(16, -22, -36, -26); c.closePath(); c.fill();
    c.fillStyle = '#8a6fd1'; c.beginPath(); c.roundRect(-14, -48, 18, 8, 4); c.fill();
    c.fillStyle = '#c9b6ff'; c.fillRect(-11, -46, 5, 4); c.fillRect(-5, -46, 5, 4);
    c.fillStyle = GLOSS.silver; c.beginPath(); c.moveTo(16, -50); c.lineTo(30, -60); c.lineTo(34, -48); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(16, -24); c.lineTo(30, -16); c.lineTo(34, -28); c.closePath(); c.fill();
    c.fillStyle = GLOSS.dark2;
    c.beginPath(); c.ellipse(-44, -32, 9, 6, 0, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.ellipse(-44, -20, 9, 6, 0, 0, Math.PI * 2); c.fill();
    if (boost) {
      for (let i = 0; i < 3; i++) {
        c.fillStyle = `rgba(110,180,255,${0.7 - i * 0.2})`;
        c.beginPath(); c.ellipse(-52 - i * 8, -32 + Math.sin(t * 20 + i) * 2, 8 - i * 2, 4, 0, 0, Math.PI * 2); c.fill();
      }
    } else {
      const gl = (Math.sin(t * 6) + 1) / 2;
      c.fillStyle = `rgba(110,180,255,${0.3 + gl * 0.4})`;
      c.beginPath(); c.arc(-46, -32, 3, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.arc(-46, -20, 3, 0, Math.PI * 2); c.fill();
    }
  },
  pulse(c, t, e) {
    wheelDraw(c, -20, -10, 10, -e.x * 0.05, { tire: '#15171c', rim: '#6ee0ff' });
    wheelDraw(c, -7, -9, 8, -e.x * 0.05, { tire: '#15171c', rim: '#6ee0ff' });
    wheelDraw(c, 7, -9, 8, -e.x * 0.05, { tire: '#15171c', rim: '#6ee0ff' });
    wheelDraw(c, 20, -10, 10, -e.x * 0.05, { tire: '#15171c', rim: '#6ee0ff' });
    c.fillStyle = GLOSS.white; c.beginPath(); c.arc(0, -36, 30, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#dfe7ef'; c.beginPath(); c.arc(-9, -44, 12, 0, Math.PI * 2); c.fill();
    const p = (Math.sin(t * 3) + 1) / 2;
    c.fillStyle = `rgba(110,224,255,${0.5 + p * 0.4})`;
    c.beginPath(); c.arc(0, -36, 10 + p * 2, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#eaffff'; c.beginPath(); c.arc(0, -36, 5, 0, Math.PI * 2); c.fill();
    c.strokeStyle = `rgba(110,224,255,${0.6 - p * 0.3})`; c.lineWidth = 2;
    c.beginPath(); c.arc(0, -36, 30, 0, Math.PI * 2); c.stroke();
    c.fillStyle = '#39485e'; c.beginPath(); c.roundRect(-16, -56, 22, 10, 4); c.fill();
    c.fillStyle = '#6ee6a0'; c.fillRect(-13, -53, 4, 4); c.fillRect(-7, -53, 4, 4);
    if (e.pulseT > 0) {
      c.strokeStyle = `rgba(110,224,255,${0.25 + p * 0.35})`; c.lineWidth = 3;
      c.beginPath(); c.arc(0, -36, 40 + p * 6, 0, Math.PI * 2); c.stroke();
    }
  },
  laser(c, t, e) {
    wheelDraw(c, -20, -14, 16, -e.x * 0.05, { tire: '#15171c', rim: '#c8d2de' });
    wheelDraw(c, 16, -13, 14, -e.x * 0.05, { tire: '#15171c', rim: '#c8d2de' });
    wheelDraw(c, 34, -10, 7, -e.x * 0.08, { tire: '#15171c', rim: '#e04b4b' });
    c.fillStyle = GLOSS.silver; c.beginPath(); c.roundRect(-30, -46, 62, 28, 10); c.fill();
    c.fillStyle = GLOSS.white; c.beginPath(); c.roundRect(-30, -46, 62, 13, 9); c.fill();
    c.strokeStyle = 'rgba(255,90,90,0.8)'; c.lineWidth = 2;
    c.beginPath(); c.moveTo(-24, -30); c.lineTo(24, -30); c.stroke();
    c.fillStyle = '#39485e'; c.fillRect(6, -42, 14, 6);
    c.save(); c.translate(-8, -54);
    c.fillStyle = '#5d626b'; c.beginPath(); c.roundRect(-14, -10, 28, 16, 5); c.fill();
    const ch = e.chargeT > 0 ? clamp(1 - e.chargeT / 1.5, 0, 1) : 0;
    c.fillStyle = `rgb(${200 + ch * 55}, ${60 - ch * 20}, ${60 - ch * 30})`;
    c.beginPath(); c.arc(-12, -2, 7 + ch * 2, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#ffdddd'; c.beginPath(); c.arc(-12, -2, 2.5, 0, Math.PI * 2); c.fill();
    c.restore();
  },
  micro(c, t, e) {
    for (let i = 0; i < 3; i++) {
      wheelDraw(c, -18 + i * 13, -8, 7, -e.x * 0.07, { tire: '#15171c', rim: '#6ee6a0' });
      wheelDraw(c, -18 + i * 13, -22, 7, -e.x * 0.07, { tire: '#15171c', rim: '#6ee6a0' });
    }
    c.fillStyle = GLOSS.white; c.beginPath(); c.roundRect(-28, -44, 56, 30, 10); c.fill();
    c.fillStyle = GLOSS.silver; c.beginPath(); c.roundRect(-28, -44, 56, 12, 9); c.fill();
    const bl = (Math.sin(t * 6) + 1) / 2;
    c.fillStyle = `rgba(110,230,160,${0.4 + bl * 0.6})`;
    c.beginPath(); c.arc(-16, -30, 3, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.arc(-8, -30, 3, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#39485e'; c.beginPath(); c.roundRect(2, -42, 18, 10, 3); c.fill();
    c.fillStyle = '#6ee6a0'; c.fillRect(5, -39, 12, 4);
    c.fillStyle = GLOSS.silver; c.beginPath(); c.roundRect(-40, -54, 16, 22, 4); c.fill();
    c.fillStyle = '#7ea8d0'; c.fillRect(-37, -50, 10, 8);
    c.strokeStyle = '#9fb6c6'; c.lineWidth = 2.5;
    c.beginPath(); c.moveTo(24, -36); c.lineTo(36, -46); c.stroke();
    c.beginPath(); c.moveTo(24, -28); c.lineTo(38, -24); c.stroke();
    if (e.healT > 0) {
      c.strokeStyle = `rgba(110,230,160,0.8)`; c.lineWidth = 2;
      c.beginPath(); c.moveTo(-40, -56); c.lineTo(-46, -62); c.stroke();
    }
  },
  crusher(c, t, e) {
    trackDraw(c, -26, -16, 44, 24, -e.x * 0.03);
    trackDraw(c, 26, -16, 44, 24, -e.x * 0.03);
    c.fillStyle = '#8a93a2'; c.beginPath(); c.roundRect(-44, -76, 88, 56, 8); c.fill();
    c.fillStyle = '#747e8e'; c.beginPath(); c.roundRect(-44, -76, 88, 16, 8); c.fill();
    c.fillStyle = '#5d626b'; c.beginPath(); c.roundRect(20, -70, 24, 40, 6); c.fill();
    c.strokeStyle = '#4a5058'; c.lineWidth = 2;
    c.strokeRect(22, -66, 20, 32);
    c.fillStyle = '#a83a30'; c.beginPath(); c.roundRect(-16, -66, 32, 20, 4); c.fill();
    c.fillStyle = '#ff6b5e'; c.fillRect(-12, -62, 8, 6); c.fillRect(-2, -62, 8, 6);
    c.fillStyle = '#ffe14a'; c.beginPath(); c.arc(-34, -80, 4, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.arc(-24, -80, 4, 0, Math.PI * 2); c.fill();
    const blink = (Math.sin(t * 5) + 1) / 2;
    c.fillStyle = `rgba(255,225,74,${0.3 + blink * 0.6})`;
    c.beginPath(); c.arc(-34, -80, 2.2, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.arc(-24, -80, 2.2, 0, Math.PI * 2); c.fill();
    c.save(); c.translate(46, -50); c.rotate(Math.sin(t * 1.5) * 0.1);
    c.fillStyle = '#5d626b'; c.fillRect(0, -5, 22, 10);
    c.fillStyle = '#8a93a2'; c.beginPath(); c.roundRect(20, -14, 14, 28, 4); c.fill();
    c.restore();
    c.save(); c.translate(-48, -50); c.rotate(-0.2 + Math.sin(t * 1.2) * 0.1);
    c.fillStyle = '#5d626b'; c.fillRect(-24, -5, 26, 10);
    c.fillStyle = '#8a93a2'; c.beginPath(); c.roundRect(-36, -12, 14, 24, 4); c.fill();
    c.restore();
    c.fillStyle = '#6e7787'; c.beginPath(); c.roundRect(-46, -22, 92, 8, 4); c.fill();
  },
  commander(c, t, e) {
    wheelDraw(c, -26, -14, 15, -e.x * 0.05, { tire: '#15171c', rim: '#c8d2de' });
    wheelDraw(c, -9, -13, 12, -e.x * 0.05, { tire: '#15171c', rim: '#c8d2de' });
    wheelDraw(c, 9, -13, 12, -e.x * 0.05, { tire: '#15171c', rim: '#c8d2de' });
    wheelDraw(c, 26, -14, 15, -e.x * 0.05, { tire: '#15171c', rim: '#c8d2de' });
    c.fillStyle = '#dde5ee'; c.beginPath(); c.roundRect(-34, -66, 68, 52, 12); c.fill();
    c.fillStyle = GLOSS.silver; c.beginPath(); c.roundRect(-34, -66, 68, 14, 12); c.fill();
    c.fillStyle = '#8a6fd1'; c.beginPath(); c.roundRect(-14, -58, 30, 20, 5); c.fill();
    c.fillStyle = '#c9b6ff'; c.fillRect(-10, -54, 8, 6); c.fillRect(-1, -54, 8, 6);
    c.strokeStyle = '#b9c6d6'; c.lineWidth = 2;
    c.beginPath(); c.moveTo(22, -66); c.lineTo(26, -88); c.lineTo(34, -96); c.stroke();
    c.beginPath(); c.moveTo(30, -88); c.lineTo(40, -92); c.stroke();
    c.fillStyle = '#b9c6d6'; c.beginPath(); c.arc(34, -96, 3, 0, Math.PI * 2); c.fill();
    for (let i = 0; i < 3; i++) {
      const bx = 18 - i * 14, bob = Math.sin(t * 2.5 + i) * 2;
      c.strokeStyle = '#8a93a2'; c.lineWidth = 2;
      c.beginPath(); c.moveTo(bx, -66); c.lineTo(bx, -76 - bob); c.stroke();
      const gl = (Math.sin(t * 4 + i * 2) + 1) / 2;
      c.fillStyle = `rgba(200,150,255,${0.4 + gl * 0.6})`;
      c.beginPath(); c.arc(bx, -80 - bob, 4.5, 0, Math.PI * 2); c.fill();
    }
    c.strokeStyle = `rgba(138,111,209,${0.5 + Math.sin(t * 3) * 0.2})`; c.lineWidth = 2;
    c.beginPath(); c.moveTo(-30, -24); c.lineTo(30, -24); c.stroke();
    if (e.cmdT > 0) {
      c.strokeStyle = `rgba(200,150,255,${0.3 + Math.sin(t * 8) * 0.25})`; c.lineWidth = 3;
      c.beginPath(); c.arc(0, -40, 46 + Math.sin(t * 6) * 4, 0, Math.PI * 2); c.stroke();
    }
  },
  boss(c, t, e) {
    const ph = e.phase || 1;
    wheelDraw(c, -46, -24, 26, -e.x * 0.02, { tire: '#1a1d24', rim: '#c8d2de' });
    wheelDraw(c, -18, -22, 21, -e.x * 0.02, { tire: '#1a1d24', rim: '#9fc4e8' });
    wheelDraw(c, 10, -22, 21, -e.x * 0.02, { tire: '#1a1d24', rim: '#c8d2de' });
    wheelDraw(c, 40, -23, 22, -e.x * 0.02, { tire: '#1a1d24', rim: '#9fc4e8' });
    wheelDraw(c, -34, -20, 18, -e.x * 0.025, { tire: '#1a1d24', rim: '#8a6fd1' });
    wheelDraw(c, 28, -20, 17, -e.x * 0.025, { tire: '#1a1d24', rim: '#8a6fd1' });
    c.fillStyle = '#dde5ee'; c.beginPath(); c.roundRect(-56, -104, 112, 74, 14); c.fill();
    c.fillStyle = '#a9b6c6'; c.beginPath(); c.roundRect(-56, -104, 112, 18, 14); c.fill();
    c.fillStyle = '#8a93a2'; c.beginPath(); c.roundRect(-56, -46, 112, 16, 8); c.fill();
    const corePulse = 0.5 + Math.sin(t * (ph === 3 ? 9 : ph === 2 ? 6 : 3.5)) * 0.5;
    const coreCol = ph === 3 ? '255,60,60' : ph === 2 ? '255,120,60' : '224,75,75';
    c.fillStyle = `rgba(${coreCol},${0.6 + corePulse * 0.4})`;
    c.beginPath(); c.arc(-10, -66, 13 + corePulse * 3, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#fff0f0'; c.beginPath(); c.arc(-10, -66, 5, 0, Math.PI * 2); c.fill();
    c.strokeStyle = `rgba(${coreCol},0.9)`; c.lineWidth = 2.5;
    c.beginPath(); c.arc(-10, -66, 13 + corePulse * 3, 0, Math.PI * 2); c.stroke();
    c.fillStyle = '#8a1f1f'; c.beginPath(); c.roundRect(-34, -96, 34, 18, 5); c.fill();
    c.fillStyle = `rgba(255,90,90,${0.6 + corePulse * 0.4})`; c.fillRect(-30, -92, 10, 5); c.fillRect(-18, -92, 10, 5);
    c.strokeStyle = `rgba(${coreCol},${0.35 + corePulse * 0.3})`; c.lineWidth = 2;
    c.beginPath(); c.moveTo(-50, -56); c.lineTo(-20, -56); c.moveTo(6, -56); c.lineTo(40, -56); c.stroke();
    c.save(); c.translate(-58, -70); c.rotate(-0.3 + Math.sin(t) * 0.08);
    c.fillStyle = '#8a93a2'; c.fillRect(-18, -6, 22, 12);
    c.fillStyle = '#5d626b'; c.beginPath(); c.roundRect(-34, -14, 16, 28, 5); c.fill();
    c.restore();
    c.save(); c.translate(58, -70); c.rotate(0.3 - Math.sin(t + 1) * 0.08);
    c.fillStyle = '#8a93a2'; c.fillRect(0, -6, 22, 12);
    c.fillStyle = '#5d626b'; c.beginPath(); c.roundRect(20, -14, 16, 28, 5); c.fill();
    c.restore();
    if (e.shieldT > 0) {
      c.strokeStyle = `rgba(110,224,255,${0.4 + corePulse * 0.3})`; c.lineWidth = 4;
      c.beginPath(); c.arc(0, -62, 66 + corePulse * 5, 0, Math.PI * 2); c.stroke();
      c.fillStyle = `rgba(110,224,255,0.08)`;
      c.beginPath(); c.arc(0, -62, 66, 0, Math.PI * 2); c.fill();
    }
  },
};

/* ---------- ENVIRONMENT THEMES ---------- */
const THEMES = [
  { sky: ['#2e4a6b', '#5a7ea6', '#c98d5a'], ground: ['#4a6b3a', '#3a5530'], wall: '#8a7355', accent: '#c96a2a' },
  { sky: ['#1c222c', '#2a3442', '#3a4656'], ground: ['#3d434f', '#31363f'], wall: '#5d5348', accent: '#d9b44a' },
  { sky: ['#241f2e', '#3a3244', '#54465c'], ground: ['#4a3f52', '#3c3344'], wall: '#6b5a6e', accent: '#c98db4' },
  { sky: ['#0e1a22', '#16283a', '#22405a'], ground: ['#1e3444', '#16283a'], wall: '#274054', accent: '#4ac3ff' },
];
let bgCache = { theme: -1, canvas: null };
function renderBackground(theme) {
  if (bgCache.theme === theme && bgCache.canvas) return bgCache.canvas;
  const cv = document.createElement('canvas'); cv.width = DW; cv.height = DH;
  const c = cv.getContext('2d');
  const th = THEMES[theme];
  const g = c.createLinearGradient(0, 0, 0, DH);
  g.addColorStop(0, th.sky[0]); g.addColorStop(0.55, th.sky[1]); g.addColorStop(1, th.sky[2]);
  c.fillStyle = g; c.fillRect(0, 0, DW, DH);
  const q = SAVE ? SAVE.settings.quality : 'high';
  /* stars / dust */
  if (q !== 'low') {
    for (let i = 0; i < 40; i++) {
      c.fillStyle = `rgba(255,255,255,${rndR(0.04, 0.14)})`;
      c.beginPath(); c.arc(rndR(0, DW), rndR(0, FIELD_Y0), rndR(0.8, 2), 0, Math.PI * 2); c.fill();
    }
  }
  /* home strip (left) */
  c.fillStyle = th.wall; c.fillRect(0, 0, HOME_X - 10, DH);
  c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(HOME_X - 22, 0, 12, DH);
  c.strokeStyle = 'rgba(0,0,0,0.3)'; c.lineWidth = 2;
  for (let y = 20; y < DH; y += 90) { c.beginPath(); c.moveTo(6, y); c.lineTo(HOME_X - 26, y + 8); c.stroke(); }
  /* door */
  c.fillStyle = '#5a4632'; c.beginPath(); c.roundRect(8, FIELD_Y0 + 200, 108, 260, 8); c.fill();
  c.strokeStyle = '#3f3020'; c.lineWidth = 3; c.strokeRect(16, FIELD_Y0 + 210, 92, 240);
  c.fillStyle = '#d9b44a'; c.beginPath(); c.arc(100, FIELD_Y0 + 330, 5, 0, Math.PI * 2); c.fill();
  c.fillStyle = 'rgba(255,220,150,0.12)'; c.fillRect(0, FIELD_Y0, HOME_X - 10, 5 * CELL_H);
  if (theme === 3) {
    c.fillStyle = '#1e3a4a'; c.fillRect(10, FIELD_Y0 + 60, 110, 70);
    c.strokeStyle = '#4ac3ff'; c.lineWidth = 1.5; c.strokeRect(14, FIELD_Y0 + 66, 102, 58);
    for (let i = 0; i < 4; i++) { c.fillStyle = `rgba(80,240,120,${0.5 + Math.sin(i) * 0.3})`; c.fillRect(20 + i * 22, FIELD_Y0 + 74, 14, 5); }
    c.fillStyle = 'rgba(74,195,255,0.15)'; c.fillRect(0, FIELD_Y0 - 40, HOME_X - 10, 5 * CELL_H + 80);
  }
  /* ground */
  const gg = c.createLinearGradient(0, FIELD_Y0 + 5 * CELL_H, 0, DH);
  gg.addColorStop(0, th.ground[0]); gg.addColorStop(1, th.ground[1]);
  c.fillStyle = gg; c.fillRect(0, FIELD_Y0 + 5 * CELL_H, DW, DH - FIELD_Y0 - 5 * CELL_H);
  /* area props */
  if (theme === 0) {
    c.strokeStyle = '#5a4a32'; c.lineWidth = 6;
    for (let x = 200; x < DW; x += 90) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, FIELD_Y0 - 12); c.stroke(); }
    c.strokeStyle = '#6b5a3f'; c.lineWidth = 4;
    c.beginPath(); c.moveTo(0, 26); c.lineTo(DW, 26); c.stroke();
    c.fillStyle = '#4a6b3a';
    for (let i = 0; i < 60; i++) { c.beginPath(); c.ellipse(rndR(160, DW), FIELD_Y0 + rndR(0, 5 * CELL_H), rndR(6, 16), rndR(2, 5), rndR(0, 3), 0, Math.PI * 2); c.fill(); }
    c.fillStyle = '#6b5a3f'; c.fillRect(170, 30, 8, 46); c.beginPath(); c.roundRect(150, 18, 48, 26, 4); c.fill();
    c.fillStyle = '#c96a2a'; c.beginPath(); c.arc(380, FIELD_Y0 + 5 * CELL_H + 22, 8, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#5b7fa6'; c.beginPath(); c.arc(760, FIELD_Y0 + 5 * CELL_H + 30, 7, 0, Math.PI * 2); c.fill();
    c.fillStyle = 'rgba(0,0,0,0.2)';
    c.beginPath(); c.ellipse(1000, DH - 30, 90, 12, 0, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.ellipse(1400, DH - 50, 60, 10, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#5a4632'; c.beginPath(); c.roundRect(1450, 34, 100, FIELD_Y0 - 20, 6); c.fill();
    c.fillStyle = '#3f3020'; c.fillRect(1490, 34, 8, FIELD_Y0 - 20);
  } else if (theme === 1) {
    c.fillStyle = '#33383f'; c.fillRect(180, 0, DW - 180, 30);
    c.fillStyle = '#4a5058';
    for (let x = 200; x < DW; x += 70) c.fillRect(x, 2, 40, 12);
    for (let i = 0; i < 4; i++) {
      c.fillStyle = i % 2 ? '#1f2227' : '#2b2f36';
      c.beginPath(); c.roundRect(300 + i * 46, DH - 46, 42, 30, 4); c.fill();
    }
    c.fillStyle = '#2b2f36'; c.beginPath(); c.roundRect(1150, FIELD_Y0 - 10, 320, 60, 8); c.fill();
    c.fillStyle = '#1f2227'; c.beginPath(); c.arc(1230, FIELD_Y0 + 55, 34, Math.PI, Math.PI * 2); c.fill();
    c.fillStyle = 'rgba(217,180,74,0.08)';
    c.beginPath(); c.moveTo(400, FIELD_Y0); c.lineTo(560, FIELD_Y0); c.lineTo(660, DH); c.lineTo(300, DH); c.closePath(); c.fill();
    c.fillStyle = 'rgba(0,0,0,0.25)';
    c.beginPath(); c.ellipse(500, DH - 26, 80, 12, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#4a5058'; c.beginPath(); c.roundRect(240, FIELD_Y0 - 6, 60, 44, 4); c.fill();
    c.strokeStyle = '#2b2f36'; c.lineWidth = 3;
    for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(250 + i * 16, FIELD_Y0 - 2); c.lineTo(250 + i * 16, FIELD_Y0 + 34); c.stroke(); }
  } else if (theme === 2) {
    c.fillStyle = 'rgba(255,255,255,0.045)';
    for (let x = 180; x < DW; x += 46) c.fillRect(x, 0, 20, FIELD_Y0);
    c.fillStyle = '#54465c'; c.save(); c.translate(340, 30); c.rotate(-0.12);
    c.fillStyle = '#c9b6a0'; c.fillRect(-30, -22, 60, 44); c.fillStyle = '#54465c'; c.fillRect(-30, 0, 60, 10); c.restore();
    c.fillStyle = '#3a3244'; c.beginPath(); c.roundRect(900, FIELD_Y0 - 8, 130, 46, 6); c.fill();
    c.fillStyle = '#54465c'; c.fillRect(910, FIELD_Y0 + 38, 110, 8);
    c.fillStyle = 'rgba(201,141,180,0.12)';
    c.beginPath(); c.moveTo(1350, 0); c.lineTo(1520, 0); c.lineTo(1560, FIELD_Y0); c.lineTo(1310, FIELD_Y0); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(201,141,180,0.3)'; c.lineWidth = 3;
    c.beginPath(); c.moveTo(1380, 0); c.lineTo(1350, FIELD_Y0); c.moveTo(1450, 0); c.lineTo(1430, FIELD_Y0); c.stroke();
    const lamp = 0.5 + Math.sin(1) * 0.5;
    c.fillStyle = 'rgba(255,220,150,0.10)';
    c.beginPath(); c.arc(700, FIELD_Y0 - 20, 90, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#c98db4'; c.fillRect(660, 6, 80, 12);
  } else {
    c.fillStyle = '#22303c'; c.fillRect(180, 0, DW - 180, 34);
    c.strokeStyle = 'rgba(74,195,255,0.4)'; c.lineWidth = 2;
    c.strokeRect(186, 4, DW - 200, 26);
    c.fillStyle = 'rgba(80,240,120,0.7)';
    for (let i = 0; i < 10; i++) c.fillRect(200 + i * 130, 10, 30 + (i % 3) * 20, 3);
    c.fillStyle = '#2b3f52'; c.beginPath(); c.roundRect(1250, FIELD_Y0 - 14, 260, 60, 6); c.fill();
    c.fillStyle = 'rgba(74,195,255,0.12)';
    c.beginPath(); c.arc(1330, FIELD_Y0, 120, 0, Math.PI * 2); c.fill();
    c.strokeStyle = 'rgba(74,195,255,0.3)'; c.lineWidth = 3;
    c.beginPath(); c.arc(1330, FIELD_Y0, 60, 0, Math.PI * 2); c.stroke();
    c.strokeStyle = 'rgba(74,195,255,0.18)'; c.lineWidth = 5;
    for (let x = 220; x < DW; x += 300) { c.beginPath(); c.moveTo(x, FIELD_Y0 - 4); c.quadraticCurveTo(x + 40, FIELD_Y0 + 30, x + 20, FIELD_Y0 + 80); c.stroke(); }
    c.fillStyle = '#1c2c3a'; c.fillRect(240, FIELD_Y0 - 10, 100, 40);
    c.fillStyle = 'rgba(80,240,120,0.4)'; c.fillRect(248, FIELD_Y0 - 2, 40, 8);
    c.fillRect(294, FIELD_Y0 + 10, 30, 6);
  }
  /* subtle grid hints on battlefield */
  c.strokeStyle = theme === 0 ? 'rgba(0,0,0,0.10)' : 'rgba(255,255,255,0.05)';
  c.lineWidth = 1.5;
  for (let i = 0; i <= COLS; i++) { c.beginPath(); c.moveTo(FIELD_X0 + i * CELL_W, FIELD_Y0); c.lineTo(FIELD_X0 + i * CELL_W, FIELD_Y0 + 5 * CELL_H); c.stroke(); }
  for (let i = 0; i <= LANES; i++) { c.beginPath(); c.moveTo(FIELD_X0, FIELD_Y0 + i * CELL_H); c.lineTo(DW - 20, FIELD_Y0 + i * CELL_H); c.stroke(); }
  /* lane tint alternating */
  for (let l = 0; l < LANES; l++) {
    if (l % 2 === 1) { c.fillStyle = theme === 0 ? 'rgba(0,0,0,0.045)' : 'rgba(0,0,0,0.12)'; c.fillRect(FIELD_X0, FIELD_Y0 + l * CELL_H, DW - FIELD_X0 - 20, CELL_H); }
  }
  bgCache = { theme, canvas: cv };
  return cv;
}
