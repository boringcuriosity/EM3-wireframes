/* Concept: We noticed. The app does the work and the person confirms: a card for this part of the day lists what was
   detected (pre-ticked) and what the plan expects now (unticked). One button logs the stack. */
(function () {
  var EASE = "cubic-bezier(.2,0,0,1)";
  var CSS = [
    ".ccf-w{display:flex;flex-direction:column;gap:12px}",
    ".ccf-card{border:1px solid #EAECF0;border-radius:20px;background:#fff;padding:16px 16px 8px;box-shadow:0 1px 2px rgba(16,24,40,.04),0 8px 24px -12px rgba(16,24,40,.12);animation:ccfIn .4s " + EASE + " both}",
    "@keyframes ccfIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}",
    ".ccf-hd{display:flex;align-items:center;justify-content:space-between;gap:8px}",
    ".ccf-hd h3{margin:0;font:700 18px/26px Roboto;color:#101828}",
    ".ccf-hd span{color:#98A2B3;display:grid;place-items:center}",
    ".ccf-k{display:flex;gap:8px;align-items:flex-start;margin-top:4px;font:400 13px/18px Roboto;color:#475467}",
    ".ccf-k svg{flex:none;margin-top:1px}",
    ".ccf-rows{margin:12px 0 4px;display:flex;flex-direction:column}",
    ".ccf-row{display:flex;align-items:center;gap:12px;min-height:52px;padding:4px 0;border-top:1px solid #F2F4F7;cursor:pointer;text-align:left;background:none;border-left:0;border-right:0;border-bottom:0;width:100%;font:inherit;color:inherit}",
    ".ccf-row:first-child{border-top:0}",
    ".ccf-gl{width:32px;height:32px;border-radius:50%;display:grid;place-items:center;flex:none}",
    ".ccf-tx{flex:1;min-width:0}",
    ".ccf-tx b{display:block;font:500 14px/20px Roboto;color:#101828}",
    ".ccf-tx small{display:block;font:400 12px/16px Roboto;color:#667085;margin-top:1px}",
    ".ccf-tx small em{font-style:normal;color:#2A805A;font-weight:600}",
    ".ccf-tk{width:44px;height:44px;margin-right:-8px;display:grid;place-items:center;flex:none}",
    ".ccf-tk i{width:26px;height:26px;border-radius:50%;border:2px solid #D0D5DD;background:#fff;display:grid;place-items:center;color:#fff;transition:background .25s " + EASE + ",border-color .25s " + EASE + "}",
    ".ccf-tk i svg{opacity:0;transform:scale(.6);transition:opacity .2s " + EASE + ",transform .25s " + EASE + "}",
    ".ccf-row.on .ccf-tk i{background:#299D6B;border-color:#299D6B}",
    ".ccf-row.on .ccf-tk i svg{opacity:1;transform:none}",
    ".ccf-row:focus-visible{outline:2px solid #299D6B;outline-offset:2px;border-radius:12px}",
    ".ccf-left{display:flex;align-items:center;gap:8px;width:100%;min-height:44px;margin:4px 0 8px;padding:0 12px;border:0;border-radius:12px;background:#F9FAFB;font:500 13px/18px Roboto;color:#475467;cursor:pointer;text-align:left}",
    ".ccf-left span{flex:1}.ccf-left b{font-weight:600;color:#101828}.ccf-left svg{margin-left:auto;color:#98A2B3;flex:none}",
    ".ccf-act{display:flex;flex-direction:column;gap:4px;margin-top:8px}",
    ".ccf-act .he-pri[disabled]{background:#D0D5DD;box-shadow:0 5px 0 #98A2B3;cursor:default;opacity:.7}",
    ".ccf-q{height:44px;border:0;background:none;font:600 14px/1 Roboto;color:#2A805A;cursor:pointer;border-radius:12px}",
    ".ccf-q:active{background:#F3FCF8}",
    ".ccf-done{display:flex;align-items:center;gap:12px;min-height:56px;padding:8px 16px;border:1px solid #EAECF0;border-radius:20px;background:#fff;animation:ccfIn .5s " + EASE + " both}",
    ".ccf-done>b{width:28px;height:28px;border-radius:50%;background:#299D6B;color:#fff;display:grid;place-items:center;flex:none}",
    ".ccf-done span{flex:1;font:600 15px/20px Roboto;color:#101828}",
    ".ccf-dots{display:flex;gap:6px}.ccf-dots i{width:10px;height:10px;border-radius:50%}",
    ".ccf-next{border:1px dashed #E4E7EC;border-radius:20px;padding:14px 16px;opacity:.6;animation:ccfIn .5s " + EASE + " .15s both}",
    ".ccf-next h4{margin:0 0 4px;font:700 15px/22px Roboto;color:#344054;display:flex;justify-content:space-between}",
    ".ccf-next h4 small{font:500 12px/22px Roboto;color:#98A2B3}",
    ".ccf-nr{display:flex;align-items:center;gap:10px;min-height:32px;font:400 13px/18px Roboto;color:#475467}",
    ".ccf-nr i{width:8px;height:8px;border-radius:50%;flex:none}",
    ".ccf-nr span{margin-left:auto;color:#98A2B3;font-size:12px}",
    ".ccf-next .ccf-k{margin-top:8px}",
    ".ccf-sh{display:flex;flex-direction:column;gap:8px}",
    ".ccf-sh .ccf-row{min-height:56px}",
    ".ccf-st{display:flex;align-items:center;justify-content:space-between;height:64px;border-radius:14px;background:#F9FAFB;padding:0 12px;margin:4px 0 8px}",
    ".ccf-st b{font:600 22px/1 Roboto;color:#101828}.ccf-st b small{font:500 13px/1 Roboto;color:#667085;margin-left:4px}",
    ".ccf-stb{width:44px;height:44px;border-radius:50%;border:1px solid #E4E7EC;background:#fff;color:#344054;display:grid;place-items:center;cursor:pointer;font:500 20px/1 Roboto}",
    ".ccf-sh p{margin:0 0 8px;font:400 14px/20px Roboto;color:#475467}",
    ".ccf-sh input{height:48px;border:1px solid #D0D5DD;border-radius:12px;padding:0 14px;font:400 15px Roboto;color:#101828;outline:none}",
    ".ccf-sh input:focus{border-color:#299D6B;box-shadow:0 0 0 4px #E6FAF1}",
    ".ccf-chips{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:4px}.ccf-chips .on{border-color:#299D6B;background:#F3FCF8;color:#2A805A}",
    ".ccf-faces{display:flex;justify-content:space-between;margin:4px 0 8px}",
    ".ccf-face{width:56px;display:flex;flex-direction:column;align-items:center;gap:6px;border:0;background:none;cursor:pointer;font:500 12px/14px Roboto;color:#667085;padding:0}",
    ".ccf-face span{width:48px;height:48px;border-radius:50%;background:#F9FAFB;border:1px solid #F2F4F7;display:grid;place-items:center;font-size:24px}",
    ".ccf-face.on span{background:#F5FFFF;border-color:#2DA6A6}",
    "@media (prefers-reduced-motion: reduce){.ccf-card,.ccf-done,.ccf-next{animation:none}.ccf-tk i,.ccf-tk i svg{transition:none}}"
  ].join("");

  /* what the phone's sources saw, and when it saw it */
  var DET = {
    sleep: { seen: 6,    src: "From your ring",        say: function (A) { return A.sleep ? "You slept " + hm(A.sleep) : "You slept 6h 50m, 11:10 PM to 6:00 AM"; } },
    weigh: { seen: 7.33, src: "From your smart scale", say: function (A) { return A.kg.toFixed(1) + " kg on the scale at 7:20 AM"; } },
    walk:  { seen: 9.5,  src: "Apple Health",          say: function () { return "A 22 min walk at 9:05 AM"; } },
    stairs:{ seen: 16.2, src: "Apple Health",          say: function () { return "4 flights of stairs at 3:50 PM"; } },
    gym:   { seen: 19.1, src: "Apple Watch",           say: function () { return "Strength workout, 26 min at 6:35 PM"; } }
  };
  var STEPS = { morning: "2,140", afternoon: "6,380", evening: "8,920", night: "10,240" };
  var TITLE = { morning: "This morning", afternoon: "This afternoon", evening: "This evening", night: "Tonight" };
  var NEXT = { morning: "afternoon", afternoon: "evening", evening: "night", night: "tomorrow" };
  var KAIRA = {
    morning: "Under 7 hours of sleep, hunger runs higher, so the protein at breakfast matters more than usual.",
    afternoon: "Lunch brings the biggest sugar rise of the day. A short walk after it helps your muscles soak that up.",
    evening: "Strength work before dinner helps your muscles take up the sugar from that meal.",
    night: "Lights low by 10 lets melatonin rise on time, and that shows up in tomorrow’s hunger.",
    tomorrow: "Your ring keeps watch overnight, so the morning card will already know how you slept."
  };

  function css() { if (document.getElementById("ccf-css")) return; var s = document.createElement("style"); s.id = "ccf-css"; s.textContent = CSS; document.head.appendChild(s); }
  function hm(min) { var h = Math.floor(min / 60), m = min % 60; return h + "h" + (m ? " " + m + "m" : ""); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function lc(s) { return s.charAt(0).toLowerCase() + s.slice(1); }
  function check(n) { return HE.icon("check", n || 14, 3); }

  /* the rows this hour asks to confirm, from the state on every draw */
  function rowsFor(ph, A) {
    var h = HE.hour, part = HE.part(h), lo = h - 2.5, hi = h + .75, rows = [], left = [];
    ph.items().forEach(function (x) {
      var d = DET[x.id], seen = d && d.seen <= h, when = seen ? Math.max(x.at, d.seen) : x.at;
      if (x.done) return;
      if (!seen && x.at > hi) return;
      if (when <= lo) { left.push(x); return; }
      var r = { id: x.id, x: x, p: x.p, det: !!seen };
      if (seen) { r.say = d.say(A); r.src = A.edit[x.id] ? "Changed by you" : d.src; }
      else {
        var sub = x.kind === "meal" ? x.sub.split(",")[0] : x.sub;
        r.say = A.edit[x.id] ? A.edit[x.id] : x.kind === "mood" ? "Mood check-in: how the day felt" : (x.kind === "meal" ? x.t + ": " + lc(sub) : /\d/.test(sub.split(",")[0]) ? x.t + ", " + sub.split(",")[0] : x.t);
        r.src = A.edit[x.id] ? "Changed by you" : "Your plan, " + HE.clock(x.at);
      }
      if (x.kind === "mood" && A.face) { r.say = "The day felt " + A.face.toLowerCase(); r.src = "Your answer"; }
      r.on = A.sel[x.id] != null ? A.sel[x.id] : r.det;
      rows.push(r);
    });
    if (!A.stepsOk[part]) rows.splice(rows.filter(function (r) { return r.det; }).length, 0,
      { id: "steps", p: "move", det: true, say: STEPS[part] + " steps so far", src: "Apple Health", on: A.sel.steps != null ? A.sel.steps : true });
    return { rows: rows, left: left, part: part };
  }

  function rowHtml(r, inSheet) {
    var P = HE.P[r.p];
    return '<button class="ccf-row' + (r.on ? " on" : "") + '" data-r="' + r.id + '" role="checkbox" aria-checked="' + (r.on ? "true" : "false") + '">' +
      '<span class="ccf-gl" style="background:' + P.t + ';color:' + P.c + '">' + HE.icon(r.p, 16, 2) + '</span>' +
      '<span class="ccf-tx"><b>' + esc(r.say) + '</b><small>' + (r.src === "Changed by you" ? "<em>Changed by you</em>" : esc(r.src)) + '</small></span>' +
      (inSheet ? '<span class="ccf-tk" style="color:#98A2B3">' + HE.icon("chev", 18, 2) + '</span>' : '<span class="ccf-tk"><i>' + check(14) + '</i></span>') + '</button>';
  }

  function draw(ph) {
    css();
    var A = ph._c || (ph._c = { sel: {}, edit: {}, stepsOk: {}, kg: 72.4, sleep: 0, face: "", logged: {} });
    if (A.hour !== HE.hour) { A.sel = {}; A.hour = HE.hour; }
    var R = rowsFor(ph, A), rows = R.rows, part = R.part, n = rows.filter(function (r) { return r.on; }).length;
    var html = "";

    if (rows.length) {
      html += '<section class="ccf-card" aria-label="' + TITLE[part] + '"><div class="ccf-hd"><h3>' + TITLE[part] + '</h3><span>' + HE.icon(HE.hour >= 19 ? "moon" : "sun", 18, 2) + '</span></div>' +
        '<div class="ccf-k">' + HE.kaira(16) + '<span>' + KAIRA[part] + '</span></div>' +
        '<div class="ccf-rows">' + rows.map(function (r) { return rowHtml(r); }).join("") + '</div>' +
        leftHtml(R.left) +
        '<div class="ccf-act"><button class="he-pri" data-a="log"' + (n ? "" : " disabled") + '>' + (n ? "Looks right, log " + n : "Tick what you’ve done") + '</button>' +
        '<button class="ccf-q" data-a="edit">Change something</button></div></section>';
    } else {
      /* all in: one calm line, the pillar dots that came in, and the next part of the day waiting faintly below */
      var ps = {}; (A.logged[part] || []).forEach(function (p) { ps[p] = 1; });
      var dots = HE.ORDER.filter(function (p) { return ps[p]; });
      html += '<div class="ccf-done" role="status"><b>' + check(16) + '</b><span>All in for ' + (laterIn(ph, part).length ? "now" : lc(TITLE[part])) + '</span>' +
        '<span class="ccf-dots" aria-hidden="true" style="flex:none">' + dots.map(function (p) { return '<i style="background:' + HE.P[p].c + '"></i>'; }).join("") + '</span></div>' +
        (R.left.length ? leftHtml(R.left) : "") + nextHtml(ph, part);
    }
    ph.slot.innerHTML = '<div class="ccf-w">' + html + '</div>';

    ph.slot.onclick = function (e) {
      var row = e.target.closest(".ccf-card [data-r]");
      if (row) {
        var id = row.dataset.r, r = rows.filter(function (x) { return x.id === id; })[0];
        if (r.x && r.x.kind === "mood" && !r.on && !A.face) return editor(ph, A, r);
        r.on = !r.on; A.sel[id] = r.on;
        row.classList.toggle("on", r.on); row.setAttribute("aria-checked", r.on);
        var k = rows.filter(function (x) { return x.on; }).length, b = ph.slot.querySelector('[data-a="log"]');
        b.disabled = !k; b.textContent = k ? "Looks right, log " + k : "Tick what you’ve done";
        return;
      }
      var a = e.target.closest("[data-a]"); a = a && a.dataset.a;
      if (a === "log") {
        var on = rows.filter(function (x) { return x.on; }), ids = on.filter(function (x) { return x.id !== "steps"; }).map(function (x) { return x.id; });
        A.logged[part] = (A.logged[part] || []).concat(on.map(function (x) { return x.p; }));
        if (on.some(function (x) { return x.id === "steps"; })) A.stepsOk[part] = 1;
        A.sel = {};
        if (ids.length) ph.log(ids, { how: "confirmed" }); else { ph.toast("Steps confirmed"); ph.draw(); }
      }
      if (a === "edit") pickSheet(ph, A, rows);
      if (a === "left") leftSheet(ph, A, R.left);
    };
  }

  function leftHtml(left) {
    if (!left.length) return "";
    var first = left[0].t;
    return '<button class="ccf-left" data-a="left"><span>Still open from earlier: <b>' + esc(first) + (left.length > 1 ? " and " + (left.length - 1) + " more" : "") + '</b></span>' + HE.icon("chev", 16, 2) + '</button>';
  }

  var LATER = {
    morning: "Daylight on a morning walk sets your body clock, so sleep comes easier tonight.",
    afternoon: "Five slow breaths a minute lowers cortisol, which steadies late afternoon cravings.",
    evening: "Muscle stores sugar, so a strength session keeps your levels steadier for up to a day.",
    night: "Dim light in the last hour lets melatonin rise, so you fall asleep sooner."
  };
  /* what is still ahead in this part of the day, opened only when its time comes */
  function laterIn(ph, part) { return ph.items().filter(function (x) { return !x.done && HE.part(x.at) === part && x.at > HE.hour + .75; }); }

  function nextHtml(ph, part) {
    var nx = NEXT[part], list, title, from, k, later = laterIn(ph, part);
    if (later.length) {
      list = later.slice(0, 3).map(function (x) { return [x.p, x.t, HE.clock(x.at)]; });
      title = "Later " + (part === "night" ? "tonight" : lc(TITLE[part])); from = "From " + HE.clock(later[0].at); k = LATER[part];
    } else {
      if (nx === "tomorrow") list = [["mind", "Last night’s sleep, from your ring", "6:00 AM"], ["measure", "Morning weight", "7:30 AM"]];
      else list = ph.items().filter(function (x) { return HE.part(x.at) === nx && !x.done; }).slice(0, 3).map(function (x) { return [x.p, x.t, HE.clock(x.at)]; });
      title = nx === "tomorrow" ? "Tomorrow morning" : TITLE[nx];
      from = { afternoon: "From 12 PM", evening: "From 5 PM", night: "From 9 PM", tomorrow: "From 6 AM" }[nx]; k = KAIRA[nx];
    }
    if (!list.length) return "";
    return '<div class="ccf-next" aria-label="Coming up"><h4>' + title + '<small>' + from + '</small></h4>' +
      list.map(function (r) { return '<div class="ccf-nr"><i style="background:' + HE.P[r[0]].c + '"></i>' + esc(r[1]) + '<span>' + r[2] + '</span></div>'; }).join("") +
      '<div class="ccf-k">' + HE.kaira(16) + '<span>' + k + '</span></div></div>';
  }

  /* Change something: pick a row, then a small editor for that kind */
  function pickSheet(ph, A, rows) {
    ph.sheet("Change something", '<div class="ccf-sh">' + rows.map(function (r) { return rowHtml(r, true); }).join("") + '</div>', function (e) {
      var b = e.target.closest("[data-r]"); if (!b) return;
      editor(ph, A, rows.filter(function (r) { return r.id === b.dataset.r; })[0]);
    }, "Tap the one that’s not quite right");
  }

  function editor(ph, A, r) {
    var x = r.x, body = "", title = x ? x.t : "Steps", sub = r.src;
    function save(on) { A.sel[r.id] = on; ph.closeSheet(); ph.draw(); }
    if (r.id === "steps") body = '<p>Steps come straight from Apple Health, so the number stays as it is. You can leave them out of this check-in.</p><button class="he-sec" data-e="off">Leave them out</button>';
    else if (x.kind === "sleep") body = '<p>How long did you sleep?</p><div class="ccf-st"><button class="ccf-stb" data-e="m" aria-label="15 minutes less">−</button><b class="v">' + hm(A.sleep || 410) + '</b><button class="ccf-stb" data-e="p" aria-label="15 minutes more">+</button></div><button class="he-pri" data-e="save">Save</button>';
    else if (x.kind === "num") body = '<p>What did the scale say?</p><div class="ccf-st"><button class="ccf-stb" data-e="m" aria-label="0.1 kg less">−</button><b class="v">' + A.kg.toFixed(1) + '<small>kg</small></b><button class="ccf-stb" data-e="p" aria-label="0.1 kg more">+</button></div><button class="he-pri" data-e="save">Save</button>';
    else if (x.kind === "mood") body = '<p>How has your day been?</p><div class="ccf-faces">' + HE.FACES.map(function (f) { return '<button class="ccf-face' + (A.face === f[0] ? " on" : "") + '" data-f="' + f[0] + '" aria-label="' + f[0] + '"><span>' + f[1] + '</span>' + f[0] + '</button>'; }).join("") + '</div>';
    else if (x.kind === "meal") body = '<div class="ccf-chips">' + ["As planned", "Smaller portion", "Bigger portion"].map(function (c) { return '<button class="he-chip" data-c="' + c + '">' + c + '</button>'; }).join("") + '</div>' +
      '<input type="text" placeholder="Or say what you had" aria-label="What you had"><button class="he-pri" data-e="meal">Save</button>';
    else body = '<div class="ccf-sh"><button class="he-pri" data-e="on">I did this</button><button class="he-sec" data-e="off">' + (r.det ? "That wasn’t me" : "Not yet") + '</button></div>';
    var chip = "", sleep = A.sleep || 410, kg = A.kg;
    ph.sheet(title, '<div class="ccf-sh">' + body + '</div>', function (e) {
      var f = e.target.closest("[data-f]"); if (f) { A.face = f.dataset.f; return save(true); }
      var c = e.target.closest("[data-c]");
      if (c) { chip = chip === c.dataset.c ? "" : c.dataset.c; [].forEach.call(ph.el.querySelectorAll(".ccf-chips .he-chip"), function (b) { b.classList.toggle("on", b.dataset.c === chip); }); return; }
      var b = e.target.closest("[data-e]"); if (!b) return;
      var k = b.dataset.e, v = ph.el.querySelector(".he-sheet .v");
      if (k === "m" || k === "p") {
        if (x.kind === "sleep") { sleep = Math.max(180, Math.min(720, sleep + (k === "p" ? 15 : -15))); v.textContent = hm(sleep); }
        else { kg = Math.round((kg + (k === "p" ? .1 : -.1)) * 10) / 10; v.innerHTML = kg.toFixed(1) + "<small>kg</small>"; }
        return;
      }
      if (k === "save") { if (x.kind === "sleep") A.sleep = sleep; else A.kg = kg; A.edit[x.id] = 1; return save(true); }
      if (k === "meal") {
        var t = ph.el.querySelector(".he-sheet input").value.trim();
        A.edit[x.id] = x.t + ": " + (t ? lc(t) : chip && chip !== "As planned" ? lc(chip) + " of " + lc(x.sub.split(",")[0]) : lc(x.sub.split(",")[0]));
        return save(true);
      }
      save(k === "on");
    }, sub);
  }

  /* earlier items still open: tick and log them from a sheet */
  function leftSheet(ph, A, left) {
    var on = {};
    function list() { return left.map(function (x) { return rowHtml({ id: x.id, p: x.p, say: x.t, src: "Your plan, " + HE.clock(x.at), on: !!on[x.id] }); }).join(""); }
    function btn() { var k = Object.keys(on).length; return '<button class="he-pri" data-go="1"' + (k ? "" : " disabled") + ' style="margin-top:8px">' + (k ? "Log " + k : "Tick what you’ve done") + '</button>'; }
    ph.sheet("Still open from earlier", '<div class="ccf-sh"><div class="ccf-rows" style="margin:0">' + list() + '</div><div class="ccf-act">' + btn() + '</div></div>', function (e) {
      var r = e.target.closest("[data-r]");
      if (r) {
        var id = r.dataset.r; if (on[id]) delete on[id]; else on[id] = 1;
        r.classList.toggle("on", !!on[id]); r.setAttribute("aria-checked", !!on[id]);
        ph.el.querySelector(".he-sheet .ccf-act").innerHTML = btn(); return;
      }
      if (e.target.closest("[data-go]")) {
        var ids = Object.keys(on); if (!ids.length) return;
        ph.log(ids, { how: "caught up" });
      }
    }, "Tick the ones you did");
  }

  HE.add({
    id: "confirm", name: "We noticed", rec: false,
    pitch: "The app does the work and you confirm. Each part of the day gets one card of what your ring, scale and phone already saw, plus what the plan expects now, and one button logs the lot.",
    how: [
      "Home opens on This morning: sleep, weight and steps are already ticked, with where each came from.",
      "Breakfast from the plan sits unticked; tap it once you’ve had it.",
      "Tap Looks right, log 4: one green moment for the whole stack.",
      "Not quite right? Change something opens a sheet to fix the sleep, a meal or anything else.",
      "The card folds to All in for this morning, with This afternoon waiting faintly below."
    ],
    score: [["The right thing now", "y"], ["Answer where you are", "y"], ["Pillars in view", "m"], ["GoodFlip look", "y"], ["KAIRA carries insight", "m"]],
    catch: "It is only as good as the data behind it: without a ring, scale or Apple Health it falls back to a plain checklist of the plan. Pre-ticked rows also risk people tapping through without reading.",
    from: "Oura’s Confirm yesterday’s activities, Bevel’s What happened last night?, Visible’s morning and evening check-ins, our own stacking bar in Eat, Move and Mind.",
    tryit: "Tick Breakfast, tap Looks right, log 4; then try Change something, and switch to Evening or Night.",
    effort: "Medium, needs device data plumbed per row",
    draw: draw
  });
})();
