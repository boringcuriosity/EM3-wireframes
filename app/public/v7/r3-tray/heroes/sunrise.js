/* Sunrise: the day's nutrition as a sun rising along its arc.
   The travelled arc is the score, the dotted rest is what the day still holds.
   God Rays (Paper Shaders) radiate from the sun and follow it. */
(function () {
  window.HEROES = window.HEROES || {};

  var W = 342, H = 320;
  var CX = 171, CY = 250, R = 146;          // arc centre sits on the horizon
  var HORIZON = CY;
  var LIFT = 70;                              // rays canvas starts above the hero so no edge shows
  var NS = "http://www.w3.org/2000/svg";

  function pointAt(p) {                       // p in 0..1, left horizon to right horizon
    var a = Math.PI * (1 - p);
    return { x: CX + R * Math.cos(a), y: CY - R * Math.sin(a) };
  }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function el(tag, attrs, parent) {
    var n = document.createElementNS(NS, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }

  window.HEROES.sunrise = function (host, opts) {
    var score = Math.max(0, Math.min(100, (opts && opts.score) || 0));
    var reduced = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    var raf = 0, alive = true, mount = null;

    host.style.position = host.style.position || "relative";

    /* Rays: a canvas above the horizon only, faded to nothing away from the sun. */
    var rays = document.createElement("div");
    rays.style.cssText = "position:absolute;left:0;top:" + (-LIFT) + "px;width:" + W + "px;height:" + (HORIZON + LIFT) + "px;pointer-events:none;";
    host.appendChild(rays);

    var last = null;                             // last sun position, so rays land where the sun already is
    function startRays() {
     if (!alive) return;
     try {
      var PS = window.PaperShaders;
      var c = PS.getShaderColorFromString;
      mount = new PS.ShaderMount(rays, PS.godRaysFragmentShader, {
        u_colorBack: c("#00000000"),
        u_colorBloom: c("#CBF0E0"),
        u_colors: ["#59B38C66", "#79CCA880", "#ABE6CCA6", "#FFFFFF59"].map(c),
        u_colorsCount: 4,
        u_density: 0.22,
        u_spotty: 0.28,
        u_midIntensity: 0.55,
        u_midSize: 0.16,
        u_intensity: 0.62,
        u_bloom: 0.35,
        u_noiseTexture: PS.getShaderNoiseTexture(),
        u_fit: PS.ShaderFitOptions.contain,
        u_scale: 1.25,
        u_rotation: 0,
        u_offsetX: 0,
        u_offsetY: 0,
        u_originX: 0.5,
        u_originY: 0.5,
        u_worldWidth: 0,
        u_worldHeight: 0
      }, { premultipliedAlpha: true, alpha: true }, reduced ? 0 : 0.35, reduced ? 12000 : 0);
      if (last) setRays(last.fx, last.fy);
     } catch (e) {
      mount = null;                              // no WebGL2: the SVG glow carries it
      rays.innerHTML = "";
     }
    }
    function setRays(fx, fy) {
      last = { fx: fx, fy: fy };
      if (mount) mount.setUniforms({ u_offsetX: (fx - 0.5) * (W / (HORIZON + LIFT)), u_offsetY: fy - 0.5 });  // contain box is the canvas height, square
    }
    // The shader needs its noise texture decoded before it can mount.
    if (window.PaperShaders) {
      var noise = window.PaperShaders.getShaderNoiseTexture();
      if (noise.complete && noise.naturalWidth) startRays();
      else noise.addEventListener("load", startRays, { once: true });
    }

    /* Arc, horizon, sun: SVG on top of the rays. */
    var svg = el("svg", { width: W, height: H, viewBox: "0 0 " + W + " " + H });
    svg.style.cssText = "position:absolute;left:0;top:0;overflow:visible;pointer-events:none;";
    host.appendChild(svg);

    var defs = el("defs", {}, svg);
    var core = el("radialGradient", { id: "sr-core", cx: "42%", cy: "38%", r: "62%" }, defs);
    el("stop", { offset: "0%", "stop-color": "#FFFFFF" }, core);
    el("stop", { offset: "55%", "stop-color": "#F3FCF8" }, core);
    el("stop", { offset: "100%", "stop-color": "#ABE6CC" }, core);
    var halo = el("radialGradient", { id: "sr-halo" }, defs);
    el("stop", { offset: "0%", "stop-color": "#79CCA8", "stop-opacity": "0.55" }, halo);
    el("stop", { offset: "45%", "stop-color": "#ABE6CC", "stop-opacity": "0.28" }, halo);
    el("stop", { offset: "100%", "stop-color": "#E6FAF1", "stop-opacity": "0" }, halo);
    var hz = el("linearGradient", { id: "sr-hz", gradientUnits: "userSpaceOnUse", x1: 4, x2: W - 4, y1: 0, y2: 0 }, defs);   // a line has no height, so bbox units collapse
    el("stop", { offset: "0%", "stop-color": "#E4E7EC", "stop-opacity": "0" }, hz);
    el("stop", { offset: "18%", "stop-color": "#D0D5DD", "stop-opacity": "1" }, hz);
    el("stop", { offset: "82%", "stop-color": "#D0D5DD", "stop-opacity": "1" }, hz);
    el("stop", { offset: "100%", "stop-color": "#E4E7EC", "stop-opacity": "0" }, hz);
    var glow = el("radialGradient", { id: "sr-ground", cx: "50%", cy: "0%", r: "70%" }, defs);
    el("stop", { offset: "0%", "stop-color": "#CBF0E0", "stop-opacity": "0.55" }, glow);
    el("stop", { offset: "100%", "stop-color": "#F3FCF8", "stop-opacity": "0" }, glow);

    // Ground: a soft wash under the horizon that brightens under the sun.
    var below = el("clipPath", { id: "sr-below" }, defs);
    el("rect", { x: 0, y: HORIZON, width: W, height: H - HORIZON }, below);
    var ground = el("ellipse", { cx: CX, cy: HORIZON, rx: 130, ry: 38, fill: "url(#sr-ground)", "clip-path": "url(#sr-below)" }, svg);
    el("line", { x1: 4, y1: HORIZON + 0.5, x2: W - 4, y2: HORIZON + 0.5, stroke: "url(#sr-hz)", "stroke-width": 1 }, svg);

    var arcD = "M " + (CX - R) + " " + CY + " A " + R + " " + R + " 0 0 1 " + (CX + R) + " " + CY;
    var arcLen = Math.PI * R;
    el("path", { d: arcD, fill: "none", stroke: "#D0D5DD", "stroke-width": 2.2, "stroke-linecap": "round", "stroke-dasharray": "0 7" }, svg);
    var done = el("path", {
      d: arcD, fill: "none", stroke: "#299D6B", "stroke-width": 3, "stroke-linecap": "round",
      "stroke-dasharray": arcLen + " " + arcLen, "stroke-dashoffset": arcLen
    }, svg);

    // Ends: where the day starts, and the whole of it.
    el("circle", { cx: CX - R, cy: CY, r: 3, fill: "#299D6B" }, svg);
    el("circle", { cx: CX + R, cy: CY, r: 3.5, fill: "#FCFCFD", stroke: "#98A2B3", "stroke-width": 1.2 }, svg);
    var full = el("text", {
      x: CX + R, y: CY + 20, "text-anchor": "middle", fill: "#98A2B3",
      "font-family": "Roboto, system-ui, sans-serif", "font-size": 10.5, "font-weight": 500, "letter-spacing": "0.3"
    }, svg);
    full.textContent = "100%";

    var sun = el("g", {}, svg);
    var sunHalo = el("circle", { r: 34, fill: "url(#sr-halo)" }, sun);
    el("circle", { r: 12.5, fill: "url(#sr-core)", stroke: "#FFFFFF", "stroke-width": 2 }, sun);
    el("circle", { r: 12.5, fill: "none", stroke: "#79CCA8", "stroke-opacity": "0.55", "stroke-width": 1 }, sun);

    /* The number, inside the dome above the horizon. */
    var label = document.createElement("div");
    label.style.cssText = "position:absolute;left:0;right:0;top:" + (CY - 104) + "px;display:flex;flex-direction:column;align-items:center;pointer-events:none;";
    label.innerHTML =
      '<div style="display:flex;align-items:flex-start;color:#1D4D38;font-family:\'Playfair Display\',Georgia,serif;font-weight:600;line-height:1;">' +
      '<span class="sr-num" style="font-size:66px;letter-spacing:-1px;font-variant-numeric:lining-nums tabular-nums;">0</span>' +
      '<span style="font-size:24px;margin:8px 0 0 2px;">%</span></div>' +
      '<div style="margin-top:10px;font-family:Roboto,system-ui,sans-serif;font-size:10.5px;font-weight:600;letter-spacing:2.2px;color:#2A805A;">SUFFICIENT</div>';
    host.appendChild(label);
    var num = label.querySelector(".sr-num");

    function draw(p, t) {                      // p: fraction of the whole day, 0..1
      var s = pointAt(p);
      sun.setAttribute("transform", "translate(" + s.x.toFixed(2) + " " + s.y.toFixed(2) + ")");
      sunHalo.setAttribute("r", (34 + 3 * Math.sin(t / 900)).toFixed(2));
      done.setAttribute("stroke-dashoffset", (arcLen * (1 - p)).toFixed(2));
      ground.setAttribute("cx", (CX + (s.x - CX) * 0.35).toFixed(2));
      num.textContent = Math.round(p * 100);

      var fx = s.x / W, fy = (s.y + LIFT) / (HORIZON + LIFT);
      setRays(fx, fy);
      var m = "radial-gradient(circle at " + s.x.toFixed(1) + "px " + (s.y + LIFT).toFixed(1) + "px, #000 0px, rgba(0,0,0,.9) 36px, rgba(0,0,0,.4) 96px, transparent 150px)";
      rays.style.webkitMaskImage = m;
      rays.style.maskImage = m;
    }

    var target = score / 100;
    if (reduced) {
      draw(target, 0);
    } else {
      var start = performance.now(), DUR = 1300;
      var tick = function (now) {
        if (!alive) return;
        var k = Math.min(1, (now - start) / DUR);
        draw(target * easeOut(k), now);
        raf = requestAnimationFrame(tick);   // keeps the halo breathing after the rise
      };
      draw(0, start);
      raf = requestAnimationFrame(tick);
    }

    return {
      dispose: function () {
        alive = false;
        cancelAnimationFrame(raf);
        if (mount) mount.dispose();
        host.innerHTML = "";
      }
    };
  };
})();
