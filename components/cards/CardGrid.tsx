'use client';

import { Card } from '@/types/card';
import { CardItem } from './CardItem';

interface CardGridProps {
  cards: Card[];
  onCardClick?: (card: Card) => void;
}

export function CardGrid({ cards, onCardClick }: CardGridProps) {
  if (cards.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">No cards found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <CardItem key={card.id} card={card} onClick={onCardClick} />
      ))}
    </div>
  );
}
