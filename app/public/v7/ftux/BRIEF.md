# Brief: Nutrition sufficiency FTUX bottom sheets

Project: GoodFlip EM3 wireframes, static HTML served by Vite at http://localhost:5173 (root = `app/public`).
The Eat screen is `/v7/r3/eat.html`. Its score (the Cloud Drop bubble near the top) is **Nutrition sufficiency**, out of 100.
We are designing the **first-time explainer bottom sheet** that opens over the Eat screen the first time someone sees the score.

## Two audiences, one file each variant, switched by `?who=`
- `?who=new` (default): a first-time user. They have just got their coach's plan. They have never seen the score.
- `?who=current`: someone who has been logging meals on GoodFlip already, and now sees the score for the first time. Open with what is new for them ("Your meals now add up to a score" style), then the same explanation, shorter where it can be.

## What the score is, in plain words (the only facts you may use)
- The coach sets how much **protein, carbs and fat** each meal should have. (Calories are not scored; they only decide how much a meal counts.)
- Each meal you log is checked against **its own** targets.
- Landing close to the target gets full marks for that macro: from a little under (80% of the target) to a little over (the target plus 20%, at least 3 g).
- Further away earns part of the marks. Eating much more than the target can take marks away.
- Bigger meals count for more of the day: a 300 kcal breakfast in a 1,500 kcal day is worth 20 of the 100.
- The meals add up to today's score, out of 100. A meal not logged yet adds nothing. It starts fresh every day.
- A day at **80 or more earns a medal**.
- Example to use if you need numbers: Breakfast is worth 20. Targets protein 15 g, carbs 40 g, fat 9 g. Eaten protein 9 g, carbs 58 g, fat 9 g. Marks 75, 75, 100, so the meal scores 83 of 100 and adds about 17 of its 20.
- Sample day plan: Pre-breakfast 10 kcal, Breakfast 486 kcal, Mid-morning snack, Lunch, Evening snack, Dinner, Bedtime. You may simplify to Breakfast 20, Lunch 35, Snack 10, Dinner 35 for clarity.
- The user's coach is a real person; you may say "your coach". KAIRA is the AI guide, always written KAIRA.

