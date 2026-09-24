/* Six compact ways for Kaira to say one thing: protein is the day's gap, and the
   5 PM snack is where it closes. Each option is 342 wide and 96px tall or less.
   Classic script, no modules. */
(function () {
  window.PARTS = window.PARTS || {};

  var uid = 0;
  var next = function () { return "kp" + (++uid); };
  var reduce = function () {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  };

  /* Kaira's mark. Gradient ids are per instance, so two copies on one page do not
     fight over the same id. */
  function hex(size, sw) {
    var id = next();
    return '<svg width="' + size + '" height="' + (size * 1.09).toFixed(1) + '" viewBox="0 0 22 24" fill="none" aria-hidden="true">' +
      '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="#444CE7"/><stop offset="1" stop-color="#2DA6A6"/></linearGradient></defs>' +
      '<path d="M11 1.2 20.1 6.6v10.8L11 22.8 1.9 17.4V6.6z" stroke="url(#' + id + ')" stroke-width="' + (sw || 2.2) + '" stroke-linejoin="round"/></svg>';
  }

  var CSS = [
    /* shared */
    '.kp { font-family: Roboto, system-ui, sans-serif; letter-spacing: .25px; width: 342px; box-sizing: border-box; }',
    '.kp *, .kp *::before, .kp *::after { box-sizing: border-box; }',
    '.kp-rise { opacity: 0; transform: translateY(6px); }',
    '.kp-go .kp-rise { opacity: 1; transform: none; transition: opacity .5s cubic-bezier(.25,.1,.25,1), transform .5s cubic-bezier(.25,.1,.25,1); }',
    '.kp-go .kp-d1 { transition-delay: .08s } .kp-go .kp-d2 { transition-delay: .16s }',
    '.kp-num { font-weight: 700; color: #1D4D38; background: #E6FAF1; border-radius: 5px; padding: 0 4px; white-space: nowrap; }',

    /* 1. bubble */
    '.kp-bubble { display: flex; gap: 9px; align-items: flex-start; }',
    '.kp-av { width: 32px; height: 32px; flex: 0 0 32px; border-radius: 9999px; background: #F5F8FF; display: grid; place-items: center; margin-top: 2px; }',
    '.kp-say { position: relative; flex: 1; background: #fff; border: 1px solid #E4E7EC; border-radius: 14px; padding: 10px 13px; box-shadow: 0 1px 2px rgba(0,0,0,.05); }',
    '.kp-say::before { content: ""; position: absolute; left: -5px; top: 13px; width: 9px; height: 9px; background: #fff; border-left: 1px solid #E4E7EC; border-bottom: 1px solid #E4E7EC; transform: rotate(45deg); border-radius: 0 0 0 3px; }',
    '.kp-say p { margin: 0; font-size: 13.5px; line-height: 19px; color: #344054; text-wrap: pretty; }',
    '.kp-go .kp-say { animation: kp-pop .45s cubic-bezier(.22,1,.36,1) both; transform-origin: 0 14px; }',
    '@keyframes kp-pop { from { opacity: 0; transform: scale(.94) } to { opacity: 1; transform: none } }',

    /* 2. gapfix */
    '.kp-card { background: #fff; border: 1px solid #E4E7EC; border-radius: 16px; box-shadow: 0 1px 2px rgba(0,0,0,.05); }',
    '.kp-gap { display: flex; align-items: stretch; padding: 9px 13px; gap: 13px; }',
    '.kp-gap .lhs { flex: 0 0 104px; }',
    '.kp-lab { font-size: 12px; font-weight: 700; letter-spacing: .9px; color: #98A2B3; text-transform: uppercase; }',
    '.kp-big { font-size: 20px; line-height: 24px; font-weight: 700; color: #101828; margin-top: 1px; }',
    '.kp-big span { font-size: 12.5px; font-weight: 500; color: #98A2B3; }',
    '.kp-track { position: relative; height: 4px; border-radius: 9999px; background: #F2F4F7; margin-top: 5px; overflow: hidden; }',
    '.kp-track > i, .kp-meter .t > i { position: absolute; left: 0; top: 0; bottom: 0; width: 100%; }',
    '.kp-fill { z-index: 1; }',
    '.kp-fill { height: 100%; background: linear-gradient(90deg,#59B38C,#299D6B); border-radius: 9999px; transform: scaleX(0); transform-origin: 0 50%; transition: transform .9s cubic-bezier(.25,.1,.25,1); }',
    '.kp-add { height: 100%; background: #ABE6CC; transform: scaleX(0); transform-origin: 0 50%; transition: transform .9s cubic-bezier(.25,.1,.25,1) .25s; }',
    '.kp-rule { width: 1px; background: #F2F4F7; }',
    '.kp-gap .rhs { flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 6px; }',
    '.kp-gap .rhs p { margin: 0; font-size: 12.5px; line-height: 16px; color: #344054; }',
    '.kp-chip { position: relative; align-self: flex-start; display: inline-flex; align-items: center; gap: 6px; height: 28px; padding: 0 12px; border-radius: 9999px; border: 1px solid #299D6B; background: #fff; color: #299D6B; font: 600 12.5px/1 Roboto, sans-serif; letter-spacing: .25px; cursor: pointer; box-shadow: 0 3px 0 #E6FAF1; transition: transform .15s, box-shadow .15s; }',
    '.kp-chip::after { content: ""; position: absolute; left: 0; right: 0; top: 50%; height: 44px; transform: translateY(-50%); }',
    '.kp-chip:active { transform: translateY(3px); box-shadow: 0 0 0 #E6FAF1; }',

    /* 3. timeline */
    '.kp-tl { padding: 10px 14px 8px; }',
    '.kp-tl p { margin: 0 0 7px; font-size: 13px; line-height: 18px; color: #344054; }',
    '.kp-tl p b { color: #101828; font-weight: 600; }',
    '.kp-rail { position: relative; height: 26px; }',
    '.kp-rail .line { position: absolute; left: 0; right: 0; top: 14px; height: 2px; background: #E4E7EC; border-radius: 2px; }',
    '.kp-rail .done { position: absolute; left: 0; top: 14px; height: 2px; background: #299D6B; border-radius: 2px; transform: scaleX(0); transform-origin: 0 50%; transition: transform .9s cubic-bezier(.25,.1,.25,1); }',
    '.kp-dot { position: absolute; top: 10px; width: 8px; height: 8px; margin-left: -4px; border-radius: 9999px; background: #fff; border: 2px solid #D0D5DD; }',
    '.kp-dot.on { background: #299D6B; border-color: #299D6B; }',
    '.kp-now { position: absolute; top: 6px; width: 2px; height: 16px; margin-left: -1px; background: #101828; border-radius: 2px; }',
    '.kp-now b { position: absolute; top: 17px; left: 50%; transform: translateX(-50%); font: 500 12px/12px Roboto, sans-serif; color: #667085; }',
    '.kp-key { position: absolute; top: 8px; width: 12px; height: 12px; margin-left: -6px; border-radius: 9999px; background: #299D6B; box-shadow: 0 0 0 3px rgba(41,157,107,.16); }',
    '.kp-go .kp-key { animation: kp-pulse 2.8s ease-out 1.1s infinite; }',
    '@keyframes kp-pulse { 0% { box-shadow: 0 0 0 3px rgba(41,157,107,.16) } 40% { box-shadow: 0 0 0 8px rgba(41,157,107,0) } 100% { box-shadow: 0 0 0 3px rgba(41,157,107,0) } }',
    '.kp-tag { position: absolute; top: -8px; transform: translateX(-50%); font: 700 12px/16px Roboto, sans-serif; color: #1D4D38; background: #E6FAF1; border-radius: 9999px; padding: 0 7px; white-space: nowrap; }',

    /* 4. quote */
    '.kp-quote { position: relative; padding: 2px 4px 2px 15px; }',
    '.kp-quote::before { content: ""; position: absolute; left: 0; top: 2px; bottom: 2px; width: 2px; border-radius: 2px; background: linear-gradient(#444CE7,#2DA6A6); }',
    /* Kaira's gradient belongs to her mark and the rule, not to the letters. */
    '.kp-kname { display: flex; align-items: center; gap: 5px; font: 700 12px/14px Roboto, sans-serif; letter-spacing: 1.4px; color: #444CE7; }',
    '.kp-quote h4 { margin: 3px 0 0; font: 600 15px/21px Roboto, sans-serif; color: #101828; letter-spacing: .25px; }',
    '.kp-quote h4 em { font-style: normal; color: #1D4D38; }',
    '.kp-quote p { margin: 3px 0 0; font-size: 13px; line-height: 19px; color: #667085; }',

    /* 5. type */
    '.kp-type { display: flex; gap: 9px; align-items: flex-start; background: linear-gradient(135deg,#F5F8FF,#FAFFFD 70%); border: 1px solid #EEF4FF; border-radius: 14px; padding: 11px 13px; }',
    '.kp-type .tx { flex: 1; font-size: 13.5px; line-height: 19px; color: #344054; min-height: 57px; }',
    '.kp-type .tx b { color: #101828; font-weight: 600; }',
    '.kp-caret { display: inline-block; width: 2px; height: 14px; background: #2DA6A6; vertical-align: -2px; margin-left: 1px; animation: kp-blink 1s steps(1) infinite; }',
    '@keyframes kp-blink { 50% { opacity: 0 } }',

    /* 6. ambient */
    '.kp-amb { position: relative; overflow: hidden; background: radial-gradient(120% 140% at 0% 0%, #F3FCF8 0%, #FFFFFF 55%), #fff; border: 1px solid #CBF0E0; border-radius: 16px; padding: 11px 13px; display: flex; gap: 11px; align-items: center; cursor: pointer; }',
    '.kp-amb .body { flex: 1; min-width: 0; }',
    '.kp-amb p { margin: 0; font-size: 13px; line-height: 18px; color: #667085; }',
    '.kp-amb p b { color: #101828; font-weight: 600; }',
    '.kp-meter { display: flex; align-items: center; gap: 7px; margin-top: 8px; font-size: 12px; color: #98A2B3; }',
    '.kp-meter .t { position: relative; flex: 1; height: 5px; border-radius: 9999px; background: #F2F4F7; overflow: hidden; }',
    '.kp-chev { flex: 0 0 auto; color: #98A2B3; }',

    /* 7. shimmer: mark and words only, one sweep of light on arrival */
    '.kp-shim { display: flex; gap: 10px; align-items: flex-start; }',
    '.kp-shim .mk { flex: 0 0 auto; margin-top: 2px; }',
    '.kp-shim p { margin: 0; flex: 1; font-size: 14px; line-height: 21px; color: #344054; text-wrap: pretty; }',
    '.kp-shim p b { font-weight: 600; color: #101828; }',
    /* the sweep paints the letters themselves, so nothing sits on top of the words */
    '.kp-shim.sweep p { color: transparent; background-image: linear-gradient(100deg, #344054 42%, #59B38C 50%, #344054 58%); background-size: 280% 100%; background-position: 130% 0; -webkit-background-clip: text; background-clip: text; }',
    '.kp-shim.sweep.kp-go p { transition: background-position 1.5s cubic-bezier(.4,0,.2,1); background-position: -30% 0; }',

    /* 8. inline: the number carries its own meter inside the sentence */
    '.kp-inline { padding: 1px 2px; }',
    '.kp-inline p { margin: 0; font-size: 14.5px; line-height: 23px; color: #344054; text-wrap: pretty; }',
    '.kp-inline .mk { display: inline-block; vertical-align: -3px; margin-right: 6px; }',
    '.kp-inline .kn { position: relative; display: inline-block; font-weight: 700; color: #1D4D38; white-space: nowrap; }',
    '.kp-inline .kn::before { content: ""; position: absolute; left: 0; right: 0; bottom: -3px; height: 2px; border-radius: 2px; background: #E4E7EC; }',
    '.kp-inline .kn i { position: absolute; left: 0; right: 0; bottom: -3px; height: 2px; border-radius: 2px; background: #299D6B; transform: scaleX(0); transform-origin: 0 50%; transition: transform 1s cubic-bezier(.25,.1,.25,1) .15s; }',
    '.kp-inline .qt { color: #667085; }',

    /* 9. aura: light behind the mark, nothing else */
    '.kp-aura { display: flex; gap: 12px; align-items: flex-start; padding: 2px 2px 2px 4px; }',
    '.kp-aura .mk { position: relative; flex: 0 0 auto; width: 26px; height: 28px; margin-top: 3px; display: grid; place-items: center; }',
    '.kp-aura .mk::before { content: ""; position: absolute; width: 54px; height: 54px; border-radius: 9999px; background: radial-gradient(closest-side, rgba(68,76,231,.13), rgba(45,166,166,.08) 55%, rgba(255,255,255,0) 72%); }',
    '.kp-go .kp-aura .mk::before { animation: kp-breathe 5.5s ease-in-out infinite; }',
    '@keyframes kp-breathe { 0%, 100% { transform: scale(1); opacity: .85 } 50% { transform: scale(1.12); opacity: 1 } }',
    '.kp-aura h4 { margin: 0; font: 600 15.5px/22px Roboto, sans-serif; letter-spacing: .25px; color: #101828; }',
    '.kp-aura h4 em { font-style: normal; color: #1D4D38; }',
    '.kp-aura p { margin: 4px 0 0; font-size: 13px; line-height: 19px; color: #667085; }'
  ].join("\n");

  function ensureCSS() {
    if (document.getElementById("kp-css")) return;
    var st = document.createElement("style");
    st.id = "kp-css";
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  /* Run the entry animations on the next frame so transitions actually play. */
  function play(root) {
    if (reduce()) { root.classList.add("kp-go", "kp-still"); return function () {}; }
    var id = requestAnimationFrame(function () { root.classList.add("kp-go"); });
    return function () { cancelAnimationFrame(id); };
  }

  function box(el, cls) {
    ensureCSS();
    el.innerHTML = "";
    var root = document.createElement("div");
    root.className = "kp " + cls;
    el.appendChild(root);
    return root;
  }

  window.PARTS.kaira = [
    {
      id: "bubble",
      name: "Speech bubble",
      note: "Kaira's mark beside a bubble, with the one number that matters highlighted.",
      mount: function (el) {
        var root = box(el, "kp-bubble");
        root.innerHTML =
          '<span class="kp-av">' + hex(17) + '</span>' +
          '<div class="kp-say"><p>Today is in good shape. Protein is the one lagging at ' +
          '<span class="kp-num">43 of 95g</span>. Roasted chana at your evening snack adds 9g.</p></div>';
        var stop = play(root);
        return { dispose: stop };
      }
    },

    {
      id: "gapfix",
      name: "One gap, one fix",
      note: "The gap as a number on the left, the fix as a tappable chip on the right.",
      mount: function (el) {
        var root = box(el, "kp-card kp-gap");
        root.innerHTML =
          '<div class="lhs">' +
            '<div class="kp-lab">Today\'s one gap</div>' +
            '<div class="kp-big">43<span>/95g</span></div>' +
            '<div class="kp-track"><i class="kp-fill"></i><i class="kp-add"></i></div>' +
            '<div class="kp-lab" style="margin-top:3px;letter-spacing:.4px;text-transform:none;font-weight:500">Protein</div>' +
          '</div>' +
          '<div class="kp-rule"></div>' +
          '<div class="rhs">' +
            '<p>Roasted chana at your 5 PM snack adds 9g of it.</p>' +
            '<button class="kp-chip" type="button">' + hex(12, 2.6) + 'Add to snack</button>' +
          '</div>';
        var fill = root.querySelector(".kp-fill");
        var add = root.querySelector(".kp-add");
        var set = function () { fill.style.transform = "scaleX(.45)"; add.style.transform = "scaleX(.545)"; };
        if (reduce()) { fill.style.transition = add.style.transition = "none"; set(); return { dispose: function () {} }; }
        var id = requestAnimationFrame(set);
        var stop = play(root);
        return { dispose: function () { cancelAnimationFrame(id); stop(); } };
      }
    },

    {
      id: "timeline",
      name: "Moment to act",
      note: "The day as a thin rail, with the 5 PM snack marked as where protein catches up.",
      mount: function (el) {
        var root = box(el, "kp-card kp-tl");
        /* 6 AM to 11 PM across the rail */
        var at = function (h) { return ((h - 6) / 17 * 100).toFixed(1) + "%"; };
        var meals = [[6.5, 1], [9, 1], [13.5, 1], [17, 0], [20.5, 0], [22.5, 0]];
        var dots = meals.map(function (m) {
          return '<i class="kp-dot' + (m[1] ? " on" : "") + '" style="left:' + at(m[0]) + '"></i>';
        }).join("");
        root.innerHTML =
          '<p class="kp-rise">Your <b>5 PM snack</b> is where protein catches up, 43 of 95g so far.</p>' +
          '<div class="kp-rail">' +
            '<i class="line"></i><i class="done"></i>' + dots +
            '<i class="kp-now" style="left:' + at(13.5) + '"><b>now</b></i>' +
            '<i class="kp-key" style="left:' + at(17) + '"></i>' +
            '<span class="kp-tag" style="left:' + at(17) + '">chana +9g</span>' +
          '</div>';
        var done = root.querySelector(".done");
        var set = function () { done.style.width = "100%"; done.style.transform = "scaleX(" + (parseFloat(at(13.5)) / 100) + ")"; };
        if (reduce()) { done.style.transition = "none"; set(); root.classList.add("kp-go"); return { dispose: function () {} }; }
        var id = requestAnimationFrame(set);
        var stop = play(root);
        return { dispose: function () { cancelAnimationFrame(id); stop(); } };
      }
    },

    {
      id: "quote",
      name: "Quiet quote",
      note: "No card at all: a gradient hairline, Kaira's name, and the line itself.",
      mount: function (el) {
        var root = box(el, "kp-quote");
        root.innerHTML =
          '<div class="kp-kname kp-rise">' + hex(11, 2.8) + 'KAIRA</div>' +
          '<h4 class="kp-rise kp-d1">Protein is the one lagging, at <em>43 of 95g</em>.</h4>' +
          '<p class="kp-rise kp-d2">Everything else is past halfway. Roasted chana at your 5 PM snack adds 9g.</p>';
        var stop = play(root);
        return { dispose: stop };
      }
    },

    {
      id: "type",
      name: "Typed in",
      note: "Kaira writes the line once, word by word, then the caret fades.",
      mount: function (el) {
        var root = box(el, "kp-type");
        root.innerHTML = '<span style="margin-top:1px">' + hex(20, 2.4) + '</span><div class="tx"></div>';
        var tx = root.querySelector(".tx");
        var full = 'Today is in good shape. <b>Protein is the one lagging at 43 of 95g</b>, and chana at 5 PM adds 9g.';
        var words = full.split(" ");
        if (reduce()) { tx.innerHTML = full; return { dispose: function () {} }; }
        var i = 0, timer;
        var step = function () {
          i++;
          tx.innerHTML = words.slice(0, i).join(" ") + (i < words.length ? '<i class="kp-caret"></i>' : "");
          if (i < words.length) timer = setTimeout(step, 55);
        };
        timer = setTimeout(step, 120);
        return { dispose: function () { clearTimeout(timer); } };
      }
    },

    {
      id: "ambient",
      name: "Soft read",
      note: "A whisper of colour, the line, and a meter showing what the chana would add.",
      mount: function (el) {
        var root = box(el, "kp-card kp-amb");
        root.innerHTML =
          '<span class="kp-av" style="background:#fff;border:1px solid #E0EAFF;margin:0">' + hex(16) + '</span>' +
          '<div class="body">' +
            '<p><b>Protein is today\'s one gap.</b> Roasted chana at your 5 PM snack adds 9g.</p>' +
            '<div class="kp-meter"><span>Protein</span><span class="t"><i class="kp-fill"></i><i class="kp-add"></i></span>' +
            '<span><b style="color:#344054">43</b><span style="color:#D0D5DD;padding:0 3px">&rsaquo;</span><b style="color:#299D6B">52</b>/95g</span></div>' +
          '</div>' +
          '<svg class="kp-chev" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>';
        var fill = root.querySelector(".kp-fill");
        var add = root.querySelector(".kp-add");
        var set = function () { fill.style.transform = "scaleX(.45)"; add.style.transform = "scaleX(.545)"; };
        if (reduce()) { fill.style.transition = add.style.transition = "none"; set(); return { dispose: function () {} }; }
        var id = requestAnimationFrame(set);
        var stop = play(root);
        return { dispose: function () { cancelAnimationFrame(id); stop(); } };
      }
    },

    {
      id: "shimmer",
      name: "Shimmer",
      note: "Kaira's mark and her words, with one slow sweep of light across them as they arrive.",
      mount: function (el) {
        var root = box(el, "kp-shim");
        root.innerHTML =
          '<span class="mk">' + hex(20, 2.4) + '</span>' +
          '<p><b>Protein is today\'s one gap, at 43 of 95g.</b> Roasted chana at your 5 PM snack adds 9g.</p>';
        if (reduce()) return { dispose: function () {} };
        /* The sweep paints the letters for a moment, then the words go back to
           solid ink, so nothing is left tinted at rest. */
        root.classList.add("sweep");
        var stop = play(root);
        var timer = setTimeout(function () { root.classList.remove("sweep"); }, 1750);
        return { dispose: function () { clearTimeout(timer); stop(); } };
      }
    },

    {
      id: "inline",
      name: "Inline meter",
      note: "Pure typography: the number carries its own tiny meter inside the sentence.",
      mount: function (el) {
        var root = box(el, "kp-inline");
        root.innerHTML =
          '<p class="kp-rise"><span class="mk">' + hex(15, 2.6) + '</span>' +
          'Everything is past halfway except protein, at <span class="kn">43 of 95g<i></i></span>. ' +
          '<span class="qt">Roasted chana at your 5 PM snack adds 9g.</span></p>';
        var bar = root.querySelector(".kn i");
        var set = function () { bar.style.transform = "scaleX(.45)"; };
        if (reduce()) { bar.style.transition = "none"; set(); root.classList.add("kp-go"); return { dispose: function () {} }; }
        var id = requestAnimationFrame(set);
        var stop = play(root);
        return { dispose: function () { cancelAnimationFrame(id); stop(); } };
      }
    },

    {
      id: "aura",
      name: "Aura",
      note: "The mark lit from within, the point in a firmer weight, the fix quietly under it.",
      mount: function (el) {
        var root = box(el, "kp-aura");
        root.innerHTML =
          '<span class="mk">' + hex(19, 2.4) + '</span>' +
          '<span style="flex:1;min-width:0">' +
            '<h4 class="kp-rise">Protein is the one lagging, at <em>43 of 95g</em>.</h4>' +
            '<p class="kp-rise kp-d1">Roasted chana at your 5 PM snack adds 9g.</p>' +
          '</span>';
        var stop = play(root);
        return { dispose: stop };
      }
    }
  ];
})();
