/* lib-pl.js: all breathing exercises for PLAN users (?vlibp=a..e, 17 Nov 2026). Plan users already breathe from their coach's plan,
   so the library comes in quieter than the free users' stacked K3 cards: one slim horizontal rail, the same scene art
   cropped to the figure, name, pattern and minutes, with Start and Know more. It sits after the plan.
   Start: an exercise that is in the plan opens the plan's own player (it counts towards the Rhythm, as the row does);
   any other opens the library player, which does not count (the Rhythm is the coach's plan).
   Know more opens the shared info sheet (BLIB.info).
     a  Slim scene cards (recommended): 164 px cards, the figure on top, Start and an info button underneath; plan ones last, marked
     b  Thumb cards: wider and shorter, a square figure thumb on the left, Start and Know more as two quiet links
     c  Small chips: no footer, the card opens Know more, a round play button starts; the least weight
     d  In one card: the rail sits inside a single indigo plan card ("More breathing"), glass tiles like the score's
     e  Folded (Shaheer's pick): one slim row "More breathing exercises / Additional exercises to try" that opens a full screen,
        "All breathing exercises", with the free users' K3 cards, a back arrow and no bottom nav */
(function () {
  var MD = window.MDPLAN; if (!MD || !window.BLIB) return;
  var INFO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>';
  var PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.6v12.8a1 1 0 0 0 1.5.86l10.2-6.4a1 1 0 0 0 0-1.72L9.5 4.74A1 1 0 0 0 8 5.6z" fill="currentColor"/></svg>';
  var CHEV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>';
  var TICK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
  /* where the person sits in each scene (icons/mind/breath/<key>.webp, 1376 x 768): across, and down to the chest */
  /* measured on the images: the person's chest (Belly lies on the floor, 4-7-8 is in bed, Extended Exhale sits in a chair) */
  var FX = { coherent: .76, sleep: .56, box: .70, exhale: .63, belly: .72, hum: .79, pursed: .64 };
  var FY = { coherent: .55, sleep: .62, box: .46, exhale: .50, belly: .74, hum: .55, pursed: .38 };
  /* the pattern as its seconds, "4-7-8", so it fits a slim card on one line; the sheet spells it out */
  var sec = function (b) { return b.seq.map(function (x) { return x.s; }).join("-"); };
  var nm = function (b) { return b.name.replace(/\s*\(.*\)$/, ""); };
  /* the scene cropped so the figure fills a W x H box: zoom z times the box width, figure centred */
  function scene(k, W, H, z) {
    var bw = Math.round(W * z), bh = Math.round(bw * 768 / 1376);
    return "background:url(/v7/icons/mind/breath/" + k + ".webp?v=1) " + Math.round(W / 2 - FX[k] * bw) + "px " + Math.round(H * .56 - FY[k] * bh) + "px / " + bw + "px " + bh + "px no-repeat #F5F8FF";
  }
  /* the plan row for an exercise in the plan, so Start opens the plan's player */
  function planRow(b) {
    var n = b.name.toLowerCase(), i = -1;
    (MD.P.br || []).forEach(function (x, j) { var p = (x.n || "").toLowerCase(); if (i < 0 && (p === n || (b.key === "coherent" && /coherent|simple/.test(p)))) i = j; });
    return i;
  }
  function startAttr(b) { var i = b.inPlan ? planRow(b) : -1; return i >= 0 ? 'data-blpr="' + i + '"' : 'data-blplay="' + b.key + '"'; }
  /* on window, so it runs before lib.js's document handler (a chip that opens Know more can hold a plan Start) */
  window.addEventListener("click", function (e) {
    var t = e.target.closest && e.target.closest("[data-blpr]"); if (!t) return;
    e.preventDefault(); e.stopPropagation();
    if (window.MDVAR && MDVAR.open && MDVAR.open.br) MDVAR.open.br("br:" + t.dataset.blpr);
  }, true);
  /* the plan's own exercises go last: they are already in the plan above */
  function order(B) { return B.list.filter(function (b) { return !b.inPlan; }).concat(B.list.filter(function (b) { return b.inPlan; })); }
  var SUB = "Extra ones to try any time. Only your plan’s breathing counts towards your Rhythm.";
  var head = function (t) { return '<div class="blp-hd"><h2 class="gf-h">' + (t || "More breathing exercises") + '</h2></div><p class="blp-sub">' + SUB + '</p>'; };
  var ipTag = '<span class="blp-ip">' + TICK + 'In your plan</span>';

  var css = document.createElement("style");
  css.textContent = [
    ".blp-hd{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 0 4px}.blp-hd h2{margin:0}",
    ".blp-sub{margin:0 0 12px;font:400 12px/16px Roboto;color:var(--g-500)}",
    ".blp-rail{display:flex;gap:12px;margin:0 calc(var(--gut) * -1);padding:4px var(--gut) 12px;overflow-x:auto;scroll-snap-type:x mandatory;scroll-padding:0 var(--gut);scrollbar-width:none;-webkit-overflow-scrolling:touch}",
    ".blp-rail::-webkit-scrollbar{display:none}",
    ".blp-ip{display:inline-flex;align-items:center;gap:4px;height:22px;padding:0 8px;border-radius:6px;border:1px solid transparent;font:400 12px/14px Roboto,sans-serif;letter-spacing:.25px;white-space:nowrap;vertical-align:middle;color:#826E2D;background:linear-gradient(90deg,#FEF1C7,#FFFBEE 30%,#FFFBEE 70%,#FEF1C7) padding-box,conic-gradient(from 180deg,#826E2D,#E7C144 25%,#E7C144 50%,#826E2D 75%,#E7C144) border-box}.blp-ip svg{width:12px;height:12px}",
    /* shared buttons: Start (brand, play glyph), the info button (quiet grey) */
    ".blp-go{position:relative;display:inline-flex;align-items:center;gap:4px;height:32px;padding:0 4px;margin-left:-4px;border:0;background:none;border-radius:var(--r-sm);font:600 14px/20px Roboto;color:var(--brand-600);cursor:pointer}",
    ".blp-go::after{content:'';position:absolute;inset:-6px -4px}.blp-go svg{width:16px;height:16px}.blp-go:active{background:var(--g-50)}",
    ".blp-ib{position:relative;display:grid;place-items:center;width:32px;height:32px;margin-right:-6px;border:0;background:none;border-radius:50%;color:var(--g-500);cursor:pointer}.blp-ib svg{width:18px;height:18px}.blp-ib::after{content:'';position:absolute;inset:-6px}",
    /* a: slim scene cards */
    ".blpa-t{flex:0 0 164px;scroll-snap-align:start;display:flex;flex-direction:column;border-radius:20px;overflow:hidden;background:#fff;border:1px solid var(--in-100);box-shadow:2px 2px 0 var(--g-200)}",
    ".blpa-art{display:block;height:84px;border:0;padding:0;cursor:pointer;-webkit-mask:linear-gradient(180deg,#000 70%,transparent)}",
    ".blpa-b{padding:8px 12px 0;flex:1;cursor:pointer}.blpa-n{font:600 14px/20px Roboto;color:var(--g-900)}.blpa-s{margin-top:2px;font:400 12px/16px Roboto;color:var(--g-500);font-variant-numeric:tabular-nums}",
    ".blpa-f{display:flex;align-items:center;justify-content:space-between;margin:8px 12px 0;padding:4px 0;min-height:44px;border-top:1px solid var(--g-100)}",
    ".blpa-t.ip{background:linear-gradient(180deg,var(--in-25),#fff 60%)}",
    /* b: thumb cards */
    ".blpb-t{flex:0 0 284px;scroll-snap-align:start;display:flex;gap:12px;padding:12px;border-radius:16px;background:#fff;border:1px solid var(--in-100);box-shadow:2px 2px 0 var(--g-200)}",
    ".blpb-th{flex:none;width:64px;height:64px;border-radius:12px;border:0;padding:0;cursor:pointer;box-shadow:inset 0 0 0 1px var(--in-100)}",
    ".blpb-b{flex:1;min-width:0;display:flex;flex-direction:column}.blpb-n{font:600 14px/20px Roboto;color:var(--g-900)}.blpb-s{font:400 12px/16px Roboto;color:var(--g-500)}",
    ".blpb-f{display:flex;align-items:center;gap:20px;margin-top:auto;padding-top:4px;min-height:32px}",
    ".blpb-km{position:relative;white-space:nowrap;display:inline-flex;align-items:center;gap:3px;height:32px;padding:0;border:0;background:none;font:400 13px/18px Roboto;color:var(--g-500);cursor:pointer}.blpb-km svg{width:14px;height:14px}.blpb-km::after{content:'';position:absolute;inset:-6px -4px}",
    /* c: small chips */
    ".blpc-t{position:relative;flex:0 0 212px;scroll-snap-align:start;display:flex;align-items:center;gap:10px;min-height:72px;padding:8px 8px 8px 8px;border-radius:16px;background:#fff;border:1px solid var(--in-100);text-align:left;cursor:pointer;font:inherit;color:inherit}",
    ".blpc-av{flex:none;width:44px;height:44px;border-radius:50%;box-shadow:inset 0 0 0 1px var(--in-100)}",
    ".blpc-b{flex:1;min-width:0}.blpc-n{display:block;font:600 13px/17px Roboto;color:var(--g-900)}.blpc-s{display:flex;flex-wrap:wrap;align-items:center;gap:3px;margin-top:2px;font:400 12px/16px Roboto;color:var(--g-500)}.blpc-s svg{width:12px;height:12px}",
    ".blpc-go{position:relative;flex:none;display:grid;place-items:center;width:36px;height:36px;border-radius:50%;border:0;background:var(--brand-600);color:#fff;cursor:pointer}.blpc-go svg{width:16px;height:16px;margin-left:2px}.blpc-go::after{content:'';position:absolute;inset:-4px}",
    /* d: in one card */
    ".blpd-c{border-radius:24px;border:1px solid transparent;box-shadow:2px 2px 0 var(--g-200);background:linear-gradient(180deg,var(--in-50) 0%,#fff 60%) padding-box,conic-gradient(from 0deg,var(--in-600) 0deg,var(--g-200) 43deg,var(--g-200) 317deg,var(--in-600) 360deg) border-box;padding:16px 0 4px}",
    ".blpd-c .blp-hd,.blpd-c .blp-sub{padding:0 16px}.blpd-c .blp-hd h2{font:600 16px/22px Roboto}",
    ".blpd-c .blp-rail{margin:0;padding:4px 16px 12px;scroll-padding:0 16px}",
    ".blpd-t{flex:0 0 140px;scroll-snap-align:start;display:flex;flex-direction:column;border-radius:18px;overflow:hidden;background:rgba(255,255,255,.85);box-shadow:inset 0 0 0 1px rgba(164,188,253,.55)}",
    ".blpd-art{display:block;height:72px;border:0;padding:0;cursor:pointer;margin:4px 4px 0;border-radius:14px}",
    ".blpd-b{padding:6px 10px 0;cursor:pointer}.blpd-n{font:600 13px/18px Roboto;color:var(--g-900)}.blpd-s{font:400 12px/16px Roboto;color:var(--g-500)}",
    ".blpd-f{display:flex;align-items:center;justify-content:space-between;padding:0 10px 2px;min-height:44px}",
    /* e: folded */
    ".blpe-row{display:flex;align-items:center;gap:12px;width:100%;min-height:64px;padding:12px 16px;border-radius:20px;border:1px solid var(--in-100);background:linear-gradient(90deg,var(--in-25),#fff);box-shadow:2px 2px 0 var(--g-200);font:inherit;text-align:left;color:var(--g-900);cursor:pointer}",
    ".blpe-av{display:flex;flex:none}.blpe-av i{width:32px;height:32px;border-radius:50%;border:2px solid #fff;margin-left:-10px}.blpe-av i:first-child{margin-left:0}",
    ".blpe-tx{flex:1;min-width:0}.blpe-tx b{display:block;font:600 15px/20px Roboto}.blpe-tx small{display:block;font:400 12px/16px Roboto;color:var(--g-500)}",
    ".blpe-row>svg{flex:none;width:20px;height:20px;color:var(--g-500)}",
    ".blpe-row:active{transform:translate(1px,1px);box-shadow:1px 1px 0 var(--g-200)}"
  ].join("");
  document.head.appendChild(css);

  function cardA(b) {
    return '<div class="blpa-t' + (b.inPlan ? " ip" : "") + '"><button class="blpa-art" style="' + scene(b.key, 164, 84, 2.1) + '" data-blinfo="' + b.key + '" aria-label="How ' + b.name + ' works"></button>' +
      '<div class="blpa-b" data-blinfo="' + b.key + '"><div class="blpa-n">' + nm(b) + '</div><div class="blpa-s">' + (b.inPlan ? ipTag : sec(b) + ' · ' + b.min + ' min') + '</div></div>' +
      '<div class="blpa-f"><button class="blp-go" ' + startAttr(b) + ' aria-label="Start ' + b.name + '">' + PLAY + 'Start</button>' +
      '<button class="blp-ib" data-blinfo="' + b.key + '" aria-label="Know more about ' + b.name + '">' + INFO + '</button></div></div>';
  }
  function railA(B) { return '<div class="blp-rail">' + order(B).map(cardA).join("") + '</div>'; }

  BLIB.add("pa", { render: function (host, B) { host.className = "gut sect"; host.innerHTML = head() + railA(B); } });

  BLIB.add("pb", { render: function (host, B) {
    host.className = "gut sect";
    host.innerHTML = head() + '<div class="blp-rail">' + order(B).map(function (b) {
      return '<div class="blpb-t"><button class="blpb-th" style="' + scene(b.key, 64, 64, 3.2) + '" data-blinfo="' + b.key + '" aria-label="How ' + b.name + ' works"></button>' +
        '<div class="blpb-b"><div class="blpb-n">' + nm(b) + '</div><div class="blpb-s">' + (b.inPlan ? ipTag : sec(b) + ' · ' + b.min + ' min') + '</div>' +
        '<div class="blpb-f"><button class="blp-go" ' + startAttr(b) + ' aria-label="Start ' + b.name + '">' + PLAY + 'Start</button>' +
        '<button class="blpb-km" data-blinfo="' + b.key + '" aria-label="Know more about ' + b.name + '">' + INFO + 'Know more</button></div></div></div>';
    }).join("") + '</div>';
  } });

  BLIB.add("pc", { render: function (host, B) {
    host.className = "gut sect";
    host.innerHTML = head() + '<div class="blp-rail">' + order(B).map(function (b) {
      return '<div class="blpc-t" role="button" tabindex="0" data-blinfo="' + b.key + '" aria-label="Know more about ' + b.name + '"><span class="blpc-av" style="' + scene(b.key, 44, 44, 3.6) + '"></span>' +
        '<span class="blpc-b"><span class="blpc-n">' + nm(b) + '</span><span class="blpc-s">' + (b.inPlan ? ipTag : sec(b) + ' · ' + b.min + ' min') + '</span></span>' +
        '<button class="blpc-go" ' + startAttr(b) + ' aria-label="Start ' + b.name + '">' + PLAY + '</button></div>';
    }).join("") + '</div>';
  } });

  BLIB.add("pd", { render: function (host, B) {
    host.className = "gut sect";
    host.innerHTML = '<div class="blpd-c">' + head("More breathing") + '<div class="blp-rail">' + order(B).map(function (b) {
      return '<div class="blpd-t"><button class="blpd-art" style="' + scene(b.key, 132, 72, 2.2) + '" data-blinfo="' + b.key + '" aria-label="How ' + b.name + ' works"></button>' +
        '<div class="blpd-b" data-blinfo="' + b.key + '"><div class="blpd-n">' + nm(b) + '</div><div class="blpd-s">' + (b.inPlan ? ipTag : sec(b) + ' · ' + b.min + ' min') + '</div></div>' +
        '<div class="blpd-f"><button class="blp-go" ' + startAttr(b) + ' aria-label="Start ' + b.name + '">' + PLAY + 'Start</button>' +
        '<button class="blp-ib" data-blinfo="' + b.key + '" aria-label="Know more about ' + b.name + '">' + INFO + '</button></div></div>';
    }).join("") + '</div></div>';
  } });

  /* e: one quiet row after the plan; a tap opens its own full screen, "All breathing exercises", with the free users' K3 cards
     (variants/lib-k3.js) under a top bar with a back arrow and no bottom nav. Back returns to the Mind screen where it was:
     the screen is fixed over the page, so the page never scrolls. Picked by Shaheer, 17 Nov 2026 */
  var BACK = '<svg class="backico" viewBox="0 0 22 22" aria-hidden="true"><path fill="currentColor" d="M9.409 3.444c-.015-.015-.473-.13-1.018-.255s-.997-.208-1.004-.185-.064.401-.125.84c-.124.882-.424 1.911-.744 2.555-1 2.006-2.791 3.334-4.964 3.68L1 10.165v1.773l.502.084c3.286.551 5.429 3.008 5.83 6.686.026.24.057.436.069.436.11 0 1.947-.443 1.982-.478.025-.025.006-.25-.042-.5-.531-2.765-2.053-5.015-4.027-5.955l-.474-.226 9.74-.018 6.16-.01v-1.794l-6.176-.011-9.717-.018.598-.303c1.552-.786 2.78-2.328 3.503-4.397.206-.59.517-1.934.46-1.99"/></svg>';
  var RM = matchMedia("(prefers-reduced-motion: reduce)").matches || /[?&]rm=1/.test(location.search);
  var css2 = document.createElement("style");
  css2.textContent = [
    /* the screen: Practices' full-screen view (index.html .pr-view), above the bottom nav (20) and under the sheets (40) and players (300) */
    ".blpe-scr{position:fixed;top:0;bottom:0;left:50%;width:100%;max-width:390px;transform:translateX(-50%);z-index:30;background:#fff;display:flex;flex-direction:column;padding-top:44px}",
    ".blpe-scr[hidden]{display:none}",
    ".blpe-scr.anim{animation:blpeIn .32s cubic-bezier(.2,0,0,1)}.blpe-scr.out{animation:blpeOut .24s cubic-bezier(.4,0,1,1) forwards}",
    "@keyframes blpeIn{from{transform:translateX(-50%) translateX(24px);opacity:0}to{transform:translateX(-50%);opacity:1}}",
    "@keyframes blpeOut{to{transform:translateX(-50%) translateX(24px);opacity:0}}",
    ".blpe-bar{flex:none;display:flex;align-items:center;gap:4px;height:56px;padding:0 8px;border-bottom:1px solid var(--g-100)}",
    ".blpe-back{display:grid;place-items:center;width:44px;height:44px;border:0;background:none;border-radius:50%;color:var(--g-900);cursor:pointer}.blpe-back:active{background:var(--g-50)}",
    ".blpe-bar h1{margin:0;font:600 18px/24px Roboto;color:var(--g-900)}",
    ".blpe-sc{flex:1;overflow-y:auto;overscroll-behavior:contain;padding:16px 0 40px}",
    ".blpe-sc #blpeK3{margin-top:0}.blpe-sc .blk3-hd{display:none}.blpe-sc .blk3-intro{margin-bottom:16px;font-size:14px;line-height:20px}"
  ].join("");
  document.head.appendChild(css2);

  function screen(B) {
    var scr = document.getElementById("blpeScr");
    if (!scr) {
      scr = document.createElement("section"); scr.id = "blpeScr"; scr.className = "blpe-scr"; scr.hidden = true;
      scr.setAttribute("role", "dialog"); scr.setAttribute("aria-modal", "true"); scr.setAttribute("aria-labelledby", "blpeT");
      scr.innerHTML = '<div class="blpe-bar"><button class="blpe-back" aria-label="Back">' + BACK + '</button><h1 id="blpeT">All breathing exercises</h1></div><div class="blpe-sc"><div id="blpeK3"></div></div>';
      document.body.appendChild(scr);
      var host = scr.querySelector("#blpeK3");
      if (BLIB.V.k3) BLIB.V.k3.render(host, B); else host.innerHTML = railA(B);
      host.className = "gut";
      var intro = host.querySelector(".blk3-intro"); if (intro) intro.textContent = SUB;
      /* a plan exercise starts the plan's own player, so it counts towards the Rhythm as the row does */
      B.list.forEach(function (b) {
        if (!b.inPlan) return; var i = planRow(b), go = host.querySelector('[data-blplay="' + b.key + '"]');
        if (go && i >= 0) { go.removeAttribute("data-blplay"); go.setAttribute("data-blpr", i); }
      });
      scr.querySelector(".blpe-back").onclick = function () { close(scr); };
      document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !scr.hidden && !document.querySelector(".scrim.on, .bl-pl, .bf.on")) close(scr); });
    }
    return scr;
  }
  /* focus moves to Back only when opened from the keyboard, so a tap opens it without a focus ring */
  function open(B, row, kb) {
    var scr = screen(B); scr._row = row; scr.hidden = false; scr.querySelector(".blpe-sc").scrollTop = 0;
    scr.classList.remove("out"); if (!RM) { scr.classList.remove("anim"); void scr.offsetWidth; scr.classList.add("anim"); }
    if (kb) scr.querySelector(".blpe-back").focus({ preventScroll: true });
  }
  function close(scr) {
    var done = function () { scr.hidden = true; scr.classList.remove("out", "anim"); if (scr._row) scr._row.focus({ preventScroll: true }); };
    if (RM) return done();
    scr.classList.add("out"); setTimeout(done, 240);
  }

  BLIB.add("pe", { render: function (host, B) {
    host.className = "gut sect";
    var extra = B.list.filter(function (b) { return !b.inPlan; });
    host.innerHTML = '<button class="blpe-row" aria-haspopup="dialog"><span class="blpe-av">' + extra.slice(0, 3).map(function (b) { return '<i style="' + scene(b.key, 32, 32, 3.6) + '"></i>'; }).join("") + '</span>' +
      '<span class="blpe-tx"><b>More breathing exercises</b><small>Additional exercises to try</small></span>' + CHEV + '</button>';
    var row = host.querySelector(".blpe-row");
    row.onclick = function (e) { open(B, row, e.detail === 0); };
    if (/[?&]lopen=1/.test(location.search)) open(B, row);
  } });
})();
