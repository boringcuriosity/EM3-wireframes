/* The line under the score: one short sentence, in a quote card, saying what the last log did to the
   score, with a way to ask KAIRA why. Built from v7/score-commentary.html (the Quote mark variant).
   The case comes from the day's state, or from ?say=<case> (pre, plan, some, double, triple, whole, pizza),
   which also sets the score, the step to it, and the macros and calories under it.
   Not shown where there is no score to talk about: no plan, a free user, a day with nothing logged. */
(function () {
var SC = {
  start: { label: "Not started", state: "empty", score: 0, delta: "0", tone: "calm", lead: "Log your first meal to see your nutrition sufficiency score grow.", rest: "" },
  pre: { label: "Pre-breakfast", state: "empty", score: 1, delta: "+1%", tone: "up", lead: "Your score went up by 1%,", rest: "keep logging your meals.", cta: "Learn more by asking KAIRA" },
  plan: { label: "Breakfast as planned", state: "first", score: 23, delta: "+23%", tone: "up", lead: "Your score went up by 23%,", rest: "keep logging your meals.", cta: "Learn more by asking KAIRA" },
  some: { label: "Only some breakfast", state: "first", score: 9, delta: "+9%", tone: "up", lead: "Your score went up by 9%,", rest: "keep logging your meals.", cta: "Learn more by asking KAIRA" },
  double: { label: "Double breakfast", state: "first", score: 5, delta: "+5%", tone: "down", lead: "Your score went up by only 5%,", rest: "you could have gained 18% more.", cta: "Find out why from KAIRA" },
  triple: { label: "Triple breakfast", state: "empty", score: 0, delta: "0", tone: "down", lead: "Your score did not change,", rest: "you could have gained 23%.", cta: "Find out why from KAIRA" },
  whole: { label: "Whole day at breakfast", state: "empty", score: 0, delta: "0", tone: "down", lead: "Your score did not change,", rest: "you could have gained 23%.", cta: "Find out why from KAIRA" },
  pizza: { label: "Big pizza at lunch", state: "first", score: 9, delta: "\u221214%", tone: "down", lead: "Your score dropped by 14%,", rest: "", cta: "find out why from KAIRA" }
};
/* the day's own states: what the last log of each one did */
SC.first = { state: "first", score: 12, delta: "+12%", tone: "up", lead: "Your score went up by 12%,", rest: "keep logging your meals.", cta: "Learn more by asking KAIRA" };
SC.mid = { state: "mid", score: 54, delta: "+20%", tone: "up", lead: "Your score went up by 20%,", rest: "keep logging your meals.", cta: "Learn more by asking KAIRA" };
SC.full = { state: "full", score: 88, delta: "+4%", tone: "up", lead: "Your score went up by 4%,", rest: "your day is all logged.", cta: "Learn more by asking KAIRA" };
SC.perfect = { state: "perfect", score: 100, delta: "+4%", tone: "up", lead: "Your score went up by 4%,", rest: "every target met today.", cta: "Learn more by asking KAIRA" };
SC.over = { state: "over", score: 92, delta: "+9%", tone: "down", lead: "Your score went up by only 9%,", rest: "you could have gained 18% more.", cta: "Find out why from KAIRA" };
SC.past = { state: "past", score: 61, delta: "", tone: "calm", lead: "This day ended at 61%.", rest: "", cta: "Learn more by asking KAIRA" };
SC.empty = SC.start;
var DAY = { mac: [[0, 95], [0, 238], [0, 63]], kcal: 1900 };
function day(p, c, f) { return [[p, 95], [c, 238], [f, 63]]; }
var BELOW = {
  start:  { mac: day(0, 0, 0), kcal: 0 },
  pre:    { mac: day(1, 3, 3), kcal: 40,
            kaira: "<strong>A light start.</strong> Breakfast carries much more of your score, so a plate with dal, eggs or paneer moves it the most." },
  plan:   { mac: day(22, 55, 14), kcal: 440,
            kaira: "<strong>Breakfast was right on plan.</strong> Lunch carries the biggest share of your score, so keeping it to plan matters most." },
  some:   { mac: day(9, 22, 5), kcal: 165,
            kaira: "<strong>Breakfast was lighter than planned,</strong> mostly short on protein. A little paneer or dal at lunch makes up for it." },
  double: { mac: day(44, 110, 28), kcal: 880,
            kaira: "<strong>Breakfast was about twice the plan,</strong> so most of it went past breakfast's targets. Lunch on plan still adds its full share." },
  triple: { mac: day(66, 165, 42), kcal: 1320,
            kaira: "<strong>Breakfast was about three times the plan,</strong> well past every target. Lunch on plan still adds its full share." },
  whole:  { mac: day(95, 238, 63), kcal: 1900,
            kaira: "<strong>Breakfast held the whole day's food,</strong> far past breakfast's own targets. Meals on plan from here still add their share." },
  pizza:  { mac: day(103, 253, 65), kcal: 2040,
            kaira: "<strong>Lunch went well past plan,</strong> mostly fats and carbs from the pizza. Dinner on plan still adds its full share." }
};
/* What Ask KAIRA opens with. The question is the user's, already sent; the
   answer walks the logic in plain steps: what breakfast is worth, what was
   eaten against the plan, the rule, the result, and what is still open. */
function tg(t, tone) {
  var c = tone === "down" ? "background:#FFFAEB;color:#B54708;box-shadow:inset 0 0 0 1px #FEDF89" : tone === "up" ? "background:#ECFDF3;color:#067647;box-shadow:inset 0 0 0 1px #ABEFC6" : "background:#F2F4F7;color:#475467;box-shadow:inset 0 0 0 1px #E4E7EC";
  return '<span style="display:inline-flex;align-items:center;height:18px;padding:0 5px;border-radius:5px;font:600 11.5px/1 Roboto,sans-serif;font-variant-numeric:tabular-nums;' + c + '">' + t + "</span>";
}
function plate(rows, tone) {
  return '<span style="display:block;margin-top:12px;color:#101828">Resulting macro intake:</span>' +
    '<span style="display:block;margin-top:6px;border-top:1px solid #E0EAFF">' + rows.map(function (r) {
    return '<span style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid #F2F4F7">' +
      '<span style="flex:1;color:#475467">' + r[0] + '</span>' +
      '<span style="font-variant-numeric:tabular-nums;color:#667085"><b style="color:#101828">' + r[1] + 'g</b> / ' + r[2] + 'g</span>' + (r[3] === 1 ? tg("\u2713", "up") : tg(+r[3] < 1 ? Math.round(r[3] * 100) + "%" : "\u00D7" + r[3], tone || "down")) + "</span>";
  }).join("") + "</span>";
}
/* what they had, by name, on the gold arrow KAIRA uses in Trend; anything beyond the plan carries a small Extra tag */
function foods(list) {
  return '<span style="display:block;margin:8px 0 2px">' + list.map(function (f) {
    return '<span style="display:flex;align-items:center;gap:8px;padding:3px 0"><img src="assets/trend-bullet.svg" alt="" width="16" height="16" style="flex:none">' +
      '<span style="flex:1;color:#101828">' + f[0] + "</span>" + (f[1] ? tg("Extra", "down") : "") + "</span>";
  }).join("") + "</span>";
}
var BF = [["2 moong dal cheela"], ["1 bowl curd"]];
var OK = "No worries, keep logging honestly.";
SC.double.ask = {
  q: "Why did my nutrition sufficiency score only go up by +5%? It says I could have gained +18% more. How?",
  a: [
    "You had more than the Eat plan suggested by your coach at breakfast, and the extra held your nutrition sufficiency score back.",
    "Your nutrition sufficiency score went up by only " + tg("+5%", "down") + " because you had:" + foods(BF.concat([["2 aloo parathas with butter", 1], ["1 glass sweet lassi", 1]])) +
      plate([["Protein", 44, 22, 2], ["Carbs", 110, 55, 2], ["Fats", 28, 14, 2]]),
    "A little over your Eat plan still earns full points. Past that, the extra takes points back, so you got " + tg("+5%", "down") + " of a possible " + tg("+23%", "up") + ".",
    OK + " Lunch as per your Eat plan adds its full " + tg("+28%", "up") + "."
  ]
};
/* every meal's share of the day, from the plan's calories */
var SHARES = [["Pre-breakfast", "1%"], ["Breakfast", "23%"], ["Lunch", "28%"], ["Evening snack", "17%"], ["Dinner", "27%"], ["Bedtime", "4%"]];
function shares(mark) {
  return '<span style="display:block;margin-top:8px;border-top:1px solid #E0EAFF">' + SHARES.map(function (r) {
    var on = mark && mark.indexOf(r[0]) > -1;
    return '<span style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid #F2F4F7">' +
      '<span style="flex:1;color:' + (on ? "#101828;font-weight:600" : "#475467") + '">' + r[0] + "</span>" + tg("up to " + r[1], on ? "up" : "calm") + "</span>";
  }).join("") + "</span>";
}
SC.pre.ask = {
  q: "My score went up by +1%. How do I grow it from here?",
  a: [
    "Nice start! You had a light pre-breakfast, just as the Eat plan suggested by your coach:" + foods([["5 soaked almonds"], ["1 glass methi water"]]),
    "Pre-breakfast is a small meal, so it adds a small share, up to " + tg("+1%", "up") + ". Breakfast is next and can add up to " + tg("+23%", "up") + ".",
    "Keep logging honestly, every meal adds up."
  ]
};
SC.plan.ask = {
  q: "My score went up by +23%. What does that mean?",
  a: [
    "Well done! Your breakfast matched the Eat plan suggested by your coach, so it added its full share of " + tg("+23%", "up") + ".",
    "You had:" + foods(BF) + plate([["Protein", 22, 22, 1], ["Carbs", 55, 55, 1], ["Fats", 14, 14, 1]]),
    "Lunch is next and carries the biggest share, up to " + tg("+28%", "up") + ". Keep logging honestly."
  ]
};
SC.some.ask = {
  q: "My score went up by +9%. Could it have been more?",
  a: [
    "You had a lighter breakfast than the Eat plan suggested by your coach, so it added less than it could.",
    "You had:" + foods([["1 moong dal cheela"]]) + "The Eat plan suggested by your coach also had:" + foods([["1 more moong dal cheela"], ["1 bowl curd"]]) +
      plate([["Protein", 9, 22, "0.4"], ["Carbs", 22, 55, "0.4"], ["Fats", 5, 14, "0.4"]], "calm"),
    "That is about 40% of your Eat plan, so you got " + tg("+9%", "up") + " of a possible " + tg("+23%", "up") + ".",
    OK + " Lunch as per your Eat plan adds its full " + tg("+28%", "up") + "."
  ]
};
SC.triple.ask = {
  q: "Why didn't my nutrition sufficiency score change? It says I could have gained +23%.",
  a: [
    "You had a lot more than the Eat plan suggested by your coach at breakfast, so it did not add to your nutrition sufficiency score.",
    "Your nutrition sufficiency score stayed at " + tg("0%", "calm") + " because you had:" + foods(BF.concat([["3 aloo parathas with butter", 1], ["2 glasses sweet lassi", 1]])) +
      plate([["Protein", 66, 22, 3], ["Carbs", 165, 55, 3], ["Fats", 42, 14, 3]]),
    "That much extra used up all of breakfast's points. A breakfast as per your Eat plan would have added " + tg("+23%", "up") + ".",
    OK + " Your next meal as per your Eat plan first makes up a little for this, then each meal adds its full share."
  ]
};
SC.whole.ask = {
  q: "Why didn't my nutrition sufficiency score change? It says I could have gained +23%.",
  a: [
    "You had nearly a whole day's food at breakfast, so it did not add to your nutrition sufficiency score.",
    "Your nutrition sufficiency score stayed at " + tg("0%", "calm") + " because you had:" + foods([["4 aloo parathas with butter", 1], ["2 bowls poha", 1], ["1 glass mango shake", 1], ["2 bananas", 1]]) +
      plate([["Protein", 95, 22, "4.3"], ["Carbs", 238, 55, "4.3"], ["Fats", 63, 14, "4.5"]]),
    "Each meal is scored against its own Eat plan, so a day's worth of food at breakfast counts only towards breakfast.",
    OK + " Meals as per your Eat plan from here each add their share."
  ]
};
SC.pizza.ask = {
  q: "Why did my nutrition sufficiency score drop by 14% after lunch?",
  a: [
    "You had more than the Eat plan suggested by your coach at lunch, and that brought your nutrition sufficiency score down.",
    "Your nutrition sufficiency score dropped by " + tg("\u221214%", "down") + " because you had:" + foods([["1 large paneer pizza", 1], ["Garlic bread with cheese dip", 1], ["1 can cola", 1]]) +
      "The Eat plan suggested by your coach had:" + foods([["1 bowl dal"], ["2 rotis"], ["1 bowl sabzi"]]) + plate([["Protein", 81, 27, 3], ["Carbs", 198, 66, 3], ["Fats", 51, 17, 3]]),
    "A meal that far over takes points back, up to half its share. Lunch's share is 28%, so it took " + tg("\u221214%", "down") + ".",
    OK + " Dinner as per your Eat plan still adds " + tg("+27%", "up") + "."
  ]
};
SC.first.ask = {
  q: "My score went up by +12%. What does that mean?",
  a: [
    "Good start! Breakfast is in, and it added " + tg("+12%", "up") + " to your nutrition sufficiency score.",
    "Breakfast can add up to " + tg("+23%", "up") + ". A plate closer to the Eat plan suggested by your coach adds more, especially protein.",
    "Lunch is next and carries the biggest share, up to " + tg("+28%", "up") + ". Keep logging honestly."
  ]
};
SC.mid.ask = {
  q: "My score went up by +20%. How do I grow it from here?",
  a: [
    "Nice! Lunch added " + tg("+20%", "up") + ", so your nutrition sufficiency score is at " + tg("54%", "calm") + " with three meals in.",
    "Each meal adds its own share of the day:" + shares(["Evening snack", "Dinner", "Bedtime"]),
    "Evening snack, dinner and bedtime can still add up to " + tg("+48%", "up") + ". Keep logging honestly."
  ]
};
SC.full.ask = {
  q: "My score went up by +4%. Is my day done?",
  a: [
    "Yes, every meal is logged. Bedtime added " + tg("+4%", "up") + ", so your day closes at " + tg("88%", "calm") + ".",
    "The points you did not get came from meals that were a little under the Eat plan suggested by your coach, mostly on protein.",
    "Tomorrow starts fresh at " + tg("0%", "calm") + ". Keep logging honestly."
  ]
};
SC.perfect.ask = {
  q: "My score went up by +4%. Did I hit everything?",
  a: [
    "You did! Bedtime added " + tg("+4%", "up") + " and your nutrition sufficiency score reached " + tg("100%", "up") + ".",
    "Every meal matched the Eat plan suggested by your coach, so each one added its full share.",
    "A day like this is rare. Keep logging honestly."
  ]
};
SC.over.ask = {
  q: "Why did my nutrition sufficiency score only go up by +9%? It says I could have gained +18% more.",
  a: [
    "You had more than the Eat plan suggested by your coach at dinner, and the extra held your nutrition sufficiency score back.",
    "A little over your Eat plan still earns full points. Past that, the extra takes points back, so dinner added " + tg("+9%", "down") + " of a possible " + tg("+27%", "up") + ".",
    OK + " Tomorrow starts fresh."
  ]
};
SC.past.ask = {
  q: "Why did this day end at 61%?",
  a: [
    "Every meal was logged that day, and together they added up to " + tg("61%", "calm") + ".",
    "Each meal adds its own share of the day:" + shares(),
    "Meals closer to the Eat plan suggested by your coach would have added more, mostly at lunch and dinner. " + OK
  ]
};
var CHEV_IN = '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-left:1px"><path d="M6 3.5 10.5 8 6 12.5"/></svg>';
/* the chevron is glued to the last word, so it never wraps onto a line alone */
function kaira(t) {
  var i = t.lastIndexOf(" "), head = t.slice(0, i + 1), last = t.slice(i + 1);
  var hl = function (x) { return x.replace("KAIRA", '<span class="ask kg">KAIRA</span>'); };
  return hl(head) + '<span style="white-space:nowrap">' + hl(last) + '<span class="ask kc">' + CHEV_IN + "</span></span>";
}
function ask(s) { return s.cta ? ' <span class="cta" style="cursor:pointer">' + kaira(s.cta) + "</span>" : ""; }

var Q = new URLSearchParams(location.search), S = window.S || {};
var KEY = Q.get("say") || S.id, s = SC[KEY];
/* nothing to say without a score, or on a day nobody logged */
if (!s || !Q.get("say") && S.hero && S.hero.score == null) return;
var CSS = "#cm{position:relative;z-index:3;margin:20px auto 0;padding:0 24px;display:flex;justify-content:center;font-family:Roboto,sans-serif;letter-spacing:.2px}" +
  "#cm .ask{color:#3538CD;font-weight:500;white-space:nowrap;cursor:pointer}" +
  "#cm .kg{background:linear-gradient(90deg,#444CE7,#1A9FBF);-webkit-background-clip:text;background-clip:text;color:transparent;font-weight:600}#cm .kc{color:#1A9FBF}" +
  "#railSect{margin-top:20px !important}" +
  "#cm .in{position:relative;overflow:hidden;width:100%;max-width:342px;padding:10px 14px 10px 52px;border-radius:14px;background:#F9FAFB;font-size:12.5px;line-height:18px;color:#475467}" +
      "#cm .q{position:absolute;left:8px;top:50%;width:40px;height:40px;transform:translateY(-50%);color:#E0EAFF}#cm .tx{position:relative;display:block}" +
      /* waiting: the card is already there at its final height, two soft bars in it, and a band of KAIRA's light sweeping across */
      "#cm .in{opacity:1 !important;transform:none !important;filter:none !important}" +
      "#cm .tx{-webkit-mask-image:linear-gradient(90deg,#000 40%,transparent 60%);mask-image:linear-gradient(90deg,#000 40%,transparent 60%);-webkit-mask-size:300% 100%;mask-size:300% 100%;-webkit-mask-position:100% 0;mask-position:100% 0;transition:-webkit-mask-position 1.1s cubic-bezier(.4,0,.2,1),mask-position 1.1s cubic-bezier(.4,0,.2,1)}" +
      "#cm.on .tx{-webkit-mask-position:0 0;mask-position:0 0}" +
      "#cm .sk{position:absolute;left:52px;right:16px;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;gap:8px;transition:opacity .5s .15s}" +
      "#cm .sk i{display:block;height:9px;border-radius:5px;background:#E9EEF7}#cm .sk i:last-child{width:58%}" +
      "#cm.on .sk{opacity:0}" +
      "#cm .sw{position:absolute;inset:0;pointer-events:none;overflow:hidden;border-radius:inherit}" +
      "#cm .sw::before{content:'';position:absolute;top:0;bottom:0;left:0;width:55%;transform:translateX(-110%);" +
      "background:linear-gradient(100deg,rgba(255,255,255,0),rgba(164,188,253,.38) 40%,rgba(165,240,252,.42) 60%,rgba(255,255,255,0));animation:csweep 1.25s cubic-bezier(.4,0,.2,1) infinite}" +
      "#cm.on .sw::before{animation:csweep 1.1s cubic-bezier(.4,0,.2,1) 1 forwards}" +
      "@keyframes csweep{to{transform:translateX(200%)}}" +
      "@media (prefers-reduced-motion:reduce){#cm .sw{display:none}#cm .tx{-webkit-mask-image:none;mask-image:none;opacity:0;transition:opacity .3s}#cm.on .tx{opacity:1}}" +
      "#cm .tx{position:relative}#cm b{color:#101828;font-weight:600}" +
      /* the number sits in the same capsule as Change and reason: green up, amber when it went up less or came down */
      "#cm .dc{display:inline-flex;align-items:center;height:20px;padding:0 6px;margin:0 1px;border-radius:6px;vertical-align:1px;font:600 12px/1 Roboto,sans-serif;font-variant-numeric:tabular-nums}" +
      "#cm .dc.down{background:#FFFAEB;color:#B54708;box-shadow:inset 0 0 0 1px #FEDF89}#cm .dc.calm{background:#F2F4F7;color:#475467;box-shadow:inset 0 0 0 1px #E4E7EC}#cm .dc.up{background:#ECFDF3;color:#067647;box-shadow:inset 0 0 0 1px #ABEFC6}";
var html = function (s) { var lead = s.lead.replace(/ by (only )?\d+%?\.?/, ' by $1<span class="dc ' + s.tone + '">' + s.delta + "</span>"); return '<div class="in"><svg class="q" viewBox="0 0 24 24" fill="currentColor"><path d="M4.6 18.7C3.5 17.5 3 16.3 3 14.3c0-3.5 2.5-6.6 6-8.2l.9 1.4C6.6 9.3 5.9 11.6 5.7 13.1c.5-.3 1.2-.4 1.8-.3 1.8.2 3.2 1.6 3.2 3.4a3.4 3.4 0 0 1-3.4 3.4c-1 0-2.1-.4-2.7-.9Zm10 0c-1.1-1.2-1.6-2.4-1.6-4.4 0-3.5 2.5-6.6 6-8.2l.9 1.4c-3.3 1.8-4 4.1-4.2 5.6.5-.3 1.2-.4 1.8-.3 1.8.2 3.2 1.6 3.2 3.4a3.4 3.4 0 0 1-3.4 3.4c-1 0-2.1-.4-2.7-.9Z"/></svg><span class="sk"><i></i><i></i></span><span class="sw"></span><span class="tx"><b>' + lead + "</b> " + s.rest.replace(/ gained (\d+%)\.?/, ' gained <span class="dc calm">+$1</span>') + ask(s) + "</span></div>"; };

/* a ?say= case is the moment just after a log: its score, and the step up (or down) to it */
window.GFSay = {
  hero: function (opts) {
    if (!Q.get("say")) return;
    opts.score = s.score;
    var d = parseInt((s.delta || "0").replace("\u2212", "-"), 10) || 0;
    if (d) opts.from = Math.max(0, s.score - d);
  }
};
function mount() {
  var stage = document.getElementById("stage");
  if (!stage) return;
  var st = document.createElement("style"); st.textContent = CSS; document.head.appendChild(st);
  var cm = document.createElement("div"); cm.id = "cm"; cm.innerHTML = html(s);
  cm.addEventListener("click", function (e) {
    if (e.target.closest(".cta") && s.ask && window.kairaAsk) window.kairaAsk(s.ask.q, s.ask.a);
  });
  stage.parentNode.insertBefore(cm, stage.nextSibling);
  var b = Q.get("say") && BELOW[KEY];
  if (b && KEY !== "start") {
    if (window.paintMacros) window.paintMacros(b.mac, null, true);
    if (window.paintCal) window.paintCal(b.kcal, DAY.kcal);
  }
  /* the shimmer holds until the score has landed: a step after a log is quick, the intro takes longer */
  setTimeout(function () { cm.classList.add("on"); }, Q.get("say") || s === SC.start ? 1800 : 3800);
}
if (document.readyState === "complete") mount(); else addEventListener("load", mount);
})();
