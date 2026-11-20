'use strict';
/* ===================== NIVEL 2 · MAITO · Coliseo Mexa ===================== */
// RETO 2 · Riffs de Maito: notas a destiempo (corcheas, síncopas, ráfagas); cada frase cierra con una ★.
// Si aciertas la ★, Maito hace headbang y la gorra vuela; cae sobre su cabeza en el beat 4 del compás siguiente: tócala en ese momento.
const GORRAS = new Image(); GORRAS.src = 'gorras_coleccion.png';
function sceneHeadbang(){
  const BANK = {   // compases de 16 semicorcheas: x = nota, . = silencio
    easy:['x...x...x...x...','x...x.x.x...x...','x.x.x...x...x...','x...x...x.x.x...'],
    mid: ['x..x..x.x...x...','x...x..x.x..x...','x.x...x.x..x.x..','..x.x..xx...x...','x..x..x...x.x...'],
    hard:['x.x.x..x..x.x...','x..x.x..x.x.x...','x.x..x.x..x.x...','xx..x...xx..x...']   // ráfagas suavizadas: máximo 2 semicorcheas seguidas
  };
  const END = { easy:['x...x...x...*...'], mid:['x.x.x.x.x...*...','x..x..x.x...*...'], hard:['x.x.x..x.x..*...','xx..x.x.x...*...'] };
  const TGT = 50, SPEED = 112, WIN = .14, PERF = .055;
  const S = { hype:10, notes:[], cycle:0, nextBar:0, done:false, fx:[], rate:'', rateT:0, rateC:C.ok, combo:0, cap:null, firstCap:true, bangT:0, count:0 };
  const d16 = () => spb(), stepT = n => music.next + (n - music.step) * d16();
  const nextCap = () => { let c = CAP_COLORS[S.capIdx++ % CAP_COLORS.length]; if (c === '#ffd34d' && stats.capsLost) c = CAP_COLORS[S.capIdx++ % CAP_COLORS.length]; return c; };
  S.capIdx = 1; if (window.DEV_HOOK) window.__hb = { S, stepT };  // solo para pruebas automáticas
  const tier = () => S.cycle === 0 ? 'easy' : S.cycle < 3 ? 'mid' : 'hard';
  const pick = a => a[Math.random()*a.length|0];
  function schedule(){   // un ciclo = compás de riff + compás que cierra en ★ + compás de la gorra
    const t = tier(), b0 = S.nextBar;
    [pick(BANK[t]), pick(END[t])].forEach((bar, bi) => [...bar].forEach((ch, i) => { if (ch !== '.') S.notes.push({ step:b0 + bi*16 + i, kind: ch === '*' ? 'star' : 'note' }); }));
    S.notes.push({ step:b0 + 32 + 12, kind:'cap', ghost:true });   // aterrizaje de la gorra: beat 4 del tercer compás
    S.cycle++;
  }
  // la siguiente frase solo se programa cuando la gorra se resuelve (atrapada, perdida o sin lanzar), unos 2 s después
  function nextCycle(){ if (S.done) return; S.nextBar = Math.ceil((music.step + 16) / 4) * 4; schedule(); }
  function launchCap(n){ const land = S.notes.find(m => m.kind === 'cap' && m.ghost && m.step === n.step + 16);
    if (!land || capColor === NOCAP){ if (land) land.done = true; nextCycle(); return; } land.ghost = false;
    S.cap = { t0:stepT(n.step), t1:stepT(land.step), col:capColor, dir: Math.random() < .5 ? -1 : 1, note:land, falling:false, y:0 }; capColor = NOCAP; SFX.whoosh(); }
  function judge(n, d){
    n.done = true; const perf = Math.abs(d) < PERF; S.combo++; stats.notes++; stats.combo++; stats.best = Math.max(stats.best, stats.combo);
    S.fx.push({ t:0, c: n.kind === 'star' ? C.gold : n.kind === 'cap' ? C.gold : C.magenta, big: n.kind !== 'note' });
    if (n.kind === 'note'){ S.hype += perf ? 1.5 : 1.1; pchord(0,.12,null,true,.05); S.bangT = .18; burst(TGT, 322, perf ? 6 : 3, [C.magenta, C.cyan, '#fff']); }
    else if (n.kind === 'star'){ S.hype += 3.5; SFX.riffStab(); S.bangT = .35; burst(120, 150, 10); launchCap(n); }
    else { // gorra atrapada en el beat
      const c = S.cap; S.cap = null; S.newCap = { col:c.col, t:0 };
      nextCycle();
      stats.caps.add(c.col); capColor = nextCap(); stats.caps.add(capColor); S.hype += 6; SFX.ding(); burst(120, 140, 14);
      addBubble(c.col === '#ffd34d' ? '¡GORRA DORADA!' : '¡GORRA COLECCIONADA!', 150, 110, C.ok); if (c.col === '#ffd34d') showCameo(['p_maito.jpg','MAITO','¡Esta va para el museo, Pepino!'], 1.6);
      fans = Math.min(1, fans + .04); }
    S.rate = n.kind === 'cap' ? '¡ATRAPADA!' : perf ? '¡PERFECTO!' : '¡BIEN!'; S.rateC = perf || n.kind === 'cap' ? C.ok : C.cyan; S.rateT = .5;
    if (S.combo % 8 === 0) addBubble('¡COMBO x' + S.combo + '!', 120, 100, C.gold, 9);
    fans = Math.min(1, fans + .006);
  }
  function miss(n){ n.done = true; S.combo = 0; stats.combo = 0;
    if (n.kind === 'cap'){ if (S.cap){ S.cap.falling = true; stats.capsLost = true; showCameo(['p_maito.jpg','MAITO','¡Noooooo, Mónicaaaa!'], 1.2); addBubble('SE PERDIÓ PARA LA COLECCIÓN', 120, 200, C.neon, 6); } nextCycle(); }
    else if (n.kind === 'star'){ const land = S.notes.find(m => m.kind === 'cap' && m.ghost && m.step === n.step + 16); if (land) land.done = true; S.hype -= 4; S.rate = '¡FALLASTE!'; S.rateC = C.muted; S.rateT = .45; nextCycle(); }
    else { S.hype -= n.kind === 'star' ? 4 : 2; S.rate = '¡FALLASTE!'; S.rateC = C.muted; S.rateT = .45; } }
  return { label:'RETO 2/3',
    start(){ S.nextBar = Math.ceil((music.step + 4) / 16) * 16 + 16; S.countBar = S.nextBar - 16; schedule(); },
    update(dt){
      if (S.done) return;
      if (S.nextBar === 0) this.start();
      const tn = now();
      if (S.bangT > 0) S.bangT -= dt; if (S.rateT > 0) S.rateT -= dt; S.fx.forEach(f => f.t += dt); S.fx = S.fx.filter(f => f.t < .4);
      S.notes.forEach(n => { if (!n.done && !n.ghost && stepT(n.step) < tn - WIN) miss(n); if (n.ghost && !n.done && stepT(n.step) < tn - WIN){ n.done = true; nextCycle(); } });
      S.notes = S.notes.filter(n => !n.done || stepT(n.step) > tn - 1);
      if (S.cap && S.cap.falling){ S.cap.y += 260*dt; if (S.cap.y > 140){ S.cap = null; capColor = nextCap(); } }
      S.hype = Math.max(0, Math.min(100, S.hype));
      // si la euforia se apaga por completo, Maito pierde una vida y el público le da otra oportunidad
      if (S.hype <= 0){ S.combo = 0; S.rate = ''; addBubble('¡SE APAGÓ LA EUFORIA!', 120, 120, C.neon, 8);
        loseLife(['p_maito.jpg','MAITO','¡Noooooo, Mónicaaaa!']);
        if (lives <= 0){ S.done = true; S.notes = []; return; } S.hype = 50; }   // vuelve a la mitad para no perder dos vidas seguidas
      if (S.hype >= 100){ S.done = true; S.notes = []; if (S.cap){ stats.caps.add(S.cap.col); S.cap = null; } if (capColor === NOCAP) capColor = nextCap(); win('¡COLISEO ENCENDIDO!'); setTimeout(stepDone, 1000); }
    },
    draw(){
      const tn = now(), beatPh = ((music.step % 4) + (tn - music.next)/d16() + 4) % 4, pulse = Math.exp(-beatPh*d16()*12);
      drawStage({ party:S.hype > 60 });
      CAST.maito(120, { anim: mood < 0 ? 'falla' : capColor === NOCAP ? 'sin_gorra' : 'tocando', capCol: capColor });
      // gorra en el aire: sube y cae sobre la cabeza en el beat
      const c = S.cap;
      if (c){ let x, y, u = Math.min(1.05, (tn - c.t0)/(c.t1 - c.t0));
        if (c.falling){ x = 120 + c.dir*34; y = 140 + c.y; }
        else { x = 120 + c.dir*34*Math.sin(Math.PI*u); y = 140 - 120*4*u*(1-u); }
        if (!c.falling){ const rr = 7 + 34*Math.max(0, 1-u); ctx.globalAlpha = .45 + .45*Math.sin(T*18); ctx.strokeStyle = u > .82 ? C.ok : C.gold; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(120, 146, rr, rr*.55, 0, 0, Math.PI*2); ctx.stroke(); ctx.globalAlpha = 1;
          if (u > .82) txt('¡AHORA!', 120, 112, C.ok, 'center', 9, '#0a3a1a'); }
        ctx.globalAlpha = .35 + .2*Math.sin(T*16); ctx.fillStyle = '#fff3c4'; ctx.beginPath(); ctx.arc(x, y, 15, 0, Math.PI*2); ctx.fill(); ctx.globalAlpha = 1;   // halo para que se vea cualquier color de gorra
        ctx.save(); ctx.translate(x, y); ctx.rotate(u*Math.PI*4*c.dir); spr(SP.CAP, -12, -6, capPal(c.col), 2); ctx.restore();
        if (S.firstCap && !c.falling){ txt('¡ATRAPA LA GORRA!', 120, 66, C.gold, 'center', 11, C.neon); txt('TOCA CUANDO CAIGA EN SU CABEZA', 120, 84, C.ink, 'center', 6); }
      } else if (S.firstCap && stats.caps.size > 1) S.firstCap = false;
      drawCrowd(); drawHUD(this.label);
      // medidor de euforia tipo VU (LEDs)
      r(0,30,W,22,'#0b0718dd'); vtxt('Euforia', 8, 36, C.ink, 'left', '#000');
      for (let i=0;i<24;i++){ const on = S.hype/100*24 > i, col = i < 14 ? C.ok : i < 20 ? C.gold : C.neon; r(52 + i*7.4, 34, 6, 12, on ? col : '#231a3d'); if (on){ ctx.globalAlpha = .25; r(51 + i*7.4, 33, 8, 14, col); ctx.globalAlpha = 1; } }
      // panel del riff
      r(0,266,W,H-266,'#0d0820'); r(0,266,W,2,'#3b2f66');
      txt('RIFFS DE MAITO', 120, 271, C.magenta, 'center', 7, '#3a0a30'); vtxt(S.cycle <= 1 ? 'Frase tranquila' : S.cycle <= 3 ? 'Síncopas' : 'Ráfagas', 120, 282, '#b9aee0', 'center', '#000');
      const ty = 322;
      // pista
      r(14, ty-20, 220, 40, '#120a26'); r(14, ty-1, 220, 2, '#2a1f4d'); r(14, ty+1, 220, 1, '#1a1236'); ctx.globalAlpha = .35 + pulse*.4; r(14, ty-21, 220, 1, C.magenta); r(14, ty+20, 220, 1, C.magenta); ctx.globalAlpha = 1;
      for (let n = Math.floor(music.step/4)*4 - 4; n < music.step + 40; n += 2){ const x = TGT + (stepT(n) - tn)*SPEED; if (x < 14 || x > 234) continue;
        const bar = n % 16 === 0, beat = n % 4 === 0; r(x, ty - (bar ? 18 : beat ? 12 : 4), 1, bar ? 36 : beat ? 24 : 8, bar ? '#6a4fbf' : beat ? '#3b2f66' : '#241a44'); }
      // conteo inicial
      if (tn < stepT(S.countBar + 16) && tn >= stepT(S.countBar)){ const k = Math.floor((tn - stepT(S.countBar))/(d16()*4)); txt(String(k+1), 120, 236, C.gold, 'center', 22, '#5a3a00'); }
      // notas
      S.notes.forEach(n => { if (n.done) return; const x = TGT + (stepT(n.step) - tn)*SPEED; if (x < 4 || x > 240) return;
        if (n.kind === 'note'){ ctx.globalAlpha = .12; r(x, ty-3, 16, 6, C.magenta); ctx.globalAlpha = .25; ctx.fillStyle = C.magenta; ctx.beginPath(); ctx.arc(x, ty, 11, 0, Math.PI*2); ctx.fill(); ctx.globalAlpha = 1;
          ctx.fillStyle = C.magenta; ctx.beginPath(); ctx.arc(x, ty, 7, 0, Math.PI*2); ctx.fill(); r(x-3, ty-4, 3, 2, '#ffffffcc'); }
        else if (n.kind === 'star'){ ctx.save(); ctx.translate(x, ty); ctx.rotate(T*2); ctx.fillStyle = C.gold; ctx.beginPath(); for (let i=0;i<10;i++){ const a = i*Math.PI/5, rr = i%2 ? 5 : 12; ctx.lineTo(Math.cos(a)*rr, Math.sin(a)*rr); } ctx.fill(); ctx.restore(); }
        else { ctx.globalAlpha = n.ghost ? .22 : 1; ctx.strokeStyle = C.gold; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, ty, 13, 0, Math.PI*2); ctx.stroke(); spr(SP.CAP, x-12, ty-6, capPal(n.ghost ? '#6a5a8a' : (S.cap ? S.cap.col : C.gold)), 2); ctx.globalAlpha = 1; } });
      // objetivo: parlante que late con el pulso
      const sc = 1 + pulse*.18;
      ctx.fillStyle = '#05030c'; ctx.beginPath(); ctx.arc(TGT, ty, 17*sc, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = C.cyan; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(TGT, ty, 16*sc, 0, Math.PI*2); ctx.stroke();
      ctx.strokeStyle = '#2a6f8f'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(TGT, ty, 10*sc, 0, Math.PI*2); ctx.stroke();
      ctx.fillStyle = '#1b2a3a'; ctx.beginPath(); ctx.arc(TGT, ty, 5*sc, 0, Math.PI*2); ctx.fill();
      S.fx.forEach(f => { const k = f.t/.4; ctx.globalAlpha = 1-k; ctx.strokeStyle = f.c; ctx.lineWidth = f.big ? 3 : 2; ctx.beginPath(); ctx.arc(TGT, ty, 16 + k*(f.big ? 30 : 18), 0, Math.PI*2); ctx.stroke(); ctx.globalAlpha = 1; });
      if (S.rateT > 0) vtxt(S.rate, 14, 292, S.rateC, 'left', '#000');   // fila propia, debajo del nombre de la frase
      if (S.combo >= 4) txt('x' + S.combo, 226, 292, C.gold, 'right', 8, '#5a3a00');
      vtxt('Toca cuando la nota llegue al parlante', 120, 350, C.cyan, 'center', '#000');
      vtxt('Estrella: headbang y la gorra vuela', 120, 363, C.gold, 'center', '#000');
      // colección de gorras
      if (!S.newCap) vtxt('Colección · ' + [...stats.caps].filter(c => CAP_COLORS.includes(c)).length + '/7', 120, 378, '#b9aee0', 'center', '#000');
      if (S.newCap){ S.newCap.t += 1/60; if (S.newCap.t > 2.2) S.newCap = null; }
      if (S.newCap){ const i = CAP_COLORS.indexOf(S.newCap.col), x = 120 - 3*30 + i*30, k = Math.min(1, S.newCap.t/.3); ctx.globalAlpha = .5*(1 - S.newCap.t/2.2); ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(x, 399, 16 - 4*k + Math.sin(T*10)*2, 0, Math.PI*2); ctx.fill(); ctx.globalAlpha = 1; txt('¡NUEVA!', x, 380, C.gold, 'center', 5, '#000'); }
      CAP_COLORS.forEach((col, i) => { const x = 120 - 3*30 + i*30, got = stats.caps.has(col);   // íconos de la colección (gorras_coleccion.png, mismo orden que CAP_COLORS)
        if (GORRAS.complete && GORRAS.naturalWidth){ ctx.globalAlpha = got ? 1 : .2; ctx.drawImage(GORRAS, i*24, 0, 24, 19, x-12, 390, 24, 19); ctx.globalAlpha = 1; }
        if (got){ ctx.globalAlpha = .25 + .15*Math.sin(T*3 + i); r(x-10, 410, 20, 1, col === '#1b1b22' ? '#8a8aa0' : col); ctx.globalAlpha = 1; } });
    },
    tap(){
      if (S.done) return;
      const tn = now(); let best = null, bd = 9;
      S.notes.forEach(n => { if (n.done || n.ghost) return; const d = tn - stepT(n.step); if (Math.abs(d) < Math.abs(bd)){ bd = d; best = n; } });
      if (best && Math.abs(bd) <= WIN) judge(best, bd);
      else { S.hype = Math.max(0, S.hype - 1.5); S.combo = 0; S.rate = 'FUERA DE TIEMPO'; S.rateC = C.muted; S.rateT = .4; pchord(0,.05,null,true,.02); }
    }
  };
}

