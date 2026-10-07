(function () {
  window.HEROES = window.HEROES || {};

  /* Stardust: the number is made of light. Every particle is a share of the
     day, so 54% of them have come home into the digits and the rest are still
     out in orbit as dust. */
  window.HEROES.stardust = function (el, opts) {
    var score = Math.max(0, Math.min(100, (opts && opts.score) || 0));
    var W = 342, H = 320, CX = W / 2, CY = 138;
    var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    var disposed = false, raf = 0, renderer = null;

    el.style.position = "relative";
    var label = document.createElement("div");
    label.style.cssText = "position:absolute;left:0;right:0;top:262px;text-align:center;font:600 11px/14px Roboto,system-ui,sans-serif;letter-spacing:2.2px;color:#1D4D38;pointer-events:none";
    label.textContent = "SUFFICIENT";
    var pct = document.createElement("div");
    pct.style.cssText = "position:absolute;left:" + (CX + 70) + "px;top:96px;font:600 26px/1 'Playfair Display',Georgia,serif;color:#1D4D38;opacity:0;transition:opacity .6s ease;pointer-events:none";
    pct.textContent = "%";
    el.appendChild(label);
    el.appendChild(pct);

    function staticFallback() {
      var n = document.createElement("div");
      n.style.cssText = "position:absolute;left:0;right:0;top:62px;text-align:center;font:600 150px/1 'Playfair Display',Georgia,serif;color:#299D6B";
      n.textContent = Math.round(score);
      el.appendChild(n);
      pct.style.opacity = 1;
    }

    if (!window.THREE) { staticFallback(); return { dispose: function () {} }; }

    var fontReady = document.fonts && document.fonts.load
      ? Promise.race([document.fonts.load("600 170px 'Playfair Display'"), new Promise(function (r) { setTimeout(r, 1500); })])
      : Promise.resolve();

    fontReady.then(function () { if (!disposed) build(); });

    function glyphPoints() {
      var c = document.createElement("canvas");
      var S = 2; // sample at 2x so the digit edges stay crisp
      c.width = W * S; c.height = H * S;
      var g = c.getContext("2d");
      g.scale(S, S);
      g.fillStyle = "#000";
      g.textAlign = "center";
      g.textBaseline = "alphabetic";
      g.font = "600 176px 'Playfair Display', Georgia, serif";
      g.fillText(String(Math.round(score)), CX - 8, CY + 62);
      var d = g.getImageData(0, 0, c.width, c.height).data, pts = [];
      for (var y = 0; y < c.height; y += 1) {
        for (var x = 0; x < c.width; x += 1) {
          if (d[(y * c.width + x) * 4 + 3] > 140) pts.push(x / S, y / S);
        }
      }
      return pts;
    }

    function build() {
      try {
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, premultipliedAlpha: false });
      } catch (e) { staticFallback(); return; }
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      renderer.setPixelRatio(dpr);
      renderer.setSize(W, H);
      renderer.setClearColor(0x000000, 0);
      renderer.domElement.style.cssText = "position:absolute;left:0;top:0;width:" + W + "px;height:" + H + "px";
      el.insertBefore(renderer.domElement, el.firstChild);

      var scene = new THREE.Scene();
      var cam = new THREE.OrthographicCamera(-W / 2, W / 2, H / 2, -H / 2, -500, 500);

      var raw = glyphPoints();
      var TOTAL = 9000;
      var formed = Math.round(TOTAL * score / 100);
      var pos = new Float32Array(TOTAL * 3);
      var target = new Float32Array(TOTAL * 3);
      var seed = new Float32Array(TOTAL * 4);
      var kind = new Float32Array(TOTAL);
      var available = raw.length / 2;

      for (var i = 0; i < TOTAL; i++) {
        var isDigit = i < formed && available > 0;
        kind[i] = isDigit ? 1 : 0;
        if (isDigit) {
          var k = Math.floor(Math.random() * available) * 2;
          target[i * 3] = raw[k] + Math.random() - 0.5 - W / 2;
          target[i * 3 + 1] = H / 2 - (raw[k + 1] + Math.random() - 0.5);
          target[i * 3 + 2] = (Math.random() - 0.5) * 24;
        }
        seed[i * 4] = Math.random() * Math.PI * 2;                    // orbit angle
        seed[i * 4 + 1] = isDigit ? 60 + Math.random() * 110 : 122 + Math.random() * 34; // orbit radius
        seed[i * 4 + 2] = (0.05 + Math.random() * 0.1) * (Math.random() < 0.85 ? 1 : -1); // speed
        seed[i * 4 + 3] = Math.random();                               // arrival order + tone
      }

      var geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      geo.setAttribute("aTarget", new THREE.BufferAttribute(target, 3));
      geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 4));
      geo.setAttribute("aKind", new THREE.BufferAttribute(kind, 1));

      var uniforms = {
        uTime: { value: 0 },
        uProgress: { value: reduce ? 1 : 0 },
        uDpr: { value: dpr },
        uCenter: { value: new THREE.Vector2(0, H / 2 - CY - 6) },
      };

      var mat = new THREE.ShaderMaterial({
        uniforms: uniforms,
        transparent: true,
        depthWrite: false,
        blending: THREE.NormalBlending,
        vertexShader: [
          "attribute vec3 aTarget; attribute vec4 aSeed; attribute float aKind;",
          "uniform float uTime, uProgress, uDpr; uniform vec2 uCenter;",
          "varying float vKind, vTone, vArrive;",
          "void main(){",
          "  float a = aSeed.x + uTime * aSeed.z;",
          "  float r = aSeed.y + sin(uTime * 0.6 + aSeed.w * 30.0) * 4.0;",
          "  vec3 cloud = vec3(uCenter.x + cos(a) * r, uCenter.y + sin(a) * r * 0.7, sin(a * 2.0 + aSeed.w * 6.0) * 30.0);",
          // digit particles stream in by arrival order, soft ease-out
          "  float t = clamp((uProgress * 1.35 - aSeed.w * 0.35 - 0.0) / 1.0, 0.0, 1.0);",
          "  t = aKind * (1.0 - pow(1.0 - t, 3.0));",
          "  vec3 home = aTarget + vec3(sin(uTime * 1.3 + aSeed.w * 40.0), cos(uTime * 1.1 + aSeed.w * 50.0), 0.0) * 0.45;",
          "  vec3 p = mix(cloud, home, t);",
          "  vArrive = t; vKind = aKind; vTone = aSeed.w;",
          "  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);",
          "  float size = aKind > 0.5 ? mix(3.0, 2.2, t) : 1.5 + fract(aSeed.w * 7.0) * 1.3;",
          "  gl_PointSize = size * uDpr * 1.6;",
          "}",
        ].join("\n"),
        fragmentShader: [
          "uniform float uTime; varying float vKind, vTone, vArrive;",
          "void main(){",
          "  vec2 q = gl_PointCoord - 0.5; float d = length(q) * 2.0;",
          "  if (d > 1.0) discard;",
          "  float core = smoothstep(0.62, 0.0, d);",
          "  float halo = exp(-d * 3.2) * 0.35;",
          "  vec3 deep = vec3(0.114, 0.302, 0.220), mid = vec3(0.161, 0.616, 0.420), mint = vec3(0.475, 0.800, 0.659);",
          "  vec3 col; float alpha;",
          "  if (vKind > 0.5) {",
          "    float shimmer = 0.5 + 0.5 * sin(uTime * 2.2 + vTone * 60.0);",
          "    col = mix(mix(deep, mid, smoothstep(0.0, 0.6, vTone)), mint, smoothstep(0.7, 1.0, vTone) * 0.8 + shimmer * 0.12);",
          "    alpha = (core * 0.95 + halo) * mix(0.35, 1.0, vArrive);",
          "  } else {",
          "    col = mix(vec3(0.349, 0.702, 0.549), vec3(0.475, 0.800, 0.659), vTone);",
          "    alpha = (core * 0.42 + halo * 0.25) * (0.6 + 0.4 * sin(uTime * 0.8 + vTone * 20.0));",
          "  }",
          "  gl_FragColor = vec4(col, alpha);",
          "}",
        ].join("\n"),
      });

      var points = new THREE.Points(geo, mat);
      scene.add(points);

      var start = performance.now();
      var INTRO = 2200;

      function frame(now) {
        if (disposed) return;
        var t = (now - start) / 1000;
        uniforms.uTime.value = reduce ? 4 : t;
        if (!reduce) uniforms.uProgress.value = Math.min(1, (now - start) / INTRO);
        // gentle parallax so the number feels suspended in depth
        points.rotation.y = reduce ? 0 : Math.sin(t * 0.25) * 0.12;
        points.rotation.x = reduce ? 0 : Math.cos(t * 0.2) * 0.06;
        if (uniforms.uProgress.value > 0.75) pct.style.opacity = 1;
        renderer.render(scene, cam);
        if (!reduce) raf = requestAnimationFrame(frame);
      }
      if (reduce) pct.style.opacity = 1;
      raf = requestAnimationFrame(frame);

      el._stardust = { geo: geo, mat: mat };
    }

    return {
      dispose: function () {
        disposed = true;
        cancelAnimationFrame(raf);
        if (el._stardust) { el._stardust.geo.dispose(); el._stardust.mat.dispose(); }
        if (renderer) {
          renderer.dispose();
          if (renderer.forceContextLoss) renderer.forceContextLoss();
          if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
        if (label.parentNode) label.parentNode.removeChild(label);
        if (pct.parentNode) pct.parentNode.removeChild(pct);
      },
    };
  };
})();
