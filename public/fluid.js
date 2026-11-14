/* 히어로 유체 배경 — WebGL 프래그먼트 셰이더로 도메인 워프 그라디언트를 그립니다.
   마우스 위치가 워프 필드를 밀어내고, 스크롤에 따라 서서히 가라앉습니다.
   WebGL을 못 쓰거나 모션 최소화 설정이면 아무것도 하지 않고 CSS 배경이 그대로 보입니다. */
(function () {
  var canvas = document.querySelector('[data-fluid]');
  if (!canvas) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var gl = canvas.getContext('webgl', { antialias: false, alpha: true, premultipliedAlpha: false })
        || canvas.getContext('experimental-webgl', { antialias: false, alpha: true });
  if (!gl) return;

  var VERT = [
    'attribute vec2 p;',
    'void main(){ gl_Position = vec4(p, 0.0, 1.0); }'
  ].join('\n');

  var FRAG = [
    'precision highp float;',
    'uniform vec2 u_res;',
    'uniform float u_time;',
    'uniform vec2 u_mouse;',
    'uniform float u_fade;',

    'vec2 hash(vec2 p){',
    '  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));',
    '  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);',
    '}',

    'float noise(vec2 p){',
    '  const float K1 = 0.366025404;',
    '  const float K2 = 0.211324865;',
    '  vec2 i = floor(p + (p.x + p.y) * K1);',
    '  vec2 a = p - i + (i.x + i.y) * K2;',
    '  float m = step(a.y, a.x);',
    '  vec2 o = vec2(m, 1.0 - m);',
    '  vec2 b = a - o + K2;',
    '  vec2 c = a - 1.0 + 2.0 * K2;',
    '  vec3 h = max(0.5 - vec3(dot(a,a), dot(b,b), dot(c,c)), 0.0);',
    '  vec3 n = h*h*h*h * vec3(dot(a, hash(i)), dot(b, hash(i + o)), dot(c, hash(i + 1.0)));',
    '  return dot(n, vec3(70.0));',
    '}',

    'float fbm(vec2 p){',
    '  float v = 0.0, a = 0.5;',
    '  for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.07; a *= 0.5; }',
    '  return v;',
    '}',

    'void main(){',
    '  vec2 uv = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;',
    '  float t = u_time * 0.055;',

    // 마우스가 만드는 부드러운 융기
    '  vec2 md = uv - u_mouse;',
    '  float mi = exp(-dot(md, md) * 2.6);',

    // 2단 도메인 워프
    '  vec2 q = vec2(fbm(uv * 0.62 + t), fbm(uv * 0.62 + vec2(5.2, 1.3) - t));',
    '  vec2 r = vec2(',
    '    fbm(uv * 0.78 + 2.4 * q + vec2(1.7, 9.2) + t * 1.25 + md * mi * 1.3),',
    '    fbm(uv * 0.78 + 2.4 * q + vec2(8.3, 2.8) - t * 1.05 + md * mi * 1.3)',
    '  );',
    '  float f = fbm(uv * 0.70 + 2.6 * r);',
    '  f = clamp(f * 0.5 + 0.5, 0.0, 1.0);',

    // 팔레트: 심해 네이비 → 미드 블루 → TDS 블루 하이라이트
    '  vec3 deep  = vec3(0.016, 0.024, 0.047);',
    '  vec3 mid   = vec3(0.070, 0.133, 0.325);',
    '  vec3 blue  = vec3(0.129, 0.325, 0.784);',
    '  vec3 lift  = vec3(0.400, 0.553, 1.000);',

    '  vec3 col = mix(deep, mid, smoothstep(0.02, 0.70, f));',
    '  col = mix(col, blue, smoothstep(0.46, 1.00, f) * 1.0);',

    // 천천히 떠도는 발광 코어 — 마우스가 끌어당긴다
    '  vec2 bc = vec2(sin(t * 1.7) * 0.42 - 0.30, cos(t * 1.25) * 0.26 + 0.05);',
    '  bc += u_mouse * 0.55;',
    '  vec2 bd = uv - bc;',
    '  bd += (r - 0.5) * 0.55;',
    '  float bloom = exp(-dot(bd, bd) * 1.25);',
    '  col += blue * bloom * 0.70;',
    '  col += lift * pow(bloom, 2.6) * 0.60;',

    '  col += lift * pow(clamp(length(r), 0.0, 1.0), 2.4) * 0.30;',
    '  col += lift * mi * 0.16;',

    // 중심에서 멀어질수록 어둡게, 상단은 더 깊게
    '  float vig = smoothstep(1.70, 0.10, length(uv * vec2(0.70, 1.0)));',
    '  col *= 0.50 + 0.50 * vig;',
    '  col *= 1.0 - 0.22 * smoothstep(0.0, -0.6, uv.y);',

    // 미세 그레인 — 그라디언트 밴딩 제거
    '  float g = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);',
    '  col += (g - 0.5) * 0.016;',

    '  gl_FragColor = vec4(col, u_fade);',
    '}'
  ].join('\n');

  function compile(type, src) {
    var sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) { gl.deleteShader(sh); return null; }
    return sh;
  }

  var vs = compile(gl.VERTEX_SHADER, VERT);
  var fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return;

  var prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);

  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  var loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  var uRes = gl.getUniformLocation(prog, 'u_res');
  var uTime = gl.getUniformLocation(prog, 'u_time');
  var uMouse = gl.getUniformLocation(prog, 'u_mouse');
  var uFade = gl.getUniformLocation(prog, 'u_fade');

  var dpr = 1, w = 0, h = 0;
  function resize() {
    var r = canvas.getBoundingClientRect();
    // 노이즈가 무거우므로 해상도를 눌러 둡니다 — 흐릿한 그라디언트라 티가 나지 않습니다
    dpr = Math.min(window.devicePixelRatio || 1, r.width < 760 ? 1 : 1.35);
    w = Math.max(1, Math.round(r.width * dpr));
    h = Math.max(1, Math.round(r.height * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w; canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
  }

  var mx = 0, my = 0, tmx = 0, tmy = 0;
  var host = canvas.closest('.hero') || canvas.parentElement;
  host.addEventListener('pointermove', function (e) {
    var r = host.getBoundingClientRect();
    tmx = ((e.clientX - r.left) / r.width - 0.5) * (r.width / r.height);
    tmy = -((e.clientY - r.top) / r.height - 0.5);
  });
  host.addEventListener('pointerleave', function () { tmx = 0; tmy = 0; });

  var visible = true;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }, { threshold: 0 }).observe(canvas);
  }

  var start = performance.now();
  var fade = 0;
  function frame(now) {
    requestAnimationFrame(frame);
    if (!visible) return;
    mx += (tmx - mx) * 0.045;
    my += (tmy - my) * 0.045;
    fade += (1 - fade) * 0.03;
    resize();
    gl.uniform2f(uRes, w, h);
    gl.uniform1f(uTime, (now - start) / 1000);
    gl.uniform2f(uMouse, mx, my);
    gl.uniform1f(uFade, Math.min(1, fade));
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  resize();
  canvas.classList.add('is-live');
  requestAnimationFrame(frame);
})();
