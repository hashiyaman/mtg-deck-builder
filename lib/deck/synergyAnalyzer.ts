import { DeckCard } from '@/types/deck';
import { Card } from '@/types/card';

export interface TribalSynergy {
  type: string;
  count: number;
  cards: string[];
  score: number; // 1-10
}

export interface TokenSynergy {
  producers: string[];
  payoffs: string[];
  score: number; // 1-10
}

export interface GraveyardSynergy {
  graveyardFillers: string[];
  graveyardPayoffs: string[];
  score: number; // 1-10
}

export interface CounterSynergy {
  counterCards: string[];
  proliferateCards: string[];
  score: number; // 1-10
}

export interface KeywordCluster {
  keyword: string;
  count: number;
  cards: string[];
}

export interface FeedbackLoop {
  loopType: string; // 'creature_lifegain', 'sacrifice_token', 'counter_growth', etc.
  cardA: string;
  cardB: string;
  triggerA: string; // What A triggers on
  outputA: string; // What A produces
  triggerB: string; // What B triggers on
  outputB: string; // What B produces
  description: string;
  score: number; // 1-10
}

export interface SynergyAnalysis {
  tribalSynergies: TribalSynergy[];
  tokenSynergy: TokenSynergy | null;
  graveyardSynergy: GraveyardSynergy | null;
  counterSynergy: CounterSynergy | null;
  keywordClusters: KeywordCluster[];
  feedbackLoops: FeedbackLoop[];
  overallScore: number; // 1-10
}

/**
 * Detects tribal synergies (8+ creatures of the same type)
 */
export function detectTribalSynergy(cards: DeckCard[]): TribalSynergy[] {
  const typeCount = new Map<string, { count: number; cards: string[] }>();

  cards.forEach(({ card, quantity }) => {
    // Only check creatures
    if (!card.type_line.toLowerCase().includes('creature')) {
      return;
    }

    // Extract creature types from type line
    // Format: "Creature — Human Wizard" or "伝説のクリーチャー — 人間・ウィザード"
    const typeLine = card.printed_type_line || card.type_line;
    const parts = typeLine.split(/[—\u2014]/); // em dash or unicode em dash

    if (parts.length < 2) return;

    // Get creature types (everything after the dash)
    const types = parts[1]
      .trim()
      .split(/[\s・\/,]+/) // Split by space, middle dot, slash, or comma
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    types.forEach((type) => {
      const existing = typeCount.get(type) || { count: 0, cards: [] };
      existing.count += quantity;
      if (!existing.cards.includes(card.name)) {
        existing.cards.push(card.name);
      }
      typeCount.set(type, existing);
    });
  });

  // Find types with 8+ cards
  const synergies: TribalSynergy[] = [];
  typeCount.forEach((data, type) => {
    if (data.count >= 8) {
      // Score based on concentration (8=6, 12=8, 16+=10)
      let score = 6;
      if (data.count >= 16) score = 10;
      else if (data.count >= 12) score = 8;

      synergies.push({
        type,
        count: data.count,
        cards: data.cards,
        score,
      });
    }
  });

  return synergies.sort((a, b) => b.count - a.count);
}

/**
 * Detects token synergies (token producers and payoffs)
 */
