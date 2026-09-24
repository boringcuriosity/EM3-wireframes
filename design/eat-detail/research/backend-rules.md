# What the backend actually does: diet, food logging, nutrition scoring

Source: `~/Downloads/MyTatvaCore-main` (production backend, read only). Paths below are relative to `api/`.
All diet code that the app uses lives in `modules/v8/diet/`. Written 22 Sep 2026.

## How the system models a day of eating

1. A coach writes a **diet plan** with a date range, a calorie total, and protein, carbs and fat as **percentages of calories**. It goes live only when its status is `approved`.
2. A plan holds **meal divisions** (`diet_plan_meal_rel`: meal type, start time, end time, a hide flag), and each division holds **options** (`diet_plan_meal_options_rel`: option number, food, quantity, unit, order, tips).
3. A person's food goes into one flat table, `patient_food_item_logs`, one row per food, carrying calories, protein, fats, carbs, quantity, meal type, a timestamp, a type (`diet_plan` or `manual`) and a source (`text`, `image`, `audio`, `kaira`).
4. A plan item counts as taken when a log row points at that exact option row on that date. There is no partial state.
5. Totals for a day are summed from those log rows at read time. Nothing is precomputed and nothing is stored as a daily score.

## Is there a score on the server?

**No.** There is no sufficiency, adherence or nutrition score anywhere in the backend. The endpoint named `calories_adherence_patient` (`modules/v8/diet/index.js:1339`) returns raw numbers only: calories eaten, calories targeted, grams of protein, carbs and fats eaten, and the same as targets. The only percentage it computes is the **composition** of what was eaten, not adherence:

```js
// modules/v8/diet/index.js:1191
params.protein = Math.round((protein_taken / total_taken) * 100 * 100) / 100;
params.carbs   = Math.round((carbs_taken / total_taken) * 100 * 100) / 100;
params.fat     = Math.round((fats_taken / total_taken) * 100 * 100) / 100;
```

Macro targets are derived, not stored in grams:

```js
// modules/v8/diet/index.js:2056 (plan values are percentages of calories)
carbs_target:   parseInt((target_carbs   / 100) * (total_calories / 4)),
protein_target: parseInt((target_protein / 100) * (total_calories / 4)),
fats_target:    parseInt((target_fats    / 100) * (total_calories / 9)),
```

So the sufficiency number, its per nutrient cap and its average are **ours to define and compute**, client side or in a new service.

## Rules a designer must respect

| Rule | What it means | Where |
|---|---|---|
| Day boundary is the server's date | `todays_date()` returns the server's local date. The IST shift in that function is commented out, so a day is not the user's device day and not explicitly IST. Uncertain what the server timezone is set to in infrastructure. | `config/common.js:1561` |
| A day is grouped by `achieved_datetime` | Everything for a date is `DATE(achieved_datetime) = that date`, so a meal's date follows the timestamp the client sends, not when it was saved. | `modules/v8/diet/index.js:2222` |
| What counts as logged | One row in `patient_food_item_logs` with `is_active = 'Y'` and `is_deleted = 'N'`. A plan item shows as taken only when its row carries that option's `diet_plan_meal_options_rel_id`. | `modules/v8/diet/index.js:2212` |
| Manual can become plan | If a manually logged food matches a food in that meal's plan, the backend relinks it and flips its type to `diet_plan`. A "Manual" tag is therefore not the user's choice alone. | `modules/v8/diet/index.js:661` |
| Logging into another day is allowed | `achieved_datetime` is required but unbounded, so past days (and future ones) pass validation. | `modules/v8/diet/validator.js:96` |
| Edit and delete are soft | Editing sends the same endpoint with `patient_food_item_logs_id`; deleting flips `is_active` and `is_deleted`. History is not versioned. | `modules/v8/diet/index.js:692`, `validator.js:140` |
| Plans cannot overlap | A new or edited plan is rejected if its dates overlap an existing plan that is not rejected or inactive. | `modules/v8/diet/index.js:24` |
| Editing a live plan splits it | If the plan started in the past, the old one is ended **today** and the new one starts **tomorrow**. A plan that has already ended cannot be edited at all. | `modules/v8/diet/index.js:41` |
| Only approved plans reach the app | The patient day view filters on `status = "approved"`. Pending and rejected plans are invisible. | `modules/v8/diet/index.js:929` |
| Approving a plan overwrites the calorie goal | `patient_goal_rel.goal_value` is set to the plan's total calories, in place. That path writes no history row. | `modules/v8/chief_hc/index.js:551` |
| The direct goal edit does keep history | The diet module's own goal update writes the previous value into `patient_goal_rel_logs`, and supports an update type of `H` coach, `P` patient or `D` doctor. Nothing in this repo calls it with `P`. | `modules/v8/diet/index.js:869` |
| Per meal calories are computed live | A meal's target is the sum of that option's items, priced from the food tables at read time, not a stored number. | `modules/v8/diet/index.js:1786` |
| Nutrients are per unit, scaled | Values come from `food_nutrients`, normalised as `(measure / calories_calculated_for) * basic_unit_measure`, then multiplied by quantity. Rounded to 2 decimals. | `modules/v8/diet/index.js:629` |
| Day sums truncate | The adherence path sums with `parseInt(...)` per row, so each food's decimals are cut before adding. Totals can read a few units low. | `modules/v8/diet/index.js:2063` |
| Logging pays rewards | Every food log fires a reward calculation for `FOOD_LOG`, dated by `achieved_datetime`. | `modules/v8/diet/index.js:727` |
| Kaira logging exists already | `log_food_using_kaira`, `log_food_using_kaira_v2` and `fetch_food_item_nutrients_for_kaira` take a list of named foods, ask an LLM for nutrients when the food is unknown, create the food and unit rows, then log. Source is recorded as `kaira`. | `modules/v8/diet/index.js:3079`, `:3568` |

