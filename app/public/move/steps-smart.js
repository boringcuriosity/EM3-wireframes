/* steps-smart.js (?sx=1): the steps card's strip and its sheet, the same pattern as Mind's sleep card (v7/mind-sleep-smart.html).
   The card stays as it is; only the strip under it changes. Always tappable: the left part opens Track your steps automatically.
     nothing connected, nothing logged   Track steps automatically  >
     logged by hand, nothing connected   [edit] Added by you, 9:00 AM               Connect
     syncing                             [icon] Syncing with Apple Health
     synced                              [icon] Last synced 3:38 PM                 Manage
     connected, no steps came            [icon] No steps data found · 3:38 PM       Manage
   ?sdev=new|none|ah|ring|both what is connected (new: Apple Health is asked once, as today), ?sday=missing no steps came.
   The ring is GoodFlip's Arc smart ring; it pairs and syncs inside the app. ponytail: the prototype's clock is 3:40 PM */
(function () {
  var P = window.MVPLAN; if (!P || !P.sx) return;
  var Q = new URLSearchParams(location.search);
  var HAS = { ring: /^(ring|both)$/.test(P.sdev), ah: /^(ah|both)$/.test(P.sdev) }, SYNC = false;
  var RINGI = '<img src="/v7/icons/mind/arc-ring.png" alt="">', AHI = '<img src="/v7/icons/health/apple-health-heart.png" alt="">';
  var SYI = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 11a8 8 0 0 0-14.3-4.9L4 8M4 4v4h4M4 13a8 8 0 0 0 14.3 4.9L20 16M20 20v-4h-4"/></svg>';
  var CHEV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>';
  /* the house edit icon, filled, as on the sleep card's Added by you */
  var PENF = '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path fill="currentColor" d="m14.208 4.586-2.794-2.793a1 1 0 0 0-1.414 0L2.293 9.5a1 1 0 0 0-.293.707V13a1 1 0 0 0 1 1h10.5a.5.5 0 0 0 0-1H7.208l7-7a1 1 0 0 0 0-1.414"/><path d="m8.6 4.6 2.8 2.8" stroke="#fff" stroke-width="1.1" stroke-linecap="round"/></svg>';
  var toast = function (m) { if (window.GFToast) window.GFToast(m); };
  var src = function () { return HAS.ring ? "ring" : "ah"; };   /* the ring first, then Apple Health */
  var tile = function (k) { return '<i class="mx-ti">' + (k === "ring" ? RINGI : AHI) + '</i>'; };
  var clk = function (at) { var h = parseInt(at, 10), m = (at.split(":")[1] || "00"); return ((h % 12) || 12) + ":" + m + (h < 12 ? " AM" : " PM"); };

  window.MVSX = {
    syncing: function () { return SYNC; },
    /* the steps card drawn in shimmer, the same shape as the real one: the count and Log steps, the line under it,
       the progress bar, the day's bars and their hours. One sweep runs across it (Eat's .shim colours, 1.5 s) */
    skel: function () {
      css();
      var b = function (w, h, r) { return '<i class="mx-sk" style="width:' + w + ';height:' + h + 'px' + (r ? ';border-radius:' + r + 'px' : "") + '"></i>'; };
      var hs = [6, 6, 6, 6, 6, 10, 34, 62, 28, 20, 24, 38, 30, 12, 6, 6], bars = hs.map(function (h) { return '<i class="mx-sk mx-skb" style="height:' + h + '%"></i>'; }).join("") + '<i class="mx-fut"></i>'.repeat(8);
      return '<div class="mv-sc mx-skc" aria-hidden="true"><div class="mx-skr">' + b("150px", 30) + b("84px", 20) + '</div>' + b("190px", 14) + b("100%", 6, 3) +
        '<div class="mx-skch">' + bars + '</div><div class="mx-skr">' + b("36px", 12) + b("36px", 12) + b("36px", 12) + b("36px", 12) + '</div></div>';
    },
    strip: function (health, lastLog, any) {
      css();
      var cta = function (t) { return '<button class="mx-cta" data-mx="track">' + t + '</button>'; };
      var row = function (left, lab, right) { return '<div class="mv-sync mx"><button class="mx-l" data-mx="track" aria-label="' + lab + '. Track your steps automatically">' + left + '</button>' + (right || "") + '</div>'; };
      if (!health && !lastLog) return '<button class="mv-sync mx mx-none" data-mx="track"><span class="mx-two">' + tile("ah") + tile("ring") + '</span><span class="mx-t">Track steps automatically</span>' + CHEV + '</button>';
      if (!health) return row('<i class="mx-ti mx-me">' + PENF + '</i><span>Added by you, ' + clk(lastLog) + '</span>', "Added by you", cta("Connect"));
      if (SYNC) return row(tile(src()) + '<span class="mx-syn"><i class="mx-spin" aria-hidden="true"></i>Syncing with ' + (src() === "ring" ? "your Arc ring" : "Apple Health") + '</span>', "Syncing");
      return any ? row(tile(src()) + '<span>Last synced 3:38 PM</span>', "Last synced 3:38 PM", cta("Manage"))
        : row(tile(src()) + '<span>No steps data found · 3:38 PM</span>', "No steps data found", cta("Manage"));
    }
  };

  /* Track your steps automatically: two rows in one soft card. Not connected: Connect <device> with what it reads, and a
     primary Connect. Connected: the name, a green dot with Last synced, and Sync with its icon */
  var WHY = { ring: "Counts steps while you wear it.", ah: "Reads steps from other apps or devices." }, NAME = { ring: "Arc smart ring", ah: "Apple Health" }, AT = { ring: "3:38 PM", ah: "3:38 PM" };
  function sheet() {
    css();
    var r = function (k) {
      var on = HAS[k];
      return '<div class="mx-r">' + tile(k) + '<span class="mx-tx"><b>' + (on ? "" : "Connect ") + NAME[k] + '</b><span class="mx-sub">' +
        (on ? '<i class="mx-dot" aria-hidden="true"></i><span class="mx-sr">Connected. </span>Last synced ' + AT[k] : WHY[k]) + '</span></span>' +
        (on ? '<button class="mx-sec" data-mx="sync" aria-label="Sync ' + NAME[k] + '">' + SYI + 'Sync</button>' : '<button class="mx-pri" data-mx="go" data-k="' + k + '" aria-label="Connect ' + NAME[k] + '">Connect</button>') + '</div>';
    };
    window.GFOpenSheet("mxTrack", "Track your steps automatically", '<div class="mx-grp">' + r("ring") + r("ah") + '</div>');
  }
  /* the three dots: Log steps, and Track steps automatically */
  function menu() {
    css();
    var PLUS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="4.5"/><path d="M12 8.5v7M8.5 12h7"/></svg>';
    var SWAP = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9h15l-4-4M20 15H5l4 4"/></svg>';
    var row = function (a, ic, t, sub) { return '<button class="mx-mn" data-mx="' + a + '"><span class="ic">' + ic + '</span><span class="tx"><b>' + t + '</b>' + (sub ? '<span>' + sub + '</span>' : "") + '</span>' + CHEV + '</button>'; };
    window.GFOpenSheet("mxMenu", "Your steps", '<div class="mx-mns">' + row("log", PLUS, "Log steps", "") + row("track", SWAP, "Track steps automatically", "") + '</div>');
  }
  function sync() {
    window.closeSheets(); SYNC = true; P.render(); if (Q.get("ssync") === "hold") return;
    setTimeout(function () { SYNC = false; P.render(); toast("Your steps are updated."); }, matchMedia("(prefers-reduced-motion: reduce)").matches ? 50 : 2500);
  }
  document.addEventListener("click", function (e) {
    var t = e.target.closest && e.target.closest("[data-mx]"); if (!t) return;
    var a = t.dataset.mx;
    if (a === "track") return sheet();
    if (a === "menu") return menu();
    if (a === "log") { window.closeSheets(); return setTimeout(P.stepsSheet, 320); }
    if (a === "sync") return sync();
    if (a === "go" && t.dataset.k === "ah") { window.closeSheets(); return window.openHealth && window.openHealth(); }   /* Move's own Apple Health sheet, then the phone's */
    if (a === "go") { window.closeSheets(); var pair = function () { HAS.ring = true; toast("Your Arc ring is connected."); if (!P.health()) P.connect(); sync(); }; return window.RingReady ? setTimeout(function () { window.RingReady(pair); }, 320) : pair(); }   /* the ring: get ready first */
  });
  /* Move's Apple Health sheet connects through P.connect; note it so the sheet shows it connected */
  var c0 = P.connect; P.connect = function () { HAS.ah = true; c0(); };
  /* ?slog=1 (doc): a morning walk typed in by hand, 2,400 steps at 9 AM */
  if (Q.get("slog") === "1" && !P.health()) { P.S.logs.push({ n: 2400, at: "09:00" }); P.S.steps[9] = (P.S.steps[9] || 0) + 2400; }
  /* connected, with a walk added by hand at 1 PM (doc): its share of the bar is striped */
  if (Q.get("slog") === "1" && P.health()) { P.S.logs.push({ n: 890, at: "13:00" }); P.S.steps[13] = (P.S.steps[13] || 0) + 890; P.S.sel = 13; }
  if (Q.get("sheet") === "steptrack") setTimeout(sheet, 900);
  P.render();
  /* a device is connected: the screen opens syncing, ?ssync=hold keeps it there for the doc, ?ssync=0 skips it */
  if ((HAS.ah || HAS.ring) && Q.get("ssync") !== "0" && !Q.get("sheet")) { SYNC = true; P.render(); if (Q.get("ssync") !== "hold") setTimeout(function () { SYNC = false; P.render(); }, 2500); }

  function css() {
    if (document.getElementById("mxCss")) return;
    var st = document.createElement("style"); st.id = "mxCss";
    st.textContent = [
      ".mv-sync.mx{gap:4px;padding-top:18px;padding-bottom:2px;padding-right:8px}",
      ".mx-l{flex:1;min-width:0;display:flex;align-items:center;gap:8px;min-height:44px;padding:0;border:0;background:none;font:400 14px/20px Roboto,sans-serif;color:#344054;text-align:left;cursor:pointer}.mx-l>span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
      ".mx-cta{flex:none;min-height:44px;padding:0 8px;border:0;background:none;color:#299D6B;font:600 14px/20px Roboto,sans-serif;cursor:pointer}.mx-cta:active{opacity:.6}",
      ".mx-ti{flex:none;width:20px;height:20px;border-radius:6px;background:#fff;box-shadow:0 0 0 1px #EAECF0;display:grid;place-items:center;font-style:normal}.mx-ti img{max-width:13px;max-height:15px}",
      ".mx-me{color:#299D6B}.mx-me svg{width:12px;height:12px}",
      "button.mv-sync.mx-none{gap:8px;padding:26px 16px 10px;color:#1D2939}.mx-none .mx-t{flex:1;font:600 14px/20px Roboto,sans-serif}.mx-none>svg{width:16px;height:16px;color:#98A2B3}.mx-two{display:flex}.mx-two .mx-ti+.mx-ti{margin-left:-4px}",
      ".mx-syn{display:inline-flex;align-items:center;gap:6px}.mx-spin{width:14px;height:14px;border-radius:50%;border:2px solid #D1FADF;border-top-color:#12B76A;animation:mxSp 1.5s linear infinite}@keyframes mxSp{to{transform:rotate(360deg)}}",
      ".mx-grp{padding:2px 16px;border:1px solid #E0EAFF;border-radius:20px;background:linear-gradient(180deg,#F5F8FF 0%,#FFFFFF 100%);box-shadow:0 1px 2px rgba(16,24,40,.04);margin-top:4px}",
      ".mx-r{position:relative;display:flex;align-items:center;gap:10px;padding:18px 0}.mx-r+.mx-r::before{content:'';position:absolute;top:0;left:46px;right:0;border-top:1px solid #E0EAFF}",
      ".mx-r .mx-ti{width:36px;height:36px;border-radius:10px;align-self:flex-start;margin-top:2px}.mx-r .mx-ti img{max-width:20px;max-height:22px}",
      ".mx-tx{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}.mx-tx b{font:600 15px/21px Roboto,sans-serif;color:#101828}",
      ".mx-sub{display:flex;align-items:center;gap:6px;font:400 14px/20px Roboto,sans-serif;color:#667085}",
      ".mx-dot{flex:none;width:8px;height:8px;border-radius:50%;background:#12B76A;box-shadow:0 0 0 3px #D1FADF}.mx-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}",
      ".mx-pri{flex:none;height:40px;margin-bottom:4px;padding:0 14px;border:0;border-radius:8px;background:#299D6B;color:#fff;font:600 15px/1 Roboto,sans-serif;box-shadow:0 4px 0 #2A805A;cursor:pointer}.mx-pri:active{transform:translateY(4px);box-shadow:none}",
      ".mx-sec{flex:none;display:inline-flex;align-items:center;gap:6px;height:40px;margin-bottom:4px;padding:0 14px;border:1px solid #299D6B;border-radius:8px;background:#fff;color:#2A805A;font:600 15px/1 Roboto,sans-serif;box-shadow:0 4px 0 #CBF0E0;cursor:pointer}.mx-sec svg{width:16px;height:16px}.mx-sec:active{transform:translateY(4px);box-shadow:none}",
      ".mx-dots{flex:none;width:44px;height:44px;margin:-8px -12px 0 0;border:0;border-radius:50%;background:none;color:#475467;display:grid;place-items:center;cursor:pointer}.mx-dots svg{width:20px;height:20px}.mx-dots:active{background:#F2F4F7}",
      ".mx-mns{display:flex;flex-direction:column}.mx-mn{display:flex;align-items:center;gap:14px;width:100%;min-height:64px;padding:10px 0;border:0;background:none;text-align:left;font-family:inherit;cursor:pointer}.mx-mn+.mx-mn{border-top:1px solid #EAECF0}",
      ".mx-mn .ic{flex:none;width:40px;height:40px;border-radius:12px;background:#F2F4F7;display:grid;place-items:center;color:#344054}.mx-mn .ic svg{width:20px;height:20px}",
      ".mx-mn .tx{flex:1;display:flex;flex-direction:column;gap:2px}.mx-mn b{font:600 16px/22px Roboto,sans-serif;color:#101828}.mx-mn .tx span{font:400 14px/20px Roboto,sans-serif;color:#667085}.mx-mn>svg{flex:none;width:20px;height:20px;color:#98A2B3}",
      /* hand-logged steps: the top share of the bar in fine white diagonal lines over the bar's own colour */
      ".mv-b.man i{background-image:repeating-linear-gradient(135deg,rgba(255,255,255,.55) 0 1.5px,transparent 1.5px 4px);background-size:100% var(--m);background-repeat:no-repeat;background-position:top}",
      ".mv-hedit.gr{background:#299D6B;color:#fff}",
      ".mx-gold{display:flex;gap:8px;margin:0 0 16px;padding:10px 12px;border-radius:12px;border:1px solid #FEF1C7;background:#FFFBEE;color:#826E2D;font:400 14px/20px Roboto,sans-serif}.mx-gold b{font-weight:600}.mx-gold svg{flex:none;width:16px;height:16px;margin-top:2px;color:#A68A2D}.mv-srows .mx-gold{margin:2px 0 0}",   /* soft: a plain warm tint, no stripes, regular weight */
      "#mvSteps:has(.mx-bin) .mv-heads,#mvSteps:has(.mx-bin) .mv-srow{grid-template-columns:1fr 1fr 44px}.mv-srm.mx-bin::after{inset:0}",   /* the bin's own column, so it sits inside the sheet */
      ".mv-srm.mx-bin{width:44px;height:44px;border-radius:12px;color:#D92D20;background:#FEF3F2}.mv-srm.mx-bin svg{width:20px;height:20px}",
            "[data-mx]:focus-visible{outline:2px solid #6172F3;outline-offset:2px}",
      ".mx-skc{display:flex;flex-direction:column;gap:12px}.mx-skr{display:flex;align-items:center;justify-content:space-between;gap:12px}",
      ".mx-sk{display:block;flex:none;border-radius:8px;background:linear-gradient(90deg,#F2F4F7 0%,#F2F4F7 35%,#E4E7EC 50%,#F2F4F7 65%,#F2F4F7 100%) 0 0/300% 100%;animation:mxSh 1.5s linear infinite}",
      "@keyframes mxSh{from{background-position:100% 0}to{background-position:-200% 0}}",
      ".mx-skch{display:flex;align-items:flex-end;gap:3px;height:96px;margin-top:4px}.mx-skb{flex:1;border-radius:3px 3px 1px 1px;min-height:4px}.mx-fut{flex:1;height:4px;border-radius:2px;background:#F2F4F7}",
      "@media (prefers-reduced-motion:reduce){.mx-spin,.mx-sk{animation:none}}"
    ].join("\n");
    document.head.appendChild(st);
  }
})();
