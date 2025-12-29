import { Card } from '@/types/card';
import { DeckCard } from '@/types/deck';

export interface ParsedDeckList {
  mainboard: DeckCard[];
  sideboard: DeckCard[];
  errors: string[];
  warnings: string[];
}

export interface ImportProgress {
  current: number;
  total: number;
  currentCard?: string;
}

export type ProgressCallback = (progress: ImportProgress) => void;

/**
 * Remove furigana from Japanese card names
 * Example: "偉（い）大（だい）なる統（とう）一（いつ）者（しゃ）、アトラクサ" -> "偉大なる統一者、アトラクサ"
 */
function removeFurigana(text: string): string {
  return text.replace(/（[^）]+）/g, '');
}

/**
 * Delay execution for rate limiting
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Search for similar card names (for suggestions on error)
 */
async function findSimilarCards(name: string, limit: number = 3): Promise<string[]> {
  try {
    const searchUrl = `/api/scryfall/search?q=${encodeURIComponent(name)}&unique=cards`;
    const response = await fetch(searchUrl);

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    if (!data.data || data.data.length === 0) {
      return [];
    }

    // Return top N card names
    return data.data.slice(0, limit).map((card: Card) => card.name);
  } catch (error) {
    console.warn('Failed to find similar cards:', error);
    return [];
  }
}

/**
 * Parse MTG Arena format deck list
 *
 * Format example:
 * Deck
 * 4 Lightning Bolt (M21) 163
 * 3 Shock
 * 20 Mountain
 *
 * Sideboard
 * 2 Abrade (M21) 130
 */
export async function parseArenaDeckList(
  text: string,
  onProgress?: ProgressCallback
): Promise<ParsedDeckList> {
  const lines = text.split('\n').map((line) => line.trim());
  const mainboard: DeckCard[] = [];
  const sideboard: DeckCard[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];

  let currentSection: 'mainboard' | 'sideboard' = 'mainboard';

  // First pass: parse all lines and collect card requests
  interface CardRequest {
    lineNumber: number;
    quantity: number;
    cardName: string;
    setCode?: string;
    collectorNumber?: string;
    section: 'mainboard' | 'sideboard';
  }

  const cardRequests: CardRequest[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNumber = i + 1;

    // Skip empty lines
    if (!line) continue;

    // Check for section headers (English and Japanese)
    const lowerLine = line.toLowerCase();
    if (lowerLine === 'deck' || line === 'デッキ') {
      currentSection = 'mainboard';
      continue;
    }
    if (lowerLine === 'sideboard' || line === 'サイドボード') {
      currentSection = 'sideboard';
      continue;
    }

    // Parse card line
    // Format: "4 Lightning Bolt (M21) 163" or "4 Lightning Bolt"
    // Also support Japanese format with furigana: "4 偉（い）大（だい）なる統（とう）一（いつ）者（しゃ）、アトラクサ (ONE) 3"
    const match = line.match(/^(\d+)\s+(.+?)(?:\s+\(([A-Z0-9]+)\)\s+(\d+))?$/);

    if (!match) {
      errors.push(`Line ${lineNumber}: Invalid format - "${line}"`);
      continue;
    }

    const quantity = parseInt(match[1], 10);
    let cardName = match[2].trim();
    const setCode = match[3]; // Optional
    const collectorNumber = match[4]; // Optional

    // Remove furigana from Japanese card names
    cardName = removeFurigana(cardName);

    cardRequests.push({
      lineNumber,
      quantity,
      cardName,
      setCode,
      collectorNumber,
      section: currentSection,
    });
  }

  // Second pass: fetch cards with batch processing and rate limiting
  const BATCH_SIZE = 10; // Process 10 cards at a time
  const RATE_LIMIT_DELAY = 100; // 100ms between requests (10 req/sec)

  for (let i = 0; i < cardRequests.length; i++) {
    const request = cardRequests[i];

    // Report progress
    if (onProgress) {
      onProgress({
        current: i + 1,
        total: cardRequests.length,
        currentCard: request.cardName,
      });
    }

    try {
      // Fetch card from Scryfall
      const card = await fetchCardByName(request.cardName, request.setCode, request.collectorNumber);

      const deckCard: DeckCard = {
        card,
        quantity: request.quantity,
      };

      // Check for set mismatch warning
      if (request.setCode && card.set.toLowerCase() !== request.setCode.toLowerCase()) {
        warnings.push(
          `Line ${request.lineNumber}: Found "${card.name}" from ${card.set.toUpperCase()} instead of ${request.setCode.toUpperCase()}`
        );
      }

      if (request.section === 'mainboard') {
        mainboard.push(deckCard);
      } else {
        sideboard.push(deckCard);
      }
    } catch (error) {
      // Try to find similar cards for suggestions
      const suggestions = await findSimilarCards(request.cardName);
      const suggestionText = suggestions.length > 0
        ? ` Did you mean: ${suggestions.join(', ')}?`
        : '';

      errors.push(
        `Line ${request.lineNumber}: Card not found - "${request.cardName}"${request.setCode ? ` (${request.setCode})` : ''}.${suggestionText}`
      );
    }

    // Rate limiting: delay between requests (except for last one)
    if (i < cardRequests.length - 1) {
      await delay(RATE_LIMIT_DELAY);
    }
  }

  return { mainboard, sideboard, errors, warnings };
}

/**
 * Fetch card data from Scryfall API
 */
async function fetchCardByName(
  name: string,
  setCode?: string,
  collectorNumber?: string
): Promise<Card> {
  // Check if the name contains Japanese characters
  const hasJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(name);

  // Strategy 1: If we have set and collector number, try that first
  if (setCode && collectorNumber) {
    try {
      const setUrl = `/api/scryfall/cards/${setCode.toLowerCase()}/${collectorNumber}`;
      const setResponse = await fetch(setUrl);

      if (setResponse.ok) {
        const cardData = await setResponse.json();
        return cardData;
      }
    } catch (error) {
      console.warn(`Failed to fetch card by set/number: ${setCode}/${collectorNumber}`);
      // Fall through to try by name
    }
  }

  // Strategy 2: For Japanese cards, use Named API (fuzzy search by name)
  if (hasJapanese) {
    try {
      const namedUrl = `/api/scryfall/named?fuzzy=${encodeURIComponent(name)}`;
      const namedResponse = await fetch(namedUrl);

      if (namedResponse.ok) {
        const cardData = await namedResponse.json();

        // If we have a set code, verify it matches (optional filtering)
        if (setCode && cardData.set?.toLowerCase() !== setCode.toLowerCase()) {
          console.warn(`Card found but set mismatch: expected ${setCode}, got ${cardData.set}`);
          // Still return it as the name match is most important
        }

        return cardData;
      }
    } catch (error) {
      console.warn('Named API failed for Japanese card:', name);
    }
  }

  // Strategy 3: Fallback to fuzzy name search (for English cards or final attempt)
  const namedUrl = `/api/scryfall/named?fuzzy=${encodeURIComponent(name)}`;
  const response = await fetch(namedUrl);

  if (!response.ok) {
    throw new Error(`Card not found: ${name}`);
  }

  const data = await response.json();
  return data;
}
