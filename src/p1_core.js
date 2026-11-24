'use strict';
/* ============================================================
   SCRAP BOTS: LAST HOME  — آهن‌پاره‌بان‌ها: خانه آخر
   Single-file HTML5 lane-defense game. Design res: 1600x900.
   ============================================================ */
const DW = 1600, DH = 900;               // design resolution (landscape)
const LANES = 5, COLS = 9;
const CELL_W = 158, CELL_H = 128;
const FIELD_X0 = 150, FIELD_Y0 = 104;    // grid origin
const HOME_X = 148;                       // home boundary
const HUD_H = 96, BAR_H = 150;

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
let VIEW = { s: 1, ox: 0, oy: 0, vw: 0, vh: 0, dpr: 1 };

/* ---------- responsive scaling: letterboxed fixed design res ---------- */
function resize() {
  const vw = window.innerWidth, vh = window.innerHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(vw * dpr);
  canvas.height = Math.round(vh * dpr);
  canvas.style.width = vw + 'px';
  canvas.style.height = vh + 'px';
  const s = Math.min(vw / DW, vh / DH);
  VIEW = { s: s * dpr, ox: (vw * dpr - DW * s * dpr) / 2, oy: (vh * dpr - DH * s * dpr) / 2, vw: vw * dpr, vh: vh * dpr, dpr: dpr, cssS: s, cssOx: (vw - DW * s) / 2, cssOy: (vh - DH * s) / 2 };
}
window.addEventListener('resize', resize);
window.addEventListener('orientationchange', () => setTimeout(resize, 120));
resize();
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
document.addEventListener('dblclick', e => e.preventDefault());

/* screen(css px) -> design coords */
function toDesign(cx, cy) {
  return { x: (cx - VIEW.cssOx) / VIEW.cssS, y: (cy - VIEW.cssOy) / VIEW.cssS };
}

/* ---------- utils ---------- */
const FA_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
function faNum(n) { return String(n).replace(/\d/g, d => FA_DIGITS[+d]); }
function numStr(n) { return SAVE.settings.lang === 'fa' ? faNum(n) : String(n); }
function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
function lerp(a, b, t) { return a + (b - a) * t; }
function dist(x1, y1, x2, y2) { return Math.hypot(x2 - x1, y2 - y1); }
let _seed = 12345;
function rnd() { _seed = (_seed * 1103515245 + 12345) & 0x7fffffff; return _seed / 0x7fffffff; }
function rndR(a, b) { return a + rnd() * (b - a); }
function rndI(a, b) { return Math.floor(rndR(a, b + 1)); }
function pick(arr) { return arr[rndI(0, arr.length - 1)]; }

