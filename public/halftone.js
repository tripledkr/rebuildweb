/* 하프톤 워드마크 — [data-halftone] 요소에 캔버스로 대형 워드마크를 점으로 출력합니다.
   원본 아이디어: 21st.dev Halftone Wordmark Footer (React). 바닐라 JS로 이식.
   데이터 속성: data-word, data-bg, data-ink, data-warm, data-gap, data-crop, data-radius */
(function () {
  function hex(v) {
    var m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec((v || '').trim());
    if (!m) return [255, 255, 255];
    var h = m[1].length === 3 ? m[1].split('').map(function (c) { return c + c; }).join('') : m[1];
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }

  function init(root) {
    var canvas = root.querySelector('.hwf__canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var word = root.dataset.word || 'studio';
    var bg = root.dataset.bg || '#0A0E18';
    var inkHex = root.dataset.ink || '#E8E8EA';
    var ink = hex(inkHex);
    var warm = hex(root.dataset.warm || '#5A7DFF');
    var gap = Math.max(3, Number(root.dataset.gap) || 6);
    var crop = Math.max(0, Math.min(0.6, Number(root.dataset.crop) || 0.22));
    var pushR = Number(root.dataset.radius) || 90;
    var face = "800 100px 'Pretendard Variable', Pretendard, system-ui, sans-serif";

    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var w = 0, h = 0, dpr = 1, px = -1e5, py = -1e5;
    var raf = 0, visible = true, awake = true;
    var ring = { x: 0, y: 0, t: -1 };
    var dots = new Float32Array(0), count = 0, grain = null;

    function layout() {
      var rect = root.getBoundingClientRect();
      w = Math.max(1, Math.round(rect.width));
      h = Math.max(1, Math.round(rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);

      var g = w < 760 ? Math.max(3, Math.round(gap * w / 1100)) : gap;
      var mask = document.createElement('canvas');
      mask.width = w; mask.height = h;
      var m = mask.getContext('2d', { willReadFrequently: true });
      if (!m) return;
      m.font = face;
      var base = m.measureText(word).width;
      var fit = base > 0 ? (w * 1.02 / base) * 100 : 0;
      m.font = face.replace('100px', fit + 'px');
      var box = m.measureText(word);
      var cap = box.actualBoundingBoxAscent || fit * 0.72;
      m.fillStyle = '#000';
      m.textBaseline = 'alphabetic';
      m.fillText(word, (w - box.width) / 2, h + cap * crop);
      var img = m.getImageData(0, 0, w, h).data;

      var cols = Math.ceil(w / g), rows = Math.ceil(h / g), tmp = [];
      for (var gy = 0; gy < rows; gy++) {
        for (var gx = 0; gx < cols; gx++) {
          var sum = 0;
          for (var sy = 0; sy < 3; sy++) {
            for (var sx = 0; sx < 3; sx++) {
              var x = Math.min(w - 1, Math.floor(gx * g + ((sx + 0.5) * g) / 3));
              var y = Math.min(h - 1, Math.floor(gy * g + ((sy + 0.5) * g) / 3));
              sum += img[(y * w + x) * 4 + 3];
            }
          }
          var cov = sum / (9 * 255);
          if (cov < 0.06) continue;
          var hx = gx * g + g / 2, hy = gy * g + g / 2;
          tmp.push(hx, hy, 0, 0, hx, hy, Math.sqrt(cov) * g * 0.56);
        }
      }
      dots = new Float32Array(tmp);
      count = tmp.length / 7;

      grain = document.createElement('canvas');
      grain.width = 256; grain.height = 256;
      var g = grain.getContext('2d');
      if (g) {
        var id = g.createImageData(256, 256);
        for (var i = 0; i < id.data.length; i += 4) {
          var v = Math.random() * 255;
          id.data[i] = id.data[i + 1] = id.data[i + 2] = v;
          id.data[i + 3] = Math.random() < 0.5 ? 0 : 255;
        }
        g.putImageData(id, 0, 0);
      }
      awake = true;
    }

    function draw(now) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      var r = reduced ? 0 : pushR;
      var ringAge = ring.t < 0 ? 1e9 : now - ring.t;
      var ringR = ringAge * 0.9;
      var moving = false;

      for (var i = 0; i < count; i++) {
        var j = i * 7;
        var x = dots[j], y = dots[j + 1], vx = dots[j + 2], vy = dots[j + 3];
        var hx = dots[j + 4], hy = dots[j + 5];

        if (!reduced) {
          if (ringAge < 900) {
            var rdx = hx - ring.x, rdy = hy - ring.y;
            var rd = Math.sqrt(rdx * rdx + rdy * rdy) + 0.001;
            var band = 1 - Math.min(1, Math.abs(rd - ringR) / 26);
            if (band > 0) {
              var rf = band * 3.2 * (1 - ringAge / 900);
              vx += (rdx / rd) * rf; vy += (rdy / rd) * rf;
            }
          }
          var ddx = x - px, ddy = y - py, d2 = ddx * ddx + ddy * ddy;
          if (r > 0 && d2 < r * r) {
            var d = Math.sqrt(d2) + 0.001;
            var f = (1 - d / r) * 2.6;
            vx += (ddx / d) * f; vy += (ddy / d) * f;
          }
          vx = (vx + (hx - x) * 0.05) * 0.84;
          vy = (vy + (hy - y) * 0.05) * 0.84;
          x += vx; y += vy;
          if (Math.abs(vx) + Math.abs(vy) > 0.02 || Math.abs(x - hx) + Math.abs(y - hy) > 0.05) moving = true;
          else { x = hx; y = hy; vx = 0; vy = 0; }
          dots[j] = x; dots[j + 1] = y; dots[j + 2] = vx; dots[j + 3] = vy;
        }

        var k = Math.min(1, Math.hypot(x - hx, y - hy) / 28);
        ctx.fillStyle = k > 0.02
          ? 'rgb(' + Math.round(ink[0] + (warm[0] - ink[0]) * k) + ',' +
                     Math.round(ink[1] + (warm[1] - ink[1]) * k) + ',' +
                     Math.round(ink[2] + (warm[2] - ink[2]) * k) + ')'
          : inkHex;
        ctx.beginPath();
        ctx.arc(x, y, dots[j + 6], 0, 6.2832);
        ctx.fill();
      }

      if (grain) {
        ctx.globalAlpha = 0.045;
        ctx.globalCompositeOperation = 'overlay';
        var pat = ctx.createPattern(grain, 'repeat');
        if (pat) { ctx.fillStyle = pat; ctx.fillRect(0, 0, w, h); }
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
      }
      awake = moving || ringAge < 900 || px > -1e4;
    }

    function loop(now) {
      raf = 0;
      if (!visible) return;
      draw(now);
      if (awake) raf = requestAnimationFrame(loop);
    }
    function wake() { awake = true; if (!raf && visible) raf = requestAnimationFrame(loop); }
    function toLocal(e) {
      var b = canvas.getBoundingClientRect();
      return [e.clientX - b.left, e.clientY - b.top];
    }

    layout();
    draw(performance.now());
    wake();

    root.addEventListener('pointermove', function (e) {
      var p = toLocal(e); px = p[0]; py = p[1]; wake();
    });
    root.addEventListener('pointerleave', function () { px = -1e5; py = -1e5; wake(); });
    root.addEventListener('pointerdown', function (e) {
      if (reduced) return;
      if (e.target.closest && e.target.closest('a,button')) return;
      var p = toLocal(e);
      ring = { x: p[0], y: p[1], t: performance.now() };
      wake();
    });

    if (window.ResizeObserver) new ResizeObserver(function () { layout(); wake(); }).observe(root);
    if (window.IntersectionObserver) {
      new IntersectionObserver(function (en) {
        visible = en[0] ? en[0].isIntersecting : true;
        if (visible) wake();
      }).observe(root);
    }
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { layout(); wake(); });
    }
  }

  function boot() {
    var els = document.querySelectorAll('[data-halftone]');
    for (var i = 0; i < els.length; i++) init(els[i]);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
