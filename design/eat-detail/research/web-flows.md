# What the live web flow does today, Diet and food logging

Read only review of `app.goodflip.in` (the in app webview, React) and `goodflip` (the Next.js marketing site), 22 Sep 2026. Code paths are relative to `src/` in `app.goodflip.in-master` unless stated. The marketing repo has nothing about diet logging or sufficiency, so everything below comes from the webview.

## Summary in five lines

1. The Diet page is a date calendar, a calories progress card, an optional Kaira log prompt, and a list of meal cards for the chosen day.
2. There are two versions of the whole page, decided by one field: a user with a coach plan sees plan meals with options, a user without one sees empty meals and free logging.
3. A plan food is not ticked in place. Ticking sends you to a separate page to confirm quantity and time, and only that page writes the log.
4. There is no nutrition sufficiency score anywhere in the product today. The only score on the Diet side is calories consumed of a calorie goal, plus a separate insights page with protein, carbs and fats.
5. Future dates are reachable and render read only. Editing of any kind is gated on the day already having started.

## Every state and case found

| # | Case | Where it lives | What the user sees |
|---|---|---|---|
| 1 | Plan user, day view | `helpers/diet.ts` `buildDietData` returns `type: "dietPlan"`, rendered by `components/molecules/diet/MealsCards/MealsCards.tsx` | Meal cards with option chips and plan foods |
| 2 | No plan user, day view | same builder returns `type: "defaultCalories"`, renders `FoodDiaryMealCard` | Same meals, no options, only what the user logged |
| 3 | Meal with nothing in it | `MealsCards/FoodItems.tsx`, falls back to `meta_data.message` | A centred grey line from the server, per meal |
| 4 | Page loading | `pages/Diet/DietPage.tsx`, `isFetchingData` | Full height spinner in place of the meal list |
| 5 | Calories card | `components/atoms/ProgressCard`, fed by `dietData.total_consume_calories` and `total_calories` | "X of Y" with the line "Calories consumed today!" |
| 6 | Calories card on a future day | `DietPage.tsx`, `disabled={!moment().isAfter(dietPlan.date)}` | Card is disabled, tapping does not open insights |
| 7 | Calorie goal fallback | `DietPage.tsx`, `total_calories ?? 1200` | If the API sends no target, the page shows 1200 |
| 8 | Plan option switching | `MealsCards/DietOption.tsx` | Chips "Option 1", "Option 2", plus a "Manual" chip, the selected chip is disabled |
| 9 | Option auto selection | `helpers/diet.ts` `computeSelectedOptionsAndTotals` | The first option that has any eaten item wins, otherwise option 1 |
| 10 | Manual foods | `helpers/diet.ts`, manual logs become a synthetic option called "manual" | Manual items show alongside the selected option and sort to the top |
| 11 | Option locking after eating | `DietPlanMealCard.tsx` `addIconVisible` | Once an item in one option is eaten, other options lose their add button and tick |
| 12 | Coach tip per option | `DietPlanMealCard.tsx` `optionTip` | A bordered box under the food list with the tip for the selected option |
| 13 | Tick a plan food (consume) | `FoodDiaryItemComponent.tsx` then `pages/Diet/FoodDetailsPage.tsx` | Leaves the page, opens a form with quantity and meal time, then returns |
| 14 | Untick a plan food (abstain) | `components/organisms/diet/AbstainDietItemBottomSheet.tsx` | Sheet "Didn't eat this?", one button "Yes, remove it" |
| 15 | Edit a logged food | three dot menu, `FoodDetailsPage` in Update mode | Quantity, unit and time can change |
| 16 | Delete a food | three dot menu, confirm sheet in `DietPlanMealCard.tsx` | "Are you sure you want to delete this food item from your meal?" with No and Yes |
| 17 | Delete blocked for plan food | `DietPlanMealCard.tsx` | Red toast: the item was recommended by your nutritionist |
| 18 | Source tags on a row | `FoodDiaryItemComponent.tsx` | Grey chip "Manual", or a chip with the Kaira logo when the log came from Kaira |
| 19 | Past day | date in the URL, `dietPlan.date` | Fully editable, this is how a user backfills |
| 20 | Today | default | Editable |
| 21 | Future day | `moment().isAfter(dietPlan.date)` is false | Ticks, add buttons and three dot menus all disappear, plan is readable |
| 22 | View only mode | `mode === "view_only"` from auth | Every control hidden, for whoever views another person's day |
| 23 | Add food to a meal | header plus button to `/diet/food-search` | Search page with recent searches |
| 24 | Search with no match | `components/organisms/search-food-items/SearchResult.tsx` | "Searched meal not found!" |
| 25 | Search paging | same file | "Loading more..." at the list foot |
| 26 | Meal is chosen by time | `FoodDetailsPage.tsx` `pickBestMealForTime` | The time you enter decides which meal the food lands in |
| 27 | Kaira prompt card | `components/molecules/diet/KairaFoodLogWidget.tsx`, behind the `IS_KAIRA_FOOD_LOG_ENABLED` flag | "Time to log your meal! You can snap a photo or speak it out. Whichever feels easiest." with Snap and Voice |
| 28 | Kaira floating button | `KairaFoodLogFAB.tsx`, same flag | Expands to the same two actions |
| 29 | Snap camera states | `organisms/KairaLogger/FoodLogger/components/KairaChatFooter/Snap/index.tsx` | requesting ("Starting camera..."), active, error with the message shown |
| 30 | Snap preview | `Snap/SnapPreview.tsx` | Retake or Continue |
| 31 | Snap guidance sheet | `organisms/diet/SnapInfoBottomSheet.tsx` | Three tips: "Make it crystal clear", "Capture your full meal", "Go for a side angle" |
| 32 | Voice logging | `KairaChatFooter/Voice`, `hooks/useSpeechToText.ts` | Speech to text, then the same chat result |
| 33 | Kaira chat states | `KairaChatBody/` | Typing indicator, loader, bot and user messages |
| 34 | Kaira failure | `FoodLogger/components/ErrorCard.tsx` | "I am not able to process right now. Please retry or try again later" |
| 35 | Insights page | `pages/Diet/DietInsightsPage.tsx` | Calories bar chart with ranges 1D, 7D, 1M, 6M, 1Y |
| 36 | Calories across meals | same page, `renderCAMItem` | Ring per meal, "achieved of target Cal" |
| 37 | Macronutrient analysis | same page | Only fats, carbs and protein, each a ring with achieved of target |
| 38 | Goal row, free user | same page, button `disabled={isPaidUser}` | Tappable, opens the goal wheel |
| 39 | Goal row, paid user | same page | Not tappable, no chevron, the coach owns the number |
| 40 | Goal picker | `molecules/Insights/GoalSelectionBottomSheet.tsx` | "Calories Goal", "Define the Calories you must target to consume each day", wheel of 1000 to 5000, button "Set Goal" |
| 41 | Goal update failure | same file | Toast "Unable to update patient's calorie goal." |
| 42 | About calories block | insights page | A static paragraph explaining what a calorie is |
| 43 | Deep link to a meal | `DietPage.tsx`, `?mealName=` | Scrolls that meal into view |
| 44 | Back behaviour in the shell | `DietPage.tsx` `onPressBack` | Sends a message to the native app when the module is Diet, otherwise router back |
| 45 | Back button hidden | `LOCAL_STORAGE.QUERY_PARAMS.hideBackButton` | Header renders without back |
| 46 | FlipCoins entry | `Header` with `showFlipcoinsFromSrc`, `constants/common.ts` | "Earn FlipCoins" badge in the Diet header, diet is an activity type for rewards |

