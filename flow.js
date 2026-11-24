'use strict';
/* ===================== FLUJO DEL JUEGO ===================== */
const HECHOS = {
  checho:'En cada concierto en vivo, Checho prueba el micrófono diciendo «Heeeeeeyy». Siempre.',
  maito:'Además de vivir enredado con los cables de sus in-ears, Maito se sabe de memoria diálogos completos de sus películas favoritas, y los usa a cada rato.',
  dave:'Dave trabaja con Estados Unidos a toda hora. A veces llega al ensayo todavía en una call.',
  mao:'Mao y Maito se ríen todo el tiempo, de chistes que a veces solo ellos entienden.',
  cami:'Cami es Maestra en Música y, además de rockear con Kabbaret, canta con una orquesta filarmónica.',
  final:'Kabbaret toca junta desde 2009 y esperan seguirlo haciendo por mucho más tiempo.'
};
const LEVELS = { checho:L1, maito:L2, dave:L3, mao:L4, cami:L5, final:L6 };
const ORDER = ['checho','maito','dave','mao','cami','final'];
let curLevel = null, stepI = -1, current = '', stepToken = 0;

const CHARS = {   // presentación de cada capítulo: nombre del personaje y título del capítulo
  checho:{ name:'CHECHO', ch:'1', ttl:'Duelo en Rock Express' },
  maito:{ name:'MAITO', ch:'2', ttl:'Lucha libre en el Coliseo Mexa' },
  dave:{ name:'DAVE', ch:'3', ttl:'La call que nunca termina' },
  mao:{ name:'MAO', ch:'4', ttl:'Noche de risas en La Carcajada' },
  cami:{ name:'CAMI', ch:'5', ttl:'Mezcla de dos mundos' },
  final:{ name:'KABBARET', ch:'FINAL', ttl:'Todo o nada' }
};
const MAP_X = { checho:'14%', cami:'32%', maito:'55%', mao:'64%', dave:'86%' };
// hora del mapa = cuando termina la escena anterior (chat 3:47, N1 ~8:10, N2 ~8:45, N3 ~9:20, N4 ~9:55, N5 ~10:45); cada vez más cerca de las 11:00 p.m.
const MAP_CLOCK = ['3:47','8:10','8:45','9:20','9:55','10:45'];

/* ---------- niveles y pasos ---------- */
function startLevel(k){
  curLevel = LEVELS[k]; VENUE = curLevel.venue; fans = curLevel.fans; resetStats(); lives = 3; lifeStyle = 'skull';
  BARKS = curLevel.barks; barkI = 0; curLevel.onStart && curLevel.onStart();
  stepI = -1; hideAll(); clock = curLevel.steps[0].clock;
  setStage(sceneIdle({ cast:curLevel.idle, label:'NIVEL ' + curLevel.n })); setMusic('calm');
  talk(curLevel.intro, nextStep);
}
function nextStep(){
  stepI++; const s = curLevel.steps[stepI];
  if (!s) return levelEnd();
  const lines = typeof s.before === 'function' ? s.before() : s.before;
  const go = () => s.vs ? showVS(s.vs, playStep) : playStep();
  if (lines && lines.length){ if (!lines[0].fx) setStage(sceneIdle({ cast:curLevel.idle, label:'NIVEL ' + curLevel.n })); talk(lines, go); }
  else go();
}
function playStep(){
  const s = curLevel.steps[stepI]; current = s.id; lives = 3; stepToken = 1;
  if (s.clock) clock = s.clock; if (s.venue) VENUE = s.venue;
  setMusic(stepMusic(s)); setStage(s.scene());
}
// Regla de música: intensa solo contra el jefe; retos con ritmo suave; al rescatar, calma.
function stepMusic(s){
  if (curLevel.key === 'final') return s.music || 'rock';
  if (s.vs) return s.music || 'boss';
  return ['metal','boss','party','rock'].includes(s.music || 'rock') ? 'funk' : s.music;
}
function stepDone(){ if (!stepToken) return; stepToken = 0; nextStep(); }
function levelEnd(){
  if (stage && stage.stop) stage.stop();
  if (curLevel.key !== 'final') setMusic('calm');
  talk(curLevel.outro, () => curLevel.ficha ? showFicha() : showCredits());
}

