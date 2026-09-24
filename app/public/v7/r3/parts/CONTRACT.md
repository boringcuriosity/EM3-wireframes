# Slim parts: calorie strip and Kaira line

Two new pieces on the Eat page, each with several options Shaheer will choose from.
Order on the page: Today pill -> Eat line -> score hero -> "What you have eaten" macros card
-> CALORIE STRIP (new, its own element, no longer inside the Kaira card) -> KAIRA (its own card).

## File contract

`r3/parts/cal.js` and `r3/parts/kaira.js`, classic scripts (no modules), each:

```js
(function () {
  window.PARTS = window.PARTS || {};
  window.PARTS.cal = [                       // or PARTS.kaira
    { id: "meal-bar", name: "Meal bar", note: "one short line on what it does",
      mount: function (el) { /* fill el, return optional {dispose} */ } },
    ...
  ];
})();
```

- `el` is 342px wide, on the page background #FCFCFD (cards inside may be white).
- HEIGHT IS THE POINT. Calorie options: 28 to 56px tall, no more. Kaira options: 96px tall or less (two short lines of copy plus whatever visual). Vertical space is precious; be inventive about saying more in less height.
- Prefer SVG/CSS/Canvas 2D. Avoid WebGL (the page already runs a WebGL score hero and Chrome caps contexts).
- Animate on mount, once, ~1s, ease-out, and respect prefers-reduced-motion. Idle motion only if it is very subtle.
- Tokens: brand 25 #FAFFFD, 50 #F3FCF8, 100 #E6FAF1, 200 #CBF0E0, 300 #ABE6CC, 400 #79CCA8, 500 #59B38C, 600 #299D6B, 700 #2A805A, 800 #246649, 900 #1D4D38; gray 50 #F9FAFB, 100 #F2F4F7, 200 #E4E7EC, 300 #D0D5DD, 400 #98A2B3, 500 #667085, 700 #344054, 900 #101828; gold 50 #FFFBEE, 200 #FEF1C7, 600 #E7C144, 800 #A68A2D (insight only); Kaira gradient indigo #444CE7 to teal #2DA6A6 (Kaira only). Macros stay one green, never per-macro hues.
- Fonts: Roboto everywhere; Playfair Display 600 only if a number is the hero of the strip and it stays >= 24px. No em dashes in any copy.
- Accessible: text >= 11px, contrast on white, tap targets >= 44px where tappable.

## The data (must be exact)

Calories: 942 eaten of a 1,900 kcal goal (50%), 958 left. Per meal so far: Pre-breakfast 10, Breakfast 486, Lunch 446. Still planned today: Evening snack 278, Dinner 444, Bedtime 58 (planned total 780, so 1,722 if the plan is followed). Time is 1:30 PM.

Kaira says, in substance (rewrite freely, keep it insight-led, never a recap, no em dashes, max 2 short sentences):
"Carbs, fats and fibre are past halfway, so today is in good shape. Protein is the one lagging at 43g of 95g: pick the roasted chana at your evening snack and it climbs by 9g."
Useful numbers for a visual: protein 43 of 95g (45%), the chana adds 9g, evening snack is the next meal at 5:00 PM.

## Deliver
6 options each, genuinely different in idea (not six skins of a bar). For each, the `note` is one plain sentence Shaheer can read.
