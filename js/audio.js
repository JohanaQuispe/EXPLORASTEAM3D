/**
 * ExploraSTEAM 3D — Audio Engine
 * SFX procedurales con Web Audio API (sin archivos externos),
 * musiquita de fondo generativa y puente con Web Speech API.
 */
(function (global) {
  "use strict";

  let ctx = null;
  let musicGain = null;
  let musicTimer = null;
  let musicStep = 0;
  let voiceOn = true;
  let musicOn = true;

  try {
    const saved = JSON.parse(global.localStorage.getItem("explorasteam_audio") || "{}");
    voiceOn = saved.voice !== false;
    musicOn = saved.music !== false;
  } catch (e) { /* storage no disponible */ }

  function persist() {
    try {
      global.localStorage.setItem("explorasteam_audio", JSON.stringify({ voice: voiceOn, music: musicOn }));
    } catch (e) { /* noop */ }
  }

  function audioCtx() {
    if (!ctx) {
      const AC = global.AudioContext || global.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      musicGain = ctx.createGain();
      musicGain.gain.value = 0.055;
      musicGain.connect(ctx.destination);
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function tone(freq, startAt, duration, type, peak, destination) {
    const ac = audioCtx();
    if (!ac) return;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type || "sine";
    osc.frequency.setValueAtTime(freq, startAt);
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(peak || 0.22, startAt + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
    osc.connect(gain);
    gain.connect(destination || ac.destination);
    osc.start(startAt);
    osc.stop(startAt + duration + 0.02);
  }

  function sfx(name) {
    const ac = audioCtx();
    if (!ac) return;
    const t = ac.currentTime;
    switch (name) {
      case "click":
        tone(660, t, 0.07, "triangle", 0.12);
        break;
      case "pop":
        tone(880, t, 0.09, "sine", 0.18);
        tone(1320, t + 0.06, 0.09, "sine", 0.14);
        break;
      case "whoosh":
        tone(320, t, 0.28, "sawtooth", 0.05);
        tone(540, t + 0.08, 0.26, "sawtooth", 0.06);
        break;
      case "correct":
        tone(523.25, t, 0.16, "triangle", 0.2);        // C5
        tone(659.25, t + 0.1, 0.16, "triangle", 0.2);  // E5
        tone(783.99, t + 0.2, 0.24, "triangle", 0.22); // G5
        break;
      case "wrong":
        tone(196, t, 0.22, "square", 0.09);
        tone(147, t + 0.12, 0.3, "square", 0.09);
        break;
      case "star":
        tone(1046.5, t, 0.12, "sine", 0.2);
        tone(1318.5, t + 0.08, 0.12, "sine", 0.2);
        tone(1568.0, t + 0.16, 0.3, "sine", 0.24);
        break;
      case "fanfare": {
        const seq = [[523.25, 0], [523.25, 0.14], [523.25, 0.28], [659.25, 0.42], [783.99, 0.62], [783.99, 0.78], [1046.5, 0.94]];
        for (let i = 0; i < seq.length; i += 1) tone(seq[i][0], t + seq[i][1], 0.22, "triangle", 0.22);
        break;
      }
      case "hop":
        tone(740, t, 0.06, "sine", 0.1);
        break;
      case "sparkle":
        tone(1568, t, 0.1, "sine", 0.12);
        tone(2093, t + 0.07, 0.16, "sine", 0.12);
        break;
      default:
        tone(660, t, 0.08, "sine", 0.1);
    }
  }

  /* Musiquita generativa suave (caja de música pentatónica) */
  const MELODY = [523.25, 659.25, 783.99, 880.0, 783.99, 659.25, 587.33, 659.25,
                  523.25, 587.33, 659.25, 783.99, 659.25, 587.33, 523.25, 392.0];

  function startMusic() {
    const ac = audioCtx();
    if (!ac || musicTimer) return;
    musicStep = 0;
    const tick = function () {
      if (!musicOn) return;
      const freq = MELODY[musicStep % MELODY.length];
      const t = ac.currentTime;
      tone(freq, t, 0.9, "sine", 0.5, musicGain);
      tone(freq * 2, t, 0.5, "triangle", 0.12, musicGain);
      if (musicStep % 4 === 0) tone(freq / 2, t, 1.4, "sine", 0.4, musicGain);
      musicStep += 1;
    };
    tick();
    musicTimer = global.setInterval(tick, 420);
  }

  function stopMusic() {
    if (musicTimer) {
      global.clearInterval(musicTimer);
      musicTimer = null;
    }
  }

  function setMusic(on) {
    musicOn = !!on;
    persist();
    if (musicOn) startMusic(); else stopMusic();
  }

  function setVoice(on) {
    voiceOn = !!on;
    persist();
    if (!voiceOn && global.speechSynthesis) global.speechSynthesis.cancel();
  }

  /* Elige la voz en español más suave y natural disponible (sin escribir voces fijas) */
  function pickSpanishVoice(voices) {
    const tiers = [["es-pe", 34], ["es-mx", 30], ["es-us", 26], ["es-es", 20], ["es-419", 18], ["es", 8]];
    let best = null;
    let bestScore = -1;
    for (let i = 0; i < voices.length; i += 1) {
      const v = voices[i] || {};
      const lang = String(v.lang || "").toLowerCase().replace("_", "-");
      let score = -1;
      for (let t = 0; t < tiers.length; t += 1) {
        if (lang.indexOf(tiers[t][0]) === 0) { score = tiers[t][1]; break; }
      }
      if (score < 0) continue; // solo voces en español
      const name = String(v.name || "").toLowerCase();
      if (name.indexOf("natural") >= 0) score += 46;   // voces neuronales (Edge/Windows)
      if (name.indexOf("neural") >= 0) score += 46;
      if (name.indexOf("online") >= 0) score += 30;
      if (name.indexOf("google") >= 0) score += 32;
      if (name.indexOf("microsoft") >= 0) score += 18;
      if (name.indexOf("mónica") >= 0 || name.indexOf("monica") >= 0) score += 6;
      if (name.indexOf("paulina") >= 0 || name.indexOf("helena") >= 0 || name.indexOf("elsa") >= 0) score += 6;
      if (name.indexOf("compact") >= 0) score -= 35;
      if (name.indexOf("espeak") >= 0) score -= 45;
      if (name.indexOf("robot") >= 0) score -= 45;
      if (v.localService === true && score < 40) score += 4;
      if (score > bestScore) { bestScore = score; best = v; }
    }
    return best;
  }

  function speak(text, opts) {
    if (!voiceOn) { if (opts && typeof opts.onEnd === "function") opts.onEnd(); return; }
    if (!("speechSynthesis" in global)) { if (opts && typeof opts.onEnd === "function") opts.onEnd(); return; }
    const options = opts || {};
    global.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    if (typeof options.onEnd === "function") utterance.onend = options.onEnd;
    const voices = global.speechSynthesis.getVoices() || [];
    const preferred = pickSpanishVoice(voices);
    if (preferred) utterance.voice = preferred;
    utterance.lang = preferred ? preferred.lang : "es-ES";
    utterance.rate = options.rate || 0.95;      // cálida pero con ritmo alegre para niños
    utterance.pitch = options.pitch || 1.12;    // Pío suave y agudo moderado
    utterance.volume = 0.9;
    global.speechSynthesis.speak(utterance);
  }

  // Pre-cargar voces (Chrome las carga asíncrono)
  if ("speechSynthesis" in global) {
    global.speechSynthesis.getVoices();
    global.speechSynthesis.onvoiceschanged = function () { global.speechSynthesis.getVoices(); };
  }

  global.STEAM_AUDIO = {
    sfx: sfx,
    speak: speak,
    setMusic: setMusic,
    setVoice: setVoice,
    startMusic: startMusic,
    stopMusic: stopMusic,
    isMusicOn: function () { return musicOn; },
    isVoiceOn: function () { return voiceOn; }
  };
})(window);
