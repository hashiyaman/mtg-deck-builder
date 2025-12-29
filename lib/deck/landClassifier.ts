import { Card } from '@/types/card';

/**
 * Land category classification
 */
export type LandCategory = 'untapped' | 'conditional' | 'tapped' | 'restricted';

/**
 * Result of land classification
 */
export interface LandClassification {
  category: LandCategory;
  reason?: string; // For debugging
}

/**
 * Classify a land card into one of four categories
 */
export function classifyLand(card: Card): LandClassification {
  if (!card.type_line.toLowerCase().includes('land')) {
    return { category: 'untapped', reason: 'Not a land' };
  }

  const oracleText = (card.oracle_text || '').toLowerCase();
  const printedText = (card.printed_text || '').toLowerCase();
  const text = `${oracleText} ${printedText}`;

  // Basic lands always enter untapped
  if (card.type_line.toLowerCase().includes('basic')) {
    return { category: 'untapped', reason: 'Basic land' };
  }

  // IMPORTANT: Check conditional lands BEFORE tapped lands
  // because conditional lands often contain "enters tapped unless..."

  // Shock lands (conditional untapped: pay 2 life)
  // Check for "unless you pay 2 life" or Japanese equivalent
  if (
    text.includes('unless you pay 2 life') ||
    text.includes('2点のライフを払わない限り') ||
    text.includes('2点のライフを支払わない限り')
  ) {
    return { category: 'conditional', reason: 'Shock land (2 life)' };
  }

  // Fast lands (conditional untapped: land count restriction)
  // Check for land count conditions
  if (
    text.includes('unless you control two or more other lands') ||
    text.includes('unless you control three or more other lands') ||
    text.includes('他の土地を2つ以上コントロールしている') ||
    text.includes('他の土地を3つ以上コントロールしている')
  ) {
    return { category: 'conditional', reason: 'Fast land' };
  }

  // Pain lands (conditional: deals damage when tapping for colored mana)
  // Check for damage clause when adding mana
  if (
    (text.includes('deals 1 damage to you') || text.includes('1点のダメージを与える')) &&
    (text.includes('add') || text.includes('加える'))
  ) {
    return { category: 'conditional', reason: 'Pain land' };
  }

  // Check lands (conditional untapped: requires basic land type)
  // Check for "unless you control a [basic land type]"
  if (
    text.includes('unless you control a') &&
    (text.includes('plains') || text.includes('island') || text.includes('swamp') ||
     text.includes('mountain') || text.includes('forest') ||
     text.includes('平地') || text.includes('島') || text.includes('沼') ||
     text.includes('山') || text.includes('森'))
  ) {
    return { category: 'conditional', reason: 'Check land' };
  }

  // Tapped lands detection (AFTER conditional checks)
  // Check for "enters the battlefield tapped" or Japanese equivalent
  if (
    text.includes('enters the battlefield tapped') ||
    text.includes('enters tapped') ||
    text.includes('タップ状態で戦場に出る') ||
    text.includes('タップ状態で出る')
  ) {
    return { category: 'tapped', reason: 'Always enters tapped' };
  }

  // Restricted lands (e.g., Cavern of Souls: mana usage limited)
  // Check for "spend this mana only to" or Japanese equivalent
  if (
    text.includes('spend this mana only to') ||
    text.includes('このマナは') && text.includes('のみ使用') ||
    text.includes('のみ使える')
  ) {
    return { category: 'restricted', reason: 'Mana usage restricted' };
  }

  // Utility lands with no mana production
  if (!card.produced_mana || card.produced_mana.length === 0) {
    return { category: 'restricted', reason: 'No mana production' };
  }

  // Default: untapped
  // Lands without tapped conditions are assumed to enter untapped
  return { category: 'untapped', reason: 'No tapped condition found' };
}

/**
 * Classify multiple land cards
 */
export function classifyLands(cards: Card[]): Map<string, LandClassification> {
  const classifications = new Map<string, LandClassification>();

  cards.forEach(card => {
    if (card.type_line.toLowerCase().includes('land')) {
      classifications.set(card.id, classifyLand(card));
    }
  });

  return classifications;
}

/**
 * Check if a land is available untapped on turn 1
 * Used for opening hand color availability calculation
 */
export function isAvailableOnTurn1(card: Card): boolean {
  const classification = classifyLand(card);
  // Untapped and conditional lands can be used on turn 1
  // (Most conditional lands like shock lands can be used T1)
  return classification.category === 'untapped' || classification.category === 'conditional';
}
