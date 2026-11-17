/* Mind: the "+x% Rhythm" moment when something is marked done (research doc: mind/research/rhythm-win.html).
   Eat and Move pay a log off with a full-screen moment (r3/assets/win-moment.js: the colour sweeps out of the button, then
   the "logged" pill, the big gain, one line). Mind's marks are smaller and happen in rows far below the score, so the
   gain is brought to where the eyes are, and only a big log earns the full moment.
     ?vwin=a  Rise: a soft glow at the tick, a glass pill rises out of it, "+7% Rhythm · from your wind-down"
     ?vwin=b  To the top: a gold bead lifts from the tick to the top of the screen and opens into a capsule
     ?vwin=c  In the row: a light wash runs along the row from its tick, and the row's time makes way for "+7%" for a moment
     ?vwin=d  Shore: a soft indigo band rises behind the tab bar, the gain on it
     ?vwin=e  Scaled: Rise for a tick; a big log (last night's sleep, or 15% or more) gets Mind's own
              full moment, as Eat and Move do: lavender light from where it was tapped, "Sleep logged", +49%, one line
     ?vwin=s..v  The green moment on a lotus, Mind's medal (17 Nov, Shaheer): s Lotus bloom, t Lotus rising (recommended),
              u Petal halo, v Lotus heart; the petals are drawn in greenScreen() by petal()
     ?vwin=n..r  The full moment in GoodFlip green, exactly Eat's and Move's (17 Nov, Shaheer; r3/assets/win-moment.js):
              n Rising water, o Ribbons, p Green sweep, q Green dawn, r Breath rings; see greenScreen()
     ?vwin=j..m  Every gain gets the full moment, as Eat's and Move's logs do (17 Nov, Shaheer): j Lavender sweep,
              k Gold dawn, l Frosted veil, m Ribbons; see fullScreen()
     ?vwin=f..i  Shore in gold (17 Nov, Shaheer liked D): f Horizon, g Rim light, h Ascent, i Halo; see goldShore()
   Rules for every variant: only a gain shows (an untick or a part already full shows nothing new, the tick alone says
   it); marks in quick succession add up in the one moment; the moment replaces the toast it would collide with;
   the line names the cause, never the score; reduced motion (or ?rm=1) keeps only a still fade.
   Hooks only: wraps window.setHeroScore (rhythm.js calls it with the gain) and reads MDPLAN.cause. */
