/* "All breathing exercises", variant x: Paper cut layers.
   White cards in a sideways rail, each with a small paper-cut scene of its own at the top: stacked layers in indigo and
   lavender, each with a tiny shadow so they read as cut paper. Night hills and a moon for 4-7-8, a square window for
   Box, waves for Simple, a long winding river for Extended Exhale, soft rising domes for Belly, flowers and a little
   bee for Bhramari, gentle peaks with a path for Pursed Lip. Name and pattern below. The card opens the info sheet, the
   play button on the scene starts it. "See all" lists every exercise in a sheet. */
(function () {
  var CHEV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>';
  var PLAY = '<svg viewBox="0 0 24 24"><path d="M8 5.6v12.8a1 1 0 0 0 1.5.86l10.2-6.4a1 1 0 0 0 0-1.72L9.5 4.74A1 1 0 0 0 8 5.6z" fill="currentColor"/></svg>';
  var nm = function (b) { return b.name.replace(/\s*\(.*\)$/, ""); };

  /* scenes on a 160 x 112 board; each layer is a <path> back to front, the shadow comes from the filter */
  var C = ["#EEF2FF", "#DCE3FF", "#C3CEFD", "#A2B1F8", "#8090F0", "#6170E6", "#4A55D6", "#3A42BC"];
  var L = function (d, f) { return '<path d="' + d + '" fill="' + f + '" filter="url(#blxS)"/>'; };
  var SC = {
    /* Simple: layered waves */
    coherent: { sky: ["#F3F5FF", "#E3E8FF"], art:
      '<circle cx="118" cy="34" r="12" fill="#FFF3CF" filter="url(#blxS)"/>' +
      L("M0 58 C20 48 40 48 60 58 S100 68 120 58 S150 48 160 54 V112 H0Z", C[2]) +
      L("M0 70 C20 60 40 60 60 70 S100 80 120 70 S150 60 160 66 V112 H0Z", C[3]) +
      L("M0 82 C20 72 40 72 60 82 S100 92 120 82 S150 72 160 78 V112 H0Z", C[4]) +
      L("M0 95 C20 85 40 85 60 95 S100 105 120 95 S150 85 160 91 V112 H0Z", C[6]) },
    /* 4-7-8: night hills, a moon and a few stars */
    sleep: { sky: ["#3A3F9E", "#5560CF"], art:
      '<g fill="#fff" opacity=".85"><circle cx="24" cy="18" r="1"/><circle cx="62" cy="10" r=".8"/><circle cx="84" cy="30" r="1"/><circle cx="140" cy="46" r=".8"/><circle cx="40" cy="40" r=".7"/></g>' +
      '<path d="M128 14a14 14 0 1 0 8 25 11 11 0 0 1-8-25z" fill="#FFE9A8" filter="url(#blxS)"/>' +
      L("M0 70 C30 50 60 52 90 64 S140 58 160 50 V112 H0Z", "#6E7BE8") +
      L("M0 84 C24 70 52 68 80 78 S130 86 160 70 V112 H0Z", "#4E59D4") +
      L("M0 96 C30 86 70 84 100 92 S140 96 160 88 V112 H0Z", "#3A42BC") },
    /* Box: a square window onto a calm sky */
    box: { sky: ["#F4F3FF", "#E6E3FF"], art:
      L("M0 92 C40 84 120 84 160 92 V112 H0Z", C[2]) +
      L("M46 16 H114 V84 H46Z M54 24 V76 H106 V24Z", "#6E62E0") +
      '<path d="M54 24 H106 V76 H54Z" fill="#DCD8FF"/>' +
      L("M54 60 C66 52 78 54 90 60 S102 62 106 58 V76 H54Z", "#A99FF4") +
      '<circle cx="92" cy="38" r="7" fill="#FFF3CF" filter="url(#blxS)"/>' +
      L("M78.5 24 H81.5 V76 H78.5Z M54 48.5 H106 V51.5 H54Z", "#6E62E0") +
      L("M42 84 H118 V90 H42Z", "#5146C9") },
    /* Extended Exhale: a long river winding off into the distance */
    exhale: { sky: ["#F2F6FF", "#DFE8FF"], art:
      L("M0 52 C30 40 60 44 90 50 S140 46 160 42 V112 H0Z", C[2]) +
      L("M0 66 C40 56 80 62 110 66 S150 62 160 60 V112 H0Z", C[3]) +
      L("M0 80 C30 72 70 76 100 82 S150 80 160 76 V112 H0Z", C[5]) +
      '<path d="M150 62 C120 66 96 70 104 78 S70 90 40 96 S8 106 0 112 H34 C48 104 84 96 100 88 S128 74 150 62Z" fill="#F5F8FF" filter="url(#blxS)"/>' },
    /* Belly: soft domes rising one behind the other */
    belly: { sky: ["#F8F5FF", "#ECE6FF"], art:
      '<circle cx="128" cy="24" r="8" fill="#FFF3CF" filter="url(#blxS)"/>' +
      L("M14 112 C14 60 50 42 80 42 S146 60 146 112Z", "#D2C8FB") +
      L("M26 112 C26 72 54 58 80 58 S134 72 134 112Z", "#B3A3F5") +
      L("M40 112 C40 84 60 74 80 74 S120 84 120 112Z", "#8F7BEA") +
      L("M56 112 C56 96 68 90 80 90 S104 96 104 112Z", "#6A55D6") },
    /* Bhramari: flowers on a hill and a small bee */
    hum: { sky: ["#F3F4FF", "#E0E5FF"], art:
      L("M0 84 C40 72 110 72 160 82 V112 H0Z", C[3]) +
      L("M0 96 C50 88 110 88 160 96 V112 H0Z", C[5]) +
      '<g filter="url(#blxS)"><path d="M44 86 V58" stroke="#4A55D6" stroke-width="2"/><g fill="#FFFFFF"><circle cx="44" cy="50" r="6"/><circle cx="52" cy="56" r="6"/><circle cx="36" cy="56" r="6"/><circle cx="44" cy="62" r="5"/></g><circle cx="44" cy="56" r="4" fill="#FFE29A"/></g>' +
      '<g filter="url(#blxS)"><path d="M112 88 V66" stroke="#4A55D6" stroke-width="2"/><g fill="#C9C1FB"><circle cx="112" cy="60" r="5"/><circle cx="118" cy="65" r="5"/><circle cx="106" cy="65" r="5"/></g><circle cx="112" cy="64" r="3" fill="#FFE29A"/></g>' +
      '<g filter="url(#blxS)" transform="translate(92 32) scale(1.3)"><ellipse cx="-2" cy="-6" rx="4" ry="5.5" fill="#fff" opacity=".95" transform="rotate(-20 -2 -6)"/><ellipse cx="5" cy="-6" rx="4" ry="5.5" fill="#fff" opacity=".95" transform="rotate(20 5 -6)"/>' +
      '<ellipse cx="2" cy="2" rx="8" ry="5.5" fill="#FFD966"/><path d="M0 -3 V7 M5 -3 V7" stroke="#3A42BC" stroke-width="2"/></g>' },
    /* Pursed Lip: gentle peaks and a path up, one steady step at a time */
    pursed: { sky: ["#F1F6FF", "#DCE8FF"], art:
      '<circle cx="126" cy="26" r="9" fill="#FFF3CF" filter="url(#blxS)"/>' +
      L("M0 80 L36 40 L58 60 L88 26 L124 66 L144 50 L160 62 V112 H0Z", C[2]) +
      L("M0 90 L30 64 L56 80 L96 50 L136 84 L160 72 V112 H0Z", C[4]) +
      L("M0 100 C40 90 100 92 160 98 V112 H0Z", C[6]) +
      '<path d="M78 112 C82 100 92 94 96 84 S102 66 96 54" fill="none" stroke="#EEF2FF" stroke-width="2.4" stroke-dasharray="4 4" stroke-linecap="round"/>' }
  };
  function scene(k, id) {
    var s = SC[k], g = "blxG" + id;
    return '<svg class="blx-art" viewBox="0 0 160 112" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs>' +
      '<linearGradient id="' + g + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + s.sky[0] + '"/><stop offset="1" stop-color="' + s.sky[1] + '"/></linearGradient></defs>' +
      '<rect width="160" height="112" fill="url(#' + g + ')"/>' + s.art + '</svg>';
  }

  var css = document.createElement("style");
  css.textContent = [
    ".blx-hd{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 0 4px}",
    ".blx-hd h2{margin:0;font:400 14px/16.8px Roboto;letter-spacing:.25px;color:var(--g-900)}",
    ".blx-all{position:relative;display:inline-flex;align-items:center;gap:2px;height:32px;padding:0;border:0;background:none;font:600 14px/20px Roboto;color:var(--brand-600);cursor:pointer}",
    ".blx-all::after{content:'';position:absolute;inset:-6px -8px}.blx-all svg{width:18px;height:18px}",
    ".blx-intro{margin:0 0 12px;font:400 12px/16px Roboto;color:var(--g-500)}",
    ".blx-rail{display:flex;gap:12px;margin:0 calc(var(--gut) * -1);padding:4px var(--gut) 8px;overflow-x:auto;scroll-snap-type:x mandatory;scroll-padding:0 var(--gut);scrollbar-width:none}",
    ".blx-rail::-webkit-scrollbar{display:none}",
    /* the card: GoodFlip's white card, 1px border and 2px hard shadow, the scene inset at the top */
    ".blx-c{position:relative;flex:0 0 calc((100% - 12px) / 1.6);min-width:0;scroll-snap-align:start;display:flex;flex-direction:column;gap:12px;padding:6px 6px 14px;border-radius:20px;" +
      "background:#fff;border:1px solid var(--g-200);box-shadow:2px 2px 0 var(--g-200);cursor:pointer;text-align:left;transition:transform .18s var(--ease),box-shadow .18s var(--ease)}",
    ".blx-c:active{transform:translate(1px,1px);box-shadow:1px 1px 0 var(--g-200)}",
    ".blx-sc{position:relative;aspect-ratio:160/112;border-radius:14px;overflow:hidden}",
    ".blx-art{display:block;width:100%;height:100%}",
    ".blx-mn{position:absolute;left:8px;top:8px;display:inline-flex;align-items:center;height:24px;padding:0 8px;border-radius:999px;background:rgb(255 255 255 / .86);font:500 12px/16px Roboto;color:var(--in-700);font-variant-numeric:tabular-nums}",
    ".blx-pl{position:absolute;right:8px;bottom:8px;width:32px;height:32px;border:0;padding:0;border-radius:50%;background:#fff;color:var(--in-600);display:grid;place-items:center;cursor:pointer;box-shadow:0 2px 6px rgb(30 27 75 / .2)}",
    ".blx-pl::after{content:'';position:absolute;inset:-6px}.blx-pl svg{width:14px;height:14px;margin-left:2px}",
    ".blx-tx{display:flex;flex-direction:column;gap:2px;padding:0 8px}",
    ".blx-n{font:600 16px/20px Roboto;color:var(--g-900);text-wrap:balance}",
    ".blx-s{font:400 12px/16px Roboto;color:var(--g-500);text-wrap:balance}",
    ".blx-chips{position:absolute;left:8px;top:8px;display:flex;flex-direction:column;align-items:flex-start;gap:4px}.blx-chips .blx-mn{position:static}",
    ".blx-in{display:inline-flex;align-items:center;gap:4px;height:24px;padding:0 8px;border-radius:999px;background:rgb(255 255 255 / .92);font:500 12px/16px Roboto;color:var(--ok-600);white-space:nowrap}.blx-in::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--ok-500)}",
    /* the See all sheet */
    ".blx-ls{display:flex;flex-direction:column}.blx-r{display:flex;align-items:center;gap:12px;width:100%;min-height:64px;padding:8px 0;border:0;border-top:1px solid var(--g-100);background:none;text-align:left;font:inherit;color:var(--g-900);cursor:pointer}",
    ".blx-r:first-child{border-top:0}.blx-r .th{flex:none;width:56px;height:40px;border-radius:10px;overflow:hidden}",
    ".blx-r .t{flex:1;min-width:0}.blx-r .tt{display:block;font:600 14px/20px Roboto}.blx-r .td{display:block;margin-top:2px;font:400 12px/18px Roboto;color:var(--g-500)}",
    ".blx-r .rt{display:inline-flex;align-items:center;gap:4px;font:500 12px/20px Roboto;color:var(--g-500)}.blx-r .rt svg{width:16px;height:16px;color:var(--g-400)}",
    ".blx-sl{margin:0 0 8px;font:400 14px/20px Roboto;color:var(--g-600)}"
  ].join("");
  document.head.appendChild(css);

  /* one shared filter for every layer's tiny paper shadow */
  function defs() {
    if (document.getElementById("blxDefs")) return;
    var d = document.createElement("div"); d.id = "blxDefs"; d.style.cssText = "position:absolute;width:0;height:0;overflow:hidden";
    d.innerHTML = '<svg width="0" height="0"><filter id="blxS" x="-10%" y="-20%" width="120%" height="150%"><feDropShadow dx="0" dy="-1.2" stdDeviation="1.2" flood-color="#1E1B4B" flood-opacity=".22"/></filter></svg>';
    document.body.appendChild(d);
  }

  function card(b, B) {
    var c = document.createElement("div");
    c.className = "blx-c"; c.setAttribute("role", "button"); c.tabIndex = 0;
    c.setAttribute("data-blinfo", b.key);
    c.setAttribute("aria-label", b.name + ", " + b.pat + ", " + b.min + " minutes. How it works");
    c.innerHTML = '<div class="blx-sc">' + scene(b.key, b.key) + '<div class="blx-chips"><span class="blx-mn">' + b.min + ' min</span>' + (B.state === "plan" && b.inPlan ? '<span class="blx-in">In your plan</span>' : "") + '</div>' +
      '<button class="blx-pl" data-blplay="' + b.key + '" aria-label="Start ' + b.name + '">' + PLAY + '</button></div>' +
      '<div class="blx-tx"><div class="blx-n">' + nm(b) + '</div><div class="blx-s">' + b.pat + '</div></div>';
    return c;
  }

  function all(B) {
    var html = '<p class="blx-sl">Tap one to see how it goes, or start it from there.</p><div class="blx-ls">' + B.list.map(function (b) {
      return '<button class="blx-r" data-blinfo="' + b.key + '"><span class="th">' + scene(b.key, "s" + b.key) + '</span><span class="t"><span class="tt">' + nm(b) + '</span><span class="td">' + b.pat +
        (B.state === "plan" && b.inPlan ? ' · <span style="color:var(--ok-600)">In your plan</span>' : "") + '</span></span><span class="rt">' + b.min + ' min' + CHEV + '</span></button>';
    }).join("") + '</div>';
    if (window.GFOpenSheet) window.GFOpenSheet("blxAll", "Breathing exercises", html);
  }

  BLIB.add("x", {
    render: function (host, B) {
      host.className = "gut sect"; defs();
      var intro = B.state === "noplan" ? "Use any of these while your coach sets up your plan."
        : B.state === "free" ? "Start one whenever you need a pause."
        : "Start one whenever you need a pause, in your plan or not.";
      host.innerHTML = '<div class="blx-hd"><h2>Breathing exercises</h2><button class="blx-all">See all ' + B.list.length + CHEV + '</button></div>' +
        '<p class="blx-intro">' + intro + '</p><div class="blx-rail"></div>';
      var rail = host.querySelector(".blx-rail");
      B.list.forEach(function (b) { rail.appendChild(card(b, B)); });
      host.querySelector(".blx-all").onclick = function (e) { e.stopPropagation(); all(B); };
      host.addEventListener("keydown", function (e) { if ((e.key === "Enter" || e.key === " ") && e.target.classList.contains("blx-c")) { e.preventDefault(); e.target.click(); } });
      if (/[?&]lall=1/.test(location.search)) all(B);
    }
  });
})();
