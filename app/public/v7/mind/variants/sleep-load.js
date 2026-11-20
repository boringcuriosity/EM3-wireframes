/* sleep-load.js (?sx=1): the Last night card while we fetch the night (SVX.load) and when nothing came (SVX.nf), drawn in
   the family frame from sleep-card.js so the picture, header and strip stay put. ?sload=bar (default) | shim picks the loader body.
   The card is redrawn often, so every timed step reads its clock from --t (time since this loader first showed), never from element identity. */
(function () {
  window.SVX = window.SVX || {};
  var Q = new URLSearchParams(location.search), LV = Q.get("sload") === "shim" ? "shim" : "bar";
  var STEP = 1400;   /* each message stays 1.4 s; the last one stays until the night lands */

  /* the loader's clock: starts when a loader first shows, clears once no loader is on the page */
  var T0 = null;
  function t() {
    if (!T0) { T0 = Date.now(); var w = setInterval(function () { var e = document.getElementById("svlOn"); if (!e) { T0 = null; clearInterval(w); return; } kStep(e); }, 200); }
    return Date.now() - T0;
  }
  /* reduced motion: the page stops every animation, so the step shows as data-k, moved on by the same clock */
  function k() { return T0 ? Math.min(2, Math.floor((Date.now() - T0) / STEP)) : 0; }
  function kStep(e) { if (e && e.dataset.k != k()) e.dataset.k = k(); }
  function words(c) {
    return c.RING ? { title: "Syncing your Arc ring", say: ["Connecting to your Arc ring", "Reading last night’s sleep", "Calculating your hours"] }
      : { title: "Checking Apple Health", say: ["Searching Apple Health", "Fetching last night’s sleep", "Calculating your hours"] };
  }
  var b = function (w, h, x) { return '<i class="svl-b" style="--x:' + x + 'px;width:' + w + ';height:' + h + 'px"></i>'; };

  SVX.load = function (c) {
    var w = words(c), T = t(), clock = ' style="--t:-' + T + 'ms" data-k="' + k() + '"';
    var times = '<div class="svl-r" aria-hidden="true">' + b("124px", 20, 0) + b("128px", 20, 144) + '</div>';
    /* bar: the card's own empty bar, a soft light gliding along it. shim: the bar drawn in shimmer too */
    var body = LV === "shim" && !SVX.famBar ? times + '<div class="svl-bar" aria-hidden="true">' + b("100%", 28, 0) + '<div class="svl-ax">' + b("34px", 12, 0) + b("34px", 12, 80) + b("34px", 12, 170) + b("34px", 12, 260) + '</div></div>'
      : times + '<div class="svl-trk">' + c.bar(null, {}) + '</div>';
    return SVX.frame(c, {
      st: "load", attrs: ' id="svlOn"' + clock,
      title: '<span class="svl-vh" role="status" aria-live="polite">' + w.title + '. This takes a few seconds.</span><div class="svf-h" aria-hidden="true">' + w.title + '</div>',
      sub: '<span class="svl-ms" aria-hidden="true">' + w.say.map(function (s, i) { return '<span class="m' + i + '">' + s + '</span>'; }).join("") + '</span>',
      body: body,
      tail: (SVX.strip ? SVX.strip(c, "sync").replace('class="mv-sync', clock + ' class="mv-sync') : SVX.tail(c, '<span class="sv-syn"><i class="svl-spin" aria-hidden="true"></i>Syncing</span>', clock))
    });
  };

  /* ---------- not found ---------- */
  var ICN = {
    range: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m7 7 10 10-5 5V2l5 5L7 17"/></svg>',
    battery: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="7" width="17" height="10" rx="2.5"/><path d="M22 11v2M6 10.5v3"/></svg>',
    worn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12.3 3A7 7 0 0 0 21 11.7 9 9 0 1 1 12.3 3Z"/></svg>',
    "": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-2.6-6.4M21 4v5h-5"/></svg>'
  };
  var INFO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>';
  /* what the card says. Apple never tells us if reading sleep was refused, so its words fit both "nothing yet" and "said no" */
  var RW = {
    range: ["Your ring isn’t nearby", "Bring your Arc ring close to your phone with Bluetooth on, then sync again."],
    battery: ["Your ring’s battery is low", "Charge your Arc ring for a few minutes, then sync again. Or log last night yourself."],
    worn: ["No sleep on your ring for last night", "Your ring tracks sleep when you wear it to bed. Log last night yourself for now."],
    "": ["We couldn’t sync your ring", "Keep your Arc ring close to your phone and sync again. Or log last night yourself."]
  };
  var tip = function (ic, s) { return '<div class="svl-tip">' + ic + '<span>' + s + '</span></div>'; };

  /* nothing came (Shaheer, 20 Nov 2026): the card goes back to How did you sleep? with Log Last Night's Sleep, and only the
     strip says what happened. ?snf=card the earlier not-found card with its gold hint */
  SVX.nf = function (c) {
    if (Q.get("snf") !== "card") return SVX.card(c, SVX.strip(c, "nf"));
    var f = RW[c.ringFail] ? c.ringFail : "", R = RW[f], dev = c.RING ? "ring" : "ah";
    return SVX.frame(c, {
      st: "nf",
      title: '<div class="svf-h">' + (c.RING ? R[0] : "Nothing from Apple Health yet") + '</div>',
      sub: c.RING ? "" : "It can take a while to come in. Or log it yourself.",
      body: (SVX.famBar ? c.bar(null, {}) : "") +
        (c.RING ? tip(ICN[f], R[1]) : tip(INFO, "Still nothing? In the Health app, check that GoodFlip can read your Sleep.")) +
        '<div class="svl-acts"><button class="svl-btn" data-sv="edit">' + c.PLUSQ + 'Log Sleep</button><button class="svl-btn sec" data-sv="sync" data-dev="' + dev + '">' + (c.RING ? "Sync Now" : "Try Again") + '</button></div>',
      tail: SVX.strip ? SVX.strip(c, "ok") : SVX.tail(c, "Updated 7:22 AM")
    });
  };

  if (document.getElementById("svLoadCss")) return;
  var E = "cubic-bezier(.4,0,.2,1)";
  var st = document.createElement("style"); st.id = "svLoadCss";
  st.textContent = [
    ".svl-vh{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}",
    /* the changing words under the title: stacked in one cell, each fades up in turn on the shared clock */
    ".svl-ms{display:grid;grid-template-columns:minmax(0,1fr)}.svl-ms>span{grid-area:1/1;opacity:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
    ".svl-ms .m0{animation:svlIn .45s " + E + " calc(var(--t) + 0s) both,svlOut .45s " + E + " calc(var(--t) + " + STEP + "ms) forwards}",
    ".svl-ms .m1{animation:svlIn .45s " + E + " calc(var(--t) + " + STEP + "ms) both,svlOut .45s " + E + " calc(var(--t) + " + 2 * STEP + "ms) forwards}",
    ".svl-ms .m2{animation:svlIn .45s " + E + " calc(var(--t) + " + 2 * STEP + "ms) both}",
    "@keyframes svlIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}",
    "@keyframes svlOut{from{opacity:1;transform:none}to{opacity:0;transform:translateY(-6px)}}",
    /* the picture rests a little dimmer while we wait, breathing slowly (4 s) */
    ".svf-load .svf-pic{animation:svlBr 4s ease-in-out var(--t) infinite}@keyframes svlBr{0%,100%{opacity:1}50%{opacity:.55}}",
    /* the spinner in the strip, 1.5 s a turn */
    ".svl-spin{display:inline-block;width:14px;height:14px;margin-right:6px;vertical-align:-2px;border-radius:50%;border:2px solid #E4E7EC;border-top-color:#299D6B;box-sizing:border-box;animation:svlRot 1.5s linear var(--t) infinite}",
    "@keyframes svlRot{to{transform:rotate(360deg)}}",
    /* shimmer: Eat's colours (g-100 to g-200, 1.5 s), one band across the card: each block offsets the band by its own x */
    ".svl-b{display:block;flex:none;border-radius:6px;background:linear-gradient(90deg,#F2F4F7 0,#F2F4F7 40%,#E4E7EC 50%,#F2F4F7 60%,#F2F4F7 100%) 0 0/900px 100% no-repeat #F2F4F7;animation:svlSw 1.5s linear var(--t) infinite}",
    "@keyframes svlSw{from{background-position-x:calc(-700px - var(--x))}to{background-position-x:calc(76px - var(--x))}}",
    ".svl-r{display:flex;gap:20px;margin-top:-4px}.svl-bar{display:flex;flex-direction:column;gap:6px;padding-top:4px}.svl-ax{position:relative;height:12px}.svl-ax .svl-b{position:absolute;top:0}",
    ".svl-ax .svl-b:nth-child(2){left:28%}.svl-ax .svl-b:nth-child(3){left:56%}.svl-ax .svl-b:nth-child(4){right:0}",
    /* the real bar: a soft indigo light glides along the track */
    ".svf-load .sv-tl .tr::after,.svl-trk .sv-tl .tr::after{content:'';position:absolute;inset:0;border-radius:inherit;background:linear-gradient(90deg,rgba(97,114,243,0),rgba(97,114,243,.28),rgba(97,114,243,0)) 0 0/30% 100% no-repeat;animation:svlGl 1.8s " + E + " var(--t) infinite}",
    "@keyframes svlGl{from{background-position-x:-43%}to{background-position-x:143%}}",
    /* not found */
    ".svl-acts{display:flex;gap:12px}.svl-acts .svl-btn{flex:1}",
    ".svl-btn{position:relative;isolation:isolate;display:inline-flex;align-items:center;justify-content:center;gap:8px;height:44px;margin-bottom:7px;padding:0 16px;border:0;border-radius:8px;background:#299D6B;color:#fff;font:700 15px/1 Roboto,sans-serif;letter-spacing:.25px;box-shadow:0 7px 0 #2A805A;cursor:pointer;transition:transform .2s ease-out,box-shadow .2s ease-out}",
    ".svl-btn svg{width:18px;height:18px}.svl-btn:active{transform:translateY(7px);box-shadow:0 0 0 #2A805A}.svl-btn:focus-visible{outline:2px solid var(--in-500);outline-offset:2px}",
    ".svl-btn.sec{background:none;color:#299D6B;box-shadow:none}.svl-btn.sec::before{content:'';position:absolute;inset:0;z-index:-1;border:1px solid #299D6B;border-radius:inherit;background:#fff}",
    ".svl-btn.sec::after{content:'';position:absolute;inset:7px 0 -7px;z-index:-2;border:1px solid #299D6B;border-radius:inherit;background:#CBF0E0;transition:inset .2s ease-out}.svl-btn.sec:active::after{inset:0}",
    ".svl-tip{display:flex;gap:8px;align-items:flex-start;padding:10px 12px;border-radius:12px;border:1px solid #FEF1C7;background:repeating-linear-gradient(-45deg,#FFF8E0 0 10px,#FFFBEE 10px 20px);color:#826E2D;font:500 14px/20px Roboto,sans-serif}",
    ".svl-tip svg{width:16px;height:16px;flex:none;margin-top:2px;color:#A68A2D}",
    /* reduced motion (the page sets animation:none on everything): a still skeleton, the words switch on data-k with no movement */
    "@media (prefers-reduced-motion:reduce){[data-k='0'] .svl-ms .m0,[data-k='1'] .svl-ms .m1,[data-k='2'] .svl-ms .m2{opacity:1}.svl-spin{border-right-color:#299D6B}.sv-tl .tr::after{display:none}}"
  ].join("\n");
  document.head.appendChild(st);
})();
