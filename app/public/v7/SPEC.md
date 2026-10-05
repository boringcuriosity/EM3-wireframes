# Eat detail, 7 variants: shared spec

Every variant shows THE SAME DAY with THE SAME DATA. Only representation, layout
and hierarchy change. Static mockup, 390px wide phone, tall artboard showing the
whole scroll. No fake status bar. Bottom nav drawn at the bottom of the artboard
(it is sticky in reality); Kaira FAB drawn absolutely at right:18px, bottom:96px
of the artboard (just above the nav).

## Artboard file format (must follow exactly)

```html
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;600;700;800&display=swap">
  <style>
    body { margin: 0; background: #F9FAFB; font-family: Roboto, "Helvetica Neue", Arial, sans-serif; letter-spacing: 0.25px; color: #101828; -webkit-font-smoothing: antialiased; }
    a { color: #299D6B; } a:hover { color: #2A805A; }
    * { box-sizing: border-box; }
  </style>
</helmet>
<div style="position: relative; width: 390px; min-height: HEIGHTpx; background: ...; overflow: hidden;">
  ... content ...
</div>
</x-dc>
</body>
</html>
```

- NO `<script data-dc-script>` (static). No `{{ }}` holes. No JS.
- Canonical HTML: close every element, quote every attribute, inline styles.
- Layout with flex/grid + gap, not margins between siblings where avoidable.
- Icons: inline SVG only, stroke 1.8-2, round caps/joins, `fill="none"`. Never emoji.
- Hit targets 44px min for interactive controls (the glyph can be smaller inside).
- Copy: plain friendly English, NO em dashes anywhere (use comma, period, colon; en dash only in number ranges like 6:00 - 7:00 AM as written below). No exclamation stacking. No AI jargon.
- Fonts: Roboto for everything, including the score. Playfair was used for the score and is gone: one typeface, sized and weighted for hierarchy.
- Aim for generous white space; 16px screen gutters minimum (20-24 fine).
- Report the root height you used.

## Tokens (use only these)

Brand: 25 #FAFFFD, 50 #F3FCF8, 100 #E6FAF1, 200 #CBF0E0, 300 #ABE6CC, 400 #79CCA8, 500 #59B38C, 600 #299D6B (primary), 700 #2A805A (pressed/depth), 800 #246649, 900 #1D4D38
Gray: 25 #FCFCFD, 50 #F9FAFB, 100 #F2F4F7, 200 #E4E7EC, 300 #D0D5DD, 400 #98A2B3, 500 #667085, 600 #475467, 700 #344054, 800 #1D2939, 900 #101828
Indigo: 25 #F5F8FF, 50 #EEF4FF, 100 #E0EAFF, 200 #C7D7FE, 500 #6172F3, 600 #444CE7, 700 #3538CD, 900 #2D3282
Teal: 50 #EEFFFF, 100 #E0FFFF, 800 #2DA6A6, 900 #2D8282
Gold: 25 #FFFDF5, 50 #FFFBEE, 100 #FFF8E0, 200 #FEF1C7, 600 #E7C144, 800 #A68A2D
Status: success-600 #039855, success-50 #ECFDF3, warning-600 #DC6803, warning-50 #FFFAEB, error-600 #D92D20
Shadows: sm 0 1px 2px rgba(0,0,0,0.05) · card 0 1px 3px rgba(0,0,0,0.10), 0 1px 2px -1px rgba(0,0,0,0.10) · md 0 4px 6px -1px rgba(0,0,0,0.10), 0 2px 4px -2px rgba(0,0,0,0.10) · lg 0 10px 15px -3px rgba(0,0,0,0.10), 0 4px 6px -4px rgba(0,0,0,0.10) · xl 0 20px 25px -5px rgba(0,0,0,0.10), 0 8px 10px -6px rgba(0,0,0,0.10)
Radii: 8, 12 (default), 16 (large cards/sheets), 24 (hero), 9999 (pills).
Spacing on a 4px grid.

