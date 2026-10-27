/* Move: the routine player, opened from a thumbnail on a routine card.
   Ported from /v7/move-plan-options.html ("Playing the routine", dock A). The clip is a lesson:
   it plays once and stops on "Watch again", and the bar can be dragged. "Next" opens the same
   tick sheet as the card (how it felt, when) and moves on once it is marked done. */
(function () {
  var P = window.MVPLAN; if (!P) return;
  var EX = P.EX, S0 = P.S, IC = P.IC;
  /* What to do: each set, each rest, then the rest before the next exercise, as flat rows (v7/move-sets-reps-recipe.html, round 8 A).
     One set of words for every exercise; at most 2 sets for now */
  var SVG = { clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    next: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>' };
  var secs = function (t) { return "<b>" + String(t).replace(/\s*sec$/, " seconds") + "</b>"; };
  function steps(e) {
    var n = Math.min(2, e.sets || 1), row = function (k, ic, lb, t) { return '<div class="mvp-st ' + k + '"><span class="ic">' + ic + '</span><span class="tx">' + (lb ? '<span class="lb">' + lb + '</span>' : "") + '<span class="t">' + t + '</span></span></div>'; };
    var ex = '<i style="--src:url(/v7/icons/move/ex/set/' + (e.ic || "family-strength") + '.svg)"></i>', h = "";
    for (var i = 0; i < n; i++) {
      h += row("do", ex, n > 1 ? "Set " + (i + 1) : "", i ? "Do it again, <b>" + e.reps + " times</b>" : "Do this exercise <b>" + e.reps + " times</b>");
      if (i < n - 1) h += row("rs", SVG.clock, "Between sets", "Rest for " + secs(e.restSet));
    }
    return '<div class="mvp-steps"><div class="mvp-lbl">What to do</div>' + h + row("nx", SVG.next, "Before the next exercise", "Rest for " + secs(e.rest)) + '</div>';
  }
  var PI = {
    x: '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M2 2l10 10M12 2 2 12"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.53.85l10.2-6.5a1 1 0 0 0 0-1.7L9.53 4.65A1 1 0 0 0 8 5.5z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4.2" height="14" rx="1.4"/><rect x="13.8" y="5" width="4.2" height="14" rx="1.4"/></svg>',
    prev: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 5.5a1 1 0 0 1 2 0v13a1 1 0 0 1-2 0zM19 6.2v11.6a1 1 0 0 1-1.55.83L10 13.2a1.45 1.45 0 0 1 0-2.4l7.45-5.43A1 1 0 0 1 19 6.2z"/></svg>',
    next: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 5.5a1 1 0 0 0-2 0v13a1 1 0 0 0 2 0zM5 6.2v11.6a1 1 0 0 0 1.55.83L14 13.2a1.45 1.45 0 0 0 0-2.4L6.55 5.37A1 1 0 0 0 5 6.2z"/></svg>',
    again: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>',
    shrink: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>',
    expand: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
    list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r=".6" fill="currentColor"/><circle cx="4.5" cy="12" r=".6" fill="currentColor"/><circle cx="4.5" cy="18" r=".6" fill="currentColor"/></svg>',
    chev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>'
  };
  var el = document.createElement("div");
  el.className = "mvp"; el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "true"); el.setAttribute("aria-label", "Routine player");
  (document.getElementById("col") || document.body).appendChild(el);
  /* the player covers the whole screen with the phone's status bar drawn in, so nothing of the page shows or scrolls above it */
  var BAR = (document.querySelector(".gf-status") || {}).outerHTML || "";

  /* land: the video turned to landscape and filling the phone, the way a workout app plays a lesson */
  var S = { r: 0, i: 0, playing: false, ended: false, ctl: false, land: false, side: false }, ctlT = 0, drag = null, enter = false, sideIn = false;
  function done(id) { return !!S0.done[S.r][id]; }
  function cur() { return P.RT[S.r].ex[S.i]; }
  /* the next one still to do, wrapping round to earlier ones */
  function nextOpen() {
    for (var k = 1; k < P.RT[S.r].ex.length; k++) { var j = (S.i + k) % P.RT[S.r].ex.length; if (!done(P.RT[S.r].ex[j])) return j; }
    return -1;
  }
  /* the end of the routine: the last in the list, or nothing left to do. It finishes rather than looping back to one skipped earlier */
  function atEnd() { return S.i === P.RT[S.r].ex.length - 1 || nextOpen() < 0; }
  function mmss(s) { s = Math.max(0, Math.round(s || 0)); return Math.floor(s / 60) + ":" + ("0" + s % 60).slice(-2); }

  /* one video element, kept across renders so playback never restarts by accident */
  var VID = document.createElement("video"), vidId = null;
  VID.playsInline = true; VID.setAttribute("playsinline", ""); VID.preload = "auto";
  function vidFor(id) { if (vidId === id) return; vidId = id; VID.src = "/v7/video/move/" + EX[id].video + ".mp4"; VID.poster = "/v7/img/move/" + EX[id].img + "-poster.webp"; }
  VID.addEventListener("timeupdate", paint);
  VID.addEventListener("ended", function () { if (drag) return; S.ended = true; S.playing = false; render(); });
  function sync() {
    var on = el.classList.contains("on") && S.playing && !S.ended && EX[cur()].video && !document.querySelector(".esheet.on");
    if (on) { var p = VID.play(); if (p && p.catch) p.catch(function () {}); } else VID.pause();
  }
  function paint() {
    if (!EX[cur()].video) return;
    var d = VID.duration || 1, w = (100 * Math.min(1, VID.currentTime / d)) + "%";
    var q = function (s) { return el.querySelectorAll(s); };
    [].forEach.call(q(".mvp-bar .tm"), function (x) { x.textContent = mmss(VID.currentTime); });
    [].forEach.call(q(".mvp-bar .du"), function (x) { if (VID.duration) x.textContent = mmss(VID.duration); });
    [].forEach.call(q(".mvp-scrub .tr i,.mvp-thin i"), function (x) { x.style.width = w; });
    [].forEach.call(q(".mvp-scrub .kn"), function (x) { x.style.left = w; });
  }

  /* dragging the bar */
  function seek(ev, bar) {
    var r = bar.getBoundingClientRect(), f = Math.min(1, Math.max(0, (ev.clientX - r.left) / r.width));
    if (VID.duration) VID.currentTime = f * VID.duration; paint();
  }
  el.addEventListener("pointerdown", function (ev) {
    var bar = ev.target.closest(".mvp-scrub"); if (!bar) return;
    ev.preventDefault(); drag = bar; bar.setPointerCapture(ev.pointerId); bar.classList.add("on"); clearTimeout(ctlT);
    if (S.ended) { S.ended = false; S.playing = true; el.classList.remove("ended"); }
    seek(ev, bar);
  });
  el.addEventListener("pointermove", function (ev) { if (drag) seek(ev, drag); });
  function endDrag() { if (!drag) return; drag.classList.remove("on"); drag = null; showCtl(); render(); }
  el.addEventListener("pointerup", endDrag);
  el.addEventListener("pointercancel", endDrag);
  el.addEventListener("keydown", function (ev) {
    if (ev.target.classList.contains("mvp-scrub")) {
      var st = ev.key === "ArrowRight" ? 5 : ev.key === "ArrowLeft" ? -5 : 0;
      if (st) { ev.preventDefault(); VID.currentTime = Math.max(0, VID.currentTime + st); paint(); }
    }
  });
  document.addEventListener("keydown", function (ev) { if (ev.key === "Escape" && el.classList.contains("on") && !document.querySelector(".esheet.on")) close(); });

  function showCtl() {
    S.ctl = true; clearTimeout(ctlT);
    ctlT = setTimeout(function () { if (S.playing && !drag) { S.ctl = false; el.classList.remove("ctl"); } }, 3000);
  }
  function go(k) {
    S.i = k; S.ctl = false; var id = cur();
    S.ended = !EX[id].video; S.playing = !S.ended;
    /* nothing to watch: back to portrait, where its steps and its button are */
    if (S.land && !EX[id].video) { S.land = false; bar(true); }
    if (EX[id].video) { vidFor(id); VID.currentTime = 0; }
    render(); el.querySelector(".mvp-scroll").scrollTop = 0;
  }

  function render() {
    var id = cur(), e = EX[id], n = nextOpen(), last = atEnd();
    var cta = last ? "Finish" : "Next";
    el.className = "mvp on" + (S.ctl ? " ctl" : "") + (!S.playing && !S.ended ? " paused" : "") + (S.ended && e.video ? " ended" : "") + (S.land ? " land" : "") + (enter ? " enter" : "");
    var list = P.RT[S.r].ex, pos = list.indexOf(id) + 1;
    el.innerHTML = BAR +
      '<div class="mvp-top"><button class="mvp-x" data-a="close" aria-label="Close the player">' + PI.x + '</button><div class="ttl">' + P.RT[S.r].name + '</div><span class="sp"></span></div>' +
      '<div class="mvp-vid">' +
        /* landscape only: what is playing and where it sits in the routine, a way back to portrait, and out */
        (S.land ? '<div class="mvp-lhd">' +
          '<div class="lt"><b>' + e.name + (done(id) ? '<span class="ok">' + PI.check + 'Done</span>' : "") + '</b><span>' + P.RT[S.r].name + ' · ' + pos + ' of ' + list.length + ' · ' + e.sets + ' sets · ' + e.reps + ' reps</span></div>' +
          '<button class="lb" data-a="side" aria-label="Show the routine" aria-expanded="' + S.side + '">' + PI.list + '</button></div>' : "") +
        (S.land && S.side ? sideHTML(list) : "") +
        (e.video ? '<i class="vslot"></i><div class="mvp-thin"><i></i></div>'
          : '<img class="still" src="/v7/img/move/' + e.img + '.webp" alt=""><span class="mvp-novid">No video for this move yet</span>') +
        '<button class="mvp-tap" data-a="tap" aria-label="Show video controls"></button>' +
        (e.video ? '<div class="mvp-ctl"><div class="mvp-row">' +
            '<button class="s" data-a="prev" aria-label="Previous exercise"' + (S.i === 0 ? " disabled" : "") + '>' + PI.prev + '</button>' +
            '<button class="m" data-a="toggle" aria-label="' + (S.playing ? "Pause" : "Play") + '">' + (S.playing ? PI.pause : PI.play) + '</button>' +
            '<button class="s" data-a="skip" aria-label="Next exercise, without marking this one done"' + (S.i === P.RT[S.r].ex.length - 1 ? " disabled" : "") + '>' + PI.next + '</button></div>' +
          '<div class="mvp-bar"><span class="tm">0:00</span><div class="mvp-scrub" role="slider" tabindex="0" aria-label="Video position"><span class="tr"><i></i></span><b class="kn"></b></div>' +
            '<span class="du">0:00</span>' + (S.land ? '<button class="fs" data-a="portrait" aria-label="Exit full screen">' + PI.shrink + '</button>'
              : '<button class="fs" data-a="full" aria-label="Full screen">' + PI.expand + '</button>') + '</div></div>' +
          (S.land && S.ended ? '<div class="mvp-lend"><button class="ag" data-a="again">' + PI.again + 'Watch again</button>' +
              '<button class="nx" data-a="next">' + (done(id) ? (last ? "Finish" : "Next exercise" + PI.chev) : (last ? "Finish" : PI.check + "Done, next exercise")) + '</button></div>'
            : '<button class="mvp-again" data-a="again">' + PI.again + 'Watch again</button>') : "") +
      '</div>' +
      '<div class="mvp-body">' +
        '<div class="mvp-scroll"><div class="mvp-th"><h5>' + e.name + '</h5>' +
          /* marking it done stays on this exercise; Next is what moves on */
          '<button class="mvp-mark' + (done(id) ? " on" : "") + '" data-a="mark" aria-pressed="' + done(id) + '"><span class="ck">' + PI.check + '</span>' + (done(id) ? "Completed" : "Mark as completed") + '</button></div>' +
          steps(e) +
          '<div class="mvp-desc"><div class="mvp-lbl">About this exercise</div><p>' + e.why + '</p>' + (e.steps
            ? '<h6>Steps to perform</h6><ol>' + e.steps.map(function (x) { return '<li>' + x + '</li>'; }).join("") + '</ol>' +
              '<h6>Do\'s</h6><ul>' + e.dos.map(function (x) { return '<li>' + x + '</li>'; }).join("") + '</ul>' +
              '<h6>Don\'ts</h6><ul>' + e.donts.map(function (x) { return '<li>' + x + '</li>'; }).join("") + '</ul>' : "") + '</div></div>' +
        /* the last in the list says so, rather than looping back to one skipped earlier */
        '<div class="mvp-dock"><div class="mvp-band">' + (pos === list.length ? '<div class="b"><span class="l">End of the list</span><span class="n">This is the last move in ' + P.RT[S.r].name + '</span></div>'
            : n < 0 ? '<div class="b"><span class="l">Nothing left after this</span><span class="n">Every other move is done</span></div>'
            : '<span class="th">' + P.img(P.RT[S.r].ex[n]) + '</span><div class="b"><span class="l">Up next</span><span class="n">' + EX[P.RT[S.r].ex[n]].name + '</span></div>') +
          '<button class="mvp-all" data-a="list">See all</button></div>' +
          '<div class="mvp-foot"><button class="mvp-go" data-a="next">' + cta + (cta === "Next" ? PI.chev : "") + '</button></div></div>' +
      '</div>';
    var slot = el.querySelector(".vslot");
    if (slot) { vidFor(id); slot.replaceWith(VID); }
    sideIn = false;
    /* the playing row into view inside the list only; scrollIntoView would also move any page this one is framed in */
    var now = el.querySelector(".mvp-side .sq.now"), sl = now && now.closest(".sl");
    if (sl) { var y = now.offsetTop - sl.offsetTop; if (y < sl.scrollTop || y + now.offsetHeight > sl.scrollTop + sl.clientHeight) sl.scrollTop = y - 8; }
    sync(); paint();
  }

  /* landscape: the routine opens beside the video, the way YouTube shows a playlist, and the video keeps playing */
  function sideHTML(list) {
    var got = list.filter(done).length;
    return '<div class="mvp-side' + (sideIn ? " in" : "") + '" role="region" aria-label="' + P.RT[S.r].name + ' routine">' +
      '<div class="sh"><div class="t"><b>' + P.RT[S.r].name + '</b><span>' + (S.i + 1) + ' of ' + list.length + (got ? ' · ' + got + ' done' : "") + '</span></div>' +
        '<button class="lb" data-a="side" aria-label="Hide the routine">' + PI.x + '</button></div>' +
      '<div class="sl">' + list.map(function (x, k) {
        var st = done(x) ? '<span class="st on" aria-label="Done">' + PI.check + '</span>' : k === S.i ? '<span class="st now">Now</span>' : "";
        return '<button class="sq' + (k === S.i ? " now" : "") + '" data-a="jump" data-k="' + k + '"><span class="th">' + P.img(x) + '</span>' +
          '<span class="b"><b>' + EX[x].name + '</b><span>' + EX[x].sets + ' sets · ' + EX[x].reps + ' reps</span>' + st + '</span></button>';
      }).join("") + '</div></div>';
  }
  function listSheet() {
    window.GFOpenSheet("mvpList", P.RT[S.r].name, P.RT[S.r].ex.map(function (x, k) {
      /* done reads as the card's own tick, filled green; the one playing says Now; the rest an empty ring */
      var st = done(x) ? '<span class="st tk on" aria-label="Done">' + PI.check + '</span>' : k === S.i ? '<span class="st is-now">Now</span>' : '<span class="st tk" aria-label="Not done"></span>';
      return '<button class="mvp-q' + (k === S.i ? " now" : "") + '" data-jump="' + k + '"><span class="th">' + P.img(x) + '</span>' +
        '<span class="b">' + EX[x].name + '<span>' + EX[x].sets + ' sets · ' + EX[x].reps + ' reps · ' + EX[x].min + ' min</span></span>' + st + '</button>';
    }).join(""));
  }
  /* turning: the video rotates into the phone's long side, and back. The first frame of the turn is played once, then dropped */
  function bar(show) { if (window.parent !== window) parent.postMessage({ statusBar: show }, "*"); }   /* the preview frame's status bar */
  /* the way out of landscape: the video turns back and shrinks into the portrait frame at the top, then the portrait screen takes over */
  function turnBack(then) {
    var v = el.querySelector(".mvp-vid");
    if (!v || matchMedia("(prefers-reduced-motion: reduce)").matches) return then();
    var W = el.clientWidth, H = el.clientHeight, y = 106 + W * 9 / 32;   /* portrait: under the status bar (54) and the top bar (52), 16:9 */
    v.style.setProperty("--s", (W / H).toFixed(3));
    v.style.setProperty("--dy", Math.round(y - H / 2) + "px");
    el.classList.add("leave");
    setTimeout(function () { el.classList.remove("leave"); v.style.removeProperty("--s"); v.style.removeProperty("--dy"); then(); }, 380);
  }
  function land(on) {
    S.land = on; enter = on; S.side = false; showCtl(); render(); bar(!on);
    if (on) setTimeout(function () { enter = false; el.classList.remove("enter"); }, 520);
  }
  function close() {
    VID.pause(); el.classList.remove("on"); S.land = false; S.side = false; bar(true); P.onDone = null; P.render();
    document.documentElement.classList.remove("mvl-lock");
    clearTimeout(ctlT);
  }

  el.addEventListener("click", function (ev) {
    if (ev.target.closest(".mvp-scrub")) return;
    var t = ev.target.closest("[data-a]"); if (!t) return;
    VID.muted = false;
    var a = t.dataset.a;
    if (a === "close") return S.land ? turnBack(close) : close();
    if (a === "tap") { if (S.ended) return; if (S.ctl) S.ctl = false; else showCtl(); }
    else if (a === "toggle") { S.playing = !S.playing; showCtl(); }
    else if (a === "again") { S.ended = false; S.playing = true; VID.currentTime = 0; }
    else if (a === "prev") return go(S.i - 1);
    else if (a === "skip") return go(S.i + 1);
    else if (a === "full") { land(true); return; }
    else if (a === "portrait") { return turnBack(function () { land(false); }); }
    else if (a === "mark") {
      var mid = cur();
      if (done(mid) && window.MVTRAY && window.MVTRAY.unmark) return window.MVTRAY.unmark(S.r, mid, function () { render(); });
      if (done(mid)) { delete S0.done[S.r][mid]; P.render(); }
      /* done needs a time: the time sheet asks when, and marks it done once picked (tray.js) */
      else if (window.MVTRAY && window.MVTRAY.markAt) return window.MVTRAY.markAt(S.r, mid, function () { render(); });
      else { S0.done[S.r][mid] = "Done"; P.render(); }
    }
    else if (a === "side") { S.side = !S.side; sideIn = S.side; showCtl(); }
    else if (a === "jump") return go(+t.dataset.k);
    else if (a === "list") { VID.pause(); return listSheet(); }
    else if (a === "next" && atEnd()) {
      /* Finish: back to the day, with the routine's workouts ticked into the bar to log together */
      var r = S.r, ids = P.RT[r].ex.slice(), out = function () { close(); if (window.MVTRAY && window.MVTRAY.stage) window.MVTRAY.stage(r, ids); };
      return S.land ? turnBack(out) : out();
    }
    else if (a === "next") {
      /* not done yet: the card's own sheet asks how it felt and when, then we move on */
      if (!done(cur())) { VID.pause(); return P.feelSheet(S.r, cur()); }
      return atEnd() ? (S.land ? turnBack(close) : close()) : go(nextOpen());
    }
    render();
  });
  /* See all lives in a house sheet, outside the player */
  document.addEventListener("click", function (ev) {
    var j = ev.target.closest("#mvpList [data-jump]"); if (!j) return;
    window.closeSheets(); go(+j.dataset.jump);
  });
  /* a closed sheet hands the video back */
  new MutationObserver(function () { if (el.classList.contains("on")) sync(); })
    .observe(document.getElementById("col") || document.body, { subtree: true, attributes: true, attributeFilter: ["class"] });

  window.MVPLAYER = {
    open: function (r, id, upright) {
      S.r = r; VID.muted = false;
      document.documentElement.classList.add("mvl-lock");   /* the page behind holds still (log.css) */
      P.onDone = function (rr, did) {
        if (rr !== S.r || !el.classList.contains("on")) return;
        if (atEnd()) return S.land ? turnBack(close) : close();
        go(nextOpen());
      };
      /* a tap on the thumbnail starts it full screen, turned to landscape; on the name it opens upright, the detail */
      S.land = !upright; enter = !upright; bar(!!upright);
      go(P.RT[S.r].ex.indexOf(id));
      setTimeout(function () { enter = false; el.classList.remove("enter"); }, 520);
    }
  };
})();
