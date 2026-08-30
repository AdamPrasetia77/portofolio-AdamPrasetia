// ===== TOAST =====
function showToast(msg, isError = false) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.style.background = isError ? "#e04a4a" : "var(--gold)";
  toast.style.color = isError ? "#fff" : "#000";
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}
