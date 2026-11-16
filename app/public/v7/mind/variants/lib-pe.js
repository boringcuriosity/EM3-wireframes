/* "All breathing exercises", variant pe: Line rosettes (after Breathwrk's "Perfect Breath").
   A rail of night cards, deep indigo going to slate. Each card holds one still, thin-line rosette drawn from circles,
   its own geometry per exercise (six petals for Simple, four round a diamond for Box, long petals for Extended Exhale,
   a ring of small circles for the hum), lit softly in the colour of what it is good for. Below: a small need tag
   (SLEEP, FOCUS, CALM, BREATHE EASIER), the name, the pattern, minutes and a round play button.
   The card opens the info sheet; the play button starts it. Nothing moves. */
(function () {
  var CHEV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>';
  var PLAY = '<svg viewBox="0 0 24 24"><path d="M8 5.6v12.8a1 1 0 0 0 1.5.86l10.2-6.4a1 1 0 0 0 0-1.72L9.5 4.74A1 1 0 0 0 8 5.6z" fill="currentColor"/></svg>';
  var nm = function (b) { return b.name.replace(/\s*\(.*\)$/, ""); };
  /* what each one is mostly for, and that need's light */
  var NEED = { coherent: "calm", sleep: "sleep", box: "focus", exhale: "calm", belly: "calm", hum: "sleep", pursed: "easier" };
  var LBL = { calm: "Calm", sleep: "Sleep", focus: "Focus", easier: "Breathe easier" };
  var HUE = { calm: "#6CE9A6", sleep: "#A4BCFD", focus: "#7CD4FD", easier: "#C3B5FD" };

  /* the rosettes, in a 120 box centred on 0 0 */
  function ring(n, r, d, a0) { var s = ""; for (var i = 0; i < n; i++) { var a = (a0 || 0) + i * 2 * Math.PI / n; s += '<circle cx="' + (d * Math.sin(a)).toFixed(2) + '" cy="' + (-d * Math.cos(a)).toFixed(2) + '" r="' + r + '"/>'; } return s; }
  function circ(r) { return '<circle r="' + r + '"/>'; }
  var ROS = {
    coherent: function () { return circ(22) + ring(6, 22, 22) + circ(44); },                                     /* six petals, even */
    sleep: function () { return ring(8, 18, 24, Math.PI / 8) + circ(12) + circ(42) + circ(50); },               /* eight, settled inside two rings */
    box: function () { return ring(4, 24, 24) + '<path d="M0-24 24 0 0 24-24 0Z"/><rect x="-48" y="-48" width="96" height="96" rx="2"/>'; }, /* four round a diamond, in a square */
    exhale: function () { var s = ""; for (var i = 0; i < 8; i++) s += '<ellipse cy="-27" rx="9" ry="23" transform="rotate(' + i * 45 + ')"/>'; return s + circ(10) + circ(52); }, /* long petals, a long out */
    belly: function () { return ring(5, 22, 20) + circ(34) + circ(46); },                                       /* five, soft and round */
    hum: function () { return ring(12, 12, 36) + circ(18) + circ(24) + circ(50); },                             /* a ring of small circles, like a hum */
    pursed: function () { var s = ""; for (var i = 0; i < 5; i++) s += '<ellipse cy="-22" rx="12" ry="15" transform="rotate(' + i * 72 + ')"/>'; return s + circ(7) + circ(44) + circ(50); } /* five short, round petals */
  };
  var uid = 0;
  function rosette(k, size) {
    var c = HUE[NEED[k]], id = "blpeG" + (++uid);
    return '<svg class="blpe-ros" width="' + size + '" height="' + size + '" viewBox="-60 -60 120 120" aria-hidden="true"><defs><linearGradient id="' + id + '" x1="0" y1="-1" x2="0" y2="1" gradientUnits="objectBoundingBox">' +
      '<stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="' + c + '"/></linearGradient></defs>' +
      '<g fill="none" stroke="url(#' + id + ')" stroke-width="' + ((size < 60 ? 1 : .9) * 120 / size).toFixed(2) + '">' + ROS[k]() + '</g></svg>';
  }

  var css = document.createElement("style");
  css.textContent = [
    ".blpe-hd{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 0 4px}.blpe-hd h2{margin:0}",
    ".blpe-all{position:relative;display:inline-flex;align-items:center;gap:2px;height:32px;padding:0;border:0;background:none;font:600 14px/20px Roboto;color:var(--brand-600);cursor:pointer}",
    ".blpe-all::after{content:'';position:absolute;inset:-6px -8px}.blpe-all svg{width:18px;height:18px}",
    ".blpe-intro{margin:0 0 12px;font:400 12px/16px Roboto;color:var(--g-500)}",
    ".blpe-rail{display:flex;gap:12px;margin:0 calc(var(--gut) * -1);padding:4px var(--gut) 8px;overflow-x:auto;scroll-snap-type:x mandatory;scroll-padding:0 var(--gut);scrollbar-width:none}",
    ".blpe-rail::-webkit-scrollbar{display:none}",
    /* the night card */
    ".blpe-t{position:relative;isolation:isolate;overflow:hidden;flex:0 0 208px;height:280px;scroll-snap-align:start;display:flex;flex-direction:column;border-radius:var(--r-xl);cursor:pointer;text-align:left;color:#fff;" +
      "background:radial-gradient(90% 60% at 50% 30%,#2B3170 0%,#1A1E47 58%,#12152F 100%);box-shadow:inset 0 0 0 1px rgb(255 255 255 / .06);transition:transform .18s var(--ease)}",
    ".blpe-t:active{transform:scale(.985)}",
    /* the need's light behind the rosette */
    ".blpe-t::before{content:'';position:absolute;z-index:-1;left:50%;top:76px;width:150px;height:150px;margin:-75px 0 0 -75px;border-radius:50%;background:var(--hue);opacity:.16;filter:blur(36px)}",
    ".blpe-art{height:152px;display:grid;place-items:center;padding-top:12px}",
    ".blpe-ros{display:block;overflow:visible;filter:drop-shadow(0 0 3px var(--hue)) drop-shadow(0 0 10px rgb(255 255 255 / .12))}",
    ".blpe-b{flex:1;display:flex;flex-direction:column;align-items:flex-start;padding:0 16px 16px}",
    ".blpe-tag{display:inline-flex;align-items:center;height:20px;padding:0 8px;border-radius:var(--r-pill);font:600 10px/12px Roboto;letter-spacing:1px;text-transform:uppercase;color:var(--hue);background:color-mix(in srgb,var(--hue) 16%,transparent)}",
    ".blpe-n{margin-top:8px;font:600 16px/22px Roboto;white-space:nowrap;letter-spacing:.15px}",
    ".blpe-p{font:400 12px/16px Roboto;color:rgb(255 255 255 / .62)}",
    ".blpe-f{margin-top:auto;width:100%;display:flex;align-items:center;justify-content:space-between;gap:8px}",
    ".blpe-mn{font:500 12px/16px Roboto;color:rgb(255 255 255 / .8);font-variant-numeric:tabular-nums}",
    ".blpe-go{position:relative;flex:none;width:40px;height:40px;border-radius:50%;border:1px solid rgb(255 255 255 / .32);background:rgb(255 255 255 / .06);color:#fff;display:grid;place-items:center;padding:0;cursor:pointer;transition:background .18s var(--ease)}",
    ".blpe-go::after{content:'';position:absolute;inset:-4px}.blpe-go svg{width:16px;height:16px;margin-left:2px}.blpe-go:active{background:rgb(255 255 255 / .16)}",
    ".blpe-tags{display:flex;align-items:center;gap:8px}",
    ".blpe-in{display:inline-flex;align-items:center;gap:4px;height:20px;padding:0 8px;border-radius:var(--r-pill);background:rgb(255 255 255 / .1);font:500 11px/12px Roboto;color:#fff;white-space:nowrap}",
    ".blpe-in::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--ok-300)}",
    /* See all: rows with the rosette on a small night tile */
    ".blpe-ls{display:flex;flex-direction:column}.blpe-r{display:flex;align-items:center;gap:12px;width:100%;min-height:72px;padding:12px 0;border:0;border-top:1px solid var(--g-100);background:none;text-align:left;font:inherit;color:var(--g-900);cursor:pointer}",
    ".blpe-r:first-child{border-top:0}.blpe-r .th{flex:none;width:48px;height:48px;border-radius:var(--r-md);display:grid;place-items:center;background:radial-gradient(circle at 50% 45%,#2B3170,#141733)}",
    ".blpe-r .t{flex:1;min-width:0}.blpe-r .tt{display:block;font:600 14px/20px Roboto}.blpe-r .td{display:block;margin-top:2px;font:400 12px/16px Roboto;color:var(--g-500)}",
    ".blpe-r .rt{display:inline-flex;align-items:center;gap:4px;font:400 12px/16px Roboto;color:var(--g-500)}.blpe-r .rt svg{width:16px;height:16px;color:var(--g-400)}",
    ".blpe-sl{margin:0 0 8px;font:400 14px/20px Roboto;color:var(--g-600)}"
  ].join("");
  document.head.appendChild(css);

  function tile(b, B) {
    var t = document.createElement("div"), need = NEED[b.key];
    t.className = "blpe-t"; t.setAttribute("role", "button"); t.tabIndex = 0;
    t.setAttribute("data-blinfo", b.key); t.style.setProperty("--hue", HUE[need]);
    t.setAttribute("aria-label", b.name + ", good for " + LBL[need].toLowerCase() + ", " + b.pat + ", " + b.min + " minutes. How it works");
    t.innerHTML = '<div class="blpe-art">' + rosette(b.key, 120) + '</div>' +
      '<div class="blpe-b"><span class="blpe-tags"><span class="blpe-tag">' + LBL[need] + '</span>' + (B.state === "plan" && b.inPlan ? '<span class="blpe-in">In your plan</span>' : "") + '</span><div class="blpe-n">' + nm(b) + '</div><div class="blpe-p">' + b.pat + '</div>' +
      '<div class="blpe-f"><span class="blpe-mn">' + b.min + ' min</span><button class="blpe-go" data-blplay="' + b.key + '" aria-label="Start ' + b.name + '">' + PLAY + '</button></div></div>';
    return t;
  }

  function all(B) {
    var html = '<p class="blpe-sl">Tap one to see how it goes, or start it from there.</p><div class="blpe-ls">' + B.list.map(function (b) {
      return '<button class="blpe-r" data-blinfo="' + b.key + '" style="--hue:' + HUE[NEED[b.key]] + '"><span class="th">' + rosette(b.key, 36) + '</span><span class="t"><span class="tt">' + nm(b) + '</span><span class="td">' + b.pat +
        (B.state === "plan" && b.inPlan ? ' · <span style="color:var(--ok-600)">In your plan</span>' : "") + '</span></span><span class="rt">' + b.min + ' min' + CHEV + '</span></button>';
    }).join("") + '</div>';
    if (window.GFOpenSheet) window.GFOpenSheet("blpeAll", "Breathing exercises", html);
  }

  BLIB.add("pe", {
    render: function (host, B) {
      host.className = "gut sect";
      var intro = B.state === "noplan" ? "Use any of these while your coach sets up your plan."
        : B.state === "free" ? "Start one whenever you need a pause."
        : "Start one whenever you need a pause, in your plan or not.";
      host.innerHTML = '<div class="blpe-hd"><h2 class="gf-h">Breathing exercises</h2><button class="blpe-all">See all ' + B.list.length + CHEV + '</button></div>' +
        '<p class="blpe-intro">' + intro + '</p><div class="blpe-rail"></div>';
      var rail = host.querySelector(".blpe-rail");
      B.list.forEach(function (b) { rail.appendChild(tile(b, B)); });
      host.querySelector(".blpe-all").onclick = function (e) { e.stopPropagation(); all(B); };
      host.addEventListener("keydown", function (e) { if ((e.key === "Enter" || e.key === " ") && e.target.classList.contains("blpe-t")) { e.preventDefault(); e.target.click(); } });
      if (/[?&]lall=1/.test(location.search)) all(B);
    }
  });
})();
