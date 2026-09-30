# GoodFlip colour law

Read this before colouring anything. It is the brand colour deck (Sep 2026) plus the
generated design tokens, written as rules you can fail against.

Source of truth, in this order:

1. The brand colour deck, which assigns a family to each **component archetype**.
2. `goodflip-design` MCP `get_tokens`, which fixes the **hex values**.
3. `r3/goodflip-ui.css`, which is this prototype's copy of 2.

When 1 and 2 disagree, 1 decides what colour a thing is and 2 decides which hex that
colour is. One known conflict is logged at the bottom.

---

## 1. Five families, one job each

A family is not a mood. It is a claim about what the element **is**. Pick the family
from the element's job, never from the layout, never from what looks balanced.

| Family | Base | Its one job |
|---|---|---|
| **Flip Green** | `#299D6B` | The brand acting: hero zones, the primary action, links, selected and active states, active nav, "go" affordances |
| **Indigo** | `#444CE7` | **Action and tracking.** Anything the user logs into, or that reports what was logged |
| **Gold** | `#E7C144` | **Knowledge.** Information, explanation, insight, teaching |
| **Teal** | `#44E7E7` | Kaira, and edges only. Never a fill of its own |
| **Neutrals** | `#101828` | Everything else, which is most of the screen |

Status red, orange and success green are **not** brand families. They report a health
or system state and appear only when there is a state to report.

### The pairing rules

Two families only ever combine in these three ways. Any other pairing is wrong.

- **Indigo + Teal** is Kaira, and only Kaira. Always a gradient, never flat.
- **Gold + Teal** is FlipCoins, and only FlipCoins.
- **All four at once** is the Metabolic Score and its sub-scores, and nothing else.

---

## 2. The ramp law

Every family runs `25 · 50 · 100 · 200 · 300 · 400 · 500 · 600 · 700 · 800 · 900`.
The step encodes intent. Reach for the step by role, not by how light it looks.

| Step | Role |
|---|---|
| `25`, `50` | Page tints, the faintest card wash |
| `100` | Tinted surfaces: highlighted cards, chips, tab pills, progress tracks |
| `200` | Tinted borders, filled progress, disabled fills |
| `300`, `400` | Decorative accents, disabled foregrounds |
| `500` | Secondary fills |
| `600` | **The workhorse.** Primary fill, interactive colour, icons |
| `700` | Pressed state, depth bar, secondary text of that family |
| `800`, `900` | High-emphasis text sitting on a tint of the same family |

Two steps that matter more than the rest:

- Text on a `50` or `100` tint takes `800`, never `600`. `gold-600` on `gold-50` fails contrast.
- A depth bar takes `700` of the fill's own family. Nothing else.

---

## 3. Component law

Match the element to an archetype, then take the recipe. Do not improvise a recipe.

### Hero zone, Flip Green

The band at the top of a screen that says where you are and what the screen is worth.

```
fill    brand-600 solid, or brand-100 tint when it sits on white
text    #FFFFFF on the solid, g-900 on the tint
edge    none on the solid, border-flipgreen #E6FAF1 on the tint
```

### Action card, Indigo

A card you log into, or that reports logged data: nutrition, activity, sleep, steps,
water, weight, device connections.

```
fill    #FFFFFF with a linear-gradient(180deg, in-25, #FFF ~46%) wash
edge    1px in-100, or a conic in-600 to g-200 sweep for the signature ornament
icon    in-600 at 16px beside the card label
number  g-900. The metric is never coloured
meta    g-500
go      a brand-600 circle with a white chevron, top right
```

The chevron circle is **always Flip Green** no matter which family owns the card.
Green means go, on every card in the system.

### Knowledge card, Gold

A card that explains, informs, or reports an insight rather than inviting a log.

```
fill    gold-50 #FFFBEE, filled, not white
edge    1px gold-200 #FEF1C7
label   gold-800 #A68A2D with a gold-800 icon
body    g-900 for the fact, g-500 for the caveat
```

Knowledge cards are the one archetype that takes a **filled** tint. Action cards stay
white. That difference is how the two read apart at a glance.

