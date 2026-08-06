/* ============================================================
   KARWA REALTORS — 3D "Blueprint City" hero
   A hand-rolled 3D wireframe engine (perspective projection on
   canvas 2D). Renders a slowly orbiting architectural city with
   mouse parallax and scroll-linked camera drift. Zero deps.
   ============================================================ */

(function () {
  const canvas = document.getElementById("hero-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let W = 0, H = 0;

  function resize() {
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  resize();
  window.addEventListener("resize", resize);

  /* ---------- Build the city ----------
     Deterministic pseudo-random so the skyline is always the same. */
  let seed = 7;
  function rand() {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  }

  const buildings = [];
  const GRID = 9;         // city is GRID x GRID plots
  const PLOT = 34;        // plot spacing
  const half = ((GRID - 1) * PLOT) / 2;

  for (let gx = 0; gx < GRID; gx++) {
    for (let gz = 0; gz < GRID; gz++) {
      if (rand() < 0.22) continue; // leave some plots open
      const cx = gx * PLOT - half + (rand() - 0.5) * 6;
      const cz = gz * PLOT - half + (rand() - 0.5) * 6;
      // towers cluster toward the center
      const distFromCenter = Math.hypot(cx, cz) / (half * 1.4);
      const hMax = 150 * (1 - distFromCenter * 0.75);
      const h = 22 + rand() * Math.max(hMax, 26);
      const w = 10 + rand() * 12;
      const d = 10 + rand() * 12;
      const floors = Math.max(2, Math.round(h / 14));
      buildings.push({ cx, cz, w, d, h, floors });
    }
  }
  // One signature tower at the heart of the city
  buildings.push({ cx: 4, cz: -6, w: 20, d: 20, h: 208, floors: 16, hero: true });

  /* ---------- Camera & projection ---------- */
  const cam = { dist: 420, height: 150, fov: 620 };
  let angle = 0.6;
  let mouseX = 0, mouseY = 0;       // -1..1 targets
  let smX = 0, smY = 0;             // smoothed
  let scrollDrift = 0;

  window.addEventListener("pointermove", (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  window.addEventListener("scroll", () => {
    scrollDrift = Math.min(window.scrollY / window.innerHeight, 1.2);
  }, { passive: true });

  function project(x, y, z, sinA, cosA) {
    // rotate around Y
    const rx = x * cosA - z * sinA;
    const rz = x * sinA + z * cosA;
    // camera pulled back on Z, raised on Y, tilted down slightly
    const cy = y - (cam.height + scrollDrift * 90) + smY * 22;
    const cz2 = rz + cam.dist + scrollDrift * 120;
    if (cz2 <= 40) return null;
    const s = cam.fov / cz2;
    return {
      x: W / 2 + (rx + smX * 30) * s,
      y: H * 0.46 - cy * s * 0.9,
      s,
      depth: cz2,
    };
  }

  /* ---------- Draw one wireframe building ---------- */
  function drawBuilding(b, sinA, cosA, t) {
    const x0 = b.cx - b.w / 2, x1 = b.cx + b.w / 2;
    const z0 = b.cz - b.d / 2, z1 = b.cz + b.d / 2;

    const base = [
      project(x0, 0, z0, sinA, cosA), project(x1, 0, z0, sinA, cosA),
      project(x1, 0, z1, sinA, cosA), project(x0, 0, z1, sinA, cosA),
    ];
    const top = [
      project(x0, b.h, z0, sinA, cosA), project(x1, b.h, z0, sinA, cosA),
      project(x1, b.h, z1, sinA, cosA), project(x0, b.h, z1, sinA, cosA),
    ];
    if (base.some(p => !p) || top.some(p => !p)) return;

    const depth = (base[0].depth + base[2].depth) / 2;
    const fade = Math.max(0, Math.min(1, 1.45 - depth / 650));
    if (fade <= 0.02) return;

    const alpha = fade * (b.hero ? 0.9 : 0.5);
    const stroke = `rgba(176, 141, 62, ${alpha})`;
    const faint = `rgba(176, 141, 62, ${alpha * 0.35})`;

    // vertical edges
    ctx.strokeStyle = stroke;
    ctx.lineWidth = b.hero ? 1.2 : 0.7;
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      ctx.moveTo(base[i].x, base[i].y);
      ctx.lineTo(top[i].x, top[i].y);
    }
    // roof
    for (let i = 0; i < 4; i++) {
      const a = top[i], c = top[(i + 1) % 4];
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(c.x, c.y);
    }
    ctx.stroke();

    // floor lines (the "under construction" blueprint feel)
    ctx.strokeStyle = faint;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    const step = b.h / b.floors;
    for (let f = 1; f < b.floors; f++) {
      const y = f * step;
      const p0 = project(x0, y, z0, sinA, cosA);
      const p1 = project(x1, y, z0, sinA, cosA);
      const p2 = project(x1, y, z1, sinA, cosA);
      if (!p0 || !p1 || !p2) continue;
      ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y);
    }
    ctx.stroke();

    // pulsing beacon on the signature tower
    if (b.hero) {
      const tip = project(b.cx, b.h + 14, b.cz, sinA, cosA);
      const roofC = project(b.cx, b.h, b.cz, sinA, cosA);
      if (tip && roofC) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(roofC.x, roofC.y);
        ctx.lineTo(tip.x, tip.y);
        ctx.stroke();
        const pulse = (Math.sin(t / 500) + 1) / 2;
        ctx.fillStyle = `rgba(176, 141, 62, ${0.4 + pulse * 0.6})`;
        ctx.beginPath();
        ctx.arc(tip.x, tip.y, 2 + pulse * 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  /* ---------- Ground grid ---------- */
  function drawGround(sinA, cosA) {
    ctx.lineWidth = 0.5;
    const ext = half + PLOT * 2;
    for (let i = -ext; i <= ext; i += PLOT) {
      const a = project(i, 0, -ext, sinA, cosA);
      const b = project(i, 0, ext, sinA, cosA);
      const c = project(-ext, 0, i, sinA, cosA);
      const d = project(ext, 0, i, sinA, cosA);
      if (a && b) {
        ctx.strokeStyle = "rgba(176, 141, 62, 0.12)";
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
      if (c && d) {
        ctx.strokeStyle = "rgba(176, 141, 62, 0.12)";
        ctx.beginPath(); ctx.moveTo(c.x, c.y); ctx.lineTo(d.x, d.y); ctx.stroke();
      }
    }
  }

  /* ---------- Floating dust particles ---------- */
  const dust = Array.from({ length: 40 }, () => ({
    x: rand() * 1, y: rand() * 1, z: rand() * 1,
    sp: 0.15 + rand() * 0.35,
  }));

  function drawDust(t) {
    for (const p of dust) {
      const y = ((p.y + (t / 40000) * p.sp) % 1);
      const px = p.x * W;
      const py = (1 - y) * H;
      const a = Math.sin(y * Math.PI) * 0.4;
      ctx.fillStyle = `rgba(176, 141, 62, ${a})`;
      ctx.beginPath();
      ctx.arc(px, py, p.z * 1.4 + 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /* ---------- Render loop ---------- */
  let visible = true;
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
  io.observe(canvas);

  function frame(t) {
    requestAnimationFrame(frame);
    if (!visible) return;

    smX += (mouseX - smX) * 0.03;
    smY += (mouseY - smY) * 0.03;
    if (!reduceMotion) angle += 0.0016;
    const a = angle + smX * 0.12;
    const sinA = Math.sin(a), cosA = Math.cos(a);

    ctx.clearRect(0, 0, W, H);

    drawGround(sinA, cosA);

    // painter's sort: far buildings first
    const order = buildings
      .map(b => {
        const rz = b.cx * sinA + b.cz * cosA;
        return { b, rz };
      })
      .sort((p, q) => q.rz - p.rz);

    for (const { b } of order) drawBuilding(b, sinA, cosA, t);

    drawDust(t);
  }
  requestAnimationFrame(frame);
})();
