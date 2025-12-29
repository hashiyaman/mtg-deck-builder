import { Card } from '@/types/card';
import { DeckCard } from '@/types/deck';
import { isAvailableOnTurn1 } from './landClassifier';

/**
 * Shuffle deck and draw random opening hand
 */
function drawOpeningHand(cards: DeckCard[]): Card[] {
  // Flatten deck (expand each card by quantity)
  const deck: Card[] = [];
  cards.forEach((dc) => {
    for (let i = 0; i < dc.quantity; i++) {
      deck.push(dc.card);
    }
  });

  // Shuffle using Fisher-Yates algorithm
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  // Draw 7 cards
  return deck.slice(0, 7);
}

/**
 * Count number of lands in hand
 */
function countLands(hand: Card[]): number {
  return hand.filter((card) => card.type_line.toLowerCase().includes('land')).length;
}

/**
 * Check if hand can produce required colors (T1 available lands only)
 */
function canProduceColors(hand: Card[], requiredColors: string[]): boolean {
  const availableColors = new Set<string>();

  hand.forEach((card) => {
    if (card.type_line.toLowerCase().includes('land')) {
      // Only consider lands available on T1 (untapped or conditional)
      if (isAvailableOnTurn1(card)) {
        // Extract colors from produced_mana (Scryfall format: ["W", "U"])
        if (card.produced_mana) {
          card.produced_mana.forEach((mana) => {
            // Add W, U, B, R, G colors directly
            if (['W', 'U', 'B', 'R', 'G'].includes(mana)) {
              availableColors.add(mana);
            }
          });
        }
      }
    }
  });

  // Check if all required colors can be produced
  return requiredColors.every((color) => availableColors.has(color));
}

/**
 * Determine if hand is keepable (2-5 lands)
 */
function isKeepableHand(hand: Card[]): boolean {
  const landCount = countLands(hand);
  return landCount >= 2 && landCount <= 5;
}

/**
 * Opening hand statistics (N simulations)
 */
export interface OpeningHandStats {
  totalSimulations: number;
  landDistribution: Record<number, number>; // Probability of 0-7 lands
  averageLands: number;
  keepableHandRate: number; // Probability of keepable hand (2-5 lands)
  colorRequirements: {
    // Probability of meeting color requirements
    [key: string]: number;
  };
}

export function simulateOpeningHands(
  mainboard: DeckCard[],
  simulations: number = 1000
): OpeningHandStats {
  const landDistribution: Record<number, number> = {
    0: 0,
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
    7: 0,
  };

  let totalLands = 0;
  let keepableHands = 0;

  // Analyze deck color requirements
  const deckColors = new Set<string>();
  mainboard.forEach((dc) => {
    dc.card.colors?.forEach((color) => deckColors.add(color));
  });

  const colorRequirements: Record<string, number> = {};
  deckColors.forEach((color) => {
    colorRequirements[color] = 0;
  });

  // Run simulations
  for (let i = 0; i < simulations; i++) {
    const hand = drawOpeningHand(mainboard);
    const landCount = countLands(hand);

    landDistribution[landCount]++;
    totalLands += landCount;

    if (isKeepableHand(hand)) {
      keepableHands++;
    }

    // Check if each color can be produced
    deckColors.forEach((color) => {
      if (canProduceColors(hand, [color])) {
        colorRequirements[color]++;
      }
    });
  }

  // Convert to percentages
  Object.keys(landDistribution).forEach((key) => {
    landDistribution[Number(key)] = (landDistribution[Number(key)] / simulations) * 100;
  });

  Object.keys(colorRequirements).forEach((key) => {
    colorRequirements[key] = (colorRequirements[key] / simulations) * 100;
  });

  return {
    totalSimulations: simulations,
    landDistribution,
    averageLands: totalLands / simulations,
    keepableHandRate: (keepableHands / simulations) * 100,
    colorRequirements,
  };
}

/**
 * Early game simulation statistics (turns 1-3)
 */
export interface EarlyGameStats {
  turn1PlayableSpells: number; // Probability of having playable spells on turn 1
  turn2PlayableSpells: number;
  turn3PlayableSpells: number;
  curveOutRate: number; // Probability of curving out perfectly
}

