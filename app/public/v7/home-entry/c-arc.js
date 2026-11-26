/* Concept: The day arc. A sunrise-to-bedtime arc across the top of Home, the sun at the hour, each plan item a bead
   at its time in its pillar colour. Tap a bead, answer under the arc. */
(function () {
  var W = 328, H = 150, CX = 164, BASE = 138, RX = 166, RY = 188, CY = BASE + 188 * Math.sin(.15 * Math.PI), SUN_OFF = 16, H0 = 6, H1 = 23, A0 = .15 * Math.PI, A1 = .85 * Math.PI;
  var EASE = "cubic-bezier(.2,0,0,1)";
  var STOPS = [[0, [240, 177, 74]], [.5, [45, 166, 166]], [1, [68, 76, 231]]];   /* dawn gold, teal, indigo night */

  var CSS = [
    ".carc-w{position:relative;display:flex;flex-direction:column;gap:12px}",
    ".carc-sky{position:relative;height:" + (H + 24) + "px;margin:0 -2px}",
    ".carc-sky>svg{position:absolute;left:0;top:0;width:100%;height:" + H + "px;overflow:visible;touch-action:manipulation}",
    ".carc-bd{cursor:pointer;outline:none}",
    ".carc-bd .glow{animation:carcPulse 2.8s ease-in-out infinite alternate}",
    ".carc-bd:focus-visible .sel{stroke-opacity:1}",
    ".carc-bd .core{transition:r .4s " + EASE + ",fill .4s " + EASE + "}",
    ".carc-bd .sel{transition:stroke-opacity .3s " + EASE + "}",
    ".carc-bd .fresh{animation:carcFill .7s " + EASE + " 1.7s both}",
    "@keyframes carcPulse{from{opacity:.08}to{opacity:.24}}",
    "@keyframes carcFill{from{fill:#fff}to{fill:var(--c)}}",
    ".carc-call{position:absolute;transform:translate(-50%,-50%);display:flex;align-items:center;gap:6px;height:28px;padding:0 10px 0 8px;border-radius:999px;background:#fff;box-shadow:0 1px 2px rgba(16,24,40,.06),0 4px 12px -2px rgba(16,24,40,.10);font:600 12px/1 Roboto;color:#101828;white-space:nowrap;pointer-events:none;animation:carcCall .45s " + EASE + " both}",
    "@keyframes carcCall{from{opacity:0;transform:translate(-50%,-38%)}to{opacity:1;transform:translate(-50%,-50%)}}",
    ".carc-call i{width:8px;height:8px;border-radius:50%;flex:none}",
    ".carc-call span{font-weight:500;color:#667085}",
    ".carc-ends{position:absolute;left:0;right:0;bottom:0;height:24px;display:flex;align-items:center;justify-content:space-between;padding:0 6px;font:500 11px/16px Roboto;color:#98A2B3;pointer-events:none}",
    ".carc-ends em{font-style:normal;display:flex;align-items:center;gap:6px;font:600 11px/16px Roboto;letter-spacing:.6px;text-transform:uppercase;color:#667085}",
    ".carc-ends em b{font:600 15px/20px Roboto;letter-spacing:0;text-transform:none;color:#101828}",
    ".carc-k{display:flex;gap:8px;align-items:flex-start;padding:0 4px;font:400 13px/18px Roboto;color:#475467;min-height:36px}",
    ".carc-k svg{flex:none;margin-top:1px}",
    ".carc-card{border:1px solid #EAECF0;border-radius:20px;background:#fff;padding:16px;box-shadow:0 1px 2px rgba(16,24,40,.04),0 8px 24px -12px rgba(16,24,40,.12);animation:carcIn .35s " + EASE + " both}",
    "@keyframes carcIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}",
    ".carc-hd{display:flex;align-items:center;gap:12px}",
    ".carc-gl{width:40px;height:40px;border-radius:50%;display:grid;place-items:center;flex:none}",
    ".carc-hd h3{margin:0;font:700 16px/22px Roboto;color:#101828}",
    ".carc-hd p{margin:2px 0 0;font:400 13px/18px Roboto;color:#667085}",
    ".carc-tm{margin-left:auto;text-align:right;flex:none;font:600 13px/18px Roboto;color:#344054}",
    ".carc-tm small{display:block;font:400 11px/16px Roboto;color:#98A2B3}",
    ".carc-ans{display:flex;flex-direction:column;gap:8px;margin-top:16px}",
    ".carc-row{display:flex;gap:8px}",
    ".carc-row .he-sec{flex:1}",
    ".carc-q{height:40px;border:0;background:none;font:600 14px/1 Roboto;color:#667085;cursor:pointer;border-radius:12px}",
    ".carc-q:active{background:#F9FAFB}",
    ".carc-st{display:flex;align-items:center;justify-content:space-between;height:56px;border-radius:14px;background:#F9FAFB;padding:0 8px;margin-bottom:4px}",
    ".carc-st b{font:600 20px/1 Roboto;color:#101828}.carc-st b small{font:500 13px/1 Roboto;color:#667085;margin-left:4px}",
    ".carc-stb{width:40px;height:40px;border-radius:50%;border:1px solid #E4E7EC;background:#fff;color:#344054;display:grid;place-items:center;cursor:pointer;font:500 20px/1 Roboto}",
    ".carc-stb:active{background:#F2F4F7}",
    ".carc-faces{display:flex;justify-content:space-between}",
    ".carc-face{width:52px;display:flex;flex-direction:column;align-items:center;gap:4px;border:0;background:none;cursor:pointer;padding:4px 0;border-radius:12px;font:500 11px/14px Roboto;color:#667085}",
    ".carc-face span{width:44px;height:44px;border-radius:50%;background:#F9FAFB;border:1px solid #F2F4F7;display:grid;place-items:center;font-size:22px;transition:background .2s,border-color .2s}",
    ".carc-face:active span{background:#F5FFFF;border-color:#2DA6A6}",
    ".carc-ok{display:flex;align-items:center;justify-content:space-between;margin-top:16px;height:40px}",
    ".carc-ok span{display:inline-flex;align-items:center;gap:8px;font:600 14px/1 Roboto;color:#2A805A}",
    ".carc-ok span b{width:24px;height:24px;border-radius:50%;background:#299D6B;color:#fff;display:grid;place-items:center}",
    ".carc-ok button{height:40px;padding:0 12px;border:0;background:none;font:600 13px/1 Roboto;color:#667085;cursor:pointer;border-radius:10px}",
    ".carc-dots{display:flex;gap:6px;margin-top:12px}.carc-dots i{width:10px;height:10px;border-radius:50%}",
    ".carc-all h3{margin:0;font:700 16px/22px Roboto}.carc-all p{margin:4px 0 0;font:400 13px/18px Roboto;color:#667085}",
    ".carc-sh{display:flex;flex-direction:column;gap:12px}",
    ".carc-sh input{height:48px;border:1px solid #D0D5DD;border-radius:12px;padding:0 14px;font:400 15px Roboto;color:#101828;outline:none}",
    ".carc-sh input:focus{border-color:#299D6B;box-shadow:0 0 0 4px #E6FAF1}",
    ".carc-chips{display:flex;flex-wrap:wrap;gap:8px}",
    ".carc-chips .on{border-color:#299D6B;background:#F3FCF8;color:#2A805A}",
    "@media (prefers-reduced-motion: reduce){.carc-bd .glow{animation:none;opacity:.22}.carc-bd .fresh{animation-duration:.01s;animation-delay:0s}.carc-card,.carc-call{animation:none}}"
  ].join("");

  var KAIRA = {
    sleep:  "A night under 7 hours raises ghrelin, the hunger hormone, so meals can feel smaller than they are.",
    weigh:  "Weighing before breakfast, same time each day, keeps water and food out of the trend.",
    bfast:  "The peanuts add protein to your poha, which keeps you full until lunch.",
    walk:   "Daylight in the first hours sets your body clock, so sleep comes easier tonight.",
    lunch:  "Eating dal and sabzi before the roti slows how fast its sugar reaches your blood.",
    breath: "Five slow minutes lowers cortisol, and that steadies the late afternoon cravings.",
    stairs: "A short climb after lunch helps your muscles pull sugar out of your blood.",
    snack:  "Protein at 5 means you reach dinner hungry, not starving, and portions stay calm.",
    gym:    "Muscle stores sugar, so a strength session keeps your levels steadier for up to a day.",
    dinner: "Finishing dinner 2 to 3 hours before bed gives your body time to digest before sleep.",
    mood:   "Naming how the day felt helps spot what lifts you and what drains you.",
    wind:   "Dim light in the last hour lets melatonin rise, so you fall asleep sooner."
  };

  function css() { if (document.getElementById("carc-css")) return; var s = document.createElement("style"); s.id = "carc-css"; s.textContent = CSS; document.head.appendChild(s); }
  function tOf(h) { return Math.max(0, Math.min(1, (h - H0) / (H1 - H0))); }
  function pt(t, off) { var a = A0 + (A1 - A0) * t, rx = RX + (off || 0), ry = RY + (off || 0); return { x: CX - rx * Math.cos(a), y: CY - ry * Math.sin(a) }; }
  function arcD(t) { var p = pt(t), o = pt(0); return "M" + o.x.toFixed(2) + " " + o.y.toFixed(2) + " A" + RX + " " + RY + " 0 0 1 " + p.x.toFixed(2) + " " + p.y.toFixed(2); }
  function mix(t) {
    for (var i = 1; i < STOPS.length; i++) if (t <= STOPS[i][0]) {
      var a = STOPS[i - 1], b = STOPS[i], k = (t - a[0]) / (b[0] - a[0]);
      return "rgb(" + a[1].map(function (v, j) { return Math.round(v + (b[1][j] - v) * k); }).join(",") + ")";
    }
    return "rgb(68,76,231)";
  }
  function hm(min) { var h = Math.floor(min / 60), m = min % 60; return h + "h" + (m ? " " + m + "m" : ""); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  function draw(ph) {
    css();
    var A = ph._a || (ph._a = { sleep: 450, kg: 72.4, later: {} });
    var items = ph.items(), byId = {}; items.forEach(function (x) { byId[x.id] = x; });
    var hour = HE.hour, from = A.shown == null ? hour : A.shown, hourMoved = A.shown != null && A.shown !== hour;
    A.shown = hour;
    if (hourMoved) { A.sel = null; A.later = {}; }
    var open = items.filter(function (x) { return !x.done; });
    var due = ph.due(), lead = due.length ? due[due.length - 1] : null;          /* nearest due: the one the day is asking about */
    if (!A.sel || (byId[A.sel] && byId[A.sel].done && A.sel !== A.keep)) {
      var pick = open.filter(function (x) { return !A.later[x.id]; });
      var nx = ph.next(); A.sel = nx && !A.later[nx.id] ? nx.id : (pick[0] ? pick[0].id : (open[0] ? open[0].id : null));
    }
    A.keep = null;
    var sel = A.sel ? byId[A.sel] : null;

    /* ---- the sky ---- */
    var tn = tOf(hour), sp = pt(tn, SUN_OFF), sc = mix(tn), night = hour >= 20;
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" height="' + H + '" role="group" aria-label="Your day, 6 AM to 11 PM">' +
      '<defs>' +
        '<linearGradient id="carcG" gradientUnits="userSpaceOnUse" x1="' + (CX - RX) + '" y1="0" x2="' + (CX + RX) + '" y2="0"><stop offset="0" stop-color="#F0B14A"/><stop offset=".5" stop-color="#2DA6A6"/><stop offset="1" stop-color="#444CE7"/></linearGradient>' +
        '<radialGradient id="carcHalo"><stop offset="0" stop-color="' + sc + '" stop-opacity=".32" class="hs0"/><stop offset=".45" stop-color="' + sc + '" stop-opacity=".12" class="hs1"/><stop offset="1" stop-color="' + sc + '" stop-opacity="0" class="hs2"/></radialGradient>' +
        '<radialGradient id="carcOrb" cx=".32" cy=".28" r=".9"><stop offset="0" stop-color="#fff"/><stop offset=".22" stop-color="#fff" stop-opacity=".95"/><stop offset=".8" stop-color="' + sc + '" class="os"/></radialGradient>' +
        '<filter id="carcBlur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3"/></filter>' +
      '</defs>' +
      '<path d="' + arcD(1) + '" fill="none" stroke="url(#carcG)" stroke-width="1.5" stroke-opacity=".28" stroke-linecap="round"/>' +
      '<path class="trv-g" d="' + arcD(tOf(from)) + '" fill="none" stroke="url(#carcG)" stroke-width="7" stroke-opacity=".18" stroke-linecap="round" filter="url(#carcBlur)"/>' +
      '<path class="trv" d="' + arcD(tOf(from)) + '" fill="none" stroke="url(#carcG)" stroke-width="2.5" stroke-linecap="round"/>';
    /* the sun rides just outside the arc so it never sits on a bead */
    var fp = pt(tOf(from), SUN_OFF);
    s += '<g class="sun" transform="translate(' + fp.x.toFixed(2) + ' ' + fp.y.toFixed(2) + ')">' +
      '<circle r="24" fill="url(#carcHalo)"/>' +
      '<circle r="8.5" fill="url(#carcOrb)" stroke="#fff" stroke-width="1.5"/>' +
      '<circle class="cres" r="6.4" cx="3.8" cy="-2.8" fill="#fff" opacity="' + (night ? 1 : 0) + '" style="transition:opacity .6s ' + EASE + '"/>' +
      '</g>';

    /* beads: hollow when open, filled when done, glowing when due, the lead one bigger with a callout */
    var call = null;
    items.forEach(function (x) {
      var p = pt(tOf(x.at)), c = HE.P[x.p].c, isDue = !x.done && x.at <= hour + .25, isLead = lead && lead.id === x.id, isSel = sel && sel.id === x.id;
      var r = isLead ? 8 : 5.5, fresh = A.fresh === x.id;
      var label = x.t + ", " + HE.clock(x.at) + (x.done ? ", done" : isDue ? ", due now" : "");
      s += '<g class="carc-bd" data-id="' + x.id + '" tabindex="0" role="button" aria-label="' + esc(label) + '" aria-pressed="' + (isSel ? "true" : "false") + '" style="--c:' + c + '">' +
        (isDue ? '<circle class="glow" cx="' + p.x + '" cy="' + p.y + '" r="' + (r + 7) + '" fill="' + c + '"/>' : "") +
        '<circle class="sel" cx="' + p.x + '" cy="' + p.y + '" r="' + (r + 5) + '" fill="none" stroke="' + c + '" stroke-width="1.5" stroke-opacity="' + (isSel ? .55 : 0) + '"/>' +
        '<circle class="core' + (fresh ? " fresh" : "") + '" cx="' + p.x + '" cy="' + p.y + '" r="' + r + '" fill="' + (x.done && !fresh ? c : "#fff") + '" stroke="' + c + '" stroke-width="2"/>' +
        '</g>';
      if (isLead) call = { x: x, p: p };
    });
    s += "</svg>";
    if (A.fresh) A.fresh = null;

    var callHtml = "";
    if (call) {
      /* inside the arc: beside the bead near the ends, under it near the top */
      var est = 36 + (call.x.t.length + 8) * 6.4, off = CX - call.p.x, cx, cy;
      if (Math.abs(off) > 70 && call.p.y > BASE - 56) { cx = call.p.x + (off > 0 ? 1 : -1) * (14 + est / 2); cy = call.p.y + 20; }
      else { cx = call.p.x; cy = call.p.y + 32; }
      cx = Math.max(est / 2 + 2, Math.min(W - est / 2 - 2, cx));
      callHtml = '<div class="carc-call" style="left:' + (cx + 2) + 'px;top:' + cy + 'px"><i style="background:' + HE.P[call.x.p].c + '"></i>' + esc(call.x.t) + '<span>' + HE.clock(call.x.at) + '</span></div>';
    }
    var partName = HE.part(hour);
    var ends = '<div class="carc-ends"><span>6 AM</span><em>' + HE.icon(night ? "moon" : "sun", 13, 2.2) + partName + '<b class="clk">' + HE.clock(hour) + '</b></em><span>11 PM</span></div>';

    /* ---- KAIRA, tied to the selected bead ---- */
    var allDone = !open.length;
    var kLine = allDone ? "A full day of small steps settles your blood sugar overnight, so you are likely to wake less hungry." : sel ? KAIRA[sel.id] : "";
    var kHtml = '<div class="carc-k">' + HE.kaira(16) + '<span>' + esc(kLine) + '</span></div>';

    /* ---- the answer card ---- */
    var card = "";
    if (allDone && (!sel || sel.done) && !A.view) {
      card = '<div class="carc-card carc-all"><h3>Your whole plan is in</h3><p>Every bead on your arc is full. Tap any one to see it again.</p>' +
        '<div class="carc-dots">' + HE.ORDER.map(function (p) { return '<i style="background:' + HE.P[p].c + '"></i>'; }).join("") + '</div></div>';
    } else if (sel) {
      var P = HE.P[sel.p];
      card = '<div class="carc-card" data-card="' + sel.id + '"><div class="carc-hd"><span class="carc-gl" style="background:' + P.t + ';color:' + P.c + '">' + HE.icon(sel.p, 20, 2) + '</span>' +
        '<div style="min-width:0"><h3>' + esc(sel.t) + '</h3><p>' + esc(sel.sub) + '</p></div>' +
        '<div class="carc-tm">' + HE.clock(sel.at) + '<small>Coach’s time</small></div></div>';
      if (sel.done) {
        card += '<div class="carc-ok"><span><b>' + HE.icon("check", 14, 3) + '</b>Logged</span><button data-a="undo" aria-label="Undo ' + esc(sel.t) + '">Undo</button></div>';
      } else card += '<div class="carc-ans">' + answers(sel, A) + '</div>';
      card += '</div>';
    }
    A.view = null;

    ph.slot.innerHTML = '<div class="carc-w"><div class="carc-sky">' + s + callHtml + ends + '</div>' + kHtml + card + '</div>';

    var svg = ph.slot.querySelector("svg");
    if (hourMoved) travel(svg, ph.slot, from, hour);

    /* tap the nearest bead (beads are close together, so hit-test by distance, 22px) */
    svg.addEventListener("click", function (e) {
      var m = svg.getScreenCTM(); if (!m) return;
      var q = svg.createSVGPoint(); q.x = e.clientX; q.y = e.clientY; q = q.matrixTransform(m.inverse());
      var best = null, bd = 22;
      items.forEach(function (x) { var p = pt(tOf(x.at)), dd = Math.hypot(p.x - q.x, p.y - q.y); if (dd < bd) { bd = dd; best = x; } });
      if (best) choose(best.id);
    });
    svg.addEventListener("keydown", function (e) {
      var g = e.target.closest && e.target.closest(".carc-bd"); if (!g) return;
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); choose(g.dataset.id); }
    });
    function choose(id) { A.sel = id; A.keep = id; A.view = 1; ph.draw(); var g = ph.slot.querySelector('.carc-bd[data-id="' + id + '"]'); if (g && document.activeElement && document.activeElement.closest && document.activeElement.closest(".carc-bd")) g.focus(); }

    var cardEl = ph.slot.querySelector(".carc-card[data-card]");
    if (cardEl) cardEl.addEventListener("click", function (e) {
      var b = e.target.closest("[data-a]"); if (!b) return;
      var a = b.dataset.a, id = sel.id;
      if (a === "undo") { A.keep = id; ph.undo(id); return; }
      if (a === "later") { A.later[id] = 1; A.sel = null; ph.toast("Okay, it stays open on your arc"); ph.draw(); return; }
      if (a === "sm" || a === "sp") { A.sleep = Math.max(180, Math.min(720, A.sleep + (a === "sp" ? 15 : -15))); paint(); return; }
      if (a === "km" || a === "kp") { A.kg = Math.round((A.kg + (a === "kp" ? .1 : -.1)) * 10) / 10; paint(); return; }
      if (a === "else") return elseSheet(ph, sel);
      var how = a === "face" ? b.dataset.v : a === "sleep" ? hm(A.sleep) : a === "kg" ? A.kg + " kg" : a === "plan" ? "as planned" : true;
      A.fresh = id; A.sel = null; ph.log([id], { how: how });
      function paint() { var v = cardEl.querySelector(".carc-st b"); if (!v) return; if (a[0] === "s") { v.innerHTML = hm(A.sleep); cardEl.querySelector('[data-a="sleep"]').textContent = "Log " + hm(A.sleep); } else { v.innerHTML = A.kg.toFixed(1) + "<small>kg</small>"; cardEl.querySelector('[data-a="kg"]').textContent = "Log " + A.kg.toFixed(1) + " kg"; } }
    });
  }

  function answers(x, A) {
    var later = '<button class="carc-q" data-a="later">Not yet</button>';
    if (x.kind === "meal") return '<button class="he-pri" data-a="plan">Had it as planned</button><div class="carc-row"><button class="he-sec" data-a="else">Something else</button><button class="he-sec" data-a="later" style="flex:0 0 112px">Not yet</button></div>';
    if (x.kind === "sleep") return '<div class="carc-st"><button class="carc-stb" data-a="sm" aria-label="15 minutes less">−</button><b>' + hm(A.sleep) + '</b><button class="carc-stb" data-a="sp" aria-label="15 minutes more">+</button></div><button class="he-pri" data-a="sleep">Log ' + hm(A.sleep) + '</button>';
    if (x.kind === "num") return '<div class="carc-st"><button class="carc-stb" data-a="km" aria-label="0.1 kg less">−</button><b>' + A.kg.toFixed(1) + '<small>kg</small></b><button class="carc-stb" data-a="kp" aria-label="0.1 kg more">+</button></div><button class="he-pri" data-a="kg">Log ' + A.kg.toFixed(1) + ' kg</button>';
    if (x.kind === "mood") return '<div class="carc-faces">' + HE.FACES.map(function (f) { return '<button class="carc-face" data-a="face" data-v="' + f[0] + '" aria-label="' + f[0] + '"><span>' + f[1] + '</span>' + f[0] + '</button>'; }).join("") + '</div>';
    return '<button class="he-pri" data-a="done">Done</button>' + later;
  }

  function elseSheet(ph, x) {
    var pick = "";
    ph.sheet("What did you have?", '<div class="carc-sh"><input type="text" placeholder="For example, 2 idli with sambar" aria-label="What you had">' +
      '<div class="carc-chips">' + ["Smaller portion", "Bigger portion", "Ate out"].map(function (c) { return '<button class="he-chip" data-c="' + c + '">' + c + '</button>'; }).join("") + '</div>' +
      '<button class="he-pri" data-go="1">Log ' + x.t.toLowerCase() + '</button></div>', function (e) {
        var c = e.target.closest("[data-c]");
        if (c) { pick = pick === c.dataset.c ? "" : c.dataset.c; [].forEach.call(ph.el.querySelectorAll(".carc-chips .he-chip"), function (b) { b.classList.toggle("on", b.dataset.c === pick); }); return; }
        if (e.target.closest("[data-go]")) {
          var v = ph.el.querySelector(".carc-sh input").value.trim() || pick || "something else";
          ph._a.fresh = x.id; ph._a.sel = null; ph.log([x.id], { how: v });
        }
      }, x.sub ? "Your plan said " + x.sub.charAt(0).toLowerCase() + x.sub.slice(1) : "");
  }

  /* the sun and the lit part of the arc glide to the new hour along the curve */
  function travel(svg, slot, a, b) {
    var sun = svg.querySelector(".sun"), trv = svg.querySelectorAll(".trv,.trv-g"), stops = svg.querySelectorAll(".hs0,.hs1,.hs2,.os");
    var ta = tOf(a), tb = tOf(b);
    if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return set(tb);
    var t0 = performance.now(), dur = 1100;
    function ease(k) { return k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; }   /* smooth in-out, no overshoot */
    function set(t) {
      var p = pt(t, SUN_OFF), c = mix(t);
      sun.setAttribute("transform", "translate(" + p.x.toFixed(2) + " " + p.y.toFixed(2) + ")");
      [].forEach.call(trv, function (el) { el.setAttribute("d", arcD(t)); });
      [].forEach.call(stops, function (el) { el.setAttribute("stop-color", c); });
    }
    (function step(now) {
      if (!svg.isConnected) return;
      var k = Math.min(1, (now - t0) / dur); set(ta + (tb - ta) * ease(k));
      if (k < 1) requestAnimationFrame(step);
    })(t0);
  }

  HE.add({
    id: "arc", name: "The day arc", rec: false,
    pitch: "The day drawn as one soft arc from sunrise to bedtime, the sun at the hour and each plan item a bead at its time. You see where you are in the day, what is due, and answer the one you tap right under it.",
    how: [
      "Home opens on the arc: the sun sits at now, due beads glow, the nearest one is bigger and named.",
      "Its answer card is already open under the arc, with the coach’s time and one-tap answers.",
      "Tap Had it as planned, Done, a face or a stepper: the green moment plays and the bead fills in.",
      "Tap any other bead, past or coming, to answer early or catch up; KAIRA’s line changes with it.",
      "Change the hour and the sun glides along the arc; when every bead is full the card rests."
    ],
    score: [["The right thing now", "y"], ["Answer where you are", "y"], ["Pillars in view", "y"], ["GoodFlip look", "y"], ["KAIRA carries insight", "y"]],
    catch: "Beads that sit close in time (7 to 9 AM, 8 to 10 PM) are small targets, so it leans on the card picking the right one. Twelve beads is near the limit; a longer plan would need clustering.",
    from: "Structured’s day timeline, Yazio’s bright-for-now meals, Gentler Streak’s activity path.",
    tryit: "Tap Had it as planned, then tap a later bead on the arc; switch Morning to Evening to watch the sun move.",
    effort: "Medium, one SVG arc and the answer card",
    draw: draw
  });
})();
