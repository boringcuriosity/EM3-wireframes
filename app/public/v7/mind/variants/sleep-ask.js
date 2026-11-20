/* sleep-ask.js: log last night's sleep as questions you answer Yes or No, through SVX.ask (variants/sleep.js).
   Round one (the before): ?sask=  a Chat   b One at a time   c Both on one screen   d Time card   e As planned?
   Round two:              ?sask=  f Fill the sentence   g Big Yes or No   h Night strip   i Yes first   j Card stack
   Round three, GoodFlip's quiz card: ?sask=  k Quiz card (default)   l Quiz card, answers with the time   m Answered cards stack   n One card, both questions
   ?swake= a a third question   b a quiet link on the summary (default)   c a switch row on the summary
   Doc only: ?sqstep=2 (first answered), ?sqstep=9 (summary), ?sqno=1 (No chosen, picker open), ?sqaw=1 (woke in the night), ?sqnp=1 (no plan). */
(function () {
  window.SVX = window.SVX || {};
  var Q = new URLSearchParams(location.search);
  var V = /^[a-n]$/.test(Q.get("sask") || "") ? Q.get("sask") : "m";   /* M picked, 20 Nov 2026 */
  /* M's "Add another sleep", kept out of the way (Shaheer, 20 Nov 2026): ?sxadd=a under the wake-up wheel, only when they
     change that time (default); b a small grey line under the total; c the card's three dots once a night is saved; 1 the old right-aligned button */
  var XA = /^[abc1]$/.test(Q.get("sxadd") || "") ? Q.get("sxadd") : "c";   /* C picked, 20 Nov 2026 */
  var NEW = /[f-n]/.test(V), QC = /[k-n]/.test(V);
  var W = /^[abc]$/.test(Q.get("swake") || "") ? Q.get("swake") : "b";
  var c, s, box, booted = false;

  /* ---------- the questions ---------- */
  function keys() { return (V === "e" ? ["all"] : ["bed", "wake"]).concat(W === "a" ? ["aw"] : []); }
  function done(k) { return V === "c" ? !!s.a[k] : !!s.a[k] && s.open !== k && s.re !== k; }
  function cur() { if (s.re) return s.re; var ks = keys(); for (var i = 0; i < ks.length; i++) if (!done(ks[i])) return ks[i]; return null; }
  function picks(k, v) { return k === "aw" ? v === "y" : v === "n"; }   /* the answer that opens the picker */
  var XK = /^x(\d)([bw])$/;   /* M's added sleeps: x0b, x0w are the first added sleep's times */
  function xo(k) { var m = XK.exec(k); return m && { o: s.x[+m[1]], f: m[2] === "b" ? "bed" : "wake" }; }
  function val(k) { var x = xo(k); if (x) return x.o[x.f]; return k === "from" || k === "to" ? s.aw[k] : s[k]; }
  function put(k, m) { var x = xo(k); if (x) x.o[x.f] = m; else if (k === "from" || k === "to") s.aw[k] = m; else s[k] = m; }
  function T(m) { return c.clk(m).replace(" ", "\u00a0"); }   /* a time never breaks across lines */
  function at() { return s.edit ? "at " : "around "; }
  function qText(k) {
    if (k === "aw") return "Did you wake up in the night?";
    if (k === "all") return s.np ? "When did you sleep?" : "Did you sleep " + T(s.sug.bed) + " to " + T(s.sug.wake) + "?";
    if (s.np) return k === "bed" ? "When did you sleep?" : "When did you wake up?";   /* free users, no coach plan: nothing to suggest (20 Nov 2026) */
    return (k === "bed" ? "Did you fall asleep " : "Did you wake up ") + at() + T(s.sug[k]) + "?";
  }
  function pickQ(k) { return k === "aw" ? "When were you awake?" : k === "all" ? "When did you sleep?" : k === "bed" ? "What time did you fall asleep?" : "What time did you wake up?"; }
  function opts(k) {
    if (k === "aw") return [["y", "Yes", "I was up for a while"], ["n", "No", "I slept right through"]];
    if (k === "all") return [["y", "Yes", s.edit ? "Just as I logged" : "Just as planned"], ["n", "No", "It was different"]];
    return [["y", "Yes", "at " + T(s.sug[k])], ["n", "No", "Another time"]];
  }
  function said(k) {   /* the answer, as one short line */
    var v = s.a[k];
    if (k === "aw") return v === "y" ? T(s.aw.from) + " to " + T(s.aw.to) : "Slept right through";
    if (k === "all") return T(s.bed) + " to " + T(s.wake);
    return T(s[k]);
  }
  function lab(k) { var x = xo(k); if (x) return x.f === "bed" ? "Slept again" : "Woke up again"; return { bed: "Fell asleep", wake: "Woke up", from: "Awake from", to: "Back to sleep", aw: "In the night", all: "Slept" }[k]; }
  function ico(k) { return k === "wake" || k === "from" ? '<i class="sq-i su">' + c.SUNF + '</i>' : '<i class="sq-i mo">' + c.MOONF + '</i>'; }

  /* ---------- the night, its checks and its line ---------- */
  function xs() { return (s.x || []).filter(function (o) { return o.st === 2; }); }   /* added sleeps, both times answered */
  function night() {
    var g = s.aw.on ? [{ bed: s.bed, wake: s.aw.from }, { bed: s.aw.to, wake: s.wake }] : [{ bed: s.bed, wake: s.wake }];
    g = g.concat(xs().map(function (o) { return { bed: o.bed, wake: o.wake }; })).sort(function (a, b) { return a.bed - b.bed; });
    var n = { bed: g[0].bed, wake: g[g.length - 1].wake };
    if (g.length > 1) n.segs = g;
    return n;
  }
  function slept() { return s.wake - s.bed - (s.aw.on ? s.aw.to - s.aw.from : 0) + xs().reduce(function (t, o) { return t + o.wake - o.bed; }, 0); }
  function xErr(o) {   /* an added sleep: after it starts, before now, and clear of every other sleep */
    if (o.wake <= o.bed) return "Waking up has to come after falling asleep.";
    if (o.wake > c.NOWM) return "It is " + c.clk(c.NOWM) + " now. Pick a time before that.";
    var all = [{ bed: s.bed, wake: s.wake }].concat(s.x.filter(function (y) { return y !== o && y.st === 2; }));
    if (all.some(function (y) { return o.bed < y.wake && o.wake > y.bed; })) return "This overlaps another sleep. Check the times.";
    return "";
  }
  function check() {
    var r = c.check({ bed: s.bed, wake: s.wake }); if (r.err) return r;
    if ((s.x || []).some(function (o) { return o.st < 2 || xErr(o); })) return { err: "", hold: true };   /* an added sleep still open */
    if (s.aw.on) {
      if (s.aw.from <= s.bed) return { err: "You woke in the night after you fell asleep. Move Awake from later." };
      if (s.aw.to <= s.aw.from) return { err: "Back to sleep has to come after Awake from." };
      if (s.aw.to >= s.wake) return { err: "Back to sleep has to come before you woke up for the day." };
      if (slept() < 180) return { wrn: "That is a short night. Save it if it is right." };
      return {};
    }
    return r;
  }
  function sumInner() {
    var r = check();
    /* M: plain words over the sticky Save (Shaheer, 20 Nov 2026) */
    if (V === "m" && !r.err) return '<p class="sq-tl">You slept for <b>' + c.dur(slept()) + '</b>' + (s.aw.on ? ', with ' + c.gap(s.aw.to - s.aw.from) + ' awake' : '') + '.</p>' + (r.wrn ? '<div class="sq-msg wrn">' + c.I.info + '<span>' + r.wrn + '</span></div>' : '');
    if (NEW) return r.err ? '<div class="sq-msg err">' + c.I.warn + '<span>' + r.err + '</span></div>' : '<p class="sq-tot"><b>' + c.dur(slept()) + '</b> of sleep' + (s.aw.on ? ', ' + c.gap(s.aw.to - s.aw.from) + ' awake' : '') + '</p>' +
      (r.wrn ? '<div class="sq-msg wrn">' + c.I.info + '<span>' + r.wrn + '</span></div>' : '');
    if (r.err) return '<div class="sq-msg err">' + c.I.warn + '<span>' + r.err + '</span></div>';
    return '<p class="sq-sl"><b>' + c.dur(slept()) + '</b> of sleep, <span class="nw">' + T(s.bed) + ' to ' + T(s.wake) + '</span>' + (s.aw.on ? ', ' + c.gap(s.aw.to - s.aw.from) + ' awake' : '') + '</p>' +
      (r.wrn ? '<div class="sq-msg wrn">' + c.I.info + '<span>' + r.wrn + '</span></div>' : '');
  }
  function sumBox() { return '<div class="sq-sum" data-sq-sum aria-live="polite">' + sumInner() + '</div>'; }
  function saveBtn(off) { var r = check(); return '<button class="md-save sq-save" data-sq="save"' + (off || r.err || r.hold ? " disabled" : "") + '>Save Sleep</button>'; }

  /* ---------- the wheel: hour, minutes in fives, AM or PM (the sheet's own wheel, copied) ---------- */
  var HRS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  function wheel(k) {
    var col = function (w, arr, l) { return '<div class="sq-wh" data-w="' + w + '" tabindex="0" role="listbox" aria-label="' + lab(k) + ', ' + l + '"' + (w === "h" ? " data-sq-af" : "") + '>' + arr.map(function (x, j) { return '<button tabindex="-1" role="option" data-i="' + j + '">' + x + '</button>'; }).join("") + '</div>'; };
    var mn = []; for (var i = 0; i < 60; i += 5) mn.push(("0" + i).slice(-2));
    return '<div class="sq-whs" data-sq-wk="' + k + '">' + col("h", HRS, "hour") + col("m", mn, "minutes") + col("ap", ["AM", "PM"], "AM or PM") + '</div>';
  }
  function bindWheels() {
    box.querySelectorAll(".sq-whs").forEach(function (ws) {
      var k = ws.dataset.sqWk, m = ((val(k) % 1440) + 1440) % 1440, hh = Math.floor(m / 60);
      var wi = { h: hh % 12, m: Math.round((m % 60) / 5) % 12, ap: hh < 12 ? 0 : 1 };
      ws.querySelectorAll(".sq-wh").forEach(function (w) {
        var col = w.dataset.w, max = w.children.length - 1, t, t0 = Date.now();
        var mark = function () { [].forEach.call(w.children, function (b, j) { b.setAttribute("aria-selected", j === wi[col]); }); };
        w.scrollTop = wi[col] * 40; mark();
        var set = function (j) {
          j = Math.max(0, Math.min(max, j)); if (wi[col] === j) return; wi[col] = j; mark();
          var d = (wi.h + (wi.ap ? 12 : 0)) * 60 + wi.m * 5;
          put(k, XK.test(k) ? (d + 1440 <= c.NOWM ? d + 1440 : d) : k === "wake" ? 1440 + d : d >= 720 ? d : 1440 + d);   /* an added sleep: the latest such time before now */   /* bedtimes in the PM are last night; the rest is today */
          if (V === "d" && (k === "bed" || k === "wake")) s.mv[k] = true;
          upd();
        };
        var go = function (j) { w.scrollTo({ top: j * 40, behavior: c.RD ? "auto" : "smooth" }); set(j); };
        w.addEventListener("scroll", function () { if (Date.now() - t0 < 250) return; clearTimeout(t); t = setTimeout(function () { set(Math.round(w.scrollTop / 40)); }, 90); });
        w.addEventListener("keydown", function (e) { if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return; e.preventDefault(); go(wi[col] + (e.key === "ArrowDown" ? 1 : -1)); });
        [].forEach.call(w.children, function (b) { b.onclick = function () { go(+b.dataset.i); }; });
      });
    });
  }
  /* two times with one wheel under them: Fell asleep and Woke up (E), or Awake from and Back to sleep (the night) */
  function pair(a, b) {
    return '<div class="sq-flds">' + [a, b].map(function (k) {
      return '<button class="sq-fld" data-sq="fld" data-k="' + k + '" aria-pressed="' + (s.pk === k) + '"><span class="fl">' + ico(k) + lab(k) + '</span><span class="fv" data-sq-v="' + k + '">' + T(val(k)) + '</span></button>';
    }).join("") + '</div>' + wheel(s.pk);
  }
  function picker(k) { return k === "aw" ? pair("from", "to") : k === "all" ? pair("bed", "wake") : wheel(k); }

  /* ---------- shared pieces ---------- */
  function tag(k) {
    if (s.np && k !== "aw") return "";
    if (k === "aw") return '<p class="sq-sub">Only if you were up for a while, not a quick sip of water.</p>';
    return '<span class="sq-tag">' + c.I.check + (s.edit ? "What you logged" : "Your coach’s plan") + '</span>';
  }
  function radios(k, cls, inner) {
    return '<div class="' + cls + '" role="radiogroup" aria-labelledby="sqq-' + k + '">' + opts(k).map(function (o, i) {
      return '<button role="radio" class="' + (s.a[k] === o[0] ? "on" : "") + '" aria-checked="' + (s.a[k] === o[0]) + '" data-sq="ans" data-k="' + k + '" data-v="' + o[0] + '"' + (i ? "" : " data-sq-af") + '>' + inner(o, i) + '</button>';
    }).join("") + '</div>';
  }
  function row(k) {   /* an answered question, folded to one line you can change */
    return '<div class="sq-done">' + (k === "aw" ? ico("from") : ico(k === "all" ? "bed" : k)) + '<span class="l">' + lab(k) + '</span><b data-sq-v="' + (k === "all" || k === "aw" ? "" : k) + '">' + said(k) + '</b>' +
      '<button class="sq-chg" data-sq="chg" data-k="' + k + '" aria-label="Change ' + lab(k).toLowerCase() + '">Change</button></div>';
  }
  function rows(upTo) { var ks = keys(), h = ""; for (var i = 0; i < ks.length && ks[i] !== upTo; i++) h += row(ks[i]); return h ? '<div class="sq-rows">' + h + '</div>' : ""; }
  function fresh() { return s.fresh ? " sq-in" : ""; }

  /* ---------- the night's waking, on the summary (?swake=b link, ?swake=c switch) ---------- */
  function wakeX() {
    if (W === "a") return "";
    var ed = s.aw.on ? (W === "b"
      ? '<div class="sq-awb"><p class="sq-sent">Awake from <button class="sq-tok' + (s.open === "aw" && s.pk === "from" ? " on" : "") + '" data-sq="fld" data-k="from" data-sq-v="from">' + T(s.aw.from) + '</button> to <button class="sq-tok' + (s.open === "aw" && s.pk === "to" ? " on" : "") + '" data-sq="fld" data-k="to" data-sq-v="to">' + T(s.aw.to) + '</button></p>' +
        (s.open === "aw" ? wheel(s.pk) : "") + '<button class="sq-lk" data-sq="awoff">Remove</button></div>'
      : '<div class="sq-awc">' + pair("from", "to").replace(/<div class="sq-whs[\s\S]*$/, s.open === "aw" ? wheel(s.pk) : "") + '</div>') : "";
    if (W === "b") return s.aw.on ? '<div class="sq-wx' + fresh() + '"><div class="sq-wxh">' + ico("from") + 'Woke up in the night</div>' + ed + '</div>'
      : '<button class="sq-lk sq-wl" data-sq="awon">' + c.PLUSQ + 'Woke up in the night?</button>';
    return '<div class="sq-sw' + (s.aw.on ? " on" : "") + '"><button class="sq-swb" role="switch" aria-checked="' + s.aw.on + '" data-sq="' + (s.aw.on ? "awoff" : "awon") + '"><span class="t"><b>Woke up in the night</b><span>Time awake does not count as sleep</span></span><i class="sq-tg"></i></button>' + ed + '</div>';
  }

  /* ---------- A: a chat. Questions arrive as bubbles, your answer chip becomes your reply ---------- */
  function avatar(k) { return '<span class="sq-av ' + (k === "wake" ? "su" : k === "sum" ? "dn" : "mo") + '" aria-hidden="true">' + (k === "wake" ? c.SUNF : k === "sum" ? c.I.check : c.MOONF) + '</span>'; }
  function bot(k, t, av, id) { return '<div class="sq-bot">' + (av ? avatar(k) : '<span class="sq-av0"></span>') + '<div class="sq-bb"' + (id ? ' id="' + id + '"' : '') + '>' + t + '</div></div>'; }
  function me(k, t) { return '<button class="sq-me" data-sq="chg" data-k="' + k + '" aria-label="' + t + '. Change">' + t + c.I.pencil + '</button>'; }
  function rA() {
    var ks = keys(), cu = cur(), h = "";
    for (var i = 0; i < ks.length; i++) {
      var k = ks[i], now = k === cu, g = bot(k, qText(k), true, "sqq-" + k);
      if (!now) { h += g + me(k, k === "aw" && s.a[k] === "n" ? "No, I slept right through" : (s.np && k !== "aw" ? "" : s.a[k] === "y" ? "Yes, " : "No, ") + said(k)); continue; }
      if (s.open === k) g += (s.np && k !== "aw" ? "" : '<div class="sq-me static">' + (k === "aw" ? "Yes, I was up" : k === "all" ? "No, it was different" : "No, another time") + '</div>' + bot(k, pickQ(k), false)) + '<div class="sq-pc">' + picker(k) + '<button class="sq-sec" data-sq="done" data-k="' + k + '">Done</button></div>';
      else g += radios(k, "sq-chips", function (o) { return o[0] === "y" ? (k === "aw" ? "Yes, I was up" : k === "all" ? (s.edit ? "Yes, as logged" : "Yes, as planned") : "Yes, " + T(s.sug[k])) : (k === "aw" ? "No, slept through" : k === "all" ? "No, it was different" : "No, another time"); });
      h += '<div class="sq-grp' + fresh() + '" data-sq-act>' + g + '</div>';
      break;
    }
    if (!cu) h += '<div class="sq-grp' + fresh() + '" data-sq-act><div class="sq-bot">' + avatar("sum") + '<div class="sq-bb">' + sumBox() + '</div></div>' + wakeX() + '</div>' + saveBtn();
    return h;
  }

  /* ---------- B: one question at a time, two big answer cards, a step count, a summary ---------- */
  function cards(k) {
    return radios(k, "sq-cards", function (o) {
      var ic = k === "aw" ? (o[0] === "y" ? "su" : "mo") : o[0] === "y" ? (k === "wake" ? "su" : "mo") : "no";
      return '<span class="ic ' + ic + '">' + (ic === "su" ? c.SUNF : ic === "mo" ? c.MOONF : c.I.pencil) + '</span><span class="tx"><b>' + o[1] + '</b><span>' + o[2] + '</span></span><i class="rd"></i>';
    });
  }
  function step(k, body) { return '<div class="sq-step' + fresh() + '" data-sq-act><h3 class="sq-q" id="sqq-' + k + '">' + (s.open === k && !(s.np && k !== "aw") ? pickQ(k) : qText(k)) + '</h3>' + (s.open === k && k !== "aw" && k !== "all" ? tag(k).replace("</span>", ": " + T(s.sug[k]) + "</span>") : tag(k)) + body + '</div>'; }
  function prog(cu) {
    var ks = keys(), i = cu ? ks.indexOf(cu) : ks.length;
    if (ks.length === 1 && cu) return "";   /* one question needs no count */
    return '<div class="sq-prog">' + (i ? '<button class="sq-back" data-sq="back" aria-label="Back">' + BACK + '</button>' : '') +
      '<span class="n">' + (cu ? "Question " + (i + 1) + " of " + ks.length : "Check and save") + '</span><span class="bars" aria-hidden="true"' + (ks.length === 1 ? " hidden" : "") + '>' + ks.map(function (x, j) { return '<i class="' + (j < i ? "on" : j === i ? "now" : "") + '"></i>'; }).join("") + '</span></div>';
  }
  function asked(k) {   /* B, D and E ask the same way: the cards, or the picker once No is picked */
    if (s.open === k) return step(k, '<div class="sq-pk">' + picker(k) + '</div><button class="sq-sec" data-sq="done" data-k="' + k + '">Next</button>');
    if (V === "d" && k !== "aw" && k !== "all") return tcard(k);
    return step(k, cards(k));
  }
  function rB() {
    var cu = cur();
    if (cu) return prog(cu) + rows(cu) + asked(cu);
    return prog(null) + '<div class="sq-end' + fresh() + '" data-sq-act>' + sumBox() + '<div class="sq-night" data-sq-bar>' + c.bar(check().err ? null : night(), { inSheet: true }) + '</div>' + rows(null) + wakeX() + '</div>' + saveBtn();
  }

  /* ---------- C: both questions on one screen, each a Yes / No switch that opens its own wheel ---------- */
  function rC() {
    var ks = keys(), h = "", ok = true;
    ks.forEach(function (k) {
      var off = !ok, np = s.np && k !== "aw", v = s.a[k];
      h += '<div class="sq-row' + (off ? " off" : "") + '"' + (off ? ' aria-disabled="true"' : "") + '><h3 id="sqq-' + k + '">' + (k === "aw" ? ico("from") : ico(k)) + '<span>' + qText(k) + '</span></h3>' +
        (np ? "" : radios(k, "sq-seg", function (o) { return c.I.check + o[1]; })) +
        (picks(k, v) && k !== "aw" ? '<button class="sq-tf' + (s.open === k ? " on" : "") + '" data-sq="tap" data-k="' + k + '" aria-expanded="' + (s.open === k) + '"><span class="l">' + lab(k) + '</span><b data-sq-v="' + k + '">' + T(s[k]) + '</b><span class="d" data-sq-d="' + k + '">' + c.dayOf(s[k], k) + '</span><i class="cv"></i></button>' : "") +
        (k === "aw" && v === "y" ? pair("from", "to").replace(/<div class="sq-whs[\s\S]*$/, s.open === "aw" ? wheel(s.pk) : "") : picks(k, v) && s.open === k ? '<div class="sq-in">' + wheel(k) + '</div>' : "") + '</div>';
      if (!v) ok = false;
    });
    return '<div class="sq-plan">' + (s.np ? "" : tag("bed").replace("</span>", ": " + T(s.sug.bed) + " to " + T(s.sug.wake) + "</span>")) + '</div>' + h + (cur() ? '<div class="sq-sum" data-sq-sum aria-live="polite"><p class="sq-sl q">Answer both to see your night.</p></div>' : sumBox() + wakeX()) + saveBtn(!!cur());
  }

  /* ---------- D: a time card you confirm, or nudge 15 minutes at a time (tap the time for the wheel) ---------- */
  function tcard(k) {
    var d = s[k] - s.sug[k];
    return '<div class="sq-step' + fresh() + '" data-sq-act><h3 class="sq-q" id="sqq-' + k + '">' + (k === "bed" ? "When did you fall asleep?" : "When did you wake up?") + '</h3>' +
      '<div class="sq-tc" role="group" aria-labelledby="sqq-' + k + '"><button class="sq-nb" data-sq="nud" data-k="' + k + '" data-n="-15" aria-label="15 minutes earlier">' + MINUS + '<span>Earlier</span></button>' +
      '<button class="sq-tv" data-sq="tap" data-k="' + k + '" aria-expanded="' + (s.open === k) + '" aria-label="' + lab(k) + ', ' + T(s[k]) + '. Pick a time">' + ico(k) + '<b data-sq-v="' + k + '">' + T(s[k]) + '</b><span data-sq-d="' + k + '">' + c.dayOf(s[k], k) + '</span></button>' +
      '<button class="sq-nb" data-sq="nud" data-k="' + k + '" data-n="15" aria-label="15 minutes later">' + PLUS + '<span>Later</span></button></div>' +
      '<p class="sq-note' + (s[k] !== s.sug[k] ? " mv" : "") + '" data-sq-note="' + k + '" aria-live="polite">' + noteD(k) + '</p>' +
      (s.tc === k ? '<div class="sq-in">' + wheel(k) + '</div>' : '') + '<button class="sq-sec" data-sq="ans" data-k="' + k + '" data-v="y" data-sq-af>' + (s.np ? "Next" : "That\u2019s Right") + '</button></div>';
  }
  function noteD(k) {
    if (s.np) return "Tap the time to pick it, or step 15 minutes.";
    var d = s[k] - s.sug[k], w = s.edit ? "what you logged" : "your coach’s plan";
    return d ? c.gap(d) + (d > 0 ? " later" : " earlier") + " than " + w : (s.edit ? "What you logged" : "Your coach’s plan") + ", " + T(s.sug[k]);
  }
  function rD() { return rB(); }

  /* ---------- E: one question for the usual night, the two times only when it was different ---------- */
  function rE() {
    var cu = cur();
    if (cu === "all" && s.open !== "all" && !s.np) return '<div class="sq-step' + fresh() + '" data-sq-act><h3 class="sq-q" id="sqq-all">' + qText("all") + '</h3>' + tag("all") +
      cards("all") + '</div>';
    return rB();
  }

  /* ================= round two: the question is the hero, Yes moves on by itself ================= */
  var CHK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>';
  var XX = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M7 7l10 10M17 7 7 17"/></svg>';
  function pic(k) { var su = k === "wake"; return '<span class="sq-pic ' + (su ? "su" : "mo") + '" aria-hidden="true">' + (su ? c.SUNF : c.MOONF) + '</span>'; }
  function hq(k) {
    if (k === "aw") return "Did you wake up in the night?";
    if (s.np) return k === "bed" ? "When did you fall asleep?" : "When did you wake up?";
    return (k === "bed" ? "Did you fall asleep " : "Did you wake up ") + at() + '<b>' + T(s.sug[k]) + '</b>?';
  }
  function told(k) {   /* an answer, as a light sentence */
    if (k === "aw") return s.aw.on ? 'Awake <b>' + T(s.aw.from) + '</b> to <b>' + T(s.aw.to) + '</b>' : 'Slept right through';
    return (k === "bed" ? "Fell asleep at " : "Woke up at ") + '<b>' + T(s[k]) + '</b>';
  }
  function line(k) { return '<button class="sq-said' + (s.last === k && s.fresh ? " sq-fold" : "") + '" data-sq="chg" data-k="' + k + '" aria-label="' + told(k).replace(/<\/?b>/g, "") + '. Change">' + ico(k === "wake" ? "wake" : "bed") + '<span>' + told(k) + '</span>' + c.I.pencil + '</button>'; }
  function lines(ks) { return ks.length ? '<div class="sq-lines">' + ks.map(line).join("") + '</div>' : ""; }
  function yn(k) {   /* two big answers; once No is picked they press in and slim down */
    var h = radios(k, "sq-yn" + (s.open === k ? " sm" : ""), function (o) { return (o[0] === "y" ? CHK : XX) + '<span>' + o[1] + '</span>'; });
    return s.open === k ? h.replace(" data-sq-af", "") : h;
  }
  function opened(k, sm) {   /* the picker, in place, with one confirm */
    if (s.open !== k) return "";
    var w = picker(k); if (sm) w = w.replace('class="sq-whs"', 'class="sq-whs sm"');
    var xl = V === "m" && XA === "a" && k === "wake" && !s.x.length ? '<button class="sq-qx" data-sq="xafter">Slept again after this? Add it</button>' : "";
    return '<div class="sq-op' + fresh() + '">' + w + '<button class="sq-sec" data-sq="done" data-k="' + k + '">Done</button>' + xl + '</div>';
  }
  function hero(k, inner, cls, nopic) { return '<div class="sq-hero' + (cls ? " " + cls : "") + fresh() + '" data-sq-act>' + (nopic ? "" : pic(k)) + '<h3 class="sq-hq" id="sqq-' + k + '">' + hq(k) + '</h3>' + inner + '</div>'; }
  function askG(k, cls, nopic) { return hero(k, (s.np && k !== "aw" ? "" : yn(k)) + opened(k), cls, nopic); }
  function fin() { return '<div class="sq-fin' + fresh() + '" data-sq-act><div data-sq-sum aria-live="polite">' + sumInner() + '</div>' + wakeX() + '</div>'; }
  function flow(ask, noLines, lf) {   /* answered lines above, the question in its place, the night at the end */
    var cu = cur(), ks = keys(), i = cu ? ks.indexOf(cu) : ks.length;
    var bef = ks.slice(0, i).filter(done), aft = cu ? ks.slice(i + 1).filter(done) : [];
    var L = lf ? function (a) { return a.map(lf).join(""); } : lines;
    return '<div class="sq-flow">' + (noLines ? "" : L(bef)) + (cu ? ask(cu) : fin()) + (noLines ? "" : L(aft)) + '</div>' + (cu ? "" : saveBtn());
  }

  /* G: big Yes or No under a big question */
  function rG() { return flow(function (k) { return askG(k); }); }

  /* I: Yes is the big button, Different Time a quiet link that opens a small wheel */
  function rI() {
    return flow(function (k) {
      if (k === "aw" || s.np) return askG(k);
      var o = s.open === k;
      return hero(k, (o ? '<div class="sq-op' + fresh() + '">' + wheel(k).replace('class="sq-whs"', 'class="sq-whs sm"') + '</div>' : '') + '<div class="sq-ia">' +
        (o ? '<button class="sq-yes" data-sq="done" data-k="' + k + '">Use<span data-sq-v="' + k + '">' + T(s[k]) + '</span></button><button class="sq-lk" data-sq="ans" data-k="' + k + '" data-v="y">Keep ' + T(s.sug[k]) + '</button>'
          : '<button class="sq-yes" data-sq="ans" data-k="' + k + '" data-v="y" data-sq-af>' + CHK + 'Yes, ' + T(s.sug[k]) + '</button><button class="sq-lk" data-sq="ans" data-k="' + k + '" data-v="n">Different Time</button>') + '</div>');
    });
  }

  /* J: each question on its own card, the next one waiting under it; an answered card folds into a line */
  function rJ() {
    return flow(function (k) { var ks = keys(), more = ks.slice(ks.indexOf(k) + 1).some(function (x) { return !done(x); }); return askG(k, "sq-card " + (k === "wake" ? "su" : "mo") + (more ? " more" : "")); });
  }

  /* H: a night strip, moon to sun. Each answer lights its end; the hours fill in between */
  function rH() {
    var both = done("bed") && done("wake");
    var nd = function (k) {
      var on = done(k), now = cur() === k, su = k === "wake";
      return '<button class="sq-nd ' + (su ? "su" : "mo") + (on ? " on" : "") + (on && s.last === k && s.fresh ? " lit" : "") + (now ? " now" : "") + '" data-sq="chg" data-k="' + k + '"' + (on ? ' aria-label="' + lab(k) + ' ' + T(s[k]) + '. Change"' : ' disabled aria-hidden="true"') + '>' +
        '<span class="dot">' + (su ? c.SUNF : c.MOONF) + '</span><span class="tm">' + (on || (now && s.open === k) ? '<span data-sq-v="' + k + '">' + T(s[k]) + '</span>' : s.np ? "" : T(s.sug[k])) + '</span><span class="lb">' + lab(k) + '</span></button>';
    };
    var to = both ? 0 : done("bed") ? 50 : 100;
    var st = '<div class="sq-strip">' + nd("bed") + '<div class="sq-trk" aria-hidden="true"><i class="f" data-to="' + to + '" style="clip-path:inset(0 ' + (s.fill == null ? to : s.fill) + '% 0 0)"></i></div>' + nd("wake") + '</div>';
    return st + flow(function (k) { return askG(k, "", true); }, true);
  }

  /* F: one sentence you complete; each time is a chip you confirm or change */
  function rF() {
    var cu = cur();
    var chip = function (k) {
      var ok = done(k);
      return '<button class="sq-ch ' + (k === "wake" ? "su" : "mo") + (ok ? " set" : "") + (cu === k ? " now" : "") + '" data-sq="chg" data-k="' + k + '"' + (ok ? ' aria-label="' + lab(k) + ' ' + T(s[k]) + '. Change"' : " disabled") + '>' +
        (ok ? (k === "wake" ? c.SUNF : c.MOONF) : "") + '<span data-sq-v="' + k + '">' + T(s[k]) + '</span>' + (ok || s.open === k || s.np ? "" : '<span class="qm">?</span>') + '</button>';
    };
    var sen = '<p class="sq-sen" id="sqq-' + (cu === "bed" || cu === "wake" ? cu : "sen") + '">I fell asleep at ' + chip("bed") + ' and woke up at ' + chip("wake") + '</p>';
    var low = "";
    if (cu === "aw") low = askG("aw");
    else if (cu) low = '<div class="sq-fa' + fresh() + '" data-sq-act>' + (s.open === cu ? opened(cu) : radios(cu, "sq-yn sm", function (o) { return o[0] === "y" ? CHK + "<span>That’s Right</span>" : c.I.pencil + "<span>Change</span>"; })) + '</div>';
    else low = fin();
    return '<div class="sq-flow">' + sen + low + '</div>' + (cu ? "" : saveBtn());
  }

  /* ================= round three: GoodFlip's own quiz card =================
     A white card with a soft glow, the moon or sun in a round tile beside the question, radio pills that wrap,
     the Mind lotus (icons/feed-lotus-wash-indigo.svg) in the corner. A pick goes green, then the card folds. */
  var LOTUS = "/v7/icons/feed-lotus-wash-indigo.svg";
  function tile(k) { var su = k === "wake"; return '<span class="sq-tile ' + (su ? "su" : "mo") + '" aria-hidden="true">' + (su ? c.SUNF : c.MOONF) + '</span>'; }
  function ansT(k) {
    if (k === "aw") return s.aw.on ? "Yes, " + T(s.aw.from) + " to " + T(s.aw.to) : "No";
    if (s.np) return T(s[k]);
    return (s.a[k] === "y" && s[k] === s.sug[k] ? "Yes, " : "No, ") + T(s[k]);
  }
  function pillLab(k, o) {
    if (V !== "l") return o[1];
    if (k === "aw") return o[0] === "y" ? "Yes, I was up" : "No, slept through";
    return o[0] === "y" ? "Yes, " + T(s.sug[k]) : "No, another time";
  }
  function pills(k) {
    var h = radios(k, "sq-qp", function (o) { return '<i class="rd" aria-hidden="true"></i><span>' + pillLab(k, o) + '</span>'; });
    return s.open === k ? h.replace(" data-sq-af", "") : h;   /* No picked: focus goes to the wheel */
  }
  function qcard(k) {
    var info = V === "l" && !s.np && k !== "aw" ? '<p class="sq-qi">' + c.I.info + '<span>' + (s.edit ? "The time you logged." : "From your coach’s sleep plan.") + '</span></p>' : "";
    return '<div class="sq-qh">' + tile(k) + '<h3 class="sq-qq" id="sqq-' + k + '">' + qText(k) + '</h3></div>' + info +
      (s.np && k !== "aw" ? "" : pills(k)) + opened(k);
  }
  var EDI = '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path fill="currentColor" d="m14.208 4.586-2.794-2.793a1 1 0 0 0-1.414 0L2.293 9.5a1 1 0 0 0-.293.707V13a1 1 0 0 0 1 1h10.5a.5.5 0 0 0 0-1H7.208l7-7a1 1 0 0 0 0-1.414M5.793 13H3v-2.793l5.5-5.5L11.293 7.5zM12 6.793 9.208 4l1.5-1.5L13.5 5.293z"/></svg>';   /* the house Edit icon (Shaheer, 20 Nov 2026) */
  function qa(k, card) {   /* answered: the question in regular weight, the answer bold, Edit */
    return '<div class="sq-qa' + (card ? " sq-qc sm" : "") + (s.last === k && s.fresh ? " sq-fold" : "") + '"><p>' + qText(k) + '</p><div class="sq-qaa"><b>' + ansT(k) + '</b>' +
      '<button class="sq-ed" data-sq="chg" data-k="' + k + '" aria-label="Edit, ' + qText(k) + ' ' + ansT(k) + '">Edit' + EDI + '</button></div></div>';
  }
  function cardOf(k) { return '<div class="sq-qc' + fresh() + '" data-sq-act>' + qcard(k) + '</div>'; }

  /* K and L: the current card, answered ones above as quiet text */
  function rK() { return flow(cardOf, false, function (k) { return qa(k); }); }

  /* M: answered cards stack above, as on the quiz; at the end both cards stay. "Add another sleep" (right, under them)
     adds a pair below a divider: When did you sleep again? then When did you wake up again?, each a card with the wheel
     and Save that folds into an answered card. "You slept for 7h 30m." sits centred over Save (Shaheer, 20 Nov 2026) */
  function xq(i, f) { return f === "bed" ? "When did you sleep again?" : "When did you wake up again?"; }
  function xCard(i, f) {
    var k = "x" + i + (f === "bed" ? "b" : "w"), o = s.x[i], er = o.st === 2 || f === "wake" ? xErr(o) : "";
    return '<div class="sq-qc' + fresh() + '" data-sq-act><div class="sq-qh">' + tile(f) + '<h3 class="sq-qq" id="sqq-' + k + '">' + xq(i, f) + '</h3></div>' + wheel(k) +
      (er && f === "wake" ? '<div class="sq-msg err">' + c.I.warn + '<span>' + er + '</span></div>' : "") +
      '<div class="sq-xb"><button class="sq-sec" data-sq="xrm" data-k="' + k + '">Remove</button><button class="sq-pri" data-sq="xok" data-k="' + k + '"' + (er && f === "wake" ? " disabled" : "") + '>Save</button></div></div>';   /* Remove takes the whole added sleep away (20 Nov 2026) */
  }
  function xDone(i, f) {
    var k = "x" + i + (f === "bed" ? "b" : "w"), o = s.x[i];
    return '<div class="sq-qa sq-qc sm"><p>' + xq(i, f) + '</p><div class="sq-qaa"><b>' + T(o[f]) + '</b><button class="sq-ed" data-sq="xchg" data-k="' + k + '" aria-label="Edit, ' + xq(i, f) + ' ' + T(o[f]) + '">Edit' + EDI + '</button></div></div>';
  }
  function xGroup(i) {
    var o = s.x[i], h = '<hr class="sq-dv">';
    h += o.st === 0 || o.ed === "bed" ? xCard(i, "bed") : xDone(i, "bed");
    if (o.st >= 1 && o.ed !== "bed") h += o.st === 1 || o.ed === "wake" ? xCard(i, "wake") : xDone(i, "wake");
    return h;
  }
  /* "Add another sleep" is hidden: too much for people to understand (Shaheer, 20 Nov 2026). ?sxadd=1 brings it back */
  function rM() {
    if (cur()) return flow(cardOf, false, function (k) { return qa(k, true); });
    var open = s.x.some(function (o) { return o.st < 2 || o.ed; });
    return '<div class="sq-flow">' + keys().map(function (k) { return qa(k, true); }).join("") + s.x.map(function (o, i) { return xGroup(i); }).join("") +
      (open || s.x.length >= 2 || XA !== "1" ? "" : '<button class="sq-add" data-sq="xadd">' + c.PLUSQ + 'Add another sleep</button>') +
      (open ? "" : '<div class="sq-mt' + fresh() + '" data-sq-act><div data-sq-sum aria-live="polite">' + sumInner() + '</div>' + (XA === "b" && s.x.length < 2 ? '<button class="sq-qx c" data-sq="xadd">Slept more than once? Add it</button>' : "") + '</div>') + '</div>' + saveBtn();
  }

  /* N: one card holds the whole night; each answer folds inside it and the next question follows */
  function rN() {
    var cu = cur(), h = "";
    keys().forEach(function (k) { if (k === cu) h += '<div class="sq-nq' + fresh() + '" data-sq-act>' + qcard(k) + '</div>'; else if (done(k)) h += qa(k); });
    if (!cu) h += '<div class="sq-qs' + fresh() + '" data-sq-act><div data-sq-sum aria-live="polite">' + sumInner() + '</div></div>';
    return '<div class="sq-flow"><div class="sq-qc sq-qn">' + h + '</div>' + (cu ? "" : wakeX()) + '</div>' + (cu ? "" : saveBtn());
  }

  var BACK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>';
  var MINUS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 12h12"/></svg>';
  var PLUS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M12 6v12M6 12h12"/></svg>';
  var R = { a: rA, b: rB, c: rC, d: rD, e: rE, f: rF, g: rG, h: rH, i: rI, j: rJ, k: rK, l: rK, m: rM, n: rN };

  /* ---------- drawing ---------- */
  function render() {
    var cu = cur();
    if (s.np && cu && cu !== "aw" && !s.a[cu] && V !== "c" && V !== "d") { s.a[cu] = "n"; s.open = cu; s.pk = cu === "all" ? "bed" : cu; }   /* no plan: no time to suggest, so the picker is the question */
    var foc = s.fresh, sb = box.closest(".sbody");
    box.innerHTML = R[V]();
    bindWheels();
    var tf = box.querySelector(".sq-trk .f");   /* the strip fills from where it was */
    if (tf) { tf.getBoundingClientRect(); tf.style.clipPath = "inset(0 " + tf.dataset.to + "% 0 0)"; s.fill = +tf.dataset.to; }
    s.fresh = false;
    var wx = s.open === "aw" && W !== "a" && box.querySelector(".sq-wx,.sq-sw.on");   /* the night's waking opened on the summary: bring it up */
    if (wx && sb) return setTimeout(function () { var b = wx.getBoundingClientRect(), r = sb.getBoundingClientRect(), d = b.bottom - r.bottom + 88; if (d > 0) sb.scrollTo({ top: sb.scrollTop + d, behavior: c.RD || !foc ? "auto" : "smooth" }); }, 30);
    if (!foc) return;
    var act = box.querySelector("[data-sq-act] [data-sq-af]") || box.querySelector("[data-sq-af]") || box.querySelector(".sq-save:not([disabled])");
    if (act) act.focus({ preventScroll: true });
    var blk = box.querySelector("[data-sq-act]") || act;
    if (sb && blk) {   /* the next question glides into view */
      var b = blk.getBoundingClientRect(), r = sb.getBoundingClientRect(), d = b.bottom - r.bottom + 96;
      if (V === "b" || V === "d" || V === "e") sb.scrollTo({ top: 0, behavior: c.RD ? "auto" : "smooth" });
      else if (d > 0) sb.scrollTo({ top: sb.scrollTop + d, behavior: c.RD ? "auto" : "smooth" });
    }
  }
  function upd() {
    box.querySelectorAll("[data-sq-v]").forEach(function (n) { var k = n.dataset.sqV; if (k) n.textContent = T(val(k)); });
    box.querySelectorAll("[data-sq-d]").forEach(function (n) { n.textContent = c.dayOf(s[n.dataset.sqD], n.dataset.sqD); });
    box.querySelectorAll("[data-sq-note]").forEach(function (n) { var k = n.dataset.sqNote; n.textContent = noteD(k); n.classList.toggle("mv", s[k] !== s.sug[k]); });
    var sm = box.querySelector("[data-sq-sum]"); if (sm && !cur()) sm.innerHTML = sumInner();
    var br = box.querySelector("[data-sq-bar]"); if (br) br.innerHTML = c.bar(check().err ? null : night(), { inSheet: true });
    var sv = box.querySelector(".sq-save"), ck = check(); if (sv) sv.disabled = !!cur() || !!ck.err || !!ck.hold;
    var xb = box.querySelector('[data-sq="xok"][data-k$="w"]'); if (xb) { var xo1 = xo(xb.dataset.k), xe = xErr(xo1.o), rw = xb.parentNode, xm = rw.previousElementSibling && rw.previousElementSibling.classList.contains("sq-msg") ? rw.previousElementSibling : null; xb.disabled = !!xe; if (xe && !xm) rw.insertAdjacentHTML("beforebegin", '<div class="sq-msg err">' + c.I.warn + '<span>' + xe + '</span></div>'); else if (xm) { if (xe) xm.querySelector("span").textContent = xe; else xm.remove(); } }
  }

  /* ---------- answers ---------- */
  function answer(k, v) {
    if (V === "c" && s.open !== k) s.open = null;
    s.a[k] = v; s.last = k; if (s.re === k) s.re = null;
    if (k === "aw") { s.aw.on = v === "y"; if (s.aw.on) { s.open = "aw"; s.pk = "from"; } else s.open = null; }
    else if (k === "all") { if (v === "y") { s.bed = s.sug.bed; s.wake = s.sug.wake; s.open = null; } else { s.open = "all"; s.pk = "bed"; } }
    else if (V === "d") { s.open = null; s.tc = null; }   /* D: That's Right keeps the time on the card */
    else if (v === "y") { s[k] = s.sug[k]; if (s.open === k) s.open = null; }
    else { s.open = k; s.pk = k; }
    s.fresh = true; render();
  }
  function act(t) {
    var a = t.dataset.sq, k = t.dataset.k; booted = true;   /* doc states hold until the first tap */
    if (a === "ans") return answer(k, t.dataset.v);
    if (a === "chg") { s.re = k; s.open = null; s.tc = null; if (s.np && k !== "aw") { s.open = k; s.pk = k === "all" ? "bed" : k; } s.fresh = true; return render(); }
    if (a === "back") { var ks = keys(), cu = cur(), i = cu ? ks.indexOf(cu) : ks.length; if (cu) { if (s.open === cu && !s.np) s.a[cu] = 0; s.re = null; s.open = null; } return act({ dataset: { sq: "chg", k: ks[i - 1] } }); }
    if (a === "done") { s.open = null; s.last = k; if (s.re === k) s.re = null; if (!s.a[k]) s.a[k] = k === "aw" ? "y" : "n"; s.fresh = true; return render(); }
    if (a === "fld") { s.pk = k; s.open = k === "from" || k === "to" ? "aw" : s.open; return render(); }
    if (a === "tap") { if (V === "d") s.tc = s.tc === k ? null : k; else s.open = s.open === k ? null : k; s.fresh = true; return render(); }
    if (a === "nud") { s[k] = Math.max(1080, Math.min(c.NOWM, s[k] + +t.dataset.n)); s.mv[k] = true; upd(); var ws = box.querySelector(".sq-whs"); if (ws) { render(); } return; }
    if (a === "awon") { s.aw.on = true; s.a.aw = "y"; gapDef(); s.open = "aw"; s.pk = "from"; s.fresh = true; return render(); }
    if (a === "awoff") { s.aw.on = false; s.a.aw = "n"; if (s.open === "aw") s.open = null; s.fresh = true; render(); var l = box.querySelector('[data-sq="awon"]'); if (l) l.focus(); return; }
    if (a === "xadd") { var pv = s.x.length ? s.x[s.x.length - 1].wake : s.wake, b0 = Math.min(pv + 60, c.NOWM - 60); b0 -= b0 % 5; s.x.push({ bed: b0, wake: Math.min(b0 + 30, c.NOWM - c.NOWM % 5), st: 0 }); s.fresh = true; return render(); }
    if (a === "xafter") { act({ dataset: { sq: "done", k: "wake" } }); return act({ dataset: { sq: "xadd" } }); }   /* keep the wake-up time, then ask about the next sleep */
    if (a === "xrm") { s.x.splice(+XK.exec(k)[1], 1); s.fresh = true; render(); var ad = box.querySelector('[data-sq="xadd"]'); if (ad) ad.focus(); return; }
    if (a === "xok") { var x = xo(k), o = x.o; if (x.f === "bed") { if (o.wake <= o.bed) o.wake = Math.min(o.bed + 30, c.NOWM - c.NOWM % 5); if (o.ed === "bed") o.ed = null; else o.st = 1; }   /* wake-up follows the new bedtime */ else { if (xErr(o)) return; o.st = 2; o.ed = null; } s.fresh = true; return render(); }
    if (a === "xchg") { var y = xo(k); y.o.ed = y.f; s.fresh = true; return render(); }
    if (a === "save") { if (cur() || check().err || check().hold) return; c.save(night()); }
  }
  function gapDef() { if (s.aw.set) return; var mid = Math.round((s.bed + s.wake) / 60) * 30; s.aw.from = mid; s.aw.to = mid + 30; s.aw.set = true; }

  document.addEventListener("click", function (e) {
    var t = e.target.closest && e.target.closest("#svAsk [data-sq]"); if (!t || t.disabled || !s) return;
    if (QC && t.dataset.sq === "ans" && !picks(t.dataset.k, t.dataset.v) && !c.RD) {   /* the pick goes green, then the card folds */
      [].forEach.call(t.parentNode.children, function (b) { b.classList.toggle("on", b === t); b.setAttribute("aria-checked", b === t); });
      if (!s.wait) s.wait = setTimeout(function () { s.wait = null; act(t); }, 250);
      return;
    }
    act(t);
  });
  document.addEventListener("keydown", function (e) {   /* arrows walk a Yes / No group, Enter or Space answers */
    var r = e.target.closest && e.target.closest('#svAsk [role="radio"]'); if (!r) return;
    var d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]; if (!d) return;
    e.preventDefault(); var g = [].slice.call(r.parentNode.children), n = g[(g.indexOf(r) + d + g.length) % g.length]; n.focus();
  });

  /* ---------- the hook ---------- */
  SVX.ask = function (ctx) {
    c = ctx; css();
    var n = c.ST.night, np = !n && (c.noplan || Q.get("sqnp") === "1"), P = c.PLAN || { bed: 1350, wake: 1800 };
    var f = n && n.segs ? n.segs : null;
    s = { edit: !!n, np: np, sug: n ? { bed: n.bed, wake: n.wake } : { bed: P.bed, wake: P.wake }, a: {}, open: null, re: null, pk: "bed", tc: null, mv: {}, fresh: false,
      aw: f ? { on: true, set: true, from: f[0].wake, to: f[f.length - 1].bed } : { on: false }, x: [] };
    s.bed = s.sug.bed; s.wake = s.sug.wake; if (!s.aw.set) { gapDef(); s.aw.set = false; }
    if (f) s.a.aw = "y";
    if (np && V === "c") { s.a.bed = s.a.wake = "n"; s.open = "bed"; }
    if (np && V === "e") { s.a.all = "n"; s.open = "all"; s.pk = "bed"; }
    /* doc states */
    if (!booted) {
      var st = +Q.get("sqstep") || (Q.get("sqaw") === "1" ? 9 : 1), ks = keys();
      ks.slice(0, st - 1).forEach(function (k) { if (!s.a[k]) s.a[k] = k === "aw" ? "n" : "y"; if (s.open === k) s.open = null; });
      if (Q.get("sqaw") === "1") { s.aw.on = true; s.a.aw = "y"; gapDef(); s.open = "aw"; s.pk = "from"; }
      if (Q.get("sqno") === "1") { var cu = cur() || ks[0]; if (V === "d" && cu !== "aw") s.tc = cu; else s.a[cu] = cu === "aw" ? "y" : "n"; if (V !== "d" || cu === "aw") { s.open = cu; s.pk = cu === "all" ? "bed" : cu === "aw" ? "from" : cu; } if (cu === "aw") s.aw.on = true; }
    }
    var sh = c.open("svAsk", n ? "Edit last night’s sleep" : "Log last night’s sleep", '<div class="sq ' + (NEW ? "sqv-" : "sq-") + V + ' sqw-' + W + '"></div>');
    box = sh.querySelector(".sq");
    if (SVX.addMore && V === "m") { SVX.addMore = false; s.a.bed = s.a.wake = "y"; s.open = null; act({ dataset: { sq: "xadd" } }); return sh; }
    render();
    return sh;
  };

  /* ---------- styles ---------- */
  function css() {
    if (document.getElementById("svAskCss")) return;
    var E = "cubic-bezier(.2,0,0,1)", st = document.createElement("style"); st.id = "svAskCss";
    st.textContent = [
      ".sq{display:flex;flex-direction:column;gap:16px;padding-top:4px;font-family:Roboto,sans-serif;color:var(--g-900)}",
      ".sq button{font-family:inherit;-webkit-tap-highlight-color:transparent}",
      ".sq-in{animation:sqIn .32s " + E + " both}@keyframes sqIn{from{opacity:0;transform:translateY(12px)}}",
      ".sq-b .sq-step.sq-in,.sq-d .sq-step.sq-in,.sq-e .sq-step.sq-in{animation-name:sqGl}@keyframes sqGl{from{opacity:0;transform:translateX(24px)}}",
      ".sq-i{display:inline-grid;place-items:center;width:18px;height:18px;flex:none}.sq-i svg{width:16px;height:16px}.sq-i.mo{color:var(--in-600)}.sq-i.su{color:var(--gold-700)}.sq-i.mo svg{width:14px;height:14px}",
      ".sq-tag{display:inline-flex;align-self:flex-start;align-items:center;gap:6px;min-height:28px;padding:4px 10px;border-radius:9999px;background:var(--in-50);color:var(--in-700);font:500 13px/18px Roboto,sans-serif}.sq-tag svg{width:14px;height:14px}",
      ".sq-sub{margin:-4px 0 8px;font:400 14px/20px Roboto,sans-serif;color:var(--g-600)}.sq-q{margin:0;font:600 20px/28px Roboto,sans-serif;color:var(--g-900);letter-spacing:-.1px}",
      ".sq-step,.sq-end{display:flex;flex-direction:column;gap:12px}.sq-step .sq-tag{margin-bottom:8px}",
      /* the summary line and its messages */
      ".sq-sum{min-height:22px}.sq-sl{margin:0;font:400 15px/22px Roboto,sans-serif;color:var(--g-600);font-variant-numeric:tabular-nums}.sq-sl b{font-weight:700;color:var(--g-900)}.sq-sl .nw{white-space:nowrap}.sq-sl.q{color:var(--g-500)}",
      ".sq-msg{display:flex;gap:6px;align-items:flex-start;font:400 14px/20px Roboto,sans-serif}.sq-msg svg{width:16px;height:16px;flex:none;margin-top:2px}.sq-msg.err{color:#D92D20}.sq-msg.wrn{color:#B54708;margin-top:6px}",
      /* buttons */
      "#svAsk .sq-save{position:sticky;bottom:7px;z-index:3;height:52px;margin:8px 0 7px;border-radius:12px;font:700 15px/1 Roboto,sans-serif;letter-spacing:.25px;box-shadow:0 7px 0 var(--brand-700),0 0 0 16px #fff;transition:transform .2s ease-out,box-shadow .2s ease-out,background .2s ease-out}",
      "#svAsk .sq-save::after{content:'';position:absolute;left:-16px;right:-16px;top:calc(100% + 7px);height:32px;background:#fff;pointer-events:none}",
      "#svAsk .sq-save:active{transform:translateY(5px);box-shadow:0 2px 0 var(--brand-700),0 0 0 16px #fff}",
      "#svAsk .sq-save[disabled]{background:var(--g-200);color:var(--g-500);box-shadow:0 7px 0 var(--g-300),0 0 0 16px #fff;cursor:default}",
      ".sq-sec{height:48px;width:100%;margin-bottom:4px;border:1px solid var(--brand-600);border-radius:12px;background:#fff;color:var(--brand-700);font:700 15px/1 Roboto,sans-serif;letter-spacing:.25px;cursor:pointer;box-shadow:0 4px 0 var(--brand-200);transition:transform .2s ease-out,box-shadow .2s ease-out}.sq-sec:active{transform:translateY(4px);box-shadow:none}",
      ".sq-lk{position:relative;align-self:flex-start;display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:0;border:0;background:none;color:var(--brand-600);font:600 15px/20px Roboto,sans-serif;cursor:pointer}.sq-lk svg{width:20px;height:20px}",
      ".sq-chg{min-height:44px;margin:-10px -4px -10px auto;padding:0 4px;border:0;background:none;color:var(--brand-600);font:600 14px Roboto,sans-serif;cursor:pointer}",
      "#svAsk button:focus-visible{outline:2px solid var(--in-400);outline-offset:2px}",
      /* the wheel */
      ".sq-whs{position:relative;display:flex;gap:4px;height:200px;border-radius:16px;background:var(--g-50);padding:0 8px}",
      ".sq-whs::before{content:'';position:absolute;left:8px;right:8px;top:80px;height:40px;border-radius:10px;background:#fff;box-shadow:0 1px 2px rgba(16,24,40,.08);pointer-events:none}",
      ".sq-whs::after{content:'';position:absolute;inset:0;border-radius:16px;pointer-events:none;background:linear-gradient(180deg,var(--g-50),rgba(249,250,251,0) 35%,rgba(249,250,251,0) 65%,var(--g-50))}",
      ".sq-wh{position:relative;flex:1;overflow-y:scroll;scroll-snap-type:y mandatory;scrollbar-width:none;padding:80px 0;outline:none;border-radius:10px}.sq-wh::-webkit-scrollbar{display:none}.sq-wh:focus-visible{box-shadow:inset 0 0 0 2px var(--in-300)}",
      ".sq-wh button{display:block;width:100%;height:40px;border:0;background:none;scroll-snap-align:center;font:500 20px/40px Roboto,sans-serif;color:var(--g-400);cursor:pointer;font-variant-numeric:tabular-nums;transition:color .2s ease-out}.sq-wh button[aria-selected=true]{color:var(--g-900);font-weight:600}",
      /* two time fields over one wheel */
      ".sq-flds{display:grid;grid-template-columns:1fr 1fr;gap:8px}",
      ".sq-fld{display:flex;flex-direction:column;gap:4px;padding:12px;border:1px solid var(--g-200);border-radius:12px;background:#fff;text-align:left;cursor:pointer;transition:border-color .2s ease-out,box-shadow .2s ease-out}",
      ".sq-fld .fl{display:flex;align-items:center;gap:6px;font:500 13px/18px Roboto,sans-serif;color:var(--g-600)}.sq-fld .fv{font:700 20px/26px Roboto,sans-serif;color:var(--g-900);font-variant-numeric:tabular-nums}",
      ".sq-fld[aria-pressed=true]{border-color:var(--brand-600);box-shadow:0 0 0 1px var(--brand-600)}",
      ".sq-pk{display:flex;flex-direction:column;gap:12px;margin-bottom:4px}.sq-flds+.sq-whs{margin-top:12px}",
      /* folded answers */
      ".sq-rows{display:flex;flex-direction:column;border:1px solid var(--g-200);border-radius:16px;padding:4px 16px}",
      ".sq-done{display:flex;align-items:center;gap:10px;min-height:52px;font:400 14px/20px Roboto,sans-serif;color:var(--g-600)}.sq-done+.sq-done{border-top:1px solid var(--g-100)}",
      ".sq-done b{font:600 15px/20px Roboto,sans-serif;color:var(--g-900);font-variant-numeric:tabular-nums;margin-left:auto;text-align:right}.sq-done .sq-chg{margin-left:4px}",

      /* A: chat */
      ".sq-a{gap:12px}.sq-grp{display:flex;flex-direction:column;gap:12px}",
      ".sq-bot{display:flex;align-items:flex-end;gap:8px;max-width:90%}",
      ".sq-av,.sq-av0{width:32px;height:32px;flex:none}.sq-av{display:grid;place-items:center;border-radius:50%;background:var(--in-50);color:var(--in-600)}.sq-av svg{width:15px;height:15px}",
      ".sq-av.su{background:var(--gold-100);color:var(--gold-700)}.sq-av.su svg{width:17px;height:17px}.sq-av.dn{background:var(--brand-50);color:var(--brand-600)}",
      ".sq-bb{padding:10px 14px;border-radius:18px 18px 18px 6px;background:var(--g-100);font:400 15px/22px Roboto,sans-serif;color:var(--g-900)}.sq-bb .sq-sl{color:var(--g-700)}",
      ".sq-me{align-self:flex-end;display:inline-flex;align-items:center;gap:8px;min-height:44px;max-width:80%;padding:10px 14px;border:1px solid var(--in-100);border-radius:18px 18px 6px 18px;background:var(--in-50);color:var(--in-900);font:500 15px/20px Roboto,sans-serif;font-variant-numeric:tabular-nums;cursor:pointer}",
      ".sq-me svg{width:14px;height:14px;color:var(--in-600);flex:none}.sq-me.static{cursor:default}",
      ".sq-chips{display:flex;flex-direction:column;align-items:flex-end;gap:8px}",
      ".sq-chips button{display:inline-flex;align-items:center;min-height:48px;padding:0 20px;border:1px solid var(--g-200);border-radius:9999px;background:#fff;color:var(--g-800);font:600 15px/20px Roboto,sans-serif;cursor:pointer;box-shadow:var(--shadow-tap);transition:transform .15s ease-out,box-shadow .15s ease-out,border-color .2s ease-out}",
      ".sq-chips button:active{transform:translate(2px,3px);box-shadow:none}.sq-chips button.on{border-color:var(--brand-600);box-shadow:0 0 0 1px var(--brand-600);color:var(--brand-700)}",
      ".sq-pc{display:flex;flex-direction:column;gap:12px;padding:12px;border:1px solid var(--g-200);border-radius:20px}.sq-pc .sq-whs{background:var(--g-50)}",
      ".sq-a .sq-wl,.sq-a .sq-sw,.sq-a .sq-wx{margin-left:40px}.sq-a .sq-sw,.sq-a .sq-wx{width:calc(100% - 40px)}",

      /* B, D, E: steps */
      ".sq-prog{display:flex;align-items:center;gap:8px;min-height:32px;font:500 13px/18px Roboto,sans-serif;color:var(--g-500)}.sq-prog .n{flex:none}",
      ".sq-back{width:44px;height:44px;margin:-6px -4px -6px -12px;border:0;background:none;color:var(--g-700);display:grid;place-items:center;cursor:pointer;border-radius:50%}.sq-back svg{width:22px;height:22px}",
      ".sq-prog .bars{flex:1;display:flex;gap:4px;margin-left:8px}.sq-prog i{flex:1;height:4px;border-radius:2px;background:var(--g-200);transition:background .3s " + E + "}.sq-prog i.on{background:var(--in-600)}.sq-prog i.now{background:var(--in-200)}",
      ".sq-cards{display:flex;flex-direction:column;gap:12px}",
      ".sq-cards button{display:flex;align-items:center;gap:14px;min-height:76px;padding:12px 16px;border:1px solid var(--g-200);border-radius:16px;background:#fff;text-align:left;cursor:pointer;box-shadow:var(--shadow-tap);transition:transform .15s ease-out,box-shadow .15s ease-out,border-color .2s ease-out}",
      ".sq-cards button:active{transform:translate(2px,3px);box-shadow:none}",
      ".sq-cards .ic{width:44px;height:44px;flex:none;display:grid;place-items:center;border-radius:12px;background:var(--in-50);color:var(--in-600)}.sq-cards .ic svg{width:20px;height:20px}.sq-cards .ic.mo svg{width:18px;height:18px}",
      ".sq-cards .ic.su{background:var(--gold-100);color:var(--gold-700)}.sq-cards .ic.no{background:var(--g-100);color:var(--g-600)}",
      ".sq-cards .tx{flex:1;display:flex;flex-direction:column;gap:2px}.sq-cards .tx b{font:600 17px/22px Roboto,sans-serif;color:var(--g-900)}.sq-cards .tx span{font:400 14px/20px Roboto,sans-serif;color:var(--g-600);font-variant-numeric:tabular-nums}",
      ".sq-cards .rd{width:22px;height:22px;flex:none;border-radius:50%;border:1.5px solid var(--g-300);transition:border .2s ease-out}",
      ".sq-cards button.on{border-color:var(--brand-600);box-shadow:0 0 0 1px var(--brand-600)}.sq-cards button.on .rd{border:7px solid var(--brand-600)}",
      ".sq-end .sq-sum{padding:4px 0}.sq-b .sq-end .sq-sl b,.sq-d .sq-end .sq-sl b,.sq-e .sq-end .sq-sl b{display:block;font:700 36px/44px Roboto,sans-serif;letter-spacing:-.5px}",

      /* C: rows */
      ".sq-c{gap:12px}.sq-plan:empty{display:none}",
      ".sq-row{display:flex;flex-direction:column;gap:12px;padding:16px;border:1px solid var(--g-200);border-radius:16px;transition:opacity .3s " + E + "}.sq-row.off{opacity:.4;pointer-events:none}",
      ".sq-row h3{display:flex;align-items:flex-start;gap:8px;margin:0;font:600 16px/22px Roboto,sans-serif}.sq-row h3 .sq-i{margin-top:2px}",
      ".sq-seg{display:grid;grid-template-columns:1fr 1fr;gap:8px}",
      ".sq-seg button{display:inline-flex;align-items:center;justify-content:center;gap:6px;height:52px;border:1px solid var(--g-200);border-radius:12px;background:#fff;color:var(--g-700);font:600 15px Roboto,sans-serif;cursor:pointer;transition:border-color .2s ease-out,background .2s ease-out,color .2s ease-out}",
      ".sq-seg svg{width:0;height:14px;opacity:0;transition:opacity .2s ease-out}.sq-seg button.on{border-color:var(--brand-600);background:var(--brand-25);color:var(--brand-700);box-shadow:inset 0 0 0 1px var(--brand-600)}.sq-seg button.on svg{width:14px;opacity:1}",
      ".sq-tf{display:flex;align-items:baseline;gap:8px;width:100%;min-height:52px;padding:0 14px;border:1px solid var(--g-200);border-radius:12px;background:#fff;cursor:pointer;text-align:left}.sq-tf .l{font:400 14px Roboto,sans-serif;color:var(--g-600);align-self:center}",
      ".sq-tf b{align-self:center;font:700 17px Roboto,sans-serif;font-variant-numeric:tabular-nums;color:var(--g-900)}.sq-tf .d{align-self:center;font:400 13px Roboto,sans-serif;color:var(--g-500)}",
      ".sq-tf .cv{align-self:center;margin-left:auto;width:10px;height:10px;border-right:2px solid var(--g-400);border-bottom:2px solid var(--g-400);transform:translateY(-3px) rotate(45deg);transition:transform .25s " + E + "}.sq-tf.on{border-color:var(--brand-600)}.sq-tf.on .cv{transform:translateY(2px) rotate(225deg)}",

      /* D: the time card */
      ".sq-tc{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:20px 12px;border:1px solid var(--g-200);border-radius:20px;background:#fff}",
      ".sq-nb{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;width:64px;height:64px;border:1px solid var(--g-200);border-radius:16px;background:#fff;color:var(--g-700);font:500 12px/16px Roboto,sans-serif;cursor:pointer;box-shadow:var(--shadow-tap);transition:transform .15s ease-out,box-shadow .15s ease-out}.sq-nb:active{transform:translate(2px,3px);box-shadow:none}.sq-nb svg{width:20px;height:20px}",
      ".sq-tv{flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;min-height:64px;border:0;background:none;cursor:pointer;border-radius:12px}.sq-tv .sq-i{width:24px;height:24px}.sq-tv .sq-i svg{width:20px;height:20px}",
      ".sq-tv b{font:700 30px/36px Roboto,sans-serif;color:var(--g-900);font-variant-numeric:tabular-nums;letter-spacing:-.3px;border-bottom:1.5px dashed var(--g-300)}.sq-tv>span{font:400 13px/18px Roboto,sans-serif;color:var(--g-500)}",
      ".sq-note{margin:0;min-height:20px;text-align:center;font:400 14px/20px Roboto,sans-serif;color:var(--g-500)}.sq-note.mv{color:var(--olive-700);font-weight:500}",

      /* E: the planned night as the bar */
      ".sq-night{padding:4px 0 8px}",

      /* the night's waking */
      ".sq-wl svg{color:var(--brand-600)}",
      ".sq-wx,.sq-awc,.sq-awb{display:flex;flex-direction:column;gap:12px}.sq-wx{padding:16px;border:1px solid var(--g-200);border-radius:16px}.sq-wxh{display:flex;align-items:center;gap:8px;font:600 15px/20px Roboto,sans-serif}",
      ".sq-sent{margin:0;font:400 16px/28px Roboto,sans-serif;color:var(--g-700)}",
      ".sq-tok{position:relative;display:inline-flex;align-items:center;height:32px;padding:0 10px;margin:0 2px;border:1px solid var(--in-100);border-radius:8px;background:var(--in-50);color:var(--in-700);font:600 15px Roboto,sans-serif;font-variant-numeric:tabular-nums;cursor:pointer}.sq-tok::after{content:'';position:absolute;left:0;right:0;top:50%;height:44px;transform:translateY(-50%)}.sq-tok.on{border-color:var(--in-600);box-shadow:0 0 0 1px var(--in-600)}",
      ".sq-awb .sq-lk{margin-top:-8px;color:var(--g-600);font-size:14px}",
      ".sq-sw{display:flex;flex-direction:column;gap:12px;border:1px solid var(--g-200);border-radius:16px;padding:4px 16px}.sq-sw.on{padding-bottom:16px}",
      ".sq-swb{display:flex;align-items:center;gap:12px;min-height:64px;border:0;background:none;padding:0;text-align:left;cursor:pointer}.sq-swb .t{flex:1;display:flex;flex-direction:column;gap:2px}.sq-swb b{font:600 15px/20px Roboto,sans-serif;color:var(--g-900)}.sq-swb .t span{font:400 13px/18px Roboto,sans-serif;color:var(--g-500)}",
      ".sq-tg{position:relative;width:44px;height:26px;flex:none;border-radius:13px;background:var(--g-200);transition:background .25s " + E + "}.sq-tg::after{content:'';position:absolute;top:3px;left:3px;width:20px;height:20px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(16,24,40,.2);transition:transform .25s " + E + "}",
      ".sq-swb[aria-checked=true] .sq-tg{background:var(--in-600)}.sq-swb[aria-checked=true] .sq-tg::after{transform:translateX(18px)}",
      /* ===== round two ===== */
      ".sq-flow{display:flex;flex-direction:column;gap:24px}",
      ".sq-lines{display:flex;flex-direction:column}",
      ".sq-said{display:flex;align-items:center;gap:10px;min-height:44px;padding:0;border:0;background:none;text-align:left;font:400 16px/22px Roboto,sans-serif;color:var(--g-600);cursor:pointer}",
      ".sq-said b{font-weight:600;color:var(--g-900);font-variant-numeric:tabular-nums}.sq-said>svg{width:16px;height:16px;color:var(--g-400)}",
      ".sq-fold{animation:sqFold .3s " + E + " both}@keyframes sqFold{from{opacity:0;transform:translateY(20px)}}",
      ".sq-hero{display:flex;flex-direction:column;align-items:flex-start;gap:20px}",
      ".sq-pic{display:grid;place-items:center;width:56px;height:56px;border-radius:50%;background:var(--in-50);color:var(--in-600)}.sq-pic svg{width:24px;height:24px}.sq-pic.su{background:var(--gold-100);color:var(--gold-700)}.sq-pic.su svg{width:30px;height:30px}",
      ".sq-hq{margin:-4px 0 0;font:500 24px/32px Roboto,sans-serif;color:var(--g-800);letter-spacing:-.2px}.sq-hq b{font-weight:700;color:var(--g-900);white-space:nowrap;font-variant-numeric:tabular-nums}",
      /* Yes and No: the secondary button, large. Picked means pressed in. */
      ".sq-yn{display:grid;grid-template-columns:1fr 1fr;gap:12px;width:100%;padding-bottom:4px}",
      ".sq-yn button{display:flex;align-items:center;justify-content:center;gap:8px;height:72px;border:1px solid var(--brand-600);border-radius:20px;background:#fff;color:var(--brand-700);font:700 18px/1 Roboto,sans-serif;cursor:pointer;box-shadow:0 4px 0 var(--brand-200);}",
      ".sq-yn svg{width:22px;height:22px;flex:none}.sq-yn button:active,.sq-yn button.on{transform:translateY(4px);box-shadow:0 0 0 var(--brand-200)}.sq-yn button.on{background:var(--brand-50)}",
      ".sq-yn.sm button{height:52px;border-radius:14px;font-size:16px}.sq-yn.sm svg{width:18px;height:18px}",
      ".sq-op{display:flex;flex-direction:column;gap:12px;width:100%}",
      ".sq-whs.sm{height:120px}.sq-whs.sm::before{top:40px}.sq-whs.sm .sq-wh{padding:40px 0}",
      ".sq-fin{display:flex;flex-direction:column;gap:8px}",
      ".sq-tot{margin:0;font:400 18px/28px Roboto,sans-serif;color:var(--g-600);font-variant-numeric:tabular-nums}.sq-tot b{font:700 32px/40px Roboto,sans-serif;letter-spacing:-.4px;color:var(--g-900)}",
      /* I: Yes first */
      ".sq-ia{display:flex;flex-direction:column;align-items:center;gap:8px;width:100%}.sq-ia .sq-lk{align-self:center}",
      ".sq-yes{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;height:60px;margin-bottom:7px;border:0;border-radius:16px;background:var(--brand-600);color:#fff;font:700 18px/1 Roboto,sans-serif;font-variant-numeric:tabular-nums;cursor:pointer;box-shadow:0 7px 0 var(--brand-700);transition:transform .15s ease-out,box-shadow .15s ease-out}.sq-yes svg{width:22px;height:22px}.sq-yes:active{transform:translateY(5px);box-shadow:0 2px 0 var(--brand-700)}",
      /* J: the card stack */
      ".sq-card{position:relative;padding:20px;border-radius:24px;background:var(--in-25)}.sq-card.su{background:var(--gold-50)}.sq-card .sq-pic{background:#fff}",
      ".sq-card.more::after{content:'';position:absolute;z-index:-1;left:16px;right:16px;bottom:-10px;height:24px;border-radius:0 0 20px 20px;background:var(--in-50)}.sq-card.mo.more::after{background:var(--gold-100)}.sq-card{isolation:auto}.sqv-j .sq-flow{isolation:isolate}",
      ".sqv-j .sq-card.sq-in{animation:sqCard .35s " + E + " both}@keyframes sqCard{from{opacity:0;transform:translateY(24px) scale(.96)}}",
      /* H: the night strip */
      ".sq-strip{display:flex;align-items:flex-start;gap:4px;padding:16px 8px 12px;border-radius:20px;background:linear-gradient(90deg,var(--in-25),var(--gold-50))}",
      ".sq-nd{display:flex;flex-direction:column;align-items:center;gap:2px;width:84px;flex:none;padding:0;border:0;background:none;cursor:pointer;color:var(--g-900)}.sq-nd[disabled]{cursor:default}",
      ".sq-nd .dot{display:grid;place-items:center;width:48px;height:48px;margin-bottom:6px;border-radius:50%;background:#fff;color:var(--g-300);box-shadow:inset 0 0 0 1.5px var(--g-200);transition:background .4s " + E + ",color .4s " + E + ",box-shadow .4s " + E + "}.sq-nd .dot svg{width:20px;height:20px}.sq-nd.su .dot svg{width:24px;height:24px}",
      ".sq-nd.now .dot{color:var(--in-400);box-shadow:inset 0 0 0 2px var(--in-300)}.sq-nd.su.now .dot{color:var(--gold-700);box-shadow:inset 0 0 0 2px var(--gold-600)}",
      ".sq-nd.mo.on .dot{background:var(--in-600);color:#fff;box-shadow:0 0 0 6px var(--in-100)}.sq-nd.su.on .dot{background:var(--gold-600);color:#fff;box-shadow:0 0 0 6px var(--gold-200)}",
      ".sq-nd.lit .dot{animation:sqLit .5s " + E + " both}@keyframes sqLit{from{background:#fff;box-shadow:0 0 0 0 transparent}}",
      ".sq-nd .tm{min-height:20px;font:600 15px/20px Roboto,sans-serif;font-variant-numeric:tabular-nums}.sq-nd:not(.on) .tm{color:var(--g-400);font-weight:500}.sq-nd .lb{font:400 12px/16px Roboto,sans-serif;color:var(--g-500)}",
      ".sq-trk{flex:1;position:relative;height:4px;margin-top:22px;border-radius:2px;background:var(--g-200)}.sq-trk .f{position:absolute;inset:0;border-radius:2px;background:linear-gradient(90deg,var(--in-600),var(--gold-600));transition:clip-path .6s " + E + "}",
      /* F: the sentence */
      "#svAsk .sq-sen{margin:0;font:500 24px/48px Roboto,sans-serif;color:var(--g-800);letter-spacing:-.2px}",
      ".sq-ch{display:inline-flex;align-items:center;gap:6px;height:40px;padding:0 12px;margin:0 2px;vertical-align:middle;border:1.5px dashed var(--g-300);border-radius:12px;background:#fff;color:var(--g-500);font:700 22px/1 Roboto,sans-serif;font-variant-numeric:tabular-nums;letter-spacing:-.2px;cursor:pointer;transition:background .3s " + E + ",border-color .3s " + E + ",color .3s " + E + "}.sq-ch[disabled]{cursor:default}",
      ".sq-ch .qm{margin-left:-6px}.sq-ch svg{width:18px;height:18px}.sq-ch.now{border-style:solid;border-color:var(--in-400);color:var(--g-900);background:var(--in-25)}.sq-ch.su.now{border-color:var(--gold-600);background:var(--gold-50)}",
      ".sq-ch.set{border:1.5px solid transparent;background:var(--in-50);color:var(--in-900)}.sq-ch.set svg{color:var(--in-600)}.sq-ch.su.set{background:var(--gold-100);color:var(--g-900)}.sq-ch.su.set svg{color:var(--gold-700)}",
      ".sq-fa{display:flex;flex-direction:column;gap:12px}",
      /* ===== round three: the quiz card ===== */
      ".sq-qc{position:relative;display:flex;flex-direction:column;gap:16px;padding:20px 16px;border-radius:24px;background:#fff;overflow:hidden;box-shadow:0 0 0 1px var(--in-50),0 3px 14px rgba(68,76,231,.09)}",
      ".sq-qc::after{content:'';position:absolute;right:-72px;bottom:-72px;width:150px;height:150px;background:url(" + LOTUS + ") center/contain no-repeat;pointer-events:none}.sq-qc.sm::after{display:none}",
      ".sq-qc>*{position:relative;z-index:1}.sq-qc.sq-in,.sq-nq.sq-in{animation:sqIn .3s " + E + " both}",
      ".sq-qh{display:flex;align-items:center;gap:12px}.sq-qq{margin:0;flex:1;font:700 20px/28px Roboto,sans-serif;color:var(--g-900);letter-spacing:-.1px}",
      ".sq-tile{display:grid;place-items:center;width:44px;height:44px;flex:none;border-radius:50%;background:var(--in-600);color:#fff}.sq-tile svg{width:20px;height:20px}.sq-tile.su{background:var(--gold-600)}.sq-tile.su svg{width:24px;height:24px}",
      ".sq-qi{display:flex;gap:8px;margin:-4px 0 0;font:400 15px/22px Roboto,sans-serif;color:var(--g-500)}.sq-qi svg{width:18px;height:18px;flex:none;margin-top:2px}",
      ".sq-qp{display:flex;flex-wrap:wrap;gap:12px}",
      ".sq-qp button{display:inline-flex;align-items:center;gap:10px;height:48px;padding:0 20px 0 14px;border:1.5px solid var(--g-300);border-radius:9999px;background:#fff;color:var(--g-600);font:500 17px/1 Roboto,sans-serif;font-variant-numeric:tabular-nums;cursor:pointer;transition:border-color .2s ease-out,color .2s ease-out,background .2s ease-out}",
      ".sq-qp .rd{width:22px;height:22px;flex:none;border-radius:50%;border:2px solid var(--g-500);transition:border-color .2s ease-out,box-shadow .2s ease-out,background .2s ease-out}",
      ".sq-qp button.on{border-color:var(--brand-600);color:var(--g-900);background:var(--brand-25)}.sq-qp button.on .rd{border-color:var(--brand-600);background:var(--brand-600);box-shadow:inset 0 0 0 4px #fff}",
      ".sq-qa{display:flex;flex-direction:column;gap:4px}.sq-qa p{margin:0;font:400 16px/24px Roboto,sans-serif;color:var(--g-800)}.sq-qa.sq-qc{gap:4px;padding:16px;border-radius:20px}",
      ".sq-qaa{display:flex;align-items:center;gap:16px}.sq-qaa b{font:700 18px/26px Roboto,sans-serif;color:var(--g-900);font-variant-numeric:tabular-nums}",
      ".sq-tl{margin:0;text-align:center;font:400 16px/24px Roboto,sans-serif;color:var(--g-700)}.sq-tl b{font-weight:700;color:var(--g-900)}.sqv-m .sq-mt{margin:8px 0 -8px}",
      ".sq-qx{align-self:center;min-height:44px;padding:0 8px;border:0;background:none;color:var(--g-500);font:400 14px/20px Roboto,sans-serif;text-decoration:underline;text-underline-offset:3px;cursor:pointer}.sq-op .sq-qx{display:block;margin:-4px auto 0}.sq-qx.c{display:block;margin:0 auto}",
      ".sq-add{align-self:flex-end;display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:0 4px;border:0;background:none;color:var(--brand-600);font:600 15px/20px Roboto,sans-serif;cursor:pointer}.sq-add svg{width:20px;height:20px}",
      ".sq-xb{display:flex;gap:12px}.sq-xb .sq-sec{flex:1;margin:0}",
      ".sq-pri{flex:1;height:48px;margin-bottom:4px;border:0;border-radius:12px;background:var(--brand-600);color:#fff;font:700 15px/1 Roboto,sans-serif;letter-spacing:.25px;cursor:pointer;box-shadow:0 4px 0 var(--brand-700);transition:transform .2s ease-out,box-shadow .2s ease-out}.sq-pri:active{transform:translateY(4px);box-shadow:none}.sq-pri[disabled]{background:var(--g-200);color:var(--g-500);box-shadow:0 4px 0 var(--g-300);cursor:default}",
      ".sq-dv{width:100%;margin:4px 0;border:0;border-top:1px dashed var(--g-200)}",
      ".sq-ed{position:relative;display:inline-flex;align-items:center;gap:4px;padding:0;border:0;background:none;color:var(--brand-600);font:600 16px/22px Roboto,sans-serif;text-decoration:underline;text-underline-offset:3px;cursor:pointer}.sq-ed svg{width:16px;height:16px}.sq-ed::after{content:'';position:absolute;left:-8px;right:-8px;top:50%;height:44px;transform:translateY(-50%)}",
      ".sq-qn{gap:20px}.sq-qn .sq-qa+.sq-qa,.sq-qn .sq-qa+.sq-nq,.sq-qn .sq-qa+.sq-qs,.sqv-m .sq-qc .sq-qa+.sq-qa,.sqv-m .sq-qc .sq-qa+.sq-qs{padding-top:16px;border-top:1px solid var(--g-100)}",
      ".sq-nq{display:flex;flex-direction:column;gap:16px}.sq-qs .sq-tot b{font-size:28px;line-height:36px}",
      "@media (prefers-reduced-motion: reduce){.sq *,.sq{animation:none !important;transition:none !important}}"
    ].join("");
    document.head.appendChild(st);
  }
})();