Colour meaning: green = brand, primary action, selected, done. Indigo = actionable/Kaira. Gold = insight/knowledge/reward. Teal = calm accents. Neutrals carry the screen.
Kaira identity: hexagon outline mark with gradient #444CE7 -> #2DA6A6. Kaira FAB = 48px circle, linear-gradient(135deg,#444CE7,#2DA6A6), white hexagon outline glyph, shadow xl.
Primary button = the 3D button: #299D6B fill, radius 12 (app uses 12-14 on cards), white 600 label, a solid #2A805A depth bar under it (box-shadow: 0 4px 0 #2A805A). Secondary = white fill, 1px #299D6B border, #299D6B label, box-shadow 0 4px 0 #E6FAF1. Depth only on buttons, never on cards/chips.
Macro colours: you may give the four macros distinct hues for data viz if the variant needs it; pick from the ramps above (suggested: Protein #444CE7 indigo, Carbs #E7C144/#A68A2D gold, Fats #2DA6A6 teal, Fibre #299D6B green) OR keep them all brand green with neutral tracks. Always label, never colour alone.

## Icons (copy these SVG paths, 24x24 viewBox, stroke currentColor)

- chevron-left: `<path d="M15 18l-6-6 6-6"/>`
- chevron-right: `<path d="M9 18l6-6-6-6"/>`
- chevron-down: `<path d="M6 9l6 6 6-6"/>`
- calendar: `<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>`
- info: `<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>`
- lock: `<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>`
- flame: `<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>`
- camera: `<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>`
- mic: `<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3"/>`
- plus: `<path d="M12 5v14M5 12h14"/>`
- check: `<path d="M20 6L9 17l-5-5"/>`
- more-vertical: `<circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>`
- droplet: `<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>`
- utensils (Eat): `<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/>`
- trending-up (Trend): `<path d="M22 7l-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/>`
- book-open (Learn): `<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>`
- gift: `<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5"/>`
- sparkle/lightbulb for insight: `<path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/>`
- Kaira hexagon (viewBox 0 0 22 24): `<path d="M11 1.2 20.1 6.6v10.8L11 22.8 1.9 17.4V6.6z" stroke-width="1.7" stroke-linejoin="round"/>`
- Solid hexagon clip for score shapes: `clip-path: polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)`

## THE DAY (all data, must all appear in every variant)

Context: Care program user, coach plan assigned. Today is Tuesday 15 Sep, 1:30 PM.

1. **Date control**: "Today" with previous/next day arrows; tapping it opens a calendar bottom sheet (show the chip/control only, maybe a small calendar glyph).
2. **Pillar line**: "Eat" + tagline "Fuel your body right"
3. **Sufficiency score**: 54% sufficient. Title "Today's sufficiency". Status line: "3 of 6 meals logged. Your sufficiency increases as you log the rest of your meals." Info button (opens "What is sufficiency?" sheet). Score is the mean of four capped macro ratios.
4. **Weakest macro insight**: "Protein is the one furthest from where it should be, at 43g of 95g." (keep it short; may add "It keeps you full and protects muscle." as the why)
5. **Four macros** (value / target, %):
   - Protein 43 / 95g, 45%
   - Carbs 121 / 238g, 51%
   - Fats 32 / 63g, 51%
   - Fibre 21 / 30g, 70%
6. **Calories**: 942 of 1,900 kcal (50%). Secondary to sufficiency.
7. **Journey**: "Day 3 of 7 · keep going". "You are building a habit. Protein is the gap to watch this week." Progress 3 of 7 days logged, "Unlocks in 4 days" (first weekly insight). Gift icon.
8. **Log prompt (Kaira)**: "Time to log your meal. Snap a photo or just say it out loud, whichever is easier." Buttons: Snap (camera, primary), Voice (mic, secondary). Kaira hexagon mark.
9. **Meal diary**, 6 divisions. Each: name, time window, "X of Y cal", a + add button. Under "Your coach's plan": option chips (the chosen/eaten option carries a small check), food rows (tick circle, name · qty, cal, ⋮ menu). Logged plan items are ticked (green filled circle + white check). Food logged outside the plan shows a "Manual" tag. When 2+ items are left in an unstarted option: button "Log all N" (or "Log the other N" if started). Coach tips (non-food) under a "Tips from your coach" heading, with tick + small info icon + one-line tip.

   **Pre-breakfast** · 6:00 - 7:00 AM · 10 of 10 cal · DONE
   - Options: Option 1 (chosen, check), Option 2
   - [x] Black tea with cinnamon · 1 cup · 10 cal

   **Breakfast** · 8:00 - 10:00 AM · 486 of 382 cal · DONE
   - Logged outside the plan: [x] Banana · 1 piece · 104 cal · Manual
   - Options: Option 1 (chosen, check), Option 2, Option 3
   - [x] Boiled egg · 2 x 1 egg · 146 cal
   - [x] Lauki oats besan chilla · 2 x 1 piece · 153 cal
   - [x] Green chutney · 2 x 1 spoon · 8 cal
   - [x] Curd · 1 katori · 75 cal
   - Tips from your coach: [x] Drink warm water with methi · "Soak a spoon of seeds overnight. Drink the water first thing." (done)

   **Lunch** · 1:00 - 3:00 PM · 446 of 464 cal · NOW (in progress, current window)
   - Options: Option 1, Option 2 (chosen, check)
   - [x] Roti · 2 x 1 piece · 180 cal
   - [x] Mixed veg sabzi · 1 katori · 114 cal
   - [x] Dal · 1 katori · 152 cal
   - [ ] Garden salad · 1 bowl · 18 cal   (only 1 left, so no "Log the other" button)

   **Evening snack** · 5:00 - 6:30 PM · 0 of 278 cal · LATER
   - Options: Option 1 (showing), Option 2
   - [ ] Roasted makhana · 1 bowl · 98 cal
   - [ ] Roasted chana · 1 handful · 180 cal
   - Button: "Log all 2"

   **Dinner** · 8:00 - 9:30 PM · 0 of 444 cal · LATER
   - Options: Option 1 (showing), Option 2
   - [ ] Multigrain roti · 2 x 1 piece · 160 cal
   - [ ] Mixed veg sabzi · 1 katori · 114 cal
   - [ ] Dal · 1 katori · 152 cal
   - [ ] Garden salad · 1 bowl · 18 cal
   - Button: "Log all 4"

   **Bedtime** · 10:00 - 11:00 PM · 0 of 58 cal · LATER
   - Coach's plan (single option, no chips)
   - [ ] Walnut · 2 x 1 piece · 56 cal
   - [ ] Chamomile tea · 1 cup · 2 cal
   - Button: "Log all 2"
   - Tips from your coach: [ ] Soak 5 almonds for tomorrow · "In a small bowl of water, before bed. Peel them in the morning."

   Variants MAY collapse finished or later meals (e.g. a "Done" meal shows a summary row that expands), as long as the data is visibly reachable and the collapsed state still shows name, time, cal and status. Show at least one meal fully expanded with every element type (options, ticked row, unticked row, Manual tag, Log all button, coach tip) across the screen.

10. **Water**: 4 glasses today, about 1,000ml. Action "Change" (opens water sheet). Droplet icon.
11. **Kaira FAB** (floating, bottom right).
12. **Bottom nav**: Back (chevron-left) · Eat (utensils, active green) · Trend (trending-up) · Learn (book-open). White bar, top border #E4E7EC, labels 11px.

Order of sections may change if it improves intuition, but explain the reasoning in your one-paragraph report.

## Round 2 rules (from Shaheer's review, override anything above)

1. **No individual macro colours.** Protein, Carbs, Fats and Fibre all use the SAME treatment: brand green (#299D6B, or brand-400 #79CCA8 / brand-200 #CBF0E0 for secondary fills) on neutral tracks (#F2F4F7 / #E4E7EC). Do not use indigo, gold or teal for macros. Status (e.g. the gap) is signalled with a word or a small label, never with a hue per macro. Gold stays allowed for insight/knowledge surfaces, indigo for Kaira.
2. **Use GoodFlip's own macro icons**, never drawn food stickers or dots for macros. They are image files next to the artboards:
   - Protein: `<img src="icons/icon-protein.svg" width="14" height="14" alt="">`
   - Carbs: `<img src="icons/icon-carbs.svg" ...>`
   - Fats: `<img src="icons/icon-fats.svg" ...>`
   - Fibre: `<img src="icons/icon-fibre.svg" ...>`
   Each is a gray-100 circle with a gray-500 glyph. Native size 14px; they scale cleanly up to ~32px (use width/height attributes, keep square). Put one beside every macro label.
3. Every macro must read instantly: icon + name + "43 of 95g" (or "43/95g") + one progress mark. If a creative visual is used, the plain numbers must sit right next to it.
