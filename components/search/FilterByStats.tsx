'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FilterByStatsProps {
  cmcMin?: number;
  cmcMax?: number;
  onCMCChange: (min?: number, max?: number) => void;
}

export function FilterByStats({ cmcMin, cmcMax, onCMCChange }: FilterByStatsProps) {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm">Mana Cost (CMC)</h3>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label htmlFor="cmc-min" className="text-xs text-muted-foreground">
            Min
          </Label>
          <Input
            id="cmc-min"
            type="number"
            min="0"
            placeholder="0"
            value={cmcMin ?? ''}
            onChange={(e) => {
              const value = e.target.value ? parseInt(e.target.value, 10) : undefined;
              onCMCChange(value, cmcMax);
            }}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="cmc-max" className="text-xs text-muted-foreground">
            Max
          </Label>
          <Input
            id="cmc-max"
            type="number"
            min="0"
            placeholder="10"
            value={cmcMax ?? ''}
            onChange={(e) => {
              const value = e.target.value ? parseInt(e.target.value, 10) : undefined;
              onCMCChange(cmcMin, value);
            }}
          />
        </div>
      </div>
    </div>
  );
}
