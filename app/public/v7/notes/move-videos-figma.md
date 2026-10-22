# Move Learn: video library, brand findings

What GoodFlip already says about video cards, content cards, rails, section headers, chips and play buttons, so the Move Learn video library (Exercise of the week hero, then rails: Breathing, Cardio, Walking, Yoga, Strength) matches the brand.

Sources read: GoodFlip Design System MCP (UX principles, design language, tokens, components), Figma (GF Content and Community, Goodflip Design System library), prototype code (move/learn.html, move/index.html, move/plan.css, move/player.css, v7/r3/learn.html, v7/r3/goodflip-ui.css).

Headline finding: **GoodFlip has no video card component.** The design system MCP returns zero hits for "video" and "thumbnail", and the Figma libraries only offer a generic "Play" icon (Emerald Icons, not GoodFlip). The nearest brand language is **FlipFeed** (GF Content and Community file), which our Eat Learn tab already ports as `.gf-feed-*`. Build the video cards out of FlipFeed parts plus the Move player's play glyph.

---

## 1. Tokens to use

All already exist as CSS variables in `/v7/r3/goodflip-ui.css`. Use the variable, not the hex.

### Colour

| Role | Var | Hex | Use on the video library |
|---|---|---|---|
| Page | `#fff` | #FFFFFF | Page background, always white |
| Ink | `--g-900` | #101828 | Titles, FlipFeed sticker outline and hard offset |
| Secondary text | `--g-700` | #344054 | Rarely, body on tinted cards |
| Meta | `--g-500` | #667085 | Duration and level line, "5 min . Beginner" |
| Hairline | `--g-200` | #E4E7EC | Card borders, row dividers, soft card lift `2px 2px 0` |
| Recessed | `--g-100` | #F2F4F7 | Image placeholder tint, unselected chip fill |
| Faint | `--g-50` | #F9FAFB | Thumb fallback behind image |
| Action green | `--brand-600` | #299D6B | Play disc, "see all" arrow, active filter indicator, CTA |
| Green depth | `--brand-700` | #2A805A | 3D button lip (7px) |
| Green tint | `--brand-100` | #E6FAF1 | Selected chip / tab pill fill |
| Green tint text | `--brand-900` | #1D4D38 | Text on brand-100 pill |
| Move indigo | `--in-600` | #444CE7 | Sparingly: the type tag glyph and label, Momentum score only |
| Indigo wash | `--in-25` / `--in-50` / `--in-100` | #F5F8FF / #EEF4FF / #E0EAFF | Card washes (For You card radial, collection card panel, hero band) |
| Indigo hairline | `--in-200` / `--in-300` | #C7D7FE / #A4BCFD | Conic hairline on the For You card, action-card border and offset |
| Gold | `--gold-600` | #E7C144 | Feed "reel" type glyph colour in v7/icons (info, knowledge). Avoid unless it is a tip |

### Radius

`--r-sm` 8px (thumbnails, FlipFeed `.gf-feed-thumb`), `--r-md` 12px (default card, hero card, CTA), `--r-lg` 16px (large cards, sheets), `--r-xl` 24px (hero surfaces, tab pill), `--r-pill` 9999px (chips, play disc, duration pill). Note the prototype's names are one step off the DS (`DS xl = 12px`, prototype `--r-md = 12px`). One radius family per view.

### Shadow

| Name | Value | Where |
|---|---|---|
| `--shadow-card` | `0 1px 3px rgba(16,24,40,.10), 0 1px 2px -1px rgba(16,24,40,.10)` | DS resting card, quiet surfaces |
| `--shadow-card-lift` (r3 local) | `2px 2px 0 0 #E4E7EC` | Hero card and Move plan cards (`.mv-card`), flat grey edge |
| `--shadow-press-ink` (r3 local) | `2px 3px 0 0 #101828` | FlipFeed thumbnail sticker edge, with a 1px #101828 border |
| `--shadow-tap` | `2px 3px 0 0 #98A2B3` | Pressable card opt-in (`.gf-card.tap`) |
| `--shadow-bar` (r3 local) | `0 2px 4px -2px rgba(16,24,40,.06), 0 4px 8px -2px rgba(16,24,40,.10)` | Sticky category tab bar only |
| On-video | `drop-shadow(0 1px 2px rgba(0,0,0,.35))` on the white glyph, scrim `rgba(16,24,40,.18)` | Play glyph over a thumbnail (`.mv-th`) |

