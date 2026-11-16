/* "All breathing exercises", variant o: Colour by need.
   Each card's colour says what it is for, so people find the right one without reading every name:
   Calm = mint, Focus = lavender, Sleep = deep indigo (white type), Breathe easier = sky. The rail runs in that order,
   calm to focus to sleep, then breathe easier at the end. A small need chip with its own glyph tops each card; name,
   pattern and minutes below (the pattern keeps two lines so names line up); a round play button starts it. The card opens the info sheet; "See all" groups all 7 by need. */
(function () {
  var CHEV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>';
  var PLAY = '<svg viewBox="0 0 24 24"><path d="M8 5.6v12.8a1 1 0 0 0 1.5.86l10.2-6.4a1 1 0 0 0 0-1.72L9.5 4.74A1 1 0 0 0 8 5.6z" fill="currentColor"/></svg>';
  var INFO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5.5"/><path d="M12 7.6v.1" stroke-width="2.4"/></svg>';
  var S = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';
  /* the needs, in rail order, each with its glyph (drawn here, 24 grid, 1.8 stroke) */
  var NEEDS = [
    { id: "calm", label: "Calm", keys: ["exhale", "belly"], g: '<svg ' + S + '><path d="M3 10c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/><path d="M3 15c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/></svg>' },
    { id: "focus", label: "Focus", keys: ["coherent", "box"], g: '<svg ' + S + '><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.5"/></svg>' },
    { id: "sleep", label: "Sleep", keys: ["sleep", "hum"], g: '<svg ' + S + '><path d="M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10Z"/></svg>' },
    { id: "easy", label: "Breathe easier", keys: ["pursed"], g: '<svg ' + S + '><path d="M3 9h11a3 3 0 1 0-3-3"/><path d="M3 14h15a3 3 0 1 1-3 3"/></svg>' }
  ];
  var nm = function (b) { return b.name.replace(/\s*\(.*\)$/, ""); };

  var css = document.createElement("style");
  css.textContent = [
    ".blo-hd{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 0 4px}",
    ".blo-hd h2{margin:0;font:400 14px/16.8px Roboto;letter-spacing:.25px;color:var(--g-900)}",
    ".blo-all{position:relative;display:inline-flex;align-items:center;gap:2px;height:32px;padding:0;border:0;background:none;font:600 14px/20px Roboto;color:var(--brand-600);cursor:pointer}",
    ".blo-all::after{content:'';position:absolute;inset:-6px -8px}.blo-all svg{width:18px;height:18px}",
    ".blo-intro{margin:0 0 12px;font:400 12px/16px Roboto;color:var(--g-500)}",
    ".blo-rail{display:flex;gap:12px;margin:0 calc(var(--gut) * -1);padding:4px var(--gut) 8px;overflow-x:auto;scroll-snap-type:x mandatory;scroll-padding:0 var(--gut);scrollbar-width:none}",
    ".blo-rail::-webkit-scrollbar{display:none}",
    /* the palette per need: card wash, ink, chip, play */
    ".blo-calm{--bg:linear-gradient(160deg,#F1FBF6 0%,#DDF2E7 100%);--ink:#1D4D38;--sub:#3F6B57;--chip:rgb(255 255 255 / .7);--cink:#246649;--bd:#C3E6D3;--pl:#246649;--plc:#fff}",
    ".blo-focus{--bg:linear-gradient(160deg,#F8F3FF 0%,#ECE2FD 100%);--ink:#3E1C96;--sub:#5B4596;--chip:rgb(255 255 255 / .7);--cink:#5925DC;--bd:#DDD0FB;--pl:#5925DC;--plc:#fff}",
    ".blo-sleep{--bg:linear-gradient(160deg,#3538CD 0%,#23257F 100%);--ink:#fff;--sub:#C7D7FE;--chip:rgb(255 255 255 / .14);--cink:#E0EAFF;--bd:#2D31A6;--pl:#fff;--plc:#2D31A6}",
    ".blo-easy{--bg:linear-gradient(160deg,#F0F9FF 0%,#D9EEFC 100%);--ink:#0B4A6F;--sub:#33617F;--chip:rgb(255 255 255 / .7);--cink:#026AA2;--bd:#C2E2F7;--pl:#026AA2;--plc:#fff}",
    ".blo-t{position:relative;flex:0 0 160px;height:200px;box-sizing:border-box;scroll-snap-align:start;display:flex;flex-direction:column;padding:16px;border-radius:16px;border:1px solid var(--bd);background:var(--bg);box-shadow:2px 3px 0 var(--g-200);cursor:pointer;text-align:left;color:var(--ink);transition:transform .18s var(--ease),box-shadow .18s var(--ease)}",
    ".blo-t:active{transform:translate(1px,1px);box-shadow:1px 2px 0 var(--g-200)}",
    ".blo-top{display:flex;align-items:center;justify-content:space-between;gap:8px;height:24px}",
    ".blo-chip{display:inline-flex;align-items:center;gap:4px;height:24px;padding:0 8px 0 6px;border-radius:999px;background:var(--chip);color:var(--cink);font:600 12px/16px Roboto;white-space:nowrap}",
    ".blo-chip svg{width:14px;height:14px}",
    ".blo-i{width:20px;height:20px;margin-right:-4px;color:var(--sub);opacity:.8}.blo-i svg{width:20px;height:20px;display:block}",
    ".blo-n{margin-top:auto;font:600 16px/22px Roboto;min-height:44px;display:flex;align-items:flex-end;text-wrap:balance}",
    ".blo-p{margin-top:4px;min-height:32px;font:400 12px/16px Roboto;color:var(--sub);text-wrap:balance}",
    ".blo-ft{margin-top:auto;display:flex;align-items:center;justify-content:space-between;gap:8px;height:40px}",
    ".blo-m{position:relative;display:block;font:500 12px/16px Roboto;color:var(--sub);font-variant-numeric:tabular-nums}",
    ".blo-in{position:absolute;left:0;bottom:100%;margin-bottom:4px;white-space:nowrap;display:inline-flex;align-items:center;gap:4px;font:500 11px/16px Roboto;color:var(--ink)}.blo-in::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--ok-500);box-shadow:0 0 0 2px rgb(255 255 255 / .6)}",
    ".blo-pl{position:relative;flex:none;width:40px;height:40px;border:0;padding:0;border-radius:50%;background:var(--pl);color:var(--plc);display:grid;place-items:center;cursor:pointer}",
    ".blo-pl::after{content:'';position:absolute;inset:-4px}.blo-pl svg{width:18px;height:18px;margin-left:2px}",
    /* See all, grouped by need */
    ".blo-gh{display:flex;align-items:center;gap:8px;margin:16px 0 4px;font:600 12px/16px Roboto;letter-spacing:.3px;color:var(--g-600)}.blo-gh:first-child{margin-top:0}",
    ".blo-gh i{width:24px;height:24px;border-radius:8px;display:grid;place-items:center;background:var(--bg);color:var(--cink);border:1px solid var(--bd)}.blo-gh i svg{width:14px;height:14px}",
    ".blo-r{display:flex;align-items:center;gap:12px;width:100%;min-height:56px;padding:8px 0;border:0;border-top:1px solid var(--g-100);background:none;text-align:left;font:inherit;color:var(--g-900);cursor:pointer}",
    ".blo-gh+.blo-r{border-top:0}",
    ".blo-r .t{flex:1;min-width:0}.blo-r .tt{display:block;font:600 14px/20px Roboto}.blo-r .td{display:block;margin-top:2px;font:400 12px/16px Roboto;color:var(--g-500)}",
    ".blo-r .rt{display:inline-flex;align-items:center;gap:4px;font:500 12px/20px Roboto;color:var(--g-500)}.blo-r .rt svg{width:16px;height:16px;color:var(--g-400)}",
    ".blo-sl{margin:0 0 16px;font:400 14px/20px Roboto;color:var(--g-600)}"
  ].join("");
  document.head.appendChild(css);

  function card(b, n, B) {
    var t = document.createElement("div");
    t.className = "blo-t blo-" + n.id; t.setAttribute("role", "button"); t.tabIndex = 0; t.setAttribute("data-blinfo", b.key);
    t.setAttribute("aria-label", n.label + ": " + b.name + ", " + b.pat + ", " + b.min + " minutes. How it works");
    t.innerHTML = '<div class="blo-top"><span class="blo-chip">' + n.g + n.label + '</span><span class="blo-i" aria-hidden="true">' + INFO + '</span></div>' +
      '<div class="blo-n">' + nm(b) + '</div><div class="blo-p">' + b.pat + '</div>' +
      '<div class="blo-ft"><span class="blo-m"><span>' + b.min + ' min</span>' + (B.state === "plan" && b.inPlan ? '<span class="blo-in">In your plan</span>' : "") + '</span>' +
      '<button class="blo-pl" data-blplay="' + b.key + '" aria-label="Start ' + b.name + '">' + PLAY + '</button></div>';
    return t;
  }

  function all(B) {
    var html = '<p class="blo-sl">Pick by what you need. Tap one to see how it goes.</p>' + NEEDS.map(function (n) {
      return '<div class="blo-gh blo-' + n.id + '"><i>' + n.g + '</i>' + n.label + '</div>' + n.keys.map(function (k) {
        var b = B.get(k);
        return '<button class="blo-r" data-blinfo="' + k + '"><span class="t"><span class="tt">' + nm(b) + '</span><span class="td">' + b.pat +
          (B.state === "plan" && b.inPlan ? ' · <span style="color:var(--ok-600)">In your plan</span>' : "") + '</span></span><span class="rt">' + b.min + ' min' + CHEV + '</span></button>';
      }).join("");
    }).join("");
    if (window.GFOpenSheet) window.GFOpenSheet("bloAll", "Breathing exercises", html);
  }

  BLIB.add("o", {
    render: function (host, B) {
      host.className = "gut sect";
      var intro = B.state === "noplan" ? "Pick by what you need while your coach sets up your plan."
        : "Pick by what you need right now, in your plan or not.";
      if (B.state === "free") intro = "Pick by what you need right now.";
      host.innerHTML = '<div class="blo-hd"><h2>Breathing exercises</h2><button class="blo-all">See all ' + B.list.length + CHEV + '</button></div>' +
        '<p class="blo-intro">' + intro + '</p><div class="blo-rail"></div>';
      var rail = host.querySelector(".blo-rail");
      NEEDS.forEach(function (n) { n.keys.forEach(function (k) { rail.appendChild(card(B.get(k), n, B)); }); });
      host.querySelector(".blo-all").onclick = function (e) { e.stopPropagation(); all(B); };
      host.addEventListener("keydown", function (e) { if ((e.key === "Enter" || e.key === " ") && e.target.classList.contains("blo-t")) { e.preventDefault(); e.target.click(); } });
      if (/[?&]lall=1/.test(location.search)) all(B);
    }
  });
})();
