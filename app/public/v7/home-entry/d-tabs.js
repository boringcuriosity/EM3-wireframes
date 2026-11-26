/* Door: One card, three faces. A segmented control over one big card. The card shows one pillar as a calm hero:
   its orb with the score, the score name, one status line, the week as seven dots, and two buttons (open the
   pillar, or do its one action). Swipe the card or tap a segment to change pillar. It opens on the pillar
   whose item is due now. */
(function () {
  var X = "dtabs-", E = "cubic-bezier(.2,0,0,1)";
  var css = [
    "." + X + "w{display:flex;flex-direction:column;gap:12px}",
    /* the segmented control: a grey track, a white thumb that slides */
    "." + X + "seg{position:relative;display:grid;grid-template-columns:repeat(4,1fr);height:44px;padding:4px;border-radius:14px;background:#F2F4F7}",
    "." + X + "thumb{position:absolute;top:4px;bottom:4px;left:4px;width:calc((100% - 8px)/4);border-radius:10px;background:#fff;box-shadow:0 1px 3px rgba(16,24,40,.1),0 1px 2px rgba(16,24,40,.06);transition:transform .42s " + E + "}",
    "." + X + "seg button{position:relative;z-index:1;border:0;background:none;font:600 13px/1 Roboto;color:#667085;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;border-radius:10px;transition:color .3s " + E + "}",
    "." + X + "seg button i{width:6px;height:6px;border-radius:50%;background:var(--c);opacity:0;transition:opacity .3s " + E + "}",
    "." + X + "seg button.on{color:#101828}." + X + "seg button.on i{opacity:1}",
    "." + X + "seg button:focus-visible{outline:2px solid #299D6B;outline-offset:-2px}",
    /* the card: one viewport, four panes side by side on a track */
    "." + X + "card{position:relative;border-radius:24px;border:1px solid #F2F4F7;background:#fff;box-shadow:0 1px 2px rgba(16,24,40,.04),0 12px 32px -20px rgba(16,24,40,.18);overflow:hidden;touch-action:pan-y;user-select:none;-webkit-user-select:none}",
    "." + X + "track{display:flex;transition:transform .46s " + E + "}",
    "." + X + "track.drag{transition:none}",
    "." + X + "pane{flex:none;width:100%;box-sizing:border-box;padding:24px 20px 20px;display:flex;flex-direction:column;align-items:center;text-align:center;position:relative}",
    /* a soft wash of the pillar's colour behind the orb only, fading to white */
    "." + X + "pane::before{content:'';position:absolute;left:50%;top:-60px;width:300px;height:240px;margin-left:-150px;border-radius:50%;background:radial-gradient(closest-side,var(--w),rgba(255,255,255,0));pointer-events:none}",
    /* the orb: the live Home's skin, with the score as liquid inside */
    "." + X + "orb{position:relative;width:116px;height:116px;border-radius:50%;overflow:hidden;flex:none;" +
      "background:radial-gradient(130% 130% at 28% 18%,#fff 0%,var(--w) 32%,var(--t) 74%,color-mix(in srgb,var(--c) 35%,transparent) 100%);" +
      "box-shadow:0 18px 32px -14px color-mix(in srgb,var(--c) 40%,transparent),0 2px 5px color-mix(in srgb,var(--c) 14%,transparent),inset 0 -16px 24px -13px color-mix(in srgb,var(--c) 65%,transparent),inset 0 9px 15px -8px #fff,inset 0 0 0 1px color-mix(in srgb,var(--c) 14%,transparent);" +
      "animation:" + X + "drift 8s ease-in-out infinite}",
    "@keyframes " + X + "drift{0%,100%{transform:translate3d(0,0,0)}50%{transform:translate3d(0,-3px,0)}}",
    "." + X + "liq{position:absolute;left:0;right:0;bottom:0;background:linear-gradient(180deg,var(--t) 0%,color-mix(in srgb,var(--c) 32%,transparent) 100%);transition:height 1.1s cubic-bezier(.42,.06,.36,.96)}",
    "." + X + "liq::before{content:'';position:absolute;left:-10%;right:-10%;top:-1px;height:3px;border-radius:50%;background:rgba(255,255,255,.6)}",
    "." + X + "spec{position:absolute;top:10%;left:17%;width:34%;height:23%;border-radius:50%;background:#fff;filter:blur(6px);opacity:.9}",
    "." + X + "num{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;color:#101828}",
    "." + X + "num span{display:flex;align-items:center;gap:4px;font:600 11px/14px Roboto;color:var(--d)}",
    "." + X + "num b{font:500 36px/40px 'Playfair Display',serif}",
    "." + X + "num b small{font-size:.45em;color:#667085;margin-left:1px}",
    "." + X + "name{margin-top:16px;font:700 17px/24px Roboto;color:#101828;letter-spacing:-.1px;position:relative}",
    "." + X + "st{margin-top:4px;font:400 14px/20px Roboto;color:#475467;position:relative;min-height:20px}",
    /* the week: seven dots, today last and ringed */
    "." + X + "wk{margin-top:16px;display:grid;grid-template-columns:repeat(7,28px);gap:4px;justify-content:center;position:relative}",
    "." + X + "wk span{display:flex;flex-direction:column;align-items:center;gap:6px;font:500 11px/1 Roboto;color:#98A2B3}",
    "." + X + "wk i{width:10px;height:10px;border-radius:50%;background:color-mix(in srgb,var(--c) var(--v),#EAECF0)}",
    "." + X + "wk span.td{color:#101828;font-weight:700}",
    "." + X + "wk span.td i{box-shadow:0 0 0 2px #fff,0 0 0 3.5px color-mix(in srgb,var(--c) 55%,transparent)}",
    "." + X + "btns{margin-top:20px;display:grid;grid-template-columns:1fr 1fr;gap:8px;width:100%;position:relative}",
    "." + X + "btns.one{grid-template-columns:1fr}",
    "." + X + "btns button{height:46px;font-size:14px;padding:0 8px;white-space:nowrap}",
    /* the little page dots under the card, so swiping is discoverable */
    "." + X + "pg{display:flex;justify-content:center;gap:6px;margin-top:-2px}",
    "." + X + "pg i{width:6px;height:6px;border-radius:3px;background:#E4E7EC;transition:width .42s " + E + ",background .42s " + E + "}",
    "." + X + "pg i.on{width:16px;background:#98A2B3}",
    /* the short sheet */
    "." + X + "opt{display:flex;flex-direction:column;gap:8px}",
    "." + X + "opt button{min-height:52px;border-radius:12px;border:1px solid #E4E7EC;background:#fff;font:500 15px/20px Roboto;color:#101828;text-align:left;padding:12px 16px;cursor:pointer;display:flex;flex-direction:column;gap:2px}",
    "." + X + "opt button small{font:400 13px/18px Roboto;color:#667085}",
    "." + X + "opt button.pri{border-color:#B4E7CF;background:#F3FCF8}",
    "." + X + "opt button:active{background:#F9FAFB}",
    "." + X + "faces{display:flex;justify-content:space-between;gap:8px}",
    "." + X + "faces button{flex:1;height:64px;border-radius:14px;border:1px solid #E4E7EC;background:#fff;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;font:500 11px/1 Roboto;color:#475467}",
    "." + X + "faces button b{font-size:24px;line-height:1;font-weight:400}",
    "@media (prefers-reduced-motion: reduce){." + X + "track,." + X + "thumb,." + X + "liq{transition:none}." + X + "orb{animation:none}}"
  ].join("");
  var s = document.createElement("style"); s.textContent = css; document.head.appendChild(s);

  function vars(p) { var c = HE.P[p]; return "--c:" + c.c + ";--t:" + c.t + ";--w:" + c.w + ";--d:" + c.d; }
  /* the last seven day letters, today last */
  function days() { var L = "SMTWTFS", d = new Date(), out = []; for (var i = 6; i >= 0; i--) out.push(L[(d.getDay() - i + 7) % 7]); return out; }

  /* one line, never a list: what the door is waiting on */
  function status(ph, p) {
    var it = ph.pillarNext(p);
    if (!it) return p === "measure" ? "Weighed in. The trend is steady." : "All logged. Nicely done.";
    if (it.at <= HE.hour + .25) return it.t + (it.kind === "meal" ? " is waiting" : " is due");
    return it.t + " at " + HE.clock(it.at);
  }

  /* the door's verb, unless the item waiting is a different kind of thing (sleep is not breathing) */
  var VERB = { sleep: "Log sleep", mood: "Check in", wind: "Wind down", walk: "Log the walk", stairs: "Log the stairs", snack: "Log the snack" };
  function verb(it, p) { return (it && VERB[it.id]) || HE.DOOR[p].verb; }

  function pane(ph, p) {
    var c = HE.P[p], sc = ph.scores[p], it = ph.pillarNext(p), w = HE.WEEK[p].slice(0, 6).concat([sc]), L = days();
    return '<div class="' + X + 'pane" style="' + vars(p) + '" aria-roledescription="slide" aria-label="' + c.n + '">' +
      '<div class="' + X + 'orb"><div class="' + X + 'liq" style="height:' + sc + '%"></div><div class="' + X + 'spec"></div>' +
        '<div class="' + X + 'num"><span>' + HE.icon(p, 12, 2.2) + c.n + '</span><b>' + sc + '<small>%</small></b></div></div>' +
      '<div class="' + X + 'name">' + HE.DOOR[p].line + '</div>' +
      '<div class="' + X + 'st">' + status(ph, p) + '</div>' +
      '<div class="' + X + 'wk" aria-label="Your ' + c.score + ' over the last seven days">' + w.map(function (v, i) {
        return '<span class="' + (i === 6 ? "td" : "") + '"><i style="--v:' + Math.round(20 + v * .8) + '%"></i>' + L[i] + '</span>'; }).join("") + '</div>' +
      '<div class="' + X + 'btns' + (it ? "" : " one") + '">' +
        '<button class="he-sec" data-open="' + p + '">Open ' + c.n + '</button>' +
        (it ? '<button class="he-pri" data-act="' + p + '">' + verb(it, p) + '</button>' : "") + '</div></div>';
  }

  /* the verb: a plain tick logs straight away, anything with an answer gets a short sheet */
  function act(ph, p) {
    var it = ph.pillarNext(p); if (!it) return;
    if (it.kind === "tick") return ph.log([it.id]);
    var o = function (a, t, sm, pri) { return '<button data-a="' + a + '"' + (pri ? ' class="pri"' : "") + '>' + t + (sm ? "<small>" + sm + "</small>" : "") + '</button>'; };
    var html, sub = it.sub;
    if (it.kind === "meal") html = '<div class="' + X + 'opt">' + o("As planned", "Had it as planned", it.sub, 1) + o("Something different", "Had something different", "Pick it in Eat next") + '</div>';
    else if (it.kind === "sleep") html = '<div class="' + X + 'opt">' + o("Well", "Slept well", "", 1) + o("Okay", "Okay") + o("Badly", "Badly") + '</div>';
    else if (it.kind === "num") { html = '<div class="' + X + 'opt">' + o("72.6", "72.6 kg", "Same as last time", 1) + o("72.4", "72.4 kg") + o("72.8", "72.8 kg") + '</div>'; sub = "Last time 72.6 kg"; }
    else html = '<div class="' + X + 'faces">' + HE.FACES.map(function (f) { return '<button data-a="' + f[0] + '" aria-label="' + f[0] + '"><b>' + f[1] + '</b>' + f[0] + '</button>'; }).join("") + '</div>';
    ph.sheet(it.ask, html, function (e) { var b = e.target.closest("[data-a]"); if (b) ph.log([it.id], { how: b.dataset.a }); }, sub);
  }

  HE.add({
    id: "tabs", name: "One card, three faces", rec: false, group: "doors", kind: "Door",
    pitch: "One big, calm card instead of four small ones. A segmented control on top picks the pillar, and the card shows just that one: its orb and score, one line on what it is waiting for, the week as seven dots, and two buttons. It opens on the pillar that is due now.",
    how: [
      "Home opens on the pillar whose item is due now: Eat at lunch, Move at 6:30 PM, Mind at night.",
      "Tap Eat, Move, Mind or Measure on the control, or swipe the card left and right. The card slides, the thumb follows.",
      "Open Eat takes you into the pillar. The green button does its one action: a workout or breathing logs in a tap, a meal or sleep asks one short question first.",
      "The win plays, the orb fills to the new score and the status line moves on to the next thing."
    ],
    score: [["Three doors at a glance", "m"], ["One tap in", "y"], ["A hook to start", "m"], ["GoodFlip look", "y"], ["Calm", "y"]],
    catch: "Only one pillar is in view at a time, so Move and Mind are a swipe away and a low score on a hidden face goes unseen. The hook is just the due pillar being shown first.",
    from: "iOS segmented controls over a single card (Apple Fitness summary, Oura's Today tabs); the big gradient hero tile in the bento reference.",
    tryit: "Swipe the card to Move, tap Log a workout. Switch to Evening and it opens on Move by itself.",
    effort: "Low: one card, a segmented control and a swipe.",
    draw: function (ph) {
      var t = ph._t;
      if (!t || t.hour !== HE.hour) { var n = ph.next(); t = ph._t = { hour: HE.hour, i: Math.max(0, HE.ORDER.indexOf(n ? n.p : "eat")) }; }
      var O = HE.ORDER, w = document.createElement("div"); w.className = X + "w";
      w.innerHTML = '<div class="' + X + 'seg" role="tablist" aria-label="Pillars"><span class="' + X + 'thumb"></span>' + O.map(function (p, i) {
          return '<button role="tab" data-i="' + i + '" style="' + vars(p) + '"><i></i>' + HE.P[p].n + '</button>'; }).join("") + '</div>' +
        '<div class="' + X + 'card"><div class="' + X + 'track">' + O.map(function (p) { return pane(ph, p); }).join("") + '</div></div>' +
        '<div class="' + X + 'pg" aria-hidden="true">' + O.map(function () { return "<i></i>"; }).join("") + '</div>';
      ph.slot.appendChild(w);
      var track = w.querySelector("." + X + "track"), card = w.querySelector("." + X + "card"), thumb = w.querySelector("." + X + "thumb");
      var segs = w.querySelectorAll("." + X + "seg button"), dots = w.querySelectorAll("." + X + "pg i"), panes = w.querySelectorAll("." + X + "pane");
      function go(i) {
        t.i = Math.max(0, Math.min(O.length - 1, i));
        track.classList.remove("drag");
        track.style.transform = "translateX(" + (-t.i * 100) + "%)";
        thumb.style.transform = "translateX(" + (t.i * 100) + "%)";
        [].forEach.call(segs, function (b, k) { b.classList.toggle("on", k === t.i); b.setAttribute("aria-selected", k === t.i); });
        [].forEach.call(dots, function (d, k) { d.classList.toggle("on", k === t.i); });
        [].forEach.call(panes, function (pn, k) { pn.setAttribute("aria-hidden", k !== t.i); [].forEach.call(pn.querySelectorAll("button"), function (b) { b.tabIndex = k === t.i ? 0 : -1; }); });
      }
      /* place without a slide on first paint */
      track.classList.add("drag"); thumb.style.transition = "none";
      go(t.i); track.classList.add("drag"); void track.offsetWidth; track.classList.remove("drag"); thumb.style.transition = "";

      w.querySelector("." + X + "seg").onclick = function (e) { var b = e.target.closest("[data-i]"); if (b) go(+b.dataset.i); };

      /* swipe: the card follows the finger, then settles on a pane with the same ease, never past it */
      var sx = null, sy = 0, dx = 0, moved = false, W = 1;
      card.addEventListener("pointerdown", function (e) { sx = e.clientX; sy = e.clientY; dx = 0; moved = false; W = card.getBoundingClientRect().width || 1; });
      card.addEventListener("pointermove", function (e) {
        if (sx === null) return;
        dx = e.clientX - sx;
        if (!moved && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(e.clientY - sy)) { moved = true; try { card.setPointerCapture(e.pointerId); } catch (_) {} }
        if (!moved) return;
        var edge = (t.i === 0 && dx > 0) || (t.i === O.length - 1 && dx < 0), d = edge ? dx * .3 : dx;
        track.classList.add("drag");
        track.style.transform = "translateX(calc(" + (-t.i * 100) + "% + " + d + "px))";
      });
      function end() {
        if (sx === null) return; sx = null;
        if (!moved) return;
        var lim = W * .18;
        go(dx < -lim ? t.i + 1 : dx > lim ? t.i - 1 : t.i);
      }
      card.addEventListener("pointerup", end); card.addEventListener("pointercancel", end);
      card.addEventListener("click", function (e) {
        if (moved) { moved = false; e.stopPropagation(); return; }
        var o = e.target.closest("[data-open]"), a = e.target.closest("[data-act]");
        if (o) ph.openPillar(o.dataset.open);
        else if (a) act(ph, a.dataset.act);
      }, true);
    }
  });
})();
