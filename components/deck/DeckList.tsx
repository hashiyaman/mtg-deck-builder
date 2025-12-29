'use client';

import { Deck } from '@/types/deck';
import { DeckCard } from './DeckCard';

interface DeckListProps {
  decks: Deck[];
  onDelete: (deckId: string) => void;
}

export function DeckList({ decks, onDelete }: DeckListProps) {
  if (decks.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-center">
        <div>
          <p className="text-muted-foreground mb-4">No decks yet</p>
          <p className="text-sm text-muted-foreground">
            Create your first deck to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {decks.map((deck) => (
        <DeckCard key={deck.id} deck={deck} onDelete={onDelete} />
      ))}
    </div>
  );
}
