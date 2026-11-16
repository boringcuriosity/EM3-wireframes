/* "All breathing exercises": a library of the final seven at the end of the Mind screen, open to everyone
   (free users, people with no Mind plan yet, and plan users, whether or not an exercise is in their plan).
   ?vlib=<id> draws one variant (variants/lib-<id>.js registers it with BLIB.add); ?state=free|noplan as on the rest of the screen;
   ?lsheet=<key> opens that exercise's info sheet; ?lplay=<key> opens the player; ?lfocus=1 scrolls to the section.
   This file is the shared core: the data, a live mini preview of each exercise, the info sheet and the player. */
(function () {
  "use strict";
  var MD = window.MDPLAN, Q = MD ? MD.Q : new URLSearchParams(location.search), V = (Q.get("vlib") || "").toLowerCase();
  if (!V || !window.LAB || !LAB.FINAL) return;
  var ST = Q.get("state") || "", FREE = /^free/.test(ST), NOPLAN = FREE || /^noplan/.test(ST);

  /* what each one is good for (the info sheet and filters), and a sensible first session length */
  var GOOD = { coherent: ["Calm", "Focus"], sleep: ["Sleep"], box: ["Focus", "Stress"], exhale: ["Calm", "Stress"], belly: ["Calm", "Digestion"], hum: ["Sleep", "Busy mind"], pursed: ["Breathless"] };
  var MIN = { coherent: 5, sleep: 2, box: 4, exhale: 3, belly: 5, hum: 5, pursed: 3 };
  var SHORT = { coherent: "Simple", sleep: "4-7-8", box: "Box", exhale: "Extended Exhale", belly: "Belly", hum: "Bhramari", pursed: "Pursed Lip" };
  var planNames = NOPLAN || !MD ? [] : (MD.P.br || []).map(function (b) { return (b.n || "").toLowerCase(); });
  function inPlan(k) { var n = LAB.FINAL[k].name.toLowerCase(); return planNames.some(function (p) { return p === n || (k === "coherent" && /coherent/.test(p)); }); }

  var BLIB = window.BLIB = {
    state: FREE ? "free" : NOPLAN ? "noplan" : "plan",
    list: LAB.FINAL_ORDER.map(function (k) {
      var F = LAB.FINAL[k], seq = LAB.PAT[k].seq;
      return { key: k, name: F.name, short: SHORT[k], pat: F.pat, how: F.how, steps: F.steps, line: F.line, good: GOOD[k], min: MIN[k],
        seq: seq.map(function (x) { return { k: x[0], s: x[1], word: x[2] }; }), cycle: seq.reduce(function (a, x) { return a + x[1]; }, 0), inPlan: inPlan(k) };
    }),
    V: {}, add: function (id, v) { this.V[id] = v; }
  };
  /* the line under the section title: options for the designer to pick (?lsub=1..5), the same for every user */
  BLIB.SUBS = [
    "Do these any time you need a calm moment.",
    "Breathe along whenever you feel like it.",
    "Use any of these when you feel stressed, tired or can't sleep.",
    "Free to use, any time of the day.",
    "A few minutes of slow breathing, whenever you need it."
  ];
  BLIB.sub = BLIB.SUBS[(+Q.get("lsub") || 1) - 1] || BLIB.SUBS[0];
  BLIB.get = function (k) { return BLIB.list.filter(function (x) { return x.key === k; })[0]; };

  var css = document.createElement("style");
  css.textContent =
    "#blib{margin-top:32px}" +
    /* the mini preview: the exercise's own final visual, scaled down, running at its real pace */
    ".bl-mini.sm .bf-svg path{stroke-width:calc(2.2px / var(--z))}.bl-mini.sm .bf-svg path[stroke-dasharray]{stroke-width:calc(2.6px / var(--z))}" +
    ".bl-mini{position:relative;overflow:hidden;flex:none;border-radius:50%;background:#fff}.bl-mini>.bl-st{position:absolute;left:0;top:0;width:320px;height:360px;transform-origin:0 0}" +
    /* the info sheet */
    ".bl-sh .hero{display:flex;gap:16px;align-items:center;margin:0 0 16px}.bl-sh .pat{font:600 20px/26px Roboto;color:#A68A2D}.bl-sh .sub{font:400 14px/20px Roboto;color:#475467;margin-top:4px}" +
    ".bl-sh .wkey{font:400 12px/16px Roboto;color:#667085;margin:4px 0 16px}" +
    ".bl-sh .durs{display:flex;gap:8px;flex-wrap:nowrap;overflow-x:auto;margin:4px -16px 16px;padding:12px 16px 4px;scrollbar-width:none;scroll-padding:0 16px}.bl-sh .durs::-webkit-scrollbar{display:none}.bl-sh .dur{flex:none}.bl-sh .dur{position:relative;min-height:40px;padding:0 14px;border-radius:999px;border:1px solid #D0D5DD;background:#fff;color:#344054;font:500 14px/20px Roboto;cursor:pointer}" +
    ".bl-sh .dur.on{border-color:#299D6B;background:#F3FCF8;color:#2A805A}.bl-sh .dur i{position:absolute;left:50%;top:-8px;transform:translateX(-50%);font:600 10px/14px Roboto;font-style:normal;color:#2A805A;background:#fff;padding:0 4px;white-space:nowrap}" +
    ".bl-sh .chips{display:flex;gap:8px;flex-wrap:wrap;margin:0 0 16px}.bl-sh .chip{font:500 12px/16px Roboto;color:#5C4E1F;background:#FFF8E0;border-radius:999px;padding:4px 10px}" +
    ".bl-sh .steps{border:1px solid #EAECF0;border-radius:12px;margin:0 0 16px}.bl-sh .st{display:flex;gap:12px;padding:12px 16px;font:400 14px/20px Roboto;color:#344054}.bl-sh .st+.st{border-top:1px dashed #EAECF0}" +
    ".bl-sh .st b{min-width:32px;font-weight:600;color:#A68A2D;font-variant-numeric:tabular-nums}.bl-sh h5{font:600 14px/20px Roboto;margin:0 0 4px;color:#101828}.bl-sh p{font:400 14px/20px Roboto;color:#475467;margin:0 0 16px}" +
    ".bl-sh .foot{position:sticky;bottom:0;margin:0 -16px;padding:12px 16px 8px;background:#fff;box-shadow:0 -8px 16px -12px rgba(16,24,40,.18)}" +
    ".bl-sh .go{width:100%;height:48px;border:0;border-radius:8px;background:#299D6B;color:#fff;font:600 15px Roboto;cursor:pointer}.bl-sh .note{font:400 12px/16px Roboto;color:#667085;text-align:center;margin:8px 0 0}" +
    /* the player, full screen over the Mind screen */
    ".bl-pl{position:fixed;inset:0;z-index:300;background:#fff;display:grid;place-items:start center;overflow:hidden}" +
    ".bl-pl .lp{position:relative;width:320px;height:640px;overflow:hidden;background:linear-gradient(180deg,#FFFDF5 0%,#FFF 46%);display:flex;flex-direction:column;align-items:center;color:#5C4E1F;transform-origin:50% 0}" +
    ".bl-pl .lp-top{width:100%;display:flex;align-items:center;justify-content:space-between;padding:44px 16px 0;font:500 13px Roboto}.bl-pl .lp-x{width:40px;height:40px;border-radius:50%;display:grid;place-items:center;cursor:pointer}.bl-pl .lp-x svg{width:20px;height:20px}" +
    ".bl-pl .lp-n{flex:1;text-align:center;padding:0 8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.bl-pl .lp-tm{min-width:40px;text-align:right;font-variant-numeric:tabular-nums;font-weight:600}" +
    ".bl-pl .lp-stage{position:relative;width:320px;height:360px;margin-top:8px;overflow:hidden}.bl-pl .lp-w{font:300 32px/38px Roboto;margin-top:4px}" +
    ".bl-pl .lp-c{font:500 15px/20px Roboto;color:#A68A2D;font-variant-numeric:tabular-nums;margin-top:6px;min-height:20px}.bl-pl .lp-s{font-size:13px;line-height:18px;color:#667085;margin-top:2px}" +
    ".bl-pl .lp-b{position:absolute;left:16px;right:16px;bottom:24px;display:flex;gap:12px}.bl-pl .lp-b button{height:48px;border-radius:8px;font:600 15px Roboto;cursor:pointer}" +
    ".bl-pl .lp-end{flex:1;border:1px solid #A6E9C9;background:#fff;color:#2A805A}.bl-pl .lp-pp{flex:1;border:0;background:#299D6B;color:#fff}";
  document.head.appendChild(css);

  /* live minis share one clock; under reduced motion they rest at full */
  var RM = Q.get("rm") === "1" || matchMedia("(prefers-reduced-motion: reduce)").matches, minis = [], t0 = performance.now();
  BLIB.mini = function (k, size) {
    var el = document.createElement("div"), st = document.createElement("div"), F = LAB.FINAL[k], v = F.visual(), s;
    el.className = "bl-mini"; el.style.width = el.style.height = size + "px"; st.className = "bl-st";
    /* ponytail: small minis crop to the ring and draw its lines thicker, so the clock still reads below ~100px */
    var z = size / (size < 100 ? 284 : 300); el.style.setProperty("--z", z); if (size < 100) el.classList.add("sm");
    st.style.transform = "translate(" + (size / 2 - 160 * z) + "px," + (size / 2 - 180 * z) + "px) scale(" + z + ")";
    el.appendChild(st);
    try { s = v.build(st, LAB.L); } catch (e) { console.error(k, e); return el; }
    minis.push({ k: k, v: v, s: s, el: el });
    return el;
  };
  (function tick(now) {
    var T = (now - t0) / 1000;
    minis.forEach(function (m) {
      if (!m.el.isConnected) return;
      var p = LAB.at(m.k, RM ? 1e-3 + LAB.PAT[m.k].seq[0][1] - .01 : T); p.reduced = RM; p.paused = false;
      try { m.v.frame(m.s, p); } catch (e) {}
    });
    requestAnimationFrame(tick);
  })(t0);

  var X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  /* how long: the suggested minutes are picked first; any of these or no time limit. Kept per exercise for the session */
  BLIB.dur = {};
  function durs(b) { var m = [1, 2, 3, 5, 10]; if (m.indexOf(b.min) < 0) m.push(b.min); return m.sort(function (x, y) { return x - y; }).concat([0]); }
  function pick(b) { return BLIB.dur[b.key] != null ? BLIB.dur[b.key] : b.min; }
  function goLabel(m) { return m ? "Start, " + m + " min" : "Start, no time limit"; }
  BLIB.info = function (k) {
    var b = BLIB.get(k);
    var html = '<div class="bl-sh"><div class="hero"><div><div class="pat">' + b.pat + '</div><div class="sub">' + b.how + '</div></div></div>' +
      '<div class="bl-wslot"></div><p class="wkey">Up as you breathe in, flat while you hold, down as you breathe out.</p>' +
      '<div class="chips">' + b.good.map(function (g) { return '<span class="chip">Good for ' + g.toLowerCase() + '</span>'; }).join("") + '</div>' +
      '<h5>How long</h5><div class="durs" role="radiogroup" aria-label="How long">' + durs(b).map(function (m) { var on = m === pick(b); return '<button class="dur' + (on ? ' on' : '') + '" role="radio" aria-checked="' + on + '" data-bldur="' + m + '">' + (m ? m + ' min' : 'No time limit') + (m === b.min ? '<i>Suggested</i>' : '') + '</button>'; }).join('') + '</div>' +
      '<h5>How it works</h5><div class="steps">' + b.steps.map(function (s) { return '<div class="st"><b>' + s[0] + '</b><span>' + s[1] + '</span></div>'; }).join("") + '</div>' +
      '<h5>Why it helps</h5><p>' + b.line + '</p>' +
      '<div class="foot"><button class="go" data-blplay="' + k + '">' + goLabel(pick(b)) + '</button>' +
      (b.inPlan ? '<div class="note">This one is in your mind plan, so it counts towards Rhythm.</div>' : '<div class="note">Practise any time. It does not change your Rhythm score.</div>') + '</div></div>';
    var el = window.GFOpenSheet ? window.GFOpenSheet("blSheet", b.name, html) : null;
    if (!el) el = document.getElementById("blSheet");
    if (el) { var slot = el.querySelector(".bl-wslot"); if (slot && BLIB.wave) slot.replaceWith(BLIB.wave(b)); }
    return el;
  };
  BLIB.start = function (k) {
    if (window.closeSheets) window.closeSheets();
    var o = document.createElement("div"); o.className = "bl-pl"; document.body.appendChild(o);
    var m = pick(BLIB.get(k)), el = LAB.phone(o, k, LAB.FINAL[k].visual(), { secs: m * 60, countdown: true, onEnd: function () { shut(); } });
    var z = Math.min(innerWidth / 320, innerHeight / 640); el.style.transform = "scale(" + z + ")";
    var shut = function () { o.remove(); };
    el.querySelector(".lp-x").onclick = shut;
  };
  document.addEventListener("click", function (e) {
    var d = e.target.closest("[data-bldur]");
    if (d) {   /* pick a length in the sheet */
      var sh = d.closest(".bl-sh"), k = sh.querySelector("[data-blplay]").dataset.blplay;
      BLIB.dur[k] = +d.dataset.bldur;
      sh.querySelectorAll(".dur").forEach(function (x) { var on = x === d; x.classList.toggle("on", on); x.setAttribute("aria-checked", on); });
      sh.querySelector(".go").textContent = goLabel(BLIB.dur[k]); e.preventDefault(); e.stopPropagation(); return;
    }
    var t = e.target.closest("[data-blinfo],[data-blplay]"); if (!t) return;
    e.preventDefault(); e.stopPropagation();
    if (t.dataset.blinfo) BLIB.info(t.dataset.blinfo); else BLIB.start(t.dataset.blplay);
  }, true);

  /* mount: after the plan, before the footer art; the variant file draws inside */
  function mount() {
    var v = BLIB.V[V]; if (!v) return;
    /* only for people without a Mind plan yet: free users and those waiting for their coach. Plan users breathe from their plan.
       ?lshow=1 shows it to plan users too, for the comparison page */
    if (BLIB.state === "plan" && Q.get("lshow") !== "1") { var old = document.getElementById("blib"); if (old) old.remove(); return; }
    var host = document.getElementById("blib");
    if (!host) { host = document.createElement("div"); host.id = "blib"; var f = document.querySelector(".gf-footer"); f.parentNode.insertBefore(host, f); }
    host.innerHTML = ""; v.render(host, BLIB);
    /* ponytail: images above load late and push the section down, so settle the jump a few times */
    if (Q.get("lfocus")) [0, 300, 900, 1800, 3000].forEach(function (ms) { setTimeout(function () { host.scrollIntoView({ block: "start" }); }, ms); });
    if (Q.get("lsheet")) BLIB.info(Q.get("lsheet"));
    if (Q.get("lplay")) BLIB.start(Q.get("lplay"));
  }
  document.write('<script src="/v7/mind/variants/lib-wave.js"><\/script>');
  document.write('<script src="/v7/mind/variants/lib-' + V.replace(/[^a-z0-9]/g, "") + '.js?t=' + Date.now() + '"><\/script>');
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { setTimeout(mount, 0); }); else setTimeout(mount, 0);
})();
