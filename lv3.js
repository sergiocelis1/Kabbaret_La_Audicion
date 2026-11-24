'use strict';
/* ===================== NIVEL 3 · DAVE · Cowork 24h ===================== */
let davePeto = true;
// Nivel 3 · inicio: el Kabbaret Móvil (Aveo de Maito) cruza Bogotá de noche. Entra por la derecha con la ciudad quieta,
// la cámara lo acompaña un tramo (la ciudad se desplaza), la ciudad se detiene y el auto sale por la izquierda;
// cuando ya no está en pantalla, fundido a negro y sigue. Suspensión: rebote muy leve.
const ESC_BOGOTA = new Image(); ESC_BOGOTA.src = 'esc_bogota_carro.png';
const AVEO = new Image(); AVEO.src = 'aveo_avanza.png';
const AVEO_PARK = new Image(); AVEO_PARK.src = 'aveo_parqueado.png';   // Aveo parqueado (dibujo de Sergio), al 110 %
function sceneCarRide(){
  // Modelo continuo: el auto avanza a velocidad constante y la cámara lo alcanza suavemente, lo acompaña y luego frena;
  // así el auto nunca se detiene en seco y la ciudad se desplaza de forma fluida (posiciones con subpíxel).
  const V = 118, UP0 = .9, UP = 1.3, DOWN = 1.3, SC = 1.1, BGY = 40, CARY = 245;
  let lastT = T, t = 0, o = 0, released = false, fadeT = -1, phase = 0; dlgLock = true;
  const sm = u => u*u*(3-2*u);
  return { update(){}, draw(){
    const dt = Math.min(.05, T - lastT); lastT = T; t += dt;
    const ready = ESC_BOGOTA.complete && ESC_BOGOTA.naturalWidth, span = ready ? ESC_BOGOTA.naturalWidth - W : 540;
    // velocidad de la cámara: 0 → V (suave), se mantiene, y frena (suave) para recorrer exactamente todo el fondo
    const dist = span, hold = (dist - V*UP/2 - V*DOWN/2) / V;
    let cs = 0;
    if (t > UP0 && t <= UP0 + UP) cs = V * sm((t - UP0)/UP);
    else if (t > UP0 + UP && t <= UP0 + UP + hold) cs = V;
    else if (t > UP0 + UP + hold && t <= UP0 + UP + hold + DOWN) cs = V * (1 - sm((t - UP0 - UP - hold)/DOWN));
    o = Math.min(dist, o + cs*dt);
    const g = ctx.createLinearGradient(0, 0, 0, 300); g.addColorStop(0, '#05040f'); g.addColorStop(1, '#120a26'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, 420);
    if (ready){ ctx.imageSmoothingEnabled = true; ctx.drawImage(ESC_BOGOTA, -(span - o), BGY); ctx.imageSmoothingEnabled = false; }
    r(0, 0, W, 420, 'rgba(8,5,24,.38)');   // velo oscuro para que el auto resalte
    r(0, BGY + 261, W, 420, '#07040f');
    // auto: velocidad constante en el mundo; en pantalla = mundo + lo que avanzó la cámara
    const cx = 300 - V*t + o;
    const bob = Math.sin(T*9) * .7 + Math.sin(T*23) * .35;   // amortiguación muy leve
    const w = 112*SC;
    if (AVEO.complete && AVEO.naturalWidth && cx > -80){ const f = Math.floor(T*10) % 9;
      ctx.save(); ctx.globalAlpha = .45; r(Math.round(cx - 38), CARY - 2, 76, 4, '#000'); ctx.globalAlpha = 1; ctx.imageSmoothingEnabled = false;
      ctx.drawImage(AVEO, f*112, 0, 112, 112, Math.round(cx - w/2), Math.round(CARY - 78*SC + bob), w, w); ctx.restore(); }
    drawHUD('NIVEL 3');
    if (cx <= -80){ if (fadeT < 0) fadeT = T; const k = Math.min(1, (T - fadeT)/.8); ctx.globalAlpha = k; r(0, 0, W, 420, '#000'); ctx.globalAlpha = 1;
      if (k >= 1 && !released){ released = true; dlgLock = false; fadeIn = .7; if (typing){ clearInterval(typing); typing = null; } advance(); } }
  }, tap(){}, stop(){ dlgLock = false; } };
}

// Llegada al cowork: Dave a la izquierda mirando a la derecha; Checho y Maito entran corriendo por la derecha y se paran frente a él
const COWORK_CAST = [['dave',70,{ peto:true }],['maito',136,{ anim:'cowork' }],['checho',186,{ anim:'casa' }]];
function sceneCoworkArrive(){
  const t0 = T, D = 1.3, ease = u => 1 - (1-u)*(1-u);
  return { update(){}, draw(){
    const u = Math.min(1, (T - t0)/D);
    drawStage();
    CAST.dave(70, { peto:true });
    drawMaitoSprite(300 - (300 - 136)*ease(Math.min(1, u*1.08)), 228, u < 1 ? { anim:'corre_sin', flip:true } : { anim:'cowork' });   // sin guitarra
    drawChechoSprite(340 - (340 - 186)*ease(u), 228, u < 1 ? { anim:'corre_mexa', flip:true } : { anim:'casa' });
    drawCrowd(); drawHUD('NIVEL 3');
  }, tap(){} };
}

// Tras la charla: Checho y Maito salen corriendo por la derecha; luego Dave camina al centro y queda en idle
function sceneCoworkExit(){
  const t0 = T, RUN = 1.1, W0 = 1.0, WD = 1.2;
  return { update(){}, draw(){
    const t = T - t0, u = Math.min(1, t / RUN), ease = v => v*v;
    drawStage();
    const dw = Math.min(1, Math.max(0, (t - W0) / WD)), dx = 70 + (120 - 70) * dw;
    CAST.dave(dx, dw > 0 && dw < 1 ? { anim:'camina' } : {});
    if (u < 1){ drawMaitoSprite(136 + 200*ease(u), 228, { anim:'corre_sin' }); drawChechoSprite(186 + 200*ease(u), 228, { anim:'corre_mexa' }); }
    drawCrowd(); drawHUD('NIVEL 3');
  }, tap(){} };
}