const PEDALES = new Image(); PEDALES.src = 'pedales.png';
function scenePedals(){
  const NAMES = ['OVERDRIVE','PHASER','FLANGER','DELAY'], COLS = ['#ffd34d','#ff7a1f','#b46bff','#4f8dff'];   // pedales de Sergio (pedales.png)
  const S = { round:0, lens:[3,4,5], seq:[], step:0, phase:'show', t:.8, lit:-1, litT:0, done:false };
  const newSeq = () => { S.seq = Array.from({length:S.lens[S.round]}, () => Math.random()*4|0); };
  newSeq();
  return { label:'RETO 1/3',
    update(dt){
      if (S.done) return;
      if (S.litT > 0){ S.litT -= dt; if (S.litT <= 0) S.lit = -1; }
      if (S.phase === 'show'){ S.t -= dt; if (S.t <= 0){ if (S.step < S.seq.length){ S.lit = S.seq[S.step]; S.litT = .4; SFX.pedal(S.lit); S.step++; S.t = .62; } else { S.phase = 'input'; S.step = 0; } } }
      if (S.phase === 'wait'){ S.t -= dt; if (S.t <= 0){ S.phase = 'show'; S.step = 0; S.t = .5; } }
    },
    draw(){
      drawStage(); CAST.maito(120, { anim: mood < 0 ? 'falla' : mood > 0 ? 'celebra' : 'pedales' }); drawCrowd(); drawHUD(this.label);
      panel(); txt('PEDALERA · RONDA ' + Math.min(3, S.round+1) + '/3', 120, 280, C.muted, 'center', 7);
      vtxt(S.phase === 'input' ? '¡Tu turno! ' + S.step + '/' + S.seq.length : 'Mira la secuencia…', 120, 292, S.phase === 'input' ? C.ok : C.gold, 'center', '#000');
      // pedalera: tabla con velcro, cables entre pedales y los 4 pedales dibujados
      r(10, 300, 220, 98, '#120d22'); r(10, 300, 220, 2, '#2c2350'); r(10, 396, 220, 2, '#05030c');
      for (let y = 306; y < 392; y += 6) r(14, y, 212, 1, '#18122d');
      for (let i=0;i<3;i++){ const x0 = 40 + i*54 + 20, x1 = 40 + (i+1)*54 - 20, cy = 334; ctx.strokeStyle = '#2b2b33'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0, cy); ctx.quadraticCurveTo((x0+x1)/2, cy + 12, x1, cy); ctx.stroke(); }
      for (let i=0;i<4;i++){ const cx = 40 + i*54, on = S.lit === i, w = 42, h = 54, px = cx - w/2, py = 306 + (on ? 2 : 0);
        if (on){ ctx.globalAlpha = .35; ctx.fillStyle = COLS[i]; ctx.beginPath(); ctx.ellipse(cx, 334, 30, 36, 0, 0, Math.PI*2); ctx.fill(); ctx.globalAlpha = 1; }
        ctx.globalAlpha = .45; r(px + 3, 306 + h - 2, w - 4, 4, '#000'); ctx.globalAlpha = 1;   // sombra
        if (PEDALES.complete && PEDALES.naturalWidth){ ctx.globalAlpha = (S.lit >= 0 && !on) ? .6 : 1; ctx.drawImage(PEDALES, i*34, 0, 34, 43, px, py, w, h); ctx.globalAlpha = 1;
          if (on){ ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .3; ctx.drawImage(PEDALES, i*34, 0, 34, 43, px, py, w, h); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; } }
        if (on){ for (let k=0;k<2;k++){ const u = ((T*2 + k*.5) % 1); ctx.globalAlpha = 1 - u; ctx.strokeStyle = COLS[i]; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, 330, 26 + u*14, Math.PI*1.15, Math.PI*1.85); ctx.stroke(); } ctx.globalAlpha = 1; }
        vtxt(NAMES[i], cx, 367, on ? '#ffffff' : COLS[i], 'center', '#000');
        r(cx - 4, 380, 8, 4, on ? COLS[i] : '#2a2240'); if (on){ ctx.globalAlpha = .4; r(cx - 6, 378, 12, 8, COLS[i]); ctx.globalAlpha = 1; } }
    },
    tap(x, y){
      if (S.phase !== 'input' || S.done || y < 300) return;
      const i = Math.max(0, Math.min(3, Math.round((x - 40) / 54))); S.lit = i; S.litT = .2;
      if (S.seq[S.step] === i){ SFX.pedal(i); S.step++;
        if (S.step >= S.seq.length){ S.round++; win('¡RONDA ' + S.round + '!'); if (S.round >= 3){ S.done = true; setTimeout(stepDone, 1000); } else { newSeq(); S.phase = 'wait'; S.t = 1.2; } }
      } else {
        stats.perfectPedal = false;
        const f = [['MODO PATO', SFX.quack], ['MODO CORNETA', SFX.horn], ['MODO SIRENA', SFX.siren]][Math.random()*3|0];
        f[1](); addBubble('¡' + f[0] + '!', 120, 120, C.gold, 8); loseLife(['p_maito.jpg','MAITO','¡Noooooo, Mónicaaaa!']); S.phase = 'wait'; S.t = 1.8;
      }
    }
  };
}