export function simulateEarlyGame(
  mainboard: DeckCard[],
  simulations: number = 1000
): EarlyGameStats {
  let turn1Playable = 0;
  let turn2Playable = 0;
  let turn3Playable = 0;
  let curveOuts = 0;

  for (let i = 0; i < simulations; i++) {
    const hand = drawOpeningHand(mainboard);
    const landCount = countLands(hand);

    // Simplified check (ideally should consider mana cost and color requirements)
    if (landCount >= 1) {
      const hasOneDrop = hand.some(
        (card) => !card.type_line.toLowerCase().includes('land') && (card.cmc || 0) === 1
      );
      if (hasOneDrop) turn1Playable++;
    }

    if (landCount >= 2) {
      const hasTwoDrop = hand.some(
        (card) => !card.type_line.toLowerCase().includes('land') && (card.cmc || 0) === 2
      );
      if (hasTwoDrop) turn2Playable++;
    }

    if (landCount >= 3) {
      const hasThreeDrop = hand.some(
        (card) => !card.type_line.toLowerCase().includes('land') && (card.cmc || 0) === 3
      );
      if (hasThreeDrop) turn3Playable++;
    }

    // Curve out: can play spells on turns 1, 2, and 3
    if (landCount >= 3) {
      const hasFullCurve = hand.filter((card) => {
        const cmc = card.cmc || 0;
        return !card.type_line.toLowerCase().includes('land') && cmc >= 1 && cmc <= 3;
      }).length >= 3;
      if (hasFullCurve) curveOuts++;
    }
  }

  return {
    turn1PlayableSpells: (turn1Playable / simulations) * 100,
    turn2PlayableSpells: (turn2Playable / simulations) * 100,
    turn3PlayableSpells: (turn3Playable / simulations) * 100,
    curveOutRate: (curveOuts / simulations) * 100,
  };
}

/**
 * Key card draw rate statistics (probability of drawing specific card early)
 */
export interface KeyCardStats {
  cardName: string;
  turn3Rate: number; // Probability by turn 3 (opening 7 + 2 draws)
  turn4Rate: number; // Probability by turn 4
  openingHandRate: number; // Probability in opening hand
}

export function simulateKeyCardDrawRate(
  mainboard: DeckCard[],
  cardName: string,
  simulations: number = 1000
): KeyCardStats {
  let inOpeningHand = 0;
  let byTurn3 = 0;
  let byTurn4 = 0;

  // Flatten deck
  const deck: Card[] = [];
  mainboard.forEach((dc) => {
    for (let i = 0; i < dc.quantity; i++) {
      deck.push(dc.card);
    }
  });

  for (let i = 0; i < simulations; i++) {
    // Shuffle
    const shuffledDeck = [...deck];
    for (let j = shuffledDeck.length - 1; j > 0; j--) {
      const k = Math.floor(Math.random() * (j + 1));
      [shuffledDeck[j], shuffledDeck[k]] = [shuffledDeck[k], shuffledDeck[j]];
    }

    // Opening 7 cards
    const openingHand = shuffledDeck.slice(0, 7);
    if (openingHand.some((card) => card.name === cardName)) {
      inOpeningHand++;
      byTurn3++;
      byTurn4++;
      continue;
    }

    // By turn 3 (opening 7 + 2 draws = 9 cards)
    const byTurn3Cards = shuffledDeck.slice(0, 9);
    if (byTurn3Cards.some((card) => card.name === cardName)) {
      byTurn3++;
      byTurn4++;
      continue;
    }

    // By turn 4 (opening 7 + 3 draws = 10 cards)
    const byTurn4Cards = shuffledDeck.slice(0, 10);
    if (byTurn4Cards.some((card) => card.name === cardName)) {
      byTurn4++;
    }
  }

  return {
    cardName,
    openingHandRate: (inOpeningHand / simulations) * 100,
    turn3Rate: (byTurn3 / simulations) * 100,
    turn4Rate: (byTurn4 / simulations) * 100,
  };
}
