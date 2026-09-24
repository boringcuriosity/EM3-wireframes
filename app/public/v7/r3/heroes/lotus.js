/* Lotus Bloom: a 3D lotus whose petals open with the score.
   13 petals in three rings. At 54% seven have unfolded (outer ring first,
   then two of the middle ring) and the rest are still a pale closed bud,
   so the filled part and the remaining part are both visible at a glance. */
(function () {
  window.HEROES = window.HEROES || {};

  var OPEN = [[0, "#246649"], [0.18, "#2A805A"], [0.42, "#299D6B"], [0.7, "#59B38C"], [0.9, "#79CCA8"], [1, "#CBF0E0"]];
  var CLOSED = [[0, "#79CCA8"], [0.3, "#ABE6CC"], [0.7, "#CBF0E0"], [1, "#D0D5DD"]];

  function hex(h) {
    var n = parseInt(h.slice(1), 16);
    return [(n >> 16) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  }
  OPEN = OPEN.map(function (s) { return [s[0], hex(s[1])]; });
  CLOSED = CLOSED.map(function (s) { return [s[0], hex(s[1])]; });

  function ramp(stops, t) {
    for (var i = 1; i < stops.length; i++) {
      if (t <= stops[i][0]) {
        var a = stops[i - 1], b = stops[i], k = (t - a[0]) / (b[0] - a[0]);
        return [a[1][0] + (b[1][0] - a[1][0]) * k, a[1][1] + (b[1][1] - a[1][1]) * k, a[1][2] + (b[1][2] - a[1][2]) * k];
      }
    }
    return stops[stops.length - 1][1];
  }

  var easeOut = function (t) { return 1 - Math.pow(1 - t, 3); };
  var smooth = function (t) { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); };

  function label(el, total) {
    var wrap = document.createElement("div");
    wrap.style.cssText = "position:absolute;left:0;right:0;bottom:6px;display:flex;flex-direction:column;align-items:center;pointer-events:none;";
    wrap.innerHTML =
      '<div style="display:flex;align-items:flex-start;color:#1D4D38;font-family:\'Playfair Display\',Georgia,serif;font-weight:600;line-height:1;">' +
      '<span data-n style="font-size:46px;letter-spacing:-0.5px;font-variant-numeric:lining-nums;">0</span>' +
      '<span style="font-size:20px;margin:4px 0 0 2px;">%</span></div>' +
      '<div style="margin-top:6px;font-family:Roboto,system-ui,sans-serif;font-size:11px;font-weight:700;letter-spacing:2.2px;color:#2A805A;">SUFFICIENT</div>' +
      '<div data-c style="margin-top:3px;font-family:Roboto,system-ui,sans-serif;font-size:11px;color:#98A2B3;letter-spacing:0.2px;">0 of ' + total + ' petals open</div>';
    el.appendChild(wrap);
    return { root: wrap, n: wrap.querySelector("[data-n]"), c: wrap.querySelector("[data-c]") };
  }

  /* Fallback without WebGL: a flat fan of the same 13 petals. */
  function fallback(el, score) {
    var total = 13, open = Math.round((score / 100) * total);
    var svg = '<svg width="342" height="220" viewBox="-60 -70 120 80" style="position:absolute;left:0;top:10px">';
    for (var i = 0; i < total; i++) {
      var a = -84 + (168 * i) / (total - 1);
      var on = i >= Math.floor((total - open) / 2) && i < Math.floor((total - open) / 2) + open;
      svg += '<path d="M0 0 C -9 -12, -9 -34, 0 -48 C 9 -34, 9 -12, 0 0 Z" transform="rotate(' + a + ')" fill="' + (on ? "#59B38C" : "#E4E7EC") + '" stroke="#FCFCFD" stroke-width="1.2" opacity="0.95"/>';
    }
    svg += '<circle r="6" fill="#CBF0E0"/></svg>';
    el.insertAdjacentHTML("beforeend", svg);
    var l = label(el, total);
    l.n.textContent = score;
    l.c.textContent = open + " of " + total + " petals open";
    return { dispose: function () { el.innerHTML = ""; } };
  }

  function petalGeometry(L, W, cup) {
    var SU = 30, SV = 16, pos = [], uv = [], idx = [];
    var norm = 1 / (Math.pow(0.423, 0.55) * Math.pow(0.577, 0.75));
    for (var i = 0; i <= SU; i++) {
      var u = i / SU;
      var w = W * norm * Math.pow(u, 0.55) * Math.pow(1 - u, 0.75);
      for (var j = 0; j <= SV; j++) {
        var v = (j / SV) * 2 - 1;
        var x = v * w;
        var y = L * u;
        // cupped across the width, bowed outward along the length, tip curls back
        var z = cup * w * (1 - v * v) + 0.07 * L * Math.sin(Math.PI * u) - 0.06 * L * u * u * u;
        pos.push(x, y, z);
        uv.push(u, v);
      }
    }
    for (i = 0; i < SU; i++) {
      for (j = 0; j < SV; j++) {
        var a = i * (SV + 1) + j, b = a + SV + 1;
        idx.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
    var g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("color", new THREE.Float32BufferAttribute(new Array(pos.length).fill(1), 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    g.userData.uv = uv;
    return g;
  }

  function paint(g, open) {
    var uv = g.userData.uv, col = g.attributes.color.array;
    for (var k = 0; k < uv.length / 2; k++) {
      var u = uv[k * 2], v = uv[k * 2 + 1];
      var co = ramp(OPEN, u), cc = ramp(CLOSED, u);
      // a slightly deeper centre vein, lighter edges
      var edge = 0.16 * v * v;
      for (var c = 0; c < 3; c++) {
        var o = co[c] + (1 - co[c]) * edge - 0.05 * (1 - Math.abs(v)) * (1 - u);
        var s = cc[c] + (1 - cc[c]) * edge * 0.5;
        col[k * 3 + c] = s + (o - s) * open;
      }
    }
    g.attributes.color.needsUpdate = true;
  }

  function radialTexture(stops, size) {
    var c = document.createElement("canvas");
    c.width = c.height = size || 128;
    var x = c.getContext("2d"), r = c.width / 2;
    var gr = x.createRadialGradient(r, r, 0, r, r, r);
    stops.forEach(function (s) { gr.addColorStop(s[0], s[1]); });
    x.fillStyle = gr;
    x.fillRect(0, 0, c.width, c.height);
    return new THREE.CanvasTexture(c);
  }

  window.HEROES.lotus = function (el, opts) {
    var score = Math.max(0, Math.min(100, (opts && opts.score) || 0));
    var total = 13;
    var reduced = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

    var gl = null;
    try {
      var probe = document.createElement("canvas");
      gl = window.THREE && (probe.getContext("webgl") || probe.getContext("experimental-webgl"));
    } catch (e) { gl = null; }
    if (!gl) return fallback(el, score);

    var W = el.clientWidth || 342, H = 232;
    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, premultipliedAlpha: true });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.setSize(W, H);
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.cssText = "position:absolute;left:0;top:0;width:" + W + "px;height:" + H + "px;display:block;" +
      "-webkit-mask-image:radial-gradient(ellipse 50% 50% at 50% 48%,#000 70%,transparent 100%);mask-image:radial-gradient(ellipse 50% 50% at 50% 48%,#000 70%,transparent 100%);";
    el.appendChild(renderer.domElement);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(27, W / H, 0.1, 50);
    camera.position.set(0, 1.5, 3.4);
    camera.lookAt(0, 0.4, 0);

    scene.add(new THREE.HemisphereLight(0xffffff, 0xd0d5dd, 0.44));
    scene.add(new THREE.AmbientLight(0xffffff, 0.24));
    var key = new THREE.DirectionalLight(0xffffff, 0.58);
    key.position.set(-1.6, 3.2, 2.4);
    scene.add(key);
    var rim = new THREE.DirectionalLight(0xffffff, 0.28);
    rim.position.set(2.2, 1.2, -2.5);
    scene.add(rim);
    var coreLight = new THREE.PointLight(0xffffff, 0, 1.4, 2);
    coreLight.position.set(0, 0.35, 0);
    scene.add(coreLight);

    var flower = new THREE.Group();
    scene.add(flower);

    // water: a soft mint pool with two faint ripples
    var poolTex = (function () {
      var c = document.createElement("canvas");
      c.width = c.height = 256;
      var x = c.getContext("2d");
      var g = x.createRadialGradient(128, 128, 0, 128, 128, 128);
      g.addColorStop(0, "rgba(121,204,168,0.42)");
      g.addColorStop(0.35, "rgba(171,230,204,0.3)");
      g.addColorStop(0.75, "rgba(230,250,241,0.14)");
      g.addColorStop(1, "rgba(243,252,248,0)");
      x.fillStyle = g;
      x.fillRect(0, 0, 256, 256);
      [70, 104].forEach(function (r, i) {
        x.beginPath();
        x.arc(128, 128, r, 0, Math.PI * 2);
        x.strokeStyle = "rgba(41,157,107," + (i ? 0.08 : 0.12) + ")";
        x.lineWidth = 1.5;
        x.stroke();
      });
      return new THREE.CanvasTexture(c);
    })();
    var pool = new THREE.Mesh(
      new THREE.PlaneGeometry(2.7, 2.7),
      new THREE.MeshBasicMaterial({ map: poolTex, transparent: true, depthWrite: false })
    );
    pool.rotation.x = -Math.PI / 2;
    pool.position.y = -0.02;
    scene.add(pool);

    // three rings: outer 5, middle 5, inner 3. Open order runs outer to inner.
    var rings = [
      { n: 5, L: 1.0, W: 0.38, cup: 0.36, r: 0.06, closed: 0.26, open: 1.22, off: 0, lift: 0 },
      { n: 5, L: 0.9, W: 0.33, cup: 0.42, r: 0.05, closed: 0.2, open: 0.86, off: Math.PI / 5, lift: 0.015 },
      { n: 3, L: 0.68, W: 0.26, cup: 0.5, r: 0.025, closed: 0.05, open: 0.48, off: Math.PI / 3, lift: 0.03 },
    ];
    var petals = [];
    rings.forEach(function (ring) {
      for (var i = 0; i < ring.n; i++) {
        var geo = petalGeometry(ring.L, ring.W, ring.cup);
        var mat = new THREE.MeshStandardMaterial({
          vertexColors: true, side: THREE.DoubleSide, roughness: 0.52, metalness: 0,
          emissive: 0x299d6b, emissiveIntensity: 0.0,
        });
        var mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(0, ring.lift, ring.r);
        var pivot = new THREE.Group();
        pivot.rotation.y = ring.off + (i / ring.n) * Math.PI * 2;
        pivot.add(mesh);
        flower.add(pivot);
        petals.push({ mesh: mesh, geo: geo, mat: mat, ring: ring, open: -1 });
      }
    });

    // receptacle and a glowing core of light
    var seed = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 24, 16),
      new THREE.MeshStandardMaterial({ color: 0xabe6cc, emissive: 0xcbf0e0, emissiveIntensity: 0.6, roughness: 0.4 })
    );
    seed.scale.set(1, 0.6, 1);
    seed.position.y = 0.1;
    flower.add(seed);
    var glow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: radialTexture([[0, "rgba(255,255,255,0.85)"], [0.2, "rgba(230,250,241,0.55)"], [0.55, "rgba(171,230,204,0.16)"], [1, "rgba(203,240,224,0)"]]),
      transparent: true, depthWrite: false,
    }));
    glow.position.y = 0.34;
    glow.scale.set(0, 0, 1);
    scene.add(glow);

    // pollen motes
    var MOTES = 36, mp = new Float32Array(MOTES * 3), mc = new Float32Array(MOTES * 3), seeds = [];
    var moteCols = [hex("#FFFFFF"), hex("#CBF0E0"), hex("#79CCA8"), hex("#E6FAF1")];
    for (var m = 0; m < MOTES; m++) {
      var a = Math.random() * Math.PI * 2, rr = 0.25 + Math.random() * 1.1;
      seeds.push({ a: a, r: rr, y: Math.random() * 1.6, s: 0.05 + Math.random() * 0.08, w: Math.random() * 6 });
      var cc = m % 12 === 5 ? hex("#E7C144") : moteCols[m % moteCols.length];
      mc.set(cc, m * 3);
    }
    var moteGeo = new THREE.BufferGeometry();
    moteGeo.setAttribute("position", new THREE.BufferAttribute(mp, 3));
    moteGeo.setAttribute("color", new THREE.BufferAttribute(mc, 3));
    var moteTex = radialTexture([[0, "rgba(255,255,255,1)"], [0.4, "rgba(255,255,255,0.6)"], [1, "rgba(255,255,255,0)"]], 64);
    var motes = new THREE.Points(moteGeo, new THREE.PointsMaterial({
      size: 0.05, map: moteTex, vertexColors: true, transparent: true, depthWrite: false, opacity: 0,
    }));
    scene.add(motes);

    var ui = label(el, total);
    var target = (score / 100) * total; // 7.02 at 54%
    var INTRO = 1.6;

    function setProgress(p) {
      // p runs 0..1; petals open one after another, outer ring first
      var count = target * p;
      for (var i = 0; i < petals.length; i++) {
        var pt = petals[i];
        var o = smooth(count - i);
        // the next petal to open stirs a little once the bloom has reached it
        if (i === Math.floor(target) && p >= 1) o = Math.max(o, 0.12);
        if (Math.abs(o - pt.open) > 0.004) {
          pt.open = o;
          paint(pt.geo, o);
          pt.mesh.rotation.x = pt.ring.closed + (pt.ring.open - pt.ring.closed) * o;
          var sc = 0.9 + 0.1 * o;
          pt.mesh.scale.set(sc * (1 + 0.12 * o), 0.94 + 0.06 * o, sc * (1 - 0.55 * o));
          pt.mat.emissiveIntensity = 0.06 * o;
        }
      }
      var g = 0.2 + 0.32 * p;
      glow.scale.set(g, g, 1);
      coreLight.intensity = 0.3 * p;
      motes.material.opacity = 0.85 * p;
      var shown = Math.round(score * p);
      ui.n.textContent = shown;
      ui.c.textContent = Math.min(total, Math.floor(target * p + 0.001)) + " of " + total + " petals open";
    }

    var raf = 0, t0 = performance.now(), last = t0, disposed = false;
    flower.rotation.y = -0.35;

    function frame(now) {
      if (disposed) return;
      var dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      var t = (now - t0) / 1000;
      setProgress(easeOut(Math.min(1, t / INTRO)));

      flower.rotation.y += dt * ((Math.PI * 2) / 48);
      flower.rotation.z = Math.sin((t * Math.PI * 2) / 12) * 0.025;
      flower.rotation.x = Math.sin((t * Math.PI * 2) / 15) * 0.02;
      var breathe = 1 + Math.sin((t * Math.PI * 2) / 6) * 0.04;
      glow.material.opacity = breathe * 0.8;

      for (var k = 0; k < MOTES; k++) {
        var s = seeds[k];
        s.y += dt * s.s;
        if (s.y > 1.7) { s.y = 0.05; s.a = Math.random() * Math.PI * 2; }
        var r = s.r + Math.sin(t * 0.5 + s.w) * 0.05;
        var ang = s.a + t * 0.06;
        mp[k * 3] = Math.cos(ang) * r;
        mp[k * 3 + 1] = s.y;
        mp[k * 3 + 2] = Math.sin(ang) * r;
      }
      moteGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
      raf = requestAnimationFrame(frame);
    }

    if (reduced) {
      setProgress(1);
      for (var k = 0; k < MOTES; k++) {
        var s = seeds[k], r = s.r;
        mp[k * 3] = Math.cos(s.a) * r; mp[k * 3 + 1] = s.y; mp[k * 3 + 2] = Math.sin(s.a) * r;
      }
      moteGeo.attributes.position.needsUpdate = true;
      renderer.render(scene, camera);
    } else {
      setProgress(0);
      raf = requestAnimationFrame(frame);
    }

    return {
      dispose: function () {
        disposed = true;
        cancelAnimationFrame(raf);
        scene.traverse(function (o) {
          if (o.geometry) o.geometry.dispose();
          if (o.material) {
            if (o.material.map) o.material.map.dispose();
            o.material.dispose();
          }
        });
        renderer.dispose();
        if (renderer.forceContextLoss) renderer.forceContextLoss();
        el.innerHTML = "";
      },
    };
  };
})();