// JEFE 2: El Enredo — empieza fácil y sube por rondas
// Enchufe que destella sobre El Enredo: halo, onda que se expande, chispas y un anillo que se vacía con el tiempo que queda
function drawPlug(px, py, left){
  const pul = (Math.sin(T*12) + 1) / 2, ring = (T*2.5) % 1;
  const g = ctx.createRadialGradient(px, py, 0, px, py, 20); g.addColorStop(0, 'rgba(255,211,77,.75)'); g.addColorStop(1, 'rgba(255,211,77,0)');
  ctx.globalAlpha = .55 + pul*.45; ctx.fillStyle = g; ctx.fillRect(px-20, py-20, 40, 40); ctx.globalAlpha = 1;
  ctx.globalAlpha = 1 - ring; ctx.strokeStyle = '#fff3b0'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(px, py, 8 + ring*12, 0, Math.PI*2); ctx.stroke(); ctx.globalAlpha = 1;
  ctx.strokeStyle = left > .35 ? C.gold : C.neon; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(px, py, 11, -Math.PI/2, -Math.PI/2 + Math.PI*2*Math.max(0, left)); ctx.stroke();
  // clavija: cuerpo negro, punta cromada y dos patas
  r(px-4, py-2, 8, 9, '#1a1a22'); r(px-3, py-1, 6, 2, '#4a4a56'); r(px-3, py-6, 2, 4, '#e8e8f2'); r(px+1, py-6, 2, 4, '#e8e8f2'); r(px-1, py+7, 2, 3, '#1a1a22');
  if (pul > .7){ r(px-9, py-9, 2, 2, '#fff'); r(px+8, py-7, 2, 2, '#fff3b0'); r(px+6, py+8, 1, 1, '#fff'); }
}

