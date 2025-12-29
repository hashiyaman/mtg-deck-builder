#!/bin/bash

BASE_URL="https://svgs.scryfall.io/card-symbols"
OUTPUT_DIR="/Users/makito.hashiyama/work/mtg-deck-builder/public/mana-symbols"

mkdir -p "$OUTPUT_DIR"

# Color symbols
for color in W U B R G C; do
  lower=$(echo "$color" | tr '[:upper:]' '[:lower:]')
  echo "Downloading $color..."
  curl -s -o "$OUTPUT_DIR/$lower.svg" "$BASE_URL/$color.svg"
done

# Number symbols
for num in 0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 X Y Z; do
  lower=$(echo "$num" | tr '[:upper:]' '[:lower:]')
  echo "Downloading $num..."
  curl -s -o "$OUTPUT_DIR/$lower.svg" "$BASE_URL/$num.svg"
done

# Hybrid mana (common ones)
curl -s -o "$OUTPUT_DIR/2-w.svg" "$BASE_URL/2-W.svg"
curl -s -o "$OUTPUT_DIR/2-u.svg" "$BASE_URL/2-U.svg"
curl -s -o "$OUTPUT_DIR/2-b.svg" "$BASE_URL/2-B.svg"
curl -s -o "$OUTPUT_DIR/2-r.svg" "$BASE_URL/2-R.svg"
curl -s -o "$OUTPUT_DIR/2-g.svg" "$BASE_URL/2-G.svg"

echo "Download complete! Total files: $(ls -1 "$OUTPUT_DIR" | wc -l)"
