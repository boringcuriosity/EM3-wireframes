# Eat detail screen

Draft 2, 22 Sep 2026. For design, dev and product.

- **Visual companion:** `design/eat-detail/nutrition-sufficiency.html`, all 60 cases below as a live phone.
- **Prototype:** `design/eat-detail/r3/app.html`, a phone and a control panel that reaches every case.
- **Screens, if you want one directly:** `r3/eat.html` the day view (`?state=`, `?sheet=1|suff|loading|error`, `?date=y-m-d`, `?v=1|2|3`), `r3/log.html` the logging screen (`?state=`, `?entry=`), `r3/logged.html` the success screen (`?state=`).

## 1. What the screen is

The Eat pillar's day view. It answers three things in order: how the day is going, what has been eaten, and what the coach's plan says.

## 2. Structure, top to bottom

| # | Block | What it holds |
|---|---|---|
| 1 | Eat line | "Eat · Fuel your body right", with an info icon that opens the sufficiency sheet and the Earn chip that opens the FlipCoins sheet. |
| 2 | Week strip | Seven days as bars, each at that day's sufficiency. Today is solid, and open capped while the day is still running. Tapping a bar loads that day. |
| 3 | Date chip | The day being viewed, with a step back arrow and a step forward arrow. Opens the date sheet. To its right, the change from yesterday, in grey, and only once today's plan is complete. |
| 4 | Score | Nutrition sufficiency as the Plate: a ring of dots with a fork and knife either side. The number and the word SUFFICIENT, nothing else. Under it, one verdict pill. |
| 5 | What shaped your score? | Protein, carbs, fats and fibre, each as its icon filling to its level, four side by side, with "43/95g" and the name. A nutrient that reaches its target fills solid and blooms. |
| 6 | Calorie strip | "942 of 1,900 kcal" and "958 left today", on the indigo wash the design system gives calories. |
| 7 | Kaira card | One or two sentences of insight, then "Log your meal" with Snap and Voice. |
| 8 | Your meals | Every meal of the day, always open, in coach plan order. |
| 9 | Bottom nav | Back, Eat, Trend, Learn. Kaira's button floats above it. |

Not on this screen: water logging, a "Now" or "Later" tag, any highlight on the current meal, expand and collapse on meals, and any way to reach a future day.

## 3. The score

- One number, nutrition sufficiency out of 100, the mean of four capped ratios: protein, carbs, fats and fibre against the coach's targets.
- It counts up from zero when the screen opens, over about 1.2 seconds.
- The plate carries the number and the word SUFFICIENT only. No meal counts, no dates, no verdicts.
- Green, because the score is the one thing that carries the pillar's colour. Everything else may use the wider palette.
- A day still being lived gets no verdict and no comparison. Until today's plan is complete the pill reports progress, and the change from yesterday is withheld, because a partial day cannot be judged against a finished one. A finished day, and any past day, gets its verdict: green, amber or red.

How it is worked out: sufficiency = protein, carbs, fats and fibre, each capped at its target, then averaged. The cap is why extra rice cannot fill in for missing protein.

## 4. Screen states

Ten states. Each one is live in the companion document.

| State | When | Score | Macros | Calories | Kaira | Meals |
|---|---|---|---|---|---|---|
| No plan, nothing logged | Care user before the diet consultation | Locked, a padlock on the plate | Replaced by the three point card | None | "Show us what you eat" and the two ways to log | Four core meals, name and suggested time |
| No plan, food logged | Same user, food in | Locked | Plain grams, no targets | "1,213 kcal so far today" | Nudges the next log | Four core meals with what was logged |
| Plan set, nothing logged | Targets exist, day not started | Empty ring, "Log your first meal" | "Today's targets": 95g, 238g, 63g, 30g | "1,900 kcal goal for today" | "The score starts moving with your first meal." | Six meals, "382 cal planned" |
| First meal in | One meal logged | 12% | Real grams | Real numbers | Names the nutrient to watch | Six meals |
| Mid day | Some meals in | 54% | Real grams | Real numbers | The gap and the fix | Six meals |
| Whole day read | Every meal in | 88% | Real grams | Real numbers | What landed well | Six meals |
| Every target met | All four at target | 100%, one bloom of light | All at target | 1,900 of 1,900 | "This is the day to repeat." | Six meals |
| An earlier day | A finished past day | That day's score, still, no motion | That day's grams | That day's numbers | That day's read, then "Log for that day" | Read only |
| A day with nothing | A past day never logged | Empty ring | "Nothing was logged that day" | "No calories logged" | "One line is better than none, even from memory." | Read only |
| Loading | Data arriving | Shimmer | Shimmer | Shimmer | Shimmer | Three placeholders |

