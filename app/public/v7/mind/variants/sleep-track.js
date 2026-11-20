/* sleep-track.js: the "Track sleep from" sheet in the smart flow (?sx=1), opened from the card's three dots.
   Two rows, Arc smart ring and Apple Health. Connected: green dot, Last synced, Sync. Not connected: Connect.
   ?strack=a|b|c|d picks the variant (default a).
   a: one bordered group, hairline divider, secondary buttons (like phone settings)
   b: two separate cards, secondary buttons
   c: plain rows, green text buttons, dot beside the name
   d: not connected rows are the button; connected rows sync from a round icon button */
(function () {
  window.SVX = window.SVX || {};
  var C = null;
  var NAME = { ring: "Arc smart ring", ah: "Apple Health" };
  var AT = { ring: "7:22 AM", ah: "7:18 AM" };
  var IMG = { ring: "/v7/icons/mind/arc-ring.png", ah: "/v7/icons/health/apple-health-heart.png" };
  var SYNC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 11a8 8 0 0 0-14.3-4.9L4 8M4 4v4h4M4 13a8 8 0 0 0 14.3 4.9L20 16M20 20v-4h-4"/></svg>';
  var CHEV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>';
  var LEAD = { fill: "Last night fills in by itself each morning.", order: "We use your ring first, then Apple Health." };
  var SYI = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 11a8 8 0 0 0-14.3-4.9L4 8M4 4v4h4M4 13a8 8 0 0 0 14.3 4.9L20 16M20 20v-4h-4"/></svg>';
  var WHY = { ring: "Tracks your sleep by itself", ah: "From your watch or sleep app" };   /* d only: the Connect row says why */
  var FOOT = '<p class="svt-ft">You can still log a night yourself.</p>';

  var ic = function (k) { return '<span class="svt-ic"><img src="' + IMG[k] + '" alt=""></span>'; };
  var dot = '<i class="svt-dot" aria-hidden="true"></i>';
  /* the line under the name: the dot shows connected, the hidden word says it */
  var sub = function (k, on, noDot) { return '<span class="svt-sub">' + (on ? (noDot ? "" : dot) + '<span class="svt-sr">Connected. </span>Last synced ' + AT[k] : "Not connected") + '</span>'; };
  var btn = function (k, on, cls) {
    /* Connect is the primary button, Sync a secondary one with the sync icon (Shaheer, 20 Nov 2026) */
    return on ? '<button class="' + cls + ' svt-sy" data-sv="sync" data-dev="' + k + '" aria-label="Sync ' + NAME[k] + '">' + SYI + 'Sync</button>'
      : '<button class="' + cls.replace("sv-cn", "svt-pri") + '" data-svt-go="' + k + '" aria-label="Connect ' + NAME[k] + '">Connect</button>';
  };
  var name = function (k, on, withDot) { return '<b>' + NAME[k] + (withDot && on ? ' ' + dot : "") + '</b>'; };

  /* the words, ?stc=1..4: the app speaking plainly, the rows in the person's own voice (Shaheer, 20 Nov 2026).
     t title, l line, n(k, on) the row's name, s(k, on) the line under it (null: Last synced or Not connected), f footnote */
  var DEV = { ring: "my Arc smart ring", ah: "Apple Health" };
  var TC = {
    1: { t: "Track your sleep automatically", l: "Connect once, and last night fills in by itself every morning.",
      n: function (k, on) { return on ? "Sleep from " + DEV[k] : "Get my sleep from " + DEV[k]; }, s: function (k, on) { return on ? null : k === "ring" ? "Your GoodFlip ring" : "From your watch or sleep app"; }, f: "Or log it yourself each morning." },
    2: { t: "Where should your sleep come from?", l: "Connect one, and you will not need to type it in.",
      n: function (k) { return "From " + DEV[k]; }, s: function () { return null; }, f: "You can still log a night yourself." },
    3: { t: "Let us track your sleep", l: "You can capture your sleep automatically by connecting.",
      n: function (k, on) { return on ? "Getting my sleep from " + DEV[k] : "I want my sleep from " + DEV[k]; }, s: function (k, on) { return on ? null : k === "ring" ? "Tracks while you wear it" : "Works with your watch or sleep app"; }, f: "" },
    4: { t: "Sleep, automatically", l: "Connect and last night shows up on its own.",
      n: function (k) { return k === "ring" ? "Arc smart ring" : "Apple Health"; }, s: function (k, on) { return on ? null : k === "ring" ? "Tracks your sleep while you wear it" : "Reads sleep from your watch or sleep app"; }, f: "You can still log a night yourself." }
  };
  /* 5, picked (Shaheer, 20 Nov 2026): Connect <device> with what it reads; once connected, its name, the dot and Last synced */
  TC[5] = { t: "Track your sleep automatically", l: "",
    n: function (k, on) { return (on ? "" : "Connect ") + (k === "ring" ? "Arc smart ring" : "Apple Health"); },
    s: function (k, on) { return on ? null : k === "ring" ? "Reads sleep while you wear it." : "Reads sleep from other apps or devices."; }, f: "" };
  var TX = TC[new URLSearchParams(location.search).get("stc")] || TC[5];

  /* A and B share the row; only the container differs */
  function row(k, H) { var x = TX.s(k, H[k]); return '<div class="svt-r">' + ic(k) + '<span class="svt-tx"><b>' + TX.n(k, H[k]) + '</b>' + (x ? '<span class="svt-sub">' + x + '</span>' : sub(k, H[k])) + '</span>' + btn(k, H[k], "sv-cn svt-b") + '</div>'; }
  var V = {
    a: function (H) { return (TX.l ? '<p class="svt-lead">' + TX.l + '</p>' : "") + '<div class="svt-grp">' + row("ring", H) + row("ah", H) + '</div>' + (TX.f ? '<p class="svt-ft">' + TX.f + '</p>' : ""); },
    b: function (H) { return '<p class="svt-lead">' + LEAD.order + '</p><div class="svt-cards">' + row("ring", H) + row("ah", H) + '</div>' + FOOT; },
    c: function (H) {
      var r = function (k) { return '<div class="svt-r">' + ic(k) + '<span class="svt-tx">' + name(k, H[k], true) + sub(k, H[k], true) + '</span>' + btn(k, H[k], "svt-t") + '</div>'; };
      return '<p class="svt-lead">' + LEAD.fill + '</p><div class="svt-plain">' + r("ring") + r("ah") + '</div>';
    },
    d: function (H) {
      var r = function (k) {
        return H[k] ? '<div class="svt-r">' + ic(k) + '<span class="svt-tx">' + name(k) + sub(k, true) + '</span><button class="svt-ib" data-sv="sync" data-dev="' + k + '" aria-label="Sync ' + NAME[k] + '">' + SYNC + '</button></div>'
          : '<button class="svt-r svt-go" data-svt-go="' + k + '">' + ic(k) + '<span class="svt-tx"><b>Connect ' + NAME[k] + '</b><span class="svt-sub">' + WHY[k] + '</span></span>' + CHEV + '</button>';
      };
      return '<p class="svt-lead">' + LEAD.order + '</p><div class="svt-plain">' + r("ring") + r("ah") + '</div>' + FOOT;
    }
  };

  SVX.track = function (c) {
    C = c; css();
    var v = V[c.Q.get("strack")] ? c.Q.get("strack") : "a";
    var bx = c.Q.get("stbox") === "b" ? " bx-b" : " bx-a";   /* the rows' container (20 Nov 2026): a one soft card (default), b a soft card each */
    c.open("svTrack", v === "a" ? TX.t : "Track sleep from", '<div class="svt v-' + v + bx + '">' + V[v](c.HAS || {}) + '</div>');
  };

  document.addEventListener("click", function (e) {
    var go = e.target.closest && e.target.closest("#svTrack [data-svt-go]");
    if (go && C) { var k = go.dataset.svtGo, c = C; if (k === "ring" && window.RingReady) return window.RingReady(function () { c.connect("ring"); }); c.connect(k); }   /* the ring: get ready first */
  });

  function css() {
    if (document.getElementById("svTrackCss")) return;
    var s = document.createElement("style"); s.id = "svTrackCss";
    s.textContent = [
      ".svt{display:flex;flex-direction:column;gap:16px;padding-top:4px}",
      ".svt-lead{margin:0;font:400 15px/22px Roboto,sans-serif;color:#475467}",
      ".svt-ft{margin:0;font:400 14px/20px Roboto,sans-serif;color:#667085}",
      ".svt-r{display:flex;align-items:center;gap:12px;min-height:44px}",
      ".svt-ic{flex:none;width:40px;height:40px;border-radius:12px;border:1px solid #EAECF0;background:#fff;display:grid;place-items:center}.svt-ic img{max-width:22px;max-height:24px}",
      ".svt-tx{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}",
      ".svt-tx b{display:flex;align-items:center;gap:8px;font:600 16px/22px Roboto,sans-serif;color:#101828}",
      ".svt-sub{display:flex;align-items:center;gap:6px;font:400 14px/20px Roboto,sans-serif;color:#667085}",
      ".svt-dot{flex:none;width:8px;height:8px;border-radius:50%;background:#12B76A;box-shadow:0 0 0 3px #D1FADF}",
      ".svt-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}",
      ".svt-b{height:40px;min-width:92px}",
      ".svt-sy{display:inline-flex;align-items:center;justify-content:center;gap:6px}.svt-sy svg{width:16px;height:16px}",
      ".svt-pri{height:40px;min-width:92px;margin-bottom:4px;padding:0 16px;border:0;border-radius:8px;background:var(--brand-600);color:#fff;font:600 15px/1 Roboto,sans-serif;cursor:pointer;box-shadow:0 4px 0 var(--brand-700);transition:transform .15s ease-out,box-shadow .15s ease-out}.svt-pri:active{transform:translateY(4px);box-shadow:none}.svt-pri:focus-visible{outline:2px solid var(--in-500);outline-offset:2px}",   /* .sv-cn, the sheet's secondary button; 40 + 4 ledge = 44 */
      ".svt button:focus-visible{outline:2px solid #444CE7;outline-offset:2px}",
      /* A: one group, hairline between */
      ".svt-grp{border:1px solid #EAECF0;border-radius:16px;background:#fff}",
      /* more room for the words (20 Nov 2026): tighter padding, a smaller tile, buttons only as wide as their word */
      ".svt-grp .svt-r{padding:14px 12px;gap:10px}.svt-grp .svt-ic{width:36px;height:36px;border-radius:10px}.svt-grp .svt-ic img{max-width:20px;max-height:22px}",
      ".svt-grp .svt-b,.svt-grp .svt-pri{min-width:0;padding:0 14px}.svt-grp .svt-tx b{font-size:15px;line-height:21px}",
      /* minimal: no box, the rows sit on the sheet with one inset hairline between them (20 Nov 2026) */
      ".svt.v-a .svt-grp{border:0;border-radius:0;background:none}.svt.v-a .svt-grp .svt-r{padding:12px 0;align-items:flex-start}.svt.v-a .svt-grp .svt-r+.svt-r{border-top:0;position:relative}.svt.v-a .svt-grp .svt-r+.svt-r::before{content:'';position:absolute;top:0;left:46px;right:0;border-top:1px solid #E0EAFF}",
      ".svt.v-a.bx-a .svt-grp .svt-r{padding:18px 0}",   /* more air between the two devices (20 Nov 2026) */
      ".svt.v-a.bx-a .svt-grp{padding:2px 16px;border:1px solid #E0EAFF;border-radius:20px;background:linear-gradient(180deg,#F5F8FF 0%,#FFFFFF 100%);box-shadow:0 1px 2px rgba(16,24,40,.04)}",
      ".svt.v-a.bx-b .svt-grp{display:flex;flex-direction:column;gap:10px}.svt.v-a.bx-b .svt-grp .svt-r{padding:14px 16px;border:1px solid #E0EAFF;border-radius:18px;background:linear-gradient(180deg,#F5F8FF 0%,#FFFFFF 100%)}.svt.v-a.bx-b .svt-grp .svt-r+.svt-r::before{display:none}",
      ".svt.v-a .svt-grp .svt-ic{margin-top:2px}.svt.v-a .svt-grp .svt-b,.svt.v-a .svt-grp .svt-pri{align-self:center}",
      ".svt-grp .svt-r{padding:14px 16px}.svt-grp .svt-r+.svt-r{border-top:1px solid #EAECF0}",
      /* B: two cards */
      ".svt-cards{display:flex;flex-direction:column;gap:12px}.svt-cards .svt-r{padding:16px;border:1px solid #EAECF0;border-radius:16px;background:#fff}",
      /* C and D: plain rows with a hairline */
      ".svt-plain{display:flex;flex-direction:column}.svt-plain .svt-r{padding:12px 0}.svt-plain .svt-r+.svt-r{border-top:1px solid #EAECF0}",
      ".svt-t{flex:none;min-width:64px;height:44px;margin-right:-12px;padding:0 12px;border:0;border-radius:10px;background:none;color:#299D6B;font:700 15px/1 Roboto,sans-serif;cursor:pointer;transition:background .2s ease-out}.svt-t:active{background:#F3FCF8}",
      ".svt-ib{flex:none;width:44px;height:44px;border:1px solid #EAECF0;border-radius:50%;background:#fff;color:#299D6B;display:grid;place-items:center;cursor:pointer;transition:background .2s ease-out}.svt-ib svg{width:20px;height:20px}.svt-ib:active{background:#F3FCF8}",
      ".svt-go{width:100%;border:0;background:none;text-align:left;font:inherit;cursor:pointer;transition:background .2s ease-out}.svt-go:active{background:#F9FAFB}.svt-go b{color:#299D6B}.svt-go>svg{flex:none;width:20px;height:20px;color:#98A2B3}",
      "@media (prefers-reduced-motion: reduce){.svt-t,.svt-ib,.svt-go{transition:none}}"
    ].join("\n");
    document.head.appendChild(s);
  }
})();
