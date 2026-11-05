/* Mood check-in variants on the real Mind screen (?vmood=a..e), for research/mood.html.
   One question only, then a reply. Each check-in slot in the coach's plan (?t=t-calm has two) is its own row
   ("mood" and "mood:1") with its own answer. Picking a face is a draft: KAIRA's card shimmers in and answers it,
   and only "Log Mood" stores it, so the score counts it then, the same for any face.
   Doc states: ?mstate=start|happy|low|vlow (a face picked, not logged yet)|change|two|missed|offline, with ?now= for the clock. */
(function () {
  var MD = window.MDPLAN;
  if (!MD) return;
  var Q = MD.Q, P = MD.P, S = MD.S, VAR = (Q.get("vmood") || "a").toLowerCase(), ST = Q.get("mstate") || "start";
  var NOWM = Math.round(MD.now * 60), NOWT = MD.nice(NOWM);
  /* a past day (the date chip's back arrow: ?state=past|missed&date=): its check-ins can still be added, and they count for that day */
  var PAST = /^(past|missed)$/.test(Q.get("state") || "") ? Q.get("date") || "past" : "";
  var DAYN = "That day";
  if (PAST && PAST !== "past") { var dd = PAST.split("-"), dt = new Date(+dd[0], dd[1] - 1, +dd[2]);
    DAYN = "Sun Mon Tue Wed Thu Fri Sat".split(" ")[dt.getDay()] + ", " + dt.getDate() + " " + "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" ")[dt.getMonth()]; }

  var SLOTS = [P.moodAt, P.moodAt2].filter(Boolean).map(function (at) {
    var m = MD.mins(at);
    return { at: at, m: m, name: m < 720 ? "Morning" : m < 1020 ? "Afternoon" : "Evening" };
  });

  /* how each variant asks: [value 0..4, label, face] */
  var F = MD.FACES;
  var SCALE = {
    a: F.map(function (x, i) { return [i, x[0], x[1]]; }),
    b: F.map(function (x, i) { return [i, x[0], x[1]]; }),
    c: F.map(function (x, i) { return [i, x[0], x[1]]; }),
    d: [[0, "Very low"], [1, "Low"], [2, "Okay"], [3, "Good"], [4, "Very good"]],
    e: [[1, "Not great", F[1][1]], [2, "Okay", F[2][1]], [3, "Good", F[3][1]]]
  }[VAR] || [];
  var label = function (f) { var x = SCALE.filter(function (s) { return s[0] === f; })[0]; return x ? x[1] : F[f][0]; };
  var faceOf = function (f) { return F[f][1]; };

  /* what comes back. KAIRA speaks in a, c, d, e; b is a quiet line from the app */
  var LEAD = [
    "I'm sorry today has been this hard, and thank you for telling me. You don't have to fix it all at once.",
    "Thank you for being honest with me. Low days come to everyone, and they do pass.",
    "Okay is a fair answer. Most days are like this, and they still tell us a lot over a few weeks.",
    "Good to hear. What made today good? Noticing it makes it easier to have more days like this.",
    "That's lovely to hear. Hold on to what went right today, it's worth doing again."
  ];
  /* on a past day, the same replies about that day */
  var PLEAD = [
    "I'm sorry that day was this hard, and thank you for telling me. Hard days pass, and you got through this one.",
    "Thank you for being honest with me. Low days come to everyone, and they do pass.",
    "Okay is a fair answer. Most days are like this, and they still tell us a lot over a few weeks.",
    "Good to hear. What made that day good? Noticing it makes it easier to have more days like it.",
    "That's lovely to hear. Hold on to what went right that day, it's worth doing again."
  ];
  if (PAST) LEAD = PLEAD;
  /* what to do, on a low answer only: plain and general, never a card to act on */
  var DO = [
    "When you're ready, five minutes of slow breathing settles your body first, and the mind often follows.",
    "Something small you enjoy, a song, a short walk or a call with someone you love, can lift a low day sooner than waiting it out."
  ];
  var QLEAD = ["Sorry today is hard.", "Thank you for telling us.", "Thank you. Okay days count too.", "Good to hear. Notice what made it good.", "Lovely. Notice what went right today."];
  var QDO = ["A few slow breaths can help your body settle.", "Something small you enjoy can lift a low day."];

  /* today's answers, one per slot */
  var VM = S.vm = [null, null]; S.vmSlots = SLOTS.length;   /* rhythm.js: each check-in earns its share of the mood points */
  var cur = 0, OFF = ST === "offline", err = false, sel = null, sl = null, wait = false, PRE = null;
  function put(i, f, at) { VM[i] = { f: f, at: at || NOWT }; }
  var lowF = VAR === "e" ? 1 : 1, vlowF = VAR === "e" ? 1 : 0;
  PRE = ST === "happy" ? 3 : ST === "low" ? lowF : ST === "vlow" ? vlowF : null;   /* picked, not logged yet */
  if (ST === "change") put(0, 3, "1:06 PM");
  if (ST === "two") { put(0, 3, "1:06 PM"); if (SLOTS[1]) put(1, lowF, "8:34 PM"); }
  sync();

  /* doc-only URL hooks for v7/mind-rhythm.html; with none of these in the URL nothing here runs.
     ?me=<label>&meat=HH:MM  a me-time activity, as the coach portal would type it (the templates leave it blank)
     ?done=br:0,wd:0,me:0,mood  rows already done when the screen opens (mood logs Good at ?now=)
     ?act=br:0|wd:0|me:0|mood  one row done 1.6 s after the screen settles, so the score and the line under it move
     ?mpick=0..4  the face picked when the check-in opens; ?mwait=1 holds KAIRA's shimmer; ?merr=1 shows the could-not-log line */
  if (Q.get("me") && !P.me.length) P.me.push({ t: Q.get("me"), d: "", at: Q.get("meat") || "18:00" });
  var doc = function (key) {
    var q = key.split(":");
    if (q[0] === "mood") { var si = +q[1] || 0; if (SLOTS[si]) put(si, 3, NOWT); sync(); return; }
    if (S[q[0]] && P[q[0]] && P[q[0]][+q[1] || 0]) S[q[0]][+q[1] || 0] = true;
  };
  (Q.get("done") || "").split(",").filter(Boolean).forEach(doc);
  if (Q.get("act")) setTimeout(function () { doc(Q.get("act")); MD.cause = Q.get("act").split(":")[0]; MD.render(); }, 1600);
  var MPICK = Q.get("mpick") != null ? +Q.get("mpick") : null, MWAIT = Q.get("mwait") === "1", MERR = Q.get("merr") === "1";

  function sync() { var a = VM.filter(Boolean); S.mood = a.length ? a[a.length - 1].f : -1; }

  /* ---------- the rows on the plan ---------- */
  function rowD(i) {
    var a = VM[i], s = SLOTS[i];
    if (a) return (VAR === "d" ? "" : faceOf(a.f) + " ") + label(a.f) + (a.late ? ", added later" : ", at " + a.at);
    if (PAST) return "Not logged. You can still add it";
    if (NOWM > s.m + 120) return "You can still check in today";
    return "How are you feeling? Takes a few seconds";
  }
  function items(L) {
    L = L.filter(function (x) { return x.sheet !== "mood"; });
    SLOTS.forEach(function (s, i) {
      L.push({ m: s.m + 1, sheet: i ? "mood:" + i : "mood", on: !!VM[i], t: "Mood check-in", d: rowD(i), at: MD.niceS(s.at) });
    });
    return L;
  }

  /* KAIRA's reply to the face picked: a shimmer first, as if she is reading it, then the words */
  function reply(f) {
    var txt = VAR === "b" ? QLEAD[f] + (f <= 1 ? " " + QDO[f] : "") : LEAD[f] + (f <= 1 ? " " + DO[f] : "");
    if (VAR === "b") return wait ? '<div class="vm-q-sh" aria-hidden="true"><i></i><i></i></div>' : '<p class="vm-quiet" aria-live="polite">' + txt + '</p>';
    var mark = window.GFKaira && GFKaira.mark ? GFKaira.mark(20, { halo: false }) : '<i class="vm-dot"></i>';
    return '<div class="vm-k' + (wait ? " wait" : "") + '"><div class="vm-kw">' + mark + 'KAIRA</div>' +
      (wait ? '<div class="vm-sh" aria-hidden="true"><i></i><i></i><i></i></div>' : '<p aria-live="polite">' + txt + '</p>') + '</div>';
  }
  function errLine() { return err ? '<div class="vm-err" role="alert"><span>Could not log your mood. Check your internet and try again.</span></div>' : ""; }
  function ask(a) {
    if (VAR === "c") {
      var v = sl != null ? sl : sel != null ? sel * 25 : null, f = v == null ? 2 : Math.min(4, Math.round(v / 25));
      return '<div class="vm-sl"><div class="vm-big' + (v == null ? " blank" : "") + '" aria-hidden="true">' + faceOf(f) + '</div><div class="vm-word">' + (v == null ? "Drag to the closest" : label(f)) + '</div>' +
        '<input type="range" min="0" max="100" step="1" value="' + (v == null ? 50 : v) + '" data-vmsl="1" aria-label="How are you feeling, from awful to great" aria-valuetext="' + (v == null ? "Not set" : label(f)) + '">' +
        '<div class="vm-ends"><span>Awful</span><span>Great</span></div></div>';
    }
    if (VAR === "d") return '<div class="vm-words" role="group" aria-label="How are you feeling?">' + SCALE.map(function (s) {
      var on = sel === s[0]; return '<button class="vm-wd' + (on ? " on" : "") + '" data-vmf="' + s[0] + '" aria-pressed="' + on + '">' + s[1] + '</button>'; }).join("") + '</div>';
    return '<div class="vm-faces' + (VAR === "e" ? " three" : "") + (sel != null ? " picked" : "") + '" role="group" aria-label="How are you feeling?">' + SCALE.map(function (s) {
      var on = sel === s[0]; return '<button class="vm-face' + (on ? " on" : "") + '" data-vmf="' + s[0] + '" aria-pressed="' + on + '"><span aria-hidden="true">' + s[2] + '</span>' + s[1] + '</button>'; }).join("") + '</div>';
  }
  function body() {
    var a = VM[cur], s = SLOTS[cur], same = a && sel === a.f;
    var h = '<div class="vm-top"><div class="vm-slot">' + (PAST ? DAYN + ", " + s.name.toLowerCase() : s.name) + " check-in, " + MD.niceS(s.at) + '</div><div class="vm-hint">' +
      (PAST ? "Pick the one closest to how you felt then. It still counts for that day." : "Pick the one closest to how you feel. Every check-in counts the same.") + '</div></div>' + ask(a);
    if (sel != null) h += reply(sel);
    h += errLine() + (same && !err ? '<button class="md-save" data-vmdone="1">Done</button>'
      : '<button class="md-save" data-vmlog="1"' + (sel == null || wait ? " disabled" : "") + '>' + (err ? "Try Again" : "Log Mood") + '</button>');
    return '<div class="vm">' + h + '</div>';
  }
  function draw() { window.GFOpenSheet("vmMood", PAST ? "How did you feel?" : "How are you feeling?", body()); }
  var RM = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches, TW = null;
  function choose(f) {
    if (sel === f && !err) return;
    sel = f; err = false; clearTimeout(TW);
    wait = !RM; draw();
    if (wait) TW = setTimeout(function () { wait = false; draw(); }, 900);
  }
  function log() {
    if (sel == null) return;
    if (OFF) { OFF = false; err = true; return draw(); }   /* ponytail: the first try fails in the offline state, the retry goes through */
    var old = VM[cur];   /* changing the face keeps the time it was first logged */
    VM[cur] = { f: sel, at: old ? old.at : NOWT, late: old ? old.late : !!PAST }; err = false;
    sync(); MD.cause = "mood"; if (window.closeSheets) window.closeSheets(); MD.render();
    MD.toast(old ? "Mood updated." : PAST ? "Mood added. It counts for that day." : "Mood logged. Thank you for checking in.");
  }

  document.addEventListener("click", function (ev) {
    var t = ev.target.closest("[data-vmf],[data-vmlog],[data-vmdone]");
    if (!t) return;
    var d = t.dataset;
    if (d.vmf != null) return choose(+d.vmf);
    if (d.vmlog) return log();
    if (d.vmdone && window.closeSheets) window.closeSheets();
  });
  document.addEventListener("change", function (ev) {
    if (!ev.target.matches || !ev.target.matches("[data-vmsl]")) return;
    sl = +ev.target.value; choose(Math.min(4, Math.round(sl / 25)));
  });
  document.addEventListener("input", function (ev) {
    if (!ev.target.matches || !ev.target.matches("[data-vmsl]")) return;
    var f = Math.min(4, Math.round(+ev.target.value / 25)), box = ev.target.closest(".vm-sl");
    box.querySelector(".vm-big").textContent = faceOf(f); box.querySelector(".vm-big").classList.remove("blank");
    box.querySelector(".vm-word").textContent = label(f);
    ev.target.setAttribute("aria-valuetext", label(f));
  });

  var css = document.createElement("style");
  css.textContent = [
    ".vm{display:flex;flex-direction:column;gap:16px;padding-top:4px}",
    ".vm-top{display:flex;flex-direction:column;gap:4px}",
    ".vm-slot{font:500 12px/16px Roboto,sans-serif;color:var(--g-500,#667085)}",
    ".vm-hint{font-size:13px;line-height:19px;color:var(--g-600,#475467)}",
    ".vm-faces{display:flex;gap:6px}",
    ".vm-face{flex:1;min-width:0;min-height:84px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;border:1px solid transparent;border-radius:16px;background:var(--g-50,#F9FAFB);padding:12px 0 10px;font:500 12px/14px Roboto,sans-serif;color:var(--g-600,#475467);cursor:pointer;transition:opacity .3s cubic-bezier(.4,0,.2,1),background .3s cubic-bezier(.4,0,.2,1),border-color .3s cubic-bezier(.4,0,.2,1)}",
    ".vm-face span{font-size:32px;line-height:1;transition:transform .3s cubic-bezier(.4,0,.2,1)}",
    ".vm-faces.picked .vm-face:not(.on){opacity:.5}.vm-faces.picked .vm-face:not(.on):hover{opacity:.85}",
    ".vm-face.on span{transform:scale(1.12)}",
    ".vm-faces.three .vm-face{min-height:84px;font-size:14px}.vm-faces.three .vm-face span{font-size:32px}",
    ".vm-face.on,.vm-wd.on{border-color:var(--p-600,#299D6B);background:var(--p-25,#F3FCF8);color:var(--p-700,#2A805A);font-weight:700}",
    ".vm-words{display:flex;flex-wrap:wrap;gap:8px}",
    ".vm-wd{min-height:44px;padding:0 14px;border-radius:999px;border:1px solid var(--g-200,#E4E7EC);background:#fff;font:500 14px Roboto,sans-serif;color:var(--g-700,#344054);cursor:pointer}",
    ".vm-sl{display:flex;flex-direction:column;align-items:center;gap:6px}",
    ".vm-big{font-size:52px;line-height:60px}.vm-big.blank{opacity:.35;filter:grayscale(1)}",
    ".vm-word{font:600 17px/24px Roboto,sans-serif;color:var(--g-900,#101828);min-height:24px}",
    ".vm-sl input{width:100%;height:44px;margin:0;accent-color:var(--p-600,#299D6B)}",
    ".vm-ends{width:100%;display:flex;justify-content:space-between;font:500 11px/16px Roboto,sans-serif;letter-spacing:.04em;text-transform:uppercase;color:var(--g-500,#667085)}",
    ".vm-err{display:flex;align-items:center;gap:10px;padding:12px;border-radius:12px;background:#FEF3F2;border:1px solid #FECDCA;font-size:13px;line-height:19px;color:#B42318}",
    ".vm-k{padding:14px 16px 16px;border-radius:16px;background:linear-gradient(180deg,#EEF4FF 0%,#F8FAFF 100%);border:1px solid var(--in-100,#E0EAFF);min-height:96px;animation:vmIn .4s cubic-bezier(.4,0,.2,1) both}",
    ".vm-sh{display:flex;flex-direction:column;gap:8px;padding:4px 0 2px}.vm-sh i,.vm-q-sh i{display:block;height:10px;border-radius:6px;background:linear-gradient(90deg,#E0EAFF 0%,#F5F8FF 40%,#E0EAFF 80%);background-size:200% 100%;animation:vmSh 1.1s linear infinite}",
    ".vm-sh i:nth-child(2){width:88%}.vm-sh i:nth-child(3){width:56%}",
    ".vm-q-sh{display:flex;flex-direction:column;gap:8px}.vm-q-sh i{background:linear-gradient(90deg,#F2F4F7 0%,#F9FAFB 40%,#F2F4F7 80%);background-size:200% 100%}.vm-q-sh i:nth-child(2){width:64%}",
    ".vm-k p{animation:vmIn .4s cubic-bezier(.4,0,.2,1) both}",
    "@keyframes vmSh{from{background-position:100% 0}to{background-position:-100% 0}}",
    ".vm-k p{margin:0;font-size:15px;line-height:23px;color:var(--g-800,#1D2939);text-wrap:pretty}",
    ".vm-kw{display:flex;align-items:center;gap:6px;margin-bottom:6px;font:700 11px/16px Roboto,sans-serif;letter-spacing:.08em;color:var(--in-700,#3538CD)}",
    ".vm-dot{width:14px;height:14px;border-radius:50%;background:linear-gradient(135deg,#444CE7,#E7C144)}",
    ".vm-quiet{margin:0;font-size:14px;line-height:21px;color:var(--g-700,#344054);animation:vmIn .4s cubic-bezier(.4,0,.2,1) both}",
    "@keyframes vmIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}",
    "@media (prefers-reduced-motion: reduce){.vm-k,.vm-k p,.vm-quiet{animation:none}.vm-face,.vm-wd{transition:none}}"
  ].join("");
  document.head.appendChild(css);

  window.MDVAR = {
    open: { mood: function (o) { cur = o === "mood:1" && SLOTS[1] ? 1 : 0; err = false; sl = null; wait = false;
      sel = VM[cur] ? VM[cur].f : PRE; PRE = null;
      if (MPICK != null) { sel = MPICK; MPICK = null; }   /* doc hooks, see above */
      if (MWAIT) { wait = true; MWAIT = false; }
      if (MERR) { err = true; OFF = false; MERR = false; }
      draw(); return true; } },
    items: items
  };
  MD.render();
})();
