'use strict';
/* ===================== NIVEL 5 · CAMI · Teatro Libertad ===================== */
let camiRock = false, camiTip = '#2f6bff';

// JEFE 5: Mr. Feedback — lanza chillidos (bolas de ruido) hacia Cami. Tócalos para reventarlos antes de que la alcancen.
// Cada 6 chillidos reventados, Cami suelta un SHA NA NA que le pega a Mr. Feedback. 4 golpes y la consola echa humo.
const FB = { cami:64, fb:186 };
function sceneFeedback(){
  const PH = [ { gap:1.35, sp:44, big:0 }, { gap:1.05, sp:52, big:.15 }, { gap:.85, sp:60, big:.3 } ], NEED = 6, HITS = 4;
  const S = { hp:HITS, charge:0, orbs:[], parts:[], fx:[], spawn:1.2, hits:0, done:false, hitT:-9, blastT:-9, fbHitT:-9, phase:0 };
  if (window.DEV_HOOK) window.__fb = S;
  const say = (s, x, y, col) => S.fx.push({ s, x, y, col, t:0 });
  const burst = (x, y, cols, n=14) => { for (let i=0;i<n;i++){ const a = Math.random()*Math.PI*2, v = 30 + Math.random()*70; S.parts.push({ x, y, vx:Math.cos(a)*v, vy:Math.sin(a)*v - 20, t:0, c: cols[i % cols.length] }); } };
  return { label:'JEFE',
    update(dt){
      S.fx.forEach(f => f.t += dt); S.fx = S.fx.filter(f => f.t < 1.1);
      S.parts.forEach(p => { p.t += dt; p.x += p.vx*dt; p.y += p.vy*dt; p.vy += 90*dt; }); S.parts = S.parts.filter(p => p.t < .7);
      if (S.done) return;
      S.phase = S.hp >= 3 ? 0 : S.hp === 2 ? 1 : 2;
      const P = PH[S.phase];
      if (T - S.blastT > 1.2){ S.spawn -= dt; if (S.spawn <= 0){ const big = Math.random() < P.big; S.orbs.push({ x:FB.fb - 22, y0: 120 + Math.random()*70, t:0, amp: 10 + Math.random()*14, ph: Math.random()*6, hp: big ? 2 : 1, big, col: ['#ff4fd8','#36d6ff','#ffd34d'][Math.random()*3|0] }); S.spawn = P.gap; tone(1400 + Math.random()*500, .1, 'sawtooth', .012); } }
      for (const o of S.orbs){ o.t += dt; o.x -= P.sp * dt; o.y = o.y0 + Math.sin(o.t*3 + o.ph) * o.amp;
        if (o.x < FB.cami + 14 && !o.dead){ o.dead = true; S.hits++; S.hitT = T; shake = RM ? 0 : .2; tone(1900, .25, 'sawtooth', .03); burst(o.x, o.y, ['#ff4d6d','#ffffff']); say('¡IIIIII!', FB.cami, 104, '#ff4d6d');
          if (S.hits >= 3){ S.hits = 0; loseLife(['p_cami.jpg','CAMI','¡RE PERRRO! ¡Bájele a ese chillido!']); } } }
      S.orbs = S.orbs.filter(o => !o.dead);
      if (S.fire && T - S.blastT > 1.2){   // SHA NA NA: se dispara al tocar el botón cuando está cargado
        S.fire = false; S.charge = 0; S.blastT = T; S.hp--; S.fbHitT = T + .5; S.orbs.forEach(o => burst(o.x, o.y, [o.col, '#fff'], 6)); S.orbs = []; SFX.hey(); flash = .25; flashCol = C.gold; shake = RM ? 0 : .3;
        if (S.hp <= 0){ S.done = true; setTimeout(() => { win('¡LA CONSOLA\nECHA HUMO!'); setTimeout(stepDone, 2600); }, 900); }
      }
    },
    draw(){
      const k = T - S.blastT, blasting = k < 1.2;
      drawStage({ party: S.phase === 2 && !S.done });
      CAST.camir(FB.cami, { anim: k < 1.0 ? 'prueba' : k < 2.3 ? 'celebra' : T - S.hitT < .9 ? 'falla' : 'idle', flip:true });   // Cami mira a la derecha: canta el SHA NA NA, celebra; si le pega un chillido, falla
      drawFeedback(FB.fb, 228, { anim: S.done ? 'derrota' : T - S.fbHitT < 1.2 && T > S.fbHitT ? 'golpeado' : 'ataca' });
      if (T - S.fbHitT < .4 && T > S.fbHitT){ ctx.globalAlpha = (.4 - (T - S.fbHitT)) * 2; pcirc(FB.fb, 170, 34, '#ffffff'); ctx.globalAlpha = 1; }
      // chillidos: bolas de ruido con anillos que vibran
      for (const o of S.orbs){ const rr = o.big ? 13 : 9, x = Math.round(o.x), y = Math.round(o.y), wob = Math.sin(T*30 + o.ph) > 0 ? 1 : 0;
        ctx.globalAlpha = .25; pcirc(x + 8, y, rr - 3, o.col); ctx.globalAlpha = .12; pcirc(x + 16, y, rr - 5, o.col); ctx.globalAlpha = 1;   // estela
        pcirc(x, y, rr + 2 + wob, '#05030c'); pcirc(x, y, rr + 1, o.col); pcirc(x, y, rr - 2, '#1a0f2e');
        for (let i=0;i<3;i++){ const hh = [4, 8, 5][i] * (1 + .4*Math.sin(T*25 + i)); r(x - 4 + i*4, Math.round(y - hh/2), 2, Math.round(hh), o.col); }   // ondas de sonido adentro
        if (o.big && o.hp > 1){ ctx.globalAlpha = .6; dotRing(x, y, rr + 5, '#ffffff'); ctx.globalAlpha = 1; } }
      // SHA NA NA: ondas doradas que cruzan hacia Mr. Feedback
      if (blasting){ for (let i=0;i<4;i++){ const rr = 12 + k * 150 - i*18; if (rr > 0){ ctx.globalAlpha = Math.max(0, 1 - k) * .9; dotRing(FB.cami + 10, 162, rr, i % 2 ? '#fff1b0' : C.gold); } } ctx.globalAlpha = Math.min(1, (1.2 - k) * 3); vtxtBig('¡SHA NA NA!', 120, 78, C.gold, 2, '#000'); ctx.globalAlpha = 1; }
      S.parts.forEach(p => { ctx.globalAlpha = 1 - p.t / .7; r(Math.round(p.x), Math.round(p.y), 2, 2, p.c); }); ctx.globalAlpha = 1;
      if (T - S.hitT < .35){ ctx.globalAlpha = (.35 - (T - S.hitT)) * 1.6; r(0, 30, W, 206, '#ff4d6d'); ctx.globalAlpha = 1; }
      S.fx.forEach(f => { ctx.globalAlpha = Math.max(0, 1 - f.t / 1.1); vtxt(f.s, f.x, f.y - f.t*10, f.col, 'center', '#000'); }); ctx.globalAlpha = 1;
      drawCrowd(); drawHUD('JEFE');
      // encabezado: los 4 golpes que le faltan a Mr. Feedback
      r(0, 30, W, 18, '#0b0718cc'); r(0, 47, W, 1, '#ff4d6d33'); vtxt('Mr. Feedback', 8, 34, '#d8d2e8');
      for (let i=0;i<HITS;i++){ const x = 150 + i*21, on = i < S.hp; r(x, 35, 17, 8, '#05030c'); r(x + 1, 36, 15, 6, on ? '#ff4d6d' : '#2a2240'); if (on) r(x + 1, 36, 15, 1, '#ffb3c0'); }
      // ===== panel: dos parlantes y el botón SHA NA NA =====
      r(0, 252, W, H - 252, '#0b0718'); r(0, 252, W, 1, '#ffd34d55'); r(0, 253, W, 3, '#140d26');
      const full = S.charge >= NEED, pulse = full ? .5 + .5*Math.sin(T*8) : 0, thump = Math.max(0, 1 - (T - S.blastT) * 2);
      const speaker = (x) => { r(x, 268, 52, 120, '#05030c'); r(x + 2, 270, 48, 116, '#1c1830'); r(x + 2, 270, 48, 1, '#ffffff18'); for (let i=0;i<4;i++){ r(x + 6, 373 + i*3, 40, 1, '#2a2440'); }
        [[x + 26, 298, 15], [x + 26, 342, 19]].forEach(([cx, cy, rr]) => { const s = rr + Math.round(thump * 2); pcirc(cx, cy, s + 2, '#05030c'); pcirc(cx, cy, s, '#2f2a44'); pcirc(cx, cy, s - 4, '#15121f'); pcirc(cx, cy, Math.round(s * .35), full ? (pulse > .5 ? '#3a2604' : '#241c3d') : '#241c3d'); pcirc(cx - 2, cy - 2, 2, '#4a4366'); }); };
      speaker(8); speaker(180);
      // botón central con anillo de 6 notas
      { const cx = 120, cy = 318, R = 36;
        for (let i=0;i<NEED;i++){ const a0 = -Math.PI/2 + i * Math.PI*2/NEED + .12, a1 = a0 + Math.PI*2/NEED - .24, on = i < S.charge;
          ctx.fillStyle = on ? C.gold : '#2a2240'; for (let a = a0; a <= a1; a += .05){ ctx.fillRect(Math.round(cx + Math.cos(a)*R) - 2, Math.round(cy + Math.sin(a)*R) - 2, 4, 4); } }
        if (full){ ctx.globalAlpha = .25 + .2*pulse; pcirc(cx, cy, 33, C.gold); ctx.globalAlpha = 1; }
        pcirc(cx + 1, cy + 3, 27, '#000'); pcirc(cx, cy, 27, full ? '#7a5a12' : '#2f2448'); pcirc(cx, cy - 1, 25, full ? C.gold : '#4a3a6e'); pcirc(cx - 2, cy - 3, 19, full ? '#ffe08a' : '#5a4884');
        vtxt('SHA NA NA', cx, cy - 10, full ? '#3a2604' : '#c9c4d6', 'center'); vtxt(full ? '¡Toca!' : S.charge + '/' + NEED, cx, cy + 2, full ? '#3a2604' : '#ece8f6', 'center'); }
      vtxtw(full ? '¡Cami está lista! Toca el botón para cantar' : 'Revienta los chillidos tocándolos antes de que lleguen a Cami', 120, 366, 116, full ? C.gold : '#8a80a8', 'center');
    },
    tap(x, y){
      if (S.done) return;
      if (y > 270 && Math.hypot(x - 120, y - 318) < 40){ if (S.charge >= NEED && T - S.blastT > 1.2) S.fire = true; return; }   // botón SHA NA NA
      if (y > 250) return;
      let best = null, bd = 1e9;
      for (const o of S.orbs){ const d = Math.hypot(o.x - x, o.y - y); if (d < (o.big ? 24 : 20) && d < bd){ bd = d; best = o; } }
      if (!best) return;
      best.hp--; noteHit();
      if (best.hp > 0){ burst(best.x, best.y, ['#ffffff'], 6); best.big = false; say('¡Otra vez!', best.x, best.y - 16, '#ffffff'); return; }
      best.dead = true; S.orbs = S.orbs.filter(o => o !== best); burst(best.x, best.y, [best.col, '#ffffff']); tone(900, .05, 'square', .03); tone(1350, .05, 'square', .02, now() + .05);
      S.charge = Math.min(NEED, S.charge + 1); fans = Math.min(1, fans + .01); say('¡Pop!', best.x, best.y - 14, C.ok);
    },
    start(){ lifeStyle = 'hair'; }, stop(){ camiFails = 3 - lives; lifeStyle = 'skull'; }   // al terminar, el pelo se queda del color con que ganó
  };
}
// Mr. Feedback entra caminando desde la derecha
function sceneFeedbackEnters(){
  const t0 = T, D = 2.4;
  return { update(){}, draw(){
    const u = Math.min(1, (T - t0) / D), x = 280 + (FB.fb - 280) * u;
    drawStage(); CAST.camir(RX.cami, { flip:true }); drawFeedback(x, 228, { anim: u < 1 ? 'camina' : 'idle', flip:true }); drawCrowd(); drawHUD('NIVEL 5');
  }, tap(){} };
}
const fbIdle = (cami, fb, cx=RX.cami) => () => setStage({ update(){}, draw(){ drawStage(); CAST.camir(cx, cami); drawFeedback(FB.fb, 228, Object.assign({ flip:true }, fb)); drawCrowd(); drawHUD('NIVEL 5'); }, tap(){} });
// Final: Checho y Dave regresan corriendo con sus instrumentos; luego Maito (guitarra) y Mao (baquetas)
const BANDX = { maito:24, checho:68, cami:120, dave:170, mao:214 };   // de izquierda a derecha: Maito, Checho, Cami, Dave y Mao
function sceneBandArrives(stage2, done){
  const t0 = T, D = 1.3, e = u => 1 - Math.pow(1 - u, 2); let fin = false;
  const go = (x0, x1, d) => { const u = Math.max(0, Math.min(1, (T - t0 - d) / D)); return [x0 + (x1 - x0) * e(u), u < 1]; };
  return { update(){}, draw(){
    drawStage();
    let busy = false;
    if (!stage2){
      const [hx, hr] = go(-60, BANDX.checho, 0), [dx, dr] = go(-100, BANDX.dave, .15), [cx, cr] = go(FB.cami, BANDX.cami, 0), fx = FB.fb + 110 * Math.max(0, T - t0 - .2);
      if (fx < 300) drawFeedback(fx, 228, { anim:'sale', turn:false });   // Mr. Feedback se va derrotado por la derecha (el sprite «sale» ya camina hacia la derecha)
      CAST.camir(cx, cr ? { anim:'corre' } : {}); CAST.checho(hx, hr ? { anim:'corre' } : { anim:'idle' }); CAST.dave(dx, dr ? { anim:'corre' } : { anim:'idle_bajo', flip:true }); busy = hr || dr;
    } else {
      CAST.checho(BANDX.checho, { anim:'idle' }); CAST.dave(BANDX.dave, { anim:'idle_bajo', flip:true }); CAST.camir(BANDX.cami, {});
      const [mx, mr] = go(-60, BANDX.maito, 0), [ox, or] = go(300, BANDX.mao, .2);
      CAST.maito(mx, mr ? { anim:'corre' } : { anim:'idle' }); drawMao(ox, 228, or ? { anim:'corre', flip:true } : { anim:'depie', flip:true });   // Maito entra por la izquierda y Mao por la derecha   // Mao entra por la derecha con sus baquetas busy = mr || or;
    }
    drawCrowd(); drawHUD('¡LISTO!');
    if (!busy && T - t0 > D + .4 && !fin){ fin = true; done && done(); }
  }, tap(){}, stop(){ dlgLock = false; } };
}
const bandIdle = (all) => () => setStage({ update(){}, draw(){ drawStage(); CAST.checho(BANDX.checho, { anim:'idle' }); CAST.dave(BANDX.dave, { anim:'idle_bajo', flip:true }); CAST.camir(BANDX.cami, {});
  if (all){ CAST.maito(BANDX.maito, { anim:'idle' }); drawMao(BANDX.mao, 228, { anim:'depie', flip:true }); } drawCrowd(); drawHUD('¡LISTO!'); }, tap(){} });

