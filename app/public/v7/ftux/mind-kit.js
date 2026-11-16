/* Shared visuals for the Rhythm first-look sheet (mind-swipe.html). The Mind twin of move-kit.js.
   Gold is the score's colour only: the Rhythm ring, the orb and the medal. Cards are Mind's indigo and white.
   MINDK.day(el)     plan, step 2: the Morning scene from Mind's plan cards under a glass card. Last night's sleep is
                     logged, then Simple Breathing is ticked, then a mood check-in, and the gold Rhythm ring fills each time.
   MINDK.reward(el)  plan, step 3: slow sun rays behind Lotus at dawn on its ribbon, and the 80% line.
   MINDK.early(el)   waiting for a plan, step 2: the same card with sleep and breathing ticked; the ring stays locked.
   MINDK.health(el)  free, step 1: the Night scene under a Last night card that fills in from Apple Health.
   MINDK.breaths(el) free, step 2: three of the seven breathing exercises, the front one breathing in 5 and out 5.
   Each returns { play(), still(), reset() }.
   Numbers are one sample night on the coach portal's default plan (coach-mind/data.js, mind/rhythm.js): 7.5 h asleep,
   10:30 PM to 6:00 AM. Slept 10:50 PM to 6:10 AM, 7h 20m: hours 23 x (1 - 10/180) = 21.7, window on time 24, so 46.
   Simple Breathing adds 10 (56), a mood check-in 10 (66). Wind-down and me-time are still to come. */
