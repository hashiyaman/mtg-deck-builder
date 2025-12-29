import { Card } from '@/types/card';
import { DeckCard } from '@/types/deck';

export interface ParsedDeckList {
  mainboard: DeckCard[];
  sideboard: DeckCard[];
  errors: string[];
}

/**
 * Remove furigana from Japanese card names
 * Example: "偉（い）大（だい）なる統（とう）一（いつ）者（しゃ）、アトラクサ" -> "偉大なる統一者、アトラクサ"
 */
function removeFurigana(text: string): string {
  return text.replace(/（[^）]+）/g, '');
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
export async function parseArenaDeckList(text: string): Promise<ParsedDeckList> {
  const lines = text.split('\n').map((line) => line.trim());
  const mainboard: DeckCard[] = [];
  const sideboard: DeckCard[] = [];
  const errors: string[] = [];

  let currentSection: 'mainboard' | 'sideboard' = 'mainboard';

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

    try {
      // Fetch card from Scryfall
      const card = await fetchCardByName(cardName, setCode, collectorNumber);

      const deckCard: DeckCard = {
        card,
        quantity,
      };

      if (currentSection === 'mainboard') {
        mainboard.push(deckCard);
      } else {
        sideboard.push(deckCard);
      }
    } catch (error) {
      errors.push(`Line ${lineNumber}: Card not found - "${cardName}"${setCode ? ` (${setCode})` : ''}`);
    }
  }

  return { mainboard, sideboard, errors };
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
