# Build aset E-Portofolio

Sumber ada di `src/` (HTML asli, `src/css/*`, `src/js/*`).
Hasil build ada di `index.html` + `assets/`.

## Cara build ulang setelah mengedit `src/`

```bash
bun run scripts/build-eportofolio.mjs
```

## Apa yang dilakukan build

- **CSS**: 16 file yang dulu dimuat berantai lewat `@import` (permintaan serial)
  digabung + diminify jadi satu `assets/main.min.css` → 1 permintaan saja.
- **JS code-splitting**:
  - `assets/core.min.js` (`defer`) — tema, loading, navigasi, reveal, toast, progress.
  - `assets/app.min.js` — kanvas partikel interaktif, lightbox, tab artefak, lanyard,
    form kontak. Dimuat saat browser idle setelah `load`, atau langsung begitu
    pengguna menggulir/menyentuh/menekan tombol.
- **Font async**: Google Fonts & Font Awesome dimuat non-blocking
  (`media="print"` + `onload`), dengan `preconnect` dan fallback `<noscript>`.
- **Gambar**: `loading="lazy"` + `decoding="async"` untuk semua gambar di bawah
  layar; dua gambar pertama pakai `fetchpriority="high"`.
- **HTML** diminify (komentar & spasi antar tag dibuang).
- `.htaccess` menyalakan gzip/brotli dan cache jangka panjang untuk aset.

## Catatan

File gambar (`*.png`, `*.jpg`, `*.jpeg`) dan dokumen pendukung diletakkan di
folder yang sama dengan `index.html`, persis seperti sebelumnya. Untuk hasil
terbaik, ubah foto besar ke WebP (mis. `cwebp -q 78 foto.jpg -o foto.webp`).
