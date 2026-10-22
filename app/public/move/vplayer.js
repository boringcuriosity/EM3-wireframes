/* Move Learn: the video player for the library (move/videos.js). Built on the routine player's look (player.css):
   a tap on a cover opens it full screen, turned to landscape; the shrink button turns it back to portrait, where the
   whole description sits under the video; X closes it from either. Play, back and forward 10 seconds, a bar to drag.
   ponytail: the app's video links are signed and are not copied, so each video plays a sample clip of its kind
   (Box breathing, Spot jump, Plank to push up) and says so; it turns by CSS, the way the routine player does. */
(function () {
  var V = window.MVV; if (!V) return;
  var CLIP = { breathing: "box", strength: "plank" };   /* everything else: spot */
  var PI = {
    x: '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M2 2l10 10M12 2 2 12"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.53.85l10.2-6.5a1 1 0 0 0 0-1.7L9.53 4.65A1 1 0 0 0 8 5.5z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4.2" height="14" rx="1.4"/><rect x="13.8" y="5" width="4.2" height="14" rx="1.4"/></svg>',
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12a8 8 0 1 0 2.6-5.9"/><path d="M4 4v4h4"/><text x="12" y="15.5" text-anchor="middle" font-size="7.5" font-weight="700" fill="currentColor" stroke="none" font-family="Roboto,sans-serif">10</text></svg>',
    fwd: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20 4v4h-4"/><text x="12" y="15.5" text-anchor="middle" font-size="7.5" font-weight="700" fill="currentColor" stroke="none" font-family="Roboto,sans-serif">10</text></svg>',
    again: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>',
    expand: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
    chev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>',
    shrink: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/></svg>'
  };
  var el = document.createElement("div");
  el.className = "mvp"; el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "true"); el.setAttribute("aria-label", "Video player");
  document.body.appendChild(el);
  var VID = document.createElement("video");
  VID.playsInline = true; VID.setAttribute("playsinline", ""); VID.preload = "auto";
  var Q = null;   /* the row it was opened from: { k, h, items }, or none for the exercise of the week */
  var X = null, S = { playing: false, ended: false, ctl: false, land: false }, enter = false, ctlT = 0, drag = null;
  function mmss(s) { s = Math.max(0, Math.round(s || 0)); return Math.floor(s / 60) + ":" + ("0" + s % 60).slice(-2); }
  function kind(x) { var k = ""; V.S.forEach(function (s) { if (s.items.indexOf(x) >= 0) k = s.k; }); return CLIP[k] || (x === V.WEEK ? "plank" : "spot"); }

  VID.addEventListener("timeupdate", paint);
  VID.addEventListener("loadedmetadata", paint);
  VID.addEventListener("ended", function () { if (drag) return; S.ended = true; S.playing = false; render(); });
  function sync() { if (el.classList.contains("on") && S.playing && !S.ended) { var p = VID.play(); if (p && p.catch) p.catch(function () {}); } else VID.pause(); }
  function paint() {
    var d = VID.duration || 1, w = (100 * Math.min(1, VID.currentTime / d)) + "%", q = function (s, f) { [].forEach.call(el.querySelectorAll(s), f); };
    q(".mvp-bar .tm", function (x) { x.textContent = mmss(VID.currentTime); });
    q(".mvp-bar .du", function (x) { if (VID.duration) x.textContent = mmss(VID.duration); });
    q(".mvp-scrub .tr i,.mvp-thin i", function (x) { x.style.width = w; });
    q(".mvp-scrub .kn", function (x) { x.style.left = w; });
  }
  function seek(ev, bar) { var r = bar.getBoundingClientRect(), f = Math.min(1, Math.max(0, (S.land ? ev.clientY - r.top : ev.clientX - r.left) / (S.land ? r.height : r.width))); if (VID.duration) VID.currentTime = f * VID.duration; paint(); }
  el.addEventListener("pointerdown", function (ev) {
    var bar = ev.target.closest(".mvp-scrub"); if (!bar) return;
    ev.preventDefault(); drag = bar; bar.setPointerCapture(ev.pointerId); bar.classList.add("on"); clearTimeout(ctlT);
    if (S.ended) { S.ended = false; S.playing = true; }
    seek(ev, bar);
  });
  el.addEventListener("pointermove", function (ev) { if (drag) seek(ev, drag); });
  function endDrag() { if (!drag) return; drag.classList.remove("on"); drag = null; showCtl(); render(); }
  el.addEventListener("pointerup", endDrag); el.addEventListener("pointercancel", endDrag);
  document.addEventListener("keydown", function (ev) {
    if (!el.classList.contains("on")) return;
    if (ev.key === "Escape") return S.land ? land(false) : close();
    if (ev.key === " ") { ev.preventDefault(); S.playing = !S.playing; S.ended = false; render(); }
    if (ev.key === "ArrowRight" || ev.key === "ArrowLeft") { VID.currentTime = Math.max(0, VID.currentTime + (ev.key === "ArrowRight" ? 10 : -10)); paint(); }
  });
  function showCtl() { S.ctl = true; clearTimeout(ctlT); ctlT = setTimeout(function () { if (S.playing && !drag) { S.ctl = false; el.classList.remove("ctl"); } }, 3000); }

  function nextOf() { if (!Q) return null; var i = Q.items.indexOf(X); return i >= 0 ? Q.items[i + 1] || null : null; }
  /* the routine player's floating band, for the row: the next video, or the end of the row, and See all */
  function dock() {
    if (!Q) return "";
    var n = nextOf();
    return '<div class="mvp-dock"><div class="mvp-band">' + (n
        ? '<button class="mvv-nx" data-a="next"><span class="th"><img src="' + V.IMG + n.img + '.webp" alt=""></span><span class="b"><span class="l">Up next</span><span class="n">' + n.t + "</span></span></button>"
        : '<div class="b"><span class="l">End of the row</span><span class="n">The last video in ' + Q.h + "</span></div>") +
      '<button class="mvp-all" data-a="list">See all</button></div></div>';
  }
  /* See all: the row in a sheet over the player, the routine list's rows; the one playing says Now. The video waits */
  function listSheet() {
    var was = S.playing; S.playing = false; sync();
    var sh = document.createElement("div"); sh.className = "mvv-sheet";
    sh.innerHTML = '<div class="mvv-dim"></div><div class="mvv-panel" role="dialog" aria-modal="true" aria-label="' + Q.h + '">' +
      '<div class="mvv-ph"><div><b>' + Q.h + "</b><span>" + Q.items.length + (Q.items.length === 1 ? " video" : " videos") + '</span></div><button class="mvv-x" aria-label="Close">' + PI.x + "</button></div>" +
      '<div class="mvv-sb mvv-ql">' + Q.items.map(function (x, k) {
        return '<button class="mvp-q' + (x === X ? " now" : "") + '" data-k="' + k + '"><span class="th"><img src="' + V.IMG + x.img + '.webp" alt=""></span>' +
          '<span class="b">' + x.t + "<span>" + x.lv + " · " + x.min + " min</span></span>" + (x === X ? '<span class="mvv-now">Now</span>' : "") + "</button>";
      }).join("") + "</div></div>";
    document.body.appendChild(sh);
    requestAnimationFrame(function () { sh.classList.add("on"); });
    var shut = function (then) { sh.classList.remove("on"); setTimeout(function () { sh.remove(); }, 300); if (then) then(); else { S.playing = was; render(); } };
    sh.querySelector(".mvv-dim").onclick = sh.querySelector(".mvv-x").onclick = function () { shut(); };
    sh.querySelector(".mvv-ql").addEventListener("click", function (ev) {
      var b = ev.target.closest("[data-k]"); if (!b) return;
      var x = Q.items[+b.dataset.k]; shut(function () { x === X ? (S.playing = was, render()) : go(x); });
    });
  }
  function go(x) { X = x; VID.currentTime = 0; S.ended = false; S.playing = true; showCtl(); render(); var sc = el.querySelector(".mvp-scroll"); if (sc) sc.scrollTop = 0; }
  function render() {
    var x = X, p = V.parts(x.d), list = function (h, a, tag) { return a ? "<h6>" + h + "</h6><" + tag + ">" + a.map(function (s) { return "<li>" + s + "</li>"; }).join("") + "</" + tag + ">" : ""; };
    el.className = "mvp mvv-pl on" + (Q ? " q" : "") + (S.ctl ? " ctl" : "") + (!S.playing && !S.ended ? " paused" : "") + (S.ended ? " ended" : "") + (S.land ? " land" : "") + (enter ? " enter" : "");
    el.innerHTML =   /* no status bar of its own: the page's sits above the player in portrait */
      '<div class="mvp-top"><button class="mvp-x" data-a="close" aria-label="Close the video">' + PI.x + '</button><div class="ttl">Video</div><span class="sp"></span></div>' +
      '<div class="mvp-vid">' +
        (S.land ? '<div class="mvp-lhd"><div class="lt"><b>' + x.t + "</b><span>" + x.lv + ' · No equipment</span></div><button class="lb" data-a="close" aria-label="Close the video">' + PI.x + "</button></div>" : "") +
        '<i class="vslot"></i><div class="mvp-thin"><i></i></div><span class="mvp-novid">Sample clip</span>' +
        '<button class="mvp-tap" data-a="tap" aria-label="Show video controls"></button>' +
        '<div class="mvp-ctl"><div class="mvp-row">' +
          '<button class="s" data-a="back" aria-label="Back 10 seconds">' + PI.back + '</button>' +
          '<button class="m" data-a="toggle" aria-label="' + (S.playing ? "Pause" : "Play") + '">' + (S.playing ? PI.pause : PI.play) + '</button>' +
          '<button class="s" data-a="fwd" aria-label="Forward 10 seconds">' + PI.fwd + "</button></div>" +
          '<div class="mvp-bar"><span class="tm">0:00</span><div class="mvp-scrub" role="slider" tabindex="0" aria-label="Video position"><span class="tr"><i></i></span><b class="kn"></b></div><span class="du">0:00</span>' +
            (S.land ? '<button class="fs" data-a="portrait" aria-label="Exit full screen">' + PI.shrink + "</button>" : '<button class="fs" data-a="full" aria-label="Full screen">' + PI.expand + "</button>") + "</div></div>" +
        (S.land && S.ended ? '<div class="mvp-lend"><button class="ag" data-a="again">' + PI.again + "Watch again</button>" + (nextOf() ? '<button class="nx" data-a="next">Next video' + PI.chev + "</button>" : "") + "</div>"
          : '<button class="mvp-again" data-a="again">' + PI.again + "Watch again</button>") +
      "</div>" +
      '<div class="mvp-body"><div class="mvp-scroll"><h5>' + x.t + '</h5><p class="mvv-plv">' + x.lv + " · No equipment</p>" +
        '<div class="mvp-desc"><p>' + p.about + "</p>" + list("Steps to perform", p.steps, "ol") + list("Do’s", p.dos, "ul") + list("Don’ts", p.donts, "ul") + "</div></div>" + dock() + "</div>";
    el.querySelector(".vslot").replaceWith(VID);
    sync(); paint();
  }
  function land(on) {
    S.land = on; enter = on; showCtl(); render(); bar(!on);
    if (on) setTimeout(function () { enter = false; el.classList.remove("enter"); }, 520);
  }
  function bar(show) { if (window.parent !== window) parent.postMessage({ statusBar: show }, "*"); }   /* the preview frame's status bar */
  function close() { VID.pause(); el.classList.remove("on"); S.land = false; bar(true); clearTimeout(ctlT); document.documentElement.style.overflow = ""; }

  el.addEventListener("click", function (ev) {
    if (ev.target.closest(".mvp-scrub")) return;
    var t = ev.target.closest("[data-a]"); if (!t) return;
    var a = t.dataset.a;
    if (a === "close") return close();
    if (a === "tap") { if (S.ended) return; if (S.ctl) S.ctl = false; else showCtl(); }
    else if (a === "toggle") { S.playing = !S.playing; showCtl(); }
    else if (a === "back" || a === "fwd") { VID.currentTime = Math.max(0, VID.currentTime + (a === "fwd" ? 10 : -10)); S.ended = false; showCtl(); }
    else if (a === "again") { S.ended = false; S.playing = true; VID.currentTime = 0; }
    else if (a === "full") return land(true);
    else if (a === "portrait") return land(false);
    else if (a === "next") { var n = nextOf(); if (n) return go(n); }
    else if (a === "list") return listSheet();
    render();
  });

  var st = document.createElement("style");
  st.textContent = ".mvv-pl .mvp-novid{left:auto;right:12px;top:10px;bottom:auto}.mvv-pl.land .mvp-novid{display:none}" +
    ".mvv-pl .mvp-scroll h5{font-size:20px;line-height:26px}.mvv-plv{margin:4px 0 0;font:400 13px/18px Roboto,sans-serif;color:var(--g-500)}" +
    ".mvv-pl .mvp-scroll{padding-bottom:32px}.mvv-pl.q .mvp-scroll{padding-bottom:110px}" +
    /* the band floats over the end of the description, as in the routine player; the whole left part plays the next one */
    ".mvv-pl .mvp-dock{margin-top:-84px;padding-bottom:calc(16px + var(--gf-home-h,20px) + env(safe-area-inset-bottom,0px))}" +
    ".mvv-nx{flex:1;min-width:0;display:flex;align-items:center;gap:12px;border:0;background:none;padding:0;text-align:left;cursor:pointer;font:inherit;color:inherit}" +
    ".mvv-pl .mvp-band .th{width:78px;height:auto;aspect-ratio:712/233;border-radius:6px}" +
    /* the See all sheet sits over the player; covers keep their own shape */
    ".mvv-sheet{z-index:80}.mvv-ql{display:flex;flex-direction:column;gap:4px;padding-bottom:calc(16px + var(--gf-home-h,20px))}" +
    ".mvv-ql .mvp-q{width:calc(100% + 16px);margin:0 -8px;padding:8px;border:1px solid transparent}.mvv-ql .mvp-q.now{background:var(--brand-50,#F3FCF8);border-color:var(--brand-200,#CBF0E0)}.mvv-ql .mvp-q.now .b{color:var(--brand-900,#1D4D38)}.mvv-now{flex:none;font:600 13px/1 Roboto,sans-serif;color:var(--brand-600,#299D6B)}.mvv-ql .mvp-q .th{width:96px;height:auto;aspect-ratio:712/233;border-radius:6px}.mvv-ql .mvp-q .b{font:600 14px/20px Roboto,sans-serif;color:var(--g-900)}";
  document.head.appendChild(st);

  window.MVVPLAYER = {
    open: function (x, portrait, paused, q) {
      X = x; Q = q || null; VID.src = "/v7/video/move/" + kind(x) + ".mp4"; VID.currentTime = 0;
      S = { playing: true, ended: false, ctl: false, land: true }; enter = true;
      document.documentElement.style.overflow = "hidden";
      showCtl(); render(); bar(false);
      setTimeout(function () { enter = false; el.classList.remove("enter"); }, 520);
      if (portrait) land(false);
      if (paused) { S.playing = false; render(); }   /* the doc: paused, so the controls stay in view */
    }
  };
})();