/* ---------- pantallas ---------- */
function showVS(vs, cb){
  const key = curLevel.key;
  setImgClean($('vsP'), key === 'final' ? 'logo.jpg' : 'p_' + key + '.jpg'); $('vsP').classList.toggle('flip', false);   // la banda ya mira a la derecha en sus retratos
  $('vsDesc').textContent = vs.desc || ''; $('vsPName').textContent = CHARS[key].name;
  setImgClean($('vsB'), 'p_' + vs.boss + '.jpg'); $('vsB').classList.toggle('flip', !!vs.flip); $('vsBName').textContent = vs.name; $('vsBCls').textContent = vs.cls;   // retrato del jefe, siempre mirando hacia la izquierda
  $('vsMoves').innerHTML = vs.moves.map(m => `<span>${m}</span>`).join('');
  show('sVS'); setMusic('silence');
  const el = $('sVS'); el.querySelectorAll('*').forEach(n => { n.style.animation = 'none'; void n.offsetWidth; n.style.animation = ''; });
  setTimeout(() => { DR.crash(now()); DR.kick(now()); pchord(0, .8); }, 500);
  setTimeout(() => { DR.kick(now()); pchord(1, .8); }, 1100);
  setTimeout(() => el.querySelectorAll('.vs figure').forEach(f => f.style.animation = 'none'), 1300);   // al terminar la entrada, cada retrato queda fijo en su sitio (Safari a veces lo dejaba corrido)
  $('bVS').onclick = () => { hideAll(); cb(); };
}
function charIntro(k){   // presentación sobria: CHAPTER, número, personaje, título del capítulo y hecho real (sin imágenes, para no adelantar nada)
  const c = CHARS[k];
  $('iNum').textContent = c.ch; $('iNum').classList.toggle('word', c.ch.length > 2);
  $('iName').textContent = c.name; $('iTtl').textContent = c.ttl; $('iHecho').textContent = HECHOS[k] || '';
  show('sIntro'); setMusic('calm');
  $('sIntro').querySelectorAll('*').forEach(n => { n.style.animation = 'none'; void n.offsetWidth; n.style.animation = ''; });
  setTimeout(() => { [0,3,5].forEach((s,i) => pchord(s, .12, now()+i*.18, true, .04)); }, 900);   // apenas un acorde suave
  $('bIntro').onclick = () => { hideAll(); startLevel(k); };
}
function showFicha(){
  const k = curLevel.key, wasNew = !store.has(k);
  const f = document.querySelector('.ficha'); f.style.visibility = 'hidden';   // nada de la ficha anterior debe verse mientras carga la nueva
  $('fImg').alt = 'Ficha de ' + CHARS[k].name;
  setImgClean($('fImg'), 'ficha_' + k + '.jpg', () => { f.style.visibility = ''; f.style.animation = 'none'; void f.offsetWidth; f.style.animation = ''; });
  show('sFicha'); setStage(sceneIdle({ label:'' }));
  SFX.unlock();
  if (PASS){ $('bFicha').querySelector('img').src = 'btn_ir_portada.png'; $('bFicha').setAttribute('aria-label', 'Ir a la portada'); $('bFicha').onclick = goTitle; return; }
  $('bFicha').querySelector('img').src = 'btn_continuar.png'; $('bFicha').setAttribute('aria-label', 'Continuar');
  store.add(k);
  $('bFicha').onclick = () => showMap(wasNew ? k : null);
}
function showMap(revealNew){
  if (PASS) return goTitle();   // en el pase de camerino no hay mapa: siempre de vuelta a la portada
  show('sMap'); setMusic('calm');
  const rescued = store.get().filter(k => k !== 'final');
  document.querySelectorAll('.map img.rev').forEach(img => { img.classList.remove('reveal'); img.classList.toggle('on', rescued.includes(img.dataset.k) && img.dataset.k !== revealNew); });
  const count = rescued.length, before = revealNew ? count - 1 : count;
  $('mapCount').textContent = before + '/5 LISTOS';
  // la letra pixel no tiene mayúsculas con tilde: en estos carteles se escriben sin tilde
  $('mapSub').textContent = count >= 5 ? '¡BANDA COMPLETA! RUMBO A LA AUDICION' : 'LA BANDA ESTA DISPERSA\nREUNELOS ANTES DE LAS 11:00\u00a0P.M.';
  $('mapClock').innerHTML = '<b>' + MAP_CLOCK[Math.min(5, before)] + ' P.M.</b><span>AUDICION A LAS 11:00 P.M.</span>';
  const next = ORDER.find(k => !store.has(k));
  if (next){ $('bMapImg').src = 'btn_nivel_' + next + '.png'; $('bMap').setAttribute('aria-label', next === 'final' ? 'Nivel final' : 'Nivel ' + LEVELS[next].n + ' · ' + CHARS[next].name); $('bMap').onclick = () => charIntro(next); }
  else { $('bMapImg').src = 'btn_creditos.png'; $('bMap').setAttribute('aria-label', 'Ver créditos'); $('bMap').onclick = () => showCredits(true); }
  if (revealNew){
    $('bMap').hidden = true;
    setTimeout(() => {
      const img = document.querySelector(`.map img.rev[data-k="${revealNew}"]`);
      $('burst').style.setProperty('--bx', MAP_X[revealNew]); $('burst').classList.remove('go'); void $('burst').offsetWidth; $('burst').classList.add('go');
      img.classList.add('on','reveal'); SFX.unlock();
      setTimeout(() => { $('mapCount').textContent = count + '/5 LISTOS'; $('mapSub').textContent = LEVELS[revealNew].mapSub; $('bMap').hidden = false; $('bMap').focus(); }, 1300);
    }, 700);
  } else { $('bMap').hidden = false; }
}
function showCredits(fromMap){
  if (stage && stage.stop) stage.stop();
  store.add('final'); show('sEnd'); setMusic('silence');   // la despedida va en silencio
}
function gameOver(){
  if (stage && stage.stop) stage.stop(); stage = sceneIdle({ label:'' });
  const lines = [['p_maito.jpg','¡De pie, hijo de pe#@%, porque Mickey te ama!'],['p_maito.jpg','¡Noooooo, Mónicaaaa!'],['p_mao.jpg','Eso no es así madre'],['p_maito.jpg','¡Demonios, Gump! Eres un m@#d%to genio. Es la mejor respuesta que jamás he oído.'],['p_cami.jpg','sha na na na na na na na… ¡aaahg!']];
  const q = lines[(gameOver.i = (gameOver.i || 0) + 1) % lines.length];
  $('oImg').src = q[0]; $('oTxt').textContent = q[1]; $('oHint').textContent = (curLevel.steps[stepI] || {}).hint || '';
  $('bOverHome').hidden = !PASS;
  show('sOver'); setMusic('calm'); cameo.hidden = true; frozen = 0;
}
$('bRetry').addEventListener('click', () => { hideAll(); playStep(); });

