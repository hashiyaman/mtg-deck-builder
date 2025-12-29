'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/types/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Plus, Minus } from 'lucide-react';
import { CardImage } from './CardImage';
import { ManaCost } from './ManaSymbol';
import { useDeckStore } from '@/store/deckStore';
import { toast } from 'sonner';

interface CardDetailProps {
  card: Card | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CardDetail({ card, open, onOpenChange }: CardDetailProps) {
  const { decks, addCard, loadAllDecks } = useDeckStore();
  const [selectedDeckId, setSelectedDeckId] = useState<string>('');
  const [location, setLocation] = useState<'mainboard' | 'sideboard'>('mainboard');
  const [quantity, setQuantity] = useState(1);

  // Load decks when component mounts or when dialog opens
  useEffect(() => {
    if (open) {
      loadAllDecks();
    }
  }, [open, loadAllDecks]);

  if (!card) return null;

  const displayName = card.printed_name || card.name;
  const displayTypeLine = card.printed_type_line || card.type_line;
  const displayText = card.printed_text || card.oracle_text;

  const handleAddToDeck = () => {
    if (!selectedDeckId) {
      toast.error('Please select a deck');
      return;
    }

    addCard(selectedDeckId, card, quantity, location);
    toast.success(`Added ${quantity}x ${displayName} to ${location}`);

    // Reset form
    setQuantity(1);
  };

  const maxQuantity = card.type_line.toLowerCase().includes('basic') ||
                      card.type_line.toLowerCase().includes('snow') ? 99 : 4;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{displayName}</DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left: Card Image */}
          <div className="flex justify-center">
            <CardImage card={card} size="normal" className="max-w-full h-auto" />
          </div>

          {/* Right: Card Details */}
          <div className="space-y-4">
            {/* Mana Cost */}
            {card.mana_cost && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground">マナコスト</h3>
                <ManaCost manaCost={card.mana_cost} size="md" />
              </div>
            )}

            {/* Type Line */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground">タイプ</h3>
              <p>{displayTypeLine}</p>
            </div>

            {/* Oracle Text */}
            {displayText && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground">テキスト</h3>
                <p className="whitespace-pre-line text-sm">{displayText}</p>
              </div>
            )}

            {/* Power/Toughness */}
            {card.power && card.toughness && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground">パワー/タフネス</h3>
                <p className="text-lg font-bold">{card.power}/{card.toughness}</p>
              </div>
            )}

            {/* Flavor Text */}
            {card.flavor_text && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground">フレーバーテキスト</h3>
                <p className="text-sm italic text-muted-foreground">{card.flavor_text}</p>
              </div>
            )}

            {/* Set Info */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground">セット</h3>
              <p>{card.set_name} ({card.set.toUpperCase()})</p>
            </div>

            {/* Rarity */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground">レアリティ</h3>
              <Badge variant="secondary" className="capitalize">
                {card.rarity}
              </Badge>
            </div>

            {/* Colors */}
            {card.colors && card.colors.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground">色</h3>
                <div className="flex gap-2">
                  {card.colors.map((color) => (
                    <Badge key={color} variant="outline">
                      {color}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Prices */}
            {card.prices && (card.prices.usd || card.prices.eur) && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground">価格</h3>
                <div className="flex gap-4 text-sm">
                  {card.prices.usd && <span>USD: ${card.prices.usd}</span>}
                  {card.prices.eur && <span>EUR: €{card.prices.eur}</span>}
                </div>
              </div>
            )}

            {/* Legalities */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">使用可能フォーマット</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(card.legalities)
                  .filter(([_, legality]) => legality === 'legal')
                  .map(([format, legality]) => (
                    <div key={format} className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize text-xs">
                        {format}
                      </Badge>
                    </div>
                  ))}
              </div>
            </div>

            {/* Artist */}
            {card.artist && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground">イラストレーター</h3>
                <p className="text-sm">{card.artist}</p>
              </div>
            )}
          </div>
        </div>

        {/* Add to Deck Section */}
        <DialogFooter className="flex-col sm:flex-col gap-4 border-t pt-4">
          <div className="w-full space-y-4">
            <h3 className="font-semibold">Add to Deck</h3>

            {decks.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No decks available. Create a deck first.
              </p>
            ) : (
              <>
                {/* Deck Selection */}
                <div className="space-y-2">
                  <Label htmlFor="deck-select">Select Deck</Label>
                  <Select value={selectedDeckId} onValueChange={setSelectedDeckId}>
                    <SelectTrigger id="deck-select">
                      <SelectValue placeholder="Choose a deck..." />
                    </SelectTrigger>
                    <SelectContent>
                      {decks.map((deck) => (
                        <SelectItem key={deck.id} value={deck.id}>
                          {deck.name} ({deck.format})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Location Selection */}
                <div className="space-y-2">
                  <Label>Location</Label>
                  <RadioGroup value={location} onValueChange={(value) => setLocation(value as 'mainboard' | 'sideboard')}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="mainboard" id="mainboard" />
                      <Label htmlFor="mainboard" className="font-normal cursor-pointer">
                        Mainboard
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="sideboard" id="sideboard" />
                      <Label htmlFor="sideboard" className="font-normal cursor-pointer">
                        Sideboard
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Quantity Selection */}
                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-12 text-center font-semibold">{quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                      disabled={quantity >= maxQuantity}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    <span className="text-xs text-muted-foreground ml-2">
                      (Max: {maxQuantity})
                    </span>
                  </div>
                </div>

                {/* Add Button */}
                <Button onClick={handleAddToDeck} className="w-full" disabled={!selectedDeckId}>
                  Add to Deck
                </Button>
              </>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
