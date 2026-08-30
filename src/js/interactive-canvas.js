// ===== INTERACTIVE CANVAS (versi optimasi) =====
// Optimasi utama:
// 1. Satu loop requestAnimationFrame untuk SEMUA kanvas (bukan 7 loop terpisah).
// 2. Kanvas yang tidak terlihat di layar dilewati (IntersectionObserver).
// 3. Pencarian tetangga memakai spatial grid -> O(n) alih-alih O(n^2),
//    sehingga jumlah partikel bisa jauh diperbanyak tanpa membebani CPU.
// 4. Warna tema dibaca sekali per frame (cache) & DPR dibatasi maksimal 1.5.
// 5. Loop berhenti saat tab tidak aktif atau saat pengguna memilih reduced motion.
(function () {
  const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const DPR = Math.min(window.devicePixelRatio || 1, 1.5);
  const LINK_DIST = 120;
  const LINK_DIST_SQ = LINK_DIST * LINK_DIST;
  // kepadatan partikel (naik ~2.5x dari versi sebelumnya) dengan batas atas aman
  const DENSITY = 1 / 9000; // partikel per px^2 CSS
  const MIN_P = 70;
  const MAX_P = 220;

  const scenes = [];
  let running = false;

  function particleCount(w, h) {
    return Math.max(MIN_P, Math.min(MAX_P, Math.round(w * h * DENSITY)));
  }

  function makeParticle(w, h) {
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.55,
      vy: (Math.random() - 0.5) * 0.55,
      r: Math.random() * 1.5 + 0.4,
    };
  }

  function createScene(canvasId, wrapId) {
    const canvas = document.getElementById(canvasId);
    const wrap = document.getElementById(wrapId);
    if (!canvas || !wrap) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    const scene = {
      canvas,
      wrap,
      ctx,
      w: 0,
      h: 0,
      particles: [],
      stars: [],
      mouse: { x: null, y: null, radius: 150 },
      visible: false,
      grid: new Map(),
    };

    scene.resize = function () {
      const w = wrap.offsetWidth;
      const h = wrap.offsetHeight;
      if (!w || !h) return;
      scene.w = w;
      scene.h = h;
      canvas.width = Math.round(w * DPR);
      canvas.height = Math.round(h * DPR);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

      const target = particleCount(w, h);
      const list = scene.particles;
      while (list.length < target) list.push(makeParticle(w, h));
      if (list.length > target) list.length = target;
      for (const p of list) {
        if (p.x > w) p.x = Math.random() * w;
        if (p.y > h) p.y = Math.random() * h;
      }
    };

    scene.resize();

    wrap.addEventListener(
      "mousemove",
      (e) => {
        const r = canvas.getBoundingClientRect();
        scene.mouse.x = e.clientX - r.left;
        scene.mouse.y = e.clientY - r.top;
      },
      { passive: true },
    );
    wrap.addEventListener("mouseleave", () => {
      scene.mouse.x = null;
      scene.mouse.y = null;
    });

    scenes.push(scene);
    return scene;
  }

  function drawScene(scene, TC) {
    const { ctx, w, h, particles, mouse } = scene;
    if (!w || !h) return;
    ctx.clearRect(0, 0, w, h);

    // --- spatial grid: hanya bandingkan partikel di sel tetangga ---
    const grid = scene.grid;
    grid.clear();
    const cols = Math.max(1, Math.ceil(w / LINK_DIST));

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
      const key = ((p.y / LINK_DIST) | 0) * cols + ((p.x / LINK_DIST) | 0);
      let cell = grid.get(key);
      if (!cell) grid.set(key, (cell = []));
      cell.push(p);
    }

    // titik partikel (satu path untuk semua -> jauh lebih sedikit draw call)
    ctx.fillStyle = TC.particle;
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // garis penghubung
    ctx.lineWidth = 0.5;
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const cx = (p.x / LINK_DIST) | 0;
      const cy = (p.y / LINK_DIST) | 0;
      for (let gy = cy; gy <= cy + 1; gy++) {
        for (let gx = cx - 1; gx <= cx + 1; gx++) {
          if (gy === cy && gx < cx) continue;
          const cell = grid.get(gy * cols + gx);
          if (!cell) continue;
          for (let k = 0; k < cell.length; k++) {
            const q = cell[k];
            if (q === p) continue;
            const dx = p.x - q.x;
            const dy = p.y - q.y;
            const d2 = dx * dx + dy * dy;
            if (d2 >= LINK_DIST_SQ) continue;
            const alpha = (TC.lineAlpha || 0.16) * (1 - d2 / LINK_DIST_SQ);
            ctx.strokeStyle = "rgba(" + TC.line + "," + alpha.toFixed(3) + ")";
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
      }
    }

    // interaksi kursor
    if (mouse.x != null) {
      const R = mouse.radius;
      ctx.lineWidth = 1;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 > R * R) continue;
        const alpha = (TC.accentAlpha || 0.32) * (1 - Math.sqrt(d2) / R);
        ctx.strokeStyle = "rgba(" + TC.accent + "," + alpha.toFixed(3) + ")";
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
      }
    }

    // bintang jatuh
    if (Math.random() < 0.02 && scene.stars.length < 6) {
      scene.stars.push({
        x: Math.random() * w * 1.5,
        y: -20,
        len: Math.random() * 60 + 30,
        vx: -(Math.random() * 6 + 6),
        vy: Math.random() * 6 + 6,
        life: 1,
      });
    }
    for (let i = scene.stars.length - 1; i >= 0; i--) {
      const s = scene.stars[i];
      const m = Math.hypot(s.vx, s.vy);
      const ex = s.x - s.len * (s.vx / m);
      const ey = s.y - s.len * (s.vy / m);
      const grad = ctx.createLinearGradient(s.x, s.y, ex, ey);
      grad.addColorStop(0, "rgba(" + TC.accent + "," + s.life + ")");
      grad.addColorStop(1, "rgba(" + TC.accent + ",0)");
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(ex, ey);
      ctx.stroke();
      s.x += s.vx;
      s.y += s.vy;
      s.life -= 0.02;
      if (s.life <= 0) scene.stars.splice(i, 1);
    }
  }

  function themeColors() {
    return window.getThemeColors
      ? window.getThemeColors()
      : { particle: "rgba(216,232,248,0.45)", line: "120,180,255", accent: "201,168,76" };
  }

  let last = 0;
  function loop(ts) {
    if (!running) return;
    // batasi ke ~40fps: cukup halus, hemat CPU/baterai
    if (ts - last < 24) {
      requestAnimationFrame(loop);
      return;
    }
    last = ts;
    const TC = window.getThemeColors
      ? window.getThemeColors()
      : { particle: "rgba(216,232,248,0.45)", line: "120,180,255", accent: "201,168,76" };
    for (let i = 0; i < scenes.length; i++) {
      if (scenes[i].visible) drawScene(scenes[i], TC);
    }
    requestAnimationFrame(loop);
  }

  function updateRunning() {
    const shouldRun =
      !document.hidden && scenes.some((s) => s.visible) && !REDUCED;
    if (shouldRun && !running) {
      running = true;
      requestAnimationFrame(loop);
    } else if (!shouldRun) {
      running = false;
    }
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const scene = scenes.find((s) => s.wrap === e.target);
        if (scene) scene.visible = e.isIntersecting;
      }
      updateRunning();
    },
    { rootMargin: "120px" },
  );

  let resizeTimer = null;
  window.addEventListener(
    "resize",
    () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => scenes.forEach((s) => s.resize()), 150);
    },
    { passive: true },
  );

  document.addEventListener("visibilitychange", updateRunning);

  [
    ["hero-canvas", "hero-wrap-section"],
    ["edu-canvas", "edu-wrap-section"],
    ["loc-canvas", "loc-wrap-section"],
    ["art-canvas", "art-wrap-section"],
    ["penilaian-canvas", "penilaian-wrap-section"],
    ["komp-canvas", "komp-wrap-section"],
    ["timeline-canvas", "timeline-wrap-section"],
    ["profil-canvas", "profil-wrap-section"],
    ["refleksi-canvas", "refleksi-wrap-section"],
    ["filosofi-canvas", "filosofi-wrap-section"],
    ["about-canvas", "about-wrap-section"],
    ["thanks-canvas", "thanks-wrap-section"],
  ].forEach(([c, w]) => {
    const scene = createScene(c, w);
    if (!scene) return;
    io.observe(scene.wrap);
    // beberapa kanvas berada di halaman yang awalnya display:none (offsetWidth 0),
    // jadi ukur ulang begitu elemennya benar-benar punya ukuran.
    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(() => {
        if (scene.wrap.offsetWidth && scene.wrap.offsetWidth !== scene.w) {
          scene.resize();
          if (REDUCED) drawScene(scene, themeColors());
        }
      });
      ro.observe(scene.wrap);
    }
  });

  // gambar satu frame statis bila pengguna memilih reduced motion
  if (REDUCED) {
    const TC = window.getThemeColors
      ? window.getThemeColors()
      : { particle: "rgba(216,232,248,0.45)", line: "120,180,255", accent: "201,168,76" };
    scenes.forEach((s) => drawScene(s, TC));
  }
})();
