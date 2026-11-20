'use strict';
/* ===================== NIVEL FINAL · TODOS ===================== */
// Final: Rock Express con la tarima vacía. Mao arriba en la tarima con su batería
const FINAL = [['maof',120,{anim:'fidle',y:152}],['dave',216,{anim:'idle_bajo',flip:true,y:215}],['checho',36,{anim:'idle',y:222}],['maito',162,{anim:'idle',flip:true,y:222}],['camir',90,{flip:true}]];   // repartidos y simétricos alrededor de Mao; Dave un poco detrás de Maito; Cami al frente   // Cami un poco más adelante (más abajo) que los demás   // abajo, de izquierda a derecha: Checho, Cami, (Mao en la tarima), Maito y Dave


// RETO FINAL 1: la audición — los cinco tocan juntos, estilo Guitar Hero (como el duelo de Checho): 4 carriles, notas largas y acordes.
// La canción avanza por partes (intro, verso, pre-coro, coro, solo y final) y la luz señala a quién le toca.
const FINAL_PLAY = [['maof',120,{anim:'ftoca',y:152}],['dave',216,{anim:'toca_final',y:215}],['checho',36,{anim:'toca_final',y:222}],['maito',162,{anim:'toca_final',flip:true,y:222}],['camir',90,{anim:'prueba',flip:true}]];
// al terminar la audición: mismas posiciones, todos celebrando y cae confeti del techo
// (Mao: sprite de celebración en la batería pendiente; mientras tanto sigue tocando)
const FINAL_CELEB = [['maof',120,{anim:'ftoca',y:152}],['dave',216,{anim:'celebra_bajo',flip:true,y:215}],['checho',36,{anim:'celebra',y:222}],['maito',162,{anim:'celebra',flip:true,y:222}],['camir',90,{anim:'celebra',flip:true}]];
const CONF_COL = ['#ffd34d','#ff2e88','#3dff8a','#2fd6ff','#ffffff','#ff7a2e','#9b6bff'];
function drawConfetti(t0=0){
  const t = T - t0;
  for (let i=0;i<90;i++){
    const sp = 34 + (i*13 % 5)*9, k = (t - (i*.037 % 1.6))*sp; if (k < 0) continue;   // cada papelito cae desde el techo con un pequeño retraso
    const y = 22 + (k % 214), x = ((i*53.7) % 236) + 2 + Math.sin(t*1.7 + i)*7;
    const flip = Math.sin(t*6 + i*1.3), w = Math.max(1, Math.round(Math.abs(flip)*3));
    r(Math.round(x), Math.round(y), w, i%3 ? 3 : 2, CONF_COL[i % CONF_COL.length]);
  }
}
function sceneFinalCelebrate(){ const t0 = T; return sceneIdle({ cast:FINAL_CELEB, label:'¡SÍ!', extra:() => drawConfetti(t0) }); }
// silencio largo en un diálogo: la línea «……» no se puede saltar y avanza sola
function silence(sec){ dlgLock = true; dlgLockTap = null; setTimeout(() => { dlgLock = false; advance(); }, sec*1000); }
// el camerino (por ahora con los mismos sprites de la audición, de pie): Checho y Cami a la izquierda; Mao, Maito y Dave a la derecha
const CAMERINO = [['checho',40,{anim:'triste',y:204,sc:.85}],['maito',88,{anim:'triste',y:204,sc:.85}],['camir',136,{anim:'triste',y:226}],['mao',178,{anim:'triste',y:232,sc:.85}],['dave',218,{anim:'triste',y:222}]];   // Cami, Mao y Dave miran a la izquierda; Mao al 85 %
// Maito cambia de sprite en su mismo lugar: celular (llamada de Diego), sorpresa (el favor) y noticias (todos lo miran)
const camCast = (mai) => CAMERINO.map(c => c[0] === 'maito' ? ['maito', c[1], Object.assign({}, c[2], { anim:mai, sc:.9 })] : c);
const camIdle = (mai) => setStage(sceneIdle({ cast: mai ? camCast(mai) : CAMERINO, label:'CAMERINO' }));   // Checho y Maito sentados, tristes, uno al lado del otro
// Festival Rock de los Cerros: las mismas posiciones de la audición
const FEST = FINAL, FEST_PLAY = FINAL_PLAY;
// el plano del festival se abre al máximo (fondo a 360×180, con cielo por encima): la banda se achica en la misma proporción y queda en el mismo lugar del escenario
const FEST_K = 360/672;
function drawFestCast(cast){ ctx.save(); ctx.translate(-60 + 216*FEST_K, 56 + 38*FEST_K); ctx.scale(FEST_K, FEST_K); cast.forEach(([c, x, o]) => CAST[c](x, o)); ctx.restore(); }
function sceneFestIdle(){ return { label:'FESTIVAL', update(){}, draw(){ drawStage({}); drawFestCast(FEST); drawCrowd(); drawHUD(this.label); }, tap(){} }; }
// final del juego: «¿Listos?» 1, 2, 3, 4 en verde, todos pasan a tocar y la pantalla se va a negro; luego los créditos
function sceneFinaleCount(){
  const t0 = T + .2; let n = 0, ended = false;
  return { label:'FESTIVAL', update(){
      const k = T - t0;
      while (n < 4 && k >= .9 + n*.5){ DR.hat(now(), n === 0, .12); n++; }
      if (k >= 2.9 && !ended){ ended = true; setMusic('anthem'); SFX.riffStab(); }
      if (k >= 5.4 && ended !== 2){ ended = 2; setTimeout(stepDone, 30); }
    }, draw(){
      const k = T - t0;
      drawStage({ party: k >= 2.9 });
      drawFestCast(k >= 2.9 ? FEST_PLAY : FEST);
      drawCrowd(); drawHUD(this.label);
      if (k >= 0 && k < .9){ ctx.globalAlpha = Math.min(1, k*5); vtxtBig('¿Listos?', 120, 40, '#3dff8a', 3, '#000'); ctx.globalAlpha = 1; }
      else if (k >= .9 && k < 2.9){ const i = Math.min(4, Math.floor((k - .9)/.5) + 1), ph = ((k - .9)/.5) % 1; ctx.globalAlpha = Math.max(.3, 1 - ph*.7); vtxtBig(String(i), 120, 40, '#3dff8a', 3, '#000'); ctx.globalAlpha = 1; }
      if (k >= 3.6){ ctx.globalAlpha = Math.min(1, (k - 3.6)/1.2); r(0, 0, W, H, '#000'); ctx.globalAlpha = 1; }
    }, tap(){} };
}

// ===== CRÉDITOS DE CINE =====
// 1) «Quadrant Studio presenta» y el título; 2) una tarjeta por integrante: el personaje bajo un cañón de luz con su nombre real
// y «como …»; 3) una tarjeta por villano; 4) reparto secundario y equipo en dos columnas que suben despacio; 5) aviso legal;
// 6) logo, derechos y privacidad. Mantener presionada la pantalla adelanta; al soltar vuelve a la velocidad normal.
const CR_BAND = [
  { sp:['checho','idle'], role:'GUITARRA', name:'SERGIO CELIS', as:'CHECHO' },
  { sp:['maito','idle'], role:'GUITARRA Y SHOW', name:'MAURICIO CELIS', as:'MAITO' },
  { sp:['camir','idle',true], role:'VOZ', name:'CAMILA PIÑEROS', as:'CAMI' },
  { sp:['dave','idle_bajo'], role:'BAJO', name:'DAVID ORTEGA', as:'DAVE' },
  { sp:['mao','depie'], role:'BATERÍA', name:'MAURICIO TORRES', as:'MAO' } ];
const CR_VILLAINS = [   // (ya no salen en los créditos: alargaban mucho; se dejan por si vuelven)
  { sp:['laca','idle'], role:'GUITARRISTA DE AFRODITA', as:'MR. DIRTY' },
  { sp:['enredo','idle'], role:'LUCHADOR RUDO', as:'EL ENREDO' },
  { sp:['deadline','idle'], role:'THE BOSS', as:'MR. DEADLINE' },
  { sp:['ivan','idle'], role:'LA MÁQUINA DE RITMOS', as:'IVÁN' , sub:'DRUM-MACHINE' },
  { sp:['feedback','reclama'], role:'EL INGENIERO DE SONIDO', as:'MR. FEEDBACK' } ];
// apariciones especiales: tarjeta propia como los integrantes (los Diegos y Perla)
const CR_SPECIAL = [
  { strip:'dir_creditos.png', fw:132, n:8, fps:5, foot:113, role:'DIRECTOR · WIND ORCHESTRA REGION', name:'DIEGO RIVERA' },
  { strip:'diego_idle.png', fw:136, n:8, fps:5, foot:114, role:'PRODUCTOR · RED SPOT STUDIO', name:'DIEGO RODRÍGUEZ' },
  { strip:'perla_estirada.png', fw:68, n:9, fps:5, foot:58, role:'LA GATA DE LIZ', name:'PERLA', as:'RAIDON MININO' } ];
const CR_PICS = {}; CR_SPECIAL.forEach(c => { if (c.strip) CR_PICS[c.strip] = Object.assign(new Image(), { src:c.strip }); });
// cierre: tarjetas limpias que aparecen y se desvanecen una tras otra
const CR_CARDS = [
  { d:3.6, h:'DESARROLLADO POR', big:'QUADRANT STUDIO' },
  { d:3.6, h:'UNA PRODUCCIÓN DE', big:'KABBARET', sub:'2026' },
  { d:14, h:'AVISO', p:'Esta es una obra de ficción. Las locaciones, los nombres de bandas y los personajes que aparecen en este juego son ficticios o se usan de manera ficticia. Con excepción de Kabbaret y sus integrantes, que se interpretan a sí mismos, cualquier parecido con personas reales, vivas o fallecidas, con bandas, lugares o hechos reales es pura coincidencia.' } ];
