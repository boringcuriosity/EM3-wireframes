/* ============================================================
   FlipCoins on the Eat screen: the "Earn" chip in the header, and the sheet
   it opens.

   The sheet is the app's own "Daily food log" streak sheet
   (MyTatva-RN StreakBottomSheet: the gold hero row, "Your current streak",
   the week and month cards with their check-grid art, the dotted rule, the
   earned line, the CTA), with one section added above the streak: what a
   single log earns, 1 FlipCoin a meal up to 4 a day, and how many of today's
   four are already in. The chip is the app's FlipcoinBadge: a green to gold
   border round a honeydew to cream fill.

   Amounts: 1 a log, 4 a day, +20 for a week's streak, +50 for a month's
   (the week and month figures are the app's sheet).
   eat.html exposes its sheet helper as window.GFOpenSheet.
   ============================================================ */
(function () {
  var ICON = "../icons/flipcoins/";
  var COIN = '<img src="' + ICON + 'coin.webp" alt="" width="26" height="26">';
  var PER_DAY = 4, WEEK = 20, MONTH = 50, STREAK = 3;   /* the streak is the prototype's */

  var css = document.createElement("style");
  css.textContent = [
    /* the chip: FlipcoinBadge, pill */
    ".earnchip{flex-shrink:0;display:inline-flex;padding:1.5px;border:0;border-radius:9999px;cursor:pointer;margin-left:auto;",
    "background:linear-gradient(90deg,#299D6B,#F5D736)}",
    ".earnchip span{display:inline-flex;align-items:center;gap:4px;height:25px;padding:0 10px 0 4px;border-radius:9999px;",
    "background:linear-gradient(90deg,#E6FAF1,#FFFBEE);font:700 12px/1 Roboto,sans-serif;letter-spacing:.25px;color:#313131}",
    ".earnchip img{width:20px;height:20px}",
    ".earnchip:active{transform:scale(.96)}",
    /* the sheet: StreakBottomSheet, measured */
    ".fc .hero{display:flex;align-items:flex-start;gap:8px;padding:16px;border-radius:16px 16px 0 0;background:linear-gradient(180deg,#FFFBEE,#fff);margin-bottom:20px}",
    ".fc .hero i{flex-shrink:0;width:28px;height:28px;display:grid;place-items:center;background:#fff;border-radius:6px}",
    ".fc .hero i span{width:13px;height:16px;background:#CDA935;-webkit-mask:url(" + ICON + "food.svg) center/contain no-repeat;mask:url(" + ICON + "food.svg) center/contain no-repeat}",
    ".fc .hero b{font:600 18px/24px Roboto,sans-serif;color:#CDA935}",
    ".fc .fclab{margin:0 0 8px;font:400 14px/20px Roboto,sans-serif;color:#667085}",
    ".fc .card{background:#F9FAFB;border:1px solid #EAECF0;border-radius:12px;padding:12px}",
    ".fc .amt{display:flex;align-items:center;gap:4px;font:600 20px/26px Roboto,sans-serif;color:#101828}",
    ".fc .now{display:flex;align-items:center;gap:10px;margin-bottom:20px;font:400 14px/20px Roboto,sans-serif;color:#667085}",
    ".fc .badge{display:inline-flex;align-items:center;gap:4px;padding:4px 8px;border-radius:8px;background:#EEF4FF;border:1px solid #A4BCFD;font:600 16px/22px Roboto,sans-serif;color:#444CE7}",
    ".fc .badge img{width:16px;height:16px}",
    ".fc .two{display:flex;gap:16px;margin-bottom:20px}",
    ".fc .two .card{flex:1;min-width:0;display:flex;flex-direction:column}",
    ".fc .two .t{margin-bottom:4px;font:400 12px/16px Roboto,sans-serif;color:#98A2B3}.fc .two .t b{color:#667085;font-weight:600}",
    ".fc .two .art{margin-top:auto;padding-top:10px;width:100%;height:auto;display:block}",
    ".fc .rule{height:0;border-top:1.5px dashed #E4E7EC;margin:0 0 16px}",
    ".fc .so{margin:0 0 20px;font:400 14px/20px Roboto,sans-serif;color:#98A2B3}.fc .so b{color:#667085;font-weight:600}",
    ".fc .ok{display:flex;align-items:center;justify-content:center;gap:8px}",
  ].join("");
  document.head.appendChild(css);

  /* how many of today's four are in: one per meal with anything logged */
  function today() {
    var n = 0;
    (window.MEALS || []).forEach(function (m) {
      var any = (m.manual || []).some(function (x) { return x.done; }) ||
        (m.opts || []).some(function (o) { return o.some(function (x) { return x.done; }); });
      if (any) n++;
    });
    return Math.min(PER_DAY, n);
  }

  function body() {
    var got = today();
    var dd = (STREAK < 10 ? "0" : "") + STREAK;
    return '<div class="fc">' +
      '<div class="hero"><i><span></span></i><b>Log your meals daily to earn FlipCoins</b></div>' +

      '<div class="now">Your current streak:<span class="badge"><img src="' + ICON + 'blue_fire.svg" alt="">' + dd + " day streak</span></div>" +

      '<p class="fclab">Keep the streak going to earn more</p>' +
      '<div class="two">' +
        '<div class="card"><div class="t">Log consistently for <b>one week</b> to earn</div><div class="amt">' + COIN + "+" + WEEK + "</div>" +
          '<img class="art" src="' + ICON + 'week_image.webp" alt="Seven days in a row, all logged"></div>' +
        '<div class="card"><div class="t">Log consistently for <b>one month</b> to earn</div><div class="amt">' + COIN + "+" + MONTH + "</div>" +
          '<img class="art" src="' + ICON + 'month_image.webp" alt="A month of days, all logged"></div>' +
      "</div>" +

      '<div class="rule"></div>' +
      '<p class="so">Earned so far from this streak: <b>+' + ((STREAK - 1) * PER_DAY + got) + " FlipCoins</b></p>" +
      '<button class="ok" data-fc="log">Log your meal<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>' +
      "</div>";
  }

  /* the chip, at the right end of the Eat header line; the info mark sits with the tagline */
  var info = document.querySelector(".eatline");
  if (info) {
    var chip = document.createElement("button");
    chip.className = "earnchip"; chip.setAttribute("aria-label", "Earn FlipCoins: how logging earns them");
    chip.innerHTML = "<span>" + COIN.replace(/26/g, "20") + "Earn</span>";
    info.appendChild(chip);
    chip.addEventListener("click", function () {
      if (window.GFOpenSheet) window.GFOpenSheet("fcSheet", "Earn FlipCoins", body());
    });
  }

  /* Log your meal: back to the day, at the meals, where logging starts */
  document.addEventListener("click", function (e) {
    if (!e.target.closest('[data-fc="log"]')) return;
    if (window.closeSheets) window.closeSheets();
    var meals = document.querySelector("section.meal");
    if (meals) setTimeout(function () { meals.scrollIntoView({ behavior: "smooth", block: "start" }); }, 250);
  });
})();
