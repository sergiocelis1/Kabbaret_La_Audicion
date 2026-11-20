'use strict';
/* ===================== NIVEL 4 · MAO · Bar de comedia La Carcajada ===================== */
const JOKES = [
  ['¿Cómo sabes que el baterista está en la puerta?', '¡Porque no sabe cuándo entrar!'],
  ['¿Qué le dijo el metrónomo al baterista?', '¡Yo sí llego a tiempo!'],
  ['Me pidieron que tocara más bajito…', '¡y me pasé al bajo!'],
  ['¿Por qué el guitarrista le habla a su pedalera?', '¡Porque es la única que lo entiende!'],
  ['¿Qué hace una vaca en un concierto?', '¡Muuuu-sica!'],
  ['¿Por qué te pusiste "Natalia Natalia"?', '¿Por qué se me perdió el DNI?'],
  ['Mi novia me dejó por un DJ…', '¡dice que yo no tenía buen beat!'],
  ['¿Cuál es el colmo de un baterista?', '¡Que lo dejen plantado en el platillo!'],
  ['¿Qué le dijo una baqueta a la otra?', '¡Qué golpe tan bajo!'],
  ['¿Por qué el bajista llegó tarde?', '¡Porque nadie notó que no estaba!']
];
function rimshot(){ const t = now(); DR.tom(t, 220); DR.tom(t+.13, 160); DR.crash(t+.28, .12); }
function crickets(){ for (let i=0;i<4;i++) tone(4200,.05,'sine',.03,now()+i*.18); }

// RETO 1: ba-dum-tss — el golpe de batería justo después de cada chiste
function sceneRimshot(){
  // Maito cuenta el chiste (tarjeta abajo); al llegar el remate se encienden tres tambores: BA (tom), DUM (tom), TSS (platillo).
  // Un anillo se cierra sobre cada uno: toca cuando se cierre. Si aciertas el TSS y al menos otro golpe, el chiste funciona.
  const S = { i:0, cur:0, done:false, phase:'setup', t:3.0, pt:0, hits:[null,null,null], hitT:[null,null,null], ok:0, goal:3, fails:0, res:'', resC:C.ok, maoT:0, maoWait:0, order:JOKES.map((_,i)=>i).sort(() => Math.random()-.5) };
  const BEATS = [2.4, 2.7, 3.2], TOL = .16;   // el remate se lee ~1,5 s antes de que empiecen los anillos
  const PADS = [{ x:50, lab:'BA', c:'#36d6ff' }, { x:120, lab:'DUM', c:'#b48cff' }, { x:190, lab:'TSS', c:'#ffd34d' }];
  const joke = () => JOKES[S.order[S.cur % JOKES.length]];   // el chiste en pantalla solo cambia al empezar el siguiente (no se revela el remate)
  if (window.DEV_HOOK) window.__rim = S;   // solo para pruebas
  function finish(){
    const good = S.hits.filter(h => h === 'ok' || h === 'top').length, win1 = S.hits[2] === 'ok' || S.hits[2] === 'top';
    if (win1 && good >= 2){ S.ok++; SFX.cheer(); setMood(1, 1.4); fans = Math.min(1, fans + .05); addBubble('JAJAJA', 40, 196, C.gold); addBubble('JAJA', 204, 196, C.gold);
      S.res = good === 3 ? '¡BA-DUM-TSS PERFECTO!' : '¡BA-DUM-TSS!'; S.resC = C.ok; S.maoWait = .5; }   // Mao remata medio segundo después
    else { S.fails++; crickets(); setMood(-1, 1.2); S.res = S.hits.every(h => h === 'miss') ? 'SOLO SE OYEN GRILLOS…' : 'SE TE FUE EL REMATE'; S.resC = C.neon;
      if (S.fails >= 3){ S.fails = 0; loseLife(['p_mao.jpg','MAO','Eso no es así madre']); } }
    S.phase = 'result'; S.t = 1.4; S.i++;
    if (S.ok >= S.goal){ S.done = true; setTimeout(() => { win('¡EL PÚBLICO\nMUERE DE RISA!'); setTimeout(stepDone, 1000); }, 600); }
  }
  const hitSound = k => { const t = now(); if (k < 2) DR.tom(t, k ? 160 : 220); else DR.crash(t, .12); };
  return { label:'RETO 1/3',
    update(dt){
      if (S.maoWait > 0){ S.maoWait -= dt; if (S.maoWait <= 0) S.maoS = T; }   // arranca la secuencia de Mao: toca, se queda en el último golpe y se ríe dos veces   // Mao sigue tocando y riéndose mientras Maito ya arranca el siguiente chiste
      if (S.done) return;
      if (S.phase === 'setup'){ S.t -= dt; if (S.t <= 0){ S.phase = 'punch'; S.pt = 0; S.hits = [null,null,null]; S.hitT = [null,null,null]; } }
      else if (S.phase === 'punch'){ S.pt += dt; BEATS.forEach((b, k) => { if (S.hits[k] == null && S.pt > b + TOL){ S.hits[k] = 'miss'; S.hitT[k] = T; } }); if (S.pt > BEATS[2] + .4) finish(); }
      else if (S.phase === 'result'){ S.t -= dt; if (S.t <= 0){ S.phase = 'setup'; S.t = 3.0; S.hits = [null,null,null]; S.cur = S.i; } }
    },
    draw(){
      drawStage();
      { const s = S.maoS != null ? T - S.maoS : 99;   // toca (0,9 s) → último cuadro 0,5 s → ríe dos veces (2 s)
        drawMao(64, 228, s < 1.4 ? { anim:'toca', t: Math.min(s, .89) } : s < 3.4 ? { anim:'rie', t: (s - 1.4) % 1 } : { anim:'idle' }); }
      CAST.maito(168, { anim: S.phase === 'result' && S.resC === C.ok ? 'rie_chiste' : 'cuenta_chiste' });   // Maito se ríe desde que se logra el ba-dum-tss
      drawCrowd(); drawHUD(this.label);
      // marcador arriba: chistes logrados como micrófonos
      r(0, 30, W, 18, '#0b0718cc'); r(0, 47, W, 1, '#ffd34d33'); vtxt('Chistes con ba-dum-tss', 8, 34, '#d8d2e8');
      for (let i=0;i<S.goal;i++){ const x = 200 + i*12, on = i < S.ok, cl = on ? C.gold : '#2e2648'; r(x, 33, 7, 7, cl); r(x + 3, 40, 1, 4, cl); r(x + 1, 44, 5, 1, cl); if (on) r(x + 1, 34, 2, 2, '#fff8c0'); }
      // panel inferior
      r(0, 252, W, H - 252, '#0b0718'); r(0, 252, W, 1, '#ffd34d55'); r(0, 253, W, 3, '#140d26');
      // tarjeta del chiste (esquinas pixel redondeadas, pestaña dorada)
      const CX = 10, CY = 260, CW = 220, CH = 74;
      r(CX + 1, CY, CW - 2, CH, '#3a2f5c'); r(CX, CY + 1, CW, CH - 2, '#3a2f5c');
      r(CX + 1, CY + 1, CW - 2, CH - 2, '#171030'); r(CX + 2, CY + 1, CW - 4, 1, '#ffffff14');
      const tab = 'MAITO CUENTA', tw = vWidth(tab) + 10;
      r(CX + 9, CY - 6, tw, 12, '#05030c'); r(CX + 10, CY - 5, tw - 2, 10, C.gold); r(CX + 10, CY - 5, tw - 2, 1, '#fff1b0'); vtxt(tab, CX + 14, CY - 4, '#1a1030');
      const j = joke();
      vwrap(j[0], CW - 20).slice(0, 3).forEach((ln, i) => vtxt(ln, CX + 10, CY + 11 + i*11, '#ece8f6'));
      for (let x = CX + 10; x < CX + CW - 10; x += 4) r(x, CY + 46, 2, 1, '#3a2f5c');
      if (S.phase !== 'setup') vwrap(j[1], CW - 20).slice(0, 2).forEach((ln, i) => vtxt(ln, CX + 10, CY + 50 + i*11, '#ffd34d', 'left', '#000'));
      else vtxt('Espera el remate' + '.'.repeat(1 + (Math.floor(T*3) % 3)), CX + 10, CY + 53, '#6f6590');
      // tambores vistos desde arriba: BA (redoblante), DUM (tom), TSS (platillo)
      const ring = (cx, cy, rad, col) => { const n = Math.max(12, Math.round(rad * 1.6)); ctx.fillStyle = col; for (let a=0;a<n;a++){ const t = a / n * Math.PI * 2; ctx.fillRect(Math.round(cx + Math.cos(t)*rad) - 1, Math.round(cy + Math.sin(t)*rad) - 1, 2, 2); } };
      PADS.forEach((p, k) => {
        const cx = p.x, cy = 362, hit = S.hits[k], live = S.phase === 'punch' && hit == null, good = hit === 'ok' || hit === 'top';
        const since = S.hitT[k] != null ? T - S.hitT[k] : 9;
        ctx.globalAlpha = .55; pcirc(cx + 1, cy + 3, 22, '#000'); ctx.globalAlpha = 1;
        if (good){ ctx.globalAlpha = .22 + .15*Math.sin(T*8); pcirc(cx, cy, 26, p.c); ctx.globalAlpha = 1; }
        if (k < 2){
          pcirc(cx, cy, 21, '#1d1f2e'); pcirc(cx, cy - 1, 20, '#e4e7f2'); pcirc(cx, cy, 19, '#8c91aa'); pcirc(cx, cy + 1, 18, '#5d6179');
          for (let a=0;a<8;a++){ const t = a/8*Math.PI*2 + .39; r(Math.round(cx + Math.cos(t)*19) - 1, Math.round(cy + Math.sin(t)*19) - 1, 3, 3, '#2a2c3d'); r(Math.round(cx + Math.cos(t)*19) - 1, Math.round(cy + Math.sin(t)*19) - 1, 1, 1, '#c9cde0'); }
          if (k === 0){ pcirc(cx, cy, 16, '#d8d0bb'); pcirc(cx - 1, cy - 1, 14, '#efe9da'); r(cx - 9, cy - 11, 6, 1, '#ffffffaa'); }
          else { pcirc(cx, cy, 16, '#1f1a33'); pcirc(cx - 1, cy - 1, 14, '#2c2548'); ring(cx, cy, 9, '#3d3466'); r(cx - 9, cy - 11, 6, 1, '#ffffff33'); }
        } else {
          pcirc(cx, cy, 22, '#3d2a06'); pcirc(cx, cy, 21, '#a87a1c'); pcirc(cx - 1, cy - 1, 20, '#d8a838');
          ctx.globalAlpha = .5; ring(cx, cy, 17, '#b8891f'); ctx.globalAlpha = 1;
          for (let i=0;i<5;i++) r(cx - 15 + i, cy - 11 + i, 1, 1, '#fff2b8aa');
        }
        if (hit === 'miss'){ ctx.globalAlpha = .5; pcirc(cx, cy, 18, '#3a0f1e'); ctx.globalAlpha = 1; }
        if (since < .25){ ctx.globalAlpha = (.25 - since) * 3.2; pcirc(cx, cy, 18, '#ffffff'); ctx.globalAlpha = 1; if (good) ring(cx, cy, 21 + since*40, p.c); }
        const lab = k === 1 ? '#7fe6ff' : '#3a2604', lw = vWidth(p.lab);
        if (k === 1) vtxt(p.lab, cx - lw/2, cy - 4, good ? '#ffffff' : lab, 'left', '#000');
        else vtxt(p.lab, cx - lw/2, cy - 4, k === 0 ? '#2a2240' : lab);
        if (live){ const dtb = BEATS[k] - S.pt; if (dtb < .9){ ctx.globalAlpha = Math.min(1, (0.9 - dtb)*2); ring(cx, cy, 22 + Math.max(0, dtb)*36, p.c); ctx.globalAlpha = 1; } }
        if (hit === 'top') vtxt('¡Perfecto!', cx, cy + 26, C.ok, 'center', '#000'); else if (hit === 'ok') vtxt('¡Bien!', cx, cy + 26, C.ok, 'center', '#000'); else if (hit === 'miss') vtxt('Fallo', cx, cy + 26, C.neon, 'center', '#000');
      });
      // estado (con salto de línea si no cabe)
      if (S.phase === 'result') vtxtw(S.res, 120, 401, 220, S.resC, 'center', '#000');
      else { const reading = S.phase === 'punch' && S.pt < BEATS[0] - .9; vtxtw(S.phase === 'setup' ? 'Toca cuando se cierre cada anillo' : reading ? 'Prepárate…' : '¡Ahora! Ba · dum · tss', 120, 401, 220, S.phase === 'setup' || reading ? '#8a80a8' : C.cyan, 'center'); }
    },
    tap(){
      if (S.done || S.phase !== 'punch') return;
      const k = S.hits.findIndex(h => h == null); if (k < 0) return;
      const d = Math.abs(S.pt - BEATS[k]);
      if (S.pt < BEATS[k] - .3) return;   // demasiado pronto (o aún leyendo el remate): no cuenta
      S.hits[k] = d <= .06 ? 'top' : d <= TOL ? 'ok' : 'miss'; S.hitT[k] = T; if (S.hits[k] !== 'miss') hitSound(k); else tone(120, .08, 'square', .04);
    }
  };
}

