# Mind: the day screen, Rhythm, sleep, logging and the coach's plan

Draft 1, 23 Nov 2026. For design, dev and product, and for an engineering agent to build from.

- **Source of truth:** the prototype. Every screen, state and sheet in this PRD runs there. Where this file and the prototype disagree, check section 24 first; if it is not listed there, raise it in section 25.
- **Patient app:** `/v7/mind/index.html` (the day view), `/v7/mind/learn.html` (Learn tab), `/v7/mind/trend.html` (Trend tab). The smart sleep card needs `?sx=1`; every link in this PRD carries it. Base link for the example day: `/v7/mind/index.html?sx=1&sdev=ah&swait=0`.
- **Coach portal:** `/v7/coach-mind-plan.html` (the Mind plan builder), `/v7/coach-mind-rhythm.html?p=sahana` (the coach's view of a patient's Rhythm). Every coach-side rule, default and limit is logged in `v7/coach-mind/mind-plan-defaults.md`.
- **Docs that sit beside this spec:**
  - `/v7/mind-rhythm.html`: every case as a live phone.
  - `/v7/mind-sleep-smart.html`: the sleep card and every sleep sheet.
  - `/v7/mind-commentary.html`: the line under the score, KAIRA notes and the prompt.
  - `/v7/mind-ftux.html`: the first look.
  - `/v7/mind-medal-options.html`: the medal.
  - `/v7/mind/breath-library.html` and `v7/mind/breath-lab/FINAL.md`: breathing.
  - `/mind/deck.html`: the concept.
  - `/mind/sandbox-simple.html`: the score, live.
- **Code an agent should read first:**
  - `mind/rhythm.js`: the score.
  - `mind/sleep-rule.js`: which sleep is the night, with a self-test: `node v7/mind/sleep-rule.check.cjs`.
  - `mind/rhythm-say.js`: the line and KAIRA.
  - `mind/plan.js`: defaults, rows and ticks.
  - `mind/layouts.js`: the part of the day cards.
  - `mind/variants/sleep.js`: the sleep state machine, with `sleep-card.js`, `sleep-load.js`, `sleep-track.js` and `sleep-ask.js`.
  - `mind/variants/mood.js`, `mind/variants/breath.js`, `mind/variants/lib.js`, `mind/variants/parts.js` and `mind/variants/win.js`.
  - `coach-mind/data.js`: plan shape, lists, templates and the sample plan.

**The example day** throughout is today at 3:00 PM, on the coach portal's sample plan:
- Sleep 7.5 h, window 10:30 PM to 6:00 AM.
- Three wind-down tasks.
- Simple Breathing for 5 min at 7:00 AM.
- Me-time "Walk in nature or a park" at 7:00 AM.
- Mood check-ins at 8:00 AM and 9:00 PM.

Apple Health brought in a night of 10:50 PM to 6:10 AM (7h 20m). Nothing else is ticked, so the Rhythm is 49.

URL flags in this PRD are prototype controls for reaching a case. They are not product features.

---

## 0. Scope at a glance

### In scope

| # | Area | Section |
|---|---|---|
| 1 | The Mind day screen: structure and every state | 1, 3 |
| 2 | The Rhythm score, and how a night is judged | 2 |
| 3 | The line under the score, and KAIRA analysis | 4 |
| 4 | What shaped your score? | 5 |
| 5 | Last night: the smart sleep card, its strip and its gold cards | 6 |
| 6 | Every sleep sheet: Apple Health, Arc ring, logging as questions | 7 |
| 7 | Android (Health Connect) for now | 8 |
| 8 | Your mind plan: part of the day cards, ticking, Rhythm breakdown | 9 |
| 9 | The win moment | 10 |
| 10 | Mood check-in | 11 |
| 11 | Breathing: the plan row, the player, the library | 12 |
| 12 | Wind-down and me-time | 13 |
| 13 | Before a plan, and a free user | 14 |
| 14 | Past days | 15 |
| 15 | Every bottom sheet | 16 |
| 16 | The medal, the date sheet, FlipCoins, the first look | 17 |
| 17 | The Rhythm sheet | 18 |
| 18 | The Learn, Trend and Practices tabs | 19 |
| 19 | Coach portal: the Mind plan, and the patient's Rhythm | 20, 21 |
| 20 | What the backend needs | 22 |

### Out of scope

| Out | Notes |
|---|---|
| The full Trend tab | A coming soon screen (section 19). |
| Opening most Learn articles | Only article 1 opens. |
| The Practices themselves | The Practices tab loads the reflection app as it is (section 19). |
| Pairing screens for the Arc ring | Only "Ready to connect your Arc?" is drawn. Bluetooth pairing comes from the ring team. |
| The smart sleep flow on Android | Android keeps the Health Connect flow for now (section 8). |
| Sleep stages, a sleep score from a device, diagnosing sleep | Rhythm counts what is logged. The Rhythm sheet says so. |
| Writing sleep back to Apple Health or Health Connect | Logs stay in GoodFlip. |
| Eat and Move | Separate PRDs: `v7/PRD.md`, `v7/move-prd.md`. |

---

## 1. The Mind day screen

The Mind pillar's day view answers three questions: how steady last night was against the coach's plan, and how well the person cared for themselves through the day. Prototype: `/v7/mind/index.html`.

### Structure, top to bottom

| # | Block | What it holds |
|---|---|---|
| 1 | Header | The Mind glyph, **"Mind"** and the tagline **"Care for your steady wellbeing"**. On the right, the **Earn** chip (coin + "Earn") opens the FlipCoins sheet (section 17). At 80% or more the medal hangs from under the header on the right. |
| 2 | Date pill | Back arrow, then a calendar icon with **"Today"** (opens the date sheet), then a forward arrow. Forward is disabled on today; back is disabled before the join date. There is no delta beside the date on any day. |
| 3 | Score | Rhythm, drawn as **Cloud Drop** in GoodFlip gold with the word "Rhythm". The whole score is a button ("What is Rhythm?") that opens the Rhythm sheet (section 18). |
| 4 | The line under the score | One short line from fixed sentences. After a gain it ends with a **Learn more** link (section 4). |
| 5 | What shaped your score? | Two tiles, **Sleep quality** and **Self-care**, each shown as "N% of 100%" (section 5). |
| 6 | Last night | The sleep card and the strip under it (section 6). |
| 7 | Your mind plan | Part of the day cards: Morning, Afternoon, Evening and Night. A part with nothing in it is not drawn (section 9). |
| 8 | More breathing exercises | One slim row that opens all seven exercises (section 12). |
| 9 | Bottom nav | Back, **Mind** (active), **Practices**, **Trend**, **Learn**. Free users have no Practices. |

On the example day the plan shows Morning (Simple Breathing, Walk in nature, the 8 AM mood check-in), Afternoon (Last caffeine, 4:00 PM) and Night (the 9 PM check-in, Screen-free wind-down at 9:30 PM, preparing the room at 10:00 PM). Evening has nothing, so it is hidden.

There is no KAIRA card on Mind. The sleep card asks for last night, and each plan card says what is left.

---

## 2. The Rhythm score

### What it is

Rhythm measures how steady the night and the day were against the coach's Mind plan, out of 100. It starts at 0 each morning, and it never goes down because of anything the person did not do. It rewards a steady routine over a long lie-in.

### The formula

```
Sleep quality (70)
  Sleep duration     = 25 × hours part     (from the night and naps, below)
  Sleep consistency  = 25 × window part    (bedtime and wake-up against the coach's window)
  Wind-down          = 20 × tasks ticked ÷ tasks planned
Self-care (30)
  Breathing          = 10 × exercises done ÷ exercises planned   (done = 1 minute breathed, or ticked)
  Me-time            = 10 × (1 if the activity is ticked, else 0)
  Mood check-in      = 10 × check-ins logged ÷ check-ins planned
Rhythm = round(sum)
```

- Weights live in one place: `P.w = { hours: 25, window: 25, wd: 20, br: 10, me: 10, mood: 10 }` (`mind/plan.js`, from `coach-mind/data.js`). They were 23/24/23 until 17 Nov 2026. Coaches never set weights.
- **The face picked never changes the score.** Checking in is what counts. With two check-ins, each earns 5.
- Only the total is rounded.
- Each part is capped at its share by construction.
- The example night (10:50 PM to 6:10 AM, 7h 20m) earns 23.6 for duration and 25 for consistency, which rounds to **49**.

### When a part is left out: the weights re-share inside the group

Only the parts the coach's plan has count. A part left out shares its points with the rest of its own group, so Sleep quality stays 70 and Self-care stays 30 on every plan (decided 17 Nov 2026). Duration, consistency and mood are always in the plan. Wind-down, breathing and me-time can be missing.

```
Sleep group:     [duration 25, consistency 25, wind-down 20]  → each × 70 ÷ (sum of parts present)
Self-care group: [breathing 10, me-time 10, mood 10]          → each × 30 ÷ (sum of parts present)
```

| Plan leaves out | Result |
|---|---|
| Wind-down | Duration 35, consistency 35 |
| Me-time | Breathing 15, mood 15 |
| Breathing and me-time | Mood 30 |

The coach builder today requires at least one wind-down task, at least one breathing exercise and one me-time activity, but the score handles any of them missing. See section 25, question C.

### How a night is judged (`mind/sleep-rule.js`, decided 16 Nov 2026)

1. **The day's window.** Today's Rhythm reads every sleep that ended between 6 PM yesterday and 6 PM today. The night belongs to the morning it ends in.
2. **Tidying.** Overlapping or repeated sessions (a watch and the phone, for example) are merged so that no minute counts twice. Any piece under 10 minutes is then dropped.
3. **Joining.** Pieces join into one sleep when the break between them is 1 h or less. The limit rises to 3 h when the break sits wholly inside the coach's window (awake in the night).
4. **The night and naps.** The night is the sleep with the most time asleep. Every other sleep is a nap. Naps get no card; they count quietly towards hours only.
5. **Sleep duration.** This is the time asleep in the night plus every nap, with breaks left out.
   - At the coach's target, or up to 1 h over it, the part is full.
   - Below the target it falls in a straight line to 0 at 3 h short.
   - Past target + 1 h it loses 20% for each extra hour, so a long nap can cost points.
   - The target is the coach's number. There is no age band.
