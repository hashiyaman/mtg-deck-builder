'use client';

import { Card } from '@/types/card';
import { CardImage } from './CardImage';

interface CardItemProps {
  card: Card;
  onClick?: (card: Card) => void;
}

export function CardItem({ card, onClick }: CardItemProps) {
  const displayName = card.printed_name || card.name;

  return (
    <div
      className="group cursor-pointer transition-transform hover:scale-105"
      onClick={() => onClick?.(card)}
    >
      <div className="relative overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <CardImage card={card} size="small" className="w-full h-auto" />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
          <h3 className="text-sm font-semibold text-white truncate">{displayName}</h3>
          <div className="flex items-center justify-between text-xs text-white/80">
            <span>{card.set_name}</span>
            <span className="capitalize">{card.rarity}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
