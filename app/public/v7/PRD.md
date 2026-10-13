# Eat detail screen

Draft 3, 14 Oct 2026. For design, dev and product.

- **Source of truth:** `nutrition-sufficiency.html`. Every screen, flow and state in this PRD is live there as a phone. Where this file and the document disagree, the document wins and this file is fixed.
- **Prototype:** `r3/app.html`, a phone and a control panel that reaches every case.
- **Screens, if you want one directly:** `r3/eat.html` the day view, `r3/log.html` the logging screen, `r3/logged.html` the success screen, `r3/trend-soon.html` the Trend tab, `r3/learn.html` the Learn tab, `r3/home.html` the way in.
- **Tools that sit beside the spec:** `sufficiency-sandbox.html` (the score's logic, live), `score-commentary.html` (the line under the score, every case), `coach-plan-builder.html` (the coach's side of the plan).

The example day throughout is Tuesday 15 September 2026. The person joined on 1 September and their coach set the plan on 5 September.

---

## 0. Scope at a glance

### In scope for this release

| # | Area | Section |
|---|---|---|
| 1 | Home, the way in (Your EM3 cards) | 1 |
| 2 | The Eat day view: structure, score, every state | 2, 3, 4, 5 |
| 3 | The line under the score | 6 |
| 4 | A free user | 7 |
| 5 | Meal cards, the floating bar, the review sheet and the future time rule | 8 |
| 6 | The ways in to logging | 9 |
| 7 | The logging screen: finding food and confirming it | 10 |
| 8 | The success screen | 11 |
| 9 | Every bottom sheet | 12 |
| 10 | Past the target, in red | 13 |
| 11 | The badge moment and the medal | 14 |
| 12 | The date sheet | 15 |
| 13 | The Learn tab | 16 |
| 14 | The Trend tab, as a coming soon screen | 17 |

### Out of scope for this release

| Out | What replaces it | Notes |
|---|---|---|
| **The Trend tab** (the week view, KAIRA's weekly insight with the gift box, the week's score, the per day gauges, the macros this week) | **The Trend coming soon screen**, section 17. The Trend tab in the bottom nav opens it. | The full Trend design stays in the document under "The Trend tab (out of scope)" for reference only. Nothing in it is to be built now, and no part of it is part of this spec. |
| First screen layouts `v=2` and `v=3` | `v=1`, two tight rows | Section 4. |
| The week strip on the day view | Nothing. The date chip and the date sheet carry navigation. | |
| Planned calories on a meal card ("382 cal planned") | The Nutrition breakdown chip and the meal sheet | Section 8. |
| The Your plan tab in the logging screen | Logging the plan on its meal card, from the floating bar | Sections 8, 9, 10. |
| Common meals in the Recent list | Recent shows only what this person logged | Section 10. |
| Notify me on the Trend screen | Nothing. The screen has no button. | Section 17. |
| A Skip on a coach's food, or any row menu | A food not eaten stays unticked | Section 8. |
| Fibre | Not in the score and not on the screen | Section 19. |
| Water logging, a Now or Later tag, a highlight on the current meal, expanding and collapsing meals, reaching a future day | Nothing | |

---

## 1. The way in: Home

GoodFlip's home screen, built from the design system's Homepage recipe and its components (top nav, welcome strip, banner carousel, score card, services, trackers, bottom nav). Flag: `r3/home.html`.

- Under the carousel sits **Your EM3**: one card per pillar, scrolled sideways.
- Each card carries the pillar's pictogram, its score's name, and the score in the bowl of a rising arc of that pillar's orbs.
- Colours: Eat green, Move indigo, Mind teal, Measure gold. Later the four combine into the metabolic score.
- Tapping Eat opens the day view this PRD describes.

---

## 2. What the screen is

The Eat pillar's day view. It answers three things in order: how the day is going, what has been eaten, and what the coach's plan says. Flag: `r3/eat.html?state=mid`.

### Structure, top to bottom

