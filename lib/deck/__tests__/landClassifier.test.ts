import { classifyLand, isAvailableOnTurn1 } from '../landClassifier';
import { Card } from '@/types/card';

// Helper function to create mock card
const createMockCard = (overrides: Partial<Card>): Card => ({
  id: 'test-id',
  oracle_id: 'test-oracle-id',
  name: 'Test Card',
  type_line: 'Land',
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

describe('landClassifier', () => {
  describe('classifyLand', () => {
    it('should classify basic lands as untapped', () => {
      const plains = createMockCard({
        name: 'Plains',
        type_line: 'Basic Land — Plains',
        produced_mana: ['W'],
      });

      const result = classifyLand(plains);
      expect(result.category).toBe('untapped');
      expect(result.reason).toBe('Basic land');
    });

    it('should classify tapped lands with "enters the battlefield tapped"', () => {
      const temple = createMockCard({
        name: 'Temple of Mystery',
        type_line: 'Land',
        oracle_text: 'Temple of Mystery enters the battlefield tapped.',
        produced_mana: ['U', 'G'],
      });

      const result = classifyLand(temple);
      expect(result.category).toBe('tapped');
      expect(result.reason).toBe('Always enters tapped');
    });

    it('should classify shock lands as conditional', () => {
      const steamVents = createMockCard({
        name: 'Steam Vents',
        type_line: 'Land — Island Mountain',
        oracle_text: 'Steam Vents enters the battlefield tapped unless you pay 2 life.',
        produced_mana: ['U', 'R'],
      });

      const result = classifyLand(steamVents);
      expect(result.category).toBe('conditional');
      expect(result.reason).toBe('Shock land (2 life)');
    });

    it('should classify check lands as conditional', () => {
      const glacialFortress = createMockCard({
        name: 'Glacial Fortress',
        type_line: 'Land',
        oracle_text: 'Glacial Fortress enters the battlefield tapped unless you control a Plains or an Island.',
        produced_mana: ['W', 'U'],
      });

      const result = classifyLand(glacialFortress);
      expect(result.category).toBe('conditional');
      expect(result.reason).toBe('Check land');
    });

    it('should classify pain lands as conditional', () => {
      const cavesOfKoilos = createMockCard({
        name: 'Caves of Koilos',
        type_line: 'Land',
        oracle_text: '{T}: Add {C}. {T}: Add {W} or {B}. Caves of Koilos deals 1 damage to you.',
        produced_mana: ['W', 'B', 'C'],
      });

      const result = classifyLand(cavesOfKoilos);
      expect(result.category).toBe('conditional');
      expect(result.reason).toBe('Pain land');
    });

    it('should classify Cavern of Souls as restricted', () => {
      const cavernOfSouls = createMockCard({
        name: 'Cavern of Souls',
        type_line: 'Land',
        oracle_text: '{T}: Add {C}. As Cavern of Souls enters the battlefield, choose a creature type. {T}: Add one mana of any color. Spend this mana only to cast a creature spell of the chosen type.',
        produced_mana: ['W', 'U', 'B', 'R', 'G', 'C'],
      });

      const result = classifyLand(cavernOfSouls);
      expect(result.category).toBe('restricted');
      expect(result.reason).toBe('Mana usage restricted');
    });

    it('should classify utility lands with no mana production as restricted', () => {
      const wasteland = createMockCard({
        name: 'Wasteland',
        type_line: 'Land',
        oracle_text: '{T}: Add {C}. {T}, Sacrifice Wasteland: Destroy target nonbasic land.',
        produced_mana: [],
      });

      const result = classifyLand(wasteland);
      expect(result.category).toBe('restricted');
      expect(result.reason).toBe('No mana production');
    });

    it('should classify lands without tapped conditions as untapped by default', () => {
      const ancientTomb = createMockCard({
        name: 'Ancient Tomb',
        type_line: 'Land',
        oracle_text: '{T}: Add {C}{C}. Ancient Tomb deals 2 damage to you.',
        produced_mana: ['C'],
      });

      const result = classifyLand(ancientTomb);
      expect(result.category).toBe('untapped');
      expect(result.reason).toBe('No tapped condition found');
    });

    it('should handle Japanese text for tapped lands', () => {
      const triome = createMockCard({
        name: 'サヴァイのトライオーム',
        type_line: 'Land',
        printed_text: 'タップ状態で戦場に出る。',
        produced_mana: ['W', 'R', 'B'],
      });

      const result = classifyLand(triome);
      expect(result.category).toBe('tapped');
    });
  });

  describe('isAvailableOnTurn1', () => {
    it('should return true for untapped lands', () => {
      const plains = createMockCard({
        name: 'Plains',
        type_line: 'Basic Land — Plains',
        produced_mana: ['W'],
      });

      expect(isAvailableOnTurn1(plains)).toBe(true);
    });

    it('should return true for conditional lands', () => {
      const shockLand = createMockCard({
        name: 'Steam Vents',
        type_line: 'Land — Island Mountain',
        oracle_text: 'Steam Vents enters the battlefield tapped unless you pay 2 life.',
        produced_mana: ['U', 'R'],
      });

      expect(isAvailableOnTurn1(shockLand)).toBe(true);
    });

    it('should return false for tapped lands', () => {
      const temple = createMockCard({
        name: 'Temple of Mystery',
        type_line: 'Land',
        oracle_text: 'Temple of Mystery enters the battlefield tapped.',
        produced_mana: ['U', 'G'],
      });

      expect(isAvailableOnTurn1(temple)).toBe(false);
    });

    it('should return false for restricted lands', () => {
      const cavernOfSouls = createMockCard({
        name: 'Cavern of Souls',
        type_line: 'Land',
        oracle_text: '{T}: Add {C}. Spend this mana only to cast creature spells.',
        produced_mana: ['C', 'W', 'U', 'B', 'R', 'G'],
      });

      expect(isAvailableOnTurn1(cavernOfSouls)).toBe(false);
    });
  });
});