// el logo de los créditos va como imagen HTML en alta resolución encima del lienzo (en el lienzo de 240 px perdía calidad)
let CR_LOGO_EL = null;
function crLogoHTML(spec){   // spec = [transparencia, x, y, ancho] en coordenadas del lienzo, o null para ocultarlo
  if (!CR_LOGO_EL){ CR_LOGO_EL = Object.assign(document.createElement('img'), { src:'logo_letras_hd.png', alt:'' });
    CR_LOGO_EL.style.cssText = 'position:fixed;pointer-events:none;opacity:0;z-index:1;image-rendering:auto'; document.body.appendChild(CR_LOGO_EL); }
  if (!spec || spec[0] <= 0){ CR_LOGO_EL.style.opacity = 0; return; }
  const b = cv.getBoundingClientRect(), k = b.width / W;
  Object.assign(CR_LOGO_EL.style, { left:(b.left + spec[1]*k) + 'px', top:(b.top + spec[2]*k) + 'px', width:(spec[3]*k) + 'px', opacity:spec[0] }); }
function crSprite(k, anim, flip, x, feet, sc){
  ctx.save(); ctx.translate(x, feet); ctx.scale(sc, sc); ctx.translate(-x, -228);
  if (k === 'enredo') drawEnredo(x, 228, { anim }); else if (k === 'ricardo') drawRicardo(x, 228, { anim });
  else CAST[k](x, { anim, flip, y:228 });
  ctx.restore(); }
// dibuja el personaje en una capa aparte y la pinta con la transparencia indicada
// (así el personaje entero se desvanece igual que las letras y la luz, aunque sus funciones de dibujo cambien la transparencia)
const CR_LAYER = document.createElement('canvas'); CR_LAYER.width = W; CR_LAYER.height = H;
function crFade(alpha, fn){ if (alpha <= 0) return; const main = ctx, lc = CR_LAYER.getContext('2d'); lc.setTransform(1, 0, 0, 1, 0, 0); lc.clearRect(0, 0, W, H); lc.imageSmoothingEnabled = false;
  ctx = lc; try { fn(); } finally { ctx = main; } ctx.save(); ctx.globalAlpha = alpha; ctx.imageSmoothingEnabled = false; ctx.drawImage(CR_LAYER, 0, 0); ctx.restore(); }
// cañón de luz desde arriba sobre el personaje, con su charco de luz en el piso
function crSpot(x, feet, col, a){
  ctx.save(); ctx.globalAlpha = a;
  const g = ctx.createLinearGradient(0, 40, 0, feet); g.addColorStop(0, col + '00'); g.addColorStop(1, col + '38');
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x - 10, 40); ctx.lineTo(x + 10, 40); ctx.lineTo(x + 56, feet); ctx.lineTo(x - 56, feet); ctx.closePath(); ctx.fill();
  const e = ctx.createRadialGradient(x, feet, 0, x, feet, 60); e.addColorStop(0, col + '55'); e.addColorStop(1, col + '00');
  ctx.fillStyle = e; ctx.save(); ctx.translate(x, feet); ctx.scale(1, .22); ctx.beginPath(); ctx.arc(0, 0, 60, 0, 7); ctx.fill(); ctx.restore();
  ctx.restore(); }
