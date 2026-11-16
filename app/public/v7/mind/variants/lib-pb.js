/* "All breathing exercises", variant pb: Glass method chips (from TIDE).
   One soft indigo grey field, a few colour glows blurred inside it so glass can read, and a rail of compact glass chips
   on it: a small line icon, the name, a quiet "5 min · Calm". Tapping a chip picks it (white outline); under the rail
   the picked one's pattern, "How it works" (the info sheet) and one white Start pill. So the card is a picker and the
   field has a single primary action, as on TIDE. See all opens the list. */
(function () {
  var CHEV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>';
  var INFO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><circle cx="12" cy="7.8" r=".6" fill="currentColor"/></svg>';
  var nm = function (b) { return b.name.replace(/\s*\(.*\)$/, ""); };
  /* small line glyphs, 24 grid, drawn to sit optically centred */
  var ICON = {
    coherent: '<path d="M2.5 12c1.6 0 2.4-4.5 4.75-4.5S10.4 16.5 12 16.5s2.4-9 4.75-9S20 12 21.5 12"/>',
    sleep: '<path d="M19 14.6A7.5 7.5 0 0 1 9.4 5a7.5 7.5 0 1 0 9.6 9.6z"/>',
    box: '<rect x="5.5" y="5.5" width="13" height="13" rx="2.5"/>',
    exhale: '<path d="M3 17c1.8 0 2.6-9 4.5-9s4.5 9 13.5 9"/>',
    belly: '<path d="M4 18.5h16"/><path d="M5.5 18.5c0-5.5 3-9 6.5-9s6.5 3.5 6.5 9"/><circle cx="12" cy="15" r=".9" fill="currentColor" stroke="none"/>',
    hum: '<circle cx="7.5" cy="12" r="2.2"/><path d="M12.5 8.5a5 5 0 0 1 0 7"/><path d="M15.8 5.8a9 9 0 0 1 0 12.4"/>',
    pursed: '<path d="M3.5 12c2.2-2.6 4.6-3.6 6.3-2.6.8.5 1.6.5 2.4 0 1.7-1 4.1 0 6.3 2.6-2.4 2.4-4.9 3.6-7.5 3.6S5.9 14.4 3.5 12z"/><path d="M6.5 12h11"/>'
  };
  var ico = function (k) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICON[k] + '</svg>'; };

  var css = document.createElement("style");
  css.textContent = [
    ".blpb-hd{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 0 4px}.blpb-hd h2{margin:0}",
    ".blpb-all{position:relative;display:inline-flex;align-items:center;gap:2px;height:32px;padding:0;border:0;background:none;font:600 14px/20px Roboto;color:var(--brand-600);cursor:pointer}",
    ".blpb-all::after{content:'';position:absolute;inset:-6px -8px}.blpb-all svg{width:18px;height:18px}",
    ".blpb-intro{margin:0 0 12px;font:400 12px/16px Roboto;color:var(--g-500)}",
    /* the field: indigo grey with blurred glows, so the glass has something to frost */
    ".blpb-f{position:relative;isolation:isolate;overflow:hidden;display:flex;flex-direction:column;gap:12px;padding:16px;border-radius:var(--r-xl);color:#23263D;" +
      "background:radial-gradient(60% 55% at 12% 18%,#CFC8F3 0%,transparent 70%),radial-gradient(50% 60% at 92% 30%,#F2D6CB 0%,transparent 72%),radial-gradient(70% 60% at 60% 110%,#BCCBF2 0%,transparent 70%),linear-gradient(160deg,#E4E5EF,#D6D9E7)}",
    ".blpb-lb{font:500 12px/16px Roboto;letter-spacing:.2px;color:#5D627A}",
    ".blpb-rail{display:flex;gap:8px;margin:0 -16px;padding:2px 16px;overflow-x:auto;scroll-snap-type:x mandatory;scroll-padding:0 16px;scrollbar-width:none}",
    ".blpb-rail::-webkit-scrollbar{display:none}",
    /* the glass chip */
    ".blpb-c{position:relative;flex:0 0 132px;height:112px;scroll-snap-align:start;display:flex;flex-direction:column;justify-content:space-between;padding:12px;border-radius:var(--r-lg);cursor:pointer;text-align:left;font:inherit;color:inherit;" +
      "background:rgb(255 255 255 / .3);-webkit-backdrop-filter:blur(14px) saturate(1.2);backdrop-filter:blur(14px) saturate(1.2);border:1px solid rgb(255 255 255 / .5);" +
      "box-shadow:inset 0 1px 0 rgb(255 255 255 / .55),0 1px 2px rgb(35 38 61 / .05);transition:background .2s var(--ease),border-color .2s var(--ease),box-shadow .2s var(--ease)}",
    ".blpb-c[aria-pressed=true]{background:rgb(255 255 255 / .58);border-color:#fff;box-shadow:inset 0 0 0 1px #fff,0 4px 12px -4px rgb(35 38 61 / .16)}",
    ".blpb-c:focus-visible{outline:2px solid var(--in-600);outline-offset:2px}",
    ".blpb-ct{display:flex;align-items:center;justify-content:space-between;gap:8px;height:20px}.blpb-c svg{width:24px;height:24px;margin:-2px 0 -2px -2px;flex:none;color:#3A3F63}",
    ".blpb-in{display:inline-flex;align-items:center;gap:4px;font:500 11px/16px Roboto;color:#3A3F63;white-space:nowrap}.blpb-in::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--ok-500)}",
    ".blpb-n{display:block;font:600 14px/20px Roboto;text-wrap:balance}.blpb-s{display:block;margin-top:2px;font:400 12px/16px Roboto;color:#5D627A;white-space:nowrap}",
    /* the picked one: its pattern, How it works, Start */
    ".blpb-ft{display:flex;align-items:center;justify-content:space-between;gap:8px;min-height:44px}",
    ".blpb-p{font:500 14px/20px Roboto;color:#23263D;font-variant-numeric:tabular-nums}",
    ".blpb-hw{display:inline-flex;align-items:center;gap:4px;height:44px;margin-right:-8px;padding:0 8px;border:0;background:none;border-radius:var(--r-sm);font:500 13px/20px Roboto;color:#3A3F63;cursor:pointer;white-space:nowrap}.blpb-hw svg{width:18px;height:18px}",
    ".blpb-go{height:48px;border:0;border-radius:var(--r-pill);background:rgb(255 255 255 / .9);box-shadow:0 1px 2px rgb(35 38 61 / .08),inset 0 0 0 1px #fff;font:600 15px/20px Roboto;color:#23263D;cursor:pointer;transition:background .2s var(--ease)}",
    ".blpb-go:active{background:#fff}",
    /* See all: the same glyph in a soft indigo square */
    ".blpb-ls{display:flex;flex-direction:column}.blpb-r{display:flex;align-items:center;gap:12px;width:100%;min-height:64px;padding:8px 0;border:0;border-top:1px solid var(--g-100);background:none;text-align:left;font:inherit;color:var(--g-900);cursor:pointer}",
    ".blpb-r:first-child{border-top:0}.blpb-r .th{flex:none;width:40px;height:40px;border-radius:var(--r-md);display:grid;place-items:center;background:linear-gradient(160deg,#ECEDF5,#DFE2EE);color:#3A3F63}.blpb-r .th svg{width:20px;height:20px}",
    ".blpb-r .t{flex:1;min-width:0}.blpb-r .tt{display:block;font:600 14px/20px Roboto}.blpb-r .td{display:block;margin-top:2px;font:400 12px/16px Roboto;color:var(--g-500)}",
    ".blpb-r .rt{display:inline-flex;align-items:center;gap:4px;font:400 12px/16px Roboto;color:var(--g-500)}.blpb-r .rt svg{width:16px;height:16px;color:var(--g-400)}",
    ".blpb-sl{margin:0 0 8px;font:400 14px/20px Roboto;color:var(--g-600)}"
  ].join("");
  document.head.appendChild(css);

  function all(B) {
    var html = '<p class="blpb-sl">Tap one to see how it goes, or start it from there.</p><div class="blpb-ls">' + B.list.map(function (b) {
      return '<button class="blpb-r" data-blinfo="' + b.key + '"><span class="th">' + ico(b.key) + '</span><span class="t"><span class="tt">' + nm(b) + '</span><span class="td">' + b.pat +
        (B.state === "plan" && b.inPlan ? ' · <span style="color:var(--ok-600)">In your plan</span>' : "") + '</span></span><span class="rt">' + b.min + ' min' + CHEV + '</span></button>';
    }).join("") + '</div>';
    if (window.GFOpenSheet) window.GFOpenSheet("blpbAll", "Breathing exercises", html);
  }

  BLIB.add("pb", {
    render: function (host, B) {
      host.className = "gut sect";
      var intro = B.state === "noplan" ? "Use any of these while your coach sets up your plan."
        : B.state === "free" ? "Pick one whenever you need a pause."
        : "Pick any one, in your plan or not.";
      var first = (B.state === "plan" && B.list.filter(function (b) { return b.inPlan; })[0]) || B.list[0];
      host.innerHTML = '<div class="blpb-hd"><h2 class="gf-h">Breathing exercises</h2><button class="blpb-all">See all ' + B.list.length + CHEV + '</button></div>' +
        '<p class="blpb-intro">' + intro + '</p>' +
        '<div class="blpb-f"><span class="blpb-lb" id="blpbLb">Breathing method</span><div class="blpb-rail" role="radiogroup" aria-labelledby="blpbLb">' + B.list.map(function (b) {
          return '<button class="blpb-c" role="radio" aria-pressed="false" aria-checked="false" data-k="' + b.key + '" aria-label="' + nm(b) + ', ' + b.min + ' minutes, ' + b.good[0].toLowerCase() + (B.state === "plan" && b.inPlan ? ', in your plan' : '') + '">' +
            '<span class="blpb-ct">' + ico(b.key) + (B.state === "plan" && b.inPlan ? '<span class="blpb-in">In your plan</span>' : "") + '</span>' +
            '<span><span class="blpb-n">' + nm(b) + '</span><span class="blpb-s">' + b.min + ' min · ' + b.good[0] + '</span></span></button>';
        }).join("") + '</div>' +
        '<div><div class="blpb-ft"><span class="blpb-p"></span><button class="blpb-hw">' + INFO + 'How it works</button></div></div>' +
        '<button class="blpb-go">Start</button></div>';
      var p = host.querySelector(".blpb-p"), hw = host.querySelector(".blpb-hw"), go = host.querySelector(".blpb-go");
      function pick(k) {
        var b = B.get(k);
        host.querySelectorAll(".blpb-c").forEach(function (c) { var on = c.dataset.k === k; c.setAttribute("aria-pressed", on); c.setAttribute("aria-checked", on); });
        p.textContent = b.pat; hw.setAttribute("data-blinfo", k); go.setAttribute("data-blplay", k);
        go.setAttribute("aria-label", "Start " + nm(b) + ", " + b.min + " minutes");
      }
      host.querySelector(".blpb-rail").addEventListener("click", function (e) { var c = e.target.closest(".blpb-c"); if (c) pick(c.dataset.k); });
      pick(first.key);
      host.querySelector(".blpb-all").onclick = function (e) { e.stopPropagation(); all(B); };
      if (/[?&]lall=1/.test(location.search)) all(B);
    }
  });
})();
