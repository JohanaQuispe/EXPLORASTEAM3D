// js/interaction.js — Raycasting, cámara cinematográfica y caminata con brincos de Pío
(function (global) {
  "use strict";

  const HOME = {
    position: new THREE.Vector3(16, 16.5, 23),
    target: new THREE.Vector3(-1.1, 0.7, 0)
  };

  function createInteraction(ctx) {
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const lookTarget = HOME.target.clone();
    let hovered = null;
    let flying = false;
    let activeIsland = null;

    const controls = new THREE.OrbitControls(ctx.camera, ctx.renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI / 2.12;
    controls.minDistance = 7;
    controls.maxDistance = 46;
    controls.target.copy(lookTarget);

    function getIslandFromHit(object) {
      let current = object;
      while (current) {
        if (current.userData && current.userData.type === "island") return current;
        current = current.parent;
      }
      return null;
    }

    function setPointer(event) {
      const rect = ctx.renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }

    function pickIsland() {
      raycaster.setFromCamera(pointer, ctx.camera);
      const hits = raycaster.intersectObjects(ctx.world.islands, true);
      if (!hits.length) return null;
      return getIslandFromHit(hits[0].object);
    }

    function setHover(island) {
      if (hovered === island) return;
      if (hovered) {
        global.gsap.to(hovered.scale, { x: 1, y: 1, z: 1, duration: 0.35, ease: "power2.out" });
        const prevLabel = hovered.userData.label;
        if (prevLabel) global.gsap.to(prevLabel.scale, { x: 4.1, y: 1.06, duration: 0.3 });
      }
      hovered = island;
      if (hovered) {
        global.gsap.to(hovered.scale, { x: 1.055, y: 1.055, z: 1.055, duration: 0.35, ease: "back.out(2)" });
        const label = hovered.userData.label;
        if (label) global.gsap.to(label.scale, { x: 4.6, y: 1.2, duration: 0.3, ease: "back.out(2)" });
        ctx.renderer.domElement.style.cursor = "pointer";
        if (global.STEAM_AUDIO) global.STEAM_AUDIO.sfx("click");
      } else {
        ctx.renderer.domElement.style.cursor = "default";
      }
    }

    function onPointerMove(event) {
      if (flying) return;
      setPointer(event);
      setHover(pickIsland());
    }

    /* Pío brinca por el puente: 6 saltos con anticipación y aterrizaje */
    function hopMascotAlongPath(targetPos, onDone) {
      const mascot = ctx.world.mascot;
      if (!mascot) { if (onDone) onDone(); return; }
      const start = mascot.position.clone();
      const dir = new THREE.Vector3(targetPos.x, 0, targetPos.z).normalize();
      const end = dir.clone().multiplyScalar(Math.hypot(targetPos.x, targetPos.z) * 0.66);
      end.y = 0.2;

      // Orientar a Pío en la dirección del puente
      const angle = Math.atan2(dir.x, dir.z);
      global.gsap.to(mascot.rotation, { y: angle, duration: 0.35, ease: "power1.inOut" });

      const tl = global.gsap.timeline({ onComplete: onDone });
      const hops = 6;
      for (let i = 1; i <= hops; i += 1) {
        const t = i / hops;
        const px = start.x + (end.x - start.x) * t;
        const pz = start.z + (end.z - start.z) * t;
        tl.to(mascot.position, { x: px, z: pz, duration: 0.34, ease: "power1.inOut" }, (i - 1) * 0.34);
        tl.to(mascot.position, { y: 1.0, duration: 0.16, ease: "power2.out" }, (i - 1) * 0.34);
        tl.to(mascot.position, { y: 0.2, duration: 0.18, ease: "bounce.out" }, (i - 1) * 0.34 + 0.16);
        tl.to(mascot.scale, { y: 0.82, duration: 0.08, ease: "power1.in" }, (i - 1) * 0.34 + 0.3);
        tl.to(mascot.scale, { y: 1.0, duration: 0.14, ease: "back.out(3)" }, (i - 1) * 0.34 + 0.36);
        tl.add(function () { if (global.STEAM_AUDIO) global.STEAM_AUDIO.sfx("hop"); }, (i - 1) * 0.34 + 0.05);
      }
    }

    function flyTo(position, target, onComplete) {
      flying = true;
      controls.enabled = false;

      global.gsap.to(ctx.camera.position, {
        x: position.x, y: position.y, z: position.z,
        duration: 1.5, ease: "power2.inOut"
      });

      global.gsap.to(lookTarget, {
        x: target.x, y: target.y, z: target.z,
        duration: 1.5, ease: "power2.inOut",
        onUpdate: function () {
          ctx.camera.lookAt(lookTarget);
          controls.target.copy(lookTarget);
        },
        onComplete: function () {
          flying = false;
          controls.enabled = true;
          if (onComplete) onComplete();
        }
      });
    }

    let downPos = null;

    function onPointerDown(event) {
      if (event.button !== 0 || flying) return;
      downPos = { x: event.clientX, y: event.clientY };
    }

    function onPointerUp(event) {
      if (event.button !== 0 || flying || !downPos) return;
      const moved = Math.hypot(event.clientX - downPos.x, event.clientY - downPos.y);
      downPos = null;
      if (moved > 7) return; // fue un arrastre de cámara, no un clic
      setPointer(event);
      const island = pickIsland();
      if (!island) return;

      activeIsland = island;
      if (global.STEAM_AUDIO) { global.STEAM_AUDIO.sfx("whoosh"); global.STEAM_AUDIO.startMusic(); }

      const targetPos = island.position.clone();
      const direction = new THREE.Vector3(targetPos.x, 0, targetPos.z).normalize();
      const camPos = targetPos.clone().add(direction.clone().multiplyScalar(6.2)).add(new THREE.Vector3(0, 5.6, 0));

      // Pío arranca a brincar y la cámara vuela en paralelo
      hopMascotAlongPath(targetPos, null);
      flyTo(camPos, new THREE.Vector3(targetPos.x, targetPos.y + 0.6, targetPos.z), function () {
        if (global.STEAM_UI && typeof global.STEAM_UI.openIsland === "function") {
          global.STEAM_UI.openIsland({
            id: island.userData.id,
            name: island.userData.name,
            object: island
          });
        }
      });
    }

    function returnToCampus() {
      activeIsland = null;
      if (global.STEAM_AUDIO) global.STEAM_AUDIO.sfx("whoosh");
      const mascot = ctx.world.mascot;
      if (mascot) {
        global.gsap.killTweensOf(mascot.position);
        global.gsap.to(mascot.rotation, { y: Math.atan2(-mascot.position.x + 0.4, -mascot.position.z + 0.9), duration: 0.3 });
        const tl = global.gsap.timeline();
        tl.to(mascot.position, { x: 0.4, z: 0.9, duration: 1.15, ease: "power1.inOut" }, 0);
        for (let i = 0; i < 4; i += 1) {
          tl.to(mascot.position, { y: 0.95, duration: 0.15, ease: "power2.out" }, i * 0.28);
          tl.to(mascot.position, { y: 0.2, duration: 0.17, ease: "bounce.out" }, i * 0.28 + 0.15);
          tl.add(function () { if (global.STEAM_AUDIO) global.STEAM_AUDIO.sfx("hop"); }, i * 0.28);
        }
      }
      flyTo(HOME.position, HOME.target, null);
    }

    ctx.renderer.domElement.addEventListener("pointerdown", onPointerDown);
    ctx.renderer.domElement.addEventListener("pointerup", onPointerUp);
    ctx.renderer.domElement.addEventListener("pointermove", onPointerMove);
    ctx.renderer.domElement.addEventListener("pointerleave", function () { setHover(null); });

    return {
      controls: controls,
      update: function () {
        if (!flying) controls.update();
      },
      returnToCampus: returnToCampus,
      isFlying: function () { return flying; }
    };
  }

  global.STEAM_INTERACTION = { createInteraction: createInteraction, HOME: HOME };
})(window);
