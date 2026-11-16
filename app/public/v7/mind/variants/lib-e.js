/* e. Advice header card: the Ring app's breathing/meditation advice card (gold header with the meditating figure,
   a white body card floating over it) leads with ONE exercise for right now, picked by the prototype's clock (?now=).
   The other six follow as compact rows: a row starts it, the (i) explains it. */
BLIB.add("e", { render: function (host, B) {
  var css = document.createElement("style");
  css.textContent =
    ".ble-w{display:flex;flex-direction:column;gap:16px;text-align:left}" +
    ".ble-hd{display:flex;flex-direction:column;gap:4px}.ble-hd h2{margin:0;font:400 14px/16.8px Roboto,sans-serif;letter-spacing:.25px;color:#101828}" +
    ".ble-hd p{margin:0;font:400 12px/16px Roboto,sans-serif;color:#667085}" +
    /* the advice card: 96px gold header, the body card inset 12 and overlapping it by 24 */
    ".ble-ad{display:flex;flex-direction:column}" +
    ".ble-top{position:relative;height:96px;border-radius:16px 16px 0 0;background:linear-gradient(180deg,#FFFBEE,#FFF8E0);overflow:hidden}" +
    ".ble-top img{position:absolute;left:50%;bottom:0;width:140px;transform:translateX(-50%)}" +
    ".ble-top::after{content:'';position:absolute;left:0;right:0;bottom:0;height:44px;background:linear-gradient(180deg,rgba(255,255,255,0),#fff)}" +
    ".ble-bd{position:relative;margin:-24px 12px 0;background:#fff;border:1px solid #E4E7EC;border-radius:16px;padding:16px;display:flex;flex-direction:column;gap:12px;box-shadow:2px 2px 0 #E4E7EC}" +
    ".ble-k{display:flex;align-items:center;gap:8px;font:600 12px/16px Roboto,sans-serif;letter-spacing:.4px;color:#A68A2D}" +
    ".ble-tt{display:flex;flex-direction:column;gap:4px}.ble-tt b{font:600 16px/22px Roboto,sans-serif;letter-spacing:.25px;color:#101828}" +
    ".ble-tt span{font:400 14px/21px Roboto,sans-serif;color:#667085}" +
    ".ble-pv{display:flex;align-items:center;gap:12px;padding:8px;border-radius:12px;background:#FFFBEE}" +
    ".ble-pv .bl-mini{box-shadow:0 0 0 1px #FEF1C7}" +
    ".ble-pv .ble-pt{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}.ble-pv .ble-pt b{font:600 14px/20px Roboto,sans-serif;color:#5C4E1F}.ble-pv .ble-pt span{font:400 12px/16px Roboto,sans-serif;color:#826E2D}" +
    ".ble-chip{position:relative;flex:none;display:inline-flex;align-items:center;gap:4px;height:28px;padding:0 10px 0 8px;border-radius:9999px;border:0;cursor:pointer;" +
      "background:#fff;box-shadow:inset 0 0 0 1px #FEF1C7,0 1px 2px rgba(16,24,40,.06);font:500 12px/1 Roboto,sans-serif;letter-spacing:.25px;color:#1D2939}" +
    ".ble-chip::after{content:'';position:absolute;inset:-8px -2px}.ble-chip svg{width:14px;height:14px;color:#475467}" +
    ".ble-go{height:48px;margin-bottom:7px;border:0;border-radius:8px;background:#299D6B;box-shadow:0 7px 0 #2A805A;color:#fff;font:600 16px Roboto,sans-serif;letter-spacing:.25px;cursor:pointer}" +
    ".ble-go:active{transform:translateY(4px);box-shadow:0 3px 0 #2A805A}" +
    /* the other six */
    ".ble-more{display:flex;flex-direction:column;gap:8px}.ble-more h3{margin:0;font:600 14px/20px Roboto,sans-serif;color:#101828}" +
    ".ble-ls{background:#fff;border:1px solid #E4E7EC;border-radius:16px;box-shadow:2px 2px 0 #E4E7EC;padding:0 16px}" +
    ".ble-r{display:flex;align-items:center;gap:12px;padding:12px 0;min-height:64px;cursor:pointer}.ble-r+.ble-r{border-top:1px solid #F2F4F7}" +
    ".ble-r .bl-mini{box-shadow:0 0 0 1px #F2F4F7;background:#FFFBEE}" +
    ".ble-tx{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}.ble-tx b{font:600 14px/20px Roboto,sans-serif;color:#101828}" +
    ".ble-tx .ble-m{display:flex;align-items:center;gap:8px;flex-wrap:wrap;font:400 12px/16px Roboto,sans-serif;color:#667085}" +
    ".ble-tag{display:inline-flex;align-items:center;height:20px;padding:0 6px;border-radius:6px;font:500 11px/1 Roboto,sans-serif;color:#039855;" +
      "background:linear-gradient(90deg,#D1FADF 0%,#ECFDF3 19%,#ECFDF3 84%,#D1FADF 100%);box-shadow:inset 0 0 0 1px #A6F4C5}" +
    ".ble-i{flex:none;width:44px;height:44px;margin:0 -12px;border:0;background:none;display:grid;place-items:center;cursor:pointer;color:#667085}" +
    ".ble-i span{width:28px;height:28px;border-radius:50%;background:rgba(0,0,0,.04);display:grid;place-items:center}.ble-i svg{width:16px;height:16px}" +
    ".ble-ch{flex:none;width:20px;height:20px;color:#98A2B3}" +
    ".ble-r:focus-visible,.ble-i:focus-visible,.ble-chip:focus-visible,.ble-go:focus-visible{outline:2px solid #299D6B;outline-offset:2px}";
  document.head.appendChild(css);

  function ic(p) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + p + '</svg>'; }
  var INFO = ic('<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>');
  var CHEV = '<svg class="ble-ch" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>';
  function tag(b) { return B.state === "plan" && b.inPlan ? '<span class="ble-tag">In your plan</span>' : ''; }

  /* one suggestion for right now, by the prototype's clock */
  var h = window.MDPLAN ? MDPLAN.now : 15;
  var NOW = h < 5 || h >= 21 ? ["sleep", "For tonight", "A long breath out helps your body get ready for sleep."]
    : h < 11 ? ["coherent", "For this morning", "An even, unhurried rhythm to start the day steady."]
    : h < 17 ? ["box", "For this afternoon", "A steady reset for the middle of a busy day."]
    : ["hum", "For this evening", "A gentle hum to quiet a busy mind before bed."];
  var s = B.get(NOW[0]);
  var intro = B.state === "plan" ? "Do any of these, any time. The ones in your plan count towards Rhythm."
    : B.state === "noplan" ? "Do any of these, any time, while your coach sets up your plan."
    : "Free to use, any time. Pick one and breathe along.";

  host.className = "gut sect";
  host.innerHTML = '<div class="ble-w"><div class="ble-hd"><h2>All breathing exercises</h2><p>' + intro + '</p></div>' +
    '<article class="ble-ad"><div class="ble-top"><img src="/v7/icons/mind/meditation-figure.png" alt=""></div><div class="ble-bd">' +
      '<div class="ble-k">' + NOW[1] + tag(s) + '</div>' +
      '<div class="ble-tt"><b>Try ' + s.name + '</b><span>' + NOW[2] + '</span></div>' +
      '<div class="ble-pv"><span class="ble-slot"></span><span class="ble-pt"><b>' + s.pat + '</b><span>' + s.min + ' min</span></span>' +
        '<button class="ble-chip" data-blinfo="' + s.key + '">' + INFO + '<span>How it works</span></button></div>' +
      '<button class="ble-go" data-blplay="' + s.key + '">Start</button>' +
    '</div></article>' +
    '<div class="ble-more"><h3>Or pick another</h3><div class="ble-ls">' +
    B.list.filter(function (b) { return b.key !== s.key; }).map(function (b) {
      return '<div class="ble-r" role="button" tabindex="0" data-blplay="' + b.key + '" aria-label="Start ' + b.name + '"><span class="ble-ms" data-k="' + b.key + '"></span>' +
        '<span class="ble-tx"><b>' + b.name + '</b><span class="ble-m"><span>' + b.pat + ' · ' + b.min + ' min</span>' + tag(b) + '</span></span>' +
        '<button class="ble-i" data-blinfo="' + b.key + '" aria-label="About ' + b.name + '"><span>' + INFO + '</span></button>' + CHEV + '</div>';
    }).join("") + '</div></div></div>';
  host.querySelector(".ble-slot").replaceWith(B.mini(s.key, 56));
  host.querySelectorAll(".ble-ms").forEach(function (t) { t.replaceWith(B.mini(t.dataset.k, 44)); });
  host.addEventListener("keydown", function (e) { if ((e.key === "Enter" || e.key === " ") && e.target.matches(".ble-r")) { e.preventDefault(); e.target.click(); } });
} });
