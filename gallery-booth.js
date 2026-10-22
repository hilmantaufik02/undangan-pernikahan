/* =====================================================================
   GALERI (rasio foto asli + slot video) & PHOTOBOOTH (frame, efek, kamera)
   Dimuat setelah script.js. Fungsi yang dipanggil script.js:
   galleryHTML(), galleryInit(), galleryCleanup(), boothHTML(), boothInit(), boothStop(), lb(i)
   ===================================================================== */

/* ---------------------------------------------------------------------
   1) DATA GALERI
   Urutan array = urutan tampil. Foto berurutan otomatis disusun masonry
   mengikuti rasio aslinya (w × h). Video tampil selebar kartu.
   - Foto baru: tambahkan {type:'photo', src, w, h} (w & h = piksel asli foto).
   - Video: taruh file di assets/video/ lalu isi src. w & h hanya RASIO
     (9×16 = vertikal HP, 16×9 = horizontal).
   --------------------------------------------------------------------- */
const GALLERY = [
  {
    type: 'video', src: 'assets/video/video-1.mp4', poster: 'assets/video/video-1.jpg', w: 9, h: 16,
    title: 'Cerita Kami', caption: 'Sepenggal perjalanan Hilman T & Intania Denas'
  },
  { type: 'photo', src: 'assets/gallery/frame-1.jpeg', thumb: 'assets/gallery/webp/frame-1-t.webp', w: 1280, h: 1280 },
  { type: 'photo', src: 'assets/gallery/frame-2.jpeg', thumb: 'assets/gallery/webp/frame-2-t.webp', w: 960, h: 1280 },
  { type: 'photo', src: 'assets/gallery/frame-3.jpeg', thumb: 'assets/gallery/webp/frame-3-t.webp', w: 828, h: 1472 },
  {
    type: 'video', src: 'assets/video/video-2.mp4', poster: 'assets/video/video-2.jpg', w: 9, h: 16,
    title: 'Menuju Hari Bahagia', caption: 'Momen kecil yang berarti besar'
  },
  { type: 'photo', src: 'assets/gallery/frame-6.jpeg', thumb: 'assets/gallery/webp/frame-6-t.webp', w: 353, h: 627 },
  { type: 'photo', src: 'assets/gallery/frame-4.jpeg', thumb: 'assets/gallery/webp/frame-4-t.webp', w: 864, h: 1536 },
  { type: 'photo', src: 'assets/gallery/frame-5.jpeg', thumb: 'assets/gallery/webp/frame-5-t.webp', w: 864, h: 1536 }
];
const GALLERY_PHOTOS = GALLERY.filter(g => g.type === 'photo');
const GALLERY_VIDEOS = GALLERY.filter(g => g.type === 'video');

let _musicResume = false;

function videoCardHTML(v, vi) {
  const t = escapeHTML(v.title || 'Video'), c = escapeHTML(v.caption || '');
  return `<figure class="g-video" data-vi="${vi}">
    <div class="g-video-frame" style="--vw:${v.w};--vh:${v.h}">
      <video src="${v.src}${v.poster ? '' : '#t=0.1'}" ${v.poster ? `poster="${v.poster}"` : ''} playsinline preload="${v.poster ? 'none' : 'metadata'}" controls controlsList="nodownload" aria-label="${t}"></video>
      <div class="g-video-empty" hidden><span aria-hidden="true">🎬</span><b>Video segera hadir</b><small>Taruh file di<br><code>${escapeHTML(v.src)}</code></small></div>
    </div>
    <figcaption><b>${t}</b><span>${c}</span></figcaption>
  </figure>`;
}

/* Susunan mosaik tanpa celah: tiap kelompok foto disusun sehingga kedua kolom SELALU sama tinggi
   dan rasio asli foto tetap terjaga. 3 foto = dua foto bertumpuk di kiri + satu foto tinggi di
   kanan (susunan yang sama untuk semua kelompok). 2 foto = berdampingan dengan tinggi sama. */
