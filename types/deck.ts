import { Card, Format } from './card';

export interface Deck {
  id: string;                      // UUID
  name: string;                    // デッキ名
  format: Format;                  // フォーマット
  description?: string;            // 説明
  mainboard: DeckCard[];           // メインボード60枚
  sideboard: DeckCard[];           // サイドボード15枚
  createdAt: number;               // 作成日時
  updatedAt: number;               // 更新日時
  tags?: string[];                 // タグ
}

export interface DeckCard {
  card: Card;                      // カードオブジェクト
  quantity: number;                // 枚数（基本土地以外は最大4枚）
  category?: CardCategory;         // カテゴリー
}

export type CardCategory = 'creature' | 'planeswalker' | 'instant' |
                           'sorcery' | 'enchantment' | 'artifact' | 'land';

export interface DeckStats {
  totalCards: number;              // 総カード枚数
  cardCount: {
    mainboard: number;
    sideboard: number;
  };
  manaCurve: ManaCurveData[];      // マナカーブデータ
  colorDistribution: ColorDistribution;  // 色分布（呪文の色要求）
  manaProduction: ColorDistribution;     // マナ生成（土地の色供給）
  detailedManaProduction: DetailedManaProduction;  // 詳細なマナ生成（カテゴリ別）
  typeBreakdown: TypeBreakdown;    // タイプ別内訳
  averageCMC: number;              // 平均マナコスト
  landCount: number;               // 土地枚数
}

export interface ManaCurveData {
  cmc: number;                     // 0, 1, 2, 3, 4, 5, 6, 7+
  count: number;                   // この点数で見たマナコストのカード枚数
}

export interface ColorDistribution {
  W: number;                       // 白カード枚数
  U: number;                       // 青
  B: number;                       // 黒
  R: number;                       // 赤
  G: number;                       // 緑
  C: number;                       // 無色
  multicolor: number;              // 多色カード
}

export interface ManaSourceBreakdown {
  untapped: number;                // アンタップイン土地
  conditional: number;             // 条件付きアンタップイン（ショックランド等）
  tapped: number;                  // タップイン土地
  restricted: number;              // 制限付き土地（魂の洞窟等）
}

export interface DetailedManaProduction {
  W: ManaSourceBreakdown;
  U: ManaSourceBreakdown;
  B: ManaSourceBreakdown;
  R: ManaSourceBreakdown;
  G: ManaSourceBreakdown;
  C: ManaSourceBreakdown;
}

export interface TypeBreakdown {
  creature: number;
  planeswalker: number;
  instant: number;
  sorcery: number;
  enchantment: number;
  artifact: number;
  land: number;
}
