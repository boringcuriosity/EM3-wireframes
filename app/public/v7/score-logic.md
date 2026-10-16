# Nutrition sufficiency score: the logic

Source: the score sandbox (`sufficiency-sandbox.html`), which is where the score is calculated. Every number below comes from its code.

## What the coach sets, per meal

- A target for **protein, carbs and fat**, in grams.
- A **calorie** target. It is used only to weigh the meal (step 1). Calories are not scored.

## Step 1: each meal's weight

```
Meal weight = meal calorie target ÷ day calorie target × 100
```

Example: breakfast 300 kcal in a 1,500 kcal day weighs **20**. All meal weights add up to 100.

## Step 2: mark each macro out of 100

`T` = the meal's target for that macro. `A` = what was eaten.

| What was eaten | Mark |
|---|---|
| Less than 80% of T | `A ÷ (0.8 × T) × 100` (a share of the full mark) |
| From 80% of T up to T + buffer | **100** |
| More than T + buffer | `100 − (A − T − buffer) ÷ T × 100`, never below **−50** |

- **Buffer** = 20% of T, or 3 g if 20% of T is smaller than 3 g.
- **A macro with a target of 0** is not marked.

## Step 3: the meal's mark

```
Meal mark = average of its macro marks
```

If no macro has a target, the meal mark is 100.

## Step 4: the meal's points

```
Meal points = meal weight × meal mark ÷ 100
```

- **Meal not logged yet:** 0 points.
- **Meal marked "not eaten":** nothing eaten, so 0 points. It still counts as done, so the day can finish.

## Step 5: the day's score

```
Day score = sum of every meal's points
```

Rounded to a whole number. It never shows below 0, and the most it can be is 100.

## Worked example

Breakfast weighs 20. Targets: P 15 g, C 40 g, F 9 g. Eaten: P 9 g, C 58 g, F 9 g.

| Macro | Working | Mark |
|---|---|---|
| Protein | 9 is under 12 (80% of 15), so 9 ÷ 12 × 100 | **75** |
| Carbs | Buffer 8 g (20% of 40), so full marks up to 48. 58 is 10 g past, and 10 ÷ 40 = 25%, so 100 − 25 | **75** |
| Fat | 9 is right on target | **100** |

- Meal mark: (75 + 75 + 100) ÷ 3 = **83.3**
- Points: 20 × 83.3 ÷ 100 = **16.7** of breakfast's 20

**Past the floor:** fat target 9 g, 30 g eaten. The buffer is 3 g (20% of 9 is only 1.8 g), so full marks up to 12 g. 18 g over is 200% of 9, which gives −100, so the mark stops at **−50**.

## To settle before build

1. **Eating less:** the sandbox and the PRD give full marks from 80% of the target. The explainer page (`eat-sufficiency-score.html`) says half the protein scores 50. The sandbox gives 62.5.
2. **Smallest buffer:** the sandbox and the coach portal use 3 g. The explainer page says 5 g.
3. **Eat screen prototype:** still uses the older capped average, not this rule (PRD section 22).
