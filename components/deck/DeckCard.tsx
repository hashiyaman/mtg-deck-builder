'use client';

import { Deck } from '@/types/deck';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, Edit } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface DeckCardProps {
  deck: Deck;
  onDelete: (deckId: string) => void;
}

export function DeckCard({ deck, onDelete }: DeckCardProps) {
  const mainboardCount = deck.mainboard.reduce((sum, dc) => sum + dc.quantity, 0);
  const sideboardCount = deck.sideboard.reduce((sum, dc) => sum + dc.quantity, 0);

  return (
    <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div>
          <Link href={`/deck/${deck.id}`}>
            <h3 className="text-lg font-semibold hover:text-primary cursor-pointer">
              {deck.name}
            </h3>
          </Link>
          <p className="text-sm text-muted-foreground">
            Updated {formatDistanceToNow(deck.updatedAt, { addSuffix: true })}
          </p>
        </div>
        <Badge variant="outline" className="capitalize">
          {deck.format}
        </Badge>
      </div>

      {deck.description && (
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {deck.description}
        </p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex gap-4 text-sm">
          <span>
            <span className="font-semibold">{mainboardCount}</span> mainboard
          </span>
          <span>
            <span className="font-semibold">{sideboardCount}</span> sideboard
          </span>
        </div>

        <div className="flex gap-2">
          <Link href={`/deck/${deck.id}`}>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </Link>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(deck.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
