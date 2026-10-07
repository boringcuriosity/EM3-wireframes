/* ============================================================
   Kaira, brought over from the product rather than redrawn.

   Both pieces are transcriptions of app.goodflip.in on master:
     the mark   src/components/atoms/Kaira/KairaLogo.tsx
     the FAB    src/components/atoms/Animations/CircularElement.tsx,
                wrapped by atoms/Kaira/KairaFabButton.tsx,
                keyframes from tailwind.config.js (rotateHalo, iconGlow)

   The paths, the gradient stops and their percentages, the blur radii, the
   conic angles, the blend mode and every timing are the shipped values. What
   changed is only the plumbing: React and Tailwind classes become one
   stylesheet and two string builders, because these prototypes are plain HTML
   and get opened straight off disk as often as they are served.

     window.GFKaira.mark(px)   the animated hexagon, for a card
     window.GFKaira.fab(label) the 60px launcher, halo and all
   ============================================================ */
(function () {
  if (window.GFKaira) return;

  /* the logo's ring, drawn in its own 36 x 40 box */
  var RING = "M32.965 8.04864C34.4835 8.92532 35.4189 10.5455 35.4189 12.2989V27.0811C35.4189 28.8345 34.4835 30.4546 32.965 31.3313L20.1629 38.7225C18.6444 39.5991 16.7736 39.5991 15.2551 38.7224L2.45382 31.3313C0.935387 30.4547 0 28.8345 0 27.0811V12.2988C0 10.5455 0.935386 8.92531 2.45381 8.04862L15.2551 0.657547C16.7736 -0.219161 18.6444 -0.219184 20.1629 0.657488L32.965 8.04864ZM6.94998 10.5516C5.43151 11.4282 4.49609 13.0484 4.49609 14.8018V24.2383C4.49609 25.9917 5.43151 27.6119 6.94997 28.4886L15.1223 33.2068C16.6408 34.0835 18.5116 34.0835 20.03 33.2068L28.2024 28.4886C29.7208 27.6119 30.6562 25.9917 30.6562 24.2383V14.8018C30.6562 13.0484 29.7208 11.4282 28.2024 10.5516L20.03 5.83328C18.5116 4.9566 16.6408 4.9566 15.1223 5.83328L6.94998 10.5516Z";

  /* the launcher's ring and the blurred inner polygon that lights its edge,
     both in the 29 x 33 box the product uses */
  var FRING = "M26.988 6.58873C28.2312 7.30647 28.9971 8.63294 28.9971 10.0685V22.1711C28.9971 23.6065 28.2313 24.933 26.9882 25.6507L16.5081 31.7019C15.2649 32.4197 13.7332 32.4197 12.4899 31.7019L2.00899 25.6507C0.765821 24.933 0 23.6065 0 22.171L0 10.0685C0 8.63297 0.765897 7.30647 2.00916 6.58875L12.4901 0.538216C13.7332 -0.179426 15.2648 -0.179404 16.5079 0.538275L26.988 6.58873ZM5.68971 8.63854C4.44651 9.35627 3.68066 10.6827 3.68066 12.1183V19.8448C3.68066 21.2803 4.44651 22.6068 5.68972 23.3245L12.3807 27.1874C13.6239 27.9051 15.1554 27.9051 16.3986 27.1874L23.0896 23.3245C24.3328 22.6068 25.0986 21.2803 25.0986 19.8448V12.1183C25.0986 10.6827 24.3328 9.35627 23.0896 8.63854L16.3986 4.77563C15.1554 4.05792 13.6238 4.05792 12.3807 4.77563L5.68971 8.63854Z";
  var FINNER = "M26.4089 9.13733V23.0065L14.3972 29.942L2.38643 23.0065V9.13733L14.3972 2.20179L26.4089 9.13733Z";

  var CSS = [
    /* ---- the mark: three stops that travel, on a gradient that drifts ---- */
    "@keyframes gfkColor1{0%,100%{stop-color:#444ce7}50%{stop-color:#44e7e7}}",
    "@keyframes gfkColor2{0%,100%{stop-color:#6366f1}50%{stop-color:#22d3ee}}",
    "@keyframes gfkColor3{0%,100%{stop-color:#44e7e7}50%{stop-color:#444ce7}}",
    "@keyframes gfkShift{0%,100%{transform:translate(0,0)}50%{transform:translate(10px,10px)}}",
    "@keyframes gfkGlow{0%,100%{filter:blur(15px) brightness(1.2)}50%{filter:blur(20px) brightness(1.5)}}",
    "@keyframes gfkIn{from{transform:scale(.8);opacity:0}to{transform:scale(1);opacity:1}}",
    ".gfk{position:relative;display:inline-block;line-height:0;animation:gfkIn 1.2s ease-out both}",
    ".gfk .halo{position:absolute;inset:0;z-index:0;line-height:0;animation:gfkGlow 3s ease-in-out infinite}",
    ".gfk .ring{position:relative;z-index:1}",
    ".gfk .g{animation:gfkShift 4s ease-in-out infinite}",
    ".gfk .s1{animation:gfkColor1 3s ease-in-out infinite}",
    ".gfk .s2{animation:gfkColor2 3s ease-in-out infinite .5s}",
    ".gfk .s3{animation:gfkColor3 3s ease-in-out infinite 1s}",

    /* ---------------------------------------------------- the launcher ---- */
    "@keyframes gfkRotate{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}",
    "@keyframes gfkIconGlow{0%,100%{opacity:1;filter:brightness(1)}50%{opacity:.9;filter:brightness(1.2)}}",
    ".gfkfab{width:60px;height:60px;padding:0;border:0;border-radius:9999px;cursor:pointer;",
    "box-shadow:0 4px 20px rgba(0,0,0,.15);display:grid;place-items:center;background:none}",
    /* the 4px rim is a gradient in its own right, not a border */
    ".gfkfab .rim{position:relative;width:100%;height:100%;padding:4px;border-radius:9999px;",
    "overflow:hidden;background:linear-gradient(143.022deg,#4EDAEF 12.578%,#3B49D6 82.929%)}",
    /* Three conic sweeps at three blurs, screened over the rim. This is what
       makes the edge read as lit from behind rather than merely coloured. */
    ".gfkfab .sweep{position:absolute;inset:0;border-radius:9999px;pointer-events:none;",
    "animation:gfkRotate 3s linear infinite}",
    ".gfkfab .sweep i{position:absolute;inset:0;display:block;mix-blend-mode:screen}",
    ".gfkfab .core{position:relative;width:100%;height:100%;border-radius:9999px;",
    "display:grid;place-items:center;isolation:isolate;",
    "box-shadow:0 1.688px 3.375px -1.688px rgba(0,0,0,.74),8px 8px 27px 5.484px rgba(0,0,0,.08);",
    "background:linear-gradient(143.022deg,rgb(68,76,231) 12.578%,rgb(68,231,231) 82.929%)}",
    ".gfkfab .core svg{transform:rotate(1.411deg);animation:gfkIconGlow 2s ease-in-out infinite}",
    ".gfkfab:active{transform:scale(.94)}",
    ".gfkfab{transition:transform .15s cubic-bezier(.4,0,.2,1)}",
    "@media (prefers-reduced-motion:reduce){",
    ".gfk,.gfk .halo,.gfk .g,.gfk .s1,.gfk .s2,.gfk .s3,",
    ".gfkfab .sweep,.gfkfab .core svg{animation:none}}"
  ].join("");

  if (!document.getElementById("gfk-css")) {
    var st = document.createElement("style");
    st.id = "gfk-css";
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  var uid = 0;

  /* The mark. One hexagon ring filled with a gradient whose three stops each
     travel to a different hue on their own offset, sitting over a hexagonal
     halo that breathes. Sized by height; the artwork is 36 x 40. */
  function mark(px, opts) {
    px = px || 40;
    opts = opts || {};
    var id = "gfk" + ++uid;
    var w = Math.round((px * 36) / 40);
    var halo = opts.halo === false ? "" :
      '<span class="halo" style="width:' + w + "px;height:" + px + 'px">' +
        '<svg width="' + w + '" height="' + px + '" viewBox="0 0 180 180" fill="none">' +
          '<defs><linearGradient class="g" id="' + id + 'h" gradientUnits="userSpaceOnUse" ' +
            'x1="20" y1="20" x2="160" y2="160">' +
            '<stop class="s1" offset="0"/><stop class="s3" offset="1"/></linearGradient></defs>' +
          '<path d="M90 15L155.9 52.5V127.5L90 165L24.1 127.5V52.5L90 15Z" fill="url(#' + id + 'h)" opacity=".4"/>' +
          '<path d="M90 45L135.9 70.5V121.5L90 147L44.1 121.5V70.5L90 45Z" fill="url(#' + id + 'h)" opacity=".3"/>' +
          '<path d="M90 60L120.9 78V114L90 132L59.1 114V78L90 60Z" fill="white" opacity=".8"/>' +
        "</svg></span>";
    return '<span class="gfk" aria-hidden="true" style="width:' + w + "px;height:" + px + 'px">' + halo +
      '<svg class="ring" width="' + w + '" height="' + px + '" viewBox="0 0 36 40" fill="none">' +
        '<defs><linearGradient class="g" id="' + id + '" gradientUnits="userSpaceOnUse" ' +
          'x1="-2.73987" y1="-5.03187e-05" x2="41.6018" y2="4.35983">' +
          '<stop class="s1"/><stop class="s2" offset="0.5"/><stop class="s3" offset="1"/>' +
        "</linearGradient></defs>" +
        '<path d="' + RING + '" fill="url(#' + id + ')"/>' +
      "</svg></span>";
  }

  /* The launcher. A gradient rim, three rotating conic sweeps screened over it
     at 20, 8 and 4px of blur, then the core disc with the mark in white. */
  function fab(label) {
    var sweep = function (stops, blur) {
      return '<span class="sweep"><i style="background:conic-gradient(from 0deg,' + stops +
        ");filter:blur(" + blur + 'px)"></i></span>';
    };
    return '<button class="gfkfab" aria-label="' + (label || "Ask KAIRA") + '">' +
      '<span class="rim">' +
        sweep("transparent 0deg,transparent 30deg,rgba(0,255,183,0) 30deg,rgba(0,255,183,1) 70deg," +
          "rgba(190,255,237,1) 85deg,rgba(190,255,237,1) 115deg,rgba(0,255,183,1) 130deg," +
          "rgba(0,255,183,0) 170deg,transparent 170deg", 20) +
        sweep("transparent 0deg,transparent 40deg,rgba(0,255,183,0) 40deg,rgba(0,255,183,1) 75deg," +
          "rgba(190,255,237,1) 90deg,rgba(190,255,237,1) 110deg,rgba(0,255,183,1) 125deg," +
          "rgba(0,255,183,0) 160deg,transparent 160deg", 8) +
        sweep("transparent 0deg,transparent 50deg,rgba(0,255,183,0) 50deg,rgba(0,255,183,1) 80deg," +
          "rgba(190,255,237,1) 100deg,rgba(0,255,183,1) 120deg,rgba(0,255,183,0) 150deg," +
          "transparent 150deg", 4) +
        '<span class="core">' +
          '<svg width="29" height="33" viewBox="0 0 29 33" fill="none">' +
            '<path d="' + FRING + '" fill="#fff"/>' +
            '<path d="' + FINNER + '" stroke="#fff" stroke-width="0.334833" opacity=".9" ' +
              'style="filter:blur(1px)"/>' +
          "</svg>" +
        "</span>" +
      "</span></button>";
  }

  window.GFKaira = { mark: mark, fab: fab };
})();
