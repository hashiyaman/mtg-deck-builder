import { Card } from '@/types/card';
import { DeckCard } from '@/types/deck';

/**
 * カードの主要なタイプを判定
 */
export function getPrimaryCardType(typeLine: string): CardType {
  const lowerTypeLine = typeLine.toLowerCase();

  // 優先順位に基づいて判定（土地が最優先、次にクリーチャー）
  if (lowerTypeLine.includes('land')) return 'Land';
  if (lowerTypeLine.includes('creature')) return 'Creature';
  if (lowerTypeLine.includes('planeswalker')) return 'Planeswalker';
  if (lowerTypeLine.includes('instant')) return 'Instant';
  if (lowerTypeLine.includes('sorcery')) return 'Sorcery';
  if (lowerTypeLine.includes('enchantment')) return 'Enchantment';
  if (lowerTypeLine.includes('artifact')) return 'Artifact';
  if (lowerTypeLine.includes('battle')) return 'Battle';

  return 'Other';
}

/**
 * カードタイプの日本語表示名
 */
export function getCardTypeDisplayName(type: CardType): string {
  const displayNames: Record<CardType, string> = {
    Creature: 'クリーチャー',
    Land: '土地',
    Instant: 'インスタント',
    Sorcery: 'ソーサリー',
    Enchantment: 'エンチャント',
    Artifact: 'アーティファクト',
    Planeswalker: 'プレインズウォーカー',
    Battle: 'バトル',
    Other: 'その他',
  };

  return displayNames[type];
}

/**
 * カードタイプの表示順序
 */
export function getCardTypeOrder(type: CardType): number {
  const order: Record<CardType, number> = {
    Creature: 1,
    Planeswalker: 2,
    Instant: 3,
    Sorcery: 4,
    Enchantment: 5,
    Artifact: 6,
    Land: 7,
    Battle: 8,
    Other: 9,
  };

  return order[type];
}

/**
 * デッキカードをタイプ別にグループ化
 */
export function groupCardsByType(cards: DeckCard[]): CardTypeGroup[] {
  const groups = new Map<CardType, DeckCard[]>();

  // カードをタイプ別に分類
  cards.forEach((deckCard) => {
    const type = getPrimaryCardType(deckCard.card.type_line);
    if (!groups.has(type)) {
      groups.set(type, []);
    }
    groups.get(type)!.push(deckCard);
  });

  // グループを配列に変換し、表示順にソート
  const result: CardTypeGroup[] = Array.from(groups.entries())
    .map(([type, cards]) => ({
      type,
      displayName: getCardTypeDisplayName(type),
      cards: cards.sort((a, b) => {
        // CMCでソート、同じCMCなら名前でソート
        if (a.card.cmc !== b.card.cmc) {
          return a.card.cmc - b.card.cmc;
        }
        const nameA = a.card.printed_name || a.card.name;
        const nameB = b.card.printed_name || b.card.name;
        return nameA.localeCompare(nameB);
      }),
      totalCards: cards.reduce((sum, card) => sum + card.quantity, 0),
    }))
    .sort((a, b) => getCardTypeOrder(a.type) - getCardTypeOrder(b.type));

  return result;
}

/**
 * カードタイプ
 */
export type CardType =
  | 'Creature'
  | 'Land'
  | 'Instant'
  | 'Sorcery'
  | 'Enchantment'
  | 'Artifact'
  | 'Planeswalker'
  | 'Battle'
  | 'Other';

/**
 * カードタイプグループ
 */
export interface CardTypeGroup {
  type: CardType;
  displayName: string;
  cards: DeckCard[];
  totalCards: number;
}