(function () {
  var css = document.createElement("style");
  css.textContent =
    /* the scene panels: Mind's own part-of-day art, top right, as on the plan cards */
    ".nk-scene{position:absolute;inset:0;overflow:hidden;background:var(--sc) right -40px top -10px/auto 290px no-repeat,linear-gradient(180deg,var(--in-25),#fff)}" +
    ".nk-card{position:absolute;z-index:4;left:12px;width:262px;bottom:12px;padding:10px 12px 8px;border-radius:20px;background:rgb(255 255 255/.76);" +
      "-webkit-backdrop-filter:blur(16px) saturate(1.2);backdrop-filter:blur(16px) saturate(1.2);border:1px solid rgb(255 255 255/.9);" +
      "box-shadow:0 10px 28px rgb(45 49 166/.14),inset 0 1px 0 rgb(255 255 255/.9);opacity:0;transform:translateY(12px);transition:opacity .6s var(--ease),transform .6s var(--ease)}" +
    ".nk-on .nk-card{opacity:1;transform:none}" +
    ".nk-hd{display:flex;align-items:baseline;gap:8px;margin-bottom:2px}.nk-hd b{font:600 16px/22px Roboto,sans-serif;color:var(--g-900)}.nk-hd span{font:400 12px/18px Roboto,sans-serif;color:var(--g-500)}" +
    ".nk-row{display:flex;align-items:center;gap:12px;height:46px;font:500 14px/18px Roboto,sans-serif;color:var(--g-900)}" +
    ".nk-row>div{flex:1;min-width:0}.nk-row small{display:block;font:400 12px/16px Roboto,sans-serif;color:var(--g-500)}" +
    ".nk-row+.nk-row{border-top:1px solid rgb(152 162 179/.18)}" +
    ".nk-th,.nk-ic{flex:none;width:32px;height:32px;border-radius:10px}" +
    ".nk-th{object-fit:cover;object-position:78% 40%;background:var(--in-50)}" +
    ".nk-ic{display:grid;place-items:center;background:var(--in-50);color:var(--in-600);font-size:18px;line-height:1}.nk-ic svg{width:18px;height:18px}" +
    ".nk-tk{flex:none;width:24px;height:24px;border-radius:9999px;border:1.5px solid var(--g-300);background:#fff;display:grid;place-items:center;transition:background-color .35s var(--ease),border-color .35s var(--ease)}" +
    ".nk-tk svg{width:12px;height:12px;opacity:0;transform:scale(.6);transition:opacity .3s var(--ease),transform .35s var(--ease)}" +
    ".nk-tk.on{background:var(--ok-600);border-color:var(--ok-600)}.nk-tk.on svg{opacity:1;transform:none}" +
    /* the face fades in when the check-in lands */
    ".nk-face{opacity:0;transform:scale(.8);transition:opacity .4s var(--ease),transform .45s var(--ease)}.nk-face.on{opacity:1;transform:none}" +
    /* the Rhythm ring: gold, the score's colour, on a white glass disc at the top right */
    ".nk-score{position:absolute;z-index:5;right:14px;top:14px;width:76px;height:76px;border-radius:9999px;background:rgb(255 255 255/.86);" +
      "-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);box-shadow:0 8px 22px rgb(130 110 45/.16),inset 0 0 0 1px rgb(255 255 255/.9);" +
      "display:grid;place-items:center;opacity:0;transform:translateY(-6px);transition:opacity .6s var(--ease) .15s,transform .6s var(--ease) .15s}" +
    ".nk-on .nk-score{opacity:1;transform:none}" +
    ".nk-score svg.r{position:absolute;inset:6px;width:64px;height:64px;transform:rotate(-90deg)}.nk-score circle{fill:none;stroke-width:5}" +
    ".nk-score .b{stroke:var(--gold-100)}.nk-score .f{stroke:url(#nkGold);stroke-linecap:round}" +
    ".nk-score .v{position:relative;text-align:center;font:600 18px/20px Roboto,sans-serif;color:var(--g-900);font-variant-numeric:tabular-nums}" +
    ".nk-score .v sup{font-size:9px;font-weight:600;vertical-align:8px;margin-left:1px}" +
    ".nk-score .v small{display:block;font:500 10px/12px Roboto,sans-serif;color:var(--g-500);letter-spacing:.1px}" +
    /* locked: no score yet, so no gold */
    ".nk-score.lk .b{stroke:var(--g-200)}.nk-score.lk .f{display:none}.nk-score.lk .v{color:var(--g-400)}.nk-score.lk .v svg{display:block;margin:0 auto 1px;width:20px;height:20px}" +
    /* a gain pops up beside the ring, then fades */
    ".nk-gain{position:absolute;z-index:6;right:96px;top:36px;font:600 13px/1 Roboto,sans-serif;color:var(--gold-800);opacity:0;transform:translateY(4px);transition:opacity .35s var(--ease),transform .5s var(--ease)}" +
    ".nk-gain.on{opacity:1;transform:none}" +
    /* the reward */
    ".nk-rw{position:absolute;inset:0;overflow:hidden;background:radial-gradient(120% 90% at 50% 42%,var(--gold-50) 0%,#fff 70%)}" +
    ".nk-rays{position:absolute;left:50%;top:42%;width:760px;height:760px;margin:-380px 0 0 -380px;opacity:0;transition:opacity 1.2s var(--ease);" +
      "background:repeating-conic-gradient(from 0deg,rgb(253 224 140/.36) 0deg 7deg,rgb(255 255 255/0) 7deg 20deg);" +
      "-webkit-mask:radial-gradient(closest-side,#000 18%,rgb(0 0 0/.5) 46%,transparent 72%);mask:radial-gradient(closest-side,#000 18%,rgb(0 0 0/.5) 46%,transparent 72%);animation:nkSpin 60s linear infinite}" +
    ".nk-on .nk-rays{opacity:1}@keyframes nkSpin{to{transform:rotate(360deg)}}" +
    /* Lotus at dawn hangs from the ribbon the Mind screen uses (mind/index.html, Eat's) */
    ".nk-medal{position:absolute;left:50%;top:0;display:flex;flex-direction:column;align-items:center;transform-origin:50% 0;opacity:0;--w:112px;width:var(--w);margin-left:calc(var(--w)/-2)}" +
    ".nk-medal .rb{width:calc(var(--w)*.34);height:calc(var(--w)*.62);margin-bottom:calc(var(--w)*-.3);background:linear-gradient(90deg,#CDA935 0 33%,#299D6B 33% 67%,#CDA935 67%);box-shadow:inset 0 -12px 12px -8px rgb(0 0 0/.12)}" +
    ".nk-medal img{position:relative;width:var(--w);height:auto;filter:drop-shadow(0 10px 14px rgb(130 110 45/.28))}" +
    ".nk-still .nk-medal{opacity:1}" +
    ".nk-on:not(.nk-still) .nk-medal{animation:nkSwing 1.6s cubic-bezier(.4,0,.2,1) .15s both}" +
    "@keyframes nkSwing{from{opacity:0;transform:translateY(-36px) rotate(7deg)}30%{opacity:1}to{opacity:1;transform:none}}" +
    ".nk-pill{position:absolute;left:50%;bottom:20px;transform:translate(-50%,10px);display:flex;align-items:center;gap:8px;height:40px;padding:0 16px 0 6px;border-radius:9999px;" +
      "background:rgb(255 255 255/.88);box-shadow:0 0 0 1px var(--gold-200),0 6px 16px rgb(130 110 45/.14);opacity:0;transition:opacity .5s var(--ease),transform .5s var(--ease);" +
      "font:600 15px/1 Roboto,sans-serif;color:var(--g-900);white-space:nowrap;font-variant-numeric:tabular-nums}" +
    ".nk-pill svg{width:28px;height:28px;transform:rotate(-90deg)}.nk-pill circle{fill:none;stroke-width:3.5}.nk-pill .b{stroke:var(--gold-100)}.nk-pill .f{stroke:var(--gold-700);stroke-linecap:round}" +
    ".nk-pill span{font-weight:400;color:var(--g-600)}.nk-pill.on{opacity:1;transform:translate(-50%,0)}" +
    /* free: last night, from Apple Health */
    ".nk-night .nk-card{width:280px;padding:12px 14px 10px}" +
    ".nk-lbl{font:500 12px/16px Roboto,sans-serif;color:var(--g-500)}" +
    ".nk-big{display:flex;align-items:baseline;gap:6px;margin-top:2px;font:600 26px/32px Roboto,sans-serif;color:var(--g-900);font-variant-numeric:tabular-nums}.nk-big span{font:400 14px/20px Roboto,sans-serif;color:var(--g-500)}" +
    ".nk-tm{display:flex;gap:14px;margin-top:2px;font:400 12px/18px Roboto,sans-serif;color:var(--g-600)}.nk-tm b{font-weight:600;color:var(--g-900)}" +
    ".nk-bar{position:relative;height:8px;margin:10px 0 4px;border-radius:9999px;background:var(--g-100);overflow:hidden}" +
    ".nk-bar i{position:absolute;top:0;bottom:0;left:23.6%;width:0;border-radius:9999px;background:linear-gradient(90deg,var(--in-400),var(--in-600))}" +
    ".nk-ax{display:flex;justify-content:space-between;font:400 10px/14px Roboto,sans-serif;color:var(--g-400)}" +
    ".nk-src{display:flex;align-items:center;gap:8px;margin-top:8px;padding-top:8px;border-top:1px solid rgb(152 162 179/.18);font:500 12px/16px Roboto,sans-serif;color:var(--g-900);opacity:0;transition:opacity .5s var(--ease)}" +
    ".nk-src.on{opacity:1}.nk-src .hk{width:20px;height:20px;border-radius:6px;background:#fff url(/v7/icons/health/apple-health-heart.png) center/13px no-repeat;box-shadow:0 0 0 1px var(--g-200)}" +
    ".nk-src .hk.hc{background:url(/v7/icons/health/health-connect.png) center/cover no-repeat}.nk-src em{margin-left:auto;font-style:normal;font-weight:400;color:var(--g-500)}" +
    /* free: three of the seven breathing exercises, fanned */
    ".nk-br{position:absolute;inset:0;overflow:hidden;background:radial-gradient(90% 80% at 50% 46%,var(--in-50) 0%,var(--in-25) 45%,#fff 90%)}" +
    ".nk-halo{position:absolute;left:50%;top:44%;width:220px;height:220px;margin:-110px 0 0 -110px;border-radius:9999px;" +
      "background:radial-gradient(closest-side,rgb(128 152 249/.30),rgb(164 188 253/.12) 60%,transparent);transform:scale(.86)}" +
    ".nk-on:not(.nk-still) .nk-halo{animation:nkBreathe 10s ease-in-out infinite}" +
    "@keyframes nkBreathe{0%,100%{transform:scale(.86)}50%{transform:scale(1.12)}}" +
    ".nk-tile{position:absolute;left:50%;top:22px;width:150px;margin-left:-75px;border-radius:16px;overflow:hidden;background:#fff;" +
      "box-shadow:0 0 0 1px var(--in-100),0 10px 24px rgb(45 49 166/.12);opacity:0;transition:opacity .6s var(--ease),transform .7s var(--ease)}" +
    ".nk-tile img{display:block;width:100%;height:92px;object-fit:cover;object-position:85% 40%}" +
    ".nk-tile div{padding:8px 10px 10px;font:600 13px/18px Roboto,sans-serif;color:var(--g-900)}.nk-tile small{display:block;font:400 11px/16px Roboto,sans-serif;color:var(--g-500)}" +
    ".nk-tile.l{transform:translate(-62px,24px) rotate(-7deg) scale(.88)}.nk-tile.r{transform:translate(62px,24px) rotate(7deg) scale(.88)}.nk-tile.c{z-index:2;transform:translateY(16px)}" +
    ".nk-on .nk-tile{opacity:1}.nk-on .nk-tile.l{transform:translate(-92px,14px) rotate(-7deg) scale(.88)}.nk-on .nk-tile.r{transform:translate(92px,14px) rotate(7deg) scale(.88)}.nk-on .nk-tile.c{transform:none}" +
    ".nk-on .nk-tile.l{transition-delay:.25s}.nk-on .nk-tile.r{transition-delay:.4s}" +
    ".nk-br .nk-pill{box-shadow:0 0 0 1px var(--in-100),0 6px 16px rgb(45 49 166/.10);padding:0 16px;transition-delay:.7s}" +
    "@media (prefers-reduced-motion:reduce){.nk-rays,.nk-halo{animation:none !important}}";
  document.head.appendChild(css);

  var EASE = function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  var REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var CHECK = '<svg viewBox="0 0 16 16" fill="none"><path d="M3.5 8.5l3 3 6-7" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var MOON = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.3 2.5a.75.75 0 0 1 .17.83 7.5 7.5 0 0 0 9.2 9.97.75.75 0 0 1 .94.92A10 10 0 1 1 11.5 2.33a.75.75 0 0 1 .8.17Z"/></svg>';
  var LOCK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="5" y="11" width="14" height="10" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
  var GRAD = '<defs><linearGradient id="nkGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E7C144"/><stop offset="1" stop-color="#A68A2D"/></linearGradient></defs>';
  var RC = 2 * Math.PI * 29;
  var THUMB = function (k) { return "/v7/icons/mind/breath/" + k + ".webp?v=1"; };

  function timers() { var t = []; return { add: function (f, ms) { t.push(setTimeout(f, ms)); }, clear: function () { t.forEach(clearTimeout); t = []; } }; }
  function count(fn, from, to, ms) {
    var t0 = null, raf;
    (function f(now) { raf = requestAnimationFrame(function (n) { if (t0 === null) t0 = n; var k = Math.min(1, (n - t0) / ms); fn(from + (to - from) * EASE(k)); if (k < 1) f(); }); })();
    return function () { cancelAnimationFrame(raf); };
  }

  /* the Morning card, with the score ring (plan) or the padlock (waiting for a plan) */
  function card(el, o) {
    var locked = !!o.locked;
    var rows = [
      ['<span class="nk-ic">' + MOON + "</span>", "7h 20m of sleep", locked ? "Last night, logged" : "Last night, on time"],
      ['<img class="nk-th" src="' + THUMB("coherent") + '" alt="">', "Simple Breathing", "5 min"]
    ];
    if (!locked) rows.push(['<span class="nk-ic"><span class="nk-face">🙂</span></span>', "Mood check-in", "Feeling good"]);
    el.innerHTML = '<div class="nk-scene" style="--sc:url(/v7/icons/mind/bg/morning.webp?v=1)"><div class="nk-card">' +
      '<div class="nk-hd"><b>' + (locked ? "Today" : "Morning") + "</b><span>" + (locked ? "Open now" : "6 AM to 12 PM") + "</span></div>" +
      rows.map(function (r, i) { return '<div class="nk-row"><span class="nk-tk" data-i="' + i + '">' + CHECK + "</span>" + r[0] + "<div>" + r[1] + "<small>" + r[2] + "</small></div></div>"; }).join("") +
      '</div><div class="nk-score' + (locked ? " lk" : "") + '"><svg class="r" viewBox="0 0 64 64">' + GRAD + '<circle class="b" cx="32" cy="32" r="29"/><circle class="f" cx="32" cy="32" r="29" stroke-dasharray="0 ' + RC + '"/></svg>' +
      '<div class="v">' + (locked ? LOCK + "<small>Rhythm</small>" : '<span class="n">0</span><sup>%</sup><small>Rhythm</small>') + "</div></div>" +
      '<div class="nk-gain"></div></div>';
    var root = el.firstChild, tks = root.querySelectorAll(".nk-tk"), face = root.querySelector(".nk-face"), n = root.querySelector(".nk-score .n"),
      rg = root.querySelector(".nk-score .f"), gain = root.querySelector(".nk-gain"), T = timers(), stop = null, at = 0;
    /* the score after each tick: sleep 46, breathing 56, a mood check-in 66 */
    var STEPS = [46, 56, 66], GAINS = ["+46 for last night", "+10 for breathing", "+10 for checking in"];
    function set(v) { if (!n) return; at = v; n.textContent = Math.round(v); rg.setAttribute("stroke-dasharray", (RC * v / 100) + " " + RC); rg.style.opacity = v < .5 ? 0 : 1; }
    function reset() { T.clear(); if (stop) stop(); root.classList.remove("nk-on"); tks.forEach(function (t) { t.classList.remove("on"); }); if (face) face.classList.remove("on"); gain.classList.remove("on"); set(0); }
    function still() { reset(); root.classList.add("nk-on"); tks.forEach(function (t) { t.classList.add("on"); }); if (face) face.classList.add("on"); set(locked ? 0 : 66); }
    function play() {
      if (REDUCED) return still();
      reset(); void root.offsetWidth; root.classList.add("nk-on");
      [].forEach.call(tks, function (t, i) {
        T.add(function () {
          t.classList.add("on");
          if (i === 2 && face) face.classList.add("on");
          if (locked) return;
          gain.textContent = GAINS[i]; gain.classList.add("on");
          if (stop) stop(); stop = count(set, at, STEPS[i], 700);
          T.add(function () { gain.classList.remove("on"); }, 900);
        }, 800 + i * 1100);
      });
    }
    reset();
    return { play: play, still: still, reset: reset };
  }

  function reward(el) {
    var R = 2 * Math.PI * 11;
    el.innerHTML = '<div class="nk-rw"><div class="nk-rays"></div>' +
      '<div class="nk-medal"><span class="rb"></span><img src="/v7/icons/badge/mind/lotus-glow.svg" alt=""></div>' +
      '<div class="nk-pill"><svg viewBox="0 0 28 28"><circle class="b" cx="14" cy="14" r="11"/><circle class="f" cx="14" cy="14" r="11" stroke-dasharray="' + (R * .8) + " " + R + '"/></svg><b>80%</b><span>or more in a day</span></div></div>';
    var root = el.firstChild, pill = root.querySelector(".nk-pill"), T = timers();
    function reset() { T.clear(); root.classList.remove("nk-on", "nk-still"); pill.classList.remove("on"); }
    function still() { reset(); root.classList.add("nk-on", "nk-still"); pill.classList.add("on"); }
    function play() {
      if (REDUCED) return still();
      reset(); void root.offsetWidth; root.classList.add("nk-on");
      T.add(function () { pill.classList.add("on"); }, 1300);
    }
    reset();
    return { play: play, still: still, reset: reset };
  }

  /* free: last night fills in from Apple Health (or Health Connect with ?os=android) */
  function health(el) {
    var AND = /os=android/.test(location.search), NAME = AND ? "Health Connect" : "Apple Health";
    /* 8 PM to 8 AM is the axis: 10:50 PM is 23.6% in, 6:10 AM is 84.7% */
    el.innerHTML = '<div class="nk-scene nk-night" style="--sc:url(/v7/icons/mind/bg/night.webp?v=1)"><div class="nk-card">' +
      '<div class="nk-lbl">Last night</div>' +
      '<div class="nk-big"><b class="nk-h">0h 0m</b><span>of sleep</span></div>' +
      '<div class="nk-tm"><span>Slept <b>10:50 PM</b></span><span>Woke up <b>6:10 AM</b></span></div>' +
      '<div class="nk-bar"><i></i></div><div class="nk-ax"><span>8 PM</span><span>12 AM</span><span>4 AM</span><span>8 AM</span></div>' +
      '<div class="nk-src"><i class="hk' + (AND ? " hc" : "") + '"></i>From ' + NAME + "<em>Updated 7:22 AM</em></div></div></div>";
    var root = el.firstChild, h = root.querySelector(".nk-h"), bar = root.querySelector(".nk-bar i"), src = root.querySelector(".nk-src"), T = timers(), stop = null;
    function set(k) { var m = Math.round(440 * k); h.textContent = Math.floor(m / 60) + "h " + (m % 60) + "m"; bar.style.width = (61.1 * k) + "%"; }
    function reset() { T.clear(); if (stop) stop(); root.classList.remove("nk-on"); src.classList.remove("on"); set(0); }
    function still() { reset(); root.classList.add("nk-on"); src.classList.add("on"); set(1); }
    function play() {
      if (REDUCED) return still();
      reset(); void root.offsetWidth; root.classList.add("nk-on");
      T.add(function () { src.classList.add("on"); }, 700);
      T.add(function () { stop = count(set, 0, 1, 1400); }, 1100);
    }
    reset();
    return { play: play, still: still, reset: reset };
  }

  /* free: three of the seven, the front one with a halo that breathes in for 5 and out for 5, as Simple Breathing does */
  function breaths(el) {
    var tile = function (c, k, n, s) { return '<div class="nk-tile ' + c + '"><img src="' + THUMB(k) + '" alt=""><div>' + n + "<small>" + s + "</small></div></div>"; };
    el.innerHTML = '<div class="nk-br"><div class="nk-halo"></div>' +
      tile("l", "box", "Box Breathing", "In 4, hold 4, out 4") + tile("r", "sleep", "4-7-8 Breathing", "In 4, hold 7, out 8") +
      tile("c", "coherent", "Simple Breathing", "In 5, out 5") +
      '<div class="nk-pill"><b>7</b><span>exercises, 1 to 5 minutes each</span></div></div>';
    var root = el.firstChild, pill = root.querySelector(".nk-pill");
    function reset() { root.classList.remove("nk-on", "nk-still"); pill.classList.remove("on"); }
    function still() { reset(); root.classList.add("nk-on", "nk-still"); pill.classList.add("on"); }
    function play() { if (REDUCED) return still(); reset(); void root.offsetWidth; root.classList.add("nk-on"); pill.classList.add("on"); }
    reset();
    return { play: play, still: still, reset: reset };
  }

  /* Back sits beside the CTA as GoodFlip's secondary button with a left arrow, and folds away on step 1, as move-kit.js does */
  (function () {
    var back = document.getElementById("back"), cta = document.getElementById("cta");
    if (!back || !cta) return;
    var st = document.createElement("style");
    st.textContent =
      ".fk-row{display:flex;align-items:flex-start}.fk-row .ok{flex:1 1 auto;width:auto}" +
      ".fk-row .back{position:static;flex:none;width:48px;height:48px;margin:0 8px 7px 0;padding:0;display:grid;place-items:center;overflow:hidden;" +
        "border:1px solid var(--brand-600);border-radius:var(--r-sm);background:#fff;color:var(--brand-600);box-shadow:0 7px 0 var(--brand-200);cursor:pointer;" +
        "transition:width .35s var(--ease),margin .35s var(--ease),opacity .25s var(--ease),border-width .35s var(--ease)}" +
      ".fk-row .back:active{transform:translateY(3px);box-shadow:0 4px 0 var(--brand-200)}" +
      ".fk-row .back svg{width:22px;height:22px;flex:none}" +
      ".fk-row .back[aria-hidden=true]{width:0;margin-right:0;border-width:0;opacity:0;visibility:visible;pointer-events:none}";
    document.head.appendChild(st);
    back.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>';
    back.setAttribute("aria-label", "Back");
    var was = back.parentNode, row = document.createElement("div"); row.className = "fk-row";
    if (was.children.length === 1) was.style.display = "none";
    else was.insertBefore(document.createElement("span"), back);
    cta.parentNode.insertBefore(row, cta); row.appendChild(back); row.appendChild(cta);
  })();

  /* the Rhythm score: Cloud Drop reads its word and its gold from the page that holds it, exactly as mind/index.html sets them */
  window.HERO_WORD = "Rhythm";
  window.HERO_ORB = { colors: { "#246649": "#A68A2D", "#79CCA8": "#F9DD80", "#ABE6CC": "#FDE8A4", "#59B38C": "#E7C144",
    "0.160784 0 0 0 0 0.615686 0 0 0 0 0.419608": "0.906 0 0 0 0 0.757 0 0 0 0 0.267" }, shadow: [.3, .25, .1], introSky: ["gold", "mist"],
    gauge: [[.953, .82, .38], [.804, .663, .208]], tint: { grey: ".98" } };
  /* the Mind screen's hero waits for this handshake, as Eat's and Move's do */
  addEventListener("message", function (e) { if (e.data === "hero:ready" && e.source) e.source.postMessage("hero:mount", "*"); });

  window.MINDK = { day: function (el) { return card(el, {}); }, early: function (el) { return card(el, { locked: true }); },
    reward: reward, health: health, breaths: breaths,
    /* the score, live; lock: no plan yet, the padlock where the number goes (as the Mind screen shows it) */
    cloud: function (k, still, lock) { return "/v7/r3/heroes/cloud/index.html?build=34&embed=1&k=" + k + "&er=.102&ey=-.095&y=.03&v=Cloud%20Drop&intro=murmuration" + (lock ? "&lock=lit" : "&score=82") + (still ? "&still=1" : ""); } };
})();
