/* How a rest day shows. The pick, r5, is the default on any day with one or two parts off; ?vrest= shows the others.
   Picked with ?vrest= on /move/index.html (with ?off=e). Options for v7/move-rest-options.html.
   Every option: the Workout tile keeps No target, and its second line reads "Rest day" with a bed icon (a label, not a button).
   Then one way into the rest day sheet:
     b   a gold tag under the score, like Trend's Coming soon chip, clear of the dial's 0 and 100
     a1  a slim gold strip under the tiles, one line: "Rest day today, so your body can recover", info icon
     a2  the strip with a white bed tile and two lines: "Today is your rest day" over "Your coach planned it for recovery"
   A1's family, one line "Today is your rest day from workouts" with a bed and an info icon, five ways:
     r1  a gold fade, left to right
     r2  the card's own bottom glows gold, full width, rising into the blue
     r3  tucked behind the tiles, so the gold comes from the back of the card
     r5  a soft gold glow from the centre, the words centred, one line for any part: "Take it easy today, it's your rest day"
     r6  r1 made quieter: a faint gold fade inside the tiles' own indigo hairline, so it sits in the card like a fourth tile
   With &log=walk the day has a 30 minute walk logged, to show a workout on a rest day
   Each opens the same sheet, which says what a rest day is in the simplest words. ?sheet=rest opens it straight away. */