// ===== Nivel 5 · Teatro de la Wind Orchestra Region (fondo panorámico, cámara y luz de seguimiento sobre Cami) =====
const TW = { chk:54, dav:84, cami:152, dir:206, dirC:548, camiC:466, CAMC:384, dirY:196, chkY:236, davY:220, camiY:218, dirY0:236 };   // en el backstage: Checho adelante, Dave y Cami más al fondo, el director adelante   // dirY: el director, en posición, queda más al fondo (frente a la orquesta)   // posiciones en el fondo (mundo)
function tDraw(cam, cast, cami, extra, beams){   // dibuja el teatro con la cámara en `cam` y la luz siguiendo a Cami (x de mundo)
  const bm = beams || [0, 0, 0];
  drawStage({ cam, spot: cami - cam, beams: bm, lateRight: true });   // sin luces sobre Cami hasta que empieza a caminar
  let lit = false; const right = () => { if (!lit){ lit = true; teatroBeam(cami - cam, cam, TEATRO_CENTER + 170, bm[2]); } };   // el haz derecho pasa por delante del director (él queda más al fondo)
  cast.slice().sort((a, b) => ((a[2] && a[2].y) || 228) - ((b[2] && b[2].y) || 228)).forEach(([k, x, o]) => { if (((o && o.y) || 228) >= 220) right(); if (x - cam > -70 && x - cam < W + 70) CAST[k](x - cam, o || {}); });
  right();
  if (extra) extra();
  drawCrowd(); drawHUD('NIVEL 5');
}
const tIdle = (cast, cam=0, cami=TW.cami, beams) => () => setStage({ update(){}, draw(){ tDraw(cam, cast, cami, null, beams); }, tap(){} });
// Checho y Dave llegan corriendo al backstage y encuentran a Cami hablando con el director
function sceneCamiArrive(){
  const t0 = T, D = 1.3, ease = u => 1 - Math.pow(1 - u, 2);
  return { update(){}, draw(){
    const u = Math.min(1, (T - t0) / D), cx = -70 + (TW.chk + 70) * ease(u), dx = -110 + (TW.dav + 110) * ease(Math.max(0, Math.min(1, (T - t0 - .15) / D)));
    tDraw(0, [['camig', TW.cami, { anim:'idle', y:TW.camiY }], ['director', TW.dir, { anim:'habla', y:TW.dirY0 }], ['checho', cx, u < 1 ? { anim:'corre_mexa', y:TW.chkY } : { anim:'casa', flip:true, y:TW.chkY }], ['dave', dx, u < 1 ? { anim:'corre2', y:TW.davY } : { anim:'idle2', y:TW.davY }]], TW.cami);
  }, tap(){} };
}
// el director camina al centro del escenario y se pone en posición; la cámara lo sigue
function sceneDirectorWalks(){
  const t0 = T, D = 2.8;
  return { update(){}, draw(){
    const u = Math.min(1, (T - t0) / D), x = TW.dir + (TW.dirC - TW.dir) * u, y = TW.dirY0 + (TW.dirY - TW.dirY0) * Math.max(0, (u - .45) / .55), cam = Math.max(0, Math.min(TW.CAMC, x - 150));   // al final sube hacia la orquesta
    tDraw(cam, [['checho', TW.chk, { anim:'casa', flip:true, y:TW.chkY }], ['dave', TW.dav, { anim:'idle2', y:TW.davY }], ['camig', TW.cami, { anim:'idle', y:TW.camiY }], ['director', x, u < 1 ? { anim:'camina', y } : { anim:'idle', y }]], TW.cami);
  }, tap(){} };
}
// la cámara vuelve a Cami: Checho y Dave la animan
function sceneBackToCami(){
  const t0 = T, D = 1.4, ease = u => u < .5 ? 2*u*u : 1 - Math.pow(-2*u + 2, 2)/2;
  return { update(){}, draw(){
    const u = Math.min(1, (T - t0) / D), cam = TW.CAMC * (1 - ease(u));
    tDraw(cam, [['checho', TW.chk, { anim:'anima_dave', y:TW.chkY }], ['dave', TW.dav, { anim:'anima', y:TW.davY }], ['camig', TW.cami, { anim:'idle', y:TW.camiY }], ['director', TW.dirC, { anim:'idle', y:TW.dirY }]], TW.cami);
  }, tap(){} };
}
// Cami camina hasta el director, que la espera; la cámara y la luz la siguen
function sceneCamiWalks(done){
  const t0 = T, D = 3.4; let fin = false;
  return { update(){}, draw(){
    const k = T - t0, u = Math.min(1, k / D), x = TW.cami + (TW.camiC - TW.cami) * u, cy = TW.camiY + (228 - TW.camiY) * u, cam = TW.CAMC * u;   // la cámara avanza con ella, sin saltos
    tDraw(cam, [['checho', TW.chk, { anim:'casa', flip:true, y:TW.chkY }], ['dave', TW.dav, { anim:'idle2', y:TW.davY }], ['director', TW.dirC, { anim: k > D + .2 ? 'dirige' : 'idle', y:TW.dirY }], ['camig', x, u < 1 ? { anim:'camina', y: cy } : { anim:'idle' }]], x, null, [Math.min(1, k / .5), Math.max(0, Math.min(1, (u - .45) / .15)), Math.max(0, Math.min(1, (u - .72) / .15))]);   // al acercarse se encienden la luz izquierda y luego la derecha
    if (k > D + .8 && !fin){ fin = true; done && done(); }
  }, tap(){} };
}
// Al terminar de cantar: Cami gira en el aire y se transforma en su versión rockera; queda en el piso con el aura (cuadros 7-8-9) 2 segundos
function sceneCamiTransform(done){
  const t0 = T, F = .13; let fired = false, fin = false;   // F: segundos por cuadro (salto rápido)
  return { update(){}, draw(){
    const k = T - t0;
    if (k > .25 && !fired){ fired = true; camiRock = true; SFX.unlock(); flash = .5; flashCol = '#9fd8ff'; shake = RM ? 0 : .35; vibrate(120); setMood(1, 3); }
    const p = Math.max(0, Math.min(1, (k - .25) / (9*F))), hop = Math.round(Math.sin(p * Math.PI) * 12), landed = k >= .25 + 9*F;   // ligero salto durante la transformación
    const cami = k < .25 ? ['camig', TW.camiC, { anim:'idle' }] : ['camir', TW.camiC, !landed ? { frame: Math.floor((k - .25) / F), y: 228 - hop } : { anim:'idle', flip:true }];   // al aterrizar: idle rockera mirando a la derecha
    tDraw(TW.CAMC, [['director', TW.dirC, landed ? { anim:'wow', y:TW.dirY, flip:true } : { anim:'idle', y:TW.dirY }], cami], TW.camiC, () => {
      if (k < .3){ ctx.globalAlpha = k / .3 * .8; r(0, 30, W, 206, '#ffffff'); ctx.globalAlpha = 1; }   // destello: gira en el aire
    }, [1, 1, 1]);
    if (k > .25 + 9*F + .8 && !fin){ fin = true; done && done(); }   // un instante en idle rockera
  }, tap(){} };
}
// Cami corre hacia los muchachos (la cámara la sigue de vuelta al backstage)
function sceneCamiToBoys(done){
  const t0 = T, X1 = 150, D = 2.4; let fin = false;
  return { update(){}, draw(){
    const k = T - t0, u = Math.min(1, k / D), x = TW.camiC + (X1 - TW.camiC) * u, cy = 228 + (TW.camiY - 228) * u, cam = TW.CAMC * (1 - u), a = Math.max(0, Math.min(1, (x - 260) / 120));
    tDraw(cam, [['checho', TW.chk, { anim:'casa', flip:true, y:TW.chkY }], ['dave', TW.dav, { anim:'idle2', y:TW.davY }], ['director', TW.dirC, { anim:'wow', y:TW.dirY, flip:true }], ['camir', x, u < 1 ? { anim:'corre', flip:true, y:cy } : { y:cy }]], x, null, [a, a, a]);
    if (k > D + .2 && !fin){ fin = true; done && done(); }
  }, tap(){} };
}
// Cami sale corriendo por la izquierda y los muchachos corren tras ella; fundido
function sceneRunOutLeft(done){
  const t0 = T; let fin = false;
  return { update(){}, draw(){
    const k = T - t0, cx = 150 - 170 * k, hx = TW.chk - 160 * Math.max(0, k - .5), dx = TW.dav - 160 * Math.max(0, k - .65);
    tDraw(0, [['camir', cx, { anim:'corre', flip:true, y:TW.camiY }], ['checho', hx, k > .5 ? { anim:'corre_mexa', flip:true, y:TW.chkY } : { anim:'casa', flip:true, y:TW.chkY }], ['dave', dx, k > .65 ? { anim:'corre2', flip:true, y:TW.davY } : { anim:'idle2', y:TW.davY }]], -999);
    if (dx < -10){ const f = Math.min(1, (-10 - dx) / 60); ctx.globalAlpha = f; r(0, 0, W, H, '#000'); ctx.globalAlpha = 1; if (f >= 1 && !fin){ fin = true; done && done(); } }
  }, tap(){}, stop(){ dlgLock = false; } };
}
// ===== Rock Express: llegan Cami, Checho y Dave corriendo (ella en el centro); ellos se van y Cami hace la prueba de sonido =====
const RX = { chk:66, cami:120, dav:176 };
const rxIdle = (cast) => () => setStage({ update(){}, draw(){ drawStage(); cast.forEach(([k, x, o]) => CAST[k](x, o || {})); drawCrowd(); drawHUD('NIVEL 5'); }, tap(){} });
function sceneRockArrive(){
  const t0 = T, D = 1.4, e = u => 1 - Math.pow(1 - u, 2), go = (x1, d) => { const u = Math.max(0, Math.min(1, (T - t0 - d) / D)); return [-70 + (x1 + 70) * e(u), u < 1]; };
  return { update(){}, draw(){
    drawStage();
    const [hx, hr] = go(RX.chk, .25), [cx, cr] = go(RX.cami, 0), [dx, dr] = go(RX.dav, .1);
    CAST.checho(hx, hr ? { anim:'corre_mexa' } : { anim:'casa', flip:true });   // Checho mira a la derecha, hacia Cami
    CAST.camir(cx, cr ? { anim:'corre' } : {}); CAST.dave(dx, dr ? { anim:'corre2' } : { anim:'idle2', flip:true });
    drawCrowd(); drawHUD('NIVEL 5');
  }, tap(){} };
}
function sceneBoysLeave(done){
  const t0 = T; let fin = false;
  return { update(){}, draw(){
    const k = T - t0, hx = RX.chk + 190 * Math.max(0, k - .15), dx = RX.dav + 190 * k;
    drawStage(); CAST.camir(RX.cami, {});
    if (hx < 300) CAST.checho(hx, { anim:'corre_mexa' }); if (dx < 300) CAST.dave(dx, { anim:'corre2' });
    drawCrowd(); drawHUD('NIVEL 5');
    if (hx > 290 && !fin){ fin = true; done && done(); }
  }, tap(){}, stop(){ dlgLock = false; } };
}
// RETO 2 · ¿Cuál es mi canal?: Cami canta su prueba; en la consola todos los medidores saltan, pero solo uno sigue el ritmo de su voz
let CAMI_CH = 0;
function sceneChannel(){
  const VOICE = [   // [texto, sílabas [inicio, duración] dentro de un ciclo de L segundos]
    { L:2.4, words:['Uno,', 'dos,', 'pro-', 'ban-', 'do'], syl:[[0,.3],[.5,.3],[1.0,.16],[1.2,.16],[1.4,.4]] },
    { L:2.2, words:['¿Me', 'es-', 'cu-', 'chan?'], syl:[[0,.18],[.35,.18],[.6,.18],[.85,.5]] },
    { L:2.0, words:['Sha', 'na', 'na', 'na', 'na!'], syl:[[0,.14],[.25,.14],[.5,.14],[.75,.14],[1.0,.45]] } ];
  const ROUNDS = [{ n:4 }, { n:5 }, { n:6 }];
  const S = { r:0, t:0, order:[], decoy:[], picked:-1, pickT:-9, phase:'play', fails:0, done:false, fx:[], lastSyl:-1 };
  CAMI_CH = 0;
  if (window.DEV_HOOK) window.__ch = S;
  const env = (syl, L, t, off=0) => { const u = ((t + off) % L + L) % L; for (const [a, d] of syl){ if (u >= a && u < a + d) return 1 - .35 * (u - a) / d; if (u >= a + d && u < a + d + .12) return .65 * (1 - (u - a - d) / .12); } return 0; };
  function setup(){
    const R = ROUNDS[S.r], v = VOICE[S.r]; S.t = 0; S.picked = -1; S.phase = 'play'; S.lastSyl = -1;
    S.target = Math.random() * R.n | 0;
    // canales señuelo: otros ritmos (bombo, guitarra, desfases de la misma voz en las rondas difíciles)
    S.decoy = [];
    for (let i=0;i<R.n;i++){
      const kind = i === S.target ? 'voz' : ['bombo','guitarra','ruido','eco'][(i + S.r) % (S.r === 0 ? 3 : 4)];
      let syl, L = v.L, off = 0;
      if (kind === 'voz') syl = v.syl;
      else if (kind === 'bombo') syl = [[0,.12],[.6,.12],[1.2,.12],[1.8,.12]];
      else if (kind === 'guitarra') syl = [[.1,.5],[.9,.25],[1.3,.5]];
      else if (kind === 'eco'){ syl = v.syl; off = -.35 - Math.random()*.2; }   // la misma frase pero desfasada: solo en rondas 2 y 3
      else syl = null;
      S.decoy.push({ kind, syl, L, off, ph: Math.random()*9 });
    }
  }
  setup();
  const level = (c, t) => c.kind === 'ruido' ? .35 + .25 * Math.sin(t*7 + c.ph) * Math.sin(t*2.3 + c.ph) : Math.min(1, env(c.syl, c.L, t, c.off) * .9 + .06 * Math.sin(t*23 + c.ph));
  return { label:'RETO 2/3',
    update(dt){
      if (S.done) return;
      S.t += dt; S.fx.forEach(f => f.t += dt); S.fx = S.fx.filter(f => f.t < 1.2);
      const v = VOICE[Math.min(S.r, VOICE.length - 1)], u = S.t % v.L, si = v.syl.findIndex(([a, d]) => u >= a && u < a + d);
      if (si >= 0 && si !== S.lastSyl && S.phase === 'play'){ tone(392 + si*60, v.syl[si][1] + .05, 'triangle', .05); }
      S.lastSyl = si;
      if (S.phase === 'ok' && T - S.pickT > 1.4){ S.r++; if (S.r >= ROUNDS.length){ S.done = true; win('¡SE ESCUCHA!'); setTimeout(stepDone, 1000); } else setup(); }
      if (S.phase === 'bad' && T - S.pickT > .9){ S.phase = 'play'; S.picked = -1; }
    },
    draw(){
      drawStage(); CAST.camir(RX.cami, { anim: S.phase === 'bad' ? 'falla' : 'prueba' }); drawCrowd(); drawHUD(this.label);
      const v = VOICE[Math.min(S.r, VOICE.length - 1)], u = S.t % v.L, si = v.syl.findIndex(([a, d]) => u >= a && u < a + d);
      // globo con la letra de la prueba: se ilumina la sílaba que canta
      { const words = v.words, ws = words.map(w => vWidth(w)), gap = i => words[i].endsWith('-') ? 1 : 5, tw = ws.reduce((a, b) => a + b, 0) + words.slice(0, -1).reduce((s, w, i) => s + gap(i), 0) + 16, bx = Math.round(120 - tw/2), by = 108;   // globo sobre la cabeza de Cami
        r(bx + 1, by, tw - 2, 18, '#05030c'); r(bx, by + 1, tw, 16, '#05030c'); r(bx + 1, by + 1, tw - 2, 16, '#171030'); r(bx + 1, by + 1, 2, 16, C.gold);
        r(117, by + 18, 6, 2, '#05030c'); r(119, by + 18, 2, 1, '#171030'); r(120, by + 20, 2, 2, '#05030c');
        let x = bx + 9; words.forEach((w, i) => { vtxt(w, x, by + 5, i === si ? C.gold : '#6f6590', 'left', i === si ? '#000' : null); x += ws[i] + gap(i); }); }
      S.fx.forEach(f => { ctx.globalAlpha = Math.max(0, 1 - f.t / 1.2); vtxt(f.s, 120, 94 - f.t*10, f.col, 'center', '#000'); }); ctx.globalAlpha = 1;
      // encabezado
      r(0, 30, W, 18, '#0b0718cc'); r(0, 47, W, 1, '#ffd34d33'); vtxt('Prueba de sonido', 8, 34, '#d8d2e8'); vtxt('Ronda ' + Math.min(3, S.r + 1) + '/3', 232, 34, C.gold, 'right');
      // ===== panel: consola =====
      r(0, 252, W, H - 252, '#0b0718'); r(0, 252, W, 1, '#ffd34d55'); r(0, 253, W, 3, '#140d26');
      const CX = 10, CY = 262, CW = 220, CH = 132;
      r(CX + 1, CY, CW - 2, CH, '#2f3a5c'); r(CX, CY + 1, CW, CH - 2, '#2f3a5c'); r(CX + 1, CY + 1, CW - 2, CH - 2, '#111426'); r(CX + 2, CY + 1, CW - 4, 1, '#ffffff14');
      { const tab = 'CONSOLA', tw = vWidth(tab) + 10; r(CX + 9, CY - 6, tw, 12, '#05030c'); r(CX + 10, CY - 5, tw - 2, 10, '#36d6ff'); r(CX + 10, CY - 5, tw - 2, 1, '#c8f4ff'); vtxt(tab, CX + 14, CY - 4, '#08202a'); }
      const n = S.decoy.length, sw = Math.floor((CW - 16) / n);
      S.decoy.forEach((c, i) => {
        const x0 = CX + 8 + i*sw, cx = x0 + sw/2, lv = level(c, S.t), sel = S.picked === i, okSel = sel && S.phase === 'ok', badSel = sel && S.phase === 'bad';
        r(x0 + 1, CY + 8, sw - 2, CH - 14, okSel ? '#123a28' : badSel ? '#3a0f1e' : '#171a30');
        vtxt('CH ' + (i + 1), cx, CY + 11, okSel ? '#3dff8a' : '#9a92b8', 'center');
        // medidor de 12 segmentos
        const segs = 12, on = Math.round(lv * segs);
        for (let s=0;s<segs;s++){ const y = CY + 82 - s*5, c2 = s < 7 ? '#3dff8a' : s < 10 ? C.gold : '#ff4d6d'; r(cx - 5, y, 10, 4, s < on ? c2 : '#22263c'); if (s < on) r(cx - 5, y, 10, 1, '#ffffff55'); }
        // fader
        r(cx - 1, CY + 92, 2, 30, '#05030c'); const fy = sel && S.phase !== 'bad' ? CY + 92 : CY + 116;
        r(cx - 7, fy, 14, 6, okSel ? '#3dff8a' : '#c9cde0'); r(cx - 7, fy, 14, 1, '#ffffff'); r(cx - 7, fy + 3, 14, 1, '#5d6179');
        if (okSel) vtxt('VOZ', cx, CY + 22, C.gold, 'center', '#000');
      });
      vtxtw(S.phase === 'ok' ? '¡Ese es el canal de Cami!' : 'Mira los medidores: toca el canal que salta al ritmo de la voz de Cami', 120, 400, 216, S.phase === 'ok' ? '#3dff8a' : '#8a80a8', 'center');
    },
    start(){ lifeStyle = 'hair'; }, stop(){ camiFails = 3 - lives; lifeStyle = 'skull'; },
    tap(x, y){
      if (S.done || S.phase !== 'play' || y < 262 || y > 394) return;
      const n = S.decoy.length, sw = Math.floor((220 - 16) / n), i = Math.floor((x - 18) / sw);
      if (i < 0 || i >= n) return;
      S.picked = i; S.pickT = T;
      if (i === S.target){ S.phase = 'ok'; CAMI_CH++; SFX.ok(); fans = Math.min(1, fans + .03); S.fx.push({ s:'¡Esa es mi voz!', col:'#3dff8a', t:0 }); }
      else { S.phase = 'bad'; S.fails++; tone(1800, .25, 'sawtooth', .03); shake = RM ? 0 : .15; S.fx.push({ s:'¡Ese no es! (' + ({ bombo:'el bombo', guitarra:'la guitarra', ruido:'puro ruido', eco:'un eco' }[S.decoy[i].kind]) + ')', col:'#ff4d6d', t:0 });
        if (S.fails % 2 === 0){ loseLife(['p_cami.jpg','CAMI','¡RE PERRRO! No me escucho']); } }
    }
  };
}
// RETO 1 · Nota sostenida: las notas de la partitura cruzan la línea dorada; mantén presionado mientras pasan y suelta al final
let CAMI_NOTES = 0;
function sceneSustain(){
  // «O mio babbino caro» (Puccini, 1918, dominio público): la melodía de la voz en corcheas a ♪ = 120.
  // Primera frase (compases 5 a 9, hasta «Porta», sostenida) y su respuesta («a comperar l'anello! Sì, sì, ci voglio andare!»), que cierra en La♭ con calderón.
  const E = .5, START = 3, MEL = [   // [inicio en corcheas, duración en corcheas, nota MIDI]
    [0,1,68],[1,1,68],[2,1,68],[3,2,72],[5,1,67],      // O mio bab-bi-no
    [6,3,65],[9,3,63],                                  // ca-ro
    [12,1,68],[13,1,70],[14,1,72],[15,2,68],[17,1,80],  // mi pia-ce, è bel-
    [18,3,75],[21,2,75],[23,1,72],                      // -lo, bel-lo; vo'an-
    [24,2,75],[26,1,70],[27,2,73],[29,6,72],            // -da-re in Por-ta (sostenida)
    [36,1,75],[37,1,73],[38,1,72],[39,2,70],[41,1,68],  // a com-pe-rar l'a-
    [42,3,70],[45,3,68],                                // -nel-lo!
    [48,2,72],[50,1,75],[51,1,77],[52,2,80],[54,1,77],  // Sì, sì, ci vo-glio
    [55,2,75],[57,1,70],[58,6,68] ];                    // an-da-re! (sostenida final)
  const SONG = MEL.map(([a, b, m]) => [START + a*E, b*E - .1, m]);
  const mfreq = m => 440 * Math.pow(2, (m - 69) / 12);
  const Ab = [44,48,51], Db = [49,53,56], Eb7 = [39,43,46,49], Fm = [41,44,48];
  const BARS = [Ab, Db, Ab, Ab, Eb7, Ab, Db, Eb7, Fm, Eb7, Ab], CHORDS = [Ab].concat(BARS);   // un acorde por compás (6 corcheas); CHORDS empieza con la entrada del piano
  const PRESS = .2, REL = .25, LINE = 46, PPS = 50, LAST = MEL[MEL.length - 1], END = START + (LAST[0] + LAST[1])*E + 1.4;
  // orquesta de fondo (sintetizada aquí mismo): cuerdas suaves con el acorde de cada compás y la melodía tocada muy bajito por una flauta
  function pad(ch, d){ if (!AC) return; const t = AC.currentTime; ch.forEach(m => { [0, 4].forEach(det => { const o = AC.createOscillator(), g = AC.createGain(); o.type = 'triangle'; o.frequency.value = mfreq(m + 12); o.detune.value = det - 2;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.012, t + .5); g.gain.setValueAtTime(.012, t + d - .5); g.gain.linearRampToValueAtTime(0, t + d + .2); o.connect(g); g.connect(master); o.start(t); o.stop(t + d + .3); }); }); }
  function flute(m, d){ if (!AC) return; const t = AC.currentTime, o = AC.createOscillator(), lfo = AC.createOscillator(), lg = AC.createGain(), g = AC.createGain();
    o.type = 'sine'; o.frequency.value = mfreq(m + 12); lfo.frequency.value = 5; lg.gain.value = mfreq(m + 12) * .006; lfo.connect(lg); lg.connect(o.frequency);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.022, t + .06); g.gain.setValueAtTime(.022, t + Math.max(.07, d - .08)); g.gain.linearRampToValueAtTime(0, t + d + .05);
    o.connect(g); g.connect(master); o.start(t); lfo.start(t); o.stop(t + d + .1); lfo.stop(t + d + .1); }
  const S = { t:-.6, arp:-1, bar:-1, fl:0, notes: SONG.map(([t, d, p], i) => ({ t, d, p, i, st:'wait' })), holding:false, cur:null, errs:0, fx:[], done:false, osc:null, errT:-9, pressT:-9 };
  CAMI_NOTES = 0;
  if (window.DEV_HOOK) window.__sus = S;
  const say = (s, col) => S.fx.push({ s, col, t:0 });
  function voiceOn(p){ if (!AC) return; voiceOff(); const o = AC.createOscillator(), lfo = AC.createOscillator(), lg = AC.createGain(), g = AC.createGain(), t = AC.currentTime;
    o.type = 'triangle'; o.frequency.value = mfreq(p); lfo.frequency.value = 5.5; lg.gain.value = mfreq(p) * .012; lfo.connect(lg); lg.connect(o.frequency);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.09, t + .08); o.connect(g); g.connect(master); o.start(t); lfo.start(t); S.osc = { o, lfo, g }; }
  function voiceOff(){ if (!S.osc || !AC) return; const { o, lfo, g } = S.osc, t = AC.currentTime; g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(g.gain.value, t); g.gain.linearRampToValueAtTime(0, t + .12); o.stop(t + .15); lfo.stop(t + .15); S.osc = null; }
  function err(msg){ S.errs++; S.errT = T; voiceOff(); tone(170, .18, 'sawtooth', .04); flash = .06; flashCol = '#ff4d6d'; say(msg, '#ff4d6d');
    if (S.errs % 3 === 0) loseLife(['p_cami.jpg','CAMI','Sha na na na na na na na… ¡aaahg!']); }
  function good(n, msg){ n.st = 'ok'; CAMI_NOTES++; stats.notes++; fans = Math.min(1, fans + .015); say(msg, C.ok); }
  return { label:'RETO 1/3',
    update(dt){
      if (S.done) return;
      S.t += dt; S.fx.forEach(f => f.t += dt); S.fx = S.fx.filter(f => f.t < 1.1);
      { const k = Math.floor(S.t / E); if (k > S.arp && S.t >= 0 && S.t < END - 1){ S.arp = k; const ch = CHORDS[Math.min(CHORDS.length - 1, Math.floor(k / 6))], pat = [0, 1, 2, 3, 2, 1], m = ch[pat[k % 6] % ch.length] + (pat[k % 6] >= ch.length ? 12 : 0); tone(mfreq(m), .45, 'triangle', k % 6 === 0 ? .035 : .022); } }   // arpegio suave del piano
      { const b = Math.floor((S.t - START) / (6*E)); if (S.t >= START && b > S.bar && b < BARS.length){ S.bar = b; pad(BARS[b], 6*E); } }   // cuerdas
      while (S.fl < SONG.length && S.t >= SONG[S.fl][0]){ const [, d, m] = SONG[S.fl++]; flute(m, d); }   // la melodía, bajito, de guía
      for (const n of S.notes){
        if (n.st === 'wait' && S.t > n.t + PRESS){ n.st = 'miss'; err('¡Se le pasó la entrada!'); }
        if (n.st === 'hold'){
          if (!S.holding){ if (S.t < n.t + n.d - REL){ n.st = 'bad'; err('¡Soltó muy pronto!'); } else good(n, '¡Afinadísima!'); S.cur = null; }
          else if (S.t > n.t + n.d + REL){ n.st = 'bad'; S.cur = null; err('¡Una nota de más!'); }
        }
      }
      if (S.t > END && !S.notes.some(n => n.st === 'hold')){ S.done = true; voiceOff(); win('¡BRAVO, CAMI!'); setTimeout(stepDone, 2800); }   // se alcanza a ver a Cami celebrando
    },
    draw(){
      const singing = S.holding && S.cur, cam = TW.CAMC;
      const camiAnim = S.done ? 'celebra' : T - S.errT < .9 ? 'falla' : singing ? ((Math.floor((S.cur.t - START) / (6*E)) % 2 === 0) === (S.t - S.cur.t < S.cur.d / 2 || S.cur.d < 1.2) ? 'canta' : 'ojos') : 'idle';   // alterna entre cantar y cerrar los ojos: cambia por compás y en la mitad de las notas largas
      tDraw(cam, [['director', TW.dirC, { anim: S.done ? 'idle' : 'dirige', y:TW.dirY }], ['camig', TW.camiC, { anim: camiAnim }]], TW.camiC, () => {
        if (T - S.errT < .35){ ctx.globalAlpha = (.35 - (T - S.errT)) * 2; r(0, 30, W, 206, '#ff4d6d'); ctx.globalAlpha = 1; }
        if (singing){ for (let i=0;i<3;i++){ const ph = (T*.8 + i/3) % 1; ctx.globalAlpha = 1 - ph; vtxt('♪', TW.camiC - cam + 14 + Math.sin(ph*6 + i)*6, 150 - ph*40, C.gold); } ctx.globalAlpha = 1; }
        S.fx.forEach(f => { ctx.globalAlpha = Math.max(0, 1 - f.t / 1.1); vtxt(f.s, 120, 64 - f.t*10, f.col, 'center', '#000'); }); ctx.globalAlpha = 1;
      }, [1, 1, 1]);
      // encabezado: título y avance de la canción
      r(0, 30, W, 18, '#0b0718cc'); r(0, 47, W, 1, '#ffd34d33'); vtxt('Nota sostenida', 8, 34, '#d8d2e8');
      { const x0 = 138, w = 94, pr = Math.max(0, Math.min(1, S.t / END)); r(x0 - 9, 34, 2, 6, C.gold); r(x0 - 11, 39, 3, 2, C.gold); r(x0 - 8, 34, 3, 1, C.gold);
        r(x0, 37, w, 4, '#2a2240'); r(x0, 37, Math.round(w * pr), 4, C.gold); r(x0, 37, Math.round(w * pr), 1, '#fff1b0'); }
      // ===== panel: partitura =====
      r(0, 252, W, H - 252, '#0b0718'); r(0, 252, W, 1, '#ffd34d55'); r(0, 253, W, 3, '#140d26');
      const CX = 10, CY = 262, CW = 220, CH = 68;
      r(CX + 1, CY, CW - 2, CH, '#4a3a2a'); r(CX, CY + 1, CW, CH - 2, '#4a3a2a'); r(CX + 1, CY + 1, CW - 2, CH - 2, '#1a1222'); r(CX + 2, CY + 1, CW - 4, 1, '#ffffff14');
      { const tab = 'PARTITURA', tw = vWidth(tab) + 10; r(CX + 9, CY - 6, tw, 12, '#05030c'); r(CX + 10, CY - 5, tw - 2, 10, C.gold); r(CX + 10, CY - 5, tw - 2, 1, '#fff1b0'); vtxt(tab, CX + 14, CY - 4, '#1a1030'); }
      const py = m => Math.round(CY + 57 - (m - 63) * 2.7);   // altura de cada nota según su altura real (Mi♭4 abajo, La♭5 arriba)
      for (let i=0;i<5;i++) r(CX + 6, CY + 14 + i*8, CW - 12, 1, '#3a2f4a');
      // clave de sol (pixel)
      { const gx = CX + 12, gy = CY + 10; ['..##.','.#..#','.#.#.','..#..','.#.#.','#..##','#.#.#','.###.','..#..','.##..'].forEach((row, j) => { for (let i=0;i<row.length;i++) if (row[i] === '#') r(gx + i*2, gy + j*4, 2, 4, '#c9a96a'); }); }
      // notas
      ctx.save(); ctx.beginPath(); ctx.rect(CX + 2, CY + 2, CW - 4, CH - 4); ctx.clip();
      for (const n of S.notes){
        const x0 = CX + LINE + (n.t - S.t) * PPS, x1 = x0 + n.d * PPS, y = py(n.p); if (x1 < CX || x0 > CX + CW) continue;
        const col = n.st === 'ok' ? '#3dd68c' : n.st === 'bad' || n.st === 'miss' ? '#ff4d6d' : n.st === 'hold' ? C.gold : '#efe6d2';
        ctx.globalAlpha = n.st === 'ok' || n.st === 'bad' || n.st === 'miss' ? .45 : 1;
        r(Math.round(x0) + 1, y - 3, Math.round(x1 - x0) - 2, 7, '#05030c'); r(Math.round(x0), y - 2, Math.round(x1 - x0), 5, '#05030c');
        r(Math.round(x0) + 1, y - 2, Math.round(x1 - x0) - 2, 5, col); r(Math.round(x0) + 2, y - 2, Math.round(x1 - x0) - 4, 1, '#ffffff66');
        if (n.st === 'hold'){ const fill = Math.min(x1, CX + LINE) - x0; if (fill > 0){ r(Math.round(x0) + 1, y - 2, Math.round(fill), 5, '#fff1b0'); } }
        pcirc(Math.round(x0) + 3, y, 3, n.st === 'wait' || n.st === 'hold' ? '#ffffff' : col);   // cabeza de la nota
        ctx.globalAlpha = 1;
      }
      ctx.restore();
      // línea dorada (donde canta Cami)
      { const lx = CX + LINE; ctx.globalAlpha = singing ? .35 + .2*Math.sin(T*10) : .18; r(lx - 3, CY + 6, 7, CH - 12, C.gold); ctx.globalAlpha = 1; r(lx, CY + 6, 1, CH - 12, '#fff1b0'); r(lx - 2, CY + 4, 5, 2, C.gold); r(lx - 2, CY + CH - 6, 5, 2, C.gold); }
      // botón MANTÉN, notas y desafinadas
      const bx = 120, by = 365, pressed = S.holding;
      pcirc(bx + 1, by + 3, 22, '#000'); pcirc(bx, by, 22, pressed ? '#7a5a12' : '#2f2448'); pcirc(bx, by - 1, 20, pressed ? C.gold : '#4a3a6e'); pcirc(bx - 1, by - 2, 16, pressed ? '#ffe08a' : '#5a4884');
      if (pressed){ ctx.globalAlpha = .25 + .15*Math.sin(T*10); dotRing(bx, by, 26, C.gold); ctx.globalAlpha = 1; }
      vtxt(pressed ? 'Canta' : 'Mantén', bx, by - 5, pressed ? '#3a2604' : '#ece8f6', 'center', pressed ? null : '#000');
      vtxt('Notas', 14, 350, '#8a80a8'); vtxt(CAMI_NOTES + '/' + SONG.length, 14, 362, '#ece8f6');
      vtxt('Desafinadas', 226, 350, '#8a80a8', 'right');
      for (let i=0;i<3;i++){ const x = 192 + i*12, used = (S.errs % 3) > i; vtxt('♪', x + 4, 361, used ? '#ff4d6d' : '#3a3158', 'center'); }
      vtxtw('Mantén presionado mientras la nota cruza la línea dorada y suelta cuando termine.', 120, 396, 216, '#8a80a8', 'center');
    },
    down(){
      if (S.done || S.holding) return;
      S.holding = true; S.pressT = T;
      const n = S.notes.find(m => m.st === 'wait' && Math.abs(S.t - m.t) <= PRESS);
      if (n){ n.st = 'hold'; S.cur = n; voiceOn(n.p); }
      else { const late = S.notes.find(m => m.st === 'wait' && S.t > m.t && S.t < m.t + m.d); tone(311, .2, 'triangle', .05); if (late){ late.st = 'miss'; err('¡Entró tarde!'); } else err('¡Una nota de más!'); }
    },
    up(){ if (!S.holding) return; S.holding = false; voiceOff(); },
    stop(){ voiceOff(); }
  };
}