| # | Block | What it holds |
|---|---|---|
| 1 | Date chip | The day being viewed, with a step back arrow and a step forward arrow. Opens the date sheet. |
| 2 | Eat line | "Eat · Fuel your body right", with an info icon that opens the sufficiency sheet, and the Earn chip that opens the FlipCoins sheet. On a day at 80% or more the medal hangs just below the header on the right (section 14). |
| 3 | Score | Nutrition sufficiency as **Cloud Drop**: a liquid drop with Flip green orbs filling along an arc, the number, and a status tag under it. Under the tag, the line under the score (section 6). |
| 4 | What you have eaten | Protein, carbs and fats, each as its own icon filling to its level, with "43/95g" and the name. The heading follows the day (below). |
| 5 | Calorie strip | Ember fuse: "942 of 1,900 kcal" and "958 left for today". |
| 6 | KAIRA card | One or two sentences of insight, then "Log your meal" with Snap and Voice. |
| 7 | Your meals | Every meal of the day, always open, in coach plan order (section 8). |
| 8 | Bottom nav | Back, Eat, Trend, Learn. KAIRA's button floats above it. |

The macro heading follows the day: "What shaped your score?" when the day has targets and nothing in it yet, "What you have eaten" once food is in today, "What you ate" on a past day.

---

## 3. The score

### What it is

One number, nutrition sufficiency, out of 100. It is protein, carbs and fats against the coach's targets, scored meal by meal. The sandbox (`sufficiency-sandbox.html`) is the reference implementation.

1. **Each meal has its own targets:** the items the coach planned for it, added up.
2. **Each meal has a share of the day:** its share of the day's planned calories. In the example plan: breakfast 23%, lunch 28%, dinner 27%.
3. **Each macro in a meal earns credit:**
   - Below 80% of its target: the share of the target reached.
   - From 80% of the target up to the target plus a buffer: full credit. The buffer is 20% of the target, and never less than 3 g.
   - Past the buffer: it loses 1 point of credit for every 1% of the target over, down to a floor of −50.
4. **Meal score** = the average of its three macros' credit. A macro with no target in that meal is left out.
5. **Meal points** = the meal's share × its meal score. A meal counts only once it has food logged in it.
6. **Day score** = the meal points added up, rounded. It never shows below 0.

Why per meal: a whole day's food eaten at breakfast counts only towards breakfast, and far too much at one meal takes points back, up to half that meal's share.

The rule's numbers (the 80% start of full credit, the 20% buffer, the 3 g floor, 1 point per 1%, the −50 floor) are settings in the sandbox, so a different rule can be tried before it is agreed.

### How it is drawn

- Cloud Drop, in Flip green. The score is the one thing that carries the pillar's colour; everything else may use the wider GoodFlip palette.
- The drop carries the number only. No meal counts, no dates, no verdict inside it.
- It counts up from zero when the screen opens, over about 1.2 seconds. After a log it steps up from the old number to the new one.

### The status tag

| When | Tag |
|---|---|
| Today, nothing logged | Log your first meal |
| Today, some meals in, day not complete | 🌱 Building your day |
| A complete day or a past day, 100 | 🌟 Every target met (green) |
| 85 to 99 | 🌟 You're on track (green) |
| 50 to 84 | ⛅ Room to improve (gold) |
| 0 to 49 | ⚠️ Let's work on this (red) |
| A past day with nothing logged | Nothing logged |
| No plan, or a free user | No tag. The lock on the drop says it once. |

A day still being lived gets no verdict. A score of 54 at lunchtime is not "room to improve", it is halfway through.

---

## 4. The first screen

Before a plan exists there is nothing to report, so the drop holds a padlock and the KAIRA card teaches, ending with the two ways to log.

- **Chosen: `v=1`, two tight rows.** Each point is one row: an icon, then a line finishing the same sentence.
- `v=2` and `v=3` were tried and are out of scope.

Flag: `r3/eat.html?state=noplanempty&v=1`.

---

## 5. Screen states: one user, in order

Ten states, read as one person's first fortnight. Flag: `r3/eat.html?state=`.

