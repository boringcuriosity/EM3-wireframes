/* Cloud Drop, the liquid score, as a hero for the Eat day view (?hero=cloud).

   The score itself is the Cloud Drop build from liquid-score, copied into
   heroes/cloud/ and run in its embedded mode (?embed=1): no phone frame, no
   card, pure white, gauge at the designed pixel size, intro kept inside its own
   space. It runs in a frame of its own so its WebGL lives and dies with the
   hero, which the page mounts only while the phone is on screen.

   A day with no score has no number to pour: no plan shows the padlock, and a
   missed or loading day shows the empty orbs with a tag that says why. */
(function () {
  window.HEROES = window.HEROES || {};
  var BASE = (document.currentScript && document.currentScript.src || "").replace(/[^/]*$/, "");

  window.HEROES.cloud = function (el, opts) {
    /* No plan yet: no score, so the liquid score shows itself locked, with the
       padlock where the number goes. Lit on the day nothing has happened, quiet
       once food is going in. Other days without a score (a missed day in
       history, loading) are blank: empty orbs, no number, a tag that says why. */
    var LOCKS = { noplanempty: "lit", noplan: "quiet" };
    var lock = opts.score == null ? LOCKS[opts.state] : null;


    /* the plate lives in a 342 x 320 box scaled to .65; the liquid score draws
       at its real size, so it takes the full width and its own height, and the
       page's verdict wash stands down because the score brings its own glow */
    var wrap = el.parentElement, stage = document.getElementById("stage"), tint = document.querySelector(".stage .tint"), pill = document.querySelector(".stage .vwrap");
    var was = [wrap.style.cssText, el.style.cssText, tint && tint.style.display, pill && pill.style.display, stage && stage.style.paddingTop, stage && stage.style.overflow];
    /* the gauge draws at 88% (k=.88), so the frame is that much shorter too */
    wrap.style.width = "100%"; wrap.style.height = "264px";
    /* tight to the date row above and to the next section below: the gauge sits
       a little high in its frame (y), the stage drops its top padding, and the
       section under it comes up to about 24px from the tag */
    /* locked, the page already pulls the next section up (no verdict pill) and there is no tag, so it needs far less */
    /* no status tag under the gauge any more, so a scored day pulls the next section up into its space */
    wrap.style.marginBottom = lock ? "-26px" : "-72px";   /* both locked states: the unlock line sits under the plate (score-say.js) */   /* 0 and 100 now sit inside the arc (er=.115), so nothing hangs below the pearls */   /* the first landing is followed by the Kaira card, which the page pulls up further */
    /* the score frame is transparent, so it may overhang the stage into the next section without covering it */
    if (stage) { stage.style.paddingTop = "0"; stage.style.overflow = "visible"; }
    /* the score carries its own status tag (Solid Day, Room To Grow, Needs
       Attention) between its 0 and 100, so the page's verdict pill stands down */
    if (pill) pill.style.display = "none";
    el.style.cssText += ";transform:none;width:100%;height:100%";
    if (tint) tint.style.display = "none";

    /* Nothing logged is No Data Available; any day with food in it carries the
       score's own tag (Solid Day, Room To Grow, Needs Attention). Gathering
       data is not a general-purpose tag, so it is not used here. */
    /* nothing logged on a planned day is an invitation, not missing data */
    function src(o) {
      var lk = o.score == null ? LOCKS[o.state] : null, bl = o.score == null && !lk;
      var tag = lk ? "" : bl ? (o.state === "loading" ? "gathering" : o.rest ? "rest" : "none") : o.mealsIn === 0 ? "log" : "";
      return BASE + "cloud/index.html?build=35&embed=1&k=.88&er=.102&ey=-.095&y=.03&v=Cloud%20Drop&intro=murmuration" + (lk ? "&lock=" + lk : bl ? "&blank=1" : "&score=" + Math.round(o.score)) + (tag ? "&tag=" + tag : "") +
        (o.from != null && !lk && !bl ? "&from=" + Math.round(o.from) : "");
    }
    function frame(o) {
      var f = document.createElement("iframe");
      f.src = src(o);
      f.title = ""; f.tabIndex = -1; f.setAttribute("aria-hidden", "true");
      /* taps go to the hero wrap underneath, which opens the sufficiency sheet */
      f.style.cssText = "display:block;width:100%;height:100%;border:0;background:transparent;pointer-events:none";
      return f;
    }
    var fr = frame(opts);
    el.appendChild(fr);

    /* a new score, in place: the new gauge loads under the one on screen and takes over once it has drawn its first frame,
       so the score never blanks while the next one loads. The wrap, stage and pill keep the styles this hero set on them */
    var next = null, ready = null;
    function swap(o) {
      /* a padlock coming or going changes the hero's spacing too, so that one is a full remount (return false) */
      if (!(o.score == null ? LOCKS[o.state] : null) !== !lock) return false;
      if (next) { next.remove(); window.removeEventListener("message", ready); }
      var f = next = frame(o), done = false;
      if (getComputedStyle(el).position === "static") el.style.position = "relative";
      f.style.position = "absolute"; f.style.inset = "0"; f.style.opacity = "0";
      var take = function () {
        if (done || next !== f) return; done = true; next = null;
        window.removeEventListener("message", ready); clearTimeout(f.t);
        f.style.position = ""; f.style.inset = ""; f.style.opacity = "";
        fr.remove(); fr = f;
      };
      ready = function (e) { if (e.source === f.contentWindow && e.data === "cloud:drawn") take(); };
      window.addEventListener("message", ready);
      f.t = setTimeout(take, 2500);   /* never wait for ever: a frame that cannot say it drew still takes over */
      el.appendChild(f);
      return true;
    }

    return {
      swap: swap,
      dispose: function () {
        if (next) { next.remove(); next = null; window.removeEventListener("message", ready); }
        el.innerHTML = "";
        wrap.style.cssText = was[0]; el.style.cssText = was[1];
        if (tint) tint.style.display = was[2] || "";
        if (pill) pill.style.display = was[3] || "";
        if (stage) { stage.style.paddingTop = was[4] || ""; stage.style.overflow = was[5] || ""; }
      }
    };
  };
})();
