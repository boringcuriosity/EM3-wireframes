/* ============================================================
   Plan tray: logging the coach's plan on the Eat screen itself.

   The "On the card" variant (?plog=card, the default). Ticking a plan food on a
   meal card no longer leaves the screen: the food drops into a bar at the bottom,
   the same bar the logging screen has (the tally strip, the time, Log n items).

   Any meal, any number of them. A ticked food lifts off its row and drops into
   the bar, the way it does on the logging screen. Every food carries its own
   time, which starts at its meal's default: now if that meal's window is open,
   otherwise the middle of the window. The review sheet changes quantity and
   time per food. Log plays the win moment, then the day comes back with the
   foods ticked and the score stepping up. KAIRA's button and the tab bar give
   the bottom of the screen to the bar while it is up.

   eat.html calls GFPlanTray.toggle({ m, ref, it }) from its tick handler.
   ============================================================ */
(function () {
  var Q = new URLSearchParams(location.search);
  /* Two bars. "float" (the default on the Eat screen) follows Zomato's cart
     bar: one floating bar with the foods, a line to review where each food
     takes its own time, Log, and an X that slides the pill aside to reveal
     Remove. "tray" is the logging screen's own tray, kept behind ?bar=tray.
     Nothing is remembered, so the screen always opens on the default. */
  var MODE = Q.get("bar") === "tray" ? "tray" : "float";
  var DISH = '<svg viewBox="0 0 24 24" fill="none" stroke="#2D3282" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px"><path d="M3.5 11h17"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 7.5c0-1.2 1.1-1.5 1.1-2.7"/><path d="M8.6 7.5c0-1.2 1.1-1.5 1.1-2.7"/></svg>';
  var CHEV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px"><path d="m9 6 6 6-6 6"/></svg>';
  var CLOCK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="width:19px;height:19px"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';
  var X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" style="width:16px;height:16px"><path d="M6 6l12 12M18 6 6 18"/></svg>';
  var MINUS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" style="width:18px;height:18px"><path d="M5 12h14"/></svg>';
  var PLUS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" style="width:18px;height:18px"><path d="M12 5v14M5 12h14"/></svg>';

  var css = document.createElement("style");
  css.textContent = [
    /* the bar: the logging screen's tray, measured off log.html */
    ".pt{position:fixed;left:50%;bottom:0;width:100%;max-width:390px;transform:translate(-50%,110%);z-index:30;background:#fff;",
    "padding:8px 16px calc(12px + var(--gf-home-h,20px) + env(safe-area-inset-bottom,0px));transition:transform .34s cubic-bezier(.2,0,0,1)}",
    ".pt.up{transform:translate(-50%,0)}",
    /* a lifted sheet edge rather than the logger's fade: here it sits over cards, not a plain list */
    ".pt{padding-top:14px;border-radius:20px 20px 0 0;box-shadow:0 -1px 0 #EAECF0,0 -10px 28px -14px rgba(16,24,40,.22)}",
    ".pt .ptm{position:relative;display:flex;align-items:center;justify-content:flex-end;margin:0 2px 8px;font:500 12px/16px Roboto,sans-serif;letter-spacing:.25px;color:#667085}",
    ".pt .ptm b{color:#101828;font-weight:600}",
    ".pt .clr{display:inline-flex;align-items:center;gap:4px;border:0;background:none;padding:6px 0 6px 8px;margin:-6px 0;color:#667085;font:500 12px/16px Roboto,sans-serif;cursor:pointer}",
    ".pt .hint{color:#B54708}",
    ".pt .tally{position:relative;display:flex;align-items:center;gap:10px;width:100%;min-height:44px;margin:0 0 10px;padding:4px 12px 4px 10px;border:0;border-radius:9999px;background:#fff;cursor:pointer;overflow:hidden;",
    "box-shadow:0 1px 3px rgba(16,24,40,.10),0 6px 16px -6px rgba(16,24,40,.22)}",
    ".pt .tally::after{content:\"\";position:absolute;inset:0;border-radius:inherit;pointer-events:none;opacity:0;transform:translateX(-110%);",
    "background:linear-gradient(105deg,rgba(68,76,231,0) 36%,rgba(68,76,231,.13) 50%,rgba(68,76,231,0) 64%)}",
    ".pt .tally.lit::after{animation:ptShine .85s cubic-bezier(.4,0,.2,1) both}",
    "@keyframes ptShine{0%{opacity:0;transform:translateX(-110%)}16%{opacity:1}74%{opacity:1}100%{opacity:0;transform:translateX(110%)}}",
    ".pt .stack{display:flex;flex-shrink:0}",
    ".pt .tok{width:28px;height:28px;border-radius:9999px;flex-shrink:0;background:#C7D7FE;border:2px solid #fff;display:grid;place-items:center;font:700 11px/1 Roboto,sans-serif;color:#2D3282}",
    ".pt .tok+.tok{margin-left:-10px}.pt .tok.ptmore{margin-top:0;border-top:2px solid #fff;background:#EEF4FF;color:#444CE7}",
    ".pt .names{flex:1;min-width:0;text-align:left;font:400 12.5px/18px Roboto,sans-serif;color:#101828;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
    ".pt .chev{flex-shrink:0;color:#98A2B3;display:grid}",
    ".pt .trow{display:flex;gap:8px}",
    ".pt .timebtn{display:flex;align-items:center;gap:8px;height:52px;flex-shrink:0;padding:0 16px;border-radius:12px;background:#fff;border:1px solid #299D6B;color:#299D6B;cursor:pointer;transition:transform .2s ease-out}",
    ".pt .timebtn:active{transform:scale(.96)}.pt .timebtn b{font:700 14px/18px Roboto,sans-serif;color:#299D6B}",
    ".pt .go{flex:1;min-width:0;height:52px;border:0;border-radius:12px;background:#299D6B;color:#fff;font:700 15px/1 Roboto,sans-serif;cursor:pointer;box-shadow:0 4px 0 #2A805A;transition:transform .2s ease-out,box-shadow .2s ease-out}",
    ".pt .go:active{transform:translateY(4px);box-shadow:none}",
    /* the screen around it: the tab bar and KAIRA's button give way, and the
       ticked foods are marked as in the bar */
    "body.pt-on .nav{transform:translate(-50%,110%);transition:transform .34s cubic-bezier(.2,0,0,1)}",
    "body .nav{transition:transform .34s cubic-bezier(.2,0,0,1)}",
    "body.pt-on #kairaFab{opacity:0;transform:scale(.8);pointer-events:none}",
    "#kairaFab{transition:opacity .2s ease-out,transform .2s ease-out}",
    "body.pt-on .col{padding-bottom:190px}",
    ".item.pt-sel .tick{background:#E6FAF1;border-color:#299D6B;color:#299D6B}",
    ".item.pt-sel .tick::after{content:\"\";width:12px;height:12px;background:no-repeat center/12px url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23299D6B' stroke-width='3.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 6L9 17l-5-5'/%3E%3C/svg%3E\")}",
    ".morsel{position:fixed;z-index:70;pointer-events:none;box-sizing:border-box;padding:9px 14px;border-radius:12px;background:#fff;border:1px solid #E4E7EC;",
    "box-shadow:0 14px 28px -10px rgba(16,24,40,.34),0 3px 8px -4px rgba(16,24,40,.18);text-align:left;transform-origin:24px 50%;font-family:Roboto,sans-serif}",
    ".morsel b{display:block;font-size:14px;font-weight:600;line-height:20px;color:#101828;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
    ".morsel span{display:block;font-size:12px;line-height:16px;color:#667085}",
    /* the review sheet: X top right, title top left, no handle */
    ".pts{position:fixed;inset:0;z-index:40;display:flex;align-items:flex-end;justify-content:center;background:rgba(16,24,40,0);transition:background .25s ease-out;pointer-events:none}",
    ".pts.on{background:rgba(16,24,40,.4);pointer-events:auto}",
    ".pts .sh{width:100%;max-width:390px;max-height:90vh;overflow:auto;background:#fff;border-radius:20px 20px 0 0;padding:20px 16px calc(20px + var(--gf-home-h,20px));transform:translateY(100%);transition:transform .3s cubic-bezier(.2,0,0,1)}",
    ".pts.on .sh{transform:none}",
    ".pts .hd{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:12px}",
    ".pts h4{margin:0;font:800 20px/28px Roboto,sans-serif;color:#101828}.pts .sub{margin-top:2px;font:400 13px/18px Roboto,sans-serif;color:#667085}",
    ".pts .x{width:32px;height:32px;border-radius:50%;border:0;background:#F2F4F7;color:#344054;display:grid;place-items:center;cursor:pointer;flex-shrink:0}",
    /* the review sheet: one flat list, no meal groups. Each food is its name, its helping, its time, and a stepper. */
    ".pts .sh{padding-bottom:0}",
    ".pts .pi{display:flex;align-items:center;gap:12px;padding:14px 0}.pts .pi+.pi{border-top:1px solid #F2F4F7}",
    ".pts .pi .t{flex:1;min-width:0}.pts .pi .nm{font:600 15px/22px Roboto,sans-serif;color:#101828}",
    ".pts .pi .mt{font:400 13px/18px Roboto,sans-serif;color:#667085;font-variant-numeric:tabular-nums}",
    /* The time and the stepper are the same kind of thing, a value you can
       change, so they share one treatment: a grey shell, the value in ink, and
       green only on the part you act with (the clock, the minus and plus).
       Green on the whole time box made it read as a second primary action. */
    ".pts .tc{position:relative;display:inline-flex;align-items:center;justify-content:center;gap:6px;width:106px;height:36px;padding:0 8px;border-radius:10px;border:1px solid #E4E7EC;background:#fff;color:#101828;font:600 13px/1 Roboto,sans-serif;font-variant-numeric:tabular-nums;cursor:pointer;transition:background .15s ease-out}",
    ".pts .tc:active{background:#F2F4F7}",
    ".pts .tc::before{content:\"\";position:absolute;inset:-4px -2px}",
    /* name and helping on the left; the two controls side by side on the right, so a food is one row */
    ".pts .pi .ctl{display:flex;align-items:center;gap:8px;flex-shrink:0}",
    ".pts .tc svg{width:16px;height:16px;color:#299D6B}",
    /* the time wheel: three snapping columns, hour, minute, AM or PM, read through a band in the middle */
    ".pts .wh{position:relative;display:flex;gap:4px;height:220px;margin:8px 0 20px;-webkit-mask:linear-gradient(transparent,#000 30%,#000 70%,transparent);mask:linear-gradient(transparent,#000 30%,#000 70%,transparent)}",
    ".pts .wband{position:absolute;left:0;right:0;top:88px;height:44px;border-radius:12px;background:#F3FCF8;border:1px solid #CBF0E0;pointer-events:none}",
    ".pts .wc{position:relative;flex:1;height:220px;overflow-y:auto;scroll-snap-type:y mandatory;scrollbar-width:none;overscroll-behavior:contain;padding:88px 0}",
    ".pts .wc::-webkit-scrollbar{display:none}.pts .wc.ap{flex:.8}",
    ".pts .wc div{height:44px;display:grid;place-items:center;scroll-snap-align:center;font:500 20px/1 Roboto,sans-serif;color:#98A2B3;font-variant-numeric:tabular-nums;cursor:pointer;transition:color .15s ease-out}",
    ".pts .wc div.on{color:#101828;font-weight:700}",
    ".pts .st{display:flex;align-items:center;height:36px;border:1px solid #E4E7EC;border-radius:10px;flex-shrink:0}",
    ".pts .st button{width:34px;height:36px;border:0;background:none;color:#299D6B;display:grid;place-items:center;cursor:pointer}.pts .st b{min-width:18px;text-align:center;font:600 15px/1 Roboto,sans-serif;font-variant-numeric:tabular-nums}",
    ".pts .ft{position:sticky;bottom:0;display:flex;align-items:center;gap:16px;margin:4px -16px 0;padding:14px 16px calc(14px + var(--gf-home-h,20px));background:#fff;border-top:1px solid #F2F4F7}",
    ".pts .ft .tot span{display:block}.pts .ft .tot b{display:block;font:700 18px/24px Roboto,sans-serif;color:#101828;font-variant-numeric:tabular-nums}.pts .ft .tot span{font:400 12px/16px Roboto,sans-serif;color:#667085}",
    ".pts .ft .done{flex:1;width:auto;margin-bottom:4px}",
    ".pts .sh>.done{margin-bottom:20px}",
    ".pts .note{margin:8px 2px 16px;font:400 13px/18px Roboto,sans-serif;color:#667085}",
    /* a time that has not happened yet: the chip goes warm, the sheet asks once, Log waits */
    ".pts .tc.fut{border-color:#FEDF89;background:#FFFAEB;color:#B54708}.pts .tc.fut svg{color:#DC6803}",
    ".pts .fbn{display:flex;gap:12px;align-items:flex-start;margin:0 0 6px;padding:12px;border-radius:14px;background:#FFFAEB;border:1px solid #FEF0C7;animation:ptIn .4s cubic-bezier(.2,0,0,1) both}",
    ".pts .fbn .fi{flex:none;width:32px;height:32px;border-radius:50%;background:#FEF0C7;color:#DC6803;display:grid;place-items:center}.pts .fbn .fi svg{width:18px;height:18px}",
    ".pts .fbn b{display:block;font:600 14px/20px Roboto,sans-serif;color:#101828}.pts .fbn p{margin:2px 0 10px;font:400 13px/18px Roboto,sans-serif;color:#475467}",
    ".pts .fbn button{height:32px;padding:0 12px;border-radius:10px;border:1px solid #FEDF89;background:#fff;color:#B54708;font:600 13px/1 Roboto,sans-serif;cursor:pointer}",
    "@keyframes ptIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}",
    ".pts .done[disabled]{opacity:.4;pointer-events:none}",
    /* the wheel greys out the times still to come, and says so when one is picked */
    ".pts .wc div.fut{color:#D0D5DD}.pts .wc div.fut.on{color:#B54708}",
    ".pts .whint{min-height:18px;margin:-12px 0 12px;text-align:center;font:500 13px/18px Roboto,sans-serif;color:#B54708}",
    ".pts .done{width:100%;height:52px;border:0;border-radius:12px;background:#299D6B;color:#fff;font:700 15px/1 Roboto,sans-serif;box-shadow:0 4px 0 #2A805A;cursor:pointer}",
    /* the floating bar, after Zomato's cart bar, with our 20px card corners rather than its pill; the Log button keeps our squared corners and depth bar. */
    ".pt.fm{background:none;box-shadow:none;border-radius:0;padding:0 12px calc(12px + var(--gf-home-h,20px) + env(safe-area-inset-bottom,0px))}",
    ".pt .flw{position:relative;border-radius:20px}",
    ".pt .rmz{position:absolute;inset:0 0 0 auto;width:160px;display:flex;align-items:center;justify-content:flex-end;padding-right:22px;border:0;border-radius:20px;background:#FEF3F2;color:#D92D20;font:600 16px/1 Roboto,sans-serif;cursor:pointer;opacity:0;transition:opacity .2s ease-out}",
    ".pt .flw.open .rmz{opacity:1}",
    ".pt .fl{position:relative;display:flex;align-items:center;gap:10px;padding:8px 6px 8px 16px;background:#fff;border-radius:20px;overflow:hidden;",
    "box-shadow:0 1px 3px rgba(16,24,40,.10),0 12px 28px -8px rgba(16,24,40,.28);transition:transform .32s cubic-bezier(.2,0,0,1)}",
    ".pt .flw.open .fl{transform:translateX(-104px)}",
    ".pt .fl::after{content:\"\";position:absolute;inset:0;border-radius:inherit;pointer-events:none;opacity:0;transform:translateX(-110%);",
    "background:linear-gradient(105deg,rgba(41,157,107,0) 36%,rgba(41,157,107,.12) 50%,rgba(41,157,107,0) 64%)}",
    ".pt .fl.lit::after{animation:ptShine .85s cubic-bezier(.4,0,.2,1) both}",
    ".pt .fl .stack{position:relative;width:52px;height:52px;flex-shrink:0;border-radius:14px;background:#E0EAFF;display:grid;place-items:center;overflow:visible}",
    ".pt .fl .stack img{width:40px;height:40px;object-fit:contain}",
    ".pt .fl .tx{flex:1;min-width:0;border:0;background:none;padding:0;text-align:left;cursor:pointer}",
    ".pt .fl .tx b{display:block;font:600 14px/20px Roboto,sans-serif;color:#101828;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
    ".pt .fl .tx span{display:inline-flex;white-space:nowrap;align-items:center;gap:2px;margin-top:2px;font:500 12.5px/18px Roboto,sans-serif;color:#299D6B}",
    ".pt .fl .tx span svg{width:14px;height:14px}",
    /* compact: the button is the action, the names are the content, so the names get the width */
    ".pt .fl .go{flex:0 0 auto;min-width:88px;height:44px;padding:0 16px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;margin-bottom:4px;font-size:14px}",
    ".pt .fl .go small{font:500 11.5px/14px Roboto,sans-serif;color:rgba(255,255,255,.85)}",
    /* a bare grey glyph, no disc: the least used control in the row takes the least room. Its tap area is 44px, reaching into the padding. */
    ".pt .fl .xc{position:relative;width:20px;height:20px;margin:0 2px 0 -2px;padding:0;flex-shrink:0;border:0;background:none;color:#98A2B3;display:grid;place-items:center;cursor:pointer}",
    ".pt .fl .xc::before{content:\"\";position:absolute;inset:-12px}",
    "body.pt-on.pt-fm .col{padding-bottom:120px}",
    /* The time sheet arrives rather than appears. It rises on a long, decelerating
       curve; the list behind it eases back and dims, so there are clearly two
       layers; the wheel then rolls the last few steps into the food's time.
       Nothing overshoots. Closing runs the same path faster. */
    ".pts.pt2{z-index:45}.pts.pt2.on{background:rgba(16,24,40,.18)}",
    ".pts.pt2 .sh{transition:transform .46s cubic-bezier(.16,1,.3,1)}",
    ".pts.pt2:not(.on) .sh{transition-duration:.26s;transition-timing-function:cubic-bezier(.4,0,1,1)}",
    ".pts .sh{transform-origin:50% 100%}",
    ".pts .sh.back{transform:scale(.94) translateY(-10px);filter:brightness(.94);transition:transform .46s cubic-bezier(.16,1,.3,1),filter .46s cubic-bezier(.16,1,.3,1)}",
    ".pts.pt2 .hd,.pts.pt2 .wh,.pts.pt2 .done{opacity:0;transform:translateY(10px);transition:opacity .36s cubic-bezier(.2,0,0,1),transform .36s cubic-bezier(.2,0,0,1)}",
    ".pts.pt2.on .hd,.pts.pt2.on .wh,.pts.pt2.on .done{opacity:1;transform:none}",
    ".pts.pt2.on .hd{transition-delay:.08s}.pts.pt2.on .wh{transition-delay:.14s}.pts.pt2.on .done{transition-delay:.2s}",
    ".pts .tc.flash{animation:ptFlash .9s cubic-bezier(.2,0,0,1)}",
    "@keyframes ptFlash{0%{background:#E6FAF1;border-color:#299D6B}100%{background:#fff;border-color:#E4E7EC}}",
    "@media (prefers-reduced-motion:reduce){.pt,.pts .sh,.pts .sh.back,body .nav,.pt .fl,.pt .rmz,.pts.pt2 .hd,.pts.pt2 .wh,.pts.pt2 .done{transition:none}.pt .tally.lit::after,.pt .fl.lit::after,.pts .tc.flash{animation:none}}",
  ].join("");
  document.head.appendChild(css);

  var T = null;   /* { items: [{ ref, m, it, n, time }] }, time in minutes, per food */
  var bar = document.createElement("div");
  bar.className = "pt"; bar.setAttribute("role", "region"); bar.setAttribute("aria-label", "Logging from your plan");
  document.body.appendChild(bar);
  var sheet = document.createElement("div");
  sheet.className = "pts"; sheet.setAttribute("role", "dialog"); sheet.setAttribute("aria-modal", "true");
  document.body.appendChild(sheet);
  /* the time sheet is its own layer, so it can rise over the list instead of replacing it */
  var sheet2 = document.createElement("div");
  sheet2.className = "pts pt2"; sheet2.setAttribute("role", "dialog"); sheet2.setAttribute("aria-modal", "true");
  document.body.appendChild(sheet2);

  /* "8:00 - 10:00 AM", "12:30 - 2:00 PM": the meal's window, in minutes */
  function windowOf(m) {
    var r = /(\d+):(\d+)\s*(AM|PM)?\s*[-–]\s*(\d+):(\d+)\s*(AM|PM)/i.exec(m.time || "");
    if (!r) return null;
    var to24 = function (h, mm, ap) { h = +h % 12; if (/pm/i.test(ap)) h += 12; return h * 60 + +mm; };
    var b = to24(r[4], r[5], r[6]), a = to24(r[1], r[2], r[3] || r[6]);
    if (a > b) a -= 12 * 60;   /* "11:30 - 12:30 PM": the start is AM */
    return [a, b];
  }
  function defaultTime(m) {
    var w = windowOf(m), d = new Date(), now = d.getHours() * 60 + d.getMinutes();
    if (!w) return Math.round(now / 5) * 5;
    if (now >= w[0] && now <= w[1]) return Math.round(now / 5) * 5;   /* in the window: now */
    return Math.round((w[0] + w[1]) / 2 / 5) * 5;                       /* otherwise its middle */
  }
  /* Now, in minutes since midnight. ?now=13:00 fixes it for the docs. Only
     today has a future: an earlier day's times are all in the past. */
  function nowMin() {
    var q = /^(\d{1,2}):(\d{2})$/.exec(Q.get("now") || "");
    if (q) return +q[1] * 60 + +q[2];
    var d = new Date(); return d.getHours() * 60 + d.getMinutes();
  }
  function isToday() { return !window.S || !window.S.day || window.S.day === "Today"; }
  function future(x) { return isToday() && x.time > nowMin(); }
  function anyFuture() { return T && T.items.some(future); }
  var CLOCKI = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';
  function fmt(min) {
    var h = Math.floor(min / 60) % 24, mm = min % 60, ap = h < 12 ? "AM" : "PM";
    return ((h % 12) || 12) + ":" + (mm < 10 ? "0" : "") + mm + " " + ap;
  }
  function kcal() { return T.items.reduce(function (s, x) { return s + Math.round(x.it.cal / x.it.n * x.n); }, 0); }
  function count() { return T.items.length; }
  /* the meals in the bar, in the order they were first ticked */
  function meals() {
    var out = [];
    T.items.forEach(function (x) { if (out.indexOf(x.m) < 0) out.push(x.m); });
    return out;
  }
  function mealNames() {
    var n = meals().map(function (m) { return m.name; });
    return n.length < 3 ? n.join(" and ") : n.length + " meals";
  }
  /* one time for every food, or null when they differ */
  function oneTime() {
    var t = T.items[0].time;
    return T.items.every(function (x) { return x.time === t; }) ? t : null;
  }

  function render(fresh) {
    if (!T || !T.items.length) {
      bar.classList.remove("up"); document.body.classList.remove("pt-on"); mark(); return;   /* the mode class stays, so it slides out as it came in */
    }
    var newest = T.items.slice().reverse(), shown = newest.slice(0, 2), extra = newest.length - shown.length;
    var toks = shown.map(function () { return '<span class="tok">' + DISH + "</span>"; }).join("") + (extra > 0 ? '<span class="tok ptmore">+' + extra + "</span>" : "");
    var n = count(), one = oneTime();
    if (MODE === "float") return renderFloat(fresh, n);
    bar.innerHTML =
      '<div class="ptm"><button class="clr" data-pt="clear" aria-label="Clear everything in the bar">Clear' + X + "</button></div>" +
      '<button class="tally' + (fresh ? " lit" : "") + '" data-pt="review" aria-label="See what is going into ' + mealNames() + '">' +
        '<span class="stack">' + toks + '</span><span class="names">' + newest.map(function (x) { return x.it.name; }).join(", ") + "</span>" +
        '<span class="chev">' + CHEV + "</span></button>" +
      '<div class="trow"><button class="timebtn" data-pt="time" aria-label="' + (one === null ? "Change the time of each food" : "Change the time, now " + fmt(one)) + '">' + CLOCK + "<b>" + (one === null ? "Times" : fmt(one)) + "</b></button>" +
        '<button class="go" data-pt="log">Log ' + n + (n === 1 ? " item" : " items") + "</button></div>";
    bar.classList.add("up"); document.body.classList.add("pt-on");
    mark();
  }

  /* Zomato's bar: no icon, the foods as the headline (newest first), and
     a line under it that opens the review sheet, where quantity and time
     live. The X does not clear at once: it slides the pill aside to show
     Remove, so one stray tap cannot empty the bar. */
  function renderFloat(fresh, n) {
    bar.classList.add("fm"); document.body.classList.add("pt-fm");
    bar.innerHTML =
      '<div class="flw">' +
        '<button class="rmz" data-pt="clear" tabindex="-1">Remove</button>' +
        '<div class="fl' + (fresh ? " lit" : "") + '">' +
          '<button class="tx" data-pt="review" aria-label="Review what is going into ' + mealNames() + '"><b>' + T.items.slice().reverse().map(function (x) { return x.it.name; }).join(", ") + '</b><span>Edit quantity &amp; time' + CHEV + "</span></button>" +
          '<button class="go" data-pt="log">Log<small>' + n + (n === 1 ? " item" : " items") + "</small></button>" +
          '<button class="xc" data-pt="peek" aria-label="Show remove">' + X + "</button>" +
        "</div></div>";
    bar.classList.add("up"); document.body.classList.add("pt-on");
    mark();
  }
  function peek(open) {
    var w = bar.querySelector(".flw");
    if (!w) return;
    open = open === undefined ? !w.classList.contains("open") : open;
    w.classList.toggle("open", open);
    w.querySelector(".rmz").tabIndex = open ? 0 : -1;
    clearTimeout(peek.t);
    if (open) peek.t = setTimeout(function () { peek(false); }, 4000);   /* it closes itself, as Zomato's does */
  }

  /* the card's own rows: the foods in the bar are marked as chosen */
  function mark() {
    var refs = T ? T.items.map(function (x) { return x.ref; }) : [];
    document.querySelectorAll(".item[data-ref]").forEach(function (row) {
      row.classList.toggle("pt-sel", refs.indexOf(row.dataset.ref) > -1);
    });
    /* One option per meal while the bar holds it: a meal's foods come from the
       option they were picked in, so its other options are locked until the
       bar is logged or cleared. Ref is meal|option|row; added foods (|m|) do
       not belong to an option and lock nothing. */
    var held = {};
    refs.forEach(function (r) { var p = r.split("|"); if (p[1] !== "m") held[p[0]] = p[1]; });
    document.querySelectorAll(".chip[data-meal][data-opt]").forEach(function (ch) {
      var h = held[ch.dataset.meal], lock = h != null && ch.dataset.opt !== h;
      ch.classList.toggle("pt-lock", lock);
      if (lock) { ch.setAttribute("aria-disabled", "true"); ch.dataset.held = +h + 1; }
      else { ch.removeAttribute("aria-disabled"); delete ch.dataset.held; }
    });
  }
  /* the cards repaint themselves (an option switch, a skip), so the marks are put back after every change */
  var pending = false;
  new MutationObserver(function () {
    if (pending) return; pending = true;
    requestAnimationFrame(function () { pending = false; mark(); });
  }).observe(document.body, { childList: true, subtree: true });

  /* The drop, as the logging screen plays it (log.html, toss()): the row lifts
     off as a small card, rises, falls along an arc and shrinks into the bar's
     token stack, and the token appears as it lands. Skipped on reduced motion
     and past three in the air, when the bar alone answers. */
  var INFLIGHT = 0;
  function toss(row, name, sub) {
    if (!row || INFLIGHT >= 3 || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    /* the tray lands on its token stack; the floating bar has no icon, so on the names */
    var stack = bar.querySelector(".stack") || bar.querySelector(".fl .tx b"), a = row.getBoundingClientRect();
    if (!stack || !a.width) return;
    /* the bar may still be sliding up: aim where it ends, not where it is */
    var ty = new DOMMatrix(getComputedStyle(bar).transform).m42, b = stack.getBoundingClientRect();
    var tok = stack.querySelector(".tok");
    if (tok) { tok.style.transform = "scale(0)"; tok.style.opacity = "0"; }
    var m = document.createElement("div");
    m.className = "morsel";
    m.innerHTML = "<b>" + name + "</b>" + (sub ? "<span>" + sub + "</span>" : "");
    document.body.appendChild(m);
    m.style.width = Math.min(240, Math.max(150, a.width * .6)) + "px";
    var mr = m.getBoundingClientRect(), x0 = a.left + 12, y0 = a.top + a.height / 2 - mr.height / 2;
    m.style.left = x0 + "px"; m.style.top = y0 + "px";
    var dx = b.left - x0, dy = (b.top - ty + b.height / 2 - mr.height / 2) - y0, lift = Math.min(40, Math.abs(dy) * .16);
    INFLIGHT++;
    var DUR = 560;
    m.animate([
      { transform: "translate(0,0) scale(1)", opacity: 1, offset: 0, easing: "cubic-bezier(.2,.85,.35,1)" },
      { transform: "translate(" + dx * .1 + "px," + -lift + "px) scale(1)", opacity: 1, offset: .24, easing: "cubic-bezier(.5,0,.85,.4)" },
      { transform: "translate(" + dx * .82 + "px," + dy * .86 + "px) scale(.52)", opacity: .92, offset: .78, easing: "cubic-bezier(.4,0,.2,1)" },
      { transform: "translate(" + dx + "px," + dy + "px) scale(.16)", opacity: 0, offset: 1 }
    ], { duration: DUR, fill: "forwards" });
    /* a timer, not onfinish: a paused timeline (a hidden tab) never finishes,
       and a flier left behind would hold its slot for good */
    setTimeout(function () { m.remove(); INFLIGHT--; }, DUR + 40);
    setTimeout(function () {
      if (tok) {
        tok.style.transform = ""; tok.style.opacity = "";
        tok.animate([{ transform: "scale(.72)", opacity: 0 }, { transform: "scale(1)", opacity: 1 }], { duration: 280, easing: "cubic-bezier(.05,.7,.1,1)" });
      }
      var strip = bar.querySelector(".tally, .fl");
      if (strip) { strip.classList.remove("lit"); void strip.offsetWidth; strip.classList.add("lit"); }
    }, DUR * .8);
  }

  function toggle(c) {
    if (!T) T = { items: [] };
    var at = -1;
    T.items.forEach(function (x, i) { if (x.ref === c.ref) at = i; });
    if (at > -1) T.items.splice(at, 1);
    else T.items.push({ ref: c.ref, m: c.m, it: c.it, n: c.it.n, time: defaultTime(c.m) });
    if (!T.items.length) T = null;
    /* the flight carries the lit strip, so the render does not light it too */
    var flies = at === -1 && !matchMedia("(prefers-reduced-motion: reduce)").matches && INFLIGHT < 3;
    render(at === -1 && !flies);
    if (at === -1) toss(document.querySelector('.item[data-ref="' + c.ref + '"]'), c.it.name, c.it.qty);
    return true;
  }

  /* ---------- sheets ---------- */
  function openSheet(html) {
    sheet.innerHTML = '<div class="sh">' + html + "</div>";
    requestAnimationFrame(function () { sheet.classList.add("on"); });
  }
  function closeSheet() { sheet.classList.remove("on"); }
  function openSheet2(html) {
    sheet2.innerHTML = '<div class="sh">' + html + "</div>";
    var under = sheet.classList.contains("on") && sheet.querySelector(".sh");
    void sheet2.offsetWidth;   /* commit the closed position, so the rise always plays */
    requestAnimationFrame(function () {
      sheet2.classList.add("on");
      if (under) under.classList.add("back");
    });
  }
  function closeSheet2() {
    sheet2.classList.remove("on");
    var under = sheet.querySelector(".sh");
    if (under) under.classList.remove("back");
  }
  function head(title, sub) {
    return '<div class="hd"><div><h4>' + title + "</h4>" + (sub ? '<div class="sub">' + sub + "</div>" : "") + "</div>" +
      '<button class="x" data-pt="close" aria-label="Close">' + X + "</button></div>";
  }
  /* "2 x 1 piece" is the plan's helping at the plan's count. The stepper moves
     the count, so the line is rebuilt from the unit rather than read as written. */
  function helping(x) {
    var unit = String(x.it.qty).replace(/^\s*\d+\s*x\s*/i, "");
    return x.n === 1 ? unit : x.n + " x " + unit;
  }
  function review() {
    var n = count(), late = T.items.filter(future).length;
    /* Asked once, kindly, at the top: some of these are set for later today.
       Log stays greyed until every time is one that has already happened. */
    var ask = late ? '<div class="fbn"><span class="fi">' + CLOCKI + "</span><div>" +
      "<b>" + (late === 1 ? "One time is still to come" : late + " times are still to come") + "</b>" +
      "<p>You can log what you have already eaten. When did you have " + (late === 1 ? "it" : "them") + "?</p>" +
      '<button data-pt="setnow">Set ' + (late === 1 ? "it" : "them") + " to now, " + fmt(Math.floor(nowMin() / 5) * 5) + "</button></div></div>" : "";
    openSheet(head("Food items to log") + ask +
      T.items.map(function (x, i) {
        return '<div class="pi"><div class="t"><div class="nm">' + x.it.name + '</div><div class="mt">' + helping(x) + " · " + Math.round(x.it.cal / x.it.n * x.n) + " kcal</div></div>" +
          '<div class="ctl"><button class="tc' + (future(x) ? " fut" : "") + '" data-pt="wheel" data-i="' + i + '" aria-label="Change the time for ' + x.it.name + ', now ' + fmt(x.time) + '">' + CLOCK + fmt(x.time) + "</button>" +
          /* minus at one takes the food out; the label says so, the glyph stays a minus */
          '<div class="st"><button data-pt="dec" data-i="' + i + '" aria-label="' + (x.n === 1 ? "Remove " : "One less ") + x.it.name + '">' + MINUS + "</button><b>" + x.n + "</b>" +
          '<button data-pt="inc" data-i="' + i + '" aria-label="One more ' + x.it.name + '">' + PLUS + "</button></div></div></div>";
      }).join("") +
      /* the sheet ends the job: Log is here, with the total beside it, so there is no Done that only closes */
      '<div class="ft"><div class="tot"><span>Total</span><b>' + kcal() + ' kcal</b></div>' +
      '<button class="done" data-pt="sheetlog"' + (late ? " disabled" : "") + '>Log ' + n + (n === 1 ? " item" : " items") + "</button></div>");
  }
  /* The time sheet, with a wheel. i is the food it is for; -1 is every food in
     the bar at once, which is what the tray's time button means. Done goes
     back to the review sheet when it came from there, else closes. */
  var WH = { i: -1, back: false };
  function col(cls, vals, at) {
    return '<div class="wc ' + cls + '" data-wc="' + cls + '">' + vals.map(function (v, k) {
      return '<div' + (k === at ? ' class="on"' : "") + ' data-k="' + k + '">' + v + "</div>";
    }).join("") + "</div>";
  }
  function wheel(i, back) {
    WH = { i: i, back: back };
    var t = i < 0 ? oneTime() : T.items[i].time;
    if (t === null) t = T.items[0].time;
    var h = Math.floor(t / 60) % 24, m = t % 60;
    var hrs = [], mins = [];
    for (var k = 1; k <= 12; k++) hrs.push(String(k));
    for (k = 0; k < 60; k++) mins.push((k < 10 ? "0" : "") + k);
    openSheet2(head("When did you have it?", i < 0 ? "Every food in the bar" : T.items[i].it.name) +
      '<div class="wh"><span class="wband"></span>' + col("hr", hrs, (h % 12 || 12) - 1) + col("mn", mins, m) + col("ap", ["AM", "PM"], h < 12 ? 0 : 1) + "</div>" +
      '<div class="whint" aria-live="polite"></div><button class="done" data-pt="setwheel">Done</button>');
    /* Each column starts a few steps short of its value and rolls the rest of
       the way once the sheet has nearly landed, so the time is seen arriving. */
    var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    requestAnimationFrame(function () {
      sheet2.querySelectorAll(".wc").forEach(function (c, ci) {
        var on = c.querySelector(".on"), to = on ? +on.dataset.k * 44 : 0;
        /* three steps for hour and minute, one for AM or PM; from below when there is no room above */
        var step = ci === 2 ? 44 : 132, from = to >= step ? to - step : to + step;
        c.scrollTop = reduce ? to : from;
        if (!reduce && from !== to) setTimeout(function () { c.scrollTo({ top: to, behavior: "smooth" }); }, 240 + ci * 60);
        c.addEventListener("scroll", function () {
          clearTimeout(c.t);
          c.t = setTimeout(function () { pick(c); guard(); }, 60);
        });
      });
      guard();
    });
  }
  /* The times still to come on today's wheel read grey: every hour past now
     at the chosen half of the day, the minutes past now in this hour, and PM
     while it is still morning. Pick one anyway and Done waits, with a line why. */
  function guard() {
    var hc = sheet2.querySelector('[data-wc="hr"]'), mc = sheet2.querySelector('[data-wc="mn"]'), ac = sheet2.querySelector('[data-wc="ap"]');
    if (!hc) return;
    var k = function (c) { var o = c.querySelector(".on"); return o ? +o.dataset.k : 0; };
    var pm = k(ac) === 1, hSel = k(hc) + 1, now = nowMin(), today = isToday();
    var at = function (h, m, p) { return (h % 12 + (p ? 12 : 0)) * 60 + m; };
    [].forEach.call(hc.children, function (d, j) { d.classList.toggle("fut", today && at(j + 1, 0, pm) > now); });
    [].forEach.call(mc.children, function (d, j) { d.classList.toggle("fut", today && at(hSel, j, pm) > now); });
    [].forEach.call(ac.children, function (d, j) { d.classList.toggle("fut", today && at(12, 0, j === 1) > now); });
    var late = today && at(hSel, k(mc), pm) > now;
    sheet2.querySelector(".whint").textContent = late ? "That time has not come yet today" : "";
    var done = sheet2.querySelector('[data-pt="setwheel"]');
    if (late) done.setAttribute("disabled", ""); else done.removeAttribute("disabled");
  }
  function pick(c) {
    var k = Math.max(0, Math.min(c.children.length - 1, Math.round(c.scrollTop / 44)));
    [].forEach.call(c.children, function (d, j) { d.classList.toggle("on", j === k); });
    return k;
  }
  /* a tap on a number in the wheel brings it to the band */
  sheet2.addEventListener("click", function (e) {
    var d = e.target.closest(".wc div");
    if (!d) return;
    var c = d.parentNode, reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    c.scrollTo({ top: +d.dataset.k * 44, behavior: reduce ? "auto" : "smooth" });
  });
  function setWheel() {
    var g = function (n) { return pick(sheet2.querySelector('[data-wc="' + n + '"]')); };
    var h = g("hr") + 1, m = g("mn"), pm = g("ap") === 1;
    var t = (h % 12 + (pm ? 12 : 0)) * 60 + m;
    if (WH.i < 0) T.items.forEach(function (x) { x.time = t; });
    else T.items[WH.i].time = t;
    render();
    /* the list behind is redrawn while still covered, then the time sheet
       lowers and the changed time flashes once where it now sits */
    if (WH.back) {
      review();
      var under = sheet.querySelector(".sh");
      if (under) { under.style.transition = "none"; under.classList.add("back"); void under.offsetWidth; under.style.transition = ""; }
      var i = WH.i;
      setTimeout(function () {
        sheet.querySelectorAll(".tc").forEach(function (c) {
          if (i < 0 || +c.dataset.i === i) { c.classList.remove("flash"); void c.offsetWidth; c.classList.add("flash"); }
        });
      }, 180);
    }
    closeSheet2();
  }

  /* ---------- log ---------- */
  function facts() {
    var MK = ["p", "c", "fa"], NAME = ["Protein", "Carbs", "Fats"], KEY = ["p", "c", "f"];
    var TG = window.TGT || [];
    var best = 0, share = 0;
    MK.forEach(function (k, i) {
      var g = T.items.reduce(function (s, x) { return s + (x.it[k] || 0) * x.n; }, 0), sh = TG[i] ? g / TG[i] : 0;
      if (sh > share) { share = sh; best = i; }
    });
    var n = count();
    return { d: Math.max(1, Math.min(12, Math.round(share * 34))), queued: false, meal: mealNames(), many: meals().length > 1, n: n, key: KEY[best],
      moved: NAME[best] + " moved most", sub: n + (n === 1 ? " item" : " items") + " into " + mealNames(),
      names: T.items.map(function (x) { return x.it.name; }), kcal: kcal(),
      lines: T.items.map(function (x) { return { name: x.it.name, kcal: Math.round(x.it.cal / x.it.n * x.n) }; }),
      g: { p: 0, c: 0, f: 0 } };
  }
  function log() {
    var f = facts(), go = bar.querySelector(".go");
    /* one entry per meal: its option is the one its first food came from */
    var save = { state: Q.get("state") || "", t: Date.now(), meals: meals().map(function (m) {
      var mine = T.items.filter(function (x) { return x.m === m; });
      return { meal: m.id, opt: +mine[0].ref.split("|")[1], refs: mine.map(function (x) { return x.ref; }) };
    }) };
    var land = function () {
      try { sessionStorage.setItem("gfInline", JSON.stringify(save)); sessionStorage.setItem("gfLogged", String(f.d)); } catch (e) {}
      try { history.scrollRestoration = "manual"; } catch (e) {}
      window.scrollTo(0, 0);   /* so the reload never puts the day back where the bar was */
      location.reload();
    };
    var rect = go.getBoundingClientRect();
    /* the win moment is loaded only now: its stylesheet owns ".wm", which this
       screen also uses (the calorie watermark), so it must not sit here idle */
    var run = function () {
      var ctl = window.WinMoment && WinMoment.begin(rect, f.names);
      bar.classList.remove("up");
      if (!ctl) return land();
      setTimeout(function () { ctl.win(f, land); }, 600);   /* the save */
    };
    if (window.WinMoment) return run();
    var sc = document.createElement("script"); sc.src = "assets/win-moment.js?v=14";
    sc.onload = run; sc.onerror = land; document.head.appendChild(sc);
  }

  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-pt]");
    if (!b) { if (e.target === sheet2) closeSheet2(); else if (e.target === sheet) closeSheet(); if (!e.target.closest(".pt")) peek(false); return; }
    var a = b.dataset.pt;
    if (a === "peek") return peek();
    if (a !== "clear") peek(false);
    if (a === "clear") { T = null; return render(); }
    if (a === "review") return review();
    if (a === "time") return oneTime() === null ? review() : wheel(-1, false);
    if (a === "wheel") return wheel(+b.dataset.i, true);
    if (a === "setwheel") return setWheel();
    /* the X on the wheel steps back to the list it came from, rather than dropping the whole review */
    if (a === "close") return b.closest(".pt2") ? closeSheet2() : closeSheet();
    if (a === "inc" || a === "dec") {
      var x = T.items[+b.dataset.i];
      x.n += a === "inc" ? 1 : -1;
      if (x.n <= 0) T.items.splice(+b.dataset.i, 1);
      if (!T.items.length) { closeSheet(); T = null; return render(); }
      render(); return review();
    }
    if (a === "log") return anyFuture() ? review() : log();
    if (a === "sheetlog") { if (anyFuture()) return; closeSheet(); return log(); }
    if (a === "setnow") {
      var t = Math.floor(nowMin() / 5) * 5;
      T.items.forEach(function (x) { if (future(x)) x.time = t; });
      render(); review();
      setTimeout(function () { sheet.querySelectorAll(".tc").forEach(function (c) { c.classList.remove("flash"); void c.offsetWidth; c.classList.add("flash"); }); }, 60);
      return;
    }
  });

  if (Q.get("pt") === "future") setTimeout(function () {
    ["dinner", "bed"].forEach(function (id) {
      [].slice.call(document.querySelectorAll('.item[data-ref^="' + id + '|"]:not(.done) .tickbtn')).slice(0, 2).forEach(function (b) { b.click(); });
    });
    setTimeout(function () { var g = bar.querySelector(".go"); if (g) g.click(); }, 900);
  }, 700);

  window.GFPlanTray = { toggle: toggle };
})();
