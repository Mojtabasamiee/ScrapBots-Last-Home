/* ============================================================
   BATTLE — entities, waves, combat, HUD
   ============================================================ */
let BATTLE = null;
let particles = [];
let floaters = [];

function addParticle(p) {
  const q = SAVE.settings.quality;
  const cap = q === 'low' ? 60 : q === 'med' ? 150 : 320;
  if (particles.length < cap) particles.push(p);
}
function burst(x, y, col, n, spd, life, size) {
  for (let i = 0; i < n; i++) {
    const a = rndR(0, Math.PI * 2), v = rndR(spd * 0.3, spd);
    addParticle({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 30, g: 120, life: rndR(life * 0.5, life), maxLife: life, col, size: rndR(size * 0.5, size), kind: 'dot' });
  }
}
function smokePuff(x, y, n) {
  for (let i = 0; i < n; i++) {
    addParticle({ x: x + rndR(-10, 10), y: y + rndR(-10, 10), vx: rndR(-20, 20), vy: rndR(-50, -20), g: -20, life: rndR(0.5, 1), maxLife: 1, col: [200, 200, 205], size: rndR(6, 14), kind: 'smoke' });
  }
}
function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.life -= dt;
    if (p.life <= 0) { particles.splice(i, 1); continue; }
    p.x += p.vx * dt; p.y += p.vy * dt; p.vy += (p.g || 0) * dt;
  }
}
function drawParticles(c) {
  for (const p of particles) {
    const a = clamp(p.life / p.maxLife, 0, 1);
    if (p.kind === 'smoke') {
      c.fillStyle = `rgba(${p.col[0]},${p.col[1]},${p.col[2]},${a * 0.35})`;
      c.beginPath(); c.arc(p.x, p.y, p.size * (1.6 - a * 0.6), 0, Math.PI * 2); c.fill();
    } else {
      const col = Array.isArray(p.col) ? `rgba(${p.col[0]},${p.col[1]},${p.col[2]},${a})` : hexA(p.col, a);
      c.fillStyle = col;
      c.beginPath(); c.arc(p.x, p.y, p.size, 0, Math.PI * 2); c.fill();
    }
  }
}
function hexA(hex, a) {
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}
function floatText(x, y, txt, col, size) {
  floaters.push({ x, y, txt, col: col || '#ffd66b', size: size || 22, life: 1.1 });
}

