/* Which fixed sentence the line under the Momentum score says after a change (v7/momentum-commentary.html).
   Pure: the same inputs always give the same line. Order is the order of "How the app picks":
   100%, then the medal, then already above 80%, then a workout log that went past the plan (all at once, or more),
   then the first log of the day, then steps alone, then any other gain.
     d       the gain in whole points (> 0; a drop or no change never reaches here)
     n       the score now
     a, b    parts() before and after: raw[0] = [kcal done, kcal planned], raw[2] = [steps, goal], items = what counts
     logged  the change came from logging a workout (tray or search), not a small move or steps
   Run `node move/momentum-pick.js` to check every case. */
(function (root) {
  var KEEP = "Keep logging your movement to see your score grow.";
  function pick(d, n, a, b, logged) {
    var was = n - d, plan = b.raw[0][1], beyond = b.raw[0][0] > plan;
    return n >= 100 && was < 100 ? { k: "hundred", lead: "You reached 100% Momentum!", rest: "You moved well all through the day.", delta: "" }
      : n >= 80 && was < 80 ? { k: "medal", lead: "You’ve earned today’s medal!", rest: "Your Momentum went up by " + d + "%. Well done." }
      : was >= 80 ? { k: "above80", lead: "Your Momentum went up by " + d + "%.", rest: "You’re having a great day, keep it going." }
      /* the whole workout in one go, from under half of it */
      : logged && beyond && a.raw[0][0] < plan / 2 ? { k: "once", lead: "Great workout! Your Momentum is up " + d + "%.", rest: "Spreading your movement through the day keeps you healthy and strong." }
      /* more than the coach planned */
      : logged && beyond ? { k: "over", lead: "Great effort! Your Momentum is up " + d + "%.", rest: "Spreading your workout through the day keeps it growing." }
      : !a.items.length && b.items.length ? { k: "first", lead: "Nice start! Your Momentum is up " + d + "%.", rest: KEEP }
      : b.items.length === a.items.length && b.raw[2][0] > a.raw[2][0] ? { k: "steps", lead: "Your steps added " + d + "%.", rest: "Every step you take is moving you forward." }
      : { k: "any", lead: "Your Momentum went up by " + d + "%.", rest: "Every move you log keeps your score growing." };
  }
  /* a workout log that changed nothing: only true when the workout's calories are already met */
  function full(b) { return b.raw[0][0] >= b.raw[0][1]; }
  root.MVPICK = { pick: pick, full: full };

  if (typeof window === "undefined" && typeof process !== "undefined") {   /* node only: the check */
    var assert = process.getBuiltinModule("assert");
    var P = function (k, K, st, items) { return { raw: [[k, K], [0, 5], [st, 10000]], items: items || [] }; };
    var one = [{ k: "e" }], two = [{ k: "e" }, { k: "t" }];
    var t = function (exp, d, n, a, b, lg) { assert.strictEqual(pick(d, n, a, b, lg).k, exp, exp); };
    t("hundred", 4, 100, P(118, 118, 9000, two), P(118, 118, 9000, two.concat([{ k: "x" }])), true);
    t("medal", 13, 83, P(70, 118, 10100, one), P(100, 118, 10100, two), true);
    t("above80", 9, 96, P(80, 118, 10000, two), P(118, 118, 10000, two.concat([{ k: "x" }])), true);
    t("once", 49, 63, P(0, 118, 5500, []), P(300, 118, 5500, one), true);
    t("over", 10, 65, P(110, 118, 5200, one), P(157, 118, 5200, two), true);
    t("first", 15, 19, P(0, 118, 0, []), P(30, 118, 0, one), true);
    t("steps", 5, 70, P(60, 118, 8000, two), P(60, 118, 10100, two), false);
    t("any", 7, 47, P(55, 118, 5000, one), P(55, 118, 5000, two), false);
    /* a small move ticked after the workout went past the plan is not "Great effort": it was not a workout log */
    t("any", 3, 68, P(157, 118, 5200, one), P(157, 118, 5200, two), false);
    assert.strictEqual(full(P(157, 118)), true); assert.strictEqual(full(P(100, 118)), false);
    console.log("momentum-pick: all cases pass");
  }
})(typeof window !== "undefined" ? window : globalThis);
