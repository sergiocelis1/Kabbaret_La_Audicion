'use strict';
/* =========================================================
   PERSONAJES: guitarristas/bajista, baterista, cantante, jefes en tarima
   ========================================================= */
const LOOK = {
  checho:{ skin:'#c98a5e', light:'#e0a67a', shade:'#9a6440', hair:'#17100c', beard:'#2a1b14', long:false, cap:false, collar:null, tee:'#0c0a10', logo:'#d9d4e6', mx:false, guitar:'ibanez', shoe:'#262a35', stripe:'#29c9b5', toe:'#e9e9f2', pants:'#121018', jacket:'#18141f' },
  maito:{ skin:'#c08055', light:'#d99b6e', shade:'#8f5a38', hair:'#120c0a', beard:'#1f1410', long:true, cap:true, collar:'#c0263a', tee:'#ece8f2', logo:'#222', mx:true, guitar:'explorer', shoe:'#f1eef5', stripe:'#d0102a', toe:'#111', pants:'#141018', jacket:'#18141f' },
  dave:{ skin:'#c88b5c', light:'#dea27a', shade:'#9a6440', hair:'#1a100c', beard:null, stache:true, long:true, curly:true, glasses:true, phones:true, cap:false, collar:'#2a2533', tee:'#1a1622', logo:'#1a1622', mx:false, guitar:'bass', shoe:'#1b1b22', stripe:'#e9e9f2', toe:'#e9e9f2', pants:'#24304a', jacket:'#1d1922' },
  laca:{ skin:'#d29a6e', light:'#e8b48a', shade:'#a06a44', hair:'#f2c14e', beard:null, long:true, glam:true, cap:false, collar:'#d8a84a', tee:'#d29a6e', logo:'#d29a6e', mx:false, guitar:'bolt', shoe:'#1b1b22', stripe:'#ff4fd8', toe:'#1b1b22', pants:'#e8b84a', spots:true, jacket:'#e8b84a' }
};
let capColor = '#e0263f';
function drawGuitarist(x, y, o={}, L=LOOK.checho){
  const u = 2, J = L.jacket, JH = '#45405a', FB = '#2a2135';
  const ox = Math.round(x - 14*u), oy = Math.round(y - 46*u);
  const R = (a,b,w,h,c) => r(ox+a*u, oy+b*u, w*u, h*u, c);
  const px = (a,b,c) => r(ox+a*u, oy+b*u, 1, 1, c);
  const breathe = Math.sin(T*3) > 0 ? 0 : 1;
  const bang = o.bang ? (Math.sin(T*14) > 0 ? 1 : 0) : (o.bangOnce ? 2 : 0);
  const jump = o.jump ? Math.round(Math.abs(Math.sin(T*8))*-6) : 0;
  ctx.save(); ctx.translate(0, jump);
  if (o.flash){ ctx.globalAlpha = .5 + Math.sin(T*40)*.5; }
  ctx.globalAlpha *= .4; r(ox+2*u, oy+45*u, 26*u, 2*u, '#000'); ctx.globalAlpha = o.flash ? .5 + Math.sin(T*40)*.5 : 1;
  const st = o.walk ? Math.sin(T*16) : 0;
  R(6+st*2,29,5,13,L.pants); R(15-st*2,29,5,13,L.pants); R(7+st*2,31,1,9,'#00000033'); R(16-st*2,31,1,9,'#00000033');
  if (L.spots) for (let k=0;k<6;k++){ R(7+st*2,30+k*2,1,1,'#1b1b22'); R(17-st*2,31+k*2,1,1,'#1b1b22'); }
  R(4+st*2,41,8,4,L.shoe); R(15-st*2,41,8,4,L.shoe); R(4+st*2,43,8,1,L.stripe); R(15-st*2,43,8,1,L.stripe); R(4+st*2,41,2,2,L.toe); R(21-st*2,41,2,2,L.toe);
  R(12,30,1,7,'#8d8aa0'); px(12,37,'#d9d4e6');
  r(ox+5*u, oy+14*u+breathe, 17*u, 16*u-breathe, J); R(11,15,5,13,L.tee);
  if (L.spots) for (let k=0;k<8;k++) R(6 + (k*5)%15, 16 + (k*3)%12, 1, 1, '#1b1b22');
  if (L.collar){ R(9,14,3,2,L.collar); R(15,14,3,2,L.collar); }
  if (!L.glam){ R(10,15,1,12,JH); R(16,15,1,12,JH); R(12,19,3,2,L.logo); R(6,16,1,10,'#2a2533'); R(5,16,3,2,'#ffd200'); R(5,18,3,1,'#1a3fbf'); R(5,19,3,1,'#d0102a'); }
  if (L.mx){ R(5,21,1,2,'#0a8a3a'); R(6,21,1,2,'#f1eef5'); R(7,21,1,2,'#d0102a'); }
  if (o.peto){ R(6,15,15,13,'#ff7a1f'); R(11,15,5,4,'#0c0a10'); R(8,20,11,1,'#ffd34d'); R(8,24,11,1,'#ffd34d'); }
  // cabeza
  const hy = bang + (o.sad ? 1 : 0);
  const Hh = (a,b,w,h,c) => r(ox+a*u, oy+(b+hy)*u, w*u, h*u, c);
  if (L.glam){ const fl = Math.sin(T*6) > 0 ? 1 : 0; Hh(3,-5+fl,21,9,L.hair); Hh(4,3,5,14,L.hair); Hh(18,3,5,12,L.hair); Hh(2,0,3,6,'#e0a83a'); Hh(22,0,3,6,'#e0a83a'); Hh(8,-1,11,2,'#ff4fd8'); }
  else if (L.long){ const whip = o.bang ? (Math.sin(T*14) > 0 ? 2 : -1) : 0; Hh(6,2,3,13+whip,L.hair); Hh(18,2,2,10,L.hair); Hh(7,14+whip,3,2,L.hair); if (L.curly){ Hh(5,4,1,8,L.hair); Hh(20,3,1,8,L.hair); Hh(6,15+whip,4,1,L.hair); } }
  Hh(11,11,5,4,L.shade); Hh(9,2,9,10,L.skin); Hh(10,3,3,2,L.light);
  const capOn = L.cap && !o.capOff && capColor !== NOCAP;
  if (capOn){ Hh(8,-1,11,4,capColor); Hh(9,-2,9,1,capColor); Hh(5,1,4,2,capColor); Hh(5,2,4,1,'#00000066'); Hh(12,0,2,1,'#ffffff'); }
  else if (!L.glam){ Hh(9,0,9,3,L.hair); Hh(10,-1,7,1,L.hair); if (L.long) Hh(8,0,2,4,L.hair); }
  if (!L.long && !L.glam){ Hh(8,2,1,4,'#3a2a22'); Hh(18,2,1,4,'#3a2a22'); }
  Hh(10,5,2,1,L.hair === '#f2c14e' ? '#8a5a2a' : L.hair); Hh(15,5,2,1,L.hair === '#f2c14e' ? '#8a5a2a' : L.hair);
  if (T%4 < .12){ Hh(10,6,2,1,L.shade); Hh(15,6,2,1,L.shade); } else { Hh(10,6,2,1,'#1a1010'); Hh(15,6,2,1,'#1a1010'); }
  if (L.glasses){ Hh(9,5,4,3,'#c9c4d6'); Hh(14,5,4,3,'#c9c4d6'); Hh(10,6,2,1,'#1a1010'); Hh(15,6,2,1,'#1a1010'); Hh(13,6,1,1,'#c9c4d6'); }
  if (L.beard) Hh(9,8,9,4,L.beard); else if (L.stache) { Hh(11,8,5,1,'#1a100c'); Hh(12,11,3,1,'#1a100c'); }
  if (L.glam){ Hh(10,7,1,2,'#1b1b22'); Hh(16,7,1,2,'#1b1b22'); Hh(18,7,1,2,'#ffd34d'); }
  Hh(13,7,1,2,L.shade);
  if (o.shout) Hh(12,9,3,2,'#5a1020'); else if (o.laugh){ Hh(11,9,5,2,'#5a1020'); Hh(11,9,5,1,'#f1eef5'); } else if (o.sad) Hh(12,10,3,1,'#5a1020'); else Hh(12,9,3,1, L.beard ? L.skin : '#7a3b2a');
  Hh(8,5,1,2,L.shade); if (!L.phones) Hh(8,6,1,1,'#2a2a33');
  if (L.phones){ Hh(7,4,2,5,'#d0102a'); Hh(18,4,2,5,'#d0102a'); Hh(8,-1,11,1,'#d0102a'); Hh(7,0,1,4,'#d0102a'); Hh(19,0,1,4,'#d0102a'); }
  if (o.hairFace && L.long) Hh(9,3,9,6,L.hair);
  // instrumento
  if (L.guitar === 'ibanez'){
    R(5,22,11,7,'#f4f1f8'); R(3,24,3,5,'#f4f1f8'); R(7,29,7,2,'#f4f1f8'); R(5,28,11,1,'#c9c4d6'); R(8,24,4,1,'#222'); R(8,26,4,1,'#222'); R(13,25,2,2,'#b8b4c4');
  } else if (L.guitar === 'bass'){
    R(4,21,12,9,'#b0102a'); R(2,23,3,6,'#b0102a'); R(6,30,8,2,'#b0102a'); R(7,22,6,6,'#f4efe6'); R(8,24,4,1,'#222'); R(4,29,2,1,'#36d6ff');
  } else {
    const P = (a,b) => [ox+a*u, oy+b*u];
    const col = L.guitar === 'bolt' ? '#ffd34d' : '#5b2a9e';
    ctx.fillStyle = col; ctx.beginPath();
    if (L.guitar === 'bolt'){ ctx.moveTo(...P(16,21)); ctx.lineTo(...P(6,18)); ctx.lineTo(...P(9,24)); ctx.lineTo(...P(1,23)); ctx.lineTo(...P(8,32)); ctx.lineTo(...P(7,27)); ctx.lineTo(...P(14,28)); }
    else { ctx.moveTo(...P(16,21)); ctx.lineTo(...P(4,19)); ctx.lineTo(...P(1,27)); ctx.lineTo(...P(9,32)); ctx.lineTo(...P(14,27)); }
    ctx.closePath(); ctx.fill(); R(7,23,4,1,'#111'); R(7,26,4,1,'#111');
  }
  const neckLen = L.guitar === 'bass' ? 18 : 15;
  for (let k=0;k<neckLen;k++) r(ox+(16+k)*u, oy+(23-k*.6)*u, u*2, u*2, FB);
  for (let k=0;k<neckLen;k+=3) r(ox+(16+k)*u+1, oy+(23-k*.6)*u+1, 1, 2, '#8d8aa0');
  const hx = 16 + neckLen, hyy = 23 - neckLen*.6;
  R(hx, hyy-1, 4, 3, L.guitar === 'bass' ? '#b0102a' : L.guitar === 'bolt' ? '#ffd34d' : L.guitar === 'ibanez' ? '#f4f1f8' : '#5b2a9e');
  R(20,15,4,7,J); R(23,18,4,3,J); R(26,16,3,3,L.skin); px(26,16,L.light);
  const s = o.strum ? (Math.sin(T*(o.fast?30:18)) > 0 ? -2 : 1) : 0;
  R(3,15,4,9,J); R(4,23,4,2,J); R(8,24+s,3,3,L.skin); px(8,24+s,L.light);
  if (o.wires){ ctx.lineWidth = 1; for (let k=0;k<6;k++){ ctx.strokeStyle = ['#36d6ff','#f1eef5','#ff4fd8'][k%3]; ctx.beginPath(); for (let tt=0; tt<=1.001; tt+=.1){ const xx = ox + (4 + tt*22)*u, yy = oy + (12 + k*3 + Math.sin(tt*9 + k + T*3)*4)*u; tt ? ctx.lineTo(xx,yy) : ctx.moveTo(xx,yy); } ctx.stroke(); } }
  ctx.restore(); ctx.globalAlpha = 1;
  if (o.sad) txt('…', x+18, y-110, C.muted, 'left', 8);
}