/* ---------- Entities ---------- */
class PlayerBot {
  constructor(id, col, lane, level) {
    const R = ROBOT_BY_ID[id], L = R.levels[level - 1];
    this.id = id; this.R = R; this.col = col; this.lane = lane;
    this.level = level;
    this.maxHp = (L.hp || R.levels[0].hp || 100);
    this.hp = this.maxHp;
    this.x = FIELD_X0 + col * CELL_W + CELL_W / 2;
    this.y = FIELD_Y0 + lane * CELL_H + CELL_H - 26;
    this.cool = R.atkInt ? R.atkInt * 0.5 : 0;
    this.prodT = id === 'dynamo' ? (L.int || 8) * 0.4 : 0;
    this.firing = false; this.fT = 0;
    this.deployT = 0.45;
    this.dead = false; this.flash = 0;
    this.camoReveal = 0;
  }
  update(dt) {
    if (this.deployT > 0) { this.deployT -= dt; return; }
    if (this.flash > 0) this.flash -= dt;
    if (this.firing) { this.fT -= dt; if (this.fT <= 0) this.firing = false; }
    if (this.cool > 0) this.cool -= dt;
    const L = this.R.levels[this.level - 1];
    if (this.id === 'dynamo') {
      this.prodT -= dt;
      if (this.prodT <= 0) {
        this.prodT = L.int;
        BATTLE.spark += L.prod;
        floatText(this.x, this.y - 80, '+' + numStr(L.prod), '#ffd66b');
        AudioSys.sfx('repair');
        burst(this.x, this.y - 50, '#ffd66b', 6, 60, 0.5, 3);
      }
      return;
    }
    if (this.id === 'welder') {
      /* heal adjacent allies every second */
      this.healTick = (this.healTick || 0) + dt;
      if (this.healTick >= 1) {
        this.healTick = 0;
        let healed = false;
        for (const b of BATTLE.bots) {
          if (b === this || b.dead) continue;
          const d = Math.abs(b.x - this.x) <= CELL_W * 1.1 && Math.abs(b.y - this.y) <= CELL_H * 1.1;
          if (d && b.hp < b.maxHp) { b.hp = Math.min(b.maxHp, b.hp + L.heal); healed = true; b.healGlow = 0.5; }
        }
        if (healed) { this.healing = true; this.healShowT = 0.5; AudioSys.sfx('repair'); }
      }
      if (this.healShowT > 0) { this.healShowT -= dt; if (this.healShowT <= 0) this.healing = false; }
      return;
    }
    if (this.id === 'projector') {
      /* continuous beam: slow + reveal nearest enemy in lane */
      this.beamTarget = null;
      let best = null, bd = 1e9;
      for (const e of BATTLE.enemies) {
        if (e.lane !== this.lane || e.dead || e.x < this.x) continue;
        const d = e.x - this.x;
        if (d < bd) { bd = d; best = e; }
      }
      if (best) {
        this.beamTarget = best;
        best.slowT = Math.max(best.slowT, 0.35);
        best.slowPct = L.slow / 100;
        if (best.camo) { best.revealedT = Math.max(best.revealedT || 0, 2.5); AudioSys.sfx('camo'); }
      }
      return;
    }
    if (this.id === 'hacker') {
      this.hackT = (this.hackT || 0) - dt;
      if (this.hackT <= 0) {
        let any = false;
        for (const e of BATTLE.enemies) {
          if (e.dead) continue;
          if (Math.abs(e.y - this.y) < CELL_H * 1.4 && e.x > this.x - CELL_W && e.x < this.x + CELL_W * 4.2) {
            e.disabledT = Math.max(e.disabledT || 0, L.dur);
            e.slowT = Math.max(e.slowT, L.dur);
            e.slowPct = Math.max(e.slowPct || 0, 0.4);
            any = true;
          }
        }
        if (any) { this.hackT = this.R.cd; this.hackShowT = 0.6; AudioSys.sfx('hack'); }
      }
      if (this.hackShowT > 0) this.hackShowT -= dt;
      return;
    }
    if (this.id === 'frost') {
      /* cone attack */
      if (this.cool <= 0) {
        let any = false;
        for (const e of BATTLE.enemies) {
          if (e.dead || e.lane !== this.lane) continue;
          if (e.x > this.x && e.x < this.x + 300) {
            e.hp -= L.dmg; e.flash = 0.12;
            e.slowT = Math.max(e.slowT, 1.2); e.slowPct = L.slow / 100;
            any = true;
          }
        }
        if (any) { this.cool = this.R.atkInt; this.firing = true; this.fT = 0.3; AudioSys.sfx('frost'); }
      }
      return;
    }
    /* attacking robots */
    const target = this.findTarget();
    if (!target) return;
    if (this.id === 'spring' || this.id === 'wrench') {
      const range = this.id === 'spring' ? CELL_W * 1.35 : CELL_W * 1.25;
      if (this.cool <= 0 && target.x - this.x < range) {
        this.cool = this.R.atkInt; this.firing = true; this.fT = 0.35;
        const dmg = L.dmg;
        target.damage(dmg, this.id === 'spring');
        if (this.id === 'spring') target.knockback(70);
        AudioSys.sfx('hit');
        burst((this.x + target.x) / 2, this.y - 40, '#ffd66b', 8, 90, 0.4, 3);
      }
      return;
    }
    if (this.cool <= 0) {
      this.cool = this.R.atkInt; this.firing = true; this.fT = 0.2;
      if (this.id === 'canSlinger') BATTLE.shots.push({ kind: 'pellet', x: this.x + 46, y: this.y - 46, vx: 640, dmg: L.dmg, lane: this.lane, life: 2 });
      else if (this.id === 'barrel') BATTLE.shots.push({ kind: 'bomb', x: this.x + 30, y: this.y - 80, sx: this.x + 30, sy: this.y - 80, tx: target.x, ty: target.y - 30, t: 0, dur: 0.7, dmg: L.dmg, aoe: L.aoe, lane: this.lane });
      else if (this.id === 'coil') {
        AudioSys.sfx('zap');
        const hitList = [target];
        for (const e of BATTLE.enemies) {
          if (e.dead || hitList.includes(e)) continue;
          if (Math.abs(e.y - target.y) < CELL_H * 1.1 && Math.abs(e.x - (hitList[hitList.length - 1].x)) < CELL_W * 1.6) hitList.push(e);
          if (hitList.length >= (L.chain || 3)) break;
        }
        this.chainPts = [{ x: this.x + 10, y: this.y - 66 }].concat(hitList.map(e => ({ x: e.x, y: e.y - 36 })));
        this.chainShowT = 0.18;
        for (const e of hitList) { e.hp -= L.dmg; e.flash = 0.12; burst(e.x, e.y - 40, '#7ec8ff', 6, 70, 0.3, 2.5); }
      }
      else if (this.id === 'pipe') BATTLE.shots.push({ kind: 'boltP', x: this.x + 44, y: this.y - 46, vx: 780, dmg: L.dmg, pierce: L.pierce || 4, hit: [], lane: this.lane, life: 2.4 });
    }
  }
  findTarget() {
    let best = null, bd = 1e9;
    for (const e of BATTLE.enemies) {
      if (e.dead || e.lane !== this.lane) continue;
      if (e.isCamoHidden() && this.id !== 'projector') continue;
      if (e.x < this.x - 10) continue;
      const d = e.x - this.x;
      if (d < bd) { bd = d; best = e; }
    }
    return best;
  }
  damage(d) {
    if (this.dead) return;
    this.hp -= d; this.flash = 0.15;
    if (this.hp <= 0) {
      this.dead = true;
      smokePuff(this.x, this.y - 30, 6);
      burst(this.x, this.y - 30, '#c96a2a', 10, 120, 0.6, 4);
      AudioSys.sfx('boom');
    }
  }
  draw(c, t) {
    c.save(); c.translate(this.x, this.y);
    if (this.deployT > 0) {
      const k = 1 - this.deployT / 0.45;
      c.scale(0.3 + k * 0.7, 0.3 + k * 0.7);
      c.globalAlpha = k;
    }
    if (this.healGlow > 0) { this.healGlow -= 0.016; c.fillStyle = `rgba(110,230,160,${this.healGlow * 0.4})`; c.beginPath(); c.ellipse(0, -4, 34, 10, 0, 0, Math.PI * 2); c.fill(); }
    const bob = Math.sin(t * 3 + this.col) * 1.5;
    c.translate(0, bob);
    ROBOT_ART[this.id](c, t, this.level, { x: this.x, firing: this.firing, fT: this.fT, charging: this.chainShowT > 0, healing: this.healing });
    if (this.flash > 0) {
      c.globalAlpha = clamp(this.flash * 4, 0, 0.55); c.fillStyle = '#ff5e5e';
      c.beginPath(); c.roundRect(-30, -70, 60, 66, 8); c.fill(); c.globalAlpha = 1;
    }
    /* upgrade cosmetics drawn by art fn via lvl param */
    /* hp bar */
    if (this.hp < this.maxHp) {
      const w = 44, r = clamp(this.hp / this.maxHp, 0, 1);
      c.fillStyle = 'rgba(0,0,0,0.5)'; c.beginPath(); c.roundRect(-w / 2, -86, w, 7, 3); c.fill();
      c.fillStyle = r > 0.5 ? '#6ee6a0' : r > 0.25 ? '#ffd66b' : '#ff5e5e';
      c.beginPath(); c.roundRect(-w / 2 + 1, -85, (w - 2) * r, 5, 2); c.fill();
    }
    c.restore();
    /* effects outside transform */
    if (this.id === 'projector' && this.beamTarget && !this.beamTarget.dead && this.deployT <= 0) {
      const e = this.beamTarget;
      c.save(); c.strokeStyle = 'rgba(255,233,168,0.75)'; c.lineWidth = 3;
      c.setLineDash([8, 6]); c.lineDashOffset = -t * 40;
      c.beginPath(); c.moveTo(this.x + 20, this.y - 56); c.lineTo(e.x, e.y - 40); c.stroke();
      c.restore();
    }
    if (this.id === 'coil' && this.chainShowT > 0) {
      this.chainShowT -= 0.016;
      c.save(); c.strokeStyle = '#9fd8ff'; c.lineWidth = 3; c.globalAlpha = 0.9;
      c.beginPath();
      const pts = this.chainPts;
      c.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) {
        c.lineTo(pts[i].x + rndR(-6, 6), pts[i].y + rndR(-6, 6));
      }
      c.stroke(); c.restore();
    }
    if (this.id === 'hacker' && this.hackShowT > 0) {
      c.save(); c.strokeStyle = `rgba(80,240,120,${this.hackShowT * 1.4})`; c.lineWidth = 3;
      c.beginPath(); c.arc(this.x, this.y - 40, CELL_W * 3 * (1 - this.hackShowT / 0.6) + 20, 0, Math.PI * 2); c.stroke();
      c.restore();
    }
  }
}