const L5 = {
  key:'cami', n:5, venue:'teatro', fans:.45, ficha:true,
  barks:[['p_cami.jpg','CAMI','¡RE PERRRO!'],['p_mao.jpg','MAO','Eso no es así madre'],['p_dave.jpg','DAVE','¿Vamos por pollito?'],['p_checho.jpg','CHECHO','¡Moonwalk, Cami!']],
  onStart(){ camiRock = false; camiTip = '#2f6bff'; camiFails = 0; },
  onBossWon(){ VENUE = 'sotano'; },   // botón de pruebas «DESPUÉS DEL JEFE»: el final es en Rock Express
  intro:[
    { who:'narr', text:'10:20 p.m. Auditorio de la universidad. Checho y Dave llegan corriendo al backstage. Cami está con el director de la Wind Orchestra Region.', fx(){ VENUE = 'teatro'; setStage(sceneCamiArrive()); } },
    { who:'director', text:'Cami, todo está saliendo de maravilla. Solo nos falta cerrar con broche de oro.', fx: tIdle([['camig',TW.cami,{anim:'idle',y:TW.camiY}],['director',TW.dir,{anim:'habla',y:TW.dirY0}],['checho',TW.chk,{anim:'casa',flip:true,y:TW.chkY}],['dave',TW.dav,{anim:'idle2',y:TW.davY}]]) },
    { who:'cami', text:'Gracias, maestro. ¡Saldrá bien! Después de esta interpretación debo salir corriendo.', fx: tIdle([['camig',TW.cami,{anim:'idle',y:TW.camiY}],['director',TW.dir,{anim:'idle',y:TW.dirY0}],['checho',TW.chk,{anim:'casa',flip:true,y:TW.chkY}],['dave',TW.dav,{anim:'idle2',y:TW.davY}]]) },
    { who:'checho', text:'(susurrando) Cami… son las 10:20 p.m.…' },
    { who:'dave', text:'(susurrando) Ricardo… tic tac…' },
    { who:'cami', text:'Shhh. Paciencia, ya estoy por terminar, solo un ratito.' },
    { who:'narr', text:'El director camina hacia el centro del escenario y se pone en posición.', fx(){ setStage(sceneDirectorWalks()); } },
    { who:'checho', text:'¡Vamos, Cami! ¡Dalo todo en ese escenario!', fx(){ setStage(sceneBackToCami()); } },
    { who:'dave', text:'¡A romperla, Cami!' },
    { who:'narr', text:'…', fx(){ dlg.hidden = true; dlgLock = true; setStage(sceneCamiWalks(() => { dlgLock = false; dlg.hidden = false; advance(); })); } }   // Cami camina hasta el director, que la espera para empezar
  ],
  idle:[['director',TW.dirC - TW.CAMC,{anim:'dirige',y:TW.dirY}],['camig',TW.camiC - TW.CAMC,{anim:'idle'}]],
  steps:[
    { id:'sustain', clock:'10:21', music:'silence', scene:sceneSustain, hint:'Tip: suelta apenas la nota se acabe. Una nota de más también cuenta como error.',
      before:[{ who:'narr', fx: tIdle([['director',TW.dirC,{anim:'dirige',y:TW.dirY}],['camig',TW.camiC,{anim:'idle'}]], TW.CAMC, TW.camiC, [1,1,1]), text:'RETO 1 · Nota sostenida. Cami canta el cierre con la orquesta. Mantén presionado mientras cada nota de la partitura cruza la línea dorada y suelta cuando termine. Sin desafinar delante del director.' }] },
    { id:'transform', clock:'10:23', music:'silence', scene:() => sceneCamiTransform(stepDone), auto:true,
      before:[{ who:'cami', text:'¡Se acaba el tiempo, debemos salir ya!', fx: tIdle([['director',TW.dirC,{anim:'idle',y:TW.dirY}],['camig',TW.camiC,{anim:'idle'}]], TW.CAMC, TW.camiC, [1,1,1]) }] },
    { id:'console', venue:'sotano', clock:'10:50', music:'silence', scene:sceneChannel, hint:'Tip: fíjate en la sílaba que se enciende en el globo y busca el medidor que salta justo ahí.',
      before:[
        { who:'director', text:'¡Wow! ¿Camila?', fx: tIdle([['director',TW.dirC,{anim:'wow',y:TW.dirY,flip:true}],['camir',TW.camiC,{flip:true}]], TW.CAMC, TW.camiC, [1,1,1]) },
        { who:'chkdav', text:'¡Wow, increíble!' },
        { who:'narr', text:'…', fx(){ dlg.hidden = true; dlgLock = true; setStage(sceneCamiToBoys(() => { dlgLock = false; dlg.hidden = false; advance(); })); } },
        { who:'cami', text:'¿Qué esperan? ¡Vamos!', fx: tIdle([['checho',TW.chk,{anim:'casa',flip:true,y:TW.chkY}],['dave',TW.dav,{anim:'idle2',y:TW.davY}],['camir',150,{y:TW.camiY}]], 0, -999) },
        { who:'narr', text:'…', fx(){ dlg.hidden = true; dlgLock = true; setStage(sceneRunOutLeft(() => { dlgLock = false; dlg.hidden = false; advance(); })); } },
        { who:'narr', text:'10:50 p.m. Rock Express. Cami, Checho y Dave llegan corriendo, con el tiempo justo para una prueba de sonido.', fx(){ clock = '10:50'; VENUE = 'sotano'; setStage(sceneRockArrive()); } },
        { who:'checho', text:'¡Llegamos! Cami, haz la prueba de sonido mientras nosotros bajamos los equipos.', fx: rxIdle([['checho',RX.chk,{anim:'casa',flip:true}],['camir',RX.cami,{}],['dave',RX.dav,{anim:'idle2',flip:true}]]) },
        { who:'dave', text:'¡Ya volvemos!' },
        { who:'narr', text:'…', fx(){ dlg.hidden = true; dlgLock = true; setStage(sceneBoysLeave(() => { dlgLock = false; dlg.hidden = false; advance(); })); } },
        { who:'cami', text:'Uno, dos… probando. A ver si este bar me escucha.', fx: rxIdle([['camir',RX.cami,{anim:'prueba'}]]) },
        { who:'narr', text:'RETO 2 · ¿Cuál es mi canal? Cami canta su prueba y en la consola todos los medidores saltan. Solo uno sigue el ritmo de su voz: mira cómo se encienden las sílabas y toca ese canal. Son 3 rondas.' } ] },
    { id:'feedback', venue:'sotano', clock:'10:55', music:'metal', scene:sceneFeedback, hint:'Tip: los chillidos con anillo blanco necesitan dos toques.',
      vs:{ boss:'feedback', flip:true, desc:'Revienta los chillidos antes de que lleguen a Cami. Con 6, suelta el SHA NA NA.', name:'MR. FEEDBACK', cls:'INGENIERO DE SONIDO', moves:['ACOPLE ETERNO','¿ME ESCUCHAS?','EQ DESTRUCTOR','CHILLIDO A 120 dB'] },
      before:[
        { who:'narr', text:'10:55 p.m. Alguien entra al escenario con cara de pocos amigos: el ingeniero de sonido.', fx(){ clock = '10:55'; VENUE = 'sotano'; setStage(sceneFeedbackEnters()); } },
        { who:'feedback', text:'¿Y ese micrófono? Aquí se usa el de la casa. Ya tengo todo ecualizado.', fx: fbIdle({ flip:true }, { anim:'habla' }) },
        { who:'cami', text:'Este es mi micrófono. Yo no canto con un micrófono prestado: ¡eso está lleno de bacterias, gas!', fx: fbIdle({ flip:true }, { anim:'idle' }) },
        { who:'feedback', text:'Ese aparato me va a desconfigurar todo el sonido. Si lo conectas, no respondo.', fx: fbIdle({ flip:true }, { anim:'habla' }) },
        { who:'cami', text:'Pues responda, porque lo voy a conectar.', fx: fbIdle({ flip:true }, { anim:'idle' }) },
        { who:'feedback', text:'Muy bien… a ver cuánto aguantas mi mezcla.', fx(){ fbIdle({ flip:true }, { anim:'ataca' })(); SFX.screech(); shake = RM ? 0 : .3; } },
        { who:'narr', text:'JEFE · Mr. Feedback. Te lanza chillidos: tócalos para reventarlos antes de que lleguen a Cami. Con 6 reventados se enciende el botón SHA NA NA: tócalo y Cami canta tan fuerte que le pega. Dale 4 y la consola echa humo. Si 3 chillidos alcanzan a Cami, pierde un color de pelo.' } ] }
  ],
  outro:[
    { who:'narr', text:'La consola echa humo.', fx: fbIdle({ flip:true }, { anim:'derrota' }, FB.cami) },
    { who:'feedback', text:'…Ok. Su micrófono suena mejor que el mío.' },
    { who:'cami', text:'¡Se los dije!' },
    { who:'narr', text:'…', fx(){ dlg.hidden = true; dlgLock = true; setStage(sceneBandArrives(false, () => { dlgLock = false; dlg.hidden = false; advance(); })); } },
    { who:'checho', text:'¿Qué pasó aquí?', fx: bandIdle(false) },
    { who:'cami', text:'Nada. ¡Todos listos!' },
    { who:'narr', text:'…', fx(){ dlg.hidden = true; dlgLock = true; setStage(sceneBandArrives(true, () => { dlgLock = false; dlg.hidden = false; advance(); })); } },
    { who:'narr', text:'10:58 p.m. La banda está completa.', fx(){ clock = '10:58'; bandIdle(true)(); SFX.hey(); } }
  ],
  mapSub:'¡LA BANDA ESTA COMPLETA! 5/5 · A LA AUDICION'
};