/* ---------- i18n ---------- */
const STR = {
  fa: {
    title: 'آهن‌پاره‌بان‌ها', subtitle: 'خانه آخر',
    start: 'شروع بازی', cont: 'ادامه بازی', garage: 'گاراژ ربات‌ها', upgrades: 'ارتقای ربات‌ها',
    stages: 'انتخاب مراحل', collection: 'مجموعه ربات‌ها', settings: 'تنظیمات', exit: 'خروج از بازی',
    bolts: 'پیچ و مهره', spark: 'جرقه', stage: 'مرحله', wave: 'موج', pause: 'توقف',
    resume: 'ادامه', restart: 'شروع دوباره مرحله', toMenu: 'بازگشت به منوی اصلی',
    victory: 'پیروزی!', defeat: 'شکست!', retry: 'تلاش دوباره', toStages: 'بازگشت به مراحل',
    noSpark: 'جرقه کافی نداری!', locked: 'قفل است', unlocked: 'باز شد!',
    unlockNext: 'ربات تازه ساختی!', enemyBrief: 'دشمن تازه!', tapCont: 'برای ادامه لمس کن',
    homeHP: 'سلامت خانه', killCount: 'دشمنان منهدم‌شده', reward: 'پاداش',
    base: 'پاداش پایه', hpBonus: 'پاداش سلامت خانه', killBonus: 'پاداش نبرد', total: 'جمع کل',
    lvl: 'سطح', cost: 'هزینه', upgrade: 'ارتقا', maxed: 'حداکثر',
    role: 'نقش', ability: 'قابلیت', hp: 'سلامت', dmg: 'آسیب', interval: 'فاصله حمله', prod: 'تولید جرقه',
    music: 'موسیقی', sfx: 'جلوه‌های صوتی', quality: 'کیفیت گرافیک', lang: 'زبان', help: 'راهنما',
    reset: 'بازنشانی پیشرفت', resetQ: 'همه پیشرفتت پاک شود؟', yes: 'بله', no: 'نه',
    low: 'کم', med: 'متوسط', high: 'زیاد', confirm: 'تأیید', back: 'بازگشت',
    lockedStg: 'ابتدا مرحله قبلی را ببر!',
    rotate: 'گوشی را بچرخانید', rotateSub: 'این بازی در حالت افقی اجرا می‌شود',
    s1t1: 'برای ساخت ربات، کارت آن را از نوار پایین انتخاب کن.', s1t2: 'حالا روی یکی از خانه‌های خالی زمین ضربه بزن.',
    s1t3: 'دینام‌ساز برایت جرقه تولید می‌کند؛ چند بچین!', s1t4: 'دشمن‌ها از راست می‌آیند. خانه را حفظ کن!',
    s2t: 'بعضی دشمنان سپر دارند؛ از ترکیب ربات‌ها استفاده کن.', s3t: 'مراقب دشمنان سریع و تیرانداز باش!',
    eBtn: 'دستگاه اضطراری', eBtnTip: 'دستگاه اضطراری هر خط: یک بار در مرحله، دشمنان آن خط را پاک می‌کند.',
    skip: 'رد کردن', seasonDone: 'فصل اول کامل شد!', s2teaser: 'پدرت زنده است… فصل بعد: شهر اشغال‌شده',
    encMsg: 'پیام رمزگشایی شد: «آرین، من زنده‌ام. در کارخانه مرکزی پنهان شده‌ام. صبر کن…»',
    storyA: 'دکتر کامیار، دانشمند ربات‌ها، در آشوب شهر گم شد…',
    storyB: 'آرین، پسرش، در خانه قدیمی پناه گرفت.',
    storyC: 'با آهن‌پاره‌های دور ریخته، ربات‌های مدافع ساخت…',
    storyD: 'و حالا، خانه آخر باید حفظ شود!',
    newRobotCard: 'ربات تازه باز شد', howUse: 'روش استفاده',
    win1: 'مرحله را تمام کردی', win2: 'سلامت خانه بالای ۴۰٪', win3: 'سلامت خانه بالای ۷۵٪',
    best: 'بهترین امتیاز', stars: 'ستاره‌ها', replay: 'دوباره بازی کن', next: 'مرحله بعد',
    enemies: 'دشمنان', robots: 'ربات‌ها', area: 'منطقه',
    a1: 'حیاط و ورودی', a2: 'گاراژ و پارکینگ', a3: 'راهرو و اتاق نشیمن', a4: 'زیرزمین و کارگاه مخفی',
    blocked: 'خرابه — قابل ساخت نیست', camoWarn: 'این دشمن استتار دارد! با پروژکتوربان آشکارش کن.',
    disabled: 'از کار افتاده', speedUp: 'تند شده', boosted: 'شتاب!',
    bye: 'خداحافظ! تا بازی بعدی.', exitTip: 'برای خروج دوباره لمس کن',
    saved: 'ذخیره شد', comingSoon: 'به‌زودی', levelShort: 'س',
    helpText: '۱) کارت ربات را از پایین انتخاب کن. ۲) روی خانه خالی زمین ضربه بزن تا ساخته شود. ۳) دینام‌ساز جرقه می‌سازد؛ با جرقه ربات بساز. ۴) اگر دشمن به خانه رسید، سلامت خانه کم می‌شود. ۵) دستگاه اضطراری هر خط فقط یک‌بار کار می‌کند. ۶) پیچ و مهره‌ها را در گاراژ خرج ارتقا کن!',
    replaysUnlockedAll: 'همه ربات‌ها باز شدند!',
  },
  en: {
    title: 'SCRAP BOTS', subtitle: 'Last Home',
    start: 'Start Game', cont: 'Continue', garage: 'Robot Garage', upgrades: 'Upgrades',
    stages: 'Stage Select', collection: 'Collection', settings: 'Settings', exit: 'Exit Game',
    bolts: 'Bolts', spark: 'Spark', stage: 'Stage', wave: 'Wave', pause: 'Pause',
    resume: 'Resume', restart: 'Restart Stage', toMenu: 'Main Menu',
    victory: 'Victory!', defeat: 'Defeat!', retry: 'Retry', toStages: 'Stage Select',
    noSpark: 'Not enough Spark!', locked: 'Locked', unlocked: 'Unlocked!',
    unlockNext: 'New robot built!', enemyBrief: 'New enemy!', tapCont: 'Tap to continue',
    homeHP: 'Home Health', killCount: 'Enemies destroyed', reward: 'Reward',
    base: 'Base reward', hpBonus: 'Home health bonus', killBonus: 'Battle bonus', total: 'Total',
    lvl: 'Level', cost: 'Cost', upgrade: 'Upgrade', maxed: 'Max',
    role: 'Role', ability: 'Ability', hp: 'Health', dmg: 'Damage', interval: 'Attack interval', prod: 'Spark output',
    music: 'Music', sfx: 'Sound FX', quality: 'Graphics Quality', lang: 'Language', help: 'Help',
    reset: 'Reset Progress', resetQ: 'Erase all progress?', yes: 'Yes', no: 'No',
    low: 'Low', med: 'Medium', high: 'High', confirm: 'Confirm', back: 'Back',
    lockedStg: 'Win the previous stage first!',
    rotate: 'Rotate your phone', rotateSub: 'This game runs in landscape',
    s1t1: 'Pick a robot card from the bottom bar to build it.', s1t2: 'Now tap an empty grid cell.',
    s1t3: 'Dynamo Maker generates Spark; build a few!', s1t4: 'Enemies come from the right. Defend the home!',
    s2t: 'Some enemies carry shields; combine robots.', s3t: 'Watch out for fast and shooting enemies!',
    eBtn: 'Emergency device', eBtnTip: 'Per-lane emergency device: once per stage, clears that lane.',
    skip: 'Skip', seasonDone: 'Season One Complete!', s2teaser: 'Dad is alive… Next season: the occupied city',
    encMsg: 'Decrypted: "Arin, I am alive. Hiding in the central factory. Wait…"',
    storyA: 'Dr. Kamyar, the robot scientist, vanished in the chaos…',
    storyB: 'Arin, his son, took shelter in the old family home.',
    storyC: 'From thrown-away scraps, he built defender robots…',
    storyD: 'Now, the last home must be defended!',
    newRobotCard: 'Robot unlocked', howUse: 'How to use',
    win1: 'Complete the stage', win2: 'Finish above 40% home health', win3: 'Finish above 75% home health',
    best: 'Best score', stars: 'Stars', replay: 'Replay', next: 'Next Stage',
    enemies: 'Enemies', robots: 'Robots', area: 'Area',
    a1: 'Front Yard & Entrance', a2: 'Garage & Parking', a3: 'Hallway & Living Room', a4: 'Basement & Hidden Workshop',
    blocked: 'Rubble — cannot build', camoWarn: 'This enemy is camouflaged! Reveal it with Projector Guard.',
    disabled: 'Disabled', speedUp: 'Hasted', boosted: 'Boost!',
    bye: 'Goodbye! See you next time.', exitTip: 'Tap again to exit',
    saved: 'Saved', comingSoon: 'Soon', levelShort: 'L',
    helpText: '1) Pick a robot card below. 2) Tap an empty cell to build. 3) Dynamo Maker makes Spark. 4) Enemies reaching the home damage it. 5) Each lane has a one-time emergency device. 6) Spend Bolts on upgrades in the Garage!',
    replaysUnlockedAll: 'All robots unlocked!',
  }
};
function T(k) { return STR[SAVE.settings.lang][k] || STR.fa[k] || k; }

