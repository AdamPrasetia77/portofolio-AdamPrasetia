// ===== SCROLL PROGRESS =====
window.addEventListener("scroll", () => {
  const winScroll =
    document.body.scrollTop || document.documentElement.scrollTop;
  const height =
    document.documentElement.scrollHeight -
    document.documentElement.clientHeight;
  document.getElementById("scroll-progress").style.width =
    (winScroll / height) * 100 + "%";
  document
    .getElementById("navbar")
    .classList.toggle("scrolled", winScroll > 40);
});
