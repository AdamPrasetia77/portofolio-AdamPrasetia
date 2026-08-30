// ===== NAVIGASI + DROPDOWN (aksesibel: ARIA + keyboard) =====
const SEM1_PAGES = [
  "profil-mahasiswa",
  "analisis-artefak",
  "penilaian",
  "model",
  "refleksi-akhir",
  "filosofi-mengajar",
];

function setNavMode(mode) {
  const main = document.getElementById("nav-links");
  const sem1 = document.getElementById("nav-links-sem1");
  if (!main || !sem1) return;
  main.hidden = mode === "sem1";
  sem1.hidden = mode !== "sem1";
  closeAllDropdowns();
}

function showPage(page) {
  const target = document.getElementById("page-" + page);
  if (!target) return;
  document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
  target.classList.add("active");

  setNavMode(SEM1_PAGES.includes(page) ? "sem1" : "main");

  // Reset state aktif + aria-current di semua tautan navigasi
  document
    .querySelectorAll(".nav-links a, .nav-links .dropbtn")
    .forEach((a) => {
      a.classList.remove("active");
      a.removeAttribute("aria-current");
    });

  const navEl = document.getElementById("nav-" + page);
  if (navEl) {
    navEl.classList.add("active");
    navEl.setAttribute("aria-current", "page");
  } else {
    document.querySelectorAll(".dropdown-content a").forEach((a) => {
      if (a.getAttribute("onclick")?.includes(`'${page}'`)) {
        a.setAttribute("aria-current", "page");
        a.closest(".dropdown")?.querySelector(".dropbtn")?.classList.add("active");
      }
    });
  }

  // Pindahkan fokus ke konten utama agar pengguna keyboard/screen reader
  // tidak tertinggal di navbar setelah berpindah halaman
  const main = document.getElementById("main-content");
  if (main && document.activeElement?.closest("#navbar")) {
    main.focus({ preventScroll: true });
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
  setTimeout(() => window.dispatchEvent(new Event("resize")), 10);
}

// Masuk ke area Semester 1 -> tampilkan Profil Mahasiswa + navbar Semester 1
function enterSemester1() {
  showPage("profil-mahasiswa");
}

function backToBeranda() {
  showPage("beranda");
}

// ---------- Dropdown ----------
function setDropdownState(dropdown, open) {
  dropdown.classList.toggle("show", open);
  dropdown
    .querySelector(".dropbtn")
    ?.setAttribute("aria-expanded", String(open));
}

function closeAllDropdowns(exceptId) {
  document.querySelectorAll(".dropdown").forEach((d) => {
    if (d.id !== exceptId) setDropdownState(d, false);
  });
}

function toggleDropdown(id) {
  const dropdown = document.getElementById(id);
  if (!dropdown) return;
  const willOpen = !dropdown.classList.contains("show");
  closeAllDropdowns(id);
  setDropdownState(dropdown, willOpen);
}

// Klik di luar dropdown menutup semuanya
window.addEventListener("click", function (e) {
  if (!e.target.closest(".dropdown")) closeAllDropdowns();
});

// ---------- Navigasi keyboard ----------
document.addEventListener("keydown", function (e) {
  const dropbtn = e.target.closest?.(".dropbtn");
  const menuItem = e.target.closest?.(".dropdown-content a");

  // Escape: tutup dropdown, kembalikan fokus ke tombolnya
  if (e.key === "Escape") {
    const open = document.querySelector(".dropdown.show");
    if (open) {
      setDropdownState(open, false);
      open.querySelector(".dropbtn")?.focus();
      e.stopPropagation();
    }
    return;
  }

  // ArrowDown/ArrowUp pada tombol dropdown: buka & fokus item pertama/terakhir
  if (dropbtn && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
    const dropdown = dropbtn.closest(".dropdown");
    const items = [...dropdown.querySelectorAll(".dropdown-content a")];
    if (!items.length) return;
    e.preventDefault();
    closeAllDropdowns(dropdown.id);
    setDropdownState(dropdown, true);
    items[e.key === "ArrowDown" ? 0 : items.length - 1].focus();
    return;
  }

  // Panah di dalam menu: berpindah antar item; Home/End juga didukung
  if (menuItem) {
    const items = [...menuItem.closest(".dropdown-content").querySelectorAll("a")];
    const i = items.indexOf(menuItem);
    let next = null;
    if (e.key === "ArrowDown") next = items[(i + 1) % items.length];
    else if (e.key === "ArrowUp") next = items[(i - 1 + items.length) % items.length];
    else if (e.key === "Home") next = items[0];
    else if (e.key === "End") next = items[items.length - 1];
    if (next) {
      e.preventDefault();
      next.focus();
    }
  }
});