6. **Sleep consistency.** This is judged only when the night has at least 3 h asleep; a shorter night gets 0 for it (a hard cut).
   - Bedtime is the night's first sleep; wake-up is its last.
   - Each edge scores 1 within 30 minutes of the plan and 0 at 2 h or more off, with a straight line in between. Early and late count alike.
   - The two edges are averaged. Naps never move it.
7. **Night shifts.** The coach can set the window in the day (for example 9:00 AM to 4:30 PM), and it is judged the same way. A window that wakes after 6 PM (evening shift) is not supported.
8. **Fixed settings.** All of these are fixed for every patient: target allowance 1 h over, 20% lost per hour past it, zero at 3 h short, 30 min for full marks, zero at 120 min off, 3 h minimum night.

The self-test covers the doc's cases. For example, plan [25, 25], the synced 10:50 PM to 6:10 AM night [24, 25], and late by 60 min [17, 21].

### Rules

- **The score never shows a minus.** If it falls (an untick, a removed check-in, an edit), it settles at the new number quietly, and the line goes back to the nudge.
- **On a gain** the score steps up with **"+N%"**. The line waits 2.4 s, then speaks and checks the medal.
- **A medal** is a day at 80% or more (section 17). The medal comes off if the day falls back under 80.
- **No score.** There is no score before a plan (a padlock instead) and none for a free user (the score is hidden).

### How it is drawn

Cloud Drop is the same component as Eat's sufficiency and Move's Momentum, here in Mind's Rhythm gold:
- the orbs use gold 300, 400, 600 and 800;
- the gauge uses 500 to 700;
- the shadow uses 900;
- the centre bubble keeps its milky cloud with no gold.

Before a plan the number is replaced by a padlock.

---

## 3. Screen states

| State | Prototype flag | What the screen shows |
|---|---|---|
| Plan user, last night in | `sx=1&sdev=ah&swait=0` | The example day: score 49, Sleep quality 70%, Self-care 0%, the plan |
| Start of the day, night arriving | `sx=1&sdev=ah&now=7.5` | Checking Apple Health, then the night arrives with its toast, then "Last night’s sleep added +49%." |
| First visit, nothing connected | `sx=1` (same as `sdev=new`) | Log it yourself card; the Apple Health ask opens by itself |
| Said no to Apple Health | `sx=1&sdev=none` | Log it yourself card, "Track sleep automatically" strip |
| Before a plan, nothing logged | `state=noplanempty&sx=1&sdev=none` | Padlock, lock line, sleep card "Your coach uses it to shape your sleep plan.", seven breathing cards |
| Before a plan, night logged | `state=noplan&sx=1&sdev=ah&swait=0` | As above with the night |
| Free user | `state=free&sx=1&sdev=ah&swait=0` | No score, "Your last night", seven breathing cards, no Practices |
| A past day | `state=past&date=2026-9-10` | That day's score, closed check-ins (section 15) |
| A template plan | `t=t-default`, `t-sleep`, `t-calm`, `t-motivation` | That template's plan. Templates have no me-time, so self-care re-shares |
| Night shift | `pbed=09:00&pwake=16:30` | The day window; the bar runs 6 AM to 8 PM |
| Android | `os=android` (without `sx`) | The Health Connect flow (section 8) |
| Sleep cases | `sday=…`, `sleep=…` | Section 6 |
| Mood cases | `mstate=…`, `sheet=mood` | Section 11 |
| Breathing cases | `bfstate=…`, `bx=…` | Section 12 |
| Clock | `now=<hours>` | Default 15 (3:00 PM) |

`state=` values such as `mid`, `empty`, `full` and `over` are Eat leftovers and are not Mind states.

---

## 4. The line under the score

The line is written by the app from fixed sentences, never by the AI. Only the % and the case change. Code: `mind/rhythm.js` (nudges) and `mind/rhythm-say.js` (gains). Every case: `/v7/mind-commentary.html`.

### Before anything new (no Learn more)

| Case | Line |
|---|---|
| Last night not logged yet | **Log last night’s sleep to start today’s Rhythm.** |
| Last night in, nothing new | **Keep going through your day to grow your Rhythm.** |
| Before a plan | Your Rhythm score unlocks after your first Mind Coach consultation, once your coach assigns you a plan. |
| Free user | No line, because there is no score. |

On plan days the card stays hidden until there is something to say.

### After a gain (first match wins)

| # | Case | Line |
|---|---|---|
| 1 | Reached 100% | **You reached 100% Rhythm!** You looked after your night and your day. (no +N% capsule) |
| 2 | Crossed 80% | **You’ve earned today’s medal!** Your Rhythm went up by +N%. Well done. |
| 3 | Last night came in or was saved | **Last night’s sleep added +N%.** A steady night is the base of your Rhythm. |
| 4 | A wind-down task | **Your wind-down added +N%.** Small steps in the evening help you sleep steady. |
| 5 | Breathing | **Your breathing added +N%.** A few slow breaths help your body settle. |
| 6 | Me-time | **Your me-time added +N%.** Time for yourself keeps stress low. |
| 7 | A mood check-in | **Your mood check-in added +N%.** Naming how you feel helps you understand your day. |
| 8 | Two kinds at once, or anything else | **Your Rhythm went up by +N%.** Every small step keeps your Rhythm steady. |

Rules:
- The gain is a green capsule.
- Every gain line ends with **Learn more**.
- A change that adds nothing leaves the line as it was.
- Never a minus, and never a judgement of the mood picked.

### Learn more → KAIRA analysis

- Learn more, or a tap anywhere on the line card, opens **"KAIRA analysis"**.
  - It starts with a shimmer and "KAIRA is looking at your day…".
  - Then comes the note, then **"Got it"**.
  - It uses the same sheet as Move (`/move/kaira-sheet.js`).
- The note is written by AI from facts the app sends. **The AI never computes numbers.** The facts (`MDKAIRA.context`):
  - `user_state`, `time_now`, `just_logged {kind, name}`;
  - `score_before`, `score_now`, `change`;
  - `medal` (just earned, earned earlier today, or not yet);
  - `last_night` (slept hours, target, bedtime and plan bedtime, wake-up and plan wake-up, window "on time" or "N min late");
  - `sleep_parts` (% of full), `coach_targets`;
  - `plan_items` (kind, name, time, done, adds) and `next_best` (at most 2, each with `adds` and `score_after`).
- **The note's shape:**
  - a bold opening of 2 to 6 words;
  - one paragraph with only the change in bold;
  - **What helps next**, with 1 or 2 points written "thing at time, now% to after%";
  - an optional closing line;
  - at 100%: "Rest well tonight. Tomorrow starts fresh." with no next steps;
  - from 8 PM, only suggestions that fit the evening.
- **Checks before showing:**
  - every % is one the app sent;
  - no minus;
  - no dash inside a sentence;
  - no comment on the mood answer;
  - no #, numbered lists, links or emoji;
  - under 80 words.
- If a check fails: retry once, then show the app's own template note (`MDKAIRA.sample`). The template titles are:
  - "Last night is in."
  - "Your wind-down counted."
  - "That breathing counted."
  - "Your me-time counted."
  - "Thanks for checking in."
  - "Today’s medal is yours!"
  - "You reached 100% Rhythm!"
- Prompt: `MDKAIRA.PROMPT` in `mind/rhythm-say.js`, also copied in `coach-mind/mind-plan-defaults.md` (rewritten 18 Nov 2026).

---

## 5. What shaped your score?

Since 17 Nov 2026 this sits between the line under the score and Last night. It is hidden before a plan and for free users.

- Two tiles in Move's indigo glass: **Sleep quality** and **Self-care**, each with an ⓘ.
  - Each is its own score out of 100: **"70%** of 100%". The glass fills to the same level.
  - The 70/30 weights and the points are never shown to the patient.
- A tile's % = the group's points earned ÷ the group's maximum. Each part's points are rounded first, so a tile can differ from the total by a point.
- Tapping a tile opens its sheet. The title is the tile's name, then a lead, then one block per part in the plan. Each block has the part's name, what it is, and a gold "For a good score" box. **"Got it"** sits at the foot.

**Sleep quality** lead: "Sleep quality shapes most of your Rhythm. A good night sets up everything after it: your focus and how much energy you have."

| Part | What it is | For a good score |
|---|---|---|
| Sleep duration | How long you slept. Naps count too. | Aim for about 7h 30m of sleep, the amount your coach set for you. |
| Sleep consistency | How close your bedtime and wake-up were to your plan. | Go to bed near 10:30 PM and get up near 6 AM, even on weekends. |
| Wind-down | The calm evening steps your coach picked to help you fall asleep. | Tick each one off as you do it before bed. |

**Self-care** lead: "Self-care makes up the rest of your Rhythm. Small moments of care through the day keep stress low and help your mind stay steady."

| Part | What it is | For a good score |
|---|---|---|
| Breathing | The breathing exercises in your plan. | Finish each one. Even a few minutes help you feel calmer. |
| Me-time | A little time that is just for you. | Do any one thing your coach suggested. |
| Mood check-in | A quick note on how you feel. | Check in each time. There is no wrong answer, every answer counts. |

---

## 6. Last night: the sleep card

The card decides its own source. There is no source chooser (decided 19 Nov 2026). Prototype: `?sx=1`. Every case: `/v7/mind-sleep-smart.html`.

### How the card decides

1. If the **Arc smart ring** is paired, it reads the ring. The Arc ring belongs to GoodFlip: it pairs and syncs inside the GoodFlip app, and Sync is real.
2. Otherwise, if **Apple Health** is allowed, it reads Apple Health. Apple Health also fills a night the ring missed.
3. Otherwise the person **types it in**.
4. **Typed or edited times always win that night.** A later sync keeps them.
5. **The ring and Apple Health disagree:** the ring's night shows until the person picks one, for last night only.
6. **The first time on Mind** the Apple Health sheet opens by itself, once (section 7). X or "I’ll log it myself" means the person logs it themselves and is never asked again. Connecting later lives in the three dots and the strip.
7. Apple never says whether sleep reading was refused, so "said no on Apple’s screen" looks the same as "no data".