// texto con espaciado entre letras, centrado
function crSpaced(t, x, y, col, gap = 2){ const w = [...t].reduce((a, ch) => a + vWidth(ch) + gap, -gap); let cx = x - w/2; [...t].forEach(ch => { vtxt(ch, cx, y, col, 'left'); cx += vWidth(ch) + gap; }); }
function sceneMovieCredits(){
  const OPEN = 9, BANDT = 4.6, VILT = 3.4, SPT = 4.6, tBand = OPEN, tVil = tBand + CR_BAND.length*BANDT, tSp = tVil, tRoll = tSp + CR_SPECIAL.length*SPT;   // sin tarjetas de villanos
  const tEnd = tRoll + CR_CARDS.reduce((t, c) => t + c.d, 0), ENDT = 11;
  let tt = 0, last = T, done = false; const held = new Set();
  // fondo como el de la advertencia: negro con destellos que titilan
  const stars = Array.from({ length: 34 }, (_, i) => [ (i*67 + (i*i*7) % 23) % 236 + 2, 30 + (i*131) % 360, i % 5 === 0 ? 2 : 1, 2 + (i % 4) * 1.3, i*1.7 ]);
  const fadeIO = (u, d, f = .6) => Math.max(0, Math.min(1, u/f, (d - u)/f)), soft = v => v*v*(3 - 2*v);   // soft: entrada y salida suaves
  return { label:'', start(){ setBlackBg(true); }, stop(){ setBlackBg(false); crLogoHTML(null); }, update(){
      const dt = T - last; last = T; tt += dt * (held.size ? 5 : 1);
      if (tt > tEnd + ENDT && !done){ done = true; setTimeout(stepDone, 30); }
    }, draw(){
      let logo = null;
      r(0, 0, W, H, '#000');
      stars.forEach(([sx, sy, sz, sp, ph]) => { const k = .5 + .5*Math.sin(T*(6.283/sp) + ph); ctx.globalAlpha = sz > 1 ? .2 + .65*k*k : .12 + .35*k; r(sx, sy, sz, sz, '#ffffff'); }); ctx.globalAlpha = 1;
      if (tt < OPEN){   // apertura
        const a1 = fadeIO(tt - .6, 3.4, .8); ctx.globalAlpha = a1; crSpaced('QUADRANT STUDIO', 120, 196, '#f4f1f8', 2); vtxt('presenta', 120, 212, '#8a80a8', 'center');
        const a2 = fadeIO(tt - 4.4, 4.6, .9); ctx.globalAlpha = a2;
        logo = [a2, 24, 148, 192];
        crSpaced('LA AUDICIÓN', 120, 232, C.gold, 3); ctx.globalAlpha = 1;
      } else if (tt < tVil){   // integrantes
        const i = Math.floor((tt - tBand)/BANDT), u = tt - tBand - i*BANDT, c = CR_BAND[i], a = soft(fadeIO(u, BANDT, 1.1));
        ctx.globalAlpha = fadeIO(tt - tBand, CR_BAND.length*BANDT, .6); crSpaced('KABBARET', 120, 64, '#ffd98a', 3); ctx.globalAlpha = 1;   // queda arriba mientras salen los cinco
        crSpot(120, 250, '#ffd98a', a);
        crFade(a, () => crSprite(c.sp[0], c.sp[1], c.sp[2], 120, 250, 1));   // personaje, luz y letras aparecen y se desvanecen juntos
        ctx.globalAlpha = a;
        crSpaced(c.role, 120, 274, '#8a80a8', 2);
        vtxtBig(c.name, 120, 290, '#f4f1f8', 2, '#000');
        r(100, 314, 40, 1, '#ffd34d66');
        crSpaced('COMO', 120, 322, '#8a80a8', 2); vtxtBig(c.as, 120, 336, C.gold, 2, '#000');
        ctx.globalAlpha = 1;
      } else if (tt < tSp){   // villanos
        const i = Math.floor((tt - tVil)/VILT), u = tt - tVil - i*VILT, c = CR_VILLAINS[i], a = fadeIO(u, VILT, .6);
        crSpot(120, 250, '#ff3b5c', a*.9);
        ctx.globalAlpha = a; crSprite(c.sp[0], c.sp[1], c.sp[2], 120, 250, 1);
        const a2 = fadeIO(u - .4, VILT - .4, .5); ctx.globalAlpha = a2;
        if (i === 0){ ctx.globalAlpha = a2*fadeIO(tt - tVil, CR_VILLAINS.length*VILT, .6); crSpaced('LOS VILLANOS', 120, 64, '#ff6b81', 3); ctx.globalAlpha = a2; }
        crSpaced(c.role, 120, 274, '#8a80a8', 2);
        vtxtBig(c.as, 120, 290, '#f4f1f8', 2, '#000'); if (c.sub) vtxtBig(c.sub, 120, 314, '#f4f1f8', 2, '#000');
        ctx.globalAlpha = 1;
      } else if (tt < tRoll){   // apariciones especiales: los Diegos y Perla
        const i = Math.floor((tt - tSp)/SPT), u = tt - tSp - i*SPT, c = CR_SPECIAL[i], a = soft(fadeIO(u, SPT, 1.1));
        crSpot(120, 250, '#9fd8ff', a);
        crFade(a, () => { if (c.sp) crSprite(c.sp[0], c.sp[1], c.sp[2], 120, 250, 1);
          else if (c.strip){ const im = CR_PICS[c.strip]; if (im.complete && im.naturalWidth){ const f = Math.floor(T*c.fps) % c.n; ctx.imageSmoothingEnabled = false; ctx.drawImage(im, f*c.fw, 0, c.fw, c.fw, 120 - c.fw/2, 250 - c.foot, c.fw, c.fw); } } });
        { ctx.globalAlpha = fadeIO(tt - tSp, CR_SPECIAL.length*SPT, .6); crSpaced('APARICIONES ESPECIALES', 120, 64, '#9fd8ff', 2); ctx.globalAlpha = a; }   // queda arriba mientras salen los Diegos y Perla
        crSpaced(c.role, 120, 274, '#8a80a8', 2);
        vtxtBig(c.name, 120, 290, '#f4f1f8', 2, '#000');
        if (c.as){ r(100, 314, 40, 1, '#9fd8ff66'); crSpaced('COMO', 120, 322, '#8a80a8', 2); vtxtBig(c.as, 120, 336, C.gold, 2, '#000'); }
        ctx.globalAlpha = 1;
      } else if (tt < tEnd){   // tarjetas finales
        let t0 = tRoll, c = CR_CARDS[0]; for (const cc of CR_CARDS){ if (tt < t0 + cc.d){ c = cc; break; } t0 += cc.d; }
        const u = tt - t0; ctx.globalAlpha = fadeIO(u, c.d, .8);
        if (c.p){ crSpaced(c.h, 120, 150, C.gold, 3); r(100, 166, 40, 1, '#ffd34d55'); vtxtw(c.p, 120, 180, 200, '#b0a8c8', 'center', null, 13); }
        else { crSpaced(c.h, 120, 176, '#8a80a8', 2); r(100, 192, 40, 1, '#ffd34d55'); vtxtBig(c.big, 120, 202, '#f4f1f8', 2, '#000'); if (c.sub) crSpaced(c.sub, 120, 230, C.gold, 3); }
        ctx.globalAlpha = 1;
      } else {   // cierre
        const k = tt - tEnd, fin = (a, f, b) => Math.max(0, Math.min(1, (k - a)/f, (b - k)/.8));
        ctx.globalAlpha = fin(0, .6, 2.4); vtxt('Gracias por jugar con nosotros.', 120, 200, '#f4f1f8', 'center');
        ctx.globalAlpha = fin(2.4, .9, ENDT);
        logo = [fin(2.4, .9, ENDT), 20, 128, 200];
        crSpaced('SINCE 2009', 120, 214, C.gold, 3);
        ctx.globalAlpha = fin(3.4, .9, ENDT);
        r(70, 262, 100, 1, '#ffffff22');
        vtxt('© 2026 Kabbaret y Quadrant Studio.', 120, 276, '#f4f1f8', 'center');
        vtxt('Todos los derechos reservados.', 120, 288, '#f4f1f8', 'center');
        vtxtw('Privacidad: este juego no recopila ni comparte datos personales. Tu progreso se guarda solo en este dispositivo.', 120, 308, 210, '#5a5470', 'center');
      }
      ctx.globalAlpha = 1;
      // franjas de cine arriba y abajo
      r(0, 0, W, 26, '#000'); r(0, H - 26, W, 26, '#000');
      if (tt < 6 || held.size) vtxt(held.size ? '>> adelantando' : 'Mantén presionado para adelantar', 120, H - 17, '#3e3854', 'center');
      crLogoHTML(logo);
    },
    down(x, y, id){ held.add(id); }, up(id){ held.delete(id); }, tap(){} };
}
// escena poscréditos: Checho en su apartamento, con las guitarras colgadas en la pared (como en el prólogo); suena el celular… y se corta
// Escena poscréditos animada (sin texto): Checho en pijama hace ejercicio (puños, patada); Perla entra corriendo, le salta al pecho,
// rebota y huye por la derecha; Checho la persigue; ella vuelve corriendo hacia la izquierda y él detrás; Checho frena en seco en el centro
// cuando le suena el celular. Mientras habla (sin depender de toques) Perla entra caminando, se queda quieta un momento, sigue hasta sus pies y se lame.
let POST = null;
function scenePostShow(){
  const CX = 110, FY = 226, S = { t0:-1, done:null, rang:false, ph:-1 };
  const cl = u => Math.max(0, Math.min(1, u)), lerp = (a, b, u) => a + (b - a)*cl(u);
  const arc = (x0, y0, x1, y1, hgt, u) => [lerp(x0, x1, u), lerp(y0, y1, u) - Math.sin(cl(u)*Math.PI)*hgt];
  POST = { play(cb){ S.t0 = T; S.done = cb; }, phone(){ S.ph = T; } };
  function pose(t){   // devuelve [checho, gata] para el segundo t de la animación
    let c = { x:CX, anim:'pij_idle', flip:false }, g = null;
    if (t < 0) return [c, g];
    if (t >= .6 && t < 2.2) c = { x:CX, anim:'pij_puno', frame:Math.floor((t - .6)*10) };
    else if (t >= 2.8 && t < 3.95) c = { x:CX, anim:'pij_patada', frame:Math.floor((t - 2.8)*7) };
    // Perla entra corriendo desde la derecha, salta al pecho y rebota
    if (t >= 5.5 && t < 5.62) g = { k:'corre', x:lerp(262, 168, (t - 5.5)/.12), y:FY };   // entra disparada, sin aviso…
    else if (t >= 5.62 && t < 5.85){ const u = (t - 5.62)/.23, [x, y] = arc(168, FY, 124, 178, 12, u); g = { k:'salta', x, y, frame:1 + Math.floor(u*3) }; }   // …y se le lanza al pecho
    else if (t >= 5.85 && t < 6.4){ const u = (t - 5.85)/.55, [x, y] = arc(124, 178, 178, FY, 30, u); g = { k:'salta', x, y, flip:true, frame:3 + Math.floor(u*5) }; }
    else if (t >= 6.4 && t < 6.85) g = { k:'corre', x:lerp(178, 272, (t - 6.4)/.45), y:FY, flip:true };
    if (t >= 5.85 && t < 6.3) c.x = CX - Math.round(Math.sin((t - 5.85)*40)*2);   // el golpe del salto
    // Checho sale corriendo detrás de ella por la derecha
    if (t >= 6.75 && t < 8.6) c = { x:lerp(CX, 300, (t - 6.75)/.85), anim:'pij_corre' };
    // ella vuelve corriendo hacia la izquierda y él detrás, hasta frenar en el centro
    if (t >= 8.6 && t < 9.9) g = { k:'corre', x:lerp(270, -40, (t - 8.6)/1.2), y:FY };
    if (t >= 8.6 && t < 9.1) c = { x:300, anim:'pij_corre', flip:true };
    else if (t >= 9.1 && t < 9.95) c = { x:lerp(300, CX, (t - 9.1)/.85), anim:'pij_corre', flip:true };
    else if (t >= 9.95) c = { x:CX, anim:'pij_idle', flip:true };
    return [c, g];
  }
  function catWalk(t){   // Perla vuelve tranquila mientras Checho habla
    if (t < 1.5) return null;
    const u = t - 1.5, X0 = -20, X1 = 52, X2 = 84, v = 20, w1 = (X1 - X0)/v, idle = 1.8, w2 = (X2 - X1)/v;
    if (u < w1) return { k:'camina', x:X0 + u*v, y:FY };
    if (u < w1 + idle) return { k:'idle', x:X1, y:FY };
    if (u < w1 + idle + w2) return { k:'camina', x:X1 + (u - w1 - idle)*v, y:FY };
    const l = u - (w1 + idle + w2);
    if (l < 4.5) return { k:'lame', x:X2, y:FY };   // se lame…
    const x = X2 - (l - 4.5)*320; return x > -40 ? { k:'corre', x, y:FY } : null;   // …y sale disparada hacia la izquierda
  }
  return { label:'', update(){
      if (S.t0 >= 0 && !S.rang && T - S.t0 >= 9.95){ S.rang = true; SFX.ring(); }
      if (S.t0 >= 0 && !S.zap && T - S.t0 >= 5.5){ S.zap = true; SFX.whoosh(); }
      if (S.t0 >= 0 && !S.thud && T - S.t0 >= 5.85){ S.thud = true; tone(150, .12, 'triangle', .08); flash = .05; flashCol = '#fff'; }
      if (S.t0 >= 0 && S.done && T - S.t0 >= 10.6){ const cb = S.done; S.done = null; cb(); }
    }, draw(){
      drawStage({});
      let [c, g] = pose(S.t0 < 0 ? -1 : T - S.t0);
      if (S.ph >= 0){ c = { x:CX, anim:'pij_celular', flip:true }; g = catWalk(T - S.ph); }
      if (g && g.x > -40 && g.x < 280) perlaSprite(g.k, g.x, g.y, g.flip, g.frame);
      CAST.checho(c.x, { anim:c.anim, flip:c.flip, frame:c.frame });
      if (g && g.k === 'salta' && g.y < FY - 20) perlaSprite(g.k, g.x, g.y, g.flip, g.frame);   // en el aire va delante de Checho
      drawCrowd(); drawHUD('');
    }, tap(){} };
}
function scenePostCasa(anim){ return sceneIdle({ cast:[['checho', 110, { anim }]], label:'', extra:() => perlaSprite('lame', 196, 226, true) }); }
function sceneCut(cb){ const t0 = T; let fired = false;
  return { label:'', update(){ if (!fired && T - t0 > 4.2){ fired = true; cb(); } }, draw(){ r(0, 0, W, H, '#000');
    const k = T - t0; if (k > 1.6){ ctx.globalAlpha = Math.min(1, (k - 1.6)/.8); vtxt('KABBARET VOLVERÁ.', 120, 200, '#f4f1f8', 'center'); ctx.globalAlpha = 1; } }, tap(){} }; }