// Mao: baterista (con o sin batería), o de pie como boxeador
// Mao (sprites de Sergio, siempre en su batería): idle, toca y ríe; sin batería usa el dibujo por código
const MAO_FR = { triste:9, idle:6, toca:9, rie:9, habla:9, celebra:9, corre:8, kit:1, depie:8, fidle:8, ftoca:9 }, MAO_FPS = { triste:4, idle:5, toca:10, rie:9, habla:7, celebra:8, corre:11, kit:1, depie:5, fidle:5, ftoca:10 }, MAO = {};
Object.keys(MAO_FR).forEach(k => { MAO[k] = new Image(); MAO[k].src = 'mao_' + k + '.png'; });
function drawMao(x, y, o={}){
  if (o.kit !== false){
    const k = o.anim || (o.laugh ? 'rie' : (o.play || o.jump) ? 'toca' : 'idle'), img = MAO[k];
    if (img && img.complete && img.naturalWidth) return drawStrip136(img, MAO_FR[k], MAO_FPS[k], x, y + (k === 'corre' || k === 'depie' || k === 'triste' ? 0 : 7), { flip:o.flip, sc:o.sc, frame: o.t != null ? Math.floor(o.t * MAO_FPS[k]) : null });   // un poco más abajo: la batería asienta en la tarima (corriendo, de pie, va a la altura de los demás) · 'kit' es la batería sola, sin Mao
  }
  return drawMaoCode(x, y, o);
}
function drawMaoCode(x, y, o={}){
  const u = 2, ox = Math.round(x - 14*u), oy = Math.round(y - 46*u), S = '#c98a5e', SL = '#e0a67a', SS = '#9a6440';
  const R = (a,b,w,h,c) => r(ox+a*u, oy+b*u, w*u, h*u, c);
  const hit = o.play ? (Math.sin(T*(o.fast?28:16)) > 0 ? 1 : 0) : 0;
  const jump = o.jump ? Math.round(Math.abs(Math.sin(T*8))*-6) : 0;
  ctx.save(); ctx.translate(o.dodge || 0, jump);
  ctx.globalAlpha = .4; r(ox+2*u, oy+45*u, 26*u, 2*u, '#000'); ctx.globalAlpha = 1;
  if (o.asleep){ // dormido en el sofá
    R(2,30,26,8,'#18141f'); R(22,27,7,7,S); R(22,26,7,2,'#17100c'); R(23,29,2,1,'#111'); R(26,29,2,1,'#111');
    const z = (T*2)%3; txt('z', x+30, y-30-z*4, C.cyan, 'left', 8, null); txt('Z', x+38, y-40-z*3, C.cyan, 'left', 8, null);
    ctx.restore(); return;
  }
  if (o.kit){ // batería morada
    R(-2,30,8,12,'#5a2a9e'); R(22,30,8,12,'#5a2a9e'); R(6,30,16,14,'#3a1a6e'); R(9,33,10,8,'#5a2a9e'); R(12,36,4,2,'#f4efe6');
    R(-4,22,10,2,'#d8a84a'); R(22,20,12,2,'#d8a84a'); R(0,24,1,18,'#8d8aa0'); R(28,22,1,20,'#8d8aa0');
  } else { R(7,29,5,13,'#121018'); R(16,29,5,13,'#121018'); R(5,41,8,4,'#f1eef5'); R(15,41,8,4,'#f1eef5'); }
  R(6,14,16,15,'#18141f'); R(11,15,6,12,'#0c0a10'); R(12,18,4,2,'#f1eef5'); R(6,16,3,2,'#ffd200'); R(6,18,3,1,'#1a3fbf'); R(6,19,3,1,'#d0102a');
  R(10,11,7,4,SS); R(9,2,10,10,S); R(10,3,3,2,SL); R(9,0,10,3,'#17100c'); R(10,-1,8,1,'#17100c'); R(8,2,1,3,'#2a1a10'); R(19,2,1,3,'#2a1a10');
  R(9,5,4,3,'#111'); R(15,5,4,3,'#111'); R(10,6,2,1,'#f1eef5'); R(16,6,2,1,'#f1eef5'); R(13,6,2,1,'#111');
  if (o.laugh){ R(11,9,6,2,'#5a1020'); R(11,9,6,1,'#f1eef5'); } else if (o.sad) R(12,10,4,1,'#5a1020'); else { R(11,9,6,1,'#f1eef5'); R(11,10,6,1,'#7a3b2a'); }
  if (o.gloves){ R(1,14 - (o.punch||0)*2,6,6,'#d0102a'); R(21 + (o.punch||0)*4,13,6,6,'#d0102a'); }
  else { R(2,15,4,8,'#18141f'); R(22,15,4,8,'#18141f'); R(2,22-hit*3,4,3,S); R(22,22-(1-hit)*3,4,3,S);
    if (o.kit || o.sticks){ R(0,19-hit*5,6,1,'#e8c88a'); R(22,19-(1-hit)*5,6,1,'#e8c88a'); } }
  ctx.restore();
}