(function () {
  var MD = window.MDPLAN; if (!MD || MD.noplan) return;
  var Q = MD.Q, V = (Q.get("vwin") || "e").toLowerCase(); if (!/^[a-v]$/.test(V)) V = "e";
  var RM = Q.get("rm") === "1" || matchMedia("(prefers-reduced-motion: reduce)").matches;
  var EASE = "cubic-bezier(.22,1,.36,1)", SOFT = "cubic-bezier(.4,0,.2,1)";

  /* what earned it, in a few words */
  var FROM = { sleep: "from last night’s sleep", wd: "from your wind-down", br: "from your breathing", me: "from your me-time", mood: "for checking in", any: "from your day" };
  var DONE = { sleep: "Sleep logged", wd: "Wind-down done", br: "Breathing done", me: "Me-time done", mood: "Mood checked in", any: "Done" };

  /* ---------- where the tap was: the row it came from, found again after the list redraws ---------- */
  var tap = null;
  document.addEventListener("pointerdown", function (e) {
    var el = e.target.closest && e.target.closest("[data-tiprow], .md-tile, button");
    if (!el) return;
    var row = e.target.closest("[data-tiprow]"), r = (row || el).getBoundingClientRect(), mk = row && row.querySelector(".tmark");
    tap = { t: performance.now(), key: row ? row.dataset.tiprow : null, sheet: !!el.closest(".sheet"), r: r, mk: mk ? mk.getBoundingClientRect() : null };
  }, true);
  function col() { var c = document.getElementById("col"); return c ? c.getBoundingClientRect() : { left: 0, width: innerWidth }; }
  /* the point the moment starts from: the row's tick if the row is still there, else the middle of the lower screen */
  function origin() {
    var c = col(), fb = { x: c.left + c.width / 2, y: innerHeight * .62, row: null, local: false };
    if (!tap || performance.now() - tap.t > 6000) return fb;
    var row = tap.key ? document.querySelector('[data-tiprow="' + tap.key + '"]') : null;
    if (row) {
      var r = row.getBoundingClientRect(), mk = row.querySelector(".tmark"), m = mk ? mk.getBoundingClientRect() : r;
      if (r.bottom > 60 && r.top < innerHeight - 80) return { x: m.left + m.width / 2, y: m.top + m.height / 2, row: row, rr: r, local: true };
    }
    var sh = document.querySelector(".sheet.on");
    if (tap.sheet && !sh) return fb;   /* the sheet it came from has closed */
    /* still in a sheet (the mood check-in answers in place): the gain sits just above the sheet, never over its words */
    if (tap.sheet && sh) { var st = sh.getBoundingClientRect(); return { x: fb.x, y: st.top, above: true, local: true, row: null }; }
    return { x: tap.r.left + tap.r.width / 2, y: tap.r.top + tap.r.height / 2, row: null, local: tap.r.bottom > 60 && tap.r.top < innerHeight - 80 };
  }

  /* ---------- the moment, merged while it shows ---------- */
  var live = null, held = null;
  var real = window.setHeroScore;
  if (real) window.setHeroScore = function (n, d) {
    real.apply(this, arguments);
    if (!(d > 0)) return;
    var cause = MD.cause || "any";
    if (live && live.add) return live.add(d, cause, n);
    /* J to M: a full screen never opens over a sheet (the mood check-in answers in place); it waits until the sheet has closed */
    if (/[j-v]/.test(V) && document.querySelector(".sheet.on")) {
      if (held) { held.d += d; held.n = n; held.cause = cause; return; }
      held = { d: d, cause: cause, n: n, was: n - d };
      (function wait() { if (document.querySelector(".sheet.on")) return setTimeout(wait, 120); var h = held; held = null; tap = null;
        setTimeout(function () { live = PLAY[V]({ d: h.d, cause: h.cause, n: h.n, was: h.was, o: origin() }); quietUntil = performance.now() + 900; }, 260); })();
      return;
    }
    live = PLAY[V]({ d: d, cause: cause, n: n, was: n - d, o: origin() });
    quietUntil = performance.now() + 900;
  };
  /* the toast that would land on top of the moment says the same thing, so it stays quiet */
  var quietUntil = 0, toast = window.GFToast;
  if (toast) window.GFToast = function (m, t) { if (t !== "error" && performance.now() < quietUntil) return; return toast.apply(this, arguments); };
  /* Mind's marks are calm: the moment is the reward, so the four-colour burst on a tick stands down */
  window.GFBurst = function () { var s = document.createElement("span"); s.hidden = true; return s; };

  function el(tag, cls, html) { var e = document.createElement(tag); e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function count(node, from, to, ms) {
    if (RM || from === to) { node.textContent = to; return; }
    var t0 = performance.now();
    (function step(now) { var f = Math.min(1, (now - t0) / ms), e = 1 - Math.pow(1 - f, 3); node.textContent = Math.round(from + (to - from) * e); if (f < 1) requestAnimationFrame(step); })(t0);
  }
  function anim(node, kf, o) { return node.animate(kf, Object.assign({ fill: "both", easing: EASE }, o));   /* both: a delayed part waits in its first frame, not its last */ }
  function line(m) {
    if (m.n >= 100 && m.was < 100) return "Your Rhythm is full for today";
    if (m.cause === "wd" && MD.P.wd.length > 1 && MD.P.wd.every(function (w, i) { return MD.S.wd[i]; })) return "your wind-down is complete";
    return FROM[m.cause] || FROM.any;
  }
  function done(node, ms) { setTimeout(function () { anim(node, [{ opacity: 1 }, { opacity: 0 }], { duration: 420, easing: SOFT }).onfinish = function () { node.remove(); }; live = null; }, ms); }
  /* a handle: add() folds a quick second mark into the moment that is showing, and keeps it up a little longer */
  function handle(m, num, sub, node, hold, after) {
    var tm = null, ends = function (ms) { clearTimeout(tm); tm = setTimeout(function () { live = null; after ? after() : done(node, 0); }, ms); };
    ends(hold);
    return { add: function (d, cause, n) { var was = m.d; m.d += d; m.n = n; if (cause !== m.cause) m.cause = "any"; count(num, was, m.d, 500); if (sub) sub.textContent = line(m); quietUntil = performance.now() + 900; ends(hold); } };
  }

  /* the glass pill every variant shares: a gold seed, the gain, the cause */
  function pill(m, cls) {
    var p = el("div", "rw-pill " + (cls || ""), '<span class="rw-seed"></span><b>+<span class="rw-n">0</span>%</b><span class="rw-r">Rhythm</span><span class="rw-sub"></span>');
    p.querySelector(".rw-sub").textContent = line(m);
    return p;
  }

  /* ---------- A: Rise ---------- */
  function rise(m) {
    var o = m.o, c = col(), lay = el("div", "rw-lay");
    var glow = el("span", "rw-glow"); glow.style.left = o.x + "px"; glow.style.top = o.y + "px";
    var p = pill(m, "rise"); lay.appendChild(glow); lay.appendChild(p); document.body.appendChild(lay);
    var w = p.offsetWidth, x = Math.max(c.left + 16, Math.min(o.x - 20, c.left + c.width - 16 - w));
    var y = o.above ? Math.max(76, o.y - p.offsetHeight - 14) : o.local ? Math.max(76, o.y - 60) : innerHeight * .5;
    if (o.above) {
      x = c.left + (c.width - w) / 2; glow.remove();
      /* the sheet grows as it answers, so the pill keeps to its top edge while it shows */
      (function follow() { var sh = document.querySelector(".sheet.on"); if (!lay.isConnected || !sh) return; p.style.top = Math.max(76, sh.getBoundingClientRect().top - p.offsetHeight - 14) + "px"; requestAnimationFrame(follow); })();
    }
    p.style.left = x + "px"; p.style.top = y + "px";
    if (!RM && glow.isConnected) {
      anim(glow, [{ transform: "translate(-50%,-50%) scale(.2)", opacity: .9 }, { transform: "translate(-50%,-50%) scale(1.6)", opacity: 0 }], { duration: 1100 });
    }
    if (!RM) {
      anim(p, [{ transform: "translateY(18px)", opacity: 0, filter: "blur(4px)" }, { transform: "translateY(0)", opacity: 1, filter: "blur(0)" }], { duration: 700, delay: 120 });
    } else glow.remove();
    var num = p.querySelector(".rw-n"); setTimeout(function () { count(num, 0, m.d, 600); }, RM ? 0 : 200);
    return handle(m, num, p.querySelector(".rw-sub"), lay, 2300, function () {
      if (RM) return done(lay, 0);
      anim(p, [{ transform: "translateY(0)", opacity: 1 }, { transform: "translateY(-14px)", opacity: 0 }], { duration: 520, easing: SOFT }).onfinish = function () { lay.remove(); };
    });
  }

  /* ---------- B: To the top ---------- */
  function lift(m) {
    var o = m.o, c = col(), lay = el("div", "rw-lay"), cx = c.left + c.width / 2, top = 64;
    var cap = pill(m, "cap"); lay.appendChild(cap); document.body.appendChild(lay);
    cap.style.left = cx + "px"; cap.style.top = top + "px";
    var num = cap.querySelector(".rw-n");
    var open = function () {
      if (!RM) anim(cap, [{ clipPath: "inset(0 calc(50% - 14px) round 999px)", opacity: .6 }, { clipPath: "inset(0 0 round 999px)", opacity: 1 }], { duration: 620 });
      count(num, 0, m.d, 600);
    };
    if (RM) open();
    else {
      cap.style.opacity = 0;
      var bead = el("span", "rw-bead"); lay.appendChild(bead);
      var x0 = o.x, y0 = o.y, x1 = cx, y1 = top + 18, mx = x0 + (x1 - x0) * .2 - 40, my = Math.min(y0, y1) + (y0 - y1) * .35;
      var T = Math.min(1100, 600 + Math.abs(y0 - y1) * .9), t0 = performance.now(), trail = [];
      (function fly(now) {
        var f = Math.min(1, (now - t0) / T), e = f < .5 ? 4 * f * f * f : 1 - Math.pow(-2 * f + 2, 3) / 2;
        var x = (1 - e) * (1 - e) * x0 + 2 * (1 - e) * e * mx + e * e * x1, y = (1 - e) * (1 - e) * y0 + 2 * (1 - e) * e * my + e * e * y1;
        bead.style.transform = "translate(" + (x - 5) + "px," + (y - 5) + "px)";
        if (f < 1 && Math.random() < .55) { var g = el("span", "rw-tr"); g.style.transform = "translate(" + (x - 2) + "px," + (y - 2) + "px)"; lay.appendChild(g); setTimeout(function () { g.remove(); }, 700); }
        if (f < 1) requestAnimationFrame(fly);
        else { anim(bead, [{ opacity: 1, transform: bead.style.transform + " scale(1)" }, { opacity: 0, transform: bead.style.transform + " scale(2.4)" }], { duration: 380 }); open(); }
      })(t0);
      var glow = el("span", "rw-glow"); glow.style.left = o.x + "px"; glow.style.top = o.y + "px"; lay.appendChild(glow);
      anim(glow, [{ transform: "translate(-50%,-50%) scale(.2)", opacity: .8 }, { transform: "translate(-50%,-50%) scale(1.3)", opacity: 0 }], { duration: 900 });
    }
    return handle(m, num, cap.querySelector(".rw-sub"), lay, RM ? 2400 : 3300, function () {
      if (RM) return done(lay, 0);
      anim(cap, [{ clipPath: "inset(0 0 round 999px)", opacity: 1 }, { clipPath: "inset(0 calc(50% - 14px) round 999px)", opacity: 0 }], { duration: 480, easing: SOFT }).onfinish = function () { lay.remove(); };
    });
  }

  /* ---------- C: In the row ---------- */
  function inRow(m) {
    var o = m.o;
    if (!o.row) return rise(m);   /* a sheet or the player: no row to speak from */
    var row = o.row, wash = el("span", "rw-wash"), say = el("span", "rw-rsay", '<b>+<span class="rw-n">0</span>%</b>');   /* the number alone: it has to fit where the time was */
    say.setAttribute("role", "status"); say.setAttribute("aria-label", "+" + m.d + "% Rhythm");
    var rr = row.getBoundingClientRect(), mk = row.querySelector(".tmark"), mr = mk ? mk.getBoundingClientRect() : rr;
    /* the gain takes the time's own slot on the right, so it never sits over the task's name */
    var tm = row.querySelector(".ly-tm, .at, time") || null, tr0 = tm ? tm.getBoundingClientRect() : null;
    if (tr0) { say.style.top = (tr0.top - rr.top + tr0.height / 2) + "px"; say.style.right = (rr.right - tr0.right) + "px"; tm.style.transition = "opacity .3s"; tm.style.opacity = 0; }
    wash.style.setProperty("--x", (mr.left - rr.left + mr.width / 2) + "px");
    if (getComputedStyle(row).position === "static") row.style.position = "relative";
    row.appendChild(wash); row.appendChild(say); row.classList.add("rw-on");
    if (!RM) {
      anim(wash, [{ clipPath: "circle(0px at var(--x) 50%)", opacity: 1 }, { clipPath: "circle(140% at var(--x) 50%)", opacity: 1 }], { duration: 900 });
      anim(say, [{ opacity: 0, transform: "translate(6px,-50%)" }, { opacity: 1, transform: "translate(0,-50%)" }], { duration: 500, delay: 260 });
    }
    var num = say.querySelector(".rw-n"); setTimeout(function () { count(num, 0, m.d, 500); }, RM ? 0 : 300);
    return handle(m, num, null, say, 2200, function () {
      var end = function () { wash.remove(); say.remove(); row.classList.remove("rw-on"); if (tm) tm.style.opacity = ""; };
      if (RM) return end();
      anim(say, [{ opacity: 1 }, { opacity: 0 }], { duration: 400, easing: SOFT });
      anim(wash, [{ opacity: 1 }, { opacity: 0 }], { duration: 700, easing: SOFT }).onfinish = end;
    });
  }

  /* ---------- D: Shore ---------- */
  function shore(m) {
    if (m.o.above) return rise(m);   /* a sheet is up: the band would sit on its button */
    var c = col(), lay = el("div", "rw-lay"), band = el("div", "rw-shore");
    var nav = [].filter.call(document.querySelectorAll("nav"), function (n) { return getComputedStyle(n).position === "fixed"; })[0];
    band.style.left = c.left + "px"; band.style.width = c.width + "px"; band.style.bottom = (nav ? innerHeight - nav.getBoundingClientRect().top : 0) + "px";
    var p = pill(m, "flat"); band.appendChild(p); lay.appendChild(band); document.body.appendChild(lay);
    if (!RM) {
      anim(band, [{ transform: "translateY(28px)", opacity: 0 }, { transform: "translateY(0)", opacity: 1 }], { duration: 760 });
      anim(p, [{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "translateY(0)" }], { duration: 560, delay: 260 });
    }
    var num = p.querySelector(".rw-n"); setTimeout(function () { count(num, 0, m.d, 600); }, RM ? 0 : 300);
    return handle(m, num, p.querySelector(".rw-sub"), lay, 2600, function () {
      if (RM) return done(lay, 0);
      anim(band, [{ transform: "translateY(0)", opacity: 1 }, { transform: "translateY(20px)", opacity: 0 }], { duration: 560, easing: SOFT }).onfinish = function () { lay.remove(); };
    });
  }

  /* ---------- F to I: Shore in gold. The same band above the tab bar, more emphasis, the score ring's gold
     (gauge 700 #CDA935, 600 #E7C144, 300 #FDE8A4), soft and layered. One builder, four finishes:
       f  Horizon: a warm gold horizon blooms wide behind the pill, then settles to an ember
       g  Rim light: a frosted band with a gold rim along its top edge drawn from the middle out, the gain large
       h  Ascent: the gold glow lifts off the band and drifts up toward the score as it fades
       i  Halo: the pill wears a layered gold halo and one slow shimmer passes across it ---------- */
  function goldShore(m, kind) {
    if (m.o.above) return rise(m);   /* a sheet is up: the band would sit on its button */
    var c = col(), lay = el("div", "rw-lay"), band = el("div", "rw-gs rw-gs-" + kind);
    var nav = [].filter.call(document.querySelectorAll("nav"), function (n) { return getComputedStyle(n).position === "fixed"; })[0];
    var navTop = nav ? nav.getBoundingClientRect().top : innerHeight;
    band.style.left = c.left + "px"; band.style.width = c.width + "px"; band.style.bottom = (innerHeight - navTop) + "px";
    var glow = el("span", "rw-gglow"), rim = el("span", "rw-grim");
    var big = kind === "g" || kind === "f";
    var p = big ? el("div", "rw-gbig", '<b>+<span class="rw-n">0</span><span class="rw-pc">%</span></b><span class="rw-gl"><span class="rw-r">Rhythm</span><span class="rw-sub"></span></span>') : pill(m, "flat gold");
    p.querySelector(".rw-sub").textContent = line(m);
    band.appendChild(glow); if (kind === "g") band.appendChild(rim);
    if (kind === "i") p.appendChild(el("span", "rw-shine"));
    band.appendChild(p); lay.appendChild(band); document.body.appendChild(lay);
    var num = p.querySelector(".rw-n");
    if (!RM) {
      anim(band, [{ opacity: 0 }, { opacity: 1 }], { duration: 520, easing: SOFT });
      if (kind === "f") anim(glow, [{ transform: "translateX(-50%) scaleX(.35) scaleY(.6)", opacity: 0 }, { transform: "translateX(-50%) scaleX(1.15) scaleY(1.1)", opacity: 1, offset: .55 }, { transform: "translateX(-50%) scaleX(1) scaleY(.85)", opacity: .7 }], { duration: 1600 });
      else anim(glow, [{ transform: "translateX(-50%) scale(.5)", opacity: 0 }, { transform: "translateX(-50%) scale(1)", opacity: 1 }], { duration: 900, delay: 80 });
      if (kind === "g") anim(rim, [{ transform: "scaleX(0)", opacity: 0 }, { transform: "scaleX(1)", opacity: 1 }], { duration: 900, delay: 120 });
      anim(p, [{ opacity: 0, transform: "translateY(10px)", filter: "blur(3px)" }, { opacity: 1, transform: "translateY(0)", filter: "blur(0)" }], { duration: 640, delay: 220 });
      if (kind === "i") anim(p.querySelector(".rw-shine"), [{ transform: "translateX(-120%) skewX(-18deg)" }, { transform: "translateX(260%) skewX(-18deg)" }], { duration: 1500, delay: 700, easing: SOFT });
    }
    setTimeout(function () { count(num, 0, m.d, 650); }, RM ? 0 : 300);
    return handle(m, num, p.querySelector(".rw-sub"), lay, kind === "h" ? 2400 : 2800, function () {
      if (RM) return done(lay, 0);
      if (kind === "h") {
        /* the glow lifts off the band toward the score above and fades on the way, while the band settles */
        var g = glow.getBoundingClientRect(), fly = el("span", "rw-gfly"); fly.style.left = (g.left + g.width / 2) + "px"; fly.style.top = (g.top + g.height / 2) + "px"; lay.appendChild(fly);
        glow.style.opacity = 0;
        anim(fly, [{ transform: "translate(-50%,-50%) scale(1)", opacity: .95 }, { transform: "translate(-50%,calc(-50% - " + Math.round(navTop * .55) + "px)) scale(.45)", opacity: 0 }], { duration: 1400, easing: "cubic-bezier(.45,0,.2,1)" });
        anim(p, [{ opacity: 1 }, { opacity: 0 }], { duration: 520, easing: SOFT });
        anim(band, [{ opacity: 1 }, { opacity: 0 }], { duration: 900, delay: 300, easing: SOFT }).onfinish = function () { lay.remove(); };
        return;
      }
      anim(band, [{ opacity: 1, transform: "translateY(0)" }, { opacity: 0, transform: "translateY(12px)" }], { duration: 640, easing: SOFT }).onfinish = function () { lay.remove(); };
    });
  }

  /* ---------- J to M: the full moment for every gain. Eat's and Move's three tiers (r3/assets/win-moment.js layout B):
     the pill names what was done, the gain counts up large, one line says where it went. Mind's light: indigo and the
     score ring's gold, the gain in dark gold, the pill's words in near-black, a light end state. Only the arrival changes:
       j  Lavender sweep: lavender light opens from the tapped control and clears to white, a gold horizon under the gain
       k  Gold dawn: a soft gold dawn rises from the bottom of the screen and settles into a pale morning
       l  Frosted veil: the screen frosts over in a pale indigo veil, the lotus medal's own glow (gold into indigo) breathing behind the number
       m  Ribbons: indigo and gold ribbons drift in from the left, widen and melt into one light (Move's aurora, in Mind's colours)
     Tap anywhere to close; it closes itself at about 2.6 s; quick marks add up in the open screen ---------- */
  function fullScreen(m, kind) {
    var o = m.o, c = col(), lay = el("div", "rw-fs rw-fs-" + kind);
    lay.style.left = c.left + "px"; lay.style.width = c.width + "px";
    var ox = Math.max(0, Math.min(c.width, o.x - c.left)), oy = o.y;
    var bg = el("div", "rw-fsbg"), fx = el("div", "rw-fsfx");
    if (kind === "m") fx.innerHTML = '<i></i><i></i><i></i><i></i>';
    var fc = el("div", "rw-fc2", '<span class="rw-lg"><span class="rw-dk"><svg viewBox="0 0 24 24" width="16" height="16"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span><span class="rw-pt"></span></span>' +
      '<span class="rw-gn">+<span class="rw-n">0</span><span class="rw-pc">%</span></span><p class="rw-ln"></p>');
    var pt = fc.querySelector(".rw-pt"), ln = fc.querySelector(".rw-ln"), num = fc.querySelector(".rw-n"), path = fc.querySelector(".rw-dk path");
    var words = function () {
      pt.textContent = DONE[m.cause] || DONE.any;
      ln.textContent = m.n >= 100 && m.was < 100 ? "Your Rhythm is full for today" : line(m) === "your wind-down is complete" ? "Your wind-down is complete" : "added to your Rhythm";
    };
    words();
    lay.appendChild(bg); lay.appendChild(fx); lay.appendChild(fc); document.body.appendChild(lay);
    var IN = RM ? 0 : kind === "k" ? 760 : kind === "m" ? 900 : 620;   /* when the words start, once the light has arrived */
    if (!RM) {
      if (kind === "j") anim(bg, [{ clipPath: "circle(0px at " + ox + "px " + oy + "px)" }, { clipPath: "circle(160% at " + ox + "px " + oy + "px)" }], { duration: 950, easing: "cubic-bezier(.65,0,.35,1)" });
      if (kind === "k") { anim(bg, [{ opacity: 0 }, { opacity: 1 }], { duration: 500, easing: SOFT }); anim(fx, [{ transform: "translateY(70%)", opacity: 0 }, { transform: "translateY(0)", opacity: 1 }], { duration: 1300 }); }
      if (kind === "l") { anim(bg, [{ opacity: 0, backdropFilter: "blur(0px)" }, { opacity: 1, backdropFilter: "blur(14px)" }], { duration: 700, easing: SOFT });
        anim(fx, [{ opacity: 0, transform: "translate(-50%,-50%) scale(.82)" }, { opacity: 1, transform: "translate(-50%,-50%) scale(1)" }], { duration: 1400, delay: 200 }); }
      if (kind === "m") { anim(bg, [{ opacity: 0 }, { opacity: 1 }], { duration: 900, delay: 500, easing: SOFT });
        [].forEach.call(fx.children, function (r, i) { anim(r, [{ transform: "translateX(-110%) rotate(" + (-14 + i * 7) + "deg) scaleY(.5)", opacity: 0 }, { transform: "translateX(0) rotate(" + (-6 + i * 3) + "deg) scaleY(1.6)", opacity: .9, offset: .6 }, { transform: "translateX(10%) rotate(" + (-6 + i * 3) + "deg) scaleY(3)", opacity: 0 }], { duration: 1500, delay: i * 90, easing: "cubic-bezier(.45,0,.2,1)" }); }); }
      anim(fc.querySelector(".rw-lg"), [{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "translateY(0)" }], { duration: 520, delay: IN });
      anim(fc.querySelector(".rw-gn"), [{ opacity: 0, transform: "translateY(14px)" }, { opacity: 1, transform: "translateY(0)" }], { duration: 620, delay: IN + 120 });
      anim(ln, [{ opacity: 0 }, { opacity: 1 }], { duration: 520, delay: IN + 300, easing: SOFT });
      anim(path, [{ strokeDashoffset: 24 }, { strokeDashoffset: 0 }], { duration: 420, delay: IN + 160 });
    } else { path.style.strokeDashoffset = 0; anim(lay, [{ opacity: 0 }, { opacity: 1 }], { duration: 300, easing: SOFT }); }
    setTimeout(function () { count(num, 0, m.d, 700); }, IN + 120);
    var gone = false, close = function () {
      if (gone) return; gone = true; live = null;
      anim(lay, [{ opacity: 1 }, { opacity: 0 }], { duration: RM ? 300 : 520, easing: SOFT }).onfinish = function () { lay.remove(); };
    };
    lay.addEventListener("click", close);
    var h = handle(m, num, null, lay, IN + 2600, close), add = h.add;
    h.add = function (d, cause, n) { add(d, cause, n); words(); };
    return h;
  }

  /* ---------- N to R: the full moment in GoodFlip green. Eat's and Move's own win (r3/assets/win-moment.js): Flip green
     #299D6B, the ribbons' greens #6CE9A6 #32B27A #299D6B #A6F4C5 #3CCB8C, white words, layout B (the done pill with a white
     tick disc, the gain counted up large, one line), eases eOut and eIO, a clock that never jumps more than 1/30 s a frame,
     and the way out fades into white, the screen's own ground. Only the arrival changes:
       n  Rising water: Eat's rise. A drop of green wells out of the tapped tick, pools, then rises over the screen with a
          soft white surface line and a few bubbles
       o  Ribbons: Move's aurora. Five green ribbons sweep in from the left, widen and melt into one green
       p  Green sweep: the green opens out of the tapped tick as a circle, a lighter rim leading it
       q  Green dawn: a soft green light rises from the bottom and deepens into the full green, no surface, no edge
       r  Breath rings: three slow rings breathe out of the tick, as an exhale, the last becoming the screen ---------- */
  var FREEZE = Q.get("winfreeze") != null ? +Q.get("winfreeze") : null;
  var G = "#299D6B", RIBC = ["#6CE9A6", "#32B27A", "#299D6B", "#A6F4C5", "#3CCB8C"];
  var cl = function (x, a, b) { return Math.min(b == null ? 1 : b, Math.max(a || 0, x)); }, seg = function (t, a, b) { return cl((t - a) / (b - a)); };
  var eOut = function (x) { return 1 - Math.pow(1 - x, 3); }, eIO = function (x) { return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
  var mix = function (a, b, k) { return a + (b - a) * k; };
  function greenScreen(m, kind) {
    var o = m.o, c = col(), lay = el("div", "rw-gw");
    lay.style.left = c.left + "px"; lay.style.width = c.width + "px";
    lay.innerHTML = '<canvas></canvas><div class="rw-gwc"><span class="rw-gwp"><span class="rw-gwd"><svg viewBox="0 0 24 24" width="16" height="16"><path d="M20 6L9 17l-5-5"/></svg></span><span class="rw-pt"></span></span>' +
      '<span class="rw-gwn"><b>+<span class="rw-n">0</span><span class="rw-pc">%</span></b><em>Rhythm</em></span><p class="rw-ln"></p></div>';
    document.body.appendChild(lay);
    var cv = lay.querySelector("canvas"), x = cv.getContext("2d"), W = c.width, H = innerHeight, DPR = Math.min(devicePixelRatio || 1, 2);
    cv.width = W * DPR; cv.height = H * DPR; x.scale(DPR, DPR);
    /* the lotus versions (17 Nov, Shaheer): fast. The whole arrival is drawn on a clock sped up so it lands in about 0.4 s, the
       number counts up in 0.3 s, it holds about 1.1 s and leaves in 0.3 s, on Momentum's end screen (layout B) */
    var LOTUS = /[stuv]/.test(kind), ARRIVE = .4;
    m.count = 1;
    var B = { x: cl(o.x - c.left, 0, W), y: cl(o.y, 0, H) };
    /* a bloom from a tick near the edge would open lopsided, so S and V open halfway between the tick and the middle */
    if (kind === "s" || kind === "v") { B.x = mix(B.x, W / 2, .5); B.y = mix(B.y, H * .47, .35); }
    var ct = lay.querySelector(".rw-gwc"), pt = ct.querySelector(".rw-pt"), ln = ct.querySelector(".rw-ln"), num = ct.querySelector(".rw-n"), tk = ct.querySelector("path");
    /* the gain already says Rhythm, so the line says why it matters: the score card's own second sentences (rhythm-say.js) */
    var WHY = { sleep: "A steady night is the base of your day.", wd: "Small steps in the evening help you sleep steady.", br: "A few slow breaths help your body settle.",
      me: "Time for yourself keeps stress low.", mood: "Naming how you feel helps you understand your day.", any: "Every small step keeps your day steady." };
    var words = function () {
      pt.textContent = LOTUS && m.count > 1 ? m.count + " tasks done" : DONE[m.cause] || DONE.any;
      if (LOTUS) { ln.textContent = "added to your Rhythm score"; return; }
      ln.textContent = m.n >= 100 && m.was < 100 ? "Your Rhythm is full for today" : line(m) === "your wind-down is complete" ? "Your wind-down is complete. Rest well tonight." : WHY[m.cause] || WHY.any;
    };
    words();
    /* when the screen is covered and the words begin */
    var COVER0 = { n: 1.15, o: 1.9, p: .85, q: 1.6, r: 1.5, s: 1.4, t: 1.75, u: .8, v: 1.5 }[kind];
    var SPD = LOTUS ? COVER0 / ARRIVE : 1, COVER = RM ? 0 : LOTUS ? ARRIVE : COVER0;
    /* the lotus versions wear Momentum's own end screen (r3/assets/win-moment.js layout B): the pill naming what was done,
       the big "+X%" alone, "added to your Rhythm score" */
    if (LOTUS) { lay.classList.add("rw-b"); ct.querySelector(".rw-gwn em").remove(); }
    var bubbles = []; for (var i = 0; i < 26; i++) bubbles.push({ x: Math.random() * W, sp: 80 + Math.random() * 140, r: 2 + Math.random() * 4, ph: Math.random() * 6.28 });
    var RIB = RIBC.map(function (cc, i) { return { y: H * (.1 + i * .19), a: 40 + i * 9, k: 120 + i * 30, ph: i * 1.3, c: cc }; });
    var clock = 0, last = null, alive = true, exitAt = null, shown = 0, from = 0;
    function cover(t) {   /* the whole screen in flat green with a slow breath of light, as Move's covered state */
      x.fillStyle = G; x.fillRect(0, 0, W, H);
      var g = x.createRadialGradient(W / 2, H * .44, 0, W / 2, H * .44, 260 + 10 * Math.sin(t * 1.4));
      g.addColorStop(0, "rgba(108,233,166,.22)"); g.addColorStop(1, "rgba(108,233,166,0)"); x.fillStyle = g; x.fillRect(0, 0, W, H);
    }
    /* a lotus petal: a pointed oval from its base (px, py) out along angle a, length L, half-width w; deep green at the base
       to a lighter tip, the edges soft against what is under it */
    function petal(px, py, a, L, w, c0, c1, al) {
      if (L < 1) return;
      x.save(); x.translate(px, py); x.rotate(a); x.globalAlpha = al;
      var g = x.createLinearGradient(0, 0, 0, -L); g.addColorStop(0, c0); g.addColorStop(1, c1); x.fillStyle = g;
      x.beginPath(); x.moveTo(0, 0);
      x.bezierCurveTo(w * 1.05, -L * .28, w * .78, -L * .78, 0, -L);
      x.bezierCurveTo(-w * .78, -L * .78, -w * 1.05, -L * .28, 0, 0);
      x.fill(); x.restore(); x.globalAlpha = 1;
    }
    /* three layers, back to front: pale mint, mid green, Flip green; each layer turns a little as it opens */
    var LAYERS = [{ n: 8, c0: "#6CE9A6", c1: "#D1FADF", al: .55, sc: 1, rot: 0 }, { n: 8, c0: "#32B27A", c1: "#A6F4C5", al: .75, sc: .78, rot: Math.PI / 8 }, { n: 6, c0: "#299D6B", c1: "#6CE9A6", al: .95, sc: .56, rot: 0 }];
    var DIAG = function (px, py) { return Math.hypot(Math.max(px, W - px), Math.max(py, H - py)); };
    var DRAW = {
      n: function (t) {   /* Eat's rise: the drop leaves the tick, pools, then surges over the top */
        var pool = eOut(seg(t, 0, .45)) * .3, surge = eIO(seg(t, .35, 1.15)), level = mix(pool, 1.12, surge), top = H - level * H;
        var amp = 9 + 12 * Math.sin(Math.PI * surge), bl = seg(t, 0, .4);
        if (bl < 1) { x.fillStyle = "rgba(41,157,107," + (1 - bl) + ")"; x.beginPath(); x.ellipse(B.x, B.y, 14 * (1 + bl * .6), 14 * (1 + bl * 2.2), 0, 0, 7); x.fill(); }
        if (t > 1.15) return cover(t);
        var wave = function (px) { return top + Math.sin(px * .024 + t * 3.2) * amp + Math.sin(px * .057 - t * 2.2) * amp * .4 + (Math.abs(px - B.x) < 70 ? -Math.cos((px - B.x) / 70 * Math.PI / 2) * 16 * (1 - surge) : 0); };
        x.beginPath(); x.moveTo(0, H + 40); for (var px = 0; px <= W; px += 6) x.lineTo(px, wave(px)); x.lineTo(W, H + 40); x.closePath(); x.fillStyle = G; x.fill();
        x.beginPath(); for (px = 0; px <= W; px += 6) { var y = wave(px); px ? x.lineTo(px, y) : x.moveTo(px, y); } x.strokeStyle = "rgba(255,255,255,.85)"; x.lineWidth = 3; x.stroke();
        bubbles.forEach(function (b) { var by = H - ((t * b.sp + b.ph * 60) % (H + 40)); if (by < top + 8) return; x.strokeStyle = "rgba(255,255,255,.5)"; x.lineWidth = 1.3; x.beginPath(); x.arc(b.x + Math.sin(t * 2 + b.ph) * 6, by, b.r, 0, 7); x.stroke(); });
      },
      o: function (t) {   /* Move's aurora, its own numbers */
        var p = seg(t, 0, 1.9);
        if (p >= 1) return cover(t);
        var e = eIO(p), reach = e * (W + 200);
        RIB.forEach(function (b, i) {
          var th = 14 + eIO(seg(p, i * .06, .85)) * 260, gr = x.createLinearGradient(0, 0, reach, 0);
          gr.addColorStop(0, b.c); gr.addColorStop(Math.max(.01, 1 - 120 / Math.max(reach, 121)), b.c); gr.addColorStop(1, "rgba(108,233,166,0)");
          x.globalAlpha = .75; x.fillStyle = gr; x.beginPath();
          for (var X = 0; X <= reach; X += 8) x.lineTo(X, b.y + b.a * Math.sin(X / b.k + t * 1.6 + b.ph) - th / 2);
          for (X = reach; X >= 0; X -= 8) x.lineTo(X, b.y + b.a * Math.sin(X / b.k + t * 1.6 + b.ph + .6) + th / 2);
          x.closePath(); x.fill();
        });
        x.globalAlpha = eIO(seg(p, .55, 1)); x.fillStyle = G; x.fillRect(0, 0, W, H); x.globalAlpha = 1;
      },
      p: function (t) {   /* a circle of green out of the tick, a lighter rim leading */
        var k = eIO(seg(t, 0, .85)), R = k * Math.hypot(Math.max(B.x, W - B.x), Math.max(B.y, H - B.y)) * 1.05;
        if (k >= 1) return cover(t);
        var g = x.createRadialGradient(B.x, B.y, Math.max(0, R - 70), B.x, B.y, R);
        g.addColorStop(0, G); g.addColorStop(.75, "#3CCB8C"); g.addColorStop(1, "rgba(108,233,166,0)");
        x.fillStyle = g; x.beginPath(); x.arc(B.x, B.y, R + 1, 0, 7); x.fill();
      },
      q: function (t) {   /* green light from below, deepening into the full green */
        var k = eIO(seg(t, 0, 1.6));
        if (k >= 1) return cover(t);
        var g = x.createRadialGradient(W / 2, H * 1.04, 0, W / 2, H * 1.04, mix(H * .16, H * 1.35, k));
        g.addColorStop(0, G); g.addColorStop(.45, "#32B27A"); g.addColorStop(.72, "rgba(108,233,166,.6)"); g.addColorStop(.88, "rgba(166,244,197,.3)"); g.addColorStop(1, "rgba(166,244,197,0)");
        x.fillStyle = g; x.fillRect(0, 0, W, H);
        x.globalAlpha = eIO(seg(k, .78, 1)); x.fillStyle = G; x.fillRect(0, 0, W, H); x.globalAlpha = 1;
      },
      s: function (t) {   /* Lotus bloom: big soft petals unfold out of the tapped tick, layer by layer, until they are the screen */
        if (t >= 1.4) return cover(t);
        var R = DIAG(B.x, B.y) * 1.25;
        LAYERS.forEach(function (ly, li) {
          var k = eIO(seg(t, li * .14, .9 + li * .14));
          for (var i = 0; i < ly.n; i++) petal(B.x, B.y, ly.rot + i * Math.PI * 2 / ly.n - (1 - k) * .5, k * R * ly.sc, k * R * ly.sc * .42, ly.c0, ly.c1, ly.al);
        });
        x.globalAlpha = eIO(seg(t, 1.05, 1.4)); x.fillStyle = G; x.fillRect(0, 0, W, H); x.globalAlpha = 1;
      },
      t: function (t) {   /* Lotus rising: Eat's water rises a third of the way, then a lotus opens upward out of it, from the bottom centre */
        if (t >= 1.75) return cover(t);
        var lvl = eOut(seg(t, 0, .7)) * .34, top = H - lvl * H, amp = 8 * (1 - seg(t, .7, 1.4));
        var bx = W / 2, by = top + 10, open = eIO(seg(t, .45, 1.45)), L = H * 1.15;
        /* the petals behind the water first, so the flower sits in it */
        LAYERS.forEach(function (ly, li) {
          var k = eIO(seg(open, li * .1, 1)), n = ly.n + 1, span = mix(.25, 1.35, k);
          for (var i = 0; i < n; i++) { var f = n === 1 ? 0 : i / (n - 1) - .5; petal(bx, by, f * span * 2 + (li === 1 ? .08 : 0), k * L * (ly.sc * (1 - Math.abs(f) * .35)), k * L * ly.sc * .2, ly.c0, ly.c1, ly.al); }
        });
        var wave = function (px) { return top + Math.sin(px * .024 + t * 3) * amp + Math.sin(px * .057 - t * 2) * amp * .4; };
        x.beginPath(); x.moveTo(0, H + 40); for (var px = 0; px <= W; px += 6) x.lineTo(px, wave(px)); x.lineTo(W, H + 40); x.closePath(); x.fillStyle = G; x.fill();
        x.beginPath(); for (px = 0; px <= W; px += 6) { var y = wave(px); px ? x.lineTo(px, y) : x.moveTo(px, y); } x.strokeStyle = "rgba(255,255,255," + .85 * (1 - seg(t, 1, 1.5)) + ")"; x.lineWidth = 3; x.stroke();
        x.globalAlpha = eIO(seg(t, 1.35, 1.75)); x.fillStyle = G; x.fillRect(0, 0, W, H); x.globalAlpha = 1;
      },
      u: function (t) {   /* Petal halo: the green opens from the tick, then a ring of light petals blooms around the number and stays */
        var k = eIO(seg(t, 0, .8)), R = k * DIAG(B.x, B.y) * 1.05;
        if (k < 1) { var g = x.createRadialGradient(B.x, B.y, Math.max(0, R - 70), B.x, B.y, R); g.addColorStop(0, G); g.addColorStop(.75, "#3CCB8C"); g.addColorStop(1, "rgba(108,233,166,0)"); x.fillStyle = g; x.beginPath(); x.arc(B.x, B.y, R + 1, 0, 7); x.fill(); }
        else cover(t);
        var hk = eIO(seg(t, .55, 1.75)), cx = W / 2, cy = H * .47;
        for (var i = 0; i < 10; i++) petal(cx, cy, i * Math.PI / 5 + t * .025 - (1 - hk) * .4, hk * 170, hk * 52, "rgba(255,255,255,.02)", "rgba(255,255,255,.2)", 1);
        for (i = 0; i < 10; i++) petal(cx, cy, i * Math.PI / 5 + Math.PI / 10 + t * .025 - (1 - hk) * .6, hk * 120, hk * 38, "rgba(255,255,255,.02)", "rgba(209,250,223,.16)", 1);
      },
      v: function (t) {   /* Lotus heart: a lotus opens round the tick, then its heart widens into the green screen */
        if (t >= 1.5) return cover(t);
        var open = eIO(seg(t, 0, .8)), M = Math.min(W, H) * .42;
        LAYERS.forEach(function (ly, li) { for (var i = 0; i < ly.n; i++) petal(B.x, B.y, ly.rot + i * Math.PI * 2 / ly.n - (1 - open) * .45, open * M * ly.sc, open * M * ly.sc * .42, ly.c0, ly.c1, ly.al * (1 - seg(t, 1.1, 1.5))); });
        var hk = eIO(seg(t, .55, 1.4)), R = mix(10, DIAG(B.x, B.y) * 1.05, hk);
        var g = x.createRadialGradient(B.x, B.y, Math.max(0, R - 50), B.x, B.y, R); g.addColorStop(0, G); g.addColorStop(1, "rgba(41,157,107,0)");
        x.fillStyle = g; x.beginPath(); x.arc(B.x, B.y, R, 0, 7); x.fill();
      },
      r: function (t) {   /* three slow rings breathe out from the tick; the last becomes the screen */
        if (t >= 1.5) return cover(t);
        var Rmax = Math.hypot(Math.max(B.x, W - B.x), Math.max(B.y, H - B.y)) * 1.05;
        [0, .22, .44].forEach(function (d, i) {
          var k = eIO(seg(t, d, d + 1.05)), R = k * Rmax * (i === 2 ? 1 : .55 + i * .2), a = i === 2 ? 1 : (1 - seg(t, d + .6, d + 1.05)) * .55;
          if (R <= 0) return;
          /* soft edges: each ring feathers out over its last fifth, so nothing reads as a hard circle */
          var col2 = i === 2 ? [41, 157, 107] : i === 0 ? [166, 244, 197] : [108, 233, 166], g2 = x.createRadialGradient(B.x, B.y, R * .8, B.x, B.y, R);
          g2.addColorStop(0, "rgba(" + col2 + ",1)"); g2.addColorStop(1, "rgba(" + col2 + ",0)");
          x.globalAlpha = a; x.fillStyle = g2; x.beginPath(); x.arc(B.x, B.y, R, 0, 7); x.fill();
          if (i === 2) { x.fillStyle = G; x.beginPath(); x.arc(B.x, B.y, R * .8, 0, 7); x.fill(); }
        });
        x.globalAlpha = 1;
      }
    };
    function content(w) {   /* the tick lands first, then each line rises in on its own beat, and the number counts up */
      ct.style.opacity = w > 0 ? 1 : 0;
      var d = ct.querySelector(".rw-gwd"); d.style.transform = "scale(" + eOut(seg(w, 0, .3)) + ")";
      tk.style.strokeDashoffset = 24 * (1 - eOut(seg(w, .15, .4)));
      [[ct.querySelector(".rw-gwp"), 0], [ct.querySelector(".rw-gwn"), LOTUS ? .06 : .12], [ln, LOTUS ? .14 : .3]].forEach(function (q) { var k = eOut(seg(w, q[1], q[1] + (LOTUS ? .25 : .45))); q[0].style.opacity = k; q[0].style.transform = "translateY(" + (1 - k) * 12 + "px)"; });
      var kk = LOTUS ? eOut(seg(clock / 1000 - cAt, 0, .3)) : eOut(seg(clock / 1000 - cAt, .1, .9)); num.textContent = Math.round(mix(from, m.d, kk));
    }
    var wAt = null, cAt = 0;
    function frame(now) {
      if (!alive) return;
      if (last == null) last = now; clock += Math.min(now - last, 1000 / 30); last = now;
      if (FREEZE != null && clock > FREEZE * 1000) { clock = FREEZE * 1000; clearTimeout(tm); }   /* doc only: hold the moment at one instant */
      var t = clock / 1000;
      x.clearRect(0, 0, W, H);
      if (RM) cover(0); else DRAW[kind](t * SPD);
      if (t >= COVER) { if (wAt == null) { wAt = t; cAt = t; buzz(); } content(t - wAt); }
      if (exitAt != null) { var e = (now - exitAt) / 1000; var EX = LOTUS ? .3 : .55; lay.style.opacity = 1 - eIO(seg(e, .02, EX)); if (e > EX + .05) { alive = false; lay.remove(); return; } }
      requestAnimationFrame(frame);
    }
    if (RM) { anim(lay, [{ opacity: 0 }, { opacity: 1 }], { duration: 300, easing: SOFT }); }
    requestAnimationFrame(function () { requestAnimationFrame(frame); });
    var gone = false, close = function () { if (gone) return; gone = true; live = null; exitAt = performance.now(); };
    lay.addEventListener("click", close);
    /* a gain while it is open counts on from where the number is */
    var tm = null, ends = function (ms) { clearTimeout(tm); tm = setTimeout(close, ms); };
    var HOLD = LOTUS ? (COVER + .3) * 1000 + 1100 : (COVER + .9) * 1000 + 2600;
    ends(HOLD);
    return { add: function (d, cause, n) { from = +num.textContent || 0; m.d += d; m.count++; m.n = n; if (cause !== m.cause) m.cause = cause; words(); if (wAt != null) cAt = clock / 1000 - (LOTUS ? 0 : .1); quietUntil = performance.now() + 900; ends(HOLD); } };
  }
  function buzz() { try { navigator.vibrate && navigator.vibrate(18); } catch (e) {} }

  /* ---------- E: Scaled. A tick rises; a big log gets the full moment ---------- */
  function full(m) {
    var o = m.o, c = col(), lay = el("div", "rw-full");
    lay.style.left = c.left + "px"; lay.style.width = c.width + "px";
    var ox = o.x - c.left, oy = o.y;
    lay.innerHTML = '<div class="rw-fc"><span class="rw-logged"><span class="rw-disc"><svg viewBox="0 0 24 24" width="16" height="16"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span>' + (DONE[m.cause] || DONE.any) + '</span>' +
      '<span class="rw-big">+<span class="rw-n">0</span><span class="rw-pc">%</span></span><p class="rw-line"></p></div>';
    var sub = lay.querySelector(".rw-line"); sub.textContent = m.n >= 100 && m.was < 100 ? "Your Rhythm is full for today" : "added to your Rhythm";
    document.body.appendChild(lay);
    var fc = lay.querySelector(".rw-fc"), num = lay.querySelector(".rw-n"), path = lay.querySelector(".rw-disc path");
    if (!RM) {
      anim(lay, [{ clipPath: "circle(0px at " + ox + "px " + oy + "px)" }, { clipPath: "circle(150% at " + ox + "px " + oy + "px)" }], { duration: 900, easing: "cubic-bezier(.65,0,.35,1)" });
      anim(fc, [{ opacity: 0, transform: "translateY(14px)" }, { opacity: 1, transform: "translateY(0)" }], { duration: 640, delay: 520 });
      anim(path, [{ strokeDashoffset: 24 }, { strokeDashoffset: 0 }], { duration: 420, delay: 640 });
    } else path.style.strokeDashoffset = 0;
    setTimeout(function () { count(num, 0, m.d, 700); }, RM ? 0 : 640);
    var close = function () { if (RM) return done(lay, 0); anim(lay, [{ opacity: 1 }, { opacity: 0 }], { duration: 520, easing: SOFT }).onfinish = function () { lay.remove(); }; };
    lay.addEventListener("click", function () { live = null; close(); });
    return handle(m, num, null, lay, RM ? 1800 : 2600, close);
  }
  var PLAY = {
    a: rise, b: lift, c: inRow, d: shore,
    f: function (m) { return goldShore(m, "f"); }, g: function (m) { return goldShore(m, "g"); },
    h: function (m) { return goldShore(m, "h"); }, i: function (m) { return goldShore(m, "i"); },
    n: function (m) { return greenScreen(m, "n"); }, o: function (m) { return greenScreen(m, "o"); }, p: function (m) { return greenScreen(m, "p"); },
    q: function (m) { return greenScreen(m, "q"); }, r: function (m) { return greenScreen(m, "r"); },
    s: function (m) { return greenScreen(m, "s"); }, t: function (m) { return greenScreen(m, "t"); },
    u: function (m) { return greenScreen(m, "u"); }, v: function (m) { return greenScreen(m, "v"); },
    j: function (m) { return fullScreen(m, "j"); }, k: function (m) { return fullScreen(m, "k"); },
    l: function (m) { return fullScreen(m, "l"); }, m: function (m) { return fullScreen(m, "m"); },
    e: function (m) { return m.cause === "sleep" || m.d >= 15 ? full(m) : rise(m); }
  };

  /* ---------- the look: Mind's indigo for surfaces, the score's gold for the seed of the gain ---------- */
  var css = document.createElement("style");
  css.textContent = [
    ".rw-lay{position:fixed;inset:0;pointer-events:none;z-index:150}",
    ".rw-glow{position:fixed;width:120px;height:120px;border-radius:50%;pointer-events:none;background:radial-gradient(closest-side,rgb(247 222 133/.55),rgb(199 215 254/.35) 55%,rgb(199 215 254/0));transform:translate(-50%,-50%) scale(.2);opacity:0}",
    ".rw-pill{position:fixed;display:inline-flex;align-items:center;gap:6px;padding:8px 14px 8px 10px;border-radius:999px;white-space:nowrap;color:#2D3282;font:400 13px/18px Roboto,sans-serif;" +
      "background:rgb(255 255 255/.86);-webkit-backdrop-filter:blur(14px) saturate(1.4);backdrop-filter:blur(14px) saturate(1.4);box-shadow:inset 0 0 0 1px rgb(199 215 254/.9),0 10px 28px -12px rgb(45 50 130/.35)}",
    ".rw-pill b{font:700 17px/20px Roboto,sans-serif;letter-spacing:-.2px;font-variant-numeric:tabular-nums}",
    ".rw-pill .rw-r{font:600 13px/18px Roboto,sans-serif;color:#3538CD}",
    ".rw-pill .rw-sub{color:#667085}.rw-pill .rw-sub::before{content:'\\00B7';margin:0 6px 0 2px;color:#98A2B3}",
    ".rw-seed{width:10px;height:10px;border-radius:50%;flex:none;background:radial-gradient(circle at 35% 35%,#FCEFC2,#CDA935);box-shadow:0 0 0 3px rgb(247 222 133/.28)}",
    ".rw-pill.cap{transform:translateX(-50%);padding:10px 16px 10px 12px}",
    ".rw-bead{position:fixed;left:0;top:0;width:10px;height:10px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#FFF7DA,#CDA935);box-shadow:0 0 12px 3px rgb(247 222 133/.6)}",
    ".rw-tr{position:fixed;left:0;top:0;width:4px;height:4px;border-radius:50%;background:#E8CD6F;opacity:.55;animation:rwtr .7s ease-out forwards}",
    "@keyframes rwtr{to{opacity:0;width:2px;height:2px}}",
    /* C: in the row */
    ".rw-on{overflow:hidden}",
    ".rw-wash{position:absolute;inset:0;pointer-events:none;z-index:0;background:linear-gradient(90deg,rgb(238 244 255/.95),rgb(255 248 224/.55) 70%,rgb(255 255 255/0));clip-path:circle(140% at var(--x) 50%)}",
    ".rw-on > *:not(.rw-wash){position:relative;z-index:1}",
    ".rw-rsay{position:absolute !important;right:0;top:50%;transform:translate(0,-50%);color:#3538CD;font:500 12px/16px Roboto,sans-serif;white-space:nowrap;z-index:2}",
    ".rw-rsay b{font-weight:700;color:#2D3282;font-variant-numeric:tabular-nums}",
    /* D: shore */
    ".rw-shore{position:fixed;bottom:0;height:112px;display:flex;align-items:flex-end;justify-content:center;padding-bottom:16px;" +
      "background:linear-gradient(180deg,rgb(238 244 255/0),rgb(238 244 255/.9) 45%,rgb(224 234 255/.98));}",
    ".rw-pill.flat{position:relative}",
    /* F to I: the gold shore. A light band, a soft gold glow layered under the gain, the words in indigo */
    ".rw-gs{position:fixed;height:132px;display:flex;align-items:flex-end;justify-content:center;padding-bottom:18px;pointer-events:none;" +
      "background:linear-gradient(180deg,rgb(255 255 255/0),rgb(255 255 255/.86) 42%,rgb(255 253 245/.97))}",
    ".rw-gglow{position:absolute;left:50%;bottom:-36px;width:340px;height:150px;transform:translateX(-50%);border-radius:50%;pointer-events:none;" +
      "background:radial-gradient(closest-side,rgb(231 193 68/.42),rgb(253 232 164/.34) 45%,rgb(254 241 199/.16) 70%,rgb(254 241 199/0));filter:blur(2px)}",
    ".rw-gs-f .rw-gglow{width:420px;height:170px;bottom:-60px;background:radial-gradient(closest-side,rgb(205 169 53/.38),rgb(231 193 68/.3) 30%,rgb(253 232 164/.28) 55%,rgb(254 241 199/0))}",
    ".rw-gs-h .rw-gglow{width:220px;height:120px;bottom:-14px}",
    ".rw-gs-g{height:118px;padding-bottom:16px;background:linear-gradient(180deg,rgb(255 255 255/0) 0,rgb(255 255 255/.92) 22px,rgb(255 253 245/.98));-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);" +
      "-webkit-mask:linear-gradient(180deg,transparent 0,#000 20px);mask:linear-gradient(180deg,transparent 0,#000 20px)}",
    ".rw-grim{position:absolute;left:12%;right:12%;top:20px;height:1.5px;border-radius:2px;transform-origin:50% 50%;" +
      "background:linear-gradient(90deg,rgb(231 193 68/0),rgb(231 193 68/.9) 30%,#CDA935 50%,rgb(231 193 68/.9) 70%,rgb(231 193 68/0));box-shadow:0 0 12px 2px rgb(231 193 68/.35)}",
    ".rw-gfly{position:fixed;width:180px;height:110px;border-radius:50%;pointer-events:none;background:radial-gradient(closest-side,rgb(231 193 68/.45),rgb(253 232 164/.3) 50%,rgb(254 241 199/0))}",
    /* the gain, larger: number in indigo, the gold under it */
    ".rw-gbig{position:relative;display:flex;align-items:center;gap:12px;color:#826E2D}",   /* the gain in dark gold (gold-900), on the gold horizon (17 Nov 2026) */
    ".rw-gbig b{font:700 34px/1 Roboto,sans-serif;letter-spacing:-1px;font-variant-numeric:tabular-nums}",
    ".rw-gbig .rw-pc{font-size:.45em;vertical-align:top;margin-left:1px;opacity:.85}",
    ".rw-gl{display:flex;flex-direction:column;font:400 13px/18px Roboto,sans-serif;color:#667085}.rw-gl .rw-r{font:600 14px/18px Roboto,sans-serif;color:#101828}",
    ".rw-pill.gold{position:relative;box-shadow:inset 0 0 0 1px rgb(253 232 164/.9),0 0 0 6px rgb(254 241 199/.55),0 0 24px 6px rgb(231 193 68/.22),0 10px 24px -12px rgb(130 110 45/.35)}",
    ".rw-pill.gold b{font-size:19px}",
    ".rw-gs-i .rw-pill{overflow:hidden}",
    ".rw-shine{position:absolute;top:0;bottom:0;left:0;width:40%;pointer-events:none;background:linear-gradient(90deg,rgb(255 255 255/0),rgb(255 248 224/.85) 50%,rgb(255 255 255/0));transform:translateX(-120%) skewX(-18deg)}",
    /* N to R: Eat's and Move's green win, layout B, white words */
    ".rw-gw{position:fixed;top:0;bottom:0;z-index:170;overflow:hidden;cursor:pointer}",
    ".rw-gw canvas{position:absolute;inset:0;width:100%;height:100%}",
    ".rw-gwc{position:absolute;left:0;right:0;top:50%;transform:translateY(-58%);text-align:center;color:#fff;opacity:0;padding:0 20px}",
    ".rw-gwp{display:inline-flex;align-items:center;gap:10px;padding:6px 16px 6px 6px;border-radius:999px;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.26);font:600 16px/20px Roboto,sans-serif}",
    ".rw-gwd{width:30px;height:30px;border-radius:50%;background:#fff;display:grid;place-items:center;transform:scale(0)}",
    ".rw-gwd path{fill:none;stroke:#299D6B;stroke-width:3.4;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:24;stroke-dashoffset:24}",
    ".rw-gwn{display:flex;align-items:baseline;justify-content:center;gap:10px;margin-top:26px}",
    ".rw-gwn b{font:700 88px/.9 Roboto,sans-serif;letter-spacing:-3px;font-variant-numeric:tabular-nums}",
    ".rw-gwn .rw-pc{display:inline-block;vertical-align:top;margin-left:.06em;font-size:.4em;line-height:1;letter-spacing:0;opacity:.85}",
    ".rw-gwn em{font-style:normal;font:600 26px/1 Roboto,sans-serif;opacity:.92}",
    /* Momentum's layout B, exactly: pill 600 16/20 with a 30px white tick disc, the number 700 96/.9 at -3px, 28px under the
       pill, the % at .4em, the line 400 17/25 at 90% white, 14px under; the block centred on the screen */
    ".rw-b .rw-gwc{transform:translateY(-50%)}",
    ".rw-b .rw-gwn{display:block;margin-top:28px}",
    ".rw-b .rw-gwn b{font:700 96px/.9 Roboto,sans-serif;letter-spacing:-3px}",
    ".rw-b .rw-gwc .rw-ln{margin:14px 0 0;white-space:nowrap}",
    ".rw-gwc .rw-ln{margin:18px 0 0;font:400 17px/25px Roboto,sans-serif;color:rgba(255,255,255,.9)}",
    /* J to M: the full screen. Words: the pill in near-black, the gain in dark gold, the line in grey */
    ".rw-fs{position:fixed;top:0;bottom:0;z-index:170;overflow:hidden;cursor:pointer;display:grid;place-items:center;text-align:center}",
    ".rw-fsbg,.rw-fsfx{position:absolute;inset:0;pointer-events:none}",
    ".rw-fc2{position:relative;padding:0 24px;transform:translateY(-4%)}",
    ".rw-lg{display:inline-flex;align-items:center;gap:10px;padding:6px 16px 6px 6px;border-radius:999px;background:rgb(255 255 255/.92);box-shadow:inset 0 0 0 1px rgb(253 232 164/.95),0 8px 24px -14px rgb(130 110 45/.45);font:600 16px/20px Roboto,sans-serif;color:#101828}",
    ".rw-dk{width:30px;height:30px;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle at 35% 30%,#E7C144,#CDA935 60%,#A68A2D)}",
    ".rw-dk path{fill:none;stroke:#fff;stroke-width:2.8;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:24;stroke-dashoffset:24}",
    ".rw-gn{display:block;margin-top:28px;font:700 96px/.9 Roboto,sans-serif;letter-spacing:-3px;font-variant-numeric:tabular-nums;color:#A68A2D;" +
      "background:linear-gradient(180deg,#B8992F,#8C7424);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}",
    ".rw-gn .rw-pc{display:inline-block;vertical-align:top;margin-left:.06em;font-size:.4em;line-height:1;letter-spacing:0}",
    ".rw-ln{margin:18px 0 0;font:400 17px/25px Roboto,sans-serif;color:#475467}",
    /* j: lavender from the tap, clearing to white, a gold horizon under the gain */
    ".rw-fs-j .rw-fsbg{background:radial-gradient(130% 80% at 50% 40%,#FFFFFF 0%,#F5F8FF 45%,#E0EAFF 100%)}",
    ".rw-fs-j .rw-fsbg::after{content:'';position:absolute;left:50%;top:58%;width:460px;height:200px;transform:translate(-50%,-50%);border-radius:50%;" +
      "background:radial-gradient(closest-side,rgb(205 169 53/.30),rgb(231 193 68/.24) 32%,rgb(253 232 164/.22) 58%,rgb(254 241 199/0))}",
    /* k: a gold dawn from the bottom into a pale morning */
    ".rw-fs-k .rw-fsbg{background:linear-gradient(180deg,#FFFFFF 0%,#FFFDF5 55%,#FFF8E0 100%)}",
    ".rw-fs-k .rw-fsfx{background:radial-gradient(120% 60% at 50% 105%,rgb(205 169 53/.42) 0%,rgb(231 193 68/.30) 28%,rgb(253 232 164/.30) 50%,rgb(254 241 199/.18) 68%,rgb(255 255 255/0) 85%)}",
    /* l: a frosted indigo veil over the screen, the lotus glow breathing behind the number */
    ".rw-fs-l .rw-fsbg{background:rgb(245 248 255/.82);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px)}",
    ".rw-fs-l .rw-fsfx{inset:auto;left:50%;top:48%;width:300px;height:300px;transform:translate(-50%,-50%);display:grid;place-items:center;" +
      "background:radial-gradient(closest-side,rgb(253 232 164/.6),rgb(254 241 199/.45) 30%,rgb(224 234 255/.55) 62%,rgb(224 234 255/0));border-radius:50%;animation:rwbr 4s ease-in-out infinite}",
        "@keyframes rwbr{50%{filter:brightness(1.04);opacity:.9}}",
    /* m: indigo and gold ribbons in from the left, melting into one light */
    ".rw-fs-m .rw-fsbg{background:radial-gradient(130% 80% at 50% 42%,#FFFFFF 0%,#FBFAF6 45%,#EEF4FF 100%)}",
    ".rw-fs-m .rw-fsfx i{position:absolute;left:-20%;width:140%;height:120px;border-radius:50%;filter:blur(18px)}",
    ".rw-fs-m .rw-fsfx i:nth-child(1){top:18%;background:linear-gradient(90deg,rgb(199 215 254/0),rgb(199 215 254/.9),rgb(224 234 255/0))}",
    ".rw-fs-m .rw-fsfx i:nth-child(2){top:34%;background:linear-gradient(90deg,rgb(253 232 164/0),rgb(231 193 68/.55),rgb(253 232 164/0))}",
    ".rw-fs-m .rw-fsfx i:nth-child(3){top:50%;background:linear-gradient(90deg,rgb(164 188 253/0),rgb(164 188 253/.7),rgb(199 215 254/0))}",
    ".rw-fs-m .rw-fsfx i:nth-child(4){top:66%;background:linear-gradient(90deg,rgb(254 241 199/0),rgb(253 232 164/.8),rgb(254 241 199/0))}",
    /* E: the full moment, Mind's light: lavender from the tap, dark indigo words, no score */
    ".rw-full{position:fixed;top:0;bottom:0;z-index:160;display:grid;place-items:center;text-align:center;color:#2D3282;cursor:pointer;" +
      "background:radial-gradient(120% 70% at 50% 42%,#FFFFFF 0%,#F5F8FF 40%,#E0EAFF 100%)}",
    ".rw-full::before{content:'';position:absolute;left:50%;top:42%;width:300px;height:300px;transform:translate(-50%,-50%);border-radius:50%;background:radial-gradient(closest-side,rgb(247 222 133/.32),rgb(247 222 133/0))}",
    ".rw-fc{position:relative;padding:0 24px}",
    ".rw-logged{display:inline-flex;align-items:center;gap:10px;padding:6px 16px 6px 6px;border-radius:999px;background:#fff;box-shadow:inset 0 0 0 1px #C7D7FE;font:600 16px/20px Roboto,sans-serif;color:#2D3282}",
    ".rw-disc{width:30px;height:30px;border-radius:50%;display:grid;place-items:center;background:#444CE7}",
    ".rw-disc path{fill:none;stroke:#fff;stroke-width:2.8;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:24;stroke-dashoffset:24}",
    ".rw-big{display:block;margin-top:28px;font:700 96px/.9 Roboto,sans-serif;letter-spacing:-3px;font-variant-numeric:tabular-nums;color:#2D3282}",
    ".rw-pc{display:inline-block;vertical-align:top;margin-left:.06em;font-size:.4em;line-height:1;letter-spacing:0;opacity:.85}",
    ".rw-line{margin:18px 0 0;font:400 17px/25px Roboto,sans-serif;color:#475467}"
  ].join("");
  document.head.appendChild(css);

  /* doc hook: ?wintry=<cause>:<gain>[,<cause>:<gain>] plays the moment once the screen has settled, from the first open
     row of that kind; a second entry follows 450 ms later, as two quick ticks would */
  var tr = Q.get("wintry");
  if (tr) setTimeout(function () {
    var list = tr.split(","), KEY = { wd: "wd:", me: "me:", br: "br:", mood: "mood", sleep: "sleep" };
    var first = list[0].split(":")[0], row = [].filter.call(document.querySelectorAll("[data-tiprow]"), function (r) { return r.dataset.tiprow.indexOf(KEY[first] || "") === 0 && !r.classList.contains("done"); })[0];
    if (row && first !== "sleep") { window.scrollTo(0, row.getBoundingClientRect().top + scrollY - innerHeight / 2);   /* scrollIntoView would also scroll a doc framing this screen */
      tap = { t: performance.now(), key: row.dataset.tiprow, sheet: false, r: row.getBoundingClientRect() }; }
    var base = window.MDRHYTHM && MDRHYTHM.score() || 50;
    list.forEach(function (it, i) {
      setTimeout(function () {
        var q = it.split(":"), cause = q[0], d = +q[1] || 7; base = Math.min(100, base + d); MD.cause = cause;
        if (live && live.add) live.add(d, cause, base); else live = PLAY[V]({ d: d, cause: cause, n: base, was: base - d, o: origin() });
      }, (row ? 500 : 0) + i * 450);
    });
  }, 1600);
})();
