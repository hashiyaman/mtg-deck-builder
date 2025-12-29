import { Color, Format, Rarity } from './card';

export interface SearchFilters {
  query: string;                   // テキスト検索
  colors?: Color[];                // 色フィルター
  colorMode?: 'exact' | 'including' | 'atMost';  // 色マッチモード
  types?: string[];                // カードタイプ
  sets?: string[];                 // セット
  rarity?: Rarity[];               // レアリティ
  cmc?: {                          // マナコスト範囲
    min?: number;
    max?: number;
  };
  power?: {
    min?: number;
    max?: number;
  };
  toughness?: {
    min?: number;
    max?: number;
  };
  format?: Format;                 // フォーマット適正
  sortBy?: SortOption;             // ソート順
}

export type SortOption = 'name' | 'cmc' | 'rarity' | 'released' | 'price';
export type ViewMode = 'grid' | 'list';
