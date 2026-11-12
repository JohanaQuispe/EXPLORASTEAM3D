// js/main.js — ExploraSTEAM 3D: arranque, luces, bucle de render y estadísticas gráficas
(function () {
  "use strict";

  let scene, camera, renderer, worldData, interaction;
  const clock = new THREE.Clock();
  let fpsFrames = 0;
  let fpsTimer = 0;
  let currentFps = 60;

  function init() {
    const container = document.getElementById("canvas-container");

    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xcfe8ff, 48, 95);

    camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 220);
    camera.position.copy(STEAM_INTERACTION.HOME.position);
    camera.lookAt(STEAM_INTERACTION.HOME.target);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;   // evita el “quemado” de luces
    renderer.toneMappingExposure = 0.92;
    container.appendChild(renderer.domElement);

    // ---- Iluminación (cielo pastel + sol cálido)
    const hemisphere = new THREE.HemisphereLight(0xffffff, 0x9ec5ff, 0.55);
    scene.add(hemisphere);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.22);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff1d6, 0.88);
    dirLight.position.set(18, 30, 14);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.left = -18;
    dirLight.shadow.camera.right = 18;
    dirLight.shadow.camera.top = 18;
    dirLight.shadow.camera.bottom = -18;
    dirLight.shadow.camera.far = 80;
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0xbde0fe, 0.22);
    fillLight.position.set(-14, 12, -16);
    scene.add(fillLight);

    // ---- Construir el mundo flotante
    worldData = STEAM_WORLD.buildWorld(scene);

    // ---- Interacción (raycasting + vuelo de cámara + Pío)
    interaction = STEAM_INTERACTION.createInteraction({
      scene: scene,
      camera: camera,
      renderer: renderer,
      world: worldData
    });

    // ---- Interfaz didáctica
    STEAM_UI.init({
      world: worldData,
      onRequestReturn: function () {
        if (interaction) interaction.returnToCampus();
      }
    });

    window.addEventListener("resize", onWindowResize);
    setupPwa();
    animate();
  }

  // ---- PWA: service worker + captura del evento de instalación
  function setupPwa() {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("sw.js").catch(function () { /* offline opcional */ });
    }
    window.addEventListener("beforeinstallprompt", function (event) {
      event.preventDefault();
      window.__deferredPrompt = event;   // ui.js lo usa al pulsar 📲 Instalar
    });
    window.addEventListener("appinstalled", function () { window.__deferredPrompt = null; });
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function animate() {
    requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();

    // Shaders GLSL (anillos de éxito)
    if (worldData && worldData.shaders) {
      STEAM_ALGORITHMS.tickShaders(worldData.shaders, elapsed);
    }
    // Balanceo de islas, nubes, destellos, engranajes
    if (worldData && worldData.tickWorld) {
      worldData.tickWorld(elapsed);
    }
    // Laboratorios 3D animados (engranajes, auto, órbita, vapor…)
    if (worldData && worldData.tickDemos) {
      worldData.tickDemos(elapsed);
    }
    if (interaction) interaction.update();

    renderer.render(scene, camera);

    // Estadísticas de computación gráfica (FPS / triángulos / draw calls)
    fpsFrames += 1;
    fpsTimer += 1 / 60;
    if (fpsTimer >= 0.5) {
      currentFps = Math.round(fpsFrames / fpsTimer);
      fpsFrames = 0;
      fpsTimer = 0;
      if (STEAM_UI && STEAM_UI.setStats) {
        STEAM_UI.setStats(currentFps, renderer.info.render.triangles || 0, renderer.info.render.calls || 0);
      }
    }
  }

  window.addEventListener("DOMContentLoaded", init);
})();
