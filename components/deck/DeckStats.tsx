'use client';

import { memo } from 'react';
import { DeckStats as DeckStatsType } from '@/types/deck';
import { Badge } from '@/components/ui/badge';

interface DeckStatsProps {
  stats: DeckStatsType;
}

export const DeckStats = memo(function DeckStats({ stats }: DeckStatsProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Total Cards */}
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">合計枚数</p>
          <p className="text-2xl font-bold">{stats.totalCards}</p>
        </div>

        {/* Average CMC */}
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">平均マナコスト</p>
          <p className="text-2xl font-bold">{stats.averageCMC.toFixed(2)}</p>
        </div>

        {/* Mainboard */}
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">メインボード</p>
          <p className="text-2xl font-bold">
            {stats.cardCount.mainboard}
            {stats.cardCount.mainboard !== 60 && (
              <Badge variant="destructive" className="ml-2 text-xs">
                あと {60 - stats.cardCount.mainboard} 枚
              </Badge>
            )}
          </p>
        </div>

        {/* Sideboard */}
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">サイドボード</p>
          <p className="text-2xl font-bold">{stats.cardCount.sideboard}</p>
        </div>
      </div>

      {/* Card Types */}
      <div className="border rounded-lg p-4">
        <h3 className="font-semibold mb-3">カードタイプ</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">クリーチャー:</span>
            <span className="font-semibold">{stats.typeBreakdown.creature}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">インスタント:</span>
            <span className="font-semibold">{stats.typeBreakdown.instant}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">ソーサリー:</span>
            <span className="font-semibold">{stats.typeBreakdown.sorcery}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">エンチャント:</span>
            <span className="font-semibold">{stats.typeBreakdown.enchantment}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">アーティファクト:</span>
            <span className="font-semibold">{stats.typeBreakdown.artifact}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">プレインズウォーカー:</span>
            <span className="font-semibold">{stats.typeBreakdown.planeswalker}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">土地:</span>
            <span className="font-semibold">{stats.typeBreakdown.land}</span>
          </div>
        </div>
      </div>

      {/* Color Distribution */}
      <div className="border rounded-lg p-4">
        <h3 className="font-semibold mb-3">色分布</h3>
        <div className="space-y-3">
          {/* Color Requirements (Spells) */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">色要求（呪文）</p>
            <div className="grid grid-cols-3 gap-2 text-sm">
              {stats.colorDistribution.W > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">⚪ 白:</span>
                  <span className="font-semibold">{stats.colorDistribution.W}</span>
                </div>
              )}
              {stats.colorDistribution.U > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">🔵 青:</span>
                  <span className="font-semibold">{stats.colorDistribution.U}</span>
                </div>
              )}
              {stats.colorDistribution.B > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">⚫ 黒:</span>
                  <span className="font-semibold">{stats.colorDistribution.B}</span>
                </div>
              )}
              {stats.colorDistribution.R > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">🔴 赤:</span>
                  <span className="font-semibold">{stats.colorDistribution.R}</span>
                </div>
              )}
              {stats.colorDistribution.G > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">🟢 緑:</span>
                  <span className="font-semibold">{stats.colorDistribution.G}</span>
                </div>
              )}
              {stats.colorDistribution.C > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">◇ 無色:</span>
                  <span className="font-semibold">{stats.colorDistribution.C}</span>
                </div>
              )}
              {stats.colorDistribution.multicolor > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">🌈 多色:</span>
                  <span className="font-semibold">{stats.colorDistribution.multicolor}</span>
                </div>
              )}
            </div>
          </div>

          {/* Mana Production (Lands) */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">色供給（土地）</p>
            <div className="space-y-2 text-xs">
              {(['W', 'U', 'B', 'R', 'G', 'C'] as const).map((color) => {
                const total = stats.manaProduction[color];
                const breakdown = stats.detailedManaProduction[color];
                if (total === 0) return null;

                const colorLabels: Record<string, string> = {
                  W: '⚪ 白',
                  U: '🔵 青',
                  B: '⚫ 黒',
                  R: '🔴 赤',
                  G: '🟢 緑',
                  C: '◇ 無色',
                };

                return (
                  <div key={color} className="border-l-2 pl-2">
                    <div className="flex justify-between font-semibold mb-1">
                      <span className="text-muted-foreground">{colorLabels[color]}:</span>
                      <span>{total}枚</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground ml-2">
                      {breakdown.untapped > 0 && (
                        <div className="flex justify-between">
                          <span>アンタップ:</span>
                          <span>{breakdown.untapped}</span>
                        </div>
                      )}
                      {breakdown.conditional > 0 && (
                        <div className="flex justify-between">
                          <span>条件付:</span>
                          <span>{breakdown.conditional}</span>
                        </div>
                      )}
                      {breakdown.tapped > 0 && (
                        <div className="flex justify-between">
                          <span>タップイン:</span>
                          <span>{breakdown.tapped}</span>
                        </div>
                      )}
                      {breakdown.restricted > 0 && (
                        <div className="flex justify-between">
                          <span>制限付:</span>
                          <span>{breakdown.restricted}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
