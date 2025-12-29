import { parseArenaDeckList, ImportProgress } from '../deckImport';

// Mock fetch
global.fetch = jest.fn();

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('deckImport', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('parseArenaDeckList', () => {
    it('should parse valid Arena format deck list', async () => {
      // Mock successful API responses
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          id: 'card-1',
          name: 'Lightning Bolt',
          set: 'm21',
          collector_number: '163',
        }),
      } as Response);

      const deckList = `Deck
4 Lightning Bolt (M21) 163
20 Mountain`;

      const result = await parseArenaDeckList(deckList);

      expect(result.mainboard).toHaveLength(2);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    it('should handle cards without set codes', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          id: 'card-1',
          name: 'Lightning Bolt',
          set: 'm21',
        }),
      } as Response);

      const deckList = `Deck
4 Lightning Bolt`;

      const result = await parseArenaDeckList(deckList);

      expect(result.mainboard).toHaveLength(1);
      expect(result.mainboard[0].quantity).toBe(4);
    });

    it('should parse sideboard section', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          id: 'card-1',
          name: 'Abrade',
          set: 'm21',
        }),
      } as Response);

      const deckList = `Deck
4 Lightning Bolt

Sideboard
3 Abrade`;

      const result = await parseArenaDeckList(deckList);

      expect(result.sideboard).toHaveLength(1);
      expect(result.sideboard[0].quantity).toBe(3);
    });

    it('should handle invalid format lines', async () => {
      const deckList = `Deck
4 Lightning Bolt
invalid line here
3 Shock`;

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'card-1', name: 'Lightning Bolt' }),
      } as Response);

      const result = await parseArenaDeckList(deckList);

      expect(result.errors).toContain('Line 3: Invalid format - "invalid line here"');
    });

    it('should provide suggestions for card not found', async () => {
      // First call fails (card not found), second call succeeds (similar cards search)
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: [
              { name: 'Counterspell' },
              { name: 'Counterspell Storm' },
            ],
          }),
        } as Response);

      const deckList = `Deck
4 Counterspel`;

      const result = await parseArenaDeckList(deckList);

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Did you mean: Counterspell, Counterspell Storm?');
    });

    it('should warn on set mismatch', async () => {
      // Card found but from different set
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          id: 'card-1',
          name: 'Lightning Bolt',
          set: 'lea', // Different from requested M21
        }),
      } as Response);

      const deckList = `Deck
4 Lightning Bolt (M21) 163`;

      const result = await parseArenaDeckList(deckList);

      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]).toContain('Found "Lightning Bolt" from LEA instead of M21');
    });

    it('should remove furigana from Japanese card names', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          id: 'card-1',
          name: '稲妻',
        }),
      } as Response);

      const deckList = `Deck
4 稲（いな）妻（づま）`;

      const result = await parseArenaDeckList(deckList);

      // Check that fetch was called with furigana removed
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(encodeURIComponent('稲妻'))
      );
    });

    it('should call progress callback during import', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'card-1', name: 'Test Card' }),
      } as Response);

      const deckList = `Deck
4 Card1
3 Card2
2 Card3`;

      const progressUpdates: ImportProgress[] = [];
      const onProgress = (progress: ImportProgress) => {
        progressUpdates.push({ ...progress });
      };

      await parseArenaDeckList(deckList, onProgress);

      expect(progressUpdates.length).toBe(3);
      expect(progressUpdates[0]).toEqual({ current: 1, total: 3, currentCard: 'Card1' });
      expect(progressUpdates[1]).toEqual({ current: 2, total: 3, currentCard: 'Card2' });
      expect(progressUpdates[2]).toEqual({ current: 3, total: 3, currentCard: 'Card3' });
    });

    it('should skip empty lines', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'card-1', name: 'Lightning Bolt' }),
      } as Response);

      const deckList = `Deck

4 Lightning Bolt

`;

      const result = await parseArenaDeckList(deckList);

      expect(result.mainboard).toHaveLength(1);
    });

    it('should handle Japanese section headers', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'card-1', name: 'Card' }),
      } as Response);

      const deckList = `デッキ
4 Card1

サイドボード
3 Card2`;

      const result = await parseArenaDeckList(deckList);

      expect(result.mainboard).toHaveLength(1);
      expect(result.sideboard).toHaveLength(1);
    });

    it('should provide error with line number', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'card-1', name: 'Lightning Bolt' }),
      } as Response).mockResolvedValueOnce({
        ok: false,
      } as Response).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      } as Response);

      const deckList = `Deck
4 Lightning Bolt
3 NonExistentCard`;

      const result = await parseArenaDeckList(deckList);

      expect(result.errors[0]).toContain('Line 3: Card not found - "NonExistentCard"');
    });
  });
});
