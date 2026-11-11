# ✂️ SnipSnap — Background Remover

Remove image backgrounds **entirely in your browser** — free, private, no sign-ups, no uploads.

🔗 **Live app:** https://ayan27612-oss.github.io/snipsnap/

## How it works

1. Drop / click / paste an image (PNG, JPG, WebP)
2. AI removes the background **on your device** (first run downloads the model)
3. Preview before/after and download the result as a transparent PNG

## Tech

- Vanilla **HTML + CSS + JS** — no framework, no build step, just 3 files
- [`@imgly/background-removal`](https://github.com/imgly/background-removal-js) — ISNet segmentation model running on ONNX Runtime (WASM), fully client-side
- Hosted free on **GitHub Pages**

## Good to know

- 🔒 Your images never leave your device — nothing is uploaded anywhere
- 📦 First visit downloads the AI model (~80 MB) once; the browser caches it afterwards
- ⚡ Processing speed depends on your device — desktop Chrome/Edge is fastest
- 🧵 GitHub Pages can't send cross-origin isolation headers, so the model runs single-threaded there (slower but works). Hosting with `Cross-Origin-Opener-Policy: same-origin` + `Cross-Origin-Embedder-Policy: require-corp` enables multi-threading

## Run locally

Any static server works — it's just 3 files:

```sh
python -m http.server 8000
# then open http://localhost:8000
```

## Roadmap (v2+)

- [ ] Replace background with a solid color or custom image
- [ ] Before/after comparison slider
- [ ] Batch processing

## License

- App code: MIT (see [LICENSE](./LICENSE))
- AI engine: [`@imgly/background-removal`](https://github.com/imgly/background-removal-js) — AGPL-3.0, © IMG.LY
