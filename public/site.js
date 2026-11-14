(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 스크롤 등장 */
  var targets = document.querySelectorAll('[data-reveal], [data-reveal-group], .steps');
  if (!('IntersectionObserver' in window) || reduce) {
    targets.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
    targets.forEach(function (el) { io.observe(el); });
  }

  /* 숫자 카운트업 */
  var nums = document.querySelectorAll('[data-count]');
  function runCount(el) {
    var to = parseFloat(el.getAttribute('data-count'));
    if (isNaN(to)) return;
    if (reduce) { el.textContent = String(to); return; }
    el.textContent = '0';
    var start = null, dur = 1100;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min(1, (ts - start) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(to * eased));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if (nums.length) {
    if (!('IntersectionObserver' in window)) { nums.forEach(runCount); }
    else {
      var io2 = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { runCount(en.target); io2.unobserve(en.target); } });
      }, { threshold: 0.6 });
      nums.forEach(function (el) { io2.observe(el); });
    }
  }

  /* 헤더 그림자 */
  var hd = document.querySelector('.hd');
  if (hd) {
    var onScroll = function () { hd.classList.toggle('is-stuck', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }


  /* 문의 동선 목업 : 3단계 자동 재생 */
  document.querySelectorAll('[data-flow]').forEach(function (stage) {
    var section = stage.closest('section');
    var screens = stage.querySelectorAll('.scr');
    var alertEl = stage.querySelector('.alert');
    var steps = section ? section.querySelectorAll('.flow__steps li') : [];
    var i = 0, timer = null, playing = false;

    function show(n) {
      screens.forEach(function (s, k) { s.classList.toggle('is-on', k === n); });
      steps.forEach(function (s, k) { s.classList.toggle('is-on', k === n); });
      if (alertEl) alertEl.classList.toggle('is-on', n === 2);
    }
    function tick() {
      i = (i + 1) % screens.length;
      show(i);
      timer = setTimeout(tick, i === 2 ? 2600 : 2200);
    }
    function start() {
      if (playing) return;
      playing = true;
      i = 0; show(0);
      if (reduce) { show(2); return; }
      timer = setTimeout(tick, 2000);
    }
    function stop() { playing = false; clearTimeout(timer); }

    if (!('IntersectionObserver' in window)) { start(); return; }
    var io3 = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) start(); else stop(); });
    }, { threshold: 0.3 });
    io3.observe(stage);
    document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); });
  });



  /* 덮기 전환 : B가 A 위를 아래에서 위로 걷히며 덮는다 */
  document.querySelectorAll('[data-curtain]').forEach(function (root) {
    var b = root.querySelector('.cv__b');
    var stage = root.querySelector('.cv__b-stage');
    if (!b || !stage) return;

    var DIST = 0.85;   /* 걷히는 거리 = 화면 높이 × 이 값 (크게 → 더 천천히) */
    var LERP = 0.14;   /* 따라붙는 정도 (작게 → 더 미끄럽게) */

    var cur = 0, target = 0, raf = null, revealed = null;

    function easeInOutCubic(x) {
      return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    }

    function apply(v) {
      if (v >= 0.999) {
        stage.style.clipPath = 'none';
        if (revealed !== true) { revealed = true; root.classList.add('is-revealed'); }
      } else {
        stage.style.clipPath = 'inset(' + ((1 - v) * 100).toFixed(3) + '% 0 0 0)';
        if (revealed !== false) { revealed = false; root.classList.remove('is-revealed'); }
      }
    }

    function tick() {
      cur += (target - cur) * LERP;
      if (Math.abs(target - cur) < 0.0008) { cur = target; apply(cur); raf = null; return; }
      apply(cur);
      raf = requestAnimationFrame(tick);
    }

    function measure() {
      var passed = -b.getBoundingClientRect().top;
      var span = window.innerHeight * DIST;
      var tRaw = span > 0 ? passed / span : 0;
      target = easeInOutCubic(Math.min(1, Math.max(0, tRaw)));
      if (reduce) { cur = target; apply(cur); return; }
      if (raf === null) raf = requestAnimationFrame(tick);
    }

    window.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);
    measure();
  });

  /* 상단 스크롤 진행 바 */
  (function () {
    var bar = document.createElement('div');
    bar.className = 'prog';
    document.body.appendChild(bar);
    var ticking = false;
    function draw() {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(draw); }
    }, { passive: true });
    draw();
  })();

  /* 히어로 빛이 마우스를 따라옴 (데스크톱) */
  (function () {
    var hero = document.querySelector('.hero');
    var orb = hero && hero.querySelector('.hero__orb');
    if (!orb || reduce || !window.matchMedia('(hover:hover) and (min-width:1024px)').matches) return;
    hero.addEventListener('mousemove', function (e) {
      var r = hero.getBoundingClientRect();
      orb.style.setProperty('--ox', ((e.clientX - r.left) / r.width) * 100 + '%');
      orb.style.setProperty('--oy', ((e.clientY - r.top) / r.height) * 100 + '%');
    });
    hero.addEventListener('mouseleave', function () {
      orb.style.removeProperty('--ox');
      orb.style.removeProperty('--oy');
    });
  })();

  /* 카드 호버 글로우 위치 */
  if (!reduce && window.matchMedia('(hover:hover)').matches) {
    document.querySelectorAll('.card').forEach(function (c) {
      c.addEventListener('mousemove', function (e) {
        var r = c.getBoundingClientRect();
        c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        c.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  /* 내부 앵커 부드러운 이동 */
  if (!reduce) {
    document.querySelectorAll('a[href^="/#"], a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href').split('#')[1];
        if (!id) return;
        var t = document.getElementById(id);
        if (!t) return;
        e.preventDefault();
        t.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.replaceState(null, '', '#' + id);
      });
    });
  }
})();

