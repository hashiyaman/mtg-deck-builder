'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface FilterByTypeProps {
  selectedTypes: string[];
  onTypeChange: (types: string[]) => void;
}

const CARD_TYPES = [
  'Creature',
  'Instant',
  'Sorcery',
  'Enchantment',
  'Artifact',
  'Planeswalker',
  'Land',
];

export function FilterByType({ selectedTypes, onTypeChange }: FilterByTypeProps) {
  const handleTypeToggle = (type: string) => {
    if (selectedTypes.includes(type)) {
      onTypeChange(selectedTypes.filter((t) => t !== type));
    } else {
      onTypeChange([...selectedTypes, type]);
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm">Card Type</h3>
      <div className="space-y-2">
        {CARD_TYPES.map((type) => (
          <div key={type} className="flex items-center space-x-2">
            <Checkbox
              id={`type-${type}`}
              checked={selectedTypes.includes(type)}
              onCheckedChange={() => handleTypeToggle(type)}
            />
            <Label htmlFor={`type-${type}`} className="cursor-pointer">
              {type}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}