/* ---------- prólogo ---------- */
function prologue(){
  hideAll(); curLevel = L1; VENUE = 'hogar'; lives = 3; fans = -1; clock = '3:20'; lifeStyle = 'skull';
  setStage(sceneIdle({ cast:[['checho',120,{anim:'casa'}]], label:'' })); setMusic('calm'); SFX.ring();
  talk([
    { who:'narr', text:'Bogotá. Un día normal, 3:20 p.m. Checho descansa en su apartamento; las guitarras cuelgan de la pared, en silencio. Suena el celular: número desconocido.' },
    { who:'ricardo', text:'¿Sergio? Le habla Ricardo, promotor de eventos. Voy al grano porque no tengo tiempo.', fx(){ setStage(sceneIdle({ cast:[['checho',120,{anim:'celular'}]], label:'' })); perlaStart(1.2); } },
    { who:'ricardo', text:'En 15 días Mötley Brüe toca por primera vez en Colombia. Arena Capital. Lleno total.' },
    { who:'checho', text:'¿Mötley… Brüe? Sí, sí… lo sé.' },
    { who:'ricardo', text:'La banda que iba a abrir se cayó. Diferencias creativas. Necesito reemplazo urgente.' },
    { who:'ricardo', text:'Esta noche hay audición con varias bandas en Rock Express. Si Kabbaret llega COMPLETA y suena a las 11:00 p.m., el puesto es suyo.' },
    { who:'ricardo', text:'A las 11:00 p.m. Ni un minuto más. Tic tac.' },
    { who:'checho', text:'¡Increiiiiible!… Ok, calma. Calma. Hay que avisarle a la banda.', fx(){ setStage(sceneIdle({ cast:[['checho',120,{anim:'celebra_celular'}]], label:'' })); SFX.riffStab(); } },
    { who:'narr', text:'Checho abre el grupo de WhatsApp de la banda y empieza a escribir…', fx(){ setStage(sceneIdle({ cast:[['checho',120,{anim:'chatea'}]], label:'' })); PERLA.t0 = -1; perlaDash(.5); } },
  ], groupChat);
}
function groupChat(){
  PERLA.t0 = -1; PERLA.dash = -1;
  show('sChat');
  const msgs = $('msgs'); msgs.innerHTML = ''; msgs.scrollTop = 0; $('bChat').hidden = true; $('typing').hidden = false; $('chatMore').hidden = true;
  const M = [
    ['p_checho.jpg','CHECHO','Muchachos, emergencia. Nos ofrecen abrir Mötley Brüe en el Arena Capital.', true],
    ['p_checho.jpg','CHECHO','Audición HOY 11:00 p.m. en Rock Express. Tenemos que estar los cinco.', true],
    ['p_maito.jpg','MAITO','¿Qué??? Pepino no juegues'],
    ['p_maito.jpg','MAITO','Estoy en el Coliseo Mexa, me invitaron a abrir la lucha con unas rolas. Ahí llego, paaasfe lo que passfe'],
    ['p_dave.jpg','DAVE','Estoy en una call con Estados Unidos. Se perdió un camión. Ya casi lo resuelvo.'],
    ['p_mao.jpg','MAO','¿Pueden llegar 30 min después? Pleaseee!'],
    ['p_checho.jpg','CHECHO','No Maolo, es serio.', true],
    ['p_mao.jpg','MAO','jajajaja ok ok, estoy tocando en un stand up, salgo y voy'],
    ['p_cami.jpg','CAMI','Termino con la Wind Orchestra Region y llego. Llevo mi micrófono, NADIE me pone uno prestado.'],
    ['p_cami.jpg','CAMI','¡No puede ser! ¿Mötley Brüe?'],
    ['p_checho.jpg','CHECHO','Yo me adelanto a Rock Express a cuadrar todo.', true],
    ['logo.jpg','NARRADOR','3:47 p.m. Todos dijeron que sí. Nadie dijo cómo.'],
  ];
  let i = 0, chatT = null;
  const add = () => {
    if (i >= M.length){ $('typing').hidden = true; $('bChat').hidden = false; $('bChat').focus(); return; }
    const m = M[i++], d = document.createElement('div'); d.className = 'msg' + (m[3] ? ' me' : '');
    d.innerHTML = `<img src="${m[0]}" alt=""><div><b style="color:${m[3]?'#ffd34d':'#36d6ff'}">${m[1]}</b><span></span></div>`;
    d.querySelector('span').textContent = m[2]; msgs.appendChild(d); chatArrow(); tone(m[3]?988:740,.06,'square',.06); tone(m[3]?1318:988,.08,'square',.06,now()+.06);
    chatT = setTimeout(add, 1100);
  };
  chatT = setTimeout(add, 500);
  $('sChat').onclick = e => { if (e.target.id === 'bChat') return; clearTimeout(chatT); add(); };
}
function chatArrow(){
  const m = $('msgs'), below = m.scrollHeight - m.scrollTop - m.clientHeight;
  const mb = m.getBoundingClientRect().bottom, hiddenN = [...m.children].filter(c => c.getBoundingClientRect().top > mb - 10).length;
  $('chatMore').hidden = below < 12; $('chatN').textContent = hiddenN > 0 ? hiddenN : '';
}
$('msgs').addEventListener('scroll', chatArrow);
$('chatMore').addEventListener('click', e => { e.stopPropagation(); const m = $('msgs'); m.scrollTo({ top: m.scrollHeight, behavior: 'smooth' }); });
$('bChat').addEventListener('click', e => { e.stopPropagation(); showMap(null); });