| Act | State | Flag | When | Score | Macros | Calories | KAIRA | Meals |
|---|---|---|---|---|---|---|---|---|
| 1 Before a plan | No plan, nothing logged | `noplanempty` | Care user before the diet consultation | Locked, a padlock | Replaced by the teaching card | None | "Show us what you eat" and the two ways to log | Four core meals, name and suggested time |
| 1 | No plan, food logged | `noplan` | Same user, food in | Locked | Plain grams, no targets | "1,213 kcal so far today" | Nudges the next log | Four core meals with what was logged |
| 2 The plan arrives | Plan set, nothing logged | `empty` | Targets exist, day not started | Empty, "Log your first meal" | "Today's targets" for protein, carbs and fats | "1,900 kcal goal for today" | "The score starts moving with your first meal." | Every planned meal |
| 2 | First meal in | `first` | One meal logged | 12% | Real grams | Real numbers | Names the nutrient to watch | Every planned meal |
| 3 A day fills up | Mid day | `mid` | Some meals in | 54% | Real grams | Real numbers | The gap and the fix | Every planned meal |
| 3 | Whole day read | `full` | Every meal in | 88% | Real grams | Real numbers | What landed well | Every planned meal |
| 3 | Every target met | `perfect` | All at target | 100%, one bloom of light | All at target | 1,900 of 1,900 | "This is the day to repeat." | Every planned meal |
| 3 | More than the plan | `over` | Logged past the targets | The rule in section 3 applies, no reward for the extra | Past target, in red (section 13) | Over the goal, in red | Names what went over, without scolding | Every planned meal |
| 4 Days behind | An earlier day | `past` | A finished past day | That day's score, still, no motion | That day's grams | That day's numbers | That day's read, then "Log for that day" | Read only |
| 4 | A day with nothing | `missed` | A past day never logged | Empty | "Nothing was logged that day" | "No calories logged" | "One line is better than none, even from memory." | Read only |

**Rule for every state:** where there is no data, say what to do or show the target. Never print zeros.

The prototype also has a loading state (every block shimmers, three meal placeholders) and an error state. They follow the same rule.

---

## 6. The line under the score

After every log, one short line in a quote card under the score says what that log did, with a way to ask KAIRA why. Every case is in `score-commentary.html`.

| Case | Line | Tag | Link |
|---|---|---|---|
| Went up | "Your score went up by +N%, keep logging your meals. Learn more by asking KAIRA" | +N in green | Learn more by asking KAIRA |
| Went up by less than it could | "Your score went up by only +N%, you could have gained N% more. Find out why from KAIRA" | +N in amber | Find out why from KAIRA |
| Did not move, or dropped | The same line with 0 or −N | 0 or −N | Find out why from KAIRA |
| Not started | "Log your first meal to see your nutrition sufficiency score grow." | None | None |

- **Motion:** it waits as a soft shimmer while the score lands, then the words sweep in from the left.
- **The link:** KAIRA opens her chat with the question already asked: what was eaten, by name, against the Eat plan suggested by the coach, and the macros that resulted.
- **Not shown** where there is no score: no plan yet, a free user, a day with nothing logged.
- The document's cases (`say=pre`, `plan`, `some`, `double`, `triple`, `whole`, `pizza`) show how each kind of log moves the score under the rule in section 3.

---

## 7. A free user

Someone who uses the app without a care program. No coach, no Eat plan, so no sufficiency score at all, not even a locked one. The screen is a food diary. Flags: `state=free`, `state=freeempty`.

- **No score.** The score and everything about it stands down. The day starts at the date, then the macros.
- **Macros in grams.** The same three tiles with what was eaten and no target line, so nothing to fill towards. The tiles are shorter, since they carry no target.
- **Calories as a total.** The day's sum, with no goal beside it.
- **Nothing logged yet** (`state=freeempty`). Before the day's first log there is nothing to add up, so the What you have eaten section and the calorie total are not shown. KAIRA's card ("Log your meals by snapping a photo or saying what you ate.", with Snap and Voice) and the meals carry the screen. Both come back with the first log.
- **Meal cards with no plan.** Each meal is a slot to log into, with + on the card. Foods appear as they are logged, without the Manual tag. No Nutrition breakdown chip.
- **KAIRA** offers the two ways to log, and never mentions a coach.
- **No medal, no celebration sheet, no line under the score.**

---

## 8. Meal cards

Always open. No expand, no collapse, no chevron.

### The card

| Part | Holds |
|---|---|
| Header | The meal name; under it "Suggested 8:00–10:00 AM", and " · 486 kcal" once something is logged. No planned calories. A + button. |
| Nutrition breakdown chip | A small neutral chip, "ⓘ Nutrition breakdown", under the suggested time. It opens the meal sheet (section 12.2). Only a card with a plan has it. |
| Manual foods | Food logged outside the plan sits above the plan with a "Manual" tag. |
| YOUR COACH'S PLAN | Option chips with a check on the chosen one, then food rows: tick circle, name, quantity, calories. No menu on the row. |
| TIPS FROM YOUR COACH | The parts of a plan that are not food, each with a tick and a one line tip. |

