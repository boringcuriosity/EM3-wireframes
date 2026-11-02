/* Shared visuals for the Momentum first-look sheets (move-*.html), so every variant shows the same step 2 and step 3.
   The Move twin of kit.js.
   MOVEK.day(el)    step 2: the Morning scene from the Move cards (/v7/icons/move/bg/morning.webp) under a glass card.
                    The coach's workout is ticked, then a small move, then the steps count up and their ring fills.
   MOVEK.reward(el) step 3: slow sun rays behind Move's Sneaker medal on its ribbon, and 8 FlipCoins for the day's workout.
   Each returns { play(), still(), reset() }. Pass { compact: true } for small stages.
   Numbers are one sample morning, worked out as move/momentum.js does: the plan burns 118 kcal, the plank burns 25 (10 of 45);
   6,400 of 10,000 steps (16 of 25); 1 of 5 small moves (3 of 15); 1 of 4 parts of the day (4 of 15). */
(function () {
  var css = document.createElement("style");
  css.textContent =
    /* step 2 */
    ".mk-day{position:absolute;inset:0;overflow:hidden;background:url(/v7/icons/move/bg/morning.webp?v=16) right -60px top -70px/auto 330px no-repeat,#fff}" +
    ".mk-card{position:absolute;z-index:4;left:12px;width:256px;bottom:12px;padding:10px 12px 12px;border-radius:20px;background:rgb(255 255 255/.72);" +
      "-webkit-backdrop-filter:blur(16px) saturate(1.2);backdrop-filter:blur(16px) saturate(1.2);border:1px solid rgb(255 255 255/.85);" +
      "box-shadow:0 10px 28px rgb(52 64 84/.16),inset 0 1px 0 rgb(255 255 255/.9);opacity:0;transform:translateY(12px);transition:opacity .6s var(--ease),transform .6s var(--ease)}" +
    ".mk-on .mk-card{opacity:1;transform:none}" +
    ".mk-hd{display:flex;align-items:baseline;gap:8px;margin-bottom:4px}.mk-hd b{font:600 16px/22px Roboto,sans-serif;color:var(--g-900)}.mk-hd span{font:400 12px/18px Roboto,sans-serif;color:var(--g-500)}" +
    /* one row each: the state on the left (a tick, or a ring for steps), then the picture and the words */
    ".mk-row{display:flex;align-items:center;gap:12px;height:44px;font:500 14px/18px Roboto,sans-serif;color:var(--g-900)}" +
    ".mk-row>div{flex:1;min-width:0}.mk-row small{display:block;font:400 12px/16px Roboto,sans-serif;color:var(--g-500)}" +
    ".mk-row+.mk-row{border-top:1px solid rgb(152 162 179/.18)}" +
    ".mk-th,.mk-ic{flex:none;width:32px;height:32px;border-radius:10px}" +
    ".mk-th{object-fit:cover;object-position:33% 30%}" +
    ".mk-ic{display:grid;place-items:center;background:var(--in-50)}" +
    ".mk-ic i{width:18px;height:18px;background:var(--in-600);-webkit-mask:var(--src) center/contain no-repeat;mask:var(--src) center/contain no-repeat}" +
    ".mk-tk{flex:none;width:24px;height:24px;border-radius:9999px;border:1.5px solid var(--g-300);background:#fff;display:grid;place-items:center;transition:background-color .35s var(--ease),border-color .35s var(--ease)}" +
    ".mk-tk svg{width:12px;height:12px;opacity:0;transform:scale(.6);transition:opacity .3s var(--ease),transform .35s var(--ease)}" +
    ".mk-tk.on{background:var(--ok-600);border-color:var(--ok-600)}.mk-tk.on svg{opacity:1;transform:none}" +
    ".mk-rg{flex:none;width:24px;height:24px;transform:rotate(-90deg)}.mk-rg circle{fill:none;stroke-width:3}.mk-rg .b{stroke:var(--g-200)}.mk-rg .f{stroke:var(--in-600);stroke-linecap:round}" +
    ".mk-n{font-variant-numeric:tabular-nums}" +
    /* step 3 */
    ".mk-rw{position:absolute;inset:0;overflow:hidden;background:radial-gradient(120% 90% at 50% 46%,var(--gold-50) 0%,#fff 70%)}" +
    ".mk-rays{position:absolute;left:50%;top:46%;width:760px;height:760px;margin:-380px 0 0 -380px;opacity:0;transition:opacity 1.2s var(--ease);" +
      "background:repeating-conic-gradient(from 0deg,rgb(253 224 140/.38) 0deg 7deg,rgb(255 255 255/0) 7deg 20deg);" +
      "-webkit-mask:radial-gradient(closest-side,#000 18%,rgb(0 0 0/.5) 46%,transparent 72%);mask:radial-gradient(closest-side,#000 18%,rgb(0 0 0/.5) 46%,transparent 72%);animation:mkSpin 60s linear infinite}" +
    ".mk-on .mk-rays{opacity:1}@keyframes mkSpin{to{transform:rotate(360deg)}}" +
    /* Move's medal hangs from Eat's ribbon, as move/index.html does */
    ".mk-medal{position:absolute;left:50%;top:0;display:flex;flex-direction:column;align-items:center;transform-origin:50% 0;opacity:0;--w:96px;width:var(--w);margin-left:calc(var(--w)/-2)}" +
    ".mk-medal .rb{width:calc(var(--w)*.4);height:calc(var(--w)*.7);margin-bottom:calc(var(--w)*-.32);background:linear-gradient(90deg,#CDA935 0 33%,#299D6B 33% 67%,#CDA935 67%);box-shadow:inset 0 -12px 12px -8px rgb(0 0 0/.12)}" +
    ".mk-medal img{position:relative;width:var(--w);height:auto;filter:drop-shadow(0 10px 14px rgb(130 110 45/.3))}" +
    ".mk-still .mk-medal{opacity:1}.mk-still .mk-coin{transition:none}" +
    ".mk-on:not(.mk-still) .mk-medal{animation:mkSwing 1.6s cubic-bezier(.4,0,.2,1) .15s both}" +
    "@keyframes mkSwing{from{opacity:0;transform:translateY(-36px) rotate(7deg)}30%{opacity:1}to{opacity:1;transform:none}}" +
    ".mk-coin{position:absolute;left:50%;bottom:20px;transform:translate(-50%,10px);display:flex;align-items:center;gap:8px;height:40px;padding:0 16px 0 6px;border-radius:9999px;" +
      "background:rgb(255 255 255/.85);box-shadow:0 0 0 1px var(--gold-200),0 6px 16px rgb(130 110 45/.16);opacity:0;transition:opacity .5s var(--ease),transform .5s var(--ease);" +
      "font:600 15px/1 Roboto,sans-serif;color:var(--g-900);white-space:nowrap;font-variant-numeric:tabular-nums}" +
    ".mk-coin img{width:30px;height:30px}.mk-coin span{font-weight:400;color:var(--g-600)}" +
    ".mk-coin.on{opacity:1;transform:translate(-50%,0)}" +
    ".mk-coin.flip img{animation:mkFlip .6s cubic-bezier(.4,0,.2,1)}@keyframes mkFlip{from{transform:rotateY(0)}to{transform:rotateY(360deg)}}" +
    /* small stages */
    ".mk-c .mk-card{left:8px;width:224px;bottom:8px;padding:8px 10px 6px}.mk-c .mk-hd{margin-bottom:0}.mk-c .mk-row{height:36px}" +
    ".mk-c .mk-th,.mk-c .mk-ic{width:28px;height:28px}" +
    ".mk-c .mk-medal{--w:68px}.mk-c .mk-coin{bottom:10px;height:32px;font-size:13px}.mk-c .mk-coin img{width:24px;height:24px}" +
    "@media (prefers-reduced-motion:reduce){.mk-rays{animation:none}}";
  document.head.appendChild(css);

  var EASE = function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  var REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var CHECK = '<svg viewBox="0 0 16 16" fill="none"><path d="M3.5 8.5l3 3 6-7" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var STEPS = 6400, GOAL = 10000;
  function day(el, o) {
    o = o || {};
    var RC = 2 * Math.PI * 10;
    el.innerHTML = '<div class="mk-day' + (o.compact ? " mk-c" : "") + '"><div class="mk-card">' +
      '<div class="mk-hd"><b>Morning</b><span>6 AM to 12 PM</span></div>' +
      '<div class="mk-row"><span class="mk-tk" data-a>' + CHECK + '</span><img class="mk-th" src="/v7/img/move/plank.webp" alt=""><div>Plank to push up<small>Your coach&rsquo;s workout</small></div></div>' +
      '<div class="mk-row"><span class="mk-tk" data-b>' + CHECK + '</span><span class="mk-ic"><i style="--src:url(/v7/icons/move/sm/ds-exercise.svg)"></i></span><div>Take the stairs<small>Small move</small></div></div>' +
      '<div class="mk-row"><svg class="mk-rg" viewBox="0 0 24 24"><circle class="b" cx="12" cy="12" r="10"/><circle class="f" cx="12" cy="12" r="10" stroke-dasharray="0 ' + RC + '"/></svg>' +
        '<span class="mk-ic"><i style="--src:url(/v7/icons/move/steps-filled.svg)"></i></span><div><span class="mk-n">0</span> steps<small>of ' + GOAL.toLocaleString("en-IN") + ' today</small></div></div>' +
      '</div></div>';
    var root = el.firstChild, a = root.querySelector("[data-a]"), b = root.querySelector("[data-b]"), n = root.querySelector(".mk-n"),
      rg = root.querySelector(".mk-rg .f"), tms = [], raf;
    function steps(k) { n.textContent = Math.round(STEPS * k).toLocaleString("en-IN"); rg.setAttribute("stroke-dasharray", (RC * STEPS / GOAL * k) + " " + RC); }
    function reset() { tms.forEach(clearTimeout); tms = []; cancelAnimationFrame(raf); root.classList.remove("mk-on"); a.classList.remove("on"); b.classList.remove("on"); steps(0); }
    function still() { reset(); root.classList.add("mk-on"); a.classList.add("on"); b.classList.add("on"); steps(1); }
    function play() {
      if (REDUCED) return still();
      reset(); void root.offsetWidth; root.classList.add("mk-on");
      /* the workout is ticked, then the small move, then the steps count up */
      tms.push(setTimeout(function () { a.classList.add("on"); }, 750));
      tms.push(setTimeout(function () { b.classList.add("on"); }, 1350));
      tms.push(setTimeout(function () {
        var t0 = null;
        raf = requestAnimationFrame(function f(now) { if (t0 === null) t0 = now; var k = Math.min(1, (now - t0) / 1200); steps(EASE(k)); if (k < 1) raf = requestAnimationFrame(f); });
      }, 1950));
    }
    reset();
    return { play: play, still: still, reset: reset };
  }

  function reward(el, o) {
    o = o || {};
    el.innerHTML = '<div class="mk-rw' + (o.compact ? " mk-c" : "") + '"><div class="mk-rays"></div>' +
      '<div class="mk-medal"><span class="rb"></span><img src="/v7/icons/badge/move/sneaker.svg" alt=""></div>' +
      '<div class="mk-coin"><img src="/v7/icons/flipcoins/coin.webp" alt=""><b>+0</b><span>FlipCoins for today&rsquo;s workout</span></div></div>';
    var root = el.firstChild, coin = root.querySelector(".mk-coin"), n = coin.querySelector("b"), tms = [];
    function reset() { tms.forEach(clearTimeout); tms = []; root.classList.remove("mk-on", "mk-still"); coin.classList.remove("on", "flip"); n.textContent = "+0"; }
    function still() { reset(); root.classList.add("mk-on", "mk-still"); coin.classList.add("on"); n.textContent = "+8"; }
    function play() {
      if (REDUCED) return still();
      reset(); void root.offsetWidth; root.classList.add("mk-on");
      tms.push(setTimeout(function () { coin.classList.add("on"); }, 1200));
      /* the day's coins: they land, turn once, and the count reads +8 */
      tms.push(setTimeout(function () { n.textContent = "+8"; coin.classList.add("flip"); }, 1700));
    }
    reset();
    return { play: play, still: still, reset: reset };
  }

  /* Back sits beside the CTA as GoodFlip's secondary button with a left arrow, and folds away on step 1, as kit.js does */
  (function () {
    var back = document.getElementById("back"), cta = document.getElementById("cta");
    if (!back || !cta || back.hasAttribute("data-keep")) return;
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

  /* the Move score: Cloud Drop reads its word and its indigo orbs from the page that holds it, as move/index.html sets them */
  window.HERO_WORD = "Momentum";
  window.HERO_ORB = { colors: { "#246649": "#444CE7", "#79CCA8": "#8098F9", "#ABE6CC": "#A4BCFD", "#59B38C": "#6172F3",
    "0.160784 0 0 0 0 0.615686 0 0 0 0 0.419608": "0.502 0 0 0 0 0.596 0 0 0 0 0.976" }, shadow: [.176, .196, .51], introSky: ["indigo", "indigosoft"] };
  /* the Move screen's hero waits for this handshake, as Eat's does */
  addEventListener("message", function (e) { if (e.data === "hero:ready" && e.source) e.source.postMessage("hero:mount", "*"); });

  window.MOVEK = { day: day, reward: reward,
    /* the Move screen behind the sheet: a fresh day for new users, the live day for current users */
    behind: function () { return "/move/index.html" + (/who=current/.test(location.search) ? "" : "?day=start"); },
    cloud: function (k, still) { return "/v7/r3/heroes/cloud/index.html?build=34&embed=1&k=" + k + "&er=.102&ey=-.095&y=.03&v=Cloud%20Drop&intro=murmuration&score=85" + (still ? "&still=1" : ""); } };
})();