/* ---------- portada: PRESS START ---------- */
let avisoSeen = false;
function aviso(next){
  if (avisoSeen) return next();
  avisoSeen = true; show('sAviso'); $('bAviso').classList.remove('on');
  setTimeout(() => $('bAviso').classList.add('on'), 2000);
  $('bAviso').onclick = () => next();
}
// PRESS START: sonido especial y, en la misma pantalla, aparecen MODO HISTORIA y PASE DE CAMERINO
function startSound(){ const t = now(); DR.crash(t); DR.kick(t); pchord(0, .5, t); [0,4,7,12].forEach((s,i) => pchord(s, .1, t + .14 + i*.07, true, .05)); setTimeout(() => SFX.unlock(), 420); }
function titleTap(){
  if ($('sTitle').classList.contains('started')) return;
  initAudio(); $('sTitle').classList.add('started'); startSound();
  $('pressStart').classList.add('go');
  setTimeout(() => { $('pressStart').classList.remove('go'); showTitleMenu(false); setMusic('calm'); }, 380);
}
// portada: MODO HISTORIA / PASE DE CAMERINO; dentro del modo historia, CONTINUAR / NUEVA PARTIDA / REGRESAR
function showTitleMenu(story){
  show('sTitle'); $('pressStart').hidden = true; $('titleMenu').hidden = false;
  $('tmMain').hidden = !!story; $('tmStory').hidden = !story;
  (story ? $('bCont') : $('bStory')).focus();
}
// la advertencia de «basado en hechos reales» solo aparece al entrar al modo historia
// la advertencia va justo antes del prólogo: su botón CONTINUAR lleva directo al prólogo (nunca de vuelta a la portada)
function storyStart(){ avisoSeen = false; aviso(() => prologue()); }
function storyMode(){ PASS = null; if (store.get().length) showTitleMenu(true); else storyStart(); }
// PASE DE CAMERINO: se juega solo el nivel del integrante elegido; al terminar vuelve a la portada y no cuenta para el modo historia
let PASS = null;
function goTitle(){
  PASS = null; stepToken = 0; if (stage && stage.stop) stage.stop(); setStage(sceneIdle({ label:'' })); cameo.hidden = true; frozen = 0;
  // cortar cualquier diálogo en curso (y sus silencios programados) sin que avance al cerrarse
  if (typing){ clearInterval(typing); typing = null; } dq = []; di = 0; dDone = null; dlgLock = false; dlgLockTap = null; dlg.hidden = true;
  lifeStyle = 'skull'; fadeIn = 0; $('sMenu').hidden = true; setMusic('calm'); showTitleMenu(false);
}
/* ---------- compartir: primero el menú nativo del celular (sin el aviso de «Abrir enlace» con la dirección larga);
   si el celular no lo permite, sigue el enlace corto de WhatsApp ---------- */