export function detectTokenSynergy(cards: DeckCard[]): TokenSynergy | null {
  const producers: string[] = [];
  const payoffs: string[] = [];

  // Token producer patterns
  const producerPatterns = [
    /create.*token/i,
    /put.*token.*onto the battlefield/i,
    /token.*copy/i,
  ];

  // Token payoff patterns
  const payoffPatterns = [
    /whenever.*creature enters/i,
    /whenever.*enters.*you control/i,
    /sacrifice.*creature/i,
    /creatures you control get/i,
    /creature tokens you control/i,
    /tokens you control/i,
    /for each creature you control/i,
  ];

  cards.forEach(({ card }) => {
    const oracleText = card.oracle_text || '';
    const cardName = card.name;

    // Check for token producers
    if (producerPatterns.some((pattern) => pattern.test(oracleText))) {
      if (!producers.includes(cardName)) {
        producers.push(cardName);
      }
    }

    // Check for token payoffs
    if (payoffPatterns.some((pattern) => pattern.test(oracleText))) {
      if (!payoffs.includes(cardName)) {
        payoffs.push(cardName);
      }
    }
  });

  if (producers.length === 0 && payoffs.length === 0) {
    return null;
  }

  // Score based on both producers and payoffs (need both for good synergy)
  let score = 0;
  if (producers.length >= 3 && payoffs.length >= 2) score = 8;
  else if (producers.length >= 2 && payoffs.length >= 1) score = 6;
  else if (producers.length >= 1 || payoffs.length >= 1) score = 4;

  return {
    producers,
    payoffs,
    score,
  };
}

/**
 * Detects graveyard synergies (fillers and payoffs)
 */
export function detectGraveyardSynergy(cards: DeckCard[]): GraveyardSynergy | null {
  const graveyardFillers: string[] = [];
  const graveyardPayoffs: string[] = [];

  // Graveyard filler patterns (self-mill, discard)
  const fillerPatterns = [
    /mill/i,
    /put.*from your library into your graveyard/i,
    /discard/i,
    /dredge/i,
    /surveil/i,
  ];

  // Graveyard payoff patterns
  const payoffPatterns = [
    /from.*graveyard/i,
    /flashback/i,
    /delve/i,
    /escape/i,
    /embalm/i,
    /eternalize/i,
    /unearth/i,
    /return.*from.*graveyard/i,
    /threshold/i,
    /delirium/i,
  ];

  cards.forEach(({ card }) => {
    const oracleText = card.oracle_text || '';
    const cardName = card.name;

    // Check for graveyard fillers
    if (fillerPatterns.some((pattern) => pattern.test(oracleText))) {
      if (!graveyardFillers.includes(cardName)) {
        graveyardFillers.push(cardName);
      }
    }

    // Check for graveyard payoffs
    if (payoffPatterns.some((pattern) => pattern.test(oracleText))) {
      if (!graveyardPayoffs.includes(cardName)) {
        graveyardPayoffs.push(cardName);
      }
    }
  });

  if (graveyardFillers.length === 0 && graveyardPayoffs.length === 0) {
    return null;
  }

  // Score based on both fillers and payoffs
  let score = 0;
  if (graveyardFillers.length >= 4 && graveyardPayoffs.length >= 4) score = 9;
  else if (graveyardFillers.length >= 3 && graveyardPayoffs.length >= 3) score = 7;
  else if (graveyardFillers.length >= 2 && graveyardPayoffs.length >= 2) score = 5;
  else if (graveyardFillers.length >= 1 || graveyardPayoffs.length >= 1) score = 3;

  return {
    graveyardFillers,
    graveyardPayoffs,
    score,
  };
}

/**
 * Detects +1/+1 counter synergies
 */
export function detectCounterSynergy(cards: DeckCard[]): CounterSynergy | null {
  const counterCards: string[] = [];
  const proliferateCards: string[] = [];

  // +1/+1 counter patterns
  const counterPatterns = [
    /\+1\/\+1 counter/i,
    /put.*\+1\/\+1 counter/i,
    /enters.*with.*\+1\/\+1 counter/i,
    /counters on.*creature/i,
  ];

  // Proliferate pattern
  const proliferatePattern = /proliferate/i;

  cards.forEach(({ card }) => {
    const oracleText = card.oracle_text || '';
    const cardName = card.name;

    // Check for counter cards
    if (counterPatterns.some((pattern) => pattern.test(oracleText))) {
      if (!counterCards.includes(cardName)) {
        counterCards.push(cardName);
      }
    }

    // Check for proliferate
    if (proliferatePattern.test(oracleText)) {
      if (!proliferateCards.includes(cardName)) {
        proliferateCards.push(cardName);
      }
    }
  });

  if (counterCards.length === 0 && proliferateCards.length === 0) {
    return null;
  }

  // Score based on counter cards and proliferate synergy
  let score = 0;
  if (counterCards.length >= 6 && proliferateCards.length >= 2) score = 9;
  else if (counterCards.length >= 4 && proliferateCards.length >= 1) score = 7;
  else if (counterCards.length >= 4) score = 6;
  else if (counterCards.length >= 2) score = 4;

  return {
    counterCards,
    proliferateCards,
    score,
  };
}

