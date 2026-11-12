// js/ui.js — ExploraSTEAM 3D: panel didáctico (picker de misiones + 3 fases + progreso)
(function (global) {
  "use strict";

  const STEAM_UI = {
    state: { island: null, topic: null, phase: 0, mode: "A", quizIndex: 0, correctCount: 0, locked: false },
    init: null // injectado por main.js con { world, onRequestReturn }
  };
  let ctx = null; // { world, onRequestReturn }
  const PROGRESS_KEY = "explorasteam_progress_v1";
  let progress = {};
  try { progress = JSON.parse(global.localStorage.getItem(PROGRESS_KEY) || "{}"); } catch (e) { progress = {}; }

  function $(id) { return document.getElementById(id); }

  function saveProgress() {
    try { global.localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress)); } catch (e) { /* noop */ }
  }

  function getTopicProgress(topicId) {
    return progress[topicId] || null;
  }

  function islandDoneCount(islandId) {
    const topics = STEAM_CURRICULUM.getTopics(islandId);
    return topics.filter(function (t) { return progress[t.id] && progress[t.id].done; }).length;
  }

  function islandStars(islandId) {
    const topics = STEAM_CURRICULUM.getTopics(islandId);
    return topics.reduce(function (acc, t) { return acc + ((progress[t.id] && progress[t.id].stars) || 0); }, 0);
  }

  function totalDone() {
    return Object.keys(progress).filter(function (k) { return progress[k] && progress[k].done; }).length;
  }

  function totalStars() {
    return Object.keys(progress).reduce(function (acc, k) { return acc + ((progress[k] && progress[k].stars) || 0); }, 0);
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  function shuffle(array) {
    const arr = array.slice();
    for (let i = arr.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
    return arr;
  }

  /* ============ PÁGINA 1 · Selector de misión ============ */

  function renderTopicPicker(islandId) {
    const meta = STEAM_CURRICULUM.getIsland(islandId);
    const topics = STEAM_CURRICULUM.getTopics(islandId);
    $("panel-island-img").src = meta.image;
    $("panel-island-img").alt = meta.name;
    $("panel-title").textContent = meta.name;
    $("panel-tagline").textContent = meta.tagline;
    $("panel-stars").textContent = "⭐ " + islandStars(islandId) + " / 15";

    const grid = $("topic-picker");
    grid.innerHTML = "";
    topics.forEach(function (topic, index) {
      const p = progress[topic.id];
      const stars = p ? p.stars : 0;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "topic-card" + (p && p.done ? " done" : "");
      btn.innerHTML =
        '<span class="topic-num">' + (p && p.done ? "✓" : (index + 1)) + '</span>' +
        '<span class="topic-icon">' + topic.icon + '</span>' +
        '<span class="topic-name">' + escapeHtml(topic.title) + '</span>' +
        '<span class="topic-stars">' + "★".repeat(stars) + "☆".repeat(3 - stars) + '</span>';
      btn.addEventListener("click", function () {
        if (global.STEAM_AUDIO) global.STEAM_AUDIO.sfx("pop");
        startTopic(islandId, topic.id);
      });
      grid.appendChild(btn);
    });
  }

  function showPicker() {
    const st = STEAM_UI.state;
    st.phase = 0;
    st.topic = null;
    if (ctx && ctx.world) ctx.world.clearDemo(st.island.id);
    $("topic-picker").classList.remove("hidden");
    $("phase-wrapper").classList.add("hidden");
    $("phase-done").classList.add("hidden");
    $("panel-kicker").textContent = "🗺️ Elige tu misión";
    $("btn-next").classList.add("hidden");
    $("btn-back").classList.add("hidden");
    renderTopicPicker(st.island.id);
  }

  /* ============ Arranque de una misión ============ */

  function startTopic(islandId, topicId) {
    const topic = STEAM_CURRICULUM.getTopic(islandId, topicId);
    if (!topic) return;
    const st = STEAM_UI.state;
    st.topic = topic;
    st.phase = 1;
    st.mode = "A";
    st.quizIndex = 0;
    st.correctCount = 0;
    st.locked = false;

    $("topic-picker").classList.add("hidden");
    $("phase-wrapper").classList.remove("hidden");
    $("phase-done").classList.add("hidden");
    $("btn-next").classList.remove("hidden");
    $("btn-back").classList.remove("hidden");
    $("topic-title").innerHTML = '<span class="topic-title-icon">' + topic.icon + "</span> " + escapeHtml(topic.title);

    renderPhase1(topic);
    showPhase(1);
  }

  function renderPhase1(topic) {
    const meta = STEAM_CURRICULUM.getIsland(STEAM_UI.state.island.id);
    const base = meta && meta.color ? meta.color : "#7b2cbf";
    $("trivia-media").style.background = "radial-gradient(120% 140% at 30% 0%, " + shadeHex(base, 70) + " 0%, " + shadeHex(base, 15) + " 55%, " + shadeHex(base, -45) + " 100%)";
    $("trivia-emoji").textContent = topic.icon;
    $("trivia-text").textContent = topic.phase1;
    $("video-btn-label").textContent = "🎬 Ver video de Pío";
  }

  function showPhase(phase) {
    const st = STEAM_UI.state;
    st.phase = phase;
    [1, 2, 3].forEach(function (p) {
      $("phase-" + p).classList.toggle("hidden", p !== phase);
      const dot = document.querySelector('.phase-dot[data-phase="' + p + '"]');
      if (dot) {
        dot.classList.toggle("active", p === phase);
        dot.classList.toggle("done", p < phase);
      }
    });
    $("panel-kicker").textContent = phase === 1 ? "Fase 1 · ¿Sabías que…?" : (phase === 2 ? "Fase 2 · ¡A experimentar!" : "Fase 3 · El Reto de las Preguntas");

    if (phase === 1) {
      $("btn-next").textContent = "¡A experimentar! 🧪";
      $("btn-next").disabled = false;
      speak(STEAM_UI.state.topic.phase1, 0.95);
    } else if (phase === 2) {
      applyMode(st.mode === "B" ? "B" : "A");
    } else if (phase === 3) {
      renderQuiz();
    }
  }

  /* ============ FASE 2 · Modos A (laboratorio) y B (arcade) ============ */

  function applyMode(mode) {
    const st = STEAM_UI.state;
    st.mode = mode;
    const topic = st.topic;
    $("btn-mode-a").classList.toggle("active", mode === "A");
    $("btn-mode-b").classList.toggle("active", mode === "B");
    $("lab-panel").classList.toggle("hidden", mode !== "A");
    $("game-panel").classList.toggle("hidden", mode !== "B");

    if (mode === "A") {
      // Configurar slider del laboratorio
      const slider = $("demo-slider");
      slider.min = topic.lab.min;
      slider.max = topic.lab.max;
      slider.step = topic.lab.step;
      slider.value = topic.lab.value;
      $("slider-label").textContent = topic.lab.label;
      $("slider-value").textContent = topic.lab.value;
      $("lab-caption").textContent = topic.lab.caption(topic.lab.value);
      // Rasterización solo para el tema de líneas (Arte-2)
      $("raster-wrap").classList.toggle("hidden", topic.lab.type !== "raster");
      $("slider-box").classList.toggle("full-width", topic.lab.type === "raster");
      // Activar demo 3D en la isla
      if (ctx && ctx.world) {
        ctx.world.setDemo(st.island.id, topic.lab.type);
        ctx.world.setDemoValue(st.island.id, Number(topic.lab.value));
      }
      if (topic.lab.type === "raster") setupRasterCanvas(topic);
      $("btn-next").textContent = "¡Listo, ya experimenté! ✓";
      $("btn-next").disabled = false;
      speak(topic.lab.label, 1.0);
    } else {
      if (ctx && ctx.world) ctx.world.clearDemo(st.island.id);
      buildArcadeGame(topic);
      $("btn-next").textContent = "Encuentra los objetos…";
      $("btn-next").disabled = true;
      speak("Encuentra y toca los objetos correctos.", 1.0);
    }
  }

  /* ---- Minijuego arcade "Toca los correctos" ---- */
  const game = { found: 0, mistakes: 0, goal: 0 };
  // Distractores genéricos (objetos cotidianos que casi nunca son respuesta STEAM)
  const GLOBAL_DISTRACTORS = ["🧦", "🪥", "🧤", "🪀", "🪑", "🥄", "🧼", "🧽", "🪣", "🧴", "🪁", "🧻", "🛋️", "🪮"];

  function buildArcadeGame(topic) {
    game.found = 0;
    game.mistakes = 0;
    game.goal = topic.game.goal;
    game.foundKeys = [];
    $("game-prompt").textContent = topic.game.prompt;
    $("game-feedback").textContent = "";
    $("game-feedback").className = "game-feedback";

    const correct = shuffle(topic.game.correct).slice(0, Math.min(topic.game.goal, topic.game.correct.length));
    // Garantizar suficientes distractores (se completa con un pool genérico si hace falta)
    const wrongPool = shuffle(topic.game.wrong.concat(GLOBAL_DISTRACTORS));
    const seen = {};
    correct.forEach(function (e) { seen[e] = true; });
    const wrongs = [];
    for (let i = 0; i < wrongPool.length && wrongs.length < 12 - correct.length; i += 1) {
      if (!seen[wrongPool[i]] && wrongs.indexOf(wrongPool[i]) === -1) wrongs.push(wrongPool[i]);
    }
    const items = shuffle(correct.concat(wrongs));

    const box = $("game-chips");
    box.innerHTML = "";
    items.forEach(function (emoji) {
      const isCorrect = correct.indexOf(emoji) !== -1;
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "game-chip";
      chip.textContent = emoji;
      chip.dataset.correct = isCorrect ? "1" : "0";
      chip.addEventListener("click", function () { onChipTap(chip, topic); });
      box.appendChild(chip);
    });
    renderGoalDots();
  }

  function renderGoalDots() {
    const dots = $("game-goal");
    dots.innerHTML = "";
    for (let i = 0; i < game.goal; i += 1) {
      const dot = document.createElement("span");
      dot.className = "goal-dot" + (i < game.found ? " filled" : "");
      dots.appendChild(dot);
    }
    $("game-mistakes").textContent = "❌ Fallos: " + game.mistakes;
  }

  function onChipTap(chip, topic) {
    if (chip.classList.contains("found")) return;
    if (chip.dataset.correct === "1") {
      game.found += 1;
      chip.classList.add("found");
      if (global.STEAM_AUDIO) global.STEAM_AUDIO.sfx("pop");
      if (game.found >= game.goal) {
        $("game-feedback").textContent = "¡Increíble! Encontraste todo 🎉";
        $("game-feedback").className = "game-feedback ok";
        $("btn-next").textContent = "¡A las preguntas! ❓";
        $("btn-next").disabled = false;
        if (global.STEAM_AUDIO) global.STEAM_AUDIO.sfx("correct");
      }
    } else {
      game.mistakes += 1;
      chip.classList.add("shake", "miss");
      if (global.STEAM_AUDIO) global.STEAM_AUDIO.sfx("wrong");
      global.setTimeout(function () { chip.classList.remove("shake"); }, 450);
      $("game-feedback").textContent = "Ese no… ¡intenta otra vez! 💪";
      $("game-feedback").className = "game-feedback warn";
    }
    renderGoalDots();
  }

  /* ---- Laboratorio de Rasterización (Bresenham) ---- */
  const raster = { size: 10, color: "#e5383b", drawing: false, last: null, tool: "free" };

  function setupRasterCanvas(topic) {
    raster.size = Math.max(2, Math.min(22, Number(topic.lab.value) || 10));
    const canvas = $("raster-canvas");
    if (!canvas.dataset.wired) {
      canvas.dataset.wired = "1";
      wireRasterCanvas(canvas);
    }
    paintRasterBase(canvas);
  }

  function paintRasterBase(canvas) {
    const c = canvas.getContext("2d");
    const cell = 10;
    c.clearRect(0, 0, canvas.width, canvas.height);
    // Retícula tipo papel milimetrado
    c.fillStyle = "#fdfbf3";
    c.fillRect(0, 0, canvas.width, canvas.height);
    c.strokeStyle = "rgba(60, 9, 108, 0.08)";
    c.lineWidth = 1;
    for (let x = 0; x <= canvas.width; x += cell) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, canvas.height); c.stroke(); }
    for (let y = 0; y <= canvas.height; y += cell) { c.beginPath(); c.moveTo(0, y); c.lineTo(canvas.width, y); c.stroke(); }
    // Título guía
    c.fillStyle = "#6a4c93";
    c.font = "700 11px Quicksand, sans-serif";
    c.fillText("✍️ Arrastra para pintar píxeles (Bresenham)", 8, 14);
  }

  function stampPixel(c, x, y, size, color) {
    c.fillStyle = color;
    const half = size / 2;
    c.beginPath();
    c.arc(x, y, half, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "rgba(255,255,255,0.35)";
    c.beginPath();
    c.arc(x - half * 0.3, y - half * 0.3, half * 0.45, 0, Math.PI * 2);
    c.fill();
  }

  function drawRasterLine(canvas, kind) {
    const c = canvas.getContext("2d");
    paintRasterBase(canvas);
    const x0 = 26, x1 = canvas.width - 26;
    const yMid = canvas.height / 2 + 10;
    let pts = [];
    if (kind === "recta") pts = STEAM_ALGORITHMS.bresenhamLine(x0, yMid, x1, yMid);
    else if (kind === "ondulada") pts = STEAM_ALGORITHMS.sampleWavyLine(x0, yMid, x1, yMid, 3.2, 30, 160);
    else if (kind === "zigzag") pts = STEAM_ALGORITHMS.sampleZigZagLine(x0, yMid, x1, yMid, 5, 26);
    // Rasterizar la curva punto a punto con Bresenham entre muestras
    if (kind !== "recta") {
      for (let i = 0; i < pts.length - 1; i += 1) {
        const seg = STEAM_ALGORITHMS.bresenhamLine(pts[i].x / 2, pts[i].y / 2, pts[i + 1].x / 2, pts[i + 1].y / 2);
        seg.forEach(function (p) { stampPixel(c, p.x * 2, p.y * 2, raster.size * 0.62, raster.color); });
      }
    } else {
      pts.forEach(function (p) { stampPixel(c, p.x, p.y, raster.size, raster.color); });
    }
    $("raster-note").textContent = kind === "recta"
      ? "Línea Recta rasterizada píxel por píxel con el algoritmo de Bresenham."
      : (kind === "ondulada" ? "Línea Ondulada: ¡como las olas del mar! 🌊" : "Línea Zig-Zag: ¡como dientes de sierra! ⚡");
  }

  function wireRasterCanvas(canvas) {
    function pos(event) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const client = event.touches && event.touches[0] ? event.touches[0] : event;
      return { x: (client.clientX - rect.left) * scaleX, y: (client.clientY - rect.top) * scaleY };
    }
    function drawTo(p) {
      const c = canvas.getContext("2d");
      if (raster.last) {
        const seg = STEAM_ALGORITHMS.bresenhamLine(raster.last.x / 2, raster.last.y / 2, p.x / 2, p.y / 2);
        seg.forEach(function (sp) { stampPixel(c, sp.x * 2, sp.y * 2, raster.size, raster.color); });
      } else {
        stampPixel(c, p.x, p.y, raster.size, raster.color);
      }
      raster.last = p;
    }
    canvas.addEventListener("pointerdown", function (ev) {
      raster.drawing = true;
      raster.last = null;
      canvas.setPointerCapture(ev.pointerId);
      drawTo(pos(ev));
      $("raster-note").textContent = "Rasterizando… cada cuadrito es un píxel 🟥";
    });
    canvas.addEventListener("pointermove", function (ev) { if (raster.drawing) drawTo(pos(ev)); });
    ["pointerup", "pointercancel", "pointerleave"].forEach(function (evt) {
      canvas.addEventListener(evt, function () { raster.drawing = false; raster.last = null; });
    });
    // Botones de herramienta
    document.querySelectorAll(".raster-tool").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (global.STEAM_AUDIO) global.STEAM_AUDIO.sfx("click");
        drawRasterLine(canvas, btn.dataset.line);
      });
    });
    document.querySelectorAll(".raster-color").forEach(function (btn) {
      btn.addEventListener("click", function () {
        raster.color = btn.dataset.color;
        document.querySelectorAll(".raster-color").forEach(function (b) { b.classList.toggle("active", b === btn); });
        if (global.STEAM_AUDIO) global.STEAM_AUDIO.sfx("click");
      });
    });
    $("raster-clear").addEventListener("click", function () {
      paintRasterBase(canvas);
      $("raster-note").textContent = "Lienzo limpio. ¡A pintar! 🎨";
      if (global.STEAM_AUDIO) global.STEAM_AUDIO.sfx("click");
    });
  }

  /* ============ FASE 3 · Quiz ============ */
  let currentOptions = [];

  function renderQuiz() {
    const st = STEAM_UI.state;
    const quiz = st.topic.quiz;
    const item = quiz[st.quizIndex];
    $("quiz-progress").textContent = "Pregunta " + (st.quizIndex + 1) + " de " + quiz.length;
    $("quiz-question").textContent = item.q;
    $("quiz-feedback").textContent = "";
    $("quiz-feedback").className = "quiz-feedback";

    // Mezclar opciones para que Pío no siempre acierte por posición
    currentOptions = shuffle(item.options.map(function (label, i) { return { label: label, correct: i === item.answer }; }));
    const box = $("quiz-options");
    box.innerHTML = "";
    currentOptions.forEach(function (opt) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "quiz-opt-btn";
      btn.textContent = opt.label;
      btn.addEventListener("click", function () { chooseAnswer(btn, opt); });
      box.appendChild(btn);
    });
    $("btn-next").disabled = true;
    $("btn-next").textContent = "Elige una respuesta…";
    speak(item.q, 1.0);
  }

  function chooseAnswer(btn, opt) {
    const st = STEAM_UI.state;
    if (st.locked) return;
    st.locked = true;
    const buttons = $("quiz-options").querySelectorAll("button");
    buttons.forEach(function (b, i) {
      b.disabled = true;
      if (currentOptions[i] && currentOptions[i].correct) b.classList.add("correct");
    });
    if (!opt.correct) btn.classList.add("wrong");

    if (opt.correct) {
      st.correctCount += 1;
      $("quiz-feedback").textContent = "¡Excelente! Pío celebra contigo 🐥🎉";
      $("quiz-feedback").className = "quiz-feedback ok";
      speak("¡Excelente! Respuesta correcta.", 1.05);
      if (global.STEAM_AUDIO) global.STEAM_AUDIO.sfx("correct");
    } else {
      $("quiz-feedback").textContent = "¡Casi! La respuesta correcta se marcó en verde.";
      $("quiz-feedback").className = "quiz-feedback warn";
      speak("¡Casi! Revisa la respuesta marcada en verde.", 1.0);
      if (global.STEAM_AUDIO) global.STEAM_AUDIO.sfx("wrong");
    }
    const isLast = st.quizIndex >= st.topic.quiz.length - 1;
    $("btn-next").disabled = false;
    $("btn-next").textContent = isLast ? "¡Finalizar misión! 🏆" : "Siguiente pregunta →";
  }

  /* ============ Resultados y progreso ============ */

  function finishModule() {
    const st = STEAM_UI.state;
    const topic = st.topic;
    const correct = st.correctCount;
    const stars = 1 + (correct >= 2 ? 1 : 0) + (correct === 3 ? 1 : 0);

    const prev = progress[topic.id];
    const bestStars = Math.max(stars, prev ? prev.stars : 0);
    progress[topic.id] = { done: true, stars: bestStars, bestQuiz: Math.max(correct, prev ? prev.bestQuiz || 0 : 0), doneAt: Date.now() };
    saveProgress();

    // Encender el glow GLSL de la isla (progreso acumulado 0.35 → 1.0)
    if (ctx && ctx.world) {
      const done = islandDoneCount(st.island.id);
      ctx.world.setIslandSuccess(st.island.id, Math.min(1, 0.35 + (done / 5) * 0.65));
    }

    // Pantalla de resultados
    $("phase-wrapper").classList.add("hidden");
    $("phase-done").classList.remove("hidden");
    $("btn-next").classList.add("hidden");
    $("btn-back").classList.remove("hidden");
    $("done-score").textContent = "Acertaste " + correct + " de " + st.topic.quiz.length + " preguntas";
    $("done-title").textContent = correct === 3 ? "¡PERFECTO! Eres un Maestro STEAM" : (correct >= 2 ? "¡Muy bien hecho!" : "¡Lo lograste! Sigue practicando");
    animateDoneStars(stars);
    launchConfetti();
    if (global.STEAM_AUDIO) global.STEAM_AUDIO.sfx("fanfare");
    speak(correct === 3 ? "¡Perfecto! Eres un maestro STEAM." : "¡Misión completada! Muy bien hecho.", 1.05);

    // ¿Medalla de isla completada?
    if (islandDoneCount(st.island.id) === 5) {
      global.setTimeout(function () {
        const meta = STEAM_CURRICULUM.getIsland(st.island.id);
        showToast("🏅 ¡Medalla " + meta.name + "! Completaste las 5 misiones");
        if (global.STEAM_AUDIO) global.STEAM_AUDIO.sfx("star");
      }, 1600);
    }
  }

  function animateDoneStars(earned) {
    const stars = document.querySelectorAll("#done-stars .done-star");
    stars.forEach(function (star, i) {
      star.classList.remove("earned");
      star.style.opacity = "0.22";
      star.style.transform = "scale(0.6)";
      if (i < earned) {
        global.setTimeout(function () {
          star.classList.add("earned");
          star.style.opacity = "1";
          star.style.transform = "scale(1)";
          if (global.STEAM_AUDIO) global.STEAM_AUDIO.sfx("star");
        }, 420 + i * 330);
      }
    });
  }

  function launchConfetti() {
    const layer = $("confetti-layer");
    if (!layer) return;
    const icons = ["🎉", "⭐", "🌟", "🐥", "✨", "🟡", "🔵", "🟣"];
    layer.innerHTML = "";
    for (let i = 0; i < 36; i += 1) {
      const piece = document.createElement("span");
      piece.className = "confetti-piece";
      piece.textContent = icons[i % icons.length];
      piece.style.left = (4 + Math.random() * 92) + "%";
      piece.style.fontSize = (16 + Math.random() * 18) + "px";
      piece.style.animationDelay = (Math.random() * 0.9) + "s";
      piece.style.animationDuration = (1.6 + Math.random() * 1.4) + "s";
      layer.appendChild(piece);
    }
    global.setTimeout(function () { layer.innerHTML = ""; }, 3600);
  }

  function showToast(text) {
    const toast = $("toast");
    toast.textContent = text;
    toast.classList.remove("hidden");
    global.setTimeout(function () { toast.classList.add("hidden"); }, 3400);
  }

  /* ============ Voz ============ */
  function speak(text, rate) {
    if (global.STEAM_AUDIO) global.STEAM_AUDIO.speak(text, { rate: rate || 0.95 });
  }

  /* ============ API pública ============ */

  function openIsland(islandData) {
    const st = STEAM_UI.state;
    st.island = islandData;
    st.topic = null; // nunca arrastrar una misión anterior a otra isla
    if (global.speechSynthesis) global.speechSynthesis.cancel();
    $("module-panel").classList.remove("hidden");
    showPicker();
    $("hud-hint").textContent = "Explora las misiones de " + islandData.name + " — Pío te acompaña 🐥";
  }

  function closeModule() {
    if (global.speechSynthesis) global.speechSynthesis.cancel();
    const islandId = STEAM_UI.state.island ? STEAM_UI.state.island.id : null;
    if (ctx && ctx.world && islandId) ctx.world.clearDemo(islandId);
    $("module-panel").classList.add("hidden");
    STEAM_UI.state.island = null;
    STEAM_UI.state.topic = null;
    $("hud-hint").textContent = "Pío te espera en el Hub. ¡Haz clic en otra isla para seguir explorando!";
  }

  function requestCampusReturn() {
    closeModule();
    if (ctx && typeof ctx.onRequestReturn === "function") ctx.onRequestReturn();
  }

  /* ============ Modales (video de Pío, progreso, acerca) ============ */

  /* ---- Video de Pío: escenas narradas 100% offline (funciona sin internet) ---- */
  const video = { slides: [], idx: 0, playing: false, timer: null };

  function shadeHex(hex, amt) {
    let n = String(hex || "#7b2cbf").replace("#", "");
    if (n.length === 3) n = n.split("").map(function (c) { return c + c; }).join("");
    const num = parseInt(n, 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + amt));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 255) + amt));
    const b = Math.max(0, Math.min(255, (num & 255) + amt));
    return "rgb(" + r + "," + g + "," + b + ")";
  }

  function buildVideoSlides(topic) {
    const island = STEAM_CURRICULUM.getIsland(STEAM_UI.state.island.id);
    const base = island && island.color ? island.color : "#7b2cbf";
    const tints = [48, 12, -22];
    const source = Array.isArray(topic.deepDive) ? topic.deepDive : [];
    return source.map(function (slide, i) {
      return {
        gradient: "linear-gradient(155deg, " + shadeHex(base, tints[i % 3] + 55) + " 0%, " + shadeHex(base, tints[i % 3]) + " 52%, " + shadeHex(base, tints[i % 3] - 55) + " 100%)",
        emoji: slide.emoji,
        title: slide.title,
        text: slide.text,
        image: slide.image || null
      };
    });
  }

  function speakSlide(slide, onEnd) {
    const text = slide.title + ". " + slide.text;
    const voiceOn = global.STEAM_AUDIO && global.STEAM_AUDIO.isVoiceOn();
    if (voiceOn && global.STEAM_AUDIO) {
      global.STEAM_AUDIO.speak(text, { onEnd: onEnd });   // hereda la voz suave por defecto
    } else {
      global.setTimeout(onEnd, 2600);
    }
  }

  function renderVideoSlide() {
    const slide = video.slides[video.idx];
    if (!slide) return;
    const visual = $("video-slide-visual");
    if (slide.image) {
      visual.style.background = "";
      visual.style.backgroundImage = "url('" + slide.image + "')";
      visual.classList.add("has-image");
    } else {
      visual.style.backgroundImage = "";
      visual.style.background = slide.gradient;
      visual.classList.remove("has-image");
    }
    $("video-slide-emoji").textContent = slide.emoji;
    $("video-slide-emoji").style.visibility = slide.image ? "hidden" : "visible";
    $("video-slide-title").textContent = slide.title;
    $("video-slide-text").textContent = slide.text;
    $("video-progress-fill").style.width = (((video.idx + 1) / video.slides.length) * 100) + "%";
    $("video-time").textContent = "Escena " + (video.idx + 1) + " / " + video.slides.length;
    $("video-play").textContent = video.playing ? "⏸" : "▶";
  }

  function advanceSlide() {
    if (video.idx < video.slides.length - 1) {
      video.idx += 1;
      renderVideoSlide();
      if (video.playing) narrateCurrentSlide();
    } else {
      video.playing = false;
      $("video-play").textContent = "▶";
      if (global.STEAM_AUDIO) global.STEAM_AUDIO.sfx("sparkle");
    }
  }

  function narrateCurrentSlide() {
    const slide = video.slides[video.idx];
    speakSlide(slide, function () {
      if (video.playing) advanceSlide();
    });
  }

  function stopNarration() {
    if (global.speechSynthesis) global.speechSynthesis.cancel();
  }

  function openVideoModal() {
    const topic = STEAM_UI.state.topic;
    if (!topic) return;
    video.slides = buildVideoSlides(topic);
    video.idx = 0;
    video.playing = true;
    const meta = STEAM_CURRICULUM.getIsland(STEAM_UI.state.island.id);
    $("video-title").textContent = "🎬 " + meta.name;
    const videoUrl = topic.videoId ? ("https://www.youtube.com/watch?v=" + topic.videoId) : (topic.videoSearch || "https://www.youtube.com");
    $("video-search-link").href = videoUrl;
    $("video-search-link").title = "Abre: " + videoUrl;
    renderVideoSlide();
    $("video-modal").classList.remove("hidden");
    if (global.STEAM_AUDIO) global.STEAM_AUDIO.sfx("pop");
    narrateCurrentSlide();
  }

  function closeVideoModal() {
    video.playing = false;
    stopNarration();
    $("video-modal").classList.add("hidden");
  }

  function renderProgressModal() {
    const total = STEAM_CURRICULUM.totalTopics();
    $("progress-total").textContent = totalDone() + " / " + total;
    $("progress-stars").textContent = totalStars() + " / " + (total * 3);
    const bar = $("progress-bar-fill");
    bar.style.width = Math.round((totalDone() / total) * 100) + "%";
    const wrap = $("progress-islands");
    wrap.innerHTML = "";
    STEAM_CURRICULUM.ISLANDS.forEach(function (meta) {
      const done = islandDoneCount(meta.id);
      const stars = islandStars(meta.id);
      const row = document.createElement("div");
      row.className = "progress-island-row";
      row.innerHTML =
        '<img class="progress-island-img" src="' + meta.image + '" alt="' + escapeHtml(meta.name) + '">' +
        '<div class="progress-island-info">' +
          '<div class="progress-island-top"><span class="progress-island-name">' + meta.icon + " " + escapeHtml(meta.name) + '</span>' +
          '<span class="progress-island-count">' + done + '/5</span></div>' +
          '<div class="progress-pips">' + [0, 1, 2, 3, 4].map(function (i) {
            return '<span class="pip' + (i < done ? " filled" : "") + '"></span>';
          }).join("") + '</div>' +
          '<div class="progress-row-stars">⭐ ' + stars + '/15</div>' +
        '</div>';
      wrap.appendChild(row);
    });
    // Insignias
    const badges = $("badges-row");
    badges.innerHTML = "";
    let anyBadge = false;
    STEAM_CURRICULUM.ISLANDS.forEach(function (meta) {
      if (islandDoneCount(meta.id) === 5) {
        anyBadge = true;
        const badge = document.createElement("div");
        badge.className = "badge earned";
        badge.innerHTML = '<span class="badge-icon">🏅</span><span class="badge-name">Medalla ' + escapeHtml(meta.name.replace("Isla de ", "")) + "</span>";
        badges.appendChild(badge);
      }
    });
    if (totalDone() === total) {
      anyBadge = true;
      const master = document.createElement("div");
      master.className = "badge earned master";
      master.innerHTML = '<span class="badge-icon">👑</span><span class="badge-name">Maestro STEAM</span>';
      badges.appendChild(master);
    }
    if (!anyBadge) {
      badges.innerHTML = '<p class="badges-empty">Completa las 5 misiones de una isla y gana su medalla 🏅</p>';
    }
  }

  function openProgressModal() {
    renderProgressModal();
    $("progress-modal").classList.remove("hidden");
    if (global.STEAM_AUDIO) global.STEAM_AUDIO.sfx("pop");
  }

  function openAboutModal() {
    $("about-modal").classList.remove("hidden");
    if (global.STEAM_AUDIO) global.STEAM_AUDIO.sfx("pop");
  }

  function bindModalDismiss(id, closeFn) {
    const modal = $(id);
    modal.addEventListener("click", function (event) {
      if (event.target === modal) closeFn();
    });
  }

  /* ============ Enlace de botones ============ */

  function bind() {
    $("btn-close").addEventListener("click", function () {
      if (global.STEAM_AUDIO) global.STEAM_AUDIO.sfx("click");
      requestCampusReturn();
    });
    $("btn-back").addEventListener("click", function () {
      if (global.STEAM_AUDIO) global.STEAM_AUDIO.sfx("click");
      showPicker();
    });

    $("btn-next").addEventListener("click", function () {
      const st = STEAM_UI.state;
      if (!st.topic && st.phase !== 3) return;
      if (global.STEAM_AUDIO) global.STEAM_AUDIO.sfx("pop");
      if (st.phase === 1) { showPhase(2); return; }
      if (st.phase === 2) { showPhase(3); return; }
      if (st.phase === 3) {
        const isLast = st.quizIndex >= st.topic.quiz.length - 1;
        if (isLast) { finishModule(); } else {
          st.quizIndex += 1;
          st.locked = false;
          renderQuiz();
        }
      }
    });

    // Toggles de modo de la Fase 2
    $("btn-mode-a").addEventListener("click", function () { if (global.STEAM_AUDIO) global.STEAM_AUDIO.sfx("click"); applyMode("A"); });
    $("btn-mode-b").addEventListener("click", function () { if (global.STEAM_AUDIO) global.STEAM_AUDIO.sfx("click"); applyMode("B"); });

    // Botón 🔊 de la Fase 1 + botón 🎥 de video
    $("btn-audio").addEventListener("click", function () {
      const topic = STEAM_UI.state.topic;
      if (topic) speak(topic.phase1, 0.92);
      if (global.STEAM_AUDIO) global.STEAM_AUDIO.sfx("pop");
    });
    $("btn-video").addEventListener("click", openVideoModal);
    $("video-search-link").addEventListener("click", function (event) {
      const url = $("video-search-link").href;
      const win = global.open(url, "_blank");
      if (win) { event.preventDefault(); return; }
      showToast("Tu navegador bloqueó el enlace — permite ventanas emergentes o instala la app 📲");
    });

    // Controles del Video de Pío
    $("video-prev").addEventListener("click", function () {
      if (video.idx > 0) video.idx -= 1; else video.idx = video.slides.length - 1;
      stopNarration();
      renderVideoSlide();
      if (video.playing) narrateCurrentSlide();
      if (global.STEAM_AUDIO) global.STEAM_AUDIO.sfx("click");
    });
    $("video-next").addEventListener("click", function () {
      video.idx = (video.idx + 1) % video.slides.length;
      stopNarration();
      renderVideoSlide();
      if (video.playing) narrateCurrentSlide();
      if (global.STEAM_AUDIO) global.STEAM_AUDIO.sfx("click");
    });
    $("video-play").addEventListener("click", function () {
      video.playing = !video.playing;
      stopNarration();
      $("video-play").textContent = video.playing ? "⏸" : "▶";
      if (video.playing) narrateCurrentSlide();
      if (global.STEAM_AUDIO) global.STEAM_AUDIO.sfx("click");
    });

    // Slider del laboratorio 3D
    $("demo-slider").addEventListener("input", function (event) {
      const value = Number(event.target.value);
      const topic = STEAM_UI.state.topic;
      $("slider-value").textContent = value;
      if (topic && topic.lab) {
        $("lab-caption").textContent = topic.lab.caption(value);
        if (topic.lab.type === "raster") raster.size = value;
        if (ctx && ctx.world) ctx.world.setDemoValue(STEAM_UI.state.island.id, value);
      }
    });

    // Botones del HUD
    $("btn-voice").addEventListener("click", function () {
      const next = !global.STEAM_AUDIO.isVoiceOn();
      global.STEAM_AUDIO.setVoice(next);
      $("btn-voice").classList.toggle("off", !next);
      $("btn-voice").setAttribute("aria-pressed", String(next));
      showToast(next ? "🔊 Voz de Pío activada" : "🔇 Voz de Pío silenciada");
      if (next) speak("¡Hola! Soy Pío. ¡Escucha mis historias!", 1.0);
    });
    $("btn-music").addEventListener("click", function () {
      const next = !global.STEAM_AUDIO.isMusicOn();
      global.STEAM_AUDIO.setMusic(next);
      $("btn-music").classList.toggle("off", !next);
      $("btn-music").setAttribute("aria-pressed", String(next));
      showToast(next ? "🎵 Música activada" : "🎵 Música silenciada");
    });
    $("btn-progress").addEventListener("click", openProgressModal);
    $("btn-about").addEventListener("click", openAboutModal);
    function openInstallModal() {
      const diag = $("install-diag");
      let kind = "";
      let msg = "";
      const standalone = (global.matchMedia && global.matchMedia("(display-mode: standalone)").matches) || global.navigator.standalone === true;
      let inIframe = false;
      try { inIframe = window.self !== window.top; } catch (e) { inIframe = true; }
      const host = (global.location && global.location.hostname) || "";
      const isLocalhost = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(host);
      const protocol = (global.location && global.location.protocol) || "";
      if (standalone) {
        kind = "ok";
        msg = "🎉 La app YA está instalada: la estás abriendo desde su icono. No hace falta instalarla de nuevo.";
      } else if (protocol === "file:") {
        kind = "";
        msg = "⚠️ La abriste como archivo (file://). Chrome nunca ofrece instalar desde ahí. Sirve el proyecto con “python3 -m http.server 8080” y abre http://localhost:8080";
      } else if (inIframe) {
        kind = "info";
        msg = "🌐 Estás dentro del previsualizador embebido: ahí Chrome no instala. Abre el previsualizador en una pestaña nueva (icono de “abrir fuera”) y pulsa 📲 otra vez — o usa localhost.";
      } else if (protocol !== "https:" && !isLocalhost) {
        kind = "";
        msg = "⚠️ Esta URL no es segura para instalar (Chrome exige HTTPS o localhost). Accede por http://localhost:8080 o por el enlace https del previsualizador.";
      } else if (global.__deferredPrompt) {
        kind = "ok";
        msg = "✨ Tu navegador está listo para instalar. Pulsa “📲 Instalar ahora” y acepta el diálogo.";
      } else {
        kind = "info";
        msg = "🔎 Si no ves “Instalar ExploraSTEAM…” en el menú ⋮: F12 → pestaña “Application” → “Manifest” → mira “Installability” (te dice qué falta) y en “Service Workers” debe decir “activated”. Recarga la página una vez y vuelve a intentar.";
      }
      diag.className = "install-diag" + (kind ? " " + kind : "");
      diag.textContent = msg;
      $("install-modal").classList.remove("hidden");
    }

    $("btn-install").addEventListener("click", function () {
      if (global.STEAM_AUDIO) global.STEAM_AUDIO.sfx("pop");
      const deferred = global.__deferredPrompt;
      if (deferred && !(global.matchMedia && global.matchMedia("(display-mode: standalone)").matches)) {
        deferred.prompt();
        deferred.userChoice.finally(function () { global.__deferredPrompt = null; });
        return;
      }
      openInstallModal();
    });
    $("install-now").addEventListener("click", function () {
      const deferred = global.__deferredPrompt;
      if (deferred) {
        deferred.prompt();
        deferred.userChoice.finally(function () { global.__deferredPrompt = null; });
        $("install-modal").classList.add("hidden");
        return;
      }
      showToast("Tu navegador no ofrece instalación automática — sigue los pasos de arriba");
    });
    $("install-close").addEventListener("click", function () { $("install-modal").classList.add("hidden"); });
    $("btn-stats").addEventListener("click", function () {
      const el = $("cg-stats");
      el.classList.toggle("hidden");
      const shown = !el.classList.contains("hidden");
      $("btn-stats").setAttribute("aria-pressed", String(shown));
      if (global.STEAM_AUDIO) global.STEAM_AUDIO.sfx("click");
    });

    // Botón de voz dentro del quiz (lee la pregunta)
    $("btn-quiz-audio").addEventListener("click", function () {
      const item = STEAM_UI.state.topic && STEAM_UI.state.topic.quiz[STEAM_UI.state.quizIndex];
      if (item) speak(item.q, 1.0);
    });

    // Cierre de modales
    $("video-close").addEventListener("click", closeVideoModal);
    $("progress-close").addEventListener("click", function () { $("progress-modal").classList.add("hidden"); });
    $("about-close").addEventListener("click", function () { $("about-modal").classList.add("hidden"); });
    bindModalDismiss("install-modal", function () { $("install-modal").classList.add("hidden"); });
    bindModalDismiss("video-modal", closeVideoModal);
    bindModalDismiss("progress-modal", function () { $("progress-modal").classList.add("hidden"); });
    bindModalDismiss("about-modal", function () { $("about-modal").classList.add("hidden"); });

    // Pantalla de resultados
    $("btn-done-campus").addEventListener("click", function () {
      if (global.STEAM_AUDIO) global.STEAM_AUDIO.sfx("pop");
      requestCampusReturn();
    });
    $("btn-done-retry").addEventListener("click", function () {
      if (global.STEAM_AUDIO) global.STEAM_AUDIO.sfx("click");
      startTopic(STEAM_UI.state.island.id, STEAM_UI.state.topic.id);
    });

    // Sonidos al pasar sobre islas (feedback ya gestionado en interaction.js)
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeVideoModal();
        $("progress-modal").classList.add("hidden");
        $("about-modal").classList.add("hidden");
        $("install-modal").classList.add("hidden");
      }
    });
  }

  function setStats(fps, tris, calls) {
    const el = $("cg-stats");
    if (el) el.innerHTML = "⚡ <b>" + fps + "</b> FPS &nbsp;·&nbsp; 🔺 <b>" + tris.toLocaleString() + "</b> tris &nbsp;·&nbsp; 📞 <b>" + calls + "</b> calls";
  }

  function applySavedSuccess() {
    if (!ctx || !ctx.world) return;
    STEAM_CURRICULUM.ISLANDS.forEach(function (meta) {
      const done = islandDoneCount(meta.id);
      if (done > 0) ctx.world.setIslandSuccess(meta.id, Math.min(1, 0.35 + (done / 5) * 0.65));
    });
  }

  STEAM_UI.init = function (context) {
    ctx = context || {};
    bind();
    // Sincronizar toggles con el estado guardado
    $("btn-voice").classList.toggle("off", !global.STEAM_AUDIO.isVoiceOn());
    $("btn-music").classList.toggle("off", !global.STEAM_AUDIO.isMusicOn());
    applySavedSuccess();
  };
  STEAM_UI.applySavedSuccess = applySavedSuccess;
  STEAM_UI.openIsland = openIsland;
  STEAM_UI.openModule = openIsland; // compatibilidad
  STEAM_UI.closeModule = closeModule;
  STEAM_UI.setStats = setStats;
  STEAM_UI.showToast = showToast;
  STEAM_UI.onCampus = null; // compatibilidad

  global.STEAM_UI = STEAM_UI;
})(window);
