// ===== REVEAL ANIMATIONS ON SCROLL =====
(function () {
  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  const observer = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("active");
          observer.unobserve(e.target);
        }
      }),
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
  );

  // Efek per jenis elemen
  const EFFECTS = [
    { sel: ".section-label", eff: "fade-down" },
    { sel: ".section-title", eff: "fade-up" },
    { sel: ".section-divider", eff: "grow-x" },
    { sel: ".edu-card", eff: "fade-left" },
    { sel: ".p-card", eff: "fade-left" },
    { sel: ".keunikan-card", eff: "flip-up" },
    { sel: ".gallery-item", eff: "zoom-in" },
    { sel: ".foto-item", eff: "zoom-in" },
    { sel: ".video-card", eff: "zoom-in" },
    { sel: ".kar-card", eff: "zoom-in" },
    { sel: ".komp-card", eff: "fade-up" },
    { sel: ".analisis-card", eff: "fade-up" },
    { sel: ".rpp-card", eff: "fade-up" },
    { sel: ".mg-card", eff: "fade-up" },
    { sel: ".nilai-card", eff: "fade-up" },
    { sel: ".refleksi-card", eff: "fade-up" },
    { sel: ".filosofi-card", eff: "fade-up" },
    { sel: ".contact-card", eff: "fade-up" },
    { sel: ".info-card", eff: "fade-up" },
    { sel: ".stat-card", eff: "zoom-in" },
    { sel: ".card", eff: "fade-up" },
  ];

  function prep(el, eff, i) {
    if (el.classList.contains("reveal")) return;
    el.classList.add("reveal", eff);
    el.style.transitionDelay = `${Math.min(i, 5) * 0.09}s`;
    observer.observe(el);
  }

  if (prefersReduced) return;

  // 1) elemen spesifik
  EFFECTS.forEach(({ sel, eff }) => {
    document.querySelectorAll(sel).forEach((el, i) => {
      // t-item punya pola zig-zag
      prep(el, eff, i);
    });
  });

  // 2) timeline zig-zag
  document.querySelectorAll(".t-item").forEach((el, i) => {
    prep(el, i % 2 === 0 ? "fade-right" : "fade-left", i);
  });

  // 3) fallback: paragraf & elemen langsung di dalam container setiap section
  document.querySelectorAll("section .container > *").forEach((el, i) => {
    if (el.classList.contains("reveal")) return;
    if (el.querySelector(".reveal")) return; // wrapper grid: biarkan anaknya
    prep(el, "fade-up", i % 4);
  });

  // 4) elemen di dalam tab yang awalnya tersembunyi — cek ulang saat tab diklik
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".tab-btn, .artefak-tab, [data-tab]")) return;
    setTimeout(() => {
      document.querySelectorAll(".reveal:not(.active)").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0)
          el.classList.add("active");
      });
    }, 60);
  });
})();
