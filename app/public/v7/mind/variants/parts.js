/* Mind: "What shaped your score?" as two parts, Sleep quality (of 70) and Self-care (of 30), on the real screen.
   The card is Move's and Eat's: the indigo panel with white glass tiles that fill to what was earned. What changes
   between variants is only where the explanation lives (research doc: mind/research/score-parts.html):
   ?vparts=a  an info button on each tile, each opens its own sheet (recommended)
   ?vparts=b  one info button beside the section title, one sheet for both parts
   ?vparts=c  a strip along the bottom of the card, "How your Rhythm adds up", one sheet for both
   ?vparts=d  nothing extra on the card: the tiles open the Rhythm sheet, which gains "How your Rhythm is shaped"
   ?vparts=e  the split shown on the tiles themselves (three small lines each), a tap on a tile explains it
   ?vparts=f  an indigo strip under the two tiles, "How your Rhythm is shaped ⓘ", as Move's rest-day strip (default, 17 Nov 2026)
   Every sheet is Eat's Nutrition breakdown: one bar per part, the share of the Rhythm it gives out of what it can give,
   then "For a good score" in a few words, and a sticky Got it. Shares are said as % of the Rhythm, never "points".
   Weights from mind/plan.js (P.w): Sleep duration 25, Sleep consistency 25, Wind-down 20, Breathing 10, Me-time 10,
   Mood 10. A part the plan leaves out sits out and the rest scale up, exactly as mind/rhythm.js scores it.
   Takes over window.paintMacros, which rhythm.js calls after every change, as variants/tiles.js does. */
