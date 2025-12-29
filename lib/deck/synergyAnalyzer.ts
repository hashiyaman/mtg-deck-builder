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

export interface ThresholdSynergy {
  type: 'metalcraft' | 'delirium' | 'domain' | 'threshold' | 'descend';
  name: string; // Display name
  requiredCount: number; // Threshold value
  currentCount: number; // Actual count in deck
  enablers: string[]; // Cards that help achieve threshold
  payoffs: string[]; // Cards that benefit from threshold
  achievementLikelihood: 'high' | 'medium' | 'low'; // Simple estimate
  score: number; // 1-10
}

export interface SacrificeSynergy {
  outlets: string[]; // Cards that sacrifice creatures
  fodder: string[]; // Resources to sacrifice (tokens, recursion)
  payoffs: string[]; // Death triggers
  score: number; // 1-10
}

export interface ManaAccelerationSynergy {
  manaCreatures: string[]; // Creatures that produce mana
  manaArtifacts: string[]; // Artifacts that produce mana
  landRamp: string[]; // Land search/ramp spells
  extraLandPlays: string[]; // Cards that allow extra land plays
  costReduction: string[]; // Cards with cost reduction mechanics
  payoffs: string[]; // High CMC cards (5+) that benefit from ramp
  score: number; // 1-10
}

