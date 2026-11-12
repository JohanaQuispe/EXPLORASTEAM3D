# 🐣 ExploraSTEAM 3D — Entorno Virtual Inmersivo para Educación Primaria

Campus virtual 3D flotante para estudiantes de **primaria (6–11 años)**. Pío, el pollito guía, acompaña al estudiante a través de **25 misiones gamificadas** (5 por isla STEAM) con el ciclo de aprendizaje:

**Fase 1 · ¿Sabías que…?** → **Fase 2 · ¡Experimenta!** (Laboratorio 3D en vivo *o* Minijuego arcade) → **Fase 3 · Reto de 3 preguntas**

> Proyecto final del curso **Computación Gráfica y Visual** — 2026-1 · FACULTAD DE INGENIERÍA · CARRERA DE INGENIERÍA DE SISTEMAS COMPUTACIONALES
> Docente: **Alexander Dario Gallardo Reyes**

## 🚀 Cómo ejecutarlo

No requiere instalación ni internet (las librerías están en `vendor/`). Solo hace falta un servidor estático local:

```bash
# Opción 1 — Python
python3 -m http.server 8080

# Opción 2 — Node
npx serve .

# Abre http://localhost:8080
```

**Pruebas:** `node tests/smoke.js` — smoke test de integración (THREE real + mocks de DOM): construye el mundo, ejecuta los 25 laboratorios, simula el flujo completo de una misión y verifica que al cambiar de isla no queda contenido residual.

> ⚠️ No lo sirvas desde `file://` en algunos navegadores: usa el servidor local.
> Los videos de YouTube y las imágenes sí requieren internet (con degradación elegante offline).

## 🗺️ El campus

| Isla | Color | Misiones |
|------|-------|----------|
| 🔬 Isla de Ciencias | Verde | Fotosíntesis · Árboles fractales (L-System) · Ciclo del agua · Estados de la materia · Sistema solar |
| 🤖 Isla de Tecnología | Turquesa | Morphing 3D · Pixeles RGB · Algoritmos · Sensores · Realidad virtual / WebGL |
| 🏗️ Isla de Ingeniería | Naranja | Triángulos · Puentes y pilares · Engranajes · Palanca · Aerodinámica y ruedas |
| 🎨 Isla de Arte | Coral | Colores primarios · Joan Miró y líneas · Esculturas recicladas · Luz y sombra · Simetría |
| 📐 Isla de Matemáticas | Lavanda | Cuerpos geométricos 3D · Balanza de sumas · Patrones · Fracciones · Unidades de medida |

## 🎮 Controles

- **Arrastrar** = orbitar la cámara · **Rueda/pinch** = zoom · **Clic en isla** = Pío brinca por el puente y se abre el panel
- **HUD superior derecho**: voz de Pío 🔊 · música 🎵 · progreso ⭐ · acerca de ℹ️
- **Fase 2 — Modo A** mueve el slider y mira cómo cambia la isla en tiempo real
- **Fase 2 — Modo B** toca los objetos correctos (arcade)
- Las opciones del quiz se barajan; las respuestas correctas encienden el **anillo GLSL de éxito** de la isla (brillo Fresnel + pulso)
- El progreso (estrellas 1–3 por misión, 75 en total) se guarda en `localStorage`

## 🧠 Computación gráfica aplicada (✔ Rúbrica del curso)

| Técnica del sílabo | Implementación | Archivo | Informe |
|---|---|---|---|
| **L-Systems** (modelado procedural) | Tortuga 3D que interpreta `F → FF+[+F-F-F]-[-F+F+F]`; iteraciones 1–3 regeneran el árbol en vivo | `js/algorithms.js` → `buildLSystemTree` | §VI.A, §IV.1-B (Prusinkiewicz et al., 1996) |
| **Morphing de mallas** | Esfera proyectada a cubo con el mismo número de vértices (625); GPU interpola posiciones vía *morph targets* | `js/algorithms.js` → `createMorphMesh` | §VI.A |
| **Shaders GLSL** | `ShaderMaterial` con *Fresnel + pulso senoidal* y desplazamiento vertex-shader para el anillo de éxito; `uSuccess` se incrementa 0.35→1.0 con cada misión completada | `js/algorithms.js` → `createSuccessShader` | §V.4 (Tessellation/Shaders) |
| **Rasterización 2D** | Algoritmo de **Bresenham** (`bresenhamLine`) sobre canvas: dibujo libre + las 3 líneas de Joan Miró (recta, ondulada, zig-zag) píxel por píxel | `js/algorithms.js` · `js/ui.js` | §VI.A ("rasterizado bidimensional") |
| **Raycasting** | Detección cursor→isla para navegación y hover | `js/interaction.js` | §V.1 |
| **Scene graph / Low Poly** | 5 islas flotantes + hub, nubes, destellos (`Points`), sprites de etiqueta (`CanvasTexture`), estética flat-shading pastel | `js/world.js` | §VI.B |
| **WebGL + Three.js r128** | Pipeline completo: escena, cámara, luces Phong/Standard, sombras PCF, `outputEncoding sRGB` | `js/main.js` | §V.1–2 |
| **GSAP keyframes** | Pío atraviesa los puentes con 6 saltos + escala squash/stretch, cámara cinematográfica `flyTo` | `js/interaction.js` | — |
| **Web Speech API** | Narración de Fase 1 y preguntas (voz en español, tono agudo para Pío); voz conmutable 🔊 | `js/audio.js` | Accesibilidad |
| **Web Audio API** | SFX sintetizados (correct/wrong/fanfare/hop) y música generativa de caja de música pentatónica — sin archivos externos | `js/audio.js` | — |
| **HUD en vivo** | Contador de FPS + triángulos + draw calls (`renderer.info`) — evidencia del pipeline | `js/main.js` | §V |