// Cami: cantante (elegante o rockera)
// Cami de gala (nivel 5, vestido vinotinto) y el Director de la Wind Orchestra Region: sprites 136×136 de Sergio
const CMG_FR = { idle:8, camina:8, canta:9, ojos:9, falla:9 }, CMG_FPS = { idle:5, camina:8, canta:6, ojos:6, falla:9 }, CMG = {};
Object.keys(CMG_FR).forEach(k => { CMG[k] = new Image(); CMG[k].src = 'cmg_' + k + '.png'; });
function drawCamiGala(x, y, o={}){
  const k = CMG[o.anim] ? o.anim : 'idle', img = CMG[k];
  if (!(img && img.complete && img.naturalWidth)) return drawCami(x, y, { elegant:true });
  drawStrip136(img, CMG_FR[k], CMG_FPS[k], x, y, { flip: o.flip != null ? o.flip : k === 'idle' });   // en idle mira a la derecha (hacia el director)
}
const DIR_FR = { idle:8, habla:9, camina:8, dirige:9, wow:9 }, DIR_FPS = { idle:5, habla:7, camina:8, dirige:8, wow:7 }, DIRS = {};
Object.keys(DIR_FR).forEach(k => { DIRS[k] = new Image(); DIRS[k].src = 'dir_' + k + '.png'; });
// Cami rockera (nivel 5): idle, corre y transformación (de gala a rockera, con el aura en bucle en los cuadros 7-9)
const CMR = { triste: Object.assign(new Image(), { src:'cmr_triste.png' }), corre: Object.assign(new Image(), { src:'cmr_corre.png' }), tr: Object.assign(new Image(), { src:'cmr_transforma.png' }), idle: Object.assign(new Image(), { src:'cmr_idle.png' }), prueba: Object.assign(new Image(), { src:'cmr_prueba.png' }), celebra: Object.assign(new Image(), { src:'cmr_celebra.png' }), falla: Object.assign(new Image(), { src:'cmr_falla.png' }) };
// color de las puntas del pelo de Cami rockera: empieza azul; con cada falla pasa a verde y luego a rubio (camiFails lo lleva el nivel 5)
let camiFails = 0;
const HAIR_RAMP = { green:[[18,64,36],[96,232,142]], blonde:[[122,78,18],[252,222,112]] }, hairCache = new Map();
function hairTint(img){
  const lost = lifeStyle === 'hair' ? 3 - lives : camiFails, col = lost <= 0 ? null : lost === 1 ? 'green' : 'blonde';   // en los retos con vidas de pelo, el color sigue a las vidas
  if (!col || !(img && img.complete && img.naturalWidth)) return img;
  const key = img.src + '|' + col; if (hairCache.has(key)) return hairCache.get(key);
  const cv = document.createElement('canvas'); cv.width = img.naturalWidth; cv.height = img.naturalHeight; const g = cv.getContext('2d'); g.drawImage(img, 0, 0);
  let d; try { d = g.getImageData(0, 0, cv.width, cv.height); } catch(e){ hairCache.set(key, img); return img; }   // sin permiso para leer píxeles: deja el color original
  const p = d.data, [lo, hi] = HAIR_RAMP[col];
  for (let i=0;i<p.length;i+=4){ const r = p[i], gg = p[i+1], b = p[i+2]; if (p[i+3] && r < 75 && b > r + 40 && b > gg + 20){ const t = Math.max(0, Math.min(1, (b - 90) / 135)); p[i] = lo[0] + (hi[0]-lo[0])*t; p[i+1] = lo[1] + (hi[1]-lo[1])*t; p[i+2] = lo[2] + (hi[2]-lo[2])*t; } }
  g.putImageData(d, 0, 0); hairCache.set(key, cv); return cv;
}
function drawCamiRock(x, y, o={}){
  const ok = im => im && im.complete && im.naturalWidth, strip = (im, fps) => drawStrip136(hairTint(im), im.naturalWidth / 136 | 0, fps, x, y, { flip:o.flip });
  if (o.anim === 'corre' && ok(CMR.corre)) return strip(CMR.corre, 12);
  if (o.anim === 'prueba' && ok(CMR.prueba)) return strip(CMR.prueba, 6);   // prueba de sonido
  if (o.anim === 'celebra' && ok(CMR.celebra)) return strip(CMR.celebra, 8);
  if (o.anim === 'triste' && ok(CMR.triste)) return strip(CMR.triste, 5);   // triste en el camerino
  if (o.anim === 'falla' && ok(CMR.falla)) return strip(CMR.falla, 9);
  if (o.frame == null && o.anim !== 'aura' && ok(CMR.idle)) return strip(CMR.idle, 5);   // idle rockera
  if (!ok(CMR.tr)) return drawCami(x, y, { tip:camiTip });
  const f = o.frame != null ? o.frame : o.anim === 'aura' ? 6 + Math.floor(T * 5) % 3 : 5;
  drawStrip136(hairTint(CMR.tr), 9, 5, x, y, { flip:o.flip, frame:f });
}
function drawDirector(x, y, o={}){
  const k = DIRS[o.anim] ? o.anim : 'idle', img = DIRS[k];
  if (img && img.complete && img.naturalWidth) drawStrip136(img, DIR_FR[k], DIR_FPS[k], x, y, { flip: o.flip != null ? o.flip : (k === 'idle' || k === 'habla') });   // habla y espera mirando a la izquierda; camina hacia la derecha
}
function drawCami(x, y, o={}){
  const u = 2, ox = Math.round(x - 14*u), oy = Math.round(y - 46*u), S = '#c48a62', SL = '#dca27c', SS = '#9a6440', HAIR = '#120a10';
  const tip = o.tip || '#2f6bff';
  const R = (a,b,w,h,c) => r(ox+a*u, oy+b*u, w*u, h*u, c);
  const jump = o.jump ? Math.round(Math.abs(Math.sin(T*8))*-6) : 0;
  const sway = Math.sin(T*3) > 0 ? 0 : 1;
  ctx.save(); ctx.translate(0, jump);
  ctx.globalAlpha = .4; r(ox+2*u, oy+45*u, 26*u, 2*u, '#000'); ctx.globalAlpha = 1;
  if (o.elegant){
    R(7,14,13,6,'#4a1a6b'); R(6,20,15,6,'#4a1a6b'); R(5,26,17,10,'#3a1258'); R(4,36,19,8,'#3a1258'); R(10,20,7,1,'#d8a84a'); R(4,43,19,1,'#2a0a40');
    R(8,14,2,6,S); R(17,14,2,6,S); R(5,16,3,8,S); R(19,16,3,8,S);
  } else {
    R(7,29,5,13,'#121018'); R(16,29,5,13,'#121018'); R(8,33,2,2,'#2a2533'); R(17,35,2,3,'#0b0718');
    R(5,40,8,5,'#111'); R(15,40,8,5,'#111'); R(5,43,8,1,'#2f6bff');
    R(9,20,10,4,S); R(9,24,10,6,'#121018'); R(11,26,1,6,'#8d8aa0');
    R(9,14,10,6,'#1d4a5a'); R(10,15,3,2,'#36d6ff'); R(5,14,4,14,'#18141f'); R(19,14,4,14,'#18141f'); R(5,14,1,14,'#2f6bff');
  }
  // pelo y cabeza
  R(6,2,4,14+sway,HAIR); R(18,2,4,14,HAIR); R(6,14+sway,4,3,tip); R(18,14,4,3,tip);
  R(11,11,6,3,SS); R(9,2,10,10,S); R(10,3,3,2,SL); R(8,-1,12,4,HAIR); R(8,0,3,6,HAIR);
  R(10,5,2,1,HAIR); R(15,5,2,1,HAIR); R(10,6,2,1,'#1a1010'); R(15,6,2,1,'#1a1010'); R(14,8,1,1,'#c9c4d6');
  if (o.shout) R(12,9,4,2,'#5a1020'); else if (o.disgust){ R(11,9,5,1,'#5a1020'); R(10,5,2,1,'#3dff8a'); } else if (o.sad) R(12,10,3,1,'#5a1020'); else { R(12,9,3,1,'#b0405a'); }
  R(8,6,1,3,'#c9c4d6'); R(19,6,1,3,'#c9c4d6');
  // micrófono
  if (o.mic !== false){ R(21,12,4,4,'#c9c4d6'); R(22,16,2,6,'#2a2533'); if (!o.elegant) R(21,22,2,24,'#2a2533'); R(20,10,1,1,'#ffffff'); }
  ctx.restore();
}