// Ítems de la pelea (termo de café y taco) en pixel art detallado, flotando con un halo que late
// dibujos de Sergio; el taco sale en una de 3 versiones al azar
const ITEM_IMG = { cafe:'item_cafe.png', taco1:'item_taco1.png', taco2:'item_taco2.png', taco3:'item_taco3.png' }; for (const k in ITEM_IMG){ const im = new Image(); im.src = ITEM_IMG[k]; ITEM_IMG[k] = im; }
function drawEnredoItem(it){
  const bob = Math.sin(T*6)*3, img = ITEM_IMG[it.k === 'taco' ? 'taco' + (it.v || 1) : it.k], x = it.x, y = it.y + bob, col = it.k === 'cafe' ? '#ffd34d' : '#3dff8a';
  const g = ctx.createRadialGradient(x, y, 2, x, y, 22); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.globalAlpha = .28 + Math.abs(Math.sin(T*5))*.22; ctx.fillStyle = g; ctx.fillRect(x-22, y-22, 44, 44); ctx.globalAlpha = 1;
  ctx.strokeStyle = col; ctx.globalAlpha = .5 + .5*Math.sin(T*8); ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x, y, 17, 0, Math.PI*2); ctx.stroke(); ctx.globalAlpha = 1;
  if (img && img.complete && img.naturalWidth){ ctx.imageSmoothingEnabled = false; ctx.drawImage(img, Math.round(x - img.naturalWidth/2), Math.round(y - img.naturalHeight/2)); }
  else ITEM[it.k](x, y);
  ctx.globalAlpha = 1;
  // vida restante: se desvanece al final
  if (it.life < .8 && (T*10|0)%2){ ctx.globalAlpha = .4; r(x-14, y-14, 28, 28, '#0b0718'); ctx.globalAlpha = 1; }
}

