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