### A coach's food

- Two states: **logged**, or **not yet**. There is no Skip. A food not eaten stays unticked. A coach's food is never deleted.
- A logged food's tick opens its sheet (section 12.6): change the quantity, or take it off your day. A food added by hand is removed instead.

### The floating bar

Ticking a coach's food does not log it. It drops into a floating bar at the bottom of the screen.

- The bar shows the foods, newest first, as its headline; under them "Edit quantity & time"; a **Log** button with the item count; and an X.
- The X does not clear at once. It slides the bar aside to show Remove, so one stray tap cannot empty it. Remove closes itself after 4 seconds.
- Foods from several meals can go in together, each with its own time.
- While a meal's foods are in the bar, its other options are locked: one option per meal.
- "Edit quantity & time" opens the review sheet (section 12.4).

### A time still to come

Only food already eaten can be logged.

- If any food in the bar is set later than now (dinner ticked at 1 PM), Log opens the review sheet instead of logging.
- The sheet opens with a **Future time** note: "N items are set for later. You can only log food you have already eaten. Had them? Set them to now." and a one tap "Set them to now, 1:00 PM".
- Each later time keeps its chip, with a dashed gold outline and a clock.
- Log stays disabled until every time is one that has already happened.
- On the time wheel, times still to come are greyed, and Done waits.

Flag: `state=mid&now=13:00&pt=future`.

---

## 9. The ways in

Four doors lead to the logging screen, each opening it already knowing something. The coach's plan is not one of them: it is logged on its meal card, from the floating bar.

| Door | Where it sits | What the screen opens with | Flag |
|---|---|---|---|
| Meal + | The + on a meal card | That meal, an empty tray, Recent first | `r3/log.html?entry=plus` |
| Snap | KAIRA's card, and the meal menu | The camera, on the frame step | |
| Voice | KAIRA's card, and the meal menu | The microphone, already listening | |
| An earlier day | "Log for that day" on a past day | The same screen with the day named in the header, and the time set to that day | `r3/log.html?entry=pastday` |

**One rule for all four:** nothing is logged silently. The time is shown before every log and decides which meal the food lands in.

---

## 10. The logging screen

One screen. Flag: `r3/log.html?state=`. The document specifies two groups, finding food and confirming it.

### Finding food

Search sits on top, then two tabs: **Recent** and **Favourites**. There is no Your plan tab.

| State | Flag | What it shows |
|---|---|---|
| The first open | `ftux` | No plan, nothing logged, nothing hearted. Every list is empty at once. |
| Favourites, before any | `ftuxfav` | The empty state shows the very heart it asks you to press. |
| No plan yet | `noplan` | They have logged before, so Recent shows what they logged lately. |
| Search, resting | `search` | The empty field, with Recent underneath. |
| Typing | `typing` | Two letters in, keyboard up. The tray rides above it. |
| Nothing found | `noresults` | Food the database does not know. KAIRA takes it from here. |

- **Recent** is headed "What you logged lately" and holds only what this person has logged. No common meals. Someone who has logged nothing gets the first open state instead.
- A food the database does not know ends in "add it yourself", which saves the food for everyone.

### Confirming

Nothing is logged until quantity and time are set. Several foods can wait in the tray at once.

| State | Flag | What it shows |
|---|---|---|
| Quantity | `quantity` | The Add item sheet (section 12.7): how much, in the food's own unit. |
| Several foods waiting | `multi` | Four in the tray. One save writes all of them. |
| Time | `time` | The time wheel. The time decides which meal this lands in. |

Saving plays as an overlay, then the day view opens on the score stepping up. A log earns FlipCoins: the coin toast lands once the score has finished stepping up.

### Also in the prototype

The prototype carries the photo, voice and saving states from draft 2. They are not re-specified in the document and keep their earlier rules: a denied camera or microphone says what to do next and keeps the other ways to log in reach; no food in a photo or a voice note is one line, not an error; the tray is never lost (offline queues, failed retries, a duplicate asks before adding twice).

---

## 11. The success screen

The moment after a save. One job: show what the log did to the day. Flag: `r3/logged.html?state=`.

