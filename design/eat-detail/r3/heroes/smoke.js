/* Smoke Ring: Paper Shaders' smoke ring as a living gauge.
   The first `score`% of the circle, clockwise from 12, is dense smoke; the
   rest stays a faint wisp, so the unfilled share is always visible. */
(function () {
  window.HEROES = window.HEROES || {};

  var SIZE = 300;           // shader square, centred in the 342x320 slot
  var RING_R = 116;         // px radius of the ring's bright core, for the glowing head
  var TRACK = 0.14;         // opacity of the unfilled part of the ring

  function maskFor(pct) {
    var a = Math.max(0, Math.min(100, pct)) * 3.6;
    var soft = Math.min(10, a);   // feather the leading edge a few degrees
    var lead = Math.min(16, a / 2);
    return 'conic-gradient(from 0deg,' +
      ' rgba(0,0,0,' + TRACK + ') 0deg, #000 ' + lead.toFixed(2) + 'deg, #000 ' + (a - soft).toFixed(2) + 'deg,' +
      ' rgba(0,0,0,' + TRACK + ') ' + a.toFixed(2) + 'deg,' +
      ' rgba(0,0,0,' + TRACK + ') 360deg)';
  }

  window.HEROES.smoke = function (el, opts) {
    var score = (opts && opts.score) || 54;
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    var disposed = false, raf = 0, mount = null;

    el.style.position = 'relative';
    el.innerHTML =
      '<div data-s="glow" style="position:absolute;left:50%;top:50%;width:300px;height:300px;margin:-150px 0 0 -150px;border-radius:50%;' +
        'background:radial-gradient(closest-side, rgba(203,240,224,0.55), rgba(230,250,241,0.35) 55%, rgba(252,252,253,0) 100%);"></div>' +
      '<div style="position:absolute;left:50%;top:50%;width:' + SIZE + 'px;height:' + SIZE + 'px;margin:-' + SIZE / 2 + 'px 0 0 -' + SIZE / 2 + 'px;' +
        '-webkit-mask-image:radial-gradient(closest-side,#000 80%,rgba(0,0,0,0) 100%);mask-image:radial-gradient(closest-side,#000 80%,rgba(0,0,0,0) 100%);">' +
        '<div data-s="ring" style="position:absolute;inset:0;"></div>' +
      '</div>' +
      '<div data-s="head" style="position:absolute;left:50%;top:50%;width:0;height:0;pointer-events:none;">' +
        '<span style="position:absolute;left:-22px;top:-22px;width:44px;height:44px;border-radius:50%;background:radial-gradient(closest-side, rgba(255,255,255,0.95), rgba(203,240,224,0.75) 35%, rgba(121,204,168,0.25) 70%, rgba(121,204,168,0) 100%);"></span>' +
        '<span style="position:absolute;left:-4px;top:-4px;width:8px;height:8px;border-radius:50%;background:#fff;box-shadow:0 0 10px 3px rgba(255,255,255,0.9), 0 0 18px 6px rgba(121,204,168,0.6);"></span>' +
      '</div>' +
      '<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;pointer-events:none;">' +
        '<div style="display:flex;align-items:flex-start;color:#1D4D38;font-family:\'Playfair Display\',Georgia,serif;font-weight:600;">' +
          '<span data-s="num" style="font-size:64px;line-height:64px;letter-spacing:-1px;">0</span>' +
          '<span style="font-size:22px;line-height:30px;margin-left:2px;">%</span>' +
        '</div>' +
        '<div style="margin-top:6px;font-family:Roboto,system-ui,sans-serif;font-size:11px;font-weight:700;letter-spacing:2.4px;color:#2A805A;">SUFFICIENT</div>' +
      '</div>';

    var ring = el.querySelector('[data-s="ring"]');
    var head = el.querySelector('[data-s="head"]');
    var num = el.querySelector('[data-s="num"]');

    function setProgress(pct) {
      var m = maskFor(pct);
      ring.style.webkitMaskImage = m;
      ring.style.maskImage = m;
      var ang = (pct / 100) * Math.PI * 2 - Math.PI / 2;
      head.style.transform = 'translate(' + (Math.cos(ang) * RING_R).toFixed(1) + 'px,' + (Math.sin(ang) * RING_R).toFixed(1) + 'px)';
      head.style.opacity = pct > 0.5 ? '1' : '0';
      num.textContent = Math.round(pct);
    }
    setProgress(reduce ? score : 0);

    // Smoke shader
    var PS = window.PaperShaders;
    if (PS) {
      var noise = PS.getShaderNoiseTexture();
      var start = function () {
        if (disposed) return;
        var col = PS.getShaderColorFromString;
        try {
          mount = new PS.ShaderMount(ring, PS.smokeRingFragmentShader, {
            u_colorBack: col('#00000000'),
            u_colors: ['#1D4D38', '#2A805A', '#299D6B', '#79CCA8', '#CBF0E0'].map(col),
            u_colorsCount: 5,
            u_noiseScale: 2.6,
            u_thickness: 0.26,
            u_radius: 0.33,
            u_innerShape: 0.75,
            u_noiseIterations: 7,
            u_noiseTexture: noise,
            u_fit: PS.ShaderFitOptions.contain,
            u_scale: 1.5,
            u_rotation: 0,
            u_offsetX: 0,
            u_offsetY: 0,
            u_originX: 0.5,
            u_originY: 0.5,
            u_worldWidth: 0,
            u_worldHeight: 0
          }, { premultipliedAlpha: true, alpha: true }, reduce ? 0 : 0.35, 12);
        } catch (e) {
          fallback();
        }
      };
      if (noise.complete && noise.naturalWidth) start(); else noise.onload = start;
    } else {
      fallback();
    }

    // Without WebGL2: a soft static ring so the gauge still reads.
    function fallback() {
      ring.innerHTML = '<div style="position:absolute;inset:34px;border-radius:50%;border:26px solid rgba(41,157,107,0.75);filter:blur(6px);"></div>';
    }

    // Count up 0 -> score, arc in sync
    if (!reduce) {
      var t0 = 0, DUR = 1400;
      var tick = function (now) {
        if (disposed) return;
        if (!t0) t0 = now;
        var p = Math.min(1, (now - t0) / DUR);
        var e = 1 - Math.pow(1 - p, 3);
        setProgress(score * e);
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }

    return {
      dispose: function () {
        disposed = true;
        cancelAnimationFrame(raf);
        if (mount) mount.dispose();
        el.innerHTML = '';
      }
    };
  };
})();