/**
 * Detects keyword ability clusters (4+ cards with same keyword)
 */
export function detectKeywordClusters(cards: DeckCard[]): KeywordCluster[] {
  const keywordCount = new Map<string, { count: number; cards: string[] }>();

  // Important keywords to track
  const importantKeywords = [
    'Flying',
    'First Strike',
    'Double Strike',
    'Deathtouch',
    'Hexproof',
    'Indestructible',
    'Lifelink',
    'Menace',
    'Reach',
    'Trample',
    'Vigilance',
    'Flash',
    'Haste',
  ];

  cards.forEach(({ card, quantity }) => {
    const keywords = card.keywords || [];
    const cardName = card.name;

    keywords.forEach((keyword) => {
      // Only track important keywords
      if (!importantKeywords.includes(keyword)) return;

      const existing = keywordCount.get(keyword) || { count: 0, cards: [] };
      existing.count += quantity;
      if (!existing.cards.includes(cardName)) {
        existing.cards.push(cardName);
      }
      keywordCount.set(keyword, existing);
    });
  });

  // Find keywords with 4+ cards
  const clusters: KeywordCluster[] = [];
  keywordCount.forEach((data, keyword) => {
    if (data.count >= 4) {
      clusters.push({
        keyword,
        count: data.count,
        cards: data.cards,
      });
    }
  });

  return clusters.sort((a, b) => b.count - a.count);
}

/**
 * Detects feedback loops between cards (A triggers B, B triggers A)
 */
export function detectFeedbackLoops(cards: DeckCard[]): FeedbackLoop[] {
  const loops: FeedbackLoop[] = [];

  // Define trigger-output patterns for each card
  interface CardPattern {
    card: DeckCard;
    triggers: string[]; // What this card triggers on
    outputs: string[];  // What this card produces
  }

  const cardPatterns: CardPattern[] = cards.map(({ card, quantity }) => {
    const oracleText = card.oracle_text || '';
    const triggers: string[] = [];
    const outputs: string[] = [];

    // Detect triggers (when/whenever clauses)
    if (/whenever.*creature.*enters/i.test(oracleText)) {
      triggers.push('creature_etb');
    }
    if (/whenever you gain life|whenever.*life.*gained/i.test(oracleText)) {
      triggers.push('lifegain');
    }
    if (/whenever.*creature.*dies|whenever.*creature.*put into.*graveyard/i.test(oracleText)) {
      triggers.push('creature_dies');
    }
    if (/whenever.*\+1\/\+1 counter.*placed|whenever.*counter.*put on/i.test(oracleText)) {
      triggers.push('counter_placed');
    }
    if (/whenever you cast.*instant or sorcery|whenever you cast.*spell/i.test(oracleText)) {
      triggers.push('spell_cast');
    }
    if (/whenever you draw|when.*draws a card/i.test(oracleText)) {
      triggers.push('card_draw');
    }
    if (/whenever.*token.*created|whenever.*token.*enters/i.test(oracleText)) {
      triggers.push('token_created');
    }

    // Detect outputs (what the card produces)
    if (/create.*token/i.test(oracleText) || /put.*token.*onto/i.test(oracleText)) {
      outputs.push('creature_token');
      outputs.push('creature_etb'); // Tokens entering trigger ETB effects
    }
    if (/you gain.*life|gain.*life/i.test(oracleText)) {
      outputs.push('lifegain');
    }
    if (/draw.*card/i.test(oracleText)) {
      outputs.push('card_draw');
    }
    if (/put.*\+1\/\+1 counter/i.test(oracleText) || /enters.*with.*\+1\/\+1 counter/i.test(oracleText)) {
      outputs.push('counter_placed');
    }
    if (/sacrifice.*creature/i.test(oracleText)) {
      outputs.push('creature_dies');
    }

    return { card: { card, quantity }, triggers, outputs };
  });

  // Find feedback loops: A's output matches B's trigger AND B's output matches A's trigger
  for (let i = 0; i < cardPatterns.length; i++) {
    for (let j = i + 1; j < cardPatterns.length; j++) {
      const patternA = cardPatterns[i];
      const patternB = cardPatterns[j];

      // Check if A's outputs trigger B and B's outputs trigger A
      for (const outputA of patternA.outputs) {
        for (const outputB of patternB.outputs) {
          if (
            patternB.triggers.includes(outputA) &&
            patternA.triggers.includes(outputB)
          ) {
            // Found a feedback loop!
            const loopType = `${outputB}_${outputA}`;
            const description = `${patternA.card.card.name} produces ${outputA}, triggering ${patternB.card.card.name}, which produces ${outputB}, triggering ${patternA.card.card.name}`;

            // Calculate score based on quantities and loop strength
            let score = 6; // Base score for any feedback loop
            const totalQuantity = patternA.card.quantity + patternB.card.quantity;
            if (totalQuantity >= 8) score = 9; // High density
            else if (totalQuantity >= 6) score = 8;
            else if (totalQuantity >= 4) score = 7;

            loops.push({
              loopType,
              cardA: patternA.card.card.name,
              cardB: patternB.card.card.name,
              triggerA: outputB,
              outputA: outputA,
              triggerB: outputA,
              outputB: outputB,
              description,
              score,
            });
          }
        }
      }
    }
  }

  return loops;
}

