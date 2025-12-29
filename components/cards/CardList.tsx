'use client';

import { Card } from '@/types/card';
import { Badge } from '@/components/ui/badge';
import { ManaCost } from '@/components/cards/ManaSymbol';
import Image from 'next/image';

interface CardListProps {
  cards: Card[];
  onCardClick?: (card: Card) => void;
}

export function CardList({ cards, onCardClick }: CardListProps) {
  if (cards.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">No cards found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="p-2 text-left text-sm font-semibold">Image</th>
            <th className="p-2 text-left text-sm font-semibold">Name</th>
            <th className="p-2 text-left text-sm font-semibold">Type</th>
            <th className="p-2 text-left text-sm font-semibold">Mana Cost</th>
            <th className="p-2 text-left text-sm font-semibold">Set</th>
            <th className="p-2 text-left text-sm font-semibold">Rarity</th>
            <th className="p-2 text-left text-sm font-semibold">Price</th>
          </tr>
        </thead>
        <tbody>
          {cards.map((card) => {
            const displayName = card.printed_name || card.name;
            const displayTypeLine = card.printed_type_line || card.type_line;

            return (
              <tr
                key={card.id}
                className="border-b hover:bg-muted/30 cursor-pointer transition-colors"
                onClick={() => onCardClick?.(card)}
              >
                <td className="p-2">
                  {card.image_uris?.small && (
                    <Image
                      src={card.image_uris.small}
                      alt={displayName}
                      width={48}
                      height={67}
                      className="rounded"
                    />
                  )}
                </td>
                <td className="p-2 font-medium">{displayName}</td>
                <td className="p-2 text-sm text-muted-foreground">{displayTypeLine}</td>
                <td className="p-2">
                  {card.mana_cost ? (
                    <ManaCost manaCost={card.mana_cost} size="sm" />
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </td>
                <td className="p-2 text-sm">{card.set.toUpperCase()}</td>
                <td className="p-2">
                  <Badge variant="outline" className="capitalize text-xs">
                    {card.rarity}
                  </Badge>
                </td>
                <td className="p-2 text-sm">
                  {card.prices?.usd ? `$${card.prices.usd}` : '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
