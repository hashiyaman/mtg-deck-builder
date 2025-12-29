import { simulateOpeningHands, simulateEarlyGame, simulateKeyCardDrawRate } from '../simulator';
import { Card, DeckCard } from '@/types/deck';

// Helper function to create mock card
const createMockCard = (overrides: Partial<Card>): Card => ({
  id: 'test-id',
  oracle_id: 'test-oracle-id',
  name: 'Test Card',
  type_line: 'Creature',
  cmc: 0,
  color_identity: [],
  keywords: [],
  legalities: {
    standard: 'legal',
    modern: 'legal',
    pioneer: 'legal',
    legacy: 'legal',
    vintage: 'legal',
    commander: 'legal',
  },
  set: 'test',
  set_name: 'Test Set',
  rarity: 'common',
  prices: {},
  ...overrides,
});

// Helper to create deck card
const createDeckCard = (card: Card, quantity: number): DeckCard => ({
  card,
  quantity,
});

describe('simulator', () => {
  describe('simulateOpeningHands', () => {
    it('should run specified number of simulations', () => {
      const plains = createMockCard({
        name: 'Plains',
        type_line: 'Basic Land — Plains',
        produced_mana: ['W'],
      });
      const creature = createMockCard({
        name: 'Savannah Lions',
        type_line: 'Creature — Cat',
        cmc: 1,
        colors: ['W'],
      });

      const mainboard: DeckCard[] = [
        createDeckCard(plains, 24),
        createDeckCard(creature, 36),
      ];

      const stats = simulateOpeningHands(mainboard, 100);
      expect(stats.totalSimulations).toBe(100);
    });

    it('should calculate land distribution', () => {
      const plains = createMockCard({
        name: 'Plains',
        type_line: 'Basic Land — Plains',
        produced_mana: ['W'],
      });
      const creature = createMockCard({
        name: 'Savannah Lions',
        type_line: 'Creature — Cat',
        cmc: 1,
      });

      const mainboard: DeckCard[] = [
        createDeckCard(plains, 24),
        createDeckCard(creature, 36),
      ];

      const stats = simulateOpeningHands(mainboard, 1000);

      // Should have land distribution for 0-7 lands
      expect(Object.keys(stats.landDistribution)).toHaveLength(8);

      // Probabilities should sum to ~100%
      const totalProbability = Object.values(stats.landDistribution).reduce((sum, prob) => sum + prob, 0);
      expect(totalProbability).toBeCloseTo(100, 0);
    });

    it('should calculate average lands in opening hand', () => {
      const plains = createMockCard({
        name: 'Plains',
        type_line: 'Basic Land — Plains',
        produced_mana: ['W'],
      });
      const creature = createMockCard({
        name: 'Savannah Lions',
        type_line: 'Creature — Cat',
        cmc: 1,
      });

      const mainboard: DeckCard[] = [
        createDeckCard(plains, 24),
        createDeckCard(creature, 36),
      ];

      const stats = simulateOpeningHands(mainboard, 1000);

      // With 40% lands (24/60), average should be around 2.8 (7 * 0.4)
      expect(stats.averageLands).toBeGreaterThan(2);
      expect(stats.averageLands).toBeLessThan(4);
    });

    it('should calculate keepable hand rate', () => {
      const plains = createMockCard({
        name: 'Plains',
        type_line: 'Basic Land — Plains',
        produced_mana: ['W'],
      });
      const creature = createMockCard({
        name: 'Savannah Lions',
        type_line: 'Creature — Cat',
        cmc: 1,
      });

      const mainboard: DeckCard[] = [
        createDeckCard(plains, 24),
        createDeckCard(creature, 36),
      ];

      const stats = simulateOpeningHands(mainboard, 1000);

      // Keepable rate should be between 0 and 100
      expect(stats.keepableHandRate).toBeGreaterThanOrEqual(0);
      expect(stats.keepableHandRate).toBeLessThanOrEqual(100);
    });

    it('should calculate color requirements', () => {
      const plains = createMockCard({
        name: 'Plains',
        type_line: 'Basic Land — Plains',
        produced_mana: ['W'],
      });
      const creature = createMockCard({
        name: 'Savannah Lions',
        type_line: 'Creature — Cat',
        cmc: 1,
        colors: ['W'],
      });

      const mainboard: DeckCard[] = [
        createDeckCard(plains, 24),
        createDeckCard(creature, 36),
      ];

      const stats = simulateOpeningHands(mainboard, 1000);

      // Should have W color requirement
      expect(stats.colorRequirements).toHaveProperty('W');
      expect(stats.colorRequirements.W).toBeGreaterThan(0);
      expect(stats.colorRequirements.W).toBeLessThanOrEqual(100);
    });
  });

  describe('simulateEarlyGame', () => {
    it('should calculate playable spells for each turn', () => {
      const plains = createMockCard({
        name: 'Plains',
        type_line: 'Basic Land — Plains',
        produced_mana: ['W'],
      });
      const oneDrop = createMockCard({
        name: '1-drop',
        type_line: 'Creature',
        cmc: 1,
      });
      const twoDrop = createMockCard({
        name: '2-drop',
        type_line: 'Creature',
        cmc: 2,
      });
      const threeDrop = createMockCard({
        name: '3-drop',
        type_line: 'Creature',
        cmc: 3,
      });

      const mainboard: DeckCard[] = [
        createDeckCard(plains, 24),
        createDeckCard(oneDrop, 12),
        createDeckCard(twoDrop, 12),
        createDeckCard(threeDrop, 12),
      ];

      const stats = simulateEarlyGame(mainboard, 1000);

      expect(stats.turn1PlayableSpells).toBeGreaterThanOrEqual(0);
      expect(stats.turn1PlayableSpells).toBeLessThanOrEqual(100);
      expect(stats.turn2PlayableSpells).toBeGreaterThanOrEqual(0);
      expect(stats.turn2PlayableSpells).toBeLessThanOrEqual(100);
      expect(stats.turn3PlayableSpells).toBeGreaterThanOrEqual(0);
      expect(stats.turn3PlayableSpells).toBeLessThanOrEqual(100);
    });

    it('should calculate curve out rate', () => {
      const plains = createMockCard({
        name: 'Plains',
        type_line: 'Basic Land — Plains',
        produced_mana: ['W'],
      });
      const oneDrop = createMockCard({
        name: '1-drop',
        type_line: 'Creature',
        cmc: 1,
      });

      const mainboard: DeckCard[] = [
        createDeckCard(plains, 24),
        createDeckCard(oneDrop, 36),
      ];

      const stats = simulateEarlyGame(mainboard, 1000);

      expect(stats.curveOutRate).toBeGreaterThanOrEqual(0);
      expect(stats.curveOutRate).toBeLessThanOrEqual(100);
    });
  });

  describe('simulateKeyCardDrawRate', () => {
    it('should calculate probability of drawing specific card', () => {
      const plains = createMockCard({
        name: 'Plains',
        type_line: 'Basic Land — Plains',
        produced_mana: ['W'],
      });
      const keyCard = createMockCard({
        name: 'Lightning Bolt',
        type_line: 'Instant',
        cmc: 1,
      });
      const filler = createMockCard({
        name: 'Filler',
        type_line: 'Creature',
        cmc: 2,
      });

      const mainboard: DeckCard[] = [
        createDeckCard(plains, 24),
        createDeckCard(keyCard, 4),
        createDeckCard(filler, 32),
      ];

      const stats = simulateKeyCardDrawRate(mainboard, 'Lightning Bolt', 1000);

      expect(stats.cardName).toBe('Lightning Bolt');
      expect(stats.openingHandRate).toBeGreaterThan(0);
      expect(stats.openingHandRate).toBeLessThanOrEqual(100);
      expect(stats.turn3Rate).toBeGreaterThanOrEqual(stats.openingHandRate);
      expect(stats.turn4Rate).toBeGreaterThanOrEqual(stats.turn3Rate);
    });

    it('should have higher probability for more copies', () => {
      const plains = createMockCard({
        name: 'Plains',
        type_line: 'Basic Land — Plains',
        produced_mana: ['W'],
      });
      const keyCard = createMockCard({
        name: 'Lightning Bolt',
        type_line: 'Instant',
        cmc: 1,
      });
      const filler = createMockCard({
        name: 'Filler',
        type_line: 'Creature',
        cmc: 2,
      });

      // 1 copy
      const mainboard1: DeckCard[] = [
        createDeckCard(plains, 24),
        createDeckCard(keyCard, 1),
        createDeckCard(filler, 35),
      ];

      // 4 copies
      const mainboard4: DeckCard[] = [
        createDeckCard(plains, 24),
        createDeckCard(keyCard, 4),
        createDeckCard(filler, 32),
      ];

      const stats1 = simulateKeyCardDrawRate(mainboard1, 'Lightning Bolt', 1000);
      const stats4 = simulateKeyCardDrawRate(mainboard4, 'Lightning Bolt', 1000);

      expect(stats4.openingHandRate).toBeGreaterThan(stats1.openingHandRate);
      expect(stats4.turn3Rate).toBeGreaterThan(stats1.turn3Rate);
    });
  });
});
