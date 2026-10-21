
    /* ===== DATA: ganti sesuai kebutuhan ===== */
    const C = {
      a: 'Hilman Taufik', b: 'Resti Intania Denas', date: new Date('2026-11-08T09:00:00+07:00'),
      venue: '', addr: 'Jl. Saluyu A XV No.4, Cipamokolan, Kec. Rancasari, Kota Bandung, Jawa Barat 40292',
      ig: ['@iammann._', '@_tatanduttt'], ortu: [['Bpk. Nana Suryana', 'Ibu. Sri Maolina'], ['Bpk. Nasrul Aswadi (Alm)', 'Ibu. Nenden Wake Rohmaet']],
      bank: [['BCA', '1393 122 700', 'Hilman Taufik'], ['DANA', '0815-7305-8734', 'Resti Intania Denas']]
    };
    const $ = s => document.querySelector(s);
    $('#to').textContent = new URLSearchParams(location.search).get('to') || 'Tamu Undangan';

    /* ===== COZY 2.5D GARDEN MAP ===== */
    const WW = 900, WH = 594;
    const world = document.createElement('canvas'); world.width = WW; world.height = WH;
    const g = world.getContext('2d', { alpha: false });
    g.fillStyle = '#a9c995'; g.fillRect(0, 0, WW, WH);
    const mapArt = new Image();
    mapArt.onload = () => {
      g.clearRect(0, 0, WW, WH);
      g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
      g.drawImage(mapArt, 0, 0, WW, WH);
    };
    mapArt.onerror = () => console.warn('Aset garden-map.webp tidak dapat dimuat.');
    mapArt.src = 'assets/garden-map.webp';

    const POIS = [
      // Coordinates are mapped to the new 900 × 594 garden illustration.
      // x/y = safe standing points on stone paths; lx/ly = floating nameplate positions.
      { k: 'pasangan', n: 'Pasangan House', short: 'Pasangan', e: '💍', t: 'Temui pengantin di rumah pasangan', x: 162, y: 224, lx: 161, ly: 112 },
      { k: 'acara', n: 'Acara Gazebo', short: 'Acara', e: '💐', t: 'Lihat detail akad di gazebo', x: 448, y: 132, lx: 449, ly: 43 },
      { k: 'galeri', n: 'Galeri Gallery', short: 'Galeri', e: '🖼️', t: 'Jelajahi galeri foto', x: 710, y: 219, lx: 712, ly: 105 },
      { k: 'ucapan', n: 'Ucapan Mailbox', short: 'Ucapan', e: '💌', t: 'Tinggalkan ucapan untuk pengantin', x: 790, y: 326, lx: 790, ly: 244 },
      { k: 'hadiah', n: 'Hadiah Gift Shop', short: 'Hadiah', e: '🎁', t: 'Buka kotak hadiah', x: 744, y: 477, lx: 746, ly: 391 },
      { k: 'photobox', n: 'Photobox Photo Booth', short: 'Photobox', e: '📷', t: 'Ambil foto kenangan', x: 178, y: 482, lx: 174, ly: 389 }
    ];

    /* ===== MAP-ALIGNED WALKABLE PATH MASK + ROUTING =====
       The road mask follows the stone walkways of the supplied 1230 × 812 illustration.
       Player's feet position may only enter the white path area, never the grass/garden beds.
    */
    const WALK_CELL = 4;
    const WALK_COLS = Math.ceil(WW / WALK_CELL), WALK_ROWS = Math.ceil(WH / WALK_CELL);
    const walkMask = document.createElement('canvas');
    walkMask.width = WW; walkMask.height = WH;
    const wm = walkMask.getContext('2d', { willReadFrequently: true });
    wm.fillStyle = '#000'; wm.fillRect(0, 0, WW, WH);
    wm.lineCap = 'round'; wm.lineJoin = 'round'; wm.strokeStyle = '#fff';
    function roadShape(width, drawPath) {
      wm.beginPath(); drawPath(wm); wm.lineWidth = width; wm.stroke();
    }

    // Main loop follows the stone lane OUTSIDE the planted beds around the fountain.
    // These coordinates are in the same 900 x 594 coordinate space as the rendered map.
    roadShape(30, p => {
      p.moveTo(450, 198);
      p.bezierCurveTo(417, 201, 389, 217, 356, 239);
      p.bezierCurveTo(337, 263, 315, 296, 300, 326);
      p.bezierCurveTo(298, 353, 323, 389, 347, 417);
      p.bezierCurveTo(380, 438, 418, 444, 450, 443);
      p.bezierCurveTo(482, 444, 520, 437, 556, 417);
      p.bezierCurveTo(582, 389, 600, 355, 606, 326);
      p.bezierCurveTo(610, 300, 588, 261, 570, 239);
      p.bezierCurveTo(536, 216, 496, 201, 450, 198);
    });

    // Acara Gazebo: central stairway joins the main loop.
    roadShape(32, p => {
      p.moveTo(450, 94);
      p.bezierCurveTo(450, 125, 450, 171, 450, 198);
    });

    // Pasangan House: descend the front steps, curve to the right, then join the upper-left loop.
    roadShape(32, p => {
      p.moveTo(160, 190);
      p.bezierCurveTo(161, 220, 160, 251, 163, 270);
      p.bezierCurveTo(168, 291, 185, 302, 207, 306);
      p.bezierCurveTo(234, 308, 255, 297, 281, 280);
      p.bezierCurveTo(305, 260, 326, 253, 340, 263);
    });

    // Galeri Gallery: stairs bend westwards and join the upper-right loop.
    roadShape(32, p => {
      p.moveTo(710, 177);
      p.bezierCurveTo(713, 207, 711, 226, 700, 242);
      p.bezierCurveTo(682, 254, 656, 258, 634, 256);
      p.bezierCurveTo(604, 255, 582, 245, 570, 239);
    });

    // Ucapan Mailbox: horizontal path from the right side of the loop, with a short access spur.
    roadShape(32, p => {
      p.moveTo(606, 326);
      p.bezierCurveTo(632, 326, 666, 326, 708, 326);
      p.bezierCurveTo(741, 326, 770, 326, 796, 326);
    });
    roadShape(29, p => {
      p.moveTo(790, 326);
      p.bezierCurveTo(790, 315, 790, 303, 790, 292);
    });

    // Main southern exit and lower fork.
    roadShape(34, p => {
      p.moveTo(450, 443);
      p.bezierCurveTo(450, 474, 450, 526, 450, 594);
    });

    // Photobox: follow the lower-left cobblestone bend and terminate outside the booth entrance.
    roadShape(32, p => {
      p.moveTo(386, 431);
      p.bezierCurveTo(377, 442, 359, 458, 337, 476);
      p.bezierCurveTo(321, 490, 304, 500, 281, 508);
      p.bezierCurveTo(254, 515, 225, 511, 201, 503);
      p.bezierCurveTo(188, 495, 179, 484, 176, 470);
      p.bezierCurveTo(170, 460, 170, 452, 170, 446);
    });

    // Hadiah Gift Shop: lower-right cobblestone bend ends by the front steps.
    roadShape(32, p => {
      p.moveTo(514, 431);
      p.bezierCurveTo(524, 440, 544, 457, 565, 475);
      p.bezierCurveTo(583, 488, 604, 499, 625, 506);
      p.bezierCurveTo(649, 513, 674, 513, 696, 508);
      p.bezierCurveTo(719, 501, 735, 490, 744, 477);
    });

    const walkPixels = wm.getImageData(0, 0, WW, WH).data;
    const walkGrid = new Uint8Array(WALK_COLS * WALK_ROWS);
    for (let gy = 0; gy < WALK_ROWS; gy++) {
      for (let gx = 0; gx < WALK_COLS; gx++) {
        const px = gx * WALK_CELL + Math.floor(WALK_CELL / 2);
        const py = gy * WALK_CELL + Math.floor(WALK_CELL / 2);
        const inside = px > 0 && py > 0 && px < WW - 1 && py < WH - 1;
        walkGrid[gy * WALK_COLS + gx] = inside && walkPixels[(py * WW + px) * 4] > 127 ? 1 : 0;
      }
    }
    function isWalkable(x, y) {
      if (x < 1 || y < 1 || x >= WW - 1 || y >= WH - 1) return false;
      return walkPixels[(Math.round(y) * WW + Math.round(x)) * 4] > 127;
    }
    function segmentWalkable(x1, y1, x2, y2) {
      const distance = Math.hypot(x2 - x1, y2 - y1);
      const steps = Math.max(1, Math.ceil(distance / 1.25));
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        if (!isWalkable(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t)) return false;
      }
      return true;
    }
    function nearestWalkCell(x, y, requireLineOfSight = true, maxRadius = 40) {
      const ox = cl(Math.floor(x / WALK_CELL), 0, WALK_COLS - 1);
      const oy = cl(Math.floor(y / WALK_CELL), 0, WALK_ROWS - 1);
      let best = -1, bestD = Infinity;
      // Destination markers may sit beside a path rather than exactly on its rasterized
      // pixels. For goals, allow routing through the road network to the nearest road cell;
      // for the player start, prefer a directly connected cell to avoid crossing garden beds.
      for (let r = 0; r <= maxRadius; r++) {
        for (let gy = Math.max(0, oy - r); gy <= Math.min(WALK_ROWS - 1, oy + r); gy++) {
          for (let gx = Math.max(0, ox - r); gx <= Math.min(WALK_COLS - 1, ox + r); gx++) {
            if (r > 0 && Math.abs(gx - ox) !== r && Math.abs(gy - oy) !== r) continue;
            const idx = gy * WALK_COLS + gx;
            if (!walkGrid[idx]) continue;
            const point = cellPoint(idx);
            const d = (point.x - x) ** 2 + (point.y - y) ** 2;
            if (d >= bestD) continue;
            if (requireLineOfSight && !segmentWalkable(x, y, point.x, point.y)) continue;
            best = idx;
            bestD = d;
          }
        }
        // Stop expanding once we have a candidate close to the current search ring.
        if (best >= 0 && bestD <= ((r + 1) * WALK_CELL) ** 2) break;
      }
      return best;
    }

    function cellPoint(idx) {
      const gx = idx % WALK_COLS, gy = Math.floor(idx / WALK_COLS);
      return {
        x: cl(gx * WALK_CELL + WALK_CELL / 2, 1, WW - 2),
        y: cl(gy * WALK_CELL + WALK_CELL / 2, 1, WH - 2)
      };
    }
    function findWalkPath(start, goal) {
      if (start < 0 || goal < 0 || !walkGrid[start] || !walkGrid[goal]) return [];
      if (start === goal) return [cellPoint(start)];

      const total = WALK_COLS * WALK_ROWS;
      const prev = new Int32Array(total); prev.fill(-2);
      const gScore = new Float32Array(total); gScore.fill(Infinity);
      const closed = new Uint8Array(total);
      const goalX = goal % WALK_COLS, goalY = Math.floor(goal / WALK_COLS);
      const heuristic = idx => Math.hypot((idx % WALK_COLS) - goalX, Math.floor(idx / WALK_COLS) - goalY);
      // Binary min-heap keeps route search fast enough for touch controls on phones.
      const heap = [];
      function heapPush(node, score) {
        let i = heap.length; heap.push({ node, score });
        while (i > 0) {
          const parent = (i - 1) >> 1;
          if (heap[parent].score <= score) break;
          heap[i] = heap[parent]; i = parent;
        }
        heap[i] = { node, score };
      }
      function heapPop() {
        if (!heap.length) return null;
        const root = heap[0], tail = heap.pop();
        if (heap.length) {
          let i = 0;
          while (true) {
            let child = i * 2 + 1;
            if (child >= heap.length) break;
            if (child + 1 < heap.length && heap[child + 1].score < heap[child].score) child++;
            if (heap[child].score >= tail.score) break;
            heap[i] = heap[child]; i = child;
          }
          heap[i] = tail;
        }
        return root;
      }

      gScore[start] = 0; prev[start] = -1; heapPush(start, heuristic(start));
      const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
      let found = false;
      while (heap.length) {
        const item = heapPop(), cur = item.node;
        if (closed[cur]) continue;
        closed[cur] = 1;
        if (cur === goal) { found = true; break; }

        const cx = cur % WALK_COLS, cy = Math.floor(cur / WALK_COLS);
        const from = cellPoint(cur);
        for (const [dx, dy] of dirs) {
          const nx = cx + dx, ny = cy + dy;
          if (nx < 0 || ny < 0 || nx >= WALK_COLS || ny >= WALK_ROWS) continue;
          const ni = ny * WALK_COLS + nx;
          if (!walkGrid[ni] || closed[ni]) continue;
          // No diagonal corner cutting through a grass corner.
          if (dx && dy && (!walkGrid[cy * WALK_COLS + nx] || !walkGrid[ny * WALK_COLS + cx])) continue;
          const to = cellPoint(ni);
          // Critical safety check: route edges themselves must lie on the walk mask,
          // not just have walkable start/end cells.
          if (!segmentWalkable(from.x, from.y, to.x, to.y)) continue;
          const tentative = gScore[cur] + (dx && dy ? Math.SQRT2 : 1);
          if (tentative >= gScore[ni]) continue;
          prev[ni] = cur; gScore[ni] = tentative;
          heapPush(ni, tentative + heuristic(ni));
        }
      }
      if (!found || prev[goal] === -2) return [];

      const cells = [];
      for (let i = goal; i !== -1; i = prev[i]) cells.push(i);
      cells.reverse();
      const points = cells.map(cellPoint);
      if (points.length <= 2) return points;

      // Pull route corners only if every pixel along the shortcut stays walkable.
      const smoothed = [points[0]];
      let anchor = 0;
      while (anchor < points.length - 1) {
        let next = anchor + 1;
        for (let candidate = points.length - 1; candidate > anchor + 1; candidate--) {
          if (segmentWalkable(points[anchor].x, points[anchor].y, points[candidate].x, points[candidate].y)) {
            next = candidate; break;
          }
        }
        smoothed.push(points[next]);
        anchor = next;
      }
      return smoothed;
    }

    /* ===== ENGINE: camera, touch/keyboard movement, illustrated character sprites ===== */
    const app = $('#app'), cv = $('#cv'), v = cv.getContext('2d', { alpha: false });
    const sprite = { m: new Image(), f: new Image() };
    sprite.m.src = 'assets/guest-boy.png'; sprite.f.src = 'assets/guest-girl.png';
    let DPR = 1, ZOOM = 1, cw = 320, ch = 640;
    function fit() {
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      ZOOM = Math.max(.72, Math.min(app.clientWidth / 275, app.clientHeight / 560));
      cw = app.clientWidth / ZOOM; ch = app.clientHeight / ZOOM;
      cv.width = Math.round(app.clientWidth * DPR); cv.height = Math.round(app.clientHeight * DPR);
      cv.style.width = '100%'; cv.style.height = '100%';
    }
    addEventListener('resize', fit, { passive: true }); fit();
    const P = { x: 450, y: 568 }, CAM = { x: 0, y: 0 }, K = {}, J = { x: 0, y: 0 };
    let started = false, hero = 'f', face = 1, moving = false, tgt = null, autoPath = [], autoKey = null, near = null, modalOn = false, walkPhase = 0, camReady = false;
    let autoDestination = null, autoRepathCount = 0, autoBlockedTime = 0;
    const velocity = { x: 0, y: 0 };
    let walkDirX = 0, walkDirY = 1, blockedHintAt = 0;
    addEventListener('keydown', e => { K[e.key.toLowerCase()] = 1; if (e.key === 'Escape' && modalOn) { closeM(); return } if (started && !modalOn && ['enter', 'e', ' '].includes(e.key.toLowerCase())) { e.preventDefault(); act() } if (started && !modalOn && ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(e.key.toLowerCase())) e.preventDefault() });
    addEventListener('keyup', e => K[e.key.toLowerCase()] = 0);
    const js = $('#joy'), kn = $('#knob'); let jid = null;
    function mv(e) { const r = js.getBoundingClientRect(); let dx = (e.clientX - r.left - r.width / 2) / (r.width / 2), dy = (e.clientY - r.top - r.height / 2) / (r.height / 2), m = Math.hypot(dx, dy); if (m > 1) { dx /= m; dy /= m } if (m < .12) dx = dy = 0; J.x = dx; J.y = dy; kn.style.transform = `translate(${dx * 25}px,${dy * 25}px)` }
    js.onpointerdown = e => { jid = e.pointerId; js.setPointerCapture(jid); mv(e) };
    js.onpointermove = e => { if (e.pointerId === jid) mv(e) };
    js.onpointerup = js.onpointercancel = () => { jid = null; J.x = J.y = 0; kn.style.transform = '' };
    const cl = (a, b, c) => Math.max(b, Math.min(c, a));
    function planAutoRoute(o, isRecovery = false) {
      if (!o) return false;
      let startCell = nearestWalkCell(P.x, P.y, true, 12);
      // Small recovery for raster-edge drift: re-seat the feet on the closest road cell
      // only when it is very nearby. This prevents a route from failing after a tiny collision.
      if (startCell < 0) {
        const nearby = nearestWalkCell(P.x, P.y, false, 5);
        if (nearby >= 0) {
          const snap = cellPoint(nearby);
          if (Math.hypot(snap.x - P.x, snap.y - P.y) <= 20) {
            P.x = snap.x; P.y = snap.y;
            startCell = nearby;
          }
        }
      }
      // Goal snapping is intentionally not line-of-sight constrained: a marker can be
      // on a doorstep or beside a flowerbed, while A* still follows the connected stone path.
      const goalCell = nearestWalkCell(o.x, o.y, false, 40);
      const cells = findWalkPath(startCell, goalCell);
      if (!cells.length) {
        tgt = null; autoPath = []; autoKey = null; autoDestination = null;
        velocity.x = velocity.y = 0;
        showMiniToast('Jalur ke lokasi belum tersambung. Coba dekati jalan batu.');
        return false;
      }
      autoDestination = o;
      if (!isRecovery) autoRepathCount = 0;
      autoBlockedTime = 0;
      // Keep the route's first point. The player first joins the centre of the current road cell,
      // then follows validated straight segments from waypoint to waypoint.
      autoPath = cells.slice();
      autoKey = o.k;
      tgt = autoPath.shift() || null;
      velocity.x = velocity.y = 0;
      if (!tgt) {
        const key = autoKey;
        autoKey = null; autoDestination = null;
        if (key) open(key);
      }
      return true;
    }
    function requestWalkTo(o) {
      planAutoRoute(o, false);
    }
    function recoverAutoRoute() {
      if (!autoDestination) return false;
      if (autoRepathCount < 3) {
        autoRepathCount++;
        return planAutoRoute(autoDestination, true);
      }
      tgt = null; autoPath = []; autoKey = null; autoDestination = null;
      velocity.x = velocity.y = 0;
      showMiniToast('Karakter berhenti agar tidak keluar jalur. Coba pilih lokasi sekali lagi.');
      return false;
    }
    function finishAutoWaypoint() {
      if (autoPath.length) {
        tgt = autoPath.shift();
        return;
      }
      const key = autoKey;
      tgt = null; autoKey = null; autoDestination = null;
      velocity.x = velocity.y = 0;
      if (key) open(key);
    }
    function moveAlongRoad(dx, dy) {
      const nx = cl(P.x + dx, 4, WW - 5), ny = cl(P.y + dy, 4, WH - 5);
      if (segmentWalkable(P.x, P.y, nx, ny)) { P.x = nx; P.y = ny; return true; }
      // Axis sliding makes the avatar follow a bend without allowing a step through grass.
      let moved = false;
      if (segmentWalkable(P.x, P.y, nx, P.y)) { P.x = nx; moved = true; }
      else if (Math.abs(dx) > .01) velocity.x = 0;
      if (segmentWalkable(P.x, P.y, P.x, ny)) { P.y = ny; moved = true; }
      else if (Math.abs(dy) > .01) velocity.y = 0;
      if (!moved && (Math.abs(dx) + Math.abs(dy)) > .4) {
        const now = performance.now();
        if (now - blockedHintAt > 1900) {
          blockedHintAt = now;
          showMiniToast('🌿 Rumput tidak bisa diinjak — ikuti jalur batu.');
        }
      }
      return moved;
    }
    function step(dt) {
      moving = false;
      if (!started || modalOn) return;

      // Keyboard/joystick controls cancel auto-walk and accelerate smoothly.
      let vx = (K.d || K.arrowright ? 1 : 0) - (K.a || K.arrowleft ? 1 : 0) + J.x;
      let vy = (K.s || K.arrowdown ? 1 : 0) - (K.w || K.arrowup ? 1 : 0) + J.y;
      let inputMagnitude = Math.hypot(vx, vy);
      const blend = 1 - Math.exp(-dt * 15);

      if (inputMagnitude > .08) {
        tgt = null; autoPath = []; autoKey = null; autoDestination = null; autoRepathCount = 0; autoBlockedTime = 0;
        if (inputMagnitude > 1) { vx /= inputMagnitude; vy /= inputMagnitude; }
        velocity.x += (vx * 104 - velocity.x) * blend;
        velocity.y += (vy * 104 - velocity.y) * blend;
        walkDirX = vx; walkDirY = vy;
        if (Math.abs(vx) > .08) face = vx < 0 ? -1 : 1;
        moveAlongRoad(velocity.x * dt, velocity.y * dt);
      } else if (tgt) {
        const dx = tgt.x - P.x, dy = tgt.y - P.y, d = Math.hypot(dx, dy);
        if (d <= 1.25) {
          // Only snap to a waypoint when both the endpoint and the final tiny segment are valid.
          if (isWalkable(tgt.x, tgt.y) && segmentWalkable(P.x, P.y, tgt.x, tgt.y)) {
            P.x = tgt.x; P.y = tgt.y;
            autoBlockedTime = 0;
            finishAutoWaypoint();
          } else {
            autoBlockedTime += dt;
            if (autoBlockedTime >= .20) recoverAutoRoute();
          }
        } else {
          // Deterministic waypoint movement: cap the step at the remaining distance so the
          // character can never overshoot a turn or oscillate around a target.
          const dirX = dx / d, dirY = dy / d;
          const travel = Math.min(108 * dt, d);
          const nx = P.x + dirX * travel, ny = P.y + dirY * travel;
          walkDirX = dirX; walkDirY = dirY;
          if (Math.abs(dirX) > .08) face = dirX < 0 ? -1 : 1;
          if (segmentWalkable(P.x, P.y, nx, ny)) {
            P.x = nx; P.y = ny;
            velocity.x = dirX * 108; velocity.y = dirY * 108;
            autoBlockedTime = 0;
          } else {
            velocity.x = velocity.y = 0;
            autoBlockedTime += dt;
            // Recovery is throttled: a one-frame raster edge must not trigger multiple A* searches.
            if (autoBlockedTime >= .25) recoverAutoRoute();
          }
        }
      } else {
        const damping = Math.exp(-dt * 12);
        velocity.x *= damping; velocity.y *= damping;
        moveAlongRoad(velocity.x * dt, velocity.y * dt);
      }

      moving = Math.hypot(velocity.x, velocity.y) > 7;
      if (moving) walkPhase += dt * 8.8;

      const n = POIS.find(o => Math.hypot(P.x - o.x, P.y - o.y) < 44) || null;
      if (n !== near) {
        near = n;
        const toast = $('#toast');
        toast.classList.toggle('hidden', !n);
        if (n) toast.innerHTML = `${n.e} <b>${n.t}</b> <span class="text-xs opacity-70">· tekan SENTUH</span>`;
        document.querySelectorAll('#nav button').forEach(b => b.classList.toggle('on', !!n && b.dataset.k === n.k));
      }
    }
    function rr(ctx, x, y, w, h, r, fill, stroke) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); if (fill) { ctx.fillStyle = fill; ctx.fill() } if (stroke) { ctx.strokeStyle = stroke; ctx.stroke() } }
    function drawNameplate(o, cx, cy, active) {
      const x = o.lx - cx, y = o.ly - cy, label = `${o.e}  ${o.n}`;
      v.save(); v.font = '800 11px Nunito, sans-serif'; v.textAlign = 'center'; v.textBaseline = 'middle';
      const w = Math.max(82, Math.min(188, v.measureText(label).width + 22)), h = 25;
      v.shadowColor = 'rgba(47,62,42,.17)'; v.shadowBlur = 7; v.shadowOffsetY = 2;
      rr(v, x - w / 2, y - h / 2, w, h, 10, active ? '#fff0c7' : '#fffaf0', active ? '#c38c60' : '#dcc5a4');
      v.shadowColor = 'transparent'; v.shadowBlur = 0; v.shadowOffsetY = 0;
      v.fillStyle = '#4f6552'; v.fillText(label, x, y + .5, w - 12); v.restore();
    }
    function drawHero(x, y, t) {
      const img = sprite[hero];
      const gait = moving ? walkPhase : 0;
      const bounce = moving ? Math.abs(Math.sin(gait * 2)) * 2.3 : Math.sin(t * 1.6) * .55;
      const lateral = moving ? Math.sin(gait * 2) * 1.15 : Math.sin(t * 1.1) * .18;
      const bodyLean = moving ? (walkDirX * .022 + Math.sin(gait) * .018) : Math.sin(t * 1.15) * .006;
      const legSwing = moving ? Math.sin(gait * 2) * .045 : Math.sin(t * 1.2) * .004;

      v.save();
      v.translate(x, y);
      const heroScale = window.matchMedia('(max-width: 640px)').matches ? .49 : .67;
      v.scale(heroScale, heroScale);
      // Ground shadow breathes subtly while the character walks.
      v.fillStyle = 'rgba(48,62,45,.23)';
      v.beginPath();
      v.ellipse(0, 0, moving ? 14 + Math.abs(Math.sin(gait * 2)) * 1.8 : 13, 4.4, 0, 0, Math.PI * 2);
      v.fill();

      // Tiny alternating shoe/step marks help the movement read as a walk at game scale.
      if (moving) {
        const foot = Math.sin(gait * 2);
        v.globalAlpha = .28 + Math.abs(foot) * .12;
        v.fillStyle = '#e9d9b9';
        v.beginPath(); v.ellipse(-foot * 4.2, -1.3, 2.1, 1.05, -.15, 0, Math.PI * 2); v.fill();
        v.beginPath(); v.ellipse(foot * 4.2, 1.1, 2.1, 1.05, .15, 0, Math.PI * 2); v.fill();
        v.globalAlpha = 1;
      }

      v.translate(lateral, -bounce);
      v.scale(face, 1);
      v.rotate(bodyLean);
      if (img && img.complete && img.naturalWidth) {
        const h = 91;
        const w = h * img.naturalWidth / img.naturalHeight;
        // Animate the lower part around the hips: leg sway for the groom and a gentle skirt sway for the bride.
        // The upper part is drawn over the seam, keeping the original chibi illustration intact.
        const splitRatio = hero === 'm' ? .685 : .775;
        const splitY = Math.floor(img.height * splitRatio);
        const overlapY = Math.min(img.height, splitY + Math.max(8, Math.round(img.height * .018)));
        const pivotY = -h + h * splitRatio;
        v.save();
        v.translate(moving ? Math.sin(gait * 2) * 1.35 : Math.sin(t) * .12, pivotY);
        v.rotate(legSwing);
        v.drawImage(img, 0, splitY, img.width, img.height - splitY,
          -w / 2, 0, w, h * (1 - splitRatio));
        v.restore();
        v.drawImage(img, 0, 0, img.width, overlapY,
          -w / 2, -h, w, h * (overlapY / img.height));
      } else {
        v.fillStyle = '#f6d9c9';
        v.beginPath(); v.arc(0, -60, 12, 0, Math.PI * 2); v.fill();
        v.fillStyle = hero === 'f' ? '#fff2dc' : '#f7eee1';
        rr(v, -12, -48, 24, 38, 8, v.fillStyle);
      }
      v.restore();
    }
    function draw(t) {
      v.setTransform(DPR, 0, 0, DPR, 0, 0); v.fillStyle = '#d9e7d2'; v.fillRect(0, 0, cv.width / DPR, cv.height / DPR);
      v.setTransform(DPR * ZOOM, 0, 0, DPR * ZOOM, 0, 0); v.imageSmoothingEnabled = true; v.imageSmoothingQuality = 'high';
      const tx = cl(P.x - cw / 2, 0, Math.max(0, WW - cw)), ty = cl(P.y - ch * .56, 0, Math.max(0, WH - ch));
      if (!camReady) { CAM.x = tx; CAM.y = ty; camReady = true } else { CAM.x += (tx - CAM.x) * .14; CAM.y += (ty - CAM.y) * .14 }
      const cx = CAM.x, cy = CAM.y; v.drawImage(world, -cx, -cy);
      // Fixed labels above each destination, with a warm-paper sign treatment.
      POIS.forEach(o => drawNameplate(o, cx, cy, o === near));
      // Slow, subtle pollen motes preserve the dreamy garden atmosphere.
      for (let i = 0; i < 8; i++) { const wx = (i * 113 + Math.sin(t * .34 + i) * 15 + WW) % WW, wy = (i * 79 + t * 3.5) % WH; v.globalAlpha = .16 + .13 * Math.sin(t * 1.2 + i); v.fillStyle = '#fff8d9'; v.beginPath(); v.arc(wx - cx, wy - cy, 1.4, 0, Math.PI * 2); v.fill() } v.globalAlpha = 1;
      drawHero(P.x - cx, P.y - cy, t);
      if (near) { const x = near.x - cx, y = near.y - cy - 48; v.strokeStyle = 'rgba(255,240,190,.85)'; v.lineWidth = 1.5; v.beginPath(); v.ellipse(x, y, 25 + Math.sin(t * 3) * 2, 10 + Math.sin(t * 3) * 1.2, 0, 0, Math.PI * 2); v.stroke() }
    }
    let last = 0, raf = 0; function loop(ts) { if (document.hidden) { raf = 0; return } const dt = Math.min(.05, (ts - last) / 1000 || 0); last = ts; step(dt); draw(ts / 1000); raf = requestAnimationFrame(loop) }
    function resumeLoop() { if (!document.hidden && !raf) { last = 0; raf = requestAnimationFrame(loop) } }
    document.addEventListener('visibilitychange', () => { if (document.hidden) { if (raf) cancelAnimationFrame(raf); raf = 0 } else resumeLoop() }); resumeLoop();

    /* ===== NAV & HUD ===== */
    $('#nav').innerHTML = POIS.filter(o => o.k != 'musik').map(o => `<button data-k="${o.k}" title="${o.n}" aria-label="Buka ${o.n}"><span class="text-lg">${o.e}</span><small>${o.n.split(' ')[0]}</small></button>`).join('');
    $('#nav').onclick = e => { const b = e.target.closest('button'); if (!b || modalOn) return; const o = POIS.find(p => p.k === b.dataset.k); requestWalkTo(o); };
    const act = () => near && open(near.k); $('#toast').onclick = $('#act').onclick = act;
    // Tap/click near a labeled building to walk there; the interaction opens on arrival.
    cv.addEventListener('pointerup', e => {
      if (!started || modalOn) return;
      const r = cv.getBoundingClientRect();
      const wx = (e.clientX - r.left) / ZOOM + CAM.x;
      const wy = (e.clientY - r.top) / ZOOM + CAM.y;
      let picked = null, best = Infinity;
      for (const o of POIS) {
        const d = Math.min(Math.hypot(wx - o.x, wy - o.y), Math.hypot(wx - o.lx, wy - o.ly));
        if (d < 92 && d < best) { picked = o; best = d; }
      }
      if (picked) requestWalkTo(picked);
    });
    $('#chat').onclick = () => open('chat');
    document.querySelectorAll('.chr').forEach(b => b.onclick = () => { hero = b.dataset.c; document.querySelectorAll('.chr').forEach(x => { x.classList.toggle('sel', x == b); x.setAttribute('aria-pressed', x == b ? 'true' : 'false'); }) });
    $('#go').onclick = () => { started = true; $('#cover').style.display = 'none'; $('#hud').classList.remove('hidden'); setMusic(true); showMiniToast('Musik mulai disiapkan 🎵'); };

    /* ===== MUSIC: LOCAL MP3 FIRST, VISIBLE YOUTUBE FALLBACK =====
       Put a licensed audio file at musik/lagu-cinta.mp3 for the most reliable background music.
       A YouTube URL cannot be assigned to <audio>; if the MP3 is missing, show a visible YouTube player.
    */
    const YOUTUBE_VIDEO_ID = '4U13TPI5G2o';
    const YOUTUBE_URL = 'https://youtu.be/4U13TPI5G2o';
    const localMusic = $('#musik');
    let ytPlayer = null, ytApiLoading = false, ytPlayerReady = false;
    let musicDesired = false, musicState = 'idle', musicProvider = 'none', localMusicUnavailable = false;

    function updateMusicButton() {
      const button = $('#mus');
      if (!button) return;
      button.dataset.on = musicState === 'playing' ? '1' : '0';
      button.setAttribute('aria-pressed', musicState === 'playing' ? 'true' : 'false');
      if (musicState === 'playing') {
        button.textContent = '🎵 Musik ON'; button.title = 'Jeda musik';
      } else if (musicState === 'loading') {
        button.textContent = '⏳ Memuat musik'; button.title = 'Sedang menyiapkan musik';
      } else if (musicState === 'blocked') {
        button.textContent = '▶ Putar musik'; button.title = 'Tekan lagi atau tekan ▶ pada pemutar YouTube';
      } else if (musicState === 'error') {
        button.textContent = '↗ Buka YouTube'; button.title = 'Video tidak dapat diputar di dalam website';
      } else {
        button.textContent = '🔇 Musik OFF'; button.title = 'Putar musik';
      }
    }

    function handleYoutubeError(event) {
      musicState = 'error'; musicDesired = false; updateMusicButton();
      const embedBlocked = event && (event.data === 101 || event.data === 150);
      showMiniToast(embedBlocked
        ? 'Video ini tidak mengizinkan pemutaran di website. Tambahkan MP3 berizin ke folder musik/.'
        : 'Pemutar YouTube gagal. Periksa koneksi internet atau gunakan file MP3 lokal.');
    }

    function createYouTubePlayer() {
      if (ytPlayer || !window.YT || !window.YT.Player) return;
      // Reveal the real player viewport before asking YouTube to initialize.
      $('#ytMusicHost').classList.add('visible');
      ytPlayer = new window.YT.Player('ytMusicMount', {
        width: '200', height: '200', videoId: YOUTUBE_VIDEO_ID,
        playerVars: {
          autoplay: 0, controls: 1, disablekb: 0, loop: 1,
          playlist: YOUTUBE_VIDEO_ID, playsinline: 1, rel: 0
        },
        events: {
          onReady: event => {
            ytPlayerReady = true;
            event.target.setVolume(72);
            if (musicDesired && musicProvider === 'youtube') {
              try { event.target.unMute(); event.target.playVideo(); }
              catch (_) { musicState = 'blocked'; updateMusicButton(); }
            }
          },
          onStateChange: event => {
            const S = window.YT.PlayerState;
            if (event.data === S.PLAYING) {
              musicProvider = 'youtube'; musicState = 'playing'; musicDesired = true;
            } else if (event.data === S.PAUSED) {
              musicState = 'paused'; musicDesired = false;
            } else if (event.data === S.BUFFERING) {
              musicState = 'loading';
            } else if (event.data === S.ENDED) {
              if (musicDesired) event.target.playVideo();
              else musicState = 'paused';
            }
            updateMusicButton();
          },
          onAutoplayBlocked: () => {
            musicState = 'blocked'; updateMusicButton();
            showMiniToast('Browser menahan autoplay. Tekan ▶ langsung pada pemutar YouTube yang tampil.');
          },
          onError: handleYoutubeError
        }
      });
    }

    function ensureYouTubeApi() {
      if (window.YT && window.YT.Player) {
        if (musicDesired && musicProvider === 'youtube') createYouTubePlayer();
        return;
      }
      if (ytApiLoading) return;
      ytApiLoading = true;
      const previousReady = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (typeof previousReady === 'function') previousReady();
        ytApiLoading = false;
        if (musicDesired && musicProvider === 'youtube') createYouTubePlayer();
      };
      let script = document.querySelector('script[data-youtube-iframe-api]');
      if (!script) {
        script = document.createElement('script');
        script.src = 'https://www.youtube.com/iframe_api'; script.async = true;
        script.dataset.youtubeIframeApi = 'true';
        script.onerror = () => {
          script.remove(); ytApiLoading = false; musicState = 'error'; updateMusicButton();
          showMiniToast('YouTube gagal dimuat. Coba internet lain atau tambahkan MP3 lokal.');
        };
        document.head.appendChild(script);
      }
    }

    async function setMusic(on) {
      if (!on) {
        musicDesired = false;
        try { localMusic.pause(); } catch (_) { }
        if (ytPlayer && ytPlayerReady) ytPlayer.pauseVideo();
        musicState = 'paused'; updateMusicButton(); return;
      }

      musicDesired = true; musicState = 'loading'; updateMusicButton();

      // HTMLAudio is the most reliable option, but it needs a real MP3 file in this folder.
      if (!localMusicUnavailable) {
        try {
          localMusic.volume = 0.72;
          const playResult = localMusic.play();
          if (playResult && typeof playResult.then === 'function') await playResult;
          if (localMusic.paused) throw new Error('Audio tidak mulai diputar');
          musicProvider = 'local'; musicState = 'playing';
          $('#ytMusicHost').classList.remove('visible'); updateMusicButton();
          return;
        } catch (error) {
          localMusicUnavailable = true;
          try { localMusic.pause(); } catch (_) { }
        }
      }

      // No usable local MP3: use the given YouTube video, but show the actual player so it can be tapped.
      musicProvider = 'youtube';
      $('#ytMusicHost').classList.add('visible');
      updateMusicButton();
      if (window.YT && window.YT.Player) {
        if (!ytPlayer) createYouTubePlayer();
        else if (ytPlayerReady) {
          try { ytPlayer.unMute(); ytPlayer.setVolume(72); ytPlayer.playVideo(); }
          catch (_) { musicState = 'blocked'; updateMusicButton(); }
        }
      } else {
        ensureYouTubeApi();
      }
      showMiniToast('File MP3 belum tersedia atau gagal diputar. Pemutar YouTube ditampilkan; jika belum berbunyi, tekan ▶ pada pemutar.');
    }

    $('#mus').onclick = () => {
      if (musicState === 'error' && musicProvider === 'youtube') {
        window.open(YOUTUBE_URL, '_blank', 'noopener,noreferrer');
        return;
      }
      setMusic(musicState !== 'playing');
    };
    $('#closeYoutube').onclick = () => {
      if (ytPlayer && ytPlayerReady) ytPlayer.pauseVideo();
      $('#ytMusicHost').classList.remove('visible');
      if (musicProvider === 'youtube') { musicDesired = false; musicState = 'paused'; updateMusicButton(); }
    };
    localMusic.addEventListener('play', () => {
      if (musicProvider === 'local') { musicState = 'playing'; musicDesired = true; updateMusicButton(); }
    });
    // Warm the API only; actual player creation is delayed until the fallback is needed.
    ensureYouTubeApi();
    addEventListener('pagehide', () => {
      try { localMusic.pause(); } catch (_) { }
      if (ytPlayer && ytPlayerReady) ytPlayer.pauseVideo();
      clearInterval(iv);
      if (stream) stream.getTracks().forEach(t => t.stop());
    });

    /* ===== MODAL ===== */
    const head = (t, e) => `<div class="flex items-center justify-between mb-2"><b>${e} ${t}</b><button class="btn !py-0 !px-2" onclick="closeM()" aria-label="Tutup">✕</button></div>`;
    const box = (t, e, b) => `<div class="px p-3 pop">${head(t, e)}${b}</div>`;
    const tile = ['#f7dfe5,#e8afc1', '#fbf0cc,#e7c88c', '#e0eef5,#a9ccdf', '#e6f1dd,#b5d5a5', '#ece4f7,#c9b5e7', '#fbe5d8,#f0b99b'];
    let iv, stream, gi = 0, stk = '💖';
    const GUESTBOOK_STORAGE_KEY = 'hilman-resti-guestbook-v1';
    // Keep empty until configured. Only a Supabase publishable/anon key belongs in public frontend code; never use service_role here.
    const SUPABASE_URL = 'https://mchmthlhybaiheodiapj.supabase.co';
    const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_Xv0hpSdXXopAropmWo7yTg_HaXDvsfB';
    let supabaseClient = null;
    try {
      if (SUPABASE_URL.trim() && SUPABASE_PUBLISHABLE_KEY.trim() && window.supabase?.createClient) {
        supabaseClient = window.supabase.createClient(SUPABASE_URL.trim(), SUPABASE_PUBLISHABLE_KEY.trim());
      }
    } catch (error) { console.warn('Supabase belum dapat diinisialisasi:', error); }
    function loadLocalMessages() {
      try {
        const saved = JSON.parse(localStorage.getItem(GUESTBOOK_STORAGE_KEY) || '[]');
        if (Array.isArray(saved)) return saved.filter(row => Array.isArray(row) && row.length >= 3 && row.slice(0, 3).every(value => typeof value === 'string')).slice(0, 100);
      } catch (error) { console.warn('Penyimpanan lokal tidak tersedia:', error); }
      return [];
    }
    function saveLocalMessages() {
      try { localStorage.setItem(GUESTBOOK_STORAGE_KEY, JSON.stringify(msgs.slice(0, 100))); return true; }
      catch (error) { console.warn('Gagal menyimpan ucapan ke browser:', error); return false; }
    }
    let msgs = loadLocalMessages();
    const M = {
      pasangan: () => box('Pasangan bahagia', '💍', `<div class="pair-grid">${[['Mempelai pria', C.a, C.ig[0], C.ortu[0], 'assets/groom.png'], ['Mempelai wanita', C.b, C.ig[1], C.ortu[1], 'assets/bride.png']].map(([r, n, i, o, img]) => `<div class="card text-center"><div class="pair-art"><img src="${img}" alt="${r}"></div><p class="text-xs mt-3" style="color:var(--wine)">${r}</p><h3 class="font-semibold mt-1">${n}</h3><p class="text-[10px] opacity-80 mt-2 leading-relaxed">Putra/putri dari<br>${o[0]}<br>&amp; ${o[1]}</p><p class="text-xs mt-2">📸 ${i}</p></div>`).join('')}</div>`),
      acara: () => box('Acara', '📅', `<div class="card text-center mb-2"><p class="text-sm">Minggu, 8 November 2026</p><div id="cd" class="text-2xl font-semibold my-1" style="color:var(--wine)"></div></div>
  <div class="card mb-2"><b>Akad nikah</b><br>Pukul 09.00 WIB – Selesai </div>
  <div class="card mb-2"><b>${C.venue}</b><br><span class="text-sm">${C.addr}</span></div>
  <a class="btn block text-center" target="_blank" rel="noopener" href="https://www.google.com/maps/search/${encodeURIComponent(C.venue + ' ' + C.addr)}">📍 Buka peta</a>`),
      galeri: () => box('Album foto', '🖼️', `<div class="grid grid-cols-3 gap-2">${tile.map((c, i) => `<button class="gallery-tile text-3xl" style="border:3px solid var(--gold);background:linear-gradient(160deg,${c})" onclick="lb(${i})" aria-label="Foto ${i + 1}">${['🤵👰', '💍', '🥂', '🌹', '💐', '🎂'][i]}</button>`).join('')}</div><p class="text-xs mt-2 opacity-70">Ganti kotak ini dengan foto prewedding Anda (tag &lt;img&gt;).</p>`),
      ucapan: () => box('Ucapan &amp; RSVP', '💌', `<input id="nm" class="in mb-2" placeholder="Nama tamu"><textarea id="ms" rows="3" maxlength="180" class="in mb-2" placeholder="Tulis ucapan"></textarea>
  <select id="rs" class="in mb-2"><option>Hadir</option><option>Berhalangan hadir</option><option>Masih ragu</option></select>
  <div id="stks" class="flex gap-1 mb-2 flex-wrap">${['💖', '💍', '🥂', '🎂', '🌹', '🙏', '🎉', '😍'].map(s => `<button class="card !p-1 text-xl" onclick="stk='${s}';sk()">${s}</button>`).join('')}</div>
  <button class="btn w-full" onclick="send()">Kirim ucapan &amp; RSVP</button><p id="guestbookHint" class="text-[10px] mt-2 opacity-70">Ucapan tersimpan di browser ini sampai database online dihubungkan.</p><div id="list" class="mt-3"></div>`),
      hadiah: () => box('Kotak hadiah', '🎁', C.bank.map(([b, n, a]) => b === 'DANA'
        ? `<div class="card mb-2 text-center"><b>${b} · ${a}</b><p class="text-sm mt-1 mb-2">Pindai QRIS berikut untuk mengirim hadiah digital.</p><a href="assets/qris-resti.png" target="_blank" rel="noopener" aria-label="Buka gambar QRIS ukuran penuh"><img src="assets/qris-resti.png" alt="Barcode QRIS untuk hadiah digital" loading="lazy" style="display:block;width:100%;max-width:420px;height:auto;margin:0 auto;border-radius:10px;background:#fff"></a><p class="text-xs mt-2 opacity-75">Ketuk gambar untuk membuka QRIS ukuran penuh.</p></div>`
        : `<div class="card mb-2"><b>${b}</b> · ${a}<div class="text-xl my-1">${n}</div><button class="btn !py-1 text-sm" onclick="copyBank('${n}',this)">Salin nomor</button></div>`).join('')),
      photobox: () => box('Virtual photobox', '📷', `<video id="cam" playsinline muted class="w-full rounded bg-black" style="transform:scaleX(-1);max-height:42vh;object-fit:contain"></video><label class="block text-sm mt-3 mb-1" for="frameMotif">Motif bingkai foto</label><select id="frameMotif" class="in"><option value="floral">🌸 Floral klasik</option><option value="botanical">🌿 Botanical</option><option value="hearts">💕 Romantic hearts</option><option value="classic">✦ Classic gold</option></select><p class="text-xs opacity-75 mt-1">Pilih motif dekorasi pada bingkai photostrip.</p><button class="btn w-full mt-2" id="snap">Ambil 3 foto</button><p id="pm" class="text-xs mt-2" role="status"></p><canvas id="strip" class="hidden w-full max-w-xs mx-auto mt-3 rounded-lg" style="height:auto"></canvas><a id="dl" class="btn hidden block text-center mt-2" download="photostrip.png">Simpan photostrip</a>`),
      chat: () => box('Sapa tamu', '💬', '<p class="text-sm">Selamat datang! Dekati penanda di peta untuk membuka detail setiap bagian. 🌸</p>')
    };
    function open(k) {
      if (k == 'musik') { setMusic($('#mus').dataset.on != '1'); return } modalOn = true; $('#mbody').innerHTML = M[k](); $('#modal').classList.add('open');
      if (k == 'acara') { const t = () => { let d = Math.max(0, C.date - Date.now()), s = Math.floor(d / 1e3); $('#cd').textContent = `${Math.floor(s / 86400)}h ${Math.floor(s % 86400 / 3600)}j ${Math.floor(s % 3600 / 60)}m ${s % 60}d` }; t(); iv = setInterval(t, 1000) }
      if (k == 'ucapan') { sk(); rl(); if (supabaseClient) refreshRemoteMessages(); if ($('#guestbookHint')) $('#guestbookHint').textContent = supabaseClient ? 'Ucapan tersimpan online dan terlihat oleh semua tamu.' : 'Mode lokal: ucapan hanya tersimpan di browser/perangkat ini. Hubungkan Supabase agar semua tamu melihatnya.'; } if (k == 'photobox') pb()
    }
    function closeM() { modalOn = false; clearInterval(iv); stream && stream.getTracks().forEach(t => t.stop()); stream = null; $('#modal').classList.remove('open') }
    $('#modal').onclick = e => { if (e.target.id == 'modal') closeM() };
    function lb(i) {
      gi = (i + 6) % 6;
      const icons = ['🤵👰', '💍', '🥂', '🌹', '💐', '🎂'];
      $('#mbody').innerHTML = `<div class="px p-3">
        <div class="flex items-center justify-between gap-2 mb-3"><strong>Foto ${gi + 1}/6</strong><button class="btn !py-1 !px-3" type="button" onclick="closeM()" aria-label="Tutup galeri">✕ Tutup</button></div>
        <button type="button" class="w-full h-72 rounded-lg flex items-center justify-center text-7xl" style="border:4px solid var(--gold);background:linear-gradient(160deg,${tile[gi]});cursor:zoom-out" onclick="closeM()" aria-label="Klik foto untuk menutup">${icons[gi]}</button>
        <p class="text-xs text-center mt-2 opacity-70">Klik foto untuk menutup pratinjau.</p>
        <div class="flex gap-2 mt-2"><button class="btn flex-1" onclick="lb(${gi - 1})">◀ Sebelumnya</button><button class="btn flex-1" onclick="lb(${gi + 1})">Berikutnya ▶</button></div>
      </div>`;
    }
    function sk() { document.querySelectorAll('#stks button').forEach(b => b.style.outline = b.textContent == stk ? '3px solid var(--wine)' : '') }
    function escapeHTML(value) {
      return String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
    }
    function rl() {
      const list = $('#list'); if (!list) return;
      const safe = msgs.map(([name, message, emoji]) => `<div class="card mb-2"><b>${escapeHTML(name)}</b> <span class="text-xl">${escapeHTML(emoji)}</span><br><span class="text-sm">${escapeHTML(message)}</span></div>`).join('');
      list.innerHTML = `<p class="text-xs mb-2">Ucapan dari para tamu (${msgs.length})</p>` + (safe || '<div class="card text-sm opacity-75">Belum ada ucapan. Jadilah yang pertama mengirim doa 💌</div>');
    }
    async function refreshRemoteMessages() {
      if (!supabaseClient) return;
      try {
        const { data, error } = await supabaseClient.from('wedding_messages')
          .select('name,message,attendance,emoji,created_at').order('created_at', { ascending: false }).limit(100);
        if (error) throw error;
        msgs = (data || []).map(row => [String(row.name || ''), `${String(row.message || '')} (${String(row.attendance || 'RSVP belum diisi')})`, String(row.emoji || '💖')]);
        rl();
      } catch (error) {
        console.error('Gagal memuat ucapan online:', error);
        showMiniToast('Ucapan online gagal dimuat. Periksa konfigurasi Supabase.');
      }
    }
    async function copyBank(value, button) {
      const old = button.textContent;
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(value);
        } else {
          const field = document.createElement('textarea');
          field.value = value; field.setAttribute('readonly', '');
          field.style.position = 'fixed'; field.style.opacity = '0'; field.style.left = '-9999px';
          document.body.appendChild(field); field.select();
          const ok = document.execCommand('copy'); field.remove();
          if (!ok) throw new Error('Clipboard tidak tersedia');
        }
        button.textContent = 'Tersalin ✓';
        showMiniToast('Nomor rekening berhasil disalin');
        setTimeout(() => { if (button.isConnected) button.textContent = old; }, 1800);
      } catch (_) {
        showMiniToast('Salin nomor rekening secara manual ya');
      }
    }
    let miniToastTimer;
    function showMiniToast(message) {
      let el = $('#miniToast');
      if (!el) { el = document.createElement('div'); el.id = 'miniToast'; el.className = 'mini-toast'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
      el.textContent = message; el.classList.add('show'); clearTimeout(miniToastTimer);
      miniToastTimer = setTimeout(() => el.classList.remove('show'), 2300);
    }
    async function send() {
      const name = $('#nm').value.trim();
      const message = $('#ms').value.trim();
      const attendance = $('#rs').value;
      if (!name || !message) { alert('Isi nama dan ucapan terlebih dahulu.'); return; }
      if (name.length > 80 || message.length > 300) { alert('Nama maksimal 80 karakter dan ucapan maksimal 300 karakter.'); return; }

      if (supabaseClient) {
        try {
          const { error } = await supabaseClient.from('wedding_messages').insert({ name, message, attendance, emoji: stk });
          if (error) throw error;
          $('#nm').value = ''; $('#ms').value = '';
          await refreshRemoteMessages();
          showMiniToast('Ucapan berhasil disimpan online 💌');
        } catch (error) {
          console.error('Gagal menyimpan ucapan online:', error);
          showMiniToast('Ucapan belum terkirim online. Data di formulir tetap ada; coba lagi.');
        }
        return;
      }

      // Fallback works before deployment, but is private to the same browser/device.
      msgs.unshift([name, `${message} (${attendance})`, stk]);
      msgs = msgs.slice(0, 100);
      const saved = saveLocalMessages();
      $('#nm').value = ''; $('#ms').value = '';
      rl();
      showMiniToast(saved ? 'Ucapan tersimpan di browser ini, belum online.' : 'Browser tidak mengizinkan penyimpanan lokal.');
    }
    async function pb() {
      const c = $('#cam'), snapButton = $('#snap'), status = $('#pm');
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        status.textContent = 'Fitur kamera membutuhkan HTTPS atau localhost dan browser yang mendukung.';
        snapButton.disabled = true;
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: false
        });
        c.srcObject = stream;
        await c.play();
        if (!c.videoWidth || !c.videoHeight) {
          await new Promise(resolve => {
            const ready = () => { c.removeEventListener('loadedmetadata', ready); resolve(); };
            c.addEventListener('loadedmetadata', ready, { once: true });
          });
        }
      } catch (e) {
        status.textContent = 'Kamera tidak dapat diakses. Izinkan akses kamera di browser, lalu buka kembali photobox.';
        snapButton.disabled = true;
        return;
      }

      snapButton.onclick = async () => {
        if (!c.videoWidth || !c.videoHeight) {
          status.textContent = 'Kamera belum siap. Tunggu sebentar lalu coba lagi.';
          return;
        }
        snapButton.disabled = true;
        const canvas = $('#strip'), ctx = canvas.getContext('2d');
        const motifInput = $('#frameMotif');
        const frameMotif = motifInput ? motifInput.value : 'floral';
        // Keep the camera's native aspect ratio; only scale it to a practical output width.
        const sourceW = c.videoWidth, sourceH = c.videoHeight;
        const photoW = Math.min(480, Math.max(240, sourceW));
        const photoH = Math.round(photoW * sourceH / sourceW);
        const pad = Math.max(12, Math.round(photoW * .055));
        const gap = Math.max(8, Math.round(photoW * .035));
        const footerH = Math.max(42, Math.round(photoW * .16));
        canvas.width = photoW + pad * 2;
        canvas.height = pad * 2 + photoH * 3 + gap * 2 + footerH;
        canvas.classList.remove('hidden');
        $('#dl').classList.add('hidden');
        const palettes = { floral: ['#fff5e9', '#b76e79', '#e6b8bd'], botanical: ['#f2f4e8', '#4f7558', '#a8b99a'], hearts: ['#fff0f3', '#b84d68', '#e7a0b1'], classic: ['#fbf0d3', '#9b773e', '#d8bd7b'] };
        const palette = palettes[frameMotif] || palettes.floral;
        ctx.fillStyle = palette[0];
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // Draw a motif-specific decorative frame around the strip and each photo.
        const drawMotif = (x, y, w, h, step) => {
          ctx.save(); ctx.fillStyle = palette[1]; ctx.strokeStyle = palette[1];
          ctx.lineWidth = Math.max(1.5, photoW / 180);
          ctx.strokeRect(x + 2, y + 2, w - 4, h - 4);
          const symbols = { floral: '✿', botanical: '❧', hearts: '♥', classic: '✦' };
          ctx.font = `${Math.max(10, Math.round(photoW * .045))}px serif`;
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          for (let px = x + step / 2; px < x + w; px += step) {
            ctx.fillText(symbols[frameMotif] || '✿', px, y + step * .35);
            ctx.fillText(symbols[frameMotif] || '✿', px, y + h - step * .35);
          }
          ctx.restore();
        };
        drawMotif(0, 0, canvas.width, canvas.height, Math.max(20, Math.round(photoW * .12)));

        try {
          for (let i = 0; i < 3; i++) {
            status.textContent = `Bersiap… foto ${i + 1}/3`;
            await new Promise(resolve => setTimeout(resolve, 1200));
            const y = pad + i * (photoH + gap);
            ctx.save();
            // Mirror the captured photo to match the live selfie preview.
            ctx.translate(pad + photoW, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(c, 0, y, photoW, photoH);
            ctx.restore();
            // Fine inner border makes the individual frames read clearly.
            ctx.strokeStyle = 'rgba(85,55,43,.22)';
            ctx.lineWidth = Math.max(1, photoW / 300);
            ctx.strokeRect(pad + .5, y + .5, photoW - 1, photoH - 1);
            drawMotif(pad - 3, y - 3, photoW + 6, photoH + 6, Math.max(22, Math.round(photoW * .14)));
          }
          ctx.fillStyle = '#7a2335';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.font = `600 ${Math.max(12, Math.round(photoW * .043))}px sans-serif`;
          ctx.fillText('Hilman & Resti · 08.11.2026', canvas.width / 2, canvas.height - footerH / 2, canvas.width - pad * 2);
          $('#dl').href = canvas.toDataURL('image/png');
          $('#dl').classList.remove('hidden');
          status.textContent = 'Selesai! Motif bingkai dan rasio kamera sudah diterapkan.';
        } catch (error) {
          console.error('Gagal membuat photostrip:', error);
          status.textContent = 'Photostrip gagal dibuat. Coba ambil foto kembali.';
        } finally {
          snapButton.disabled = false;
        }
      };
    }
