/**
 * Indula — 3D cascading pitch-deck card stack
 * Stacked, tilted cards cycling in depth.
 */

(() => {
  const stage = document.getElementById("stage");
  const scene = document.querySelector(".scene");
  const cards = Array.from(stage.querySelectorAll(".card"));
  const count = cards.length;

  // Visual stack parameters
  const STACK = {
    rotateX: 42,
    rotateY: -20,
    rotateZ: -18,
    stepY: 118,
    stepZ: -160,
    stepX: 42,
    scaleStep: 0.04,
  };

  let order = cards.map((_, i) => i); // front → back
  let progress = 0; // 0..1 within current step
  let autoplay = true;
  let lastTs = 0;
  let velocity = 0;
  let dragging = false;
  let dragStartY = 0;
  let dragProgress = 0;
  let elapsed = 0;

  const DURATION = 1250; // ms per card advance (smooth cascade)

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function applyTransforms(p) {
    const e = easeInOutCubic(Math.min(1, Math.max(0, p)));

    // Soft ambient sway
    const swayX = Math.sin(elapsed * 0.00055) * 6;
    const swayY = Math.cos(elapsed * 0.0004) * 4;
    const swayRot = Math.sin(elapsed * 0.00035) * 1.4;

    stage.style.transform = `translate3d(${swayX}px, ${swayY}px, 0) rotateZ(${swayRot}deg)`;

    order.forEach((cardIndex, stackPos) => {
      const card = cards[cardIndex];

      // Interpolate between current stack slot and the one above
      const from = stackPos;
      const to = stackPos - 1;
      const pos = from + (to - from) * e;

      let y;
      let z;
      let x;
      let scale;
      let opacity;
      let rx = STACK.rotateX;
      let ry = STACK.rotateY;
      let rz = STACK.rotateZ;

      if (stackPos === 0) {
        // Front card peels up toward camera then exits
        const lift = e * e;
        y = -260 * lift;
        z = 340 * lift;
        x = 55 * lift;
        scale = 1 + 0.1 * lift;
        opacity = 1 - e * 1.2;
        rx = STACK.rotateX - 22 * e;
        ry = STACK.rotateY - 10 * e;
        rz = STACK.rotateZ - 10 * e;
      } else {
        y = STACK.stepY * pos;
        z = STACK.stepZ * pos;
        x = STACK.stepX * pos;
        scale = 1 - STACK.scaleStep * Math.max(0, pos);
        // Fade cards that fall deep in the stack
        opacity = pos > 4.5 ? Math.max(0, 1 - (pos - 4.5) * 0.55) : 1;
        rx = STACK.rotateX + pos * 1.6;
      }

      // Deepest card eases in from further back
      if (stackPos === count - 1 && e > 0) {
        const enter = e;
        y =
          STACK.stepY * (count - 1) * (1 - enter) +
          STACK.stepY * (count - 2) * enter;
        z = STACK.stepZ * (count - 1) - 55 * (1 - enter);
        x =
          STACK.stepX * (count - 1) * (1 - enter) +
          STACK.stepX * (count - 2) * enter;
        opacity = Math.min(1, 0.25 + enter * 0.85);
        scale = 1 - STACK.scaleStep * (count - 2 - enter);
      }

      card.style.opacity = String(Math.max(0, Math.min(1, opacity)));
      card.style.zIndex = String(1000 - Math.round(pos * 10));
      card.style.transform = `
        translate3d(${x}px, ${y}px, ${z}px)
        rotateX(${rx}deg)
        rotateY(${ry}deg)
        rotateZ(${rz}deg)
        scale(${scale})
      `;
    });
  }

  function advanceOrder() {
    const front = order.shift();
    order.push(front);
    progress = 0;
  }

  function tick(ts) {
    if (!lastTs) lastTs = ts;
    const dt = ts - lastTs;
    lastTs = ts;
    elapsed += dt;

    if (!dragging) {
      if (autoplay) {
        progress += dt / DURATION;
      } else if (Math.abs(velocity) > 0.0005) {
        progress += velocity;
        velocity *= 0.92;
      }

      if (progress >= 1) {
        advanceOrder();
      } else if (progress < 0) {
        // reverse one step
        const back = order.pop();
        order.unshift(back);
        progress = 1 + progress;
      }
    }

    applyTransforms(progress);
    requestAnimationFrame(tick);
  }

  // ---------- Pointer / scroll interaction ----------

  function onWheel(e) {
    e.preventDefault();
    autoplay = false;
    const delta = e.deltaY * 0.0018;
    progress += delta;
    velocity = delta * 0.35;
    window.clearTimeout(onWheel._t);
    onWheel._t = window.setTimeout(() => {
      autoplay = true;
      velocity = 0;
    }, 2200);
  }

  function onPointerDown(e) {
    dragging = true;
    autoplay = false;
    scene.classList.add("is-dragging");
    dragStartY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
    dragProgress = progress;
    velocity = 0;
  }

  function onPointerMove(e) {
    if (!dragging) return;
    const y = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
    const dy = dragStartY - y;
    progress = dragProgress + dy / 320;
  }

  function onPointerUp() {
    if (!dragging) return;
    dragging = false;
    scene.classList.remove("is-dragging");
    window.clearTimeout(onPointerUp._t);
    onPointerUp._t = window.setTimeout(() => {
      autoplay = true;
    }, 1800);
  }

  scene.addEventListener("wheel", onWheel, { passive: false });
  scene.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);
  window.addEventListener("pointercancel", onPointerUp);

  // Initial layout
  applyTransforms(0);

  // ?still=1 freezes the stack for screenshots / README previews
  if (new URLSearchParams(location.search).has("still")) {
    autoplay = false;
    const hint = document.querySelector(".hint");
    if (hint) hint.style.display = "none";
    return;
  }

  requestAnimationFrame(tick);
})();