// o.impossible: el concierto de la Arena (JEFE FINAL): misma dinámica, pero el público se va aburriendo pase lo que pase
function sceneFinalSong(o={}){
  const IMP = !!o.impossible;
  const LC = [C.ok, C.neon, C.gold, C.cyan];
  const TOP = 96, HIT = 352, BOT = HIT + 28, D = 1.75;   // misma pista que el duelo de Checho
  const PARTS = [
    { name:'Intro', who:'Checho y Maito', x:[36,162], dur:8, gap:.62 },
    { name:'Verso', who:'Dave y Mao', x:[216,120], dur:10, gap:.52 },
    { name:'Pre-coro', who:'Cami', x:[90], dur:7, gap:.5, long:.5 },
    { name:'Coro', who:'¡Cami y todos!', x:[90,36,120,162,216], dur:10, gap:.44, chord:.25 },
    { name:'Solo', who:'Checho', x:[36], dur:8, gap:.34 },
    { name:'Final', who:'¡Todos!', x:[36,90,120,162,216], dur:8, gap:.42, chord:.35, long:.25 } ];
  const TOTAL = PARTS.reduce((s, p) => s + p.dur, 0);
  const S = { t:-1.5, notes:[], spawn:0, meter: IMP ? .75 : .6, misses:0, press:[0,0,0,0], holdId:{}, fx:[], rate:'', rateT:0, rateC:C.ok, last:-1, done:false, part:-1, hits:0 };
  if (window.DEV_HOOK) window.__song = S;
  const partAt = t => { let a = 0; for (let i=0;i<PARTS.length;i++){ a += PARTS[i].dur; if (t < a) return i; } return PARTS.length - 1; };
  const yOf = k => k <= 1 ? TOP + (HIT-TOP)*Math.pow(Math.max(0,k), 1.25) : HIT + (k-1)*(HIT-TOP)*1.25;
  const wAt = y => 70 + 80*(Math.min(y, BOT) - TOP)/(BOT - TOP), lx = (lane, y) => { const w = wAt(y); return 120 - w/2 + w*(lane+.5)/4; };
  const BY = HIT + 13, bx = i => lx(i, BY), laneOf = x => { const w = wAt(BY); return Math.max(0, Math.min(3, Math.floor((x - (120 - w/2))/(w/4)))); };
  const mult = () => Math.min(4, 1 + Math.floor(stats.combo/10));
  const pick = (not=[]) => { let l; do { l = Math.random()*4|0; } while ((l === S.last && Math.random() < .7) || not.includes(l)); return l; };
  // en el concierto, desde el segundo 25 las notas caen cada vez más rápido y más seguidas
  const curD = () => IMP && S.t > 25 ? Math.max(1.1, D - (S.t - 25)*.032) : D, gapK = () => IMP && S.t > 25 ? Math.max(.62, 1 - (S.t - 25)*.02) : 1;
  const add = (lane, extra={}) => { S.notes.push(Object.assign({ lane, k:0, len:0, D:curD() }, extra)); S.last = lane; };
  const rate = (t, c) => { S.rate = t; S.rateT = .6; S.rateC = c; };
  function hit(n, dk){ soloNote(); noteHit(); S.hits++; S.meter = Math.min(1, S.meter + (IMP && S.t > 25 ? .004 : .03));   // en el concierto, desde el segundo 25 acertar casi no sube el medidor fans = Math.min(1, fans + .004); S.fx.push({ lane:n.lane, t:0 });
    const top = Math.abs(dk)*n.D < .06; rate(top ? '¡Perfecto!' : '¡Bien!', top ? C.ok : C.cyan); if (n.len > 0) n.held = true; else n.dead = true; n.hit = true; }
  function miss(){ stats.combo = 0; S.misses++; rate('¡Fallaste!', '#ff4d6d');
    if (IMP){ S.meter = Math.max(0, S.meter - .05); return; }
    S.meter -= .08; if (S.meter <= 0){ S.meter = .5; loseLife(); } }
  function lightsOut(){ S.done = true; S.off = T; S.notes = []; setMusic('silence'); SFX.boo(); setTimeout(stepDone, 4200); }
  return { label: IMP ? 'JEFE FINAL' : 'RETO 1/3',
    start(){ fans = 1; if (IMP) lifeStyle = 'none'; },   // el concierto está lleno stop(){ if (IMP) lifeStyle = 'skull'; },
    update(dt){
      S.press = S.press.map(v => Math.max(0, v - dt)); S.fx.forEach(f => f.t += dt); S.fx = S.fx.filter(f => f.t < .3); if (S.rateT > 0) S.rateT -= dt;
      if (S.done) return;
      S.t += dt;
      const pi = partAt(Math.max(0, S.t)), P = PARTS[pi];
      if (pi !== S.part && S.t >= 0){ S.part = pi; SFX.riffStab(); }
      if (IMP){
        // a los 20 s empiezan los cantos por Mötley Brüe; a los 25 s el público se aburre solo; a los 40 s vuela un vaso; a los 46 s, apagón
        if (S.t > 20 && S.t <= 28 && T - (S.chantT || 0) > 2.6){ S.chantT = T; addBubble('¡MÖT-LEY BRÜE!', 50 + Math.random()*140, 240 + Math.random()*20, C.neon, 7); }
        // desde el segundo 28 todo el público abuchea
        if (S.t > 28 && T - (S.chantT || 0) > .75){ S.chantT = T; setMood(-1, 1.5); S.bi = (S.bi || 0) + 1; addBubble(Math.random() < .8 ? '¡BUUU!' : '¡MÖT-LEY BRÜE!', [50, 190, 120][S.bi % 3] + (Math.random()*20 - 10), 238 + (S.bi % 2)*16, C.neon, 7);   // repartidos para que no se monten
          if (AC){ const f = 120 + Math.random()*50; tone(f, .7, 'sawtooth', .012, null, .75); tone(f*1.26, .7, 'sawtooth', .008, null, .75); } }
        if (S.t > 25) S.meter = Math.max(0, S.meter - (.022 + (S.t - 25)*.0035)*dt);
        // desde el segundo 30 el público lanza cosas a la tarima, cada vez más seguido
        if (S.t > 30 && T - (S.throwT || 0) > Math.max(.6, 1.5 - (S.t - 30)*.06)){ S.throwT = T; SFX.whoosh();
          (S.throws ||= []).push({ t0:T, k:['lata','lata','chancla','lata','lata'][Math.random()*5|0], can: Math.random()*3|0, x0: 20 + Math.random()*200, rot: Math.random()*6, tx: [36,90,120,162,216][Math.random()*5|0] + (Math.random()*20 - 10), ty: 170 + Math.random()*40 }); }
        if (S.t >= 46 || (S.t > 32 && S.meter <= 0)){ lightsOut(); return; }
      }
      // notas: se generan hasta D segundos antes del final para que la última llegue justo al terminar la canción
      S.spawn -= dt;
      if (S.t >= -D && S.t < TOTAL - D && S.spawn <= 0){
        const r1 = Math.random();
        if (P.chord && r1 < P.chord){ const a = pick(), b = pick([a]); add(a); add(b); S.spawn = (P.gap + .15)*gapK(); }
        else if (P.long && r1 < (P.chord || 0) + P.long){ const len = .3 + Math.random()*.3; add(pick(), { len }); S.spawn = (P.gap + len*D*.8)*gapK(); }
        else { add(pick()); S.spawn = P.gap*gapK(); }
      }
      S.notes.forEach(n => { const w = .14 / n.D; n.k += dt / n.D;
        if (n.held){ if (n.holding === undefined){ n.held = false; n.dead = true; } else { S.press[n.lane] = .08; if (n.k - n.len >= 1){ n.dead = true; S.fx.push({ lane:n.lane, t:0 }); } } }
        else if (!n.hit && n.k > 1 + w){ n.dead = true; miss(); } });
      S.notes = S.notes.filter(n => !n.dead);
      if (!IMP && S.t >= TOTAL && !S.notes.length){ S.done = true; win('¡QUÉ AUDICIÓN!'); setTimeout(stepDone, 1400); }
    },
    draw(){
      const pi = S.part < 0 ? 0 : S.part, P = PARTS[pi];
      drawStage({ party: pi >= 3 });
      // la luz señala a quién le toca en esta parte
      P.x.forEach(x => { ctx.globalAlpha = .1 + .03*Math.sin(T*4); ctx.fillStyle = '#ffe2a8'; ctx.beginPath(); ctx.moveTo(x - 6, 30); ctx.lineTo(x + 6, 30); ctx.lineTo(x + 30, 228); ctx.lineTo(x - 30, 228); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1; });
      (S.done && !IMP ? FINAL_CELEB : FINAL_PLAY).forEach(([k, x, o]) => CAST[k](x, o));
      if (IMP && S.throws) S.throws.forEach(o => { if ((T - o.t0)/1.4 >= 1) drawCan(o, o.tx, o.ty + 4, o.k === 'lata' ? Math.PI/2 * (o.rot > 3 ? 1 : -1) : 0); });   // las latas que ya cayeron se quedan tiradas en la tarima
      drawCrowd();
      if (S.done && IMP){   // se apagan las luces
        const k = Math.min(1, (T - S.off)/.25); ctx.globalAlpha = .62*k; r(0, 0, W, H, '#000'); ctx.globalAlpha = 1; drawHUD(this.label);   // queda oscuro, pero se alcanza a ver a la banda
        if (T - S.off > .8){ r(20, 266, 200, 46, '#000000cc'); r(20, 266, 200, 1, '#ff4d6d'); r(20, 311, 200, 1, '#ff4d6d');
          vtxt('Se va la luz.', 120, 274, '#f4f1f8', 'center', '#000'); if (T - S.off > 1.8) vtxt('El concierto se cancela.', 120, 292, '#ff4d6d', 'center', '#000'); }
        return; }
      if (S.done){ S.doneT ??= T; clock = '11:05'; drawConfetti(S.doneT); drawHUD(this.label); return; }
      // pista en perspectiva sobre el piso del escenario
      ctx.globalAlpha = .55; ctx.fillStyle = '#0b0718'; ctx.beginPath(); ctx.moveTo(85,TOP); ctx.lineTo(155,TOP); ctx.lineTo(195,BOT); ctx.lineTo(45,BOT); ctx.fill(); ctx.globalAlpha = 1;
      for (let i=0;i<=4;i++){ ctx.strokeStyle = i%4 ? '#3b2f66' : '#9b6bff'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(85+70*i/4,TOP); ctx.lineTo(45+150*i/4,BOT); ctx.stroke(); }
      const off = (T*1.6) % 1; for (let j=0;j<9;j++){ const y = yOf((j + off)/9), ww = wAt(y); r(120-ww/2, y, ww, 1, '#3b2f66'); }
      for (let i=0;i<4;i++) if (S.press[i] > 0){ ctx.globalAlpha = .18; ctx.fillStyle = LC[i]; ctx.beginPath(); ctx.moveTo(85+70*i/4,TOP); ctx.lineTo(85+70*(i+1)/4,TOP); ctx.lineTo(45+150*(i+1)/4,BOT); ctx.lineTo(45+150*i/4,BOT); ctx.fill(); ctx.globalAlpha = 1; }
      S.notes.slice().sort((a,b) => a.k - b.k).forEach(n => {
        if (n.len > 0){ const k0 = Math.min(n.k, 1), k1 = Math.max(0, n.k - n.len); if (k1 < k0) for (let y = yOf(k1); y < yOf(k0); y += 2){ const sc = .45 + .55*(y-TOP)/(HIT-TOP); r(lx(n.lane,y) - 3*sc, y, 6*sc, 2, n.held ? '#ffffff' : LC[n.lane]); } }
        if (n.held || n.k < 0) return;
        const y = yOf(n.k), sc = .45 + .55*Math.min(1,(y-TOP)/(HIT-TOP)), x = lx(n.lane, y), ww = 28*sc, hh = 9*sc;
        r(x-ww/2, y-hh/2, ww, hh, LC[n.lane]); r(x-ww/2+2, y-hh/2, ww*.45, hh*.35, '#ffffffaa'); r(x-ww/2, y+hh/2-1, ww, 1, '#0008');
      });
      const BWl = Math.floor(wAt(BY)/4) - 4;
      for (let i=0;i<4;i++){ const x = bx(i), on = S.press[i] > 0;
        r(x-BWl/2-1, HIT+2, BWl+2, 22, '#000'); r(x-BWl/2, HIT+3, BWl, 20, on ? '#ffffff' : LC[i]); r(x-BWl/2+2, HIT+5, BWl-4, 16, LC[i]); r(x-BWl/2+2, HIT+5, BWl-4, 3, '#ffffff66'); r(x-BWl/2+2, HIT+18, BWl-4, 3, '#0005');
        if (on){ ctx.globalAlpha = .5; r(x-BWl/2-4, HIT-6, BWl+8, 4, LC[i]); ctx.globalAlpha = 1; } }
      S.fx.forEach(f => { const k = f.t/.3, x = bx(f.lane); ctx.globalAlpha = 1-k; r(x-20-k*10, HIT-3, 40+k*20, 6, LC[f.lane]); ctx.globalAlpha = 1; });
      if (S.rateT > 0) vtxt(S.rate, 120, 316, S.rateC, 'center', '#000');
      if (IMP && S.throws) S.throws.forEach(o => { const u = (T - o.t0)/1.4; if (u >= 1.6) return;   // vuelan más lento
        if (u < 1){ const x = o.x0 + (o.tx - o.x0)*u, y = 420 + (o.ty - 420)*u - Math.sin(u*Math.PI)*120;
          if (o.k === 'lata') drawCan(o, x, y, u*8 + o.rot);
          else { ctx.save(); ctx.translate(Math.round(x), Math.round(y)); ctx.rotate(u*8 + o.rot); r(-6, -3, 12, 6, '#2b8a4a'); r(-5, -2, 3, 1, '#9be8b4'); r(2, -2, 3, 1, '#9be8b4'); ctx.restore(); } }
        else { ctx.globalAlpha = Math.max(0, 1 - (u - 1)/.6); vtxt('¡PLAF!', o.tx, o.ty - 12, C.gold, 'center', '#000'); ctx.globalAlpha = 1; } });
      // medidor de rock y multiplicador
      r(8,110,10,120,'#160f2b'); r(9,111,8,40,'#3dff8a'); r(9,151,8,40,'#ffd34d'); r(9,191,8,38,'#ff2e4d'); r(5, 228 - S.meter*116, 16, 3, '#fff'); vtxt(IMP ? 'Público' : 'Rock', IMP ? 22 : 13, 234, '#8a80a8', 'center');
      if (mult() > 1) vtxt('x' + mult(), 228, 66, C.gold, 'right', '#000'); if (stats.combo >= 5) vtxt('Combo ' + stats.combo, 228, 78, C.gold, 'right', '#000');
      vtxtw('Toca los 4 botones cuando lleguen las notas; mantén en las largas', 120, 396, 220, '#8a80a8', 'center');
      drawHUD(this.label);
      // encabezado: partes de la canción
      r(0, 30, W, 30, '#0b0718cc'); r(0, 59, W, 1, '#ffd34d33');
      vtxt(S.t < 0 ? '¡Uno, dos, tres, cuatro!' : P.name + ' · ' + P.who, 120, 33, C.gold, 'center', '#000');
      { let x = 8; const ww = W - 16; PARTS.forEach((p, i) => { const w2 = Math.round(ww * p.dur / TOTAL) - 2, on = i === pi && S.t >= 0, done = i < pi;
          r(x, 47, w2, 6, on ? C.gold : done ? '#6a5a2a' : '#2a2240'); if (on){ const pr = Math.max(0, Math.min(1, (S.t - PARTS.slice(0, i).reduce((s, q) => s + q.dur, 0)) / p.dur)); r(x, 47, Math.round(w2 * pr), 6, '#fff1b0'); } x += w2 + 2; }); }
    },
    down(x, y, id){ if (S.done || y < 200) return;
      const lane = laneOf(x); S.press[lane] = .12;
      let best = null, bd = 99; S.notes.forEach(n => { if (n.lane === lane && !n.hit){ const d = Math.abs(n.k - 1); if (d < bd){ bd = d; best = n; } } });
      if (best && bd <= .14 / best.D){ hit(best, best.k - 1); if (best.held) best.holding = id; S.holdId[id] = best; }
      else { stats.combo = 0; S.meter = Math.max(.02, S.meter - .02); }
    },
    up(id){ const n = S.holdId[id]; if (n){ if (n.held) n.holding = undefined; delete S.holdId[id]; } }
  };
}