const SHARE = { title:'Kabbaret: La Audición', text:'¡Juega Kabbaret: La Audición! Rescata a la banda en una noche de locos por Bogotá 🎸', url:'https://claude.ai/artifact/8EJtB6FwVSwaPfgsXiJdax' };
$('bWhats').addEventListener('click', e => {
  if (!navigator.share) return;   // sin menú nativo: el enlace normal hace su trabajo
  e.preventDefault(); const a = e.currentTarget;
  navigator.share(SHARE).catch(err => { if (err && err.name !== 'AbortError') window.open(a.href, '_blank', 'noopener'); });
});
/* ---------- teléfono acostado: aviso «gira tu teléfono» (CSS) y pausa; en Android se intenta fijar la vertical ---------- */
const ROT_MQ = matchMedia('(orientation:landscape) and (pointer:coarse) and (max-height:600px)');
function lockPortrait(){ try { const p = screen.orientation && screen.orientation.lock && screen.orientation.lock('portrait'); if (p && p.catch) p.catch(() => {}); } catch(e){} }
addEventListener('pointerdown', lockPortrait, { once:true });
/* ---------- menú de opciones: sonido, volver al juego, menú principal ---------- */
function setMuted(v){ muted = v; if (master) master.gain.value = muted ? 0 : .5; try { localStorage.setItem('kab-muted', v ? '1' : '0'); } catch(e){}   // se recuerda para la próxima visita
  $('bSound').querySelector('img').src = muted ? 'btn_sonido_apagado.png' : 'btn_sonido_activado.png'; $('bSound').setAttribute('aria-label', muted ? 'Sonido apagado' : 'Sonido activado'); }