### Insight card, Neutral

A card that is pure data with no advice attached (a weight delta, a date range).

```
fill    g-50   edge g-100   number g-900   delta chip g-500 on g-100
```

### Kaira, Indigo to Teal

Kaira is never a flat colour and never green artwork.

```
edge      linear-gradient(100deg, in-600, teal-600) as a border-box layer
fill      #FFFFFF padding-box, or in-25 to white
mark      GFKaira.mark(), production artwork, never redrawn
CTA       the Kaira button pair: gradient #299D6B to #2A805A fill, or
          white fill with that gradient as stroke and label
```

The Kaira **buttons** are green. Her **artwork and edges** are indigo to teal. Both
are correct and they are not in conflict: the button is a GoodFlip action, the card is
Kaira speaking.

### Chips and pills

```
selected     brand-100 fill, brand-600 text, optional 1px brand-600 ring
unselected   g-100 fill, g-700 text
progress     brand-100 filling to brand-200, measured left to right
status        background-{red|orange|green} with matching text-{red|orange|green}
```

### Buttons

There is no colour variant. Type decides colour.

```
primary     brand-600 fill, brand-700 depth bar, white label
secondary   white fill, 1px brand-600, brand-600 label, brand-100 depth bar
error       error-600 fill, error-700 depth bar, white label
kaira       the gradient pair above
text link   brand-600, no fill, no border, no depth
```

### Navigation

```
active     brand-600, filled glyph, 700 weight label
inactive   g-400 glyph, g-500 label, outlined glyph
```

State is signalled by the **fill change**, not by colour alone.

### Score and gauge

The pillar colour is spent here and nowhere else. The Metabolic Score is the only
element allowed to use all four families at once, as its four sub-scores:
Biomarker green, Wellness teal, Habit gold, Profile indigo.

---

## 4. The green budget

Green is under **10%** of a finished screen. Count it: the primary action, the active
nav item, selected chips, ticks, and the go chevrons. That is the whole list.

If a screen looks green, the fix is never a paler green. It is moving elements to the
family whose job they actually do.

---

## 5. Hard nos

- No raw hex in a component. Name a token.
- No teal fill. Teal is a border or a gradient stop, never a surface.
- No green on a card that is not selected, active, or the primary action.
- No colour carrying a health state on its own. Always pair with a label.
- No family chosen for variety. Two cards doing the same job take the same family.
- No depth bar on a card, chip, or anything you cannot press.
- No flat indigo standing in for Kaira. She is always the gradient.
- No `600` text on a `50` tint of the same family. Use `800`.

---

## 6. Known conflict

The brand deck labels its teal swatch **Teel #42CFCF**. The generated tokens have
`teal-600 #44E7E7` and `teal-700 #35CDCD`. The deck value sits between the two.
This prototype uses the token value, `#44E7E7`, because the tokens are generated from
the Figma library and the deck swatch is a flattened export. Worth confirming with the
brand owner before it hardens.

---

## 7. The Eat screen ledger

Every coloured surface on `r3/eat.html`, and the family it is now held to.

| Element | Family | Why |
|---|---|---|
| Score stage, plate, verdict | Green, status tints | It is the pillar score |
| "What shaped your score?" macro card | **Indigo** | Reports logged nutrition, an action card |
| Macro jar fills, calorie bar | **Indigo** | Same card, same family |
| Kaira insight card and Ask Kaira chip | **Indigo to Teal** | Kaira |
| Snap and Voice buttons | Green gradient | Kaira button pair |
| Meal cards | **Indigo** | You log into them |
| Option chips | **Green** | Selected and active state |
| Item ticks | **Green** | Active state, not a health verdict |
| "Search and log" | Green secondary | A secondary button, and buttons have no colour variant |
| "Log with Kaira" | **Indigo to Teal** | Kaira |
| Tips from your coach | **Gold** | Teaching |
| Coach notes, eyebrow labels | **Gold** | Information |
| Bottom nav active | Green | Active nav |
| Confetti burst | All four | A brand moment, the one place the full palette lands |
