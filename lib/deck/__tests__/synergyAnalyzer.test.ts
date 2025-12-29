import { describe, it, expect } from '@jest/globals';
import {
  detectTribalSynergy,
  detectTokenSynergy,
  detectGraveyardSynergy,
  detectCounterSynergy,
  detectKeywordClusters,
  analyzeDeckSynergies,
} from '../synergyAnalyzer';
import { DeckCard } from '@/types/deck';
import { Card } from '@/types/card';

// Helper to create a mock card
function createMockCard(overrides: Partial<Card> = {}): Card {
  return {
    id: overrides.id || 'test-id',
    name: overrides.name || 'Test Card',
    type_line: overrides.type_line || 'Creature — Human',
    oracle_text: overrides.oracle_text || '',
    mana_cost: overrides.mana_cost || '{1}{W}',
    cmc: overrides.cmc || 2,
    colors: overrides.colors || ['W'],
    color_identity: overrides.color_identity || ['W'],
    keywords: overrides.keywords || [],
    image_uris: overrides.image_uris,
    card_faces: overrides.card_faces,
    set: overrides.set || 'test',
    collector_number: overrides.collector_number || '1',
    rarity: overrides.rarity || 'common',
    prices: overrides.prices || { usd: '0.25' },
    printed_name: overrides.printed_name,
    printed_type_line: overrides.printed_type_line,
  };
}

// Helper to create a DeckCard
function createDeckCard(card: Card, quantity: number = 1): DeckCard {
  return { card, quantity };
}

