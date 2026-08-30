// ===== MENU MOBILE (HAMBURGER) =====
function toggleMobileMenu(force) {
  const nav = document.getElementById("navbar");
  const btn = document.getElementById("nav-toggle");
  if (!nav || !btn) return;
  const open = typeof force === "boolean" ? force : !nav.classList.contains("nav-open");
  nav.classList.toggle("nav-open", open);
  btn.setAttribute("aria-expanded", String(open));
  btn.setAttribute("aria-label", open ? "Tutup menu" : "Buka menu");
  document.body.classList.toggle("no-scroll", open);
}

function closeMobileMenu() {
  toggleMobileMenu(false);
}

// tutup menu setiap kali pindah halaman
(function () {
  const original = window.showPage;
  if (typeof original === "function") {
    window.showPage = function (page) {
      original(page);
      closeMobileMenu();
    };
  }
})();

// tutup saat klik di luar navbar
window.addEventListener("click", function (e) {
  const nav = document.getElementById("navbar");
  if (!nav || !nav.classList.contains("nav-open")) return;
  if (!e.target.closest("#navbar")) closeMobileMenu();
});

// reset saat kembali ke desktop
window.addEventListener("resize", function () {
  if (window.innerWidth > 980) closeMobileMenu();
});

// tutup dengan tombol Escape
window.addEventListener("keydown", function (e) {
  if (e.key === "Escape") closeMobileMenu();
});
