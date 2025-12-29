// Scryfall Card Object types
export interface Card {
  id: string;                      // Scryfall UUID
  oracle_id: string;               // 再録版間で共通のID
  name: string;                    // カード名（英語）
  printed_name?: string;           // 印刷名（言語版）
  lang?: string;                   // 言語コード（例: "ja", "en"）
  mana_cost?: string;              // マナコスト (例: "{2}{U}{U}")
  cmc: number;                     // 点数で見たマナコスト
  type_line: string;               // カードタイプ（英語）(例: "Creature — Human Wizard")
  printed_type_line?: string;      // カードタイプ（言語版）
  oracle_text?: string;            // ルールテキスト
  printed_text?: string;           // ルールテキスト（言語版）
  power?: string;                  // パワー
  toughness?: string;              // タフネス
  colors?: Color[];                // カードの色
  color_identity: Color[];         // 色識別
  keywords: string[];              // キーワード能力
  legalities: Record<Format, Legality>;
  set: string;                     // セットコード
  set_name: string;                // セット名
  collector_number?: string;       // コレクター番号
  rarity: Rarity;                  // レアリティ
  artist?: string;                 // イラストレーター
  flavor_text?: string;            // フレーバーテキスト
  image_uris?: {
    small: string;
    normal: string;
    large: string;
    png: string;
    art_crop?: string;
    border_crop?: string;
  };
  card_faces?: CardFace[];         // 両面カード（DFC）の各面の情報
  prices: {
    usd?: string;
    usd_foil?: string;
    eur?: string;
    tix?: string;
  };
  related_uris?: {
    gatherer?: string;
    tcgplayer_infinite_articles?: string;
    edhrec?: string;
  };
  produced_mana?: string[];          // 土地が生成できるマナの色（例: ["W", "U"]）
}

// 両面カード（DFC）の各面の情報
export interface CardFace {
  name: string;
  printed_name?: string;
  mana_cost?: string;
  type_line: string;
  printed_type_line?: string;
  oracle_text?: string;
  printed_text?: string;
  colors?: Color[];
  power?: string;
  toughness?: string;
  image_uris?: {
    small: string;
    normal: string;
    large: string;
    png: string;
    art_crop?: string;
    border_crop?: string;
  };
}

export type Color = 'W' | 'U' | 'B' | 'R' | 'G';
export type Rarity = 'common' | 'uncommon' | 'rare' | 'mythic' | 'special';
export type Format = 'standard' | 'modern' | 'pioneer' | 'legacy' | 'vintage' | 'commander';
export type Legality = 'legal' | 'not_legal' | 'restricted' | 'banned';

export interface ScryfallSearchResponse {
  object: 'list';
  total_cards: number;
  has_more: boolean;
  next_page?: string;
  data: Card[];
}
