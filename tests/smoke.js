// ExploraSTEAM 3D — smoke test de integración (THREE real + mocks de DOM)
// Uso: node tests/smoke.js   (desde la raíz del repo)
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..') + '/';
const LIB = (p) => require(ROOT + p);

/* ---------- Mocks DOM ---------- */
const listeners = {};
function makeCtx2d() {
  const target = { canvas: {} };
  return new Proxy(target, {
    get(t, prop) {
      if (prop === 'createRadialGradient' || prop === 'createLinearGradient') return () => ({ addColorStop() {} });
      if (prop === 'measureText') return () => ({ width: 12 });
      if (prop === 'getImageData') return () => ({ data: new Uint8ClampedArray(4) });
      if (prop in t) return t[prop];
      return function () { return undefined; };
    },
    set(t, prop, value) { t[prop] = value; return true; }
  });
}
function makeEl(id) {
  const el = {
    id: id, children: [], style: {}, dataset: {}, disabled: false, value: '50',
    min: '0', max: '100', step: '1', textContent: '', innerHTML: '', src: '', className: '',
    width: 360, height: 190,
    classList: {
      _s: new Set(),
      add(...c) { c.forEach(x => this._s.add(x)); },
      remove(...c) { c.forEach(x => this._s.delete(x)); },
      toggle(c, force) { if (force === undefined) force = !this._s.has(c); if (force) this._s.add(c); else this._s.delete(c); },
      contains(c) { return this._s.has(c); }
    },
    addEventListener(type, fn) { const k = id + ':' + type; (listeners[k] = listeners[k] || []).push(fn); },
    removeEventListener() {}, setPointerCapture() {}, releasePointerCapture() {},
    appendChild(c) { el.children.push(c); return c; },
    removeChild(c) { el.children = el.children.filter(x => x !== c); },
    getBoundingClientRect() { return { left: 0, top: 0, width: 360, height: 190 }; },
    getContext() { return makeCtx2d(); },
    querySelectorAll() { return el.children.slice(); },
    querySelector() { return el.children[0] || null; },
    click() {},
    setAttribute() {},
    focus() {}
  };
  return el;
}
const elements = {};
global.window = global;
global.self = global;
global.document = {
  getElementById(id) { if (!elements[id]) elements[id] = makeEl(id); return elements[id]; },
  createElement(tag) { return makeEl('tmp-' + tag + '-' + Math.random().toString(36).slice(2, 7)); },
  querySelectorAll() { return []; },
  querySelector() { return null; },
  addEventListener() {}
};
global.localStorage = { _d: {}, getItem(k) { return this._d[k] || null; }, setItem(k, v) { this._d[k] = String(v); }, removeItem(k) { delete this._d[k]; } };
global.speechSynthesis = { speak() {}, cancel() {}, getVoices() { return []; }, onvoiceschanged: null };
global.SpeechSynthesisUtterance = function (text) { this.text = text; };
global.AudioContext = undefined;
global.navigator = { userAgent: 'smoke' };

const THREE = LIB('vendor/three.min.js');
global.THREE = THREE;
let gsapOK = false;
try { global.gsap = LIB('vendor/gsap.min.js'); gsapOK = true; } catch (e) {
  console.log('gsap real no cargó, usando stub:', e.message.slice(0, 60));
  const apply = (target, vars) => { if (!target) return; if (vars) { if (typeof vars.x === 'number') target.x = vars.x; if (typeof vars.y === 'number') target.y = vars.y; if (typeof vars.z === 'number') target.z = vars.z; if (vars.onUpdate) vars.onUpdate(); } };
  global.gsap = { to: (t, v) => { apply(t, v); if (v && v.onComplete) v.onComplete(); return { kill() {} }; }, set: (t, v) => apply(t, v), timeline: () => { const tl = { to(t, v) { apply(t, v); return tl; }, add(fn) { if (typeof fn === 'function') fn(); return tl; } }; return tl; }, killTweensOf() {} };
}
console.log('GSAP:', gsapOK ? 'real ✓' : 'stub');

const load = f => eval(fs.readFileSync(ROOT + f, 'utf8'));
load('js/curriculum.js');
load('js/algorithms.js');
load('js/audio.js');
load('js/world.js');
load('js/ui.js');
console.log('Módulos cargados ✓');

const scene = new THREE.Scene();
const world = global.STEAM_WORLD.buildWorld(scene);
console.log('buildWorld ✓  islas:', world.islands.length, '| shaders:', world.shaders.length, '| Pío:', !!world.mascot);
world.tickWorld(1.23);
world.tickWorld(7.89);
console.log('tickWorld ✓');

