#!/bin/bash

# マナシンボルをダウンロードするスクリプト
BASE_URL="https://svgs.scryfall.io/card-symbols"
OUTPUT_DIR="public/mana-symbols"

# ディレクトリが存在しない場合は作成
mkdir -p "$OUTPUT_DIR"

echo "Downloading mana symbols..."

# 基本色
for symbol in w u b r g c; do
  echo "Downloading $symbol..."
  curl -s -o "$OUTPUT_DIR/$symbol.svg" "$BASE_URL/$symbol.svg"
done

# 数字（0-20）
for i in {0..20}; do
  echo "Downloading $i..."
  curl -s -o "$OUTPUT_DIR/$i.svg" "$BASE_URL/$i.svg"
done

# X, Y, Z
for symbol in x y z; do
  echo "Downloading $symbol..."
  curl -s -o "$OUTPUT_DIR/$symbol.svg" "$BASE_URL/$symbol.svg"
done

# ハイブリッドマナ（主要なもの）
for combo in w-u u-b b-r r-g g-w w-b u-r b-g r-w g-u 2-w 2-u 2-b 2-r 2-g; do
  echo "Downloading $combo..."
  curl -s -o "$OUTPUT_DIR/$combo.svg" "$BASE_URL/$combo.svg"
done

# ファイレクシアマナ
for symbol in w-p u-p b-p r-p g-p; do
  echo "Downloading $symbol..."
  curl -s -o "$OUTPUT_DIR/$symbol.svg" "$BASE_URL/$symbol.svg"
done

# スノーマナとその他
for symbol in s e t q c-w c-u c-b c-r c-g; do
  echo "Downloading $symbol..."
  curl -s -o "$OUTPUT_DIR/$symbol.svg" "$BASE_URL/$symbol.svg"
done

echo "Done! Downloaded mana symbols to $OUTPUT_DIR"
