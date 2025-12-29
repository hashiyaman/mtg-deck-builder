'use client';

import { Rarity } from '@/types/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface FilterByRarityProps {
  selectedRarities: Rarity[];
  onRarityChange: (rarities: Rarity[]) => void;
}

const RARITIES: Rarity[] = ['common', 'uncommon', 'rare', 'mythic'];

export function FilterByRarity({ selectedRarities, onRarityChange }: FilterByRarityProps) {
  const handleRarityToggle = (rarity: Rarity) => {
    if (selectedRarities.includes(rarity)) {
      onRarityChange(selectedRarities.filter((r) => r !== rarity));
    } else {
      onRarityChange([...selectedRarities, rarity]);
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm">Rarity</h3>
      <div className="space-y-2">
        {RARITIES.map((rarity) => (
          <div key={rarity} className="flex items-center space-x-2">
            <Checkbox
              id={`rarity-${rarity}`}
              checked={selectedRarities.includes(rarity)}
              onCheckedChange={() => handleRarityToggle(rarity)}
            />
            <Label htmlFor={`rarity-${rarity}`} className="cursor-pointer capitalize">
              {rarity}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}