### The frame (every state)

- Section heading **"Last night"**; for a free user, **"Your last night"**.
- One frame in every state, so empty, loading and filled share it:
  - the GoodFlip Sleep pictogram (Zz, 52 px) at the top left;
  - a title and a line beside it;
  - the three dots at the top right ("Last night options", a 44 px target);
  - then the body, then the strip under the card.

### States

| State | When | Card |
|---|---|---|
| **Log it yourself** | Nothing connected and nothing logged; or a device synced and found nothing | Title **"Tell us how you slept"**. Line **"Logging your sleep helps your Rhythm score grow."** Before a plan: **"Your coach uses it to shape your sleep plan."** Primary button **"Log Last Night’s Sleep"**. No empty bar. |
| **Loading** | A device is connected and the night is being fetched | Apple Health: title **"Checking Apple Health"**, with the line changing "Searching Apple Health" → "Fetching last night’s sleep" → "Calculating your hours". Ring: **"Syncing your Arc ring"**, "Connecting to your Arc ring" → "Reading last night’s sleep" → "Calculating your hours". Each line holds 1.4 s; the last one stays until the night lands. Shimmer blocks sit where Slept and Woke up go; a soft light glides along the empty bar every 1.8 s; the picture breathes. Screen readers hear "<title>. This takes a few seconds." |
| **Filled** | Any night | The hours as the title, **"7h 20m"** with a small "of sleep". Then the moon "Slept **10:50 PM**" and the sun "Woke up **6:10 AM**", then the bar. For a split night, one more line: **"Awake 2h at 1:30 AM"** (3 or more pieces: "Awake 40 min in 3 breaks"). No notes inside the card. |

The loader runs for 4 s in the prototype. In the product it lasts until the read returns. When the night lands:
- the toast **"Your last night’s sleep is updated."** shows;
- the score steps up;
- 2.4 s later the line says "Last night’s sleep added +N%."

### The strip under the card

One piece in every state, always tappable. The left part opens "Track your sleep automatically" (section 7). A green text action sits at the right end.

| When | Left | Right |
|---|---|---|
| Nothing connected, no night | **"Track sleep automatically"**, with the Apple Health and ring icons overlapping, and a chevron | |
| Loading | Icon, spinner, **"Syncing with Apple Health"** or **"Syncing with your Arc ring"** | none |
| Synced, nothing found | Icon, **"No sleep data found · 7:44 AM"** | **Manage** |
| A device night | Icon, **"Last synced 7:22 AM"** | **Manage** |
| The ring missed, Apple Health filled it | Heart, **"From Apple Health, 7:22 AM"** | **Manage** |
| Typed or edited | Pencil, **"Added by you, 7:12 AM"** | **Connect**, only when nothing is connected |

There is no automatic retry after "nothing found". The person retries from Manage, then Sync.

### The bar

- A 14-hour track that starts 2.5 h before the coach's bedtime, floored to the hour: 8 PM to 10 AM for a 10:30 PM bedtime, or 6 AM to 8 PM for the 9:00 AM night-shift window.
- Axis labels every 4 h: "8 PM", "12 AM", "4 AM", "8 AM".
- The coach's window is an indigo-50 band with a dashed indigo-200 border. There is no band before a plan.
- The night is a gold bar (`#E7C144` to `#826E2D`). A split night shows a hatched gap. The bar animates over 0.5 s.
- The legend reads "Last night · Sleep window, 10:30 PM to 6:00 AM". Before a plan there is no window line.
- aria-label: "Slept 10:50 PM to 6:10 AM. Your plan is 10:30 PM to 6:00 AM."

### Gold Yes/No cards under the card

These use Move's "Workouts to log" gold card: a striped gold ribbon with a warning triangle and a dismiss X, a bold title, one line, and small secondary buttons. On dismissal the card tucks under the card above: it rises 28 px, shrinks a little and fades in 0.26 s, then the space closes.

| Card | When | Ribbon | Title | Line | Buttons |
|---|---|---|---|---|---|
| Short night | A device night under 3 h | Short night | **Did you sleep only 2h 05m?** | That is what Apple Health shows for last night. If you slept more, tap No and fix it. (ring: "That is what your Arc ring shows…") | **Yes** keeps the times. **No** opens the questions sheet; for a ring night, "Before you edit" comes first. X = Yes. Toast "Kept Apple Health’s times." / "Kept Arc smart ring’s times." |
| Two different nights | The ring and Apple Health are 3 h or more apart (for example, the ring was off to charge) | Two different nights | **Which one is right?** | Your ring shows 3h 40m and Apple Health shows 7h 20m for last night. | **Verify** opens "Which one is right?" (section 7). X keeps the ring's night, with the toast "Kept Arc smart ring’s times." |

### Every case

| Case | Prototype |
|---|---|
| First visit (the Apple Health ask opens) | `sx=1` |
| Log it yourself | `sx=1&sdev=none` |
| Checking Apple Health (held) | `sx=1&sdev=ah&swait=hold` |
| Syncing the ring (held) | `sx=1&sdev=ring&swait=hold` |
| From Apple Health | `sx=1&sdev=ah&swait=0` |
| From the ring | `sx=1&sdev=ring&swait=0` |
| Nothing found | `sx=1&sdev=ah&sday=missing` |
| Short night | `sx=1&sdev=ah&sday=short&swait=0` |
| Edited | `sx=1&sdev=ah&sday=edited&swait=0` |
| Typed while connected (typed wins) | `sx=1&sdev=ah&sday=typed&swait=0` |
| Typed, nothing connected | `sx=1&sdev=none&sday=ok` |
| Ring missed, Apple Health filled it | `sx=1&sdev=both&sday=ringmiss&swait=0` |
| Ring and Apple Health differ | `sx=1&sdev=both&sday=differ&swait=0` |
| Split night from the device | `sx=1&sdev=ah&swait=0&sleep=split2h` |
| Split night, typed | `sx=1&sdev=ah&swait=0&sstate=split` |
| Raw sessions, judged by the rule (doc only) | `sleep=plan`, `late15` to `late120`, `early…`, `nap20`, `nap90`, `napeve`, `napin`, `naponly`, `dozeback`, `short2h`, `nightshift`, `dup`, `overlap`, `crumb`; add `ssrc=manual` for typed |
| Just the card, for docs | `only=sleep&otop=1` |

---

## 7. Sleep sheets

### 7.1 The first-time Apple Health ask

This opens by itself 1.2 s after Mind loads on a first visit. It also opens from **Connect** on Apple Health in the Track sheet.

- Title **"Let your phone fill in your sleep"**.
- Line: "Your watch or sleep app already saves it. Connect once, and last night comes in by itself every morning."
- A label "Next, your phone will ask" over a picture of iOS Health Access: "“GoodFlip” would like to access and update your Health data." It lists Sleep, Steps, Workouts, Active Energy and Heart Rate, all on.
- Primary **"Connect Apple Health"**: the sheet closes, the toast "Apple Health is connected." shows, then the loader runs, then the night arrives (or nothing is found).
- Text button **"I’ll log it myself"** and X: the sheet closes and the log-it card stays. **Never asked again.**

### 7.2 Track your sleep automatically

Opened from the strip (any part, Manage or Connect) and from the three dots.

- Title **"Track your sleep automatically"**. The ring row comes first, then Apple Health, on one soft indigo card.
- **Not connected:**
  - **"Connect Arc smart ring"** / "Reads sleep while you wear it." with a green **Connect** button;
  - **"Connect Apple Health"** / "Reads sleep from other apps or devices." with **Connect**.
- **Connected:** "Arc smart ring" or "Apple Health", a green dot, "Last synced 7:22 AM", and a secondary **Sync** button with a sync icon.
- **Connect on the ring** opens "Ready to connect your Arc?" first; after pairing, the toast "Your Arc ring is connected." shows and it syncs. **Connect on Apple Health** opens the ask (7.1). **Sync** closes the sheet and runs the loader.
- No radios and no "which source" choice.

### 7.3 Ready to connect your Arc?

Shared with Move steps (`/v7/ring-ready.js`).

- Title **"Ready to connect your Arc?"**, with the ring picture full width.
- Line: "Keep your Arc smart ring charged and close to your phone before we start pairing."
- Primary **"Connect Arc Ring"**. Text button **"I Will Do It Later"**.

### 7.4 The three dots

A sheet titled **"Last night"**, with rows that each have an icon and a chevron:
- **No night:** **"Log sleep"** and **"Track sleep automatically"**.
- **With a night:**
  - **"Edit your sleep"**;
  - **"Add another sleep"** / "A nap, or sleep after waking up";
  - **"Track sleep automatically"**.

### 7.5 Before you edit (ring nights only)

This is shown before editing a night the ring recorded.

- Title **"Before you edit"**.
- Gold card: ribbon "Arc smart ring connected", then bold **"Your edit changes sleep in Mind only"**, then "Your Rhythm score will use your times. Your ring keeps its own sleep data."
- Primary **"Edit Your Sleep"**. Text button **"Keep the ring’s times"**.
- "Add another sleep" skips this sheet.

### 7.6 Log last night as questions

Manual logging is conversational. The suggested times are the coach's plan.

- **Title:** **"Log last night’s sleep"**, or **"Edit last night’s sleep"** when a night exists.
- **The quiz card:**
  - a white card with a 24 px radius, a soft indigo glow and the Mind lotus watermark;
  - a round tile beside the question (a moon for bedtime, a sun for wake-up);
  - answer pills that wrap.
- **The questions:**
  1. **"Did you fall asleep around 10:30 PM?"** with **Yes** and **No**.
  2. **"Did you wake up around 6:00 AM?"** with **Yes** and **No**.
