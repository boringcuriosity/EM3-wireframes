Frozen snapshot of the wireframe, served at /v6.

Taken on 15 Sep 2026 from commit cb53369 ("The Move deck gets a calculator
that models the plan"), with a clean working tree, so this is exactly what
the live app showed that day. It is a plain static build with base=/v6/, so
it shares nothing with the live app and is unaffected by any later change
to src.

This is the last wireframe-fidelity build before the visual pass. From here
the screens get redesigned for look and delight, starting with Eat detail.
Open /v6 for the Eat screen as it stood before that: the Today chip, the
sufficiency hexagon with four macro rings, the calorie strip, the Snap and
Voice prompt, meal cards with the coach's options, water at the foot, and
the Back, Eat, Trend, Learn nav.

Added since /v5: Move has a score of its own and Kaira offers to explain it,
Kaira's mark replaces the info circle on tips, and the Move deck gets a
calculator that models the plan.

Do not edit these files. To refresh this snapshot to the current source:

  rm -rf public/v6 dist-v6
  npx vite build --base=/v6/ --outDir dist-v6
  mkdir -p public/v6 && cp -R dist-v6/. public/v6/ && rm -rf dist-v6
  rm -rf public/v6/v0 public/v6/v1 public/v6/v2 public/v6/v3 public/v6/v4 \
         public/v6/v5 public/v6/v6 public/v6/scenarios public/v6/know \
         public/v6/move public/v6/mind public/v6/users

The first rm matters: public/ is copied into every build, so a snapshot taken
without it contains a copy of the old one inside itself. The last line drops
the other snapshots and the working decks, which the build copies in for the
same reason.
