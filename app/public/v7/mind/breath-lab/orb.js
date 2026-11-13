/* The reference: today's Coherent orb (v7/mind/variants/breath.js, look f), the Rhythm score's gold orb growing and
   shrinking with the breath. LAB.pearl(size) gives that orb as SVG for any variant to reuse. */
(function () {
  var pid = 0;
function pearl(sz) {
  var u = "bp" + (pid++);
  return '<svg width="' + sz + '" height="' + sz + '" viewBox="0 0 14 14" fill="none" aria-hidden="true"><g filter="url(#' + u + 'a)"><g clip-path="url(#' + u + 'b)"><rect width="14" height="14" fill="#A68A2D" rx="7"/>' +
    '<g filter="url(#' + u + 'c)"><ellipse cx="6.316" cy="4.792" fill="#F3D161" rx="7.683" ry="7.542"/></g><g filter="url(#' + u + 'd)" opacity=".5"><ellipse cx="5.292" cy="3.75" fill="#FDE8A4" rx="4.695" ry="4.583"/></g>' +
    '<g filter="url(#' + u + 'e)" opacity=".6"><ellipse cx="1.989" cy="1.19" fill="#E7C144" rx="1.989" ry="1.19" transform="matrix(.982 -.18891 .19626 .98055 6.402 12.002)"/></g></g></g><defs>' +
    '<filter id="' + u + 'a" width="14" height="14" x="0" y="0" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BG"/><feBlend in="SourceGraphic" in2="BG" result="shape"/><feColorMatrix in="SourceAlpha" result="ha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/><feMorphology in="SourceAlpha" radius=".406" result="m"/><feOffset/><feGaussianBlur stdDeviation="1.625"/><feComposite in2="ha" k2="-1" k3="1" operator="arithmetic"/><feColorMatrix values="0 0 0 0 0.80 0 0 0 0 0.66 0 0 0 0 0.21 0 0 0 1 0"/><feBlend in2="shape"/></filter>' +
    '<filter id="' + u + 'c" width="25.525" height="25.242" x="-6.446" y="-7.829" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feGaussianBlur stdDeviation="2.54"/></filter>' +
    '<filter id="' + u + 'd" width="19.549" height="19.326" x="-4.483" y="-5.913" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feGaussianBlur stdDeviation="2.54"/></filter>' +
    '<filter id="' + u + 'e" width="8.81" height="7.329" x="4.183" y="9.128" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feGaussianBlur stdDeviation="1.219"/></filter>' +
    '<clipPath id="' + u + 'b"><rect width="14" height="14" fill="#fff" rx="7"/></clipPath></defs></svg>';
}
  LAB.pearl = pearl;
  var css = document.createElement("style");
  css.textContent = ".ro{position:absolute;left:50%;top:50%;width:200px;height:200px;transform:translate(-50%,-50%) scale(.56);will-change:transform}" +
".ro svg{position:relative;display:block;filter:drop-shadow(0 16px 28px rgba(166,138,45,.18))}" +
".ro i{position:absolute;inset:-24%;border-radius:50%;background:radial-gradient(circle,rgba(253,232,164,.42) 30%,rgba(255,248,224,.2) 52%,rgba(255,248,224,0) 70%)}";
  document.head.appendChild(css);
  LAB.add("coherent", {
id: "coherent-today", name: "Today's orb", note: "The Rhythm score's gold orb grows as you breathe in and shrinks as you breathe out. Kept as the reference.",
build: function (stage) { stage.innerHTML = '<div class="ro"><i></i>' + pearl(200) + '</div>'; return { o: stage.firstChild }; },
frame: function (s, p) { s.o.style.transform = "translate(-50%,-50%) scale(" + (.56 + .44 * (p.reduced ? (p.k === "out" ? 0 : 1) : p.e)).toFixed(4) + ")"; }
  });
  LAB.add("sleep", {
id: "sleep-today", name: "Today's orb", note: "The same orb: it grows, rests full through the hold, then shrinks slowly. Kept as the reference.",
build: function (stage) { stage.innerHTML = '<div class="ro"><i></i>' + pearl(200) + '</div>'; return { o: stage.firstChild }; },
frame: function (s, p) { s.o.style.transform = "translate(-50%,-50%) scale(" + (.56 + .44 * (p.reduced ? (p.k === "out" ? 0 : 1) : p.e)).toFixed(4) + ")"; }
  });
})();