Rule: where there is no data, say what to do or show the target. Never print zeros.

## 5. Meal cards

- Always open. No expand, no collapse, no chevron.
- Header: meal name, "Suggested 8:00 - 10:00 AM · 486 of 382 cal", and a + button.
- Body: "YOUR COACH'S PLAN", option chips with a check on the chosen one, then food rows with a tick circle, name, quantity, calories and a ⋮ menu.
- Food logged outside the plan sits above the plan with a "Manual" tag.
- "Log all 3" or "Log the other 2" appears when two or more items are left.
- "TIPS FROM YOUR COACH" holds the parts of a plan that are not food, each with a tick and a one line tip.
- A coach's food has three states: logged, abstained, untouched. The action is called Skip, and the food stays on the plan. It is never deleted.
- Skip lives in one place: the meal card's ⋮ menu on this screen. The logging screen has no Skip, because that screen adds food to a tray, while saying "not today" to a coach's food is a decision about the plan. A plan food there is untouched until it is ticked.

## 6. The ways in

Six doors, one logging screen. Each door decides what is already in the tray and how the header reads.

| Door | Where it sits | Opens with |
|---|---|---|
| Meal + | The + on a meal card | That meal, empty tray, Your plan showing first |
| Tick a coach's food | The tick circle on a plan food | That food in the tray, waiting on quantity and time |
| Log all | "Log all 3" on a meal | Every remaining food of that meal at its planned quantity |
| Snap | Kaira's card, meal menu | The camera, on the frame step |
| Voice | Kaira's card, meal menu | The microphone, listening |
| An earlier day | "Log for that day" on a past day | The same screen with the day named, time set to that day |

A tick is never a silent log. Quantity and time are confirmed every time, and the time decides which meal the food lands in.

## 7. The logging screen

One screen, 23 states, five groups. Flag: `r3/log.html?state=`.

| Group | States | Rule |
|---|---|---|
| Finding food | `search`, `typing`, `noresults`, `plan`, `noplan` | Search on top, then three tabs: Your plan, Favourites, Frequent. No plan means no plan tab. |
| Confirming | `quantity`, `custom`, `multi`, `time` | Nothing logs until quantity and time are set. The tray holds several foods, one save writes all of them. |
| Photo | `snap`, `snapreading`, `snapresult`, `snapnone`, `snapdenied` | Frame, read, result. The result lands in the tray to be checked, never saved on its own. |
| Voice | `voice`, `voiceheard`, `voiceresult`, `voicenone`, `voicedenied` | The same three beats, with what was heard shown as words first. |
| Saving | `saving`, `offline`, `failed`, `duplicate` | The tray is never lost. Offline queues, failed retries, duplicate asks before adding twice. |

- A denied camera or microphone says what to do next and keeps the other ways to log in reach.
- No food in a photo, and no food in a voice note, are one line each, not errors.
- A food the database does not know ends in "add it yourself", which saves the food for everyone.

## 8. The success screen

The moment after a save. Flag: `r3/logged.html?state=`.

