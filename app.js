/* ============ SnipSnap · app.js ============ */
/* Flow: pick image → preview → "Remove Background" → progress → result → download */

const $ = (id) => document.getElementById(id);

const views = {
  upload: $("view-upload"),
  processing: $("view-processing"),
  result: $("view-result"),
};

const dropzone = $("dropzone");
const fileInput = $("file-input");
const previewBox = $("preview-box");
const previewOriginal = $("preview-original");
const beforeImg = $("before-img");
const afterImg = $("after-img");
const fileNameEl = $("file-name");
const statusText = $("status-text");
const progressFill = $("progress-fill");
const progressPct = $("progress-pct");
const progressBar = document.querySelector(".progress");
const toast = $("toast");

let originalFile = null;
let resultBlob = null;
let previewUrl = null;
let toastTimer = null;

/* ---------- view switching ---------- */
function show(name) {
  for (const [key, el] of Object.entries(views)) el.hidden = key !== name;
}

/* ---------- toast ---------- */
function showToast(message, ms = 3500) {
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (toast.hidden = true), ms);
}

/* ---------- library (lazy-loaded so the page itself opens instantly) ---------- */
const LIB_URL = "https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.7.0/+esm";
let removeBackgroundFn = null;

async function loadLibrary() {
  if (removeBackgroundFn) return removeBackgroundFn;
  const mod = await import(LIB_URL);
  removeBackgroundFn = mod.removeBackground ?? mod.default;
  if (typeof removeBackgroundFn !== "function") {
    throw new Error("Library loaded but no removeBackground export found");
  }
  return removeBackgroundFn;
}

/* ---------- file selection (click / drag & drop / paste) ---------- */
function handleFile(file) {
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    showToast("That doesn't look like an image 🤔 — try PNG, JPG or WebP");
    return;
  }

  originalFile = file;

  if (previewUrl) URL.revokeObjectURL(previewUrl);
  previewUrl = URL.createObjectURL(file);
  previewOriginal.src = previewUrl;
  beforeImg.src = previewUrl;

  fileNameEl.textContent = file.name;
  dropzone.hidden = true;
  previewBox.hidden = false;
  show("upload");
}

dropzone.addEventListener("click", () => fileInput.click());
dropzone.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    fileInput.click();
  }
});

fileInput.addEventListener("change", () => handleFile(fileInput.files[0]));

dropzone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropzone.classList.add("dragging");
});
dropzone.addEventListener("dragleave", () => dropzone.classList.remove("dragging"));
dropzone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropzone.classList.remove("dragging");
  handleFile(e.dataTransfer.files?.[0]);
});

/* paste an image straight from the clipboard */
window.addEventListener("paste", (e) => {
  const item = [...(e.clipboardData?.items ?? [])].find((i) =>
    i.type.startsWith("image/")
  );
  if (item) handleFile(item.getAsFile());
});

/* ---------- processing ---------- */
function resetProgress() {
  progressFill.style.width = "0%";
  progressPct.textContent = "0%";
  progressBar.setAttribute("aria-valuenow", "0");
  statusText.textContent = "Preparing…";
}

function updateProgress(key, current, total) {
  const pct = total ? Math.round((current / total) * 100) : 0;
  statusText.textContent = key.startsWith("fetch")
    ? "Downloading AI model (first run only)…"
    : "Removing background…";
  progressFill.style.width = pct + "%";
  progressPct.textContent = pct + "%";
  progressBar.setAttribute("aria-valuenow", String(pct));
}

async function processImage() {
  if (!originalFile) return;
  show("processing");
  resetProgress();

  try {
    const removeBackground = await loadLibrary();
    const blob = await removeBackground(originalFile, {
      progress: updateProgress,
    });

    resultBlob = blob;
    afterImg.src = URL.createObjectURL(blob);
    show("result");
  } catch (err) {
    console.error(err);
    show("upload");
    showToast("Something went wrong: " + (err?.message || err), 6000);
  }
}

$("remove-btn").addEventListener("click", processImage);
$("change-btn").addEventListener("click", () => fileInput.click());

/* ---------- result ---------- */
function downloadResult() {
  if (!resultBlob) return;
  const base = (originalFile?.name || "image").replace(/\.[^.]+$/, "");
  const url = URL.createObjectURL(resultBlob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${base}-snipsnap.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

$("download-btn").addEventListener("click", downloadResult);

/* ---------- reset ---------- */
function reset() {
  originalFile = null;
  resultBlob = null;
  afterImg.src = "";
  fileInput.value = "";
  previewBox.hidden = true;
  dropzone.hidden = false;
  show("upload");
}

$("again-btn").addEventListener("click", reset);