let demoErrors = [];
const labTypes = {};
for (const island of global.STEAM_CURRICULUM.ISLANDS) {
  for (const t of global.STEAM_CURRICULUM.getTopics(island.id)) {
    labTypes[t.lab.type] = true;
    try {
      world.setDemo(island.id, t.lab.type);
      world.setDemoValue(island.id, Number(t.lab.min));
      world.setDemoValue(island.id, Number(t.lab.max));
      world.setDemoValue(island.id, Number(t.lab.value));
      world.tickDemos(2.5);
      world.tickDemos(3.5);
      world.clearDemo(island.id);
    } catch (e) { demoErrors.push(island.id + ' / ' + t.lab.type + ' → ' + e.message); }
  }
}
console.log('Laboratorios probados:', Object.keys(labTypes).length, 'tipos únicos');
console.log('Errores de laboratorio:', demoErrors.length ? demoErrors : 'ninguno ✓');

let campusReturns = 0;
global.STEAM_UI.init({ world, onRequestReturn() { campusReturns += 1; } });
console.log('STEAM_UI.init ✓');
global.STEAM_UI.openIsland({ id: 'science', name: 'Isla de Ciencias', object: world.islands[0] });
const tmpButtons = Object.keys(listeners).filter(k => /^tmp-button-.*:click$/.test(k));
console.log('Tarjetas de misión renderizadas:', tmpButtons.length);
if (tmpButtons.length && listeners[tmpButtons[0]]) listeners[tmpButtons[0]].forEach(fn => fn({ button: 0 }));
// Fase 1: encabezado con degradado por isla + emoji del tema (sin JPG repetido)
console.log('Trivia media (degradado propio):', String(elements['trivia-media'].style.background).indexOf('radial-gradient') === 0 ? 'sí ✓' : 'NO ✗', '| emoji:', elements['trivia-emoji'].textContent);
// Video de Pío: escenas exclusivas deepDive, navegación y cierre
listeners['btn-video:click'].forEach(fn => fn({}));
console.log('Video escena 1:', elements['video-slide-title'].textContent, '| progreso:', elements['video-progress-fill'].style.width);
if (!elements['video-slide-text'].textContent || elements['video-slide-text'].textContent === 'Cargando…') throw new Error('La escena deepDive no se renderizó');
listeners['video-next:click'].forEach(fn => fn({}));
console.log('Video escena 2:', elements['video-slide-title'].textContent);
listeners['video-next:click'].forEach(fn => fn({}));
console.log('Video escena 3:', elements['video-slide-title'].textContent);
console.log('Escena reto con imagen:', String(elements['video-slide-visual'].style.backgroundImage).indexOf('deepdive') >= 0 ? 'sí ✓' : '(sin imagen aún)');
listeners['video-close:click'].forEach(fn => fn({}));
console.log('Video cerrado:', elements['video-modal'].classList.contains('hidden') ? 'sí ✓' : 'NO ✗');
listeners['btn-next:click'].forEach(fn => fn({}));
console.log('Fase 2 visible:', !elements['phase-2'].classList.contains('hidden'), '| lab visible:', !elements['lab-panel'].classList.contains('hidden'), '| raster oculto (no es arte):', elements['raster-wrap'].classList.contains('hidden'));
const slider = elements['demo-slider'];
slider.value = '3';
(listeners['demo-slider:input'] || []).forEach(fn => fn({ target: slider }));
console.log('Slider → valor:', elements['slider-value'].textContent, '| caption:', elements['lab-caption'].textContent.slice(0, 50));
listeners['btn-next:click'].forEach(fn => fn({}));
console.log('Fase 3 visible:', !elements['phase-3'].classList.contains('hidden'));
for (let q = 0; q < 3; q += 1) {
  const box = elements['quiz-options'];
  if (!box.children.length) throw new Error('No se renderizaron opciones en Q' + (q + 1));
  const btn = box.children[0];
  (listeners[btn.id + ':click'] || []).forEach(fn => fn({}));
  listeners['btn-next:click'].forEach(fn => fn({}));
}
console.log('Pantalla de resultados visible:', !elements['phase-done'].classList.contains('hidden'), '|', elements['done-title'].textContent);
(listeners['btn-done-campus:click'] || []).forEach(fn => fn({}));
console.log('Retorno al campus solicitado:', campusReturns === 1 ? 'sí ✓' : 'NO ✗');

// Cambio de isla a mitad de misión: nada residual debe quedar visible
global.STEAM_UI.openIsland({ id: 'engineering', name: 'Isla de Ingeniería', object: world.islands[2] });
console.log('Tras cambiar a Ingeniería — picker visible:', !elements['topic-picker'].classList.contains('hidden'),
  '| fase-wrapper oculto:', elements['phase-wrapper'].classList.contains('hidden'),
  '| topic reseteado:', global.STEAM_UI.state.topic === null);

const scienceIsla = world.islands.find(i => i.userData.id === 'science');
console.log('uSuccess anillo Ciencias:', scienceIsla.userData.successShader.uniforms.uSuccess.value.toFixed(2));
console.log('\n✅ SMOKE TEST COMPLETO');
