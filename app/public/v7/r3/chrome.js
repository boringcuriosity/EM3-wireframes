/* ============================================================
   The phone's own chrome, so a screen is read as a screen.

   Two pieces, injected into .col by every screen that includes
   this file: the iOS status bar at the top and the home
   indicator at the bottom. Neither is part of the product, so
   both are inert and hidden from the accessibility tree.

   Turn it off with ?chrome=0 when a shot needs the bare page.
   ============================================================ */
(function () {
  if (new URLSearchParams(location.search).get("chrome") === "0") return;

  var col = document.querySelector(".col");
  if (!col || col.querySelector(".gf-status")) return;

  /* The chrome carries its own styles. Only half the screens link
     goodflip-ui.css, and the phone's frame should not depend on which. Every
     token has a literal fallback for the screens that have no :root. */
  var CSS = [
    /* iOS status bar. 54px is the notch height at 390pt. It sticks, because it
       belongs to the phone rather than the page, and never scrolls away. */
    '.gf-status{position:sticky;top:0;z-index:60;height:54px;flex:0 0 auto;display:flex;' +
      'align-items:flex-end;justify-content:space-between;padding:0 22px 10px;' +
      'background:#fff;color:var(--g-900,#101828);pointer-events:none}',
    '.gf-status .t{font:600 15px/20px "SF Pro Text",Roboto,sans-serif;letter-spacing:0}',
    '.gf-status .i{display:flex;align-items:center;gap:5px}',
    /* Home indicator. 134x5 is the real pill, floating over whatever the
       screen ends with, including a fixed bottom nav. */
    '.gf-home{position:fixed;left:50%;bottom:0;z-index:61;width:100%;' +
      'max-width:var(--col,390px);height:24px;transform:translateX(-50%);display:grid;' +
      'place-items:center;pointer-events:none}',
    '.gf-home span{width:134px;height:5px;border-radius:9999px;' +
      'background:var(--g-900,#101828);opacity:.28}',
    /* The keyboard. 291px is the real height at 390pt with the suggestion strip. */
    '.gf-kb{position:fixed;left:50%;bottom:0;z-index:55;width:100%;max-width:var(--col,390px);' +
      'height:291px;transform:translate(-50%,100%);transition:transform .25s cubic-bezier(.4,0,.2,1);' +
      'background:#D1D4DA;pointer-events:none}',
    '.gf-kb.up{transform:translate(-50%,0)}',
    '.gf-kb .sug{display:flex;align-items:center;height:44px;border-bottom:1px solid #BFC3C9}',
    '.gf-kb .sug span{flex:1;text-align:center;font:400 16px/22px "SF Pro Text",Roboto,sans-serif;' +
      'color:var(--g-900,#101828)}',
    '.gf-kb .sug span+span{border-left:1px solid #BFC3C9}',
    '.gf-kb .rows{padding:8px 3px 0}',
    '.gf-kb .r{display:flex;justify-content:center;gap:6px;margin-bottom:11px}',
    '.gf-kb .k{min-width:32px;height:42px;padding:0 4px;border-radius:5px;background:#fff;' +
      'box-shadow:0 1px 0 rgba(0,0,0,.28);display:grid;place-items:center;' +
      'font:400 20px/24px "SF Pro Text",Roboto,sans-serif;color:var(--g-900,#101828)}',
    '.gf-kb .k.wide{min-width:44px;background:#ADB3BC;font-size:15px}',
    '.gf-kb .k.space{flex:1;max-width:180px;font-size:15px}',
    '.gf-kb .k.go{background:var(--brand-600,#299D6B);color:#fff;font-size:15px;font-weight:600}',
    /* what the keyboard pushes up, so a sticky bar can be seen to clear it */
    '[data-kb-lift]{transition:transform .25s cubic-bezier(.4,0,.2,1)}',
    '.gf-kb-lift{transform:translateY(-291px)}'
  ].join("");
  var st = document.createElement("style");
  st.textContent = CSS;
  document.head.appendChild(st);

  /* 9:41 is the house time, the same one every Figma frame carries. */
  var STATUS =
    '<div class="gf-status" aria-hidden="true">' +
      '<span class="t">9:41</span>' +
      '<span class="i">' +
        /* cellular, four bars rising */
        '<svg viewBox="0 0 18 12" width="18" height="12">' +
          '<rect x="0"  y="8"   width="3" height="4"   rx="1" fill="currentColor"/>' +
          '<rect x="5"  y="5.5" width="3" height="6.5" rx="1" fill="currentColor"/>' +
          '<rect x="10" y="3"   width="3" height="9"   rx="1" fill="currentColor"/>' +
          '<rect x="15" y="0"   width="3" height="12"  rx="1" fill="currentColor"/>' +
        '</svg>' +
        /* wifi */
        '<svg viewBox="0 0 16 12" width="16" height="12">' +
          '<path d="M8 10.6 6.2 8.7a2.6 2.6 0 0 1 3.6 0z" fill="currentColor"/>' +
          '<path d="M4.4 6.9a5.1 5.1 0 0 1 7.2 0" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/>' +
          '<path d="M1.9 4.3a8.6 8.6 0 0 1 12.2 0" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/>' +
        '</svg>' +
        /* battery, nearly full */
        '<svg viewBox="0 0 26 12" width="26" height="12">' +
          '<rect x="0.5" y="0.5" width="22" height="11" rx="3.2" stroke="currentColor" stroke-opacity=".35" fill="none"/>' +
          '<rect x="2" y="2" width="17" height="8" rx="2" fill="currentColor"/>' +
          '<path d="M24 4.2v3.6a2 2 0 0 0 0-3.6z" fill="currentColor" fill-opacity=".4"/>' +
        '</svg>' +
      '</span>' +
    '</div>';

  var HOME = '<div class="gf-home" aria-hidden="true"><span></span></div>';

  col.insertAdjacentHTML("afterbegin", STATUS);
  col.insertAdjacentHTML("beforeend", HOME);

  /* Anything pinned to the bottom has to clear the home indicator. The screen
     cannot know whether the indicator is drawn, so the chrome publishes its
     own height and the screens add it to their own padding. With ?chrome=0
     the variable never gets set and the fallback is 0. */
  col.style.setProperty("--gf-home-h", "24px");

  /* --------------------------------------------------------- the keyboard */
  /* Drawn, not real: the point is to see what the keyboard covers and what
     has to rise above it. Any text input on the page raises it on focus.
     Anything that must clear it carries data-kb-lift.
     ?kb=1 holds it up so a still can be taken with it open. */
  var ROWS = [
    "qwertyuiop".split(""),
    "asdfghjkl".split(""),
    ["⇧", "z", "x", "c", "v", "b", "n", "m", "⌫"]
  ];
  var keys = ROWS.map(function (r, i) {
    return '<div class="r">' + r.map(function (k) {
      var wide = k === "⇧" || k === "⌫";
      return '<span class="k' + (wide ? " wide" : "") + '">' + k + "</span>";
    }).join("") + "</div>";
  }).join("") +
    '<div class="r">' +
      '<span class="k wide">123</span>' +
      '<span class="k space">space</span>' +
      '<span class="k go">Go</span>' +
    "</div>";

  col.insertAdjacentHTML("beforeend",
    '<div class="gf-kb" id="gfKb" aria-hidden="true">' +
      '<div class="sug"><span>poha</span><span>paneer</span><span>paratha</span></div>' +
      '<div class="rows">' + keys + "</div>" +
    "</div>");

  var kb = document.getElementById("gfKb");
  var lifts = function () { return document.querySelectorAll("[data-kb-lift]"); };
  function show(on) {
    kb.classList.toggle("up", on);
    lifts().forEach(function (el) { el.classList.toggle("gf-kb-lift", on); });
  }
  document.addEventListener("focusin", function (e) {
    var t = e.target;
    if (t.matches && t.matches('input:not([type=checkbox]):not([type=radio]), textarea')) show(true);
  });
  document.addEventListener("focusout", function (e) {
    setTimeout(function () {
      var a = document.activeElement;
      if (!a || !a.matches || !a.matches("input, textarea")) show(false);
    }, 0);
  });
  if (new URLSearchParams(location.search).get("kb") === "1") show(true);
})();
