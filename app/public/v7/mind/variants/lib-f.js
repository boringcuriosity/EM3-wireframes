/* All breathing exercises, variant f: "Living grid". A two-column grid where every tile's own final visual breathes
   at its real pace, so the difference between a 4-7-8 and a Pursed Lip is felt before a word is read.
   Tap a tile: the info sheet. The round play button: start. The seventh tile spans both columns. */
(function () {
  var PLAY = '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg>';
  var INTRO = {
    plan: "Any of them, any time. Each one breathes at its own pace.",
    noplan: "Any of them, any time, while your coach sets up your plan.",
    free: "Any of them, any time. Each one breathes at its own pace."
  };
  var css = document.createElement("style");
  css.textContent =
    ".blf-in{font:400 14px/20px Roboto,sans-serif;color:#667085;margin:-8px 0 16px}" +
    ".blf-g{display:grid;grid-template-columns:1fr 1fr;gap:12px}" +
    ".blf-t{position:relative;display:flex;flex-direction:column;border-radius:20px;border:1px solid transparent;box-shadow:2px 2px 0 #E4E7EC;cursor:pointer;" +
      "background:linear-gradient(180deg,#FFFBEE 0%,#FFF 62%) padding-box,conic-gradient(from 0deg,#E7C144 0deg,#E4E7EC 40deg,#E4E7EC 320deg,#E7C144 360deg) border-box;" +
      "transition:transform .2s cubic-bezier(.4,0,.2,1),box-shadow .2s cubic-bezier(.4,0,.2,1);-webkit-tap-highlight-color:transparent}" +
    ".blf-t:active{transform:translate(1px,1px);box-shadow:1px 1px 0 #E4E7EC}" +
    ".blf-v{display:grid;place-items:center;padding:12px 0 4px}" +
    ".blf-v .bl-mini{background:transparent}" +
    ".blf-tx{padding:4px 12px 14px;display:flex;flex-direction:column;gap:2px}" +
    ".blf-n{font:600 14px/20px Roboto,sans-serif;color:#101828}" +
    ".blf-p{font:400 12px/16px Roboto,sans-serif;color:#667085}" +
    ".blf-pl{position:absolute;right:2px;top:2px;width:44px;height:44px;border:0;background:none;padding:0;display:grid;place-items:center;cursor:pointer}" +
    ".blf-pl i{width:30px;height:30px;border-radius:50%;background:#299D6B;color:#fff;display:grid;place-items:center;box-shadow:0 2px 0 #2A805A}" +
    ".blf-pl i svg{margin-left:2px}" +
    ".blf-tag{margin-left:6px;font:500 11px/16px Roboto,sans-serif;color:#2A805A;background:#E6FAF1;border:1px solid #CBF0E0;border-radius:8px;padding:1px 6px}" +
    /* the odd one out spans both columns: the visual on the left, words on the right */
    ".blf-t.wide{grid-column:1/-1;flex-direction:row;align-items:center}" +
    ".blf-t.wide .blf-v{padding:12px 4px 12px 16px}.blf-t.wide .blf-tx{padding:0 52px 0 12px}" +
    ".blf-t.wide .blf-pl{top:50%;transform:translateY(-50%)}" +
    ".blf-m{display:flex;align-items:center;min-height:20px;font:400 12px/16px Roboto,sans-serif;color:#A68A2D;margin-top:2px}";
  document.head.appendChild(css);

  BLIB.add("f", {
    render: function (host, B) {
      host.className = "gut";
      var plan = B.state === "plan";
      host.innerHTML = '<div class="sec"><h2>All breathing exercises</h2><span>7 to try</span></div><p class="blf-in">' + INTRO[B.state] + '</p><div class="blf-g"></div>';
      var g = host.querySelector(".blf-g");
      B.list.forEach(function (b, i) {
        var wide = i === B.list.length - 1;
        var t = document.createElement("div");
        t.className = "blf-t" + (wide ? " wide" : "");
        t.setAttribute("data-blinfo", b.key); t.setAttribute("role", "button"); t.tabIndex = 0;
        t.setAttribute("aria-label", b.name + ", " + b.pat + ". Tap for how it works");
        t.innerHTML = '<div class="blf-v"></div><div class="blf-tx"><div class="blf-n">' + b.name.replace(/\s*\([0-9][0-9:-]*\)$/, "") + '</div><div class="blf-p">' + b.pat + '</div><div class="blf-m">' + b.min + ' min' + (plan && b.inPlan ? '<span class="blf-tag">In your plan</span>' : '') + '</div></div>' +
          '<button class="blf-pl" data-blplay="' + b.key + '" aria-label="Start ' + b.name + '"><i>' + PLAY + '</i></button>';
        t.querySelector(".blf-v").appendChild(B.mini(b.key, wide ? 80 : 124));
        g.appendChild(t);
      });
    }
  });
})();
