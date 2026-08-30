// ===== LIGHTBOX GALERI (per grup, tidak nyambung antar bagian) =====
(function () {
  const lightbox = document.getElementById("lightbox"),
    lightboxImg = document.getElementById("lightbox-img"),
    lightboxCaption = document.getElementById("lightbox-caption");
  if (!lightbox) return;

  // Setiap grup berdiri sendiri: Keunikan, Momen di Kelas, Foto Kegiatan, dst.
  const groups = [];
  document
    .querySelectorAll(".keunikan-grid, .gallery-grid, .foto-grid, .foto-list")
    .forEach((wrap) => {
      const items = Array.from(
        wrap.querySelectorAll(".keunikan-card, .gallery-item, .foto-item"),
      ).filter((el) => el.querySelector("img"));
      if (items.length) groups.push(items);
    });

  // Item yang tidak berada dalam wrapper di atas -> jadikan grup sendiri-sendiri
  const claimed = new Set(groups.flat());
  document
    .querySelectorAll(".keunikan-card, .gallery-item, .foto-item")
    .forEach((el) => {
      if (!claimed.has(el) && el.querySelector("img")) groups.push([el]);
    });

  let curGroup = [],
    curIdx = 0;

  function captionFor(item) {
    if (item.classList.contains("keunikan-card")) {
      const h3 = item.querySelector("h3"),
        desc = item.querySelector(".keunikan-desc");
      return `<span style="font-size:22px;display:block;margin-bottom:8px">${h3 ? h3.innerHTML : ""}</span><span style="font-size:14px;color:var(--text)">${desc ? desc.innerHTML : ""}</span>`;
    }
    const el =
      item.querySelector(".gallery-overlay") ||
      item.querySelector(".foto-item-info p");
    return el ? el.innerHTML : "";
  }

  function updateLightbox(i) {
    if (!curGroup.length) return;
    // Tidak looping: batasi indeks antara 0 dan jumlah item - 1
    if (i < 0 || i >= curGroup.length) return;
    curIdx = i;
    const item = curGroup[curIdx],
      img = item.querySelector("img");
    lightboxImg.style.opacity = "0";
    setTimeout(() => {
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt || "";
      let cap = captionFor(item);
      if (curGroup.length > 1)
        cap += `<span style="display:block;margin-top:10px;font-size:12px;opacity:.6">${curIdx + 1} / ${curGroup.length}</span>`;
      lightboxCaption.innerHTML = cap;
      lightboxImg.style.opacity = "1";
      toggleNav();
    }, 150);
  }

  function close() {
    lightbox.classList.remove("active");
    setTimeout(() => (lightboxImg.src = ""), 300);
  }

  const prevBtn = document.querySelector(".lightbox-prev"),
    nextBtn = document.querySelector(".lightbox-next");

  function toggleNav() {
    if (!curGroup.length) return;
    if (prevBtn) prevBtn.style.display = curGroup.length > 1 && curIdx > 0 ? "" : "none";
    if (nextBtn) nextBtn.style.display = curGroup.length > 1 && curIdx < curGroup.length - 1 ? "" : "none";
  }

  groups.forEach((items) => {
    items.forEach((item, idx) => {
      item.addEventListener("click", () => {
        curGroup = items;
        curIdx = idx;
        toggleNav();
        updateLightbox(idx);
        lightbox.classList.add("active");
      });
    });
  });

  if (nextBtn)
    nextBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      updateLightbox(curIdx + 1);
    });
  if (prevBtn)
    prevBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      updateLightbox(curIdx - 1);
    });
  const closeBtn = document.querySelector(".lightbox-close");
  if (closeBtn) closeBtn.addEventListener("click", close);

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox || e.target.classList.contains("lightbox-close"))
      close();
  });

  // Geser (swipe) ke samping untuk berpindah foto di perangkat sentuh
  let touchX = null;
  lightbox.addEventListener("touchstart", (e) => {
    touchX = e.touches[0].clientX;
  }, { passive: true });
  lightbox.addEventListener("touchend", (e) => {
    if (touchX === null || curGroup.length < 2) return;
    const dx = e.changedTouches[0].clientX - touchX;
    touchX = null;
    if (Math.abs(dx) < 40) return;
    if (dx < 0 && curIdx < curGroup.length - 1) updateLightbox(curIdx + 1);
    if (dx > 0 && curIdx > 0) updateLightbox(curIdx - 1);
  }, { passive: true });

  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("active")) return;
    if (e.key === "Escape") close();
    if (curGroup.length < 2) return;
    if (e.key === "ArrowRight" && curIdx < curGroup.length - 1) updateLightbox(curIdx + 1);
    if (e.key === "ArrowLeft" && curIdx > 0) updateLightbox(curIdx - 1);
  });
})();