/* ---------- Save manager ---------- */
const SAVE_KEY = 'scrapbots_lasthome_v1';
function defaultSave() {
  const robotLevels = {}, robotUnlocked = {};
  for (const r of ROBOT_LIST) { robotLevels[r.id] = 1; robotUnlocked[r.id] = r.unlock === 0; }
  return {
    unlockedStage: 1, stageStars: {}, stageBest: {}, bolts: 120,
    robotLevels, robotUnlocked, seasonComplete: false, introSeen: false,
    briefingsSeen: {}, settings: { music: 0.7, sfx: 0.8, quality: 'high', lang: 'fa' }
  };
}
let SAVE = null;
function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      const d = JSON.parse(raw);
      const base = defaultSave();
      SAVE = Object.assign(base, d);
      SAVE.settings = Object.assign(base.settings, d.settings || {});
      SAVE.robotLevels = Object.assign(base.robotLevels, d.robotLevels || {});
      SAVE.robotUnlocked = Object.assign(base.robotUnlocked, d.robotUnlocked || {});
      return;
    }
  } catch (e) { /* corrupted -> fresh */ }
  SAVE = defaultSave();
}
function persist() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(SAVE)); } catch (e) {} }

/* ---------- Audio engine (WebAudio synth, no external files) ---------- */
const AudioSys = {
  ctx: null, musicGain: null, sfxGain: null, started: false, musicTimer: null, mode: 'none', seqStep: 0,
  init() {
    if (this.started) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.musicGain = this.ctx.createGain(); this.musicGain.connect(this.ctx.destination);
      this.sfxGain = this.ctx.createGain(); this.sfxGain.connect(this.ctx.destination);
      this.applyVolumes(); this.started = true;
      this.startMusic(SAVE ? 'menu' : 'menu');
    } catch (e) {}
  },
  applyVolumes() {
    if (!this.ctx) return;
    this.musicGain.gain.value = SAVE.settings.music * 0.5;
    this.sfxGain.gain.value = SAVE.settings.sfx * 0.9;
  },
  tone(freq, dur, type, vol, when, slide, dest) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime + (when || 0);
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type || 'square'; o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, slide), t + dur);
    g.gain.setValueAtTime(vol || 0.2, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(dest || this.sfxGain);
    o.start(t); o.stop(t + dur + 0.05);
  },
  noise(dur, vol, when, filt) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime + (when || 0);
    const len = Math.max(1, Math.floor(this.ctx.sampleRate * dur));
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = this.ctx.createBufferSource(); src.buffer = buf;
    const g = this.ctx.createGain(); g.gain.setValueAtTime(vol || 0.2, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    let node = src;
    if (filt) { const f = this.ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = filt; src.connect(f); node = f; }
    node.connect(g); g.connect(this.sfxGain);
    src.start(t);
  },
  sfx(name) {
    if (!this.ctx || !SAVE) return;
    switch (name) {
      case 'click': this.tone(660, 0.07, 'square', 0.15); this.tone(990, 0.05, 'square', 0.1, 0.04); break;
      case 'deploy': this.tone(330, 0.1, 'square', 0.18); this.tone(440, 0.1, 'square', 0.15, 0.07); this.noise(0.15, 0.12, 0, 3000); break;
      case 'shoot': this.tone(880, 0.06, 'square', 0.09, 0, 440); break;
      case 'hit': this.noise(0.08, 0.15, 0, 1800); break;
      case 'boom': this.noise(0.4, 0.3, 0, 900); this.tone(120, 0.3, 'sine', 0.25, 0, 40); break;
      case 'zap': this.tone(1400, 0.15, 'sawtooth', 0.12, 0, 200); this.tone(2000, 0.1, 'sawtooth', 0.08, 0.05, 300); break;
      case 'frost': this.tone(1800, 0.3, 'sine', 0.1, 0, 900); this.noise(0.25, 0.06, 0, 5000); break;
      case 'repair': this.tone(523, 0.08, 'sine', 0.12); this.tone(659, 0.08, 'sine', 0.12, 0.08); this.tone(784, 0.1, 'sine', 0.12, 0.16); break;
      case 'shield': this.tone(300, 0.25, 'sine', 0.15, 0, 600); break;
      case 'laser': this.tone(220, 0.35, 'sawtooth', 0.18, 0, 80); this.noise(0.2, 0.12, 0, 2500); break;
      case 'unlock': [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.18, 'square', 0.16, i * 0.12)); break;
      case 'upgrade': [440, 554, 659, 880].forEach((f, i) => this.tone(f, 0.15, 'sine', 0.16, i * 0.09)); break;
      case 'win': [523, 659, 784, 1047, 1319].forEach((f, i) => this.tone(f, 0.3, 'square', 0.14, i * 0.15)); break;
      case 'lose': [400, 350, 300, 250, 200].forEach((f, i) => this.tone(f, 0.35, 'sawtooth', 0.14, i * 0.2)); break;
      case 'emergency': this.tone(200, 0.5, 'sawtooth', 0.2, 0, 900); this.noise(0.4, 0.15, 0, 1200); break;
      case 'homehit': this.tone(150, 0.3, 'sawtooth', 0.25, 0, 60); this.noise(0.3, 0.2, 0, 700); break;
      case 'camo': this.tone(1200, 0.2, 'sine', 0.1, 0, 1600); break;
      case 'hack': this.tone(100, 0.2, 'square', 0.15, 0, 2000); this.tone(1600, 0.15, 'square', 0.08, 0.05, 200); break;
    }
  },
  startMusic(mode) {
    if (!this.ctx) { this.mode = mode; return; }
    if (this.mode === mode && this.musicTimer) return;
    this.mode = mode; this.seqStep = 0;
    if (this.musicTimer) clearInterval(this.musicTimer);
    const self = this;
    const scales = {
      menu: { notes: [220, 262, 330, 392, 440, 392, 330, 262], bass: 110, tempo: 1900, type: 'sine' },
      battle: { notes: [294, 349, 440, 349, 294, 392, 440, 523], bass: 98, tempo: 950, type: 'square' },
      boss: { notes: [233, 277, 349, 277, 233, 311, 349, 415], bass: 87, tempo: 700, type: 'sawtooth' }
    };
    const conf = scales[mode] || scales.menu;
    this.musicTimer = setInterval(() => {
      if (!SAVE || !self.ctx) return;
      const st = self.seqStep % 8;
      const quiet = 0.055;
      self.tone(conf.notes[st], conf.tempo / 1000 * 0.9, conf.type, quiet, 0, null, self.musicGain);
      if (st % 2 === 0) self.tone(conf.bass, conf.tempo / 1000 * 1.6, 'triangle', 0.075, 0, null, self.musicGain);
      if (mode !== 'menu' && st === 4) self.tone(conf.notes[st] * 2, 0.2, conf.type, 0.03, 0, null, self.musicGain);
      self.seqStep++;
    }, conf.tempo);
  }
};

