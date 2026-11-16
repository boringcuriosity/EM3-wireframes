/* "All breathing exercises", variant l: Mind scene cards.
   Image-forward session cards, as a meditation app lays them out: the Mind scene fills the top of the card (the soft
   indigo and lavender world of the plan cards), title, pattern and minutes sit below on white. Exercises that share a
   scene get a different crop of it (one wide, one close on the person), so no two cards look alike. Start is the green
   play disc beside the minutes; the rest of the card opens the info sheet. */
(function () {
  var CHEV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>';
  var PLAY = '<svg viewBox="0 0 24 24"><path d="M8 5.6v12.8a1 1 0 0 0 1.5.86l10.2-6.4a1 1 0 0 0 0-1.72L9.5 4.74A1 1 0 0 0 8 5.6z" fill="currentColor"/></svg>';
  /* scene and crop for each: [scene, width of the image in px, x, y] on a 232 x 136 picture */
  var CROP = {
    coherent: ["morning", 248, -12, 0], box: ["morning", 380, -148, -72],
    pursed: ["afternoon", 248, -12, 0], belly: ["afternoon", 380, -148, -74],
    exhale: ["evening", 248, -12, 0], hum: ["evening", 380, -148, -70],
    sleep: ["night", 300, -54, -10]
  };
  var nm = function (b) { return b.name.replace(/\s*\(.*\)$/, ""); };
  var bg = function (k, w) { var c = CROP[k], z = (w || 232) / 232; return "url(/v7/icons/mind/bg/" + c[0] + ".webp?v=1) " + c[2] * z + "px " + c[3] * z + "px / " + c[1] * z + "px auto no-repeat"; };

  var css = document.createElement("style");
  css.textContent = [
    ".bll-hd{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 0 4px}.bll-hd h2{margin:0}",
    ".bll-all{position:relative;display:inline-flex;align-items:center;gap:2px;height:32px;padding:0;border:0;background:none;font:600 14px/20px Roboto;color:var(--brand-600);cursor:pointer}",
    ".bll-all::after{content:'';position:absolute;inset:-6px -8px}.bll-all svg{width:18px;height:18px}",
    ".bll-intro{margin:0 0 12px;font:400 12px/16px Roboto;color:var(--g-500)}",
    ".bll-rail{display:flex;gap:12px;margin:0 calc(var(--gut) * -1);padding:4px var(--gut) 8px;overflow-x:auto;scroll-snap-type:x mandatory;scroll-padding:0 var(--gut);scrollbar-width:none}",
    ".bll-rail::-webkit-scrollbar{display:none}",
    ".bll-t{position:relative;flex:0 0 232px;scroll-snap-align:start;display:flex;flex-direction:column;overflow:hidden;border-radius:var(--r-lg);border:1px solid var(--g-200);background:#fff;box-shadow:2px 2px 0 var(--g-200);cursor:pointer;text-align:left;color:var(--g-900);transition:transform .18s var(--ease),box-shadow .18s var(--ease)}",
    ".bll-t:active{transform:translate(1px,1px);box-shadow:1px 1px 0 var(--g-200)}",
    /* the picture: the scene, with a whisper of indigo at its foot so it settles onto the white */
    ".bll-im{position:relative;height:136px;background-color:var(--in-25)}",
    ".bll-im::after{content:'';position:absolute;inset:auto 0 0 0;height:40px;background:linear-gradient(180deg,rgb(238 244 255 / 0),rgb(224 234 255 / .55))}",
    ".bll-tag{position:absolute;z-index:1;left:12px;top:12px;display:inline-flex;align-items:center;height:24px;padding:0 8px;border-radius:var(--r-pill);background:rgb(255 255 255 / .82);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);box-shadow:0 0 0 1px var(--in-100);color:var(--in-700);font:500 12px/16px Roboto}",
    ".bll-go{position:relative;flex:none;width:40px;height:40px;margin-right:-4px;border:0;padding:0;border-radius:50%;background:var(--brand-600);color:#fff;display:grid;place-items:center;cursor:pointer}.bll-go::after{content:'';position:absolute;inset:-2px}",
    ".bll-go svg{width:16px;height:16px;margin-left:2px}.bll-go:active{opacity:.9}",
    ".bll-b{display:flex;flex-direction:column;gap:2px;padding:12px 16px}",
    ".bll-n{font:600 16px/22px Roboto;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
    ".bll-p{font:400 12px/18px Roboto;color:var(--g-500)}",
    ".bll-f{display:flex;align-items:center;justify-content:space-between;margin-top:4px;height:40px}",
    ".bll-mn{font:500 12px/16px Roboto;color:var(--in-700);font-variant-numeric:tabular-nums}",
    /* See all: rows with a small crop of the same scene */
    ".bll-ls{display:flex;flex-direction:column}.bll-r{display:flex;align-items:center;gap:12px;width:100%;min-height:72px;padding:12px 0;border:0;border-top:1px solid var(--g-100);background:none;text-align:left;font:inherit;color:var(--g-900);cursor:pointer}",
    ".bll-r:first-child{border-top:0}.bll-r .th{flex:none;width:64px;height:48px;border-radius:var(--r-sm);background-color:var(--in-25);box-shadow:inset 0 0 0 1px var(--g-200)}",
    ".bll-r .t{flex:1;min-width:0}.bll-r .tt{display:block;font:600 14px/20px Roboto}.bll-r .td{display:block;margin-top:2px;font:400 12px/16px Roboto;color:var(--g-500)}",
    ".bll-r .rt{display:inline-flex;align-items:center;gap:4px;font:400 12px/16px Roboto;color:var(--g-500)}.bll-r .rt svg{width:16px;height:16px;color:var(--g-400)}",
    ".bll-sl{margin:0 0 8px;font:400 14px/20px Roboto;color:var(--g-600)}"
  ].join("");
  document.head.appendChild(css);

  function card(b, B) {
    var t = document.createElement("div");
    t.className = "bll-t"; t.setAttribute("role", "button"); t.tabIndex = 0; t.setAttribute("data-blinfo", b.key);
    t.setAttribute("aria-label", b.name + ", " + b.pat + ", " + b.min + " minutes. How it works");
    t.innerHTML = '<div class="bll-im" style="background:' + bg(b.key) + ';background-color:var(--in-25)">' +
      (B.state === "plan" && b.inPlan ? '<span class="bll-tag">In your plan</span>' : "") +
      '</div>' +
      '<div class="bll-b"><div class="bll-n">' + nm(b) + '</div><div class="bll-p">' + b.pat + '</div>' +
      '<div class="bll-f"><span class="bll-mn">' + b.min + ' min</span><button class="bll-go" data-blplay="' + b.key + '" aria-label="Start ' + b.name + '">' + PLAY + '</button></div></div>';
    return t;
  }

  function all(B) {
    var html = '<p class="bll-sl">Tap one to see how it goes, or start it from there.</p><div class="bll-ls">' + B.list.map(function (b) {
      return '<button class="bll-r" data-blinfo="' + b.key + '"><span class="th" style="background:' + bg(b.key, 64) + ';background-color:var(--in-25)"></span><span class="t"><span class="tt">' + nm(b) + '</span><span class="td">' + b.pat +
        (B.state === "plan" && b.inPlan ? ' · <span style="color:var(--in-700)">In your plan</span>' : "") + '</span></span><span class="rt">' + b.min + ' min' + CHEV + '</span></button>';
    }).join("") + '</div>';
    if (window.GFOpenSheet) window.GFOpenSheet("bllAll", "Breathing exercises", html);
  }

  BLIB.add("l", {
    render: function (host, B) {
      host.className = "gut sect";
      var intro = B.state === "noplan" ? "Use any of these while your coach sets up your plan."
        : B.state === "free" ? "Start one whenever you need a pause."
        : "Start one whenever you need a pause, in your plan or not.";
      host.innerHTML = '<div class="bll-hd"><h2 class="gf-h">Breathing exercises</h2><button class="bll-all">See all ' + B.list.length + CHEV + '</button></div>' +
        '<p class="bll-intro">' + intro + '</p><div class="bll-rail"></div>';
      var rail = host.querySelector(".bll-rail");
      B.list.forEach(function (b) { rail.appendChild(card(b, B)); });
      host.querySelector(".bll-all").onclick = function (e) { e.stopPropagation(); all(B); };
      host.addEventListener("keydown", function (e) { if ((e.key === "Enter" || e.key === " ") && e.target.classList.contains("bll-t")) { e.preventDefault(); e.target.click(); } });
      if (/[?&]lall=1/.test(location.search)) all(B);
    }
  });
})();