function openMenu(){ const onTitle = !$('sTitle').hidden || !$('sAviso').hidden;
  $('bMainMenu').hidden = onTitle; $('menuNote').hidden = onTitle; $('sMenu').hidden = false; $('bResume').focus(); }
try { if (localStorage.getItem('kab-muted') === '1') setMuted(true); } catch(e){}
$('mute').addEventListener('click', e => { e.stopPropagation(); initAudio(); openMenu(); });
$('bSound').addEventListener('click', () => setMuted(!muted));
$('bResume').addEventListener('click', () => { $('sMenu').hidden = true; });
$('bMainMenu').addEventListener('click', goTitle);
$('sMenu').addEventListener('click', e => { if (e.target === $('sMenu')) $('sMenu').hidden = true; });
addEventListener('keydown', e => { if (e.key === 'Escape' && !$('sMenu').hidden) $('sMenu').hidden = true; });
$('sTitle').addEventListener('click', e => { if (e.target.closest('#titleMenu')) return; titleTap(); });


addEventListener('keydown', e => { if (!$('sTitle').hidden && (e.key === 'Enter' || e.key === ' ')){ e.preventDefault(); titleTap(); } });
$('bCont').addEventListener('click', () => showMap(null));
$('bStory').addEventListener('click', storyMode);
$('bStoryBack').addEventListener('click', () => showTitleMenu(false));
$('bPase').addEventListener('click', () => {
  show('sPase'); $('sPase').scrollTop = 0; SFX.whoosh();
  document.querySelectorAll('#sPase .paseSwing, #sPase .paseM').forEach(n => { n.style.animation = 'none'; void n.offsetWidth; n.style.animation = ''; n.classList.remove('go'); });
  setTimeout(() => { const t = now(); DR.crash(t); [0,4,7].forEach((s,i) => pchord(s, .14, t + i*.08, true, .05)); }, 2400);   // suena cuando el pase cae
});
$('bPaseBack').addEventListener('click', () => showTitleMenu(false));
document.querySelectorAll('.paseM').forEach(b => b.addEventListener('click', () => { if (PASS) return; PASS = b.dataset.k; b.classList.add('go'); SFX.unlock(); setTimeout(() => charIntro(PASS), 420); }));
$('bOverHome').addEventListener('click', goTitle);
$('bNew').addEventListener('click', () => show('sConfirm'));
$('bYes').addEventListener('click', () => { store.set([]); stats.caps = new Set(['#e0263f']); storyStart(); });
$('bNo').addEventListener('click', () => showTitleMenu(true));
$('bEndMap').addEventListener('click', goTitle);   // la pantalla final lleva al menú principal