// Panel inferior de la pelea con El Enredo (opción C de Sergio): guante con pelota, fila de pelotas por acertar
// y tarjetas con los dibujos reales del café y el taco. Durante la llave muestra la barra para zafarse y la cuenta.
function drawBaseball(x, y, R, on){
  const glow = (gx,gy,rad,col,a) => { const g = ctx.createRadialGradient(gx,gy,0,gx,gy,rad); g.addColorStop(0,col); g.addColorStop(1,'rgba(0,0,0,0)'); ctx.globalAlpha = a; ctx.fillStyle = g; ctx.fillRect(gx-rad,gy-rad,rad*2,rad*2); ctx.globalAlpha = 1; };
  if (on) glow(x, y, R*2.2, '#fff3b0', .3);
  ctx.globalAlpha = on ? 1 : .22;
  ctx.fillStyle = '#20141a'; ctx.beginPath(); ctx.arc(x, y, R+1, 0, 7); ctx.fill();
  ctx.fillStyle = '#d8d0c4'; ctx.beginPath(); ctx.arc(x, y, R, 0, 7); ctx.fill();
  ctx.fillStyle = '#f4efe6'; ctx.beginPath(); ctx.arc(x - R*.15, y - R*.15, R*.8, 0, 7); ctx.fill();
  ctx.strokeStyle = '#d0202a'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x - R*1.15, y, R*.85, -.7, .7); ctx.stroke(); ctx.beginPath(); ctx.arc(x + R*1.15, y, R*.85, Math.PI-.7, Math.PI+.7); ctx.stroke();
  for (let k=-2;k<=2;k++){ r(Math.round(x - R*.42 + Math.abs(k)*.6), Math.round(y + k*R*.25), 2, 1, '#d0202a'); r(Math.round(x + R*.3 - Math.abs(k)*.6), Math.round(y + k*R*.25), 2, 1, '#d0202a'); }
  ctx.globalAlpha = 1;
}
function drawGlove(cx, cy){
  ctx.fillStyle = '#4a2208'; ctx.beginPath(); ctx.ellipse(cx, cy, 31, 33, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#8a4a1a'; ctx.beginPath(); ctx.ellipse(cx, cy, 29, 31, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#b8682a'; ctx.beginPath(); ctx.ellipse(cx + 2, cy + 2, 21, 23, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#d08038'; ctx.beginPath(); ctx.ellipse(cx - 4, cy - 6, 10, 8, -.4, 0, 7); ctx.fill();
  ctx.strokeStyle = '#5a2a0a'; ctx.lineWidth = 2; for (let i=0;i<4;i++){ ctx.beginPath(); ctx.moveTo(cx - 16 + i*10, cy - 28); ctx.lineTo(cx - 14 + i*10, cy - 16); ctx.stroke(); }
  ctx.strokeStyle = '#e8c890'; ctx.lineWidth = 1; for (let i=0;i<5;i++) r(cx + 22, cy - 10 + i*5, 4, 1, '#e8c890');
}
function drawEnredoPanel(S, rd){
  const rr = (x,y,w,h,rad,col) => { ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x,y,w,h,rad); ctx.fill(); };
  r(0, 266, W, H-266, '#0d0820'); r(0, 266, W, 2, '#3b2f66');
  rr(8, 272, 224, 142, 8, '#160f2b'); r(16, 272, 208, 2, '#3b2f66');
  if (S.phase === 'pin'){
    txt('¡TE TIENE CONTRA LA LONA!', 120, 280, C.neon, 'center', 7, '#000');
    vtxt('Toca rápido para zafarte', 120, 295, '#ffffff', 'center', '#000');
    rr(24, 312, 192, 18, 5, '#2a2240'); rr(26, 314, Math.max(0, 188*Math.min(1, S.esc/S.need)), 14, 4, C.ok); r(28, 315, Math.max(0, 184*Math.min(1, S.esc/S.need)), 2, '#ffffff55');
    for (let i=0;i<3;i++){ const on = i < S.count, x = 90 + i*30; ctx.fillStyle = on ? C.neon : '#2a1a24'; ctx.beginPath(); ctx.arc(x, 356, 9, 0, 7); ctx.fill(); txt(String(i+1), x, 352, on ? '#fff' : '#5a3a4a', 'center', 7, null); }
    vtxt('Cuenta', 120, 376, C.gold, 'center', '#000');
    return;
  }
  const between = S.phase === 'between', counting = between && S.t >= 1.6;
  txt(S.phase === 'ko' ? '¡K.O.!' : between ? (counting ? 'RONDA ' + (4 - S.hp) + ' EN ' + Math.max(1, 3 - Math.floor(S.t - 1.6)) : '¡RONDA ' + (3 - S.hp) + ' SUPERADA!') : 'RONDA ' + Math.min(3, 4 - S.hp) + '/3', 120, 280, between ? C.ok : C.gold, 'center', 7, '#000');
  // guante con pelota
  drawGlove(46, 336); drawBaseball(48, 338, 10, true);
  // pelotas por acertar en esta ronda
  const n = between ? S.prevHits : S.phase === 'ko' ? (S.prevHits || rd.hits) : rd.hits, sp = n > 4 ? 25 : 30, x0 = 152 - (n-1)*sp/2;
  if (counting){ const c = Math.max(1, 3 - Math.floor(S.t - 1.6)), u = (S.t - 1.6) % 1; txt(String(c), 152, 304, C.gold, 'center', 18 + Math.round((1-u)*6), '#5a3a00'); }
  if (counting){ const c = Math.max(1, 3 - Math.floor(S.t - 1.6)), u = (S.t - 1.6) % 1; ctx.globalAlpha = 1 - u*.6; txt(String(c), 120, 120, '#ffffff', 'center', 40 + Math.round((1-u)*14), C.neon); ctx.globalAlpha = 1; }
  else for (let i=0;i<n;i++) drawBaseball(x0 + i*sp, 316, 10, i < S.hits);
  if (!counting) vtxt(between ? '¡Todas las pelotas!' : S.phase === 'attack' ? 'Pelotas que faltan' : S.phase === 'recover' ? '¡Arriba, Maito!' : S.phase === 'ko' ? '¡Maito gana!' : '¡El Enredo se prepara!', 152, 331, S.phase === 'attack' ? '#b9aee0' : C.gold, 'center', '#000');
  // tarjetas de ayuda con los dibujos reales
  rr(88, 344, 64, 40, 5, '#241a3d'); rr(158, 344, 64, 40, 5, '#241a3d');
  const c = ITEM_IMG.cafe, t = ITEM_IMG.taco1;
  if (c && c.complete && c.naturalWidth) ctx.drawImage(c, 97, 350, 13, 23);
  if (t && t.complete && t.naturalWidth) ctx.drawImage(t, 163, 352, 24, 22);
  if (!S.cafe){ vtxt('Zafarte', 131, 353, C.gold, 'center', '#000'); vtxt('fácil', 131, 364, C.gold, 'center', '#000'); }
  txt('+1', 204, 352, C.ok, 'center', 7, null); vtxt('vida', 204, 365, C.ok, 'center', '#000');
  if (S.cafe){ ctx.strokeStyle = C.gold; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(88, 344, 64, 40, 5); ctx.stroke(); vtxt('¡Listo!', 131, 358, C.gold, 'center', '#000'); }
  vtxt('Toca los enchufes que brillan', 120, 394, '#ffffff', 'center', '#000');
}

