'use client';

import { useSearchStore } from '@/store/searchStore';
import { Button } from '@/components/ui/button';
import { FilterByColor } from './FilterByColor';
import { FilterByType } from './FilterByType';
import { FilterByRarity } from './FilterByRarity';
import { FilterByStats } from './FilterByStats';
import { Color, Rarity } from '@/types/card';

export function SearchFilters() {
  const { filters, setFilter, clearFilters, search } = useSearchStore();

  const handleColorChange = (colors: Color[]) => {
    setFilter('colors', colors.length > 0 ? colors : undefined);
  };

  const handleTypeChange = (types: string[]) => {
    setFilter('types', types.length > 0 ? types : undefined);
  };

  const handleRarityChange = (rarities: Rarity[]) => {
    setFilter('rarity', rarities.length > 0 ? rarities : undefined);
  };

  const handleCMCChange = (min?: number, max?: number) => {
    if (min !== undefined || max !== undefined) {
      setFilter('cmc', { min, max });
    } else {
      setFilter('cmc', undefined);
    }
  };

  const handleApplyFilters = () => {
    search();
  };

  const handleClearFilters = () => {
    clearFilters();
  };

  return (
    <div className="w-64 border-r bg-muted/10 p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Filters</h2>
        <Button variant="ghost" size="sm" onClick={handleClearFilters}>
          Clear
        </Button>
      </div>

      <FilterByColor
        selectedColors={filters.colors || []}
        onColorChange={handleColorChange}
      />

      <FilterByType
        selectedTypes={filters.types || []}
        onTypeChange={handleTypeChange}
      />

      <FilterByRarity
        selectedRarities={filters.rarity || []}
        onRarityChange={handleRarityChange}
      />

      <FilterByStats
        cmcMin={filters.cmc?.min}
        cmcMax={filters.cmc?.max}
        onCMCChange={handleCMCChange}
      />

      <Button onClick={handleApplyFilters} className="w-full">
        Apply Filters
      </Button>
    </div>
  );
}