/* ===== spine: 라인아트 드로잉 + 진행선 ===== */
(function () {
  var reduceM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var rows = [].slice.call(document.querySelectorAll('.srow'));
  if (!rows.length) return;

  // 각 path/rect/circle 의 실제 길이를 --len 으로
  rows.forEach(function (row) {
    [].slice.call(row.querySelectorAll('.srow__gfx svg > *')).forEach(function (el) {
      if (el.classList.contains('s-dot')) return;
      var len = 0;
      try { len = el.getTotalLength ? el.getTotalLength() : 0; } catch (e) { len = 0; }
      if (!len) {
        var b = el.getBBox ? el.getBBox() : null;
        len = b ? (b.width + b.height) * 2 : 300;
      }
      el.style.setProperty('--len', Math.ceil(len) + 'px');
      var i = [].indexOf.call(el.parentNode.children, el);
      el.style.transitionDelay = (0.08 * i) + 's';
    });
  });

  if (reduceM) { rows.forEach(function (r) { r.classList.add('is-in'); }); }
  else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.3, rootMargin: '0px 0px -8% 0px' });
    rows.forEach(function (r) { io.observe(r); });
  }

  var spine = document.querySelector('[data-spine]');
  var line = spine && spine.querySelector('.spine__line');
  if (!spine || !line || reduceM) return;
  var ticking = false;
  function paint() {
    ticking = false;
    var r = spine.getBoundingClientRect();
    var mid = window.innerHeight * 0.55;
    var p = (mid - r.top) / r.height;
    p = Math.max(0, Math.min(1, p));
    line.style.setProperty('--spine', (p * 100).toFixed(2) + '%');
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(paint); }
  }, { passive: true });
  window.addEventListener('resize', paint);
  paint();
})();

/* ===== 리뉴얼 체크리스트: 선택 개수에 따른 안내 ===== */
(function () {
  var list = document.querySelector('[data-signs]');
  var panel = document.querySelector('[data-signs-result]');
  if (!list || !panel) return;

  var countEl = panel.querySelector('.signs__count b');
  var msgEl = panel.querySelector('.signs__msg');
  var boxes = [].slice.call(list.querySelectorAll('.signs__cb'));

  var MESSAGES = [
    { max: 0, alert: false, text: '해당하는 항목을 눌러 보세요.' },
    { max: 1, alert: false, text: '한 가지라면 부분 수정으로 해결되는 경우가 많습니다. 어디를 고치면 되는지만 알려드릴게요.' },
    { max: 3, alert: true,  text: '리뉴얼을 고민할 시점입니다. 겉모습보다 구조부터 손대면 나머지도 함께 풀립니다.' },
    { max: 5, alert: true,  text: '지금 리뉴얼이 필요한 상태입니다. 부분 수정으로는 따라잡기 어려운 단계예요.' },
    { max: 6, alert: true,  text: '여섯 가지 모두 해당합니다. 고쳐 쓰는 것보다 새로 짓는 편이 빠르고 저렴합니다.' },
  ];

  function update() {
    var n = 0;
    for (var i = 0; i < boxes.length; i++) if (boxes[i].checked) n++;
    countEl.textContent = String(n);
    for (var k = 0; k < MESSAGES.length; k++) {
      if (n <= MESSAGES[k].max) {
        msgEl.textContent = MESSAGES[k].text;
        panel.classList.toggle('is-alert', MESSAGES[k].alert);
        break;
      }
    }
  }

  boxes.forEach(function (b) { b.addEventListener('change', update); });
  update();
})();