// ===== RETO FINAL 2: el trancón de Bogotá (vista desde arriba, 4 carriles) =====
// Vehículos de Sergio vistos desde arriba (9 cuadros de ralentí). [lado del cuadro, cuadros, centro x, centro y, ancho, alto]
const VEH_META = {"kmovil":[80,9,40,39.5,46,49],"carga":[85,9,43,42,36,48],"furgon":[85,9,43,43,40,52],"convertible":[85,9,43,42,42,56],"gris":[68,9,34.5,34,37,40],"vintage":[85,9,43,42.5,40,53],"azul":[68,9,34.5,34.5,39,41],"policia":[85,9,43,41.5,40,51],"militar":[68,9,34.5,34.5,35,49],"plateada":[85,9,43,40.5,36,47],"deportivo":[85,9,43.5,43.5,39,71],"naranja":[85,9,43,43,40,58],"campero":[85,9,43,42,40,52],"oxidado":[85,9,43,42.5,38,59],"taxi":[68,9,34.5,34,35,46],"negro":[85,9,43,43,38,56]};
const VEH = {}; for (const k in VEH_META){ VEH[k] = new Image(); VEH[k].src = 'veh_' + k + '.png'; }
const TRAFFIC_CARS = Object.keys(VEH_META).filter(k => k !== 'kmovil');
// motos vistas desde arriba (64×64, 9 cuadros); se dibujan al 62 % para que queden proporcionadas con los carros
const MOTOS = ['blanca','amarilla','roja','scooter'], MOTO_IMG = {}; MOTOS.forEach(k => { MOTO_IMG[k] = new Image(); MOTO_IMG[k].src = 'moto_' + k + '.png'; });
const MOTO_SC = .72;
function drawMoto(k, x, y, o={}){ const img = MOTO_IMG[k], s = Math.round(64*MOTO_SC);
  if (img.complete && img.naturalWidth){ const f = Math.floor((T + (o.ph || 0))*8) % 9; ctx.imageSmoothingEnabled = false; ctx.drawImage(img, f*64, 0, 64, 64, Math.round(x - s/2), Math.round(y - s/2), s, s); }
  else r(x - 8, y - 18, 16, 36, '#888');
  if (o.warn){ const a = (T*6) % 1 < .6; if (a){ const ax = x + o.warn*14; ctx.fillStyle = '#ffd34d'; ctx.beginPath(); ctx.moveTo(ax + o.warn*6, y - 14); ctx.lineTo(ax, y - 19); ctx.lineTo(ax, y - 9); ctx.closePath(); ctx.fill(); } } }
// ayudas del trancón: gorra (escudo), pollito (turbo) y cerveza de El Chorro (+1 vida) — dibujos de Sergio
function drawCan(o, x, y, rot){ ctx.save(); ctx.translate(Math.round(x), Math.round(y)); ctx.rotate(rot);
  if (o.k === 'lata'){ const im = LATAS[o.can]; if (im.complete && im.naturalWidth){ ctx.imageSmoothingEnabled = false; ctx.drawImage(im, -Math.round(im.naturalWidth/2), -Math.round(im.naturalHeight/2)); } }
  else { r(-6, -3, 12, 6, '#2b8a4a'); r(-5, -2, 3, 1, '#9be8b4'); r(2, -2, 3, 1, '#9be8b4'); }
  ctx.restore(); }
const LATAS = ['verde','azul','roja'].map(k => Object.assign(new Image(), { src:'item_lata_' + k + '.png' }));
const TR_GORRA = new Image(); TR_GORRA.src = 'item_gorra.png'; const TR_BEER = new Image(); TR_BEER.src = 'item_cerveza.png';
function drawTrafficItem(k, x, y){
  if (k === 'pollo') return ITEM.pollo(x, y);
  const img = k === 'gorra' ? TR_GORRA : TR_BEER;
  if (!img.complete || !img.naturalWidth) return k === 'gorra' ? spr(SP.CAP, x - 12, y - 6, capPal('#e0263f'), 2) : ITEM.chorro(x, y);
  ctx.imageSmoothingEnabled = false;
  if (k === 'gorra') ctx.drawImage(img, Math.round(x - 14), Math.round(y - 11), 28, 22); else ctx.drawImage(img, 10, 4, 33, 42, Math.round(x - 9), Math.round(y - 12), 18, 23); }
