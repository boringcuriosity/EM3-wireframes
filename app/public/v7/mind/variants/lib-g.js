/* All breathing exercises, variant g: "One stage, swipe". One large live stage shows the exercise in view playing at
   its real pace. Swipe the stage (a CSS scroll-snap carousel) or tap a name pill to move through the seven.
   Under the stage: the name, the pattern, what it is good for, one Start button and a "How it works" chip.
   The pill row and the words follow the slide in view; nothing else on the card changes. */
(function () {
  var INFO = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>';
  var PLAY = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg>';
  var INTRO = {
    plan: "Swipe to find one that suits you. Any of them, any time.",
    noplan: "Swipe to find one that suits you while your coach sets up your plan.",
    free: "Swipe to find one that suits you. Any of them, any time."
  };
  var E = "cubic-bezier(.4,0,.2,1)";
  var css = document.createElement("style");
  css.textContent =
    ".blg-in{font:400 14px/20px Roboto,sans-serif;color:#667085;margin:-8px 0 16px}" +
    ".blg-c{border-radius:24px;border:1px solid transparent;box-shadow:2px 2px 0 #E4E7EC;overflow:hidden;" +
      "background:linear-gradient(180deg,#FFFBEE 0%,#FFFDF5 44%,#FFF 70%) padding-box,conic-gradient(from 0deg,#E7C144 0deg,#E4E7EC 43deg,#E4E7EC 317deg,#E7C144 360deg) border-box}" +
    /* the name pills: a quiet scroll row, the one in view filled */
    ".blg-pills{display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;padding:16px 16px 4px;scroll-padding:0 16px;-webkit-mask-image:linear-gradient(90deg,transparent,#000 16px,#000 calc(100% - 16px),transparent);mask-image:linear-gradient(90deg,transparent,#000 16px,#000 calc(100% - 16px),transparent)}.blg-pills::-webkit-scrollbar{display:none}" +
    ".blg-pill{flex:none;height:32px;padding:0 12px;border-radius:999px;border:1px solid #F2E3B0;background:rgba(255,255,255,.8);font:500 13px/30px Roboto,sans-serif;color:#5C4E1F;cursor:pointer;position:relative;" +
      "transition:background .2s " + E + ",border-color .2s " + E + ",color .2s " + E + "}" +
    ".blg-pill::after{content:'';position:absolute;left:0;right:0;top:-6px;bottom:-6px}" +
    ".blg-pill.on{background:#5C4E1F;border-color:#5C4E1F;color:#fff}" +
    /* the stage: one slide per exercise, snapping, the live visual in the middle */
    ".blg-st{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;scroll-behavior:smooth;overscroll-behavior-x:contain}.blg-st::-webkit-scrollbar{display:none}" +
    ".blg-sl{flex:0 0 100%;scroll-snap-align:center;scroll-snap-stop:always;display:grid;place-items:center;padding:12px 0 4px;cursor:pointer}" +
    ".blg-sl .bl-mini{background:transparent}" +
    ".blg-dots{display:flex;justify-content:center;gap:6px;padding:4px 0 0}" +
    ".blg-dots i{width:6px;height:6px;border-radius:3px;background:#FEF1C7;transition:width .3s " + E + ",background .3s " + E + "}.blg-dots i.on{width:18px;background:#CDA935}" +
    /* the words for the one in view */
    ".blg-tx{padding:16px 16px 0;text-align:center;transition:opacity .2s " + E + "}.blg-tx.fade{opacity:0}" +
    ".blg-n{font:600 20px/26px Roboto,sans-serif;color:#101828}" +
    ".blg-p{font:500 14px/20px Roboto,sans-serif;color:#A68A2D;margin-top:4px}" +
    ".blg-l{font:400 14px/20px Roboto,sans-serif;color:#667085;margin:8px auto 0;max-width:300px;min-height:60px}" +
    ".blg-tag{display:inline-block;vertical-align:2px;margin-left:6px;font:500 11px/16px Roboto,sans-serif;color:#2A805A;background:#E6FAF1;border:1px solid #CBF0E0;border-radius:8px;padding:1px 6px}" +
    ".blg-ac{display:flex;flex-direction:column;align-items:center;gap:4px;padding:16px 16px 12px}" +
    ".blg-go{width:100%;height:48px;border:0;border-radius:8px;background:#299D6B;color:#fff;font:600 15px Roboto,sans-serif;display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;box-shadow:0 3px 0 #2A805A}" +
    ".blg-go:active{transform:translateY(2px);box-shadow:0 1px 0 #2A805A}" +
    ".blg-info{height:44px;display:inline-flex;align-items:center;gap:6px;border:0;background:none;font:500 13px Roboto,sans-serif;color:#475467;cursor:pointer;padding:0 8px}";
  document.head.appendChild(css);

  function nm(b) { return b.name.replace(/\s*\([0-9][0-9:-]*\)$/, ""); }

  BLIB.add("g", {
    render: function (host, B) {
      host.className = "gut";
      var plan = B.state === "plan", L = B.list, cur = -1;
      host.innerHTML = '<div class="sec"><h2>All breathing exercises</h2><span>7 to try</span></div><p class="blg-in">' + INTRO[B.state] + '</p>' +
        '<div class="blg-c"><div class="blg-pills" role="tablist">' + L.map(function (b, i) {
          return '<button class="blg-pill" role="tab" data-i="' + i + '">' + b.short + '</button>'; }).join("") + '</div>' +
        '<div class="blg-st" aria-roledescription="carousel"></div><div class="blg-dots">' + L.map(function () { return "<i></i>"; }).join("") + '</div>' +
        '<div class="blg-tx" aria-live="polite"><div class="blg-n"></div><div class="blg-p"></div><div class="blg-l"></div></div>' +
        '<div class="blg-ac"><button class="blg-go"></button><button class="blg-info">' + INFO + 'How it works</button></div></div>';
      var st = host.querySelector(".blg-st"), pills = host.querySelectorAll(".blg-pill"), dots = host.querySelectorAll(".blg-dots i"),
        tx = host.querySelector(".blg-tx"), go = host.querySelector(".blg-go"), info = host.querySelector(".blg-info");
      L.forEach(function (b) {
        var s = document.createElement("div"); s.className = "blg-sl"; s.setAttribute("data-blinfo", b.key);
        s.setAttribute("aria-label", b.name + ", tap for how it works");
        s.appendChild(B.mini(b.key, 240)); st.appendChild(s);
      });
      function show(i) {
        if (i === cur) return;
        var first = cur < 0; cur = i; var b = L[i];
        pills.forEach(function (p, j) { p.classList.toggle("on", j === i); p.setAttribute("aria-selected", j === i); });
        dots.forEach(function (d, j) { d.classList.toggle("on", j === i); });
        var p = pills[i], row = p.parentNode, x = p.offsetLeft - (row.clientWidth - p.offsetWidth) / 2;
        if (!first) row.scrollTo({ left: x, behavior: "smooth" }); else row.scrollLeft = x;
        function fill() {
          tx.querySelector(".blg-n").innerHTML = nm(b) + (plan && b.inPlan ? '<span class="blg-tag">In your plan</span>' : "");
          tx.querySelector(".blg-p").textContent = b.pat;
          tx.querySelector(".blg-l").textContent = b.line;
          go.setAttribute("data-blplay", b.key); go.innerHTML = PLAY + "Start, " + b.min + " min"; go.setAttribute("aria-label", "Start " + b.name + ", " + b.min + " minutes");
          info.setAttribute("data-blinfo", b.key);
          tx.classList.remove("fade");
        }
        if (first) fill(); else { tx.classList.add("fade"); setTimeout(fill, 160); }
      }
      pills.forEach(function (p) { p.onclick = function () { var i = +p.dataset.i; st.scrollTo({ left: i * st.clientWidth }); show(i); }; });
      var raf = 0;
      st.addEventListener("scroll", function () {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () { show(Math.max(0, Math.min(L.length - 1, Math.round(st.scrollLeft / st.clientWidth)))); });
      }, { passive: true });
      /* open on the first one in the plan, else Simple */
      var start = 0; if (plan) L.some(function (b, i) { if (b.inPlan) { start = i; return true; } });
      show(start); requestAnimationFrame(function () { st.style.scrollBehavior = "auto"; st.scrollLeft = start * st.clientWidth; st.style.scrollBehavior = ""; });
    }
  });
})();