// Ricardo en escena (pequeño, al lado)
// V2: Ricardo con sprites de PixelLab (cuadro 136×136, pies en y 114, como Checho)
const RCO_FR = { idle:8, camina:8, preocupado:9 }, RCO_FPS = { idle:5, camina:8, preocupado:5 };
const RCO = {}; for (const k in RCO_FR){ RCO[k] = new Image(); RCO[k].src = 'rco_' + k + '.png'; }
// dibuja un cuadro de una tira 136×136 (pies en y 114); flip = mirar al lado contrario del GIF
function drawStrip136(img, n, fps, x, y, o={}){
  const f = o.frame != null ? Math.max(0, Math.min(n - 1, o.frame)) : Math.floor(T * fps) % n;   // o.frame: cuadro fijo (para animaciones que se reproducen una vez)
  ctx.save(); ctx.globalAlpha = .4; r(Math.round(x-20), y-4, 40, 4, '#000');
  ctx.globalAlpha = o.flash ? .5 + Math.sin(T*40)*.5 : 1; ctx.imageSmoothingEnabled = false;
  ctx.translate(Math.round(x), Math.round(y)); if (o.sc) ctx.scale(o.sc, o.sc);   // o.sc: escala alrededor de los pies
  ctx.translate(0, -116); if (o.flip) ctx.scale(-1, 1);
  ctx.drawImage(img, f*136, 0, 136, 136, -68, 0, 136, 136); ctx.restore(); ctx.globalAlpha = 1;
}
// Dave (sprites de Sergio): por ahora solo idle; cualquier otra pose usa el idle hasta que lleguen sus animaciones
const DAV_FR = { acierta:9, triste:8, idle:8, idle2:8, corre2:8, anima:9, idle_bajo:8, toca_final:9, camina:8, falla:9, peto_off:9, celebra:9, come_pollo:9, corre:8, solo:9, corre_pollo:8, celebra_bajo:9 }, DAV_FPS = { acierta:6, triste:4, idle:5, idle2:5, corre2:12, anima:8, idle_bajo:5, toca_final:10, camina:8, falla:8, peto_off:7, celebra:9, come_pollo:6, corre:12, solo:10, corre_pollo:12, celebra_bajo:8 };
const DAV = {}; for (const k in DAV_FR){ DAV[k] = new Image(); DAV[k].src = 'dav_' + k + '.png'; }
function drawDaveSprite(x, y, o={}){
  const k = (o.anim && DAV_FR[o.anim]) ? o.anim : 'idle', img = DAV[k];
  if (img && img.complete && img.naturalWidth) return drawStrip136(img, DAV_FR[k], DAV_FPS[k], x, y, o);
  return drawGuitarist(x, y, o, LOOK.dave);
}
function drawRicardo(x, y, o={}){
  const k = (o.anim && RCO_FR[o.anim]) ? o.anim : 'idle', img = RCO[k];
  if (img && img.complete && img.naturalWidth) return drawStrip136(img, RCO_FR[k], RCO_FPS[k], x, y, o);
  drawRicardoOld(x, y);
}
// V2: Mr. Dirty (Afrodita). Los GIF miran a la izquierda (hacia Checho)
const DRT_FR = { idle:8, camina:8, rie:9, toca:9 }, DRT_FPS = { idle:5, camina:8, rie:8, toca:10 };
const DRT = {}; for (const k in DRT_FR){ DRT[k] = new Image(); DRT[k].src = 'drt_' + k + '.png'; }
function drawDirty(x, y, o={}){
  const k = (o.anim && DRT_FR[o.anim]) ? o.anim : (o.strum ? 'toca' : 'idle'), img = DRT[k];
  y -= 5; // un poco más arriba (más al fondo de la tarima)
  if (img && img.complete && img.naturalWidth) return drawStrip136(img, DRT_FR[k], DRT_FPS[k], x, y, o);
  drawGuitarist(x, y, o, LOOK.laca);
}
// 2.4 antes del jefe: Maito camina a la izquierda («¡Listo, Pepino, vamos!»)
// …y sin aviso El Enredo cae de un salto desde la derecha; Maito se gira de inmediato en pose de rolas
function sceneMaitoWalkLeft(){
  const t0 = T, D = 1.6, J0 = 1.6, JD = 8/12; let landed = false;
  return { update(){}, draw(){
    const t = T - t0, u = Math.min(1, t / D), j = Math.max(0, Math.min(1, (t - J0) / JD));
    drawStage();
    CAST.maito(120 - u*60, u < 1 ? { anim:'camina', flip:true } : (landed ? { anim:'rolas' } : { flip:true }));
    // El Enredo: salta (sprite salta) en arco, cae, lanza dos puños y queda en idle
    if (t > J0){ const lt = t - J0 - JD, PU = 2 * ENR_FR.puno / ENR_FPS.puno;
      if (j < 1) drawEnredo(Math.round(290 - j*110), Math.round(228 - Math.sin(j*Math.PI)*40), { anim:'salta', t: t - J0, once:true });
      else drawEnredo(180, 228, lt < PU ? { anim:'puno', t: lt } : {}); }
    if (j >= 1 && !landed){ landed = true; shake = RM ? 0 : .35; SFX.thud(); setMusic('metal'); }
    drawCrowd(); drawHUD(curLevel ? 'NIVEL ' + curLevel.n : '');
  }, tap(){} };
}
// 2.1 cierre: Maito en pose retadora («Dame dos rolas»); Checho sale corriendo a la izquierda y Maito camina al centro y queda en idle
function sceneMaitoRolas(){
  const t0 = T, CX = 98, MX = 150, R0 = 1.8, RD = 1.3, W0 = 2.4, WD = 1.4, END = 4.4; let released = false; dlgLock = true;
  return { update(){}, draw(){
    const t = T - t0, ru = Math.max(0, Math.min(1, (t - R0) / RD)), wu = Math.max(0, Math.min(1, (t - W0) / WD));
    drawStage();
    if (ru < 1) CAST.checho(CX - ru*170, ru > 0 ? { anim:'corre_mexa', flip:true } : { anim:'casa', flip:true });
    const mx = MX - wu*30;
    CAST.maito(mx, t < W0 ? { anim:'rolas', flip:true } : (wu < 1 ? { anim:'camina', flip:true } : {}));
    drawCrowd(); drawHUD(curLevel ? 'NIVEL ' + curLevel.n : '');
    if (!released && t > END){ released = true; dlgLock = false; if (typing){ clearInterval(typing); typing = null; } advance(); }
  }, tap(){}, stop(){ dlgLock = false; } };
}
// 2.1: Checho llega corriendo por la izquierda al Coliseo Mexa (sin guitarra en las manos) y se queda en idle; Maito enredado
function sceneChechoRunIn(o={}){
  const t0 = T, D = 2, X = o.x ?? 44;
  return { update(){}, draw(){
    const u = Math.min(1, (T - t0) / D), e = 1 - (1-u)*(1-u)*.35 - .65*(1-u);  // casi constante y frena al final
    drawStage();
    (o.cast || []).forEach(([k,x,op]) => CAST[k](x, op || {}));
    CAST.checho(-50 + (X + 50)*Math.min(1, e), u < 1 ? { anim:'corre_mexa' } : { anim: o.idleAnim || 'idle', flip: !!o.idleFlip });
    drawCrowd(); drawHUD(curLevel ? 'NIVEL ' + curLevel.n : '');
  }, tap(){} };
}
// 1.1 cierre: Ricardo se coge la cabeza; Checho lo ignora, camina al centro probando sonido y, un instante después, Ricardo sale caminando por la derecha
function sceneChechoToCenter(){
  const t0 = T, CD = 1.3, R0 = 1.7, RD = 2.2;
  return { update(){}, draw(){
    const t = T - t0, cu = Math.min(1, t / CD), ru = Math.max(0, Math.min(1, (t - R0) / RD));
    drawStage();
    if (ru < 1) drawRicardo(184 + ru*120, 228, ru > 0 ? { anim:'camina' } : { anim:'preocupado' });
    CAST.checho(72 + cu*56, cu < 1 ? { walk:true } : { shout:true });
    drawCrowd(); drawHUD(curLevel ? 'NIVEL ' + curLevel.n : '');
  }, tap(){} };
}
// 1.5: después del duelo Ricardo entra caminando por la derecha hasta quedar frente a Checho
function sceneRicardoEnter(){
  const t0 = T, D = 2.2;
  return { update(){}, draw(){
    const u = Math.min(1, (T - t0) / D);
    drawStage(); CAST.checho(72, {});
    drawRicardo(290 - u*106, 228, u < 1 ? { anim:'camina', flip:true } : {});
    drawCrowd(); drawHUD(curLevel ? 'NIVEL ' + curLevel.n : '');
  }, tap(){} };
}
// 1.5 cierre: Checho sale corriendo hacia la derecha (por detrás de Ricardo), Ricardo se queda; luego fundido a negro y sigue
function sceneChechoExit(){
  const t0 = T, R0 = .8, RD = 1.6, F0 = 3.2, FD = .8; let released = false; dlgLock = true;
  return { update(){}, draw(){
    const t = T - t0, u = Math.max(0, Math.min(1, (t - R0) / RD));
    drawStage();
    if (u < 1) CAST.checho(72 + u*230, u > 0 ? { run:true } : {});
    drawRicardo(184, 228, {});
    drawCrowd(); drawHUD(curLevel ? 'NIVEL ' + curLevel.n : '');
    if (t > F0){ const k = Math.min(1, (t - F0) / FD); ctx.globalAlpha = k; r(0, 0, W, 420, '#000'); ctx.globalAlpha = 1;
      if (k >= 1 && !released){ released = true; dlgLock = false; fadeIn = .7; if (typing){ clearInterval(typing); typing = null; } advance(); } }
  }, tap(){}, stop(){ dlgLock = false; } };
}
// 1.4: Mr. Dirty entra por la derecha y se cruza con Ricardo, que sale caminando hacia la derecha
function sceneDirtyEnter(){
  // Mr. Dirty entra (2,6 s); Ricardo arranca a los 1,6 s y se cruzan hacia x≈200, Ricardo pasando por delante
  const t0 = T, D = 2.6, R0 = 1.6, RD = 3;
  return { update(){}, draw(){
    const t = T - t0, u = Math.min(1, t / D), ru = Math.max(0, Math.min(1, (t - R0) / RD));
    drawStage();
    CAST.checho(72, {});
    drawDirty(290 - u*114, 228, { anim: u < 1 ? 'camina' : 'idle' });
    if (ru < 1) drawRicardo(184 + ru*116, 228, ru > 0 ? { anim:'camina' } : {});
    drawCrowd(); drawHUD(curLevel ? 'NIVEL ' + curLevel.n : '');
  }, tap(){} };
}
function drawRicardoOld(x, y){
  const u = 2, ox = x-14, oy = y-80;
  r(ox+4, oy+30, 20, 30, '#1b1622'); r(ox+10, oy+30, 8, 10, '#d29a6e'); r(ox+9, oy+34, 10, 1, '#ffd34d');
  r(ox+6, oy+10, 16, 20, '#d29a6e'); r(ox+6, oy+6, 16, 6, '#b9b4c9'); r(ox+4, oy+8, 2, 10, '#9e98b2'); r(ox+22, oy+8, 2, 10, '#9e98b2');
  r(ox+7, oy+16, 14, 4, '#111'); r(ox+10, oy+24, 8, 2, '#5a3b2a'); r(ox+6, oy+60, 7, 16, '#121018'); r(ox+15, oy+60, 7, 16, '#121018');
  r(ox+24, oy+34, 4, 8, '#1b1622'); r(ox+26, oy+30, 4, 6, '#2a2533');
}


