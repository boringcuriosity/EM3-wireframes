/* Mind: the line under the Rhythm score after a log, and the KAIRA analysis behind it, built as Move's Momentum
   (move/momentum-pick.js for the fixed lines, move/kaira-sheet.js for the sheet).
     MDSAY.line(d, n, cause)  the card's fixed sentence for a gain: only the % changes. The delta wears score-say.js's
                              green capsule ("added 8%" and "went up by 8%" both match its pattern)
     MDKAIRA.PROMPT           the system prompt for the live AI (also in v7/coach-mind/mind-plan-defaults.md)
     MDKAIRA.context(c)       the JSON the app sends with each request, from the live plan and score
     MDKAIRA.sample(c)        what the prototype shows until the AI is live: the same shape the AI must write
   Tapping the card (or Learn more on it) opens KAIRA analysis: a shimmer first, then the note.
   ?kaira=1 opens the sheet by itself once the line has landed (for v7/mind-rhythm.html). */
(function () {
  var M = window.MDPLAN; if (!M) return;
  var P = M.P, S = M.S, Q = new URLSearchParams(location.search);

  /* ---------- the card: one fixed sentence per cause ---------- */
  var LINES = {
    sleep: ["Last night’s sleep added N%.", "A steady night is the base of your Rhythm."],
    wd: ["Your wind-down added N%.", "Small steps in the evening help you sleep steady."],
    br: ["Your breathing added N%.", "A few slow breaths help your body settle."],
    me: ["Your me-time added N%.", "Time for yourself keeps stress low."],
    mood: ["Your mood check-in added N%.", "Naming how you feel helps you understand your day."],
    any: ["Your Rhythm went up by N%.", "Every small step keeps your Rhythm steady."]
  };
  function line(d, n, cause) {
    var was = n - d, L = LINES[cause] || LINES.any;
    var c = n >= 100 && was < 100 ? { lead: "You reached 100% Rhythm!", rest: "You looked after your night and your day.", delta: "" }
      : n >= 80 && was < 80 ? { lead: "You’ve earned today’s medal!", rest: "Your Rhythm went up by " + d + "%. Well done." }
      : { lead: L[0].replace("N", d), rest: L[1] };
    if (c.delta === undefined) c.delta = "+" + d + "%";
    c.tone = "up"; c.cta = "Learn more";
    c.mdk = { cause: cause, d: d, n: n, was: was };
    return c;
  }

  /* ---------- what is still open today, and what each would add ---------- */
  var W = function () {
    var has = { wd: P.wd.length, br: P.br.length, me: P.me.length }, sum = 0;
    Object.keys(P.w).forEach(function (k) { if (!(k in has) || has[k]) sum += P.w[k]; });
    return function (k, of) { return Math.round(P.w[k] / (of || 1) / sum * 100); };
  };
  function slots() { return [P.moodAt, P.moodAt2].filter(Boolean); }
  function plan() {
    var w = W(), L = [], me = P.me.filter(function (x, j) { return S.me[j]; }).length > 0, sl = slots();
    L.push({ kind: "sleep", name: "Last night’s sleep", time: M.niceS(P.bed) + " to " + M.niceS(P.wake), m: 0, done: M.logged(), adds: w("hours") + w("window") });
    P.wd.forEach(function (x, i) { L.push({ kind: "wd", name: x.t, time: M.niceS(x.at), m: M.mins(x.at), done: !!S.wd[i], adds: w("wd", P.wd.length) }); });
    P.br.forEach(function (x, i) { var at = x.at || "13:00"; L.push({ kind: "br", name: x.n + ", " + x.min + " min", time: M.niceS(at), m: M.mins(at), done: !!S.br[i], adds: w("br", P.br.length) }); });
    if (P.me.length) { var at = P.me[0].at || "18:00"; L.push({ kind: "me", name: P.me.length === 1 ? P.me[0].t : "Something for yourself", time: M.niceS(at), m: M.mins(at), done: me, adds: w("me") }); }
    var n = S.vm ? S.vmSlots || 1 : 1;
    (S.vm ? sl.slice(0, n) : sl.slice(0, 1)).forEach(function (at, i) {
      L.push({ kind: "mood", name: (M.mins(at) < 720 ? "Morning" : "Evening") + " mood check-in", time: M.niceS(at), m: M.mins(at), done: S.vm ? !!S.vm[i] : S.mood >= 0, adds: w("mood", n) });
    });
    return L;
  }
  /* best next: an unlogged night first (it carries the most), then what comes up soonest from now, then what was missed earlier */
  function next(score) {
    var now = M.now * 60;
    return plan().filter(function (x) { return !x.done && x.adds > 0; }).sort(function (a, b) {
      var ka = a.kind === "sleep" ? -1 : a.m >= now - 60 ? a.m : 2000 + a.m, kb = b.kind === "sleep" ? -1 : b.m >= now - 60 ? b.m : 2000 + b.m;
      return ka - kb;
    }).slice(0, 2).map(function (x) {
      return { action: x.kind === "sleep" ? "Log last night’s sleep" : x.name, kind: x.kind, time: x.kind === "sleep" ? "" : x.time, adds: x.adds, score_after: Math.min(100, score + x.adds) };
    });
  }

  /* ---------- the request: the facts the AI is given, and nothing more ---------- */
  var KIND = { sleep: "Last night’s sleep", wd: "Wind-down task", br: "Breathing", me: "Me-time", mood: "Mood check-in" };
  function night() {
    if (!M.logged()) return { logged: false, target_hours: P.hours, plan_bedtime: M.niceS(P.bed), plan_wake: M.niceS(P.wake) };
    var slept = (S.segs ? S.segs.reduce(function (t, x) { return t + x.wake - x.bed; }, 0) : S.wake - S.bed) / 60;
    var db = S.bed - M.bedM(P.bed), dw = S.wake - M.wakeM(P.wake), off = Math.abs(db) >= Math.abs(dw) ? db : dw;
    return { logged: true, slept_hours: Math.round(slept * 10) / 10, target_hours: P.hours, bedtime: M.nice(S.bed), plan_bedtime: M.niceS(P.bed),
      wake: M.nice(S.wake), plan_wake: M.niceS(P.wake), window: Math.abs(off) <= P.tol ? "on time" : Math.round(Math.abs(off)) + " min " + (off > 0 ? "late" : "early") };
  }
  function context(c) {
    var R = window.MDRHYTHM, p = R ? R.parts() : {}, list = plan();
    var just = c.cause && c.cause !== "sleep" ? list.filter(function (x) { return x.kind === c.cause && x.done; }).pop() : null;
    return {
      user_state: M.free ? "free" : M.noplan ? "waiting_for_plan" : "plan",
      time_now: M.nice(M.now * 60),
      just_logged: { kind: KIND[c.cause] || "Something in the plan", name: c.cause === "sleep" ? "Last night’s sleep" : just ? just.name : "" },
      score_before: c.was, score_now: c.n, change: c.d,
      medal: c.n >= 80 && c.was < 80 ? "just earned" : c.was >= 80 ? "earned earlier today" : "not yet",
      last_night: night(),
      sleep_parts: { hours: Math.round((p.hours || 0) * 100) + "% of full", window: Math.round((p.window || 0) * 100) + "% of full" },
      coach_targets: { sleep_hours: P.hours, bedtime: M.niceS(P.bed), wake: M.niceS(P.wake), wind_down_tasks: P.wd.length, breathing: P.br.length,
        me_time: P.me.length ? "any one" : "none", mood_checkins: slots().length },
      plan_items: list.filter(function (x) { return x.kind !== "sleep"; }).map(function (x) { return { kind: KIND[x.kind], name: x.name, time: x.time, done: x.done, adds: x.done ? 0 : x.adds }; }),
      next_best: next(c.n)
    };
  }

  /* ---------- the sample note, until the AI is live: the format the prompt asks for ---------- */
  var TITLE = { sleep: "Last night is in.", wd: "Your wind-down counted.", br: "That breathing counted.", me: "Your me-time counted.", mood: "Thanks for checking in." };
  function why(c, x) {
    var g = "+" + c.d + "%";
    if (c.cause === "sleep") {
      var p = window.MDRHYTHM.parts(), n = x.last_night;
      return p.hours >= .99 && p.window >= .99 ? "You slept your full hours, close to your planned times, so last night added " + g + "."
        : p.window >= .99 ? "You were in bed on time but slept " + n.slept_hours + " of your " + n.target_hours + " hours, so last night added " + g + "."
        : p.hours >= .99 ? "You got your hours, but your night was " + n.window + " against your plan, so it added " + g + "."
        : "Last night was shorter and " + n.window + " against your plan, so it added " + g + ". Tonight is a fresh start.";
    }
    if (c.cause === "wd") return "You ticked “" + x.just_logged.name + "”, a small step that helps your body get ready for sleep, so it added " + g + ".";
    if (c.cause === "br") return "Slow breathing helps your body settle, and " + (x.just_logged.name.split(",")[0] || "it") + " added " + g + " to your Rhythm.";
    if (c.cause === "me") return "Making time for something you enjoy helps keep stress in check, and it added " + g + ".";
    if (c.cause === "mood") return "Checking in counts whatever you feel, and noticing your mood helps you spot what lifts your day. It added " + g + ".";
    return "That step added " + g + " to your Rhythm.";
  }
  function sample(c) {
    var x = context(c), top = c.n >= 100 ? "You reached 100% Rhythm!" : x.medal === "just earned" ? "Today’s medal is yours!" : TITLE[c.cause] || "Your Rhythm went up.";
    var md = "**" + top + "**\n\n" + why(c, x);
    if (c.n >= 100) return md + "\n\nRest well tonight. Tomorrow starts fresh.";
    var nb = x.next_best;
    md += "\n\n**What helps next**\n";
    if (!nb.length) return md + "- Bed close to " + M.niceS(P.bed) + " tonight sets up tomorrow’s Rhythm";
    return md + nb.map(function (s) {
      return "- " + (s.kind === "sleep" ? "Log last night’s sleep" : s.kind === "mood" ? "Your " + s.action.toLowerCase().replace(" mood check-in", " check-in") + " at " + s.time
        : s.kind === "br" ? s.action.split(",")[0] + " at " + s.time : s.action + " at " + s.time) + ", **+" + s.adds + "%**";
    }).join("\n");
  }

  /* ---------- the prompt, for when KAIRA is live ---------- */
  var PROMPT = [
    "You are KAIRA, the voice behind “Learn more” under GoodFlip’s Rhythm score on the Mind screen. Rhythm shows how well someone looked after their night and their day, against the plan their Mind coach set. They just saw the score go up after logging something, and tapped the card. Tell them, like a warm friend who happens to be a good coach, why it moved and what to do next.",
    "",
    "WHO YOU ARE TALKING TO",
    "People in India working on their metabolic health with a coach. Many are busy, some are older or unwell, many are new to apps. Plain, warm British or Indian English.",
    "",
    "HOW RHYTHM WORKS (for you to understand; never explain the maths)",
    "Out of 100, fresh each morning. Sleep counts most: hours against the coach’s target, and bedtime and wake time against the coach’s window. Then wind-down tasks, breathing, me-time (any one task is enough) and mood check-ins (checking in counts, the answer never does). Logging never lowers the score. 80% earns the day’s medal.",
    "",
    "WHAT THE APP SENDS YOU",
    "One JSON object: user_state, time_now, just_logged, score_before, score_now, change, medal, last_night (slept_hours, target_hours, bedtime, plan_bedtime, wake, plan_wake, window), sleep_parts, coach_targets, plan_items (kind, name, time, done, adds) and next_best (action, time, adds, score_after, best first).",
    "Every number is final. Never calculate, round or invent a number. Use only numbers you were given. just_logged is the only reason for the change.",
    "",
    "WHAT TO WRITE",
    "Markdown, under 60 words in all:",
    "**A short bold opening of 2 to 5 words**",
    "",
    "One sentence on why the score moved, naming what they logged and the change as +N%.",
    "",
    "**What helps next**",
    "- One or two points, taken from next_best in that order: the action, its time, and what it adds as +N%.",
    "If score_now is 100, skip What helps next and end with one line about resting well. If medal is “just earned”, open with pride in the medal. If next_best is empty, give one point about tonight’s bedtime from coach_targets.",
    "",
    "VOICE",
    "Second person, warm, specific, never guilty. At most one exclamation mark. Never recap their day or list what they already did; every line must tell them something. No medical claims, no diagnosis, no promises about sugar, weight or illness; “helps you settle” and “helps you get ready for sleep” are fine. Never comment on what mood they picked, only that they checked in. If last_night was short or late, be kind and point to tonight.",
    "Never use these words: points, weights, algorithm, percentage of full, parts. Say “KAIRA” in capitals if you name yourself. No em dashes; use a comma or a full stop. Use the curly apostrophe ’."
  ].join("\n");

  window.MDSAY = { line: line };
  window.MDKAIRA = { PROMPT: PROMPT, context: context, sample: sample, next: next };

  /* ---------- the sheet: Learn more, or a tap anywhere on the card ---------- */
  var cur = null;
  function open(c) {
    if (!c || !c.mdk || !window.KairaSheet) return;
    /* ponytail: the prototype answers from sample(); the live app posts PROMPT and context(c.mdk) and shows the reply in the same sheet */
    window.KairaSheet.open(sample(c.mdk));
  }
  window.SAY_OPEN = function (s) { open(s && s.mdk ? s : cur); };
  var st = document.createElement("style");
  st.textContent = "#cm.tap .in{cursor:pointer;transition:background .2s ease-out}#cm.tap .in:active{background:#F2F4F7}";
  document.head.appendChild(st);
  (function hook(n) {
    if (!window.GFSay || !window.GFSay.show) { if (n < 40) setTimeout(function () { hook(n + 1); }, 100); return; }
    var show = window.GFSay.show;
    window.GFSay.show = function (c) {
      cur = c; show(c);
      var cm = document.getElementById("cm"); if (!cm) return;
      cm.classList.toggle("tap", !!(c && c.mdk));
      var box = cm.querySelector(".in");
      if (box && c && c.mdk) { box.setAttribute("role", "button"); box.tabIndex = 0; box.setAttribute("aria-label", c.lead + " " + c.rest + " Learn more from KAIRA"); }
      if (c && c.mdk && Q.get("kaira") === "1" && !hook.done) { hook.done = 1; setTimeout(function () { open(c); }, 900); }
    };
  })(0);
  document.addEventListener("click", function (e) {
    if (!e.target.closest || !e.target.closest("#cm.tap .in") || e.target.closest(".cta")) return;   /* Learn more itself goes through score-say.js to SAY_OPEN */
    open(cur);
  });
  document.addEventListener("keydown", function (e) {
    if ((e.key === "Enter" || e.key === " ") && e.target.closest && e.target.closest("#cm.tap .in")) { e.preventDefault(); open(cur); }
  });
})();
