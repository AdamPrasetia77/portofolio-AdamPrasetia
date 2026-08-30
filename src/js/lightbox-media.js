// ===== PDF & VIDEO LIGHTBOX =====
function openPDF(url, title) {
  document.getElementById("pdf-iframe").src = url;
  document.getElementById("pdf-title").textContent = title;
  document.getElementById("pdf-lightbox").classList.add("active");
  document.body.style.overflow = "hidden";
}
function closePDF() {
  document.getElementById("pdf-lightbox").classList.remove("active");
  document.body.style.overflow = "";
  setTimeout(() => (document.getElementById("pdf-iframe").src = ""), 300);
}
document
  .getElementById("pdf-close-btn")
  .addEventListener("click", closePDF);
document.getElementById("pdf-lightbox").addEventListener("click", (e) => {
  if (e.target === document.getElementById("pdf-lightbox")) closePDF();
});
document.addEventListener("keydown", (e) => {
  if (
    e.key === "Escape" &&
    document.getElementById("pdf-lightbox").classList.contains("active")
  )
    closePDF();
});

function openVideo(url, title) {
  document.getElementById("video-iframe").src = url;
  document.getElementById("video-title").textContent = title;
  document.getElementById("video-lightbox").classList.add("active");
  document.body.style.overflow = "hidden";
}
function closeVideo() {
  document.getElementById("video-lightbox").classList.remove("active");
  document.body.style.overflow = "";
  setTimeout(
    () => (document.getElementById("video-iframe").src = ""),
    300,
  );
}
document
  .getElementById("video-close-btn")
  .addEventListener("click", closeVideo);
document
  .getElementById("video-lightbox")
  .addEventListener("click", (e) => {
    if (e.target === document.getElementById("video-lightbox"))
      closeVideo();
  });
document.addEventListener("keydown", (e) => {
  if (
    e.key === "Escape" &&
    document.getElementById("video-lightbox").classList.contains("active")
  )
    closeVideo();
});
