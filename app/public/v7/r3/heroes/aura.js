/* Aura: an energy border charging up around a frosted glass disc.
   Paper's Pulsing Border lives only on the first `score`% of the rim,
   clockwise from 12; the rest is a thin faint line, so the remaining
   share always reads. The disc inside is a pale mesh gradient lit from its edge. */
(function () {
  window.HEROES = window.HEROES || {};

  var AURA = 316;     // shader square for the border, centred in the 342x320 slot
  var DISC = 230;     // frosted disc diameter
  var RIM_R = 118;    // px radius where the aura sits, for the track and the head
  var TRACK = 0.0;    // aura opacity on the unfilled share (the SVG line carries it)

  function maskFor(pct) {
    var a = Math.max(0, Math.min(100, pct)) * 3.6;
    var soft = Math.min(12, a);
    var lead = Math.min(20, a / 2);
    return 'conic-gradient(from 0deg,' +
      ' rgba(0,0,0,' + TRACK + ') 0deg, #000 ' + lead.toFixed(2) + 'deg, #000 ' + (a - soft).toFixed(2) + 'deg,' +
      ' rgba(0,0,0,' + TRACK + ') ' + a.toFixed(2) + 'deg, rgba(0,0,0,' + TRACK + ') 360deg)';
  }

  window.HEROES.aura = function (el, opts) {
    var score = (opts && opts.score) || 54;
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    var disposed = false, raf = 0, mounts = [];
    var C = 2 * Math.PI * RIM_R;

    el.style.position = 'relative';
    el.innerHTML =
      // soft halo the disc sits in
      '<div style="position:absolute;left:50%;top:50%;width:320px;height:320px;margin:-160px 0 0 -160px;border-radius:50%;' +
        'background:radial-gradient(closest-side, rgba(203,240,224,0.5), rgba(230,250,241,0.3) 60%, rgba(252,252,253,0) 100%);"></div>' +
      // contact shadow
      '<div style="position:absolute;left:50%;top:50%;width:190px;height:22px;margin:128px 0 0 -95px;border-radius:50%;' +
        'background:radial-gradient(closest-side, rgba(29,77,56,0.14), rgba(29,77,56,0) 100%);"></div>' +
      // frosted disc
      '<div data-s="disc" style="position:absolute;left:50%;top:50%;width:' + DISC + 'px;height:' + DISC + 'px;margin:-' + DISC / 2 + 'px 0 0 -' + DISC / 2 + 'px;' +
        'border-radius:50%;overflow:hidden;background:radial-gradient(circle at 35% 30%, #FAFFFD, #E6FAF1 70%, #CBF0E0 100%);' +
        'box-shadow:inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -14px 30px rgba(121,204,168,0.18), 0 10px 30px -12px rgba(36,102,73,0.22);">' +
        '<div data-s="mesh" style="position:absolute;inset:0;opacity:0.55;filter:blur(6px);transform:scale(1.08);"></div>' +
        '<div style="position:absolute;inset:0;border-radius:50%;background:radial-gradient(circle at 32% 22%, rgba(255,255,255,0.75), rgba(255,255,255,0) 42%);"></div>' +
        '<div style="position:absolute;inset:0;border-radius:50%;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.8);"></div>' +
      '</div>' +
      // faint track for the whole rim
      '<svg width="342" height="320" viewBox="0 0 342 320" style="position:absolute;inset:0;overflow:visible;pointer-events:none;">' +
        '<circle cx="171" cy="160" r="' + RIM_R + '" fill="none" stroke="#D0D5DD" stroke-width="1.5" stroke-dasharray="1 5" stroke-linecap="round"/>' +
        '<circle data-s="arc" cx="171" cy="160" r="' + RIM_R + '" fill="none" stroke="#299D6B" stroke-opacity="0.55" stroke-width="2" stroke-linecap="round"' +
          ' transform="rotate(-90 171 160)" stroke-dasharray="0 ' + C.toFixed(1) + '"/>' +
      '</svg>' +
      // the aura, masked to the filled share
      '<div data-s="aura" style="position:absolute;left:50%;top:50%;width:' + AURA + 'px;height:' + AURA + 'px;margin:-' + AURA / 2 + 'px 0 0 -' + AURA / 2 + 'px;pointer-events:none;"></div>' +
      // glowing head at the charge front
      '<div data-s="head" style="position:absolute;left:50%;top:50%;width:0;height:0;pointer-events:none;">' +
        '<span style="position:absolute;left:-20px;top:-20px;width:40px;height:40px;border-radius:50%;background:radial-gradient(closest-side, rgba(255,255,255,0.95), rgba(203,240,224,0.7) 38%, rgba(121,204,168,0.22) 72%, rgba(121,204,168,0) 100%);"></span>' +
        '<span style="position:absolute;left:-3.5px;top:-3.5px;width:7px;height:7px;border-radius:50%;background:#fff;box-shadow:0 0 8px 3px rgba(255,255,255,0.9), 0 0 16px 6px rgba(89,179,140,0.55);"></span>' +
      '</div>' +
      // number
      '<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;pointer-events:none;">' +
        '<div style="display:flex;align-items:flex-start;color:#1D4D38;font-family:\'Playfair Display\',Georgia,serif;font-weight:600;">' +
          '<span data-s="num" style="font-size:64px;line-height:64px;letter-spacing:-1px;">0</span>' +
          '<span style="font-size:22px;line-height:30px;margin-left:2px;">%</span>' +
        '</div>' +
        '<div style="margin-top:6px;font-family:Roboto,system-ui,sans-serif;font-size:11px;font-weight:700;letter-spacing:2.4px;color:#2A805A;">SUFFICIENT</div>' +
      '</div>';

    var aura = el.querySelector('[data-s="aura"]');
    var mesh = el.querySelector('[data-s="mesh"]');
    var head = el.querySelector('[data-s="head"]');
    var arc = el.querySelector('[data-s="arc"]');
    var num = el.querySelector('[data-s="num"]');

    function setProgress(pct) {
      var m = maskFor(pct);
      aura.style.webkitMaskImage = m;
      aura.style.maskImage = m;
      arc.setAttribute('stroke-dasharray', (C * pct / 100).toFixed(1) + ' ' + C.toFixed(1));
      var ang = (pct / 100) * Math.PI * 2 - Math.PI / 2;
      head.style.transform = 'translate(' + (Math.cos(ang) * RIM_R).toFixed(1) + 'px,' + (Math.sin(ang) * RIM_R).toFixed(1) + 'px)';
      head.style.opacity = pct > 0.5 ? '1' : '0';
      num.textContent = Math.round(pct);
    }
    setProgress(reduce ? score : 0);

    var PS = window.PaperShaders;
    var sizing = function (scale) {
      return {
        u_fit: PS.ShaderFitOptions.contain, u_scale: scale, u_rotation: 0,
        u_offsetX: 0, u_offsetY: 0, u_originX: 0.5, u_originY: 0.5, u_worldWidth: 0, u_worldHeight: 0
      };
    };
    function extend(a, b) { for (var k in b) a[k] = b[k]; return a; }

    if (PS) {
      var col = PS.getShaderColorFromString;
      // Pale mesh gradient inside the disc: no texture needed, start at once.
      try {
        mounts.push(new PS.ShaderMount(mesh, PS.meshGradientFragmentShader, extend({
          u_colors: ['#FAFFFD', '#E6FAF1', '#CBF0E0', '#F3FCF8'].map(col),
          u_colorsCount: 4,
          u_distortion: 0.6,
          u_swirl: 0.2,
          u_grainMixer: 0,
          u_grainOverlay: 0.04
        }, sizing(1)), { premultipliedAlpha: true, alpha: true }, reduce ? 0 : 0.12, 40));
      } catch (e) { /* the CSS gradient on the disc already reads as frosted glass */ }

      // The border needs the noise texture fully loaded before mounting.
      var noise = PS.getShaderNoiseTexture();
      var start = function () {
        if (disposed) return;
        try {
          mounts.push(new PS.ShaderMount(aura, PS.pulsingBorderFragmentShader, extend({
            u_colorBack: col('#00000000'),
            u_colors: ['#299D6B', '#79CCA8', '#2A805A', '#CBF0E0'].map(col),
            u_colorsCount: 4,
            u_roundness: 1,
            u_thickness: 0.05,
            u_marginLeft: 0, u_marginRight: 0, u_marginTop: 0, u_marginBottom: 0,
            u_aspectRatio: PS.PulsingBorderAspectRatios.square,
            u_softness: 0.8,
            u_intensity: 0.45,
            u_bloom: 0.5,
            u_spots: 5,
            u_spotSize: 0.45,
            u_pulse: reduce ? 0 : 0.3,
            u_smoke: 0.55,
            u_smokeSize: 0.5,
            u_noiseTexture: noise
          }, sizing(0.76)), { premultipliedAlpha: true, alpha: true }, reduce ? 0 : 0.25, 8));
        } catch (e) {
          fallback();
        }
      };
      if (noise.complete && noise.naturalWidth) start(); else noise.onload = start;
    } else {
      fallback();
    }

    // Without WebGL2: a soft glowing arc so the charge still reads.
    function fallback() {
      arc.setAttribute('stroke-opacity', '1');
      arc.setAttribute('stroke-width', '6');
      arc.style.filter = 'drop-shadow(0 0 6px rgba(41,157,107,0.6))';
    }

    if (!reduce) {
      var t0 = 0, DUR = 1400;
      var tick = function (now) {
        if (disposed) return;
        if (!t0) t0 = now;
        var p = Math.min(1, (now - t0) / DUR);
        setProgress(score * (1 - Math.pow(1 - p, 3)));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }

    return {
      dispose: function () {
        disposed = true;
        cancelAnimationFrame(raf);
        mounts.forEach(function (m) { m.dispose(); });
        el.innerHTML = '';
      }
    };
  };
})();