## 📁 Estructura

```
index.html            # HUD, panel lateral, modales (video/progreso/acerca de)
css/styles.css        # Estética pastel low-poly, responsive
js/curriculum.js      # Base de datos: 25 misiones (Fase 1, videos YT, laboratorio, arcade, quiz)
js/algorithms.js      # L-Systems · Morphing · GLSL · Bresenham
js/world.js           # Mundo 3D + 23 laboratorios interactivos por tema (Modo A)
js/interaction.js     # Raycast, cámara, saltos de Pío (GSAP)
js/ui.js              # Panel: picker de misiones, 3 fases, quiz, progreso, medallas
js/audio.js           # Web Speech + SFX Web Audio + música generativa
js/main.js            # Arranque, luces, bucle de render, stats FPS
vendor/               # three.min.js r128, OrbitControls, gsap 3.12.5 (sin CDN)
manifest.webmanifest  # PWA: nombre, iconos, colores, standalone
sw.js                 # Service worker: precaché offline completo
tests/smoke.js        # Smoke test de integración (node tests/smoke.js)
assets/img/           # Ilustraciones generadas (islas, Pío, arte conceptual)
```

## 🎬 Multimedia integrada

- **🎬 Video de Pío**: video educativo 100% offline narrado por Pío. Cada una de las 25 misiones tiene **3 escenas exclusivas escritas para profundizar** (`deepDive` en `curriculum.js`): `🧠 Pío te revela…` (el mecanismo detrás del tema), `🌍 En la vida real` (dónde se usa el concepto) y `🕵️ El reto de Pío` (experimento casero supervisado, **con ilustración propia** `assets/img/deepdive/<misión>.jpg`). **Ninguna escena repite el texto de la Fase 1 ni la pregunta del quiz.** Escenas ilustradas, Web Speech API para la narración, controles ⏮ ▶ ⏭ y avance automático.
- **▶ Ver video en YouTube**: botón de cada misión que abre el **video real elegido para ese tema** (25 videos directos estilo `watch?v=…`, español, nivel primaria, enlazados en `curriculum.js`). Si el colegio bloquea youtube.com, el Video de Pío funciona offline siempre.
- **Voz de Pío suave**: la voz se elige automáticamente priorizando las voces neuronales/naturales en español del sistema (`Natural > Google > Microsoft`); el timbre es grave y pausado (rate 0.95, pitch 1.12, volumen 0.9) pensado para oídos de 6–11 años.
- **Música generativa** y efectos de sonido sintetizados con Web Audio API.
- **Ilustraciones** pastel low-poly; el “Acerca del proyecto” muestra una captura real del campus 3D (`assets/img/mundo-3d.jpg`).

## 📊 Estadísticas técnicas (oculta por defecto)

El HUD incluye el botón 📊 que muestra u oculta el sello de telemetría WebGL (FPS, triángulos renderizados y draw calls) — útil como evidencia en la rúbrica técnica; invisible para los niños por defecto.

## 📲 Instalar como app (PWA) — ideal para el colegio

ExploraSTEAM 3D es una **PWA offline-first**:

1. Sirve el proyecto (`python3 -m http.server 8080`) y abre `http://localhost:8080` en Chrome/Edge.
2. Pulsa el botón **📲** en la barra superior (o menú del navegador → “Instalar ExploraSTEAM…”). El botón abre un asistente con los pasos para PC, Android (Chrome) e iPhone (Safari).
3. Queda instalada como app de escritorio/tablet con su icono propio de Pío y funciona **sin internet**: `sw.js` precachea HTML, CSS, JS, librerías y assets.

> Para publicar una actualización, sube los archivos y cambia `VERSION` en `sw.js` (ej. `explorasteam-v5-…`) para invalidar la caché anterior.

### 🛠 “Chrome no muestra Instalar app” — causas típicas
1. La abriste doble-clicando el archivo (`file://`) → Chrome nunca lo ofrece. Sirve el proyecto.
2. Estás dentro de un previsualizador embebido (iframe) → ábrelo en una **pestaña nueva** (o en `http://localhost:8080`).
3. Accedes por una IP de red sin HTTPS → Chrome exige `https:` o `localhost`.
4. El Service Worker aún no está “activated” → F12 → **Application → Service Workers** → debe decir `activated`; recarga una vez.
5. Diagnóstico preciso: F12 → **Application → Manifest → Installability** te dice exactamente qué criterio falta. El botón 📲 de la app abre esta misma ayuda en contexto (file/iframe/no seguro/listo).

> Nota: el embed directo de YouTube se retiró porque falla en redes con filtrado (colegios) y por videos sin permiso de incrustación. El Video de Pío es el contenido principal y funciona siempre.

## 🏆 Créditos

Equipo **ExploraSTEAM 3D** (2026-1): Otto Martínez · Camila Montalvo · Josué Puican · Johana Quispe · Leoneld Sotelo · Sebastian Yauri — con las referencias del informe (Duo-Terron et al. 2022; Prusinkiewicz et al. 1996; Lim et al. 2006; El Mawas et al. 2020; Bal & Abrishambaf 2017; Rahman & Islam 2023; Sumners et al. 2021).

4. **Voz personalizada para Pío** (Coqui TTS / ElevenLabs) en lugar de la síntesis robótica del navegador.
5. **Tests automatizados**: CI con el smoke test de `js/algorithms.js` + métricas WebGL (FPS ≥ 55 en hardware gama baja).
6. **Evaluación con niños reales**: 30–50 estudiantes, escala SUS + observación de errores de navegación (validación del informe §IV).
