/* ============================================================
   Arriving at the logger from "Search and log".

   The day view does not cut to this screen: it slides a little to the left and
   dims (eat.html sets gfPush and plays that half), and this screen pushes in
   from the right over it, the way an iOS navigation push reads. Once it has
   landed, the search field takes focus and the keyboard rises, so the person
   can start typing straight away.

   The prototype has no system keyboard on a desktop, so it draws one: an iOS
   light keyboard with a predictive row of foods, that really types into the
   field. It rises whenever the search field has focus and falls when it loses
   it, so every way into search behaves the same.
   ============================================================ */
(function () {
  var q = document.getElementById("q");
  if (!q) return;
  var REDUCED = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var EASE = "cubic-bezier(.2,.8,.2,1)";
  var KB_H = 291;   /* iOS: 44 predictive + 4 rows of keys + home indicator */

  var css = document.createElement("style");
  css.textContent = [
    /* above the page's drawn keyboard (chrome.js, z 55), which it stands in for while search has focus */
    ".ioskb{position:fixed;left:50%;bottom:0;width:100%;max-width:390px;height:" + KB_H + "px;z-index:56;",
    "transform:translate(-50%,100%);transition:transform .32s " + EASE + ";background:#D1D4DA;",
    "font-family:-apple-system,'SF Pro Text',Roboto,'Helvetica Neue',Arial,sans-serif;user-select:none;-webkit-user-select:none;touch-action:manipulation}",
    ".ioskb.up{transform:translate(-50%,0)}",
    ".ioskb .pred{display:flex;height:44px;align-items:center}",
    ".ioskb .pred button{flex:1;height:100%;border:0;background:none;font-size:16px;color:#1C1C1E;cursor:pointer;position:relative}",
    ".ioskb .pred button+button::before{content:'';position:absolute;left:0;top:12px;bottom:12px;width:1px;background:#A6AAB3}",
    ".ioskb .rows{padding:0 3px;display:grid;gap:11px}",
    ".ioskb .kr{display:flex;gap:6px;justify-content:center}",
    ".ioskb .k{height:42px;flex:0 0 calc((100% - 54px)/10);border:0;border-radius:5px;background:#fff;color:#000;font-size:22px;",
    "box-shadow:0 1px 0 rgba(0,0,0,.3);display:grid;place-items:center;cursor:pointer;padding:0}",
    ".ioskb .k:active{background:#AEB3BE}",
    ".ioskb .fn{background:#ABB0BA;font-size:15px;flex-basis:calc((100% - 54px)/10*1.3)}",
    ".ioskb .fn:active{background:#fff}",
    ".ioskb .sp{flex:1 1 auto;font-size:15px}",
    ".ioskb .go{flex-basis:88px;background:#007AFF;color:#fff;font-size:15px}",
    ".ioskb .go:active{background:#0062CC}",
    /* one keyboard at a time: the page's own drawn one steps aside while this one is up */
    "body.qkb .gf-kb{visibility:hidden}",
    /* on the keyboard there is no home indicator to clear, so the bar drops the 24px it keeps for it */
    ".tray.gf-kb-lift{padding-bottom:12px !important;transition:transform .25s cubic-bezier(.4,0,.2,1),padding .25s cubic-bezier(.4,0,.2,1)}"
  ].join("");
  document.head.appendChild(css);

  var SHIFT = '<svg width="20" height="18" viewBox="0 0 20 18" fill="none" stroke="#000" stroke-width="1.6" stroke-linejoin="round"><path d="M10 1.5 1.8 10h4.6v6.5h7.2V10h4.6z"/></svg>';
  var DEL = '<svg width="24" height="18" viewBox="0 0 24 18" fill="none" stroke="#000" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"><path d="M8 1.5h13.5v15H8L1.5 9z"/><path d="m11.5 5.5 7 7m0-7-7 7"/></svg>';
  var row = function (keys) { return '<div class="kr">' + keys + "</div>"; };   /* not .row: the logger already styles that */
  var letters = function (s) { return s.split("").map(function (c) { return '<button class="k" data-k="' + c + '">' + c + "</button>"; }).join(""); };

  var kb = document.createElement("div");
  kb.className = "ioskb";
  kb.setAttribute("aria-hidden", "true");
  kb.innerHTML =
    '<div class="pred"><button data-w="Poha">Poha</button><button data-w="Dal">Dal</button><button data-w="Chai">Chai</button></div>' +
    '<div class="rows">' +
      row(letters("qwertyuiop")) +
      row(letters("asdfghjkl")) +
      row('<button class="k fn" data-f="shift">' + SHIFT + "</button>" + letters("zxcvbnm") + '<button class="k fn" data-f="del">' + DEL + "</button>") +
      row('<button class="k fn">123</button><button class="k fn">&#128512;</button><button class="k sp" data-k=" ">space</button><button class="k go" data-f="go">search</button>') +
    "</div>";   /* the home indicator is drawn by chrome.js, above everything */
  document.body.appendChild(kb);

  var shift = false;
  /* The sticky bar rides up on the keyboard through chrome.js's own lift
     ([data-kb-lift] gets .gf-kb-lift, a 291px rise). That lift normally
     follows focus events, which a freshly loaded frame does not always get,
     so it is set here too. Nothing else moves: the list keeps its height and
     scrolls under the keyboard, as it does on a phone. */
  function show(on) {
    kb.classList.toggle("up", on);
    document.body.classList.toggle("qkb", on);
    document.querySelectorAll("[data-kb-lift]").forEach(function (el) { el.classList.toggle("gf-kb-lift", on); });
  }
  function put(v) {
    q.value = v;
    q.dispatchEvent(new Event("input", { bubbles: true }));
  }

  /* keys never take focus from the field, so the caret stays where it is */
  kb.addEventListener("pointerdown", function (e) { e.preventDefault(); });
  kb.addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.w) return put(b.dataset.w + " ");
    var f = b.dataset.f, k = b.dataset.k;
    if (f === "shift") { shift = !shift; return; }
    if (f === "del") return put(q.value.slice(0, -1));
    if (f === "go") { q.blur(); return show(false); }   /* closed here too: a blur event is not guaranteed */
    if (k == null) return;
    /* capitalised at the start, the way iOS does it, or after shift */
    var cap = shift || (k !== " " && q.value.trim() === "");
    shift = false;
    put(q.value + (cap ? k.toUpperCase() : k));
  });
  q.addEventListener("focus", function () { show(true); });
  q.addEventListener("blur", function () { show(false); });

  /* the push, when the day view asked for it */
  var push = null;
  try { push = sessionStorage.getItem("gfPush"); sessionStorage.removeItem("gfPush"); } catch (e) {}
  if (push !== "search") return;
  /* a freshly loaded frame is often not the focused window, and then the focus
     event never fires, so the keyboard is raised here rather than waited for */
  var focus = function () {
    try { q.focus({ preventScroll: true }); } catch (e) { q.focus(); }
    show(true);
  };
  if (REDUCED || !document.body.animate) return focus();
  document.body.animate(
    [{ transform: "translateX(100%)", boxShadow: "-12px 0 32px rgba(16,24,40,0)" },
     { transform: "none", boxShadow: "-12px 0 32px rgba(16,24,40,.12)" }],
    { duration: 380, easing: EASE }
  ).onfinish = focus;
})();