- **Editing** asks "at" in place of "around", and uses the logged times.
- **No** opens a time wheel inside the same card (hours, minutes in 5s, AM/PM) with **Done**.
  - PM bedtimes are last night; AM bedtimes are today. Wake-up is always today.
- **After an answer**, the card folds after 250 ms into a small answered card: the question, the answer in bold ("Yes, 10:30 PM" or "No, 11:15 PM") and **Edit**.
- **At the end:** "You slept for **7h 30m**." (with a break: ", with 40 min awake."), over a sticky **"Save Sleep"**. Save is disabled until both questions are answered and the checks pass.
- **Checks:**
  - "Waking up has to come after falling asleep."
  - "It is 3:00 PM now. Pick a wake-up time before that."
  - "That is over 16 hours. Check AM and PM."
  - Warning only, Save still allowed: "That is a short night. Save it if it is right." (under 3 h).
- **On save:**
  - The same times as the device keep the device night. Otherwise the night becomes *edited* (the device had one) or *typed*.
  - The toast **"Last night saved."** shows, the score updates, and the strip says "Added by you" with the save time rounded to 5 minutes.
- **Before a plan, and for free users:** there are no suggested times. The wheel is the question, open straight away: **"When did you sleep?"** then **"When did you wake up?"**, then "You slept for 7h 30m." and **Save Sleep**.
- **Keyboard:** arrows walk the pills, and Enter or Space answers. Focus moves to the next question, which scrolls into view.

### 7.7 Add another sleep

From the three dots.

- It opens the edit sheet with the night's two answers kept, then a card **"When did you sleep again?"** with a wheel, **Remove** and **Save**, then **"When did you wake up again?"**.
- It starts 1 h after the last wake-up, 30 minutes long.
- **Errors:**
  - "Waking up has to come after falling asleep."
  - "It is 3:00 PM now. Pick a time before that."
  - "This overlaps another sleep. Check the times."
- The rule then decides whether it joins the night (a split) or is a nap (section 2).

### 7.8 Which one is right?

- Title **"Which one is right?"**, then "Pick the night that matches how you slept."
- Two radio rows, each with an icon, "Arc smart ring" or "Apple Health", the hours and the times ("3h 40m", "10:50 PM to 2:30 AM").
- Primary **"Use This Night"**, disabled until one is picked. Text button **"Neither is right"** opens the questions sheet; for the ring's night, "Before you edit" comes first.
- After a pick: the toast "Last night now uses Apple Health.", and the strip switches to that source. This applies to last night only.

---

## 8. Android (Health Connect) for now

The smart flow is built for iPhone only. On Android (`os=android`, without `sx`) the card keeps the earlier Health Connect flow. The smart flow's Android version is not designed yet (section 25, question A). There, the ring writes to Health Connect and GoodFlip reads Health Connect.

- **Not connected, no night:** title "Add last night", line "Enter the times, or connect Health Connect to fill them in by itself.", a **Log sleep** button, and a strip **"Turn on Health Connect"** / "Your sleep fills in by itself".
- **The ask:**
  - Title "Let your phone fill in your sleep", the same line as on iPhone.
  - A picture of Health Connect's own screen: "Allow GoodFlip to access Health Connect?", listing Sleep, Steps, Exercise, Active calories burned and Heart rate.
  - Buttons **"Allow Health Connect"** and **"I will enter my sleep myself"**.
  - After Allow, the toast "Last night came in from Health Connect." shows.
- **Connected:** the strip shows the Health Connect icon, "From Health Connect" and "Updated 7:22 AM". Connected but no night yet: "We haven’t received last night’s sleep yet" / "Wait for it to sync, or log it yourself."
- **Short sync:** a gold ribbon "Health Connect shows 2h 05m. If you slept more, fix it." with **Fix** and X. The X toast is "Kept Health Connect’s times."
- **Edited:** "From Health Connect, edited by you". The old log sheet offers "Use Health Connect’s times (10:50 PM to 6:10 AM)" to go back.
- **More cases** for permission states (none, denied, revoked, not installed: "Get Health Connect", "Open Health Connect") are in the frozen `/v7/mind-sleep-sources.html`.

---

## 9. Your mind plan

The section is titled **"Your mind plan"**. It is hidden before a plan and for free users. Code: `mind/layouts.js` (`L.parts`).

### The cards

| Card | Window | Holds items at |
|---|---|---|
| Morning | 6 AM to 12 PM | 6:00 to 11:59 |
| Afternoon | 12 PM to 5 PM | 12:00 to 16:59 |
| Evening | 5 PM to 9 PM | 17:00 to 20:59 |
| Night | 9 PM to the plan's bedtime, e.g. "9 PM to 10:30 PM" | 21:00 to 5:59 |

- Each item goes into the part its coach time falls in, with the earliest first. Sleep is not a row.
- **A part with nothing in it is not drawn.**
- Each card has a quiet Mind scene behind its header, the name and window, and a **"Rhythm breakdown"** chip with an ⓘ. There is no "x of y done" on the card.

### The row

- A tick circle on the left, the title, a sub line, and the coach's time on the right.
- Rows that open a sheet (breathing, mood) have a chevron after the title. The whole row is one target, except the tick.
- A ticked row shows a green check, and its title greys.

| Kind | Title | Sub line | Tap the row | Tap the tick |
|---|---|---|---|---|
| Wind-down | The coach's task | none | Ticks it | Ticks it; if already ticked, the menu |
| Me-time | The coach's activity | **"Time for yourself"** | Ticks it | Ticks it; if already ticked, the menu |
| Breathing | The exercise › | "5 min" | Opens the player; if done, the menu | Not done: the start sheet. Done: the menu (section 12) |
| Mood | **"Mood check-in"** › | **"How are you feeling today?"**, or once logged **"Feeling good"** | Opens the check-in | Same as the row (section 11) |

### Ticking and unticking

- **One tap ticks a wind-down task or me-time in place.** The score steps up and the win moment plays (section 10). There is no burst on the tick; on Mind the moment is the reward.
- **Unticking:**
  - Tapping a ticked wind-down or me-time row opens a menu titled with the task, with one row **"Mark as not done"**. It unticks at once with no confirm, and the toast "Marked as not done" shows.
  - The score settles quietly, with no minus and no win moment.
  - No confirm dialogs anywhere on Mind.

### Rhythm breakdown (per part of the day)

The chip under a part's name opens this sheet (doc: `?rbd=0` to `3`).

- **Title:** the part's name. **Sub line:** "Suggested 6 AM to 12 PM · what you did, against this part of the day’s plan".
- **One row per kind in that part:** "<Kind> : **x of y**", with "Target: y" and Eat's bar. The kinds are "Last night's sleep" (Logged or Not yet), "Wind-down tasks", "Breathing", "Me-time" and "Mood check-in".
- **What counts:** "Your coach sets what to do in each part of the day.", then a line per kind present:
  - "Last night's sleep counts once it is logged or synced from your phone."
  - "Wind-down tasks are the evening steps your coach set to help you sleep. Tick each one when it is done."
  - "A breathing exercise counts once you have breathed for at least a minute."
  - "Me-time is time just for you. Doing the activity your coach suggested counts."
  - "A mood check-in counts as soon as you answer. How you feel never lowers your score."
- **"Got it"** sits at the foot.

---

## 10. The win moment

This is not a sheet. It is a short celebration over the screen, played on any gain. Code: `mind/variants/win.js`, Lotus bloom (`vwin=s`).

1. A full-screen GoodFlip green arrives as a lotus that opens from the tapped tick, starting halfway between the tick and the centre.
2. Then a pill with a white tick and what was done:
   - "Sleep logged"
   - "Wind-down done"
   - "Breathing done"
   - "Me-time done"
   - "Mood checked in"
   - several quick marks, or a log from the bar: "N items done"
3. A big **"+N%"** counts up, then one line: **"added to your Rhythm score"**.

Rules:
- **Timing:** about 0.4 s to arrive, 0.3 s to count, a 1.1 s hold and 0.3 s to leave. A tap anywhere closes it.
- It never opens over a sheet. It waits until the sheet closes, then plays.
- Marks in quick succession fold into one moment.
- It mutes other toasts for 900 ms.
- A light 18 ms haptic plays.
- With reduced motion, the green screen fades in and out with no movement.
- **An untick or a 0% gain plays nothing.**
- The score number never repeats on this screen; only the gain shows.

---

## 11. Mood check-in

Decided 2 Nov 2026 and refined 16 Nov. Code: `mind/variants/mood.js` (`vmood=a`).

### Slots

- **Rows:** one per coach check-in (1 or 2 a day), each answered on its own.
- **Opening times:** a check-in opens **3 hours before the coach's time** and stays open **until midnight**. If two windows overlap, the later one opens at the midpoint between the two times. On the example day the 8 AM check-in opens at 5:00 AM and the 9 PM one at 6:00 PM.
- **Late check-ins:** one made before midnight counts in full.
- **Past days are closed.**
- **Slot names**, by time: before 12 PM "Morning", 12 to 5 PM "Afternoon", from 5 PM "Evening".

### The check-in sheet

- Title **"How are you feeling?"**.
- Five faces, each with its word: **Awful, Low, Okay, Good, Great**. The emoji are placeholders for GoodFlip's own face set; never red for sad.
- **Picking a face does not log it yet.** The unpicked faces fade to 50%. An indigo quote card shimmers for about 900 ms, then the reply shows, with **"Done"** under it.
- **"Done" stacks the check-in in the bar** (section 13, "Logging together"), with the face picked. It is logged, and the win moment plays, when the bar's Log is tapped. Closing the sheet without Done keeps nothing.
- While it waits in the bar, its tick takes it back out; tapping its title reopens the sheet on the face picked.
- **Picking another face on a logged check-in** ("Change your mood") replaces the answer at once, with a new reply. The **first logged time is kept**, and there is no new gain.
- **Offline:** "Could not log your mood. Check your internet and try again." with **"Try Again"**.

### The replies (fixed, one per face)

