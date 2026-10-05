#!/bin/sh
# Builds v7/r3/home.html's script from the GoodFlip design system source and the EM3 cards.
set -e
DS=~/Documents/GF/design.goodflip.in
OUT=$(cd "$(dirname "$0")/../../public/v7/r3" && pwd)
cd "$(dirname "$0")"
NODE_PATH="$DS/node_modules" "$DS/node_modules/.bin/esbuild" entry.jsx --bundle --minify --format=iife --jsx=automatic --target=es2019 \
  --alias:ds="$DS/src/registry/components" --alias:next/dynamic=./next-dynamic-shim.js --alias:@="$DS" --alias:react="$DS/node_modules/react" --alias:react-dom="$DS/node_modules/react-dom" \
  --resolve-extensions=.tsx,.ts,.jsx,.js,.json --loader:.json=json --define:process.env.NODE_ENV='"production"' \
  --outfile="$OUT/home/home.js"
# the components point at /web-icons/ on the design system's own root; here they sit beside the page
sed -i '' 's#"/web-icons/#"home/web-icons/#g' "$OUT/home/home.js"
sed -i '' 's#`/web-icons/#`home/web-icons/#g; s#"/score-bg.webp"#"home/score-bg.webp"#g' "$OUT/home/home.js"