describe('Synergy Analyzer', () => {
  describe('detectTribalSynergy', () => {
    it('should detect tribal synergy with 8+ creatures of same type', () => {
      const cards: DeckCard[] = [
        createDeckCard(createMockCard({ name: 'Llanowar Elves', type_line: 'Creature — Elf Druid' }), 4),
        createDeckCard(createMockCard({ name: 'Elvish Mystic', type_line: 'Creature — Elf Druid' }), 4),
        createDeckCard(createMockCard({ name: 'Elvish Archdruid', type_line: 'Creature — Elf Druid' }), 3),
      ];

      const result = detectTribalSynergy(cards);

      expect(result.length).toBeGreaterThan(0);
      const elfSynergy = result.find((s) => s.type === 'Elf');
      expect(elfSynergy).toBeDefined();
      expect(elfSynergy?.count).toBe(11);
      expect(elfSynergy?.cards).toHaveLength(3);
      expect(elfSynergy?.score).toBeGreaterThanOrEqual(6);
    });

    it('should handle Japanese creature types', () => {
      const cards: DeckCard[] = [
        createDeckCard(
          createMockCard({
            name: 'エルフの神秘家',
            type_line: 'Creature — Elf Druid',
            printed_type_line: 'クリーチャー — エルフ・ドルイド',
          }),
          4
        ),
        createDeckCard(
          createMockCard({
            name: 'ラノワールのエルフ',
            type_line: 'Creature — Elf Druid',
            printed_type_line: 'クリーチャー — エルフ・ドルイド',
          }),
          4
        ),
      ];

      const result = detectTribalSynergy(cards);

      expect(result.length).toBeGreaterThan(0);
      const elfSynergy = result.find((s) => s.type === 'エルフ');
      expect(elfSynergy).toBeDefined();
      expect(elfSynergy?.count).toBe(8);
    });

    it('should not detect tribal synergy with less than 8 creatures', () => {
      const cards: DeckCard[] = [
        createDeckCard(createMockCard({ name: 'Llanowar Elves', type_line: 'Creature — Elf Druid' }), 3),
        createDeckCard(createMockCard({ name: 'Elvish Mystic', type_line: 'Creature — Elf Druid' }), 3),
      ];

      const result = detectTribalSynergy(cards);

      expect(result).toHaveLength(0);
    });

    it('should assign higher scores for more concentrated tribes', () => {
      const cards: DeckCard[] = [
        createDeckCard(createMockCard({ name: 'Goblin 1', type_line: 'Creature — Goblin' }), 4),
        createDeckCard(createMockCard({ name: 'Goblin 2', type_line: 'Creature — Goblin' }), 4),
        createDeckCard(createMockCard({ name: 'Goblin 3', type_line: 'Creature — Goblin' }), 4),
        createDeckCard(createMockCard({ name: 'Goblin 4', type_line: 'Creature — Goblin' }), 4),
      ];

      const result = detectTribalSynergy(cards);

      const goblinSynergy = result.find((s) => s.type === 'Goblin');
      expect(goblinSynergy?.count).toBe(16);
      expect(goblinSynergy?.score).toBe(10); // Max score for 16+
    });

    it('should ignore non-creature cards', () => {
      const cards: DeckCard[] = [
        createDeckCard(createMockCard({ name: 'Lightning Bolt', type_line: 'Instant' }), 4),
        createDeckCard(createMockCard({ name: 'Mountain', type_line: 'Basic Land — Mountain' }), 20),
      ];

      const result = detectTribalSynergy(cards);

      expect(result).toHaveLength(0);
    });
  });

  describe('detectTokenSynergy', () => {
    it('should detect token producers', () => {
      const cards: DeckCard[] = [
        createDeckCard(
          createMockCard({
            name: 'Raise the Alarm',
            oracle_text: 'Create two 1/1 white Soldier creature tokens.',
          }),
          4
        ),
      ];

      const result = detectTokenSynergy(cards);

      expect(result).not.toBeNull();
      expect(result?.producers).toContain('Raise the Alarm');
      expect(result?.producers).toHaveLength(1);
    });

    it('should detect token payoffs', () => {
      const cards: DeckCard[] = [
        createDeckCard(
          createMockCard({
            name: 'Intangible Virtue',
            oracle_text: 'Creature tokens you control get +1/+1 and have vigilance.',
          })
        ),
      ];

      const result = detectTokenSynergy(cards);

      expect(result).not.toBeNull();
      expect(result?.payoffs).toContain('Intangible Virtue');
    });

    it('should give high score for balanced token strategy', () => {
      const cards: DeckCard[] = [
        createDeckCard(createMockCard({ name: 'Producer 1', oracle_text: 'Create a 1/1 token.' }), 4),
        createDeckCard(createMockCard({ name: 'Producer 2', oracle_text: 'Create two tokens.' }), 4),
        createDeckCard(createMockCard({ name: 'Producer 3', oracle_text: 'Put a token onto the battlefield.' }), 4),
        createDeckCard(
          createMockCard({ name: 'Payoff 1', oracle_text: 'Whenever a creature enters, draw a card.' })
        ),
        createDeckCard(
          createMockCard({
            name: 'Payoff 2',
            oracle_text: 'Sacrifice a creature: Gain 1 life.',
          })
        ),
      ];

      const result = detectTokenSynergy(cards);

      expect(result).not.toBeNull();
      expect(result?.producers).toHaveLength(3);
      expect(result?.payoffs).toHaveLength(2);
      expect(result?.score).toBe(8); // 3+ producers, 2+ payoffs
    });

    it('should return null when no token synergy exists', () => {
      const cards: DeckCard[] = [
        createDeckCard(createMockCard({ name: 'Lightning Bolt', oracle_text: 'Deal 3 damage to any target.' })),
      ];

      const result = detectTokenSynergy(cards);

      expect(result).toBeNull();
    });
  });

  describe('detectGraveyardSynergy', () => {
    it('should detect graveyard fillers', () => {
      const cards: DeckCard[] = [
        createDeckCard(createMockCard({ name: 'Thought Scour', oracle_text: 'Target player mills two cards.' })),
        createDeckCard(
          createMockCard({
            name: 'Faithless Looting',
            oracle_text: 'Draw two cards, then discard two cards.',
          })
        ),
      ];

      const result = detectGraveyardSynergy(cards);

      expect(result).not.toBeNull();
      expect(result?.graveyardFillers).toContain('Thought Scour');
      expect(result?.graveyardFillers).toContain('Faithless Looting');
    });

    it('should detect graveyard payoffs', () => {
      const cards: DeckCard[] = [
        createDeckCard(
          createMockCard({
            name: 'Snapcaster Mage',
            oracle_text: 'When Snapcaster Mage enters, target instant or sorcery card in your graveyard gains flashback.',
          })
        ),
        createDeckCard(
          createMockCard({
            name: 'Delve Spell',
            oracle_text: 'Delve. Draw three cards.',
          })
        ),
      ];

      const result = detectGraveyardSynergy(cards);

      expect(result).not.toBeNull();
      expect(result?.graveyardPayoffs).toContain('Snapcaster Mage');
      expect(result?.graveyardPayoffs).toContain('Delve Spell');
    });

    it('should give high score for balanced graveyard strategy', () => {
      const cards: DeckCard[] = [
        createDeckCard(createMockCard({ name: 'Mill 1', oracle_text: 'Mill 2.' }), 4),
        createDeckCard(createMockCard({ name: 'Mill 2', oracle_text: 'Surveil 2.' }), 4),
        createDeckCard(createMockCard({ name: 'Mill 3', oracle_text: 'Dredge 3.' }), 4),
        createDeckCard(createMockCard({ name: 'Mill 4', oracle_text: 'Discard a card.' }), 4),
        createDeckCard(createMockCard({ name: 'Payoff 1', oracle_text: 'Flashback {3}{U}.' }), 4),
        createDeckCard(createMockCard({ name: 'Payoff 2', oracle_text: 'Delve.' }), 4),
        createDeckCard(createMockCard({ name: 'Payoff 3', oracle_text: 'Escape {2}{W}.' }), 4),
        createDeckCard(createMockCard({ name: 'Payoff 4', oracle_text: 'Return target card from your graveyard.' }), 4),
      ];

      const result = detectGraveyardSynergy(cards);

      expect(result).not.toBeNull();
      expect(result?.graveyardFillers).toHaveLength(4);
      expect(result?.graveyardPayoffs).toHaveLength(4);
      expect(result?.score).toBe(9); // 4+ fillers, 4+ payoffs
    });

    it('should return null when no graveyard synergy exists', () => {
      const cards: DeckCard[] = [
        createDeckCard(createMockCard({ name: 'Lightning Bolt', oracle_text: 'Deal 3 damage.' })),
      ];

      const result = detectGraveyardSynergy(cards);

      expect(result).toBeNull();
    });
  });

  describe('detectCounterSynergy', () => {
    it('should detect +1/+1 counter cards', () => {
      const cards: DeckCard[] = [
        createDeckCard(
          createMockCard({
            name: 'Hardened Scales',
            oracle_text: 'If one or more +1/+1 counters would be put on a creature you control, that many plus one are put on it instead.',
          })
        ),
        createDeckCard(
          createMockCard({
            name: 'Walking Ballista',
            oracle_text: 'Walking Ballista enters with X +1/+1 counters on it.',
          })
        ),
      ];

      const result = detectCounterSynergy(cards);

      expect(result).not.toBeNull();
      expect(result?.counterCards).toContain('Hardened Scales');
      expect(result?.counterCards).toContain('Walking Ballista');
    });

    it('should detect proliferate cards', () => {
      const cards: DeckCard[] = [
        createDeckCard(
          createMockCard({
            name: 'Evolution Sage',
            oracle_text: 'Whenever a land enters under your control, proliferate.',
          })
        ),
      ];

      const result = detectCounterSynergy(cards);

      expect(result).not.toBeNull();
      expect(result?.proliferateCards).toContain('Evolution Sage');
    });

    it('should give high score for counters + proliferate', () => {
      const cards: DeckCard[] = [
        createDeckCard(createMockCard({ name: 'Counter 1', oracle_text: 'Put a +1/+1 counter on target.' }), 4),
        createDeckCard(createMockCard({ name: 'Counter 2', oracle_text: 'Enters with two +1/+1 counters.' }), 4),
        createDeckCard(createMockCard({ name: 'Counter 3', oracle_text: 'Put +1/+1 counters on creatures.' }), 4),
        createDeckCard(createMockCard({ name: 'Counter 4', oracle_text: 'Add +1/+1 counters.' }), 4),
        createDeckCard(createMockCard({ name: 'Counter 5', oracle_text: 'Counters on creatures.' }), 4),
        createDeckCard(createMockCard({ name: 'Counter 6', oracle_text: 'Put a +1/+1 counter.' }), 4),
        createDeckCard(createMockCard({ name: 'Proliferate 1', oracle_text: 'Proliferate.' }), 4),
        createDeckCard(createMockCard({ name: 'Proliferate 2', oracle_text: 'Proliferate twice.' }), 4),
      ];

      const result = detectCounterSynergy(cards);

      expect(result).not.toBeNull();
      expect(result?.counterCards.length).toBeGreaterThanOrEqual(6);
      expect(result?.proliferateCards.length).toBeGreaterThanOrEqual(2);
      expect(result?.score).toBe(9); // 6+ counters, 2+ proliferate
    });

    it('should return null when no counter synergy exists', () => {
      const cards: DeckCard[] = [
        createDeckCard(createMockCard({ name: 'Lightning Bolt', oracle_text: 'Deal 3 damage.' })),
      ];

      const result = detectCounterSynergy(cards);

      expect(result).toBeNull();
    });
  });

  describe('detectKeywordClusters', () => {
    it('should detect keyword clusters with 4+ cards', () => {
      const cards: DeckCard[] = [
        createDeckCard(createMockCard({ name: 'Flyer 1', keywords: ['Flying'] }), 4),
        createDeckCard(createMockCard({ name: 'Flyer 2', keywords: ['Flying'] }), 4),
      ];

      const result = detectKeywordClusters(cards);

      expect(result.length).toBeGreaterThan(0);
      const flyingCluster = result.find((c) => c.keyword === 'Flying');
      expect(flyingCluster).toBeDefined();
      expect(flyingCluster?.count).toBe(8);
      expect(flyingCluster?.cards).toHaveLength(2);
    });

    it('should ignore keywords with less than 4 cards', () => {
      const cards: DeckCard[] = [
        createDeckCard(createMockCard({ name: 'Flyer 1', keywords: ['Flying'] }), 2),
        createDeckCard(createMockCard({ name: 'Flyer 2', keywords: ['Flying'] }), 1),
      ];

      const result = detectKeywordClusters(cards);

      expect(result).toHaveLength(0);
    });

    it('should sort clusters by count', () => {
      const cards: DeckCard[] = [
        createDeckCard(createMockCard({ name: 'Flyer 1', keywords: ['Flying'] }), 4),
        createDeckCard(createMockCard({ name: 'Flyer 2', keywords: ['Flying'] }), 4),
        createDeckCard(createMockCard({ name: 'Trampler 1', keywords: ['Trample'] }), 4),
        createDeckCard(createMockCard({ name: 'Trampler 2', keywords: ['Trample'] }), 4),
        createDeckCard(createMockCard({ name: 'Trampler 3', keywords: ['Trample'] }), 4),
      ];

      const result = detectKeywordClusters(cards);

      expect(result).toHaveLength(2);
      expect(result[0].keyword).toBe('Trample'); // 12 cards
      expect(result[1].keyword).toBe('Flying'); // 8 cards
    });

    it('should ignore unimportant keywords', () => {
      const cards: DeckCard[] = [
        createDeckCard(createMockCard({ name: 'Card 1', keywords: ['Banding'] }), 4),
        createDeckCard(createMockCard({ name: 'Card 2', keywords: ['Banding'] }), 4),
      ];

      const result = detectKeywordClusters(cards);

      expect(result).toHaveLength(0); // Banding not in important keywords list
    });
  });

  describe('analyzeDeckSynergies', () => {
    it('should analyze all synergies and calculate overall score', () => {
      const cards: DeckCard[] = [
        // Tribal synergy (Elves)
        createDeckCard(createMockCard({ name: 'Elf 1', type_line: 'Creature — Elf' }), 4),
        createDeckCard(createMockCard({ name: 'Elf 2', type_line: 'Creature — Elf' }), 4),
        createDeckCard(createMockCard({ name: 'Elf 3', type_line: 'Creature — Elf' }), 4),
        // Token synergy
        createDeckCard(createMockCard({ name: 'Token Producer', oracle_text: 'Create a 1/1 token.' }), 4),
        createDeckCard(
          createMockCard({ name: 'Token Payoff', oracle_text: 'Whenever a creature enters, draw a card.' })
        ),
        // Keywords
        createDeckCard(createMockCard({ name: 'Flyer 1', keywords: ['Flying'] }), 4),
        createDeckCard(createMockCard({ name: 'Flyer 2', keywords: ['Flying'] }), 4),
      ];

      const result = analyzeDeckSynergies(cards);

      expect(result.tribalSynergies.length).toBeGreaterThan(0);
      expect(result.tokenSynergy).not.toBeNull();
      expect(result.keywordClusters.length).toBeGreaterThan(0);
      expect(result.overallScore).toBeGreaterThan(0);
      expect(result.overallScore).toBeLessThanOrEqual(10);
    });

    it('should return default score when no synergies exist', () => {
      const cards: DeckCard[] = [
        createDeckCard(createMockCard({ name: 'Lightning Bolt', oracle_text: 'Deal 3 damage.' })),
        createDeckCard(createMockCard({ name: 'Mountain', type_line: 'Basic Land — Mountain' })),
      ];

      const result = analyzeDeckSynergies(cards);

      expect(result.tribalSynergies).toHaveLength(0);
      expect(result.tokenSynergy).toBeNull();
      expect(result.graveyardSynergy).toBeNull();
      expect(result.counterSynergy).toBeNull();
      expect(result.keywordClusters).toHaveLength(0);
      expect(result.overallScore).toBe(5); // Default score
    });

    it('should cap overall score at 10', () => {
      // Create a deck with maximum synergies
      const cards: DeckCard[] = [
        // Strong tribal (score 10)
        ...Array.from({ length: 16 }, (_, i) =>
          createDeckCard(createMockCard({ name: `Elf ${i}`, type_line: 'Creature — Elf' }), 1)
        ),
        // Strong token synergy (score 8)
        createDeckCard(createMockCard({ name: 'Producer 1', oracle_text: 'Create tokens.' }), 4),
        createDeckCard(createMockCard({ name: 'Producer 2', oracle_text: 'Create tokens.' }), 4),
        createDeckCard(createMockCard({ name: 'Producer 3', oracle_text: 'Create tokens.' }), 4),
        createDeckCard(createMockCard({ name: 'Payoff 1', oracle_text: 'Whenever a creature enters.' }), 4),
        createDeckCard(createMockCard({ name: 'Payoff 2', oracle_text: 'Sacrifice a creature.' }), 4),
      ];

      const result = analyzeDeckSynergies(cards);

      expect(result.overallScore).toBeLessThanOrEqual(10);
    });
  });
});