/* ===== THE GAP: 커튼 진행도에 따라 카드와 목록 전환 ===== */
(function () {
  var root = document.querySelector('[data-curtain]');
  var cards = document.querySelector('[data-gap-cards]');
  var list = document.querySelector('[data-gap-list]');
  if (!root || !cards || !list) return;

  var b = root.querySelector('.cv__b');
  var figs = [].slice.call(cards.children);
  var lis = [].slice.call(list.children);
  var n = Math.min(figs.length, lis.length);
  if (!b || n === 0) return;

  var cur = -1, ticking = false;

  function setIndex(i) {
    if (i === cur) return;
    cur = i;
    for (var k = 0; k < n; k++) {
      figs[k].classList.toggle('is-on', k === i);
      lis[k].classList.toggle('is-on', k === i);
    }
  }

  function measure() {
    ticking = false;
    var r = b.getBoundingClientRect();
    var span = r.height - window.innerHeight;
    if (span <= 0) return;
    // 커튼이 다 열린 뒤 구간을 n등분
    var passed = (-r.top) / span;
    var start = 0.5;
    var t = (passed - start) / (1 - start);
    t = Math.max(0, Math.min(0.9999, t));
    setIndex(Math.floor(t * n));
  }

  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(measure); }
  }, { passive: true });
  window.addEventListener('resize', measure);
  measure();
})();

/* ===== 전후 비교 스크롤 와이프 ===== */
(function () {
  var root = document.querySelector('[data-wipe]');
  if (!root) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia('(max-width: 760px)').matches) return;

  var stage = root.querySelector('.wipe__stage');
  var clip = root.querySelector('[data-wipe-clip]');
  var bar = root.querySelector('[data-wipe-bar]');
  var tagB = root.querySelector('[data-wipe-tag-b]');
  var tagA = root.querySelector('[data-wipe-tag-a]');
  var capB = root.querySelector('[data-wipe-cap-b]');
  var capA = root.querySelector('[data-wipe-cap-a]');
  if (!stage || !clip || !bar) return;

  var cur = 0, target = 0, raf = null;

  function ease(x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }

  function apply(v) {
    clip.style.clipPath = 'inset(0 ' + (v * 100).toFixed(2) + '% 0 0)';
    bar.style.transform = 'translateX(' + ((1 - v) * stage.offsetWidth - 1).toFixed(1) + 'px)';
    if (tagB) tagB.style.opacity = String(Math.max(0, 1 - v * 1.6));
    if (tagA) tagA.style.opacity = String(Math.max(0, (v - 0.35) / 0.4));
    if (capB) capB.style.opacity = String(Math.max(0, 1 - v * 1.8));
    if (capA) capA.style.opacity = String(Math.max(0, (v - 0.45) / 0.35));
  }

  function tick() {
    cur += (target - cur) * 0.14;
    if (Math.abs(target - cur) < 0.0008) { cur = target; apply(cur); raf = null; return; }
    apply(cur);
    raf = requestAnimationFrame(tick);
  }

  var pin = root.closest('[data-wipe-pin]');
  var fade = pin ? pin.querySelector('[data-wipe-fade]') : null;

  function measure() {
    var t;
    if (pin) {
      // 섹션이 고정된 구간을 기준으로 진행도를 계산
      var pr = pin.getBoundingClientRect();
      var span = pin.offsetHeight - window.innerHeight;
      if (span <= 0) { target = 1; }
      else {
        var raw = (-pr.top) / span;
        // 앞뒤로 멈춰 있는 구간을 두어 전환이 급하지 않게
        t = (raw - 0.14) / 0.72;
        target = ease(Math.max(0, Math.min(1, t)));
        // 마지막 구간: 다음 섹션 색으로 어두워지며 빈 꼬리를 덮는다
        if (fade) fade.style.opacity = String(Math.max(0, Math.min(1, (raw - 0.86) / 0.12)));
      }
    } else {
      var r = stage.getBoundingClientRect();
      t = (window.innerHeight * 0.82 - r.top) / (window.innerHeight * 0.6);
      target = ease(Math.max(0, Math.min(1, t)));
    }
    if (raf === null) raf = requestAnimationFrame(tick);
  }

  window.addEventListener('scroll', measure, { passive: true });
  window.addEventListener('resize', function () { measure(); apply(cur); });
  measure();
  apply(0);
})();

/* ===== 다크 섹션 제목: 줄 단위 마스크 등장 ===== */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var heads = document.querySelectorAll('.sec--dark .h2, .bento .h2, .flow .h2');
  if (!heads.length) return;

  [].forEach.call(heads, function (h) {
    var lines = h.innerHTML.split(/<br\s*\/?>/i);
    h.innerHTML = lines.map(function (l) {
      return '<span class="ln"><span class="ln__i">' + l + '</span></span>';
    }).join('');
    if (reduce) { h.classList.add('is-lines-in'); return; }
    var inner = h.querySelectorAll('.ln__i');
    for (var i = 0; i < inner.length; i++) {
      inner[i].style.transitionDelay = (i * 0.11) + 's';
    }
  });

  if (reduce) return;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('is-lines-in'); io.unobserve(en.target); }
    });
  }, { threshold: 0.4 });
  [].forEach.call(heads, function (h) { io.observe(h); });
})();
