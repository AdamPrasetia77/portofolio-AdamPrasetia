// ===== 3D LANYARD =====
const lanyard = document.getElementById("lanyardInteract");
if (lanyard) {
  lanyard.addEventListener("mousemove", (e) => {
    const r = lanyard.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
    const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
    lanyard.style.transform = `perspective(800px) rotateX(${-dy * 11}deg) rotateY(${dx * 11}deg) scale(1.03)`;
  });
  lanyard.addEventListener("mouseleave", () => {
    lanyard.style.transition = "transform .5s ease";
    lanyard.style.transform =
      "perspective(800px) rotateX(0) rotateY(0) scale(1)";
  });
  lanyard.addEventListener("mouseenter", () => {
    lanyard.style.transition = "transform .1s ease";
  });
}
