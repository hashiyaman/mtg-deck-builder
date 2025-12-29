import { Card, ScryfallSearchResponse } from '@/types/card';

const SCRYFALL_API_BASE = 'https://api.scryfall.com';
const RATE_LIMIT_DELAY = 100; // 100ms between requests (10 req/sec)

let lastRequestTime = 0;

/**
 * レート制限を考慮してリクエストを実行
 */
async function rateLimitedFetch(url: string): Promise<Response> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
    await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY - timeSinceLastRequest));
  }

  lastRequestTime = Date.now();
  return fetch(url);
}

/**
 * Scryfallでカードを検索（日本語版を優先）
 */
export async function searchCards(query: string, page = 1): Promise<ScryfallSearchResponse> {
  // 日本語版を優先的に検索（lang:jaを追加）
  const searchQuery = query.includes('lang:') ? query : `${query} lang:ja`;
  const url = `${SCRYFALL_API_BASE}/cards/search?q=${encodeURIComponent(searchQuery)}&page=${page}`;

  try {
    const response = await rateLimitedFetch(url);

    if (!response.ok) {
      if (response.status === 404) {
        // 日本語版が見つからない場合、英語版で再検索
        const fallbackUrl = `${SCRYFALL_API_BASE}/cards/search?q=${encodeURIComponent(query)}&page=${page}`;
        const fallbackResponse = await rateLimitedFetch(fallbackUrl);

        if (!fallbackResponse.ok) {
          // 検索結果が0件の場合
          return {
            object: 'list',
            total_cards: 0,
            has_more: false,
            data: [],
          };
        }

        const fallbackData = await fallbackResponse.json();
        return fallbackData;
      }
      throw new Error(`Scryfall API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching cards:', error);
    throw error;
  }
}

/**
 * IDでカードを取得
 */
export async function getCardById(id: string): Promise<Card> {
  const url = `${SCRYFALL_API_BASE}/cards/${id}`;

  try {
    const response = await rateLimitedFetch(url);

    if (!response.ok) {
      throw new Error(`Scryfall API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting card:', error);
    throw error;
  }
}

/**
 * カード名の自動補完
 */
export async function autocompleteCardNames(query: string): Promise<string[]> {
  const url = `${SCRYFALL_API_BASE}/cards/autocomplete?q=${encodeURIComponent(query)}`;

  try {
    const response = await rateLimitedFetch(url);

    if (!response.ok) {
      throw new Error(`Scryfall API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error autocompleting card names:', error);
    return [];
  }
}
