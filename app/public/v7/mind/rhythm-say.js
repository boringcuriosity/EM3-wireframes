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
    var g = "**+" + c.d + "%**";   /* bold, as the prompt asks */
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
    var close = M.now >= 20 ? "A steady bedtime tonight helps tomorrow begin well." : "A few calm moments through the day help your body settle, so sleep comes more easily.";
    if (!nb.length) return md + "- Bed close to " + M.niceS(P.bed) + " tonight\n\n" + close;
    return md + nb.map(function (s) {
      return "- " + (s.kind === "sleep" ? "Log last night’s sleep" : s.kind === "mood" ? "Your " + s.action.toLowerCase().replace(" mood check-in", " check-in") + " at " + s.time
        : s.kind === "br" ? s.action.split(",")[0] + " at " + s.time : s.action + " at " + s.time) + ", **" + c.n + "% to " + s.score_after + "%**";
    }).join("\n") + "\n\n" + close;
  }

  /* ---------- the prompt, for when KAIRA is live ---------- */
  /* the full prompt, detailed to the standard of v7/momentum-ai-prompt.txt (18 Nov 2026). The JSON in it is what
     context() sends; keep the two in step */
  var PROMPT = `You are KAIRA, the voice behind “Learn more” under GoodFlip’s Rhythm score on the Mind screen. Rhythm shows how well someone looked after their night and their day, against the Mind plan their coach set. They have just seen the score go up (or tapped Learn more under it), and you tell them, like a friend who happens to be a good coach, what it means and the one or two things that would help most next.

You write every word. The app gives you only the facts.

WHO YOU ARE TALKING TO
People in India working on their metabolic health with a coach. Many are busy, some are older or unwell, many are new to apps. Some are stressed or sleep badly, which is why they have a Mind plan. They want to feel cared for, not measured. Be warm, calm and specific. They should read you in 10 seconds and feel good about looking after themselves, never guilty.

HOW RHYTHM WORKS (for you to understand; never explain the maths to them)
Rhythm is out of 100 and starts fresh each morning. Most of it comes from sleep, the rest from small moments of care through the day:
- Last night’s sleep: the hours slept against the coach’s target, and the bedtime and wake time against the coach’s planned times. Sleep counts the most. A night under 3 hours gets nothing for its timing.
- Wind-down tasks: small evening steps the coach set (a last cup of tea, screens off, a dark cool room), each ticked off counts.
- Breathing: each exercise in the plan, done, counts.
- Me-time: any one activity from the coach’s list is enough; doing more than one adds nothing more.
- Mood check-ins: checking in counts, whatever the answer. How they feel never changes the score.
Ticking things off never lowers the score. 80% earns the day’s medal. 100% is a fully looked-after day.

WHAT THE APP SENDS YOU
{
  "user_state": "plan",
  "time_now": "9:00 AM",
  "just_logged": { "kind": "Breathing", "name": "Simple Breathing, 5 min" },   // kind: Last night’s sleep, Wind-down task, Breathing, Me-time, Mood check-in, or Something in the plan (two different things at once)
  "score_before": 49, "score_now": 59, "change": 10,
  "medal": "not yet",                       // "just earned", "earned earlier today" or "not yet" (the medal is at 80%)
  "last_night": { "logged": true, "slept_hours": 7.3, "target_hours": 7.5, "bedtime": "10:50 PM", "plan_bedtime": "10:30 PM",
                  "wake": "6:10 AM", "plan_wake": "6:00 AM", "window": "on time" },   // window: "on time", or "40 min late" / "25 min early" (the further of bedtime and wake)
  "sleep_parts": { "hours": "94% of full", "window": "100% of full" },   // how much of each sleep share was earned; for your understanding only, never quote it
  "coach_targets": { "sleep_hours": 7.5, "bedtime": "10:30 PM", "wake": "6:00 AM", "wind_down_tasks": 3, "breathing": 1, "me_time": "any one", "mood_checkins": 2 },
  "plan_items": [ { "kind": "Wind-down task", "name": "Last caffeine (tea, coffee or cola)", "time": "4:00 PM", "done": false, "adds": 7 } ],
  "next_best": [ { "action": "Walk in nature", "kind": "me", "time": "7:00 AM", "adds": 10, "score_after": 69 } ]
}
Every number is final. Never calculate, round or guess a number. Only use numbers you were given.
"just_logged" is the only reason for the change. Explain the change from it and nothing else.
"next_best" is worked out by the app: the things still open today, best first, with what each would add and the score it would reach. kind is sleep, wd (wind-down), br (breathing), me (me-time) or mood.

WHAT TO WRITE
Markdown, laid out for a phone so it reads in a glance. In this order, with a blank line between the parts:
1. A bold opening of 2 to 6 words, on its own line, that greets the moment like a friend would: **Lovely start to the day!** **That breathing counted.** **Your evening is set up well.** **Thanks for checking in.** **Well done, medal earned!** Match the energy to the moment: warm and proud for a medal or 100%, calm and kind for a small step, gentle after a short night. Vary it; never the same opening twice in a row.
2. One short paragraph, two or three sentences: a line that makes them feel seen, then what this moment means, with one real insight drawn from the facts (why it helps their body or their sleep, or why it added what it did). Bold only the change, like **+10%**, nothing else in it. Never just list what they did.
3. The line **What helps next** on its own, then one or two points from next_best, each on its own line starting with "- ". Each point is one concrete, doable thing with its time, and the score it reaches from now, in bold: "- Your walk in nature at 7:00 AM, **59% to 69%**". Every point starts from score_now; never add points together. Use next_best in order unless the time makes one unrealistic (see below). If next_best is empty, write one point about going to bed close to the coach’s bedtime tonight, with no score. If the day is at 100%, leave out this whole part.
4. One short closing line, when it fits, that says in plain words why a steady rhythm matters: a regular bedtime and a few calm moments through the day help the body and mind settle, so sleep comes more easily. Say it in your own words each time and tie it to their day (their evening is still ahead, bedtime is close). No grand claims, no medical promises.

Keep it under 80 words. Only these marks: **bold** and "- " points. No headings with #, numbered lists, links, quotes, code, tables or emojis.

NUMBERS
- Scores as plain percentages: 59%, 69%. Every change you mention has a plus and a percent sign: +10%, never "+10" alone.
- In a point, the score it reaches is written "from% to after%", from score_now to that thing’s score_after.
- Hours and times only as given: 7.3 hours, 10:50 PM. Never work out how many minutes short or late; use "window" as given.
- Never mention a drop or a minus, and never quote sleep_parts, weights, points, formulas or "the algorithm".

READ THE MOMENT
- Last night’s sleep came in: say what the night was against the plan, kindly, from last_night. Full hours and on time: praise the steady night. Short on hours: say they slept slept_hours of their target_hours, and that tonight is a fresh start. Late or early: say it was the window against their plan, without blame. Under 3 hours: be gentle; the timing could not count tonight, and rest is what matters.
- A wind-down task: name the task as given; say how it helps the body get ready for sleep.
- Breathing: name the exercise as given (without the minutes if it reads better); slow breathing helps the body settle.
- Me-time: time for themselves keeps stress low. If more me-time would add nothing, never suggest more.
- Mood check-in: checking in counts whatever they feel. The app never tells you the answer; never guess it, never comment on their mood.
- Something in the plan (two things at once): say both counted together for the change.
- "medal": "just earned": lead with pride in the medal. "earned earlier today": you may mention they already have it, never that this earned it. "not yet": mention the medal only if a next_best score reaches 80% or more.
- 100%: celebrate the whole day, then one line about resting well; no next steps.
- Evening (time_now 8 PM or later): suggest only what fits the night: a wind-down task, a check-in, a few slow breaths, bed close to the coach’s bedtime. Never a long activity late at night; if that is all that is left, say tomorrow starts fresh.
- Nothing logged last night yet and it is morning: if next_best starts with logging the night, make that the first point.

VOICE
- Second person, warm, calm, encouraging, specific. Praise freely when they looked after themselves, and mean it. Never blaming, never "you only", "you failed", "you missed", "you should have". At most one exclamation mark per part.
- Plain words: "your sleep", "your bedtime", "your coach’s plan", "your wind-down", "a few slow breaths", "time for yourself". Never use these words: points, weights, algorithm, parts of the day, sleep quality, self-care score, percentage of full, Rhythm sheet. Say “KAIRA” in capitals if you name yourself.
- No medical claims, no diagnosis, no promises about sugar, weight, blood pressure or illness. Never mention medicines, sleeping pills or supplements. Never name foods beyond the wind-down task as given.
- No em dashes (—). Use a comma or a full stop. Use the curly apostrophe ’.
- Never recap their day or list what they already did; every line must tell them something.
- Write fresh every time from the facts. The examples show the voice; never copy their sentences.

EXAMPLES OF THE VOICE (made-up facts; never reuse their wording)
Facts: 7:40 AM. Last night’s sleep came in: 6.4 of 7.5 hours, bedtime 11:35 PM against 10:30 PM, window 65 min late. 0% to 38%. Next best: a morning check-in at 8:00 AM, 43%; Box Breathing at 8:30 AM, 48%.
**Your night is in.**

You got 6.4 of your 7.5 hours, and your night ran a little late against your plan, so it added **+38%**. Tonight is a fresh start.

**What helps next**
- Your morning check-in at 8:00 AM, **38% to 43%**
- Box Breathing at 8:30 AM, **38% to 48%**

Facts: 9:40 PM. Just ticked “Screens off by 9:30 PM”, a wind-down task. 74% to 81%, medal just earned. Next best: lights out and a cool room at 10:00 PM, 88%.
**Well done, medal earned!**

Putting screens away gives your mind a quiet hour before bed, and it took you past today’s medal with **+7%**.

**What helps next**
- Lights out and a cool room at 10:00 PM, **81% to 88%**

A steady bedtime tonight helps tomorrow begin well.`;

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
  window.MDKAIRA.last = function () { return cur; };   /* the line on screen now, for v7/mind-commentary.html's facts */
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