DS rule: depth bars belong to buttons; the only card exception is a hard flat offset on identity cards. A hard offset on the thumbnail is the FlipFeed exception and is shipped.

### Type (Roboto, letter-spacing .25px)

| Role | Spec | Source |
|---|---|---|
| Page title | Playfair Display 700 26/34 `#101010` in a pale band `linear-gradient(180deg,#EEF2FB,#fff)` | move/learn.html `.band h1` (current Move Learn) |
| Section header | Roboto 600 20/26 `--g-900`, 24px leading glyph, 12px to content | `.gf-feed-h` (Figma 1301:12153) |
| Hero card title | 600 18/24, 2-line clamp | `.gf-feed-hero .t` |
| Rail card title | 400 16/24, 2-line clamp (FlipFeed); 600 14/20 for exercise names | `.gf-feed-card .t`, `.mv-nm` |
| Meta | 400 12/14.4 `--g-500`, "5 min . 20 Nov 25" | `.meta` |
| Chip / tab label | 400 14/16.8 in a 25px pill | `.gf-feed-tabs .lbl` |
| Fact pill | 600 13 in a 28px pill | `.mvp-facts span` |

DS: Playfair only at 24px+, one serif size per screen. Card titles in Roboto.

### Motion

150 to 200ms `cubic-bezier(.4,0,.2,1)` (`--ease`) for state; sheets and player 300 to 320ms slide-up; press `:active` scale .92 to .97 or 7px button travel. No springs, no bounce, nothing loops on idle. Respect reduced motion.

---

## 2. Figma references

File **GF Content and Community** `9A9DmfBuOvB2gnrBTyHV92`, page "Dev Ready Designs" (1:2). Screen **feed landing exp 10** `279:6132` (390 x 3321) is the full FlipFeed landing and the best model for our page structure: hero carousel, For You rail, Trending rail, Explore Collections rail, topic sections, promise block, category tabs, listing.

| Node | Name | Size | What it gives us |
|---|---|---|---|
| 279:6135 | herop section carousel | 390 x 208 | Hero card: white, 1px #101828 border, hard black offset, photo top-right with only its inner corner rounded, type tag (indigo doc glyph + "Article" indigo 600), 2-line 18px title, bookmark + meta foot, green arrow disc bottom-right. Pagination: dark progress pill + dots. **Model for "Exercise of the week".** |
| 279:6142 / 279:6143 | latest carousel / latest card | 282 x 160 | For You card: white-to-indigo radial field, conic indigo hairline, 100px thumb with ink sticker edge. |
| 279:6150 / 279:6151 | latest carousel / trending card | 224 x 240 | Trending card: gold wash panel, big outlined numeral, 1:1 photo with ink edge and indigo type square top-right. |
| 279:6163 / 279:6164 | collections carousel / collection card | 160 x 238 | Portrait card: stacked photos (deck effect) over an indigo gradient panel with lotus watermark, 2-line 600 title, "12 Items" meta. **Best shape for a category rail card.** |
| 279:6237 | sub-category | 171 x 120 | Numbered tile, indigo wash, green arrow top-right, lotus watermark. |
| 279:6095 | detail page tabs | 390 x 46 | Scrolling category tab bar with brand-100 pill and 5px green underline. **Use for Breathing / Cardio / Walking filters if we add filters.** |
| 279:6073 | listing card | 390 x 116 | Row with 100px thumb, divider rule. |

Experimentation page (1:3): **trending card** `51:2608` (160 x 235) shows a "type tag" `51:2614` (84 x 22): a white tab notched into the card top-left, indigo glyph + indigo label. This is the closest thing GoodFlip has to a "Video" label. Also `latest card v2` 45:2209, `category tag` instances 51:2616.

Goodflip Design System library (`eIycxrJSM8IOSLgAavFUE4`) components worth knowing: **herop section carousel** (key 46704c5191c1...), **ad carousel** (904af3774ff1...), **Header chip** (set a4c74b550f91...), **suggestion chip** (set 559c7f98c9e3...), **progrm card image** (set dc8e22fa8549...). No video, media or thumbnail component.