/* ---------- Input manager (design-coord hit testing) ---------- */
function btnKey(b) { return `${Math.round(b.x)},${Math.round(b.y)},${Math.round(b.w)},${Math.round(b.h)}`; }
const Input = {
  downId: null, downBtn: null,
  press(cx, cy) {
    AudioSys.init();
    const p = toDesign(cx, cy);
    const btn = hitButton(p.x, p.y);
    if (btn) { this.downBtn = btn; btn.pressed = true; }
    return btn;
  },
  release(cx, cy) {
    const p = toDesign(cx, cy);
    if (this.downBtn) { this.downBtn.pressed = false; }
    const btn = hitButton(p.x, p.y);
    const b = this.downBtn;
    this.downBtn = null;
    /* buttons are rebuilt every frame -> compare by stable position key */
    if (btn && b && btnKey(b) === btnKey(btn) && btn.enabled !== false) {
      AudioSys.sfx('click');
      btn.onClick && btn.onClick(p);
      return true;
    }
    /* battle field taps: deploy selected robot into grid cell */
    if (typeof Screen !== 'undefined' && Screen.cur === 'battle' && typeof BATTLE !== 'undefined' && BATTLE && !BATTLE.paused && !BATTLE.over) {
      const x = p.x, y = p.y;
      const inField = x >= FIELD_X0 && x < DW - 20 && y >= FIELD_Y0 && y < FIELD_Y0 + LANES * CELL_H;
      if (BATTLE.selected) {
        if (inField) {
          const col = Math.floor((x - FIELD_X0) / CELL_W);
          const lane = Math.floor((y - FIELD_Y0) / CELL_H);
          deployRobot(col, lane);
        } else if (y < DH - BAR_H) {
          BATTLE.selected = null; /* tap outside field cancels selection */
        }
        return true;
      }
      return true;
    }
    return false;
  }
};
canvas.addEventListener('pointerdown', e => { e.preventDefault(); Input.press(e.clientX, e.clientY); }, { passive: false });
canvas.addEventListener('pointermove', e => {
  if (!Input.downBtn || !Input.downBtn.dragSlider) return;
  const p = toDesign(e.clientX, e.clientY);
  const d = Input.downBtn.dragSlider;
  SAVE.settings[d.key] = clamp((p.x - d.sx) / d.sw, 0, 1);
  AudioSys.applyVolumes();
}, { passive: true });
canvas.addEventListener('pointerup', e => { e.preventDefault(); Input.release(e.clientX, e.clientY); }, { passive: false });
canvas.addEventListener('pointercancel', () => { if (Input.downBtn) Input.downBtn.pressed = false; Input.downBtn = null; });

/* ---------- UI button registry (rebuilt each frame by screens) ---------- */
let UI_BUTTONS = [];
function clearButtons() { UI_BUTTONS = []; }
function addButton(x, y, w, h, onClick, opts) {
  const b = Object.assign({ x, y, w, h, onClick, pressed: false, enabled: true }, opts || {});
  UI_BUTTONS.push(b); return b;
}
function hitButton(x, y) {
  for (let i = UI_BUTTONS.length - 1; i >= 0; i--) {
    const b = UI_BUTTONS[i];
    if (b.enabled === false) continue;
    if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) return b;
  }
  return null;
}
/* screen-wide tap handler (dialogues, tutorial advance) */
let TAP_ACTION = null;