// Mr. Deadline: ejecutivo gringo furioso con diadema y café
// Mr. Deadline (sprites de Sergio): baja por una cuerda, grita y explica; el dibujo por código queda de respaldo
const DDL = {}; ['cuerda','grita','explica'].forEach(k => { DDL[k] = new Image(); DDL[k].src = 'ddl_' + k + '.png'; });
const DDL_ROPE = [[80,18],[77,17],[74,16],[70,16],[68,17],[70,18],[72,19],[75,18],[76,17]];   // punta superior de la cuerda en cada cuadro
const DDL_SC = 1.1;   // Mr. Deadline se ve 10 % más grande que el resto
function drawDeadline(x, y, o={}){
  const k = DDL[o.anim] ? o.anim : 'explica', img = DDL[k];
  if (!(img && img.complete && img.naturalWidth)) return drawDeadlineCode(x, y, o);
  const fps = k === 'cuerda' ? 10 : k === 'grita' ? 9 : 6, f = Math.floor(T * fps) % 9, s = DDL_SC;
  const sx = o.hit > 0 ? Math.round(Math.sin(T*60)*2) : 0, top = Math.round(y - 2 - 114*s);
  if (k === 'cuerda'){   // la cuerda del sprite sigue hasta el borde superior de la pantalla (mismo grosor y colores)
    const [rx, ry] = DDL_ROPE[f], tx = Math.round(x + (rx - 68)*s), ty = Math.round(top + ry*s);
    if (ty > 0){ r(tx, 0, 1, ty + 1, '#cfa767'); r(tx + 1, 0, 1, ty + 1, '#84633b'); }
  } else { ctx.globalAlpha = .4; r(Math.round(x - 24), y - 4, 48, 4, '#000'); }
  ctx.save(); ctx.globalAlpha = o.hit > .3 ? .5 + Math.sin(T*40)*.5 : 1; ctx.imageSmoothingEnabled = false;
  ctx.translate(Math.round(x + sx), top); if (o.flip) ctx.scale(-1, 1);
  ctx.drawImage(img, f*136, 0, 136, 136, Math.round(-68*s), 0, Math.round(136*s), Math.round(136*s)); ctx.restore(); ctx.globalAlpha = 1;
}
function drawDeadlineCode(x, y, o={}){
  const u = 2, ox = Math.round(x - 14*u), oy = Math.round(y - 50*u), S = '#e0a882', SS = '#b07a56', SUIT = '#262b40';
  const R = (a,b,w,h,c) => r(ox+a*u, oy+b*u, w*u, h*u, c);
  const yell = Math.sin(T*10) > 0 ? 1 : 0, shakeX = o.hit > 0 ? Math.round(Math.sin(T*60)*2) : 0;
  ctx.save(); ctx.translate(shakeX, 0); if (o.hit > 0) ctx.globalAlpha = .6 + Math.sin(T*50)*.4;
  ctx.globalAlpha *= .4; r(ox+2*u, oy+49*u, 26*u, 2*u, '#000'); ctx.globalAlpha = o.hit > 0 ? .7 : 1;
  R(7,32,6,14,SUIT); R(15,32,6,14,SUIT); R(6,45,8,4,'#111'); R(14,45,8,4,'#111');
  R(4,16,20,17,SUIT); R(11,16,6,10,'#f1eef5'); R(13,17,2,9,'#d0102a'); R(12,16,4,2,'#d0102a'); R(5,17,2,14,'#363c58'); R(21,17,2,14,'#363c58');
  R(0,17,4,12,SUIT); R(0,28,4,3,S); R(24,17,4,8,SUIT); R(25,13,5,5,'#f4efe6'); R(30,14,1,3,'#f4efe6'); R(26,11,3,2,'#c9c4d6'); // brazo + taza de café
  R(10,13,8,4,SS); R(8,3,12,11,S); R(9,4,3,2,'#f0c09a');
  R(7,0,14,4,'#3a2418'); R(6,2,3,4,'#3a2418'); R(8,-1,10,1,'#3a2418'); R(17,1,4,2,'#4a3020');
  R(9,6,4,3,'#111'); R(15,6,4,3,'#111'); R(10,7,2,1,'#f1eef5'); R(16,7,2,1,'#f1eef5'); R(13,7,2,1,'#111'); R(9,5,4,1,'#2a1810'); R(15,5,4,1,'#2a1810');
  R(11,10,6,2+yell,'#5a1020'); R(11,10,6,1,'#f1eef5');
  R(6,5,2,5,'#111'); R(5,8,2,2,'#111'); R(5,10,1,1,'#111'); R(6,11,6,1,'#111'); R(11,11,2,1,'#2a2533'); // diadema
  if (o.angry !== false) for (let i=0;i<3;i++){ const a = -0.6 + i*.6 + Math.sin(T*8)*.1; r(x + Math.cos(a-1.57)*44, oy + 4 + Math.sin(a-1.57)*14 + 10, 6, 2, '#ff2e4d'); }
  ctx.restore(); ctx.globalAlpha = 1;
}

// Iván Drum-Machine: robot caja de ritmos con guantes de boxeo
// Iván Drum-Machine (beatmaker humano del guion): sprites 136×136 dibujados por Sergio. Miran a la derecha: se voltean para mirar a Mao.
const IVN_FR = { corre:8, reta:9, idle:8, toca:9, falla:9, derrota:9 }, IVN_FPS = { corre:11, reta:7, idle:5, toca:10, falla:10, derrota:6 }, IVN = {};
Object.keys(IVN_FR).forEach(k => { IVN[k] = new Image(); IVN[k].src = 'ivn_' + k + '.png'; });
function drawIvan(x, y, o={}){
  const k = IVN[o.anim] ? o.anim : 'idle', img = IVN[k];
  if (!(img && img.complete && img.naturalWidth)) return drawIvanCode(x, y, o);
  const flip = o.flip != null ? o.flip : (k !== 'falla' && k !== 'derrota');   // de frente no se voltea
  drawStrip136(img, IVN_FR[k], IVN_FPS[k], x, y, { flip, frame: o.t != null ? Math.min(IVN_FR[k] - 1, Math.floor(o.t * IVN_FPS[k])) : null });
}
function drawIvanCode(x, y, o={}){
  const u = 2, ox = Math.round(x - 18*u), oy = Math.round(y - 52*u);
  const R = (a,b,w,h,c) => r(ox+a*u, oy+b*u, w*u, h*u, c);
  const hitArm = o.play ? (Math.sin(T*16) > 0 ? 1 : 0) : 0, shakeX = o.hit > 0 ? Math.round(Math.sin(T*60)*2) : 0;
  ctx.save(); ctx.translate(shakeX, 0); if (o.hit > 0) ctx.globalAlpha = .6 + Math.sin(T*50)*.4;
  R(11,-6,1,6,'#8d8aa0'); R(10,-8,3,3,'#ff2e4d');
  R(8,0,20,15,'#9a98ac'); R(9,1,18,13,'#6f6d82'); R(10,3,16,9,'#0b0718');
  const eye = o.angry === false ? '#3dff8a' : '#36d6ff';
  R(12,6,4,2,eye); R(20,6,4,2,eye); R(11,5,4,1,eye); R(21,5,4,1,eye); R(14,10,8,1,o.sad ? '#ff2e4d' : eye);
  R(6,4,2,6,'#8d8aa0'); R(28,4,2,6,'#8d8aa0');
  R(14,15,8,2,'#5a5870');
  R(6,17,24,20,'#9a98ac'); R(8,19,20,16,'#7a7890'); R(11,21,14,12,'#8a1020'); R(13,23,10,8,'#5a0a14');
  R(16,24,4,6,'#ffd34d'); R(14,26,8,2,'#ffd34d'); R(15,28,2,2,'#ffd34d'); R(19,28,2,2,'#ffd34d');
  R(9,37,6,12,'#6f6d82'); R(21,37,6,12,'#6f6d82'); R(7,48,10,4,'#3a3850'); R(19,48,10,4,'#3a3850');
  R(2,18,4,10,'#8d8aa0'); R(30,18,4,10,'#8d8aa0');
  R(-2,24 - hitArm*4,8,8,'#d0102a'); R(-1,25 - hitArm*4,3,2,'#ff7a8a'); R(30,24 - (1-hitArm)*4,8,8,'#d0102a'); R(31,25 - (1-hitArm)*4,3,2,'#ff7a8a');
  R(-4,20 - hitArm*6,8,1,'#e8c88a'); R(32,20 - (1-hitArm)*6,8,1,'#e8c88a');
  ctx.restore(); ctx.globalAlpha = 1;
}

