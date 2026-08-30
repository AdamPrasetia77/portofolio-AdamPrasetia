// ===== RAIN CANVAS (versi optimasi) =====
// setInterval diganti requestAnimationFrame, jumlah tetes mengikuti lebar layar,
// dan loop hanya hidup selama layar loading tampil.
(function () {
  const canvas = document.getElementById("rain-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d", { alpha: true });
  const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const DPR = Math.min(window.devicePixelRatio || 1, 1.5);

  let drops = [];
  let raf = null;
  let loadingTimeout = null;

  function dropCount() {
    return Math.max(120, Math.min(320, Math.round(window.innerWidth / 5)));
  }

  function makeDrop(h) {
    return {
      x: Math.random() * window.innerWidth,
      y: Math.random() * h * 2 - h,
      len: Math.random() * 18 + 7,
      speed: Math.random() * 4 + 2,
      op: Math.random() * 0.35 + 0.08,
      w: Math.random() * 1.2 + 0.4,
    };
  }

  function resizeRain() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = Math.round(w * DPR);
    canvas.height = Math.round(h * DPR);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    const target = dropCount();
    while (drops.length < target) drops.push(makeDrop(h));
    if (drops.length > target) drops.length = target;
  }

  function drawRain() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const color = window.getThemeColors
      ? window.getThemeColors().rain
      : "100,170,255";
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(" + color + ",0.28)";
    for (let i = 0; i < drops.length; i++) {
      const d = drops[i];
      ctx.globalAlpha = d.op / 0.28;
      ctx.lineWidth = d.w;
      ctx.beginPath();
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x - 1, d.y + d.len);
      ctx.stroke();
      d.y += d.speed;
      if (d.y > h + 20) {
        d.y = -20;
        d.x = Math.random() * w;
      }
    }
    ctx.globalAlpha = 1;
    raf = requestAnimationFrame(drawRain);
  }

  function startRain() {
    resizeRain();
    if (REDUCED) return;
    if (raf == null) raf = requestAnimationFrame(drawRain);
  }

  function stopRain() {
    if (raf != null) cancelAnimationFrame(raf);
    raf = null;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  }

  function resetLoadingBar() {
    const bar = document.querySelector(".loading-bar-fill");
    if (!bar) return;
    bar.style.animation = "none";
    void bar.offsetWidth;
    bar.style.animation = "";
  }

  function showLoading(duration = 2400) {
    const screen = document.getElementById("loading-screen");
    if (!screen) return;
    if (loadingTimeout) clearTimeout(loadingTimeout);
    screen.classList.remove("hidden");
    resetLoadingBar();
    startRain();
    loadingTimeout = setTimeout(() => {
      screen.classList.add("hidden");
      stopRain();
    }, duration);
  }

  window.restartLoading = (duration = 1200) => showLoading(duration);

  let rt = null;
  window.addEventListener(
    "resize",
    () => {
      clearTimeout(rt);
      rt = setTimeout(resizeRain, 150);
    },
    { passive: true },
  );

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      if (raf != null) cancelAnimationFrame(raf);
      raf = null;
    } else {
      const screen = document.getElementById("loading-screen");
      if (screen && !screen.classList.contains("hidden")) startRain();
    }
  });

  showLoading(2400);
})();
