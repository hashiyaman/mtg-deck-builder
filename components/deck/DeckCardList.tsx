'use client';

import { useState, useEffect, memo, useMemo } from 'react';
import { DeckCard } from '@/types/deck';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ManaCost } from '@/components/cards/ManaSymbol';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { groupCardsByType } from '@/lib/utils/cardTypeUtils';
import { Minus, Plus, X, ChevronDown, ChevronRight, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { analyzeCardSynergies, SynergyAnalysis } from '@/lib/deck/synergyAnalyzer';

interface DeckCardListProps {
  cards: DeckCard[];
  onQuantityChange: (cardId: string, newQuantity: number) => void;
  onRemove: (cardId: string) => void;
  onCardClick?: (card: DeckCard['card']) => void;
  synergies?: SynergyAnalysis | null;
}

export const DeckCardList = memo(function DeckCardList({ cards, onQuantityChange, onRemove, onCardClick, synergies }: DeckCardListProps) {
  // 各カードタイプの開閉状態を管理（デフォルトは全て開く）
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  // Confirmation dialog state
  const [cardToRemove, setCardToRemove] = useState<{ id: string; name: string; quantity: number } | null>(null);

  // カードをタイプ別にグループ化 (memoized)
  const cardGroups = useMemo(() => groupCardsByType(cards), [cards]);

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
    <TooltipProvider>
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

                        {/* Synergy Badges */}
                        {synergies && (() => {
                          const cardSynergy = analyzeCardSynergies(card, cards, synergies);
                          if (cardSynergy.synergies.length === 0) return null;

                          return (
                            <div className="flex gap-1 mt-1 flex-wrap">
                              {cardSynergy.synergies.slice(0, 2).map((syn, index) => (
                                <Tooltip key={index}>
                                  <TooltipTrigger asChild>
                                    <Badge
                                      variant="secondary"
                                      className="text-xs px-1 py-0 h-5 cursor-help"
                                    >
                                      <Sparkles className="h-2.5 w-2.5 mr-0.5" />
                                      {syn.role}
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="max-w-xs">
                                    <div className="space-y-1">
                                      <p className="font-semibold">{syn.category}</p>
                                      <p className="text-xs">{syn.description}</p>
                                      {cardSynergy.relatedCards.length > 0 && (
                                        <p className="text-xs text-muted-foreground mt-2">
                                          相性: {cardSynergy.relatedCards.slice(0, 3).join(', ')}
                                          {cardSynergy.relatedCards.length > 3 && ` 他${cardSynergy.relatedCards.length - 3}枚`}
                                        </p>
                                      )}
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              ))}
                              {cardSynergy.synergies.length > 2 && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge
                                      variant="outline"
                                      className="text-xs px-1 py-0 h-5 cursor-help"
                                    >
                                      +{cardSynergy.synergies.length - 2}
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="max-w-xs">
                                    <div className="space-y-1">
                                      {cardSynergy.synergies.slice(2).map((syn, index) => (
                                        <div key={index}>
                                          <p className="font-semibold text-xs">{syn.category}</p>
                                          <p className="text-xs text-muted-foreground">{syn.role}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          );
                        })()}
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
                          aria-label={`Decrease quantity of ${displayName}`}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-semibold">{quantity}</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
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
                              aria-label={`Increase quantity of ${displayName}`}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          {quantity >= 4 &&
                            !card.type_line.toLowerCase().includes('basic') &&
                            !card.type_line.toLowerCase().includes('snow') && (
                              <TooltipContent>
                                <p>基本土地以外は4枚まで</p>
                              </TooltipContent>
                            )}
                        </Tooltip>
                      </div>

                      {/* Remove Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => setCardToRemove({ id: card.id, name: displayName, quantity })}
                        aria-label={`Remove ${displayName}`}
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

      {/* Confirmation Dialog */}
      <AlertDialog open={!!cardToRemove} onOpenChange={(open) => !open && setCardToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>カードを削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              {cardToRemove && (
                <>
                  <strong>{cardToRemove.name}</strong> を {cardToRemove.quantity}枚 削除します。
                  この操作は元に戻すことができます。
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (cardToRemove) {
                  onRemove(cardToRemove.id);
                  setCardToRemove(null);
                }
              }}
            >
              削除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </TooltipProvider>
  );
});