- It opens on the landing: a full screen green field, one white tick, one line, then it clears itself. One treatment on every state, no conditional colour. Whether you logged is not the same question as how the day is going, and the score answers the second one.
- The score animates from the old number to the new one. With no score, it counts what went in.
- One line from Kaira, carrying the insight.
- The four macros, as the Eat screen draws them: the glyph fills to its own level, four side by side, no bar.
- What went in, with quantity and calories, as the quietest card on the screen.
- Never a meal count. A plan can hold three meals or nine, so no "2 of 6" and no fixed progress track. The line points at the next log instead.
- The primary button changes per state: back to the day, or on to the next meal. It is the only button.
- A low affordance Edit sits under it, and opens the logging screen on what was just logged. Correcting a quantity and removing an item are the same job, and the logging screen already does both.

| State | When | What it says |
|---|---|---|
| `default` | A normal log mid day | The score's jump, and the nutrient that moved most |
| `first` | The day's first log | The score starts moving, the day is still open |
| `mealdone` | A meal is now complete | That meal is closed, the next one is named |
| `daydone` | Every meal is in | The day is read in full |
| `perfect` | All four targets met | One bloom of light. "This is the day to repeat." |
| `small` | The score barely moved | Honest about the size, still worth logging |
| `pastday` | Logged onto an earlier day | Names the day it went to |
| `noplan` | No plan yet | Counts what went in, says what the coach does with it |
| `undo` | The log was removed, from the logging screen | The score returns, plainly, with no scolding. What came out is named, so it can go back, and the quiet action becomes "Log it again" |

## 9. The sufficiency sheet

One sheet, opened from the info icon beside the Eat line and from tapping the plate.

- Hero: the number on a tinted band, or a lock when there is nothing to measure against.
- Card: "Your intake", the four nutrients and calories, values only.
- Sections, in order: What is Eat? What is nutrition sufficiency? How is it worked out? How does it help? Where do your targets come from?
- Bold question headings, dashed rules between them, the formula given as the answer.
- The coach who set the targets appears as a small card with a Message button, not as a sentence.
- Its states: a day with a score, before the plan exists, an earlier day, a day with nothing.

## 10. The date sheet

Opens from the date chip.

**The sheet**
1. One month at a time, a ring per day showing that day's sufficiency out of 100.
2. Legend at the bottom: "The ring is your nutrition sufficiency out of 100".
3. Tapping a day loads that day and closes the sheet.
4. Closes on the X, on a tap outside, and on Escape.

**Per day**
5. Scored day: ring filled to the score.
6. Today: marked as today, ring shows the live partial score.
7. Selected day: marked, and different from today.
8. Nothing logged that day: dashed empty ring, still tappable.
9. Logged before the plan existed: a dot instead of a ring, tappable.
10. Before joining: greyed, not tappable.
11. Future days, including later this month: greyed, not tappable.
12. Perfect day: full ring with a centre dot.

**Month navigation**
13. Back stops at the joining month, then the arrow is disabled.
14. Forward stops at the current month, so tomorrow cannot be reached.
15. Opens on the month of the day being viewed.
16. Loading a month: rings shimmer. Failed: one line and Retry, never a blank grid.

**The chip**
17. Left arrow steps back a day. Right arrow is disabled on today.
18. Reads "Today" on today, the date otherwise.

## 11. The first screen, three layouts

Before a plan exists there is nothing to report, so Kaira's card teaches and ends with the two ways to log. Three ways to fit that in the least height, still to be chosen:

- `v=1` Two tight rows: each point is one row, icon then the line finishing the same sentence.
- `v=2` One line stepper: the two steps collapse into a single strip, with the lock message left to the plate.
- `v=3` Progressive: one sentence and the buttons, with "How this works" opening when it is wanted. The shortest of the three at 185px collapsed, against 233 and 333.

## 11b. What shaped your score, two ways

Flag: `?rail=`. Both are live, and the control panel switches them.

- `rail=icons`, **the default.** The four macros, each glyph filling to its own level. The macros are the score, so this answers the question with the thing the score is made of.
- `rail=cards`, a scrolling rail of glass cards naming the biggest gap, what is closest to target, meals logged and calories left. Reads as insight rather than as data.