export interface SynergyAnalysis {
  tribalSynergies: TribalSynergy[];
  tokenSynergy: TokenSynergy | null;
  graveyardSynergy: GraveyardSynergy | null;
  counterSynergy: CounterSynergy | null;
  keywordClusters: KeywordCluster[];
  feedbackLoops: FeedbackLoop[];
  thresholdSynergies: ThresholdSynergy[];
  sacrificeSynergy: SacrificeSynergy | null;
  manaAccelerationSynergy: ManaAccelerationSynergy | null;
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
 * Detects sacrifice synergies (Aristocrats strategy)
 */
export function detectSacrificeSynergy(cards: DeckCard[]): SacrificeSynergy | null {
  const outlets: string[] = [];
  const fodder: string[] = [];
  const payoffs: string[] = [];

  // Sacrifice outlet patterns
  const outletPatterns = [
    /sacrifice.*creature/i,
    /sacrifice a creature/i,
  ];

  // Fodder patterns (token producers, recursion, expendable creatures)
  const fodderPatterns = [
    /create.*token/i,
    /put.*token.*onto/i,
    /when.*dies.*create/i, // Death triggers that create tokens
    /when.*dies.*return/i, // Recursion
    /persist|undying/i, // Automatic recursion
  ];

  // Death trigger payoff patterns
  const payoffPatterns = [
    /whenever.*creature.*dies/i,
    /whenever.*creature.*put into.*graveyard/i,
    /whenever.*dies/i,
  ];

  cards.forEach(({ card }) => {
    const oracleText = card.oracle_text || '';
    const cardName = card.name;

    // Check for sacrifice outlets
    if (outletPatterns.some((pattern) => pattern.test(oracleText))) {
      if (!outlets.includes(cardName)) {
        outlets.push(cardName);
      }
    }

    // Check for fodder
    if (fodderPatterns.some((pattern) => pattern.test(oracleText))) {
      if (!fodder.includes(cardName)) {
        fodder.push(cardName);
      }
    }

    // Check for death trigger payoffs
    if (payoffPatterns.some((pattern) => pattern.test(oracleText))) {
      if (!payoffs.includes(cardName)) {
        payoffs.push(cardName);
      }
    }
  });

  // Only return synergy if at least 2 of 3 components exist
  const componentsPresent = (outlets.length > 0 ? 1 : 0) +
                            (fodder.length > 0 ? 1 : 0) +
                            (payoffs.length > 0 ? 1 : 0);

  if (componentsPresent < 2) {
    return null;
  }

  // Score based on all three components
  let score = 0;

  if (outlets.length >= 2 && fodder.length >= 3 && payoffs.length >= 2) {
    score = 9; // Fully functional aristocrats deck
  } else if (outlets.length >= 1 && fodder.length >= 2 && payoffs.length >= 2) {
    score = 8; // Strong sacrifice theme
  } else if (outlets.length >= 1 && fodder.length >= 2 && payoffs.length >= 1) {
    score = 7; // Good sacrifice synergy
  } else if (outlets.length >= 1 && fodder.length >= 1 && payoffs.length >= 1) {
    score = 6; // Basic sacrifice synergy
  } else if (componentsPresent === 2) {
    score = 5; // Partial synergy
  }

  return {
    outlets,
    fodder,
    payoffs,
    score,
  };
}

/**
 * Detects mana acceleration synergies (ramp strategy)
 */
export function detectManaAccelerationSynergy(cards: DeckCard[]): ManaAccelerationSynergy | null {
  const manaCreatures: string[] = [];
  const manaArtifacts: string[] = [];
  const landRamp: string[] = [];
  const extraLandPlays: string[] = [];
  const costReduction: string[] = [];
  const payoffs: string[] = [];

  // Mana creature patterns (creatures that tap for mana or produce mana)
  const manaCreaturePatterns = [
    /add.*{[WUBRGC]}/i,
    /add.*mana/i,
    /{T}:.*add/i,
  ];

  // Mana artifact patterns
  const manaArtifactPatterns = [
    /add.*{[WUBRGC]}/i,
    /add.*mana/i,
    /{T}:.*add/i,
  ];

  // Land ramp patterns (search for lands, put lands onto battlefield)
  const landRampPatterns = [
    /search.*library.*land/i,
    /search.*library.*basic land/i,
    /put.*land.*onto the battlefield/i,
    /put.*land.*into play/i,
    /rampant growth|cultivate|kodama's reach|explosive vegetation|skyshroud claim/i,
  ];

  // Extra land play patterns
  const extraLandPlayPatterns = [
    /play an additional land/i,
    /play.*additional land/i,
    /play any number of lands/i,
    /play.*land.*each turn/i,
    /azusa|exploration|oracle of mul daya|burgeoning/i,
  ];

  // Cost reduction patterns
  const costReductionPatterns = [
    /affinity/i,
    /convoke/i,
    /delve/i,
    /cost.*less to cast/i,
    /costs?.*{[0-9]}.*less/i,
    /improvise/i,
  ];

  cards.forEach(({ card, quantity }) => {
    const oracleText = card.oracle_text || '';
    const cardName = card.name;
    const typeLine = card.type_line.toLowerCase();
    const cmc = card.cmc || 0;

    // Check for mana creatures
    if (typeLine.includes('creature')) {
      if (manaCreaturePatterns.some((pattern) => pattern.test(oracleText))) {
        if (!manaCreatures.includes(cardName)) {
          manaCreatures.push(cardName);
        }
      }
    }

    // Check for mana artifacts (but not creatures)
    if (typeLine.includes('artifact') && !typeLine.includes('creature')) {
      if (manaArtifactPatterns.some((pattern) => pattern.test(oracleText))) {
        if (!manaArtifacts.includes(cardName)) {
          manaArtifacts.push(cardName);
        }
      }
    }

    // Check for land ramp
    if (landRampPatterns.some((pattern) => pattern.test(oracleText))) {
      if (!landRamp.includes(cardName)) {
        landRamp.push(cardName);
      }
    }

    // Check for extra land plays
    if (extraLandPlayPatterns.some((pattern) => pattern.test(oracleText))) {
      if (!extraLandPlays.includes(cardName)) {
        extraLandPlays.push(cardName);
      }
    }

    // Check for cost reduction
    if (costReductionPatterns.some((pattern) => pattern.test(oracleText))) {
      if (!costReduction.includes(cardName)) {
        costReduction.push(cardName);
      }
    }

    // High CMC cards as payoffs (5+)
    if (cmc >= 5 && !typeLine.includes('land')) {
      // Avoid counting ramp spells themselves as payoffs
      const isRampSpell = landRampPatterns.some((pattern) => pattern.test(oracleText));
      if (!isRampSpell && !payoffs.includes(cardName)) {
        for (let i = 0; i < quantity; i++) {
          payoffs.push(cardName);
          if (payoffs.filter(name => name === cardName).length >= quantity) break;
        }
      }
    }
  });

  // Total acceleration sources
  const totalAccelerators = manaCreatures.length + manaArtifacts.length +
                           landRamp.length + extraLandPlays.length + costReduction.length;

  // Need at least some acceleration AND some payoffs
  if (totalAccelerators === 0 || payoffs.length === 0) {
    return null;
  }

  // Scoring based on density of ramp and high-cost payoffs
  let score = 0;

  if (totalAccelerators >= 12 && payoffs.length >= 8) {
    score = 9; // Dedicated ramp deck
  } else if ((totalAccelerators >= 10 && payoffs.length >= 6) || (totalAccelerators >= 7 && payoffs.length >= 8) || (totalAccelerators >= 5 && payoffs.length >= 10)) {
    score = 8; // Strong ramp strategy (OR many payoffs with good/decent ramp)
  } else if ((totalAccelerators >= 8 && payoffs.length >= 5) || (totalAccelerators >= 6 && payoffs.length >= 7)) {
    score = 7; // Good ramp synergy
  } else if ((totalAccelerators >= 6 && payoffs.length >= 4) || (totalAccelerators >= 5 && payoffs.length >= 6)) {
    score = 6; // Moderate ramp
  } else if (totalAccelerators >= 4 && payoffs.length >= 3) {
    score = 5; // Light ramp
  } else {
    score = 4; // Minimal ramp
  }

  return {
    manaCreatures,
    manaArtifacts,
    landRamp,
    extraLandPlays,
    costReduction,
    payoffs,
    score,
  };
}

/**
 * Detects threshold-based synergies (Metalcraft, Delirium, Domain, etc.)
 */
export function detectThresholdSynergies(cards: DeckCard[]): ThresholdSynergy[] {
  const synergies: ThresholdSynergy[] = [];

  // 1. Metalcraft (3+ artifacts)
  const artifacts = cards.filter((dc) => dc.card.type_line.toLowerCase().includes('artifact'));
  const artifactCount = artifacts.reduce((sum, dc) => sum + dc.quantity, 0);
  const metalcraftPayoffs = cards.filter((dc) =>
    /metalcraft|artifact.*control/i.test(dc.card.oracle_text || '')
  );

  if (artifactCount >= 3 || metalcraftPayoffs.length > 0) {
    let likelihood: 'high' | 'medium' | 'low' = 'low';
    if (artifactCount >= 12) likelihood = 'high';
    else if (artifactCount >= 6) likelihood = 'medium';

    let score = 0;
    if (artifactCount >= 3 && metalcraftPayoffs.length >= 2) score = 8;
    else if (artifactCount >= 3 && metalcraftPayoffs.length >= 1) score = 6;
    else if (artifactCount >= 3) score = 4;

    if (score > 0 || metalcraftPayoffs.length > 0) {
      synergies.push({
        type: 'metalcraft',
        name: '金属術 (Metalcraft)',
        requiredCount: 3,
        currentCount: artifactCount,
        enablers: artifacts.map((dc) => dc.card.name),
        payoffs: metalcraftPayoffs.map((dc) => dc.card.name),
        achievementLikelihood: likelihood,
        score,
      });
    }
  }

  // 2. Delirium (4+ card types in graveyard)
  const cardTypes = new Set<string>();
  cards.forEach((dc) => {
    const typeLine = dc.card.type_line.toLowerCase();
    if (typeLine.includes('artifact')) cardTypes.add('Artifact');
    if (typeLine.includes('creature')) cardTypes.add('Creature');
    if (typeLine.includes('enchantment')) cardTypes.add('Enchantment');
    if (typeLine.includes('instant')) cardTypes.add('Instant');
    if (typeLine.includes('land')) cardTypes.add('Land');
    if (typeLine.includes('planeswalker')) cardTypes.add('Planeswalker');
    if (typeLine.includes('sorcery')) cardTypes.add('Sorcery');
  });

  const deliriumPayoffs = cards.filter((dc) =>
    /delirium/i.test(dc.card.oracle_text || '')
  );
  const graveyardFillers = cards.filter((dc) =>
    /mill|discard|sacrifice|fetch/i.test(dc.card.oracle_text || '')
  );

  if (cardTypes.size >= 4 || deliriumPayoffs.length > 0) {
    let likelihood: 'high' | 'medium' | 'low' = 'low';
    if (cardTypes.size >= 6 && graveyardFillers.length >= 4) likelihood = 'high';
    else if (cardTypes.size >= 5 && graveyardFillers.length >= 2) likelihood = 'medium';

    let score = 0;
    if (cardTypes.size >= 5 && deliriumPayoffs.length >= 2 && graveyardFillers.length >= 3) score = 9;
    else if (cardTypes.size >= 4 && deliriumPayoffs.length >= 1 && graveyardFillers.length >= 2) score = 7;
    else if (cardTypes.size >= 4 && deliriumPayoffs.length >= 1) score = 5;

    if (score > 0 || deliriumPayoffs.length > 0) {
      synergies.push({
        type: 'delirium',
        name: '昂揚 (Delirium)',
        requiredCount: 4,
        currentCount: cardTypes.size,
        enablers: graveyardFillers.map((dc) => dc.card.name).slice(0, 5),
        payoffs: deliriumPayoffs.map((dc) => dc.card.name),
        achievementLikelihood: likelihood,
        score,
      });
    }
  }

  // 3. Domain (basic land types)
  const basicLandTypes = new Set<string>();
  cards.forEach((dc) => {
    const oracleText = dc.card.oracle_text || '';
    const typeLine = dc.card.type_line.toLowerCase();

    // Check for basic land types in type line or oracle text
    if (typeLine.includes('plains') || /\bplains\b/i.test(oracleText)) basicLandTypes.add('Plains');
    if (typeLine.includes('island') || /\bisland\b/i.test(oracleText)) basicLandTypes.add('Island');
    if (typeLine.includes('swamp') || /\bswamp\b/i.test(oracleText)) basicLandTypes.add('Swamp');
    if (typeLine.includes('mountain') || /\bmountain\b/i.test(oracleText)) basicLandTypes.add('Mountain');
    if (typeLine.includes('forest') || /\bforest\b/i.test(oracleText)) basicLandTypes.add('Forest');
  });

  const domainPayoffs = cards.filter((dc) =>
    /domain/i.test(dc.card.oracle_text || '')
  );
  const domainEnablers = cards.filter((dc) =>
    /search.*basic land|fetch/i.test(dc.card.oracle_text || '') ||
    dc.card.type_line.toLowerCase().includes('land')
  );

  if (basicLandTypes.size >= 3 || domainPayoffs.length > 0) {
    let likelihood: 'high' | 'medium' | 'low' = 'low';
    if (basicLandTypes.size >= 5) likelihood = 'high';
    else if (basicLandTypes.size >= 4) likelihood = 'medium';

    let score = 0;
    if (basicLandTypes.size >= 5 && domainPayoffs.length >= 2) score = 9;
    else if (basicLandTypes.size >= 4 && domainPayoffs.length >= 1) score = 7;
    else if (basicLandTypes.size >= 3 && domainPayoffs.length >= 1) score = 5;

    if (score > 0 || domainPayoffs.length > 0) {
      synergies.push({
        type: 'domain',
        name: '領域 (Domain)',
        requiredCount: 5,
        currentCount: basicLandTypes.size,
        enablers: domainEnablers.map((dc) => dc.card.name).slice(0, 5),
        payoffs: domainPayoffs.map((dc) => dc.card.name),
        achievementLikelihood: likelihood,
        score,
      });
    }
  }

  // 4. Threshold (7+ cards in graveyard)
  const thresholdPayoffs = cards.filter((dc) =>
    /threshold/i.test(dc.card.oracle_text || '')
  );

  if (thresholdPayoffs.length > 0) {
    // Use graveyard fillers from delirium detection
    const fillerCount = graveyardFillers.length;

    let likelihood: 'high' | 'medium' | 'low' = 'low';
    if (fillerCount >= 6) likelihood = 'high';
    else if (fillerCount >= 3) likelihood = 'medium';

    let score = 0;
    if (fillerCount >= 6 && thresholdPayoffs.length >= 2) score = 8;
    else if (fillerCount >= 3 && thresholdPayoffs.length >= 1) score = 6;
    else if (thresholdPayoffs.length >= 1) score = 4;

    synergies.push({
      type: 'threshold',
      name: '絶対値 (Threshold)',
      requiredCount: 7,
      currentCount: fillerCount, // Approximate
      enablers: graveyardFillers.map((dc) => dc.card.name).slice(0, 5),
      payoffs: thresholdPayoffs.map((dc) => dc.card.name),
      achievementLikelihood: likelihood,
      score,
    });
  }

  // 5. Descend (8+ cards in graveyard)
  const descendPayoffs = cards.filter((dc) =>
    /descend|fathom/i.test(dc.card.oracle_text || '')
  );

  if (descendPayoffs.length > 0) {
    const fillerCount = graveyardFillers.length;

    let likelihood: 'high' | 'medium' | 'low' = 'low';
    if (fillerCount >= 8) likelihood = 'high';
    else if (fillerCount >= 4) likelihood = 'medium';

    let score = 0;
    if (fillerCount >= 8 && descendPayoffs.length >= 2) score = 8;
    else if (fillerCount >= 4 && descendPayoffs.length >= 1) score = 6;
    else if (descendPayoffs.length >= 1) score = 4;

    synergies.push({
      type: 'descend',
      name: '下降 (Descend)',
      requiredCount: 8,
      currentCount: fillerCount, // Approximate
      enablers: graveyardFillers.map((dc) => dc.card.name).slice(0, 5),
      payoffs: descendPayoffs.map((dc) => dc.card.name),
      achievementLikelihood: likelihood,
      score,
    });
  }

  return synergies;
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
  const thresholdSynergies = detectThresholdSynergies(cards);
  const sacrificeSynergy = detectSacrificeSynergy(cards);
  const manaAccelerationSynergy = detectManaAccelerationSynergy(cards);

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

  // Threshold synergies
  if (thresholdSynergies.length > 0) {
    overallScore += Math.max(...thresholdSynergies.map((ts) => ts.score));
    synergyCount++;
  }

  // Sacrifice synergy
  if (sacrificeSynergy && sacrificeSynergy.score > 0) {
    overallScore += sacrificeSynergy.score;
    synergyCount++;
  }

  // Mana acceleration synergy
  if (manaAccelerationSynergy && manaAccelerationSynergy.score > 0) {
    overallScore += manaAccelerationSynergy.score;
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
    thresholdSynergies,
    sacrificeSynergy,
    manaAccelerationSynergy,
    overallScore: Math.round(finalScore * 10) / 10, // Round to 1 decimal
  };
}
