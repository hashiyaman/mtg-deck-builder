import { create } from 'zustand';
import { Card } from '@/types/card';
import { SearchFilters } from '@/types/filter';
import { buildScryfallQuery } from '@/lib/scryfall/queries';

interface SearchState {
  // State
  filters: SearchFilters;
  results: Card[];
  isLoading: boolean;
  hasMore: boolean;
  nextPage: string | null;
  error: string | null;

  // Actions
  setFilter: <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => void;
  clearFilters: () => void;
  search: () => Promise<void>;
  loadMore: () => Promise<void>;
  reset: () => void;
}

const defaultFilters: SearchFilters = {
  query: '',
  colorMode: 'including',
};

export const useSearchStore = create<SearchState>((set, get) => ({
  // Initial state
  filters: defaultFilters,
  results: [],
  isLoading: false,
  hasMore: false,
  nextPage: null,
  error: null,

  // Set a specific filter
  setFilter: (key, value) => {
    set((state) => ({
      filters: {
        ...state.filters,
        [key]: value,
      },
    }));
  },

  // Clear all filters
  clearFilters: () => {
    set({
      filters: defaultFilters,
      results: [],
      hasMore: false,
      nextPage: null,
      error: null,
    });
  },

  // Perform search
  search: async () => {
    const { filters } = get();

    if (!filters.query.trim()) {
      set({ results: [], hasMore: false, nextPage: null });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      let searchQuery = filters.query;

      // 日本語が含まれている場合、先にnamed APIで英語名を取得
      if (/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(searchQuery)) {
        try {
          const namedResponse = await fetch(
            `/api/scryfall/named?fuzzy=${encodeURIComponent(searchQuery)}`
          );

          if (namedResponse.ok) {
            const cardData = await namedResponse.json();
            // 英語名で検索し直す
            searchQuery = cardData.name;
          }
          // エラーの場合は元のクエリで検索を続行
        } catch (namedError) {
          console.warn('Named API failed, using original query:', namedError);
        }
      }

      const scryfallQuery = buildScryfallQuery(searchQuery, filters);
      const response = await fetch(
        `/api/scryfall/search?q=${encodeURIComponent(scryfallQuery)}`
      );

      if (!response.ok) {
        throw new Error('Failed to search cards');
      }

      const data = await response.json();
      set({
        results: data.data || [],
        hasMore: data.has_more || false,
        nextPage: data.next_page || null,
        isLoading: false,
      });
    } catch (error) {
      console.error('Search error:', error);
      set({
        error: 'Failed to search cards. Please try again.',
        results: [],
        isLoading: false,
      });
    }
  },

  // Load more results (pagination)
  loadMore: async () => {
    const { nextPage, results } = get();

    if (!nextPage) return;

    set({ isLoading: true, error: null });

    try {
      const response = await fetch(nextPage);

      if (!response.ok) {
        throw new Error('Failed to load more cards');
      }

      const data = await response.json();
      set({
        results: [...results, ...(data.data || [])],
        hasMore: data.has_more || false,
        nextPage: data.next_page || null,
        isLoading: false,
      });
    } catch (error) {
      console.error('Load more error:', error);
      set({
        error: 'Failed to load more cards.',
        isLoading: false,
      });
    }
  },

  // Reset to initial state
  reset: () => {
    set({
      filters: defaultFilters,
      results: [],
      isLoading: false,
      hasMore: false,
      nextPage: null,
      error: null,
    });
  },
}));
