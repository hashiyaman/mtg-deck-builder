'use client';

import { Color } from '@/types/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface FilterByColorProps {
  selectedColors: Color[];
  onColorChange: (colors: Color[]) => void;
}

const COLORS: { value: Color; label: string; bg: string }[] = [
  { value: 'W', label: 'White', bg: 'bg-gray-100 border-gray-300' },
  { value: 'U', label: 'Blue', bg: 'bg-blue-200 border-blue-400' },
  { value: 'B', label: 'Black', bg: 'bg-gray-800 border-gray-900 text-white' },
  { value: 'R', label: 'Red', bg: 'bg-red-200 border-red-400' },
  { value: 'G', label: 'Green', bg: 'bg-green-200 border-green-400' },
];

export function FilterByColor({ selectedColors, onColorChange }: FilterByColorProps) {
  const handleColorToggle = (color: Color) => {
    if (selectedColors.includes(color)) {
      onColorChange(selectedColors.filter((c) => c !== color));
    } else {
      onColorChange([...selectedColors, color]);
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm">Color</h3>
      <div className="space-y-2">
        {COLORS.map((color) => (
          <div key={color.value} className="flex items-center space-x-2">
            <Checkbox
              id={`color-${color.value}`}
              checked={selectedColors.includes(color.value)}
              onCheckedChange={() => handleColorToggle(color.value)}
            />
            <Label
              htmlFor={`color-${color.value}`}
              className="cursor-pointer flex items-center gap-2"
            >
              <span className={`w-4 h-4 rounded-full border ${color.bg}`} />
              {color.label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}
