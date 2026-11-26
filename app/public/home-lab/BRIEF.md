# Home lab: design brief for the Today tab studies

Product: GoodFlip, an Indian metabolic-health app (diabetes-led). Home has a top nav with three tabs, Today / Program / Devices.
Today is the daily surface. It must do two jobs (the project's thesis): **To-do is adherence** (what to do, logged fast)
and **EM3 is motivation** (why it matters: Eat, Move, Mind scores). Kaira (KAIRA in copy) is the AI companion.

## What exists, read before designing
- The live lab: `app/public/home-lab/index.html` (phone + sidebar) and its screen `app/public/home-lab/screen.html`.
  Today currently shows: a plans strip (Eat/Move/Mind cards), "Your day" with a progress ring, then a to-do in four parts
  (Morning 6–12, Afternoon 12–4, Evening 4–8, Night 8 on) with folding blocks per meal / Move plan / Mind plan.
  Its logging layer (tick states, floating bar, review sheet, win moment) is copied exactly from the pillars. Reuse it, do not redesign it.
- The pillar screens (the source of truth for each pillar's look and words):
  - Eat: `app/public/v7/r3/eat.html` (score: **Nutrition sufficiency**, %, green, Cloud Drop hero, "What shaped your score?" tiles, meal cards with options), doc `app/public/v7/PRD.md`
  - Move: `app/public/move/index.html` (score: **Momentum**, %, indigo), doc `app/public/v7/move-prd.md`
  - Mind: `app/public/v7/mind/index.html?sx=1&sdev=ah&swait=0` (score: **Rhythm**, %, gold; sleep card, breathing, mood), doc `app/public/v7/mind-prd.md`
  - Each pillar has: free user (no score), before a plan (padlock, "unlocks after your first ... Coach consultation"), with a plan.
- Earlier Home work (prior art): `app/src/components/ScoreBubbles.jsx` and `app/src/components/HomeToday.jsx` (the "big bubble asks, small one scores" idea: the hero bubble asks a question for the next task, satellites carry pillar scores). Read them for the asking logic and copy tone.
- The dev server serves `app/public` at http://127.0.0.1:5180/ (e.g. /home-lab/screen.html, /v7/r3/eat.html, /move/index.html).

## Rules (non-negotiable)
- Copy: plain, friendly, humane, short. **No em dashes anywhere** (use commas, periods, colons). No AI jargon. Kaira never recaps the day; every line must carry a reason or a next step.
- Colour (`app/public/v7/COLOR.md`): Flip Green #299D6B brand/selection; Eat score green ramp, Move = Indigo #444CE7 ramp, Mind = Gold #E7C144 ramp (text on gold tints uses #A68A2D/#826E2D). Teal only with Indigo for Kaira. Neutrals #101828…#F9FAFB. Page backgrounds pure white; cards may be tinted. Subtle gradients only within one ramp.
- Motion: premium, smooth eases (e.g. cubic-bezier(.33,1,.68,1)), **no bounce or springs**, colour resolves into the focal object, light end state. Respect prefers-reduced-motion.
- Bottom sheets: title top left, circle X top right, no drag handle, max 90% height.
- Labels stay put: no self-rewriting titles.
- Real assets only (never draw pictograms in CSS): GoodFlip pictograms in `app/public/home-lab/a/` (pic-nutrition.png = Eat, pic-movement.png = Move, pic-mind.png = Mind lotus, pic-care-programs.png, pic-devices.png, pic-flipcoin-wallet.png) and `app/public/home-new/a/` (flicoin-icon.png, nav-arrow.svg = green circle chevron, kaira.svg); design system pictograms `~/Documents/GF/design.goodflip.in/public/web-icons/`; Kaira mark `app/public/v7/r3/assets/kaira.js` (GFKaira.mark(px)). Score heroes exist in the pillar screens (Cloud Drop) if you want to reference them.
- Usability: one primary action per surface, 44px tap targets, Gestalt (proximity, similarity, common region), low cognitive load, fewest taps, fewest pictograms competing.

## Deliverable format
- One self-contained study page in `app/public/home-lab/` (plain HTML/CSS/JS, fonts Roboto/Manrope/Playfair Display from Google Fonts). Each variant is a **live phone** (390px wide screen, scaled to fit) you can tap, with a short title, a 2–3 line rationale, and an honest trade-off. Mark one **Recommended**. Use real sample data from the pillar screens (scores like Sufficiency 54%, Momentum 40%, Rhythm 49%; tasks like Lunch 1:00 PM, Box breathing, Mood check-in).
- Do NOT edit `screen.html`, `index.html`, or anything outside your own new file(s) and an optional assets subfolder you create. Do not commit.
- Verify your page renders (headless Chrome: `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --hide-scrollbars --virtual-time-budget=4000 --screenshot=OUT.png --window-size=W,H URL`), look at the screenshots, fix what looks off. Note: headless often does not fire scroll events; test scroll behaviour by dispatching events.
- Return: the file path, the list of variants with one line each, which you recommend and why, and any open questions for the designer.
