(function () {
var loaded = false;
function go() {
if (loaded) return;
loaded = true;
var s = document.createElement("script");
s.src = "assets/app.min.js";
s.defer = true;
document.body.appendChild(s);
}
var idle = window.requestIdleCallback || function (f) { setTimeout(f, 200); };
if (document.readyState === "complete") idle(go);
else window.addEventListener("load", function () { idle(go); });
["pointerdown", "keydown", "touchstart", "scroll"].forEach(function (e) {
window.addEventListener(e, go, { once: true, passive: true });
});
})();