## What our PRD assumes that the backend does not support today

- **Fibre as a fourth target.** There is no fibre target anywhere: plans carry protein, carbs and fat only. Our screen shows "21 of 30g" fibre.
- **Fibre in the day's total.** `patient_food_item_logs` has no fibre column (`db/db_operations/food_query.js:49`), so a day's fibre cannot be summed from logs. Fibre exists per food in `food_nutrients` and is returned when browsing foods, but manual and Kaira items are stored with `food_item_id = 0` or a newly created id, so recovering fibre after the fact is unreliable.
- **A sufficiency score.** Nothing computes, stores or returns one, so there is no history of past scores to draw the date sheet's rings from. The rings would have to be computed client side from each day's logs, or a new endpoint is needed.
- **Targets as they were on a past day.** The calorie goal is overwritten in place on plan approval with no history row, so a past day measured against "the goal that day" is only correct for logs that carry a plan link. Manual only days fall back to today's goal.
- **Six fixed meal divisions.** Divisions come from the plan, and a coach can hide any of them (`hide_meal`), so the count varies per patient and per plan.
- **Tips per meal.** Tips are stored per **option** (`dpmor.tips`), not per meal division, so two options in the same meal can carry different tips.
- **Water.** There is no water logging in the diet module. Water exists only in the GoodFlip care proxy (`modules/v8/good_flip_care/loggers/`, in ml) which talks to a separate service. Our screen dropped water, so this is consistent, but note the two systems.

## What the backend supports that our design ignores

- **Sodium, potassium, sugar and fatty acids** are all fetched per food (`modules/v8/diet/constant.js`) and shown in the plan list response. We show four nutrients.
- **Per meal reminders**, switchable by the patient per meal division (`diet_plan_reminders`, `modules/v8/diet/index.js:2122`). We show no reminder control. Uncertain what delivers them: no cron in `modules/v8` reads that table.
- **Chief remarks on a plan** (`dp.chief_remarks`), a coach note carried on the whole plan, which we do not surface.
- **Meal time windows are per plan** (`start_time`, `end_time` on each division), so "Suggested 8:00 - 10:00 AM" is real plan data, and it changes when the plan changes.
- **Photo and voice logging already exist** as first class sources, with an attachment stored in `meta`. Our Snap and Voice flows map onto them directly.
- **A food's nutrition can be created on the fly by an LLM** when the food is unknown, and is then saved back into the food tables for everyone.
- **Longer ranges are already supported** by the adherence endpoint: 1D, 7D, 30D, 90D, 1M, 6M, 1Y. Useful for the Trend tab.

## Open questions for engineering

- What timezone is the server set to, and is a day boundary meant to be IST for every patient? The shift in `todays_date()` is commented out.
- Where should the sufficiency score be computed: client, a new endpoint, or a nightly job that stores a per day value? The date sheet's month of rings needs a cheap read.
- Can a fibre target be added to `diet_plans`, and a fibre column to `patient_food_item_logs`? Without both, fibre cannot be scored.
- Should the calorie goal keep a history row when a plan is approved, so past days can be read against the goal that applied then?
- Is a patient allowed to change their own calorie target? The code path exists (`update_type: 'P'`) but nothing calls it.
- How far back should a person be able to log, and should the app limit it even though the API does not?
- What delivers `diet_plan_reminders`, and can a meal reminder be switched from the Eat screen?
- Is the GoodFlip care logger service (`good_flip_care/loggers`) the same food data as `patient_food_item_logs`, or a parallel store? The shapes differ.