/* ---------- entrada ---------- */
function toLocal(e){ const b = cv.getBoundingClientRect(); return [ (e.clientX-b.left)/b.width*W, (e.clientY-b.top)/b.height*H ]; }
cv.addEventListener('pointerdown', e => {
  e.preventDefault(); initAudio();
  if (!dlg.hidden){ advance(); return; }
  if (frozen > 0) return;
  const [x,y] = toLocal(e);
  if (stage){ stage.down && stage.down(x,y,e.pointerId); stage.tap && stage.tap(x,y); }
});
const pUp = e => stage && stage.up && stage.up(e.pointerId);
cv.addEventListener('pointermove', e => { if (!stage || !stage.move || !dlg.hidden || frozen > 0) return; const [x,y] = toLocal(e); stage.move(x, y, e.pointerId); });   // arrastrar (jefe de Dave)
cv.addEventListener('pointerup', pUp); cv.addEventListener('pointercancel', pUp); cv.addEventListener('pointerleave', pUp);
addEventListener('keydown', e => {
  if (!dlg.hidden || !stage || frozen > 0 || e.repeat || !$('sTitle').hidden) return;
  if (e.key === ' '){ e.preventDefault(); stage.down && stage.down(120, 330, 'kS'); stage.tap && stage.tap(120, 330); }
  if (e.key === 'ArrowLeft'){ stage.down && stage.down(10, 380, 'kL'); stage.tap && stage.tap(30, 330); }
  if (e.key === 'ArrowRight'){ stage.down && stage.down(230, 380, 'kR'); stage.tap && stage.tap(210, 330); }
  if (({a:1,s:1,d:1})[e.key]) stage.tap && stage.tap({a:40,s:120,d:200}[e.key], 380);
  if (({a:1,s:1,d:1,f:1})[e.key] && stage.down && !e.repeat) stage.down({a:64,s:101,d:139,f:176}[e.key], 380, 'k' + e.key);
});
addEventListener('keyup', e => { if (stage && stage.up){ if (e.key===' ') stage.up('kS'); if (e.key==='ArrowLeft') stage.up('kL'); if (e.key==='ArrowRight') stage.up('kR'); if (({a:1,s:1,d:1,f:1})[e.key]) stage.up('k' + e.key); } });

/* ---------- bucle principal ---------- */
let last = performance.now();
stage = sceneIdle({ label:'' });
function loop(t){
  const dt = Math.min(.05, (t-last)/1000); last = t; T += dt;
  if (moodT > 0){ moodT -= dt; if (moodT <= 0) mood = 0; }
  const playing = dlg.hidden && screens.every(s => $(s).hidden) && $('sMenu').hidden && !ROT_MQ.matches;   // con el teléfono acostado el juego se pausa   // el menú de opciones pausa el juego
  if (frozen > 0) frozen -= dt; else if (stage && playing) stage.update(dt);
  ctx.save();
  if (shake > 0){ shake -= dt; ctx.translate((Math.random()*6-3)|0, (Math.random()*6-3)|0); }
  r(0,0,W,H,C.night); stage && stage.draw();
  sparks.forEach(p => { p.t += dt; p.vy += 160*dt; p.x += p.vx*dt; p.y += p.vy*dt; ctx.globalAlpha = Math.max(0, 1-p.t); r(p.x, p.y, 2, 2, p.c); });
  ctx.globalAlpha = 1; for (let i = sparks.length-1; i >= 0; i--) if (sparks[i].t > 1) sparks.splice(i,1);
  bubbles.forEach(b => { b.t += dt; const L = b.life || 1.3, k = b.t / L; ctx.globalAlpha = Math.max(0, Math.min(1, (1 - k) * 2.5)); const rise = b.t * 22 * 1.3 / L;
    b.s.split('\n').forEach((ln, i, a) => b.size === 'v' ? vtxtBig(ln, b.x, b.y - rise + (i - (a.length - 1)/2) * 20, b.col, 2, '#000') : txt(ln, b.x, b.y - rise + (i - (a.length - 1)/2) * (b.size + 5), b.col, 'center', b.size)); ctx.globalAlpha = 1; });   // tamaño 'v': letra nítida grande
  bubbles = bubbles.filter(b => b.t < (b.life || 1.3));
  if (frozen > 0){ ctx.globalAlpha = .35; r(0,0,W,H,'#000'); ctx.globalAlpha = 1; }
  if (fadeIn > 0){ fadeIn -= dt; ctx.globalAlpha = Math.max(0, Math.min(1, fadeIn/.6)); r(0,0,W,H,'#000'); ctx.globalAlpha = 1; }
  if (flash > 0){ flash -= dt; ctx.globalAlpha = Math.max(0, flash*1.6); r(0,0,W,H,flashCol); ctx.globalAlpha = 1; }
  ctx.restore();
  requestAnimationFrame(loop);
}
(document.fonts ? document.fonts.load('8px "Press Start 2P"') : Promise.resolve()).catch(()=>{}).finally(() => { paintBG(); requestAnimationFrame(loop); });

