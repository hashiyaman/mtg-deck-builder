import { exportToArena, exportToMTGO, exportToJSON, getExportFilename } from '../deckExport';
import { Deck } from '@/types/deck';
import { Card } from '@/types/card';

// Mock card data
const createMockCard = (overrides: Partial<Card> = {}): Card => ({
  id: 'test-id',
  oracle_id: 'test-oracle-id',
  name: 'Lightning Bolt',
  mana_cost: '{R}',
  cmc: 1,
  type_line: 'Instant',
  colors: ['R'],
  color_identity: ['R'],
  keywords: [],
  legalities: {
    standard: 'legal',
    modern: 'legal',
    pioneer: 'legal',
    legacy: 'legal',
    vintage: 'legal',
    commander: 'legal',
  },
  set: 'm21',
  set_name: 'Core Set 2021',
  collector_number: '163',
  rarity: 'common',
  prices: {},
  ...overrides,
});

const createMockDeck = (overrides: Partial<Deck> = {}): Deck => ({
  id: 'deck-id',
  name: 'Test Deck',
  format: 'standard',
  mainboard: [],
  sideboard: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
  ...overrides,
});

describe('deckExport', () => {
  describe('exportToArena', () => {
    it('should export deck in Arena format with set codes', () => {
      const deck = createMockDeck({
        mainboard: [
          { card: createMockCard({ name: 'Lightning Bolt', set: 'm21', collector_number: '163' }), quantity: 4 },
          { card: createMockCard({ name: 'Mountain', set: 'm21', collector_number: '274', type_line: 'Basic Land — Mountain' }), quantity: 20 },
        ],
      });

      const result = exportToArena(deck);

      expect(result).toContain('Deck');
      expect(result).toContain('4 Lightning Bolt (M21) 163');
      expect(result).toContain('20 Mountain (M21) 274');
    });

    it('should handle cards without set codes', () => {
      const deck = createMockDeck({
        mainboard: [
          { card: createMockCard({ name: 'Lightning Bolt', set: '', collector_number: '' }), quantity: 4 },
        ],
      });

      const result = exportToArena(deck);

      expect(result).toContain('4 Lightning Bolt');
      expect(result).not.toContain('()'); // Should not have empty parentheses
    });

    it('should include sideboard section', () => {
      const deck = createMockDeck({
        mainboard: [
          { card: createMockCard({ name: 'Lightning Bolt' }), quantity: 4 },
        ],
        sideboard: [
          { card: createMockCard({ name: 'Abrade', set: 'm21', collector_number: '130' }), quantity: 3 },
        ],
      });

      const result = exportToArena(deck);

      expect(result).toContain('Deck');
      expect(result).toContain('Sideboard');
      expect(result).toContain('3 Abrade (M21) 130');
    });

    it('should handle empty deck', () => {
      const deck = createMockDeck();

      const result = exportToArena(deck);

      expect(result).toBe('');
    });
  });

  describe('exportToMTGO', () => {
    it('should export deck in MTGO format without set codes', () => {
      const deck = createMockDeck({
        mainboard: [
          { card: createMockCard({ name: 'Lightning Bolt', set: 'm21', collector_number: '163' }), quantity: 4 },
          { card: createMockCard({ name: 'Mountain', type_line: 'Basic Land — Mountain' }), quantity: 20 },
        ],
      });

      const result = exportToMTGO(deck);

      expect(result).toContain('4 Lightning Bolt');
      expect(result).toContain('20 Mountain');
      expect(result).not.toContain('(M21)'); // No set codes in MTGO format
      expect(result).not.toContain('Deck'); // No section headers in MTGO
    });

    it('should include sideboard with empty line separator', () => {
      const deck = createMockDeck({
        mainboard: [
          { card: createMockCard({ name: 'Lightning Bolt' }), quantity: 4 },
        ],
        sideboard: [
          { card: createMockCard({ name: 'Abrade' }), quantity: 3 },
        ],
      });

      const result = exportToMTGO(deck);

      const lines = result.split('\n');
      expect(lines[0]).toBe('4 Lightning Bolt');
      expect(lines[1]).toBe(''); // Empty line separator
      expect(lines[2]).toBe('3 Abrade');
    });
  });

  describe('exportToJSON', () => {
    it('should export deck as formatted JSON', () => {
      const deck = createMockDeck({
        name: 'Test Deck',
        format: 'modern',
        mainboard: [
          { card: createMockCard({ name: 'Lightning Bolt' }), quantity: 4 },
        ],
      });

      const result = exportToJSON(deck);
      const parsed = JSON.parse(result);

      expect(parsed.name).toBe('Test Deck');
      expect(parsed.format).toBe('modern');
      expect(parsed.mainboard).toHaveLength(1);
      expect(parsed.mainboard[0].quantity).toBe(4);
      expect(parsed.mainboard[0].card.name).toBe('Lightning Bolt');
    });

    it('should preserve all deck properties', () => {
      const now = Date.now();
      const deck = createMockDeck({
        id: 'deck-123',
        name: 'Complete Deck',
        description: 'Test description',
        format: 'commander',
        tags: ['aggro', 'red'],
        createdAt: now,
        updatedAt: now,
      });

      const result = exportToJSON(deck);
      const parsed = JSON.parse(result);

      expect(parsed.id).toBe('deck-123');
      expect(parsed.description).toBe('Test description');
      expect(parsed.tags).toEqual(['aggro', 'red']);
      expect(parsed.createdAt).toBe(now);
    });
  });

  describe('getExportFilename', () => {
    it('should generate filename for Arena format', () => {
      const deck = createMockDeck({ name: 'My Red Deck' });
      const filename = getExportFilename(deck, 'arena');

      expect(filename).toMatch(/My_Red_Deck_arena_\d{4}-\d{2}-\d{2}\.txt/);
    });

    it('should generate filename for MTGO format', () => {
      const deck = createMockDeck({ name: 'Blue Control' });
      const filename = getExportFilename(deck, 'mtgo');

      expect(filename).toMatch(/Blue_Control_mtgo_\d{4}-\d{2}-\d{2}\.txt/);
    });

    it('should generate filename for JSON format', () => {
      const deck = createMockDeck({ name: 'Backup Deck' });
      const filename = getExportFilename(deck, 'json');

      expect(filename).toMatch(/Backup_Deck_\d{4}-\d{2}-\d{2}\.json/);
    });

    it('should sanitize special characters in deck name', () => {
      const deck = createMockDeck({ name: 'Test/Deck: #1 (v2)' });
      const filename = getExportFilename(deck, 'arena');

      expect(filename).toMatch(/TestDeck_1_v2_arena_\d{4}-\d{2}-\d{2}\.txt/);
    });

    it('should replace multiple spaces with single underscore', () => {
      const deck = createMockDeck({ name: 'Deck   With    Spaces' });
      const filename = getExportFilename(deck, 'mtgo');

      expect(filename).toMatch(/Deck_With_Spaces_mtgo_\d{4}-\d{2}-\d{2}\.txt/);
    });
  });
});