- It opens on the landing: a full screen green field, one white tick, one line, then it clears itself. One treatment on every state.
- The score animates from the old number to the new one. A day with no score shows the count of what went in.
- One line from KAIRA, never a recap of the items.
- The three macros as the Eat screen draws them. What went in, with quantity and calories, as the quietest card.
- Never a meal count. A plan can hold three meals or nine.
- The primary button changes with the state: back to the day, on to the next meal, or log another. It is the only button.
- A low affordance Edit sits under it and opens the logging screen on what was just logged. Undo stays reachable for as long as the screen is up.

| State | When | What it says |
|---|---|---|
| `default` | A normal log mid day | The score's jump, and the nutrient that moved most |
| `first` | The day's first log | The score starts moving, the day is still open |
| `mealdone` | A meal is now complete | That meal is closed, the next one is named |
| `daydone` | Every meal is in | The day is read in full |
| `perfect` | Every target met | One bloom of light. "This is the day to repeat." |
| `small` | The score barely moved | Honest about the size, still worth logging |
| `pastday` | Logged onto an earlier day | Names the day it went to |
| `noplan` | No plan yet | Counts what went in, says what the coach does with it |
| `undo` | The log was undone | The score returns, plainly, no scolding |

---

## 12. Bottom sheets

### Rules for every sheet

- Title top left. Filled circle X top right, in a 44px target.
- No drag handle drawn.
- At most 90% of the screen. The header stays put and the body scrolls.
- Backdrop 50% black. Slides up in 300ms.
- Closes on the X, on a tap outside, and on Escape.
- Only exception: the celebration sheet (12.5), which has a coloured sky and a centred layout.

### 12.1 The sufficiency sheet

| | |
|---|---|
| Opens from | The info icon beside the Eat line, and tapping the score |
| Title | Nutrition sufficiency |
| Hero | The number on a tinted band, or a lock when there is nothing to measure against |
| Card | "Your intake": **Calories first**, with the flame icon, then protein, carbs and fats as three tiles. Values only. |
| Sections | Bold question headings, dashed rules between them: What is nutrition sufficiency? How your score works. How does staying nutritionally sufficient help? Where do your targets come from? The formula is given as an answer. |
| Coach | The coach who set the targets, as a small card with a Message button |
| States | A day with a score (`state=mid&sheet=suff`), before the plan exists (`state=noplan&sheet=suff`, a lock and grams), an earlier day (`state=past&sheet=suff`), a day with nothing (`state=missed&sheet=suff`, the rows say so once) |
| Red | Past the target rule, section 13 |

### 12.2 The meal sheet (Nutrition breakdown)

| | |
|---|---|
| Opens from | "ⓘ Nutrition breakdown" on a planned meal card. A free card or a no plan card has no chip and no sheet. |
| Title | The meal's name. Under it: "Suggested 8:00–10:00 AM · what went in, against this meal's target" |
| Rows | Always in this order: Protein, Carbs, Fats, Calories. Each row: the amount eaten and its ideal range ("Ideal: 19–29 g"), then a thin bar with an indigo fill for what went in and two handles at the ends of the range. |
| What counts | The plan foods that are ticked, plus anything logged on top. The target is the option the person chose for that meal, or the one on show if they have not chosen. |
| The range | The meal's target give or take 20%. For protein, carbs and fats it is never narrower than 3 g either side. |
| Colour | Values are neutral grey. A value outside its range, over or under, turns error red #D92D20. Past the top handle the bar itself turns red from the handle onward, in a light to error red gradient. Under the range, only the number is red. Macro icons stay neutral. |
| Below the bars | A small legend for the range, then "What the ideal range means": "Your coach sets a target for every meal. Anywhere inside the range counts as on target." |
| Cases | Inside every range (`meal=lunch`), outside on two (`meal=bf`), a tiny target where the 3 g floor gives a 0–3 g range (`meal=pre`), nothing logged yet so every value is red (`state=daydone&meal=dinner`) |

### 12.3 The date sheet

Section 15.

### 12.4 The review sheet (Food items to log)

| | |
|---|---|
| Opens from | "Edit quantity & time" on the floating bar, or Log when a time is still to come |
| Title | Food items to log |
| Top | The Future time note, only when an item is set later than now (section 8) |
| Rows | Each food: name, helping and calories; a time chip (dashed gold with a clock when it is in the future); a stepper. Minus at one takes the food out. |
| Footer | Total kcal, and "Log N items". Log is disabled while any time is in the future. There is no Done that only closes. |

