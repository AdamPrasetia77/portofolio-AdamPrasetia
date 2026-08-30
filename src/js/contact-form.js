// ===== KIRIM PESAN =====
function kirimPesan() {
  const name =
    document.getElementById("contact-name")?.value.trim() || "";
  const email =
    document.getElementById("contact-email")?.value.trim() || "";
  const message =
    document.getElementById("contact-message")?.value.trim() || "";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!name) return showToast("Nama tidak boleh kosong! ⚠️", true);
  if (!email) return showToast("Email tidak boleh kosong! ⚠️", true);
  if (!emailRegex.test(email))
    return showToast("Format email salah! ⚠️", true);
  if (!message) return showToast("Pesan tidak boleh kosong! ⚠️", true);
  const tujuan = "adamprasetia.2025@student.uny.ac.id";
  window.location.href = `mailto:${tujuan}?subject=${encodeURIComponent("Pesan dari E-Portofolio: " + name)}&body=${encodeURIComponent("Nama: " + name + "\nEmail: " + email + "\n\n" + message)}`;
  showToast("Membuka aplikasi email... 📩");
  document.getElementById("contact-name").value = "";
  document.getElementById("contact-email").value = "";
  document.getElementById("contact-message").value = "";
}
