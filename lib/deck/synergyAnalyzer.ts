import { DeckCard } from '@/types/deck';
import { Card } from '@/types/card';

/**
 * Get the display name for a card, preferring the Japanese name if available
 */
function getCardDisplayName(card: Card): string {
  return card.printed_name || card.name;
}

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

export interface SpellslingerSynergy {
  spellTriggers: string[]; // Cards that trigger when casting instants/sorceries
  spellCopiers: string[]; // Cards that copy spells
  spellRecursion: string[]; // Cards that reuse spells from graveyard
  cardAdvantage: string[]; // Cards that draw/generate advantage from spells
  costReduction: string[]; // Cost reduction for instants/sorceries
  instantsAndSorceries: number; // Count of instant/sorcery cards
  score: number; // 1-10
}

export interface AttackTriggerSynergy {
  attackTriggers: string[]; // Cards with attack triggers
  raidCards: string[]; // Cards with Raid mechanic
  enablers: string[]; // Cards that enable attacks (haste, evasion, untap)
  attackers: number; // Count of creatures
  score: number; // 1-10
}

export interface TapUntapSynergy {
  tapAbilities: string[]; // Cards with tap abilities (non-mana)
  untappers: string[]; // Cards that untap permanents
  tapTriggers: string[]; // Cards with tap/untap triggers (Inspired, etc.)
  vigilanceCards: string[]; // Cards with vigilance
  score: number; // 1-10
}

export interface EnchantmentArtifactSynergy {
  enchantmentTriggers: string[]; // Constellation, enchantment ETB triggers
  enchantmentPayoffs: string[]; // Cards that care about enchantments
  artifactTriggers: string[]; // Artifact ETB triggers
  artifactPayoffs: string[]; // Cards that care about artifacts
  enchantmentCount: number; // Total enchantments in deck
  artifactCount: number; // Total artifacts in deck
  score: number; // 1-10
}

export interface LibraryTopSynergy {
  topManipulators: string[]; // Scry, Fateseal, Brainstorm, etc.
  topPayoffs: string[]; // Cards that care about top of library (Miracle, etc.)
  score: number; // 1-10
}

export interface ExileZoneSynergy {
  exilers: string[]; // Cards that exile
  exilePayoffs: string[]; // Cards that care about exile zone
  blinkEffects: string[]; // Temporary exile and return (Blink effects)
  score: number; // 1-10
}

export interface ETBSynergy {
  etbTriggers: string[]; // Cards with "enters the battlefield" triggers
  blinkEffects: string[]; // Temporary exile and return (Flicker effects)
  reanimation: string[]; // Cards that put creatures from graveyard to battlefield
  cheatIntoPlay: string[]; // Cards that put cards into play (Show and Tell, etc.)
  clones: string[]; // Clone effects that copy ETB triggers
  panEffects: string[]; // Creature generators (Tokens, creature spells)
  score: number; // 1-10
}

export interface LandfallSynergy {
  landfallTriggers: string[]; // Cards with landfall triggers
  landRamp: string[]; // Cards that put lands onto battlefield
  extraLandPlays: string[]; // Cards that allow additional land plays
  landCount: number; // Total lands in deck
  score: number; // 1-10
}

export interface EnergySynergy {
  energyProducers: string[]; // Cards that generate energy counters
  energyPayoffs: string[]; // Cards that spend energy counters
  score: number; // 1-10
}

export interface TreasureSynergy {
  treasureProducers: string[]; // Cards that create treasure tokens
  treasurePayoffs: string[]; // Cards that care about artifacts/sacrificing
  score: number; // 1-10
}

export interface StormSynergy {
  stormCards: string[]; // Cards with storm mechanic
  rituals: string[]; // Mana rituals (Dark Ritual, etc.)
  cantrips: string[]; // Cheap card draw spells
  costReduction: string[]; // Cost reduction for spells
  instantsAndSorceries: number; // Count of instant/sorcery cards
  score: number; // 1-10
}

export interface EquipmentAuraSynergy {
  equipments: string[]; // Equipment cards
  auras: string[]; // Aura cards
  equipmentPayoffs: string[]; // Cards that care about equipped creatures
  auraPayoffs: string[]; // Cards that care about enchanted creatures
  equipmentEnablers: string[]; // Cards that reduce equip costs or auto-attach
  hexproofCreatures: string[]; // Hexproof/shroud creatures (good aura targets)
  score: number; // 1-10
}

export interface LifegainSynergy {
  lifegainTriggers: string[]; // Cards that trigger on lifegain
  lifegainSources: string[]; // Cards that gain life
  lifelinkCreatures: string[]; // Creatures with lifelink
  score: number; // 1-10
}