## Hard rules
- **Bottom sheet anatomy:** filled grey circle X at the top right (32px glyph in a 44px target, use the exact SVG below), title top left on the same row, Roboto 600 18px. **No drag handle.** Max 90% of the screen height; header fixed, content scrolls inside. Sheet top corners 24px radius, white.
- Close icon SVG: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 32 32"><path style="fill:var(--g-400)" d="M16 3a13 13 0 1 0 13 13A13.013 13.013 0 0 0 16 3m4.708 16.293a1 1 0 0 1-1.415 1.415L16 17.414l-3.293 3.293a1 1 0 0 1-1.415-1.415L14.587 16l-3.293-3.293a1 1 0 1 1 1.415-1.415L16 14.587l3.293-3.293a1 1 0 0 1 1.415 1.415L17.414 16z"/></svg>`
- **Tokens:** link `/v7/r3/goodflip-ui.css` and use its CSS variables only (`--brand-600` #299D6B primary green, `--brand-700` button lip, `--in-25..900` indigo, `--teal-*`, `--gold-*`, `--g-25..900` greys, `--r-sm/md/lg/xl`, `--ease`). Primary button: full width, 48px, `--brand-600`, white 16px 600 text, `box-shadow: 0 7px 0 var(--brand-700)` lip, Title Case label. Font Roboto (Google Fonts). Page backgrounds pure white; cards may be tinted.
- **Macro glyphs:** `/v7/icons/glyph-masks.css` has `.glyph-protein`, `.glyph-carbs`, `.glyph-fats` masks (an element with a background colour + the class, plus `-webkit-mask-size:contain; mask-size:contain; mask-repeat:no-repeat; mask-position:center`). On the app all macros use one green, each with its own glyph.
- **Copy:** humane, warm, supportive, encouraging, plain Indian English, British spelling (colour, personalised). Write the way a person speaks. **No em dashes anywhere.** **No negation or contrast constructions** ("no X, no Y", "X, not Y", "it is not about..."): state the true thing positively. No jargon ("macro" is fine once explained as protein, carbs and fat; avoid "sufficiency" except in the name "Nutrition sufficiency"). Interface copy without contractions ("It is", "You will"); KAIRA may use contractions when she speaks. Short sentences. Every sentence must help a first-time user understand or act.
- **Motion:** premium and calm. Smooth cubic ease-in-out, no springs, no overshoot, no bounce or wobble. Colour resolves into the focal object. End states light. Respect `prefers-reduced-motion` (show the end state). Animation must make the idea clearer, never just decorate.
- Steps or pages inside one sheet are fine (dots, Next, Back). End with one clear action, e.g. "Log Your First Meal" for new, "Got It" / "See My Score" for current.
- Phone width 390px. The file must look right in a 390x780 iframe.

## Your file
Create **self-contained** HTML files at `/Users/shaheer/Documents/EM3/app/public/v7/ftux/<name>.html` (names given in your task). Each file:
1. Shows the real Eat screen behind the sheet: a full-size `<iframe src="/v7/r3/eat.html" tabindex="-1" aria-hidden="true">` filling the viewport, pointer-events none, under a scrim `rgba(0,0,0,.5)`. The Eat page's hero waits for a handshake, so add: `addEventListener("message", e => { if (e.data === "hero:ready" && e.source) e.source.postMessage("hero:mount", "*"); });`
2. On load, the sheet slides up (about 420 ms, ease-out, no overshoot) and its first step plays.
3. Reads `?who=new|current` and adapts copy and first step.
4. Supports `?step=N` to open at a step (for the doc), and `?still=1` to skip animations (show end states).
5. Close X and the final CTA close the sheet (slide down) and leave the Eat screen showing; a small "Replay" text button may appear bottom-centre after closing so a reviewer can watch again.
6. All JS and CSS inline. No external libraries except Google Fonts; `/v7/r3/assets/lottie_light.min.js` is available if you want Lottie. You may draw art in SVG/CSS.
7. Put a short comment at the top naming the concept and how to use the flags.

Read for look and feel before you start (skim, do not copy wholesale): `/Users/shaheer/Documents/EM3/app/public/v7/r3/eat.html` (search for `.sheet`, `#es-suff`, `.gf-stat`, `.kaira`), `/Users/shaheer/Documents/EM3/app/public/move/plan.css` (`.mv-card`: the indigo-topped card with the two-tone conic border, the house card style), and look at the Eat screen in your head as: white page, Cloud Drop score bubble in green, "What shaped your score?" glass tiles for Protein / Carbs / Fat with "x of y g", meal cards below with soft illustrated scenes (`/v7/icons/meals/bg/*.webp`, e.g. `bf.webp`, `lunch.webp`, `dinner.webp`).

Verify your files load at http://localhost:5173/v7/ftux/<name>.html with no console errors (use node --check on extracted JS if you have no browser, or the browser tools if you have them). Do not edit any file outside `/v7/ftux/`. Do not commit or push.

When done, report for each file: name, one-line concept, the step list with the exact copy, and anything you were unsure of.

## Round 2 additions (apply to every new file)
- **Backdrop:** use this exact line in place of a plain iframe src, so new users see the empty day (0%) and current users the live day:
  `<iframe class="behind" tabindex="-1" aria-hidden="true" title=""></iframe><script>document.currentScript.previousElementSibling.src = "/v7/r3/eat.html" + (/who=current/.test(location.search) ? "" : "?state=empty");</script>`
- **One sample day for every file:** Breakfast 20, Lunch 35, Snack 10, Dinner 35 (sum 100). New users: nothing logged, score 0. Current users: 58 so far (Breakfast 17, Lunch 32, Snack 9, Dinner not logged yet, 0). Breakfast example as above (75, 75, 100, meal 83, adds 17).
- **Going over:** say only that eating much more than planned can take marks away. Never show a meal or the day going below 0.
- **Final CTA:** new users "Log Your First Meal", current users "See My Score".
- **Avoid what round 1 did:** a paged story, a scroll explainer, a slider on one meal, logging four sample meals, meal chips sized by weight, the ring splitting apart, a KAIRA chat, a coach-mark tour. Each new file must be a clearly different idea and interaction.
- No middle dots in copy. Verify in the browser with your own new tab (close it when done): no console errors, looks right at 390x780, works for ?who=new and ?who=current.

## Round 3: the three-step explainer (this replaces the round 1 and 2 ideas)
Every round 3 file is the SAME three-step explainer. Variants differ only in layout, composition, transition and motion. The steps, the copy and the visuals stay the same, so the variants can be compared fairly. All Round 2 additions still apply (backdrop line, CTA labels, no middle dots, verify in your own tab).

**Sheet title (top left, beside the X):** "Nutrition sufficiency". Step dots, Back (from step 2) and a full-width primary button "Next" on steps 1 and 2; the final CTA on step 3.

**Step 1, hero: "Introducing Nutrition sufficiency"**
- Visual: the real Cloud Drop score, live, in an iframe: `/v7/r3/heroes/cloud/index.html?build=34&embed=1&k=.88&er=.102&ey=-.095&y=.03&v=Cloud%20Drop&intro=murmuration&score=85` (you may change `k` to size it and `score`; add `&still=1` when the sheet has ?still=1). Transparent white ground; give it a subtle background of your own behind it (a soft green radial glow, faint rings, a light grain), calm.
- Eyebrow "Introducing", headline "Nutrition sufficiency".
- New: "From today, every meal you log adds to a score out of 100. It shows how well your meals are giving your body what it needs."
- Current: "The meals you log now add up to a score out of 100. It shows how well your meals are giving your body what it needs."

**Step 2: "Your coach sets your targets"**
- Visual: the meal scenes `/v7/icons/meals/bg/bf.webp`, `lunch.webp`, `dinner.webp` (soft illustrated, use them as rounded tiles or cards), each with its protein, carbs and fat target using the glyph masks (one green). Show a logged amount landing inside the target range and the meal earning full points.
- Copy: "For every meal, your coach plans how much protein, carbs and fat to eat. Eat close to those amounts and the meal earns full points."
- Optional small line: "Bigger meals count for more of your day."

**Step 3: "Earn a medal and FlipCoins"**
- Visual: the real medal `/v7/icons/badge/simple/heart-apple.svg` hanging on its short ribbon (Eat's ribbon: an 18x40 strip `linear-gradient(90deg,#CDA935 0 33%,#299D6B 33% 67%,#CDA935 67%)` behind the top of the medal, gentle swing in, no bounce), and FlipCoins `/v7/icons/flipcoins/coin.webp` (Lottie of coins: `/v7/r3/assets/flipcoin.json` with `/v7/r3/assets/lottie_light.min.js` if you want it).
- Copy: "Reach 80 in a day and you earn a medal. Every meal you log also earns you a FlipCoin, up to 4 a day."
- CTA: new "Log Your First Meal", current "See My Score".

**Look:** minimal, consistent, premium; white sheet, generous space, Roboto, our tokens. Headline 24px 600, body 16px/24px --g-600. The visual area keeps the same height on all three steps so the text never jumps. Motion clarifies: each step's visual plays once (score pours, amount lands in the range, medal swings in and coins arrive) with smooth ease, no bounce.