// RETO 2: aguanta la risa — Mao toca la música de salida; cada frase de Maito infla burbujas de risa sobre Mao.
// Se revientan tocándolas JUSTO en el pulso (un anillo se cierra sobre cada burbuja en cada tiempo). Si una explota, Mao suelta la carcajada.
let MAO_POPS = 0;
const dotRing = (cx, cy, rad, col) => { const n = Math.max(12, Math.round(rad * 1.6)); ctx.fillStyle = col; for (let a=0;a<n;a++){ const t = a / n * Math.PI * 2; ctx.fillRect(Math.round(cx + Math.cos(t)*rad) - 1, Math.round(cy + Math.sin(t)*rad) - 1, 2, 2); } };
const vtxtBig = (s, x, y, col, sc=2, shadow='#000') => { ctx.save(); ctx.translate(Math.round(x), Math.round(y)); ctx.scale(sc, sc); vtxt(s, 0, 0, col, 'center', shadow); ctx.restore(); };
function sceneMetro(){
  const LINES = ['¡Paaasfe lo que passfe!', 'Son puras m@madas', '¡Ay mamaaa, raaayos! Tan chistosa la Pones', '¡Noooooo, Mónicaaaa!', '¡Demonios, Gump!', '¡De pie, hijo de pe**@, porque Mickey te ama!'];
  // 3 rondas de 3 burbujas: cada ronda las burbujas duran menos, suben más rápido y Maito suelta las frases más seguido
  const ROUNDS = [{ life:12, gap:6, rise:2 }, { life:9, gap:4, rise:3.5 }, { life:6.5, gap:3, rise:5 }], TOL = .16;
  const S = { round:0, slots:['wait','wait','wait'], spawned:0, nextB:0, banner:2.2, between:0, bubs:[], fx:[], parts:[], phrase:null, phStart:-9, laughT:0, combo:0, beatN:0, lastPrev:0, beatT:-9, done:false,
              order:LINES.map((_,i)=>i).sort(() => Math.random()-.5), li:0 };
  MAO_POPS = 0;
  if (window.DEV_HOOK) window.__met = S;
  const q = () => 4 * spb();
  const beat = () => { const tn = now(); let prev = -1e9, next = 1e9; beatTimes(3).forEach(b => { if (b <= tn && b > prev) prev = b; if (b > tn && b < next) next = b; }); return { tn, prev, next, near: Math.min(tn - prev, next - tn) }; };
  const say = (s, x, y, col) => S.fx.push({ s, x, y, col, t:0 });
  const SLOTS = [[38, 128], [100, 126], [69, 82]];
  const rad = bb => 10 + 9 * (bb.age / bb.life);
  function spawn(){
    const R = ROUNDS[S.round], free = SLOTS.filter(s => S.bubs.every(o => Math.hypot(o.x - s[0], o.y0 - s[1]) > 20)), sl = free.length ? free[Math.random()*free.length|0] : SLOTS[S.spawned % 3];
    S.bubs.push({ x: sl[0] + Math.round((Math.random()-.5)*6), y: sl[1], y0: sl[1], age:0, life: R.life * q(), rise: R.rise, hitT:-9, off:0, slot: S.spawned });
    S.slots[S.spawned] = 'live'; S.spawned++;
    S.phrase = LINES[S.order[S.li++ % LINES.length]]; S.phStart = T; SFX.whoosh(); tone(520 + Math.random()*120, .06, 'sine', .03);
  }
  function burstAt(x, y, n, cols){ for (let i=0;i<n;i++) S.parts.push({ x, y, vx:(Math.random()-.5)*110, vy:-Math.random()*90, t:0, c: cols[i % cols.length] }); }
  function explode(bb){
    S.bubs = S.bubs.filter(o => o !== bb); S.slots[bb.slot] = 'boom'; S.laughT = 1.8; S.combo = 0;
    burstAt(bb.x, bb.y, 14, ['#ff7ad9', '#fff0fb']);
    shake = RM ? 0 : .35; flash = .1; flashCol = '#ff7ad9'; setMood(-1, 1.4); tone(110, .25, 'sawtooth', .05);
    loseLife(['p_mao.jpg','MAO','jajaja… me ahogo… ¡no me mires, Maito!']);
  }
  const resolved = () => S.slots.filter(s => s === 'pop' || s === 'boom').length;
  return { label:'RETO 2/3',
    update(dt){
      if (S.done) return;
      const b = beat(); if (b.prev !== S.lastPrev && b.prev > 0){ S.lastPrev = b.prev; S.beatN++; S.beatT = T; }
      S.fx.forEach(f => f.t += dt); S.fx = S.fx.filter(f => f.t < 1);
      S.parts.forEach(pp => { pp.t += dt; pp.x += pp.vx*dt; pp.y += pp.vy*dt; pp.vy += 160*dt; }); S.parts = S.parts.filter(pp => pp.t < .7);
      if (S.laughT > 0){ S.laughT -= dt; return; }   // mientras Mao se ríe todo se congela
      if (S.banner > 0){ S.banner -= dt; if (S.banner <= 0) S.nextB = q(); return; }
      if (S.between > 0){ S.between -= dt; if (S.between <= 0){ S.round++; S.slots = ['wait','wait','wait']; S.spawned = 0; S.banner = 1.8; } return; }
      if (S.spawned < 3){ S.nextB -= dt; if (S.nextB <= 0){ spawn(); S.nextB = ROUNDS[S.round].gap * q(); } }
      for (const bb of S.bubs){ bb.age += dt; bb.y = bb.y0 - bb.age * bb.rise; if (bb.age >= bb.life){ explode(bb); return; } }
      if (S.spawned === 3 && !S.bubs.length && resolved() === 3){
        if (S.round >= ROUNDS.length - 1){ S.done = true; win('¡NI UNA RISA DE MÁS!'); setTimeout(stepDone, 1000); }
        else { S.between = 1.0; say('¡Ronda superada!', 120, 70, C.ok); SFX.ok(); }
      }
    },
    draw(){
      drawStage();
      const laughing = S.laughT > 0, bt = beat(), toNext = Math.max(0, Math.min(1, (bt.next - bt.tn) / q())), talking = T - S.phStart < 2.6;
      drawMao(64, 228, laughing ? { anim:'rie', t:(1.8 - S.laughT) % 1 } : { anim:'toca' });
      CAST.maito(168, { anim: laughing ? 'rie_chiste' : talking ? 'caras' : 'cowork' });   // Maito hace caras mientras suelta la frase
      drawCrowd(); drawHUD(this.label);
      // encabezado
      r(0, 30, W, 18, '#0b0718cc'); r(0, 47, W, 1, '#ffd34d33'); vtxt('Aguanta la risa', 8, 34, '#d8d2e8'); vtxt('Ronda ' + (S.round + 1) + '/3', 232, 34, C.gold, 'right');
      // globo de Maito (la frase se escribe sola)
      if (talking && S.phrase){
        const ls = vwrap(S.phrase, 118), bw = Math.max(...ls.map(vWidth)) + 14, bh = ls.length * 11 + 9, bx = Math.round(232 - bw), by = 104;
        ctx.globalAlpha = Math.min(1, (2.6 - (T - S.phStart)) * 3, (T - S.phStart) * 6);
        r(bx + 1, by, bw - 2, bh, '#05030c'); r(bx, by + 1, bw, bh - 2, '#05030c'); r(bx + 1, by + 1, bw - 2, bh - 2, '#171030'); r(bx + 2, by + 1, bw - 4, 1, '#ffffff18'); r(bx + 1, by + 1, 2, bh - 2, C.gold);
        r(190, by + bh, 6, 2, '#05030c'); r(192, by + bh, 3, 1, '#171030'); r(192, by + bh + 2, 3, 2, '#05030c'); r(194, by + bh + 4, 2, 2, '#05030c');
        let left = Math.floor((T - S.phStart) * 34); ls.forEach((ln, i) => { vtxt(ln.slice(0, Math.max(0, left)), bx + 8, by + 5 + i*11, '#ece8f6'); left -= ln.length + 1; });
        ctx.globalAlpha = 1;
      }
      // burbujas de risa con su anillo verde que se cierra en cada pulso
      for (const bb of S.bubs){
        const dng = bb.age / bb.life, rr = Math.round(rad(bb)), hot = dng > .75, wob = hot ? Math.round(Math.sin(T*34)*1.5) : 0, x = Math.round(bb.x + wob), y = Math.round(bb.y);
        ctx.globalAlpha = .9; pcirc(x, y, rr + 1, hot ? '#ff4d6d' : '#ffb3ec'); ctx.globalAlpha = .7; pcirc(x, y, rr, '#3a1238'); ctx.globalAlpha = .45; pcirc(x - 1, y - 1, rr - 2, hot ? '#ff5d8a' : '#ff7ad9'); ctx.globalAlpha = 1;
        r(x - Math.round(rr*.55), y - Math.round(rr*.62), 4, 1, '#ffffff'); r(x - Math.round(rr*.7), y - Math.round(rr*.45), 1, 3, '#ffffffcc');
        const fa = Math.max(0, .25 - (T - bb.hitT)) * 4; if (fa > 0){ ctx.globalAlpha = fa; pcirc(x, y, rr, '#ffffff'); ctx.globalAlpha = 1; }
        if (bb.off > 0){ ctx.globalAlpha = bb.off; pcirc(x, y, rr, '#ff2a4d'); ctx.globalAlpha = 1; bb.off = Math.max(0, bb.off - .05); }
        vtxt('JA', x, y - 4, '#fff0fb', 'center', '#3a0f2e');
        if (!laughing){ const onb = bt.near <= TOL; ctx.globalAlpha = onb ? 1 : .25 + .5*(1 - toNext); dotRing(x, y, rr + 3 + toNext*14, onb ? '#b8ffd0' : '#3dff8a'); ctx.globalAlpha = 1; }
      }
      S.parts.forEach(pp => { ctx.globalAlpha = 1 - pp.t / .7; r(Math.round(pp.x), Math.round(pp.y), 2, 2, pp.c); }); ctx.globalAlpha = 1;
      if (S.banner > 0){ const a = Math.min(1, S.banner * 3, (2.2 - S.banner) * 5); ctx.globalAlpha = Math.max(0, a); r(0, 104, W, 36, '#0b0718cc'); r(0, 104, W, 1, '#ffd34d66'); r(0, 139, W, 1, '#ffd34d66');
        vtxtBig('RONDA ' + (S.round + 1), 120, 108, C.gold, 2, '#000'); vtxt(['Las burbujas suben despacio', 'Ahora suben más rápido', '¡Último round: a toda velocidad!'][S.round], 120, 129, '#ece8f6', 'center'); ctx.globalAlpha = 1; }
      if (laughing){ const k = 1.8 - S.laughT; ctx.globalAlpha = Math.min(1, S.laughT * 2); vtxtBig('¡JAJAJAJA!', 64 + Math.sin(k*20)*2, 96 - k*6, '#ff7ad9', 2, '#2a0820'); ctx.globalAlpha = 1; }
      S.fx.forEach(f => { ctx.globalAlpha = 1 - f.t; vtxt(f.s, f.x, f.y - f.t*14, f.col, 'center', '#000'); }); ctx.globalAlpha = 1;
      // ===== panel inferior =====
      r(0, 252, W, H - 252, '#0b0718'); r(0, 252, W, 1, '#ffd34d55'); r(0, 253, W, 3, '#140d26');
      const card = (cx, cy, cw, ch, tab) => { r(cx + 1, cy, cw - 2, ch, '#3a2f5c'); r(cx, cy + 1, cw, ch - 2, '#3a2f5c'); r(cx + 1, cy + 1, cw - 2, ch - 2, '#171030'); r(cx + 2, cy + 1, cw - 4, 1, '#ffffff14');
        const tw = vWidth(tab) + 10; r(cx + 9, cy - 6, tw, 12, '#05030c'); r(cx + 10, cy - 5, tw - 2, 10, C.gold); r(cx + 10, cy - 5, tw - 2, 1, '#fff1b0'); vtxt(tab, cx + 14, cy - 4, '#1a1030'); };
      // tarjeta de la ronda: las 3 burbujas de esta ronda y el pulso (discreto)
      card(10, 262, 220, 40, 'RONDA ' + (S.round + 1) + ' DE 3');
      S.slots.forEach((st, i) => { const x = 30 + i*30, y = 284;
        if (st === 'pop'){ pcirc(x, y, 9, '#123a28'); dotRing(x, y, 9, '#3dff8a'); r(x - 4, y, 2, 2, '#3dff8a'); r(x - 2, y + 2, 2, 2, '#3dff8a'); r(x, y, 2, 2, '#3dff8a'); r(x + 2, y - 2, 2, 2, '#3dff8a'); r(x + 4, y - 4, 2, 2, '#3dff8a'); }
        else if (st === 'boom'){ pcirc(x, y, 9, '#3a0f1e'); dotRing(x, y, 9, '#ff4d6d'); vtxt('X', x, y - 4, '#ff4d6d', 'center'); }
        else if (st === 'live'){ ctx.globalAlpha = .8; pcirc(x, y, 9, '#ff7ad9'); ctx.globalAlpha = 1; r(x - 5, y - 6, 3, 1, '#fff'); vtxt('JA', x, y - 4, '#fff0fb', 'center', '#3a0f2e'); }
        else { pcirc(x, y, 9, '#1d1638'); dotRing(x, y, 9, '#3a2f5c'); } });
      vtxt('Pulso', 132, 280, '#6f6590');
      { const cur = (S.beatN + 3) % 4, g = Math.max(0, 1 - (T - S.beatT) / (q() * .8)); for (let i=0;i<4;i++){ const x = 168 + i*14, y = 284; pcirc(x, y, 3, '#123a28'); if (i === cur){ ctx.globalAlpha = .35 + .65*g; pcirc(x, y, 3, '#3dff8a'); if (g > .5) r(x - 1, y - 2, 1, 1, '#eaffef'); ctx.globalAlpha = 1; } } }
      // tarjeta de instrucciones
      card(10, 316, 220, 88, 'CÓMO SE JUEGA');
      const row = (y, icon, s) => { icon(26, y + 6); vtxtw(s, 44, y, 180, '#d8d2e8'); };
      row(326, (x, y) => { ctx.globalAlpha = .85; pcirc(x, y, 7, '#ff7ad9'); ctx.globalAlpha = 1; r(x - 4, y - 4, 2, 1, '#fff'); }, 'Cada frase de Maito infla una burbuja de risa sobre Mao.');
      row(352, (x, y) => { ctx.globalAlpha = .5; pcirc(x, y, 4, '#ff7ad9'); ctx.globalAlpha = 1; dotRing(x, y, 8, '#3dff8a'); }, 'Tócala justo cuando su anillo verde se cierre, al ritmo del pulso.');
      row(378, (x, y) => { r(x - 7, y - 7, 14, 14, '#ff4d6d'); r(x - 4, y - 3, 2, 2, '#3a0f1e'); r(x + 2, y - 3, 2, 2, '#3a0f1e'); r(x - 4, y + 2, 8, 3, '#3a0f1e'); r(x - 3, y + 3, 6, 1, '#fff0fb'); }, 'Si una explota, Mao se ríe y pierdes una vida.');
      // estado
      const st = laughing ? ['¡Mao se rió! Pierdes una vida', '#ff7ad9'] : S.combo > 2 ? ['Racha x' + S.combo, C.gold] : null;
      if (st) vtxt(st[0], 120, 408, st[1], 'center', '#000');
    },
    tap(x, y){
      if (S.done || S.laughT > 0) return;
      let best = null, bd = 1e9;
      for (const bb of S.bubs){ const d = Math.hypot(bb.x - x, bb.y - y); if (d < rad(bb) + 12 && d < bd){ bd = d; best = bb; } }
      if (!best) return;
      const b = beat();
      if (b.near <= TOL){
        best.hitT = T; DR.snare(now(), .2); S.combo++; MAO_POPS++; stats.notes++; S.slots[best.slot] = 'pop'; S.bubs = S.bubs.filter(o => o !== best);
        tone(880, .05, 'square', .03); tone(1320, .05, 'square', .02, now() + .05); burstAt(best.x, best.y, 12, ['#ff7ad9', '#ff7ad9', '#fff0fb']);
        say(b.near < .06 ? '¡Perfecto!' : '¡Pop!', best.x, best.y - 18, b.near < .06 ? C.gold : C.ok); fans = Math.min(1, fans + .01);
      } else {
        best.age = Math.min(best.life - .05, best.age + best.life * .12); best.off = .6; S.combo = 0; tone(140, .07, 'square', .04);
        say('Fuera de tiempo', best.x, best.y - 22, '#ff7ad9');
      }
    }
  };
}