function tileHTML(item, fill) {
  const pi = GALLERY_PHOTOS.indexOf(item), ar = fill ? '' : `aspect-ratio:${item.w}/${item.h}`;
  return `<button type="button" class="g-tile" style="${ar}" onclick="lb(${pi})" aria-label="Buka foto ${pi + 1}"><img src="${item.thumb || item.src}" alt="${escapeHTML(item.alt || 'Foto ' + (pi + 1))}" width="${item.w}" height="${item.h}" loading="lazy" decoding="async"></button>`;
}
const ratioOf = it => it.w / it.h;
function trioHTML(a, b, c) {
  const fr = (ratioOf(c) * (1 / ratioOf(a) + 1 / ratioOf(b))).toFixed(4);
  return `<div class="g-trio" style="grid-template-columns:1fr ${fr}fr"><div class="g-stack">${tileHTML(a)}${tileHTML(b)}</div>${tileHTML(c, true)}</div>`;
}
function pairHTML(a, b) {
  return `<div class="g-pair" style="grid-template-columns:${ratioOf(a).toFixed(4)}fr ${ratioOf(b).toFixed(4)}fr">${tileHTML(a)}${tileHTML(b)}</div>`;
}
function photoGroupHTML(items) {
  const out = []; let i = 0, n = items.length;
  while (n - i >= 3 && !((n - i) === 4)) { out.push(trioHTML(items[i], items[i + 1], items[i + 2])); i += 3; }
  if (n - i === 4) { out.push(pairHTML(items[i], items[i + 1]), pairHTML(items[i + 2], items[i + 3])); i += 4; }
  if (n - i === 2) { out.push(pairHTML(items[i], items[i + 1])); i += 2; }
  if (n - i === 1) out.push(`<div class="g-single">${tileHTML(items[i])}</div>`);
  return out.join('');
}

function galleryHTML() {
  const out = []; let run = [];
  const flush = () => { if (run.length) { out.push(`<div class="g-mosaic">${photoGroupHTML(run)}</div>`); run = []; } };
  GALLERY.forEach(item => {
    if (item.type === 'photo') run.push(item);
    else { flush(); out.push(videoCardHTML(item, GALLERY_VIDEOS.indexOf(item))); }
  });
  flush();
  return box('Album foto & video', '🖼️', `<div class="g-wrap">${out.join('')}</div><p class="g-hint">Ketuk foto untuk memperbesar · geser untuk foto berikutnya</p>`);
}

function galleryInit() {
  document.querySelectorAll('.g-video video').forEach(v => {
    const fig = v.closest('.g-video'), empty = fig.querySelector('.g-video-empty');
    v.addEventListener('error', () => { v.hidden = true; empty.hidden = false; });
    v.addEventListener('play', () => {
      document.querySelectorAll('.g-video video').forEach(o => { if (o !== v) o.pause(); });
      if (typeof musicState !== 'undefined' && musicState === 'playing') { _musicResume = true; setMusic(false); }
    });
    const back = () => {
      const anyPlaying = [...document.querySelectorAll('.g-video video')].some(o => !o.paused && !o.ended);
      if (_musicResume && !anyPlaying) { _musicResume = false; setMusic(true); }
    };
    v.addEventListener('pause', back); v.addEventListener('ended', back);
  });
}

function galleryCleanup() {
  closeLightbox();
  document.querySelectorAll('.g-video video').forEach(v => { try { v.pause(); } catch (_) { } });
  if (_musicResume) { _musicResume = false; setMusic(true); }
}