/* ---------- botones de prueba (solo para la versión de prueba) ---------- */
function devReset(){
  initAudio(); clearInterval(typing); typing = null; dq = []; dDone = null; dlg.hidden = true;
  cameo.hidden = true; frozen = 0; stepToken = 0; if (stage && stage.stop) stage.stop(); hideAll(); $('devPanel').hidden = true;
}
// pruebas: salta directo al cierre del nivel (lo que pasa después de vencer al jefe)
function devAfterBoss(k){
  devReset(); startLevel(k);
  setTimeout(() => { clearInterval(typing); typing = null; dq = []; dDone = null; dlg.hidden = true; hideAll();
    if (stage && stage.stop) stage.stop(); dlgLock = false;
    const last = curLevel.steps[curLevel.steps.length - 1]; if (last.clock) clock = last.clock;
    if (curLevel.onBossWon) curLevel.onBossWon();
    setStage(sceneIdle({ cast:curLevel.idle, label:'NIVEL ' + curLevel.n })); stepI = curLevel.steps.length; levelEnd(); }, 50);
}
function devLevel(k, step){
  devReset(); startLevel(k);
  if (step != null){ setTimeout(() => { clearInterval(typing); typing = null; dq = []; dDone = null; dlg.hidden = true; hideAll();
    if (stage && stage.stop) stage.stop(); dlgLock = false; setStage(sceneIdle({ cast:curLevel.idle, label:'NIVEL ' + curLevel.n }));   // sin la escena de inicio del nivel
    stepI = step; nextStepAt(step); }, 50); }
}
function nextStepAt(i){ stepI = i - 1; nextStep(); }
(function buildDev(){
  const L = $('devList'), add = (title, items) => {
    const g = document.createElement('div'); g.innerHTML = `<div class="devGrp">${title}</div><div class="devRow"></div>`;
    items.forEach(([t, fn]) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = t; b.onclick = fn; g.lastChild.appendChild(b); });
    L.appendChild(g);
  };
  add('INICIO', [['ADVERTENCIA', () => { devReset(); avisoSeen = false; aviso(() => prologue()); }], ['PRÓLOGO', () => { devReset(); prologue(); }], ['CHAT', () => { devReset(); curLevel = L1; groupChat(); }], ['MAPA', () => { devReset(); showMap(); }]]);
  ORDER.forEach(k => {
    const lv = LEVELS[k], name = k === 'final' ? 'FINAL' : 'NIVEL ' + lv.n + ' · ' + CHARS[k].name;
    const items = [['PRESENTACIÓN', () => { devReset(); PASS = null; charIntro(k); }], ['INICIO', () => devLevel(k)]];
    const NM = { tune:'AFINADOR', floyd:'TRÉMOLO', pedals:'PEDALERA', headbang:'GORRAS', multi:'MULTITAREA', pit:'PIT STOP', rimshot:'CHISTES', metro:'AGUANTA LA RISA', mic:'MICRÓFONO', transform:'TRANSFORMACIÓN', console:'CONSOLA', song:'AUDICIÓN', traffic:'TRÁFICO', save:'IMPOSIBLE', giro:'GIRO', festival:'FESTIVAL' };
    lv.steps.forEach((s, i) => items.push([s.vs ? 'JEFE' : (NM[s.id] || s.id.toUpperCase()), () => devLevel(k, i)]));
    items.push(['DESPUÉS DEL JEFE', () => devAfterBoss(k)]);
    items.push(['FICHA', () => { devReset(); curLevel = lv; lv.ficha ? showFicha() : showCredits(); }]);
    add(name, items);
  });
  if ($('devBtn')) $('devBtn').onclick = () => { $('devPanel').hidden = !$('devPanel').hidden; };
  $('devClose').onclick = () => { $('devPanel').hidden = true; };
})();

// precarga de fichas y retratos de los versus
preloadImgs(['checho','maito','dave','mao','cami'].map(k => 'ficha_' + k + '.jpg').concat(['laca','enredo','deadline','ivan','feedback','ricardo'].map(k => 'p_' + k + '.jpg')));
