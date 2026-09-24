(function () {
  window.HEROES = window.HEROES || {};

  /* ---------------------------------------------------------- the padlock */
  /* Shaheer's Lock.json. The player and the animation are both in the repo
     rather than on a CDN, so the prototype opens with no network. One fetch
     and one script tag for the whole page however many plates are on it, and
     a plate that mounts before either has landed waits in the queue rather
     than drawing a fallback that would then be replaced under the reader. */
  var LOCK_Q = [], LOCK_ASKED = false;
  function lockReady() {
    if (!window.GF_LOCK || !window.lottie) return;
    var q = LOCK_Q; LOCK_Q = [];
    q.forEach(paintLock);
  }
  function paintLock(el) {
    if (!el.isConnected) return;
    var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    var anim = window.lottie.loadAnimation({
      container: el, renderer: "svg", loop: false, autoplay: !reduce,
      animationData: window.GF_LOCK,
      rendererSettings: { preserveAspectRatio: "xMidYMid meet" }
    });
    /* it locks once and stays locked, so the last frame is where it lives */
    if (reduce) anim.addEventListener("DOMLoaded", function () { anim.goToAndStop(anim.totalFrames - 1, true); });
  }
  /* Both pieces arrive as script tags rather than as a fetch. fetch() is
     blocked on a file: origin and these prototypes are opened straight off
     disk as often as they are served, which is why the lock drew its halo and
     nothing else. A script tag works on both. */
  function need(src, has) {
    if (has()) return;
    var found = [].some.call(document.scripts, function (x) { return x.src.indexOf(src) > -1; });
    if (found) return;
    var sc = document.createElement("script");
    sc.src = BASE + src;
    sc.onload = lockReady;
    document.head.appendChild(sc);
  }
  function mountLock(el) {
    LOCK_Q.push(el);
    if (window.GF_LOCK && window.lottie) return lockReady();
    if (!LOCK_ASKED) {
      LOCK_ASKED = true;
      need("assets/lottie_light.min.js", function () { return !!window.lottie; });
      need("assets/lock-anim.js", function () { return !!window.GF_LOCK; });
    }
  }

  /* this file is loaded as heroes/plate.js, so assets sit one level up */
  var BASE = (function () {
    var me = document.currentScript && document.currentScript.src;
    return me ? me.replace(/heroes\/[^/]*$/, "") : "";
  })();

  /* The Plate: a halo of dots that light up clockwise from the top as the day's
     sufficiency counts up, flanked by a fork and a knife. Dots mean one thing
     only: how much of the day is sufficient.

     Every state the Eat page can be in is drawn from the same plate, so the
     screen never swaps to a different shape to say "no score yet" or "that day
     is over". What changes is how the plate is laid: ghosted for a day with no
     targets, dashed and waiting before the first meal, dense and warm for a day
     fully read, still and muted for history. */
  /* The plate says one thing: the number, and SUFFICIENT when there is one. No
     captions, no dates, no counts. Everything else the day needs to say is said
     in Kaira's card, where there is room to say it properly. */
  var CFG = {
    /* No plan yet, so no targets and no score. A place setting waiting, with the
       score shown as locked rather than missing: the same padlock, lit on the
       day nothing has happened, quiet once food is going in. */
    noplan:  { dots: "ghost",   rim: 1, well: 1, centre: "lock", lock: "quiet", live: 1 },
    noplanempty: { dots: "ghost", rim: 1, well: 1, centre: "lock", lock: "lit", live: 1 },
    /* Targets set, nothing logged. Alive but unserved, and asking rather than
       printing a zero at a day that has not started. */
    /* Targets set, nothing logged. A zero would be a verdict on a day that has
     not happened, and a dash reads as a number that went missing, so the
     plate simply shows itself laid: the well, and the house place setting in
     the middle of it. No digits, no caption, nothing to be measured against
     until there is something to measure. */
  empty:   { dots: "empty",   rim: 1, well: 1, centre: "setting", live: 1 },
    /* The first meal has to visibly move something. */
    first:   { dots: "fill", score: 12,  centre: "num", live: 1, pop: 1 },
    mid:     { dots: "fill", score: 54,  centre: "num", live: 1 },
    full:    { dots: "fill", score: 88,  centre: "num", dense: 1, live: 1 },
    perfect: { dots: "fill", score: 100, centre: "num", dense: 1, bloom: 1, live: 1 },
    /* History: no intro, no idle motion, palette a step back. The date is in the
       chip at the top of the page, so the plate does not repeat it. */
    past:    { dots: "fill", score: 61,  centre: "num", muted: 1, still: 1 },
    missed:  { dots: "empty",            centre: "dash", muted: 1, still: 1 },
    loading: { dots: "shimmer",          centre: "none", live: 1 }
  };

  /* a copy per plate, because a live change can switch bloom on and that must
     never leak into the next plate the page draws */
  function clone(o) { var r = {}, k; for (k in o) { if (Object.prototype.hasOwnProperty.call(o, k)) r[k] = o[k]; } return r; }

  window.HEROES.plate = function (el, opts) {
    opts = opts || {};
    var state = opts.state || "mid";
    var cfg = clone(CFG[state] || CFG.mid);
    var score = typeof opts.score === "number" ? opts.score : (cfg.score || 0);
    var W = 342, H = 320, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var cx = 171, cy = 158;
    var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    var still = !!cfg.still || reduce;

    el.style.position = "relative";
    var cv = document.createElement("canvas");
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.cssText = "position:absolute;inset:0;width:" + W + "px;height:" + H + "px;display:block";
    el.appendChild(cv);
    var ctx = cv.getContext("2d");
    ctx.scale(dpr, dpr);

    // Fork and knife, thin line drawings either side. They never leave.
    var ut = document.createElement("div");
    ut.style.cssText = "position:absolute;inset:0;pointer-events:none";
    el.appendChild(ut);

    var label = document.createElement("div");
    label.style.cssText = "position:absolute;left:0;right:0;top:" + cy + "px;transform:translateY(-50%);display:flex;flex-direction:column;align-items:center;pointer-events:none;text-align:center";
    el.appendChild(label);
    var numEl = null;

    if (!document.getElementById("plate-lock-css")) {
      var st = document.createElement("style");
      st.id = "plate-lock-css";
      st.textContent = "@keyframes plateLockBreath{0%,100%{transform:scale(1);opacity:.75}50%{transform:scale(1.12);opacity:1}}" +
        ".lockhalo{animation:plateLockBreath 4.5s ease-in-out infinite}" +
        "@media (prefers-reduced-motion: reduce){.lockhalo{animation:none}}";
      document.head.appendChild(st);
    }

    /* Everything that changes when the plate changes state is written here, so
       a day that starts empty and gets its first meal moves the same plate
       instead of being rebuilt underneath the user. */
    function dressCentre() {
      var cutlery = cfg.muted ? "#CBF0E0" : (cfg.dots === "ghost" || cfg.dots === "shimmer" ? "#D0D5DD" : "#ABE6CC");
      /* On a day that is laid but not served the setting moves into the well,
         so the plate reads as one object rather than as a plate with a second
         pair of utensils beside it. */
      ut.innerHTML = cfg.centre === "setting" ? "" :
        '<svg width="342" height="320" viewBox="0 0 342 320" fill="none" stroke="' + cutlery + '" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' +
        // fork, moved 10 out from the plate so the setting breathes
        '<path d="M6 104v34c0 6 4 10 9 10s9-4 9-10v-34M15 104v30M15 148v70"/>' +
        // knife, the same 10 the other way
        '<path d="M336 104c-9 8-12 24-12 44 0 8 4 12 12 12M336 104v114"/>' +
        "</svg>";

      var ink = cfg.muted ? "#475467" : "#101828";
      var pctInk = cfg.muted ? "#667085" : "#2A805A";
      var serif = "'Playfair Display',Georgia,serif";
      var head = "";
      if (cfg.centre === "num") {
        head =
          '<div style="display:flex;align-items:flex-start;color:' + ink + ';font-family:' + serif + ';font-weight:600;line-height:1">' +
          '<span class="n" style="font-size:66px;letter-spacing:-1px">0</span>' +
          '<span style="font-size:22px;margin:8px 0 0 2px;color:' + pctInk + '">%</span></div>';
      } else if (cfg.centre === "setting") {
        /* the same pictogram the logging screen's empty Recent tab uses, so
           "nothing here yet" looks the same wherever the day says it */
        /* the same fork and knife that flank every other state, brought in
           and stood together in the middle of the plate */
        head =
          '<svg width="34" height="78" viewBox="0 0 50 114" fill="none" stroke="#79CCA8" ' +
            'stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:block">' +
            '<path d="M0 0v34c0 6 4 10 9 10s9-4 9-10v-34M9 0v30M9 44v70"/>' +
            '<path d="M50 0c-9 8-12 24-12 44 0 8 4 12 12 12M50 0v114"/>' +
          "</svg>";
      } else if (cfg.centre === "dash") {
        head = '<div style="width:38px;height:4px;border-radius:2px;background:' + (cfg.muted ? "#D0D5DD" : "#CBF0E0") + '"></div>';
      } else if (cfg.centre === "lock") {
        /* The score kept rather than missing: one finely drawn padlock standing
           in the plate's centre, nothing behind it but light and a whisper of a
           shadow, so it reads as held back rather than switched off. Lit on the
           day nothing has happened, quiet once food is going in. */
        var loud = cfg.lock === "lit";
        /* Shaheer's Lock.json, played once. It runs on arrival and then holds
           on its last frame, which is what a locked score is: a thing that
           happened, not a thing still happening. Under reduced motion it is
           parked on that last frame from the start. */
        head =
          '<div class="lockwrap" style="position:relative;width:124px;height:124px;display:grid;place-items:center">' +
            (loud ? '<div class="lockhalo" style="position:absolute;width:146px;height:146px;border-radius:50%;background:radial-gradient(closest-side,rgba(171,230,204,.55),rgba(230,250,241,0))"></div>' : "") +
            /* never dimmed: the lock is the one thing on the screen that is
               definitely true, and fading it made a fact look provisional */
            '<div class="lockplay" style="position:relative;width:124px;height:124px"></div></div>';
      }

      label.innerHTML = head +
        (cfg.centre === "num" ? '<div style="margin-top:9px;font:700 12px Roboto,Arial,sans-serif;letter-spacing:2.4px;color:' + pctInk + '">SUFFICIENT</div>' : "");
      var play = label.querySelector(".lockplay");
      if (play) mountLock(play);
      numEl = label.querySelector(".n");
    }
    dressCentre();

    // ---------- the dots ----------
    var seed = 7;
    var rnd = function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    var rings = [{ r: 90, n: 16, s: 3.2 }, { r: 107, n: 20, s: 4.1 }, { r: 124, n: 24, s: 5 }];
    var dots = [];
    rings.forEach(function (ring, ri) {
      for (var i = 0; i < ring.n; i++) {
        var a = ((i / ring.n) * Math.PI * 2 + (ri * 0.21) + (rnd() - 0.5) * 0.08 + Math.PI * 2) % (Math.PI * 2);
        var rr = ring.r + (rnd() - 0.5) * 5;
        dots.push({ a: a, x: cx + Math.sin(a) * rr, y: cy - Math.cos(a) * rr, s: ring.s * (0.85 + rnd() * 0.3), ring: ri, tw: rnd() * Math.PI * 2 });
      }
    });
    dots.sort(function (p, q) { return p.a - q.a; });
    var total = dots.length;
    var sizeK = 1;
    function dressDots() {
      var greens = cfg.dense ? ["#59B38C", "#2A805A", "#246649"]
        : cfg.muted ? ["#ABE6CC", "#79CCA8", "#59B38C"]
        : ["#79CCA8", "#299D6B", "#2A805A"];
      dots.forEach(function (d, i) { d.order = i; d.c = greens[(d.ring + (i % 3 === 0 ? 1 : 0)) % 3]; });
      sizeK = cfg.dense ? 1.12 : 1;
    }
    dressDots();

    var easeOut = function (x) { return 1 - Math.pow(1 - x, 3); };
    var t0 = performance.now(), raf = 0, alive = true;

    /* The number the plate is showing, and the move it is making towards the
       number it has been given. Arriving on mount and changing later are the
       same move with different lengths, so a meal logged at eleven grows the
       plate that is already there. */
    var shown = 0, from = 0, to = score, moveAt = 0, moveDur = 1.2;
    var pulseAt = -9;                                   // the breath a change sends through the ring
    var bloomAt = cfg.bloom ? 1.15 : -9;                // the single ring of light for a whole day met
    var now = function () { return (performance.now() - t0) / 1000; };

    function paint(t) {
      shown = still ? to : from + (to - from) * easeOut(moveDur <= 0 ? 1 : Math.min(1, Math.max(0, (t - moveAt) / moveDur)));
      if (numEl) numEl.textContent = Math.round(shown);
      var litF = (shown / 100) * total;
      var breath = still ? 1 : 1 + Math.sin(t * 0.55) * 0.05;
      /* a soft breath through the plate whenever the number moves */
      var pu = (t - pulseAt) / 0.9;
      var pulse = (!still && pu >= 0 && pu <= 1) ? 1 + Math.sin(pu * Math.PI) * 0.055 : 1;

      ctx.clearRect(0, 0, W, H);

      // The light the plate sits in.
      var flat = cfg.muted || cfg.dots === "shimmer"; // history and skeletons take no brand light
      var g0 = flat ? "rgba(242,244,247,0.7)" : cfg.dense ? "rgba(203,240,224,0.95)" : "rgba(230,250,241,0.95)";
      var g1 = flat ? "rgba(249,250,251,0.5)" : "rgba(243,252,248,0.6)";
      var glow = ctx.createRadialGradient(cx, cy, 20, cx, cy, 150 * pulse * (cfg.dots === "ghost" || cfg.dots === "empty" ? breath : 1));
      glow.addColorStop(0, g0);
      glow.addColorStop(0.55, g1);
      glow.addColorStop(1, "rgba(250,255,253,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, 150, 0, Math.PI * 2);
      ctx.fill();

      // The well of the plate, for a setting that is laid but not served.
      if (cfg.well) {
        ctx.beginPath();
        ctx.arc(cx, cy, 98, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.fill();
        ctx.strokeStyle = "#E4E7EC";
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      // The rim: dashed while the day is waiting, absent once it is running.
      if (cfg.rim) {
        ctx.save();
        ctx.setLineDash([2, 7]);
        ctx.beginPath();
        ctx.arc(cx, cy, 141, 0, Math.PI * 2);
        ctx.strokeStyle = "#D0D5DD";
        ctx.lineWidth = 1.4;
        ctx.stroke();
        ctx.restore();
      }

      // Thin guide ring behind the dots, widening a touch as the number moves.
      ctx.beginPath();
      ctx.arc(cx, cy, 72 * pulse, 0, Math.PI * 2);
      ctx.strokeStyle = cfg.muted ? "rgba(228,231,236,0.9)" : "rgba(203,240,224,0.8)";
      ctx.lineWidth = 1 + (pulse - 1) * 12;
      ctx.stroke();

      var band = cfg.dots === "shimmer" ? (reduce ? cx : ((t * 0.42) % 1.5) * (W + 200) - 100) : 0;

      for (var i = 0; i < total; i++) {
        var d = dots[i];

        if (cfg.dots === "ghost") {
          ctx.beginPath();
          ctx.arc(d.x, d.y, d.s * 0.66, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(208,213,221," + (0.46 + Math.sin(t * 0.55 + d.tw) * 0.08) + ")";
          ctx.fill();
          continue;
        }
        if (cfg.dots === "shimmer") {
          var dist = Math.abs(d.x - band);
          var lift = Math.max(0, 1 - dist / 90);
          ctx.beginPath();
          ctx.arc(d.x, d.y, d.s * 0.82, 0, Math.PI * 2);
          ctx.fillStyle = lift > 0 ? mix("#E4E7EC", "#C6CBD3", lift) : "#E4E7EC";
          ctx.fill();
          continue;
        }
        if (cfg.dots === "empty") {
          ctx.beginPath();
          ctx.arc(d.x, d.y, d.s * (cfg.muted ? 0.76 : 0.82) * (still ? 1 : breath), 0, Math.PI * 2);
          ctx.fillStyle = "#E4E7EC";
          ctx.fill();
          continue;
        }

        var k = Math.max(0, Math.min(1, litF - d.order)); // 0 unlit, 1 fully lit
        var breathe = still ? 1 : 1 + Math.sin(t * 1.3 + d.tw) * 0.06;
        if (k > 0) {
          var pop = k < 1 ? 1 + Math.sin(k * Math.PI) * (cfg.pop ? 0.7 : 0.45) : breathe;
          ctx.beginPath();
          ctx.arc(d.x, d.y, d.s * sizeK * (cfg.dense ? 2.1 : 1.9) * pop, 0, Math.PI * 2);
          ctx.fillStyle = (cfg.muted ? "rgba(203,240,224," : "rgba(171,230,204,") + (cfg.dense ? 0.22 : 0.16) * k + ")";
          ctx.fill();
          ctx.beginPath();
          ctx.arc(d.x, d.y, d.s * sizeK * pop, 0, Math.PI * 2);
          ctx.fillStyle = d.c;
          ctx.globalAlpha = (cfg.muted ? 0.75 : 0.35 + 0.65 * k);
          ctx.fill();
          ctx.globalAlpha = 1;
        } else {
          ctx.beginPath();
          ctx.arc(d.x, d.y, d.s * 0.82, 0, Math.PI * 2);
          ctx.fillStyle = cfg.muted ? "#EDEFF2" : "#E4E7EC";
          ctx.fill();
        }
      }

      /* Every target met gets one bloom of light and nothing more: a single
         ring opening outward once the last dot lands, then stillness. */
      if (cfg.bloom) {
        var bt = reduce ? 1 : (t - bloomAt) / 1.7;
        if (reduce) {
          ctx.beginPath();
          ctx.arc(cx, cy, 140, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(121,204,168,0.5)";
          ctx.lineWidth = 2;
          ctx.stroke();
        } else if (bt > 0 && bt < 1) {
          var br = 104 + bt * 62;
          ctx.beginPath();
          ctx.arc(cx, cy, br, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(121,204,168," + (0.55 * (1 - bt)) + ")";
          ctx.lineWidth = 2 + 4 * (1 - bt);
          ctx.stroke();
          /* three specks of gold riding the bloom out, the one warm note the
             plate is allowed, and only on a day where everything landed */
          for (var s = 0; s < 3; s++) {
            var sa = (s / 3) * Math.PI * 2 - Math.PI / 5;
            ctx.beginPath();
            ctx.arc(cx + Math.sin(sa) * (br + 4), cy - Math.cos(sa) * (br + 4), 2.1 * (1 - bt) + 0.6, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(231,193,68," + (0.75 * (1 - bt)) + ")";
            ctx.fill();
          }
        }
      }
    }

    function mix(a, b, k) {
      var pa = [parseInt(a.slice(1, 3), 16), parseInt(a.slice(3, 5), 16), parseInt(a.slice(5, 7), 16)];
      var pb = [parseInt(b.slice(1, 3), 16), parseInt(b.slice(3, 5), 16), parseInt(b.slice(5, 7), 16)];
      return "rgb(" + pa.map(function (v, i) { return Math.round(v + (pb[i] - v) * k); }).join(",") + ")";
    }

    function frame(now) {
      if (!alive) return;
      paint((now - t0) / 1000);
      raf = requestAnimationFrame(frame);
    }

    if (still) paint(2); // history, tomorrow, and reduced motion: one settled frame
    else raf = requestAnimationFrame(frame);

    /* Move the plate to a new number, and to a new state where the day has
       crossed one (an empty morning becoming a first meal). The dots light on
       from wherever they are, so nothing flashes or restarts. */
    function set(next, o) {
      o = o || {};
      if (!alive) return;
      var t = now();

      if (o.state && o.state !== state && CFG[o.state]) {
        state = o.state;
        cfg = clone(CFG[state]);
        still = !!cfg.still || reduce;
        bloomAt = cfg.bloom ? t + 0.55 : -9;
        dressCentre();
        dressDots();
      }

      if (typeof next === "number") {
        from = still ? next : shown;
        to = Math.max(0, Math.min(100, next));
      } else {
        from = shown;
        to = cfg.score || to;
      }
      moveAt = t;
      moveDur = still ? 0 : (typeof o.duration === "number" ? o.duration : 0.6);
      pulseAt = t;
      if (to >= 100 && cfg.centre === "num") { cfg.bloom = 1; bloomAt = t + moveDur * 0.85; }

      if (still) paint(t + 2);
      else if (!raf) { alive = true; raf = requestAnimationFrame(frame); }
    }

    return {
      set: set,
      dispose: function () { alive = false; cancelAnimationFrame(raf); raf = 0; el.innerHTML = ""; }
    };
  };
})();