// Mr. Feedback, el ingeniero de sonido de Rock Express: sprites de Sergio (miran a la izquierda, hacia Cami).
// camina → entra · habla/ataca/idle → reclama (puño arriba) · golpeado → se tapa los oídos · derrota → pierde
const FBK_FR = { entra:8, pierde:9, reclama:9, oidos:9, sale:8 }, FBK = {}, FBK_MAP = { camina:'entra', habla:'reclama', ataca:'reclama', idle:'reclama', golpeado:'oidos', derrota:'pierde' };
Object.keys(FBK_FR).forEach(k => { FBK[k] = new Image(); FBK[k].src = 'fbk_' + k + '.png'; });
function drawFeedback(x, y, o={}){
  const k = FBK_MAP[o.anim] || (FBK_FR[o.anim] ? o.anim : 'reclama'), img = FBK[k];
  if (img && img.complete && img.naturalWidth) return drawStrip136(img, FBK_FR[k], k === 'entra' ? 8 : 6, x, y, { flip: !!o.turn });   // turn: mira a la derecha (cuando se va)
  // provisional: ingeniero de sonido con audífonos rojos y tablet
  const u = 2, ox = Math.round(x - 14*u), oy = Math.round(y - 46*u), R = (a,b,w,h,c) => r(ox+a*u, oy+b*u, w*u, h*u, c), f = Math.floor(T * 6) % 2;
  const down = k === 'derrota' ? 6 : 0;
  ctx.globalAlpha = .4; r(ox+2*u, oy+45*u, 26*u, 2*u, '#000'); ctx.globalAlpha = 1;
  R(9, 33 + (k === 'camina' && f ? 1 : 0), 4, 12 - down/2, '#3a3d4a'); R(15, 33 + (k === 'camina' && !f ? 1 : 0), 4, 12 - down/2, '#3a3d4a'); R(8, 44, 6, 2, '#111'); R(14, 44, 6, 2, '#111');
  R(7, 19 + down, 14, 15, '#20222c'); R(12, 19 + down, 4, 15, '#2c2f3c');
  const arm = k === 'ataca' ? -6 * (Math.sin(T*12) > 0 ? 1 : .5) : 0;
  R(4, 21 + down + arm, 3, 10, '#20222c'); R(21, 21 + down + arm, 3, 10, '#20222c'); R(4, 31 + down + arm, 3, 2, '#c48a62'); R(21, 31 + down + arm, 3, 2, '#c48a62');
  R(18, 26 + down + arm, 8, 6, '#0b0b12'); R(19, 27 + down + arm, 6, 4, k === 'ataca' ? (f ? '#ff4d6d' : '#36d6ff') : '#36d6ff');   // tablet de la consola
  R(9, 9 + down, 10, 10, '#c48a62'); R(9, 8 + down, 10, 3, '#2a1a12'); R(11, 13 + down, 2, 1, '#111'); R(15, 13 + down, 2, 1, '#111');
  if (k === 'habla') R(12, 16 + down, 4, f ? 2 : 1, '#5a1a1a'); else R(12, 16 + down, 4, 1, '#7a3a2a');
  R(7, 10 + down, 2, 6, '#e0263f'); R(19, 10 + down, 2, 6, '#e0263f'); R(8, 7 + down, 12, 2, '#e0263f');   // audífonos rojos
  if (k === 'derrota'){ for (let i=0;i<3;i++){ const ph = (T*.7 + i/3) % 1; ctx.globalAlpha = .45*(1 - ph); pcirc(Math.round(ox + 44 + Math.sin(T*2+i)*3), Math.round(oy + 52 - ph*30), 3 + ph*5 | 0, '#8a8aa0'); } ctx.globalAlpha = 1; }
}

// El Enredo (monstruo de cables, en código)
function drawEnredoOld(mx, my, o={}){
  ctx.globalAlpha = .35; r(mx-34, my-2, 68, 4, '#000'); ctx.globalAlpha = 1;
  r(mx-30, my-64, 60, 62, '#191428'); r(mx-34, my-48, 68, 40, '#191428');
  const cc = ['#36d6ff','#ff2e4d','#f1eef5','#ffd34d','#3dff8a','#ff4fd8','#ff7a1f'];
  ctx.lineWidth = 2;
  for (let k=0;k<16;k++){ ctx.strokeStyle = cc[k%cc.length]; ctx.beginPath();
    for (let s=0;s<=12;s++){ const a = s/12*Math.PI*2 + k, rr = 18 + 14*Math.sin(s*1.7 + k + T*2); const xx = mx + Math.cos(a)*rr*1.1, yy = my-34 + Math.sin(a)*rr; s ? ctx.lineTo(xx,yy) : ctx.moveTo(xx,yy); } ctx.stroke(); }
  for (let k=0;k<6;k++){ const lx = mx - 30 + k*12, sw = Math.sin(T*6+k)*4; ctx.strokeStyle = cc[k]; ctx.beginPath(); ctx.moveTo(lx, my-6); ctx.lineTo(lx+sw, my+2); ctx.stroke(); r(lx+sw-2, my, 4, 3, '#8d8aa0'); }
  // máscara de luchador
  r(mx-16, my-58, 32, 26, '#2f4fbf'); r(mx-4, my-58, 8, 4, '#ffd34d'); r(mx-14, my-50, 12, 8, '#ffd34d'); r(mx+2, my-50, 12, 8, '#ffd34d');
  const look = o.pinned ? -2 : -1;
  r(mx-12, my-48, 8, 6, '#f1eef5'); r(mx+4, my-48, 8, 6, '#f1eef5'); r(mx-9+look, my-47, 3, 4, '#ff2e4d'); r(mx+7+look, my-47, 3, 4, '#ff2e4d');
  r(mx-10, my-36, 20, 6, '#0b0718'); for (let k=0;k<5;k++){ r(mx-9+k*4, my-36, 2, 3, '#f1eef5'); }
  txt('EL ENREDO', mx, my-80, C.neon, 'center', 6);
}


// V2: El Enredo con sprites (los GIF miran a la izquierda, hacia Maito). o.anim, o.t (segundos desde que empezó) y o.once
const ENR_FR = { idle:8, llave:11, puno:16, salta:8, cae:9 }, ENR_FPS = { idle:5, llave:8, puno:12, salta:12, cae:9 };
const ENR = {}; for (const k in ENR_FR){ ENR[k] = new Image(); ENR[k].src = 'enr_' + k + '.png'; }
function drawEnredo(mx, my, o={}){
  const k = (o.anim && ENR_FR[o.anim]) ? o.anim : (o.pinned ? 'llave' : 'idle'), img = ENR[k];
  if (!(img && img.complete && img.naturalWidth)) return drawEnredoOld(mx, my, o);
  const n = ENR_FR[k], ft = (o.t ?? T) * ENR_FPS[k], f = o.once ? Math.min(n-1, Math.floor(ft)) : Math.floor(ft) % n;
  ctx.save(); ctx.globalAlpha = .4; r(Math.round(mx-24), 224, 48, 4, '#000'); ctx.globalAlpha = 1; ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, f*136, 0, 136, 136, Math.round(mx - 68), Math.round(my - 116), 136, 136); ctx.restore();
}