(function () {
  /* A1.4 (r5) is the pick, so a rest day without ?vrest= shows it */
  var Q = new URLSearchParams(location.search), V = Q.get("vrest") || "r5";
  if (!/^(b|a[12]|r[12356])$/.test(V || "")) return;

  var INFO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><circle cx="12" cy="7.6" r=".6" fill="currentColor"/></svg>';
  var BED = '<i class="rv-bed" aria-hidden="true"></i>';

  var css = document.createElement("style");
  css.textContent =
    ".rv-bed{display:block;width:18px;height:18px;background:currentColor;-webkit-mask:url(/v7/img/coach/icons/bed-outline.svg) center/contain no-repeat;mask:url(/v7/img/coach/icons/bed-outline.svg) center/contain no-repeat}" +
    ".rv-i{display:inline-grid;place-items:center;width:24px;height:24px;margin:-4px -4px -4px 0;padding:0;border:0;background:none;color:inherit;cursor:pointer;border-radius:9999px}.rv-i svg{width:16px;height:16px}" +
    /* every option: the tile's second line, a quiet label */
    ".rv-tl{display:inline-flex;align-items:center;gap:4px;font:500 12px/16px Roboto,sans-serif;color:var(--olive-700)}.rv-tl .rv-bed{width:13px;height:13px}" +
    /* b: the score's verdict chip in gold, under the dial's 0 and 100 */
    ".rv-wrap{position:relative;z-index:2;display:flex;justify-content:center;margin:20px 0 8px}" +
    ".rv-tag{gap:6px;height:28px;padding:0 6px 0 10px;font-weight:500;cursor:pointer}.rv-tag .rv-bed{width:14px;height:14px}.rv-tag svg{width:15px;height:15px}" +
    /* a1: one line on a gold fade */
    ".rv-a1{display:flex;align-items:center;gap:8px;width:100%;height:40px;margin-top:8px;padding:0 12px;border:0;border-radius:12px;background:linear-gradient(90deg,var(--gold-100),var(--gold-50));color:var(--olive-700);font:500 13px/16px Roboto,sans-serif;text-align:left;cursor:pointer}" +
    ".rv-a1 .rv-bed{flex:none;width:16px;height:16px;color:var(--gold-800)}.rv-a1 span{flex:1}.rv-a1 svg{flex:none;width:16px;height:16px}" +
    /* a2: two lines, a white tile for the bed */
    ".rv-a2{display:flex;align-items:center;gap:10px;width:100%;margin-top:8px;padding:8px 12px 8px 8px;border:1px solid var(--gold-200);border-radius:12px;background:linear-gradient(90deg,var(--gold-100),var(--gold-50) 60%);text-align:left;cursor:pointer}" +
    ".rv-a2 .bx{flex:none;width:32px;height:32px;border-radius:9px;background:#fff;display:grid;place-items:center;color:var(--gold-800);box-shadow:0 1px 2px rgb(130 110 45/.12)}.rv-a2 .bx .rv-bed{width:16px;height:16px}" +
    ".rv-a2 span{flex:1;min-width:0;font:600 13px/18px Roboto,sans-serif;color:var(--g-900)}.rv-a2 small{display:block;font:400 12px/16px Roboto,sans-serif;color:var(--olive-700)}.rv-a2>svg{flex:none;width:16px;height:16px;color:var(--olive-700)}" +
    /* r1 to r5: the same line, five finishes */
    ".rv-r{display:flex;align-items:center;gap:8px;width:100%;height:40px;margin-top:8px;padding:0 12px;border:0;border-radius:12px;color:var(--olive-700);font:500 13px/16px Roboto,sans-serif;text-align:left;cursor:pointer}" +
    ".rv-r .rv-bed{flex:none;width:16px;height:16px;color:var(--gold-800)}.rv-r span{flex:1}.rv-r svg{flex:none;width:16px;height:16px}" +
    ".rv-r1{background:linear-gradient(90deg,var(--gold-100),var(--gold-50))}" +
    /* r2: the card is a blue fade (#railMacros::before), so its foot turns gold edge to edge */
    ".rv-r2{width:calc(100% + 32px);height:44px;margin:4px -16px 0;padding:0 28px;border-radius:0 0 20px 20px;background:linear-gradient(180deg,rgb(255 248 224/0),var(--gold-100))}" +
    /* r3: behind the tiles: the strip slides up under them and shows below */
    "#railMacros .macros{position:relative;z-index:1}" +
    ".rv-r3{position:relative;z-index:0;height:auto;margin-top:-28px;padding:36px 12px 10px;border-radius:0 0 16px 16px;background:linear-gradient(180deg,var(--gold-50),var(--gold-100));box-shadow:inset 0 -1px 0 var(--gold-200)}" +
    /* r6: the tiles' hairline (index.html .macros.tiles .m), a faint gold fade inside */
    ".rv-r6{border-radius:14px;background:linear-gradient(90deg,var(--gold-50),rgb(255 255 255/.75) 75%);box-shadow:inset 0 0 0 1px rgba(164,188,253,.55)}" +
    /* r5: a glow from the middle, the words centred */
    ".rv-r5{margin-top:2px;justify-content:center;background:radial-gradient(75% 170% at 50% 50%,rgb(255 248 224/.95),rgb(255 248 224/.55) 55%,rgb(255 248 224/.12) 92%,rgb(255 248 224/0))}.rv-r5 span{flex:none}" +
    /* the sheet */
    ".rv-sh .art{display:grid;place-items:center;height:120px;margin:4px 0 16px;border-radius:16px;background:radial-gradient(closest-side,var(--gold-100),var(--gold-50) 70%,#fff)}" +
    ".rv-sh .art span{width:64px;height:64px;border-radius:20px;background:#fff;display:grid;place-items:center;color:var(--gold-800);box-shadow:0 2px 6px rgb(130 110 45/.08)}.rv-sh .art .rv-bed{width:32px;height:32px}" +
    ".rv-sh p{margin:0 0 16px;font:400 16px/24px Roboto,sans-serif;color:var(--g-700)}" +
    ".rv-sh ul{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:12px}" +
    /* the Momentum sheet's L arrows (index.html #es-suff .elist2) */
    ".rv-sh li{position:relative;padding-left:24px;font:400 14px/21px Roboto,sans-serif;color:var(--g-700)}.rv-sh li b{color:var(--g-900);font-weight:600}" +
    ".rv-sh li::before{content:\"\";position:absolute;left:0;top:2.5px;width:16px;height:16px;background:url(/v7/r3/assets/trend-bullet.svg) no-repeat center/16px}";
  document.head.appendChild(css);

  /* the sheet names what rests today and what still counts, from ?off= (index.html MVOFF) */
  function sheet() {
    var O = window.MVOFF || {}, NM = { e: "workouts", n: "small moves", s: "steps" };
    var and = function (a) { return a.length > 1 ? a.slice(0, -1).join(", ") + " and " + a[a.length - 1] : a[0] || ""; };
    var off = "ens".split("").filter(function (k) { return O[k]; }), on = "ens".split("").filter(function (k) { return !O[k]; });
    var keep = on.map(function (k) { return { e: "do your coach’s workout", n: "tick off your small moves", s: "walk as you usually do" }[k]; });
    keep = and(keep); keep = keep.charAt(0).toUpperCase() + keep.slice(1);
    var also = O.e ? "<li><span><b>Worked out anyway?</b> Log it, and it will show in your day.</span></li>"
      : O.s ? "<li><span><b>Walked anyway?</b> Your steps still show in your day.</span></li>" : "";
    /* all three off: a full rest day, no score at all */
    if (O.all) return window.GFOpenSheet("mvRest", "Your rest day",
      '<div class="rv-sh"><div class="art"><span>' + BED + '</span></div>' +
      '<p>Your coach has given you a full day off from workouts, small moves and steps. Resting helps your body recover.</p>' +
      '<ul><li><span><b>No score today.</b> Your Momentum starts fresh tomorrow.</span></li>' +
      '<li><span><b>Moved anyway?</b> Log it, and it will show in your day.</span></li></ul></div>');
    window.GFOpenSheet("mvRest", "Your rest day",
      '<div class="rv-sh"><div class="art"><span>' + BED + '</span></div>' +
      '<p>Your coach has given you a day off from ' + and(off.map(function (k) { return NM[k]; })) + '. ' + (O.e ? "Resting helps your muscles recover and grow stronger." : "Resting helps your body recover.") + '</p>' +
      '<ul><li><span><b>You can still reach 100.</b> Today your score comes from your ' + and(on.map(function (k) { return NM[k]; })) + '.</span></li>' +
      '<li><span><b>' + (O.e ? "Keep moving lightly." : "Keep moving.") + '</b> ' + keep + '.</span></li>' + also + '</ul></div>');
  }
  document.addEventListener("click", function (e) { if (e.target.closest("[data-rest]")) { e.preventDefault(); e.stopPropagation(); sheet(); } }, true);

  var sect = document.getElementById("railSect");
  function put() {
    /* every tile the coach turned off today (index.html MVOFF: e, n, s in tile order), in every option */
    var OFF = window.MVOFF || {};
    [].forEach.call(sect ? sect.querySelectorAll(".mgrid > .m") : [], function (t, i) {
      var of = t.querySelector(".mof");
      if (OFF["ens"[i]] && of && !of.querySelector(".rv-tl")) of.innerHTML = '<span class="rv-tl">' + BED + 'Rest day</span>';
    });
    if (V === "b") {
      /* Move hides the score's verdict row, so the tag brings its own, in the same place */
      var vw = document.querySelector(".vwrap"); if (!vw || document.querySelector(".rv-tag")) return;
      vw.insertAdjacentHTML("afterend", '<div class="rv-wrap"><button class="gf-verdict warn rv-tag" data-rest aria-label="Rest day, what this means">' + BED + 'Rest day' + INFO + '</button></div>');
      return;
    }
    var host = document.getElementById("railMacros"); if (!host || host.hidden || host.querySelector("[data-rest]")) return;
    var L = "Today is your rest day, what this means";
    host.insertAdjacentHTML("beforeend", {
      a1: '<button class="rv-a1" data-rest aria-label="' + L + '">' + BED + '<span>Rest day today, so your body can recover</span>' + INFO + '</button>',
      a2: '<button class="rv-a2" data-rest aria-label="' + L + '"><span class="bx">' + BED + '</span><span>Today is your rest day<small>Your coach planned it for recovery</small></span>' + INFO + '</button>',
    }[V] || '<button class="rv-r rv-' + V + '" data-rest aria-label="' + L + '">' + BED + '<span>' + (V === "r5" ? "Take it easy today, it\u2019s your rest day" : "Today is your rest day from workouts") + '</span>' + INFO + '</button>');
  }
  /* the tiles redraw after every log, so the note goes back in each time */
  if (sect) new MutationObserver(put).observe(sect, { childList: true, subtree: true });
  put();
  if (Q.get("sheet") === "rest") setTimeout(sheet, 600);
})();
