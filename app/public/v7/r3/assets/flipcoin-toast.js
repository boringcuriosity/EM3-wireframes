/* ============================================================
   The FlipCoin toast, as the GoodFlip app shows it when coins are credited.

   A copy of MyTatva-RN's GlobalCoinAnimation + FlipcoinBadge (shape="animated"):
     - the Lottie (flipcoin.json, the app's own file) plays once at 0.6x speed,
       100ms after the toast mounts, and the whole toast unmounts the moment it
       finishes (no fade): 40 frames at 30fps / 0.6 = 2.22s
     - under it, the badge "You have earned FlipCoins": a 1.5 gradient border
       (#299D6B to #F5D736) around a #E6FAF1 to #FFFBEE fill, revealed left to
       right by a white 70% veil shrinking from the right over 1200ms with RN
       Animated.timing's default easing, Easing.inOut(Easing.ease)
   Sizes are the app's react-native-size-matters maths for a 390x844 screen
   (guideline 350x680): s = w/350, vs = h/680, mvs(x) = x + (vs(x) - x) / 2.
   The icon is the coin embedded in the Lottie (the app loads the same art from
   a remote config URL).

   GFFlipcoin.show() mounts it over everything, like the app's root overlay.
   ============================================================ */
(function () {
  var BASE = (document.currentScript && document.currentScript.src.replace(/[^/]*$/, "")) || "assets/";
  var W = 390, H = 844;
  var s = function (x) { return W / 350 * x; }, vs = function (x) { return H / 680 * x; };
  var mvs = function (x) { return x + (vs(x) - x) * .5; };
  var px = function (x) { return (Math.round(x * 100) / 100) + "px"; };

  var BADGE_W = W - s(32), R = mvs(12), BW = mvs(1.5);
  var css = document.createElement("style");
  css.textContent = [
    ".gfc{position:fixed;top:" + px(-mvs(60)) + ";left:50%;transform:translateX(-50%);width:100%;max-width:" + W + "px;box-sizing:border-box;",
    "padding:0 " + px(s(16)) + ";z-index:9999;pointer-events:none;display:flex;flex-direction:column;align-items:center}",
    ".gfc .lt{width:100%;height:" + px(mvs(160)) + "}",
    ".gfc .lt svg{display:block}",
    ".gfc .bd{width:" + px(BADGE_W) + ";max-width:100%;margin-top:" + px(-vs(15)) + ";border-radius:" + px(R) + ";overflow:hidden;box-sizing:border-box;",
    "padding:" + px(BW) + ";background:linear-gradient(90deg,#299D6B,#F5D736)}",
    ".gfc .in{position:relative;overflow:hidden;border-radius:" + px(R - BW) + ";background:linear-gradient(90deg,#E6FAF1,#FFFBEE)}",
    ".gfc .vl{position:absolute;top:0;bottom:0;right:0;background:rgba(255,255,255,.7);border-radius:" + px(R - BW) + "}",
    ".gfc .ct{position:relative;z-index:1;display:flex;align-items:center;gap:" + px(s(6)) + ";padding:" + px(vs(12)) + " " + px(s(16)) + "}",
    ".gfc .ct img{width:" + px(mvs(20)) + ";height:" + px(mvs(20)) + ";object-fit:contain;flex-shrink:0}",
    ".gfc .ct span{font:700 " + px(mvs(14)) + "/" + px(mvs(14.4)) + " Roboto,system-ui,sans-serif;letter-spacing:.25px;color:#313131;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
  ].join("");
  document.head.appendChild(css);

  /* RN's Easing.ease is the cubic bezier (.42, 0, 1, 1); Animated.timing's default is Easing.inOut of it */
  function bez(x1, y1, x2, y2) {
    return function (x) {
      var t = x;
      for (var i = 0; i < 8; i++) {
        var cx = 3 * x1 * t * (1 - t) * (1 - t) + 3 * x2 * t * t * (1 - t) + t * t * t - x;
        var d = 3 * x1 * (1 - t) * (1 - t) + 6 * (x2 - x1) * t * (1 - t) + 3 * (1 - x2) * t * t;
        if (Math.abs(cx) < 1e-6 || !d) break;
        t -= cx / d;
      }
      return 3 * y1 * t * (1 - t) * (1 - t) + 3 * y2 * t * t * (1 - t) + t * t * t;
    };
  }
  var ease = bez(.42, 0, 1, 1);
  var inOut = function (t) { return t < .5 ? ease(t * 2) / 2 : 1 - ease((1 - t) * 2) / 2; };

  var lottieReady = null;
  function loadLottie() {
    if (window.lottie) return Promise.resolve(window.lottie);
    return lottieReady || (lottieReady = new Promise(function (ok, no) {
      var sc = document.createElement("script"); sc.src = BASE + "lottie_light.min.js";
      sc.onload = function () { ok(window.lottie); }; sc.onerror = no; document.head.appendChild(sc);
    }));
  }
  var data = null;
  function loadData() { return data ? Promise.resolve(data) : fetch(BASE + "flipcoin.json").then(function (r) { return r.json(); }).then(function (d) { return (data = d); }); }
  /* warm both up so the toast never waits on the network when it fires */
  loadLottie().catch(function () {}); loadData().catch(function () {});

  var live = null;
  function show() {
    if (live) return;
    Promise.all([loadLottie(), loadData()]).then(function (r) {
      var el = document.createElement("div");
      el.className = "gfc"; el.setAttribute("role", "status");
      el.innerHTML = '<div class="lt"></div><div class="bd"><div class="in"><div class="vl"></div>' +
        '<div class="ct"><img alt="" src="' + BASE + 'flipcoin-icon.webp"><span>You have earned FlipCoins</span></div></div></div>';
      document.body.appendChild(el); live = el;
      var anim = r[0].loadAnimation({ container: el.querySelector(".lt"), renderer: "svg", loop: false, autoplay: false,
        animationData: JSON.parse(JSON.stringify(r[1])), rendererSettings: { preserveAspectRatio: "xMidYMid meet" } });
      anim.setSpeed(.6);
      var finish = function () { anim.destroy(); el.remove(); live = null; };   /* the app unmounts it outright: no fade */
      anim.addEventListener("complete", finish);
      setTimeout(function () { anim.play(); }, 100);
      /* the veil: full width to 0 over 1200ms from mount, anchored right, so the badge is revealed left to right */
      var vl = el.querySelector(".vl"), full = el.querySelector(".in").offsetWidth, t0 = performance.now();
      (function step(now) {
        var k = Math.min(1, (now - t0) / 1200);
        vl.style.width = full * (1 - inOut(k)) + "px";
        if (k < 1 && live === el) requestAnimationFrame(step);
      })(t0);
    }).catch(function (e) { console.error("[flipcoin]", e); });
  }

  window.GFFlipcoin = { show: show };
})();