/* ---- Lightbox: rasio asli, tombol, swipe, keyboard ---- */
let _lbIndex = 0, _lbEl = null, _lbX = null;
function lb(i) {
  const n = GALLERY_PHOTOS.length; _lbIndex = (i + n) % n;
  const p = GALLERY_PHOTOS[_lbIndex];
  if (!_lbEl) {
    _lbEl = document.createElement('div'); _lbEl.id = 'lightbox'; _lbEl.setAttribute('role', 'dialog'); _lbEl.setAttribute('aria-modal', 'true');
    _lbEl.innerHTML = `<div class="lb-top"><span id="lbCount"></span><button type="button" class="lb-x" aria-label="Tutup foto">✕</button></div>
      <div class="lb-stage"><img id="lbImg" alt=""></div>
      <button type="button" class="lb-nav lb-prev" aria-label="Foto sebelumnya">‹</button>
      <button type="button" class="lb-nav lb-next" aria-label="Foto berikutnya">›</button>`;
    document.body.appendChild(_lbEl);
    _lbEl.addEventListener('click', e => {
      if (e.target.closest('.lb-x') || e.target.classList.contains('lb-stage') || e.target === _lbEl) closeLightbox();
      else if (e.target.closest('.lb-prev')) lb(_lbIndex - 1);
      else if (e.target.closest('.lb-next')) lb(_lbIndex + 1);
    });
    _lbEl.addEventListener('touchstart', e => { _lbX = e.touches[0].clientX; }, { passive: true });
    _lbEl.addEventListener('touchend', e => {
      if (_lbX == null) return; const dx = e.changedTouches[0].clientX - _lbX; _lbX = null;
      if (Math.abs(dx) > 50) lb(_lbIndex + (dx < 0 ? 1 : -1));
    });
  }
  const img = _lbEl.querySelector('#lbImg');
  img.classList.remove('in'); img.src = p.src; img.alt = p.alt || 'Foto ' + (_lbIndex + 1);
  img.onload = () => img.classList.add('in');
  _lbEl.querySelector('#lbCount').textContent = `${_lbIndex + 1} / ${n}`;
  [1, -1].forEach(d => { const q = GALLERY_PHOTOS[(_lbIndex + d + n) % n]; const pre = new Image(); pre.src = q.src; });
}
function closeLightbox() { if (_lbEl) { _lbEl.remove(); _lbEl = null; } }
window.addEventListener('keydown', e => {
  if (!_lbEl) return;
  if (e.key === 'Escape') { e.stopImmediatePropagation(); closeLightbox(); }
  else if (e.key === 'ArrowRight') { e.stopImmediatePropagation(); lb(_lbIndex + 1); }
  else if (e.key === 'ArrowLeft') { e.stopImmediatePropagation(); lb(_lbIndex - 1); }
}, true);


/* =====================================================================
   2) PHOTOBOOTH
   ===================================================================== */

/* Slot foto tiap frame (piksel pada file overlay). Lubang sudah transparan
   pada assets/frame/overlay/*.webp, jadi dekorasi frame tetap di atas foto.
   Semua slot berorientasi landscape, jadi pratinjau kamera memakai rasio
   slot yang sama persis dengan hasil akhir. */
const BOOTH_FRAMES = {
  'breaking-news': { name: 'Breaking News', fx: 'mono', s: 2, w: 537, h: 1494, slots: [[18, 372, 488, 326], [18, 722, 488, 326], [18, 1068, 488, 326]] },
  'doraemon': { name: 'Harvest Time', fx: 'pastel', s: 1, w: 960, h: 1600, slots: [[227, 260, 508, 322], [227, 672, 508, 322], [227, 1084, 508, 322]] },
  'mail': { name: 'Airmail', fx: 'vintage', s: 2, w: 368, h: 1104, slots: [[47, 37, 269, 187], [47, 261, 269, 187], [47, 486, 269, 187], [47, 711, 269, 187]] },
  'raw-memories': { name: 'Raw Memories', fx: 'film', s: 2, w: 371, h: 1102, slots: [[56, 184, 252, 183], [56, 384, 252, 183], [56, 586, 252, 183], [56, 787, 252, 183]] },
  'stardew': { name: 'Stardew', fx: 'pixel', s: 1, w: 800, h: 1600, slots: [[158, 214, 484, 322], [158, 614, 484, 322], [158, 1014, 484, 322]] }
};
const BOOTH_ORDER = ['breaking-news', 'doraemon', 'mail', 'raw-memories', 'stardew'];
const overlayURL = k => `assets/frame/overlay/${k}.webp`;

/* Efek kamera. Satu spesifikasi dipakai dua kali: sebagai CSS filter untuk
   pratinjau langsung dan sebagai olah piksel untuk foto hasil akhir. */
