import { create } from 'zustand';
import { Deck, DeckCard, DeckStats, ManaSourceBreakdown, DetailedManaProduction } from '@/types/deck';
import { Card, Format } from '@/types/card';
import { loadDecks, saveDecks, addDeck as addDeckToStorage, updateDeck as updateDeckInStorage, deleteDeck as deleteDeckFromStorage } from '@/lib/storage/deckStorage';
import { enrichWithJapanese } from '@/lib/scryfall/japaneseCard';
import { classifyLand } from '@/lib/deck/landClassifier';

interface DeckState {
  // State
  decks: Deck[];
  currentDeck: Deck | null;
  isLoading: boolean;
  enrichmentProgress: { current: number; total: number } | null;

  // Actions
  loadAllDecks: () => void;
  createDeck: (name: string, format: Format) => string; // Returns deck ID
  loadDeck: (deckId: string) => void;
  saveDeck: () => void;
  deleteDeck: (deckId: string) => void;
  addCard: (deckIdOrCard: string | Card, cardOrQuantity: Card | number, quantityOrLocation: number | 'mainboard' | 'sideboard', location?: 'mainboard' | 'sideboard') => void;
  removeCard: (cardId: string, location: 'mainboard' | 'sideboard') => void;
  updateQuantity: (cardId: string, quantity: number, location: 'mainboard' | 'sideboard') => void;
  updateDeckInfo: (updates: Partial<Pick<Deck, 'name' | 'description' | 'format' | 'tags'>>) => void;
  enrichAllCardsWithJapanese: () => Promise<void>; // 既存カードの日本語情報を取得

  // Computed
  getDeckStats: () => DeckStats | null;
}

// Generate UUID v4
function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Calculate deck statistics
function calculateDeckStats(deck: Deck): DeckStats {
  const mainboardCards = deck.mainboard.reduce((sum, dc) => sum + dc.quantity, 0);
  const sideboardCards = deck.sideboard.reduce((sum, dc) => sum + dc.quantity, 0);

  // Mana curve
  const cmcCounts: Record<number, number> = {};
  deck.mainboard.forEach(({ card, quantity }) => {
    const cmc = Math.min(card.cmc, 7); // Group 7+ together
    cmcCounts[cmc] = (cmcCounts[cmc] || 0) + quantity;
  });

  const manaCurve = Object.entries(cmcCounts)
    .map(([cmc, count]) => ({ cmc: Number(cmc), count }))
    .sort((a, b) => a.cmc - b.cmc);

  // Color distribution
  const colorDistribution = {
    W: 0,
    U: 0,
    B: 0,
    R: 0,
    G: 0,
    C: 0,
    multicolor: 0,
  };

  deck.mainboard.forEach(({ card, quantity }) => {
    if (!card.colors || card.colors.length === 0) {
      colorDistribution.C += quantity;
    } else if (card.colors.length > 1) {
      colorDistribution.multicolor += quantity;
    } else {
      const color = card.colors[0];
      colorDistribution[color] += quantity;
    }
  });

  // Mana production (lands)
  const manaProduction = {
    W: 0,
    U: 0,
    B: 0,
    R: 0,
    G: 0,
    C: 0,
    multicolor: 0,
  };

  // Detailed mana production (categorized by land type)
  const createEmptyBreakdown = (): ManaSourceBreakdown => ({
    untapped: 0,
    conditional: 0,
    tapped: 0,
    restricted: 0,
  });

  const detailedManaProduction: DetailedManaProduction = {
    W: createEmptyBreakdown(),
    U: createEmptyBreakdown(),
    B: createEmptyBreakdown(),
    R: createEmptyBreakdown(),
    G: createEmptyBreakdown(),
    C: createEmptyBreakdown(),
  };

  try {
    deck.mainboard.forEach(({ card, quantity }) => {
      if (card.type_line?.toLowerCase().includes('land') && card.produced_mana && Array.isArray(card.produced_mana)) {
        const colors = card.produced_mana.filter(m => ['W', 'U', 'B', 'R', 'G', 'C'].includes(m));
        const classification = classifyLand(card);

        if (colors.length === 0) {
          // No mana production data
        } else {
          // Count each color it produces
          colors.forEach(color => {
            if (manaProduction[color as keyof typeof manaProduction] !== undefined) {
              // Simple count
              manaProduction[color as keyof typeof manaProduction] += quantity;

              // Detailed count by category
              const breakdown = detailedManaProduction[color as keyof DetailedManaProduction];
              if (breakdown) {
                breakdown[classification.category] += quantity;
              }
            }
          });
        }
      }
    });
  } catch (error) {
    console.error('Error calculating mana production:', error);
  }

  // Type breakdown
  const typeBreakdown = {
    creature: 0,
    planeswalker: 0,
    instant: 0,
    sorcery: 0,
    enchantment: 0,
    artifact: 0,
    land: 0,
  };

  deck.mainboard.forEach(({ card, quantity }) => {
    const typeLine = card.type_line.toLowerCase();
    if (typeLine.includes('creature')) typeBreakdown.creature += quantity;
    else if (typeLine.includes('planeswalker')) typeBreakdown.planeswalker += quantity;
    else if (typeLine.includes('instant')) typeBreakdown.instant += quantity;
    else if (typeLine.includes('sorcery')) typeBreakdown.sorcery += quantity;
    else if (typeLine.includes('enchantment')) typeBreakdown.enchantment += quantity;
    else if (typeLine.includes('artifact')) typeBreakdown.artifact += quantity;
    else if (typeLine.includes('land')) typeBreakdown.land += quantity;
  });

  // Average CMC
  const totalCmc = deck.mainboard.reduce((sum, { card, quantity }) => {
    return sum + card.cmc * quantity;
  }, 0);
  const averageCMC = mainboardCards > 0 ? totalCmc / mainboardCards : 0;

  return {
    totalCards: mainboardCards + sideboardCards,
    cardCount: {
      mainboard: mainboardCards,
      sideboard: sideboardCards,
    },
    manaCurve,
    colorDistribution,
    manaProduction,
    detailedManaProduction,
    typeBreakdown,
    averageCMC,
    landCount: typeBreakdown.land,
  };
}

