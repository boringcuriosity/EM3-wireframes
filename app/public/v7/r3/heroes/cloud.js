/* Cloud Drop, the liquid score, as a hero for the Eat day view (?hero=cloud).

   The score itself is the Cloud Drop build from liquid-score, copied into
   heroes/cloud/ and run in its embedded mode (?embed=1): no phone frame, no
   card, pure white, gauge at the designed pixel size, intro kept inside its own
   space. It runs in a frame of its own so its WebGL lives and dies with the
   hero, which the page mounts only while the phone is on screen.

   A day with no score (locked, nothing yet) has no number to pour, so it falls
   back to the plate and its padlock. */
(function () {
  window.HEROES = window.HEROES || {};
  var BASE = (document.currentScript && document.currentScript.src || "").replace(/[^/]*$/, "");

  window.HEROES.cloud = function (el, opts) {
    /* No plan yet: no score, so the liquid score shows itself locked, with the
       padlock where the number goes. Lit on the day nothing has happened, quiet
       once food is going in, as the Plate had it. Other days without a score
       (a missed day in history, loading) keep the Plate for now. */
    var LOCKS = { noplanempty: "lit", noplan: "quiet" };
    var lock = opts.score == null ? LOCKS[opts.state] : null;
    if (opts.score == null && !lock) return window.HEROES.plate(el, opts);


    /* the plate lives in a 342 x 320 box scaled to .65; the liquid score draws
       at its real size, so it takes the full width and its own height, and the
       page's verdict wash stands down because the score brings its own glow */
    var wrap = el.parentElement, stage = document.getElementById("stage"), tint = document.querySelector(".stage .tint"), pill = document.querySelector(".stage .vwrap");
    var was = [wrap.style.cssText, el.style.cssText, tint && tint.style.display, pill && pill.style.display, stage && stage.style.paddingTop, stage && stage.style.overflow];
    wrap.style.width = "100%"; wrap.style.height = "300px";
    /* tight to the date row above and to the next section below: the gauge sits
       a little high in its frame (y), the stage drops its top padding, and the
       section under it comes up to about 24px from the tag */
    /* locked, the page already pulls the next section up (no verdict pill) and there is no tag, so it needs far less */
    wrap.style.marginBottom = lock === "lit" ? "-2px" : lock ? "-26px" : "-52px";   /* the first landing is followed by the Kaira card, which the page pulls up further */
    /* the score frame is transparent, so it may overhang the stage into the next section without covering it */
    if (stage) { stage.style.paddingTop = "0"; stage.style.overflow = "visible"; }
    /* the score carries its own status tag (Solid Day, Room To Grow, Needs
       Attention) between its 0 and 100, so the page's verdict pill stands down */
    if (pill) pill.style.display = "none";
    el.style.cssText += ";transform:none;width:100%;height:100%";
    if (tint) tint.style.display = "none";

    var fr = document.createElement("iframe");
    /* Nothing logged is No Data Available; any day with food in it carries the
       score's own tag (Solid Day, Room To Grow, Needs Attention). Gathering
       data is not a general-purpose tag, so it is not used here. */
    /* nothing logged on a planned day is an invitation, not missing data */
    var tag = lock ? "" : opts.mealsIn === 0 ? "log" : "";
    fr.src = BASE + "cloud/index.html?build=15&embed=1&y=.03&v=Cloud%20Drop" + (lock ? "&lock=" + lock : "&score=" + Math.round(opts.score)) + (tag ? "&tag=" + tag : "") +
      (opts.from != null && !lock ? "&from=" + Math.round(opts.from) : "");
    fr.title = ""; fr.tabIndex = -1; fr.setAttribute("aria-hidden", "true");
    /* taps go to the hero wrap underneath, which opens the sufficiency sheet */
    fr.style.cssText = "display:block;width:100%;height:100%;border:0;background:transparent;pointer-events:none";
    el.appendChild(fr);

    return {
      dispose: function () {
        el.innerHTML = "";
        wrap.style.cssText = was[0]; el.style.cssText = was[1];
        if (tint) tint.style.display = was[2] || "";
        if (pill) pill.style.display = was[3] || "";
        if (stage) { stage.style.paddingTop = was[4] || ""; stage.style.overflow = was[5] || ""; }
      }
    };
  };
})();
