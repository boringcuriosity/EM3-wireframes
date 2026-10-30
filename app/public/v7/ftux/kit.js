/* Shared visuals for the three-step explainer (x-*.html), so every variant shows the same step 2 and step 3.
   FTUX.meal(el)   step 2: one meal scene with a glass card; protein, carbs and fat as Eat's Nutrition breakdown bars
                   (indigo fill, glass handles on the ideal range's edges, the amount riding the bar), then "Full points".
   FTUX.reward(el) step 3: slow sun rays behind the medal on its ribbon, one FlipCoin counting up to "+8 FlipCoins today".
   Each returns { play(), still(), reset() }. Pass { compact: true } for small stages. */
(function () {
  var css = document.createElement("style");
  css.textContent =
    /* step 2 */
    ".fk-meal{position:absolute;inset:0;overflow:hidden;background:url(/v7/icons/meals/bg/lunch.webp) 70% 28%/cover no-repeat,#fff}" +
    ".fk-card{position:absolute;z-index:4;left:16px;right:16px;bottom:12px;padding:12px 14px 8px;border-radius:20px;background:rgb(255 255 255/.7);" +
      "-webkit-backdrop-filter:blur(16px) saturate(1.2);backdrop-filter:blur(16px) saturate(1.2);border:1px solid rgb(255 255 255/.85);" +
      "box-shadow:0 10px 28px rgb(52 64 84/.16),inset 0 1px 0 rgb(255 255 255/.9);opacity:0;transform:translateY(12px);transition:opacity .6s var(--ease),transform .6s var(--ease)}" +
    ".fk-on .fk-card{opacity:1;transform:none}" +
    ".fk-hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:2px}" +
    ".fk-hd b{font:600 16px/22px Roboto,sans-serif;color:var(--g-900)}" +
    ".fk-pill{display:none;align-items:center;gap:4px;height:24px;padding:0 10px 0 6px;border-radius:9999px;background:var(--brand-600);color:#fff;font:600 12px/1 Roboto,sans-serif;" +
      "opacity:0;transform:scale(.96);transition:opacity .45s var(--ease),transform .45s var(--ease)}" +
    ".fk-pill svg{width:14px;height:14px}.fk-pill.on{opacity:1;transform:none}" +
    ".fk-sub{font:400 12px/18px Roboto,sans-serif;color:var(--g-500)}" +
    ".fk-ir{padding:7px 0 5px}" +
    ".fk-top{display:flex;align-items:center;gap:6px;font:400 13px/18px Roboto,sans-serif;color:var(--g-600);font-variant-numeric:tabular-nums}" +
    ".fk-top i{width:16px;height:16px;flex:none;background:var(--g-500);-webkit-mask-size:contain;mask-size:contain;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;-webkit-mask-position:center;mask-position:center}" +
    ".fk-top b{font-weight:400;color:var(--g-700)}.fk-top .ideal{margin-left:auto;color:var(--g-500)}" +
    ".fk-trk{position:relative;height:12px;margin-top:6px;border-radius:5px;background:var(--in-50)}" +
    ".fk-fill{position:absolute;left:0;top:0;bottom:0;border-radius:5px;background:var(--in-600)}" +
    ".fk-val{position:absolute;top:0;bottom:0;display:flex;align-items:center;padding-left:8px;font:500 11px/1 Roboto,sans-serif;color:var(--g-800);white-space:nowrap;font-variant-numeric:tabular-nums}" +
    ".fk-hd2{position:absolute;top:-4px;bottom:-4px;width:10px;border-radius:3px;background:linear-gradient(180deg,rgb(52 64 84/.22),rgb(255 255 255/.55) 22%,rgb(255 255 255/.55) 82%,rgb(52 64 84/.22))}" +
    ".fk-hd2.lo{margin-left:-1px}.fk-hd2.hi{margin-left:-9px}" +
    ".fk-hd2::after{content:'';position:absolute;top:0;bottom:0;width:2px;border-radius:1px;background:linear-gradient(180deg,#98A2B3,#667085 20%,#667085 85%,#98A2B3)}" +
    ".fk-hd2.lo::after{left:0}.fk-hd2.hi::after{right:0}" +
    /* step 3 */
    ".fk-rw{position:absolute;inset:0;overflow:hidden;background:radial-gradient(120% 90% at 50% 46%,var(--gold-50) 0%,#fff 70%)}" +
    ".fk-rays{position:absolute;left:50%;top:46%;width:760px;height:760px;margin:-380px 0 0 -380px;opacity:0;transition:opacity 1.2s var(--ease);" +
      "background:repeating-conic-gradient(from 0deg,rgb(253 224 140/.38) 0deg 7deg,rgb(255 255 255/0) 7deg 20deg);" +
      "-webkit-mask:radial-gradient(closest-side,#000 18%,rgb(0 0 0/.5) 46%,transparent 72%);mask:radial-gradient(closest-side,#000 18%,rgb(0 0 0/.5) 46%,transparent 72%);animation:fkSpin 60s linear infinite}" +
    ".fk-on .fk-rays{opacity:1}" +
    "@keyframes fkSpin{to{transform:rotate(360deg)}}" +
    ".fk-medal{position:absolute;left:50%;top:0;display:flex;flex-direction:column;align-items:center;transform-origin:50% 0;opacity:0;--w:104px;width:var(--w);margin-left:calc(var(--w)/-2)}" +
    ".fk-medal .rb{width:calc(var(--w)*.38);height:calc(var(--w)*.72);margin-bottom:calc(var(--w)*-.36);background:linear-gradient(90deg,#CDA935 0 33%,#299D6B 33% 67%,#CDA935 67%);box-shadow:inset 0 -12px 12px -8px rgb(0 0 0/.12)}" +
    ".fk-medal img{position:relative;width:var(--w);height:auto;filter:drop-shadow(0 10px 14px rgb(130 110 45/.3))}" +
    ".fk-still .fk-medal{opacity:1}.fk-still .fk-coin{transition:none}" +
    ".fk-on:not(.fk-still) .fk-medal{animation:fkSwing 1.6s cubic-bezier(.4,0,.2,1) .15s both}" +
    "@keyframes fkSwing{from{opacity:0;transform:translateY(-36px) rotate(7deg)}30%{opacity:1}to{opacity:1;transform:none}}" +
    ".fk-coin{position:absolute;left:50%;bottom:22px;transform:translate(-50%,10px);display:flex;align-items:center;gap:8px;height:40px;padding:0 16px 0 6px;border-radius:9999px;" +
      "background:rgb(255 255 255/.85);box-shadow:0 0 0 1px var(--gold-200),0 6px 16px rgb(130 110 45/.16);opacity:0;transition:opacity .5s var(--ease),transform .5s var(--ease);" +
      "font:600 15px/1 Roboto,sans-serif;color:var(--g-900);white-space:nowrap;font-variant-numeric:tabular-nums}" +
    ".fk-coin img{width:30px;height:30px}.fk-coin span{font-weight:400;color:var(--g-600)}" +
    ".fk-coin.on{opacity:1;transform:translate(-50%,0)}" +
    ".fk-coin.flip img{animation:fkFlip .5s cubic-bezier(.4,0,.2,1)}" +
    "@keyframes fkFlip{from{transform:rotateY(0)}to{transform:rotateY(360deg)}}" +
    /* small stages */
    ".fk-c .fk-card{left:10px;right:10px;bottom:10px;padding:10px 12px 8px}.fk-c .fk-ir{padding:6px 0 4px}.fk-c .fk-trk{height:10px;margin-top:6px}" +
    ".fk-c .fk-medal{--w:72px}.fk-c .fk-coin{bottom:10px;height:32px;font-size:13px}.fk-c .fk-coin img{width:24px;height:24px}" +
    "@media (prefers-reduced-motion:reduce){.fk-rays{animation:none}}";
  document.head.appendChild(css);

  var EASE = function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  var REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var TICK = '<svg viewBox="0 0 16 16" fill="none"><path d="M3.5 8.5l3 3 6-7" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  /* lunch: target and eaten, in grams; the ideal range is the target give or take 20%, or 3 g, whichever is more (score-logic.md) */
  var MAC = [["Protein", "glyph-protein", 26, 24], ["Carbs", "glyph-carbs", 70, 66], ["Fats", "glyph-fats", 16, 15]];

  function meal(el, o) {
    o = o || {};
    el.innerHTML = '<div class="fk-meal' + (o.compact ? " fk-c" : "") + '"><div class="fk-card"><div class="fk-hd"><b>Lunch</b><span class="fk-pill">' + TICK + 'Full share</span></div>' +
      '' +
      MAC.map(function (m) {
        var b = Math.max(m[2] * .2, 3), lo = m[2] - b, hi = m[2] + b, mx = hi * 1.25, pc = function (x) { return (x / mx * 100).toFixed(1) + "%"; };
        return '<div class="fk-ir"><div class="fk-top"><i class="' + m[1] + '"></i>' + m[0] + ' : <b data-v="' + m[3] + '">0 g</b><span class="ideal">Ideal: ' + Math.round(lo) + '–' + Math.round(hi) + ' g</span></div>' +
          '<div class="fk-trk"><span class="fk-fill" data-to="' + pc(m[3]) + '" style="width:0"></span><span class="fk-hd2 lo" style="left:' + pc(lo) + '"></span><span class="fk-hd2 hi" style="left:' + pc(hi) + '"></span>' +
          '<span class="fk-val" style="left:0"></span></div></div>';
      }).join("") + '</div></div>';
    var root = el.firstChild, fills = root.querySelectorAll(".fk-fill"), vals = root.querySelectorAll(".fk-val"), nums = root.querySelectorAll(".fk-top b"), pill = root.querySelector(".fk-pill"), raf, tm;
    function set(k) {   /* k: 0..1 per row, staggered */
      for (var i = 0; i < 3; i++) {
        var t = Math.max(0, Math.min(1, k * 1.6 - i * .3)), e = EASE(t), to = parseFloat(fills[i].dataset.to), v = Math.round(+nums[i].dataset.v * e);
        fills[i].style.width = (to * e) + "%"; vals[i].style.left = (to * e) + "%"; vals[i].textContent = e > .25 ? v + " g" : ""; nums[i].textContent = v + " g";
      }
    }
    function reset() { cancelAnimationFrame(raf); clearTimeout(tm); root.classList.remove("fk-on"); pill.classList.remove("on"); set(0); }
    function still() { reset(); root.classList.add("fk-on"); set(1); pill.classList.add("on"); }
    function play() {
      if (REDUCED) return still();
      reset(); void root.offsetWidth; root.classList.add("fk-on");
      var t0 = null;
      tm = setTimeout(function () {
        raf = requestAnimationFrame(function f(now) {
          if (t0 === null) t0 = now;
          var k = Math.min(1, (now - t0) / 1800); set(k);
          if (k < 1) raf = requestAnimationFrame(f); else tm = setTimeout(function () { pill.classList.add("on"); }, 150);
        });
      }, 450);
    }
    reset();
    return { play: play, still: still, reset: reset };
  }

  var COINS = 8;
  function reward(el, o) {
    o = o || {};
    el.innerHTML = '<div class="fk-rw' + (o.compact ? " fk-c" : "") + '"><div class="fk-rays"></div>' +
      '<div class="fk-medal"><span class="rb"></span><img src="/v7/icons/badge/simple/heart-apple.svg" alt=""></div>' +
      '<div class="fk-coin"><img src="/v7/icons/flipcoins/coin.webp" alt=""><b>+0</b><span>FlipCoins today</span></div></div>';
    var root = el.firstChild, coin = root.querySelector(".fk-coin"), n = coin.querySelector("b"), tms = [];
    function show(k) { n.textContent = "+" + k; }
    function reset() { tms.forEach(clearTimeout); tms = []; root.classList.remove("fk-on", "fk-still"); coin.classList.remove("on", "flip"); show(0); }
    function still() { reset(); root.classList.add("fk-on", "fk-still"); coin.classList.add("on"); show(COINS); }
    function play() {
      if (REDUCED) return still();
      reset(); void root.offsetWidth; root.classList.add("fk-on");
      tms.push(setTimeout(function () { coin.classList.add("on"); }, 1200));
      /* the count climbs one coin at a time, quick then slowing, the coin turning once on the last */
      for (var i = 1; i <= COINS; i++) (function (i) {
        tms.push(setTimeout(function () { show(i); if (i === COINS) { coin.classList.remove("flip"); void coin.offsetWidth; coin.classList.add("flip"); } }, 1500 + 900 * EASE(i / COINS)));
      })(i);
    }
    reset();
    return { play: play, still: still, reset: reset };
  }

  /* Back sits beside the CTA as GoodFlip's secondary button with a left arrow, and folds away on step 1
     so Next takes the full width. Each page keeps toggling #back's aria-hidden as before. */
  (function () {
    var back = document.getElementById("back"), cta = document.getElementById("cta");
    if (!back || !cta) return;
    var st = document.createElement("style");
    st.textContent =
      ".fk-row{display:flex;align-items:flex-start}.fk-row .ok{flex:1 1 auto;width:auto}" +
      ".fk-row .back{position:static;flex:none;width:48px;height:48px;margin:0 8px 7px 0;padding:0;display:grid;place-items:center;overflow:hidden;" +
        "border:1px solid var(--brand-600);border-radius:var(--r-sm);background:#fff;color:var(--brand-600);box-shadow:0 7px 0 var(--brand-200);cursor:pointer;" +
      ".fk-row .back:active{transform:translateY(3px);box-shadow:0 4px 0 var(--brand-200)}" +
        "transition:width .35s var(--ease),margin .35s var(--ease),opacity .25s var(--ease),border-width .35s var(--ease)}" +
      ".fk-row .back svg{width:22px;height:22px;flex:none}" +
      ".fk-row .back[aria-hidden=true]{width:0;margin-right:0;border-width:0;opacity:0;visibility:visible;pointer-events:none}";
    document.head.appendChild(st);
    back.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>';
    back.setAttribute("aria-label", "Back");
    var was = back.parentNode, row = document.createElement("div"); row.className = "fk-row";
    if (was.children.length === 1) was.style.display = "none";   /* a row that only held Back */
    else was.insertBefore(document.createElement("span"), back);   /* keeps the dots' grid column */
    cta.parentNode.insertBefore(row, cta); row.appendChild(back); row.appendChild(cta);
  })();

  window.FTUX = { meal: meal, reward: reward };
})();
