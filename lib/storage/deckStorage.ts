import { Deck } from '@/types/deck';
import { getItem, setItem, removeItem } from './localStorage';

const STORAGE_KEY = 'mtg_decks';
const SCHEMA_VERSION = '1.0';

interface StoredDecks {
  version: string;
  decks: Deck[];
  lastSync?: number;
}

/**
 * Load all decks from localStorage
 */
export function loadDecks(): Deck[] {
  const stored = getItem<StoredDecks>(STORAGE_KEY);

  if (!stored) return [];

  // Handle schema migrations if needed
  if (stored.version !== SCHEMA_VERSION) {
    console.warn('Deck schema version mismatch, migration may be needed');
    // For now, just return the decks
  }

  return stored.decks || [];
}

/**
 * Save all decks to localStorage
 */
export function saveDecks(decks: Deck[]): boolean {
  const data: StoredDecks = {
    version: SCHEMA_VERSION,
    decks,
    lastSync: Date.now(),
  };

  return setItem(STORAGE_KEY, data);
}

/**
 * Get a specific deck by ID
 */
export function getDeck(deckId: string): Deck | null {
  const decks = loadDecks();
  return decks.find((deck) => deck.id === deckId) || null;
}

/**
 * Add a new deck
 */
export function addDeck(deck: Deck): boolean {
  const decks = loadDecks();
  decks.push(deck);
  return saveDecks(decks);
}

/**
 * Update an existing deck
 */
export function updateDeck(deckId: string, updates: Partial<Deck>): boolean {
  const decks = loadDecks();
  const index = decks.findIndex((deck) => deck.id === deckId);

  if (index === -1) return false;

  decks[index] = {
    ...decks[index],
    ...updates,
    updatedAt: Date.now(),
  };

  return saveDecks(decks);
}

/**
 * Delete a deck
 */
export function deleteDeck(deckId: string): boolean {
  const decks = loadDecks();
  const filtered = decks.filter((deck) => deck.id !== deckId);

  if (filtered.length === decks.length) return false; // Deck not found

  return saveDecks(filtered);
}

/**
 * Clear all decks
 */
export function clearAllDecks(): boolean {
  return removeItem(STORAGE_KEY);
}
