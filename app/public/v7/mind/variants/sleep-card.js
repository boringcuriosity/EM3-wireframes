/* sleep-card.js (?sx=1): the Last night card as one family across its four states, ?sfam=a|b|c|d|e (c by default: Shaheer picked Zz, then Moon disc, 19 Nov; b, d, e dropped, code kept).
   Every state shares one frame: the family's sleep picture top left, a title and a line beside it, the three dots top right,
   then the content (button, loader, fixes or the night), then a source strip under the card.
   SVX.frame draws that frame for this file (empty, filled) and for sleep-load.js (loading, not found). */
(function () {
  window.SVX = window.SVX || {};
  var Q = new URLSearchParams(location.search), FK = /^[a-e]$/.test(Q.get("sfam") || "") ? Q.get("sfam") : "c";
  SVX.fam = FK;

  /* the night scene, the moon window cropped out of it for D's tile (1024 x 572 picture, its window pane x 720 to 870, the moon centred) */
  var BG = "/v7/icons/mind/bg/night.webp?v=1";
  var STAR = '<svg viewBox="0 0 10 10" aria-hidden="true"><path fill="currentColor" d="M5 0c.4 2.6 1 4.2 5 5-4 .8-4.6 2.4-5 5-.4-2.6-1-4.2-5-5 4-.8 4.6-2.4 5-5Z"/></svg>';

  var FAM = {
    /* A, Moon disc: the indigo moon disc from round one's C1 sits top left in every state */
    a: { pic: function (c) { return '<span class="svf-pic svf-mo" aria-hidden="true">' + c.MOONF + '<i class="st">' + STAR + '</i></span>'; } },
    /* B, Night scene: Mind's night picture fills the right of the header in every state, the words sit on its light side */
    b: { pic: function () { return '<span class="svf-sky" aria-hidden="true"></span>'; } },
    /* C, Zz: GoodFlip's Sleep pictogram top left in every state */
    c: { pic: function () { return '<img class="svf-pic svf-zz" src="/v7/icons/pictograms/Sleep.png" alt="">'; } },
    /* D, Window and bar: the moon window from the night scene as a small tile, and the coach's sleep window bar in every state */
    d: { pic: function () { return '<span class="svf-pic svf-win" aria-hidden="true"></span>'; }, bar: true },
    /* E, Zz and bar: C's pictogram with D's sleep window bar in every state */
    e: { pic: function (c) { return FAM.c.pic(c); }, bar: true }
  };
  SVX.famBar = !!FAM[FK].bar;

  /* the frame: o = { st: empty|load|nf|full, title, sub, body, attrs, tail } */
  SVX.frame = function (c, o) {
    css();
    return '<div class="mv-sc sv-sc svf svf-' + FK + ' svf-' + o.st + '"' + (o.attrs || "") + '>' +
      '<div class="svf-hd">' + FAM[FK].pic(c) + '<div class="t">' + o.title + (o.sub ? '<div class="svf-s">' + o.sub + '</div>' : "") + '</div>' + c.MENU + '</div>' +
      (o.body || "") + '</div>' + (o.tail || "");
  };
  /* the strip under the card, the same shape the filled card's source strip has */
  SVX.tail = function (c, at, attrs) {
    var ic = c.RING ? c.RINGI : '<i class="hk"></i>';
    return '<div class="mv-sync svf-tail"' + (attrs || "") + '><span class="src">' + ic + '<span class="vt">From ' + c.NAME + '</span></span><span class="at">' + at + '</span></div>';
  };

  /* the source strip, one piece for every state (Shaheer, 20 Nov 2026): always tappable. The left part opens Track sleep
     from; once a device is connected a tertiary text action sits at the right end and the time moves left.
     ?sst=a Synced 7:22 AM + Sync Now   b Apple Health · 7:22 AM + Sync with its icon   c Last synced 7:22 AM + Manage (default)
     d Synced 7:22 AM + a round sync icon. k: none (nothing connected) | sync | ok | miss (ring had no data) | manual */
  /* the house edit icon, filled, for Added by you (Shaheer, 20 Nov 2026): its outline as one solid shape, a white line where the tip meets the body */
  var PENF = '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path fill="currentColor" d="m14.208 4.586-2.794-2.793a1 1 0 0 0-1.414 0L2.293 9.5a1 1 0 0 0-.293.707V13a1 1 0 0 0 1 1h10.5a.5.5 0 0 0 0-1H7.208l7-7a1 1 0 0 0 0-1.414"/><path d="m8.6 4.6 2.8 2.8" stroke="#fff" stroke-width="1.1" stroke-linecap="round"/></svg>';
  var SST = /^[abcd]$/.test(Q.get("sst") || "") ? Q.get("sst") : "c";   /* C, Manage, picked 20 Nov 2026 */
  var SYI = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 11a8 8 0 0 0-14.3-4.9L4 8M4 4v4h4M4 13a8 8 0 0 0 14.3 4.9L20 16M20 20v-4h-4"/></svg>';
  SVX.strip = function (c, k, at) {
    css();
    var any = c.HAS.ring || c.HAS.ah, dev = c.RING ? "ring" : "ah", ic = c.RING ? c.RINGI : '<i class="hk"></i>', nm = c.RING ? "your Arc ring" : "Apple Health";
    if (k === "none" || (k === "manual" && !any && SST !== "a" && SST !== "b" && false)) return '<button class="mv-sync svf-tail svf-trk" data-sv="track"><span class="src"><img src="/v7/icons/health/apple-health-heart.png" alt=""><img src="/v7/icons/mind/arc-ring.png" alt=""><span class="vt">Track sleep automatically</span></span>' + c.IC.chev + '</button>';
    var cta = function (t, a, x) { return '<button class="svs-cta' + (x || "") + '" data-sv="' + a + '"' + (a === "sync" ? ' data-dev="' + dev + '"' : "") + '>' + t + '</button>'; };
    var left, right = "", lab;
    if (k === "sync") { left = ic + '<span class="sv-syn"><i class="svl-spin" aria-hidden="true"></i>Syncing with ' + nm + '</span>'; lab = "Syncing. Track sleep from"; }
    else if (k === "nf") {   /* synced, nothing for last night. ?snfs=a No sleep data found · 7:44 AM + Manage (default)   b Nothing from Apple Health yet + Try Again   c Checked 7:22 AM, no sleep yet + Manage */
      var NF = /^[abc]$/.test(Q.get("snfs") || "") ? Q.get("snfs") : "a", RF = { range: "Ring not nearby", battery: "Ring battery low", worn: "No sleep on your ring" }[c.ringFail];
      var nt = (Q.get("sreason") === "1" && RF) || (NF === "b" ? (c.RING ? "Nothing from your ring yet" : "Nothing from Apple Health yet") : NF === "c" ? "Checked 7:22 AM, no sleep yet" : "No sleep data found \u00b7 7:44 AM");   /* the time we last checked (Shaheer, 20 Nov 2026) */
      left = ic + '<span>' + nt + '</span>'; lab = nt + ". Track sleep from";
      right = NF === "b" ? cta("Try Again", "sync") : cta("Manage", "track");
    }
    else if (k === "manual") { at = at || "7:12 AM"; left = '<i class="hk sv-me">' + PENF + '</i><span>Added by you, ' + at + '</span>'; lab = "Added by you at " + at + ". Track sleep from"; if (!any) right = cta(({ b: "Auto Track", c: "Add Device" })[Q.get("smc")] || "Connect", "track");   /* shorter, and the same word the Track sleep from sheet uses (20 Nov 2026); ?smc=b|c */ }
    else {
      at = at || "7:22 AM";
      var t = k === "miss" ? "From Apple Health, " + at : SST === "b" ? (c.RING ? "Arc ring" : "Apple Health") + " \u00b7 " + at : SST === "c" ? "Last synced " + at : "Synced " + at;
      left = ic + '<span>' + t + '</span>'; lab = "From " + c.NAME + ", synced " + at + ". Track sleep from";
      right = SST === "c" ? cta("Manage", "track") : SST === "d" ? '<button class="svs-ib" data-sv="sync" data-dev="' + dev + '" aria-label="Sync now">' + SYI + '</button>' : cta(SST === "b" ? SYI + "Sync" : "Sync Now", "sync", SST === "b" ? " ic" : "");
    }
    return '<div class="mv-sync svf-tail svs svs-' + SST + '"><button class="svs-l" data-sv="track" aria-label="' + lab + '">' + left + '</button>' + right + '</div>';
  };

  /* empty: nothing tracks sleep, they log it */
  /* the card's words (Shaheer, 20 Nov 2026): conversational, tell rather than ask. ?scopy=1..3 the title, ?ssub=1..3 the line */
  var TT = ["Tell us how you slept", "Morning! Tell us about your night", "Share your night with us"];
  var SS = ["Logging your sleep helps your Rhythm score grow.", "Share when you slept and woke, and watch your Rhythm score grow.", "A quick note on your night helps your Rhythm score grow."];
  var CP = [TT[(+Q.get("scopy") || 1) - 1] || TT[0], SS[(+Q.get("ssub") || 1) - 1] || SS[0], "Log Last Night’s Sleep"];
  SVX.card = function (c, tail) {
    var why = c.noplan && !/^free/.test(Q.get("state") || "") ? "Your coach uses it to shape your sleep plan." : CP[1];   /* free users have no coach */
    return SVX.frame(c, { st: "empty", title: '<div class="svf-h">' + CP[0] + '</div>', sub: why,
      body: (SVX.famBar ? c.bar(null, {}) : "") + '<button class="gf-btn" data-sv="edit">' + CP[2] + '</button>',
      tail: tail || SVX.strip(c, "none") });
  };

  /* filled: the hours take the title's place; the times, the bar and the notes follow as before */
  SVX.full = function (c, n, parts) {
    var i = parts.head.indexOf('<div class="jh-r">'), rest = i < 0 ? "" : parts.head.slice(i);
    return SVX.frame(c, { st: "full", title: '<div class="mv-big">' + c.dur(c.len(n)) + ' <span>of sleep</span></div>', body: rest + parts.bar + parts.notes });
  };

  function css() {
    if (document.getElementById("svFamCss")) return;
    var E = "cubic-bezier(.4,0,.2,1)", s = document.createElement("style"); s.id = "svFamCss";
    s.textContent = [
      /* the shared frame */
      ".svf{position:relative;isolation:isolate;overflow:hidden;gap:16px}",
      ".svf-hd{position:relative;display:flex;align-items:flex-start;gap:12px;min-height:48px}.svf-hd .t{flex:1;min-width:0;align-self:center}",
      ".svf-h{font:600 16px/22px Roboto,sans-serif;color:var(--g-900);text-wrap:balance}",
      ".svf-s{font:400 13px/18px Roboto,sans-serif;color:var(--g-600);margin-top:4px;text-wrap:pretty}",
      ".svf-hd .mv-big{line-height:34px}",
      ".svf .sv-dots{width:44px;height:44px;margin:-8px -12px 0 -4px}",
      ".svf .sv-dots:focus-visible,.svf .gf-btn:focus-visible,.svf-tail:focus-visible{outline:2px solid var(--in-500);outline-offset:2px}",
      ".svf .gf-btn{margin:0 0 7px;font-size:15px}",
      ".svf .jh-r{margin-top:-4px}",
      ".svf-pic{flex:none;width:48px;height:48px}",
      /* under the card: the Track sleep automatically row has the source strip's shape */
      ".svf-tail .at{color:var(--g-500)}",
      ".svf-trk{color:var(--g-800)}.svf-trk .src{flex:1}.svf-trk img{width:20px;height:20px;border-radius:6px;object-fit:contain;background:#fff;box-shadow:0 0 0 1px var(--g-200)}.svf-trk img+img{margin-left:-4px}",
      ".svf-trk svg{width:16px;height:16px;color:var(--g-400)}.svf-trk:active{background:var(--g-50)}button.svf-tail{min-height:44px}",
      /* A: the moon disc, one gold star twinkling slowly */
      ".svf-mo{position:relative;border-radius:50%;display:grid;place-items:center;color:#fff;background:linear-gradient(145deg,var(--in-400),var(--in-700));box-shadow:inset 0 -3px 0 rgba(45,49,166,.35)}",
      ".svf-mo svg.mn,.svf-mo>svg{width:22px;height:22px}",
      ".svf-mo .st{position:absolute;top:-2px;right:-3px;width:9px;height:9px;color:var(--gold-600);animation:svfTw 5s " + E + " infinite}.svf-mo .st svg{width:100%;height:100%;display:block}",
      "@keyframes svfTw{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.35;transform:scale(.7)}}",
      /* B: the night scene behind the header, fading out to the left and down */
      ".svf-sky{position:absolute;z-index:-1;top:-16px;right:-16px;width:240px;height:132px;background:url(" + BG + ") right top/auto 100% no-repeat;opacity:.7;-webkit-mask-image:linear-gradient(90deg,transparent,#000 55%),linear-gradient(180deg,#000 55%,transparent);-webkit-mask-composite:source-in;mask-image:linear-gradient(90deg,transparent,#000 55%),linear-gradient(180deg,#000 55%,transparent);mask-composite:intersect}",
      ".svf-b .svf-hd{min-height:80px}.svf-b .svf-hd .t{max-width:64%;align-self:flex-start;padding-top:4px}.svf-b .sv-dots{background:rgba(255,255,255,.7)}",
      /* C: the zz pictogram */
      ".svf-zz{object-fit:contain;margin:-2px -2px -2px -4px;width:52px;height:52px}",
      /* D: the moon window tile */
      ".svf-win{border-radius:14px;background:linear-gradient(rgba(68,76,231,.1),rgba(68,76,231,.1)),url(" + BG + ") -279px -19px/400px auto no-repeat #E9E8F8;box-shadow:inset 0 0 0 1px rgba(68,76,231,.14);filter:saturate(1.5) contrast(1.06)}",
      /* the strip: the left part opens Track sleep from, the right end is a tertiary action */
      ".svs{gap:4px;padding-top:18px;padding-bottom:2px;padding-right:8px}",
      ".svs-l{flex:1;min-width:0;display:flex;align-items:center;gap:8px;min-height:44px;padding:0;border:0;background:none;font:400 14px/20px Roboto,sans-serif;color:var(--g-700);text-align:left;cursor:pointer;-webkit-tap-highlight-color:transparent}",
      ".svs-l>span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.svs-l .sv-syn{display:inline-flex;align-items:center;gap:6px}",
      ".svs-cta{flex:none;display:inline-flex;align-items:center;gap:6px;min-height:44px;padding:0 8px;border:0;background:none;color:var(--brand-600);font:600 14px/20px Roboto,sans-serif;cursor:pointer;-webkit-tap-highlight-color:transparent}.svs-cta svg{width:16px;height:16px}",
      ".svs-ib{flex:none;width:44px;height:44px;display:grid;place-items:center;border:0;border-radius:50%;background:none;color:var(--brand-600);cursor:pointer}.svs-ib svg{width:20px;height:20px}.svs-ib:active,.svs-cta:active{opacity:.6}",
      ".svs-l:focus-visible,.svs-cta:focus-visible,.svs-ib:focus-visible{outline:2px solid var(--in-500);outline-offset:2px;border-radius:8px}",
      "@media (prefers-reduced-motion:reduce){.svf-mo .st{animation:none!important}}"
    ].join("\n");
    document.head.appendChild(s);
  }
})();