const ROAD_L = 20, LANE_W = 50, LANES_X = [45, 95, 145, 195], KM_Y = 336;
function drawVeh(k, x, y, o={}){
  const m = VEH_META[k], img = VEH[k]; if (!m) return;
  if (img.complete && img.naturalWidth){ const f = Math.floor((T + (o.ph || 0)) * 7) % m[1];
    ctx.drawImage(img, f*m[0], 0, m[0], m[0], Math.round(x - m[2]), Math.round(y - m[3]), m[0], m[0]); }
  else r(x - m[4]/2, y - m[5]/2, m[4], m[5], '#556');
  if (o.blink){ const on = (T*4) % 1 < .62; if (on){ const sx = o.blink < 0 ? x - m[4]/2 + 2 : x + m[4]/2 - 5; r(sx, y - m[5]/2 + 3, 3, 3, '#ffb020'); r(sx, y + m[5]/2 - 6, 3, 3, '#ffb020'); ctx.globalAlpha = .35; r(sx - 3, y - m[5]/2, 9, 9, '#ffb020'); r(sx - 3, y + m[5]/2 - 9, 9, 9, '#ffb020'); ctx.globalAlpha = 1; } }
}
// la vía: andenes con postes de luz, 4 carriles con líneas blancas punteadas, pavimento mojado de noche
function drawRoad(scroll, obra){
  r(0, 0, W, H, '#1f1d26');
  // andenes
  for (const sx of [0, 220]){ r(sx, 0, 20, H, '#3a3644'); for (let y = -24 + scroll % 24; y < H; y += 24) r(sx, Math.round(y), 20, 1, '#2c2934'); r(sx === 0 ? 18 : 220, 0, 2, H, '#7a7486'); }
  // pavimento con parches
  r(ROAD_L, 0, 200, H, '#28262f');
  for (let i = 0; i < 9; i++){ const y = ((i*97 + scroll) % 520) - 60, x = ROAD_L + (i*61 % 170); r(x, Math.round(y), 24 + i%3*8, 10 + i%2*6, i%2 ? '#2d2b35' : '#24222b'); }
  // reflejos de agua
  ctx.globalAlpha = .18; for (let i = 0; i < 6; i++){ const y = ((i*131 + scroll) % 500) - 40; r(ROAD_L + 10 + (i*47 % 160), Math.round(y), 14, 2, '#8fb6ff'); } ctx.globalAlpha = 1;
  // líneas
  r(ROAD_L + 2, 0, 2, H, '#d8d4e4'); r(ROAD_L + 196, 0, 2, H, '#d8d4e4');
  for (let l = 1; l < 4; l++) for (let y = -40 + scroll % 40; y < H; y += 40) r(ROAD_L + l*LANE_W - 1, Math.round(y), 2, 20, '#e8e4f2');
  // postes de luz y su luz cálida sobre la vía
  for (let y = -140 + scroll % 140; y < H + 20; y += 140){ const yy = Math.round(y);
    for (const side of [0, 1]){ const px = side ? 228 : 12, lx = side ? 196 : 44, ly = yy + (side ? 70 : 0);
      const g = ctx.createRadialGradient(lx, ly, 0, lx, ly, 46); g.addColorStop(0, 'rgba(255,214,140,.16)'); g.addColorStop(1, 'rgba(255,214,140,0)'); ctx.fillStyle = g; ctx.fillRect(lx - 46, ly - 46, 92, 92);
      r(px - 3, ly - 3, 6, 6, '#14121a'); r(px - 2, ly - 2, 4, 4, '#55505f'); r(side ? px - 22 : px + 2, ly - 1, 20, 2, '#55505f'); r(side ? px - 24 : px + 20, ly - 2, 5, 4, '#ffe2a0'); } }
  r(0, 0, W, H, 'rgba(8,5,24,.28)');   // velo oscuro
}
const CONO = Object.assign(new Image(), { src:'item_cono.png' });   // cono de tráfico (dibujo de Sergio), reducido a escala de los carros
function drawCone(x, y){ if (!(CONO.complete && CONO.naturalWidth)) return; const w = CONO.naturalWidth, h = CONO.naturalHeight; ctx.globalAlpha = .35; r(x - w/2 + 1, y + h/2 - 2, w - 2, 2, '#000'); ctx.globalAlpha = 1; ctx.imageSmoothingEnabled = false; ctx.drawImage(CONO, Math.round(x - w/2), Math.round(y - h/2)); }
function drawHole(x, y, w, h){ ctx.fillStyle = '#5a5664'; ctx.beginPath(); ctx.ellipse(x, y, w/2 + 2, h/2 + 2, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#0d0b12'; ctx.beginPath(); ctx.ellipse(x, y, w/2, h/2, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#1c2236'; ctx.beginPath(); ctx.ellipse(x + 2, y + 1, w/2 - 4, h/2 - 3, 0, 0, 7); ctx.fill(); ctx.globalAlpha = .5; r(x - w/4, y - 1, w/3, 1, '#8fb6ff'); ctx.globalAlpha = 1; }
function drawObraSign(x, y){ r(x - 1, y + 10, 2, 8, '#55505f'); ctx.fillStyle = '#ff8a1a'; ctx.beginPath(); ctx.moveTo(x, y - 17); ctx.lineTo(x + 17, y); ctx.lineTo(x, y + 17); ctx.lineTo(x - 17, y); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#111'; ctx.lineWidth = 1; ctx.stroke(); vtxt('OBRA', x, y - 3, '#111', 'center'); }
// 15 días después: el Kabbaret Móvil entra por abajo y queda en el trancón (los diálogos pasan aquí)
const JAM = [[0,96,'taxi'],[0,226,'furgon'],[1,60,'naranja'],[1,190,'gris'],[2,120,'policia'],[2,262,'oxidado'],[3,80,'campero'],[3,214,'negro'],[3,346,'plateada'],[0,360,'azul']];
function sceneTrafficIntro(fromCeleb){
  const t0 = T, prev = fromCeleb ? sceneFinalCelebrate() : null;
  return { label:'RETO 2/3', update(){}, draw(){
    const t = T - t0;
    if (prev && t < .6){ prev.draw(); ctx.globalAlpha = Math.min(1, t/.6); r(0, 0, W, H, '#000'); ctx.globalAlpha = 1; return; }
    const sc = (T*22) % 1e6; drawRoad(sc);
    JAM.forEach(([l, y, k], i) => drawVeh(k, LANES_X[l], y + Math.sin(T*.8 + i)*1.5, { ph:i*.3 }));
    const u = Math.min(1, Math.max(0, (t - .6)/2.2)), e = 1 - Math.pow(1 - u, 3);
    drawVeh('kmovil', LANES_X[1], 470 - (470 - KM_Y)*e);
    drawHUD(this.label);
    if (prev && t < 1.2){ ctx.globalAlpha = 1 - Math.min(1, (t - .6)/.6); r(0, 0, W, H, '#000'); ctx.globalAlpha = 1; }
  }, tap(){} };
}
function sceneTraffic(){
  // la dificultad sube poco a poco con el avance (p de 0 a 1); los tramos solo cambian el tipo de obstáculos
  const TRAMOS = [ { name:'Calle 80', at:0 }, { name:'Avenida Boyacá · en obras', at:30 }, { name:'Calle 26', at:65 } ];
  const diff = d => { const p = Math.min(1, d/100), ti = d >= 65 ? 2 : d >= 30 ? 1 : 0;
    return { gap: 1.7 - .85*p, cars: Math.max(0, p - .15)*.6, chg: p < .2 ? 0 : .08 + .3*p, holes: ti === 1 ? .3 : .12 + .05*ti, obra: ti === 1 ? .22 : ti === 2 ? .06 : 0,
             motos: p < .22 ? 0 : .12 + .25*p, zig: p < .3 ? 0 : .35 + .5*p, speed: 115 + 55*p }; };
  const S = { lane:1, x:LANES_X[1], dist:0, scroll:0, spawn:1.2, objs:[], shield:false, turbo:0, inv:0, done:false, tramo:-1, banner:0, shake:0 };
  if (window.DEV_HOOK) window.__traffic = S;
  const tramoAt = d => d >= TRAMOS[2].at ? 2 : d >= TRAMOS[1].at ? 1 : 0;
  // ocupación de cada carril cerca del borde superior (para no cerrar los 4 carriles a la vez)
  const busy = (l, y0, y1, f = () => true) => S.objs.some(o => !o.dead && f(o) && (o.lane === l || o.lane2 === l || o.to === l) && o.y + o.h/2 > y0 && o.y - o.h/2 < y1);
  const freeLanes = () => [0,1,2,3].filter(l => !busy(l, -200, 40));
  function spawn(T0){
    const free = freeLanes(); if (free.length <= 1) return;           // siempre queda al menos un carril libre
    const pick = () => free.splice(Math.random()*free.length|0, 1)[0];
    const r1 = Math.random();
    if (Math.random() < .1){ const l = pick(); S.objs.push({ k: lives < 3 && Math.random() < .3 ? 'chorro' : (Math.random() < .5 ? 'gorra' : 'pollo'), lane:l, x:LANES_X[l], y:-30, h:20, w:20, item:true }); return; }
    if (Math.random() < T0.motos){ const l = pick(); S.objs.push({ k:MOTOS[Math.random()*4|0], moto:true, lane:l, x:LANES_X[l], y:-30, w:16, h:32, v:55 + Math.random()*35, ph:Math.random()*2, zig: Math.random() < T0.zig, zt:1 + Math.random() }); return; }
    if (r1 < T0.obra && free.length >= 2){ const l = pick(); if (busy(l, -200, H, o => o.car || o.moto)) return; const n = 4 + (Math.random()*3|0), h = n*30 + 40;
      S.objs.push({ k:'obra', lane:l, x:LANES_X[l], y:-h/2, h, w:30, n, stat:true }); return; }
    if (r1 < T0.obra + T0.holes){ const l = pick(); if (busy(l, -100, H, o => o.car || o.moto)) return; S.objs.push({ k:'hueco', lane:l, x:LANES_X[l], y:-16, h:16, w:28, stat:true }); return; }
    const nCars = Math.random() < T0.cars ? 2 : 1;
    for (let i = 0; i < nCars && free.length > 1; i++){ const l = pick(), k = TRAFFIC_CARS[Math.random()*TRAFFIC_CARS.length|0], m = VEH_META[k];
      S.objs.push({ k, car:true, lane:l, x:LANES_X[l], y:-m[5]/2 - 10 - i*40, w:m[4] - 8, h:m[5] - 8, v:25 + Math.random()*50, ph:Math.random()*2, chgT:-1 }); }
  }
  function crash(o){
    if (S.turbo > 0) { o.bump = true; return; }
    if (S.inv > 0) return;
    if (S.shield){ S.shield = false; S.inv = 1; addBubble('¡LA GORRA TE SALVÓ!', 120, 200, C.cyan, 'v', 1.8); SFX.thud(); return; }
    S.inv = 1.6; S.shake = .3; SFX.thud();
    loseLife([['p_maito.jpg','MAITO','¡Noooooo, Mónicaaaa!'],['p_cami.jpg','CAMI','¡Eso está lleno de huecos, gas!'],['p_mao.jpg','MAO','Eso no es así madre'],['p_dave.jpg','DAVE','¡El pollito se regó!']][Math.random()*4|0]);
  }
  return { label:'RETO 2/3',
    update(dt){
      if (S.inv > 0) S.inv -= dt; if (S.turbo > 0) S.turbo -= dt; if (S.banner > 0) S.banner -= dt; if (S.shake > 0) S.shake -= dt;
      S.x += (LANES_X[S.lane] - S.x) * Math.min(1, dt*12);
      if (S.done){ S.kv = (S.kv || 80) + 300*dt; S.ky = (S.ky ?? KM_Y) - S.kv*dt; S.scroll += 160*dt; return; }   // al llegar, el Kabbaret Móvil sigue y sale por arriba
      const ti = tramoAt(S.dist), T0 = diff(S.dist);
      if (ti !== S.tramo){ S.tramo = ti; S.banner = 2.2; if (ti) SFX.ding(); }
      const sp = (S.turbo > 0 ? 1.5 : 1) * T0.speed;
      S.scroll += sp*dt; S.dist += dt * (S.turbo > 0 ? 2.2 : 1.35);   // unos 75 segundos
      { const mins = 40 + Math.floor(S.dist*.45), h = 6 + Math.floor(mins/60); clock = h + ':' + String(mins % 60).padStart(2, '0'); }
      S.spawn -= dt; if (S.spawn <= 0 && S.dist < 96){ spawn(T0); S.spawn = T0.gap * (.8 + Math.random()*.4); }
      // autos: un auto que alcanza a otro en su carril frena a su velocidad; algunos ponen la direccional y cambian de carril
      const cars = S.objs.filter(o => o.car), movers = S.objs.filter(o => o.car || o.moto);
      movers.forEach(o => movers.forEach(p => { if (p !== o && (p.lane === o.lane || p.to === o.lane) && p.y > o.y && p.y - o.y < (p.h + o.h)/2 + 22 && o.v < p.v) o.v = p.v; }));
      cars.forEach(o => {
        if (o.chgT < 0 && o.to === undefined && o.y > 30 && o.y < 200 && Math.random() < T0.chg*dt){ const d = Math.random() < .5 ? -1 : 1, nl = o.lane + d;
          if (nl >= 0 && nl <= 3 && !busy(nl, o.y - 110, o.y + 110)){ o.to = nl; o.dir = d; o.chgT = 1.1; } }
        if (o.chgT > 0){ o.chgT -= dt; if (o.chgT <= 0){ o.lane2 = o.lane; o.lane = o.to; o.chgT = -2; } }
        if (o.chgT === -2){ o.x += (LANES_X[o.lane] - o.x) * Math.min(1, dt*3.2); if (Math.abs(LANES_X[o.lane] - o.x) < 1){ o.x = LANES_X[o.lane]; o.lane2 = undefined; o.to = undefined; o.chgT = -3; } } });
      S.objs.filter(o => o.moto).forEach(o => {
        if (o.warnT > 0){ o.warnT -= dt; if (o.warnT <= 0){ o.lane2 = o.lane; o.lane = o.to; o.mv = true; } }
        else if (o.mv){ o.x += (LANES_X[o.lane] - o.x) * Math.min(1, dt*4); if (Math.abs(LANES_X[o.lane] - o.x) < 1){ o.x = LANES_X[o.lane]; o.mv = false; o.lane2 = undefined; o.to = undefined; o.zt = 1.2 + Math.random()*1.2; } }
        else if (o.zig && o.y > 20 && o.y < 230 && (o.zt -= dt) <= 0){ const d = o.lane === 0 ? 1 : o.lane === 3 ? -1 : (Math.random() < .5 ? -1 : 1), nl = o.lane + d;
          if (!busy(nl, o.y - 70, o.y + 70, q => q !== o)){ o.to = nl; o.dir = d; o.warnT = .7; } else o.zt = .5; } });
      S.objs.forEach(o => { o.y += (sp - (o.v || 0)) * dt;
        if (o.bump){ o.x += (o.x < S.x ? -1 : 1) * 160 * dt; }
        const hit = Math.abs(o.x - S.x) < (o.w + 30)/2 - (o.moto ? 2 : 4) && Math.abs(o.y - KM_Y) < (o.h + 42)/2 - 6;
        if (!hit || o.hit) return;
        if (o.item){ o.dead = true;
          if (o.k === 'gorra'){ S.shield = true; addBubble('¡ESCUDO DE GORRA!', 120, 220, C.ok, 'v', 1.8); SFX.ding(); }
          else if (o.k === 'pollo'){ S.turbo = 2.5; addBubble('¡TURBO POLLITO!', 120, 220, C.gold, 'v', 1.8); SFX.beer(); }
          else { lives = Math.min(3, lives + 1); addBubble('¡EL CHOOORRO!\n+1 VIDA', 120, 220, C.gold, 'v', 1.8); SFX.life(); } return; }
        o.hit = true; crash(o); });
      S.objs = S.objs.filter(o => !o.dead && o.y - o.h/2 < H + 20 && o.x > -60 && o.x < W + 60);
      if (S.dist >= 100){ S.done = true; clock = '7:25'; win('¡LLEGAMOS!'); setTimeout(stepDone, 2200); }
    },
    draw(){
      ctx.save(); if (S.shake > 0) ctx.translate((Math.random()*4 - 2)|0, (Math.random()*4 - 2)|0);
      drawRoad(S.scroll);
      S.objs.filter(o => o.stat).forEach(o => {
        if (o.k === 'obra'){ const top = o.y - o.h/2; drawObraSign(o.x, o.y + o.h/2 - 17); for (let i = 0; i < o.n; i++) drawCone(o.x, top + 10 + i*30); ctx.globalAlpha = .25; r(o.x - 14, top, 28, o.h - 26, '#ff8a1a'); ctx.globalAlpha = 1; }
        else drawHole(o.x, o.y, o.w, o.h); });
      S.objs.filter(o => o.item).forEach(o => { const y = o.y + Math.sin(T*6)*2; ctx.globalAlpha = .35; ctx.fillStyle = '#ffd34d'; ctx.beginPath(); ctx.arc(o.x, y, 13, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
        drawTrafficItem(o.k, o.x, y); });
      S.objs.filter(o => o.moto).forEach(o => drawMoto(o.k, o.x, o.y, { ph:o.ph, warn: o.warnT > 0 ? o.dir : 0 }));
      S.objs.filter(o => o.car).sort((a, b) => a.y - b.y).forEach(o => drawVeh(o.k, o.x, o.y, { ph:o.ph, blink: o.chgT > 0 || o.chgT === -2 ? o.dir : 0 }));
      ctx.globalAlpha = S.inv > 0 && (T*12|0) % 2 ? .45 : 1; drawVeh('kmovil', S.x, S.ky ?? KM_Y); ctx.globalAlpha = 1;
      if (S.shield){ ctx.strokeStyle = C.ok; ctx.lineWidth = 2; ctx.globalAlpha = .7 + .3*Math.sin(T*8); ctx.beginPath(); ctx.ellipse(S.x, S.ky ?? KM_Y, 26, 32, 0, 0, 7); ctx.stroke(); ctx.globalAlpha = 1; }
      if (S.turbo > 0) for (let i = 0; i < 5; i++) r(S.x - 10 + i*5, (S.ky ?? KM_Y) + 26 + Math.random()*12, 3, 6, i%2 ? C.orange : C.gold);
      ctx.restore();
      drawHUD(this.label);
      const ti = Math.max(0, S.tramo);
      r(0, 30, W, 24, '#0b0718cc'); r(0, 53, W, 1, '#ffd34d33');
      vtxt('Tramo ' + (ti + 1) + ' · ' + TRAMOS[ti].name, 120, 33, C.gold, 'center', '#000');
      r(10, 45, 220, 5, '#2a2240'); r(10, 45, Math.round(220*Math.min(1, S.dist/100)), 5, C.gold); TRAMOS.forEach(t => t.at && r(10 + Math.round(220*t.at/100), 44, 1, 7, '#fff8'));
      vtxt('Arena', 230, 56, '#8a80a8', 'right');
      if (S.banner > 0 && S.tramo >= 0){ const a = Math.min(1, S.banner*2); ctx.globalAlpha = a; r(20, 150, 200, 36, '#0b0718dd'); r(20, 150, 200, 1, C.gold); r(20, 185, 200, 1, C.gold);
        vtxt('Tramo ' + (ti + 1), 120, 155, '#8a80a8', 'center'); vtxt(TRAMOS[ti].name, 120, 168, C.gold, 'center', '#000'); ctx.globalAlpha = 1; }
      ctx.globalAlpha = .85; r(0, 392, W, 28, '#0b0718'); ctx.globalAlpha = 1;
      vtxtw('Toca a la izquierda o a la derecha para cambiar de carril', 120, 396, 220, '#8a80a8', 'center');
    },
    tap(x, y){ if (S.done || y < 60) return; S.lane = Math.max(0, Math.min(3, S.lane + (x < 120 ? -1 : 1))); tone(300, .03, 'square', .03); }
  };
}


const L6 = {
  key:'final', n:6, venue:'rxfinal', fans:.6, ficha:false,
  onStart(){ camiFails = 0; },
  barks:[['p_mao.jpg','MAO','Eso no es así madre'],['p_cami.jpg','CAMI','¡RE PERRRO!'],['p_maito.jpg','MAITO','¡Noooooo, Mónicaaaa!'],['p_dave.jpg','DAVE','¿Vamos por pollito?'],['p_checho.jpg','CHECHO','¡Heeeeey, concentración!']],
  intro:[
    { who:'narr', text:'11:00 p.m. en punto. Rock Express está lleno. Afrodita baja de la tarima… y suben los cinco de Kabbaret.', fx(){ VENUE = 'rxfinal'; setStage(sceneIdle({ cast:FINAL, label:'FINAL' })); setMood(1,2); } },
    { who:'ricardo', text:'Muy bien, Kabbaret. Una canción. Convénzanme.' },
    { who:'checho', text:'Heeeeeey… heeeeey… ¡Uno, dos, tres, cuatro!' }
  ],
  idle:FINAL,
  steps:[
    { id:'song', clock:'11:00', music:'anthem', scene:sceneFinalSong, hint:'Tip: mira arriba en qué parte de la canción van; en el coro y el final llegan acordes.',
      before:[{ who:'narr', text:'RETO FINAL 1 · La audición. Los cinco tocan juntos la canción completa: intro, verso, pre-coro, coro, solo y final. Toca los botones de colores cuando lleguen las notas y mantén presionado en las largas.' }] },
    { id:'traffic', clock:'6:40', music:'rock', scene:sceneTraffic, hint:'Tip: mira la direccional de los carros: si titila, se van a pasar de carril.',
      before:[
        { who:'ricardo', text:'¡El puesto es suyo! En 15 días abren para Mötley Brüe en la Arena Capital.', fx(){ VENUE = 'rxfinal'; clock = '11:05'; setStage(sceneFinalCelebrate()); SFX.hey(); } },
        { who:'narr', text:'15 días después. Sábado, 6:40 p.m. Maito arranca el Kabbaret Móvil, con toda la banda adentro… y se mete al peor trancón de Bogotá.', fx(){ setStage(sceneTrafficIntro(true)); setMusic('calm'); setMood(0,0); } },
        { who:'dave', text:'El GPS dice que llegamos en 2 horas. El show es en 50 minutos.' },
        { who:'maito', text:'Tranquilos, que el Kabbaret Móvil nunca nos ha fallado. ¡Paaasfe lo que passfe, llegamos!' },
        { who:'narr', text:'RETO FINAL 2 · El trancón. Maito maneja el Kabbaret Móvil por una vía de 4 carriles: toca a la izquierda o a la derecha para cambiar de carril. Esquiva los carros, los huecos y los conos de las obras, y ojo con la direccional: si titila, ese carro se va a cambiar de carril. La gorra es escudo, el pollito es turbo y El Chorro da vida.' } ] },
    { id:'save', clock:'7:30', music:'anthem', venue:'arena', scene:() => sceneFinalSong({ impossible:true }), hint:'Tip: este reto es muy, muy difícil… da todo lo que tengas.',
      vs:{ boss:'ricardo', flip:true, desc:'Dos horas de show para un público que espera a Mötley Brüe. Da todo lo que tengas.', name:'¡SALVAR EL CONCIERTO!', cls:'2 HORAS DE SHOW', moves:['PACIENCIA','BUUU','¿Y MÖTLEY BRÜE?','SIN PLAN B'] },
      before:[
        { who:'narr', text:'7:30 p.m. Arena Capital. Más de 1.500 personas. Kabbaret abre el concierto como telonero de Mötley Brüe.', fx(){ VENUE = 'arena'; setStage(sceneIdle({ cast:FINAL, party:true, label:'ARENA' })); setMood(1,2); setMusic('anthem'); } },
        { who:'ricardo', text:'Muchachos, malas noticias. Mötley Brüe se quedó atrapado en Miami. No van a llegar.', fx(){ setMood(0,0); } },
        { who:'ricardo', text:'Tengo que cancelar el concierto. Lo siento.' },
        { who:'checho', text:'Espera, Ricardo. Nosotros podemos tocar las dos horas.' },
        { who:'ricardo', text:'¿Dos horas? ¿Ustedes?' },
        { who:'cami', text:'Y con toda la actitud.' },
        { who:'ricardo', text:'…Ok. Si el público aguanta, no cancelo.' },
        { who:'narr', text:'JEFE FINAL · Salvar el concierto. Igual que en la audición: toca los botones de colores cuando lleguen las notas y mantén presionado en las largas. Mantengan contento al público el mayor tiempo posible.' } ] },
    // el camerino: tristeza y silencios largos que no se pueden saltar
    { id:'camerino', music:'silence', venue:'camerino', scene:() => { setTimeout(stepDone, 30); return sceneIdle({ cast:camCast('noticias'), label:'CAMERINO' }); },
      before:[
        { who:'narr', text:'……', fx(){ VENUE = 'camerino'; fadeIn = 1.2; setStage(sceneIdle({ cast:CAMERINO, label:'CAMERINO' })); setMusic('silence'); setMood(-1, 3); silence(3.4); } },
        { who:'checho', text:'Tranquilos. La dimos toda.' },
        { who:'mao', text:'Kabbaret nunca se rinde, forrillos.' },
        { who:'narr', text:'……', fx(){ silence(3); } },
        { who:'dave', text:'Agh… después de todo lo que pasamos para la audición.' },
        { who:'narr', text:'……', fx(){ silence(3); } },
        { who:'cami', text:'¡Re perrrro!' },
        { who:'narr', text:'(Todos, desanimados.)', fx(){ setMood(-1, 3); } },
        { who:'narr', text:'……', fx(){ silence(3.6); } },
        { who:'narr', text:'Suena el celular de Maito: DIEGO RODRÍGUEZ · RED SPOT STUDIO.', fx(){ SFX.ring(); camIdle('celular'); } },
        { who:'maito', text:'¿Aló? ¿Diego?' },
        { who:'diego', text:'¡Maito, parcero! Me enteré de lo del concierto. Qué mala suerte, pero ustedes tocaron con todo.' },
        { who:'diego', text:'Oiga, necesito un favor. Nos invitaron a cerrar el Festival Rock de los Cerros, pero tenemos un compromiso fuera del país y nos queda imposible.', fx(){ camIdle('sorpresa'); } },
        { who:'diego', text:'Si Kabbaret se anima, serían cabeza de cartel. ¿Nos reemplazan?' },
        { who:'maito', text:'¡Por supuesto! Gracias, Diego.' },
        { who:'narr', text:'(Todo en silencio…)', fx(){ camIdle('noticias'); silence(2.2); } },
        { who:'maito', text:'Muchachos… no van a creer esto.', fx(){ setMood(1, 2); } } ] },
    // la última tarima: Mao cuenta y el juego termina
    { id:'festival', clock:'9:00', music:'silence', venue:'festival', scene:() => sceneFinaleCount(),
      before:[
        { who:'narr', text:'Días después, 9:00 p.m. Festival Rock de los Cerros.', fx(){ VENUE = 'festival'; fadeIn = 1.4; setStage(sceneFestIdle()); setMusic('silence'); setMood(1,3); } },
        { who:'narr', text:'El esfuerzo no siempre paga cuando uno quiere, ni por la puerta que uno espera. Pero una banda que no se rinde siempre encuentra el camino de vuelta a la tarima.' },
        { who:'mao', text:'Bueno, forrillos, vamos a romperla. ¿Listos?' },
        { who:'banda', text:'¡Listos!', fx(){ SFX.hey(); } } ] },
    // créditos de película
    { id:'creditos', music:'credits', scene:() => sceneMovieCredits(), before:[] }
  ],
  // escena poscréditos
  outro:[
    // la animación arranca sola con el letrero de la hora (no espera toques); el texto se va a los 2,6 s y al sonar el celular entra la llamada
    { who:'narr', text:'Un martes cualquiera, 9:20 a.m.', fx(){ VENUE = 'hogar'; fans = -1; clock = '9:20 a.m.'; fadeIn = 1.2;   /* en casa no hay público */
        setStage(scenePostShow()); setMusic('silence'); setMood(0,0); dlgLock = true; dlgLockTap = null;
        setTimeout(() => { if (typing){ clearInterval(typing); typing = null; } dlg.hidden = true; }, 2600);
        POST.play(() => { POST.phone(); dlgLock = false; dlg.hidden = false; advance(); }); } },
    { who:'checho', text:'¿Aló?' },
    { who:'productor', text:'¿Sergio? ¿El de Kabbaret? Vi el video del Festival Rock de los Cerros. Tres millones de reproducciones.' },
    { who:'checho', text:'¿Tres millones? ¿Quién habla?' },
    { who:'productor', text:'Alguien que produce giras. Siete países. Estadios. El bus ya está listo… pero ¿ustedes lo están?' },
    { who:'checho', text:'¿Esto es una broma? Maito… ¿eres tú?' },
    { who:'productor', text:'No es broma. Solo hay una condición, y sé que no les va a gustar…' },
    { who:'productor', text:'Tendrían que compartir tarima con ellos.' },
    { who:'checho', text:'¿Con quiénes?' },
    { who:'productor', text:'Lo sabes perfectamente.', fx(){ dlgLock = true; dlgLockTap = null;   // un instante y corte abrupto
        setTimeout(() => { if (typing){ clearInterval(typing); typing = null; } dlg.hidden = true; setMusic('silence'); setStage(sceneCut(() => { dlgLock = false; advance(); })); }, 1700); } }
  ]
};
