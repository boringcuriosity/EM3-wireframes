/* "All breathing exercises", variant z: Stacked deck.
   The seven as a deck of cards that slightly overlap in a sideways rail. Scrolling snaps a card to the gutter; the
   centre card sits on top at full size and its neighbours tuck in behind it, a touch smaller, so it reads like
   thumbing through a fanned deck. Cards alternate indigo and lavender washes, each with a drawn glyph, the name,
   the pattern, what it is good for and a Start button. A small pager under the deck says where you are.
   The deck follows the finger directly (no springs, no bounce); under reduced motion (?rm=1) it stays flat and still.
   A card opens the info sheet; Start opens the player. */
(function () {
  var CHEV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>';
  var PLAY = '<svg viewBox="0 0 24 24"><path d="M8 5.6v12.8a1 1 0 0 0 1.5.86l10.2-6.4a1 1 0 0 0 0-1.72L9.5 4.74A1 1 0 0 0 8 5.6z" fill="currentColor"/></svg>';
  var G = {
    coherent: '<path d="M2.5 12c2.4-4.6 4.8-4.6 7.2 0s4.8 4.6 7.2 0c1.3-2.4 2.6-3.1 4.6-2.4"/>',
    sleep: '<path d="M19.5 14.6A7.8 7.8 0 1 1 9.4 4.5a6.2 6.2 0 0 0 10.1 10.1z"/><path d="M17 3.5v3M15.5 5h3"/>',
    box: '<rect x="4.5" y="4.5" width="15" height="15" rx="3"/><circle cx="4.5" cy="12" r=".6" fill="currentColor"/>',
    exhale: '<path d="M3 16.5c1.4-6.5 2.8-9.5 4.4-9.5 2.4 0 4.2 9.5 13.6 9.5"/>',
    belly: '<path d="M4.5 8.5c0 6.5 3.3 10.5 7.5 10.5s7.5-4 7.5-10.5"/><path d="M8.5 8.5c0 3.8 1.6 6.3 3.5 6.3s3.5-2.5 3.5-6.3"/>',
    hum: '<path d="M4 10.5v3M7.2 8v8M10.4 5v14M13.6 8v8M16.8 9.5v5M20 11v2"/>',
    pursed: '<path d="M3 12c2.8-3 5.8-4 9-2.3 3.2-1.7 6.2-.7 9 2.3-2.8 3.2-5.8 4.6-9 4.6S5.8 15.2 3 12z"/><path d="M6.5 12.2c1.9.5 3.7.5 5.5 0 1.8.5 3.6.5 5.5 0"/>'
  };
  var glyph = function (k) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + G[k] + '</svg>'; };
  var nm = function (b) { return b.name.replace(/\s*\(.*\)$/, ""); };
  var fr = function (b) { return b.good.map(function (g) { return g === "Breathless" ? "breathlessness" : g === "Busy mind" ? "a busy mind" : g.toLowerCase(); }).join(" and "); };
  var W = 260, LAP = 60;   /* card width and how much each card tucks under the next */
  var RM = /[?&]rm=1/.test(location.search) || matchMedia("(prefers-reduced-motion: reduce)").matches;

  var css = document.createElement("style");
  css.textContent = [
    ".blz .sec{margin-bottom:4px}",
    ".blz-all{position:relative;display:inline-flex;align-items:center;gap:2px;height:32px;padding:0;border:0;background:none;font:600 14px/20px Roboto;color:var(--brand-600);cursor:pointer}",
    ".blz-all::after{content:'';position:absolute;inset:-6px -8px}.blz-all svg{width:18px;height:18px}",
    ".blz-intro{margin:0 0 8px;font:400 12px/16px Roboto;color:var(--g-500)}",
    /* the deck: the top card sits on the gutter, the rest fan out behind it to the right; the last card can still reach the gutter */
    ".blz-rail{position:relative;display:flex;align-items:stretch;margin:0 calc(var(--gut) * -1);padding:12px var(--gut) 16px;overflow-x:auto;scroll-snap-type:x mandatory;scroll-padding-left:var(--gut);scrollbar-width:none}",
    ".blz-rail::-webkit-scrollbar{display:none}",
    ".blz-c{--a:var(--in-50);--b:#fff;--ink:var(--in-700);--th:var(--in-100);position:relative;flex:0 0 " + W + "px;scroll-snap-align:start;display:flex;flex-direction:column;gap:8px;padding:16px;border-radius:var(--r-xl);border:1px solid var(--in-100);" +
      "text-align:left;color:var(--g-900);cursor:pointer;transform-origin:50% 100%;will-change:transform;" +
      "background:linear-gradient(160deg,var(--a) 0%,var(--b) 62%);box-shadow:2px 2px 0 var(--in-100),0 12px 24px -16px rgb(53 56 205 / .35)}",
    ".blz-c>*{opacity:calc(1 - var(--f,0) * .35)}",
    /* only the top card's Start is green; the ones behind wait in a quiet indigo until they come forward */
    ".blz-go{transition:background-color .3s var(--ease),color .3s var(--ease),box-shadow .3s var(--ease)}",
    ".blz-c.bk .blz-go{background:rgb(255 255 255 / .7);color:var(--ink);box-shadow:0 0 0 1px var(--th)}",
    ".blz-c.bk{box-shadow:2px 2px 0 var(--in-100)}",
    ".blz-c+.blz-c{margin-left:-" + LAP + "px}",
    ".blz-c.lav{--a:#EBE9FE;--b:#FAFAFF;--ink:#5925DC;--th:#D9D6FE;border-color:#E4E1FD;box-shadow:2px 2px 0 #E4E1FD,0 12px 24px -16px rgb(89 37 220 / .3)}",
    ".blz-top{display:flex;align-items:flex-start;justify-content:space-between;gap:8px}",
    ".blz-th{flex:none;width:48px;height:48px;border-radius:50%;display:grid;place-items:center;background:#fff;color:var(--ink);box-shadow:0 0 0 1px var(--th)}.blz-th svg{width:24px;height:24px}",
    ".blz-in{display:inline-flex;align-items:center;gap:4px;height:24px;padding:0 10px 0 8px;border-radius:var(--r-pill);background:rgb(255 255 255 / .85);box-shadow:0 0 0 1px var(--ok-100);font:500 12px/16px Roboto;color:var(--ok-600);white-space:nowrap}",
    ".blz-in::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--ok-500)}",
    ".blz-n{margin-top:8px;font:600 18px/24px Roboto;text-wrap:balance}",
    ".blz-p{font:500 14px/20px Roboto;color:var(--ink)}",
    ".blz-g{font:400 12px/16px Roboto;color:var(--g-500)}",
    ".blz-go{margin-top:auto;display:flex;align-items:center;justify-content:center;gap:6px;height:44px;border:0;border-radius:var(--r-sm);background:var(--brand-600);color:#fff;font:600 14px/20px Roboto;cursor:pointer;box-shadow:0 4px 0 var(--brand-700)}",
    ".blz-go svg{width:16px;height:16px}.blz-go:active{transform:translateY(2px);box-shadow:0 2px 0 var(--brand-700)}",
    ".blz-sp{height:8px}",
    /* pager */
    ".blz-dots{display:flex;justify-content:center;gap:6px;margin-top:4px}.blz-dots i{width:6px;height:6px;border-radius:3px;background:var(--g-200);transition:width .3s var(--ease),background-color .3s var(--ease)}",
    ".blz-dots i.on{width:18px;background:var(--in-500)}",
    /* See all */
    ".blz-r{display:flex;align-items:center;gap:12px;width:100%;min-height:64px;padding:8px 0;border:0;border-top:1px solid var(--g-100);background:none;text-align:left;font:inherit;color:var(--g-900);cursor:pointer}",
    ".blz-r:first-child{border-top:0}.blz-r .blz-th{width:40px;height:40px;background:var(--in-50);box-shadow:none;color:var(--in-600)}.blz-r .t{flex:1;min-width:0}.blz-r .tt{display:block;font:600 14px/20px Roboto}.blz-r .td{display:block;margin-top:2px;font:400 12px/18px Roboto;color:var(--g-500)}",
    ".blz-r .rt{display:inline-flex;align-items:center;gap:4px;font:500 12px/20px Roboto;color:var(--g-500)}.blz-r .rt svg{width:16px;height:16px;color:var(--g-400)}",
    ".blz-sl{margin:0 0 8px;font:400 14px/20px Roboto;color:var(--g-600)}"
  ].join("");
  document.head.appendChild(css);

  function card(b, B, i) {
    var mine = B.state === "plan" && b.inPlan;
    return '<div class="blz-c' + (i % 2 ? " lav" : "") + '" role="button" tabindex="0" data-blinfo="' + b.key + '" aria-label="' + b.name + ', ' + b.pat + ', ' + b.min + ' minutes' + (mine ? ', in your plan' : '') + '. How it works">' +
      '<div class="blz-top"><span class="blz-th">' + glyph(b.key) + '</span>' + (mine ? '<span class="blz-in">In your plan</span>' : "") + '</div>' +
      '<div class="blz-n">' + nm(b) + '</div><div class="blz-p">' + b.pat + '</div><div class="blz-g">For ' + fr(b) + '</div><div class="blz-sp"></div>' +
      '<button class="blz-go" data-blplay="' + b.key + '">' + PLAY + 'Start, ' + b.min + ' min</button></div>';
  }

  function all(B) {
    var html = '<p class="blz-sl">Tap one to see how it goes, or start it from there.</p><div>' + B.list.map(function (b) {
      var mine = B.state === "plan" && b.inPlan;
      return '<button class="blz-r" data-blinfo="' + b.key + '"><span class="blz-th">' + glyph(b.key) + '</span><span class="t"><span class="tt">' + nm(b) + '</span><span class="td">' + b.pat +
        (mine ? ' · <span style="color:var(--ok-600)">In your plan</span>' : "") + '</span></span><span class="rt">' + b.min + ' min' + CHEV + '</span></button>';
    }).join("") + '</div>';
    if (window.GFOpenSheet) window.GFOpenSheet("blzAll", "Breathing exercises", html);
  }

  /* the fan: the card nearest the gutter on top at full size, the others a step back, tucked towards it */
  function fan(rail, cards, dots) {
    var mid = rail.scrollLeft + parseFloat(getComputedStyle(rail).paddingLeft) + W / 2, step = W - LAP, best = 0, bd = 1e9;
    cards.forEach(function (c, i) {
      var d = (c.offsetLeft + W / 2 - mid) / step, a = Math.min(Math.abs(d), 2);
      if (Math.abs(d) < bd) { bd = Math.abs(d); best = i; }
      c.style.zIndex = 20 - Math.round(a * 5); c.style.setProperty("--f", Math.min(a, 1).toFixed(2)); c.classList.toggle("bk", a > .5);
      c.style.opacity = d < 0 ? (1 - Math.min(a, 1)).toFixed(2) : "";   /* cards already passed lift off the deck, so nothing peeks in the left gutter */
      if (!RM) c.style.transform = "translateX(" + (-Math.sign(d) * a * 10).toFixed(1) + "px) scale(" + (1 - a * .06).toFixed(3) + ")";
    });
    dots.forEach(function (x, i) { x.classList.toggle("on", i === best); });
  }

  BLIB.add("z", {
    render: function (host, B) {
      host.className = "gut sect blz";
      var intro = B.state === "noplan" ? "Use any of these while your coach sets up your plan."
        : B.state === "free" ? "Swipe through and start one whenever you need a pause."
        : "Swipe through and start any of them, in your plan or not.";
      host.innerHTML = '<div class="sec"><h2>Breathing exercises</h2><button class="blz-all">See all ' + B.list.length + CHEV + '</button></div>' +
        '<p class="blz-intro">' + intro + '</p><div class="blz-rail">' + B.list.map(function (b, i) { return card(b, B, i); }).join("") + '</div>' +
        '<div class="blz-dots" aria-hidden="true">' + B.list.map(function () { return "<i></i>"; }).join("") + '</div>';
      var rail = host.querySelector(".blz-rail"), cards = [].slice.call(rail.children), dots = [].slice.call(host.querySelectorAll(".blz-dots i")), q = 0;
      /* the end padding lets the last card reach the gutter (a % here would read the section's width, not the rail's) */
      var go = function () { q = 0; rail.style.paddingRight = Math.max(16, rail.clientWidth - W - parseFloat(getComputedStyle(rail).paddingLeft)) + "px"; fan(rail, cards, dots); };
      rail.addEventListener("scroll", function () { if (!q) q = requestAnimationFrame(go); }, { passive: true });
      addEventListener("resize", go);
      requestAnimationFrame(go); go();
      host.querySelector(".blz-all").onclick = function (e) { e.stopPropagation(); all(B); };
      host.addEventListener("keydown", function (e) { if ((e.key === "Enter" || e.key === " ") && e.target.classList.contains("blz-c")) { e.preventDefault(); e.target.click(); } });
      if (/[?&]lall=1/.test(location.search)) all(B);
    }
  });
})();
