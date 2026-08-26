Frozen snapshot of the wireframe, served at /v0.

Built from the source as it stood on 26 Aug 2026 and committed as-is. It is a
plain static build with base=/v0/, so it shares nothing with the live app and
is unaffected by any later change to src.

Do not edit these files. To refresh this snapshot to the current source:

  rm -rf public/v0 dist-v0
  npx vite build --base=/v0/ --outDir dist-v0
  mkdir -p public/v0 && cp -R dist-v0/. public/v0/ && rm -rf dist-v0

That first rm matters: public/ is copied into every build, so a snapshot taken
without it would contain a copy of the old one inside itself.
