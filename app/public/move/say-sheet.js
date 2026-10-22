/* Move: the commentary explainer. "Learn more" on the line under the score opens this one sheet,
   which explains every case that line can say. The Momentum score itself has its own sheet (tap the score).
   Built like that sheet: plain sections under headings, each showing the line as the person saw it. */
(function () {
  var col = document.getElementById("col"), host = document.getElementById("eduSheets");
  var X = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 32 32"><path style="fill:var(--g-400)" d="M16 3a13 13 0 1 0 13 13A13.013 13.013 0 0 0 16 3m4.708 16.293a1 1 0 0 1-1.415 1.415L16 17.414l-3.293 3.293a1 1 0 0 1-1.415-1.415L14.587 16l-3.293-3.293a1 1 0 1 1 1.415-1.415L16 14.587l3.293-3.293a1 1 0 0 1 1.415 1.415L17.414 16z"/></svg>';
  var dc = function (t, tone) { return '<span class="dc ' + tone + '">' + t + "</span>"; };
  var say = function (t) { return '<p class="sxsay">' + t + "</p>"; };

  var SECS = [
    { h: "When your score goes up",
      say: "Your score went up by " + dc("+12%", "up"),
      p: ["Every workout and small move you log, and every step you take, adds to your score. The green number is how much it added."],
      li: ["Your planned workout adds the most, up to 40%.",
           "Each part of the day you move in adds up to 10%: morning, afternoon, evening and night.",
           "Your steps and small moves add up to 10% each."] },
    { h: "When it goes up less than it could",
      say: "Your score went up by only " + dc("+3%", "down") + ", you could have gained " + dc("+10%", "calm") + " more",
      p: ["Some of what you did fell in a part of the day that already counted, or went past your target, so it added less.",
          "The grey number is what the same effort would have added in a part of the day you have not moved in yet."] },
    { h: "When it does not change",
      say: "Your score did not change " + dc("0", "down") + ", you could have gained " + dc("+10%", "calm"),
      p: ["That log added nothing new, for example more steps after you met your step target. The grey number shows what moving in another part of the day would add."] },
    { h: "On an earlier day",
      say: "This day ended at " + dc("61%", "calm"),
      p: ["Past days show where your score finished. They no longer change."] },
    { h: "How to grow it fastest",
      p: ["Move a little in every part of the day rather than a lot at once. Four short moves across the day add more than one long session."] }
  ];

  var body = SECS.map(function (x, i) {
    return (i ? '<hr class="edash">' : "") + '<div class="esec"><h5>' + x.h + "</h5>" +
      (x.say ? say(x.say) : "") +
      x.p.map(function (t) { return "<p>" + t + "</p>"; }).join("") +
      (x.li ? '<ul class="elist2">' + x.li.map(function (t) { return "<li>" + t + "</li>"; }).join("") + "</ul>" : "") +
      "</div>";
  }).join("");

  host.insertAdjacentHTML("beforeend",
    '<div class="sheet esheet" id="es-say" role="dialog" aria-modal="true" aria-labelledby="est-say">' +
      '<div class="shead"><h4 id="est-say">Your score updates</h4><button class="x" id="esSayX" aria-label="Close">' + X + "</button></div>" +
      '<div class="sbody"><p class="sxlead">Each time you log, the line under your score tells you how much your score changed and why.</p>' +
        '<div class="sxlegend"><span>' + dc("+12%", "up") + " Added in full</span><span>" + dc("+3%", "down") + " Added less than it could</span><span>" + dc("+10%", "calm") + " What you could have added</span></div>" +
        body + "</div></div>");

  var sheet = document.getElementById("es-say");
  window.openSayHelp = function () {
    window.closeSheets && window.closeSheets();
    sheet.querySelector(".sbody").scrollTop = 0;
    sheet.classList.add("on");
    col.classList.add("open-edu");
  };
  document.getElementById("esSayX").onclick = function () { window.closeSheets(); };
})();