export const useDeckStore = create<DeckState>((set, get) => ({
  // Initial state
  decks: [],
  currentDeck: null,
  isLoading: false,
  enrichmentProgress: null,

  // Load all decks from localStorage
  loadAllDecks: () => {
    set({ isLoading: true });
    const decks = loadDecks();
    set({ decks, isLoading: false });
  },

  // Create a new deck
  createDeck: (name, format) => {
    const newDeck: Deck = {
      id: generateId(),
      name,
      format,
      mainboard: [],
      sideboard: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    addDeckToStorage(newDeck);
    const decks = loadDecks();
    set({ decks, currentDeck: newDeck });

    return newDeck.id;
  },

  // Load a specific deck
  loadDeck: (deckId) => {
    console.log('[loadDeck] Loading deck with ID:', deckId);
    // まずデッキリストを読み込む
    const decks = loadDecks();
    console.log('[loadDeck] Available decks:', decks.length);

    const deck = decks.find((d) => d.id === deckId);

    if (deck) {
      console.log('[loadDeck] Deck found:', deck.name);
      set({ decks, currentDeck: deck });
    } else {
      console.error('[loadDeck] Deck not found with ID:', deckId);
      set({ decks, currentDeck: null });
    }
  },

  // Save current deck
  saveDeck: () => {
    const { currentDeck } = get();
    if (!currentDeck) return;

    updateDeckInStorage(currentDeck.id, currentDeck);
    const decks = loadDecks();
    set({ decks });
  },

  // Delete a deck
  deleteDeck: (deckId) => {
    deleteDeckFromStorage(deckId);
    const decks = loadDecks();
    const { currentDeck } = get();

    set({
      decks,
      currentDeck: currentDeck?.id === deckId ? null : currentDeck,
    });
  },

  // Add card to deck
  // Supports two signatures:
  // 1. addCard(card, quantity, location) - adds to currentDeck
  // 2. addCard(deckId, card, quantity, location) - adds to specified deck
  addCard: async (deckIdOrCard, cardOrQuantity, quantityOrLocation, location) => {
    let targetDeck: Deck | undefined;
    let card: Card;
    let quantity: number;
    let targetLocation: 'mainboard' | 'sideboard';

    // Determine which signature is being used
    if (typeof deckIdOrCard === 'string') {
      // New signature: addCard(deckId, card, quantity, location)
      const deckId = deckIdOrCard;
      card = cardOrQuantity as Card;
      quantity = quantityOrLocation as number;
      targetLocation = location!;

      const { decks } = get();
      targetDeck = decks.find((d) => d.id === deckId);
    } else {
      // Old signature: addCard(card, quantity, location)
      card = deckIdOrCard;
      quantity = cardOrQuantity as number;
      targetLocation = quantityOrLocation as 'mainboard' | 'sideboard';
      targetDeck = get().currentDeck || undefined;
    }

    if (!targetDeck) return;

    // 日本語版を検索して情報を追加
    const enrichedCard = await enrichWithJapanese(card);

    const targetList = targetLocation === 'mainboard' ? [...targetDeck.mainboard] : [...targetDeck.sideboard];
    const existingIndex = targetList.findIndex((dc) => dc.card.id === enrichedCard.id);

    if (existingIndex >= 0) {
      // Update quantity and card data (to include Japanese info if newly available)
      targetList[existingIndex].card = enrichedCard;
      targetList[existingIndex].quantity += quantity;
    } else {
      // Add new card
      targetList.push({ card: enrichedCard, quantity });
    }

    const updatedDeck = {
      ...targetDeck,
      [targetLocation]: targetList,
      updatedAt: Date.now(),
    };

    // Update in storage
    updateDeckInStorage(updatedDeck.id, updatedDeck);

    // Reload decks
    const decks = loadDecks();

    // Update currentDeck if it was modified
    const { currentDeck } = get();
    set({
      decks,
      currentDeck: currentDeck?.id === updatedDeck.id ? updatedDeck : currentDeck,
    });
  },

  // Remove card from deck
  removeCard: (cardId, location) => {
    const { currentDeck } = get();
    if (!currentDeck) return;

    const targetList = location === 'mainboard' ? currentDeck.mainboard : currentDeck.sideboard;
    const filtered = targetList.filter((dc) => dc.card.id !== cardId);

    set({
      currentDeck: {
        ...currentDeck,
        [location]: filtered,
        updatedAt: Date.now(),
      },
    });

    get().saveDeck();
  },

  // Update card quantity
  updateQuantity: (cardId, quantity, location) => {
    const { currentDeck } = get();
    if (!currentDeck) return;

    const targetList = location === 'mainboard' ? currentDeck.mainboard : currentDeck.sideboard;
    const index = targetList.findIndex((dc) => dc.card.id === cardId);

    if (index === -1) return;

    if (quantity <= 0) {
      // Remove card if quantity is 0
      get().removeCard(cardId, location);
    } else {
      targetList[index].quantity = quantity;

      set({
        currentDeck: {
          ...currentDeck,
          [location]: [...targetList],
          updatedAt: Date.now(),
        },
      });

      get().saveDeck();
    }
  },

  // Update deck info (name, description, etc.)
  updateDeckInfo: (updates) => {
    const { currentDeck } = get();
    if (!currentDeck) return;

    set({
      currentDeck: {
        ...currentDeck,
        ...updates,
        updatedAt: Date.now(),
      },
    });

    get().saveDeck();
  },

  // Get deck statistics
  getDeckStats: () => {
    const { currentDeck } = get();
    if (!currentDeck) return null;

    return calculateDeckStats(currentDeck);
  },

  // Enrich all cards in current deck with Japanese information
  enrichAllCardsWithJapanese: async () => {
    const { currentDeck } = get();

    console.log('[enrichAllCardsWithJapanese] Starting...');

    if (!currentDeck) {
      console.error('[enrichAllCardsWithJapanese] No current deck');
      return;
    }

    console.log('[enrichAllCardsWithJapanese] Current deck:', currentDeck.name);
    console.log('[enrichAllCardsWithJapanese] Mainboard cards:', currentDeck.mainboard.length);
    console.log('[enrichAllCardsWithJapanese] Sideboard cards:', currentDeck.sideboard.length);

    const totalCards = currentDeck.mainboard.length + currentDeck.sideboard.length;
    set({ isLoading: true, enrichmentProgress: { current: 0, total: totalCards } });

    try {
      // Process mainboard cards sequentially to track progress
      console.log('[enrichAllCardsWithJapanese] Processing mainboard...');
      const enrichedMainboard: DeckCard[] = [];
      for (let i = 0; i < currentDeck.mainboard.length; i++) {
        const deckCard = currentDeck.mainboard[i];
        console.log(`[enrichAllCardsWithJapanese] Processing mainboard card ${i + 1}/${currentDeck.mainboard.length}: ${deckCard.card.name}`);
        const enrichedCard = await enrichWithJapanese(deckCard.card);
        console.log(`[enrichAllCardsWithJapanese] Enriched: ${deckCard.card.name} -> ${enrichedCard.printed_name || 'No Japanese version'}`);
        enrichedMainboard.push({
          ...deckCard,
          card: enrichedCard,
        });
        set({ enrichmentProgress: { current: i + 1, total: totalCards } });
      }

      // Process sideboard cards sequentially to track progress
      console.log('[enrichAllCardsWithJapanese] Processing sideboard...');
      const enrichedSideboard: DeckCard[] = [];
      for (let i = 0; i < currentDeck.sideboard.length; i++) {
        const deckCard = currentDeck.sideboard[i];
        console.log(`[enrichAllCardsWithJapanese] Processing sideboard card ${i + 1}/${currentDeck.sideboard.length}: ${deckCard.card.name}`);
        const enrichedCard = await enrichWithJapanese(deckCard.card);
        enrichedSideboard.push({
          ...deckCard,
          card: enrichedCard,
        });
        set({ enrichmentProgress: { current: currentDeck.mainboard.length + i + 1, total: totalCards } });
      }

      const updatedDeck = {
        ...currentDeck,
        mainboard: enrichedMainboard,
        sideboard: enrichedSideboard,
        updatedAt: Date.now(),
      };

      console.log('[enrichAllCardsWithJapanese] Updating storage...');
      // Update in storage
      updateDeckInStorage(updatedDeck.id, updatedDeck);

      // Reload decks
      const decks = loadDecks();

      set({
        decks,
        currentDeck: updatedDeck,
        isLoading: false,
        enrichmentProgress: null,
      });

      console.log('[enrichAllCardsWithJapanese] Completed successfully');
    } catch (error) {
      console.error('[enrichAllCardsWithJapanese] Error:', error);
      set({ isLoading: false, enrichmentProgress: null });
      throw error;
    }
  },
}));