const BOOTH_FX = {
  normal: { label: 'Normal', px: {} },
  mono: { label: 'B&W Koran', px: { gray: 1, contrast: 1.25, bright: 1.03, vignette: .25, grain: .14 } },
  vintage: { label: 'Vintage', px: { sepia: .45, sat: 1.2, contrast: 1.05, bright: 1.05, vignette: .3, grain: .08 } },
  pastel: { label: 'Pastel', px: { bright: 1.1, sat: .88, contrast: .92, tint: [8, 4, 6] } },
  film: { label: 'Film', px: { contrast: 1.15, sat: 1.1, bright: .98, tint: [-4, 2, 10], vignette: .35, grain: .13 } },
  pixel: { label: 'Pixel', px: { pixel: 110, sat: 1.35, contrast: 1.12, post: 7 } }
};
function fxCSS(p) {
  const f = [];
  if (p.sepia) f.push(`sepia(${p.sepia})`); if (p.gray) f.push(`grayscale(${p.gray})`);
  if (p.sat != null) f.push(`saturate(${p.sat})`); if (p.contrast) f.push(`contrast(${p.contrast})`);
  if (p.bright) f.push(`brightness(${p.bright})`);
  return f.join(' ') || 'none';
}
function applyFxCanvas(canvas, p) {
  if (!p || !Object.keys(p).length) return;
  const w = canvas.width, h = canvas.height, ctx = canvas.getContext('2d');
  if (p.pixel) {
    const bs = Math.max(2, Math.round(w / p.pixel)), sw = Math.max(1, Math.round(w / bs)), sh = Math.max(1, Math.round(h / bs));
    const t = document.createElement('canvas'); t.width = sw; t.height = sh; t.getContext('2d').drawImage(canvas, 0, 0, sw, sh);
    ctx.imageSmoothingEnabled = false; ctx.clearRect(0, 0, w, h); ctx.drawImage(t, 0, 0, sw, sh, 0, 0, w, h); ctx.imageSmoothingEnabled = true;
  }
  const img = ctx.getImageData(0, 0, w, h), d = img.data;
  const cl = v => v < 0 ? 0 : v > 255 ? 255 : v;
  const tint = p.tint || [0, 0, 0], k = p.contrast || 1, br = p.bright || 1, sat = p.sat == null ? 1 : p.sat;
  const lv = p.post ? 255 / (p.post - 1) : 0;
  for (let y = 0, i = 0; y < h; y++) {
    const dy = (y / h - .5) * 2;
    for (let x = 0; x < w; x++, i += 4) {
      let r = d[i], g = d[i + 1], b = d[i + 2];
      if (p.sepia) {
        const a = p.sepia, tr = .393 * r + .769 * g + .189 * b, tg = .349 * r + .686 * g + .168 * b, tb = .272 * r + .534 * g + .131 * b;
        r = cl(r + (tr - r) * a); g = cl(g + (tg - g) * a); b = cl(b + (tb - b) * a);
      }
      if (p.gray) { const l = .299 * r + .587 * g + .114 * b; r += (l - r) * p.gray; g += (l - g) * p.gray; b += (l - b) * p.gray; }
      if (sat !== 1) { const l = .299 * r + .587 * g + .114 * b; r = cl(l + (r - l) * sat); g = cl(l + (g - l) * sat); b = cl(l + (b - l) * sat); }
      r = (r - 128) * k + 128; g = (g - 128) * k + 128; b = (b - 128) * k + 128;
      r = r * br + tint[0]; g = g * br + tint[1]; b = b * br + tint[2];
      if (lv) { r = Math.round(cl(r) / lv) * lv; g = Math.round(cl(g) / lv) * lv; b = Math.round(cl(b) / lv) * lv; }
      if (p.vignette) { const dx = (x / w - .5) * 2, f = 1 - p.vignette * Math.min(1, (dx * dx + dy * dy) / 2); r *= f; g *= f; b *= f; }
      if (p.grain) { const n = (Math.random() - .5) * p.grain * 255; r += n; g += n; b += n; }
      d[i] = r; d[i + 1] = g; d[i + 2] = b;
    }
  }
  ctx.putImageData(img, 0, 0);
}

/* ---- State ---- */
const booth = { frame: 'breaking-news', fx: 'mono', token: 0, busy: false, shots: [], overlays: {}, raf: 0 };
const cam = { stream: null, track: null, facing: 'user', zoom: null, devs: [], backDevs: [], ultraDev: null, mainDev: null, lens: 1 };
const bsleep = ms => new Promise(r => setTimeout(r, ms));