| Face | Reply |
|---|---|
| Awful | Thank you for checking in. Hard days don't last, and being gentle with yourself today is enough. When you're ready, a few minutes of slow breathing can help your body settle, and your mind often follows. |
| Low | Thank you for being honest. Low days come to everyone, and they do pass. Go easy on yourself. Something small you enjoy, a song, a short walk or a call with someone you love, can lift a low day sooner than waiting it out. |
| Okay | Some days it's fine to be just okay. Thanks for checking in. Try to keep your day happy by doing activities you like. |
| Good | Good to hear. Notice what made today good, it's worth doing again tomorrow. |
| Great | That's wonderful. Enjoy it, and hold on to what went right today. |

On a low day (Awful, Low) the reply adds one general suggestion in words only. There is no card to act on, no follow-up question, no feeling words, no tags and no reason step. A coach call or helpline is not the main path.

### The row and its menu

- **Not logged:** "How are you feeling today?". **Logged:** **"Feeling good"**, with no time and no emoji.
- **Tapping a logged check-in** opens a menu titled **"Morning check-in"** (or Afternoon or Evening), with these rows:
  - **"Change your mood"** opens the sheet with the face picked.
  - **"Remove this check-in"** (red) removes it at once. The toast "Mood check-in removed" shows, and the row goes back.
- **Any time today:** a check-in can be logged at any hour, whatever time the coach set (24 Nov 2026). There is no "Check in from" lock.
- **A past day:** title **"This check-in has closed"**, then "Check-ins close at midnight, so this one can no longer be added. Your next check-in counts the same." and **"Okay"**.

### Score

Mood is worth 10. Each check-in earns its share (5 each with two). The face never matters; removing a check-in loses its share. The coach sees each face (section 21). The patient is not told this today (section 25, question H).

---

## 12. Breathing

### The seven exercises (signed off 15 Nov 2026)

| App name | Pattern | Phases | Coach start min | Usual time | Why it helps |
|---|---|---|---|---|---|
| Simple Breathing | In 5, out 5 | in 5 "Through your nose", out 5 "Slow and even" | 5 (5 to 10) | 7:00 AM | Breathing six times a minute is the pace where your heart rhythm settles most easily. |
| 4-7-8 Breathing | In 4, hold 7, out 8 | in 4, hold 7, out 8 "Slowly, through your mouth" | 1 (1 to 2) | 9:30 PM | A long breath out tells your body it is safe to slow down. Lie back and let sleep come. |
| Box Breathing (4-4-4-4) | In 4, hold 4, out 4, hold 4 | in, hold, out, hold | 5 | 6:30 AM | Holding between breaths steadies your attention. Good before a meeting or a hard conversation. |
| Extended Exhale (2:1) | In 4, out 8 | in 4, out 8 "Twice as long" | 2 (2 to 5) | 12:00 PM | A breath out twice as long as the breath in tells your body it is safe to slow down. |
| Belly Breathing | In 4, out 6 | in 4 "Let your belly rise", out 6 "Let it fall" | 5 | 7:00 AM | Breathing from the belly uses your diaphragm, the calmest way to breathe. |
| Humming Bee Breath | In 4, hum 7 | in 4, hum 7 "A soft, low hum" | 5 (5 to 10) | 8:30 PM | The gentle hum on the breath out quietens a busy mind before bed. |
| Pursed Lip Breathing | In 2, out 4 | in 2, out 4 "Through pursed lips" | 2 (2 to 5) | 12:00 PM | A slow breath out through pursed lips eases breathlessness and slows your breathing down. |

- **Names.** The patient sees "Humming Bee Breath"; the coach sees "Humming Bee Breath (Bhramari)". Library cards drop the bracket ("Box Breathing", "Extended Exhale").
- **No pause between phases.** A 2 s rest after the out breath was tried on 18 Nov and removed on 19 Nov because it breaks the rhythm. `?vrest=1` previews it.
- **Visuals** (`breath-lab/FINAL.md`):
  - A gold breath ring cut per phase (dotted for holds, square for Box), with a bead walking it and a gold flower that opens and folds.
  - Belly, Humming Bee and Pursed Lip each have their own figure, in Mind indigo with a soft glow.
  - Never draw air, wisps or mist at the nose or mouth.

### The plan row

The row shows the exercise and a chevron, with "5 min" under it and the time on the right. It is either unticked or ticked; saved minutes stay in the background.

- **Tap the tick, not done:** no sheet. It **stacks in the bar** at once (section 13, "Logging together"). Tapping the tick again takes it back out.
- **Tap the row, not done:** the player opens on Ready.
- **Done, tap the tick or the row:** a menu titled with the exercise, with **"Breathe again"** and **"Mark as not done"**. "Mark as not done" unticks at once, clears the minutes and shows the toast "Marked as not done".

### The player (full screen)

| Step | What shows |
|---|---|
| Ready | X top left. The name with ⓘ in the centre. A time pill "5:00" with a chevron at the top right, to change the length before Start. Under the picture: the pattern "In 5, out 5" and "5 min session" (or "No time limit"). At the bottom: a sound button and **"Start"**. |
| Countdown | 3, 2, 1 with **"Get comfortable"**. |
| Breathing | The picture moves with the breath. The phase word ("Breathe in", "Hold", "Breathe out", "Hum") with that phase's seconds left; the final one reads **"Last breath out"**. The time pill counts down and is locked. Controls: sound, **Pause**. |
| Paused | "Paused". Controls: sound, **End**, **Resume**. |
| Done | **"5 calm minutes"** ("1 calm minute" when singular), the exercise's closing line, then **"Do It Again"** and **"Back to Mind"**. Back to Mind shows the toast "Simple Breathing done. 5 calm minutes." |

- **The 1 minute rule:** at 1:00 breathed, the plan row ticks in the background, the Rhythm moves, and the session carries on. That exercise then earns its full share, whatever length the coach set.
- **Time up:** the session ends after a breath out.
- **Credit:** the whole minutes breathed are saved, with no cap at the coach's minutes.
- **No time limit:** the pill reads "No limit", the timer counts **up** from 0:00, and nothing ends on its own.
- **Closing:** closing while breathing pauses the session, and the session is kept for the row. X on Ready or Done just closes.
- **Sound and haptics:** sound is off until the person turns it on. The sound is singing bowl cues and calm music at half level. **Humming Bee Breath has the bell only**: no music and no drone under the hum (23 Nov 2026). Haptics play on phase changes.
- **Reduced motion:** still end states that change only on a phase change.

**Player sheets:**