## Cases our redesign does not cover yet

1. **Abstain as a separate action.** Today a planned food can be marked "did not eat", which is not the same as never ticking it. Our design only has ticked or not, so a coach cannot tell a skipped meal from an unlogged one.
2. **Ticking opens a confirm step.** The live flow always asks for quantity and time before writing a log. Our prototype logs on the tick itself, which is faster but changes what a log means and removes the chance to fix the time.
3. **The time you log decides the meal.** `pickBestMealForTime` moves a food into whichever meal window the time falls in. Our design assumes the meal you tapped is the meal it lands in.
4. **Option locking.** Once one option is eaten, the others become read only and the meal's add button disappears. Our chips switch freely.
5. **Delete is refused for coach foods.** A plan item cannot be deleted, only abstained. Our ⋮ menu offers remove without that rule.
6. **View only mode.** A whole rendering of the page with every control hidden, used when someone else views the day. We have no such state.
7. **Future days are reachable and read only.** We removed tomorrow entirely. The live product lets you look ahead at the plan, which is arguably the point of having a plan.
8. **Fibre is not in the live model.** Insights track protein, carbs and fats only, and the food nutrition list has fiber as a fourth item but the analysis does not use it. Our score averages four nutrients including fibre, so either the API or the score definition has to move.
9. **Kaira as a source tag.** Logs carry a source, and a Kaira log wears her mark on the row. Our rows only distinguish Manual.
10. **Search states.** No match, recent searches, paging. Our quick add has none of these.
11. **Snap guidance and camera failure.** Three photo tips, plus permission and camera error states. Our capture flow is a happy path.
12. **Kaira failure.** A visible error card when the model cannot answer. We have no failure state for Snap or Voice.
13. **Calorie goal editing by free users.** A wheel from 1000 to 5000, blocked for paid users. Our sheet says only that the coach sets targets.
14. **Per meal calorie targets.** The live insights show achieved against target for each meal. Our meal header shows it, but the PRD never states where a meal target comes from.
15. **A meal can be hidden.** `hide_meal` exists on the plan meal type. We assume all six always show.
16. **FlipCoins on the Diet screen.** Logging is a rewarded activity with an Earn badge in the header. Our screen has no reward surface at all.
17. **Deep link into one meal.** The app opens Diet scrolled to a named meal. Our date sheet has no equivalent entry point.