### 12.5 The celebration sheet (Sunrise)

Section 14.

### 12.6 A logged food's sheet

| | |
|---|---|
| Opens from | The tick on a logged food |
| Title | The food's name |
| Rows | Change the quantity. Take it off your day (a coach's food). Remove this, in red (a food added by hand). |
| Not | A food not yet logged has no sheet. |

### 12.7 The Add item sheet (quantity)

| | |
|---|---|
| Opens from | Choosing a food in the logging screen |
| Title | Add item. Then the food's name and its unit ("1 bowl"). |
| Facts card | **Calories first**: the flame, "Calories", and "242 kcal". Under a hairline, the three macros in columns: the grams on top (bold, 22), then the icon beside the name (14). All four icons use the glyph gradient. |
| Footer | Add to meal. Once the food is in the tray, the same button becomes its stepper. |

### 12.8 The time sheet

The time wheel: hour, minute, AM or PM. A line under it says which meal the time lands in ("Today at 8:30 PM lands under Dinner"). Times still to come are greyed, and Done waits.

### 12.9 The FlipCoins sheet

Opens from the Earn chip on the Eat line. It is the app's existing FlipCoins sheet and is not redesigned here.

---

## 13. Past the target

When a number goes past its target, it turns GoodFlip's error red, #D92D20, on the number only. Bars, fills and icons keep their colours.

| Where | Rule |
|---|---|
| What you have eaten | A macro tile's grams turn red once they pass that macro's target for the day. 88 of 95 g stays; 310 of 238 g turns red. |
| Calorie strip | Turns red once it passes the day's goal. |
| The sufficiency sheet | The same rule on its tiles and its calorie line. |
| The meal sheet | Red when outside the ideal range, over or under (section 12.2). The only place the bar itself turns red. |

Nothing else turns red. The score, the tag and the line under the score say what the day means.

Cases: `state=over` (three past target, protein still short and unchanged), `state=overone` (only fats past), `state=over&sheet=suff`.

---

## 14. The badge moment and the medal

### When

The day's nutrition sufficiency reaches **80% or more**. The day earns a medal, and the celebration sheet rises once.

### The medal

One medal, always the same: a green heart shaped like an apple, with a stem and a leaf, in a gold rosette (`icons/badge/simple/heart-apple.svg`). No name, no levels. It only counts how many times it has been earned.

### The celebration sheet: Sunrise

Flag: `badge-celebration-options.html?only=1`.

| Part | Spec |
|---|---|
| Sky | A soft sky of mint, cream and indigo above a curved white horizon. The arc runs off both sides and the sky fades to white before it, so there are no hard corners. Slow rays behind the medal. |
| Title | "Yay! You earned a medal". On a repeat: "Yay! Another medal". |
| Line | "Congratulations, you received a medal for giving your body what it needed today. Protein, carbs and fats all landed close to your coach's targets." |
| Coins | A thin divider that fades at both ends, then the coin beside a gold "+45" (26px, counting up from 0), with "FlipCoins earned today" under it. The number is what the day's logging earned. |
| Button | One: "Awesome! Keep Going". The circle X also closes it. No date, no second button. |
| Size | 540px tall. |
| Motion | The sheet rises (0.1s), the medal resolves from a blur (0.45s), the rays fade in and turn slowly, one turn a minute (0.5s), confetti in GoodFlip's colours bursts once from the medal (0.9s), a shimmer crosses the medal and the coins count up (1.3s). Everything eases, nothing bounces. |
| Reduced motion | No confetti. The coins show their final number. |

### After the sheet: the medal that hangs

Flag: `state=perfect&badge=medal`.

- **What:** the same rosette, 40px, on a short ribbon in gold and Flip green that tucks behind it, hanging just below the header on the right.
- **When:** only on a day at 80% or more, on that day's view. A day below 80% shows nothing (`state=mid&badge=medal`).
- **Motion:** on arrival the ribbon drops in from above and the medal swings once, settling still in about 1.4s. It never moves again while the screen is open. Reduced motion: it simply appears.
- **Tap:** the celebration sheet opens again over the Eat screen. Its X, its button or a tap outside closes it.

### In the date sheet

A day at 80% or more shows the medal, small and without its ribbon, in place of its ring (section 15).

---

## 15. The date sheet

Opens from the date chip. Flags: `sheet=1`, and `state=past&date=2026-9-8&sheet=1`.

**The sheet**
1. Title "Select date". One month at a time, a mark per day carrying that day's sufficiency out of 100. The calendar sits on a bound paper pad.
2. Legend at the bottom: "The ring is your nutrition sufficiency out of 100. A medal is a day at 80% or more."
3. Tapping a day loads that day and closes the sheet.
4. Closes on the X, a tap outside, and Escape.

**What each mark means**

| Mark | Meaning | Tappable |
|---|---|---|
| A ring, filled clockwise from the top | That day's score, out of 100 | Yes |
| The medal, small, no ribbon | A day at 80% or more, a perfect day included | Yes |
| A dashed empty ring | A day after the plan began with nothing logged | Yes, so it can be logged |
| A dot | Food logged before the coach set targets, so no score | Yes |
| Faded | A day still to come, or before the person joined | No |
| Bold date | Today, whatever its mark | Yes |
| Green box | The day the Eat screen is showing | Yes |

**Month navigation**
- Back stops at the joining month, then the arrow is disabled.
- Forward stops at the current month, so tomorrow cannot be reached.
- Opens on the month of the day being viewed.
- Loading a month: rings shimmer. Failed: one line and Retry, never a blank grid.

**The chip**
- Left arrow steps back a day. Right arrow is disabled on today.
- Reads "Today" on today, the date otherwise.

---

## 16. The Learn tab

The fourth tab. Articles about sufficiency and eating, laid out like the app's category screen. Flags: `r3/learn.html?view=list`, `?view=article`.

| Piece | Spec |
|---|---|
| Header | The category name, "Nutrition & Metabolic Health", in Playfair Display 26, on a pale blue wash that fades to white |
| Row | An 88 × 88 photo at radius 10 with a hairline and a soft offset shadow, then the title (18, two lines, then an ellipsis) and "4 min read · 18 Sep 26" at the photo's bottom edge |
| Divider | A 1px hairline between rows. No cards, no sections, no carousel: one list. |
| Tap | A row opens the article: title, byline, hero, then the body |

---

## 17. The Trend tab: coming soon

**Trend is out of scope for this release.** Its tab in the bottom nav opens this coming soon screen instead. The full Trend design stays in the document for reference only (see Scope, section 0).

Flag: `r3/trend-soon.html?v=fan`. Version chosen: **A hand of cards**.

| Part | Spec |
|---|---|
| Layout | No header. The Trend tab's bottom nav. Content centred vertically. Top to bottom: the cards, the chip, the heading, the copy. |
| The cards | Four small cards fanned like a hand, a glimpse of what Trend will hold. **What you ate** (three macro lines over time), **How you did** (a sufficiency bar per day, today dashed in gold), **Where you stand** (the weekly average as a ring), **KAIRA insights** (the real KAIRA mark, placeholder lines). Shapes only: no numbers, no made up data. Neutral labels and icons. |
| Chip | The score's status tag in its gold state, with a clock: "Coming soon". |
| Heading | "Trends are on the way", Playfair, neutral. |
| Copy | "Soon you'll see the bigger picture of how your nutrition sufficiency is going, week after week, with insights from KAIRA." |
| Nudge | On its own line, under a thin divider that fades at both ends, neutral: "Keep logging, and your trends will be ready soon." |
| Actions | None. No Notify me, no toast. The bottom nav takes people back. |
| Motion | The cards are dealt in one by one, left to right, about 0.15s apart, then they settle; the chip and the words rise in. It plays once and ends still. A tap on the cards plays it again. |
| Reduced motion | The end state. |

---

## 18. What the screen never does

- Recap the day in KAIRA's voice. Every line carries insight.
- Show a meal count or a fixed progress track.
- Give a verdict on a day still being lived.
- Delete or skip a coach's food.
- Log without showing the time.
- Log food set for a time still to come.
- Reach a future day.

---

## 19. Decisions settled

| Question | Decision | Cost |
|---|---|---|
| Fibre has no target and no column in the backend. Keep it in the score? | **No.** Protein, carbs and fats, the three the plan already sets. Fibre is off the screen and out of the score. | None. |
| The API allows a future date. Allow it? | **No.** The chip's forward arrow stops on today, and the date sheet greys the rest of the month. | A client rule. The API is unchanged. |
| A coach's food that was not eaten: delete it? | **No. Leave it unticked.** No Skip, no row menu. | Two states per plan food: logged, or not yet. |
| Should ticking a plan food log it straight away? | **No.** It goes to the floating bar, where quantity and time are confirmed, and the time decides the meal. | One extra step, for a day that is true. |
| Where is the coach's plan logged? | **On its meal card**, from the floating bar. Not in the logging screen. | The logging screen loses its Your plan tab. |
| Can food set for later be logged? | **No.** Only food already eaten. | The Future time note and a disabled Log. |
| Is Trend in this release? | **No.** A coming soon screen takes its tab. | None. |

Sources: `research/web-flows.md` (the live webview) and `research/backend-rules.md` (production backend), read September 2026.

---

## 20. What the backend needs

There is no score on the server. `calories_adherence_patient` returns raw grams and calories. Sufficiency is ours to define.

| # | Needed | Why |
|---|---|---|
| 1 | A sufficiency value per day, cheap to read a month at a time | The date sheet draws a mark per day. Reading every log row for thirty days is not a read the app can make. |
| 2 | Per meal targets and each meal's share of the day | The score is scored meal by meal (section 3), and the meal sheet reads a meal's target. |
| 3 | A history row when plan approval overwrites the calorie goal | Approval writes `patient_goal_rel.goal_value` in place, so a past day cannot be read against the goal that applied then. |
| 4 | A decided day boundary | `todays_date()` returns the server's local date with its IST shift commented out, so "today" is neither the user's day nor explicitly IST. |
| 5 | A medal count per person, and whether a day has earned one | The celebration sheet's "Another medal", the medal that hangs, and the date sheet's medals. |
| 6 | The FlipCoins a day's logging earned | The "+45 FlipCoins earned today" on the celebration sheet. |

**Already there, used as is:** photo and voice as first class log sources; KAIRA's logging endpoints, including the unknown food lookup; meal time windows as plan data, so "Suggested 8:00–10:00 AM" follows the plan; logging onto an earlier day; and 7D to 1Y ranges, which a later Trend will read.

**Watch:** a manual food that matches a food in that meal's plan is silently relinked to the plan, so the "Manual" tag is not the person's choice alone.

---

## 21. Rules everywhere

### Visual
- Page background is pure white. Cards separate with a subtle border and a soft shadow.
- Most cards are quiet. A few earn depth: KAIRA's card has her indigo to teal gradient stroke with a squared top left corner, primary buttons sit on a solid depth bar, and the date sheet's calendar sits on a bound paper pad.
- The score carries the pillar colour. Indigo belongs to KAIRA, gold marks insight and reward, teal is a calm accent, green is the score and the primary action.
- Macros are one colour, identified by their own icons, never by a colour each.

### Motion
- Smooth eases. No bounce, no spring, no wobble.
- Every animation has a reduced motion version that shows the end state.

### Copy
- Plain, friendly, second person. No em dashes. One "!" at most per screen, and only for a real win.
- KAIRA in capitals. KAIRA gives insight, never a recap. Two short sentences at most.
- Nothing under 12px. Every tap target at least 44px.

---

## 22. Where the prototype differs from this spec

The build follows this spec. These are known gaps in the prototype, not open questions.

| # | Spec | Prototype today |
|---|---|---|
| 1 | The day score uses the per meal rule (section 3), as in the sandbox | The day view's score still draws the earlier rule: the mean of the three macros, each capped at its target |
| 2 | A meal's other options lock while its foods are in the floating bar | Foods from several options of one meal can go in together |
| 3 | "Today's targets" names protein, carbs and fats | The document's states table still lists a fourth target (30 g), left from fibre |

---

## 23. Open questions

- A past day shows today's plan food, so its per meal calories do not add up to that day's header. It needs real day data.
- Swipe down to dismiss a sheet is not built.
- The calorie strip and the KAIRA treatment are not locked in. The options live in `r3/parts/index.html`.
- How far back a person may log is not decided. The API does not limit it.
- Whether a person can change their own calorie target is not decided. The backend path exists and nothing calls it.
- The per meal rule's numbers (80%, 20%, 3 g, 1 point per 1%, −50) are not yet agreed with the clinical team.
