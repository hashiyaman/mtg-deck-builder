'use client';

import { useState } from 'react';

interface ManaSymbolProps {
  symbol: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_MAP = {
  sm: 16,
  md: 20,
  lg: 24,
};

/**
 * マナシンボルを表示するコンポーネント
 * ローカルにダウンロードしたSVGアイコンを使用
 */
export function ManaSymbol({ symbol, size = 'md', className = '' }: ManaSymbolProps) {
  const [imageError, setImageError] = useState(false);

  // シンボルを正規化（{W} -> w, {2/W} -> 2-w など）
  const normalizedSymbol = symbol
    .replace(/[{}]/g, '')
    .toLowerCase()
    .replace(/\//g, '-'); // スラッシュをハイフンに変換（ハイブリッドマナ用）

  // ローカルのマナシンボルパス
  const symbolPath = `/mana-symbols/${normalizedSymbol}.svg`;

  const pixelSize = SIZE_MAP[size];

  // デバッグ: 初回レンダリング時のみログ出力
  if (typeof window !== 'undefined' && !imageError) {
    console.log(`[ManaSymbol] symbol: ${symbol}, normalized: ${normalizedSymbol}, path: ${symbolPath}`);
  }

  // 画像読み込みエラー時はテキストで表示
  if (imageError) {
    return (
      <span
        className={`inline-flex items-center justify-center rounded-full bg-muted text-muted-foreground font-bold text-xs ${className}`}
        style={{
          width: `${pixelSize}px`,
          height: `${pixelSize}px`,
          fontSize: `${pixelSize * 0.6}px`,
          verticalAlign: 'middle'
        }}
      >
        {symbol.replace(/[{}]/g, '')}
      </span>
    );
  }

  return (
    <img
      src={symbolPath}
      alt={symbol}
      width={pixelSize}
      height={pixelSize}
      className={`inline-block ${className}`}
      style={{ verticalAlign: 'middle' }}
      onError={(e) => {
        console.error(`[ManaSymbol] Failed to load: ${symbolPath}`, e);
        setImageError(true);
      }}
    />
  );
}

interface ManaCostProps {
  manaCost: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * マナコスト全体を表示するコンポーネント
 * 例: "{2}{U}{U}" -> 2 U U のシンボルを表示
 */
export function ManaCost({ manaCost, size = 'md', className = '' }: ManaCostProps) {
  // マナコストをシンボルごとに分割（{2}{U}{U} -> ['2', 'U', 'U']）
  const symbols = manaCost.match(/\{[^}]+\}/g) || [];

  if (symbols.length === 0) {
    return null;
  }

  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {symbols.map((symbol, index) => (
        <ManaSymbol key={`${symbol}-${index}`} symbol={symbol} size={size} />
      ))}
    </div>
  );
}
