// ===== MODE GELAP / TERANG =====
(function () {
  const KEY = "eportofolio-theme";
  const root = document.documentElement;

  function syncButton(theme) {
    const icon = document.querySelector("#theme-toggle i");
    if (icon) icon.className = theme === "light" ? "fas fa-moon" : "fas fa-sun";
    const btn = document.getElementById("theme-toggle");
    if (btn)
      btn.setAttribute(
        "aria-label",
        theme === "light" ? "Aktifkan mode gelap" : "Aktifkan mode terang",
      );
  }

  function apply(theme) {
    root.setAttribute("data-theme", theme);
    syncButton(theme);
    window.__themeColors = null; // invalidasi cache warna partikel
    if (window.getThemeColors) window.getThemeColors(); // baca ulang sekali saja
    window.dispatchEvent(new CustomEvent("themechange", { detail: { theme } }));
  }

  let saved = null;
  try {
    saved = localStorage.getItem(KEY);
  } catch (e) {}
  const initial = saved === "light" ? "light" : "dark";
  apply(initial);

  // Aktifkan transisi hanya setelah render pertama, agar tidak "berkedip" saat load
  window.addEventListener("load", () => {
    requestAnimationFrame(() => root.classList.add("theme-anim"));
  });

  // Deteksi perangkat kelas bawah / preferensi gerak minimal:
  // efek radial & pulse dibatasi agar transisi tetap halus.
  const reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lowEnd =
    (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
    (navigator.deviceMemory && navigator.deviceMemory <= 4) ||
    Math.min(window.innerWidth, window.innerHeight) <= 480;
  if (lowEnd) root.classList.add("theme-lite");
  if (reduceMotion) root.classList.add("theme-reduced");

  let switching = false;
  window.toggleTheme = function () {
    if (switching) return;
    switching = true;

    const btn = document.getElementById("theme-toggle");
    const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";

    root.classList.add("theme-anim", "theme-switching");
    if (btn && !reduceMotion) btn.classList.add("spin");

    // ganti tema di frame berikutnya supaya transisi CSS ikut berjalan
    requestAnimationFrame(() => {
      apply(next);
      try {
        localStorage.setItem(KEY, next);
      } catch (e) {}
    });

    const spinMs = lowEnd || reduceMotion ? 320 : 560;
    const wipeMs = lowEnd || reduceMotion ? 340 : 620;
    setTimeout(() => {
      if (btn) btn.classList.remove("spin");
    }, spinMs);
    setTimeout(() => {
      root.classList.remove("theme-switching");
      switching = false;
    }, wipeMs);
  };

  // Warna partikel dari CSS variable (dengan cache)
  window.getThemeColors = function () {
    if (!window.__themeColors) {
      const cs = getComputedStyle(root);
      window.__themeColors = {
        particle: cs.getPropertyValue("--particle").trim() || "rgba(216,232,248,0.45)",
        line: cs.getPropertyValue("--particle-line").trim() || "120,180,255",
        accent: cs.getPropertyValue("--particle-accent").trim() || "201,168,76",
        rain: cs.getPropertyValue("--rain").trim() || "100,170,255",
        lineAlpha:
          parseFloat(cs.getPropertyValue("--particle-line-alpha")) || 0.16,
        accentAlpha:
          parseFloat(cs.getPropertyValue("--particle-accent-alpha")) || 0.32,
      };
    }
    return window.__themeColors;
  };

  document.addEventListener("DOMContentLoaded", () =>
    syncButton(root.getAttribute("data-theme")),
  );
})();