// JEFE 4: Iván Drum-Machine — duelo de secuenciador: Iván programa un patrón en su controladora (8 pasos × bombo/caja/platillo)
// y luego el cabezal vuelve a pasar: Mao lo repite en vivo, a tiempo. Cada patrón clavado le baja la batería a Iván.
const IVAN_X = 196, MAITO_BOSS_X = 132;
function drumPad(cx, cy, kind, st={}){
  // tambores vistos desde arriba (mismo estilo del ba-dum-tss): 'tom' (parche oscuro), 'snare' (parche blanco), 'cymbal' (platillo dorado)
  const good = st.good, since = st.since != null ? st.since : 9, col = st.col;
  ctx.globalAlpha = .55; pcirc(cx + 1, cy + 3, 22, '#000'); ctx.globalAlpha = 1;
  if (st.glow){ ctx.globalAlpha = .18 + .12*Math.sin(T*8); pcirc(cx, cy, 26, col); ctx.globalAlpha = 1; }
  if (kind !== 'cymbal'){
    pcirc(cx, cy, 21, '#1d1f2e'); pcirc(cx, cy - 1, 20, '#e4e7f2'); pcirc(cx, cy, 19, '#8c91aa'); pcirc(cx, cy + 1, 18, '#5d6179');
    for (let a=0;a<8;a++){ const t = a/8*Math.PI*2 + .39, lx = Math.round(cx + Math.cos(t)*19) - 1, ly = Math.round(cy + Math.sin(t)*19) - 1; r(lx, ly, 3, 3, '#2a2c3d'); r(lx, ly, 1, 1, '#c9cde0'); }
    if (kind === 'snare'){ pcirc(cx, cy, 16, '#d8d0bb'); pcirc(cx - 1, cy - 1, 14, '#efe9da'); r(cx - 9, cy - 11, 6, 1, '#ffffffaa'); }
    else { pcirc(cx, cy, 16, '#1f1a33'); pcirc(cx - 1, cy - 1, 14, '#2c2548'); dotRing(cx, cy, 9, '#3d3466'); r(cx - 9, cy - 11, 6, 1, '#ffffff33'); }
  } else {
    pcirc(cx, cy, 22, '#3d2a06'); pcirc(cx, cy, 21, '#a87a1c'); pcirc(cx - 1, cy - 1, 20, '#d8a838');
    ctx.globalAlpha = .5; dotRing(cx, cy, 17, '#b8891f'); ctx.globalAlpha = 1; for (let i=0;i<5;i++) r(cx - 15 + i, cy - 11 + i, 1, 1, '#fff2b8aa');
  }
  if (st.bad){ ctx.globalAlpha = .5; pcirc(cx, cy, 18, '#3a0f1e'); ctx.globalAlpha = 1; }
  if (since < .22){ ctx.globalAlpha = (.22 - since) * 3.6; pcirc(cx, cy, 18, '#ffffff'); ctx.globalAlpha = 1; dotRing(cx, cy, 21 + since*50, col); }
  const lw = vWidth(st.lab);
  if (kind === 'tom') vtxt(st.lab, cx - lw/2, cy - 4, good ? '#ffffff' : '#c9b8ff', 'left', '#000');
  else vtxt(st.lab, cx - lw/2, cy - 4, kind === 'snare' ? '#2a2240' : '#3a2604');
}
// Final del nivel: Maito vuelve corriendo hasta la mitad del escenario y queda quieto
const MAITO_MID = 124;
function sceneMaitoBack(){
  const t0 = T, X0 = -60, D = 1.1;
  return { update(){}, draw(){
    const u = Math.min(1, (T - t0) / D), x = X0 + (MAITO_MID - X0) * (1 - Math.pow(1 - u, 2));
    drawStage(); CAST.maito(x, u < 1 ? { anim:'corre_sin' } : { anim:'cowork' }); CAST.mao(64, { kit:true, anim:'idle' }); drawIvan(IVAN_X, 228, { anim:'derrota' });   // Maito pasa por detrás de la batería
    drawCrowd(); drawHUD('¡LISTO!');
  }, tap(){} };
}
// Mao deja la batería y sale corriendo a la derecha (la cámara lo sigue); justo antes de que salga, Maito lo alcanza corriendo y también sale. Fundido.
function sceneMaoRunsOut(done){
  const t0 = T, CAM = 293, MAO0 = 92, VM = 150, MS = 2.0, VMI = 240; let fin = false;
  return { update(){}, draw(){
    const k = T - t0, mx = MAO0 + VM * Math.max(0, k - .15), cam = Math.max(0, Math.min(CAM, mx - 130));
    const ix = k < MS ? MAITO_MID : MAITO_MID + VMI * (k - MS);
    drawStage({ cam });
    drawMao(64 - cam, 228, { anim:'kit' });   // la batería se queda en la tarima
    drawIvan(IVAN_X - cam, 228, { anim:'derrota' });
    if (ix - cam < 300) CAST.maito(ix - cam, k < MS ? { anim:'cowork', flip:true } : { anim:'corre_sin' });
    if (mx - cam < 300) drawMao(mx - cam, 228, { anim:'corre' });
    drawCrowd(); drawHUD('¡LISTO!');
    const ex = MAITO_MID + VMI * (k - MS) - cam;   // fundido cuando Maito ya salió por la derecha
    if (k > MS && ex > 250){ const a = Math.min(1, (ex - 250) / 70); ctx.globalAlpha = a; r(0, 0, W, H, '#000'); ctx.globalAlpha = 1; if (a >= 1 && !fin){ fin = true; done && done(); } }
  }, tap(){}, stop(){ dlgLock = false; } };
}
// Antes del duelo Maito sale corriendo hacia la izquierda, por detrás de la batería de Mao
function sceneMaitoLeaves(){
  const t0 = T;
  return { update(){}, draw(){
    const u = Math.min(1, (T - t0) / 1.1), x = MAITO_BOSS_X + (-70 - MAITO_BOSS_X) * u * u;
    drawStage();
    if (u < 1) CAST.maito(x, { anim:'corre_sin', flip:true });   // se dibuja antes que Mao: pasa por detrás
    CAST.mao(64, { kit:true, anim:'idle' }); drawIvan(IVAN_X, 228, { anim:'idle' });
    drawCrowd(); drawHUD('JEFE');
  }, tap(){} };
}
// Entrada: se va la luz, «beep», e Iván entra corriendo desde la derecha y señala a Mao
function sceneIvanArrive(){
  const t0 = T, X0 = 280, D = 1.3, ease = u => 1 - Math.pow(1 - u, 2);
  tone(1046, .12, 'square', .05); tone(1046, .12, 'square', .05, now() + .22);
  return { update(){}, draw(){
    const k = T - t0, u = Math.min(1, Math.max(0, (k - .8) / D)), x = X0 + (IVAN_X - X0) * ease(u);
    drawStage(); CAST.mao(64, { kit:true, anim:'idle' }); CAST.maito(MAITO_BOSS_X, { anim:'cowork', flip:true });   // Maito mira hacia Iván
    if (k > .8) drawIvan(x, 228, u < 1 ? { anim:'corre' } : { anim:'reta' });
    drawCrowd(); drawHUD('JEFE');
    const dark = k < .8 ? .88 : Math.max(.12, .88 - (k - .8) * .4);   // apagón y la luz vuelve a medias
    ctx.globalAlpha = dark; r(0, 30, W, 222, '#05030c'); ctx.globalAlpha = 1;
  }, tap(){} };
}
function sceneIvan(){
  const ROWS = [{ lab:'Bombo', kind:'tom', col:'#b48cff', snd:() => DR.kick(now(), .6) }, { lab:'Caja', kind:'snare', col:'#36d6ff', snd:() => DR.snare(now(), .3) }, { lab:'Platillo', kind:'cymbal', col:'#ffd34d', snd:() => DR.crash(now(), .14) }];
  const ROUNDS = [
    { name:'CALENTAMIENTO', sub:'Un patrón sencillo para empezar', sd:.36, kind:'basic', n:3 },
    { name:'CUANTIZACIÓN', sub:'Golpes a contratiempo', sd:.34, kind:'off', n:4 },
    { name:'COPIAR Y PEGAR', sub:'La segunda mitad es igual a la primera', sd:.32, kind:'copy', n:3 },
    { name:'OTRA VEZ', sub:'Mao se desconcentró: repite el patrón', sd:.32, kind:'repeat' },
    { name:'LOOP INFINITO', sub:'Dos vueltas seguidas; la segunda, de memoria', sd:.3, kind:'loop', n:4 },
    { name:'200 BPM', sub:'Lo mismo… a toda velocidad', sd:.15, kind:'fast', n:4 }
  ];
  const HPMAX = ROUNDS.length;
  const S = { ri:0, hp:HPMAX, seq:[], phase:'banner', pt:T, nextStep:0, lit:{}, head:-1, judged:[], marks:{}, errs:0, padT:[9,9,9], padBad:[0,0,0], ivan:'idle', ivanT:T, streak:0, fx:[], sparks:[], chorroT:-9, done:false, laughT:-9 };
  if (window.DEV_HOOK) window.__iv = S;
  setMusic('silence');   // el duelo es la música: solo suenan Iván, Mao y el clic del secuenciador
  const R = () => ROUNDS[S.ri], say = (s, x, y, col) => S.fx.push({ s, x, y, col, t:0 });
  const pick = (arr, n) => arr.slice().sort(() => Math.random() - .5).slice(0, n).sort((a, b) => a - b);
  function build(){
    const k = R().kind, rr = () => Math.random()*3|0;
    if (k === 'repeat') return;   // mismo patrón del round anterior
    let steps;
    if (k === 'basic') steps = [0].concat(pick([2,4,6], R().n - 1));
    else if (k === 'off') steps = [0].concat(pick([1,3,5,7], R().n - 1));
    else if (k === 'copy'){ const h = [0].concat(pick([1,2,3], R().n - 1)), rows = h.map(rr); S.seq = h.map((s, i) => ({ s, r: rows[i] })).concat(h.map((s, i) => ({ s: s + 4, r: rows[i] }))); return; }
    else steps = [0, 2, 4, 6].slice(0, R().n);
    S.seq = steps.map((s, i) => ({ s, r: i === 0 ? 0 : rr() }));
  }
  const loops = () => R().kind === 'loop' ? 2 : 1;
  const ghost = (n, pass) => R().kind === 'copy' || R().kind === 'repeat' ? n.s < 4 : R().kind === 'loop' ? pass === 0 : true;   // qué golpes se ven en tu turno
  const playNotes = () => { const out = []; for (let p=0;p<loops();p++) S.seq.forEach(n => out.push({ s: n.s + p*8, r: n.r, pass: p })); return out; };
  function setIvan(a){ S.ivan = a; S.ivanT = T; }
  function start(phase){ S.phase = phase; S.pt = T; S.bGo = 0; S.nextStep = 0; S.head = -1; S.lit = {}; }
  function newRound(){ build(); start('banner'); setIvan('idle'); S.marks = {}; }
  newRound();
  function finishPlay(){
    const notes = playNotes(), ok = notes.every((n, i) => S.judged[i] === 'top' || S.judged[i] === 'ok') && S.errs <= 1;   // se perdona un golpe de más
    if (ok){
      S.hp--; S.streak++; setIvan(S.hp <= 0 ? 'derrota' : 'falla'); SFX.punch(); tone(1800, .08, 'sawtooth', .04); tone(900, .12, 'sawtooth', .04, now() + .06);
      for (let i=0;i<22;i++){ const a = Math.random()*Math.PI*2, sp = 30 + Math.random()*70; S.sparks.push({ x: IVAN_X - 4, y: 172, vx: Math.cos(a)*sp, vy: Math.sin(a)*sp - 20, t:0 }); }
      shake = RM ? 0 : .25; flash = .08; flashCol = '#36d6ff'; fans = Math.min(1, fans + .03); setMood(1, 1.2);
      if (S.hp <= 0){ S.done = true; setTimeout(() => { win('¡IVÁN SE APAGÓ!'); setTimeout(stepDone, 2600); }, 1400); start('end'); return; }
      if (S.streak >= 3){ S.streak = 0; if (lives < 3){ lives++; S.chorroT = T; SFX.beer && SFX.beer(); } }
      start('hit');
    } else {
      S.streak = 0; setIvan('reta'); tone(150, .2, 'sawtooth', .05); setMood(-1, 1.2);
      say('¡Ese no era el patrón!', IVAN_X - 40, 96, '#ff4d6d'); loseLife(['p_ivan.jpg','IVÁN','Error humano detectado. Otra vez.']);
      start('fail');
    }
  }
  return { label:'JEFE',
    update(dt){
      S.fx.forEach(f => f.t += dt); S.fx = S.fx.filter(f => f.t < 1.2);
      S.sparks.forEach(p => { p.t += dt; p.x += p.vx*dt; p.y += p.vy*dt; p.vy += 120*dt; }); S.sparks = S.sparks.filter(p => p.t < .6);
      for (let i=0;i<3;i++) S.padT[i] += dt;
      const sd = R().sd, k = T - S.pt;
      if (S.phase === 'banner'){ if (S.bGo && T - S.bGo > .3){ start('prog'); setIvan('toca'); } }   // el cartel del patrón se queda hasta que la persona toque
      else if (S.phase === 'prog'){
        while (S.nextStep < 8 && k >= .3 + S.nextStep*sd){ const st = S.nextStep; S.head = st; DR.hat(now(), false, .05);
          S.seq.filter(n => n.s === st).forEach(n => { ROWS[n.r].snd(); S.lit[st + ':' + n.r] = T; }); S.nextStep++; }
        if (k > .3 + 8*sd + .5){ start('count'); setIvan('idle'); }
      }
      else if (S.phase === 'count'){
        const q = sd * 2; while (S.nextStep < 4 && k >= .8 + S.nextStep*q){ DR.hat(now(), S.nextStep === 0, .09); S.nextStep++; }   // «¿Listo?» y luego 1, 2, 3, 4 como en música
        const lead = Math.min(.16, sd * .5); if (k >= .8 + 4*q - lead){ start('play'); S.pt = T + lead; S.judged = []; S.errs = 0; S.marks = {}; S.p0 = T; }   // el turno se abre un poco antes: se vale adelantarse al primer golpe
      }
      else if (S.phase === 'play'){
        const notes = playNotes(), total = 8 * loops(), win = Math.min(.16, sd * .5);
        while (S.nextStep < total && k >= S.nextStep*sd){ S.head = S.nextStep; DR.hat(now(), false, .04); S.nextStep++; }
        notes.forEach((n, i) => { if (!S.judged[i] && k > n.s*sd + win){ S.judged[i] = 'miss'; S.marks[(n.s % 8) + ':' + n.r] = { m:'miss', t:T }; } });
        if (k > total*sd + win + .05) finishPlay();
      }
      else if (S.phase === 'hit'){
        if (k > 1.4){
          if (S.ri === 2){ start('laugh'); setIvan('idle'); S.laughT = T; SFX.whoosh(); }   // a mitad del duelo Maito se ríe y Mao se desconcentra
          else { S.ri++; newRound(); }
        }
      }
      else if (S.phase === 'laugh'){ if (k > 2.2){ S.ri++; newRound(); } }
      else if (S.phase === 'fail'){ if (k > 1.8){ start('banner'); setIvan('idle'); S.marks = {}; } }
    },
    draw(){
      drawStage({ party: S.hp <= 2 && !S.done });
      const k = T - S.pt, laughing = S.phase === 'laugh', it = T - S.ivanT;
      const maoAnim = S.done ? { anim:'celebra' } : laughing ? { anim:'rie', t: k % 1 } : S.phase === 'play' && Math.min(...S.padT) < .3 ? { anim:'toca' } : { anim:'idle' };
      if (laughing){ const u = Math.max(0, Math.min(1, k * 4, (2.2 - k) * 4)); CAST.maito(-30 + 52*u, { anim:'rie_chiste' }); }   // Maito ya salió: solo se asoma detrás de Mao y se ríe
      drawMao(64, 228, maoAnim);
      drawIvan(IVAN_X, 228, S.ivan === 'reta' && it > 1.3 ? { anim:'idle' } : { anim:S.ivan });   // falla y derrota se repiten en bucle
      if (S.ivan === 'derrota' && it > .6){ for (let i=0;i<4;i++){ const ph = (T*.6 + i*.25) % 1; ctx.globalAlpha = .45*(1 - ph); pcirc(Math.round(IVAN_X - 6 + Math.sin(T*2 + i)*4 + ph*6), Math.round(176 - ph*40), Math.round(3 + ph*6), '#8a8aa0'); } ctx.globalAlpha = 1; }   // la controladora echa humo
      S.sparks.forEach(p => { ctx.globalAlpha = 1 - p.t/.6; r(Math.round(p.x), Math.round(p.y), 2, 2, p.t < .2 ? '#ffffff' : '#36d6ff'); }); ctx.globalAlpha = 1;
      drawCrowd(); drawHUD('JEFE');
      // encabezado: nombre y batería de Iván
      r(0, 30, W, 18, '#0b0718cc'); r(0, 47, W, 1, '#36d6ff33'); vtxt('Iván Drum-Machine', 8, 34, '#d8d2e8');
      { const x0 = 186, pct = S.hp / HPMAX, c = pct > .5 ? '#3dff8a' : pct > .2 ? '#ffd34d' : '#ff4d6d';
        vtxt(Math.round(pct*100) + '%', x0 - 4, 34, c, 'right');
        r(x0, 33, 40, 11, '#c9c4d6'); r(x0 + 1, 34, 38, 9, '#0b0718'); r(x0 + 40, 36, 2, 5, '#c9c4d6');
        for (let i=0;i<HPMAX;i++) if (i < S.hp) r(x0 + 2 + i*6, 35, 5, 7, c); }
      // cartel de cada patrón
      if (S.phase === 'banner'){ const a = Math.min(1, k * 5, S.bGo ? 1 - (T - S.bGo) / .3 : 1); ctx.globalAlpha = Math.max(0, a); r(0, 98, W, 52, '#0b0718ee'); r(0, 98, W, 1, '#36d6ff66'); r(0, 149, W, 1, '#36d6ff66');
        if (k > .5 && !S.bGo && Math.floor(T * 2) % 2 === 0) vtxt('Toca para continuar', 120, 139, '#8f86ad', 'center');
        vtxt('PATRÓN ' + (S.ri + 1) + ' DE ' + HPMAX, 120, 101, '#36d6ff', 'center'); vtxtBig(R().name, 120, 111, C.gold, 2, '#000'); vtxt(R().sub, 120, 127 + 0, '#ece8f6', 'center'); ctx.globalAlpha = 1; }
      if (laughing){ const a = Math.min(1, k * 5, (2.2 - k) * 4); ctx.globalAlpha = Math.max(0, a); r(0, 98, W, 40, '#0b0718cc'); vtxtBig('¡JAJAJA!', 120, 103, '#ff7ad9', 2, '#2a0820'); vtxt('Maito se rió y Mao se desconcentró', 120, 123, '#ece8f6', 'center'); ctx.globalAlpha = 1; }
      if (T - S.chorroT < 1.8){ const a = Math.min(1, (1.8 - (T - S.chorroT)) * 3); ctx.globalAlpha = a; vtxtBig('¡EL CHOOOORRO!', 120, 70, C.gold, 2, '#000'); vtxt('3 patrones seguidos: +1 vida', 120, 88, '#ece8f6', 'center', '#000'); ctx.globalAlpha = 1; }
      S.fx.forEach(f => { ctx.globalAlpha = Math.max(0, 1 - f.t/1.2); vtxt(f.s, f.x, f.y - f.t*10, f.col, 'center', '#000'); }); ctx.globalAlpha = 1;
      // ===== panel: secuenciador y tambores =====
      r(0, 252, W, H - 252, '#0b0718'); r(0, 252, W, 1, '#36d6ff55'); r(0, 253, W, 3, '#140d26');
      const CX = 10, CY = 262, CW = 220, CH = 66;
      r(CX + 1, CY, CW - 2, CH, '#2f3a5c'); r(CX, CY + 1, CW, CH - 2, '#2f3a5c'); r(CX + 1, CY + 1, CW - 2, CH - 2, '#111426'); r(CX + 2, CY + 1, CW - 4, 1, '#ffffff14');
      { const tab = 'SECUENCIADOR', tw = vWidth(tab) + 10; r(CX + 9, CY - 6, tw, 12, '#05030c'); r(CX + 10, CY - 5, tw - 2, 10, '#36d6ff'); r(CX + 10, CY - 5, tw - 2, 1, '#c8f4ff'); vtxt(tab, CX + 14, CY - 4, '#08202a'); }
      const chip = { banner:['PREPARA', '#6f6590'], prog:['IVÁN PROGRAMA', '#ff4d6d'], count:['TU TURNO EN…', C.gold], play:['¡TU TURNO!', '#3dff8a'], hit:['¡CLAVADO!', '#3dff8a'], fail:['FALLASTE', '#ff4d6d'], laugh:['¡MAITO!', '#ff7ad9'], end:['¡GANASTE!', C.gold] }[S.phase];
      { const cw = vWidth(chip[0]) + 10, cx = CX + CW - cw - 8; r(cx, CY - 6, cw, 12, '#05030c'); r(cx + 1, CY - 5, cw - 2, 10, '#171030'); r(cx + 1, CY - 5, 2, 10, chip[1]); vtxt(chip[0], cx + 6, CY - 4, chip[1]); }
      const GX = 56, cell = 19, gap = 2, sx = s => GX + s*(cell + gap) + (s >= 4 ? 3 : 0), ry = i => CY + 10 + i*15;
      ROWS.forEach((rw, i) => { pcirc(CX + 9, ry(i) + 5, 2, rw.col); vtxt(rw.lab === 'Platillo' ? 'Plat.' : rw.lab, CX + 14, ry(i) + 1, '#9a92b8'); });
      const pass = S.phase === 'play' ? Math.max(0, Math.floor(S.head / 8)) : 0, headCol = S.head >= 0 ? S.head % 8 : -1, showHead = S.phase === 'prog' || S.phase === 'play';
      if (showHead && headCol >= 0){ ctx.globalAlpha = .18; r(sx(headCol) - 1, CY + 8, cell + 2, 46, '#c8f4ff'); ctx.globalAlpha = 1; }
      for (let i=0;i<3;i++) for (let s=0;s<8;s++){
        const x = sx(s), y = ry(i), key = s + ':' + i, note = S.seq.find(n => n.s === s && n.r === i), col = ROWS[i].col;
        r(x, y, cell, 12, s % 2 ? '#1a1830' : '#1f1d3a'); r(x, y, cell, 1, '#ffffff10');
        const litT = S.lit[key] != null ? T - S.lit[key] : 9;
        if (S.phase === 'prog' && note && litT < 9){ ctx.globalAlpha = .55 + .45*Math.max(0, 1 - litT*3); r(x, y, cell, 12, col); r(x, y, cell, 1, '#ffffff88'); ctx.globalAlpha = 1; }
        else if ((S.phase === 'count' || S.phase === 'play') && note && ghost(note, pass)){ r(x, y, cell, 1, col); r(x, y + 11, cell, 1, col); r(x, y, 1, 12, col); r(x + cell - 1, y, 1, 12, col); }
        else if (S.phase === 'fail' && note){ ctx.globalAlpha = .6; r(x, y, cell, 12, col); ctx.globalAlpha = 1; }   // al fallar se muestra el patrón correcto
        const mk = S.marks[key];
        if (mk && mk.m !== 'miss'){ r(x, y, cell, 12, col); r(x, y, cell, 1, '#ffffffaa'); r(x + 6, y + 6, 2, 2, '#05030c'); r(x + 8, y + 7, 2, 2, '#05030c'); r(x + 10, y + 5, 2, 2, '#05030c'); r(x + 12, y + 3, 2, 2, '#05030c'); }
        else if (mk && mk.m === 'miss'){ r(x, y, cell, 12, '#3a0f1e'); vtxt('X', x + cell/2, y + 2, '#ff4d6d', 'center'); }
      }
      for (let s=0;s<8;s++) r(sx(s) + cell/2 - 1, CY + 56, 2, s % 2 ? 1 : 2, s % 2 ? '#3a3360' : '#6f6590');
      if (showHead && headCol >= 0){ const hx = sx(headCol) + cell/2; r(hx - 3, CY + 58, 7, 1, '#c8f4ff'); r(hx - 2, CY + 59, 5, 1, '#c8f4ff'); r(hx - 1, CY + 60, 3, 1, '#c8f4ff'); }
      if (S.phase === 'count'){ if (k < .8){ ctx.globalAlpha = Math.min(1, k * 5); vtxtBig('¿Listo?', 120, 104, '#3dff8a', 3, '#000'); ctx.globalAlpha = 1; } else { const n = Math.min(4, Math.floor((k - .8) / (R().sd*2)) + 1), ph = ((k - .8) / (R().sd*2)) % 1; ctx.globalAlpha = Math.max(.3, 1 - ph*.7); vtxtBig(String(n), 120, 104, C.gold, 3, '#000'); ctx.globalAlpha = 1; } }   // conteo musical: ¿Listo? 1, 2, 3, 4   // cuenta regresiva en el escenario (no tapa el patrón)
      if (loops() > 1 && S.phase === 'play') vtxt('Vuelta ' + (pass + 1) + '/2', CX + CW - 8, CY + 56, '#6f6590', 'right');
      // tambores de Mao
      ROWS.forEach((rw, i) => drumPad(50 + i*70, 364, rw.kind, { lab: rw.lab === 'Platillo' ? 'Plat.' : rw.lab, col: rw.col, since: S.padT[i], bad: S.padBad[i] > T, glow: S.phase === 'play' }));
      const help = { banner:'Lee el reto y toca para empezar', prog:'Mira y escucha el patrón de Iván', count:'Cuenta 1, 2, 3, 4 y entra tú', play: R().kind === 'copy' || R().kind === 'repeat' ? 'La segunda mitad repite la primera' : R().kind === 'loop' && pass === 1 ? 'Segunda vuelta: de memoria' : 'Toca cada golpe cuando el cabezal llegue', hit:'¡Le bajaste la batería a Iván!', fail:'Mira el patrón correcto y vuelve a intentarlo', laugh:'¡No mires a Maito!', end:'¡Iván se quedó sin batería!' }[S.phase];
      vtxt(help, 120, 404, S.phase === 'play' ? '#c8f4ff' : '#8a80a8', 'center');
    },
    tap(x, y){
      if (S.done) return;
      if (S.phase === 'banner'){ if (T - S.pt > .5 && !S.bGo) S.bGo = T; return; }
      if (y < 330) return;
      const i = Math.max(0, Math.min(2, Math.floor((x - 15) / 70)));
      ROWS[i].snd(); S.padT[i] = 0;
      if (S.phase !== 'play') return;
      const sd = R().sd, k = T - S.pt, win = Math.min(.16, sd * .5), notes = playNotes();
      let best = -1, bd = 9; notes.forEach((n, j) => { if (S.judged[j]) return; const d = Math.abs(k - n.s*sd); if (d < bd){ bd = d; best = j; } });
      if (best >= 0 && bd <= win && notes[best].r === i){ S.judged[best] = bd < win*.45 ? 'top' : 'ok'; S.marks[(notes[best].s % 8) + ':' + i] = { m:S.judged[best], t:T }; noteHit(); }
      else { S.errs++; S.padBad[i] = T + .3; tone(120, .08, 'square', .04); const step = Math.max(0, Math.min(8*loops() - 1, Math.round(k / sd))); S.marks[(step % 8) + ':' + i] = S.marks[(step % 8) + ':' + i] || { m:'miss', t:T };
        if (best >= 0 && bd <= win){ S.judged[best] = 'miss'; } }
    }
  };
}