function sceneEnredo(){
  const ROUND = [ { need:8, count:1.35, plife:2.4, hits:3, spawns:8, move:14, bob:5, item:.6 }, { need:12, count:1.05, plife:1.8, hits:4, spawns:9, move:22, bob:8, item:.4 }, { need:16, count:.85, plife:1.3, hits:5, spawns:10, move:30, bob:10, item:.3 } ];
  const S = { dy:0, hp:3, phase:'intro', t:1.4, esc:0, need:8, count:0, countT:0, plugs:[], hits:0, spawned:0, item:null, cafe:false, balls:[], done:false, mx:180, flinch:0, firstPin:true }; if (window.DEV_HOOK) window.__enr = S;  // solo para pruebas
  const SPOTS = [[-18,-40],[14,-46],[22,-18],[-24,-12],[0,-60],[-6,-24]];
  const RD = () => ROUND[3 - S.hp] || ROUND[2];
  // El Enredo vuela por los aires de espaldas (plancha) y cae sobre Maito, que queda acostado; luego empieza la cuenta
  function startPin(){
    S.phase = 'leap'; S.t = 0; S.lx = S.mx; S.plugs = []; }
  function landPin(){
    S.phase = 'pin'; S.esc = 0; S.need = S.cafe ? Math.ceil(RD().need*.55) : RD().need; S.cafe = false; S.count = 0; S.countT = RD().count; SFX.thud(); shake = RM ? 0 : .3; vibrate(80); }
  function startAttack(){ S.phase = 'attack'; S.spawned = 0;   // los aciertos de la ronda se conservan aunque El Enredo contraataque
    S.plugs = []; S.t = .6; }
  // K.O. (según Sergio): en cámara lenta El Enredo, con el sprite de la llave, cae de espaldas y queda en el piso rebotando.
  // Maito corre (sprite corre) hasta la parte superior derecha de la lona y celebra; Checho entra por la izquierda corriendo
  // (corre_mexa), se detiene y lo anima (anima, de espaldas). Maito queda más arriba que Checho.
  function drawKO(){
    const k = S.koT, ease = u => u*u*(3-2*u);
    const MX0 = 60, MY0 = 228, MX1 = 200, MY1 = 190;
    // Maito: espera mientras El Enredo cae; solo cuando está tendido corre a la esquina superior derecha y celebra
    if (k < 2.2) CAST.maito(MX0, { anim: k < 1.2 ? 'beisbol' : 'idle_beisbol' });
    else if (k < 3.4){ const u = ease((k-2.2)/1.2); drawMaitoSprite(MX0 + (MX1-MX0)*u, MY0 + (MY1-MY0)*u, { anim:'corre' }); }
    else drawMaitoSprite(MX1, MY1, { anim:'celebra' });
    // El Enredo: se eleva por el golpe, cae de espaldas (sprite cae2) y queda tendido rebotando
    { const fx = S.kx + (128 - S.kx)*ease(Math.min(1, k/1.2)); let y = 228, f;
      if (k < .6){ const u = k/.6; y -= Math.sin(u*Math.PI/2)*36; f = u*4; }
      else if (k < 1.2){ const u = (k-.6)/.6; y -= Math.cos(u*Math.PI/2)*36; f = 4 + u*4.99; }
      else { const t = k - 1.2; y -= Math.abs(Math.sin(t*Math.PI*1.8)) * 12 * Math.exp(-t*1.6); f = 8.99;
        const ph = Math.floor(t*1.8); if (ph !== S.koB && t < 1.6){ S.koB = ph; if (ph > 0) SFX.thud(); } }
      if (k < 1.2){ ctx.globalAlpha = .3; r(Math.round(fx-24), 224, 48, 4, '#000'); ctx.globalAlpha = 1; }
      drawEnredo(fx, y, { anim:'cae', t: f / ENR_FPS.cae, once:true }); }
    // Checho entra por la izquierda cuando Maito ya llegó a la esquina, se detiene y lo anima
    if (k > 3.4){ const u = Math.min(1, (k-3.4)/1.1), CX = 62, CY = 244;
      if (u < 1) drawChechoSprite(-40 + (CX + 40)*ease(u), CY, { anim:'corre_mexa' }); else drawChechoSprite(CX, CY, { anim:'anima' }); }
    if (k < 1.2){ ctx.globalAlpha = .22; r(0, 52, W, 214, '#2a0a3a'); ctx.globalAlpha = 1; }
    if (k > .2 && k < 2.4) txt('¡K.O.!', 120 + Math.sin(T*30)*(k < 1.2 ? 1 : 0), 92, C.gold, 'center', 22 + (k > 1.2 && k < 1.5 ? 6 : 0), '#5a3a00');
  }
  return { label:'JEFE',
    update(dt){
      if (S.caught){ S.caught.t += dt; if (S.caught.t > .7) S.caught = null; }
      if (S.phase === 'ko'){ const k0 = S.koT; S.koT += dt * (S.koT < 1.2 ? .3 : 1);   // cámara lenta mientras se eleva y cae; luego velocidad normal
        S.balls.forEach(b => b.t += dt*3); S.balls = S.balls.filter(b => b.t < 1);
        if (k0 < 1.2 && S.koT >= 1.2){ SFX.thud(); shake = RM ? 0 : .5; vibrate(120); burst(S.kx + 20, 226, 24, ['#d8c8a8','#ffffff','#8a7a6a']); win('¡MAI-TO!', 120, 150); }
        if (k0 < 3.4 && S.koT >= 3.4){ SFX.hey(); setMood(1, 2); }
        if (S.koT >= 7 && !S.done){ S.done = true; stepDone(); } return; }
      if (S.done) return;
      if (S.flinch > 0) S.flinch -= dt;
      if (S.item){ S.item.life -= dt; if (S.item.life <= 0) S.item = null; }   // el ítem se puede atrapar en cualquier momento de la pelea
      S.balls.forEach(b => b.t += dt*3); S.balls = S.balls.filter(b => b.t < 1);
      const rd = RD();
      if (S.phase === 'between'){   // las pelotas de la ronda quedan a la vista; luego conteo 3-2-1 y empieza la siguiente ronda
        const t0 = S.t; S.t += dt; S.mx += (180 - S.mx)*Math.min(1, dt*4);
        for (const m of [1.6, 2.6, 3.6]) if (t0 < m && S.t >= m) tone(660, .08, 'square', .05);
        if (t0 < 4.6 && S.t >= 4.6){ tone(990, .2, 'square', .06); S.hits = 0; addBubble('¡RONDA ' + (4 - S.hp) + '!', 120, 100, C.gold, 12); S.phase = 'intro'; S.t = .6; }
      }
      else if (S.phase === 'intro'){ S.mx += (180 - S.mx)*Math.min(1, dt*4); S.t -= dt; if (S.t <= 0){ if (S.firstPin && S.hp === 3){ S.firstPin = false; startAttack(); } else startPin(); } }
      else if (S.phase === 'leap'){ S.t += dt; S.mx = S.lx + (92 - S.lx) * Math.min(1, S.t / .8); if (S.t >= .8){ S.mx = 92; landPin(); } }
      else if (S.phase === 'pin'){
        S.mx = 92; S.countT -= dt;
        if (S.countT <= 0){ S.count++; S.countT = rd.count; SFX.slap(); addBubble(String(S.count), 120, 140, C.ink, 24);
          if (S.count >= 3){ loseLife(['p_maito.jpg','MAITO','¡De pie, hijo de pe#@%, porque Mickey te ama!']); S.phase = 'recover'; S.t = 1.8; } }
        if (S.phase === 'pin' && S.esc >= S.need){ SFX.riffStab(); addBubble('¡SE ZAFÓ!', 120, 120, C.ok, 10); burst(100, 200, 14); startAttack(); }
      }
      else if (S.phase === 'recover'){ S.t -= dt; S.mx += (180 - S.mx)*Math.min(1, dt*4); if (S.t <= 0 && lives > 0) startAttack(); }
      else if (S.phase === 'attack'){
        // El Enredo se mueve de lado a lado y sube/baja un poco: hay que perseguir los enchufes
        S.mx += (180 + Math.sin(T*1.5)*rd.move - S.mx) * Math.min(1, dt*5); S.dy = Math.sin(T*2.3)*rd.bob;
        S.t -= dt;
        if (S.t <= 0 && S.plugs.length < 2 && S.spawned < rd.spawns){ const sp = SPOTS[Math.random()*SPOTS.length|0]; S.plugs.push({ dx:sp[0], dy:sp[1], life:rd.plife }); S.spawned++; S.t = .6; }
        S.plugs.forEach(p => p.life -= dt); S.plugs = S.plugs.filter(p => p.life > 0);
        if (!S.item && Math.random() < dt*rd.item){ const k = ['cafe','taco'][Math.random()*2|0]; if (!(k === 'taco' && lives >= 3)) { let x, y, n = 0; do { x = 24 + Math.random()*192; y = 72 + Math.random()*120; n++; } while (n < 10 && Math.abs(x - S.mx) < 34 && y > 110); S.item = { k, v: 1 + (Math.random()*3|0), x, y, life: 2.4 + Math.random()*1.4 }; } }   // aparece en cualquier punto del escenario, sin taparse con El Enredo
        if (S.hits >= rd.hits){ S.prevHits = rd.hits; S.hp--; S.flinch = .8; SFX.thud(); burst(S.mx, 170, 22); shake = RM ? 0 : .3; S.plugs = [];
          if (S.hp <= 0){ S.phase = 'ko'; S.koT = 0; S.kx = S.mx; S.plugs = []; S.item = null; SFX.thud(); shake = RM ? 0 : .4; }
          else { addBubble('¡RONDA SUPERADA!', 120, 100, C.ok, 9); S.hits = 0; S.item = null; startPin(); } }   // sin aviso: El Enredo salta por sorpresa e intenta la sumisión
        else if (S.spawned >= rd.spawns && S.plugs.length === 0){ addBubble('¡CONTRAATACA!', 120, 110, C.neon, 8); startPin(); }
      }
    },
    draw(){
      drawStage({ party: S.phase === 'ko' });
      const pinned = S.phase === 'pin' || S.phase === 'recover', leaping = S.phase === 'leap';
      if (pinned){ if (MAI.acostado.complete && MAI.acostado.naturalWidth) CAST.maito(84, { anim:'acostado' }); else if (MAI.inmovilizado.complete && MAI.inmovilizado.naturalWidth) CAST.maito(84, { anim:'inmovilizado' }); else { ctx.save(); ctx.translate(70, 224); ctx.rotate(-1.45); drawGuitarist(0, 46, { capOff:true, sad:true }, LOOK.maito); ctx.restore(); } }
      else if (S.phase === 'ko') drawKO();
      else CAST.maito(60, { anim: S.balls.length > 0 ? 'beisbol' : 'idle_beisbol' });   // sin guitarra durante la pelea
      const mx = Math.round(S.mx + (S.flinch > 0 ? Math.sin(T*60)*3 : 0));
      if (leaping){ const u = Math.min(1, S.t / .8); ctx.save(); ctx.translate(mx, 0); ctx.scale(-1, 1); drawEnredo(0, Math.round(228 - Math.sin(u*Math.PI)*80 - u*14), { anim:'salta', t:S.t, once:true }); ctx.restore(); }
      else if (S.phase !== 'ko'){ const ey = S.phase === 'pin' ? 234 : 228 + Math.round(S.phase === 'attack' ? (S.dy || 0) : 0);
        drawEnredo(mx, ey, { pinned: S.phase === 'pin' });
        S.plugs.forEach(p => drawPlug(mx + p.dx, ey + p.dy, p.life / RD().plife)); }
      S.balls.forEach(b => { const x = 74 + (b.tx - 74)*b.t, y = 180 + (b.ty - 180)*b.t - Math.sin(b.t*Math.PI)*30; spr(SP.BALL, x-4, y-4, PAL.BALL, 2); });
      // (sin réferi en esta pelea por ahora)
      if (S.item) drawEnredoItem(S.item);
      if (S.caught){ const c = S.caught, u = Math.min(1, c.t/.7), img = ITEM_IMG[c.k === 'taco' ? 'taco' + (c.v || 1) : c.k]; ctx.globalAlpha = 1 - u*.8;
        if (img && img.complete && img.naturalWidth){ const sc = 1 + Math.sin(u*Math.PI)*.8, w = img.naturalWidth*sc, h = img.naturalHeight*sc, x = c.x + (c.k === 'cafe' ? 220 - c.x : 20 - c.x)*u*u, y = c.y + (36 - c.y)*u*u; ctx.drawImage(img, x - w/2, y - h/2, w, h); }
        ctx.globalAlpha = 1; }
      drawCrowd(); drawHUD(this.label);
      r(0,30,W,20,'#0b0718cc'); vtxt('El Enredo', 74, 35, C.neon, 'right', '#000');
      for (let i=0;i<3;i++) r(80 + i*28, 35, 24, 8, i < S.hp ? C.neon : '#2a2240');
      if (S.cafe) vtxt('Café', 234, 35, C.gold, 'right', '#000');
      drawEnredoPanel(S, RD());
    },
    tap(x, y){
      if (S.done) return;
      if (S.phase !== 'ko' && S.item && Math.abs(x - S.item.x) < 30 && Math.abs(y - S.item.y) < 30){
        const k = S.item.k; S.caught = Object.assign({}, S.item, { t:0 }); S.item = null; burst(x, y, 16, [C.gold, '#fff', C.ok]);
        if (k === 'cafe'){ S.cafe = true; addBubble('¡CAFÉ!', 120, 120, C.gold); SFX.beer(); }
        else if (k === 'taco'){ lives = Math.min(3, lives+1); addBubble('¡TACOS! +1 VIDA', 120, 120, C.ok); SFX.life(); }
        return;
      }
      if (S.phase === 'pin'){ S.esc++; tone(220 + S.esc*20, .05, 'square', .05); burst(80, 210, 2, [C.ok]); return; }
      if (S.phase !== 'attack') return;
      const ey = 228 + (S.dy || 0), p = S.plugs.find(p => Math.abs(x - (S.mx + p.dx)) < 22 && Math.abs(y - (ey + p.dy)) < 22);
      if (p){ p.life = 0; S.hits++; stats.balls++; S.flinch = .3; SFX.ball(); const hn = S.hits; setTimeout(() => { SFX.thud(); lead(SCALE[3 + hn], .15, .05); }, 200); S.balls.push({ tx: S.mx + p.dx, ty: ey + p.dy, t:0 }); burst(S.mx + p.dx, ey + p.dy, 10, [C.gold, '#fff']); }
    }
  };
}