(function () {
  var MD = window.MDPLAN; if (!MD || MD.noplan) return;
  var Q = MD.Q, V = (Q.get("vparts") || "f").toLowerCase(), P = MD.P, S = MD.S;
  if (!/^[a-f]$/.test(V)) V = "f";
  /* F's tiles, no subtext (17 Nov 2026): ?vtile=m Move's glass exactly (number, "of 70%" under it, the swell on the fill),
     i the number and "of 70%" on one line in a shorter tile, s a slim bar split into the group's parts under the number */
  var IB = Q.get("vib") === "1", GOLD = Q.get("vrs") === "gold";   /* doc options: an info icon on each tile too; the strip in Move's gold */
  var VT = (Q.get("vtile") || "i").toLowerCase(); if (!/^[mis]$/.test(VT)) VT = "i";
  var box = document.getElementById("macros"); if (!box) return;
  var RD = matchMedia("(prefers-reduced-motion: reduce)").matches || Q.get("rm") === "1";

  function dur(m) { m = Math.max(0, Math.round(m)); return Math.floor(m / 60) + "h " + ("0" + m % 60).slice(-2) + "m"; }
  function gap(m) { m = Math.round(Math.abs(m)); var h = Math.floor(m / 60), x = m % 60; return h ? h + "h" + (x ? " " + x + "m" : "") : x + " min"; }
  var t12 = function (s) { return MD.niceS(s).replace(":00", ""); };
  var edge = function (d) { return Math.abs(d) <= P.tol ? "on time" : gap(d) + (d > 0 ? " late" : " early"); };

  /* ---------- the day, read live from rhythm.js ---------- */
  function data() {
    var pr = window.MDRHYTHM.parts(), sl = pr.sleep, on = MD.logged();
    var cnt = function (k) { return P[k].filter(function (x, i) { return S[k][i]; }).length; };
    var has = { wd: P.wd.length, br: P.br.length, me: P.me.length }, W = window.MDRHYTHM.weights();   /* a part left out shares its points inside its own group */
    var moodN = S.vm ? S.vm.filter(Boolean).length : S.mood >= 0 ? 1 : 0, moodT = S.vmSlots || 1;
    var row = function (k, n, today, how) { return { k: k, n: n, pts: Math.round(W[k] * pr[k]), max: Math.round(W[k]), p: pr[k], today: today, how: how }; };
    var cons = !on ? "Not logged yet" : !sl.judged ? "Under 3 hours asleep, so it does not count today"
      : "Slept " + window.MDSLEEP.clk(sl.night.bed) + ", " + edge(sl.db) + ". Woke up " + window.MDSLEEP.clk(sl.night.wake) + ", " + edge(sl.dw);
    var sleep = [
      row("hours", "Sleep duration", on ? dur(sl.slept * 60) + " asleep" : "Not logged yet",
        "Sleep close to the " + dur(P.hours * 60) + " your coach set. Naps count too."),
      row("window", "Sleep consistency", cons,
        "Go to bed near " + t12(P.bed) + " and wake up near " + t12(P.wake) + ". Within 30 minutes, early or late, gets full points.")
    ];
    if (has.wd) sleep.push(row("wd", "Wind-down", cnt("wd") + " of " + P.wd.length + " done", "Tick off the evening steps your coach set. Each one earns its share."));
    var care = [];
    if (has.br) care.push(row("br", "Breathing", cnt("br") + " of " + P.br.length + " done", "Finish each breathing exercise in your plan."));
    if (has.me) care.push(row("me", "Me-time", cnt("me") ? "Done" : "Not yet", "Do any one thing for yourself today."));
    care.push(row("mood", "Mood check-in", moodT > 1 ? moodN + " of " + moodT + " done" : moodN ? "Done" : "Not yet",
      "Tell us how you feel. Any answer counts, so a low day never costs points."));
    var tot = function (L, key) { return L.reduce(function (a, x) { return a + x[key]; }, 0); };
    return {
      sleep: { n: "Sleep quality", rows: sleep, pts: tot(sleep, "pts"), max: tot(sleep, "max"), g: "glyph-sleep",
        lead: "How well you slept last night and how you got ready for it." },
      care: { n: "Self-care", rows: care, pts: tot(care, "pts"), max: tot(care, "max"), g: "glyph-care",
        lead: "The small things you do for your mind during the day." },
      scaled: !has.wd || !has.br || !has.me
    };
  }

  /* ---------- small pieces ---------- */
  var INFO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>';
  var CHEV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>';
  var pct = function (a, b) { return b ? Math.round(Math.max(0, Math.min(1, a / b)) * 100) : 0; };
  var SUB = { sleep: "Duration, consistency, wind\u2011down", care: "Breathing, me\u2011time, mood" };
  var SHORT = { hours: "Duration", window: "Consistency", mood: "Mood" };

  /* F's tiles: Move's .m glass from index.html, so the fill, its swell and the type are the same as Move's and Eat's */
  /* each part as its own score out of 100 (17 Nov 2026): the 70 and 30 weights are never shown to the person */
  var own = function (G) { return G.max ? Math.round(G.pts / G.max * 100) : 0; };
  function tileF(key, G) {
    var p = pct(G.pts, G.max), st = p >= 100 ? " done" : p <= 0 ? " still" : "";
    var lbl = G.n + ", " + own(G) + "% of 100%. How it is shaped";
    var val = VT !== "m" ? '<span class="mval"><strong>' + own(G) + '%</strong><span> of 100%</span></span>'
      : '<span class="mval"><strong>' + own(G) + '%</strong></span><span class="mof">of 100%</span>';
    var split = VT === "s" ? '<span class="vp-seg">' + G.rows.map(function (r) {
      return '<i style="flex:' + r.max + '"><b style="width:' + pct(r.pts, r.max) + '%"></b></i>'; }).join("") + '</span>' : "";
    return '<button class="m vp-m' + st + (VT === "i" ? " nof" : "") + '" data-vp="' + key + '" aria-label="' + lbl + '">' +
      '<span class="tpool"><span class="gfill' + (VT === "s" ? " vp-nofill" : "") + '" style="--f:' + p + '%"></span></span>' +
      '<span class="ttop"><span class="tgl ' + G.g + '"></span>' + G.n + '</span>' + (IB ? '<span class="vp-ib" aria-hidden="true">' + INFO + '</span>' : "") + val + split + '</button>';
  }
  function tile(key, G, d) {
    if (V === "f") return tileF(key, G);
    var ib = V === "a" ? '<span class="vp-ib" aria-hidden="true">' + INFO + '</span>' : "";
    var split = V === "e" ? '<span class="vp-mini">' + G.rows.map(function (r) { return '<span><em>' + (SHORT[r.k] || r.n) + '</em><b>' + r.pts + '<small>/' + r.max + '</small></b></span>'; }).join("") + '</span>'
      : '<span class="vp-sub">' + SUB[key] + '</span>';
    var lbl = G.n + ", " + own(G) + "% of 100%. " + (V === "d" ? "Opens your Rhythm" : "How it is shaped");
    return '<button class="vp-t" data-vp="' + key + '" aria-label="' + lbl + '">' +
      '<span class="tpool"><span class="vf" data-k="' + key + '" style="--to:' + pct(G.pts, G.max) + '%"></span></span>' +
      '<span class="ttop"><span class="tgl ' + G.g + '"></span>' + G.n + '</span>' + ib +
      '<span class="vp-v"><b>' + own(G) + '%</b><small> of 100%</small></span>' + split + '</button>';
  }

  /* one part as Eat's Nutrition breakdown: "Sleep duration : 24%", "Out of 25%" on the right, the bar, then what the part
     is and what earns a good score, one plain line each. A group opens with why it matters. */
  /* the sheets explain, they do not track (17 Nov 2026): what each part is, how much of the Rhythm it is, and what helps.
     No bars and no today's numbers: the card and the Rhythm breakdown already show progress */
  var LEAD1 = { sleep: "Sleep quality shapes most of your Rhythm.", care: "Self-care makes up the rest of your Rhythm." };
  var WHY = {
    sleep: "A good night sets up everything after it: your focus and how much energy you have.",
    care: "Small moments of care through the day keep stress low and help your mind stay steady."
  };
  function rowText(k) {
    var hrs = P.hours % 1 ? dur(P.hours * 60) : P.hours + " hours";
    return {
      hours: ["How long you slept. Naps count too.", "Aim for about " + hrs + " of sleep, the amount your coach set for you."],
      window: ["How close your bedtime and wake-up were to your plan.", "Go to bed near " + t12(P.bed) + " and get up near " + t12(P.wake) + ", even on weekends."],
      wd: ["The calm evening steps your coach picked to help you fall asleep.", "Tick each one off as you do it before bed."],
      br: ["The breathing exercises in your plan.", "Finish each one. Even a few minutes help you feel calmer."],
      me: ["A little time that is just for you.", "Do any one thing your coach suggested."],
      mood: ["A quick note on how you feel.", "Check in each time. There is no wrong answer, every answer counts."]
    }[k];
  }
  function rowHTML(r) {
    var t = rowText(r.k);
    return '<div class="vp-ex"><div class="vp-exh"><i class="vp-ic vp-ic-' + r.k + '" aria-hidden="true"></i><strong>' + r.n + '</strong></div>' +
      '<p class="vp-say">' + t[0] + '</p><p class="vp-good"><span>For a good score</span>' + t[1] + '</p></div>';
  }
  function part(key, G) {
    return '<div class="vp-gh"><span class="tgl ' + G.g + '"></span><b>' + G.n + '</b></div>' +
      '<p class="vp-why">' + WHY[key] + '</p>' + G.rows.map(rowHTML).join("");
  }
  function sheet(which) {
    var d = data(), title = which === "sleep" ? "Sleep quality" : which === "care" ? "Self-care" : "How your Rhythm is shaped";
    var lead = '<div class="msub">Your daily Rhythm comes from two parts, sleep quality and self\u2011care. Sleep quality shapes most of it. Here is what each one means.</div>';
    /* one part: its title is the sheet's, so one line says how much of the Rhythm it is and why it matters, then its pieces */
    var html = which === "both" ? lead + part("sleep", d.sleep) + '<hr class="vp-hr">' + part("care", d.care)
      : '<div class="msub">' + LEAD1[which] + " " + WHY[which] + '</div>' + d[which].rows.map(rowHTML).join("");
    window.GFOpenSheet("vpSheet", title, '<div class="vp-sh">' + html + '<div class="vp-foot"><button class="md-save vp-ok">Got it</button></div></div>');
    var el = document.getElementById("vpSheet"); el.querySelector(".vp-ok").onclick = function () { window.closeSheets(); };
  }

  /* D: the Rhythm sheet carries the split, under its tiles */
  function rhythmSec(d) {
    var sb = document.querySelector("#es-suff .sbody"); if (!sb) return;
    var old = document.getElementById("vpSec"); if (old) old.remove();
    var sec = document.createElement("div"); sec.id = "vpSec"; sec.className = "esec vp-sh";
    sec.innerHTML = '<h5>How your Rhythm is shaped</h5><div class="msub">Sleep quality shapes most of your Rhythm; self-care makes up the rest.</div>' + part("sleep", d.sleep) + '<hr class="vp-hr">' + part("care", d.care);
    var after = sb.querySelector(".echips") || sb.querySelector(".ebub-wrap");
    after ? after.after(sec) : sb.prepend(sec);
  }

  /* B: one info button beside the section title */
  function headInfo() {
    var h = document.getElementById("railTitle"); if (!h || h.querySelector(".vp-hi")) return;
    var b = document.createElement("button"); b.className = "vp-hi"; b.setAttribute("aria-label", "How your Rhythm is shaped"); b.innerHTML = INFO;
    b.onclick = function () { sheet("both"); }; h.appendChild(b);
  }

  /* the Rhythm sheet's tiles say the same two parts as the card; rhythm.js refills them each time the sheet opens, so they are set again after it */
  function chips(d) {
    var ec = document.querySelector("#es-suff .echips"); if (!ec) return;
    ec.className = "echips two";
    ec.innerHTML = [d.sleep, d.care].map(function (G) { return '<div><span class="top"><span class="' + G.g + ' eglyph"></span>' + G.n + '</span><b>' + own(G) + '%<small> of 100%</small></b></div>'; }).join("");
  }
  (function watch(n) {
    var sh = document.getElementById("es-suff");
    if (!sh) { setTimeout(function () { watch(n + 1); }, n < 60 ? 100 : 500); return; }   /* keep looking: on a busy page the sheet can be built late (17 Nov 2026) */
    new MutationObserver(function () { if (sh.classList.contains("on") && window.MDRHYTHM) setTimeout(function () { chips(data()); }, 0); }).observe(sh, { attributes: true, attributeFilter: ["class"] });
  })(0);

  var was = {};
  function paint() {
    if (!window.MDRHYTHM) return;
    var d = data();
    box.className = "macros tiles vp vp-" + V;
    box.innerHTML = '<div class="vp-g2' + (V === "f" ? " mgrid" : "") + '">' + tile("sleep", d.sleep, d) + tile("care", d.care, d) + '</div>' +
      (V === "c" ? '<button class="vp-strip" data-vp="both">' + INFO + '<span>How your Rhythm adds up</span>' + CHEV + '</button>' : "") +
      "";
    /* F: Move's rest-day strip (move/rest-variants.js .rv-r.rv-r5), the same strip in indigo, under the card's tiles */
    var rs = document.getElementById("vpRs"); if (rs) rs.remove();
    if (V === "f" && Q.get("vstrip") !== "0") box.insertAdjacentHTML("afterend", '<button class="vp-rs' + (GOLD ? " gold" : "") + '" id="vpRs" data-vp="both" aria-label="Learn more about your Rhythm breakdown"><span>Learn more about your Rhythm breakdown</span>' + INFO + '</button>');
    [].forEach.call(box.parentNode.querySelectorAll("[data-vp]"), function (b) {
      b.onclick = function () { V === "d" ? window.openMomentum && window.openMomentum() : sheet(V === "b" || V === "c" ? "both" : b.dataset.vp); };
    });
    /* the Rhythm sheet's tiles say the same two parts as the card */
    chips(d);
    if (V === "d") rhythmSec(d);
    if (V === "b") headInfo();
    var f = box.querySelectorAll(".vf");
    [].forEach.call(f, function (x) { x.style.setProperty("--f", RD ? x.style.getPropertyValue("--to") : was[x.dataset.k] || "0%"); });
    if (RD) return;
    void box.offsetWidth;
    [].forEach.call(f, function (x, i) { if (!was[x.dataset.k]) x.style.transitionDelay = i * 90 + "ms"; x.style.setProperty("--f", x.style.getPropertyValue("--to")); was[x.dataset.k] = x.style.getPropertyValue("--to"); });
  }
  window.paintMacros = function () { paint(); };
  box.innerHTML = "";
  (function wait(n) { if (window.MDRHYTHM) paint(); else if (n < 60) setTimeout(function () { wait(n + 1); }, 50); })(0);

  /* doc helpers: ?scroll=tiles opens the screen at the card; ?vpsheet=sleep|care|both|rhythm opens a sheet */
  if (Q.get("scroll") === "tiles") setTimeout(function () { var t = document.getElementById("railSect"); window.scrollTo(0, t.getBoundingClientRect().top + window.scrollY - 12); }, 1200);
  var vs = Q.get("vpsheet");
  if (vs) setTimeout(function () { vs === "rhythm" ? window.openMomentum && window.openMomentum() : sheet(vs); }, 1300);

  /* ---------- the look: indigo only (25 #F5F8FF, 50 #EEF4FF, 100 #E0EAFF, 200 #C7D7FE, 300 #A4BCFD, 600 #444CE7, 700 #3538CD, 900 #2D3282), greys for words ---------- */
  var css = document.createElement("style");
  css.textContent = [
    "#macros.vp{padding:10px 10px 12px}",
    ".vp .vp-g2{display:grid;grid-template-columns:1fr 1fr;gap:8px}",
    ".vp .vp-t{position:relative;display:flex;flex-direction:column;align-items:stretch;min-height:104px;border-radius:18px;overflow:hidden;background:rgba(255,255,255,.8);box-shadow:inset 0 0 0 1px rgba(164,188,253,.55);padding:12px 10px;text-align:left;font:inherit;color:inherit;border:0;min-width:0;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:transform .2s cubic-bezier(.4,0,.2,1)}",
    ".vp .vp-t:active{transform:scale(.98)}",
    ".vp .vp-t > *:not(.tpool){position:relative}",
    ".vp .tpool{position:absolute;inset:4px;border-radius:14px;overflow:hidden}",
    ".vp .tpool .vf{position:absolute;left:0;right:0;bottom:0;height:var(--f);background:linear-gradient(to top,#EEF4FF,#C7D7FE);transition:height 1.1s cubic-bezier(.4,0,.2,1)}",
    ".vp .ttop{display:flex;align-items:center;gap:4px;font:400 12px/16px Roboto,sans-serif;color:#475467;white-space:nowrap}",
    ".vp .vp-v{margin-top:12px;color:#2D3282;font-variant-numeric:tabular-nums;white-space:nowrap}.vp .vp-v b{font:700 22px/26px Roboto,sans-serif}.vp .vp-v small{font:400 13px/16px Roboto,sans-serif;color:#475467}",
    ".vp .vp-sub{margin-top:4px;font:400 11px/15px Roboto,sans-serif;color:#667085}",
    ".vp .vp-ib{position:absolute !important;right:2px;top:2px;width:32px;height:32px;display:grid;place-items:center;color:#475467}.vp .vp-ib svg{width:16px;height:16px}",
    ".vp-a .vp-t .ttop{padding-right:22px}",
    ".vp .vp-mini{display:flex;flex-direction:column;gap:2px;margin-top:6px}.vp .vp-mini span{display:flex;justify-content:space-between;gap:6px;font:400 11px/15px Roboto,sans-serif;color:#475467}",
    ".vp .vp-mini em{font-style:normal}.vp .vp-mini b{font-weight:600;color:#2D3282;font-variant-numeric:tabular-nums}.vp .vp-mini small{font-weight:400;color:#667085}",
    ".vp .vp-strip{display:flex;align-items:center;gap:8px;width:100%;min-height:44px;margin-top:8px;padding:0 6px;border:0;background:none;font:500 13px/18px Roboto,sans-serif;color:#3538CD;cursor:pointer;text-align:left}",
    ".vp .vp-strip span{flex:1}.vp .vp-strip svg{width:16px;height:16px;flex:none}",
    ".vp-hi{position:relative;display:inline-grid;place-items:center;width:24px;height:24px;margin-left:-6px;border:0;background:none;color:#475467;cursor:pointer;vertical-align:middle}.vp-hi::after{content:'';position:absolute;inset:-10px}.vp-hi svg{width:18px;height:18px}",
    /* Move's header row inside the card: the line Eat and Move use for calories, here it leads to the breakdown */
    /* Move's rest-day strip (move/rest-variants.js r5) in indigo: a soft glow from the centre, the words centred */
    /* the card's indigo panel fades out at its foot, so Last night sits a little closer than the usual 40px (17 Nov 2026) */
    "#railSect:not([hidden]) ~ #svCard{margin-top:28px}",
    /* F's tiles: index.html's .macros.tiles .m, as a button, two to a row */
    ".vp-f .vp-g2.mgrid{grid-template-columns:1fr 1fr}",
    ".vp-f .m.vp-m{border:0;width:100%;text-align:left;font:inherit;color:inherit;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:transform .2s cubic-bezier(.4,0,.2,1)}.vp-f .m.vp-m:active{transform:scale(.98)}",
    ".vp-f .m.vp-m .mval strong{font-weight:700}.vp-f .m.vp-m .mval span{margin-left:2px}",
    /* s: the bar sits where the "of" line would, the glass stays clear so the bar is the one reading */
    ".vp-f .m.vp-m.nof{height:74px;min-height:74px}.vp-f .vp-nofill{display:none}",
    ".vp-f .vp-seg{display:flex;gap:3px;margin-top:8px;height:6px}.vp-f .vp-seg i{display:block;height:100%;border-radius:2px;background:#E0EAFF;overflow:hidden}.vp-f .vp-seg b{display:block;height:100%;background:#444CE7}",
    /* Move's rest-day strip (move/rest-variants.js .rv-r.rv-r5) in indigo: same size, type and glow from the middle. The glow
       reaches nothing at the side edges (50% wide), so the strip has no hard ends on the card's own indigo fade */
    ".vp-rs{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;height:40px;margin-top:2px;padding:0 12px;border:0;border-radius:12px;color:#3538CD;font:500 13px/16px Roboto,sans-serif;text-align:left;cursor:pointer;" +
      "background:radial-gradient(50% 170% at 50% 50%,rgb(224 232 255/.95),rgb(224 232 255/.6) 50%,rgb(224 232 255/.15) 85%,rgb(224 232 255/0))}",
    /* the same strip in Move's gold, exactly as the rest day's (olive words, gold glow) */
    ".vp-rs.gold{color:#826E2D;background:radial-gradient(75% 170% at 50% 50%,rgb(255 248 224/.95),rgb(255 248 224/.55) 55%,rgb(255 248 224/.12) 92%,rgb(255 248 224/0))}",
    ".vp-f .m.vp-m .ttop{padding-right:" + (IB ? 22 : 0) + "px}",
    ".vp-rs span{flex:none}.vp-rs svg{flex:none;width:16px;height:16px}",
    /* nothing in the sheet under 14px */
    ".vp-sh .msub{margin:-4px 0 8px;font-size:14px;line-height:20px}",
    ".vp-sh .vp-why{margin:6px 0 4px;font:400 14px/20px Roboto,sans-serif;color:#475467}",
    ".vp-sh .ir .top strong{font-weight:600;color:#101828}",
    ".vp-ex{padding:16px 0 4px}.vp-exh{display:flex;justify-content:space-between;gap:12px;font:600 15px/22px Roboto,sans-serif;color:#101828}.vp-exh span{font-weight:500;color:#667085;font-variant-numeric:tabular-nums}",
    ".vp-sh .vp-ex .vp-say{margin:4px 0 0;font:400 15px/22px Roboto,sans-serif;color:#475467}",
    ".vp-sh .vp-ex .vp-good{margin:8px 0 0;padding:10px 12px;border-radius:10px;background:#F5F8FF;font:400 15px/22px Roboto,sans-serif;color:#344054}.vp-good span{display:block;font:600 15px/22px Roboto,sans-serif;color:#3538CD;margin-bottom:2px}",
    /* each part with its icon, and "For a good score" in a light gold box that fades out to the right, the label in dark gold (17 Nov 2026) */
    ".vp-exh{align-items:center;justify-content:flex-start;gap:10px}.vp-ic{flex:none;width:20px;height:20px;background:#344054;-webkit-mask:var(--m) center/contain no-repeat;mask:var(--m) center/contain no-repeat}",
    ".vp-ic-hours{--m:url(/mind/icons/moon.svg)}",
    ".vp-ic-window{--m:url(/v7/mind/icons/clock.svg)}",
    ".vp-ic-wd{--m:url(/mind/icons/sunset.svg)}",
    ".vp-ic-br{--m:url(\"data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23000%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M12.8%2019.6A2%202%200%201%200%2014%2016H2%22/%3E%3Cpath%20d%3D%22M17.5%208a2.5%202.5%200%201%201%202%204H2%22/%3E%3Cpath%20d%3D%22M9.8%204.4A2%202%200%201%201%2011%208H2%22/%3E%3C/svg%3E\")}",
    ".vp-ic-me{--m:url(/mind/icons/care.svg)}",
    ".vp-ic-mood{--m:url(\"data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22%23000%22%20fill-rule%3D%22evenodd%22%20d%3D%22M12%202a10%2010%200%201%201%200%2020%2010%2010%200%200%201%200-20Zm-3.5%207a1.3%201.3%200%201%200%200%202.6%201.3%201.3%200%200%200%200-2.6Zm7%200a1.3%201.3%200%201%200%200%202.6%201.3%201.3%200%200%200%200-2.6ZM7.6%2013.6a1%201%200%200%200-.2%201.4c1.1%201.5%202.8%202.5%204.6%202.5s3.5-1%204.6-2.5a1%201%200%201%200-1.6-1.2c-.7%201-1.8%201.7-3%201.7s-2.3-.7-3-1.7a1%201%200%200%200-1.4-.2Z%22/%3E%3C/svg%3E\")}",   /* filled, as the other icons */
    ".vp-sh .vp-ex .vp-good{background:linear-gradient(90deg,#FFF8E0,#FFFBEE 55%,rgba(255,251,238,0))}.vp-good span{color:#826E2D !important}",
    ".vp-sh .ir .vp-say{margin:12px 0 0;font:400 14px/20px Roboto,sans-serif;color:#667085}",
    ".vp-sh .ir .vp-good{margin:4px 0 0;font:400 14px/20px Roboto,sans-serif;color:#667085}",
    ".vp-sh .ir{padding:20px 0 4px}.vp-sh .ir .track{margin-top:12px}",
    ".vp-hr{border:0;border-top:1px solid #EAECF0;margin:24px 0 0}",
    ".vp .vp-hd{display:flex;align-items:center;gap:8px;width:100%;min-height:44px;margin:-2px 0 10px;padding:0 6px 10px;border:0;border-bottom:1px solid rgba(164,188,253,.45);background:none;font:400 14px/20px Roboto,sans-serif;color:#344054;text-align:left;cursor:pointer;-webkit-tap-highlight-color:transparent}",
    ".vp .vp-hdi{display:grid;place-items:center;width:20px;height:20px;color:#3538CD}.vp .vp-hdi svg{width:18px;height:18px}",
    ".vp .vp-hdt{flex:1}.vp .vp-hd > svg{width:18px;height:18px;color:#667085;flex:none}",
    /* the sheet: Eat's breakdown rows (.ir in index.html), a group head for the both-parts sheet, the button kept in view */
    ".vp-sh{display:flex;flex-direction:column}",
    ".vp-sh .msub{margin:-4px 0 4px}",
    ".vp-gh{display:flex;align-items:center;gap:8px;margin-top:20px;font:600 15px/22px Roboto,sans-serif;color:#101828}.vp-gh .tgl{width:18px;height:18px;background:#3538CD;-webkit-mask-size:contain;mask-size:contain;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;-webkit-mask-position:center;mask-position:center}",
    ".vp-gp{margin-left:auto;font:400 14px/20px Roboto,sans-serif;color:#475467;font-variant-numeric:tabular-nums}",
    ".vp-sh .irex ul{margin:0;padding-left:20px}.vp-sh .irex li{margin:0 0 6px;font:400 14px/21px Roboto,sans-serif;color:#475467}",
    ".vp-foot{position:sticky;bottom:-24px;z-index:2;margin:8px -16px -24px;padding:12px 16px 24px;background:#fff;box-shadow:0 -8px 16px -12px rgba(16,24,40,.18)}.vp-foot .md-save{width:100%;margin:0}",
    "#vpSec{margin-top:8px}#vpSec h5{margin:0}"
  ].join("");
  document.head.appendChild(css);
})();
