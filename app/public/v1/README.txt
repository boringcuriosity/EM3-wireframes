Frozen snapshot of the wireframe, served at /v1.

Built from the source as it stood on 27 Aug 2026 and committed as-is. It is a
plain static build with base=/v1/, so it shares nothing with the live app and
is unaffected by any later change to src.

This is the diary version of To-do: the day in the order it happens, one card
on Home carrying the streak and the day, the plan handover card, the CGM and
body composition syncs, and the weekly read. /v0 is the older, pillar-grouped
design from before that rewrite.

Do not edit these files. To refresh this snapshot to the current source:

  rm -rf public/v1 dist-v1
  npx vite build --base=/v1/ --outDir dist-v1
  mkdir -p public/v1 && cp -R dist-v1/. public/v1/ && rm -rf dist-v1
  rm -rf public/v1/v0 public/v1/scenarios

That first rm matters: public/ is copied into every build, so a snapshot taken
without it would contain a copy of the old one inside itself. The last line
drops the other snapshots, which the build copies in from public/.