// V2: animaciones de PixelLab para Checho (cuadros de 136x136, personaje de ~94 px)
const CHK_FR = { pij_idle:8, pij_puno:16, pij_patada:8, pij_corre:8, pij_celular:9, idle:8, toca:9, afina:9, calibra:11, celebra:9, falla:9, habla:9, camina:9, corre:8, moonwalk:13, anima:9, triste:9, casa:8, celular:9, celebra_celular:9, chatea:9, corre_mexa:8, anima_dave:9, toca_final:9 };
const CHK_FPS = { pij_idle:5, pij_puno:10, pij_patada:7, pij_corre:11, pij_celular:6, idle:5, toca:10, afina:6, calibra:6, celebra:8, falla:7, habla:7, camina:8, corre:10, moonwalk:9, anima:7, triste:3, casa:5, celular:6, celebra_celular:8, chatea:6, corre_mexa:11, anima_dave:7, toca_final:10 };
const CHK = {}; for (const k in CHK_FR){ CHK[k] = new Image(); CHK[k].src = 'chk_' + k + '.png'; }
function chechoAnim(o){
  if (o.anim) return o.anim;
  if (o.moon) return 'moonwalk';
  if (o.sad) return 'falla';
  if (o.jump) return 'celebra';
  if (o.shout) return 'habla';
  if (o.strum || o.bang) return 'toca';
  if (o.run) return 'corre';
  if (o.walk) return 'camina';
  return 'idle';
}
function drawChechoSprite(x, y, o={}){
  const k = chechoAnim(o), img = CHK[k];
  if (!(img && img.complete && img.naturalWidth)) return drawGuitarist(x, y, o, LOOK.checho);
  const n = CHK_FR[k], f = o.frame != null ? Math.min(n - 1, o.frame) : Math.floor((o.rate ? (o.ph || 0) : T * CHK_FPS[k]) * (o.fast && k === 'toca' ? 1.4 : 1)) % n;
  ctx.save();
  ctx.globalAlpha = .4; r(Math.round(x-26), y-4, 52, 4, '#000');
  ctx.globalAlpha = o.flash ? .5 + Math.sin(T*40)*.5 : 1;
  ctx.imageSmoothingEnabled = false;
  if (o.sc){ ctx.translate(Math.round(x), Math.round(y)); ctx.scale(o.sc, o.sc); ctx.translate(-Math.round(x), -Math.round(y)); }   // o.sc: escala alrededor de los pies
  if (o.flip){ ctx.translate(Math.round(x), 0); ctx.scale(-1, 1); ctx.drawImage(img, f*136, 0, 136, 136, -68, Math.round(y - 116), 136, 136); }
  else ctx.drawImage(img, f*136, 0, 136, 136, Math.round(x - 68), Math.round(y - 116), 136, 136);
  ctx.restore(); ctx.globalAlpha = 1;
}

// V2: animaciones de PixelLab para Maito
const MAI_FR = { beisbol:9, camina:6, caras:9, celebra:9, toca:9, enredado:9, falla:9, habla:9, idle:8, pedales:9, rie:9, sin_gorra:9, triste:9, corre:9, inmovilizado:9, rolas:9, acostado:9, tocando:9, idle_beisbol:8, cowork:8, corre_sin:8 , anima_dave:9 , cuenta_chiste:9, rie_chiste:9, toca_final:9, celular:9, sorpresa:9, noticias:9 };
const MAI_FPS = { beisbol:10, camina:8, caras:5, celebra:8, toca:10, enredado:6, falla:7, habla:7, idle:5, pedales:7, rie:8, sin_gorra:10, triste:3, corre:11, inmovilizado:8, rolas:8, acostado:6, tocando:10, idle_beisbol:5, cowork:5, corre_sin:11 , anima_dave:7 , cuenta_chiste:7, rie_chiste:9, toca_final:9, celular:7, sorpresa:8, noticias:7 };
const MAI = {}; for (const k in MAI_FR){ MAI[k] = new Image(); MAI[k].src = 'mai_' + k + '.png'; }
function maitoAnim(o){
  if (o.anim) return o.anim;
  if (o.wires) return 'enredado';
  if (o.sad) return 'falla';
  if (o.jump) return 'celebra';
  if (o.laugh) return 'rie';
  if (o.shout) return 'habla';
  if (o.noCap || o.hairFace) return 'sin_gorra';
  if (o.strum || o.bang || o.bangOnce) return 'toca';
  if (o.run) return 'corre';
  if (o.walk) return 'camina';
  return 'idle';
}

// Recolorea la gorra (solo la franja superior de cada cuadro) para la colección de gorras
const MAI_TINT = {};
function maitoTinted(k, col){
  const id = k + col; if (MAI_TINT[id]) return MAI_TINT[id];
  const src = MAI[k]; if (!(src.complete && src.naturalWidth)) return src;
  const cv = document.createElement('canvas'); cv.width = src.naturalWidth; cv.height = src.naturalHeight;
  const g = cv.getContext('2d'); g.drawImage(src, 0, 0);
  let d; try { d = g.getImageData(0, 0, cv.width, cv.height); } catch(e){ MAI_TINT[id] = src; return src; }
  const p = d.data, w = cv.width;
  const tr = parseInt(col.slice(1,3),16), tg = parseInt(col.slice(3,5),16), tb = parseInt(col.slice(5,7),16);
  for (let f = 0; f < MAI_FR[k]; f++){
    let top = -1;
    for (let y = 0; y < 136 && top < 0; y++) for (let x = f*136; x < f*136+136; x++) if (p[(y*w+x)*4+3] > 0){ top = y; break; }
    if (top < 0) continue;
    for (let y = top; y < Math.min(136, top + 15); y++) for (let x = f*136; x < f*136+136; x++){
      const i = (y*w+x)*4, R = p[i], G = p[i+1], B = p[i+2];
      // solo el rojo-magenta saturado de la gorra (B ≥ G); la piel es naranja (G > B) y menos saturada, así no se tiñe la frente
      const mx = Math.max(R, G, B), sat = mx ? (mx - Math.min(R, G, B)) / mx : 0;
      if (p[i+3] > 0 && R === mx && R > 60 && sat > .62 && B >= G){ const L = Math.min(1.25, (R+G+B) / 300); p[i] = Math.min(255, tr*L); p[i+1] = Math.min(255, tg*L); p[i+2] = Math.min(255, tb*L); }
    }
  }
  g.putImageData(d, 0, 0); MAI_TINT[id] = cv; return cv;
}
function drawMaitoSprite(x, y, o={}){
  const k = maitoAnim(o); let img = MAI[k];
  if (!(img && img.complete && img.naturalWidth)) return drawGuitarist(x, y, o, LOOK.maito);
  if (o.capCol && o.capCol !== '#e0263f' && o.capCol !== NOCAP && k !== 'sin_gorra') img = maitoTinted(k, o.capCol);
  const n = MAI_FR[k], f = (o.once ? Math.min(n-1, Math.floor((o.t||0) * MAI_FPS[k])) : Math.floor(T * MAI_FPS[k])) % n;
  ctx.save();
  if (k === 'acostado') y += 9;  // tirado en el piso: el cuerpo toca la lona y la sombra queda pegada
  ctx.globalAlpha = .4; if (k === 'acostado') r(Math.round(x-36), y-6, 72, 5, '#000'); else r(Math.round(x-26), y-4, 52, 4, '#000');
  ctx.globalAlpha = o.flash ? .5 + Math.sin(T*40)*.5 : 1;
  ctx.imageSmoothingEnabled = false;
  if (o.sc){ ctx.translate(Math.round(x), Math.round(y)); ctx.scale(o.sc, o.sc); ctx.translate(-Math.round(x), -Math.round(y)); }   // o.sc: escala alrededor de los pies
  if (o.flip){ ctx.translate(Math.round(x), 0); ctx.scale(-1, 1); ctx.drawImage(img, f*136, 0, 136, 136, -68, Math.round(y - 116), 136, 136); }
  else ctx.drawImage(img, f*136, 0, 136, 136, Math.round(x - 68), Math.round(y - 116), 136, 136);
  ctx.restore(); ctx.globalAlpha = 1;
}
const CAST = {
  checho:(x,o)=>drawChechoSprite(x,(o&&o.y)||228,o), maito:(x,o)=>drawMaitoSprite(x,(o&&o.y)||228,o), dave:(x,o)=>drawDaveSprite(x,(o&&o.y)||228,o||{}),
  laca:(x,o)=>drawDirty(x,228,o||{}), mao:(x,o)=>drawMao(x,(o&&o.y)||228,o||{}), cami:(x,o)=>drawCami(x,228,o), maof:(x,o)=>drawMao(x,(o&&o.y)||158,o||{}), camig:(x,o)=>drawCamiGala(x,(o&&o.y)||228,o||{}), camir:(x,o)=>drawCamiRock(x,(o&&o.y)||228,o||{}), director:(x,o)=>drawDirector(x,(o&&o.y)||228,o||{}), ricardo:(x,o)=>drawRicardo(x,228,o||{}),
  deadline:(x,o)=>drawDeadline(x,(o&&o.y)||228,o||{}), ivan:(x,o)=>drawIvan(x,228,o), feedback:(x,o)=>drawFeedback(x,228,o||{})
};