## Copy worth keeping

- "Time to log your meal! You can snap a photo or speak it out. Whichever feels easiest."
- "Didn't eat this?" and "We'll remove it from your meal and adjust your calories." with the button "Yes, remove it".
- "Are you sure you want to delete this food item from your meal?"
- "Unfortunately, you can not delete this food item since it was recommended by your nutritionist."
- "Make it crystal clear", "Bright and clear photos help Kaira recognize your food easily".
- "Capture your full meal", "Show your entire plate including sides or drinks for best accuracy."
- "Go for a side angle", "Side angles help Kaira understand portion sizes better".
- "I am not able to process right now. Please retry or try again later"
- "Searched meal not found!"
- "Define the Calories you must target to consume each day"
- "Recommended Time:" as the label above a meal window, with "X of Y Cal" under it.

## Business rules a designer could get wrong

1. **A logged item is `is_active === "Y"`.** Abstained is `"N"`, deleted is `is_deleted: "Y"`. Three states, not two.
2. **The day's consumed calories sum every option, not the selected one.** `buildDietData` deliberately totals eaten items across all options so the progress card does not jump when the user switches chips. The meal header, by contrast, shows only the selected option's totals.
3. **A meal's target calories come from the selected option.** Switch option and the meal's "of Y Cal" changes, while the day total does not.
4. **Nothing is editable until the day has started.** Every control is wrapped in `moment().isAfter(dietPlan.date)`, so a future day is readable but frozen.
5. **Plan versus free is one field.** `health_coach_id` on the diet plan decides whether the user is treated as a coached user, and `meals_data.length` decides whether the page renders in plan mode.
6. **A manual food is a synthetic option.** It is not a row type, it is an option called "manual" that is always shown with whichever numbered option is selected.
7. **The calorie goal has two sources.** `total_calories` for a coached plan, `default_calories` for everyone else, and per meal `default_{meal}_cal` when there is no plan.
8. **The goal is editable only for free users.** The button is disabled when `paidUser` is true.
9. **Quantity is a number with a separate unit id.** Both are sent on every log, so "2 x 1 katori" is quantity 2 of unit katori, not a free text portion.
10. **Meal windows come from the server.** `meta_data.range.timeStart` and `timeEnd`, with `default_time` as a fallback, so windows are data and not constants in the app.
11. **Empty meal copy comes from the server too.** `meta_data.message` is whatever the API sends for that meal, so the empty state is not ours to write in the client.

## What I could not determine from the code

- Whether any nutrition sufficiency score exists anywhere in the backend. It does not appear in either web repo. `MyTatvaCore` was not in scope for this review.
- Whether water logging exists for diet. Nothing in the webview logs water. The only water strings are in CGM and BCA constants.
- Whether streaks are tied to food logging. FlipCoins lists diet as an activity type, but the rules and the values are fetched from the API, not defined in the client.
- Whether fibre is returned by the calories adherence API. The client only reads protein, carbs and fats from `macronutrition_analysis`.
- What `hide_meal` does in practice. It is carried through the builder but never read by any component I found.
