'use client';

import { useEffect } from 'react';
import { SearchBar } from '@/components/search/SearchBar';
import { SearchFilters } from '@/components/search/SearchFilters';
import { ViewModeToggle } from '@/components/search/ViewModeToggle';
import { CardGrid } from '@/components/cards/CardGrid';
import { CardList } from '@/components/cards/CardList';
import { CardDetail } from '@/components/cards/CardDetail';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { useSearchStore } from '@/store/searchStore';
import { useUIStore } from '@/store/uiStore';
import { useDeckStore } from '@/store/deckStore';
import { Card } from '@/types/card';

export default function SearchPage() {
  const { filters, results, isLoading, hasMore, error, setFilter, search, loadMore } = useSearchStore();
  const { viewMode, selectedCard, setViewMode, selectCard } = useUIStore();
  const { loadAllDecks } = useDeckStore();

  // Load decks on mount
  useEffect(() => {
    loadAllDecks();
  }, [loadAllDecks]);

  const handleSearch = (query: string) => {
    setFilter('query', query);
    // フィルター更新後に検索を実行（Zustandは同期的に更新）
    search();
  };

  const handleCardClick = (card: Card) => {
    selectCard(card);
  };

  const handleLoadMore = () => {
    loadMore();
  };

  return (
    <div className="flex h-[calc(100vh-73px)]">
      {/* Sidebar Filters */}
      <SearchFilters />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">Card Search</h1>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <SearchBar onSearch={handleSearch} />
              </div>
              <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
            </div>
          </div>

          {/* Results Count */}
          {results.length > 0 && !isLoading && (
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                Found {results.length} card{results.length !== 1 ? 's' : ''}
                {hasMore && ' (more available)'}
              </p>
            </div>
          )}

          {/* Loading State */}
          {isLoading && results.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" text="Searching cards..." />
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="flex items-center justify-center py-12">
              <p className="text-destructive">{error}</p>
            </div>
          )}

          {/* Results */}
          {!error && results.length > 0 && (
            <>
              {viewMode === 'grid' ? (
                <CardGrid cards={results} onCardClick={handleCardClick} />
              ) : (
                <CardList cards={results} onCardClick={handleCardClick} />
              )}

              {/* Load More Button */}
              {hasMore && (
                <div className="flex justify-center mt-8">
                  <Button
                    onClick={handleLoadMore}
                    disabled={isLoading}
                    variant="outline"
                    size="lg"
                  >
                    {isLoading ? 'Loading...' : 'Load More'}
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Empty State */}
          {!isLoading && !error && results.length === 0 && filters.query && (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">
                No cards found. Try adjusting your search or filters.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Card Detail Modal */}
      <CardDetail
        card={selectedCard}
        open={!!selectedCard}
        onOpenChange={(open) => !open && selectCard(null)}
      />
    </div>
  );
}