function boothHTML() {
  const frames = BOOTH_ORDER.map(k => `<button type="button" class="bt-frame${k === booth.frame ? ' on' : ''}" data-k="${k}" aria-pressed="${k === booth.frame}"><img src="${overlayURL(k)}" alt="" loading="lazy"><span>${BOOTH_FRAMES[k].name}</span></button>`).join('');
  const fx = Object.keys(BOOTH_FX).map(k => `<button type="button" class="bt-chip${k === booth.fx ? ' on' : ''}" data-fx="${k}">${BOOTH_FX[k].label}</button>`).join('');
  return box('Virtual photobox', '📷', `<div class="bt">
    <p class="bt-label">1 · Pilih frame</p>
    <div class="bt-frames" id="btFrames">${frames}</div>
    <p class="bt-label">2 · Atur kamera <small id="btRatio"></small></p>
    <div class="bt-view" id="btView">
      <div class="bt-media" id="btMedia"><video id="cam" playsinline muted autoplay></video><canvas id="camPix"></canvas></div>
      <div class="bt-vig" id="btVig"></div><div class="bt-grain" id="btGrain"></div>
      <div class="bt-corners" aria-hidden="true"></div>
      <div id="btBadge" class="bt-badge"></div><div id="btCount" aria-live="assertive"></div><div id="btFlash"></div>
    </div>
    <div class="bt-tools">
      <button type="button" class="bt-chip bt-flip" id="btFlip">🔄 Kamera belakang</button>
      <div class="bt-lens" id="btLens" hidden></div>
    </div>
    <p class="bt-label">3 · Efek kamera</p>
    <div class="bt-fx" id="btFx">${fx}</div>
    <button class="btn w-full mt-2" id="snap" type="button">📸 Mulai foto</button>
    <p id="pm" class="text-xs mt-2" role="status"></p>
    <div id="btResult" class="bt-result" hidden>
      <canvas id="strip"></canvas>
      <div class="bt-actions">
        <a id="dl" class="btn text-center" download="photostrip-hilman-intania.png" href="#">⬇ Simpan</a>
        <button id="btShare" class="btn" type="button" hidden>↗ Bagikan</button>
        <button id="btRetry" class="btn" type="button">↺ Ulangi</button>
      </div>
    </div></div>`);
}

function btNote(msg) { const e = $('#pm'); if (e) e.textContent = msg || ''; }

