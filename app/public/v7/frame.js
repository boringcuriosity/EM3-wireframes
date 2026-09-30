/* ============================================================
   Send every "Open full size" through the device frame.

   The decks build their cards with innerHTML at various times,
   so this rewrites links as they appear rather than once on
   load, and marks each one so a re-render cannot double-wrap it.

   Drop <script src="frame.js" defer> (or "../frame.js") into a
   page and its .open links start opening in an iPhone 17 Pro.
   Nothing else about the page changes.
   ============================================================ */
(function () {
  /* Every page that uses this lives under /v7/ or /v7/<dir>/, so the frame
     is found by cutting back to the /v7/ segment rather than by counting
     ../ hops per file. */
  var m = location.pathname.match(/^(.*\/v7\/)/);
  var FRAME = (m ? m[1] : "/") + "frame.html";

  function wrap(a) {
    if (a.dataset.framed) return;
    var raw = a.getAttribute("href");
    if (!raw || raw.charAt(0) === "#") return;
    var u;
    try { u = new URL(raw, location.href); } catch (e) { return; }
    if (u.origin !== location.origin) return;
    /* an .open pointing at an image has nothing to frame */
    if (/\.(png|jpe?g|gif|webp|svg)$/i.test(u.pathname)) return;
    a.dataset.framed = "1";
    a.href = FRAME + "?src=" + encodeURIComponent(u.pathname + u.search + u.hash);
  }

  function sweep() {
    var links = document.querySelectorAll("a.open[href]:not([data-framed])");
    for (var i = 0; i < links.length; i++) wrap(links[i]);
  }

  sweep();
  new MutationObserver(sweep).observe(document.documentElement, {
    childList: true, subtree: true
  });
})();