/**
 * Analyzes deck for all synergies and calculates overall score
 */
export function analyzeDeckSynergies(cards: DeckCard[]): SynergyAnalysis {
  const tribalSynergies = detectTribalSynergy(cards);
  const tokenSynergy = detectTokenSynergy(cards);
  const graveyardSynergy = detectGraveyardSynergy(cards);
  const counterSynergy = detectCounterSynergy(cards);
  const keywordClusters = detectKeywordClusters(cards);
  const feedbackLoops = detectFeedbackLoops(cards);

  // Calculate overall synergy score (1-10)
  let overallScore = 0;
  let synergyCount = 0;

  // Tribal synergies (highest score)
  if (tribalSynergies.length > 0) {
    overallScore += Math.max(...tribalSynergies.map((s) => s.score));
    synergyCount++;
  }

  // Token synergy
  if (tokenSynergy && tokenSynergy.score > 0) {
    overallScore += tokenSynergy.score;
    synergyCount++;
  }

  // Graveyard synergy
  if (graveyardSynergy && graveyardSynergy.score > 0) {
    overallScore += graveyardSynergy.score;
    synergyCount++;
  }

  // Counter synergy
  if (counterSynergy && counterSynergy.score > 0) {
    overallScore += counterSynergy.score;
    synergyCount++;
  }

  // Feedback loops (high value synergy)
  if (feedbackLoops.length > 0) {
    overallScore += Math.max(...feedbackLoops.map((loop) => loop.score));
    synergyCount++;
  }

  // Keyword clusters (bonus points for 2+ clusters)
  if (keywordClusters.length >= 2) {
    overallScore += 5;
    synergyCount++;
  } else if (keywordClusters.length === 1) {
    overallScore += 3;
    synergyCount++;
  }

  // Average the scores (or default to 5 if no synergies)
  const finalScore = synergyCount > 0 ? Math.min(10, overallScore / synergyCount) : 5;

  return {
    tribalSynergies,
    tokenSynergy,
    graveyardSynergy,
    counterSynergy,
    keywordClusters,
    feedbackLoops,
    overallScore: Math.round(finalScore * 10) / 10, // Round to 1 decimal
  };
}