/* ---- Kamera ---- */
function stopStream() {
  if (cam.stream) cam.stream.getTracks().forEach(t => t.stop());
  cam.stream = null; cam.track = null; stream = null;
}
async function startCamera(opt = {}) {
  const myToken = booth.token;
  stopStream();
  const facing = opt.facing || cam.facing;
  const base = { width: { ideal: 2560 }, height: { ideal: 1440 } };
  const video = opt.deviceId ? { ...base, deviceId: { exact: opt.deviceId } } : { ...base, facingMode: { ideal: facing } };
  let s;
  try { s = await navigator.mediaDevices.getUserMedia({ video, audio: false }); }
  catch (e) {
    if (e && (e.name === 'NotAllowedError' || e.name === 'SecurityError')) throw e;
    s = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
  }
  if (myToken !== booth.token || !$('#cam')) { s.getTracks().forEach(t => t.stop()); return; }
  cam.stream = s; stream = s; cam.track = s.getVideoTracks()[0];
  const st = cam.track.getSettings ? cam.track.getSettings() : {};
  cam.facing = st.facingMode === 'environment' ? 'environment' : st.facingMode === 'user' ? 'user' : facing;
  const v = $('#cam'); v.srcObject = s; try { await v.play(); } catch (_) { }
  await analyzeLenses();
  if (opt.zoom) await applyZoom(opt.zoom);
  refreshCamUI();
}
async function analyzeLenses() {
  const caps = cam.track && cam.track.getCapabilities ? cam.track.getCapabilities() : {};
  cam.zoom = caps.zoom ? { min: caps.zoom.min, max: caps.zoom.max } : null;
  let devs = []; try { devs = (await navigator.mediaDevices.enumerateDevices()).filter(d => d.kind === 'videoinput'); } catch (_) { }
  cam.devs = devs;
  cam.backDevs = devs.filter(d => /back|rear|environment|belakang/i.test(d.label) && !/front|user|depan/i.test(d.label));
  cam.ultraDev = cam.backDevs.find(d => /ultra[\s-]?wide|0[.,]5/i.test(d.label)) || null;
  cam.mainDev = cam.backDevs.find(d => !/ultra|tele/i.test(d.label)) || null;
}
async function applyZoom(z) {
  if (!cam.track || !cam.zoom) return false;
  const v = Math.min(cam.zoom.max, Math.max(cam.zoom.min, z));
  try { await cam.track.applyConstraints({ advanced: [{ zoom: v }] }); return true; } catch (_) { return false; }
}
function currentLens() {
  const st = cam.track && cam.track.getSettings ? cam.track.getSettings() : {};
  if (cam.ultraDev && st.deviceId === cam.ultraDev.deviceId) return .5;
  if (st.zoom) return st.zoom <= .75 ? .5 : st.zoom >= 1.75 ? 2 : 1;
  return 1;
}
const canUltra = () => !!(cam.ultraDev || (cam.zoom && cam.zoom.min <= .6));
async function setLens(l) {
  btNote('');
  try {
    if (l === .5) {
      if (cam.ultraDev && cam.facing === 'environment') await startCamera({ deviceId: cam.ultraDev.deviceId, facing: 'environment' });
      else if (cam.zoom && cam.zoom.min <= .6) await applyZoom(.5);
      else { btNote('Ultra-wide 0.5x tidak dibuka oleh perangkat/browser ini. Coba kamera belakang di Chrome Android terbaru atau Safari iPhone (11 ke atas).'); return; }
    } else {
      const st = cam.track.getSettings(), onUltra = cam.ultraDev && st.deviceId === cam.ultraDev.deviceId;
      if (onUltra) await startCamera({ deviceId: cam.mainDev ? cam.mainDev.deviceId : undefined, facing: 'environment', zoom: l });
      else if (cam.zoom) await applyZoom(l);
      else if (l === 2) { btNote('Zoom 2x tidak tersedia di perangkat ini.'); return; }
    }
  } catch (e) { btNote('Lensa tidak dapat diganti. Coba lagi.'); }
  refreshCamUI();
}
function refreshCamUI() {
  const flip = $('#btFlip'), lens = $('#btLens'), v = $('#cam'); if (!flip || !v) return;
  const front = cam.facing === 'user';
  flip.textContent = front ? '🔄 Kamera belakang' : '🔄 Kamera depan';
  v.classList.toggle('mirror', front); $('#camPix').classList.toggle('mirror', front);
  const cur = currentLens(), showUltra = !front || canUltra(), has2 = !!(cam.zoom && cam.zoom.max >= 2);
  const opts = []; if (showUltra) opts.push(.5); opts.push(1); if (has2) opts.push(2);
  if (opts.length < 2) { lens.hidden = true; return; }
  lens.hidden = false;
  lens.innerHTML = opts.map(o => `<button type="button" class="bt-chip bt-lens-chip${o === cur ? ' on' : ''}${o === .5 && !canUltra() ? ' off' : ''}" data-l="${o}">${o === .5 ? '0.5x' : o + 'x'}</button>`).join('');
}
async function flipCamera() {
  if (booth.busy) return;
  const next = cam.facing === 'user' ? 'environment' : 'user';
  btNote('Mengganti kamera…');
  try {
    await startCamera({ facing: next });
    if (cam.facing !== next) btNote('Perangkat ini hanya memiliki satu kamera.'); else btNote('');
  } catch (e) { btNote('Kamera tidak dapat diganti.'); try { await startCamera({ facing: cam.facing }); } catch (_) { } }
}

