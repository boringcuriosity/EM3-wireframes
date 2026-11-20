/* ring-ready.js: before pairing the Arc smart ring, one sheet says how to get ready (Shaheer, 20 Nov 2026).
   Used by Mind's sleep card (mind/variants/sleep-track.js) and Move's steps card (move/steps-smart.js).
   window.RingReady(go): Connect Arc Ring runs go, I Will Do It Later closes. The ring picture is Shaheer's
   (icons/mind/arc-ring-hero.png, 390 x 210, its warm glow already in the picture). */
(function () {
  var go = null;
  window.RingReady = function (fn) {
    go = fn; css();
    window.GFOpenSheet("ringReady", "Ready to connect your Arc?",
      '<div class="rr"><img class="rr-pic" src="/v7/icons/mind/arc-ring-hero.png" alt="">' +
      '<p class="rr-t">Keep your Arc smart ring charged and close to your phone before we start pairing.</p>' +
      '<button class="rr-go" data-rr="go">Connect Arc Ring</button><button class="rr-later" data-rr="later">I Will Do It Later</button></div>');
  };
  /* ?sheet=ringready (docs): the sheet on its own */
  if (/[?&]sheet=ringready/.test(location.search)) setTimeout(function () { window.RingReady(function () {}); }, 1300);
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-rr]"); if (!b) return;
    window.closeSheets();
    if (b.dataset.rr === "go" && go) { var f = go; go = null; setTimeout(f, 320); }
  });
  function css() {
    if (document.getElementById("rrCss")) return;
    var s = document.createElement("style"); s.id = "rrCss";
    s.textContent = [
      ".rr{display:flex;flex-direction:column;gap:16px;padding-bottom:4px}",
      ".rr-pic{display:block;width:calc(100% + 32px);max-width:none;margin:-4px -16px 0;height:auto}",
      ".rr-t{margin:0;font:400 16px/24px Roboto,sans-serif;color:#344054}",
      ".rr-go{height:48px;margin-bottom:7px;border:0;border-radius:12px;background:#299D6B;color:#fff;font:700 15px/1 Roboto,sans-serif;letter-spacing:.25px;box-shadow:0 7px 0 #2A805A;cursor:pointer;transition:transform .15s ease-out,box-shadow .15s ease-out}.rr-go:active{transform:translateY(7px);box-shadow:none}",
      ".rr-later{min-height:44px;margin-top:-4px;border:0;background:none;color:#2A805A;font:600 15px/20px Roboto,sans-serif;cursor:pointer}",
      ".rr-go:focus-visible,.rr-later:focus-visible{outline:2px solid #6172F3;outline-offset:2px}"
    ].join("\n");
    document.head.appendChild(s);
  }
})();
