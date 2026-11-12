// js/world.js — ExploraSTEAM 3D: mundo pastel flotante + laboratorios 3D por tema
(function (global) {
  "use strict";

  const COLORS = {
    water: 0x8ecae6,
    hub: 0x86d492,
    hubPath: 0xf2d8a7,
    rock: 0x8d6e63,
    rockDark: 0x6f4e37,
    science: 0x57cc99,
    technology: 0x48bfe3,
    engineering: 0xf4a261,
    art: 0xf28482,
    math: 0xb8a7f9,
    chick: 0xffd23f,
    chickBeak: 0xf77f00,
    chickBackpack: 0xff70a6,
    wood: 0x9a6b4f,
    leaves: 0x38b000,
    leavesLight: 0x70e000,
    white: 0xfdf0d5,
    iron: 0x495057
  };

  const ISLAND_DEFS = [
    { id: "science", name: "CIENCIAS", longName: "Isla de Ciencias", x: -9.2, z: -8.6, color: COLORS.science, beam: 0x64dfdf, labelColor: "#2b9348" },
    { id: "technology", name: "TECNOLOGÍA", longName: "Isla de Tecnología", x: 9.2, z: -8.6, color: COLORS.technology, beam: 0x9d4edd, labelColor: "#1971c2" },
    { id: "engineering", name: "INGENIERÍA", longName: "Isla de Ingeniería", x: -10.4, z: 1.6, color: COLORS.engineering, beam: 0xffd60a, labelColor: "#e8590c" },
    { id: "art", name: "ARTE", longName: "Isla de Arte", x: 0, z: 10.6, color: COLORS.art, beam: 0xff5d8f, labelColor: "#e03131" },
    { id: "math", name: "MATEMÁTICAS", longName: "Isla de Matemáticas", x: 9.6, z: 7.6, color: COLORS.math, beam: 0xb5179e, labelColor: "#7048e8" }
  ];

  function stdMat(color, opts) {
    const params = Object.assign({ color: color, roughness: 0.75, metalness: 0.0, flatShading: true }, opts || {});
    return new THREE.MeshStandardMaterial(params);
  }

  /* ============ Primitivas ============ */

  function createIslandBase(radius, color, height) {
    const island = new THREE.Group();
    const h = height || 1.6;

    const top = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius + 0.25, 0.42, 10), stdMat(color, { roughness: 0.85 }));
    top.receiveShadow = true;
    top.castShadow = true;
    island.add(top);

    const rock1 = new THREE.Mesh(new THREE.ConeGeometry(radius + 0.32, h * 0.72, 9).rotateX(Math.PI), stdMat(COLORS.rock, { roughness: 0.95 }));
    rock1.position.y = -h * 0.36 - 0.18;
    rock1.castShadow = true;
    island.add(rock1);

    const rock2 = new THREE.Mesh(new THREE.ConeGeometry(radius * 0.55, h * 0.55, 8).rotateX(Math.PI), stdMat(COLORS.rockDark, { roughness: 0.95 }));
    rock2.position.y = -h * 0.72 - 0.2;
    island.add(rock2);

    // Fragmentos de roca flotando alrededor
    for (let i = 0; i < 3; i += 1) {
      const shard = new THREE.Mesh(new THREE.DodecahedronGeometry(0.16 + Math.random() * 0.14, 0), stdMat(COLORS.rock));
      const ang = (i / 3) * Math.PI * 2 + Math.random();
      shard.position.set(Math.cos(ang) * (radius + 0.8), -0.4 - Math.random() * 0.8, Math.sin(ang) * (radius + 0.8));
      shard.userData.orbit = { angle: ang, radius: radius + 0.8, y: shard.position.y, speed: 0.12 + Math.random() * 0.1 };
      shard.name = "floatingShard";
      island.add(shard);
    }
    return island;
  }

  function createBlockyTree(x, z, scale) {
    const tree = new THREE.Group();
    const s = scale || 1;
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.16 * s, 0.22 * s, 1.0 * s, 6), stdMat(COLORS.wood));
    trunk.position.y = 0.5 * s;
    trunk.castShadow = true;
    tree.add(trunk);
    const leaves1 = new THREE.Mesh(new THREE.BoxGeometry(1.25 * s, 0.85 * s, 1.25 * s), stdMat(COLORS.leaves, { roughness: 0.7 }));
    leaves1.position.y = 1.32 * s;
    const leaves2 = new THREE.Mesh(new THREE.BoxGeometry(0.85 * s, 0.7 * s, 0.85 * s), stdMat(COLORS.leavesLight, { roughness: 0.7 }));
    leaves2.position.y = 2.0 * s;
    leaves1.castShadow = leaves2.castShadow = true;
    tree.add(leaves1, leaves2);
    tree.position.set(x, 0.2, z);
    return tree;
  }

  function createBush(x, z, color) {
    const bush = new THREE.Mesh(new THREE.IcosahedronGeometry(0.34, 0), stdMat(color || 0x74c69d, { roughness: 0.8 }));
    bush.position.set(x, 0.42, z);
    bush.castShadow = true;
    return bush;
  }

  function createFlower(x, z, color) {
    const g = new THREE.Group();
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.34, 5), stdMat(0x2b9348));
    stem.position.y = 0.37;
    const head = new THREE.Mesh(new THREE.IcosahedronGeometry(0.11, 0), stdMat(color || 0xff70a6, { roughness: 0.6 }));
    head.position.y = 0.56;
    g.add(stem, head);
    g.position.set(x, 0, z);
    return g;
  }

  function createBridge(fromX, fromZ, toX, toZ, beamColor) {
    const bridge = new THREE.Group();
    const distance = Math.hypot(toX - fromX, toZ - fromZ);

    // Viga de energía translúcida (estilo arcoíris de la portada)
    const beam = new THREE.Mesh(
      new THREE.BoxGeometry(1.7, 0.16, distance - 2),
      new THREE.MeshStandardMaterial({ color: beamColor, emissive: beamColor, emissiveIntensity: 0.75, transparent: true, opacity: 0.72, roughness: 0.3 })
    );
    beam.position.set(0, -0.32, (distance - 2) / 2 + 1);
    bridge.add(beam);

    // Pasarela de madera
    const walkway = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.09, distance - 2), stdMat(COLORS.wood, { roughness: 0.9 }));
    walkway.position.set(0, -0.08, (distance - 2) / 2 + 1);
    walkway.receiveShadow = true;
    bridge.add(walkway);

    // Tabla por tabla
    for (let d = 1.4; d < distance - 1.2; d += 0.55) {
      const plank = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.05, 0.18), stdMat(0xb08968, { roughness: 0.9 }));
      plank.position.set(0, 0.0, d);
      bridge.add(plank);
    }

    // Barandales
    const railMat = stdMat(0x6f4e37, { roughness: 0.9 });
    [-0.63, 0.63].forEach(function (off) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, distance - 2.1), railMat);
      rail.position.set(off, 0.28, (distance - 2) / 2 + 1);
      bridge.add(rail);
      for (let d = 1.3; d < distance - 1; d += distance / 5) {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.32, 0.08), railMat);
        post.position.set(off, 0.12, d);
        bridge.add(post);
      }
    });

    bridge.position.set(fromX, 0.12, fromZ);
    bridge.lookAt(toX, 0.12, toZ);
    return bridge;
  }

  /* Sprite de etiqueta flotante (nombre de la isla) */
  function createLabelSprite(text, bgColor) {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 132;
    const c = canvas.getContext("2d");
    const r = 58;
    c.beginPath();
    c.moveTo(r, 8);
    c.lineTo(512 - r, 8);
    c.arc(512 - r, 66, r - 8, -Math.PI / 2, Math.PI / 2);
    c.lineTo(r, 124);
    c.arc(r, 66, r - 8, Math.PI / 2, -Math.PI / 2);
    c.closePath();
    c.fillStyle = bgColor;
    c.fill();
    c.lineWidth = 10;
    c.strokeStyle = "#ffffff";
    c.stroke();
    c.fillStyle = "#ffffff";
    c.font = "800 52px 'Quicksand', 'Arial Black', sans-serif";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText(text, 256, 68);
    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 4;
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false }));
    sprite.scale.set(4.1, 1.06, 1);
    sprite.renderOrder = 20;
    return sprite;
  }

  function createCloud(scale) {
    const cloud = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, flatShading: false, emissive: 0xffffff, emissiveIntensity: 0.25 });
    const puffs = [[0, 0, 0, 1.1], [-1.0, -0.12, 0.15, 0.78], [1.0, -0.1, -0.1, 0.82], [0.35, 0.42, -0.2, 0.66], [-0.4, 0.36, 0.15, 0.6]];
    puffs.forEach(function (p) {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(p[3] * scale, 10, 8), mat);
      puff.position.set(p[0] * scale, p[1] * scale, p[2] * scale);
      puff.scale.y = 0.78;
      cloud.add(puff);
    });
    return cloud;
  }

  function createGlowSprite(colorHex) {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 128;
    const c = canvas.getContext("2d");
    const grad = c.createRadialGradient(64, 64, 4, 64, 64, 62);
    grad.addColorStop(0, colorHex || "rgba(255,244,180,1)");
    grad.addColorStop(0.45, "rgba(255,236,160,0.55)");
    grad.addColorStop(1, "rgba(255,236,160,0)");
    c.fillStyle = grad;
    c.fillRect(0, 0, 128, 128);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    sprite.scale.set(14, 14, 1);
    return sprite;
  }

  /* ============ Mascota Pío ============ */

  function createMascot() {
    const mascot = new THREE.Group();
    mascot.name = "PioMascot";

    const body = new THREE.Mesh(new THREE.DodecahedronGeometry(0.62, 1), stdMat(COLORS.chick, { roughness: 0.45, emissive: 0xffbe0b, emissiveIntensity: 0.32 }));
    body.position.y = 0.66;
    body.scale.y = 0.92;
    body.castShadow = true;
    mascot.add(body);

    const belly = new THREE.Mesh(new THREE.DodecahedronGeometry(0.34, 1), stdMat(0xffe8a3, { roughness: 0.5 }));
    belly.position.set(0, 0.56, 0.34);
    belly.scale.set(0.8, 0.62, 0.5);
    mascot.add(belly);

    const head = new THREE.Mesh(new THREE.DodecahedronGeometry(0.46, 1), stdMat(COLORS.chick, { roughness: 0.45, emissive: 0xffbe0b, emissiveIntensity: 0.32 }));
    head.position.y = 1.24;
    head.castShadow = true;
    mascot.add(head);

    // Mechón (3 plumitas)
    for (let i = -1; i <= 1; i += 1) {
      const feather = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.28, 5), stdMat(0xffb703, { roughness: 0.5 }));
      feather.position.set(i * 0.09, 1.66, 0);
      feather.rotation.z = i * -0.35;
      mascot.add(feather);
    }

    // Ojos grandes con brillo
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0x1b1b1b, roughness: 0.15 });
    const glintMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.9 });
    [-0.18, 0.18].forEach(function (ex) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.085, 10, 10), eyeMat);
      eye.position.set(ex, 1.3, 0.38);
      mascot.add(eye);
      const glint = new THREE.Mesh(new THREE.SphereGeometry(0.028, 6, 6), glintMat);
      glint.position.set(ex + 0.028, 1.33, 0.45);
      mascot.add(glint);
    });

    // Pico
    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.22, 4).rotateX(Math.PI / 2), stdMat(COLORS.chickBeak, { roughness: 0.5 }));
    beak.position.set(0, 1.19, 0.48);
    mascot.add(beak);

    // Mejillas rosadas
    const cheekMat = new THREE.MeshStandardMaterial({ color: 0xffb3c1, emissive: 0xff8fa3, emissiveIntensity: 0.35 });
    [-0.27, 0.27].forEach(function (cx) {
      const cheek = new THREE.Mesh(new THREE.SphereGeometry(0.055, 6, 6), cheekMat);
      cheek.position.set(cx, 1.18, 0.38);
      cheek.scale.z = 0.5;
      mascot.add(cheek);
    });

    // Mochila rosada
    const backpack = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.52, 0.26), stdMat(COLORS.chickBackpack, { roughness: 0.6 }));
    backpack.position.set(0, 0.92, -0.42);
    backpack.castShadow = true;
    mascot.add(backpack);
    const pocket = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.2, 0.06), stdMat(0xffb3d1, { roughness: 0.6 }));
    pocket.position.set(0, 0.88, -0.56);
    mascot.add(pocket);

    // Alitas (animables)
    const wingGeo = new THREE.ConeGeometry(0.17, 0.5, 5);
    const wingL = new THREE.Mesh(wingGeo, stdMat(0xffc53d, { roughness: 0.5 }));
    wingL.position.set(0.58, 0.78, 0);
    wingL.rotation.z = -1.15;
    const wingR = wingL.clone();
    wingR.position.x = -0.58;
    wingR.rotation.z = 1.15;
    mascot.add(wingL, wingR);
    mascot.userData.wings = [wingL, wingR];

    // Zapatillas celestes
    const shoeMat = stdMat(0x4cc9f0, { roughness: 0.4 });
    [-0.2, 0.2].forEach(function (sx) {
      const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.17, 0.36), shoeMat);
      shoe.position.set(sx, 0.09, 0.06);
      mascot.add(shoe);
    });

    return mascot;
  }

  /* ============ Casa de Pío en el Hub ============ */

  function createHubHouse() {
    const house = new THREE.Group();
    const walls = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.1, 1.35), stdMat(0xfff3d6, { roughness: 0.85 }));
    walls.position.y = 0.55;
    walls.castShadow = true;
    house.add(walls);

    const roof = new THREE.Mesh(new THREE.ConeGeometry(1.28, 0.85, 4), stdMat(0xe3646e, { roughness: 0.7 }));
    roof.position.y = 1.5;
    roof.rotation.y = Math.PI / 4;
    roof.scale.set(1, 1, 0.82);
    roof.castShadow = true;
    house.add(roof);

    const door = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.6, 0.06), stdMat(0x8d5a3a, { roughness: 0.8 }));
    door.position.set(0, 0.3, 0.69);
    house.add(door);

    const window = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.05, 12).rotateX(Math.PI / 2), stdMat(0x9bf0ff, { emissive: 0x59c2ff, emissiveIntensity: 0.5 }));
    window.position.set(0.42, 0.72, 0.69);
    house.add(window);

    const chimney = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.5, 0.22), stdMat(0xc9a189, { roughness: 0.9 }));
    chimney.position.set(-0.42, 1.62, -0.2);
    house.add(chimney);

    return house;
  }

  /* ============ Utilidad: engranaje ============ */

  function createGear(radius, color, teeth) {
    const gear = new THREE.Group();
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, 0.16, 14), stdMat(color, { roughness: 0.5, metalness: 0.25 }));
    disc.castShadow = true;
    gear.add(disc);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.35, radius * 0.35, 0.2, 10), stdMat(0x495057, { metalness: 0.4, roughness: 0.35 }));
    gear.add(hub);
    const t = teeth || 8;
    for (let i = 0; i < t; i += 1) {
      const tooth = new THREE.Mesh(new THREE.BoxGeometry(radius * 0.34, 0.17, radius * 0.34), stdMat(color, { roughness: 0.5, metalness: 0.25 }));
      const ang = (i / t) * Math.PI * 2;
      tooth.position.set(Math.cos(ang) * radius, 0, Math.sin(ang) * radius);
      tooth.rotation.y = -ang;
      gear.add(tooth);
    }
    return gear;
  }

  /* Cercha Warren (celosía triangular) para Ingeniería */
  function createTruss(bays, height, length, color) {
    const truss = new THREE.Group();
    const h = height || 0.72;
    const len = length || 2.6;
    const bayLen = len / bays;
    const beamMat = stdMat(color || 0xf77f00, { metalness: 0.3, roughness: 0.45 });

    const chordBottom = new THREE.Mesh(new THREE.BoxGeometry(len, 0.075, 0.075), beamMat);
    chordBottom.position.set(0, 0, 0);
    const chordTop = new THREE.Mesh(new THREE.BoxGeometry(len, 0.075, 0.075), beamMat);
    chordTop.position.set(0, h, 0);
    truss.add(chordBottom, chordTop);

    for (let i = 0; i <= bays; i += 1) {
      const x = -len / 2 + i * bayLen;
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.06, h, 0.06), beamMat);
      post.position.set(x, h / 2, 0);
      truss.add(post);
      const joint = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 6), stdMat(0x495057, { metalness: 0.4 }));
      joint.position.set(x, 0, 0);
      const jointTop = joint.clone();
      jointTop.position.set(x, h, 0);
      truss.add(joint, jointTop);
      if (i < bays) {
        const diagLen = Math.hypot(bayLen, h);
        const diag = new THREE.Mesh(new THREE.BoxGeometry(0.06, diagLen, 0.06), beamMat);
        diag.position.set(x + bayLen / 2, h / 2, 0);
        diag.rotation.z = (i % 2 === 0 ? 1 : -1) * Math.atan2(bayLen, h);
        truss.add(diag);
      }
    }
    return truss;
  }

  /* ============ Props por isla (decorativas) ============ */

  function buildDefaultProps(cfg) {
    const g = new THREE.Group();
    const d = {};

    if (cfg.id === "science") {
      const tree = STEAM_ALGORITHMS.buildLSystemTree(2, { color: 0x2b9348, trunkColor: 0x7f5539, step: 0.32, angleDeg: 26 });
      tree.scale.set(0.85, 0.85, 0.85);
      tree.position.set(0.55, 0.2, -0.35);
      g.add(tree);
      d.treeGroup = tree;

      // Microscopio
      const scope = new THREE.Group();
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.09, 0.36), stdMat(COLORS.iron, { metalness: 0.3 }));
      base.position.y = 0.05;
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.55, 6), stdMat(0x6c757d, { metalness: 0.4 }));
      arm.position.set(-0.1, 0.32, 0);
      arm.rotation.z = 0.35;
      const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.1, 0.42, 8), stdMat(0x343a40, { metalness: 0.5, roughness: 0.3 }));
      tube.position.set(0.06, 0.55, 0);
      tube.rotation.z = 0.35;
      const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.07, 0.08, 8), stdMat(0x9bf0ff, { emissive: 0x59c2ff, emissiveIntensity: 0.6 }));
      lens.position.set(0.13, 0.34, 0);
      lens.rotation.z = 0.35;
      scope.add(base, arm, tube, lens);
      scope.position.set(-1.15, 0.2, 0.95);
      g.add(scope);

      // Domo observatorio
      const domeBase = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.6, 0.34, 10), stdMat(0xe9ecef, { roughness: 0.6 }));
      domeBase.position.set(-1.0, 0.37, -1.05);
      const dome = new THREE.Mesh(new THREE.SphereGeometry(0.55, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), stdMat(0xf8f9fa, { roughness: 0.35 }));
      dome.position.set(-1.0, 0.54, -1.05);
      const domeSlit = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.42, 0.1), stdMat(0x212529));
      domeSlit.position.set(-1.0, 0.78, -0.6);
      g.add(domeBase, dome, domeSlit);
      g.add(createBush(1.35, 0.9, 0x74c69d), createBush(-0.3, 1.35, 0x95d5b2));
    }

    if (cfg.id === "technology") {
      const morph = STEAM_ALGORITHMS.createMorphMesh(0xffd60a);
      morph.position.set(-0.55, 1.0, -0.35);
      g.add(morph);
      d.morph = morph;

      // Robot curioso
      const robot = new THREE.Group();
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.48, 0.3), stdMat(0xadb5bd, { metalness: 0.55, roughness: 0.3 }));
      body.position.y = 0.45;
      const headR = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.32, 0.34), stdMat(0xdee2e6, { metalness: 0.55, roughness: 0.25 }));
      headR.position.y = 0.84;
      const eyeStrip = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.08, 0.02), new THREE.MeshStandardMaterial({ color: 0x00f5d4, emissive: 0x00f5d4, emissiveIntensity: 1.0 }));
      eyeStrip.position.set(0, 0.86, 0.18);
      const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.2, 5), stdMat(0x6c757d, { metalness: 0.6 }));
      antenna.position.y = 1.08;
      const tip = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 6), new THREE.MeshStandardMaterial({ color: 0xff006e, emissive: 0xff006e, emissiveIntensity: 1.1 }));
      tip.position.y = 1.2;
      robot.add(body, headR, eyeStrip, antenna, tip);
      robot.position.set(1.25, 0.2, 0.85);
      robot.rotation.y = -0.5;
      g.add(robot);

      // Pantallas holográficas flotantes con "código"
      const codeCanvas = document.createElement("canvas");
      codeCanvas.width = 256; codeCanvas.height = 160;
      const cc = codeCanvas.getContext("2d");
      cc.fillStyle = "#0b132b"; cc.fillRect(0, 0, 256, 160);
      cc.fillStyle = "#00f5d4";
      const codeLines = ["for i in píxeles:", "  vértices MoverCosos", "  if (niño.toca)", "    ¡aprender()!", "renderizar ISLA()"];
      cc.font = "16px monospace";
      codeLines.forEach(function (line, i) { cc.fillText(line, 14, 30 + i * 27); });
      const codeTex = new THREE.CanvasTexture(codeCanvas);
      [[-1.35, 1.5, -0.7, 0.45], [1.15, 1.75, -1.15, -0.4]].forEach(function (s) {
        const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.15, 0.72), new THREE.MeshStandardMaterial({ map: codeTex, emissive: 0xffffff, emissiveMap: codeTex, emissiveIntensity: 0.75, side: THREE.DoubleSide }));
        screen.position.set(s[0], s[1], s[2]);
        screen.rotation.y = s[3];
        g.add(screen);
      });

      // Torre de antena
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.09, 1.35, 6), stdMat(0x6c757d, { metalness: 0.5 }));
      mast.position.set(1.55, 0.9, -0.85);
      const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), new THREE.MeshStandardMaterial({ color: 0xff006e, emissive: 0xff006e, emissiveIntensity: 1.05 }));
      beacon.position.set(1.55, 1.62, -0.85);
      g.add(mast, beacon);
      g.add(createBush(-1.5, 1.1, 0x63e2b7));
    }

    if (cfg.id === "engineering") {
      // Grúa torre amarilla
      const crane = new THREE.Group();
      const mastC = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.1, 0.2), stdMat(0xffd60a, { roughness: 0.5 }));
      mastC.position.y = 1.05;
      const jib = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.14, 0.14), stdMat(0xffd60a, { roughness: 0.5 }));
      jib.position.set(0.62, 2.1, 0);
      const counter = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.3, 0.24), stdMat(0x6c757d));
      counter.position.set(-0.32, 2.06, 0);
      const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.85, 4), stdMat(0x343a40));
      cable.position.set(1.28, 1.68, 0);
      const hook = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.12), stdMat(0x495057, { metalness: 0.5 }));
      hook.position.set(1.28, 1.22, 0);
      crane.add(mastC, jib, counter, cable, hook);
      crane.position.set(-1.25, 0.2, -0.9);
      crane.rotation.y = 0.35;
      g.add(crane);

      // Engranajes decorativos
      const gearA = createGear(0.34, 0xff8500, 9);
      gearA.position.set(0.75, 0.33, 0.75);
      const gearB = createGear(0.26, 0xef476f, 7);
      gearB.position.set(1.32, 0.33, 1.18);
      g.add(gearA, gearB);
      d.spinGears = [gearA, gearB];

      // Cercha apoyada
      const truss = createTruss(3, 0.55, 1.9, 0xf77f00);
      truss.position.set(0.15, 0.32, -1.15);
      g.add(truss);
      // Vigas y conos de obra
      const beamStack = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.16, 0.3), stdMat(0xe9c46a));
      beamStack.position.set(-0.75, 0.3, 1.15);
      const beamStack2 = beamStack.clone();
      beamStack2.position.y = 0.47;
      beamStack2.rotation.y = 0.18;
      const cone1 = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.3, 7), stdMat(0xff6d00));
      cone1.position.set(1.35, 0.36, -0.75);
      g.add(beamStack, beamStack2, cone1);
    }

    if (cfg.id === "art") {
      // Caballete con lienzo
      const easel = new THREE.Group();
      [-0.32, 0.32].forEach(function (lx) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.35, 5), stdMat(0x9a6b4f));
        leg.position.set(lx, 0.62, 0);
        leg.rotation.z = lx > 0 ? -0.16 : 0.16;
        easel.add(leg);
      });
      const backLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.3, 5), stdMat(0x9a6b4f));
      backLeg.position.set(0, 0.6, -0.28);
      backLeg.rotation.x = 0.3;
      easel.add(backLeg);
      const canvasArt = new THREE.Mesh(new THREE.BoxGeometry(0.85, 1.0, 0.05), stdMat(0xfffdf5, { roughness: 0.9 }));
      canvasArt.position.set(0, 0.95, 0.06);
      const blob1 = new THREE.Mesh(new THREE.CircleGeometry(0.14, 10), new THREE.MeshBasicMaterial({ color: 0xef476f }));
      blob1.position.set(-0.14, 1.05, 0.09);
      const blob2 = new THREE.Mesh(new THREE.CircleGeometry(0.09, 10), new THREE.MeshBasicMaterial({ color: 0x06d6a0 }));
      blob2.position.set(0.18, 0.82, 0.09);
      const blob3 = new THREE.Mesh(new THREE.CircleGeometry(0.07, 10), new THREE.MeshBasicMaterial({ color: 0xffd60a }));
      blob3.position.set(0.02, 1.18, 0.09);
      easel.add(canvasArt, blob1, blob2, blob3);
      easel.position.set(-0.85, 0.2, -0.35);
      easel.rotation.y = 0.5;
      g.add(easel);

      // Paleta con manchas de pintura
      const palette = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.07, 16), stdMat(0xa98467, { roughness: 0.7 }));
      palette.position.set(0.85, 0.26, 0.75);
      g.add(palette);
      const paintColors = [0xef476f, 0xffd60a, 0x06d6a0, 0x118ab2, 0xffffff];
      paintColors.forEach(function (c, i) {
        const ang = (i / paintColors.length) * Math.PI * 2;
        const dab = new THREE.Mesh(new THREE.SphereGeometry(0.075, 8, 8), stdMat(c, { roughness: 0.35 }));
        dab.position.set(0.85 + Math.cos(ang) * 0.3, 0.32, 0.75 + Math.sin(ang) * 0.3);
        dab.scale.y = 0.55;
        g.add(dab);
      });

      // Tarro con pinceles
      const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.16, 0.34, 9), stdMat(0xdee2e6, { roughness: 0.3, transparent: true, opacity: 0.85 }));
      jar.position.set(1.35, 0.39, -0.85);
      g.add(jar);
      [[0xff006e, 0.2], [0x3a86ff, -0.15], [0x06d6a0, 0.05], [0xffd60a, -0.3]].forEach(function (p) {
        const brush = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.62, 5), stdMat(p[0]));
        brush.position.set(1.35 + p[1] * 0.4, 0.72, -0.85 + p[1] * 0.2);
        brush.rotation.z = p[1];
        g.add(brush);
      });

      // Charcos de pintura
      [[0xffbe0b, -1.35, 0.85, 0.28], [0x8338ec, 0.2, 1.35, 0.2]].forEach(function (p) {
        const splash = new THREE.Mesh(new THREE.CircleGeometry(p[3], 10).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: p[0], transparent: true, opacity: 0.9 }));
        splash.position.set(p[1], 0.215, p[2]);
        g.add(splash);
      });
    }

    if (cfg.id === "math") {
      const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.42, 14, 12), stdMat(0xff595e, { roughness: 0.35 }));
      sphere.position.set(-1.05, 0.62, -0.6);
      sphere.castShadow = true;
      const cube = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.66, 0.66), stdMat(0x3a86ff, { roughness: 0.4 }));
      cube.position.set(0.12, 0.54, -1.15);
      cube.rotation.y = 0.6;
      cube.rotation.x = 0.28;
      cube.castShadow = true;
      const cone = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.95, 10), stdMat(0xffbe0b, { roughness: 0.4 }));
      cone.position.set(1.2, 0.68, -0.35);
      cone.castShadow = true;
      const cylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.78, 12), stdMat(0x06d6a0, { roughness: 0.4 }));
      cylinder.position.set(-0.35, 0.59, 0.75);
      cylinder.castShadow = true;
      const pyramid = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.62, 4), stdMat(0xff70a6, { roughness: 0.4 }));
      pyramid.position.set(0.85, 0.51, 0.85);
      pyramid.rotation.y = 0.4;
      pyramid.castShadow = true;
      g.add(sphere, cube, cone, cylinder, pyramid);
      d.shapes = [sphere, cube, cone, cylinder, pyramid];
    }

    g.position.y = 0;
    return { group: g, refs: d };
  }

  /* ============ LABORATORIOS 3D (Modo A por tema) ============ */

  const DEMO_BUILDERS = {

    mixpaint: function () {
      const group = new THREE.Group();
      const palette = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.12, 20), stdMat(0xa98467));
      palette.position.y = 0.31;
      group.add(palette);
      const blueMarble = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 10), stdMat(0x1e6fd9, { roughness: 0.25 }));
      blueMarble.position.set(-0.85, 0.45, 0.35);
      const yellowMarble = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 10), stdMat(0xffd43b, { roughness: 0.25 }));
      yellowMarble.position.set(0.85, 0.45, 0.35);
      group.add(blueMarble, yellowMarble);
      const blobMat = stdMat(0x2b9348, { roughness: 0.25, emissive: 0x2b9348, emissiveIntensity: 0.4 });
      const blob = new THREE.Mesh(new THREE.SphereGeometry(0.52, 14, 12), blobMat);
      blob.position.y = 0.82;
      blob.scale.y = 0.9;
      blob.castShadow = true;
      group.add(blob);
      const cBlue = new THREE.Color(0x1e6fd9), cGreen = new THREE.Color(0x2b9348), cYellow = new THREE.Color(0xffd43b), tmp = new THREE.Color();
      return {
        group: group,
        update: function (v) {
          const t = v / 100;
          if (t < 0.5) tmp.lerpColors(cBlue, cGreen, t * 2); else tmp.lerpColors(cGreen, cYellow, (t - 0.5) * 2);
          blobMat.color.copy(tmp);
          blobMat.emissive.copy(tmp).multiplyScalar(0.55);
          blob.scale.setScalar(0.75 + t * 0.45);
          blob.scale.y = blob.scale.x * 0.9;
        }
      };
    },

    raster: function () {
      // El laboratorio de rasterización vive en el panel 2D (canvas Bresenham)
      return { group: new THREE.Group(), update: function () {} };
    },

    tower: function () {
      const group = new THREE.Group();
      const pieces = [];
      const plan = [
        { t: "cyl", r: 0.62, h: 0.3, c: 0xef476f }, { t: "box", s: 0.72, c: 0xffd60a }, { t: "cyl", r: 0.5, h: 0.26, c: 0x06d6a0 },
        { t: "box", s: 0.55, c: 0x118ab2 }, { t: "cyl", r: 0.42, h: 0.3, c: 0xff9f1c }, { t: "box", s: 0.45, c: 0x8338ec },
        { t: "cyl", r: 0.34, h: 0.24, c: 0xff70a6 }, { t: "box", s: 0.36, c: 0x3a86ff }, { t: "cone", r: 0.3, h: 0.42, c: 0x06d6a0 },
        { t: "cyl", r: 0.24, h: 0.2, c: 0xffd60a }, { t: "box", s: 0.24, c: 0xef476f }, { t: "cone", r: 0.16, h: 0.34, c: 0x118ab2 }
      ];
      let y = 0.2;
      plan.forEach(function (p) {
        let mesh;
        if (p.t === "cyl") mesh = new THREE.Mesh(new THREE.CylinderGeometry(p.r * 0.82, p.r, p.h, 12), stdMat(p.c, { roughness: 0.45 }));
        else if (p.t === "cone") mesh = new THREE.Mesh(new THREE.ConeGeometry(p.r, p.h, 9), stdMat(p.c, { roughness: 0.45 }));
        else mesh = new THREE.Mesh(new THREE.BoxGeometry(p.s, p.s * 0.62, p.s), stdMat(p.c, { roughness: 0.45 }));
        const hh = p.t === "box" ? p.s * 0.62 : p.h;
        mesh.position.set((Math.sin(pieces.length * 2.4) * 0.09), y + hh / 2, (Math.cos(pieces.length * 1.7) * 0.09));
        mesh.castShadow = true;
        group.add(mesh);
        pieces.push(mesh);
        y += hh + 0.015;
      });
      return {
        group: group,
        update: function (v) {
          const n = Math.max(1, Math.round(v));
          for (let i = 0; i < pieces.length; i += 1) pieces[i].visible = i < n;
        }
      };
    },

    lightangle: function () {
      const group = new THREE.Group();
      const table = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.68, 0.42, 10), stdMat(0x9a6b4f));
      table.position.y = 0.41;
      group.add(table);
      const apple = new THREE.Mesh(new THREE.SphereGeometry(0.34, 12, 10), stdMat(0xe5383b, { roughness: 0.3 }));
      apple.position.y = 0.92;
      apple.castShadow = true;
      group.add(apple);
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.16, 5), stdMat(0x6f4e37));
      stem.position.y = 1.24;
      group.add(stem);
      const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), new THREE.MeshStandardMaterial({ color: 0xffe066, emissive: 0xffd43b, emissiveIntensity: 0.95 }));
      group.add(lamp);
      const point = new THREE.PointLight(0xffe066, 1.15, 9);
      group.add(point);
      const shadowBlob = new THREE.Mesh(new THREE.CircleGeometry(0.42, 16).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0x1b1b1b, transparent: true, opacity: 0.34 }));
      shadowBlob.position.y = 0.222;
      group.add(shadowBlob);
      return {
        group: group,
        update: function (v) {
          const ang = THREE.MathUtils.degToRad(v);
          lamp.position.set(Math.sin(ang) * 1.75, 1.6 + Math.cos(ang) * 0.4, Math.cos(ang) * 1.75);
          point.position.copy(lamp.position);
          shadowBlob.position.set(-Math.sin(ang) * 0.62, 0.222, -Math.cos(ang) * 0.62);
          shadowBlob.scale.setScalar(1 + Math.abs(Math.sin(ang)) * 0.9);
        }
      };
    },

    symmetry: function () {
      const group = new THREE.Group();
      const bodyGeo = (typeof THREE.CapsuleGeometry === "function") ? new THREE.CapsuleGeometry(0.09, 0.5, 4, 8) : new THREE.CylinderGeometry(0.09, 0.09, 0.62, 8);
      const body = new THREE.Mesh(bodyGeo, stdMat(0x343a40));
      body.position.y = 0.72;
      group.add(body);
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 8), stdMat(0x343a40));
      head.position.y = 1.12;
      group.add(head);
      const wingMat = stdMat(0xff8fab, { roughness: 0.35, emissive: 0xff5d8f, emissiveIntensity: 0.25, side: THREE.DoubleSide });
      const wingGeo = new THREE.SphereGeometry(0.55, 10, 8);
      wingGeo.scale(1, 0.42, 0.1);
      const wingL = new THREE.Mesh(wingGeo, wingMat);
      wingL.position.set(0.5, 0.82, 0);
      const wingR = new THREE.Mesh(wingGeo, wingMat);
      wingR.position.set(-0.5, 0.82, 0);
      group.add(wingL, wingR);
      // Eje de simetría visible (línea punteada dorada)
      const axisMat = new THREE.MeshBasicMaterial({ color: 0xffd43b });
      for (let i = 0; i < 6; i += 1) {
        const dash = new THREE.Mesh(new THREE.SphereGeometry(0.028, 5, 5), axisMat);
        dash.position.set(0, 0.35 + i * 0.17, 0);
        group.add(dash);
      }
      return {
        group: group,
        update: function (v) {
          const open = THREE.MathUtils.lerp(1.15, 0.06, v / 100);
          wingL.rotation.y = open;
          wingR.rotation.y = -open;
          wingL.position.x = 0.5 * Math.cos(open * 0.55);
          wingR.position.x = -0.5 * Math.cos(open * 0.55);
        }
      };
    },

    shapes: function () {
      const group = new THREE.Group();
      const solids = [
        new THREE.Mesh(new THREE.SphereGeometry(0.62, 16, 12), stdMat(0xff595e, { roughness: 0.3 })),
        new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.9), stdMat(0x3a86ff, { roughness: 0.35 })),
        new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.15, 12), stdMat(0xffbe0b, { roughness: 0.35 })),
        new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 1.0, 14), stdMat(0x06d6a0, { roughness: 0.35 }))
      ];
      solids.forEach(function (s) { s.position.y = 0.95; s.castShadow = true; group.add(s); });
      const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.05, 0.22, 14), stdMat(0xe9ecef));
      pedestal.position.y = 0.31;
      group.add(pedestal);
      return {
        group: group,
        update: function (v, t) {
          const idx = Math.max(0, Math.min(3, Math.round(v)));
          solids.forEach(function (s, i) { s.visible = i === idx; });
          const s = solids[idx];
          s.rotation.y = (t || 0) * 0.6;
        },
        tick: function (t) { solids.forEach(function (s) { s.rotation.y = t * 0.6; }); }
      };
    },

    balance: function () {
      const group = new THREE.Group();
      const stand = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.6, 4), stdMat(0x6c757d, { metalness: 0.3 }));
      stand.position.y = 0.5;
      group.add(stand);
      const beam = new THREE.Group();
      const bar = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.11, 0.22), stdMat(0xffd60a, { metalness: 0.2 }));
      beam.add(bar);
      const panGeo = new THREE.CylinderGeometry(0.36, 0.3, 0.07, 12);
      const panL = new THREE.Mesh(panGeo, stdMat(0xadb5bd, { metalness: 0.4 }));
      panL.position.set(-1.18, -0.28, 0);
      const panR = panL.clone();
      panR.position.x = 1.18;
      beam.add(panL, panR);
      beam.position.y = 0.88;
      group.add(beam);
      function stackCubes(pan, count) {
        const cubes = [];
        for (let i = 0; i < count; i += 1) {
          const cube = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.17, 0.19), stdMat(i % 2 ? 0x3a86ff : 0xff595e, { roughness: 0.4 }));
          cube.position.set(pan.position.x + ((i % 3) - 1) * 0.2, -0.16 + Math.floor(i / 3) * 0.18, ((i * 7) % 3 - 1) * 0.14);
          beam.add(cube);
          cubes.push(cube);
        }
        return cubes;
      }
      let leftCubes = stackCubes(panL, 5);
      const rightCubes = stackCubes(panR, 5);
      rightCubes.forEach(function (c) { c.material = stdMat(0x06d6a0, { roughness: 0.4 }); });
      const state = { left: 5 };
      return {
        group: group,
        update: function (v) {
          const n = Math.round(v);
          if (n === state.left) { beam.rotation.z = (5 - n) * 0.055; return; }
          state.left = n;
          leftCubes.forEach(function (c) { beam.remove(c); });
          leftCubes = stackCubes(panL, n);
          beam.rotation.z = (5 - n) * 0.055;
        }
      };
    },

    pattern: function () {
      const group = new THREE.Group();
      const railBase = new THREE.Mesh(new THREE.BoxGeometry(3.1, 0.06, 0.5), stdMat(0x6c757d));
      railBase.position.y = 0.26;
      group.add(railBase);
      const cubes = [];
      for (let i = 0; i < 8; i += 1) {
        const isRed = i % 2 === 0;
        const cube = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.34, 0.34), stdMat(isRed ? 0xef476f : 0x3a86ff, { roughness: 0.4, emissive: isRed ? 0xef476f : 0x3a86ff, emissiveIntensity: 0 }));
        cube.position.set(-1.22 + i * 0.35, 0.46, 0);
        cube.castShadow = true;
        cubes.push(cube);
        group.add(cube);
      }
      const state = { shown: 5 };
      return {
        group: group,
        update: function (v) {
          state.shown = Math.max(2, Math.round(v));
          cubes.forEach(function (c, i) { c.visible = i < state.shown; });
        },
        tick: function (t) {
          const next = cubes[state.shown - 1];
          cubes.forEach(function (c) { c.material.emissiveIntensity = 0; });
          if (next) next.material.emissiveIntensity = 0.4 + 0.35 * Math.sin(t * 5);
        }
      };
    },

    pizza: function () {
      const group = new THREE.Group();
      const plate = new THREE.Mesh(new THREE.CylinderGeometry(1.02, 1.02, 0.06, 24), stdMat(0xf8f9fa, { roughness: 0.3 }));
      plate.position.y = 0.24;
      group.add(plate);
      const sliceGroup = new THREE.Group();
      sliceGroup.position.y = 0.31;
      group.add(sliceGroup);
      let current = 0;
      function buildSlices(n) {
        while (sliceGroup.children.length) {
          const child = sliceGroup.children[0];
          sliceGroup.remove(child);
          if (child.geometry) child.geometry.dispose();
        }
        const sliceAngle = (Math.PI * 2) / n;
        for (let i = 0; i < n; i += 1) {
          const isHero = i === 0;
          const geo = new THREE.CylinderGeometry(0.88, 0.88, 0.14, 12, 1, false, i * sliceAngle, sliceAngle - 0.04);
          const mesh = new THREE.Mesh(geo, stdMat(isHero ? 0xff922b : (i % 2 ? 0xffd43b : 0xffe066), { roughness: 0.45 }));
          mesh.castShadow = true;
          sliceGroup.add(mesh);
        }
        current = n;
      }
      buildSlices(4);
      return {
        group: group,
        update: function (v) { buildSlices(Math.max(2, Math.round(v))); }
      };
    },

    ruler: function () {
      const group = new THREE.Group();
      const ruler = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.05, 0.3), new THREE.MeshStandardMaterial({ color: 0xffe066, transparent: true, opacity: 0.88, roughness: 0.3 }));
      ruler.position.y = 0.26;
      group.add(ruler);
      for (let i = 0; i <= 10; i += 1) {
        const mark = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.06, i % 5 === 0 ? 0.26 : 0.15), new THREE.MeshBasicMaterial({ color: 0x6a040f }));
        mark.position.set(-1.05 + i * 0.21, 0.3, 0);
        group.add(mark);
      }
      const pencil = new THREE.Group();
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 1.0, 8).rotateZ(Math.PI / 2), stdMat(0xffb703));
      const tipWood = new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.22, 8).rotateZ(-Math.PI / 2), stdMat(0xffe8c2));
      tipWood.position.x = 0.61;
      const graphite = new THREE.Mesh(new THREE.ConeGeometry(0.028, 0.09, 6).rotateZ(-Math.PI / 2), stdMat(0x212529));
      graphite.position.x = 0.72;
      const eraser = new THREE.Mesh(new THREE.CylinderGeometry(0.078, 0.078, 0.1, 8).rotateZ(Math.PI / 2), stdMat(0xff8fab));
      eraser.position.x = -0.55;
      pencil.add(shaft, tipWood, graphite, eraser);
      pencil.position.set(0, 0.55, 0);
      group.add(pencil);
      return {
        group: group,
        update: function (v) {
          pencil.scale.set(Math.max(0.12, v / 45), 1, 1);
        }
      };
    },

    sunlight: function () {
      const group = new THREE.Group();
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.085, 0.85, 7), stdMat(0x2b9348));
      stem.position.y = 0.62;
      group.add(stem);
      const leafMat = stdMat(0x40c057, { roughness: 0.5, emissive: 0x2b9348, emissiveIntensity: 0.4 });
      [-1, 1].forEach(function (side) {
        const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 6), leafMat);
        leaf.scale.set(1.5, 0.5, 0.7);
        leaf.position.set(side * 0.26, 0.6, 0);
        leaf.rotation.z = side * 0.5;
        group.add(leaf);
      });
      const flowerCenter = new THREE.Mesh(new THREE.SphereGeometry(0.17, 10, 8), stdMat(0xffb703, { roughness: 0.4 }));
      flowerCenter.position.y = 1.14;
      group.add(flowerCenter);
      for (let i = 0; i < 9; i += 1) {
        const ang = (i / 9) * Math.PI * 2;
        const petal = new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.24, 5), stdMat(0xff70a6, { roughness: 0.4 }));
        petal.position.set(Math.cos(ang) * 0.24, 1.14 + Math.sin(ang) * 0.24, 0);
        petal.rotation.z = ang - Math.PI / 2;
        group.add(petal);
      }
      const sunMesh = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 10), new THREE.MeshStandardMaterial({ color: 0xffe066, emissive: 0xffd43b, emissiveIntensity: 1.25 }));
      sunMesh.position.y = 3.1;
      group.add(sunMesh);
      const point = new THREE.PointLight(0xffe066, 1.2, 12);
      point.position.copy(sunMesh.position);
      group.add(point);
      return {
        group: group,
        update: function (v) {
          const t = v / 100;
          point.intensity = 0.15 + t * 1.7;
          sunMesh.position.y = 2.15 + t * 1.35;
          point.position.copy(sunMesh.position);
          leafMat.emissiveIntensity = 0.12 + t * 1.0;
          flowerCenter.scale.setScalar(0.75 + t * 0.45);
        }
      };
    },

    lsystem: function () {
      const group = new THREE.Group();
      let tree = null;
      function rebuild(iterations) {
        if (tree) {
          group.remove(tree);
          tree.traverse(function (node) { if (node.geometry) node.geometry.dispose(); });
        }
        tree = STEAM_ALGORITHMS.buildLSystemTree(iterations, { color: 0x2b9348, trunkColor: 0x7f5539, step: 0.34, angleDeg: 25 });
        tree.scale.set(0.92, 0.92, 0.92);
        tree.position.y = 0.18;
        group.add(tree);
      }
      rebuild(2);
      return {
        group: group,
        update: function (v) { rebuild(Math.max(1, Math.min(3, Math.round(v)))); }
      };
    },

    watercycle: function () {
      const group = new THREE.Group();
      const discMat = new THREE.MeshStandardMaterial({ color: 0x4dabf7, roughness: 0.2, transparent: true, opacity: 0.94 });
      const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.06, 18), discMat);
      disc.position.y = 0.24;
      group.add(disc);
      const ice = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.5, 0.62), stdMat(0xa5d8ff, { roughness: 0.15, transparent: true, opacity: 0.95 }));
      ice.position.y = 0.5;
      group.add(ice);
      const droplet = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 10), stdMat(0x228be6, { roughness: 0.15 }));
      droplet.position.y = 0.66;
      group.add(droplet);
      const steam = [];
      for (let i = 0; i < 5; i += 1) {
        const puff = new THREE.Mesh(new THREE.SphereGeometry(0.09 + Math.random() * 0.05, 7, 7), new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 }));
        puff.position.set((Math.sin(i * 2.3) * 0.35), 0.55 + i * 0.18, (Math.cos(i * 1.9) * 0.35));
        group.add(puff);
        steam.push(puff);
      }
      const cloudGroup = new THREE.Group();
      [[0, 0, 0, 0.34], [-0.32, -0.03, 0.05, 0.24], [0.32, -0.02, -0.03, 0.25]].forEach(function (p) {
        const puff = new THREE.Mesh(new THREE.SphereGeometry(p[3], 8, 7), new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 }));
        puff.position.set(p[0], p[1], p[2]);
        cloudGroup.add(puff);
      });
      cloudGroup.position.y = 1.75;
      group.add(cloudGroup);
      const state = { steamPhase: 0 };
      return {
        group: group,
        update: function (v) {
          const t = v / 100;
          ice.visible = v < 34;
          ice.scale.setScalar(Math.max(0.25, 1 - Math.max(0, v - 12) / 26));
          droplet.visible = v >= 28 && v <= 72;
          steam.forEach(function (p) { p.visible = v > 60; });
          cloudGroup.children.forEach(function (p) { p.material.opacity = 0.25 + t * 0.68; });
          discMat.color.lerpColors(new THREE.Color(0xa5d8ff), new THREE.Color(0x1c7ed6), t);
          discMat.opacity = 0.95 - t * 0.45;
          disc.scale.set(1 - t * 0.35, 1, 1 - t * 0.35);
        },
        tick: function (time) {
          steam.forEach(function (p, i) {
            if (!p.visible) return;
            p.position.y = 0.55 + ((time * 0.55 + i * 0.28) % 1.05);
            p.material.opacity = Math.max(0.05, 0.9 - ((time * 0.55 + i * 0.28) % 1.05) * 0.85);
          });
          cloudGroup.position.x = Math.sin(time * 0.7) * 0.12;
        }
      };
    },

    orbit: function () {
      const group = new THREE.Group();
      const sun = new THREE.Mesh(new THREE.SphereGeometry(0.42, 12, 10), new THREE.MeshStandardMaterial({ color: 0xffe066, emissive: 0xffd43b, emissiveIntensity: 1.25 }));
      sun.position.y = 0.95;
      group.add(sun);
      const halo = new THREE.Mesh(new THREE.TorusGeometry(1.28, 0.014, 6, 40).rotateX(Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 }));
      halo.position.y = 0.95;
      group.add(halo);
      const pivot = new THREE.Group();
      pivot.position.y = 0.95;
      const earth = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 10), stdMat(0x228be6, { roughness: 0.35, emissive: 0x0b7285, emissiveIntensity: 0.4 }));
      earth.position.set(1.28, 0, 0);
      earth.castShadow = true;
      const moonPivot = new THREE.Group();
      earth.add(moonPivot);
      const moon = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), stdMat(0xdee2e6));
      moon.position.set(0.34, 0, 0);
      moonPivot.add(moon);
      pivot.add(earth);
      group.add(pivot);
      const state = { speed: 4, lastT: 0 };
      return {
        group: group,
        update: function (v) { state.speed = v; },
        tick: function (time) {
          const dt = Math.min(0.05, Math.max(0.005, time - (state.lastT || time)));
          state.lastT = time;
          pivot.rotation.y += dt * state.speed * 0.9;
          moonPivot.rotation.y += dt * state.speed * 3.2;
          earth.rotation.y += dt * state.speed * 1.4;
        }
      };
    },

    morph: function () {
      const group = new THREE.Group();
      const mesh = STEAM_ALGORITHMS.createMorphMesh(0xffd60a);
      mesh.position.y = 1.02;
      group.add(mesh);
      const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.9, 0.16, 12), stdMat(0x212529, { roughness: 0.4, metalness: 0.3 }));
      pedestal.position.y = 0.29;
      group.add(pedestal);
      return {
        group: group,
        update: function (v) { STEAM_ALGORITHMS.setMorphAmount(mesh, v / 100); },
        tick: function (time) { mesh.rotation.y = time * 0.5; }
      };
    },

    pixels: function () {
      const group = new THREE.Group();
      const panel = new THREE.Mesh(new THREE.BoxGeometry(1.85, 1.85, 0.1), stdMat(0x212529, { roughness: 0.35, metalness: 0.35 }));
      panel.position.y = 1.18;
      group.add(panel);
      const frame = new THREE.Mesh(new THREE.TorusGeometry(1.32, 0.045, 6, 4), stdMat(0x495057, { metalness: 0.6, roughness: 0.3 }));
      frame.position.y = 1.18;
      frame.rotation.z = Math.PI / 4;
      group.add(frame);
      const gridGroup = new THREE.Group();
      gridGroup.position.set(0, 1.18, 0.085);
      group.add(gridGroup);
      const palette = [0xff3b3b, 0x2bff6a, 0x3b82ff, 0xffffff, 0x121212, 0xffe93b];
      const weights  = [2, 2, 2, 1, 2, 1];
      function weightedPick() {
        let total = 0, i;
        for (i = 0; i < weights.length; i += 1) total += weights[i];
        let r = Math.random() * total;
        for (i = 0; i < weights.length; i += 1) { r -= weights[i]; if (r <= 0) return palette[i]; }
        return palette[0];
      }
      function buildGrid(n) {
        while (gridGroup.children.length) {
          const child = gridGroup.children[0];
          gridGroup.remove(child);
          if (child.geometry) child.geometry.dispose();
        }
        const cell = 1.6 / n;
        for (let row = 0; row < n; row += 1) {
          for (let col = 0; col < n; col += 1) {
            const color = weightedPick();
            const pixel = new THREE.Mesh(new THREE.BoxGeometry(cell * 0.82, cell * 0.82, 0.045), new THREE.MeshStandardMaterial({ color: color, emissive: color, emissiveIntensity: color === 0x121212 ? 0.05 : 0.85, roughness: 0.4 }));
            pixel.position.set(-0.8 + cell * (col + 0.5), 0.8 - cell * (row + 0.5), 0);
            gridGroup.add(pixel);
          }
        }
      }
      buildGrid(6);
      const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.14, 0.55, 8), stdMat(0x343a40, { metalness: 0.5 }));
      stand.position.y = 0.46;
      group.add(stand);
      return {
        group: group,
        update: function (v) { buildGrid(Math.max(2, Math.min(12, Math.round(v)))); }
      };
    },

    robot: function () {
      const group = new THREE.Group();
      for (let i = 0; i < 7; i += 1) {
        const dot = new THREE.Mesh(new THREE.CircleGeometry(0.075, 10).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 }));
        dot.position.set(-1.5 + i * 0.5, 0.218, 0);
        group.add(dot);
      }
      const flag = new THREE.Group();
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.75, 6), stdMat(0x6c757d));
      pole.position.y = 0.375;
      const flagCloth = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.18, 0.02), stdMat(0x06d6a0, { emissive: 0x06d6a0, emissiveIntensity: 0.6 }));
      flagCloth.position.set(0.17, 0.62, 0);
      flag.add(pole, flagCloth);
      flag.position.set(1.62, 0.2, 0);
      group.add(flag);
      const robotG = new THREE.Group();
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.44, 0.3), stdMat(0x3a86ff, { metalness: 0.4, roughness: 0.3 }));
      body.position.y = 0.52;
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.26, 0.3), stdMat(0x4dabf7, { metalness: 0.4, roughness: 0.3 }));
      head.position.y = 0.88;
      const visor = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.07, 0.02), new THREE.MeshStandardMaterial({ color: 0xffe066, emissive: 0xffd43b, emissiveIntensity: 0.95 }));
      visor.position.set(0, 0.89, 0.16);
      const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.16, 5), stdMat(0x212529));
      antenna.position.y = 1.08;
      robotG.add(body, head, visor, antenna);
      robotG.position.set(-1.5, 0.2, 0);
      robotG.rotation.y = Math.PI / 2;
      group.add(robotG);
      return {
        group: group,
        update: function (v) {
          const t = Math.max(0, Math.min(1, v / 6));
          robotG.position.x = -1.5 + t * 3.0;
        },
        tick: function (time) { robotG.position.y = 0.2 + Math.abs(Math.sin(time * 6)) * 0.045; }
      };
    },

    proximity: function () {
      const group = new THREE.Group();
      const robotG = new THREE.Group();
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.5, 0.32), stdMat(0xef476f, { metalness: 0.35, roughness: 0.35 }));
      body.position.y = 0.5;
      const head = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.2, 0.28, 10), stdMat(0xff8fa3, { metalness: 0.35 }));
      head.position.y = 0.88;
      const led = new THREE.Mesh(new THREE.SphereGeometry(0.085, 8, 8), new THREE.MeshStandardMaterial({ color: 0x40c057, emissive: 0x2b9348, emissiveIntensity: 1.25 }));
      led.position.y = 1.1;
      robotG.add(body, head, led);
      robotG.position.set(-1.35, 0.2, 0);
      robotG.rotation.y = Math.PI / 2;
      group.add(robotG);
      const laserMat = new THREE.MeshBasicMaterial({ color: 0xff006e, transparent: true, opacity: 0.75 });
      const laser = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1, 6).rotateZ(Math.PI / 2), laserMat);
      laser.position.set(-0.6, 0.72, 0);
      group.add(laser);
      const obstacle = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.72, 0.42), stdMat(0xff9f1c, { roughness: 0.6 }));
      obstacle.position.y = 0.56;
      obstacle.castShadow = true;
      group.add(obstacle);
      return {
        group: group,
        update: function (v) {
          const t = (v - 5) / 95; // 0 cerca → 1 lejos
          const ox = -0.82 + t * 1.95;
          obstacle.position.set(ox, 0.56, 0);
          const robotNose = -1.14;
          const length = Math.max(0.08, ox - 0.21 - robotNose);
          laser.scale.x = length;
          laser.position.set(robotNose + length / 2, 0.72, 0);
          const ledColor = v < 30 ? 0xe5383b : (v < 60 ? 0xffd43b : 0x40c057);
          led.material.color.setHex(ledColor);
          led.material.emissive.setHex(ledColor);
        },
        tick: function (time) { led.scale.setScalar(1 + 0.22 * Math.sin(time * 6)); }
      };
    },

    lod: function () {
      const group = new THREE.Group();
      const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.95, 0.18, 14), stdMat(0x212529, { metalness: 0.4 }));
      pedestal.position.y = 0.29;
      group.add(pedestal);
      let solidMesh = null;
      let wireMesh = null;
      function build(detail) {
        if (solidMesh) { group.remove(solidMesh); solidMesh.geometry.dispose(); }
        if (wireMesh) { group.remove(wireMesh); wireMesh.geometry.dispose(); }
        const geo = new THREE.IcosahedronGeometry(0.72, detail);
        solidMesh = new THREE.Mesh(geo, new THREE.MeshNormalMaterial({ flatShading: true }));
        solidMesh.position.y = 1.15;
        wireMesh = new THREE.Mesh(geo.clone(), new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.3 }));
        wireMesh.position.y = 1.15;
        wireMesh.scale.setScalar(1.004);
        group.add(solidMesh, wireMesh);
      }
      build(2);
      return {
        group: group,
        update: function (v) { build(Math.max(0, Math.min(4, Math.round(v)))); },
        tick: function (time) { if (solidMesh) { solidMesh.rotation.y = time * 0.5; wireMesh.rotation.y = time * 0.5; } }
      };
    },

    truss: function () {
      const group = new THREE.Group();
      const supports = new THREE.Group();
      [-1.15, 1.15].forEach(function (x) {
        const pier = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 0.5, 8), stdMat(0x868e96));
        pier.position.set(x, 0.45, 0);
        supports.add(pier);
      });
      group.add(supports);
      let truss = null;
      function build(bays) {
        if (truss) {
          group.remove(truss);
          truss.traverse(function (n) { if (n.geometry) n.geometry.dispose(); });
        }
        truss = createTruss(bays, 0.66, 2.7, 0xf77f00);
        truss.position.set(0, 0.72, 0);
        group.add(truss);
      }
      build(4);
      return {
        group: group,
        update: function (v) { build(Math.max(2, Math.min(6, Math.round(v)))); }
      };
    },

    pillars: function () {
      const group = new THREE.Group();
      const river = new THREE.Mesh(new THREE.BoxGeometry(3.1, 0.03, 0.9), new THREE.MeshStandardMaterial({ color: 0x4dabf7, transparent: true, opacity: 0.75, roughness: 0.15 }));
      river.position.y = 0.22;
      group.add(river);
      const pillars = [];
      const positions = [[-0.95, -0.28], [-0.95, 0.28], [0.95, -0.28], [0.95, 0.28]];
      positions.forEach(function (p) {
        const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.21, 1, 9), stdMat(0xadb5bd, { roughness: 0.7 }));
        pillar.position.set(p[0], 0.7, p[1]);
        pillar.castShadow = true;
        group.add(pillar);
        pillars.push(pillar);
      });
      const deck = new THREE.Group();
      const road = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.12, 1.15), stdMat(0x495057, { roughness: 0.85 }));
      road.castShadow = true;
      deck.add(road);
      for (let i = -1; i <= 1; i += 1) {
        const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.02, 0.08), new THREE.MeshBasicMaterial({ color: 0xffffff }));
        stripe.position.set(i * 0.95, 0.07, 0);
        deck.add(stripe);
      }
      group.add(deck);
      return {
        group: group,
        update: function (v) {
          const h = Math.max(0.45, v / 10);
          pillars.forEach(function (p) {
            p.scale.y = h;
            p.position.y = 0.24 + h / 2;
          });
          deck.position.y = 0.24 + h + 0.06;
        }
      };
    },

    gears: function () {
      const group = new THREE.Group();
      const gearA = createGear(0.5, 0xff8500, 10);
      gearA.position.set(-0.52, 0.35, 0);
      const gearB = createGear(0.36, 0xef476f, 8);
      gearB.position.set(0.42, 0.35, 0);
      gearB.rotation.y = Math.PI / 8;
      group.add(gearA, gearB);
      const base = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.1, 1.0), stdMat(0x495057, { metalness: 0.35 }));
      base.position.y = 0.24;
      group.add(base);
      const state = { speed: 0.5 };
      return {
        group: group,
        update: function (v) { state.speed = Math.max(0.05, v / 9); },
        tick: function (time) {
          gearA.rotation.y = time * state.speed * 1.6;
          gearB.rotation.y = -time * state.speed * (10 / 8) * 1.6 + Math.PI / 8;
        }
      };
    },

    lever: function () {
      const group = new THREE.Group();
      const fulcrum = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.55, 4), stdMat(0x868e96, { metalness: 0.35 }));
      fulcrum.position.y = 0.47;
      fulcrum.rotation.y = Math.PI / 4;
      group.add(fulcrum);
      const beam = new THREE.Group();
      const bar = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.11, 0.22), stdMat(0xa47148, { roughness: 0.7 }));
      beam.add(bar);
      const load = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.42, 0.4), stdMat(0x343a40, { roughness: 0.6 }));
      load.position.set(0.92, 0.27, 0);
      load.castShadow = true;
      beam.add(load);
      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 8), stdMat(0xffd166, { emissive: 0xffb703, emissiveIntensity: 0.4 }));
      hand.position.set(-0.92, 0.12, 0);
      beam.add(hand);
      beam.position.y = 0.8;
      group.add(beam);
      return {
        group: group,
        update: function (v) {
          beam.rotation.z = THREE.MathUtils.degToRad((5 - v) * 3.4);
          hand.position.x = -0.4 - (v / 10) * 0.75;
        }
      };
    },

    car: function () {
      const group = new THREE.Group();
      const track = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.03, 0.95), stdMat(0x343a40, { roughness: 0.9 }));
      track.position.y = 0.215;
      group.add(track);
      for (let i = -1; i <= 1; i += 1) {
        const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.032, 0.06), new THREE.MeshBasicMaterial({ color: 0xffffff }));
        stripe.position.set(i * 1.05, 0.225, 0);
        group.add(stripe);
      }
      const carG = new THREE.Group();
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.18, 0.4), stdMat(0xe5383b, { roughness: 0.25, metalness: 0.3 }));
      body.position.y = 0.4;
      const nose = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.34, 4).rotateZ(-Math.PI / 2).rotateY(Math.PI / 4), stdMat(0xe5383b, { roughness: 0.25, metalness: 0.3 }));
      nose.position.set(0.52, 0.4, 0);
      nose.scale.set(1, 0.62, 1.05);
      const cabin = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.15, 0.34), stdMat(0x343a40, { roughness: 0.2 }));
      cabin.position.set(-0.08, 0.56, 0);
      const spoiler = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.04, 0.46), stdMat(0x212529));
      spoiler.position.set(-0.42, 0.56, 0);
      carG.add(body, nose, cabin, spoiler);
      const wheelGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.07, 12).rotateX(Math.PI / 2);
      const wheels = [];
      [[0.28, 0.22], [0.28, -0.22], [-0.28, 0.22], [-0.28, -0.22]].forEach(function (p) {
        const wheel = new THREE.Mesh(wheelGeo, stdMat(0x212529, { roughness: 0.8 }));
        wheel.position.set(p[0], 0.33, p[1]);
        carG.add(wheel);
        wheels.push(wheel);
      });
      carG.position.set(-1.1, 0, 0);
      group.add(carG);
      const state = { x: -1.1, dir: 1, speed: 0.6 };
      return {
        group: group,
        update: function (v) { state.speed = 0.15 + (v / 100) * 1.15; },
        tick: function () {
          state.x += state.dir * 0.018 * state.speed;
          if (state.x > 1.25) { state.x = 1.25; state.dir = -1; }
          if (state.x < -1.25) { state.x = -1.25; state.dir = 1; }
          carG.position.x = state.x;
          carG.rotation.y = state.dir > 0 ? 0 : Math.PI;
          wheels.forEach(function (w) { w.rotation.z -= state.dir * 0.09 * state.speed; });
        }
      };
    }
  };

  /* ============ Construcción del mundo ============ */

  function buildWorld(scene) {
    const worldGroup = new THREE.Group();
    const islands = [];
    const shaders = [];
    const floaters = [];

    // ---- HUB CENTRAL
    const hub = createIslandBase(4.1, COLORS.hub, 2.1);
    hub.position.set(0, 0, 0);
    worldGroup.add(hub);

    // Sendero de arena
    const path = new THREE.Mesh(new THREE.CircleGeometry(1.35, 18).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: COLORS.hubPath, roughness: 0.95 }));
    path.position.y = 0.215;
    path.receiveShadow = true;
    worldGroup.add(path);

    // Casa de Pío
    const house = createHubHouse();
    house.position.set(2.25, 0.2, -2.35);
    house.rotation.y = Math.PI / 5;
    worldGroup.add(house);

    // Árboles y vegetación del Hub
    worldGroup.add(createBlockyTree(-1.95, -1.6, 1.15));
    worldGroup.add(createBlockyTree(2.15, 1.35, 0.95));
    worldGroup.add(createBlockyTree(-2.35, 1.7, 0.8));
    worldGroup.add(createBush(1.15, -2.5, 0xff8fab));
    worldGroup.add(createBush(-2.75, 0.15, 0x74c69d));
    worldGroup.add(createBush(0.4, 2.6, 0x95d5b2));
    worldGroup.add(createFlower(-1.1, 2.35, 0xff70a6));
    worldGroup.add(createFlower(2.75, 0.35, 0xffd60a));
    worldGroup.add(createFlower(-0.55, -2.55, 0xb8a7f9));

    // Signpost "¡Elige tu isla!"
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.15, 6), stdMat(COLORS.wood));
    post.position.set(-1.15, 0.75, 0.35);
    const sign = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.34, 0.07), stdMat(0xffe8a3, { roughness: 0.7 }));
    sign.position.set(-1.15, 1.32, 0.35);
    sign.rotation.y = -0.35;
    worldGroup.add(post, sign);

    // ---- MASCOTA PÍO
    const mascot = createMascot();
    mascot.position.set(0.4, 0.2, 0.9);
    mascot.rotation.y = Math.PI / 6;
    worldGroup.add(mascot);

    // ---- ISLAS + PUENTES + ETIQUETAS
    ISLAND_DEFS.forEach(function (cfg) {
      const isl = createIslandBase(2.85, cfg.color, 1.9);
      isl.position.set(cfg.x, 0.35, cfg.z);
      isl.userData = {
        id: cfg.id,
        name: cfg.longName,
        shortName: cfg.name,
        type: "island",
        restY: 0.35,
        bobPhase: Math.random() * Math.PI * 2,
        lookPoint: new THREE.Vector3(cfg.x, 1.35, cfg.z),
        demos: {},
        activeDemo: null
      };

      // Anillo de éxito con shader GLSL (se enciende al completar el quiz)
      const successShader = STEAM_ALGORITHMS.createSuccessShader(cfg.beam);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(2.92, 0.13, 8, 40).rotateX(Math.PI / 2), successShader);
      ring.position.y = 0.22;
      isl.add(ring);
      isl.userData.successShader = successShader;
      shaders.push(successShader);

      // Props decorativas por isla
      const props = buildDefaultProps(cfg);
      isl.add(props.group);
      isl.userData.defaultProps = props.group;
      isl.userData.defaultRefs = props.refs;

      // Etiqueta flotante con el nombre
      const label = createLabelSprite(cfg.name, cfg.labelColor);
      label.position.set(0, 3.15, 0);
      isl.add(label);
      isl.userData.label = label;

      worldGroup.add(isl);
      worldGroup.add(createBridge(0, 0, cfg.x, cfg.z, cfg.beam));
      islands.push(isl);
      floaters.push(isl);
    });

    // ---- NUBES
    const cloudRing = new THREE.Group();
    for (let i = 0; i < 9; i += 1) {
      const cloud = createCloud(0.8 + Math.random() * 0.75);
      const ang = (i / 9) * Math.PI * 2 + Math.random() * 0.5;
      const radius = 13 + Math.random() * 7;
      cloud.position.set(Math.cos(ang) * radius, 5.6 + Math.random() * 3.4, Math.sin(ang) * radius);
      cloudRing.add(cloud);
    }
    worldGroup.add(cloudRing);

    // ---- SOL + halo
    const sunMesh = new THREE.Mesh(new THREE.SphereGeometry(2.0, 14, 12), new THREE.MeshBasicMaterial({ color: 0xfff3b0 }));
    sunMesh.position.set(-17, 13.5, -14);
    worldGroup.add(sunMesh);
    const sunGlow = createGlowSprite("rgba(255,244,180,1)");
    sunGlow.position.copy(sunMesh.position);
    worldGroup.add(sunGlow);

    // ---- DESTELLOS (points)
    const sparkleCount = 170;
    const sparklePos = new Float32Array(sparkleCount * 3);
    for (let i = 0; i < sparkleCount; i += 1) {
      const ang = Math.random() * Math.PI * 2;
      const rad = 6 + Math.random() * 17;
      sparklePos[i * 3] = Math.cos(ang) * rad;
      sparklePos[i * 3 + 1] = -1 + Math.random() * 10;
      sparklePos[i * 3 + 2] = Math.sin(ang) * rad;
    }
    const sparkleGeo = new THREE.BufferGeometry();
    sparkleGeo.setAttribute("position", new THREE.BufferAttribute(sparklePos, 3));
    const sparkleCanvas = document.createElement("canvas");
    sparkleCanvas.width = sparkleCanvas.height = 32;
    const sc = sparkleCanvas.getContext("2d");
    sc.fillStyle = "#ffffff";
    sc.beginPath(); sc.arc(16, 16, 6, 0, Math.PI * 2); sc.fill();
    const sparkleTex = new THREE.CanvasTexture(sparkleCanvas);
    const sparkles = new THREE.Points(sparkleGeo, new THREE.PointsMaterial({ map: sparkleTex, size: 0.26, transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xfff9c9 }));
    worldGroup.add(sparkles);

    scene.add(worldGroup);

    /* ---------- API de laboratorios ---------- */

    function findIsland(islandId) {
      for (let i = 0; i < islands.length; i += 1) if (islands[i].userData.id === islandId) return islands[i];
      return null;
    }

    function setDemo(islandId, demoType) {
      const isl = findIsland(islandId);
      if (!isl) return null;
      // Ocultar props decorativas (excepto en raster, donde el lienzo es el laboratorio)
      if (isl.userData.defaultProps) isl.userData.defaultProps.visible = (demoType === "raster");
      // Ocultar otros demos
      Object.keys(isl.userData.demos).forEach(function (key) { isl.userData.demos[key].group.visible = false; });
      if (!demoType) { isl.userData.activeDemo = null; return null; }
      // Construcción perezosa
      if (!isl.userData.demos[demoType]) {
        const builder = DEMO_BUILDERS[demoType];
        if (!builder) return null;
        const demo = builder();
        demo.type = demoType;
        demo.value = 50;
        isl.add(demo.group);
        isl.userData.demos[demoType] = demo;
      }
      const active = isl.userData.demos[demoType];
      active.group.visible = true;
      isl.userData.activeDemo = active;
      if (typeof active.update === "function") active.update(active.value, 0);
      return active;
    }

    function clearDemo(islandId) {
      const isl = findIsland(islandId);
      if (!isl) return;
      Object.keys(isl.userData.demos).forEach(function (key) { isl.userData.demos[key].group.visible = false; });
      isl.userData.activeDemo = null;
      if (isl.userData.defaultProps) isl.userData.defaultProps.visible = true;
    }

    function setDemoValue(islandId, value) {
      const isl = findIsland(islandId);
      if (!isl || !isl.userData.activeDemo) return;
      isl.userData.activeDemo.value = value;
      if (typeof isl.userData.activeDemo.update === "function") isl.userData.activeDemo.update(value, 0);
    }

    function tickDemos(time) {
      islands.forEach(function (isl) {
        const demo = isl.userData.activeDemo;
        if (demo && typeof demo.tick === "function" && demo.group.visible) demo.tick(time);
      });
    }

    function setIslandSuccess(islandId, amount) {
      const isl = findIsland(islandId);
      if (!isl || !isl.userData.successShader) return;
      STEAM_ALGORITHMS.setShaderSuccess(isl.userData.successShader, amount);
    }

    function tickWorld(time) {
      // Balanceo flotante de islas
      floaters.forEach(function (isl) {
        isl.position.y = isl.userData.restY + Math.sin(time * 0.7 + isl.userData.bobPhase) * 0.14;
        // Fragmentos orbitando
        isl.children.forEach(function (child) {
          if (child.name === "floatingShard" && child.userData.orbit) {
            const o = child.userData.orbit;
            o.angle += 0.0035;
            child.position.set(Math.cos(o.angle) * o.radius, o.y + Math.sin(time * 0.9 + o.angle * 3) * 0.1, Math.sin(o.angle) * o.radius);
            child.rotation.x += 0.004;
            child.rotation.y += 0.006;
          }
        });
      });
      cloudRing.rotation.y = time * 0.012;
      sparkles.rotation.y = time * 0.02;
      islands.forEach(function (isl) {
        const refs = isl.userData.defaultRefs || {};
        if (refs.spinGears) {
          refs.spinGears[0].rotation.y = time * 0.9;
          refs.spinGears[1].rotation.y = -time * 0.9 * (9 / 7) + 0.2;
        }
      });
      // Alas de Pío respirando
      if (mascot.userData.wings) {
        const flap = Math.sin(time * 2.4) * 0.09;
        mascot.userData.wings[0].rotation.z = -1.15 - flap;
        mascot.userData.wings[1].rotation.z = 1.15 + flap;
      }
    }

    return {
      group: worldGroup,
      islands: islands,
      mascot: mascot,
      shaders: shaders,
      cloudRing: cloudRing,
      setDemo: setDemo,
      clearDemo: clearDemo,
      setDemoValue: setDemoValue,
      tickDemos: tickDemos,
      tickWorld: tickWorld,
      setIslandSuccess: setIslandSuccess
    };
  }

  function rebuildTree(island, iterations) {
    if (!island) return;
    const refs = island.userData.defaultRefs;
    if (!refs || !refs.treeGroup) return;
    const parent = refs.treeGroup.parent;
    parent.remove(refs.treeGroup);
    const newTree = STEAM_ALGORITHMS.buildLSystemTree(iterations, { color: 0x2b9348, trunkColor: 0x7f5539, step: 0.32, angleDeg: 26 });
    newTree.scale.set(0.85, 0.85, 0.85);
    newTree.position.copy(refs.treeGroup.position);
    parent.add(newTree);
    refs.treeGroup = newTree;
  }

  global.STEAM_WORLD = { buildWorld: buildWorld, rebuildTree: rebuildTree, ISLAND_DEFS: ISLAND_DEFS };
  global.buildWorld = function (scene) { return buildWorld(scene); };
})(window);
