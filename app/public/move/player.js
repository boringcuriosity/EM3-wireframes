/* Move: the routine player, opened from a thumbnail on a routine card.
   Ported from /v7/move-plan-options.html ("Playing the routine", dock A). The clip is a lesson:
   it plays once and stops on "Watch again", and the bar can be dragged. "Next" opens the same
   tick sheet as the card (how it felt, when) and moves on once it is marked done. */
(function () {
  var P = window.MVPLAN; if (!P) return;
  var EX = P.EX, ORDER = P.ORDER, S0 = P.S, IC = P.IC;
  var PI = {
    x: '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M2 2l10 10M12 2 2 12"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.53.85l10.2-6.5a1 1 0 0 0 0-1.7L9.53 4.65A1 1 0 0 0 8 5.5z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4.2" height="14" rx="1.4"/><rect x="13.8" y="5" width="4.2" height="14" rx="1.4"/></svg>',
    prev: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 5.5a1 1 0 0 1 2 0v13a1 1 0 0 1-2 0zM19 6.2v11.6a1 1 0 0 1-1.55.83L10 13.2a1.45 1.45 0 0 1 0-2.4l7.45-5.43A1 1 0 0 1 19 6.2z"/></svg>',
    next: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 5.5a1 1 0 0 0-2 0v13a1 1 0 0 0 2 0zM5 6.2v11.6a1 1 0 0 0 1.55.83L14 13.2a1.45 1.45 0 0 0 0-2.4L6.55 5.37A1 1 0 0 0 5 6.2z"/></svg>',
    again: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>',
    expand: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
    chev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>'
  };
  var el = document.createElement("div");
  el.className = "mvp"; el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "true"); el.setAttribute("aria-label", "Routine player");
  (document.getElementById("col") || document.body).appendChild(el);

  var S = { r: 0, i: 0, playing: false, ended: false, ctl: false }, ctlT = 0, drag = null;
  function done(id) { return !!S0.done[S.r][id]; }
  function cur() { return ORDER[S.i]; }
  /* the next one still to do, wrapping round to earlier ones */
  function nextOpen() {
    for (var k = 1; k < ORDER.length; k++) { var j = (S.i + k) % ORDER.length; if (!done(ORDER[j])) return j; }
    return -1;
  }
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
    if (EX[id].video) { vidFor(id); VID.currentTime = 0; }
    render(); el.querySelector(".mvp-scroll").scrollTop = 0;
  }

  function render() {
    var id = cur(), e = EX[id], n = nextOpen(), last = n < 0;
    var cta = done(id) ? (last ? "Close" : "Next") : (last ? "Finish" : "Next");
    el.className = "mvp on" + (S.ctl ? " ctl" : "") + (!S.playing && !S.ended ? " paused" : "") + (S.ended && e.video ? " ended" : "");
    el.innerHTML =
      '<div class="mvp-top"><button class="mvp-x" data-a="close" aria-label="Close the player">' + PI.x + '</button><div class="ttl">' + P.RT[S.r].name + '</div><span class="sp"></span></div>' +
      '<div class="mvp-vid">' + (e.video ? '<i class="vslot"></i><div class="mvp-thin"><i></i></div>'
          : '<img class="still" src="/v7/img/move/' + e.img + '.webp" alt=""><span class="mvp-novid">No video for this move yet</span>') +
        '<button class="mvp-tap" data-a="tap" aria-label="Show video controls"></button>' +
        (e.video ? '<div class="mvp-ctl"><div class="mvp-row">' +
            '<button class="s" data-a="prev" aria-label="Previous exercise"' + (S.i === 0 ? " disabled" : "") + '>' + PI.prev + '</button>' +
            '<button class="m" data-a="toggle" aria-label="' + (S.playing ? "Pause" : "Play") + '">' + (S.playing ? PI.pause : PI.play) + '</button>' +
            '<button class="s" data-a="skip" aria-label="Next exercise, without marking this one done"' + (S.i === ORDER.length - 1 ? " disabled" : "") + '>' + PI.next + '</button></div>' +
          '<div class="mvp-bar"><span class="tm">0:00</span><div class="mvp-scrub" role="slider" tabindex="0" aria-label="Video position"><span class="tr"><i></i></span><b class="kn"></b></div>' +
            '<span class="du">0:00</span>' + (document.fullscreenEnabled ? '<button class="fs" data-a="full" aria-label="Full screen">' + PI.expand + '</button>' : "") + '</div></div>' +
          '<button class="mvp-again" data-a="again">' + PI.again + 'Watch again</button>' : "") +
      '</div>' +
      '<div class="mvp-body"><div class="mvp-seg" aria-hidden="true">' + ORDER.map(function (x, k) {
          return '<i class="' + (done(x) ? "ok" : k === S.i ? "now" : "") + '"></i>';
        }).join("") + '</div>' +
        '<div class="mvp-scroll"><h5>' + e.name + (done(id) ? '<span class="mvp-done">' + IC.checkG + 'Done</span>' : "") + '</h5>' +
          '<div class="mvp-facts"><span>' + e.sets + ' <i>sets</i></span><span>' + e.reps + ' <i>reps</i></span><span>' + e.restSet + ' <i>between sets</i></span><span>' + e.rest + ' <i>before next</i></span></div>' +
          '<div class="mvp-desc"><p>' + e.why + '</p>' + (e.steps
            ? '<h6>Steps to perform</h6><ol>' + e.steps.map(function (x) { return '<li>' + x + '</li>'; }).join("") + '</ol>' +
              '<h6>Do\'s</h6><ul>' + e.dos.map(function (x) { return '<li>' + x + '</li>'; }).join("") + '</ul>' +
              '<h6>Don\'ts</h6><ul>' + e.donts.map(function (x) { return '<li>' + x + '</li>'; }).join("") + '</ul>' : "") + '</div></div>' +
        '<div class="mvp-dock"><div class="mvp-band">' + (last ? "" : '<span class="th">' + P.img(ORDER[n]) + '</span>') +
          '<div class="b"><span class="l">Up next</span><span class="n">' + (last ? "That's the last one" : EX[ORDER[n]].name) + '</span></div>' +
          '<button class="mvp-all" data-a="list">See all</button></div>' +
          '<div class="mvp-foot"><button class="mvp-go" data-a="next">' + cta + (cta === "Next" ? PI.chev : "") + '</button></div></div>' +
      '</div>';
    var slot = el.querySelector(".vslot");
    if (slot) { vidFor(id); slot.replaceWith(VID); }
    sync(); paint();
  }

  function listSheet() {
    window.GFOpenSheet("mvpList", P.RT[S.r].name, ORDER.map(function (x, k) {
      var st = done(x) ? '<span class="st is-done">Done</span>' : k === S.i ? '<span class="st is-now">Now</span>' : "";
      return '<button class="mvp-q' + (k === S.i ? " now" : "") + '" data-jump="' + k + '"><span class="th">' + P.img(x) + '</span>' +
        '<span class="b">' + EX[x].name + '<span>' + EX[x].sets + ' sets · ' + EX[x].reps + ' reps · ' + EX[x].min + ' min</span></span>' + st + '</button>';
    }).join(""));
  }
  function close() {
    VID.pause(); el.classList.remove("on"); P.onDone = null; P.render();
    clearTimeout(ctlT);
  }

  el.addEventListener("click", function (ev) {
    if (ev.target.closest(".mvp-scrub")) return;
    var t = ev.target.closest("[data-a]"); if (!t) return;
    VID.muted = false;
    var a = t.dataset.a;
    if (a === "close") return close();
    if (a === "tap") { if (S.ended) return; if (S.ctl) S.ctl = false; else showCtl(); }
    else if (a === "toggle") { S.playing = !S.playing; showCtl(); }
    else if (a === "again") { S.ended = false; S.playing = true; VID.currentTime = 0; }
    else if (a === "prev") return go(S.i - 1);
    else if (a === "skip") return go(S.i + 1);
    else if (a === "full") { try { VID.requestFullscreen(); } catch (e) {} return; }
    else if (a === "list") { VID.pause(); return listSheet(); }
    else if (a === "next") {
      /* not done yet: the card's own sheet asks how it felt and when, then we move on */
      if (!done(cur())) { VID.pause(); return P.feelSheet(S.r, cur()); }
      var n = nextOpen(); return n < 0 ? close() : go(n);
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
    open: function (r, id) {
      S.r = r; VID.muted = false;
      P.onDone = function (rr, did) {
        if (rr !== S.r || !el.classList.contains("on")) return;
        var n = nextOpen(); if (n < 0) return close();
        go(n);
      };
      go(ORDER.indexOf(id));
    }
  };
})();