| Sheet | When | Copy |
|---|---|---|
| Session length | The time pill, before Start | **"Session length"** / "Your coach recommends 5 min. A shorter session still counts its minutes towards it." Options 1, 2, 3, 5, 10 min (plus the coach's minutes if missing) and **No time limit**. The coach's row is tagged "Recommended by your coach". Button **"Use 5 min"**. Toast "Session set to 5 min." |
| Stop, 1 minute or more | X, End or Escape mid-session | **"2 min saved"** / "Your 2 minutes count and Box Breathing (4-4-4-4) is ticked in your plan." **"Save and exit"**, **"Keep breathing"** |
| Stop, under 1 minute | Same | **"Stop breathing?"** / "Breathe for at least 1 minute for it to count." **"Leave"**, **"Keep breathing"** |
| How it works | ⓘ on the title (pauses) | The name, the pattern, the how line, the wave with "Up as you breathe in, flat while you hold, down as you breathe out.", **How it works** (steps), **Why it helps**, **"Got it"** |

### The library

| Who | What they see |
|---|---|
| Before a plan, free user | After the sleep card: **"Breathing exercises"** / "Do these any time you need a calm moment." Seven full cards, each with scene art, the name, "In 5, out 5 · 5 min", **Start** and **Know more**. |
| Plan user | After the plan, one slim row: **"More breathing exercises"** / "Additional exercises to try" with three small scenes. It opens **"All breathing exercises"** on its own screen: "Extra ones to try any time. Only your plan’s breathing counts towards your Rhythm." The plan's exercise carries a gold "In your plan" tag. |

- **Know more** (or a tap on the card) opens a sheet with:
  - the full name, the pattern, the timing and the wave;
  - **How long** chips: 1, 2, 3, the suggested minutes, 5, 10 min and No time limit;
  - **How it works** and **Why it helps** ("…Good for focus and stress.");
  - a pinned button **"Start, 4 min"**.
- **The library player:**
  - Full height, with 3-2-1 "Get comfortable".
  - It ends on "Well done", or counts up with no time limit.
  - X mid-session asks **"End this session?"** / "You have breathed for 1 min 20 sec. You can keep going or end it here." with **"End session"** and **"Keep breathing"**.
- **Library sessions are not saved and never count for Rhythm.** The one exception is the plan's own exercise: started from the library, it opens the plan player and counts.

---

## 13. Wind-down and me-time

### Wind-down

- **What it is:** the coach's evening steps that help the person fall asleep, each with a time. A plan has 1 to 6 tasks.
- **Suggestions** (the coach can also type their own):

  | Task | Usual time |
  |---|---|
  | Last caffeine (tea, coffee or cola) | 4 PM |
  | Last alcohol or nicotine | 4 PM |
  | Evening walk or light movement (20 to 30 min) | 6:30 PM |
  | Last heavy meal, dinner cut-off | 7:30 PM |
  | Journalling or thought dump (5 to 10 min) | 9 PM |
  | Last water or fluids | 9 PM |
  | Screen-free wind-down begins (60 min) | 9:30 PM |
  | Gratitude practice, 3 things (3 to 5 min) | 9:30 PM |
  | Reading a physical book (20 to 30 min) | 9:30 PM |
  | Listen to calming music (15 to 30 min) | 9:45 PM |
  | Positive sleep association: prepare the room, dark and at a comfortable temperature | 10 PM |

- **The row:** the task and its time, with no sub line. One tap stacks it in the bar (see "Logging together" below).
- **Score:** wind-down sits in the Sleep quality group. It is worth 20, split equally across the tasks.
- **When all tasks are done**, the win moment's line reads "your wind-down is complete".

### Me-time

- **What it is:** one activity a day that the coach types or picks from 16 suggestions (behavioural activation). For example: "Walk in nature or a park (20 to 30 min)", "Social connection: call a friend or family (15 to 30 min)", "Screen-free quiet time, just sitting (10 min)".
- **The row:** the activity, with **"Time for yourself"** under it and the time on the right. One tap stacks it in the bar.
- **Score:** worth 10. **Doing it earns all 10.**
- Me-time is never KAIRA's nudge.

### Logging together (the bar)

As on Move and Eat, ticks stack in a floating bar at the bottom and are logged together. Code: `mind/tray.js` (24 Nov 2026).

- **What stacks:** wind-down tasks, me-time and breathing (from the tick), and the mood check-in once its sheet's **"Done"** is tapped (section 11). **Last night's sleep does not stack**: it keeps its own sheet.
- **Ticking:** the row's tick turns to the green outline tick and the item flies into the bar. Tapping it again takes it out.
- **The bar:** the names (newest first), **"Review"** under them, and **"Log N items"**. The X slides it aside to show **"Remove"**, which empties the bar.
- **Review sheet, "Items to log":** each item with its kind and the coach's time ("Wind-down · 4:00 PM", "Me-time · 7:00 AM", "Breathing · 5 min", "Mood · Good") and a bin. **No time to set and no future-time check**: each is a yes or no for the day. One button, **"Log N items"**.
- **Log:** everything is marked done at once and one win moment plays: **"N items done"** and the total gain (one item keeps its own pill, e.g. "Wind-down done").
- **A logged item**, tapped, opens its menu as before ("Mark as not done").

### Coach's practices (not scored)

Worry Tree, Gratitude Journal, Habit Tracker and the rest live in the **Practices** tab (section 19). They never appear in the plan cards or the score.

---

## 14. Before a plan, and a free user

### Before a plan (a member waiting for the first Mind Coach consultation)

- **Score:** a padlock in place of the number, with the line "Your Rhythm score unlocks after your first Mind Coach consultation, once your coach assigns you a plan."
- **Hidden:** What shaped your score?, the plan, and the check-ins.
- **Last night:** the card stays. The empty card says "Your coach uses it to shape your sleep plan." There is no window band on the bar and no suggested times in the questions.
- **Breathing:** the seven library cards. None count.
- **Practices tab:** kept.
- **Date sheet:** dots, with the key "A dot is a night with sleep logged. Your Rhythm rings start once your coach sets your plan."
- **Rhythm sheet:** a padlock and **"Show us how you sleep."**, with these lines:
  - "Log last night’s sleep and how your day felt, we do not judge, promise."
  - "Your coach will look at this before building your mind plan."
  - "Your Rhythm score unlocks after your first Mind Coach consultation, once your coach assigns you a plan."
- **A deactivated plan:** the patient sees this state (Move's rule; confirm in section 25).

### A free user (not on a care program)

- **No score at all, not even locked:** no score, no line, no tiles, no plan and no check-ins.
- **Last night:** **"Your last night"**, 24 px under the date. Logging asks "When did you sleep?" with no suggested times, and the card never mentions a coach.
- **Breathing:** the seven library cards. Nothing saves or counts.
- **No Practices tab.** The bottom nav is Back, Mind, Trend and Learn.
- **Date sheet:** dots, with the key "A dot is a night with sleep logged. Pick a day to see it."

---

## 15. Past days

- **How to get there:** the date pill arrows or the date sheet. The label changes to "Thu, 10 Sep".
- **Score:** the score the day ended on. There is no gain line and no win moment.
- **Line:** "This day ended at X% Rhythm." (to build; see section 24).
- **The plan:** that day's own plan and ticks.
- **Mood check-ins are closed** ("This check-in has closed").
- **Ticks on a past day:** the prototype does not block wind-down, me-time or breathing ticks there. See section 25, question F.
- **Sleep:** the night shows as it was. Editing a past night is not designed.

---

## 16. Bottom sheets

### Rules for every sheet

- A circle X at the top right, the title at the top left, no drag handle, at most 90% of the screen.
- Every line of text in a sheet reads at 15 px or more.
- The primary button is pinned to the foot when the content scrolls.
- No confirm dialogs: undo is a menu row ("Mark as not done", "Remove this check-in") with a toast.
- Escape closes like X.

### Index

| Sheet | Opened by | Section |
|---|---|---|
| Rhythm | The score | 18 |
| KAIRA analysis | Learn more, or the line card | 4 |
| Sleep quality / Self-care | A tile | 5 |
| Rhythm breakdown | The chip on a part of the day card | 9 |
| Let your phone fill in your sleep | First visit; Connect on Apple Health | 7.1 |
| Track your sleep automatically | The strip, Manage, Connect, the three dots | 7.2 |
| Ready to connect your Arc? | Connect on the ring | 7.3 |
| Last night (three dots) | The three dots on the card | 7.4 |
| Before you edit | Editing a ring night | 7.5 |
| Log / Edit last night’s sleep | Log Last Night’s Sleep, No on the short night, Edit your sleep, Add another sleep | 7.6, 7.7 |
| Which one is right? | Verify on the gold card | 7.8 |
| How are you feeling? | A mood row | 11 |
| Check-in menu, This check-in has closed | A logged or past check-in | 11 |
| Breathing start, done menu | The breathing tick or row | 12 |
| Session length, stop, how it works | Inside the player | 12 |
| Library: Know more, End this session? | The library | 12 |
| Wind-down / me-time menu ("Mark as not done") | A ticked row | 9 |
| Select date | The date pill | 17 |
| Medal celebration | Crossing 80%, or the medal | 17 |

---

## 17. The medal, the date sheet, FlipCoins, the first look

### The medal

- A day at **80% or more** earns **Lotus at dawn**: the soft lotus with a small gold sun rising behind it (`/v7/icons/badge/mind/lotus-glow.svg`).
- When the day crosses 80%:
  - the line says "You’ve earned today’s medal!";
  - the celebration sheet opens, with no FlipCoins in it;
  - the medal then hangs from under the header on the right, on a ribbon, swinging in once.
- Tapping the medal opens the celebration again ("Rhythm medal earned today. See it again").
- The medal comes off if the day falls below 80.
- **The ribbon** is still Eat's, until one is chosen.

### The date sheet

- Title **"Select date"**. A month header with arrows (previous is disabled before the join month, next after this month), then M T W T F S S.
- **Plan users:**
  - Each day has a gold ring that fills to its Rhythm, with a small medal at 80% or more. A dashed ring marks a day with nothing logged.
  - Key: **"The ring is your Rhythm out of 100. A medal is a day at 80% or more. A dashed ring is a day with nothing logged."**
- **Before a plan and free users:** a dot for a night with sleep logged, and a hollow dot for today with nothing yet. The keys are in section 14.
- **Screen reader labels:** "10 September, Rhythm 83 out of 100, medal earned", "nothing logged", "not yet", "before you joined", "sleep logged".
- **Loading:** a shimmer. **Error:** "We could not load this month. Check your connection and try again." with **Retry**.

### FlipCoins

On since 23 Nov 2026, **earned by breathing**. One switch turns all of it off (`MD_COINS`; prototype `?coins=0`).

- **The Earn chip** sits top right in the header, for every user.
- **One FlipCoin a day**, for a breathing exercise from the plan done that day (1 minute breathed, or ticked). A second one that day earns no more.
- **The coin toast** "You have earned FlipCoins" lands the moment the day's first breathing exercise counts, with the win moment.
- **The Earn sheet** (`?sheet=earn`), the app's streak sheet in Mind's words:
  - hero **"Do a breathing exercise daily to earn FlipCoins"** with the gold Mind mark;
  - "Your current streak", then "Only breathing exercises done on the day count towards your streak. A minute or more counts.";
  - "Keep the streak going to earn more": **Breathe every day** for one week (+20) and for one month (+50);
  - "Earned so far from this streak";
  - **"Start breathing"** opens the next breathing exercise in the plan; with no plan it goes to the breathing exercises.
- Library sessions (before a plan, free users) are not saved, so they do not earn coins yet (section 25, question T).

### The first look

This is a one-time sheet the first time Mind opens after Rhythm launches. Prototype: `/v7/mind-ftux.html` (`ftux/mind-swipe.html`). Title **"Something new for you 🎉"**, a swipe carousel with dots and Back, and the action on the last step.

| Who | Steps | Last button |
|---|---|---|
| Plan user | 1. "Introducing" **Rhythm**: "From today, your sleep and your calm moments add up to a score out of 100. It shows how steady your night and day were, and starts fresh every morning." 2. "How it works" **Your coach plans your rhythm**: "Log last night’s sleep, close to your coach’s hours and bedtime. Then tick off your wind-down, breathing, a little me-time and a mood check-in." 3. "Your reward" **Earn the Rhythm medal**: "Reach 80% in a day to earn it. A steady routine counts for more than a long lie-in." | **Start my day** |
| Waiting for a plan | 1. **Rhythm**: "A score out of 100 for how steady your night and day were. It unlocks after your first Mind Coach consultation, once your coach sets your plan." 2. "While you wait" **Start with sleep and breathing**: "Log last night’s sleep and try any of the seven breathing exercises. Your coach will look at your sleep before building your plan." | **Log last night’s sleep** |
| Free user | 1. "Welcome to Mind" **Your sleep, filled in for you**: "Connect Apple Health and last night’s sleep fills in by itself. You can add it yourself too." (Health Connect on Android) 2. "Any time you need it" **Seven breathing exercises**: "Simple Breathing, Box Breathing, 4-7-8 and more. Each takes a few minutes, whenever you need a calm moment." | **Try a breathing exercise** |

People who already logged sleep, breathing and mood before Rhythm get a different first step: "The sleep, breathing and mood check-ins you already log now add up to a score out of 100. …" Whether this shows once per user is section 25, question G.

---

## 18. The Rhythm sheet

Opened by tapping the score. Title **"Rhythm"**. It shows the score bubble "N% Rhythm", then the two chips "Sleep quality N% of 100%" and "Self-care N% of 100%". On a past day the day is the caption, or "Nothing was logged on <day>".

| Section | Copy |
|---|---|
| What is Rhythm? | Rhythm shows how steady your night and your day were. It reads last night’s sleep, your wind-down, your breathing, time for yourself and how you felt, and rewards a steady routine over a long lie-in. |
| How your score works | Your score starts fresh each morning. It comes from two parts, and grows as you do each thing below. **Sleep quality**, "Most of your score.": **Log last night’s sleep.** Close to the hours your coach set. / **Keep to your sleep window.** Bed and wake-up close to the planned times, early or late alike. / **Tick off your wind-down.** The small evening steps your coach set, each at its time. **Self-care**, "The rest of your score.": **Breathe.** A few calm minutes with your breathing exercise. / **Make time for yourself.** Any one me-time task your coach suggested. / **Check in.** How your day felt. Any answer counts. |
| Why a steady rhythm matters | Going to bed and waking at the same times every day does more for your body than catching up on sleep. A calm evening helps the night that follows. |
| How does a steady rhythm help? | Sleep and stress feed each other, so looking after both settles your whole day. Your blood sugar stays steadier the next day. / You feel less tired and less hungry. / Stress comes down, and so does stress eating. / Healthy habits become easier to keep. |
| Where does your plan come from? | Your Mind Coach sets your sleep hours, sleep window, wind-down, breathing and me-time after your consultation. Then the coach card: initials, "Your Mind coach", the coach's name, **Message**. |
| Fine print | **Disclaimer:** Rhythm counts what you log. It does not measure sleep stages or diagnose sleep problems. |

The waiting-for-a-plan version is in section 14.

---

## 19. The Learn, Trend and Practices tabs

### Learn (`/v7/mind/learn.html`)

- A copy of Eat's Learn, with Mind's articles.
  - Hero band: "Learn how a calmer mind works".
  - Tabs: **Sleep & Calm** and **Stress & Mood**.
  - Bookmarks work.
- **The ten articles:**
  1. "Put Your Phone Away 30 Minutes Before Bed: The Science of a Calmer Night" (the only one that opens)
  2. "Why the Same Bedtime Every Night Matters More Than Sleeping In"
  3. "Four Slow Breaths: A Two-Minute Reset for a Busy Day"
  4. "The Thought Dump: Writing Worries Down So They Stop Spinning"
  5. "Three Good Things: How a Small Gratitude Habit Lifts Your Mood"
  6. "Morning Light: Ten Minutes Outside That Set Your Body Clock"
  7. "Your Last Chai of the Day: When Caffeine Starts Costing You Sleep"
  8. "Stress and Blood Sugar: Why a Tense Day Shows Up in Your Readings"
  9. "A Walk in the Park: Why Green Spaces Calm a Busy Mind"
  10. "Swap the Scroll for a Book: An Easy Wind-Down That Works"
- **Empty:** "Nothing saved here yet" / "Anything you save while reading shows up on this tab." / **Browse all topics**.
- **Error:** "That did not load" / "Check your connection and try once more. Nothing you saved has been lost." / **Try again**, **Go back**.

### Trend (`/v7/mind/trend.html`): coming soon

- Four fanned glimpse cards: "Your sleep", "How you did", "Where you stand", "When you slept".
- A gold "Coming soon" pill, then **"Trends are on the way"**.
- "Soon you'll see how your Rhythm moves, week after week: your sleep, your wind-down and the calm in your day."
- "Keep logging your sleep and your day, and your trends will be ready soon."

### Practices

The tab loads the reflection app's templates (the coach's practices: Worry Tree, Gratitude Journal, Habit Tracker and the rest). Practices are not scored. Free users have no Practices tab.

---

## 20. Coach portal: the Mind plan

The full spec, with every field, default, limit, check and the change log, is in `v7/coach-mind/mind-plan-defaults.md`. Prototype: `/v7/coach-mind-plan.html`. In short:

- **Where:** Success Coach (psychologist) in the patient menu → **Mind Plan** (tag "New") and **Rhythm**.
- **The list:**
  - Filter pills: All, Active, Drafts, Inactive.
  - Rows show name, status, dates and a summary, with **View** (and **Edit** on drafts).
  - Empty state: "No Mind plan yet", **Create Mind Plan**, **Browse templates**.
- **Create:**
  - **Start a blank plan** first, then **Or start from a template**: Template, Created by, Sleep window; 5 per page.
  - A template fills the plan; the plan keeps its own name, "<Patient>'s Mind plan".
- **Four steps** (each with Back, **Save as Draft** and Next):
  1. **Sleep, 70 points.**
     - Plan name. Starts today; ends after 15 days (chips: 1 week, 15 days, 3 weeks, 1 month, 3 months).
     - Target sleep 7.5 h (4 to 12 h, steps of 0.5 h) and bedtime 10:30 PM (any quarter hour, day windows for night shifts), with wake-up = bedtime + target, on a draggable night bar.
     - Wind-down: 1 to 6 tasks, 100 characters each, each with a time.
     - Tip "How the 50 points work" explains duration and consistency; wind-down "Each task done earns 20 ÷ n".
  2. **Self-care, 30 points.**
     - Breathing: 1 to 3 exercises from the seven, 1 to 30 min, each with a time; the same exercise twice is allowed.
     - Me-time: exactly one activity, 80 characters.
     - Mood: 1 or 2 check-ins (default one, Evening 9:00 PM; Add brings Morning 7:00 AM), named by time.
     - "The face they pick never changes the score."
  3. **Coach's practices, not scored.**
     - The library has 21 practices in 8 themes, each with Times to fill (1 to 14). The Habit Tracker takes up to 8 habits of 60 characters.
     - Note for the patient: up to 500 characters.
  4. **Review and assign.**
     - One column: problems with **Fix It**, the plan card, and the Rhythm card in pts with "How it is scored" disclosures.
     - **Assign** asks how: Patient A only (default), update the master template, or save as a new template and assign.
     - Assigning makes the current Active plan Inactive. The done screen: "Assigned to Patient A".
- **Templates:** Manage Templates with **New Template**, Edit and Duplicate. Template name up to 60 characters, About up to 140. No delete.
- **Leaving with changes:** "Leave without saving?" with Discard Changes, Save as Draft and Keep Editing. Every removal toasts with Undo.
- **The plan PDF** (`coach-mind/plan-pdf.html`): the scored plan on A4, with practices and the note left out. It shows the sleep goal, then "Your day" from waking to bedtime, then "Your Rhythm score is waiting". It is not linked from the portal yet (section 25, question K).

---

## 21. Coach portal: the patient's Rhythm

Prototype: `/v7/coach-mind-rhythm.html?p=sahana` (also `arjun` for night shift and `meera`). It is scored with the app's own `sleep-rule.js` and the same weights and group re-share.

- **Clinical Snapshot:** age and sex, indication, the Mind plan (Active), plan started ("3 Nov 2026, day 15"), sleep data and mood check-in times.
- **Rhythm card:** "How well they slept and cared for themselves against the Mind plan, out of 100." with **Daily / Weekly / Monthly** tabs.
- **Date picker:** each plan first, then Last 7 days, Last 14 days and All plans, then From and To.
- **KPIs** (neutral grey):
  - **Average score:** the average of days with anything logged, today left out. Bands: Great 80+, Solid 70 to 79, Room to grow 50 to 69, Needs attention below 50.
  - **Nights logged:** "N of M". A night with no data is shown apart, not as a bad night.
  - **Medal days.**
- **One chart:**
  - Sleep is drawn against the coach's shaded window: bars for the main sleep, a thin line for time awake, lighter bars for naps, nights under 3 h faded, and dashed bars where nothing was logged.
  - Self-care rows are shown only for parts in the plan.
  - Mood shows the day's lowest face, tinted red for Low or Awful.
  - Weekly and monthly views show the average bedtime and wake-up with ranges.
- **Tooltip and day panel** ("Behind the score", in pts):
  - Sleep quality n / 70, with each part explained.
  - Self-care n / 30, with minutes breathed against the plan.
  - Each check-in's time and face, or "missed" / "not yet".
- **The coach sees each mood face** and the minutes breathed. The coach does not see where the sleep came from (decided 17 Nov 2026).
- **Removed on 17 Nov:**
  - "What stands out" cards;
  - coach notes;
  - the period "Behind the score" panel;
  - plan chips (now in the date picker);
  - weekend shading;
  - sleep source marks.

---

## 22. What the backend needs

| Need | Notes |
|---|---|
| Mind plans per patient | Name, status (Draft, Active, Inactive), start, end, template it came from, created by, saved at. A plan shows in the app from its start date. Past plans keep their own targets. |
| Plan contents | `hours`, `bedtime`, `wake`; wind-down `[{label, at}]` 1 to 6; breathing `[{name, key, mins, at}]` 1 to 3; me-time `[{label, at}]` 1; mood `checks[{at}]` 1 to 2. The fixed sleep settings are the same for everyone (section 2). |
| Coach's practices and note | `[{id, times, habits}]`, a note up to 500 characters. Not scored. |
| Templates | Name, about, created by, the plan shape. Who may update a master template: section 25. |
| Lists | 11 wind-down suggestions, 16 me-time suggestions, the 7 breathing exercises (name, key, pattern, start minutes, usual time), old-name aliases (unknown names open as Simple Breathing), 21 practices in 8 themes. |
| Sleep sessions | Every session the platform returns, with start, end and source (ring, Apple Health, Health Connect, typed, edited). Do the tidy, join and night steps of section 2 **on the server**, so the app, the score and the coach view agree. Hand-logged sleep follows the same rule. |
| Per night | Source, sessions, last read or sync time, the device's original times beside any edit, the short-night card answered (Yes, No or dismissed), the ring-versus-Apple Health pick. |
| Device state per user | Arc ring paired, last sync, missed night. Apple Health asked (once, then never again), allowed. Health Connect permission (none, denied, revoked, not installed). |
| Mood logs | Per check-in per day: face 0 to 4, first logged at, changed at. Edit and remove. Late counts in full; past days are closed. |
| Breathing | Per planned exercise per day: the tick at 1 minute, whole minutes saved, ticked done, "Mark as not done" (clears the minutes). Library sessions are not saved. |
| Wind-down and me-time ticks | Per task per day: done, time; untick. |
| Rhythm per day | Score 0 to 100 and its six parts, with each part's fraction and points, and sleep detail (bedtime, wake-up, asleep, naps). Used for the date sheet, a past day, the coach chart and the KPIs. |
| Medal days | A day at 80 or more. |
| The AI note | Facts in, a checked note out (section 4). |
| First look seen | Per user (section 25). |
| User state | Free, waiting for a plan, plan; a deactivated plan; a paused program. |
| Day boundaries | Sleep: the person's local 6 PM to 6 PM. Mood windows and the score day: the person's local midnight. |

---

## 23. Lists

- **Wind-down suggestions:** section 13.
- **Me-time suggestions:** `coach-mind/data.js` (`MP.METIME`) and `mind-plan-defaults.md`.
- **Breathing:** section 12.
- **Practices:** `coach-mind/data.js` (`MP.PRACTICES`, `MP.THEMES`).
- **Templates:**
  - "Rhythm starter" by Dr. Meera Iyer.
  - "Sleep reset, 4 weeks" by Rohan Kapoor: 8 h, 10 PM to 6 AM.
  - "Calmer days" by Coach A: 11 PM to 6:30 AM, two breathing exercises, two check-ins.
  - "Steady motivation" by Ananya Desai.
  - Templates leave me-time empty, so the coach types it for each person.

---

## 24. Where the prototype differs from this spec

| Prototype | Spec |
|---|---|
| A fixed clock, 3:00 PM, and a fixed calendar (today is Tue 15 Sep 2026) | Real time |
| The smart sleep card needs `?sx=1`; the bare URL still shows the card from before 19 Nov ("From Apple Health · Updated 7:22 AM", Edit) | The smart card is the card. Make `sx=1` the default |
| Strip times are fixed ("Last synced 7:22 AM", "No sleep data found · 7:44 AM"); the Track sheet's Apple Health row says 7:18 AM | Real read and sync times, the same everywhere |
| The Apple Health ask is not remembered; every first-visit load asks again | Asked once per user, kept on the server |
| Connect from a first visit always ends in "No sleep data found" | The real read |
| A short device night that arrives through the loader loses its gold card (works when it is there at load) | The gold card shows whenever a device night is under 3 h |
| A night that adds 0% leaves "Log last night’s sleep to start today’s Rhythm." | Once a night is in: "Keep going through your day to grow your Rhythm." |
| After an edit there is no way back to the device's times | Open, section 25, question E |
| `?sheet=sleepsrc` and `sleepperm` still open the old "Sleep data source" chooser; "How last night counts" is still in code | Not built |
| `/v7/ring-ready.js` is written once for every variant flag (about 6 times) because its `document.write` sits outside the `sx` check (`mind/index.html:3898`) | Loaded once |
| `?sheet=sleep` opens the sleep sheet twice (`plan.js:601`, `604`) | Once |
| KAIRA's "adds" and `score_after` spread a missing part's points across all parts (`rhythm-say.js` `W()`), while the score re-shares inside each group | KAIRA's numbers come from the same rule as the score |
| KAIRA's sleep facts use raw bedtime to wake-up and skip `sleep-rule.js` (naps, merged sessions) | The judged night |
| Two quick gains: the line names only the last one, while the win moment merges them | The line names the combined gain |
| A past day shows today's live score, line, tiles and plan; only the label, the Rhythm sheet bubble and the mood rows follow the date | That day's score, plan and ticks; the line "This day ended at X% Rhythm." |
| The Morning Rhythm breakdown can show "Last night's sleep : Not yet" while the night is in | Logged once the night is in |
| The coach's name is "Coach A" in the plan but "Sahana Chandra" in the Rhythm sheet | The real coach |
| Move's `?off=` rest-day switch is still wired into the Rhythm sheet | Not a Mind feature |
| Mind began as a copy of Move, itself a copy of Eat; Eat's state table, meal diary and keyboard sit hidden in `mind/index.html` | Build Mind fresh from this spec |
| Dead code in `plan.js`: the old mood sheet with tags, Tele-MANAS and "Ask Sahana to call", the house breathing player, "Something for you", the KAIRA card | Not built |
| Several `mind-rhythm.html` captions describe the old t-motivation plan ("Morning, Evening and Night", "The evening walk", "Everything done: 100%") | Captions follow the sample plan |
| `mind-sleep-smart.html` captions say "How did you sleep?", "Manually added by you" and "Track sleep from" | The screen says "Tell us how you slept", "Added by you" and "Track your sleep automatically" |
| The case doc's table of mood replies is worded differently from the app | The app's replies (section 11) |
| The plan PDF prints "rest 2 s" on six exercises, and its "full" sample has 11 wind-down tasks | No rest; at most 6 tasks |
| The coach view's "Sleep data" is fixed at "Apple Health" | The patient's real source |
| The coach chart fills breathing by minutes, so a 1 minute session scores the full share but shows "1 of 5 min" | Show done when it counted |
| `mind-plan-defaults.md` still has "How the 47 points work" and 23/24 examples; `BRIEF.md` still says 27 practices and breathing max 2 | 25/25/20 + 10/10/10, 21 practices, 3 exercises |

---

## 25. Decisions and open questions

Decided so far (dates in `mind-plan-defaults.md`):

| Date | Decision |
|---|---|
| 2 Nov | Mood is one question with five faces. A low mood gets one gentle suggestion in words. |
| 5 Nov | Plan defaults: 7.5 h, 10:30 PM to 6:00 AM, 15 days, one Evening check-in. 21 practices. 16 me-time suggestions. |
| 15 Nov | The seven breathing exercises. |
| 16 Nov | How a night is judged (section 2). Naps count towards hours only. One window, which can sit in the day. Mood windows, past days closed. Breathing counts at 1 minute. FlipCoins off. Practices hidden for free users. (FlipCoins back on 23 Nov, earned by breathing.) The medal is Lotus at dawn. |
| 17 Nov | Weights 25/25/20 + 10/10/10, with re-share inside the group. The patient sees Sleep quality and Self-care, each out of 100. The lotus win moment. "More breathing exercises" for plan users. The coach Rhythm view. |
| 18 Nov | KAIRA prompt rewritten to Momentum's standard. |
| 19 Nov | The rest after breathing out removed. The smart sleep card: no source chooser; the ring, then Apple Health, then typed; Apple Health asked once; logging as questions. |
| 20 Nov | Card picture Zz; strip "Last synced" + Manage; Track sheet copy set 5; questions variant M; Add another sleep in the three dots; gold cards tuck away. |

Still open:

| # | Question | Notes |
|---|---|---|
| A | The smart sleep flow on Android | Today Android keeps the Health Connect flow. Proposed: the same card, with the Arc ring through Health Connect as the first source. |
| B | Woke in the night, inside the questions | The picked variant (M) has no control for it. The way today is "Add another sleep". Earlier variants asked "Did you wake up in the night?" |
| C | Can a coach leave out wind-down, breathing or me-time? | The score re-shares, but the builder blocks Next. Every template leaves me-time empty. |
| D | The medal art | The code and first look use Lotus at dawn; `mind-medal-options.html` marks Soft lotus as recommended. The ribbon is still Eat's. |
| E | Going back to the device's times after an edit | The old sheet had "Use Apple Health’s times". The questions sheet has none. |
| F | Ticking wind-down, me-time or breathing on a past day | Mood is closed on past days; the rest is not blocked in the prototype. Recommended: past days read only, like mood. |
| G | The first look, once per user or per device | Recommended: Move's rule, once per user, saved on the server. |
| H | Tell the patient the coach sees their check-ins | The research recommended "Your coach sees your check-ins." Not built. |
| I | A low mood: suggest a practice from the plan? | The early brief said to suggest one plan practice. The app gives one general line in words. |
| J | Breathing sound on or off at the start | `FINAL.md` says on; the player starts with it off. |
| K | The plan PDF | Who makes it, when, and how it reaches the patient (WhatsApp?). Not linked from the portal. |
| L | A very low streak | The research recommended a quiet flag to the coach after 3 low or very low check-ins in 7 days. Not built. |
| M | Who may update a master template | The prototype lets anyone. Move decided the creator and admins. |
| N | Editing or deactivating an Active Mind plan | No path in the prototype. |
| O | Assigning a plan that starts later | The prototype makes the current plan Inactive at once. Can Mind plans overlap? |
| P | Times to fill on a practice | Per plan, per week or per day? |
| Q | Plan name limit | There is none in the builder. |
| R | Win moment pick | The screen plays Lotus bloom (S). The research pick was Lotus heart (V); a `win.js` comment says Lotus rising (T). |
| S | Evening-shift sleepers (wake-up after 6 PM) | Not supported. Raise it if a patient needs it. |
| T | FlipCoins for people with no plan | Coins come from the plan's breathing. Library sessions are not saved, so free users and people waiting for a plan cannot earn them yet. Should a library session of a minute or more count? |

---

## 26. Rules everywhere

### Visual

- GoodFlip design system tokens only.
- **Gold** is Mind's Rhythm colour, and only the score carries it; the sleep bar and the medal use gold too. The rest of the screen may use the wider palette: indigo glass tiles and the indigo window band.
- Page backgrounds are pure white; cards may be tinted.
- Icons are the system's own, with real assets from Figma.
- Empty, loading and filled cards share one frame and picture.

### Motion

Smooth eases, no springs and no bounce. Motion settles to a light, still end state. Respect reduced motion: still end states, and words that change with no movement.

### Copy

- Plain, warm British or Indian English.
- **KAIRA** always in capitals.
- No em dashes. No "X, not Y" or "no X, no Y" constructions.
- Title Case on buttons.
- Never blame. Never show a minus. Never judge the mood picked.
- The patient sees %, never points; the coach sees pts.
- Use the copy in this PRD exactly; change it here first.
