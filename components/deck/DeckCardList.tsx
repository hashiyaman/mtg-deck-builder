'use client';

import { useState, useEffect } from 'react';
import { DeckCard } from '@/types/deck';
import { Button } from '@/components/ui/button';
import { ManaCost } from '@/components/cards/ManaSymbol';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { groupCardsByType } from '@/lib/utils/cardTypeUtils';
import { Minus, Plus, X, ChevronDown, ChevronRight } from 'lucide-react';
import Image from 'next/image';

interface DeckCardListProps {
  cards: DeckCard[];
  onQuantityChange: (cardId: string, newQuantity: number) => void;
  onRemove: (cardId: string) => void;
  onCardClick?: (card: DeckCard['card']) => void;
}

export function DeckCardList({ cards, onQuantityChange, onRemove, onCardClick }: DeckCardListProps) {
  // 各カードタイプの開閉状態を管理（デフォルトは全て開く）
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  // カードをタイプ別にグループ化
  const cardGroups = groupCardsByType(cards);

  // Open groups by default when new card types are added
  useEffect(() => {
    setOpenGroups((prev) => {
      const newOpenGroups = { ...prev };
      cardGroups.forEach((group) => {
        // Only set default state for new groups
        if (!(group.type in newOpenGroups)) {
          newOpenGroups[group.type] = true;
        }
      });
      return newOpenGroups;
    });
    // Only run when number of groups changes (not when cardGroups reference changes)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardGroups.length]);

  if (cards.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-center border-2 border-dashed rounded-lg">
        <p className="text-muted-foreground">No cards in deck yet</p>
      </div>
    );
  }

  const toggleGroup = (type: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  return (
    <div className="space-y-4">
      {cardGroups.map((group) => {
        const isOpen = openGroups[group.type] !== false; // デフォルトはtrue

        return (
          <Collapsible
            key={group.type}
            open={isOpen}
            onOpenChange={() => toggleGroup(group.type)}
          >
            {/* グループヘッダー */}
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 hover:bg-muted/70 rounded cursor-pointer transition-colors">
                {isOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                <h3 className="font-semibold text-sm">{group.displayName}</h3>
                <span className="text-xs text-muted-foreground">({group.totalCards}枚)</span>
              </div>
            </CollapsibleTrigger>

            {/* カードリスト */}
            <CollapsibleContent className="mt-2">
              <div className="space-y-1">
                {group.cards.map(({ card, quantity }) => {
                  const displayName = card.printed_name || card.name;
                  const displayTypeLine = card.printed_type_line || card.type_line;

                  return (
                    <div
                      key={card.id}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                    >
                      {/* Card Image */}
                      <div
                        className="flex-shrink-0 cursor-pointer flex items-center justify-center"
                        onClick={() => onCardClick?.(card)}
                      >
                        {(() => {
                          // 両面カードの場合、card_faces[0].image_urisを使用
                          const imageUrl = card.image_uris?.small || card.card_faces?.[0]?.image_uris?.small;
                          return imageUrl ? (
                            <Image
                              src={imageUrl}
                              alt={displayName}
                              width={48}
                              height={67}
                              className="rounded object-contain"
                              style={{ maxWidth: '48px', maxHeight: '67px' }}
                            />
                          ) : (
                            <div className="w-12 h-16 bg-muted rounded flex items-center justify-center">
                              <span className="text-xs text-muted-foreground">No Image</span>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Card Info */}
                      <div
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => onCardClick?.(card)}
                      >
                        <h4 className="font-medium truncate">{displayName}</h4>
                        <p className="text-sm text-muted-foreground truncate">{displayTypeLine}</p>
                      </div>

                      {/* Mana Cost */}
                      <div className="hidden sm:flex">
                        {(() => {
                          // 両面カードの場合、card_faces[0].mana_costを使用
                          const manaCost = card.mana_cost || card.card_faces?.[0]?.mana_cost;
                          return manaCost ? (
                            <ManaCost manaCost={manaCost} size="sm" />
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          );
                        })()}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => onQuantityChange(card.id, quantity - 1)}
                          disabled={quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-semibold">{quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => onQuantityChange(card.id, quantity + 1)}
                          disabled={
                            quantity >= 4 &&
                            !card.type_line.toLowerCase().includes('basic') &&
                            !card.type_line.toLowerCase().includes('snow')
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Remove Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => onRemove(card.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </div>
  );
}