The heading follows the day: "What shaped your score?" once there is a score with food in it, "Today's targets" when the day only has goals, "What was logged that day" on a past day, "Your day so far" otherwise.

## 12. Decisions settled

Four questions came out of reading the live app and the backend. They are answered, and not open for the build.

| Question | Decision | Cost |
|---|---|---|
| Fibre has no target and no column in the backend. Keep it? | **Keep it.** Fibre stays the fourth nutrient, on the screen and in the score. | The backend adds a fibre target and a fibre column. |
| The API allows a future date. Allow it? | **No.** The chip's forward arrow stops on today and the date sheet greys the rest of the month. | A client rule. The API is unchanged. |
| A coach's food that was not eaten: delete it? | **No. Abstain.** One word for it, Skip, in one place: the meal card's ⋮ menu. A coach's food is never deleted. | Three states per plan food, not two. |
| Should ticking a plan food log it straight away? | **No.** Every tick confirms quantity and time, and the time decides the meal. | One extra step, in exchange for a day that is true. |

Sources: `research/web-flows.md` (the live webview) and `research/backend-rules.md` (production backend), read September 2026.

## 13. What the backend needs

There is no score on the server. `calories_adherence_patient` returns raw grams and calories, and its only percentage is the composition of what was eaten. Sufficiency is ours to define. Four things must be built before this screen is true.

| # | Needed | Why |
|---|---|---|
| 1 | A fibre target on the diet plan, and a fibre column on the food log | Plans carry protein, carbs and fat only, and `patient_food_item_logs` has no fibre column. A quarter of the score cannot be computed without both. |
| 2 | A sufficiency value per day, cheap to read a month at a time | The date sheet draws a ring per day. Reading every log row for thirty days is not a read the app can make. |
| 3 | A history row when plan approval overwrites the calorie goal | Approval writes `patient_goal_rel.goal_value` in place, so a past day cannot be read against the goal that applied then. |
| 4 | A decided day boundary | `todays_date()` returns the server's local date with its IST shift commented out, so "today" is neither the user's day nor explicitly IST. |

Already there, used as is: photo and voice as first class log sources, Kaira's logging endpoints including the unknown food lookup, meal time windows as plan data, logging onto an earlier day, and 7D to 1Y ranges for the Trend tab.

Watch: a manual food that matches a food in that meal's plan is silently relinked to the plan. The "Manual" tag is not the person's choice alone.

## 14. Bottom sheet rules

- Title at the top left, filled circle X at the top right in a 44px target.
- No drag handle drawn.
- At most 90% of the screen: the header stays put, the body scrolls.
- Backdrop 50% black, slide up 300ms.

## 15. Visual rules

- Page background is pure white. Cards separate themselves with a subtle border and a soft shadow, not a darker page.
- Most cards use that quiet treatment. A few earn creative depth: Kaira's card carries her indigo to teal gradient stroke with a squared top left corner, primary buttons sit on a solid depth bar, and the date sheet's calendar sits on a bound paper pad.
- The score carries the pillar colour. Other elements may use the wider GoodFlip palette: indigo belongs to Kaira, gold marks insight and reward, teal is a calm accent.
- Macros are one green, identified by their own icons, never by a colour each.

## 16. Copy rules

- Plain, friendly, second person. No em dashes. One "!" at most, and only for a real win.
- Kaira gives insight, never a recap of what was logged. Two short sentences at most.
- Nothing under 12px, every tap target at least 44px.

## 17. Open questions

- A past day shows today's plan food, so its per meal calories do not add up to that day's header. It needs real day data.
- Swipe down to dismiss a sheet is not built.
- The calorie strip and the Kaira treatment are not locked in yet. The options live in `r3/parts/index.html`.
- The first screen layout, v1, v2 or v3, is not chosen.
- How far back a person may log is not decided. The API does not limit it.
- Whether a person can change their own calorie target is not decided. The backend path exists and nothing calls it.
