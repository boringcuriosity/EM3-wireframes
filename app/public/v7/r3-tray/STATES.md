# The Plate, in every state

The Plate (heroes/plate.js: a ring of dots that light clockwise, fork and knife either side) is the chosen score visual. The Eat page has to work in every state the real app has, not just the happy mid-day one. This spec is the contract for that.

## Hero API (extended)

```js
HEROES.plate(el, {
  score: 54,            // 0..100, null when no score exists
  state: "mid",         // one of the ids below
  mealsIn: 3,           // meals logged today
  mealSlots: 6          // meal slots in the day (6 with a coach plan, 4 without)
})
```
Keep the old call working: `{score: 54}` alone must still render the mid state.

## The states

| id | when it happens | the plate | centre | caption under |
|---|---|---|---|---|
| `noplan` | Care user, coach has not built the plan yet. No targets exist, so there is NO score. | Dots are absent or barely there; the plate reads as laid but unserved, cutlery present, a faint dashed rim like a place setting waiting | No number. A small Kaira hexagon or a quiet dash | "No score yet" |
| `empty` | Targets set, nothing logged today yet | All dots pale gray, rim dashed, a soft breathing glow so it feels alive not broken | A quiet "0%" or a dash, whichever looks better | "Nothing logged yet" |
| `first` | One meal in, early honest score (use score 12, mealsIn 1) | A few dots lit at the top of the ring | 12% | "1 of 6 meals" |
| `mid` | The default we have been designing (54, 3 of 6) | as today | 54% | "3 of 6 meals" |
| `full` | Every meal logged, day fully read (use 88, 6 of 6) | Ring lit to 88%, all six meals in, a warmer, denser look | 88% | "Your whole day, read" |
| `perfect` | Every target met (100, 6 of 6) | Ring complete, one restrained celebration: a single soft bloom of light around the plate, no confetti | 100% | "Every target met" |
| `past` | Looking at a finished earlier day (use 61, 6 of 6, date Mon 14 Sep) | Same ring, but still: no intro animation, no idle motion, slightly muted palette so it reads as history | 61% | "Monday, 14 Sep" |
| `missed` | A past day with nothing logged | All dots empty, palette muted, no motion | A dash | "Nothing logged that day" |
| `future` | Tomorrow, or a later day: the plan exists, nothing can be logged yet | Dots drawn as hollow outlines in the plan's colours, rim dashed | No number, instead "1,722" in the plan's weight | "Planned for tomorrow" |
| `loading` | Data still arriving | Dots shimmer in place (gray-100 to gray-200 sweep), no number | nothing | nothing |

Rules for all of them: brand greens and grays only, the number stays Playfair 600, the fork and knife stay, nothing flashes, `prefers-reduced-motion` renders the settled frame, `dispose` cleans up.

## The rest of the page per state

The page is more than the hero. Each state changes these blocks too.

1. **Macros card** ("What you have eaten")
   - `noplan`: no targets exist, so no "/95g". Show each macro's grams eaten only (e.g. "43g Protein"), icons at a neutral fill, and a quiet line: "Targets appear when your coach sets your plan."
   - `empty`: icons empty, "0/95g".
   - `future`: show the plan's numbers as targets with an empty fill and the label "Planned".
   - `loading`: shimmering placeholders.
2. **Calorie strip** (ember fuse)
   - `noplan`: no goal to burn towards, so no fuse: one line, "942 kcal so far today".
   - `empty`: fuse unlit at 0 with "0 of 1,900 kcal".
   - `future`: "1,722 kcal planned".
   - `past`/`missed`: fuse burnt to that day's figure, no glow animation.
3. **Kaira card** (her line plus Snap and Voice)
   - Always two short sentences max, insight not narration, no em dashes.
   - `noplan`: "Log whatever you eat today, even the chai and the two biscuits. Your coach reads these days before building your plan."
   - `empty`: "Your targets are set. Log your first meal and today's score starts moving."
   - `first`: "One meal in. Protein is the one to keep an eye on, lunch is the easiest place to fix it."
   - `mid`: today's line (carbs, fats and fibre past halfway; protein lagging at 43 of 95g; roasted chana adds 9g).
   - `full`: "Your whole day is in. Protein landed at 78 of 95g, the closest it has been this week."
   - `perfect`: "Every target met today. Worth remembering what you ate, this is the day to repeat."
   - `past`: "Protein ran low that day, 48 of 95g. Lunch was the gap."
   - `missed`: "Nothing logged that day. One line is better than none, even from memory."
   - `future`: "Tomorrow's plan is ready. Nothing to log until then."
   - Snap and Voice stay in the card except on `past`, `missed` and `future`, where logging for that day either is not possible or is a different action: on `past` and `missed` show a single quiet text button "Log for that day"; on `future` show nothing.
4. **Coach's plan section**
   - `noplan`: no plan exists. Replace the six meal cards with a calm block: a heading "Today's meals", the four core divisions (Breakfast, Lunch, Evening snack, Dinner) as simple cards with just name, time, what was logged and a + button, and one line at the top: "Your coach is building your plan. Until then, log freely."
   - `future`: the plan is readable but nothing can be ticked: rows shown with hollow circles and no Log all buttons, section labelled "Tomorrow's plan".
   - `past`/`missed`: the day's own record, read only, with a "Log for that day" affordance at the end.
   - `loading`: three shimmering card placeholders.
5. **Top line**: on `past`, `missed` and `future` the Today pill shows that day's date instead ("Mon, 14 Sep", "Tomorrow") with the arrows still there.

## Deliverable

- `eat.html` takes `?state=<id>` (default `mid`) and renders all of the above. Keep `?hero=` and `?cal=` working.
- `states.html`: a gallery like index.html but showing the Plate page in every state side by side, each captioned with when it happens.