Design System MCP components that apply: `banner-carousel` (16px radius, about 84% wide, center snap, neighbours peek, progress pill; 3 to 5 items, autoplay no faster than 4s), `chip` (tappable filter, pill, selected `background-flipgreen` + `text-flipgreen`), `badge` (static label, never a button), `action-card` (indigo border + 2px indigo offset, for tap-worthy offering tiles), `card`. Section header pattern from design.md: title left, "View More" in brand-600 right, rail below with hidden scrollbar.

---

## 3. Existing classes to reuse

### From `/v7/r3/goodflip-ui.css` (shared)
- `.gf-rail`: flex, gap 16, left gutter, hidden scrollbar, `touch-action: pan-x`. The base of every rail.
- `.gf-card`, `.gf-card.tap`, `.gf-card.recessed`: white card, 16px radius, 16px padding.
- `.gf-btn` (+ `.flat`, `.secondary`): green 3D button with 7px `--brand-700` lip.
- `.gf-h`: quiet 14px section heading (Eat). Do not mix with `.gf-feed-h` on one screen.
- `.gf-link`: centered text link.
- `.gf-chip` / `.gf-chip.light`: 4px-radius status chip (score context). Not a filter chip.

### From `/v7/r3/learn.html` (FlipFeed port, copy the rules into the Move page or lift into a shared CSS)
- `.gf-feed-h` + `.seeall`: section header row with 24px glyph and a 44px green arrow disc. Glyphs in `/v7/icons/feed-sec-*.svg`; arrow `feed-arrow-disc.svg` / `feed-arrow-right.svg`.
- `.gf-feed-rail` (+ `.hero`): adds right gutter, `scroll-snap-type: x mandatory`, start snap.
- `.gf-feed-thumb` + `.art`: 100 x 100, radius 8, 1px ink border, ink offset `2px 3px`.
- `.gf-feed-hero`: 320 x 152 hero card, photo as a tab cut into the top-right.
- `.gf-feed-card`: 280 x 160 For You card with the indigo radial and conic hairline.
- `.gf-feed-row`: listing row with rule divider.
- `.gf-feed-tabs` (+ `.lbl`, `.ind`): scrolling category bar, brand-100 pill, 5px green indicator.
- `.gf-feed-mark` / `.gf-feed-go`: 24px glyphs in 44px hit areas (bookmark, go).
- `.meta`, `.sk` (skeleton), `.loader`, `.centred` (empty state).
- Type glyphs ready for a "Video" label: `/v7/icons/feed-type-reel.svg` (rounded play-in-frame, 14px, currently filled gold #E7C144; recolour via mask to `--in-600` for Move), also `feed-type-article/podcast/infographic/pdf`.

### From Move (`/move/plan.css`, `/move/player.css`)
- `.mv-th` (+ `span`, `svg`): **the play-on-thumbnail treatment already in the app.** 80 x 56, radius 8, scrim `rgba(16,24,40,.18)`, white 20px play glyph with drop shadow. Scale it up for rail cards.
- Play glyph, `IC.play` in `move/plan.js` line 69: `<path d="M8 5.5v13a1 1 0 0 0 1.53.85l10.2-6.5a1 1 0 0 0 0-1.7L9.53 4.65A1 1 0 0 0 8 5.5z"/>` (24 viewBox, fill currentColor, rounded). Use this one everywhere.
- `.mvp-row .m`: 60px frosted play disc on video, `rgba(255,255,255,.18)` + `backdrop-filter: blur(8px)`. The big centred play for the hero.
- `.mvp-facts span`: 28px fact pills (`--g-50` fill, `--g-200` border, 600 13px). Use for "6 min", "Beginner", "No equipment".
- `.mvp-q .th`, `.mvp-side .sq .th`, `.mvp-band .th`: 16:9 thumbs at 88 / 64px, radius 8 to 10. 16:9 is the player's ratio.
- `.mvp-go`: full-width 52px green button with 7px lip.
- `.mv-card`: Move's routine card (white to `--in-25` top wash, conic indigo-to-grey hairline, `2px 2px 0 #E4E7EC`). This is the Move pillar's card identity; the hero can borrow its wash.
- `.mvp-novid`: small translucent pill on video, for "Coming soon" style overlays.

### From `/move/learn.html` (current Move Learn)
- `.band` + `h1`: pale indigo band with Playfair title "Exercise & Movement". Keep as the page head.
- `.row`, `.th` (88px, radius 10, `2px 3px 0 #E4E7EC`), `.tx`: article list. The video library sits above or replaces it.

### Assets on disk
- Posters: `/v7/img/move/box-poster.webp`, `plank-poster.webp`, `spot-poster.webp`, plus `box.webp`, `coastal.webp`, `plank.webp`, `sideleg.webp`, `spot.webp`.
- Video: `/v7/video/move/box.mp4`, `plank.mp4`, `spot.mp4`.
- Repo root (not yet copied in): `BoxBreathing.mp4`, `PlankToPushUp.mp4`, `SpotJump.mp4`, and thumbnails `BoxBreathingThumbnail.png`, `LateralCostalThumbnail.png`, `PlanToPushUpThumbnail.png`, `SideLegRisethumbnail.png`, `SpotJumpThumbnail.png`.
- Watermark: `/v7/icons/feed-lotus-wash-indigo.svg` (collection card motif).

---

## 4. Suggested card anatomy (from the above)

- **Exercise of the week hero**: `.gf-feed-hero` frame (white, 12px radius, 1px `--g-200`, `--shadow-card-lift`), but with a 16:9 poster across the top instead of the 100px corner tab, the 60px frosted play disc centred on it, a type tag "Video" (reel glyph + label in `--in-600`) seated top-left, 600 18/24 title, `.meta` "6 min . Beginner", and a green arrow disc or a `.gf-btn` "Start". Optional indigo wash from `.mv-card`.
- **Rail card**: 160 to 200px wide, poster 16:9 or 4:5 at radius 8 with the `.mv-th` scrim + white play glyph (24 to 28px), duration pill bottom-right on the poster (`rgba(16,24,40,.6)` dark pill, white 600 12px, tabular nums), 2-line 600 14/20 title below, 12px meta. Ink sticker edge (`--shadow-press-ink`) on the poster if we want the FlipFeed feel; grey lift if we want it quieter.
- **Section header**: `.gf-feed-h` with a 24px glyph per category and `.seeall` green arrow, 12px to the rail, 40px between sections.
- **Filters (optional)**: `.gf-feed-tabs` bar or DS `chip` (selected brand-100 fill + brand-900 text, unselected `--g-100` fill + `--g-700` text, pill, 14px).

---

## 5. Do and don't

Do
- White page background. Cards may carry a tint (indigo-25/50 washes, gold for tips).
- Roboto everywhere; Playfair only for the page title (one serif size per screen).
- App green (`--brand-600`) for every action: play disc, arrow discs, active filter, CTA. One primary action per screen.
- Indigo for Move, used sparingly: the type tag glyph and label, a card wash, the Momentum score. Not on buttons.
- Use the same play glyph (`IC.play`) on every thumbnail and in the player.
- Rails: fixed card widths, hidden scrollbar, snap to start, the next card peeks, 16px gutter both ends.
- 44px hit areas on bookmark, arrow and play, even when the glyph is 24px.
- Calm motion: 150 to 200ms ease, 300ms sheets, no springs, no bounce, no idle loops, no autoplay faster than 4s on any carousel.
- Copy: plain and friendly, numerals ("6 min"), Title Case 1 to 3 word CTAs ("Start", "Watch Now"), sentence case elsewhere, no em dashes, no "AI" jargon.
- Real assets: posters and icons from disk or Figma, never CSS-drawn approximations.

Don't
- Don't invent a GoodFlip "video card" look from scratch; compose FlipFeed parts.
- Don't use a hard depth bar on chips or plain content cards (buttons only; FlipFeed thumb edge and identity cards are the two sanctioned offsets).
- Don't use the green solid as a card fill, and don't flood indigo across the page.
- Don't badge every card "Video" if every card is a video; a type tag only earns its place when formats mix (the r3 Learn rule).
- Don't mix `.gf-h` and `.gf-feed-h` on one screen.
- Don't mix aspect ratios inside one rail.
- Don't show a play button on a card that has no video yet; use `.mvp-novid` style "Coming soon" or hide it.
