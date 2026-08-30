// ===== ARTEFAK TABS =====
function showArtefak(el, tab) {
  document
    .querySelectorAll(".art-tab")
    .forEach((t) => t.classList.remove("active"));
  document
    .querySelectorAll(".art-panel")
    .forEach((p) => p.classList.remove("active"));
  document.getElementById("panel-" + tab).classList.add("active");
  el.classList.add("active");
  setTimeout(() => window.dispatchEvent(new Event("resize")), 10);
}
function showSiklus(n) {
  document
    .querySelectorAll(".siklus-tab")
    .forEach((t) => t.classList.remove("active"));
  document
    .querySelectorAll(".penilaian-panel")
    .forEach((p) => p.classList.remove("active"));
  document.getElementById("siklus-" + n).classList.add("active");
  document.querySelectorAll(".siklus-tab")[n - 1].classList.add("active");
  setTimeout(() => window.dispatchEvent(new Event("resize")), 10);
}