export interface FoodSynergy {
  foodProducers: string[]; // Cards that create food tokens
  foodPayoffs: string[]; // Cards that care about food/artifacts
  sacrificeOutlets: string[]; // Cards that sacrifice artifacts
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
  spellslingerSynergy: SpellslingerSynergy | null;
  attackTriggerSynergy: AttackTriggerSynergy | null;
  tapUntapSynergy: TapUntapSynergy | null;
  enchantmentArtifactSynergy: EnchantmentArtifactSynergy | null;
  libraryTopSynergy: LibraryTopSynergy | null;
  exileZoneSynergy: ExileZoneSynergy | null;
  etbSynergy: ETBSynergy | null;
  landfallSynergy: LandfallSynergy | null;
  energySynergy: EnergySynergy | null;
  treasureSynergy: TreasureSynergy | null;
  stormSynergy: StormSynergy | null;
  equipmentAuraSynergy: EquipmentAuraSynergy | null;
  lifegainSynergy: LifegainSynergy | null;
  foodSynergy: FoodSynergy | null;
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
      const cardName = getCardDisplayName(card);
      if (!existing.cards.includes(cardName)) {
        existing.cards.push(cardName);
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
    const cardName = getCardDisplayName(card);

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
    const cardName = getCardDisplayName(card);

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
    const cardName = getCardDisplayName(card);

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
    const cardName = getCardDisplayName(card);

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
    const cardName = getCardDisplayName(card);

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
    const cardName = getCardDisplayName(card);
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
 * Detects spellslinger synergies (instant/sorcery-focused strategies)
 */
export function detectSpellslingerSynergy(cards: DeckCard[]): SpellslingerSynergy | null {
  const spellTriggers: string[] = [];
  const spellCopiers: string[] = [];
  const spellRecursion: string[] = [];
  const cardAdvantage: string[] = [];
  const costReduction: string[] = [];
  let instantsAndSorceries = 0;

  // Spell trigger patterns (cast instant/sorcery triggers)
  const spellTriggerPatterns = [
    /whenever you cast an instant or sorcery/i,
    /whenever you cast.*instant.*sorcery/i,
    /whenever you cast a noncreature spell/i,
    /whenever you cast.*noncreature/i,
    /prowess/i, // Prowess is a spell trigger mechanic
  ];

  // Spell copy patterns
  const spellCopyPatterns = [
    /copy.*instant.*sorcery/i,
    /copy target.*spell/i,
    /copy.*instant spell/i,
    /copy.*sorcery spell/i,
    /storm/i, // Storm copies spells
    /fork|twincast|reverberate/i,
  ];

  // Spell recursion patterns (cast from graveyard, flashback, etc.)
  const spellRecursionPatterns = [
    /flashback/i,
    /cast.*from.*graveyard/i,
    /cast.*instant.*sorcery.*from.*graveyard/i,
    /you may cast.*from.*graveyard/i,
    /snapcaster|past in flames|mission briefing/i,
  ];

  // Card advantage patterns (draw when casting spells)
  const cardAdvantagePatterns = [
    /whenever you cast.*instant.*draw/i,
    /whenever you cast.*sorcery.*draw/i,
    /whenever you cast.*noncreature.*draw/i,
    /whenever you cast.*spell.*draw/i,
    /archmage emeritus|niv-mizzet|izzet chemister/i,
  ];

  // Cost reduction patterns (for instants/sorceries)
  const costReductionPatterns = [
    /instant.*sorcery.*cost.*less/i,
    /instant.*sorcery.*cost.*{[0-9]}.*less/i,
    /noncreature.*cost.*less/i,
    /goblin electromancer|baral|jace's sanctum/i,
  ];

  cards.forEach(({ card, quantity }) => {
    const oracleText = card.oracle_text || '';
    const cardName = getCardDisplayName(card);
    const typeLine = card.type_line.toLowerCase();
    const keywords = card.keywords || [];

    // Count instant/sorcery cards
    if (typeLine.includes('instant') || typeLine.includes('sorcery')) {
      instantsAndSorceries += quantity;
    }

    // Check for spell triggers
    if (spellTriggerPatterns.some((pattern) => pattern.test(oracleText)) ||
        keywords.some((kw) => kw.toLowerCase() === 'prowess')) {
      if (!spellTriggers.includes(cardName)) {
        spellTriggers.push(cardName);
      }
    }

    // Check for spell copiers
    if (spellCopyPatterns.some((pattern) => pattern.test(oracleText)) ||
        keywords.some((kw) => kw.toLowerCase() === 'storm')) {
      if (!spellCopiers.includes(cardName)) {
        spellCopiers.push(cardName);
      }
    }

    // Check for spell recursion
    if (spellRecursionPatterns.some((pattern) => pattern.test(oracleText)) ||
        keywords.some((kw) => kw.toLowerCase() === 'flashback')) {
      if (!spellRecursion.includes(cardName)) {
        spellRecursion.push(cardName);
      }
    }

    // Check for card advantage
    if (cardAdvantagePatterns.some((pattern) => pattern.test(oracleText))) {
      if (!cardAdvantage.includes(cardName)) {
        cardAdvantage.push(cardName);
      }
    }

    // Check for cost reduction
    if (costReductionPatterns.some((pattern) => pattern.test(oracleText))) {
      if (!costReduction.includes(cardName)) {
        costReduction.push(cardName);
      }
    }
  });

  // Total enablers (cards that care about spells)
  const totalEnablers = spellTriggers.length + spellCopiers.length +
                       spellRecursion.length + cardAdvantage.length +
                       costReduction.length;

  // Need at least some enablers AND a decent number of instants/sorceries
  if (totalEnablers === 0 || instantsAndSorceries < 8) {
    return null;
  }

  // Count number of different synergy types present
  const synergyTypes = (spellTriggers.length > 0 ? 1 : 0) +
                      (spellCopiers.length > 0 ? 1 : 0) +
                      (spellRecursion.length > 0 ? 1 : 0) +
                      (cardAdvantage.length > 0 ? 1 : 0) +
                      (costReduction.length > 0 ? 1 : 0);

  // Scoring based on spell density, enablers, and diversity
  let score = 0;

  if (totalEnablers >= 8 && instantsAndSorceries >= 20 && synergyTypes >= 4) {
    score = 9; // Dedicated spellslinger deck
  } else if ((totalEnablers >= 6 && instantsAndSorceries >= 18 && synergyTypes >= 3) ||
             (totalEnablers >= 8 && instantsAndSorceries >= 15)) {
    score = 8; // Strong spellslinger strategy
  } else if ((totalEnablers >= 5 && instantsAndSorceries >= 15 && synergyTypes >= 3) ||
             (totalEnablers >= 6 && instantsAndSorceries >= 12)) {
    score = 7; // Good spellslinger synergy
  } else if ((totalEnablers >= 4 && instantsAndSorceries >= 12) ||
             (totalEnablers >= 5 && instantsAndSorceries >= 10)) {
    score = 6; // Moderate spellslinger
  } else if (totalEnablers >= 3 && instantsAndSorceries >= 10) {
    score = 5; // Light spellslinger
  } else {
    score = 4; // Minimal spellslinger
  }

  return {
    spellTriggers,
    spellCopiers,
    spellRecursion,
    cardAdvantage,
    costReduction,
    instantsAndSorceries,
    score,
  };
}

/**
 * Detects attack trigger synergies (attack triggers, raid, combat-matters)
 */
export function detectAttackTriggerSynergy(cards: DeckCard[]): AttackTriggerSynergy | null {
  const attackTriggers: string[] = [];
  const raidCards: string[] = [];
  const enablers: string[] = [];
  let attackers = 0;

  // Attack trigger patterns (whenever attacks, when attacks, etc.)
  const attackTriggerPatterns = [
    /whenever.*attacks/i,
    /when.*attacks/i,
    /whenever.*creature.*attacks/i,
    /whenever.*attack/i,
    /battle cry/i,
  ];

  // Raid mechanic patterns
  const raidPatterns = [
    /raid/i,
    /if you attacked/i,
  ];

  // Attack enabler patterns (haste, can't be blocked, evasion, untap attackers)
  const enablerPatterns = [
    /haste/i,
    /can't be blocked/i,
    /unblockable/i,
    /untap.*creature/i,
    /untap all creatures/i,
    /vigilance/i,
    /extra combat/i,
    /additional combat/i,
  ];

  // Evasion keywords that enable attacks
  const evasionKeywords = ['Flying', 'Menace', 'Trample', 'Unblockable', 'Shadow', 'Horsemanship', 'Fear', 'Intimidate'];

  cards.forEach(({ card, quantity }) => {
    const oracleText = card.oracle_text || '';
    const cardName = getCardDisplayName(card);
    const typeLine = card.type_line.toLowerCase();
    const keywords = card.keywords || [];

    // Count creatures
    if (typeLine.includes('creature')) {
      attackers += quantity;
    }

    // Check for attack triggers
    if (attackTriggerPatterns.some((pattern) => pattern.test(oracleText))) {
      if (!attackTriggers.includes(cardName)) {
        attackTriggers.push(cardName);
      }
    }

    // Check for Raid
    if (raidPatterns.some((pattern) => pattern.test(oracleText))) {
      if (!raidCards.includes(cardName)) {
        raidCards.push(cardName);
      }
    }

    // Check for enablers
    if (enablerPatterns.some((pattern) => pattern.test(oracleText)) ||
        keywords.some((kw) => evasionKeywords.includes(kw) || kw.toLowerCase() === 'haste' || kw.toLowerCase() === 'vigilance')) {
      if (!enablers.includes(cardName)) {
        enablers.push(cardName);
      }
    }
  });

  // Total trigger cards (attack triggers + raid)
  const totalTriggers = attackTriggers.length + raidCards.length;

  // Need at least some triggers AND a decent number of attackers
  if (totalTriggers === 0 || attackers < 10) {
    return null;
  }

  // Scoring based on trigger density, creature count, and enablers
  let score = 0;

  if (totalTriggers >= 8 && attackers >= 20 && enablers.length >= 6) {
    score = 9; // Dedicated attack-matters deck
  } else if ((totalTriggers >= 6 && attackers >= 18 && enablers.length >= 4) ||
             (totalTriggers >= 8 && attackers >= 15)) {
    score = 8; // Strong attack strategy
  } else if ((totalTriggers >= 5 && attackers >= 15 && enablers.length >= 3) ||
             (totalTriggers >= 6 && attackers >= 12)) {
    score = 7; // Good attack synergy
  } else if ((totalTriggers >= 4 && attackers >= 12) ||
             (totalTriggers >= 5 && attackers >= 10)) {
    score = 6; // Moderate attack theme
  } else if (totalTriggers >= 3 && attackers >= 10) {
    score = 5; // Light attack theme
  } else {
    score = 4; // Minimal attack synergy
  }

  return {
    attackTriggers,
    raidCards,
    enablers,
    attackers,
    score,
  };
}

/**
 * Detects tap/untap synergies (tap abilities, untappers, tap triggers)
 */
export function detectTapUntapSynergy(cards: DeckCard[]): TapUntapSynergy | null {
  const tapAbilities: string[] = [];
  const untappers: string[] = [];
  const tapTriggers: string[] = [];
  const vigilanceCards: string[] = [];

  // Tap ability patterns (non-mana abilities)
  const tapAbilityPatterns = [
    /{T}:(?!.*add)/i, // {T}: but not "add mana"
    /\{T\}.*draw/i,
    /\{T\}.*deal.*damage/i,
    /\{T\}.*destroy/i,
    /\{T\}.*exile/i,
    /\{T\}.*search/i,
    /\{T\}.*return/i,
    /\{T\}.*create/i,
    /\{T\}.*put/i,
    /\{T\}.*counter/i,
    /\{T\}.*gain/i,
    /\{T\}.*target/i,
    /tap.*creature.*:/i, // "Tap an untapped creature:", "Tap target creature:"
    /tap.*permanent.*:/i, // "Tap an untapped permanent:"
    /tap.*wizard.*:/i, // "Tap a Wizard:", "Tap an untapped Wizard:"
    /tap.*artifact.*:/i, // "Tap an artifact:"
  ];

  // Untap patterns
  const untapPatterns = [
    /untap.*permanent/i,
    /untap.*creature/i,
    /untap.*artifact/i,
    /untap all/i,
    /untap target/i,
    /untap.*you control/i,
    /doesn't untap/i, // Also relevant for untap synergies
  ];

  // Tap trigger patterns (Inspired, etc.)
  const tapTriggerPatterns = [
    /whenever.*becomes tapped/i,
    /when.*becomes tapped/i,
    /whenever.*taps/i,
    /when.*taps/i,
    /inspired/i, // Inspired mechanic
    /whenever.*becomes untapped/i,
    /when.*becomes untapped/i,
  ];

  for (const deckCard of cards) {
    const card = deckCard.card;
    const oracle = card.oracle_text || '';
    const name = getCardDisplayName(card);

    // Check for tap abilities (excluding pure mana abilities)
    const hasTapAbility = tapAbilityPatterns.some((pattern) => pattern.test(oracle));
    if (hasTapAbility && !tapAbilities.includes(name)) {
      tapAbilities.push(name);
    }

    // Check for untap effects
    const hasUntapEffect = untapPatterns.some((pattern) => pattern.test(oracle));
    if (hasUntapEffect && !untappers.includes(name)) {
      untappers.push(name);
    }

    // Check for tap triggers
    const hasTapTrigger = tapTriggerPatterns.some((pattern) => pattern.test(oracle));
    if (hasTapTrigger && !tapTriggers.includes(name)) {
      tapTriggers.push(name);
    }

    // Check for vigilance
    const hasVigilance = card.keywords?.includes('Vigilance') || /vigilance/i.test(oracle);
    if (hasVigilance && card.type_line?.includes('Creature') && !vigilanceCards.includes(name)) {
      vigilanceCards.push(name);
    }
  }

  // Calculate total tap matters cards
  const totalTapMatters = tapAbilities.length + tapTriggers.length;
  const totalEnablers = untappers.length + vigilanceCards.length;

  // Require at least 4 tap-matters cards and 2 enablers for synergy
  if (totalTapMatters < 4 || totalEnablers < 2) {
    return null;
  }

  // Calculate score (1-10)
  let score = 4; // Base score

  // Synergy diversity bonus
  const synergyTypes = [
    tapAbilities.length > 0,
    untappers.length > 0,
    tapTriggers.length > 0,
    vigilanceCards.length > 0,
  ].filter(Boolean).length;

  if (synergyTypes >= 4) {
    score += 1; // All synergy types present
  }

  // Score based on tap-matters cards
  if (tapAbilities.length >= 8 && untappers.length >= 4 && tapTriggers.length >= 2) {
    score = 9; // Dedicated tap/untap deck
  } else if (tapAbilities.length >= 6 && (untappers.length >= 3 || tapTriggers.length >= 2)) {
    score = 8; // Strong tap/untap theme
  } else if (tapAbilities.length >= 5 && totalEnablers >= 4) {
    score = 7; // Solid tap/untap synergy
  } else if (totalTapMatters >= 6 && totalEnablers >= 3) {
    score = 6; // Moderate tap/untap theme
  } else if (totalTapMatters >= 4 && totalEnablers >= 2) {
    score = 5; // Light tap/untap theme
  }

  return {
    tapAbilities,
    untappers,
    tapTriggers,
    vigilanceCards,
    score,
  };
}

/**
 * Detects enchantment/artifact theme synergies
 */
export function detectEnchantmentArtifactSynergy(cards: DeckCard[]): EnchantmentArtifactSynergy | null {
  const enchantmentTriggers: string[] = [];
  const enchantmentPayoffs: string[] = [];
  const artifactTriggers: string[] = [];
  const artifactPayoffs: string[] = [];
  let enchantmentCount = 0;
  let artifactCount = 0;

  // Enchantment trigger patterns (Constellation, etc.)
  const enchantmentTriggerPatterns = [
    /constellation/i, // Constellation mechanic
    /whenever.*enchantment.*enters/i,
    /when.*enchantment.*enters/i,
    /whenever you cast an enchantment/i,
    /when you cast an enchantment/i,
  ];

  // Enchantment payoff patterns
  const enchantmentPayoffPatterns = [
    /enchantment you control/i,
    /number of enchantments/i,
    /each enchantment/i,
    /for each enchantment/i,
    /enchantments you control/i,
  ];

  // Artifact trigger patterns
  const artifactTriggerPatterns = [
    /whenever.*artifact.*enters/i,
    /when.*artifact.*enters/i,
    /whenever you cast an artifact/i,
    /when you cast an artifact/i,
  ];

  // Artifact payoff patterns
  const artifactPayoffPatterns = [
    /artifact you control/i,
    /number of artifacts/i,
    /each artifact/i,
    /for each artifact/i,
    /artifacts you control/i,
    /affinity for artifacts/i,
    /improvise/i, // Improvise mechanic
  ];

  for (const deckCard of cards) {
    const card = deckCard.card;
    const oracle = card.oracle_text || '';
    const name = getCardDisplayName(card);
    const typeLine = card.type_line || '';

    // Count enchantments and artifacts
    if (typeLine.includes('Enchantment')) {
      enchantmentCount += deckCard.quantity;
    }
    if (typeLine.includes('Artifact')) {
      artifactCount += deckCard.quantity;
    }

    // Check for enchantment triggers
    const hasEnchantmentTrigger = enchantmentTriggerPatterns.some((pattern) => pattern.test(oracle));
    if (hasEnchantmentTrigger && !enchantmentTriggers.includes(name)) {
      enchantmentTriggers.push(name);
    }

    // Check for enchantment payoffs
    const hasEnchantmentPayoff = enchantmentPayoffPatterns.some((pattern) => pattern.test(oracle));
    if (hasEnchantmentPayoff && !enchantmentPayoffs.includes(name)) {
      enchantmentPayoffs.push(name);
    }

    // Check for artifact triggers
    const hasArtifactTrigger = artifactTriggerPatterns.some((pattern) => pattern.test(oracle));
    if (hasArtifactTrigger && !artifactTriggers.includes(name)) {
      artifactTriggers.push(name);
    }

    // Check for artifact payoffs
    const hasArtifactPayoff = artifactPayoffPatterns.some((pattern) => pattern.test(oracle));
    if (hasArtifactPayoff && !artifactPayoffs.includes(name)) {
      artifactPayoffs.push(name);
    }
  }

  // Total synergy cards
  const totalEnchantmentSynergy = enchantmentTriggers.length + enchantmentPayoffs.length;
  const totalArtifactSynergy = artifactTriggers.length + artifactPayoffs.length;

  // Require at least 6 enchantments OR 6 artifacts, AND 2+ synergy cards
  if ((enchantmentCount < 6 && artifactCount < 6) || (totalEnchantmentSynergy + totalArtifactSynergy < 2)) {
    return null;
  }

  // Calculate score (1-10)
  let score = 4; // Base score

  // Enchantment theme scoring
  if (enchantmentCount >= 15 && totalEnchantmentSynergy >= 5) {
    score = Math.max(score, 9); // Dedicated enchantment deck
  } else if (enchantmentCount >= 12 && totalEnchantmentSynergy >= 4) {
    score = Math.max(score, 8); // Strong enchantment theme
  } else if (enchantmentCount >= 10 && totalEnchantmentSynergy >= 3) {
    score = Math.max(score, 7); // Solid enchantment synergy
  } else if (enchantmentCount >= 8 && totalEnchantmentSynergy >= 2) {
    score = Math.max(score, 6); // Moderate enchantment theme
  } else if (enchantmentCount >= 6 && totalEnchantmentSynergy >= 1) {
    score = Math.max(score, 5); // Light enchantment theme
  }

  // Artifact theme scoring
  if (artifactCount >= 15 && totalArtifactSynergy >= 5) {
    score = Math.max(score, 9); // Dedicated artifact deck
  } else if (artifactCount >= 12 && totalArtifactSynergy >= 4) {
    score = Math.max(score, 8); // Strong artifact theme
  } else if (artifactCount >= 10 && totalArtifactSynergy >= 3) {
    score = Math.max(score, 7); // Solid artifact synergy
  } else if (artifactCount >= 8 && totalArtifactSynergy >= 2) {
    score = Math.max(score, 6); // Moderate artifact theme
  } else if (artifactCount >= 6 && totalArtifactSynergy >= 1) {
    score = Math.max(score, 5); // Light artifact theme
  }

  // Bonus for having both themes
  if (enchantmentCount >= 8 && artifactCount >= 8 && totalEnchantmentSynergy >= 2 && totalArtifactSynergy >= 2) {
    score = Math.min(10, score + 1); // Bonus for dual theme
  }

  return {
    enchantmentTriggers,
    enchantmentPayoffs,
    artifactTriggers,
    artifactPayoffs,
    enchantmentCount,
    artifactCount,
    score,
  };
}

/**
 * Detects library top manipulation synergies
 */
export function detectLibraryTopSynergy(cards: DeckCard[]): LibraryTopSynergy | null {
  const topManipulators: string[] = [];
  const topPayoffs: string[] = [];

  // Top manipulation patterns
  const manipulatorPatterns = [
    /\bscry\b/i, // Scry mechanic
    /\bfateseal\b/i, // Fateseal mechanic
    /\bbrainstorm\b/i, // Brainstorm effect
    /put.*on top of.*library/i, // Put on top of library
    /look at the top.*card/i, // Look at top cards
    /reveal the top.*card/i, // Reveal top cards
    /top.*library.*hand/i, // Top to hand effects
    /rearrange.*top/i, // Rearrange top cards
  ];

  // Top payoff patterns (cards that care about top of library)
  const payoffPatterns = [
    /\bmiracle\b/i, // Miracle mechanic
    /top card of.*library/i, // Reference to top card
    /top of.*library/i, // Reference to top of library
    /reveal.*top/i, // Reveal top (if not already counted as manipulator)
    /play.*top.*library/i, // Play from top of library
    /cast.*top.*library/i, // Cast from top of library
  ];

  for (const deckCard of cards) {
    const card = deckCard.card;
    const oracle = card.oracle_text || '';
    const name = getCardDisplayName(card);

    // Check for top manipulators
    const isManipulator = manipulatorPatterns.some((pattern) => pattern.test(oracle));
    if (isManipulator && !topManipulators.includes(name)) {
      topManipulators.push(name);
    }

    // Check for top payoffs
    const isPayoff = payoffPatterns.some((pattern) => pattern.test(oracle));
    if (isPayoff && !topPayoffs.includes(name)) {
      topPayoffs.push(name);
    }
  }

  // Require at least 3 manipulators OR 2 payoffs
  if (topManipulators.length < 3 && topPayoffs.length < 2) {
    return null;
  }

  // Calculate score (1-10)
  let score = 4; // Base score

  const totalSynergy = topManipulators.length + topPayoffs.length;

  if (topManipulators.length >= 8 && topPayoffs.length >= 4) {
    score = 9; // Dedicated library manipulation deck
  } else if (topManipulators.length >= 6 && topPayoffs.length >= 3) {
    score = 8; // Strong library manipulation theme
  } else if (topManipulators.length >= 5 && topPayoffs.length >= 2) {
    score = 7; // Solid library manipulation synergy
  } else if (topManipulators.length >= 4 && topPayoffs.length >= 2) {
    score = 6; // Moderate library manipulation
  } else if (totalSynergy >= 4) {
    score = 5; // Light library manipulation theme
  }

  return {
    topManipulators,
    topPayoffs,
    score,
  };
}

/**
 * Detects exile zone synergies
 */
export function detectExileZoneSynergy(cards: DeckCard[]): ExileZoneSynergy | null {
  const exilers: string[] = [];
  const exilePayoffs: string[] = [];
  const blinkEffects: string[] = [];

  // Exile patterns (general exile effects)
  const exilePatterns = [
    /\bexile\b/i, // Cards that exile
  ];

  // Exile payoff patterns (cards that care about exile zone)
  const payoffPatterns = [
    /\badventure\b/i, // Adventure mechanic
    /\bforetell\b/i, // Foretell mechanic
    /\bescape\b/i, // Escape mechanic
    /exile.*you own/i, // Cards that care about exiling cards you own
    /exile.*opponent/i, // Cards that care about opponent's exile
    /from exile/i, // Cards that care about exile zone
    /exiled.*card/i, // Cards that reference exiled cards
  ];

  // Blink effect patterns (temporary exile and return)
  const blinkPatterns = [
    /exile.*until.*end.*turn/i, // Temporary exile until end of turn
    /exile.*return.*battlefield/i, // Exile and return to battlefield
    /flicker/i, // Flicker effects
    /blink/i, // Blink effects (colloquial term)
  ];

  for (const deckCard of cards) {
    const card = deckCard.card;
    const oracle = card.oracle_text || '';
    const name = getCardDisplayName(card);

    // Check for blink effects first (more specific)
    const hasBlink = blinkPatterns.some((pattern) => pattern.test(oracle));
    if (hasBlink && !blinkEffects.includes(name)) {
      blinkEffects.push(name);
      continue; // Don't count as general exiler
    }

    // Check for exile payoffs
    const hasPayoff = payoffPatterns.some((pattern) => pattern.test(oracle));
    if (hasPayoff && !exilePayoffs.includes(name)) {
      exilePayoffs.push(name);
    }

    // Check for general exile effects
    const hasExile = exilePatterns.some((pattern) => pattern.test(oracle));
    if (hasExile && !exilers.includes(name) && !blinkEffects.includes(name)) {
      exilers.push(name);
    }
  }

  // Total synergy cards
  const totalSynergy = exilers.length + exilePayoffs.length + blinkEffects.length;

  // Require at least 3 exile-related cards OR 2+ blink effects with ETB creatures
  if (totalSynergy < 3 && blinkEffects.length < 2) {
    return null;
  }

  // Calculate score (1-10)
  let score = 4; // Base score

  // Blink synergy scoring (focused strategy)
  if (blinkEffects.length >= 4) {
    score = Math.max(score, 8); // Strong blink theme
  } else if (blinkEffects.length >= 3) {
    score = Math.max(score, 7); // Solid blink synergy
  } else if (blinkEffects.length >= 2) {
    score = Math.max(score, 6); // Moderate blink theme
  }

  // Exile matters scoring
  if (exilePayoffs.length >= 8) {
    score = Math.max(score, 9); // Dedicated exile matters deck
  } else if (exilePayoffs.length >= 6) {
    score = Math.max(score, 8); // Strong exile theme
  } else if (exilePayoffs.length >= 4) {
    score = Math.max(score, 7); // Solid exile synergy
  } else if (exilePayoffs.length >= 2) {
    score = Math.max(score, 6); // Moderate exile theme
  }

  // General exile effects (removal-based)
  if (exilers.length >= 10) {
    score = Math.max(score, 6); // Exile-heavy control
  } else if (exilers.length >= 6) {
    score = Math.max(score, 5); // Moderate exile usage
  }

  return {
    exilers,
    exilePayoffs,
    blinkEffects,
    score,
  };
}

/**
 * Detects ETB (Enter the Battlefield) synergies
 * Looks for ETB triggers and cards that enable reusing them (blink, reanimate, etc.)
 */
export function detectETBSynergy(cards: DeckCard[]): ETBSynergy | null {
  const etbTriggers: string[] = [];
  const blinkEffects: string[] = [];
  const reanimation: string[] = [];
  const cheatIntoPlay: string[] = [];
  const clones: string[] = [];
  const panEffects: string[] = [];

  // ETB trigger patterns
  const etbPatterns = [
    /when.*enters.*battlefield/i,
    /enters.*battlefield.*trigger/i,
    /enters.*battlefield.*you/i,
    /when.*enters/i,
  ];

  // Blink effect patterns (temporary exile and return)
  const blinkPatterns = [
    /exile.*until.*end.*turn/i, // Temporary exile until end of turn
    /exile.*return.*battlefield/i, // Exile and return to battlefield
    /exile.*return.*at.*beginning/i, // Exile and return at beginning
    /flicker/i, // Flicker effects
    /blink/i, // Blink effects (colloquial term)
    /exile.*return.*under/i, // Exile and return under control
  ];

  // Reanimation patterns (graveyard to battlefield)
  const reanimationPatterns = [
    /return.*creature.*from.*graveyard.*battlefield/i,
    /return.*graveyard.*battlefield/i,
    /put.*creature.*from.*graveyard.*battlefield/i,
    /reanimate/i,
    /unearth/i,
    /return.*target.*creature.*battlefield/i,
  ];

  // Cheat into play patterns (put cards directly into play)
  const cheatPatterns = [
    /put.*onto.*battlefield/i,
    /put.*into.*play/i,
    /show and tell/i,
    /sneak attack/i,
    /through the breach/i,
    /aether vial/i,
  ];

  // Clone patterns (copy creatures, usually getting ETB triggers)
  const clonePatterns = [
    /copy.*creature/i,
    /clone/i,
    /may have.*copy/i,
    /enter.*copy/i,
    /as a copy/i,
  ];

  // Pan effects (repeatedly create creatures/permanents)
  const panPatterns = [
    /create.*token/i,
    /put.*token.*onto.*battlefield/i,
  ];

  for (const deckCard of cards) {
    const card = deckCard.card;
    const oracle = card.oracle_text || '';
    const name = getCardDisplayName(card);
    const typeLine = card.type_line.toLowerCase();

    // Check for ETB triggers
    const hasETB = etbPatterns.some((pattern) => pattern.test(oracle));
    if (hasETB && !etbTriggers.includes(name)) {
      etbTriggers.push(name);
    }

    // Check for blink effects
    const hasBlink = blinkPatterns.some((pattern) => pattern.test(oracle));
    if (hasBlink && !blinkEffects.includes(name)) {
      blinkEffects.push(name);
    }

    // Check for reanimation
    const hasReanimate = reanimationPatterns.some((pattern) => pattern.test(oracle));
    if (hasReanimate && !reanimation.includes(name)) {
      reanimation.push(name);
    }

    // Check for cheat into play
    const hasCheat = cheatPatterns.some((pattern) => pattern.test(oracle));
    if (hasCheat && !cheatIntoPlay.includes(name)) {
      cheatIntoPlay.push(name);
    }

    // Check for clones
    const hasClone = clonePatterns.some((pattern) => pattern.test(oracle));
    if (hasClone && !clones.includes(name)) {
      clones.push(name);
    }

    // Check for pan effects (creature generators)
    const hasPan = panPatterns.some((pattern) => pattern.test(oracle));
    if (hasPan && !panEffects.includes(name)) {
      panEffects.push(name);
    }
  }

  // Total enablers (cards that reuse ETB triggers)
  const totalEnablers = blinkEffects.length + reanimation.length +
                       cheatIntoPlay.length + clones.length;

  // Require at least 3 ETB triggers AND at least 2 enablers
  if (etbTriggers.length < 3 || totalEnablers < 2) {
    return null;
  }

  // Calculate score (1-10)
  let score = 4; // Base score

  // Strong ETB-focused deck
  if (etbTriggers.length >= 12 && totalEnablers >= 6) {
    score = 9; // Dedicated ETB deck
  } else if (etbTriggers.length >= 10 && totalEnablers >= 5) {
    score = 8; // Strong ETB strategy
  } else if (etbTriggers.length >= 8 && totalEnablers >= 4) {
    score = 7; // Solid ETB synergy
  } else if (etbTriggers.length >= 6 && totalEnablers >= 3) {
    score = 6; // Moderate ETB theme
  } else if (etbTriggers.length >= 4 && totalEnablers >= 2) {
    score = 5; // Light ETB synergy
  }

  // Bonus for blink-heavy strategies (repeatable ETB abuse)
  if (blinkEffects.length >= 4 && etbTriggers.length >= 6) {
    score = Math.max(score, 8); // Dedicated blink deck
  } else if (blinkEffects.length >= 3 && etbTriggers.length >= 4) {
    score = Math.max(score, 7); // Strong blink synergy
  }

  // Bonus for reanimator strategies
  if (reanimation.length >= 4 && etbTriggers.length >= 6) {
    score = Math.max(score, 8); // Dedicated reanimator
  } else if (reanimation.length >= 3 && etbTriggers.length >= 4) {
    score = Math.max(score, 7); // Strong reanimator
  }

  return {
    etbTriggers,
    blinkEffects,
    reanimation,
    cheatIntoPlay,
    clones,
    panEffects,
    score,
  };
}

/**
 * Detects Landfall synergies (triggers when lands enter the battlefield)
 */
export function detectLandfallSynergy(cards: DeckCard[]): LandfallSynergy | null {
  const landfallTriggers: string[] = [];
  const landRamp: string[] = [];
  const extraLandPlays: string[] = [];
  let landCount = 0;

  // Landfall trigger patterns
  const landfallPatterns = [
    /landfall/i,
    /whenever.*land enters/i,
    /when.*land enters/i,
    /whenever.*land.*battlefield/i,
  ];

  // Land ramp patterns (put lands onto battlefield)
  const rampPatterns = [
    /search.*library.*land.*battlefield/i,
    /put.*land.*battlefield/i,
    /rampant growth/i,
    /cultivate/i,
    /kodama's reach/i,
  ];

  // Extra land play patterns
  const extraLandPatterns = [
    /play.*additional.*land/i,
    /play.*extra.*land/i,
    /play.*more.*land/i,
    /land.*each turn/i,
  ];

  cards.forEach(({ card, quantity }) => {
    const oracle = card.oracle_text || '';
    const name = getCardDisplayName(card);
    const typeLine = card.type_line.toLowerCase();

    // Count lands
    if (typeLine.includes('land')) {
      landCount += quantity;
    }

    // Check for landfall triggers
    if (landfallPatterns.some((pattern) => pattern.test(oracle))) {
      if (!landfallTriggers.includes(name)) {
        landfallTriggers.push(name);
      }
    }

    // Check for land ramp
    if (rampPatterns.some((pattern) => pattern.test(oracle))) {
      if (!landRamp.includes(name)) {
        landRamp.push(name);
      }
    }

    // Check for extra land plays
    if (extraLandPatterns.some((pattern) => pattern.test(oracle))) {
      if (!extraLandPlays.includes(name)) {
        extraLandPlays.push(name);
      }
    }
  });

  // Require at least 2 landfall triggers OR (1 trigger + 3+ enablers)
  const totalEnablers = landRamp.length + extraLandPlays.length;
  if (landfallTriggers.length < 1 || (landfallTriggers.length < 2 && totalEnablers < 3)) {
    return null;
  }

  // Calculate score
  let score = 4;

  if (landfallTriggers.length >= 8 && totalEnablers >= 6) {
    score = 9; // Dedicated landfall deck
  } else if (landfallTriggers.length >= 6 && totalEnablers >= 5) {
    score = 8;
  } else if (landfallTriggers.length >= 4 && totalEnablers >= 4) {
    score = 7;
  } else if (landfallTriggers.length >= 3 && totalEnablers >= 3) {
    score = 6;
  } else if (landfallTriggers.length >= 2) {
    score = 5;
  }

  return {
    landfallTriggers,
    landRamp,
    extraLandPlays,
    landCount,
    score,
  };
}

/**
 * Detects Energy counter synergies
 */
export function detectEnergySynergy(cards: DeckCard[]): EnergySynergy | null {
  const energyProducers: string[] = [];
  const energyPayoffs: string[] = [];

  cards.forEach(({ card }) => {
    const oracle = card.oracle_text || '';
    const name = getCardDisplayName(card);

    // Check for energy production
    if (/get.*energy counter/i.test(oracle) || /energy counter.*you/i.test(oracle)) {
      if (!energyProducers.includes(name)) {
        energyProducers.push(name);
      }
    }

    // Check for energy spending
    if (/pay.*{e}/i.test(oracle) || /spend.*energy/i.test(oracle)) {
      if (!energyPayoffs.includes(name)) {
        energyPayoffs.push(name);
      }
    }
  });

  // Require at least 3 energy producers AND 2 payoffs
  if (energyProducers.length < 3 || energyPayoffs.length < 2) {
    return null;
  }

  let score = 5;
  if (energyProducers.length >= 10 && energyPayoffs.length >= 6) {
    score = 9;
  } else if (energyProducers.length >= 8 && energyPayoffs.length >= 5) {
    score = 8;
  } else if (energyProducers.length >= 6 && energyPayoffs.length >= 4) {
    score = 7;
  } else if (energyProducers.length >= 5 && energyPayoffs.length >= 3) {
    score = 6;
  }

  return {
    energyProducers,
    energyPayoffs,
    score,
  };
}

/**
 * Detects Treasure token synergies
 */
export function detectTreasureSynergy(cards: DeckCard[]): TreasureSynergy | null {
  const treasureProducers: string[] = [];
  const treasurePayoffs: string[] = [];

  cards.forEach(({ card }) => {
    const oracle = card.oracle_text || '';
    const name = getCardDisplayName(card);

    // Check for treasure production
    if (/create.*treasure/i.test(oracle) || /treasure token/i.test(oracle)) {
      if (!treasureProducers.includes(name)) {
        treasureProducers.push(name);
      }
    }

    // Check for treasure/artifact payoffs (cards that care about artifacts or sacrifice)
    if (/whenever.*artifact/i.test(oracle) ||
        /sacrifice.*artifact/i.test(oracle) ||
        /artifact.*enter/i.test(oracle)) {
      if (!treasurePayoffs.includes(name)) {
        treasurePayoffs.push(name);
      }
    }
  });

  // Require at least 3 treasure producers
  if (treasureProducers.length < 3) {
    return null;
  }

  let score = 5;
  if (treasureProducers.length >= 8 && treasurePayoffs.length >= 4) {
    score = 8;
  } else if (treasureProducers.length >= 6 && treasurePayoffs.length >= 3) {
    score = 7;
  } else if (treasureProducers.length >= 5) {
    score = 6;
  }

  return {
    treasureProducers,
    treasurePayoffs,
    score,
  };
}

/**
 * Detects Storm/spell chain synergies
 */
export function detectStormSynergy(cards: DeckCard[]): StormSynergy | null {
  const stormCards: string[] = [];
  const rituals: string[] = [];
  const cantrips: string[] = [];
  const costReduction: string[] = [];
  let instantsAndSorceries = 0;

  // Ritual patterns (cards that generate mana)
  const ritualPatterns = [
    /add.*{r}{r}{r}/i,
    /add.*{b}{b}{b}/i,
    /dark ritual/i,
    /desperate ritual/i,
    /pyretic ritual/i,
    /seething song/i,
  ];

  // Cantrip patterns (cheap draw spells)
  const cantripPatterns = [
    /draw.*card/i,
  ];

  // Cost reduction patterns
  const costReductionPatterns = [
    /cost.*less/i,
    /reduce.*cost/i,
    /this spell costs/i,
  ];

  cards.forEach(({ card, quantity }) => {
    const oracle = card.oracle_text || '';
    const name = getCardDisplayName(card);
    const typeLine = card.type_line.toLowerCase();
    const keywords = card.keywords || [];
    const cmc = card.cmc || 0;

    // Count instants and sorceries
    if (typeLine.includes('instant') || typeLine.includes('sorcery')) {
      instantsAndSorceries += quantity;
    }

    // Check for storm mechanic
    if (keywords.some((kw) => kw.toLowerCase() === 'storm')) {
      if (!stormCards.includes(name)) {
        stormCards.push(name);
      }
    }

    // Check for rituals
    if (ritualPatterns.some((pattern) => pattern.test(oracle)) ||
        (typeLine.includes('instant') || typeLine.includes('sorcery')) && /add.*mana/i.test(oracle)) {
      if (!rituals.includes(name)) {
        rituals.push(name);
      }
    }

    // Check for cantrips (cheap card draw)
    if (cmc <= 2 && (typeLine.includes('instant') || typeLine.includes('sorcery')) &&
        cantripPatterns.some((pattern) => pattern.test(oracle))) {
      if (!cantrips.includes(name)) {
        cantrips.push(name);
      }
    }

    // Check for cost reduction
    if (costReductionPatterns.some((pattern) => pattern.test(oracle))) {
      if (!costReduction.includes(name)) {
        costReduction.push(name);
      }
    }
  });

  // Require storm cards OR very high spell density
  if (stormCards.length === 0 && instantsAndSorceries < 25) {
    return null;
  }

  let score = 5;
  if (stormCards.length >= 2 && rituals.length >= 4 && cantrips.length >= 8) {
    score = 9; // Dedicated storm deck
  } else if (stormCards.length >= 1 && rituals.length >= 3 && cantrips.length >= 6) {
    score = 8;
  } else if (stormCards.length >= 1 && (rituals.length >= 2 || cantrips.length >= 5)) {
    score = 7;
  } else if (stormCards.length >= 1) {
    score = 6;
  }

  return {
    stormCards,
    rituals,
    cantrips,
    costReduction,
    instantsAndSorceries,
    score,
  };
}

/**
 * Detects Equipment and Aura synergies (Voltron/Bogles strategy)
 */
export function detectEquipmentAuraSynergy(cards: DeckCard[]): EquipmentAuraSynergy | null {
  const equipments: string[] = [];
  const auras: string[] = [];
  const equipmentPayoffs: string[] = [];
  const auraPayoffs: string[] = [];
  const equipmentEnablers: string[] = [];
  const hexproofCreatures: string[] = [];

  cards.forEach(({ card }) => {
    const oracle = card.oracle_text || '';
    const name = getCardDisplayName(card);
    const typeLine = card.type_line.toLowerCase();
    const keywords = card.keywords || [];

    // Check for equipment
    if (typeLine.includes('equipment')) {
      equipments.push(name);
    }

    // Check for auras
    if (typeLine.includes('enchantment') && typeLine.includes('aura')) {
      auras.push(name);
    }

    // Check for equipment payoffs
    if (/whenever.*equipped/i.test(oracle) || /equipped creature/i.test(oracle)) {
      if (!equipmentPayoffs.includes(name)) {
        equipmentPayoffs.push(name);
      }
    }

    // Check for aura payoffs
    if (/whenever.*enchanted/i.test(oracle) || /enchanted creature/i.test(oracle)) {
      if (!auraPayoffs.includes(name)) {
        auraPayoffs.push(name);
      }
    }

    // Check for equipment enablers (reduce equip cost, auto-attach)
    if (/equip.*costs.*less/i.test(oracle) ||
        /auto-attach/i.test(oracle) ||
        /when.*enters.*attach/i.test(oracle)) {
      if (!equipmentEnablers.includes(name)) {
        equipmentEnablers.push(name);
      }
    }

    // Check for hexproof/shroud creatures (good targets)
    if (typeLine.includes('creature') &&
        (keywords.some((kw) => /hexproof|shroud/i.test(kw)) ||
         /hexproof|shroud/i.test(oracle))) {
      hexproofCreatures.push(name);
    }
  });

  // Require at least 4 equipment OR 4 auras
  if (equipments.length < 4 && auras.length < 4) {
    return null;
  }

  let score = 5;
  const total = equipments.length + auras.length;
  const enablers = equipmentEnablers.length + hexproofCreatures.length;

  if (total >= 12 && enablers >= 4) {
    score = 9; // Dedicated voltron deck
  } else if (total >= 10 && enablers >= 3) {
    score = 8;
  } else if (total >= 8 && enablers >= 2) {
    score = 7;
  } else if (total >= 6) {
    score = 6;
  }

  return {
    equipments,
    auras,
    equipmentPayoffs,
    auraPayoffs,
    equipmentEnablers,
    hexproofCreatures,
    score,
  };
}

/**
 * Detects Lifegain synergies (Soul Sisters strategy)
 */
export function detectLifegainSynergy(cards: DeckCard[]): LifegainSynergy | null {
  const lifegainTriggers: string[] = [];
  const lifegainSources: string[] = [];
  const lifelinkCreatures: string[] = [];

  cards.forEach(({ card }) => {
    const oracle = card.oracle_text || '';
    const name = getCardDisplayName(card);
    const typeLine = card.type_line.toLowerCase();
    const keywords = card.keywords || [];

    // Check for lifegain triggers
    if (/whenever.*gain.*life/i.test(oracle) || /when.*gain.*life/i.test(oracle)) {
      if (!lifegainTriggers.includes(name)) {
        lifegainTriggers.push(name);
      }
    }

    // Check for lifegain sources
    if (/you gain.*life/i.test(oracle) || /gain.*life/i.test(oracle)) {
      if (!lifegainSources.includes(name)) {
        lifegainSources.push(name);
      }
    }

    // Check for lifelink creatures
    if (typeLine.includes('creature') &&
        (keywords.some((kw) => kw.toLowerCase() === 'lifelink') ||
         /lifelink/i.test(oracle))) {
      lifelinkCreatures.push(name);
    }
  });

  // Require at least 3 triggers AND 4 sources
  if (lifegainTriggers.length < 3 || (lifegainSources.length + lifelinkCreatures.length) < 4) {
    return null;
  }

  let score = 5;
  const totalSources = lifegainSources.length + lifelinkCreatures.length;

  if (lifegainTriggers.length >= 6 && totalSources >= 10) {
    score = 9;
  } else if (lifegainTriggers.length >= 5 && totalSources >= 8) {
    score = 8;
  } else if (lifegainTriggers.length >= 4 && totalSources >= 6) {
    score = 7;
  } else if (lifegainTriggers.length >= 3 && totalSources >= 5) {
    score = 6;
  }

  return {
    lifegainTriggers,
    lifegainSources,
    lifelinkCreatures,
    score,
  };
}

/**
 * Detects Food token synergies
 */
export function detectFoodSynergy(cards: DeckCard[]): FoodSynergy | null {
  const foodProducers: string[] = [];
  const foodPayoffs: string[] = [];
  const sacrificeOutlets: string[] = [];

  cards.forEach(({ card }) => {
    const oracle = card.oracle_text || '';
    const name = getCardDisplayName(card);

    // Check for food production
    if (/create.*food/i.test(oracle) || /food token/i.test(oracle)) {
      if (!foodProducers.includes(name)) {
        foodProducers.push(name);
      }
    }

    // Check for food payoffs
    if (/whenever.*food/i.test(oracle) || /sacrifice.*food/i.test(oracle)) {
      if (!foodPayoffs.includes(name)) {
        foodPayoffs.push(name);
      }
    }

    // Check for sacrifice outlets (artifacts)
    if (/sacrifice.*artifact/i.test(oracle)) {
      if (!sacrificeOutlets.includes(name)) {
        sacrificeOutlets.push(name);
      }
    }
  });

  // Require at least 4 food producers
  if (foodProducers.length < 4) {
    return null;
  }

  let score = 5;
  if (foodProducers.length >= 8 && (foodPayoffs.length + sacrificeOutlets.length) >= 4) {
    score = 8;
  } else if (foodProducers.length >= 6 && (foodPayoffs.length + sacrificeOutlets.length) >= 3) {
    score = 7;
  } else if (foodProducers.length >= 5) {
    score = 6;
  }

  return {
    foodProducers,
    foodPayoffs,
    sacrificeOutlets,
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
        enablers: artifacts.map((dc) => getCardDisplayName(dc.card)),
        payoffs: metalcraftPayoffs.map((dc) => getCardDisplayName(dc.card)),
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
        enablers: graveyardFillers.map((dc) => getCardDisplayName(dc.card)).slice(0, 5),
        payoffs: deliriumPayoffs.map((dc) => getCardDisplayName(dc.card)),
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
        enablers: domainEnablers.map((dc) => getCardDisplayName(dc.card)).slice(0, 5),
        payoffs: domainPayoffs.map((dc) => getCardDisplayName(dc.card)),
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
      enablers: graveyardFillers.map((dc) => getCardDisplayName(dc.card)).slice(0, 5),
      payoffs: thresholdPayoffs.map((dc) => getCardDisplayName(dc.card)),
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
      enablers: graveyardFillers.map((dc) => getCardDisplayName(dc.card)).slice(0, 5),
      payoffs: descendPayoffs.map((dc) => getCardDisplayName(dc.card)),
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
            const cardAName = getCardDisplayName(patternA.card.card);
            const cardBName = getCardDisplayName(patternB.card.card);
            const description = `${cardAName} produces ${outputA}, triggering ${cardBName}, which produces ${outputB}, triggering ${cardAName}`;

            // Calculate score based on quantities and loop strength
            let score = 6; // Base score for any feedback loop
            const totalQuantity = patternA.card.quantity + patternB.card.quantity;
            if (totalQuantity >= 8) score = 9; // High density
            else if (totalQuantity >= 6) score = 8;
            else if (totalQuantity >= 4) score = 7;

            loops.push({
              loopType,
              cardA: cardAName,
              cardB: cardBName,
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
 * Card-level synergy information
 */
export interface CardSynergyInfo {
  cardName: string;
  synergies: {
    type: string; // e.g., "token_producer", "graveyard_filler", etc.
    category: string; // e.g., "Token Synergy", "Graveyard Synergy"
    role: string; // e.g., "Producer", "Payoff", "Enabler"
    description: string;
  }[];
  relatedCards: string[]; // Names of cards this synergizes with
  synergyScore: number; // Overall synergy contribution (1-10)
}

/**
 * Analyzes a single card's synergies within the deck context
 */
export function analyzeCardSynergies(
  card: Card,
  allCards: DeckCard[],
  deckSynergies: SynergyAnalysis
): CardSynergyInfo {
  const cardName = getCardDisplayName(card);
  const synergies: CardSynergyInfo['synergies'] = [];
  const relatedCards: Set<string> = new Set();
  let synergyScore = 0;

  const oracle = (card.oracle_text || '').toLowerCase();
  const typeLine = card.type_line.toLowerCase();

  // Check tribal synergies
  deckSynergies.tribalSynergies.forEach((tribal) => {
    if (tribal.cards.includes(cardName)) {
      synergies.push({
        type: 'tribal',
        category: '部族シナジー',
        role: tribal.type,
        description: `${tribal.type}部族の一員として貢献（${tribal.count}枚中）`,
      });
      tribal.cards.forEach((c) => c !== cardName && relatedCards.add(c));
      synergyScore += tribal.score / tribal.count;
    }
  });

  // Check token synergies
  if (deckSynergies.tokenSynergy) {
    if (deckSynergies.tokenSynergy.producers.includes(cardName)) {
      synergies.push({
        type: 'token_producer',
        category: 'トークンシナジー',
        role: '生成',
        description: 'トークンを生成し、トークン活用カードと相性が良い',
      });
      deckSynergies.tokenSynergy.payoffs.forEach((c) => relatedCards.add(c));
      synergyScore += deckSynergies.tokenSynergy.score / 2;
    }
    if (deckSynergies.tokenSynergy.payoffs.includes(cardName)) {
      synergies.push({
        type: 'token_payoff',
        category: 'トークンシナジー',
        role: '活用',
        description: 'トークンを活用し、トークン生成カードと相性が良い',
      });
      deckSynergies.tokenSynergy.producers.forEach((c) => relatedCards.add(c));
      synergyScore += deckSynergies.tokenSynergy.score / 2;
    }
  }

  // Check graveyard synergies
  if (deckSynergies.graveyardSynergy) {
    if (deckSynergies.graveyardSynergy.graveyardFillers.includes(cardName)) {
      synergies.push({
        type: 'graveyard_filler',
        category: '墓地シナジー',
        role: '墓地肥やし',
        description: '墓地にカードを送り、墓地利用カードと相性が良い',
      });
      deckSynergies.graveyardSynergy.graveyardPayoffs.forEach((c) => relatedCards.add(c));
      synergyScore += deckSynergies.graveyardSynergy.score / 2;
    }
    if (deckSynergies.graveyardSynergy.graveyardPayoffs.includes(cardName)) {
      synergies.push({
        type: 'graveyard_payoff',
        category: '墓地シナジー',
        role: '墓地利用',
        description: '墓地のカードを活用し、墓地肥やしカードと相性が良い',
      });
      deckSynergies.graveyardSynergy.graveyardFillers.forEach((c) => relatedCards.add(c));
      synergyScore += deckSynergies.graveyardSynergy.score / 2;
    }
  }

  // Check counter synergies
  if (deckSynergies.counterSynergy) {
    if (deckSynergies.counterSynergy.counterCards.includes(cardName)) {
      synergies.push({
        type: 'counter_card',
        category: '+1/+1カウンターシナジー',
        role: 'カウンター',
        description: '+1/+1カウンターを置き、増殖カードと相性が良い',
      });
      deckSynergies.counterSynergy.proliferateCards.forEach((c) => relatedCards.add(c));
      synergyScore += deckSynergies.counterSynergy.score / 2;
    }
    if (deckSynergies.counterSynergy.proliferateCards.includes(cardName)) {
      synergies.push({
        type: 'proliferate',
        category: '+1/+1カウンターシナジー',
        role: '増殖',
        description: 'カウンターを増殖し、カウンターカードと相性が良い',
      });
      deckSynergies.counterSynergy.counterCards.forEach((c) => relatedCards.add(c));
      synergyScore += deckSynergies.counterSynergy.score / 2;
    }
  }

  // Check feedback loops
  deckSynergies.feedbackLoops.forEach((loop) => {
    if (loop.cardA === cardName || loop.cardB === cardName) {
      const partner = loop.cardA === cardName ? loop.cardB : loop.cardA;
      synergies.push({
        type: 'feedback_loop',
        category: 'フィードバックループ',
        role: '相互増幅',
        description: `${partner}と相互に増幅する強力なコンボ`,
      });
      relatedCards.add(partner);
      synergyScore += loop.score;
    }
  });

  // Check sacrifice synergies
  if (deckSynergies.sacrificeSynergy) {
    if (deckSynergies.sacrificeSynergy.outlets.includes(cardName)) {
      synergies.push({
        type: 'sacrifice_outlet',
        category: '生け贄シナジー',
        role: '生け贄先',
        description: 'パーマネントを生け贄に捧げ、生け贄要員・死亡誘発カードと相性が良い',
      });
      deckSynergies.sacrificeSynergy.fodder.forEach((c) => relatedCards.add(c));
      deckSynergies.sacrificeSynergy.payoffs.forEach((c) => relatedCards.add(c));
      synergyScore += deckSynergies.sacrificeSynergy.score / 3;
    }
    if (deckSynergies.sacrificeSynergy.fodder.includes(cardName)) {
      synergies.push({
        type: 'sacrifice_fodder',
        category: '生け贄シナジー',
        role: '生け贄要員',
        description: '生け贄に適しており、生け贄先カードと相性が良い',
      });
      deckSynergies.sacrificeSynergy.outlets.forEach((c) => relatedCards.add(c));
      synergyScore += deckSynergies.sacrificeSynergy.score / 3;
    }
    if (deckSynergies.sacrificeSynergy.payoffs.includes(cardName)) {
      synergies.push({
        type: 'death_trigger',
        category: '生け贄シナジー',
        role: '死亡誘発',
        description: 'クリーチャーの死亡で誘発し、生け贄戦略の核となる',
      });
      deckSynergies.sacrificeSynergy.outlets.forEach((c) => relatedCards.add(c));
      deckSynergies.sacrificeSynergy.fodder.forEach((c) => relatedCards.add(c));
      synergyScore += deckSynergies.sacrificeSynergy.score / 3;
    }
  }

  // Check mana acceleration synergies
  if (deckSynergies.manaAccelerationSynergy) {
    const isRampCard =
      deckSynergies.manaAccelerationSynergy.manaCreatures.includes(cardName) ||
      deckSynergies.manaAccelerationSynergy.manaArtifacts.includes(cardName) ||
      deckSynergies.manaAccelerationSynergy.landRamp.includes(cardName) ||
      deckSynergies.manaAccelerationSynergy.extraLandPlays.includes(cardName) ||
      deckSynergies.manaAccelerationSynergy.costReduction.includes(cardName);

    if (isRampCard) {
      synergies.push({
        type: 'mana_acceleration',
        category: 'マナ加速シナジー',
        role: 'ランプ',
        description: 'マナを加速し、高マナ域カードを早期展開できる',
      });
      deckSynergies.manaAccelerationSynergy.payoffs.forEach((c) => relatedCards.add(c));
      synergyScore += deckSynergies.manaAccelerationSynergy.score / 2;
    }
    if (deckSynergies.manaAccelerationSynergy.payoffs.includes(cardName)) {
      synergies.push({
        type: 'mana_payoff',
        category: 'マナ加速シナジー',
        role: '高マナ域',
        description: 'マナ加速により早期展開可能な強力なカード',
      });
      synergyScore += deckSynergies.manaAccelerationSynergy.score / 2;
    }
  }

  // Check spellslinger synergies
  if (deckSynergies.spellslingerSynergy) {
    const isInstantOrSorcery = typeLine.includes('instant') || typeLine.includes('sorcery');
    const isTrigger = deckSynergies.spellslingerSynergy.spellTriggers.includes(cardName);
    const isCopier = deckSynergies.spellslingerSynergy.spellCopiers.includes(cardName);

    if (isTrigger || isCopier) {
      synergies.push({
        type: 'spellslinger_enabler',
        category: 'スペルスリンガー',
        role: isCopier ? '呪文コピー' : '呪文誘発',
        description: 'インスタント・ソーサリーから追加の価値を得る',
      });
      synergyScore += deckSynergies.spellslingerSynergy.score / 2;
    }
    if (isInstantOrSorcery) {
      synergies.push({
        type: 'spell',
        category: 'スペルスリンガー',
        role: '呪文',
        description: '呪文誘発カードや呪文コピーカードと相性が良い',
      });
      deckSynergies.spellslingerSynergy.spellTriggers.forEach((c) => relatedCards.add(c));
      deckSynergies.spellslingerSynergy.spellCopiers.forEach((c) => relatedCards.add(c));
      synergyScore += deckSynergies.spellslingerSynergy.score / 2;
    }
  }

  // Check attack trigger synergies
  if (deckSynergies.attackTriggerSynergy) {
    if (deckSynergies.attackTriggerSynergy.attackTriggers.includes(cardName)) {
      synergies.push({
        type: 'attack_trigger',
        category: '攻撃トリガー',
        role: '攻撃誘発',
        description: '攻撃時に誘発し、攻撃補助カードと相性が良い',
      });
      deckSynergies.attackTriggerSynergy.enablers.forEach((c) => relatedCards.add(c));
      synergyScore += deckSynergies.attackTriggerSynergy.score / 2;
    }
    if (deckSynergies.attackTriggerSynergy.enablers.includes(cardName)) {
      synergies.push({
        type: 'attack_enabler',
        category: '攻撃トリガー',
        role: '攻撃補助',
        description: '攻撃を容易にし、攻撃トリガーカードと相性が良い',
      });
      deckSynergies.attackTriggerSynergy.attackTriggers.forEach((c) => relatedCards.add(c));
      synergyScore += deckSynergies.attackTriggerSynergy.score / 2;
    }
  }

  // Check tap/untap synergies
  if (deckSynergies.tapUntapSynergy) {
    if (deckSynergies.tapUntapSynergy.tapAbilities.includes(cardName)) {
      synergies.push({
        type: 'tap_ability',
        category: 'タップ/アンタップ',
        role: 'タップ能力',
        description: 'タップ能力を持ち、アンタップカードと相性が良い',
      });
      deckSynergies.tapUntapSynergy.untappers.forEach((c) => relatedCards.add(c));
      synergyScore += deckSynergies.tapUntapSynergy.score / 2;
    }
    if (deckSynergies.tapUntapSynergy.untappers.includes(cardName)) {
      synergies.push({
        type: 'untapper',
        category: 'タップ/アンタップ',
        role: 'アンタップ',
        description: 'パーマネントをアンタップし、タップ能力カードと相性が良い',
      });
      deckSynergies.tapUntapSynergy.tapAbilities.forEach((c) => relatedCards.add(c));
      synergyScore += deckSynergies.tapUntapSynergy.score / 2;
    }
  }

  // Check ETB synergies
  if (deckSynergies.etbSynergy) {
    if (deckSynergies.etbSynergy.etbTriggers.includes(cardName)) {
      synergies.push({
        type: 'etb_trigger',
        category: 'ETBシナジー',
        role: 'ETBトリガー',
        description: '戦場に出た時の能力を持ち、ブリンク・リアニメイトと相性が良い',
      });
      deckSynergies.etbSynergy.blinkEffects.forEach((c) => relatedCards.add(c));
      deckSynergies.etbSynergy.reanimation.forEach((c) => relatedCards.add(c));
      deckSynergies.etbSynergy.clones.forEach((c) => relatedCards.add(c));
      synergyScore += deckSynergies.etbSynergy.score / 2;
    }
    if (deckSynergies.etbSynergy.blinkEffects.includes(cardName)) {
      synergies.push({
        type: 'blink',
        category: 'ETBシナジー',
        role: 'ブリンク',
        description: 'クリーチャーを一時除外して戻し、ETBトリガーを再利用',
      });
      deckSynergies.etbSynergy.etbTriggers.forEach((c) => relatedCards.add(c));
      synergyScore += deckSynergies.etbSynergy.score / 2;
    }
    if (deckSynergies.etbSynergy.reanimation.includes(cardName)) {
      synergies.push({
        type: 'reanimate',
        category: 'ETBシナジー',
        role: 'リアニメイト',
        description: '墓地からクリーチャーを戦場に出し、ETBトリガーを活用',
      });
      deckSynergies.etbSynergy.etbTriggers.forEach((c) => relatedCards.add(c));
      synergyScore += deckSynergies.etbSynergy.score / 2;
    }
    if (deckSynergies.etbSynergy.cheatIntoPlay.includes(cardName)) {
      synergies.push({
        type: 'cheat',
        category: 'ETBシナジー',
        role: '直接戦場へ',
        description: 'カードを直接戦場に出し、ETBトリガーを活用',
      });
      deckSynergies.etbSynergy.etbTriggers.forEach((c) => relatedCards.add(c));
      synergyScore += deckSynergies.etbSynergy.score / 2;
    }
    if (deckSynergies.etbSynergy.clones.includes(cardName)) {
      synergies.push({
        type: 'clone',
        category: 'ETBシナジー',
        role: 'クローン',
        description: 'クリーチャーをコピーし、ETBトリガーを再現',
      });
      deckSynergies.etbSynergy.etbTriggers.forEach((c) => relatedCards.add(c));
      synergyScore += deckSynergies.etbSynergy.score / 2;
    }
  }

  // Cap synergy score at 10
  synergyScore = Math.min(10, synergyScore);

  return {
    cardName,
    synergies,
    relatedCards: Array.from(relatedCards),
    synergyScore: Math.round(synergyScore * 10) / 10,
  };
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
  const spellslingerSynergy = detectSpellslingerSynergy(cards);
  const attackTriggerSynergy = detectAttackTriggerSynergy(cards);
  const tapUntapSynergy = detectTapUntapSynergy(cards);
  const enchantmentArtifactSynergy = detectEnchantmentArtifactSynergy(cards);
  const libraryTopSynergy = detectLibraryTopSynergy(cards);
  const exileZoneSynergy = detectExileZoneSynergy(cards);
  const etbSynergy = detectETBSynergy(cards);
  const landfallSynergy = detectLandfallSynergy(cards);
  const energySynergy = detectEnergySynergy(cards);
  const treasureSynergy = detectTreasureSynergy(cards);
  const stormSynergy = detectStormSynergy(cards);
  const equipmentAuraSynergy = detectEquipmentAuraSynergy(cards);
  const lifegainSynergy = detectLifegainSynergy(cards);
  const foodSynergy = detectFoodSynergy(cards);

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

  // Spellslinger synergy
  if (spellslingerSynergy && spellslingerSynergy.score > 0) {
    overallScore += spellslingerSynergy.score;
    synergyCount++;
  }

  // Attack trigger synergy
  if (attackTriggerSynergy && attackTriggerSynergy.score > 0) {
    overallScore += attackTriggerSynergy.score;
    synergyCount++;
  }

  // Tap/untap synergy
  if (tapUntapSynergy && tapUntapSynergy.score > 0) {
    overallScore += tapUntapSynergy.score;
    synergyCount++;
  }

  // Enchantment/artifact synergy
  if (enchantmentArtifactSynergy && enchantmentArtifactSynergy.score > 0) {
    overallScore += enchantmentArtifactSynergy.score;
    synergyCount++;
  }

  // Library top synergy
  if (libraryTopSynergy && libraryTopSynergy.score > 0) {
    overallScore += libraryTopSynergy.score;
    synergyCount++;
  }

  // Exile zone synergy
  if (exileZoneSynergy && exileZoneSynergy.score > 0) {
    overallScore += exileZoneSynergy.score;
    synergyCount++;
  }

  // ETB synergy
  if (etbSynergy && etbSynergy.score > 0) {
    overallScore += etbSynergy.score;
    synergyCount++;
  }

  // Landfall synergy
  if (landfallSynergy && landfallSynergy.score > 0) {
    overallScore += landfallSynergy.score;
    synergyCount++;
  }

  // Energy synergy
  if (energySynergy && energySynergy.score > 0) {
    overallScore += energySynergy.score;
    synergyCount++;
  }

  // Treasure synergy
  if (treasureSynergy && treasureSynergy.score > 0) {
    overallScore += treasureSynergy.score;
    synergyCount++;
  }

  // Storm synergy
  if (stormSynergy && stormSynergy.score > 0) {
    overallScore += stormSynergy.score;
    synergyCount++;
  }

  // Equipment/Aura synergy
  if (equipmentAuraSynergy && equipmentAuraSynergy.score > 0) {
    overallScore += equipmentAuraSynergy.score;
    synergyCount++;
  }

  // Lifegain synergy
  if (lifegainSynergy && lifegainSynergy.score > 0) {
    overallScore += lifegainSynergy.score;
    synergyCount++;
  }

  // Food synergy
  if (foodSynergy && foodSynergy.score > 0) {
    overallScore += foodSynergy.score;
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
    spellslingerSynergy,
    attackTriggerSynergy,
    tapUntapSynergy,
    enchantmentArtifactSynergy,
    libraryTopSynergy,
    exileZoneSynergy,
    etbSynergy,
    landfallSynergy,
    energySynergy,
    treasureSynergy,
    stormSynergy,
    equipmentAuraSynergy,
    lifegainSynergy,
    foodSynergy,
    overallScore: Math.round(finalScore * 10) / 10, // Round to 1 decimal
  };
}
