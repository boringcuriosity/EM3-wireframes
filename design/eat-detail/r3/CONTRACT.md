# Round 3: one Eat page, swappable score hero

Files (all under design/eat-detail/r3/):
- `eat.html` : the whole Eat detail page. Reads `?hero=<name>` (default `pebble`) and mounts that hero.
- `heroes/<name>.js` : one score hero each. Names: `pebble`, `halo`, `orb`, `portal`, `jar`, `sprout`.
- `index.html` : gallery, 6 phones side by side, each an iframe of `eat.html?hero=<name>`.

## Hero contract (every heroes/*.js must follow exactly)

```js
(function () {
  window.HEROES = window.HEROES || {};
  window.HEROES.<name> = function (el, opts) {   // opts = { score: 54 }
    // draw into el; el is an empty 342x320 relative-positioned div, centred, page bg #FCFCFD
    return { dispose: function () {} };           // stop RAF, lose GL context etc.
  };
})();
```

- Classic script only (NO type="module", NO import/export). Must work when eat.html is opened from file://.
- No network except three.js r128 which eat.html already loads in <head> from
  `https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js` (global `THREE`). Plain WebGL / Canvas 2D / SVG / CSS are all fine too.
- The hero shows the number itself: big "54" + "%" and a small "SUFFICIENT" (letter-spaced caps) or "sufficient". Playfair Display 600 for the number is allowed (the page's only serif moment); Roboto for the rest. Fonts are loaded by eat.html.
- The number counts up 0 -> score over ~1.2s on mount, ease-out. The visual fills/grows in sync. Gentle idle motion is welcome (liquid sway, drifting light, breathing) but calm: no strobing, nothing faster than ~4s cycles. If `matchMedia('(prefers-reduced-motion: reduce)').matches`, render the final state without animation.
- Colour: GoodFlip brand green ramp only, plus white and grays.
  brand 25 #FAFFFD, 50 #F3FCF8, 100 #E6FAF1, 200 #CBF0E0, 300 #ABE6CC, 400 #79CCA8, 500 #59B38C, 600 #299D6B, 700 #2A805A, 800 #246649, 900 #1D4D38.
  gray 100 #F2F4F7, 200 #E4E7EC, 300 #D0D5DD, 400 #98A2B3, 500 #667085, 900 #101828.
  Gold #E7C144 only as a tiny sparkle accent if it truly helps. Do NOT use indigo/teal (reserved for Kaira).
- Must look finished on a near-white page. Transparent or soft-faded edges, no hard boxed background.
- Keep the number legible (contrast) at all times.
- Use devicePixelRatio for canvases (cap at 2).

## Test harness for hero authors
Write a throwaway test page in the scratchpad (not in r3/), e.g.
/private/tmp/claude-501/-Users-shaheer-Documents-EM3/59224698-b4d0-4418-ad69-45a9f56bb048/scratchpad/hero-<name>.html
that loads fonts, three r128, your hero file by absolute file:// path, a 342x320 #hero div on #FCFCFD, and calls HEROES.<name>(el,{score:54}).
Screenshot after the intro finishes:
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader --hide-scrollbars --force-device-scale-factor=2 --window-size=390,360 --virtual-time-budget=4000 --screenshot=<out.png> "file://<test.html>"
Read the PNG, iterate until it is genuinely beautiful.

## Round 3b additions

- Paper Shaders (Apache-2.0) are bundled as a classic script at `r3/vendor/paper-shaders.js`, exposing global `PaperShaders`
  (e.g. `new PaperShaders.ShaderMount(parentEl, PaperShaders.smokeRingFragmentShader, uniforms, undefined, speed)` and helpers
  `PaperShaders.getShaderColorFromString`, `PaperShaders.getShaderNoiseTexture`, `PaperShaders.defaultObjectSizing`, `PaperShaders.toProcessedLiquidMetal`, ...).
  eat.html will load it before the heroes. In your test harness load it by absolute file:// path.
- Uniform names, defaults and working presets: read the sources in
  /private/tmp/claude-501/-Users-shaheer-Documents-EM3/59224698-b4d0-4418-ad69-45a9f56bb048/scratchpad/paper/node_modules/@paper-design/shaders/dist/shaders/<name>.js
  and the React wrappers (which show exactly how uniforms are built from props, incl. presets and image handling) in
  .../node_modules/@paper-design/shaders-react/dist/shaders/<name>.js and .../shaders-react/dist/shader-mount.js.
  Mirror what the React wrapper does in vanilla JS.
- Every hero must be INTUITIVE: at a glance it must read as "54% of a whole" (a filled part and a clearly visible remaining part), not just a pretty animation.
- Current heroes: pebble, halo, orb, portal (kept); new: smoke, metal, sunrise, fluted, merge. jar and sprout moved to heroes/backup/.

## Round 3c notes
- Paper ShaderMount throws "image for uniform u_noiseTexture must be fully loaded" unless created after `PaperShaders.getShaderNoiseTexture()` has finished loading (wait for its onload/decode). Same for any image uniform.
- New heroes wanted in the Liquid Metal / Portal spirit: metalhex, chrome, vortex, gem, aura. Reference implementations to learn from: heroes/metal.js (liquid metal + conic reveal over a gray track), heroes/portal.js (shader ring, 54% arc + faint track), heroes/smoke.js (Paper shader + conic mask).

## Round 3d: five new concepts beyond rings
planet, stardust, ferro, pool, lotus. Same contract. Shaheer's liked set for the bar to beat: portal, orb, smoke, metal, metalhex, chrome, vortex, aura, sunrise, halo.
Each must still read at a glance as 54% of a whole, with a visible filled part and a visible remaining part.