/* ---- Frame, efek, pratinjau ---- */
function loadOverlay(k) {
  if (!booth.overlays[k]) booth.overlays[k] = new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = overlayURL(k); });
  return booth.overlays[k];
}
function slotRatio() { const s = BOOTH_FRAMES[booth.frame].slots[0]; return s[2] / s[3]; }
function applyFrameUI() {
  const f = BOOTH_FRAMES[booth.frame], view = $('#btView'); if (!view) return;
  view.style.aspectRatio = `${f.slots[0][2]} / ${f.slots[0][3]}`; view.style.setProperty('--r', slotRatio());
  $('#btRatio').textContent = `· ${f.slots.length} foto, rasio ${(slotRatio()).toFixed(2)}:1 (sama dengan hasil akhir)`;
  $('#snap').textContent = `📸 Mulai · ${f.slots.length} foto`;
  document.querySelectorAll('.bt-frame').forEach(b => { const on = b.dataset.k === booth.frame; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
  $('#btBadge').textContent = ''; $('#btResult').hidden = true;
  loadOverlay(booth.frame).catch(() => { });
  applyFxUI();
}
function applyFxUI() {
  const p = BOOTH_FX[booth.fx].px;
  $('#btMedia').style.filter = fxCSS(p);
  $('#btVig').style.opacity = p.vignette ? Math.min(1, p.vignette * 2.2) : 0;
  $('#btGrain').style.opacity = p.grain ? Math.min(1, p.grain * 3) : 0;
  const pix = $('#camPix'), cam_ = $('#cam');
  if (p.pixel) { pix.style.display = 'block'; pix.width = p.pixel; pix.height = Math.round(p.pixel / slotRatio()); startPixLoop(); }
  else { pix.style.display = 'none'; cancelAnimationFrame(booth.raf); booth.raf = 0; }
  document.querySelectorAll('#btFx .bt-chip').forEach(b => b.classList.toggle('on', b.dataset.fx === booth.fx));
}
function coverRect(vw, vh, ratio) {
  let sw = vw, sh = vw / ratio; if (sh > vh) { sh = vh; sw = vh * ratio; }
  return [(vw - sw) / 2, (vh - sh) / 2, sw, sh];
}
function startPixLoop() {
  cancelAnimationFrame(booth.raf);
  const pix = $('#camPix'), v = $('#cam'); if (!pix) return;
  const ctx = pix.getContext('2d');
  const loop = () => {
    if (!$('#camPix') || pix.style.display === 'none') return;
    if (v.videoWidth) { const [sx, sy, sw, sh] = coverRect(v.videoWidth, v.videoHeight, pix.width / pix.height); ctx.drawImage(v, sx, sy, sw, sh, 0, 0, pix.width, pix.height); }
    booth.raf = requestAnimationFrame(loop);
  };
  booth.raf = requestAnimationFrame(loop);
}

/* ---- Pengambilan foto ---- */
function captureShot(slotW, slotH, scale) {
  const v = $('#cam'), c = document.createElement('canvas'); c.width = Math.round(slotW * scale); c.height = Math.round(slotH * scale);
  const ctx = c.getContext('2d'), [sx, sy, sw, sh] = coverRect(v.videoWidth, v.videoHeight, slotW / slotH);
  if (cam.facing === 'user') { ctx.translate(c.width, 0); ctx.scale(-1, 1); }
  ctx.drawImage(v, sx, sy, sw, sh, 0, 0, c.width, c.height);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  applyFxCanvas(c, BOOTH_FX[booth.fx].px);
  return c;
}
async function composeStrip(shots, scale) {
  const f = BOOTH_FRAMES[booth.frame], ov = await loadOverlay(booth.frame), cv = $('#strip');
  cv.width = Math.round(f.w * scale); cv.height = Math.round(f.h * scale);
  const ctx = cv.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cv.width, cv.height);
  shots.forEach((s, i) => { const [x, y, w, h] = f.slots[i]; ctx.drawImage(s, Math.round(x * scale), Math.round(y * scale), Math.round(w * scale), Math.round(h * scale)); });
  ctx.imageSmoothingQuality = 'high'; ctx.drawImage(ov, 0, 0, cv.width, cv.height);
  return cv;
}
async function runBooth() {
  const v = $('#cam');
  if (booth.busy) return;
  if (!v || !v.videoWidth) { btNote('Kamera belum siap. Tunggu sebentar lalu coba lagi.'); return; }
  const f = BOOTH_FRAMES[booth.frame], n = f.slots.length, token = booth.token, scale = f.s;
  booth.busy = true; $('#snap').disabled = true; $('#btResult').hidden = true;
  document.querySelectorAll('#btFrames button,#btFx button,#btFlip,#btLens button').forEach(b => b.disabled = true);
  const shots = [], count = $('#btCount'), badge = $('#btBadge'), flash = $('#btFlash');
  try {
    for (let i = 0; i < n; i++) {
      badge.textContent = `Foto ${i + 1}/${n}`; btNote(`Bersiap… foto ${i + 1} dari ${n}`);
      for (let c = 3; c >= 1; c--) { count.textContent = c; count.classList.remove('pop'); void count.offsetWidth; count.classList.add('pop'); await bsleep(1000); if (token !== booth.token) return; }
      count.textContent = ''; flash.classList.remove('go'); void flash.offsetWidth; flash.classList.add('go');
      shots.push(captureShot(f.slots[i][2], f.slots[i][3], scale));
      await bsleep(350); if (token !== booth.token) return;
    }
    badge.textContent = '';
    const cv = await composeStrip(shots, scale);
    const blob = await new Promise(r => cv.toBlob(r, 'image/png'));
    if (booth.url) URL.revokeObjectURL(booth.url);
    booth.url = URL.createObjectURL(blob); booth.blob = blob;
    $('#dl').href = booth.url;
    $('#btShare').hidden = !(navigator.canShare && navigator.canShare({ files: [new File([blob], 'photostrip.png', { type: 'image/png' })] }));
    $('#btResult').hidden = false; $('#btResult').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    btNote(`Selesai! Frame ${f.name} dengan efek ${BOOTH_FX[booth.fx].label}.`);
  } catch (e) {
    console.error('Gagal membuat photostrip:', e); btNote('Photostrip gagal dibuat. Coba ambil foto kembali.');
  } finally {
    count.textContent = ''; booth.busy = false;
    const s = $('#snap'); if (s) s.disabled = false;
    document.querySelectorAll('#btFrames button,#btFx button,#btFlip,#btLens button').forEach(b => b.disabled = false);
  }
}

async function boothInit() {
  booth.token++; booth.busy = false;
  const root = $('.bt'); if (!root) return;
  booth.fx = BOOTH_FRAMES[booth.frame].fx;
  applyFrameUI();
  $('#btFrames').onclick = e => {
    const b = e.target.closest('.bt-frame'); if (!b || booth.busy) return;
    booth.frame = b.dataset.k; booth.fx = BOOTH_FRAMES[booth.frame].fx; applyFrameUI();
  };
  $('#btFx').onclick = e => { const b = e.target.closest('.bt-chip'); if (!b || booth.busy) return; booth.fx = b.dataset.fx; applyFxUI(); };
  $('#btFlip').onclick = flipCamera;
  $('#btLens').onclick = e => { const b = e.target.closest('.bt-lens-chip'); if (b && !booth.busy) setLens(parseFloat(b.dataset.l)); };
  $('#snap').onclick = runBooth;
  $('#btRetry').onclick = () => { $('#btResult').hidden = true; btNote(''); $('#btView').scrollIntoView({ behavior: 'smooth', block: 'nearest' }); };
  $('#btShare').onclick = async () => {
    try { await navigator.share({ files: [new File([booth.blob], 'photostrip-hilman-intania.png', { type: 'image/png' })], title: 'Photostrip Hilman T & Intania D' }); } catch (_) { }
  };
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    btNote('Fitur kamera membutuhkan HTTPS atau localhost dan browser yang mendukung.'); $('#snap').disabled = true; return;
  }
  try { await startCamera({ facing: 'user' }); btNote(''); }
  catch (e) { btNote('Kamera tidak dapat diakses. Izinkan akses kamera di browser, lalu buka kembali photobox.'); $('#snap').disabled = true; }
}
function boothStop() {
  booth.token++; booth.busy = false; cancelAnimationFrame(booth.raf); booth.raf = 0;
  stopStream();
  if (booth.url) { URL.revokeObjectURL(booth.url); booth.url = null; }
}