// Carrera nocturna (1.1): la calle se desplaza mientras Checho corre en primer plano
const ESC_CALLES = new Image(); ESC_CALLES.src = 'esc_calles_noche.png';
const LUNA = new Image(); LUNA.src = 'luna.png';
// misma calle sin cielo y con el velo ya aplicado: se dibuja encima de la luna para que esta pase por detrás de edificios y torres
const ESC_CALLES_FRENTE = new Image(); ESC_CALLES_FRENTE.src = 'esc_calles_frente.png';
// pocas estrellas y solo en la franja alta del cielo, para que nunca se monten sobre los edificios
const SKY_STARS = Array.from({length:16}, (_, i) => [ (i*137)%420, 4 + (i*29)%34, (i%4)+1 ]);
const CALLES_Y = 8; // imagen completa con su cielo, al 94 % para integrar mejor a Checho
function sceneStreet(o={}){
  // A: fondo quieto, Checho entra por la izquierda · B: la ciudad avanza y luego frena; los pasos de Checho van al mismo ritmo que la calle
  // C: Checho se detiene frente a Rock Express y el fondo da el último deslizamiento llevándolo consigo (queda anclado al andén)
  // Al final: «TOCA PARA ENTRAR»; solo con el toque hay fundido a negro y pasa a la siguiente escena
  const t0 = T, A = 1.8, D = 12, END = A + D, FADE = .7, RUNX = 146, GLIDE = 20;
  let released = false, fadeT = -1, ph = 0, lastT = T, oxStop = -1; dlgLock = true;
  dlgLockTap = () => { if (T - t0 >= END && fadeT < 0) fadeT = T; };
  const prog = u => (u < .7 ? u : .7 + (u - .7) - (u - .7)*(u - .7)/.6) / .85;
  const speed = u => u < .7 ? 1 : Math.max(0, 1 - 2*(u - .7)/.6); // velocidad relativa de la calle (1 = crucero)
  return { update(){}, draw(){
    const t = T - t0;
    let ox = 0, cx = RUNX, span = 781, rate = 1;
    const ready = ESC_CALLES.complete && ESC_CALLES.naturalWidth;
    if (ready){ span = ESC_CALLES.naturalWidth - W; if (t >= A){ const u = Math.min(1, (t - A) / D); ox = prog(u) * span; rate = speed(u); } }
    const g = ctx.createLinearGradient(0, 0, 0, 260); g.addColorStop(0, '#05040f'); g.addColorStop(1, '#1a1033');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, 420);
    if (!ready) SKY_STARS.forEach(([x, y, k]) => { const sx = ((x - ox*.12) % 420 + 420) % 420 - 90; if (sx < -2 || sx > W) return; ctx.globalAlpha = .35 + .65*Math.abs(Math.sin(T*k*.7 + x)); r(Math.round(sx), y, k > 2 ? 2 : 1, k > 2 ? 2 : 1, '#fff'); }); ctx.globalAlpha = 1;
    r(0, 300, W, 120, '#0b0a1a');
    if (ready){ ctx.imageSmoothingEnabled = false; ctx.drawImage(ESC_CALLES, -Math.round(ox), CALLES_Y); }
    // velo oscuro: baja el brillo del fondo para que Checho resalte
    r(0, 0, W, 420, 'rgba(8,5,24,.38)');
    // luna sobre el cielo de la imagen, con paralaje lento (4 %)
    const mxm = Math.round(200 - ox*.04);
    // luna llena azulada (estilo de la referencia de Sergio) con halo suave
    { const g = ctx.createRadialGradient(mxm, 52, 4, mxm, 52, 34); g.addColorStop(0, 'rgba(120,170,255,.55)'); g.addColorStop(.45, 'rgba(60,100,230,.22)'); g.addColorStop(1, 'rgba(20,30,120,0)');
      ctx.fillStyle = g; ctx.fillRect(mxm - 34, 18, 68, 68);
      if (LUNA.complete && LUNA.naturalWidth){ ctx.imageSmoothingEnabled = false; ctx.drawImage(LUNA, Math.round(mxm - 11), 41); }
      else { ctx.fillStyle = '#e8f2ff'; ctx.beginPath(); ctx.arc(mxm, 52, 10, 0, Math.PI*2); ctx.fill(); } }
    if (ready && ESC_CALLES_FRENTE.complete && ESC_CALLES_FRENTE.naturalWidth) ctx.drawImage(ESC_CALLES_FRENTE, -Math.round(ox), CALLES_Y);
    // Checho: entra corriendo; luego corre en su sitio al ritmo de la calle; al llegar se detiene y queda pegado al andén
    if (t < A) cx = -50 + (t / A) * (RUNX + 50);
    else if (oxStop < 0 && ox >= span - GLIDE) oxStop = ox;
    if (oxStop >= 0) cx = RUNX - (ox - oxStop);
    const running = oxStop < 0;
    ph += (T - lastT) * CHK_FPS.corre * Math.max(.35, rate); lastT = T;
    drawChechoSprite(Math.round(cx), 300, running ? { run:true, rate:true, ph } : { anim:'idle' });
    drawHUD(o.label || '');
    if (t >= END + .3 && fadeT < 0 && Math.sin(T*5) > -.3) txt('TOCA PARA ENTRAR', W/2, 78, '#fff3c4', 'center', 7);
    if (fadeT >= 0){ const k = Math.min(1, (T - fadeT)/FADE); ctx.globalAlpha = k; r(0, 0, W, 420, '#000'); ctx.globalAlpha = 1;
      if (k >= 1 && !released){ released = true; dlgLock = false; dlgLockTap = null; fadeIn = .7; if (typing){ clearInterval(typing); typing = null; } advance(); } }
  }, tap(){ dlgLockTap && dlgLockTap(); }, stop(){ dlgLock = false; dlgLockTap = null; } };
}
// Perla, la gata de Checho (el GIF corre mirando a la izquierda; se voltea al ir a la derecha): guiño durante la llamada de Ricardo (prólogo).
// Cruza corriendo de izquierda a derecha, vuelve por la derecha, se sienta bajo la ventana a asearse y sale disparada.
const PERLA = { t0: -1 }; ['corre','lame','camina','salta','idle'].forEach(k => PERLA[k] = Object.assign(new Image(), { src:'perla_' + k + '.png' }));
const PERLA_FR = { corre: 8, lame: 9, camina: 8, salta: 8, idle: 8 }, PERLA_FPS = { corre: 14, lame: 5, camina: 8, salta: 12, idle: 5 };
const PERLA_FOOT = { camina: 37, idle: 34, salta: 41 };   // dónde quedan las patas dentro del cuadro (los demás llegan hasta abajo)
function perlaStart(delay = 0){ PERLA.t0 = T + delay; PERLA.dash = -1; }
function perlaSprite(k, x, y, flip, frame){
  const im = PERLA[k]; if (!(im.complete && im.naturalWidth)) return;
  const n = PERLA_FR[k], fw = im.naturalWidth / n, fh = im.naturalHeight, f = frame != null ? Math.min(n - 1, frame) : Math.floor(T * PERLA_FPS[k]) % n, foot = PERLA_FOOT[k] ?? fh;
  ctx.save(); ctx.imageSmoothingEnabled = false; ctx.translate(Math.round(x), Math.round(y));
  if (flip) ctx.scale(-1, 1);
  ctx.globalAlpha = .35; r(-Math.round(fw/2) + 2, -1, fw - 4, 2, '#000'); ctx.globalAlpha = 1; // sombrita
  ctx.drawImage(im, f*fw, 0, fw, fh, -Math.round(fw/2), -foot, fw, fh); ctx.restore();
}
function drawPerla(){
  if (PERLA.t0 < 0) return; const t = T - PERLA.t0; if (t < 0) return;
  const ease = u => 1 - (1-u)*(1-u), SX = 200, SY = 204;
  if (t < 1.7) perlaSprite('corre', -24 + t*170, 214, true);                                  // cruza →
  else if (t < 3.4) {}                                                                          // fuera de cuadro
  else if (t < 4.5){ const u = (t - 3.4)/1.1; perlaSprite('corre', 262 - (262 - SX)*ease(u), 214 - 10*u, false); } // vuelve ← y frena
  else if (t < 10) perlaSprite('lame', SX, SY, false);                                           // se asea (≈ 5,5 s, para que se note)
  else if (t < 11.5){ const u = t - 10; perlaSprite('corre', SX - u*260, SY + Math.min(12, u*20), false); } // sale disparada ←
  else PERLA.t0 = -1;
}
// último paso: justo cuando Checho abre el chat, Perla cruza rapidísimo hacia la derecha
function perlaDash(delay = .4){ PERLA.dash = T + delay; }
function drawPerlaDash(){ if (!(PERLA.dash > 0)) return; const t = T - PERLA.dash; if (t < 0) return;
  if (t < 1.1) perlaSprite('corre', -24 + t*260, 216, true); else PERLA.dash = -1; }
function sceneIdle(o={}){
  return { update(){}, draw(){
    drawStage({ party:o.party });
    (o.cast || []).forEach(([k,x,opts]) => CAST[k](x, Object.assign({}, opts||{}, o.bang ? { bang:true } : {}, o.jump ? { jump:true } : {})));
    if (o.extra) o.extra();
    drawCrowd(); drawHUD(o.label);
  }, tap(){} };
}