// Inicio: Mao en su batería a la izquierda; Maito entra corriendo desde la derecha y se detiene frente a él
function sceneMaoArrive(){
  // la toma empieza a la derecha del bar: Maito entra corriendo y la cámara lo acompaña hasta llegar donde Mao
  const t0 = T, CAM = 293, X0 = CAM + 270, X1 = 168, D = 2.8, ease = u => 1 - Math.pow(1 - u, 2.2);
  return { update(){}, draw(){
    const u = Math.min(1, (T - t0)/D), mx = X0 + (X1 - X0)*ease(u), cam = Math.max(0, Math.min(CAM, mx - X1));
    drawStage({ cam }); CAST.mao(64 - cam, { kit:true });
    CAST.maito(mx - cam, u < 1 ? { anim:'corre_sin', flip:true } : { anim:'cowork' });
    drawCrowd(); drawHUD('NIVEL 4');
  }, tap(){} };
}
const L4 = {
  key:'mao', n:4, venue:'casa', fans:.4, ficha:true,
  barks:[['p_mao.jpg','MAO','Eso no es así madre'],['p_maito.jpg','MAITO','¡Forrillo, concéntrate!'],['p_maito.jpg','MAITO','¡Maolo, el ritmo!'],['p_cami.jpg','CAMI','¡RE PERRRO!']],
  intro:[
    { who:'narr', text:'9:40 p.m. Bar La Carcajada. Esta noche Mao pone el «ba-dum-tss» del stand-up. Maito llega corriendo.', fx(){ setStage(sceneMaoArrive()); } },
    { who:'mao', text:'¡Maitooo! Me invitaron a poner el ba-dum-tss del stand-up. Mira, ya voy por la mitad del show.', fx: idle([['mao',64,{anim:'habla'}],['maito',168,{anim:'cowork'}]]) },
    { who:'maito', text:'Mao, son las 9:40 p.m. Ricardo nos quiere a los cinco a las 11:00 p.m. Checho y Dave fueron por Cami.', fx: idle([['mao',64,{anim:'idle'}],['maito',168,{anim:'cowork'}]]) },
    { who:'mao', text:'Pero el comediante me abandonó. Dice que se le olvidó el final de todos los chistes.', fx: idle([['mao',64,{anim:'habla'}],['maito',168,{anim:'cowork'}]]) },
    { who:'maito', text:'Pues yo los remato. Tú ponle el ritmo y nos vamos.', fx: idle([['mao',64,{anim:'idle'}],['maito',168,{anim:'cowork'}]]) },
    { who:'mao', text:'Eso no es así madre… pero dale. jajaja', fx: idle([['mao',64,{anim:'habla'}],['maito',168,{anim:'cowork'}]]) }
  ],
  idle:[['mao',64,{anim:'idle'}],['maito',168,{anim:'cowork'}]],
  steps:[
    { id:'rimshot', clock:'9:42', music:'calm', scene:sceneRimshot, hint:'Tip: espera el remate y toca cuando se cierre el anillo de cada tambor, ni antes ni después.',
      before:[{ who:'narr', text:'RETO 1 · Ba-dum-tss. Maito cuenta un chiste; en el remate se encienden tres tambores: toca cuando se cierre el anillo de cada uno. Necesitas 3 chistes bien rematados.' }] },
    { id:'metro', clock:'9:45', music:'rock', scene:sceneMetro, hint:'Tip: no toques a lo loco: solo cuenta el toque que cae justo en el pulso, cuando el anillo se cierra.',
      before:[
        { who:'maito', text:'¡Buenas noches, La Carcajada! Y ahora… ¡el remate final!', fx: idle([['mao',64,{anim:'idle'}],['maito',168,{anim:'cuenta_chiste'}]]) },
        { who:'mao', text:'Ahora la música de salida… pero si sigues haciendo caras, Maito, no aguanto la risa.', fx: idle([['mao',64,{anim:'habla'}],['maito',168,{anim:'cowork'}]]) },
        { who:'narr', text:'RETO 2 · Aguanta la risa. Mao toca la música de salida y cada frase de Maito le infla una burbuja de risa. Revienta cada burbuja tocándola justo cuando su anillo verde se cierre. Son 3 rondas de 3 burbujas, cada una más rápida. Si una explota, Mao se ríe y pierdes una vida.' } ] },
    { id:'ivan', clock:'9:48', music:'metal', scene:sceneIvan, hint:'Tip: cuenta el patrón como una canción: bum, tas, bum-bum, tsss.',
      vs:{ boss:'ivan', flip:true, desc:'Iván programa un patrón de batería: escúchalo y repítelo sin fallar.', name:'IVÁN DRUM-MACHINE', cls:'PROGRAMADOR DE RITMOS', moves:['CUANTIZACIÓN','LOOP INFINITO','COPIAR Y PEGAR','200 BPM'] },
      before:[
        { who:'narr', text:'Se va la luz. Suena un «beep» electrónico… y alguien entra corriendo al escenario con una controladora MIDI.', fx(){ setStage(sceneIvanArrive()); } },
        { who:'ivan', text:'¿Batería de verdad? Qué tierno. Yo programo la secuencia y suena perfecta. Sin sudar, sin fallar, sin baquetas.', fx: idle([['mao',64,{anim:'idle'}],['maito',MAITO_BOSS_X,{anim:'cowork',flip:true}],['ivan',IVAN_X,{anim:'reta'}]], { label:'JEFE' }) },
        { who:'mao', text:'¿Perfecta? Sí, pero sin alma.', fx: idle([['mao',64,{anim:'habla'}],['maito',MAITO_BOSS_X,{anim:'cowork',flip:true}],['ivan',IVAN_X,{anim:'idle'}]], { label:'JEFE' }) },
        { who:'ivan', text:'El alma no cuadra con el BPM. Duelo: yo programo un patrón, tú lo repites. Si fallas una, me quedo con tu tarima.', fx: idle([['mao',64,{anim:'idle'}],['maito',MAITO_BOSS_X,{anim:'cowork',flip:true}],['ivan',IVAN_X,{anim:'reta'}]], { label:'JEFE' }) },
        { who:'maito', text:'¡Acaba con este forro, tenemos que irnos!', fx: idle([['mao',64,{anim:'idle'}],['maito',MAITO_BOSS_X,{anim:'cowork',flip:true}],['ivan',IVAN_X,{anim:'idle'}]], { label:'JEFE' }) },
        { who:'narr', text:'JEFE · Iván Drum-Machine. Iván programa un patrón en su secuenciador: mira y escucha. Luego el cabezal vuelve a pasar: toca Bombo, Caja o Platillo justo cuando llegue a cada golpe. Cada patrón que clavas le baja la batería. Son 6 patrones.', fx(){ setStage(sceneMaitoLeaves()); } } ] }
  ],
  outro:[
    { who:'narr', text:'La controladora de Iván echa humo. El bar entero se pone de pie.', fx(){ setStage(sceneIdle({ cast:[['mao',64,{anim:'celebra'}],['ivan',IVAN_X,{anim:'derrota'}]], party:true, label:'¡LISTO!' })); SFX.hey(); } },
    { who:'ivan', text:'Error 404… ritmo humano detectado… beep.' },
    { who:'mao', text:'¡El Choooorro!', fx: idle([['mao',64,{anim:'rie'}],['ivan',IVAN_X,{anim:'derrota'}]], { party:true, label:'¡LISTO!' }) },
    { who:'maito', text:'¡Listo, Forrillo! Checho y Dave ya están con Cami, pero al parecer el director no la quiere soltar. ¡Tenemos que irnos ya!', fx(){ setStage(sceneMaitoBack()); } },
    { who:'mao', text:'¡Al Kabbaret Móvil! Manejo yo, pero no me hagas reír, que nos estrellamos.', fx: idle([['mao',64,{anim:'habla'}],['maito',MAITO_MID,{anim:'cowork'}],['ivan',IVAN_X,{anim:'derrota'}]], { label:'¡LISTO!' }) },
    { who:'narr', text:'…', fx(){ dlg.hidden = true; dlgLock = true; setStage(sceneMaoRunsOut(() => { dlgLock = false; advance(); })); } }   // Mao sale corriendo, Maito lo alcanza y fundido
  ],
  mapSub:'¡MAO SE UNE! FALTA 1 · LA VOZ ESTA EN EL TEATRO'
};
