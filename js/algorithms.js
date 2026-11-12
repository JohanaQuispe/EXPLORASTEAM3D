/**
 * ExploraSTEAM 3D — Algoritmos de Computación Gráfica
 * L-Systems, Morphing de mallas, Shaders GLSL y Rasterización (Bresenham).
 */
(function (global) {
  "use strict";

  const STEAM_ALGORITHMS = {};

  const LSYSTEM_RULES = {
    F: "FF+[+F-F-F]-[-F+F+F]"
  };

  function rewriteLSystem(axiom, iterations) {
    let current = axiom;
    for (let i = 0; i < iterations; i += 1) {
      let next = "";
      for (let c = 0; c < current.length; c += 1) {
        const ch = current.charAt(c);
        next += LSYSTEM_RULES[ch] || ch;
      }
      current = next;
    }
    return current;
  }

  /**
   * Tortuga 3D que interpreta una cadena L-System y devuelve un grupo de cilindros.
   */
  function buildLSystemTree(iterations, options) {
    const opts = options || {};
    const group = new THREE.Group();
    group.name = "LSystemTree";

    const axiom = opts.axiom || "F";
    const sentence = rewriteLSystem(axiom, Math.max(0, iterations));
    const step = opts.step || 0.42;
    const angle = THREE.MathUtils.degToRad(opts.angleDeg || 25);
    const radius = opts.radius || 0.055;
    const color = new THREE.Color(opts.color || 0x2f9e44);
    const trunkColor = new THREE.Color(opts.trunkColor || 0x8b5a2b);

    const turtle = {
      pos: new THREE.Vector3(0, 0, 0),
      quat: new THREE.Quaternion(),
      depth: 0
    };
    const stack = [];
    const up = new THREE.Vector3(0, 1, 0);
    const segments = [];

    for (let i = 0; i < sentence.length; i += 1) {
      const ch = sentence.charAt(i);
      if (ch === "F") {
        const dir = up.clone().applyQuaternion(turtle.quat);
        const start = turtle.pos.clone();
        turtle.pos.addScaledVector(dir, step);
        segments.push({ start: start, end: turtle.pos.clone(), depth: turtle.depth });
        turtle.depth += 1;
      } else if (ch === "+") {
        turtle.quat.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), angle));
      } else if (ch === "-") {
        turtle.quat.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), -angle));
      } else if (ch === "&") {
        turtle.quat.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), angle));
      } else if (ch === "^") {
        turtle.quat.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -angle));
      } else if (ch === "/") {
        turtle.quat.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), angle));
      } else if (ch === "\\") {
        turtle.quat.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -angle));
      } else if (ch === "[") {
        stack.push({ pos: turtle.pos.clone(), quat: turtle.quat.clone(), depth: turtle.depth });
        turtle.quat.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), angle * 0.6));
      } else if (ch === "]") {
        const saved = stack.pop();
        if (saved) {
          turtle.pos.copy(saved.pos);
          turtle.quat.copy(saved.quat);
          turtle.depth = saved.depth;
        }
      }
    }

    const maxShown = Math.min(segments.length, 900);
    for (let s = 0; s < maxShown; s += 1) {
      const seg = segments[s];
      const len = seg.start.distanceTo(seg.end);
      if (len < 0.01) continue;
      const t = Math.min(seg.depth / 12, 1);
      const geo = new THREE.CylinderGeometry(radius * (1 - t * 0.65), radius * (1.15 - t * 0.5), len, 5, 1);
      const mat = new THREE.MeshLambertMaterial({
        color: color.clone().lerp(trunkColor, 1 - t)
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.castShadow = true;
      const mid = seg.start.clone().add(seg.end).multiplyScalar(0.5);
      mesh.position.copy(mid);
      mesh.quaternion.setFromUnitVectors(up, seg.end.clone().sub(seg.start).normalize());
      group.add(mesh);
    }

    group.userData.sentence = sentence;
    group.userData.iterations = iterations;
    group.userData.segmentCount = segments.length;
    return group;
  }

  /**
   * Esfera proyectada a cubo — mismo número de vértices, lerp-friendly (morph target).
   */
  function createMorphGeometry(radius, widthSegs, heightSegs) {
    const sphere = new THREE.SphereGeometry(radius, widthSegs, heightSegs);
    sphere.morphAttributes.position = [];

    const spherePos = sphere.attributes.position;
    const boxPos = new Float32Array(spherePos.count * 3);

    for (let i = 0; i < spherePos.count; i += 1) {
      const x = spherePos.getX(i);
      const y = spherePos.getY(i);
      const z = spherePos.getZ(i);
      const ax = Math.abs(x);
      const ay = Math.abs(y);
      const az = Math.abs(z);
      const maxC = Math.max(ax, ay, az) || 1;
      boxPos[i * 3] = (x / maxC) * radius;
      boxPos[i * 3 + 1] = (y / maxC) * radius;
      boxPos[i * 3 + 2] = (z / maxC) * radius;
    }

    sphere.morphAttributes.position.push(new THREE.Float32BufferAttribute(boxPos, 3));
    sphere.morphTargetsRelative = false;
    return sphere;
  }

  function createMorphMesh(color) {
    const geometry = createMorphGeometry(0.85, 24, 16);
    const material = new THREE.MeshLambertMaterial({
      color: color || 0x3b82f6,
      morphTargets: true
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.name = "MorphShape";
    mesh.morphTargetInfluences = [0];
    return mesh;
  }

  function setMorphAmount(mesh, amount) {
    if (!mesh || !mesh.morphTargetInfluences) return;
    mesh.morphTargetInfluences[0] = THREE.MathUtils.clamp(amount, 0, 1);
  }

  /* =================================================================
   * RASTERIZACIÓN — Algoritmo de la línea de Bresenham
   * Devuelve la lista de píxeles enteros que cubren la recta.
   * ================================================================= */
  function bresenhamLine(x0, y0, x1, y1) {
    const points = [];
    let ix0 = Math.round(x0), iy0 = Math.round(y0);
    const ix1 = Math.round(x1), iy1 = Math.round(y1);
    const dx = Math.abs(ix1 - ix0);
    const dy = Math.abs(iy1 - iy0);
    const sx = ix0 < ix1 ? 1 : -1;
    const sy = iy0 < iy1 ? 1 : -1;
    let err = dx - dy;

    for (;;) {
      points.push({ x: ix0, y: iy0 });
      if (ix0 === ix1 && iy0 === iy1) break;
      const e2 = 2 * err;
      if (e2 > -dy) { err -= dy; ix0 += sx; }
      if (e2 < dx) { err += dx; iy0 += sy; }
    }
    return points;
  }

  /* Puntos de líneas onduladas y zig-zag (muestreadas a curvas, luego rasterizadas) */
  function sampleWavyLine(x0, y0, x1, y1, waves, amplitude, steps) {
    const pts = [];
    const n = steps || 120;
    const dx = x1 - x0, dy = y1 - y0;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len, ny = dx / len;
    for (let i = 0; i <= n; i += 1) {
      const t = i / n;
      const offset = Math.sin(t * Math.PI * 2 * (waves || 3)) * (amplitude || 18);
      pts.push({ x: x0 + dx * t + nx * offset, y: y0 + dy * t + ny * offset });
    }
    return pts;
  }

  function sampleZigZagLine(x0, y0, x1, y1, teeth, amplitude) {
    const pts = [];
    const n = (teeth || 6) * 2;
    const dx = x1 - x0, dy = y1 - y0;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len, ny = dx / len;
    for (let i = 0; i <= n; i += 1) {
      const t = i / n;
      const offset = (i % 2 === 0 ? -1 : 1) * (amplitude || 18) * (i === 0 || i === n ? 0 : 1);
      pts.push({ x: x0 + dx * t + nx * offset, y: y0 + dy * t + ny * offset });
    }
    return pts;
  }

  const GLOW_VERTEX = [
    "uniform float uTime;",
    "uniform float uSuccess;",
    "varying vec3 vNormal;",
    "varying vec3 vWorldPos;",
    "void main() {",
    "  vNormal = normalize(normalMatrix * normal);",
    "  float wave = sin(uTime * 4.0 + position.y * 4.0) * uSuccess * 0.09;",
    "  vec3 displaced = position + normal * wave;",
    "  vec4 world = modelMatrix * vec4(displaced, 1.0);",
    "  vWorldPos = world.xyz;",
    "  gl_Position = projectionMatrix * viewMatrix * world;",
    "}"
  ].join("\n");

  const GLOW_FRAGMENT = [
    "uniform float uTime;",
    "uniform vec3 uColor;",
    "uniform float uSuccess;",
    "varying vec3 vNormal;",
    "varying vec3 vWorldPos;",
    "void main() {",
    "  vec3 viewDir = normalize(cameraPosition - vWorldPos);",
    "  float fresnel = pow(1.0 - max(dot(normalize(vNormal), viewDir), 0.0), 2.4);",
    "  float pulse = 0.5 + 0.5 * sin(uTime * 3.6);",
    "  vec3 glow = mix(uColor, vec3(1.0, 0.96, 0.62), uSuccess * pulse * 0.6);",
    "  glow += fresnel * mix(0.14, 0.72, uSuccess) * vec3(1.0, 0.98, 0.78);",
    "  float sparkle = uSuccess * pulse * 0.18;",
    "  gl_FragColor = vec4(glow + sparkle, 1.0);",
    "}"
  ].join("\n");

  function createSuccessShader(hexColor) {
    const color = new THREE.Color(hexColor);
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: color },
        uSuccess: { value: 0 }
      },
      vertexShader: GLOW_VERTEX,
      fragmentShader: GLOW_FRAGMENT
    });
  }

  function setShaderSuccess(material, amount) {
    if (!material || !material.uniforms || !material.uniforms.uSuccess) return;
    material.uniforms.uSuccess.value = amount;
  }

  function tickShaders(materials, elapsed) {
    for (let i = 0; i < materials.length; i += 1) {
      const mat = materials[i];
      if (mat && mat.uniforms && mat.uniforms.uTime) {
        mat.uniforms.uTime.value = elapsed;
      }
    }
  }

  STEAM_ALGORITHMS.rewriteLSystem = rewriteLSystem;
  STEAM_ALGORITHMS.buildLSystemTree = buildLSystemTree;
  STEAM_ALGORITHMS.createMorphMesh = createMorphMesh;
  STEAM_ALGORITHMS.setMorphAmount = setMorphAmount;
  STEAM_ALGORITHMS.createSuccessShader = createSuccessShader;
  STEAM_ALGORITHMS.setShaderSuccess = setShaderSuccess;
  STEAM_ALGORITHMS.tickShaders = tickShaders;
  STEAM_ALGORITHMS.bresenhamLine = bresenhamLine;
  STEAM_ALGORITHMS.sampleWavyLine = sampleWavyLine;
  STEAM_ALGORITHMS.sampleZigZagLine = sampleZigZagLine;

  global.STEAM_ALGORITHMS = STEAM_ALGORITHMS;
})(window);
