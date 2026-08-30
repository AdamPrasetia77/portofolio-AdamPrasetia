// Build aset E-Portofolio: gabung + minify CSS, code-split JS, minify HTML.
// Jalankan: bunx esbuild tersedia otomatis (dipakai untuk minify).
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "src");
const out = join(root, "assets");
mkdirSync(out, { recursive: true });

const minify = (code, loader) => {
  const tmp = join("/tmp", `ep-min-${Date.now()}-${Math.random().toString(36).slice(2)}.${loader}`);
  writeFileSync(tmp, code);
  const res = execFileSync("bunx", ["esbuild", tmp, "--minify"], {
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 64,
  });
  return res;
};

// ---------- CSS ----------
const mainCss = readFileSync(join(src, "css/main.css"), "utf8");
const cssFiles = [...mainCss.matchAll(/@import url\("([^"]+)"\)/g)].map((m) => m[1]);
const extraCss = mainCss.replace(/@import url\("[^"]+"\);?/g, "");
const css = cssFiles.map((f) => readFileSync(join(src, "css", f), "utf8")).join("\n") + "\n" + extraCss;
writeFileSync(join(out, "main.min.css"), minify(css, "css"));

// ---------- JS ----------
const core = ["theme.js", "loading-rain.js", "toast.js", "navigation.js", "mobile-nav.js", "scroll-progress.js", "reveal.js"];
const app = ["interactive-canvas.js", "lightbox-gallery.js", "lightbox-media.js", "artefak-tabs.js", "lanyard.js", "contact-form.js"];
const bundle = (list) => list.map((f) => readFileSync(join(src, "js", f), "utf8")).join("\n;\n");
writeFileSync(join(out, "core.min.js"), minify(bundle(core), "js"));
writeFileSync(join(out, "app.min.js"), minify(bundle(app), "js"));

// ---------- HTML ----------
let html = readFileSync(join(src, "index.html"), "utf8");

const head = `<link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin /><link rel="preconnect" href="https://cdnjs.cloudflare.com" crossorigin /><link rel="preload" as="style" href="assets/main.min.css" /><link rel="stylesheet" href="assets/main.min.css" /><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" media="print" onload="this.media='all'" /><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" media="print" onload="this.media='all'" /><noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" /><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" /></noscript><link rel="preload" as="script" href="assets/core.min.js" />`;

// buang <link>/<style>/@import css lokal dan semua <script src="js/...">
html = html.replace(/<link[^>]*href="(?:css|src\/css)\/[^"]*"[^>]*>\s*/g, "");
html = html.replace(/<link[^>]*fonts\.googleapis[^>]*>\s*/g, "");
html = html.replace(/<link[^>]*font-awesome[^>]*>\s*/g, "");
html = html.replace(/<script src="js\/[^"]+"><\/script>\s*/g, "");
html = html.replace("</head>", `${head}</head>`);

const loader = `<script src="assets/core.min.js" defer></script><script>
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
  </script>`;
html = html.replace("</body>", `${loader}</body>`);

// gambar: lazy + async decoding (dua gambar pertama prioritas tinggi)
let imgIndex = 0;
html = html.replace(/<img\b([^>]*)>/g, (m, attrs) => {
  if (/loading=|fetchpriority=/.test(attrs)) return m;
  imgIndex += 1;
  return imgIndex <= 2
    ? `<img${attrs} fetchpriority="high" decoding="async">`
    : `<img${attrs} loading="lazy" decoding="async">`;
});

// minify HTML: buang komentar + spasi antar tag
html = html
  .replace(/<!--(?!\[if)[\s\S]*?-->/g, "")
  .replace(/>\s+</g, "><")
  .replace(/^\s+/gm, "")
  .trim();

writeFileSync(join(root, "index.html"), html);
console.log("build selesai: index.html + assets/");
