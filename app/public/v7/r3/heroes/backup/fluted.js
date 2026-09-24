/* Fluted Glass: a ribbed glass capsule that fills with living green liquid to
   the day's score. The liquid is Paper Shaders' Mesh Gradient, clipped under a
   gently waving surface; the empty part above stays pale frosted glass, so the
   filled share and the remaining share read at a glance. */
(function () {
  window.HEROES = window.HEROES || {};

  var W = 342, H = 320;
  var CAP = { x: 96, y: 22, w: 120, h: 270 };   // capsule box inside the hero
  var DUR = 1200;

  function el(tag, css, parent) {
    var n = document.createElement(tag);
    if (css) n.style.cssText = css;
    if (parent) parent.appendChild(n);
    return n;
  }

  var easeOut = function (t) { return 1 - Math.pow(1 - t, 3); };

  window.HEROES.fluted = function (root, opts) {
    var score = Math.max(0, Math.min(100, (opts && opts.score) || 0));
    var reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    var raf = 0, mount = null, disposed = false;

    root.innerHTML = '';
    var stage = el('div', 'position:relative;width:' + W + 'px;height:' + H + 'px;margin:0 auto;font-family:Roboto,system-ui,sans-serif;', root);

    // Soft glow and contact shadow, so the capsule sits on the page.
    el('div', 'position:absolute;left:' + (CAP.x - 70) + 'px;top:' + (CAP.y + 40) + 'px;width:' + (CAP.w + 140) + 'px;height:' + (CAP.h - 20) + 'px;border-radius:50%;background:radial-gradient(closest-side,rgba(203,240,224,.55),rgba(243,252,248,.25) 60%,rgba(252,252,253,0));pointer-events:none;', stage);
    el('div', 'position:absolute;left:' + (CAP.x + 6) + 'px;top:' + (CAP.y + CAP.h - 6) + 'px;width:' + (CAP.w - 12) + 'px;height:22px;border-radius:50%;background:radial-gradient(closest-side,rgba(29,77,56,.22),rgba(29,77,56,0));filter:blur(2px);pointer-events:none;', stage);

    // Tick marks at 25 / 50 / 75 / 100, on the left of the capsule.
    var inner = CAP.h - 24;                       // usable fill height inside the rounded ends
    var fillBase = CAP.y + CAP.h - 12;            // y of 0%
    [25, 50, 75, 100].forEach(function (t) {
      var y = fillBase - inner * t / 100;
      el('div', 'position:absolute;left:' + (CAP.x - 16) + 'px;top:' + (y - 0.5) + 'px;width:10px;height:1px;background:#D0D5DD;', stage);
      var lab = el('div', 'position:absolute;left:' + (CAP.x - 48) + 'px;top:' + (y - 7) + 'px;width:28px;text-align:right;font-size:10px;line-height:14px;color:#98A2B3;letter-spacing:.2px;', stage);
      lab.textContent = t;
    });

    // The capsule.
    var cap = el('div', 'position:absolute;left:' + CAP.x + 'px;top:' + CAP.y + 'px;width:' + CAP.w + 'px;height:' + CAP.h + 'px;border-radius:' + (CAP.w / 2) + 'px;overflow:hidden;background:linear-gradient(90deg,#EEF1F4 0%,#F7F8FA 38%,#F2F4F7 70%,#E8EBEF 100%);box-shadow:0 18px 30px -12px rgba(29,77,56,.28),0 2px 6px rgba(16,24,40,.06);', stage);

    // Liquid layer, clipped to a waving surface.
    var liquid = el('div', 'position:absolute;inset:0;', cap);
    var shaderHost = el('div', 'position:absolute;inset:0;background:linear-gradient(to top,#1D4D38,#299D6B 45%,#79CCA8 85%,#CBF0E0);', liquid);
    try {
      if (window.PaperShaders && PaperShaders.ShaderMount) {
        var P = PaperShaders;
        var sizing = P.defaultObjectSizing;
        mount = new P.ShaderMount(shaderHost, P.meshGradientFragmentShader, {
          u_colors: ['#246649', '#59B38C', '#ABE6CC', '#299D6B'].map(P.getShaderColorFromString),
          u_colorsCount: 4,
          u_distortion: 0.7,
          u_swirl: 0.3,
          u_grainMixer: 0,
          u_grainOverlay: 0,
          u_fit: P.ShaderFitOptions.cover,
          u_rotation: 0,
          u_scale: 1,
          u_offsetX: 0,
          u_offsetY: 0,
          u_originX: sizing.originX,
          u_originY: sizing.originY,
          u_worldWidth: 0,
          u_worldHeight: 0
        }, undefined, reduced ? 0 : 0.22);
      }
    } catch (e) { mount = null; }

    // Darker depth at the bottom of the liquid, so it feels like volume.
    el('div', 'position:absolute;inset:0;background:linear-gradient(to top,rgba(29,77,56,.28),rgba(29,77,56,0) 35%),linear-gradient(to bottom,rgba(230,250,241,.35),rgba(230,250,241,0) 22%);pointer-events:none;', liquid);

    // Surface: a bright meniscus line that follows the wave.
    var svgNS = 'http://www.w3.org/2000/svg';
    var surf = document.createElementNS(svgNS, 'svg');
    surf.setAttribute('width', CAP.w); surf.setAttribute('height', CAP.h);
    surf.style.cssText = 'position:absolute;inset:0;pointer-events:none;';
    var surfPath = document.createElementNS(svgNS, 'path');
    surfPath.setAttribute('fill', 'none');
    surfPath.setAttribute('stroke', 'rgba(230,250,241,.95)');
    surfPath.setAttribute('stroke-width', '2');
    surf.appendChild(surfPath);
    cap.appendChild(surf);

    // Fluted glass: vertical ribs of light and shade across the whole capsule.
    el('div', 'position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(90deg,rgba(255,255,255,.30) 0px,rgba(255,255,255,.06) 4px,rgba(16,24,40,.07) 8px,rgba(16,24,40,0) 10px,rgba(255,255,255,.30) 12px);mix-blend-mode:soft-light;', cap);
    el('div', 'position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(90deg,rgba(255,255,255,.16) 0px,rgba(255,255,255,0) 3px,rgba(255,255,255,0) 9px,rgba(255,255,255,.16) 12px);', cap);
    // Cylinder shading: light from the left, falloff to the right.
    el('div', 'position:absolute;inset:0;pointer-events:none;background:linear-gradient(90deg,rgba(16,24,40,.10) 0%,rgba(255,255,255,.28) 16%,rgba(255,255,255,0) 34%,rgba(255,255,255,0) 66%,rgba(16,24,40,.12) 92%,rgba(16,24,40,.18) 100%);', cap);
    // Specular streak and rim light.
    el('div', 'position:absolute;left:18px;top:18px;width:9px;height:' + (CAP.h - 60) + 'px;border-radius:9px;background:linear-gradient(to bottom,rgba(255,255,255,.85),rgba(255,255,255,.15));filter:blur(1.2px);pointer-events:none;', cap);
    el('div', 'position:absolute;inset:0;border-radius:inherit;pointer-events:none;box-shadow:inset 0 0 0 1px rgba(255,255,255,.75),inset 0 0 0 2px rgba(16,24,40,.05),inset 0 10px 18px rgba(255,255,255,.55),inset 0 -8px 16px rgba(16,24,40,.08);', cap);

    // Leader line and the number, riding the liquid surface.
    var leader = el('div', 'position:absolute;left:' + (CAP.x + CAP.w + 4) + 'px;width:20px;height:1px;background:#79CCA8;', stage);
    var dot = el('div', 'position:absolute;left:' + (CAP.x + CAP.w - 3) + 'px;width:7px;height:7px;border-radius:50%;background:#299D6B;box-shadow:0 0 0 3px rgba(203,240,224,.9);', stage);
    var label = el('div', 'position:absolute;left:' + (CAP.x + CAP.w + 30) + 'px;width:110px;', stage);
    var num = el('div', 'font-family:"Playfair Display",Georgia,serif;font-weight:600;color:#1D4D38;font-size:46px;line-height:48px;letter-spacing:-.5px;white-space:nowrap;', label);
    var numVal = el('span', '', num);
    var pct = el('span', 'font-size:22px;vertical-align:top;margin-left:2px;position:relative;top:4px;', num);
    pct.textContent = '%';
    var cap2 = el('div', 'font-size:10.5px;font-weight:700;letter-spacing:2.2px;color:#2A805A;margin-top:2px;', label);
    cap2.textContent = 'SUFFICIENT';

    function frame(level, t) {
      // level: 0..100 fill; t: seconds for the wave
      var yLevel = (CAP.h - 12) - inner * level / 100;   // in capsule coords
      var amp = level > 0 ? (reduced ? 1.2 : 2.6) : 0;
      var pts = [], steps = 24;
      for (var i = 0; i <= steps; i++) {
        var x = CAP.w * i / steps;
        var y = yLevel + Math.sin(x / 19 + t * 1.35) * amp + Math.sin(x / 11 - t * 0.9) * amp * 0.45;
        pts.push([x, y]);
      }
      var top = pts.map(function (p, i) { return (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' ');
      liquid.style.clipPath = 'path("' + top + ' L ' + CAP.w + ' ' + CAP.h + ' L 0 ' + CAP.h + ' Z")';
      surfPath.setAttribute('d', top);
      surf.style.opacity = level > 0.5 ? '1' : '0';

      var yPage = CAP.y + yLevel;
      leader.style.top = yPage + 'px';
      dot.style.top = (yPage - 3.5) + 'px';
      label.style.top = Math.max(0, Math.min(H - 70, yPage - 32)) + 'px';
      numVal.textContent = Math.round(level);
    }

    if (reduced) {
      frame(score, 0);
    } else {
      var start = performance.now();
      var loop = function (now) {
        if (disposed) return;
        var p = Math.min(1, (now - start) / DUR);
        frame(score * easeOut(p), now / 1000);
        raf = requestAnimationFrame(loop);
      };
      frame(0, 0);
      raf = requestAnimationFrame(loop);
    }

    return {
      dispose: function () {
        disposed = true;
        cancelAnimationFrame(raf);
        if (mount && mount.dispose) { try { mount.dispose(); } catch (e) {} }
        root.innerHTML = '';
      }
    };
  };
})();