class Enemy {
  constructor(type, lane, opts) {
    const D = ENEMY_LIST[type];
    this.type = type; this.D = D; this.lane = lane;
    const hpMul = opts && opts.hpMul ? opts.hpMul : 1;
    this.maxHp = D.hp * hpMul; this.hp = this.maxHp;
    this.shield = (D.shield || 0) * hpMul;
    this.maxShield = this.shield;
    this.x = DW - 20 + rndR(0, 40);
    this.y = FIELD_Y0 + lane * CELL_H + CELL_H - 26;
    this.speed = D.speed; this.baseSpeed = D.speed;
    this.slowT = 0; this.slowPct = 0;
    this.disabledT = 0;
    this.buffT = 0; this.atkBuff = 0;
    this.flash = 0; this.dead = false;
    this.camo = opts && opts.camo ? true : false;
    this.revealedT = 0;
    this.atkCool = D.atkInt ? D.atkInt * 0.6 : 0;
    this.chargeT = 0; this.beamT = 0; this.beamTarget = null;
    this.boostT = 0; this.boostCool = 4;
    this.pulseT = 0; this.pulseCool = 3;
    this.cmdT = 0; this.cmdCool = 5; this.summons = 0;
    this.healT = 0;
    this.phase = 1;
    this.abilityT = 2.5;
    this.abilityCool = 6;
    this.shieldT = 0;
    this.shieldCool = 0;
    this.arrived = false; this.eatT = 0;
  }
  isCamoHidden() { return this.camo && (this.revealedT || 0) <= 0; }
  knockback(px) { this.x = Math.min(DW - 30, this.x + px); }
  damage(d, isShock) {
    if (this.dead || this.shieldT > 0) { if (this.shieldT > 0) burst(this.x, this.y - 50, '#4ac3ff', 3, 60, 0.3, 2); return; }
    if (this.pulseT > 0) d *= 0.55;
    if (this.shield > 0) {
      const s = Math.min(this.shield, d);
      this.shield -= s; d -= s;
      burst(this.x - 20, this.y - 44, '#9fc4e8', 4, 70, 0.3, 2.5);
      if (this.shield <= 0) { burst(this.x, this.y - 40, '#9fc4e8', 14, 130, 0.5, 3); AudioSys.sfx('hit'); }
    }
    if (d > 0) { this.hp -= d; this.flash = 0.14; }
    if (this.hp <= 0) this.kill();
  }
  kill() {
    if (this.dead) return;
    this.dead = true;
    BATTLE.kills++;
    BATTLE.killsThisWave++;
    smokePuff(this.x, this.y - 40, 7);
    burst(this.x, this.y - 40, '#dfe7ef', 12, 130, 0.6, 3.5);
    burst(this.x, this.y - 40, '#ffd66b', 6, 100, 0.5, 2.5);
    AudioSys.sfx('boom');
    if (this.type === 'boss') BATTLE.bossDead = true;
  }
  update(dt) {
    if (this.dead) return;
    if (this.flash > 0) this.flash -= dt;
    if (this.slowT > 0) this.slowT -= dt;
    if (this.disabledT > 0) this.disabledT -= dt;
    if (this.revealedT > 0) this.revealedT -= dt;
    if (this.buffT > 0) this.buffT -= dt;
    if (this.pulseT > 0) this.pulseT -= dt;
    if (this.shieldT > 0) this.shieldT -= dt;
    let spd = this.baseSpeed;
    if (this.slowT > 0) spd *= (1 - (this.slowPct || 0));
    if (this.buffT > 0) spd *= 1.2;
    if (this.disabledT > 0) spd *= 0.7;
    const D = this.D;
    /* special behaviors */
    if (D.boost && this.disabledT <= 0) {
      this.boostCool -= dt;
      if (this.boostCool <= 0 && this.boostT <= 0) { this.boostT = 1.5; this.boostCool = 6; AudioSys.sfx('zap'); }
      if (this.boostT > 0) { this.boostT -= dt; spd *= 2.4; }
    }
    if (D.pulse && this.disabledT <= 0) {
      this.pulseCool -= dt;
      if (this.pulseCool <= 0) { this.pulseT = 4; this.pulseCool = 8; AudioSys.sfx('shield'); }
    }
    if (D.commander && this.disabledT <= 0) {
      this.cmdCool -= dt;
      if (this.cmdCool <= 0) {
        this.cmdCool = 10; this.cmdT = 5;
        let buffed = 0;
        for (const e of BATTLE.enemies) {
          if (e !== this && !e.dead && Math.abs(e.y - this.y) < CELL_H * 2.2) { e.buffT = 5; buffed++; }
        }
        if (this.summons < 3 && buffed > 0) {
          this.summons++;
          BATTLE.enemies.push(new Enemy('roller', this.lane));
          floatText(this.x, this.y - 90, '+', '#c9b6ff');
        }
        AudioSys.sfx('shield');
      }
      if (this.cmdT > 0) this.cmdT -= dt;
    }
    /* boss */
    if (D.boss) {
      const pct = this.hp / this.maxHp;
      this.phase = pct <= 0.33 ? 3 : pct <= 0.66 ? 2 : 1;
      this.abilityCool -= dt * (this.phase === 3 ? 1.6 : this.phase === 2 ? 1.25 : 1);
      if (this.abilityCool <= 0 && this.disabledT <= 0) {
        this.abilityCool = 7 - this.phase;
        const roll = rndI(0, 2);
        if (roll === 0) { /* beam on a cell */
          const targetCol = rndI(2, 6);
          BATTLE.bossWarn = { col: targetCol, lane: rndI(0, 4), t: 1.2 };
        } else if (roll === 1) {
          this.shieldT = 3; AudioSys.sfx('shield');
          floatText(this.x, this.y - 150, T('disabled') === 'Disabled' ? 'SHIELD' : 'سپر!', '#4ac3ff');
        } else { /* shockwave */
          BATTLE.shock = { x: this.x, t: 0.9 };
          AudioSys.sfx('boom');
        }
      }
      /* boss beam resolve */
      if (BATTLE.bossWarn) {
        BATTLE.bossWarn.t -= dt;
        if (BATTLE.bossWarn.t <= 0) {
          const wx = FIELD_X0 + BATTLE.bossWarn.col * CELL_W + CELL_W / 2;
          const wy = FIELD_Y0 + BATTLE.bossWarn.lane * CELL_H + CELL_H / 2;
          burst(wx, wy, '#ff5e5e', 20, 160, 0.6, 4);
          for (const b of BATTLE.bots) {
            if (!b.dead && Math.abs(b.x - wx) < CELL_W && Math.abs(b.y - wy) < CELL_H) b.damage(70);
          }
          AudioSys.sfx('laser');
          BATTLE.bossWarn = null;
        }
      }
      if (BATTLE.shock) {
        BATTLE.shock.t -= dt;
        if (BATTLE.shock.t <= 0) {
          for (const b of BATTLE.bots) {
            if (!b.dead && Math.abs(b.x - this.x) < CELL_W * 2.4 && Math.abs(b.y - this.y) < CELL_H * 1.6) b.damage(40);
          }
          BATTLE.shock = null;
        }
      }
    }
    /* ranged behavior */
    if (D.ranged || D.beam) {
      const range = D.ranged || D.beam;
      const targetBot = this.findBot();
      if (targetBot && (this.x - targetBot.x) < range && this.x > HOME_X + CELL_W) {
        /* stop and attack */
        if (D.beam) {
          if (this.chargeT > 0) {
            this.chargeT -= dt;
            if (this.chargeT <= 0) {
              targetBot.damage(D.dmg * (1 + this.atkBuff));
              BATTLE.beams.push({ x1: this.x - 12, y1: this.y - 54, x2: targetBot.x, y2: targetBot.y - 40, life: 0.22, col: '#ff5e5e' });
              AudioSys.sfx('laser');
              this.atkCool = D.atkInt;
            }
          } else if (this.atkCool <= 0) { this.chargeT = D.charge; this.beamTarget = targetBot; }
        } else {
          this.atkCool -= dt;
          if (this.atkCool <= 0) {
            this.atkCool = D.atkInt;
            BATTLE.shots.push({ kind: 'needle', x: this.x - 34, y: this.y - 40, vx: -520, dmg: D.dmg * (1 + this.atkBuff), lane: this.lane, life: 2 });
            AudioSys.sfx('shoot');
          }
        }
      } else { this.x -= spd * dt; if (D.beam) this.chargeT = 0; }
    } else {
      this.x -= spd * dt;
    }
    /* healer */
    if (D.healer) {
      this.healTick = (this.healTick || 0) + dt;
      if (this.healTick >= 1) {
        this.healTick = 0;
        for (const e of BATTLE.enemies) {
          if (e === this || e.dead) continue;
          if (Math.abs(e.x - this.x) < CELL_W * 1.2 && Math.abs(e.y - this.y) < CELL_H * 1.2 && e.hp < e.maxHp) {
            e.hp = Math.min(e.maxHp, e.hp + D.healer);
            this.healT = 0.5;
            floatText(e.x, e.y - 80, '+', '#6ee6a0', 18);
          }
        }
      }
      if (this.healT > 0) this.healT -= dt;
    }
    /* reaching home */
    if (this.x < HOME_X + 30) {
      this.arrived = true;
      this.eatT += dt;
      const dmgRate = D.boss ? 40 : this.type === 'crusher' ? 25 : 12;
      if (this.eatT >= 0.8) {
        this.eatT = 0;
        BATTLE.homeHp -= dmgRate * (1 + this.atkBuff);
        AudioSys.sfx('homehit');
        BATTLE.homeShake = 0.5;
        burst(HOME_X, this.y - 40, '#ff5e5e', 8, 100, 0.5, 3);
        if (BATTLE.homeHp <= 0) { BATTLE.homeHp = 0; failBattle(); }
      }
    }
  }
  findBot() {
    let best = null, bd = 1e9;
    for (const b of BATTLE.bots) {
      if (b.dead || b.lane !== this.lane) continue;
      const d = this.x - b.x;
      if (d >= 0 && d < bd) { bd = d; best = b; }
    }
    return best;
  }
  draw(c, t) {
    c.save(); c.translate(this.x, this.y);
    if (this.isCamoHidden()) c.globalAlpha = 0.32;
    const bob = Math.sin(t * 4 + this.x * 0.05) * 1.2;
    c.translate(0, bob);
    ENEMY_ART[this.type](c, t, this);
    if (this.flash > 0) {
      c.globalAlpha = clamp(this.flash * 4, 0, 0.5);
      c.fillStyle = '#ffffff';
      c.beginPath(); c.roundRect(-34, -70, 68, 66, 10); c.fill();
      c.globalAlpha = 1;
    }
    if (this.disabledT > 0) {
      c.fillStyle = '#50f078'; c.font = 'bold 15px Vazirmatn'; c.textAlign = 'center';
      c.fillText('⚡', 0, -80);
    }
    /* hp bar */
    const total = this.maxHp + this.maxShield;
    const cur = this.hp + this.shield;
    if (cur < total) {
      const w = 46, r = clamp(cur / total, 0, 1);
      c.fillStyle = 'rgba(0,0,0,0.5)'; c.beginPath(); c.roundRect(-w / 2, -92, w, 7, 3); c.fill();
      c.fillStyle = '#ff6b6b';
      c.beginPath(); c.roundRect(-w / 2 + 1, -91, (w - 2) * r, 5, 2); c.fill();
    }
    c.restore();
  }
}