// Cierre del Nivel 2: mismas posiciones del final del K.O. (Maito arriba a la derecha de la lona, Checho abajo a la izquierda,
// El Enredo tendido). Checho puede salir corriendo a la derecha; Maito sale corriendo tras una espera y, cuando ya no
// queda nadie en pantalla, todo funde a negro y sigue.
function sceneMaitoOutro(o={}){
  const t0 = T, MX = 200, MY = 190, CX = 62, CY = 244; let released = false, fadeT = -1;
  if (o.fadeOut) dlgLock = true;
  return { update(){}, draw(){
    const t = T - t0;
    drawStage({ party:true });
    let mGone = false;
    if (o.maitoRunAfter != null && t > o.maitoRunAfter){ const x = MX + (t - o.maitoRunAfter)*150; if (x < 290) drawMaitoSprite(x, MY, { anim:'corre' }); else mGone = true; }
    else drawMaitoSprite(MX, MY, { anim: o.maito || 'celebra' });
    drawEnredo(128, 228, { anim:'cae', t: 8.99 / ENR_FPS.cae, once:true });
    if (!o.chechoGone){ if (o.chechoRun){ const x = CX + t*140; if (x < 300) drawChechoSprite(x, CY, { anim:'corre_mexa' }); } else drawChechoSprite(CX, CY, { anim: o.checho || 'anima', flip: o.checho === 'casa' }); }
    drawCrowd(); drawHUD('¡MAI-TO!');
    if (o.fadeOut && mGone){ if (fadeT < 0) fadeT = t; const kf = Math.min(1, (t - fadeT)/.8); ctx.globalAlpha = kf; r(0, 0, W, 420, '#000'); ctx.globalAlpha = 1;
      if (kf >= 1 && !released){ released = true; dlgLock = false; fadeIn = .7; if (typing){ clearInterval(typing); typing = null; } advance(); } }
  }, tap(){}, stop(){ if (o.fadeOut) dlgLock = false; } };
}