// ===================== RETO 1 · ¿Dónde está el camión? =====================
// Mapa de EE. UU. en la pantalla grande del cowork; el jefe gringo da pistas y Dave toca el camión que coincide.
const US_POLY = [[-124.7,48.4],[-123,49],[-95,49],[-89.5,48],[-84.8,46.5],[-82.5,45.3],[-82.4,43],[-79,43.5],[-76.5,44.2],[-75,45],[-71.5,45],[-69.2,47.4],[-67.8,47],[-67,44.9],[-70.6,43],[-70.8,42],[-70,41.7],[-71.9,41.3],[-74,40.6],[-74.3,39.5],[-75.5,38.5],[-76,37],[-75.5,35.5],[-77,34.5],[-79,33.5],[-81,32],[-81.4,30.5],[-80,26.9],[-80.4,25.2],[-81.2,25.4],[-82.7,27.8],[-83,29.2],[-85.2,29.7],[-87.5,30.3],[-89.6,30.2],[-89.4,29],[-91,29.3],[-93.8,29.7],[-95,29.3],[-97.2,27.8],[-97.4,26],[-99.2,26.6],[-100.5,28.3],[-101.4,29.8],[-102.4,29.8],[-103.2,29],[-104.5,29.6],[-106.5,31.8],[-108.2,31.3],[-111,31.3],[-114.8,32.5],[-117.1,32.5],[-118.5,34],[-120.6,34.6],[-121.9,36.6],[-122.5,37.8],[-123.7,39],[-124.2,40.4],[-124.1,42],[-124.5,43.5],[-123.9,46.2]];
const US_LAKES = [[-87.6,47.6,9,3],[-87,44,2.5,6],[-82.6,44.8,3.5,3.5],[-81.2,42.2,5.5,1.8],[-77.8,43.6,4,1.6],[-112.5,41.1,2.5,2.5],[-80.8,26.9,2,2],[-120,39.1,1.6,2]];
const MX = (lon) => 12 + (lon + 125) / 58 * 216, MY = (lat) => 302 + (49 - lat) / 24 * 104;
// Camiones (sprite de Sergio en 8 direcciones): hoja camiones.png generada con prod/camiones.py
const TRUCKS_IMG = Object.assign(new Image(), { src:'camiones.png' });
const TRUCK_ROW = { red:0, wine:1, orange:2, pink:3, blue:4, yellow:5, green:6 };
// rondas: [lon, lat, color, franja negra en el furgón, carga, dirección 0=S 1=SE 2=E 3=NE 4=N 5=NO 6=O 7=SO] · la primera es la correcta
// colores parecidos (vinotinto, naranja, rosado) para que la pista se tenga que leer con cuidado
const TRUCK_ROUNDS = [
  { clue:'It’s red… near a lake.', t:[[-81.6,41.6,'red',0,'',2],[-88.2,43.2,'orange',0,'',3],[-99,31.5,'red',0,'',7],[-112.2,40.2,'wine',0,'',1]] },
  { clue:'Red, near a lake… and it says TOILET PAPER EXPRESS.', t:[[-87.9,46.4,'red',0,'tp',6],[-86.1,42.6,'red',0,'',3],[-111.8,33.5,'red',0,'tp',2],[-81.5,41.3,'orange',0,'tp',7],[-76.8,43,'wine',0,'tp',1],[-119.6,38.4,'pink',0,'tp',5]] },
  { clue:'Red, TOILET PAPER… black stripe on the box.', t:[[-81.8,40.2,'red',1,'tp',1],[-84.6,45.6,'red',1,'taco',2],[-111.6,40.3,'red',1,'',5],[-88.8,40.9,'red',0,'tp',6],[-80.9,28.4,'orange',1,'tp',3],[-104.9,39.2,'wine',1,'tp',0],[-90.2,34.6,'pink',1,'taco',7],[-117.5,46.8,'red',0,'tp',5]] }
];
const MAP_EGGS = [['pollo',-98.5,36.6]];   // único easter egg: el pollito
// mapa pixelado: se rasteriza una sola vez (máscaras sin antialias) y se pinta con borde, luz y sombra
const UMAP_X = 8, UMAP_Y = 298, UMAP_W = 224, UMAP_H = 116;
const CA_POLY = [[-130,56],[-54,56],[-54,47.5],[-60,46.2],[-64,45.2],[-66.6,44.9],[-67.8,47.2],[-69.2,47.5],[-71.5,45],[-75,45],[-79,43.6],[-82.4,43],[-82.5,45.3],[-84.8,46.6],[-89.5,48],[-95,49],[-123,49],[-124.8,48.5],[-127,50.5]];
const MX_POLY = [[-117.1,32.5],[-114.8,32.5],[-111,31.3],[-108.2,31.3],[-106.5,31.8],[-104.5,29.6],[-103.2,29],[-102.4,29.8],[-101.4,29.8],[-100.5,28.3],[-99.2,26.6],[-97.4,26],[-97.7,22],[-105,20],[-110,23.5],[-112.5,27],[-114.5,30],[-115.6,29.8],[-114.3,27.2],[-112,24.5],[-109.6,23],[-111.5,25.5],[-114,28.5],[-116.8,31]];
const STATE_LINES = [
  [[-117,49],[-117,46],[-116.9,44],[-117,42]], [[-124.2,46.2],[-117,46.1]], [[-124.2,42],[-111,42]], [[-120,42],[-120,39],[-114.6,35]],
  [[-114,42],[-114,37]], [[-111,45],[-111,41],[-109,41],[-109,31.3]], [[-114.6,37],[-94.6,37]], [[-111,41],[-102,41],[-102,37]], [[-104,49],[-104,41]],
  [[-111,45],[-104,45]], [[-104,45.9],[-96.6,45.9]], [[-104,43],[-96.5,43]], [[-102,40],[-95.3,40]], [[-96.6,49],[-96.5,43]],
  [[-94.6,40],[-94.6,36.5],[-94.4,33],[-94,31.8],[-93.8,29.7]], [[-94.4,33],[-91,33]], [[-103,36.5],[-103,32],[-106.6,32]], [[-103,36.5],[-100,36.5],[-100,34.5]],
  [[-94.6,36.5],[-75.9,36.5]], [[-90,35],[-84.3,35]], [[-88.4,35],[-88.4,31]], [[-85.1,35],[-85.1,31],[-88,31]], [[-80.5,42],[-73.6,42]], [[-80.5,42],[-80.5,39.7],[-75.7,39.7]],
  [[-84.8,41.7],[-84.8,39.1]], [[-87.5,41.7],[-87.5,37.9]], [[-90.6,41.7],[-80.5,41.7]], [[-73.5,45],[-73.5,41]], [[-71.8,45],[-71.8,42]]
];
const MISSISSIPPI = [[-95.2,47.4],[-93.3,45],[-91.3,43.6],[-91,41.2],[-90.2,38.8],[-89.4,37],[-90.1,35],[-91.1,33],[-91.5,31],[-90.2,29.9],[-89.4,29.2]];
const CITIES = [[-122.3,47.6],[-122.4,37.8],[-118.2,34.1],[-115.1,36.2],[-112.1,33.5],[-105,39.7],[-96.8,32.8],[-95.4,29.8],[-87.6,41.9],[-84.4,33.7],[-80.2,25.9],[-74,40.7],[-77,38.9],[-90.1,30],[-93.3,44.9],[-104.9,39.8]];
let MAP_CANVAS = null;
function buildMap(){
  const c = document.createElement('canvas'); c.width = UMAP_W; c.height = UMAP_H; const g = c.getContext('2d', { willReadFrequently:true });
  const P = (lo, la) => [Math.round(MX(lo) - UMAP_X), Math.round(MY(la) - UMAP_Y)];
  const mask = paint => { g.clearRect(0, 0, UMAP_W, UMAP_H); g.fillStyle = '#fff'; paint(); const d = g.getImageData(0, 0, UMAP_W, UMAP_H).data, m = new Uint8Array(UMAP_W*UMAP_H); for (let i=0;i<m.length;i++) m[i] = d[i*4+3] > 127 ? 1 : 0; return m; };
  const poly = pts => { g.beginPath(); pts.forEach(([lo, la], i) => { const [x, y] = P(lo, la); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.closePath(); g.fill(); };
  const US = mask(() => poly(US_POLY)), NB = mask(() => { poly(CA_POLY); poly(MX_POLY); });
  const LK = mask(() => US_LAKES.forEach(([lo, la, rx, ry]) => { const [x, y] = P(lo, la); g.beginPath(); g.ellipse(x, y, rx*1.4, ry*1.4, 0, 0, 7); g.fill(); }));
  const ST = mask(() => { g.strokeStyle = '#fff'; g.lineWidth = 1; STATE_LINES.forEach(l => { g.beginPath(); l.forEach(([lo, la], i) => { const [x, y] = P(lo, la); i ? g.lineTo(x + .5, y + .5) : g.moveTo(x + .5, y + .5); }); g.stroke(); }); });
  const RV = mask(() => { g.strokeStyle = '#fff'; g.lineWidth = 1.2; g.beginPath(); MISSISSIPPI.forEach(([lo, la], i) => { const [x, y] = P(lo, la); i ? g.lineTo(x + .5, y + .5) : g.moveTo(x + .5, y + .5); }); g.stroke(); });
  const at = (m, x, y) => x >= 0 && y >= 0 && x < UMAP_W && y < UMAP_H ? m[y*UMAP_W + x] : 0;
  const land = (x, y) => (at(US, x, y) || at(NB, x, y)) && !at(LK, x, y);
  const img = g.createImageData(UMAP_W, UMAP_H), D = img.data;
  const hex = h => [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)];
  const put = (x, y, h) => { const [r0, g0, b0] = hex(h), i = (y*UMAP_W + x)*4; D[i] = r0; D[i+1] = g0; D[i+2] = b0; D[i+3] = 255; };
  for (let y=0;y<UMAP_H;y++) for (let x=0;x<UMAP_W;x++){
    const us = at(US, x, y) && !at(LK, x, y), lk = at(LK, x, y), nb = !at(US, x, y) && at(NB, x, y);
    if (lk){ const edge = !at(LK, x-1, y) || !at(LK, x, y-1); put(x, y, edge ? '#8fd0ff' : ((x + y) % 7 === 0 ? '#4a8cff' : '#2f6bff')); continue; }
    if (us){
      const outL = !at(US, x-1, y) || at(LK, x-1, y), outU = !at(US, x, y-1) || at(LK, x, y-1), outR = !at(US, x+1, y) || at(LK, x+1, y), outD = !at(US, x, y+1) || at(LK, x, y+1);
      if (outL || outU) put(x, y, '#5fe0b4');                    // luz arriba-izquierda
      else if (outR || outD) put(x, y, '#0c3d34');               // sombra abajo-derecha
      else if (at(RV, x, y)) put(x, y, '#3f8cff');               // río Mississippi
      else if (at(ST, x, y) && (x + y) % 2 === 0) put(x, y, '#0f4a40');   // límites estatales punteados
      else put(x, y, (x + y*3) % 5 === 0 ? '#1d7a62' : '#186a56');
      continue; }
    if (nb){ const e = !land(x-1, y) || !land(x, y-1); put(x, y, e ? '#3a4566' : ((x ^ y) & 3) === 0 ? '#222b45' : '#1c2440'); continue; }
    // océano: sombra del país, espuma junto a la costa, oleaje suave
    const sh = at(US, x-2, y-2) && !at(LK, x-2, y-2);
    let near = false; for (let dy=-2; dy<=2 && !near; dy++) for (let dx=-2; dx<=2; dx++) if (land(x+dx, y+dy)){ near = true; break; }
    put(x, y, sh ? '#050b1c' : near ? ((x + y) % 2 ? '#16336a' : '#10275a') : (y % 6 === 0 && (x + (y>>1)) % 10 < 5 ? '#0f2350' : (x % 16 === 0 || y % 16 === 0) ? '#0d1f48' : '#0a1838'));
  }
  g.putImageData(img, 0, 0);
  const onUS = (x, y) => at(US, x, y) && !at(LK, x, y);
  // autopistas interestatales: líneas punteadas color ámbar
  const line = (pts, col) => { for (let i=1;i<pts.length;i++){ const [x0, y0] = P(...pts[i-1]), [x1, y1] = P(...pts[i]), n = Math.max(Math.abs(x1-x0), Math.abs(y1-y0));
    for (let k=0;k<=n;k++){ const x = Math.round(x0 + (x1-x0)*k/n), y = Math.round(y0 + (y1-y0)*k/n); if (k % 3 !== 2 && onUS(x, y)){ g.fillStyle = col; g.fillRect(x, y, 1, 1); } } } };
  [[[-122.4,37.8],[-112,41],[-104.8,41.1],[-96,41.2],[-87.6,41.9],[-81.7,41.4],[-74,40.7]],          // I-80
   [[-118.2,34.1],[-112.1,33.5],[-106.5,31.8],[-98.5,29.4],[-95.4,29.8],[-90.1,30],[-81.7,30.3]],      // I-10
   [[-122.3,47.6],[-122.7,45.5],[-122.4,40.6],[-121.5,38.6],[-118.2,34.1]],                           // I-5
   [[-80.2,25.9],[-81.7,30.3],[-80,32.8],[-77.4,37.5],[-77,38.9],[-74,40.7],[-71.1,42.4]],             // I-95
   [[-97.5,26],[-98.5,29.4],[-96.8,32.8],[-97.5,35.5],[-94.6,39.1],[-93.3,44.9]]                       // I-35
  ].forEach(r0 => line(r0, '#b88a2e'));
  // montañas: Rocosas y Apalaches (triángulos con nieve)
  const peak = (lo, la, s) => { const [x, y] = P(lo, la); for (let j=0;j<s;j++){ g.fillStyle = j < 1 ? '#e8f4ff' : j < s-1 ? '#2f8f73' : '#0c3d34'; g.fillRect(x - j, y + j, j*2 + 1, 1); } g.fillStyle = '#0c3d34'; g.fillRect(x + 1, y + 1, Math.max(1, s-2), s-1); g.fillStyle = '#5fe0b4'; g.fillRect(x - 1, y + 1, 1, 1); };
  [[-113.5,47.5,4],[-110.5,44.6,5],[-108.3,42.8,4],[-106.2,40,5],[-105.3,37.7,4],[-107.4,38.6,3],[-112.4,45.4,3],[-115.4,44.2,4],[-119.2,37.7,4],[-121.7,41.2,3],[-121.7,46.9,4],
   [-82.6,35.7,3],[-80.5,37.8,3],[-78.5,39.6,3],[-76.2,41.4,3]].forEach(([lo, la, s]) => { const [x, y] = P(lo, la); if (onUS(x, y + s - 1)) peak(lo, la, s); });
  CITIES.forEach(([lo, la]) => { const [x, y] = P(lo, la); g.fillStyle = '#7a5a10'; g.fillRect(x-1, y, 3, 1); g.fillRect(x, y-1, 1, 3); g.fillStyle = '#ffd34d'; g.fillRect(x, y, 1, 1); });
  // rótulos tenues: océanos, países vecinos y algunas ciudades
  const lab = (s, lo, la, col, al) => { const [x, y] = P(lo, la); ptxt(s, x, y, col, al || 'center', '#050b1c', g); };
  lab('PACIFIC', -121.5, 31.6, '#3d6aa8'); lab('ATLANTIC', -66.2, 33.2, '#3d6aa8', 'right'); lab('GULF', -89.5, 27.4, '#3d6aa8');
  lab('MEXICO', -104.5, 26.6, '#5a6688');
  [['SEA',-122.3,47.6,1],['SF',-122.4,37.8,1],['LA',-118.2,34.1,1],['DEN',-105,39.7,0],['DAL',-96.8,32.8,0],['CHI',-87.6,41.9,-1],['NYC',-74,40.7,-1],['MIA',-80.2,25.9,-1]].forEach(([s, lo, la, side]) => {
    const [x, y] = P(lo, la); ptxt(s, side > 0 ? x + 3 : side < 0 ? x - 3 : x, side === 0 ? y + 3 : y - 2, '#c9a85a', side > 0 ? 'left' : side < 0 ? 'right' : 'center', '#06120f', g); });
  return c;
}
function drawTruck(x, y, col, dent, cargo, dir, hi, t){
  // hoja: 8 direcciones (S, SE, E, NE, N, NO, O, SO) × filas color/abolladura/carga, celdas 24×24 (abolladuras y logos ya pintados)
  x = Math.round(x); y = Math.round(y);
  if (!(TRUCKS_IMG.complete && TRUCKS_IMG.naturalWidth)) { r(x-5, y-5, 10, 10, col === 'red' ? '#e0263f' : '#888'); return; }
  const row = (TRUCK_ROW[col]*2 + (dent ? 1 : 0))*3   // dent = franja negra en el furgón
                + (cargo === 'tp' ? 1 : cargo === 'taco' ? 2 : 0);
  ctx.imageSmoothingEnabled = false;
  ctx.globalAlpha = .35; r(x - 8, y + 7, 16, 2, '#000'); ctx.globalAlpha = 1;   // sombra en el piso
  ctx.drawImage(TRUCKS_IMG, (dir % 8)*24, row*24, 24, 24, x-12, y-12, 24, 24);
  if (hi){ const k = 1 + Math.round(Math.abs(Math.sin((t||0)*8))); ctx.strokeStyle = hi; ctx.lineWidth = 1; ctx.strokeRect(x - 11 - k + .5, y - 11 - k + .5, 22 + k*2 - 1, 22 + k*2 - 1); }
}
function drawMapEgg(k, x, y){ ITEM.pollo(x, y, true); }   // el pollito escondido en el mapa
function sceneTruck(){
  const S = { round:0, trucks:[], t:25, miss:0, bonus:0, done:false, flash:0, msg:'', msgT:0, wait:0, eggs:{}, shake:0 };
  if (window.DEV_HOOK) window.__truck = S;   // solo para pruebas
  const start = () => { const R = TRUCK_ROUNDS[S.round]; S.trucks = R.t.map((a, i) => ({ x:MX(a[0]), y:MY(a[1]), col:a[2], dent:a[3], cargo:a[4], dir:a[5] || 0, ok:i === 0, bad:0 })); S.t = 25; S.miss = 0; addBubble('RONDA ' + (S.round+1) + '/3', 120, 96, C.gold, 9); };
  start();
  const say = (m, c) => { S.msg = m; S.msgC = c || '#fff'; S.msgT = 2.4; };
  return { label:'RETO 1/3',
    update(dt){
      if (S.done) return;
      if (S.msgT > 0) S.msgT -= dt; if (S.flash > 0) S.flash -= dt; if (S.yay > 0) S.yay -= dt; if (S.shake > 0) S.shake -= dt; if (S.fail > 0) S.fail -= dt;
      if (S.wait > 0){ S.wait -= dt; if (S.wait <= 0){ S.round++; if (S.round >= 3){ S.done = true; win('¡CAMIÓN ENCONTRADO!'); setTimeout(stepDone, 1000); } else start(); } return; }
      // sin presión de tiempo: el reto no tiene reloj
    },
    draw(){
      drawStage(); CAST.dave(120, S.fail > 0 ? { anim:'falla' } : S.yay > 0 ? { anim:'acierta', frame: Math.floor((1.5 - S.yay) * 6) } : {}); drawCrowd(); drawHUD(this.label);   // acierta el camión: celebra con el bajo (una sola vez)
      // monitor de despacho: marco, cabecera con la llamada y mapa pixelado
      r(0, 252, W, H-252, '#0d0820'); r(0, 252, W, 2, '#3b2f66');
      r(3, 256, 234, 162, '#05030c'); r(4, 257, 232, 160, '#2a2240'); r(5, 258, 230, 158, '#05030c');
      [[6,259],[231,259],[6,414],[231,414]].forEach(([a,b]) => r(a, b, 3, 3, '#3b2f66'));
      // cabecera: cara de Mr. Deadline en la llamada, EN VIVO, fallos, tiempo y la pista en dos renglones
      r(8, 260, 224, 35, '#120c2a'); r(8, 295, 224, 1, '#3b2f66');
      r(9, 261, 26, 26, C.ok); r(10, 262, 24, 24, '#1a2a4a'); if (DDL_CARA.complete && DDL_CARA.naturalWidth){ ctx.imageSmoothingEnabled = false; ctx.drawImage(DDL_CARA, (Math.floor(T*5) % 8)*22, 0, 22, 22, 11, 263, 22, 22); }   // cara de Mr. Deadline en la llamada
      if ((T*2|0) % 2) r(39, 263, 4, 4, C.neon); ptxt('EN VIVO · MR. DEADLINE', 46, 263, '#9ab8ff', 'left', '#05030c');
      for (let i=0;i<3;i++) r(186 + i*6, 263, 4, 4, i < S.miss ? C.neon : '#3a2f5a');
      
      { const words = ('«' + TRUCK_ROUNDS[Math.min(2, S.round)].clue + '»').split(' '), lines = ['']; words.forEach(w => { const c = lines[lines.length-1]; if (pxWidth((c + ' ' + w).trim()) > 190) lines.push(w); else lines[lines.length-1] = (c + ' ' + w).trim(); });
        lines.slice(0, 3).forEach((ln, i) => ptxt(ln, 39, 272 + i*8, '#ffffff', 'left', '#000')); }
      // mapa
      const sx = S.shake > 0 ? Math.round(Math.sin(T*60)*2) : 0;
      ctx.save(); ctx.beginPath(); ctx.rect(UMAP_X, UMAP_Y, UMAP_W, UMAP_H); ctx.clip(); ctx.translate(sx, 0);
      if (!MAP_CANVAS) MAP_CANVAS = buildMap(); ctx.imageSmoothingEnabled = false; ctx.drawImage(MAP_CANVAS, UMAP_X, UMAP_Y);
      // barrido del radar
      const sy = UMAP_Y + ((T*28) % (UMAP_H + 20)) - 10; ctx.globalAlpha = .08; r(UMAP_X, sy, UMAP_W, 3, '#7affd6'); ctx.globalAlpha = .04; r(UMAP_X, sy - 6, UMAP_W, 6, '#7affd6'); ctx.globalAlpha = 1;
      MAP_EGGS.forEach(([k, lo, la]) => { if (!S.eggs[k]) drawMapEgg(k, MX(lo), MY(la)); });
      S.trucks.forEach((tk, i) => { const ph = ((T*.8 + i*.37) % 1); ctx.globalAlpha = .35*(1-ph); ctx.strokeStyle = '#7affd6'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(tk.x + .5, tk.y + 8.5, 4 + ph*12, 2 + ph*5, 0, 0, 7); ctx.stroke(); ctx.globalAlpha = 1; });   // señal GPS de cada camión
      S.trucks.forEach(tk => drawTruck(tk.x, tk.y, tk.col, tk.dent, tk.cargo, tk.dir, S.wait > 0 && tk.ok ? C.ok : tk.bad > 0 ? C.neon : null, T));
      ctx.globalAlpha = .07; for (let y = UMAP_Y; y < UMAP_Y + UMAP_H; y += 2) r(UMAP_X, y, UMAP_W, 1, '#000'); ctx.globalAlpha = 1;   // líneas de monitor
      // rosa de los vientos
      r(16, 398, 1, 9, '#9ab8ff'); r(12, 402, 9, 1, '#9ab8ff'); r(15, 397, 3, 2, '#fff'); ptxt('N', 17, 389, '#fff', 'center', '#000');
      ctx.restore();
      // esquinas del visor y barra de tiempo
      [[UMAP_X, UMAP_Y, 1, 1], [UMAP_X + UMAP_W - 6, UMAP_Y, -1, 1], [UMAP_X, UMAP_Y + UMAP_H - 1, 1, -1], [UMAP_X + UMAP_W - 6, UMAP_Y + UMAP_H - 1, -1, -1]].forEach(([a, b]) => { r(a, b, 6, 1, C.cyan); r(a + (a > 100 ? 5 : 0), b + (b > 350 ? -5 : 0), 1, 6, C.cyan); });
      
      if (S.msgT > 0){ r(0, 238, W, 12, '#0d0820cc'); ptxt(S.msg, 120, 241, S.msgC, 'center', '#000'); }
    },
    tap(x, y){
      if (S.done || S.wait > 0) return;
      // easter eggs
      for (const [k, lo, la] of MAP_EGGS){ if (!S.eggs[k] && Math.abs(x - MX(lo)) < 9 && Math.abs(y - MY(la)) < 9){ S.eggs[k] = 1; stats.eggs++; S.bonus += 5; SFX.ding(); burst(MX(lo), MY(la), 10, [C.gold, '#fff']);
        if (k === 'pollo') say('DAVE: ¿Pollito?… Concéntrate, David.', C.gold); else addBubble('+5 EASTER EGG', MX(lo), MY(la) - 10, C.gold, 5); return; } }
      let best = null, bd = 99; S.trucks.forEach(tk => { const d = Math.hypot(x - tk.x, y - tk.y); if (d < bd){ bd = d; best = tk; } });
      if (!best || bd > 14) return;
      if (best.ok){ stats.trucks++; S.wait = 1.2; S.flash = .5; S.yay = 1.5; SFX.ok(); burst(best.x, best.y, 14, [C.ok, '#fff']); say('YES! THAT’S THE ONE!', C.ok); }
      else { best.bad = 1; S.miss++; S.shake = .3; S.fail = 1.2; tone(140, .15, 'square', .05); say(best.cargo === 'taco' ? 'JEFE: That’s a taco truck, David.' : 'JEFE: No, David. Read the clue.', C.neon);
        if (S.miss >= 3){ S.miss = 0; loseLife(); } }
    }
  };
}

// ===================== RETO 2 · Luz roja, luz verde =====================
// Dave cruza el cowork hasta la puerta (izquierda) manteniendo el dedo; si el jefe de la videollamada lo mira mientras camina, lo pillan.
// videollamada con Mr. Deadline (sprite de Sergio recortado al torso): cuadro 0 de espaldas, cuadro 8 mirando a la cámara
const DDL_CAM = Object.assign(new Image(), { src:'ddl_cam.png' }), DDL_CARA = Object.assign(new Image(), { src:'ddl_cara.png' });
// círculo pixelado (sin antialias) y globo de diálogo con letra pixel
function pcirc(cx, cy, rad, col){ for (let dy=-rad; dy<=rad; dy++){ const w = Math.round(Math.sqrt(rad*rad - dy*dy + rad*.6)); r(cx - w, cy + dy, w*2 + 1, 1, col); } }
function pbubble(s, x, y, edge='#9ab8ff', alpha=1){
  // globo sobrio: fondo oscuro translúcido, borde fino y letra pixel clara
  const lines = Array.isArray(s) ? s : [s], w = Math.max(...lines.map(pxWidth)) + 8, h = lines.length*7 + 5;
  const bx = Math.round(Math.max(3, Math.min(W - 3 - w, x - w/2))), by = Math.round(y - h);
  ctx.save(); ctx.globalAlpha = alpha;
  ctx.globalAlpha = alpha*.82; r(bx, by, w, h, '#0b0718'); ctx.globalAlpha = alpha;
  r(bx, by, w, 1, edge); r(bx, by + h - 1, w, 1, edge); r(bx, by, 1, h, edge); r(bx + w - 1, by, 1, h, edge);
  const tx = Math.round(Math.max(bx + 3, Math.min(bx + w - 5, x))); r(tx, by + h, 2, 1, edge); r(tx + 1, by + h + 1, 1, 1, edge);
  lines.forEach((ln, i) => ptxt(ln, bx + w/2, by + 3 + i*7, '#e8e4f0', 'center', null));
  ctx.restore();
}
// cuerda que cuelga desde arriba de la pantalla (mismo grosor y colores que la del sprite de Mr. Deadline)
function drawRope(x, yBot){ x = Math.round(x); if (yBot > 0){ r(x, 0, 1, yBot, '#cfa767'); r(x + 1, 0, 1, yBot, '#84633b'); } }
function drawBossCall(x, y, st, t, fr){
  const col = st === 'red' ? C.neon : st === 'warn' ? C.gold : C.ok;
  r(x-34, y-26, 68, 52, '#05030c'); r(x-33, y-25, 66, 50, col); r(x-31, y-23, 62, 46, '#22324f');
  // fondo de su oficina: ventana y estante
  r(x+8, y-20, 20, 16, '#3a5a8a'); r(x+17, y-20, 1, 16, '#22324f'); r(x+8, y-13, 20, 1, '#22324f'); r(x-29, y-8, 14, 2, '#4a3a2a'); r(x-27, y-14, 3, 6, '#b0102a'); r(x-23, y-12, 3, 4, '#ffd34d');
  if (DDL_CAM.complete && DDL_CAM.naturalWidth){ ctx.imageSmoothingEnabled = false; ctx.drawImage(DDL_CAM, Math.max(0, Math.min(8, Math.round(fr ?? (st === 'green' ? 0 : 8))))*62, 0, 62, 46, x-31, y-23, 62, 46); }
  if ((T*2|0) % 2) r(x-29, y-21, 3, 3, C.neon);   // grabando
  // rótulo bajo la ventana, con letra pixel nítida
  ptxt(st === 'red' ? 'TE ESTÁ MIRANDO' : st === 'warn' ? '*EJEM*' : 'MIRA PARA OTRO LADO', x, y + 30, col, 'center', '#05030c');
}
function sceneRedLight(){
  const S = { x:150, phase:'green', t:2.2, caught:0, grace:0, hold:{}, done:false, msg:'', msgT:0, back:0, q:0 };
  const ASK = [['DAVID, ARE YOU','STILL THERE?'],['QUICK STATUS','UPDATE, DAVID?'],['DID YOU SEND','THE REPORT?'],['CAN YOU SHARE','YOUR SCREEN?'],['ARE WE ALIGNED,','DAVID?']];
  if (window.DEV_HOOK) window.__red = S;   // solo para pruebas
  const X0 = 150, DOOR = 672, Y0 = 228, Y1 = 194, ARRIVE = 640, SPEED = 62, CAM0 = 30, CAM1 = 498, holding = () => Object.keys(S.hold).length > 0;
  const say = (m, c) => { S.msg = m; S.msgC = c; S.msgT = 2; };
  return { label:'RETO 2/3', isRed:true,
    update(dt){
      if (S.done) return;
      if (S.msgT > 0) S.msgT -= dt; if (S.back > 0) S.back -= dt; if (S.fail > 0) S.fail -= dt;
      { const want = S.phase === 'green' ? 0 : 8; S.turn = S.turn ?? 0; S.turn += Math.sign(want - S.turn) * Math.min(Math.abs(want - S.turn), dt * (want > S.turn ? 13 : 18)); }   // gira hacia la cámara durante el carraspeo
      S.t -= dt;
      if (S.t <= 0){
        if (S.phase === 'green'){ S.phase = 'warn'; S.t = .7; tone(260, .12, 'sawtooth', .04); }
        else if (S.phase === 'warn'){ S.phase = 'red'; S.t = 1.5 + Math.random()*1; S.grace = .18; S.q = (S.q + 1 + (Math.random()*2|0)) % ASK.length; S.redT = T; }
        else { S.phase = 'green'; S.t = 1.6 + Math.random()*1.8; }   // nunca gira dos veces en menos de 1,5 s
      }
      if (S.grace > 0) S.grace -= dt;
      const looking = S.phase === 'red';
      if (holding() && S.back <= 0){
        if (looking && S.grace <= 0){ S.caught++; stats.caught++; S.x = Math.max(X0, S.x - 40); S.back = .8; S.fail = 1.3; S.hold = {}; tone(150, .2, 'square', .05); say(['DAVID…','ARE YOU WALKING?'], C.neon); if (S.caught >= 3){ S.caught = 0; loseLife(); S.x = X0; S.back = 1.2; say(['THREE STRIKES, DAVID.','BACK TO YOUR DESK.'], C.neon); } }   // a la tercera: pierde una vida y vuelve al inicio
        else S.x += SPEED*dt;
      }
      if (S.x >= ARRIVE){ S.done = true; S.hold = {}; S.dlT = T; COWORK_DOOR = true; tone(110, .5, 'sawtooth', .06); SFX.mail(); SFX.ok(); }
    },
    draw(){
      // la cámara sigue a Dave por el cowork hasta la puerta SALIDA (a la derecha del fondo)
      S.camT = S.camT ?? CAM0; const want = Math.max(CAM0, Math.min(CAM1, S.x - 120)); S.camT += (want - S.camT) * .12;
      const cam = S.camT, sx = S.x - cam;
      drawStage({ cam: cam - CAM0 });
      const moving = holding() && S.back <= 0 && !(S.phase === 'red' && S.grace <= 0);
      const dy = Y0 - (Y0 - Y1) * Math.min(1, (S.x - X0)/(DOOR - X0));   // sube un poco hacia la puerta
      CAST.dave(sx, S.done ? { y:dy, flip:true } : S.fail > 0 ? { anim:'falla', y:dy } : moving ? { anim:'camina', y:dy } : { y:dy });
      if (S.done){   // Mr. Deadline desciende por una cuerda (frena al llegar), grita un momento y luego explica
        const t = T - S.dlT, D = 1.8, k = Math.min(1, t / D), e = 1 - Math.pow(1 - k, 3), dyy = Math.round(-30 + 258*e);
        const rx = 62 + Math.round((DDL_ROPE[0][0] - 68)*DDL_SC);   // misma posición que la cuerda del sprite
        if (k < 1) CAST.deadline(62, { y: dyy, anim:'cuerda' });
        else { if (!S.landed){ S.landed = true; shake = RM ? 0 : .15; tone(110, .15, 'square', .05); burst(62, 226, 6, ['#c9c4d6', '#fff']); setTimeout(stepDone, 500); }
          const up = Math.min(1, (t - D)/.9); if (up < 1) drawRope(rx, Math.round(150*(1 - up)));   // la cuerda sube y se pierde arriba
          CAST.deadline(62, { anim: t < D + 1.6 ? 'grita' : 'explica' }); } }
      drawCrowd(); drawHUD(this.label);
      if (!S.done) drawBossCall(48, 92, S.phase, T, S.turn);
      if (!S.done && S.phase === 'red' && S.turn >= 7){   // el jefe pregunta algo y Dave contesta
        const ft = T - (S.redT || 0); if (!(S.msgT > 0)) pbubble(ASK[S.q], 124, 76, '#ff8aa0', Math.min(1, ft*5));
        if (ft > .6 && !(S.fail > 0)) pbubble('YES, YES… ON IT!', sx, dy - 104, '#9ab8ff', Math.min(1, (ft - .6)*5)); }
      if (S.msgT > 0 && !S.done) pbubble(S.msg, 124, 76, '#ff8aa0');
      // ===== panel (desaparece cuando Dave llega a la puerta: solo quedan los diálogos) =====
      r(0, 254, W, H-254, '#0b0718');
      if (S.done) return;
      const lc = S.phase === 'green' ? C.ok : S.phase === 'warn' ? C.gold : C.neon;
      r(0, 254, W, 1, '#2a2240');
      // recorrido: línea fina hasta la SALIDA, con Dave como punto
      const u = Math.min(1, (S.x - X0)/(ARRIVE - X0)), ax = 18, aw = 168, ay = 268;
      r(ax, ay, aw, 2, '#2a2240'); r(ax, ay, Math.round(aw*u), 2, '#7affd6');
      for (let i=1;i<6;i++) r(ax + i*aw/6, ay - 1, 1, 4, '#3b2f66');
      const dxp = Math.round(ax + aw*u); ctx.globalAlpha = .3; pcirc(dxp, ay + 1, 5, '#7affd6'); ctx.globalAlpha = 1; pcirc(dxp, ay + 1, 3, '#e8fff8');
      ptxt('SALIDA', 222, ay - 2, '#7dff3a', 'right', '#05030c');
      ptxt('TE PILLÓ', ax, ay + 8, '#6a6088', 'left', null);
      for (let i=0;i<3;i++) pcirc(ax + 44 + i*8, ay + 10, 2, i < S.caught ? C.neon : '#2a2240');
      // semáforo horizontal discreto y estado
      r(93, 288, 54, 14, '#05030c'); r(94, 289, 52, 12, '#16121f');
      [['red', C.neon, '#3a1424'], ['warn', C.gold, '#3a3014'], ['green', C.ok, '#143a24']].forEach(([ph, c, off], i) => { const cx = 106 + i*14, on = S.phase === ph;
        if (on){ ctx.globalAlpha = .3; pcirc(cx, 295, 8, c); ctx.globalAlpha = 1; } pcirc(cx, 295, 4, on ? c : off); if (on) r(cx - 2, 292, 2, 1, '#ffffffaa'); });
      txt(S.phase === 'green' ? 'CAMINA' : S.phase === 'warn' ? 'CUIDADO' : 'QUIETO', 120, 310, lc, 'center', 8, '#000');
      ptxt(S.phase === 'green' ? 'NO TE ESTÁ MIRANDO' : S.phase === 'warn' ? 'VA A GIRAR, SUELTA' : 'TE ESTÁ MIRANDO', 120, 322, '#8a80a8', 'center', null);
      // botón: borde del color del semáforo; se llena al mantenerlo
      const pr = holding(), bx = 28, by = 342, bw = 184, bh = 46, red = S.phase === 'red';
      r(bx, by + 2, bw, bh, '#05030c');
      r(bx, by + (pr ? 2 : 0), bw, bh, red ? '#2a0e18' : pr ? '#0f3a24' : '#120c2a');
      const by2 = by + (pr ? 2 : 0), ec = red ? C.neon : C.ok;
      r(bx, by2, bw, 2, ec); r(bx, by2 + bh - 2, bw, 2, ec); r(bx, by2, 2, bh, ec); r(bx + bw - 2, by2, 2, bh, ec);
      if (pr && !red){ ctx.globalAlpha = .15; r(bx + 2, by2 + 2, bw - 4, bh - 4, C.ok); ctx.globalAlpha = 1; }
      txt('CAMINAR', 120, by2 + 12, red ? '#ff8aa0' : '#ffffff', 'center', 8, '#000');
      ptxt(red ? 'ESPERA A QUE MIRE A OTRO LADO' : 'MANTÉN PRESIONADO', 120, by2 + 28, red ? '#c06070' : '#7affd6', 'center', null);
    },
    down(x, y, id){ if (S.done) return; S.hold[id] = 1; },
    up(id){ delete S.hold[id]; }
  };
}
// ===================== JEFE · Mr. Deadline: esquiva en el cowork =====================
// Dave se mueve arrastrando el dedo por el piso; Mr. Deadline le lanza correos, reuniones y el «Reply all».
// Las notas de bajo cargan el BASS SOLO; tres solos lo derrotan (cada uno avanza una fase).
const CAFE_IMG = Object.assign(new Image(), { src:'item_cafe.png' });
function drawNote(x, y){ x = Math.round(x); y = Math.round(y); ctx.globalAlpha = .28 + .1*Math.sin(T*8); pcirc(x, y, 9, '#ff2e4d'); ctx.globalAlpha = 1;
  r(x + 2, y - 10, 2, 11, '#05030c'); r(x + 2, y - 10, 2, 10, '#ff6a80'); r(x + 2, y - 10, 6, 2, '#ff6a80'); r(x + 6, y - 8, 2, 3, '#ff6a80'); pcirc(x, y + 1, 3, '#ff6a80'); r(x - 1, y, 2, 1, '#fff'); }
function drawPostit(x, y, c, rot){ ctx.save(); ctx.translate(Math.round(x), Math.round(y)); ctx.rotate(rot); r(-6, -6, 12, 12, '#05030c'); r(-5, -5, 10, 10, c); r(-5, -5, 10, 2, '#ffffff55'); r(-3, -1, 6, 1, '#00000044'); r(-3, 2, 5, 1, '#00000044'); ctx.restore(); }
function drawMeetBlock(x, y, w, lab){ r(x, y, w, 28, '#05030c'); r(x + 1, y + 1, w - 2, 26, '#f4efe6'); r(x + 1, y + 1, w - 2, 8, '#2f6bff'); for (let i=0;i<4;i++) r(x + 8 + i*((w - 16)/3), y + 3, 2, 4, '#fff'); r(x + 1, y + 25, w - 2, 2, '#c9c0d6'); ptxt(lab, x + w/2, y + 14, '#1a1426', 'center', null); }
// botón BASS SOLO: placa oscura con borde de neón que respira, nota de bajo a la izquierda y un destello que la recorre
function drawBassSoloBtn(){
  const X = 20, Y = 244, Wb = 200, Hb = 30, glow = .55 + .45*Math.sin(T*5);
  ctx.save();
  ctx.globalAlpha = .35*glow; ctx.fillStyle = '#ff2e4d'; ctx.beginPath(); ctx.roundRect(X - 3, Y - 3, Wb + 6, Hb + 6, 7); ctx.fill();   // halo
  ctx.globalAlpha = 1; ctx.fillStyle = '#05030c'; ctx.beginPath(); ctx.roundRect(X, Y, Wb, Hb, 5); ctx.fill();
  const g = ctx.createLinearGradient(0, Y, 0, Y + Hb); g.addColorStop(0, '#3a0c18'); g.addColorStop(1, '#14040a');
  ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(X + 2, Y + 2, Wb - 4, Hb - 4, 4); ctx.fill();
  ctx.strokeStyle = '#ff2e4d'; ctx.globalAlpha = .6 + .4*glow; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(X + 1, Y + 1, Wb - 2, Hb - 2, 5); ctx.stroke();
  ctx.globalAlpha = 1; r(X + 8, Y + 3, Wb - 16, 1, '#ff8a9c55');   // brillo superior
  // destello que recorre la placa
  ctx.save(); ctx.beginPath(); ctx.roundRect(X + 2, Y + 2, Wb - 4, Hb - 4, 4); ctx.clip();
  const sx = X - 40 + ((T*90) % (Wb + 80)); ctx.globalAlpha = .18; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(sx, Y); ctx.lineTo(sx + 14, Y); ctx.lineTo(sx + 4, Y + Hb); ctx.lineTo(sx - 10, Y + Hb); ctx.fill(); ctx.restore();
  ctx.restore();
  drawNote(X + 20, Y + 16);
  txt('BASS SOLO', 128, Y + 6, '#ffffff', 'center', 8, '#5a0a1a');
  vtxt('Toca para tocarlo', 128, Y + 18, '#ffb3c0', 'center', '#000');
}
function sceneDodgeBoss(){
  fadeIn = .8;   // fundido al empezar el jefe
  const FLOOR = 236, DY = 404, BODY0 = 332, BODY1 = 402, HAND = [96, 150];
  const S = { hp:100, low:0, x:120, tx:120, drag:null, keys:{}, objs:[], blocks:[], phase:0, spawn:1.2, note:2, item:8, block:2.5, hits:0, inv:0, slow:0, boom:0, throwT:0, done:false, msg:'', msgT:0, dodged:0 };
  if (window.DEV_HOOK) window.__dg = S;   // solo para pruebas
  const say = (m, c) => { S.msg = m; S.msgC = c || '#fff'; S.msgT = 1.8; };
  const hurt = () => { if (S.inv > 0 || S.done) return; S.hits++; S.inv = 1.2; S.fail = 1; shake = RM ? 0 : .25; tone(150, .2, 'square', .05); vibrate(60); if (S.hits % 3 === 0) loseLife(); };
  const throwMail = () => {   // correo en arco desde la mano de Mr. Deadline hasta el piso (sombra que avisa)
    const near = Math.random() < .55, tx = Math.max(18, Math.min(222, near ? S.x + (Math.random() - .5)*60 : 20 + Math.random()*200));
    const tf = [1.7, 1.55, 1.4][S.phase], g = 300, vx = (tx - HAND[0])/tf, vy = (370 - HAND[1] - .5*g*tf*tf)/tf;
    const k = Math.random(), kind = k < .2 ? 'urgent' : k < .45 ? 'postit' : 'mail';
    S.objs.push({ kind, x:HAND[0], y:HAND[1], vx, vy, g, tx, t:0, tf, c:['#ffd34d','#ff7ab0','#7ad6ff','#9aff7a'][Math.random()*4|0], rot:Math.random()*6 });
    S.throwT = .35;
  };
  return { label:'JEFE',
    update(dt){
      if (S.done) return;
      const sl = S.slow > 0 ? .55 : 1, d = dt*sl;
      ['inv','slow','boom','throwT','msgT','fail','solo','bossHit'].forEach(k => { if (S[k] > 0) S[k] -= dt; });
      if (S.solo > 0){   // mientras suena el solo no cae nada; el impacto llega a mitad del solo
        if (!S.impact && S.solo < .7){ S.impact = true; S.hp = Math.max(0, S.hp - 34); S.bossHit = 1.2; shake = RM ? 0 : .8; flash = .3; flashCol = '#fff'; vibrate([90,40,160]); bass(0, .5, .35);
          burst(62, 150, 34, [C.neon, C.gold, '#fff']); burst(62, 190, 20, ['#ff6a80', '#ffd34d']); S.rings = [0, .12, .24];
          if (S.hp <= 0){ S.done = true; win('¡MR. DEADLINE\nDESCONECTADO!'); setTimeout(stepDone, 2600); }
          else { S.phase = Math.min(2, S.phase + 1); say(S.phase === 1 ? '¡AHORA MANDA REUNIONES!' : '¡CORREOS Y REUNIONES A LA VEZ!', '#9ab8ff'); } }
        S.spawn = Math.max(S.spawn, .9); S.note = Math.max(S.note, 1.6); S.block = Math.max(S.block, 1.8); S.item = Math.max(S.item, 2);
        return; }
      // movimiento de Dave: sigue el dedo (o las flechas)
      if (S.keys.kL) S.tx = S.x - 40; if (S.keys.kR) S.tx = S.x + 40;
      S.tx = Math.max(20, Math.min(220, S.tx)); const mv = S.solo > 0 ? 0 : Math.max(-230*dt, Math.min(230*dt, S.tx - S.x)); S.x += mv; S.moving = Math.abs(mv) > .5;
      // lanzamientos según la fase
      S.spawn -= d; if (S.spawn <= 0 && S.phase !== 1){ throwMail(); S.spawn = [1.05, 1.2, 1.0][S.phase] * (0.8 + Math.random()*.4); }
      S.note -= d; if (S.note <= 0){ S.objs.push({ kind:'note', x:24 + Math.random()*192, y:FLOOR - 6, vy:62 }); S.note = 2.4 + Math.random()*.9; }
      S.item -= d; if (S.item <= 0){ const k = lives < 3 && Math.random() < .5 ? 'pollo' : 'cafe'; S.objs.push({ kind:k, x:24 + Math.random()*192, y:FLOOR - 6, vy:58 }); S.item = 9 + Math.random()*4; }
      if (S.phase >= 1){ S.block -= d; if (S.block <= 0){ const left = S.x > 120 ? Math.random() < .7 : Math.random() < .3; S.blocks.push({ x: left ? 6 : 124, w:110, y:FLOOR - 30, warn:1, lab:['REUNIÓN 5 MIN','SYNC SEMANAL','FOLLOW-UP','QUICK CALL'][Math.random()*4|0], hit:false }); S.block = (S.phase === 2 ? 2.6 : 2.4) + Math.random(); S.throwT = .6; } }
      // objetos
      S.objs.forEach(o => {
        if (o.tf){ o.t += d; o.x += o.vx*d; o.vy += o.g*d; o.y += o.vy*d; o.rot += d*4; }
        else o.y += o.vy*d;
        if (!o.gone && o.y > BODY0 && o.y < BODY1 && Math.abs(o.x - S.x) < (o.kind === 'note' || o.kind === 'cafe' || o.kind === 'pollo' ? 17 : 13)){
          o.gone = true;
          if (o.kind === 'note'){ S.low = Math.min(100, S.low + 14.3); bass(5, .15, .2); burst(o.x, o.y, 6, ['#ff6a80', '#fff']); if (S.low >= 100) say('¡BASS SOLO LISTO!', '#ffd34d'); }
          else if (o.kind === 'cafe'){ S.slow = 4; say('CAFÉ: TODO MÁS LENTO', C.gold); SFX.beer(); }
          else if (o.kind === 'pollo'){ lives = Math.min(3, lives + 1); say('¿VAMOS POR POLLITO? +1 VIDA', C.gold); SFX.life(); }
          else hurt();
        }
        if (!o.gone && o.y > 425){ o.gone = true; if (o.tf){ S.dodged++; stats.mails++; } }
      });
      S.objs = S.objs.filter(o => !o.gone);
      S.blocks.forEach(b => { if (b.warn > 0) b.warn -= d; else b.y += 150*d; if (!b.hit && b.y + 28 > BODY0 + 10 && b.y < BODY1 && S.x > b.x - 4 && S.x < b.x + b.w + 4){ b.hit = true; hurt(); } });
      S.blocks = S.blocks.filter(b => { if (b.y > 430){ stats.mails++; return false; } return true; });
    },
    draw(){
      drawStage({ dim:true });
      // piso del cowork que sigue hacia abajo
      for (let y = FLOOR; y < H; y += 6){ r(0, y, W, 6, ((y - FLOOR)/6) % 2 ? '#1c1124' : '#21142b'); r(0, y, W, 1, '#2c1d36'); }
      ctx.globalAlpha = .08; r(0, FLOOR, W, 40, '#ff8a3a'); ctx.globalAlpha = 1;
      // Mr. Deadline al fondo
      { const kb = S.bossHit > 0 ? Math.round(Math.sin(S.bossHit*30)*4*S.bossHit) - Math.round(6*S.bossHit) : 0;   // retrocede y tiembla con el golpe
        drawDeadline(62 + kb, 228, { anim: S.throwT > 0 || S.phase === 2 || S.boom > 0 || S.bossHit > 0 ? 'grita' : 'explica', hit: S.bossHit > 0 ? S.bossHit : 0 });
        if (S.bossHit > 0){ ctx.globalAlpha = Math.min(.28, S.bossHit*.22); ctx.globalCompositeOperation = 'lighter'; pcirc(62, 170, 30, '#ff2e4d'); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
          (S.rings || []).forEach(d0 => { const k = (1.2 - S.bossHit) - d0; if (k > 0 && k < .8){ ctx.globalAlpha = 1 - k/.8; ctx.strokeStyle = k < .3 ? '#fff' : '#ff6a80'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(62, 170, 12 + k*90, 8 + k*60, 0, 0, 7); ctx.stroke(); ctx.globalAlpha = 1; } });
          if (S.bossHit > .5){ txt('-34', 62, 92 - (1.2 - S.bossHit)*30, '#ffd34d', 'center', 8, '#05030c'); } } }
      // avisos en el piso: sombra donde va a caer cada correo y zona de cada reunión
      S.objs.forEach(o => { if (o.tf){ const k = Math.min(1, o.t/o.tf); ctx.globalAlpha = .15 + .35*k; r(Math.round(o.tx - 4 - 4*k), 406, Math.round(8 + 8*k), 3, '#000'); ctx.globalAlpha = 1; } });
      S.blocks.forEach(b => { if (b.warn > 0){ ctx.globalAlpha = .18 + .12*Math.sin(T*16); r(b.x, FLOOR, b.w, H - FLOOR, '#2f6bff'); ctx.globalAlpha = 1; ptxt('¡REUNIÓN!', b.x + b.w/2, 300, '#9ab8ff', 'center', '#000'); } });
      // objetos
      S.objs.forEach(o => {
        if (o.kind === 'mail') ITEM.mail(o.x, o.y); else if (o.kind === 'urgent') ITEM.urgent(o.x, o.y);
        else if (o.kind === 'postit') drawPostit(o.x, o.y, o.c, o.rot); else if (o.kind === 'note') drawNote(o.x, o.y);
        else if (o.kind === 'cafe'){ if (CAFE_IMG.complete && CAFE_IMG.naturalWidth){ ctx.imageSmoothingEnabled = false; ctx.drawImage(CAFE_IMG, Math.round(o.x - 7), Math.round(o.y - 12), 14, 24); } }
        else if (o.kind === 'pollo') ITEM.pollo(o.x, o.y);
      });
      S.blocks.forEach(b => { if (b.warn <= 0) drawMeetBlock(b.x, Math.round(b.y), b.w, b.lab); });
      // Dave
      const dav = S.solo > 0 ? 'solo' : S.fail > 0 ? 'falla' : S.moving ? 'camina' : 'idle';
      if (!(S.inv > 0 && Math.floor(T*14) % 2)) CAST.dave(S.x, { y:DY, anim:dav, flip: S.tx < S.x - 2 });
      // BASS SOLO: Dave toca y las notas vuelan hasta Mr. Deadline
      if (S.boom > 0){ const k = 1 - S.boom/1.6; for (let i=0;i<7;i++){ const u = (k*1.6 + i*.13) % 1, nx = S.x + (62 - S.x)*u + Math.sin((u + i)*9)*10, ny = DY - 70 + (150 - (DY - 70))*u; ctx.globalAlpha = Math.min(1, S.boom); drawNote(nx, ny); } ctx.globalAlpha = 1; if (S.boom < .5){ ctx.globalAlpha = S.boom*1.6; pcirc(62, 160, 26, '#ff2e4d'); ctx.globalAlpha = 1; } }   // las notas del solo vuelan hasta Mr. Deadline
      // marcador
      drawHUD('JEFE'); r(0, 30, W, 25, '#0b0718cc');
      ptxt('MR. DEADLINE', 8, 34, '#9ab8ff', 'left', null); r(72, 34, 160, 5, '#2a2240'); r(72, 34, Math.round(160*S.hp/100), 5, '#36d6ff');
      ptxt('BASS SOLO', 8, 44, '#ff6a80', 'left', null); r(72, 44, 116, 5, '#2a2240'); r(72, 44, Math.round(116*S.low/100), 5, S.low >= 100 ? (Math.floor(T*6) % 2 ? '#ffd34d' : '#ff2e4d') : '#ff2e4d');
      for (let i=0;i<3;i++) pcirc(204 + i*10, 46, 3, i < S.hits % 3 ? C.neon : '#2a2240');
      ptxt(['FASE 1 · CORREOS','FASE 2 · REUNIONES','FASE 3 · TODO A LA VEZ'][S.phase], 120, 60, '#c9c4d6', 'center', '#000');
      if (S.low >= 100 && !S.done) drawBassSoloBtn();
      if (S.msgT > 0) pbubble(S.msg, S.x, DY - 104, S.msgC);
      if (S.done){ /* el cierre lo maneja win() */ }
    },
    down(x, y, id){ if (S.done) return; if (id === 'kL' || id === 'kR'){ S.keys[id] = 1; return; }
      if (S.low >= 100 && x > 18 && x < 222 && y > 240 && y < 278) return;   // el toque al botón lo atiende tap()
      S.drag = id; S.tx = x; },
    move(x, y, id){ if (S.drag === id) S.tx = x; },
    up(id){ if (S.drag === id) S.drag = null; delete S.keys[id]; },
    tap(x, y){
      if (S.done || S.low < 100) return;
      if (x > 18 && x < 222 && y > 240 && y < 278){
        // BASS SOLO: todo lo que cae desaparece, no cae nada más mientras Dave toca; el golpe llega cuando las notas alcanzan a Mr. Deadline
        S.low = 0; S.boom = 1.6; S.solo = 1.6; S.impact = false; SFX.lowEnd(); vibrate([60,40,120]);
        S.objs.forEach(o => burst(o.x, o.y, 3, ['#c9c4d6', '#fff'])); S.objs = []; S.blocks = [];
      }
    }
  };
}

// ===================== Cierre: lluvia de post-its y celebración en la calle =====================
let POSTIT_FLOOR = [];
function scenePostIts(){
  // lluvia de post-its: caen desde arriba sobre Mr. Deadline, se mecen al caer y quedan regados en el piso
  const t0 = T, COL = ['#ffd34d','#ff7ab0','#7ad6ff','#9aff7a'];
  const notes = Array.from({ length:52 }, (_, i) => ({ kind: i % 3 === 2 ? (i % 9 === 8 ? 'urgent' : 'mail') : 'postit', x0: 22 + Math.random()*90, y0: -10 - Math.random()*260, vy: 55 + Math.random()*40, ph: Math.random()*6, c: COL[i%4], r0: Math.random()*6, floor: 222 + Math.random()*10 }));
  // la posición se calcula con el tiempo (la escena sigue animada aunque el diálogo esté abierto)
  const pos = n => { const t = T - t0, y = n.y0 + n.vy*t, land = y >= n.floor; const tl = land ? (n.floor - n.y0)/n.vy : t;
    return { x: n.x0 + Math.sin(T*3*(land ? 0 : 1) + n.ph)*4 + (land ? Math.sin(tl*3 + n.ph)*4 : 0), y: land ? n.floor : y, a: land ? (n.r0 + tl*2.5) % .6 - .3 : n.r0 + t*2.5, land }; };
  return { update(){}, draw(){
    drawStage(); drawDeadline(62, 228, { anim:'grita' }); CAST.dave(176, { y:194, flip: T - t0 < .6, anim: T - t0 < .6 ? 'idle' : 'peto_off' });   // casi de inmediato se quita el peto y lo agita en el aire (sin límite de tiempo)
    POSTIT_FLOOR = [];
    notes.forEach(n => { const q = pos(n); if (q.land) POSTIT_FLOOR.push({ x:Math.round(q.x), y:q.y, a:q.a, c:n.c, kind:n.kind }); if (q.y < 36) return; ctx.save(); ctx.translate(Math.round(q.x), Math.round(q.y)); ctx.rotate(q.a); if (n.kind === 'postit'){ r(-4, -4, 8, 8, '#05030c'); r(-3, -3, 7, 7, n.c); r(-3, -3, 7, 2, '#ffffff55'); } else { ctx.scale(.7, .7); ITEM[n.kind](0, 0); } ctx.restore(); });   // caen post-its y correos
    drawCrowd(); drawHUD('¡LISTO!');
  }, tap(){} };
}
// Tras los diálogos: Dave sale corriendo por la derecha (la puerta SALIDA) y fundido; luego la calle
function sceneDaveRunsOut(done){
  const t0 = T; let fin = false;
  return { update(){}, draw(){
    const t = T - t0, x = 176 + Math.max(0, t - .15)*95;
    drawStage(); drawDeadline(62, 228, { anim:'grita' }); POSTIT_FLOOR.forEach(n => { ctx.save(); ctx.translate(n.x, n.y); ctx.rotate(n.a); if (n.kind === 'postit'){ r(-4, -4, 8, 8, '#05030c'); r(-3, -3, 7, 7, n.c); } else { ctx.scale(.7, .7); ITEM[n.kind](0, 0); } ctx.restore(); });
    if (x < 300) CAST.dave(x, { y:194, anim:'corre' });
    drawHUD('¡LISTO!');
    if (x > 290){ const k = Math.min(1, (x - 290)/55); ctx.globalAlpha = k; r(0, 0, W, H, '#000'); ctx.globalAlpha = 1; if (k >= 1 && !fin){ fin = true; done(); } }
  }, tap(){}, stop(){ dlgLock = false; } };
}
let STREET = null;
function sceneStreetCelebrate(){
  // Maito y Checho animan a Dave (que celebra junto al Kabbaret Móvil); luego quedan quietos y Dave come pollo.
  // Al final Checho y Dave salen corriendo por la derecha, Maito se queda, y fundido.
  const t0 = T, CEL = 4; let leave = null, lx = { checho:100, dave:156 }, done = null, fin = false;
  STREET = { leave(cb){ leave = T; done = cb; } };
  return { update(dt){ if (leave != null){ lx.checho += 105*dt; lx.dave += 105*dt; } }, draw(){
    const g = ctx.createLinearGradient(0, 0, 0, 300); g.addColorStop(0, '#05040f'); g.addColorStop(1, '#120a26'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, 420);
    if (ESC_BOGOTA.complete && ESC_BOGOTA.naturalWidth){ ctx.imageSmoothingEnabled = true; ctx.drawImage(ESC_BOGOTA, -300, 40); ctx.imageSmoothingEnabled = false; }
    r(0, 0, W, 420, 'rgba(8,5,24,.38)'); r(0, 301, W, 420, '#07040f');
    if (AVEO_PARK.complete && AVEO_PARK.naturalWidth){ const f = Math.floor(T*5) % 9, cx = 146, gy = 234;   // Kabbaret Móvil parqueado: solo se ve la trompa
      ctx.globalAlpha = .45; r(cx + 8, gy - 2, 172, 4, '#000'); ctx.globalAlpha = 1; ctx.imageSmoothingEnabled = false; ctx.drawImage(AVEO_PARK, f*189, 0, 189, 82, cx, gy - 82, 189, 82); }
    const party = T - t0 < CEL && leave == null;
    if (party){ drawMaitoSprite(50, 238, { anim:'anima_dave' }); drawChechoSprite(100, 240, { anim:'anima_dave' }); drawDaveSprite(156, 240, { anim:'celebra', flip:true }); }
    else if (leave == null){ drawMaitoSprite(50, 238, { anim:'cowork', flip:true }); drawChechoSprite(100, 240, { anim:'casa', flip: !(STREET && STREET.chechoLeft) }); drawDaveSprite(156, 240, { anim:'come_pollo', flip:true }); }
    else {   // Checho y Dave corren a la derecha; Maito se queda quieto
      drawMaitoSprite(50, 238, { anim:'cowork', flip:true });
      if (lx.checho < 300) drawChechoSprite(lx.checho, 240, { anim:'corre_mexa' });
      if (lx.dave < 300) drawDaveSprite(lx.dave, 240, { anim:'corre_pollo' });   // corre con su presa de pollo
      if (lx.checho > 290){ const k = Math.min(1, (lx.checho - 290)/55); ctx.globalAlpha = k; r(0, 0, W, H, '#000'); ctx.globalAlpha = 1; if (k >= 1 && !fin){ fin = true; done && done(); } }
    }
    drawHUD('¡LISTO!');
  }, tap(){}, stop(){ dlgLock = false; } };
}

const L3 = {
  key:'dave', n:3, venue:'cowork', fans:.35, ficha:true,
  barks:[['p_cami.jpg','CAMI','Te vas a poner el peto'],['p_mao.jpg','MAO','¡El Choooorro!'],['p_maito.jpg','MAITO','¡De pie, Dave!'],['p_checho.jpg','CHECHO','¡Heeeeeey!']],
  onStart(){ davePeto = true; COWORK_DOOR = false; },
  onBossWon(){ COWORK_DOOR = true; VENUE = 'cowork'; },   // solo para el botón de pruebas «DESPUÉS DEL JEFE»
  intro:[
    { who:'narr', text:'9:05 p.m. Los hermanos Celis salen en el Kabbaret Móvil a un cowork que nunca cierra, donde sospechan que estará David en una «Quick Call».', fx(){ setStage(sceneCarRide()); } },
    { who:'dave', text:'Yes, yes… the truck is somewhere between Texas and… no, I don’t know where Texas ends. Give me five minutes.', fx(){ setStage(sceneCoworkArrive()); } },
    { who:'maito', text:'Daaave. Son las 9:05 p.m.', fx: idle(COWORK_CAST) },
    { who:'dave', text:'Muchachos, se perdió un camión en Estados Unidos. Un camión entero. Con 20 toneladas de papel higiénico.' },
    { who:'checho', text:'Y a nosotros se nos va a perder Mötley Brüe.' },
    { who:'maito', text:'Tranquilo, Dave, igual todavía tienes el peto. Si no llegas, entra el suplente.' },
    { who:'dave', text:'¡Que no soy suplente! Ok, ok. Dejo coordinado lo del camión y nos vamos. Dame un minuto.' },
    { who:'maito', text:'¿Un minuto de Dave o un minuto normal?' }
  ],
  idle:[['dave',120,{}]],
  steps:[
    { id:'camion', clock:'9:08', music:'funk', scene:sceneTruck, hint:'Tip: lee la pista completa antes de tocar. Busca primero el color.',
      before:[{ who:'narr', text:'RETO 1 · ¿Dónde está el camión? Termina el trabajo para poder irte. Mr. Deadline da pistas por la videollamada: toca en el mapa el camión que coincide. Son 3 rondas, cada una con más camiones. Si fallas 3 seguidos, pierdes una vida.', fx(){ setStage(sceneCoworkExit()); } }] },
    { id:'luzroja', clock:'9:12', music:'funk', scene:sceneRedLight, hint:'Tip: antes de girar, el jefe carraspea. Ese es tu aviso.',
      before:[
        { who:'dave', text:'Lo encontré: estaba parado en un autolavado en Ohio. Listo, coordinado. ¡Vámonos!', fx: idle([['dave',120,{}]]) },
        { who:'dave', text:'El jefe sigue en la videollamada. Si ve que me voy, me pone otra reunión.' },
        { who:'narr', text:'RETO 2 · Luz roja, luz verde. Cruza el cowork hasta la puerta: mantén el dedo en la pantalla para avanzar mientras el jefe mira hacia otro lado y suéltalo cuando mire a la cámara. Cada 3 veces que te pille, pierdes una vida.' } ] },
    { id:'deadline', clock:'9:15', music:'boss', scene:sceneDodgeBoss, hint:'Tip: mira la sombra en el piso: ahí va a caer cada correo.',
      vs:{ boss:'deadline', flip:true, desc:'Arrastra a Dave para esquivar correos y reuniones. Junta notas y lanza el BASS SOLO.', name:'MR. DEADLINE', cls:'JEFE DE OFICINA', moves:['CORREO URGENTE','REUNIÓN DE 5 MINUTOS','RESPONDER A TODOS','¿TIENES UN SEGUNDITO?'] },
      before:[
        { who:'deadline', text:'Where do you think you’re going?', fx(){ COWORK_DOOR = true; clock = '9:15'; if (!(stage && stage.isRed)) idle([['dave',176,{ y:194, flip:true }],['deadline',62,{ anim:'grita' }]])(); } },   // sigue la escena del aterrizaje
        { who:'deadline', text:'Truck found. Good. Now the report. And the slides. Son apenas las 9:15 p.m. En Estados Unidos todavía es horario laboral.', fx(){ COWORK_DOOR = true; clock = '9:15'; idle([['dave',176,{ y:194, flip:true }],['deadline',62,{ anim:'explica' }]])(); SFX.mail(); } },
        { who:'dave', text:'Tengo un ensayo. Bueno… una audición. Bueno… mi vida.' },
        { who:'deadline', text:'¿Vida? Qué gracioso. ¡No te vas hasta que termines los reportes!', fx: idle([['dave',176,{ y:194, flip:true }],['deadline',62,{ anim:'explica' }]]) },
        { who:'checho', text:'¿Qué pasa, Dave? ¡Vámonos!' },
        { who:'narr', text:'JEFE · Mr. Deadline. Arrastra el dedo por el piso para mover a Dave y esquivar los correos y las reuniones (la sombra en el piso avisa dónde va a caer cada correo). Atrapa las notas de bajo para cargar el BASS SOLO y, cuando esté listo, presiona el botón para lanzárselo: tres solos lo desconectan. Si te golpean 3 veces, pierdes una vida.' } ] }
  ],
  outro:[
    { who:'deadline', text:'Esto… lo hablamos el lunes.', fx(){ davePeto = false; setStage(scenePostIts()); SFX.hey(); vibrate(200); } },
    { who:'maito', text:'¡Se quitó el peto!' },   // Dave sigue agitando el peto todo el tiempo que el jugador quiera
    // al tocar: el diálogo se oculta, Dave agita el peto 2 s más y luego sale corriendo
    { who:'narr', text:'…', fx(){ dlg.hidden = true; dlgLock = true; setTimeout(() => setStage(sceneDaveRunsOut(() => { dlgLock = false; setStage(sceneStreetCelebrate()); fadeIn = .8; setMood(1, 3); dlg.hidden = false; advance(); })), 2000); } },
    { who:'todos', text:'¡Vamos!' },
    { who:'dave', text:'El lunes tengo respuesta automática. «Fuera de la oficina: ensayando para abrir a Mötley Brüe».' },
    { who:'dave', text:'Ahora sí, muchachos… ¿Vamos por pollito?' },
    { who:'checho', text:'Pollito para llevar. Pepino, ve por Mao a La Carcajada.', fx(){ if (STREET) STREET.chechoLeft = true; } },
    { who:'maito', text:'Hecho. Si Mao está en un stand-up, seguro se está riendo de sus propios chistes.' },
    { who:'checho', fx(){ if (STREET) STREET.chechoLeft = false; }, text:'Dave y yo vamos por Cami: ya debe estar terminando su presentación. Son las 9:20 p.m. El tiempo corre.' },
    { who:'dave', text:'(Le vibra el celular: «Meeting tomorrow 7:00 a.m.») …Mañana. ¡Vamos!' },
    { who:'narr', text:'…', fx(){ dlg.hidden = true; dlgLock = true; STREET && STREET.leave(() => { dlgLock = false; advance(); }); } }   // Checho y Dave salen corriendo por la derecha y fundido
  ],
  mapSub:'¡DAVE SE QUITO EL PETO! FALTAN 2 · VAMOS POR MAO'
};