/* ---------- Emergency lane device ---------- */
class EmergencyUnit {
  constructor(lane) { this.lane = lane; this.x = HOME_X - 20; this.y = FIELD_Y0 + lane * CELL_H + CELL_H - 26; this.dead = false; this.hitSet = new Set(); }
  update(dt) {
    this.x += 380 * dt;
    for (const e of BATTLE.enemies) {
      if (e.dead || this.hitSet.has(e)) continue;
      if (Math.abs(e.y - this.y) < CELL_H * 0.7 && Math.abs(e.x - this.x) < 60) {
        this.hitSet.add(e);
        e.damage(240);
        burst(e.x, e.y - 40, '#ffcf5e', 10, 120, 0.5, 3);
      }
    }
    if (this.x > DW + 40) this.dead = true;
  }
  draw(c, t) {
    c.save(); c.translate(this.x, this.y);
    wheelDraw(c, -12, -10, 10, this.x * 0.2, { rim: '#ff5e5e' });
    wheelDraw(c, 10, -10, 10, this.x * 0.2, { rim: '#ff5e5e' });
    c.fillStyle = '#e04b4b'; c.beginPath(); c.roundRect(-16, -40, 32, 28, 6); c.fill();
    c.fillStyle = '#ffd66b'; c.beginPath(); c.arc(0, -46, 6, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#fff'; c.font = 'bold 14px Vazirmatn'; c.textAlign = 'center';
    c.fillText('!', 0, -34);
    c.restore();
    /* trail */
    if (rnd() < 0.5) addParticle({ x: this.x - 14, y: this.y - 10, vx: rndR(-30, -10), vy: rndR(-20, 0), g: 0, life: 0.3, maxLife: 0.3, col: '#ffcf5e', size: 3, kind: 'dot' });
  }
}

/* ---------- Battle state ---------- */
function startBattle(stageN) {
  const st = STAGES[stageN - 1];
  const bots = [], enemies = [], shots = [], beams = [];
  BATTLE = {
    stageN, st, theme: st.theme,
    bots, enemies, shots, beams, emerg: [],
    spark: 150, homeHp: 100, maxHomeHp: 100,
    wave: 0, waveTotal: st.waves.length, waveT: st.waves[0].t, waveActive: false,
    spawnQueue: [], kills: 0, killsThisWave: 0,
    selected: null, cardCool: {},
    time: 0, paused: false, over: false, won: false,
    tutorialStep: stageN === 1 ? 0 : -1, tutorialT: 0,
    bossWarn: null, shock: null, bossDead: false,
    homeShake: 0, pendingUnlock: null, briefing: null,
    laneUsed: [false, false, false, false, false],
    toast: null, toastT: 0,
  };
  /* pre-briefing for new enemy */
  const newE = stageNewEnemy(stageN);
  if (newE && !SAVE.briefingsSeen[newE]) {
    BATTLE.briefing = newE;
  }
  Screen.set('battle');
  AudioSys.startMusic(st.boss ? 'boss' : 'battle');
}
function battleSpawnEnemy(type, lane) {
  const opts = {};
  if (BATTLE.st.camo && (type === 'jet' || type === 'roller') && rnd() < 0.3) opts.camo = true;
  BATTLE.enemies.push(new Enemy(type, lane, opts));
}
function pickLane(lanes) {
  if (lanes === 'any') return rndI(0, 4);
  return lanes[rndI(0, lanes.length - 1)];
}
function updateBattle(dt) {
  const B = BATTLE;
  if (B.paused || B.over) return;
  B.time += dt;
  if (B.homeShake > 0) B.homeShake -= dt;
  if (B.toastT > 0) B.toastT -= dt;
  /* briefing pauses action */
  if (B.briefing) return;
  /* tutorial */
  if (B.tutorialStep >= 0) {
    B.tutorialT += dt;
    if (B.tutorialStep === 0 && B.bots.length > 0) { B.tutorialStep = 1; B.tutorialT = 0; }
    if (B.tutorialStep === 1 && B.bots.some(b => b.id === 'dynamo')) { B.tutorialStep = 2; B.tutorialT = 0; }
    if (B.tutorialStep === 2 && B.enemies.length > 0) { B.tutorialStep = 3; B.tutorialT = 0; }
  }
  /* wave timing */
  if (!B.waveActive) {
    B.waveT -= dt;
    if (B.waveT <= 0) {
      B.waveActive = true;
      B.killsThisWave = 0;
      const w = B.st.waves[B.wave];
      for (const s of w.spawns) {
        for (let i = 0; i < s.n; i++) {
          B.spawnQueue.push({ type: s.e, lane: pickLane(s.lanes), at: B.time + i * s.gap, boss: s.e === 'boss' });
        }
      }
      if (B.wave === B.waveTotal - 1) { floatText(DW / 2, 300, T('wave') + ' ' + numStr(B.waveTotal) + '!', '#ff6b6b', 40); AudioSys.sfx('emergency'); }
    }
  } else {
    /* spawn from queue */
    for (let i = B.spawnQueue.length - 1; i >= 0; i--) {
      const s = B.spawnQueue[i];
      if (B.time >= s.at) { battleSpawnEnemy(s.type, s.lane); if (s.boss) { B.bossSpawned = true; AudioSys.sfx('emergency'); } B.spawnQueue.splice(i, 1); }
    }
    const wDone = B.spawnQueue.length === 0 && B.enemies.every(e => e.dead);
    if (wDone) {
      B.wave++;
      B.waveActive = false;
      B.spark += 25;
      floatText(DW / 2, 260, '+25 ' + T('spark'), '#ffd66b', 30);
      if (B.wave >= B.waveTotal) { winBattle(); return; }
      B.waveT = 8;
    }
  }
  /* update entities */
  for (const b of B.bots) b.update(dt);
  for (const e of B.enemies) e.update(dt);
  for (const u of B.emerg) u.update(dt);
  B.emerg = B.emerg.filter(u => !u.dead);
  /* projectiles */
  for (let i = B.shots.length - 1; i >= 0; i--) {
    const s = B.shots[i];
    if (s.kind === 'bomb') {
      s.t += dt;
      const k = clamp(s.t / s.dur, 0, 1);
      s.x = lerp(s.sx, s.tx, k);
      s.y = lerp(s.sy, s.ty, k) - Math.sin(k * Math.PI) * 130;
      if (k >= 1) {
        /* explode */
        burst(s.x, s.y, '#ffb35e', 18, 150, 0.5, 4);
        smokePuff(s.x, s.y, 4);
        AudioSys.sfx('boom');
        for (const e of B.enemies) {
          if (e.dead) continue;
          const d = dist(s.x, s.y, e.x, e.y - 30);
          if (d < CELL_W * 0.62) e.damage(s.dmg);
          else if (d < CELL_W * 1.3) e.damage(s.aoe);
        }
        B.shots.splice(i, 1);
      }
      continue;
    }
    s.x += s.vx * dt; s.life -= dt;
    if (s.kind === 'pellet' || s.kind === 'boltP') {
      let hitAny = false;
      for (const e of B.enemies) {
        if (e.dead) continue;
        if (Math.abs(e.lane - s.lane) > 0.01) continue;
        if (s.kind === 'boltP' && s.hit.includes(e)) continue;
        if (e.isCamoHidden()) continue;
        if (Math.abs(e.x - s.x) < 30 && s.y > e.y - 90 && s.y < e.y) {
          e.damage(s.dmg);
          burst(s.x, s.y, '#cfd6df', 5, 70, 0.3, 2);
          AudioSys.sfx('hit');
          if (s.kind === 'pellet') { B.shots.splice(i, 1); hitAny = true; break; }
          s.hit.push(e);
          if (s.hit.length >= s.pierce) { B.shots.splice(i, 1); hitAny = true; break; }
        }
      }
      if (hitAny) continue;
    }
    if (s.kind === 'needle') {
      for (const b of B.bots) {
        if (b.dead || b.lane !== s.lane) continue;
        if (Math.abs(b.x - s.x) < 30 && s.y > b.y - 80 && s.y < b.y) {
          b.damage(s.dmg);
          burst(s.x, s.y, '#9fc4e8', 5, 70, 0.3, 2);
          AudioSys.sfx('hit');
          B.shots.splice(i, 1);
          break;
        }
      }
    }
    if (s.life <= 0 || s.x < 0 || s.x > DW + 40) {
      const idx = B.shots.indexOf(s);
      if (idx >= 0) B.shots.splice(idx, 1);
    }
  }
  for (let i = B.beams.length - 1; i >= 0; i--) { B.beams[i].life -= dt; if (B.beams[i].life <= 0) B.beams.splice(i, 1); }
  /* cleanup */
  B.bots = B.bots.filter(b => !b.dead);
  B.enemies = B.enemies.filter(e => !e.dead);
  /* card cooldowns */
  for (const k in B.cardCool) if (B.cardCool[k] > 0) B.cardCool[k] -= dt;
  updateParticles(dt);
  for (let i = floaters.length - 1; i >= 0; i--) { floaters[i].life -= dt; floaters[i].y -= 30 * dt; if (floaters[i].life <= 0) floaters.splice(i, 1); }
}
function winBattle() {
  const B = BATTLE;
  B.over = true; B.won = true;
  AudioSys.sfx('win');
  AudioSys.startMusic('menu');
  const hpPct = B.homeHp / B.maxHomeHp;
  const stars = hpPct >= 0.75 ? 3 : hpPct >= 0.4 ? 2 : 1;
  const base = 40 + B.stageN * 10;
  const hpBonus = Math.round(hpPct * 50);
  const killBonus = B.kills * 2;
  B.result = { stars, base, hpBonus, killBonus, total: base + hpBonus + killBonus, hpPct };
  const prevStars = SAVE.stageStars[B.stageN] || 0;
  if (stars > prevStars) SAVE.stageStars[B.stageN] = stars;
  const score = B.kills * 100 + Math.round(B.homeHp) * 10;
  if (!SAVE.stageBest[B.stageN] || score > SAVE.stageBest[B.stageN]) SAVE.stageBest[B.stageN] = score;
  SAVE.bolts += B.result.total;
  if (B.stageN >= SAVE.unlockedStage && B.stageN < 20) SAVE.unlockedStage = B.stageN + 1;
  if (B.stageN === 20) {
    SAVE.seasonComplete = true;
    SAVE.robotUnlocked.hacker = true;
  }
  persist();
  Screen.showOverlay('results');
}
function failBattle() {
  const B = BATTLE;
  if (B.over) return;
  B.over = true; B.won = false;
  AudioSys.sfx('lose');
  AudioSys.startMusic('menu');
  Screen.showOverlay('defeat');
}
function deployRobot(cellCol, cellLane) {
  const B = BATTLE;
  if (!B.selected) return false;
  const R = ROBOT_BY_ID[B.selected];
  if (cellCol < 0 || cellCol >= COLS || cellLane < 0 || cellLane >= LANES) return false;
  if (B.st.blocked && B.st.blocked.some(([c, l]) => c === cellCol && l === cellLane)) { showToast(T('blocked')); return false; }
  if (B.bots.some(b => !b.dead && b.col === cellCol && b.lane === cellLane)) { showToast(T('blocked')); return false; }
  const lvl = SAVE.robotLevels[B.selected] || 1;
  if (B.spark < R.cost) { showToast(T('noSpark')); AudioSys.sfx('hit'); return false; }
  B.spark -= R.cost;
  B.cardCool[B.selected] = R.recharge;
  B.bots.push(new PlayerBot(B.selected, cellCol, cellLane, lvl));
  burst(FIELD_X0 + cellCol * CELL_W + CELL_W / 2, FIELD_Y0 + cellLane * CELL_H + CELL_H - 30, '#ffcf5e', 12, 110, 0.5, 3);
  AudioSys.sfx('deploy');
  B.selected = null;
  return true;
}
function showToast(msg) { if (BATTLE) { BATTLE.toast = msg; BATTLE.toastT = 1.6; } }
function laneCenterY(l) { return FIELD_Y0 + l * CELL_H + CELL_H / 2; }