const L2 = {
  key:'maito', n:2, venue:'embudo', fans:.4, ficha:true,
  barks:[['p_checho.jpg','CHECHO','¡Apúrate, Pepino!'],['p_cami.jpg','CAMI','¡RE PERRRO!'],['p_mao.jpg','MAO','Son puras mamadas'],['p_dave.jpg','DAVE','¿Vamos por pollito?']],
  onStart(){ capColor = '#e0263f'; stats.capsLost = false; stats.balls = 0; },
  intro:[
    { who:'narr', text:'8:20 p.m. Coliseo Mexa, Chapinero. Checho llega corriendo.', fx(){ setStage(sceneChechoRunIn({ x:98, idleAnim:'casa', idleFlip:true, cast:[['maito',150,{wires:true}]] })); } },
    { who:'checho', text:'¡Pepino! ¿Qué haces?', fx: idle([['checho',98,{anim:'casa',flip:true}],['maito',150,{wires:true}]]) },
    { who:'maito', text:'¡Pepino! Me invitaron a abrir la función con unas buenas rolas… pero los in-ears me hicieron una llave.', fx: idle([['checho',98,{anim:'casa',flip:true}],['maito',150,{wires:true}]]) },
    { who:'checho', text:'¿Una llave?' },
    { who:'maito', text:'Una tapatía invertida, Checho. No me puedo mover.', fx(){ idle([['checho',98,{anim:'casa',flip:true}],['maito',150,{wires:true}]])(); SFX.riffStab(); } },
    { who:'checho', text:'Desenrédate que son las 8:20 p.m. y Ricardo nos quiere a los cinco a las 11:00 p.m.', fx: idle([['checho',98,{anim:'casa',flip:true}],['maito',150,{flip:true}]]) },
    { who:'maito', text:'Dame dos rolas y nos vamos. ¡Paaasfe lo que passfe!', fx(){ SFX.riffStab(); setStage(sceneMaitoRolas()); } }
  ],
  idle:[['maito',120]],  // Checho salió corriendo: en los retos Maito queda solo, en el centro
  steps:[
    { id:'pedals', clock:'8:24', music:'rock', scene:scenePedals, hint:'Tip: di los colores en voz alta mientras se encienden.',
      before:[{ who:'narr', text:'RETO 1 · La pedalera. Antes de la primera rola, Maito tiene que pisar los pedales en orden. Mira la secuencia y repítela. Cada ronda es más larga.' }] },
    { id:'headbang', clock:'8:31', music:'rock', scene:sceneHeadbang, hint:'Tip: no sigas el pulso, sigue las notas. La gorra siempre cae en el cuarto tiempo.',
      before:[{ who:'narr', text:'RETO 2 · Riffs de Maito. Las notas no llegan parejas: toca justo cuando cada una llegue al parlante. Cada riff termina en una ★: si la aciertas, Maito hace headbang y la gorra sale volando. Tócala justo cuando caiga en su cabeza. Hay 7 gorras para coleccionar.' }] },
    { id:'enredo', clock:'8:40', music:'boss', venue:'ring', scene:sceneEnredo, hint:'Tip: lanza cuando el conector brille. Si te atrapa, toca rápido antes de que termine el conteo regresivo.',
      vs:{ boss:'enredo', desc:'Toca los conectores que brillan para lanzarle pelotas. Si te atrapa, toca rápido antes de que termine el conteo regresivo.', name:'EL ENREDO', cls:'LUCHADOR TÉCNICO', moves:['LLAVE DE CABLE','TAPATÍA DE IN-EARS','NUDO MARINERO','PLANCHA DESCONECTADA'] },
      before:[
        { who:'maito', text:'¡Listo, Pepino, vamos!', fx(){ setStage(sceneMaitoWalkLeft()); } },
        { who:'checho', text:'¿Y ese quién es?', fx: idle([['maito',60,{anim:'rolas'}]], { extra(){ drawEnredo(180, 228, {}); } }) },
        { who:'maito', text:'Esto son luchas, Pepino. Primero tengo que tirar a este Enredo a la lona.' },
        { who:'checho', text:'¿Y cómo vas a ganarle a ese?', fx: idle([['maito',60,{anim:'rolas'}]], { extra(){ drawEnredo(180, 228, { anim:'puno' }); } }) },
        { who:'maito', text:'Como en las grandes ligas.', fx: idle([['maito',60,{anim:'beisbol'}]], { extra(){ drawEnredo(180, 228, { anim:'puno' }); } }) },
        { who:'enredo', text:'Si te gano, rockerito, te vas a tener que volver Rudo. Para siempre.', fx: idle([['maito',60,{anim:'beisbol'}]], { extra(){ drawEnredo(180, 228, {}); } }) },
        { who:'maito', text:'¡Nunca! Te voy a vencer, paaasfe lo que passfe.', fx(){ SFX.riffStab(); idle([['maito',60,{anim:'beisbol'}]], { extra(){ drawEnredo(180, 228, {}); } })(); } },
        { who:'narr', text:'JEFE · El Enredo. Toca los conectores que brillan para lanzarle pelotas de béisbol. Si se te tira encima y te inmoviliza, toca rápido para zafarte antes de la cuenta de 3. Son 3 rondas, cada una más rápida.' } ] }
  ],
  outro:[
    { who:'presentador', text:'¡Gana por desconexión técnicaaa!', fx(){ setStage(sceneMaitoOutro({ checho:'anima', maito:'celebra' })); SFX.hey(); } },
    { who:'enredo', text:'Me ganaste, rockero… pero los cables siempre vuelven. Siempre.' },
    { who:'maito', text:'Eso ya lo sé, compa. Vivo entre ellos.', fx(){ setStage(sceneMaitoOutro({ checho:'casa', maito:'rie' })); } },
    { who:'checho', text:'Vamos por Dave. Debe seguir en esa call.', fx(){ setStage(sceneMaitoOutro({ checho:'corre_mexa', chechoRun:true, maito:'celebra' })); } },
    { who:'maito', text:'¡Pepino, espérame!', fx(){ setStage(sceneMaitoOutro({ chechoGone:true, maito:'celebra', maitoRunAfter:1, fadeOut:true })); } }
  ],
  mapSub:'¡MAITO DESENREDADO! FALTAN 3 · SIGUIENTE: EL COWORK'
};

