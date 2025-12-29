'use client';

import { memo } from 'react';
import { SynergyAnalysis as SynergyAnalysisType } from '@/lib/deck/synergyAnalyzer';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  Users,
  Coins,
  BookOpen,
  PlusCircle,
  Zap,
  ArrowRightLeft,
  TrendingUp,
  Target,
  Heart,
  TreeDeciduous,
  Wand2,
  Swords,
  RefreshCw,
  Package,
  BookMarked,
  GitBranch
} from 'lucide-react';

interface SynergyAnalysisProps {
  synergies: SynergyAnalysisType;
}

export const SynergyAnalysis = memo(function SynergyAnalysis({ synergies }: SynergyAnalysisProps) {
  const hasAnySynergy =
    synergies.tribalSynergies.length > 0 ||
    synergies.tokenSynergy !== null ||
    synergies.graveyardSynergy !== null ||
    synergies.counterSynergy !== null ||
    synergies.keywordClusters.length > 0 ||
    synergies.feedbackLoops.length > 0 ||
    synergies.thresholdSynergies.length > 0 ||
    synergies.sacrificeSynergy !== null ||
    synergies.manaAccelerationSynergy !== null ||
    synergies.spellslingerSynergy !== null ||
    synergies.attackTriggerSynergy !== null ||
    synergies.tapUntapSynergy !== null ||
    synergies.enchantmentArtifactSynergy !== null ||
    synergies.libraryTopSynergy !== null ||
    synergies.exileZoneSynergy !== null;

  if (!hasAnySynergy) {
    return (
      <div className="border rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5" />
          <h3 className="font-semibold">シナジー分析</h3>
        </div>
        <p className="text-sm text-muted-foreground text-center py-8">
          検出されたシナジーがありません
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4">
      {/* Header with overall score */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          <h3 className="font-semibold">シナジー分析</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">総合スコア</span>
          <Badge
            variant={synergies.overallScore >= 7 ? 'default' : synergies.overallScore >= 5 ? 'secondary' : 'outline'}
            className="text-base font-bold"
          >
            {synergies.overallScore}/10
          </Badge>
        </div>
      </div>

      <div className="space-y-4">
        {/* Feedback Loops */}
        {synergies.feedbackLoops.length > 0 && (
          <div className="border-l-4 border-l-purple-500 pl-3">
            <div className="flex items-center gap-2 mb-2">
              <ArrowRightLeft className="h-4 w-4 text-purple-500" />
              <h4 className="font-semibold text-sm">フィードバックループ（相互増幅）</h4>
            </div>
            <div className="space-y-2">
              {synergies.feedbackLoops.map((loop, index) => (
                <div key={index} className="bg-muted/30 rounded p-2 text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-medium">
                      {loop.cardA} ⇄ {loop.cardB}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {loop.score}/10
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-0.5">
                    <div>• {loop.cardA}: {loop.triggerA} → {loop.outputA}</div>
                    <div>• {loop.cardB}: {loop.triggerB} → {loop.outputB}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tribal Synergies */}
        {synergies.tribalSynergies.length > 0 && (
          <div className="border-l-4 border-l-blue-500 pl-3">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-blue-500" />
              <h4 className="font-semibold text-sm">部族シナジー</h4>
            </div>
            <div className="space-y-2">
              {synergies.tribalSynergies.map((tribal, index) => (
                <div key={index} className="bg-muted/30 rounded p-2 text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-medium">
                      {tribal.type} ({tribal.count}枚)
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {tribal.score}/10
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {tribal.cards.slice(0, 5).join(', ')}
                    {tribal.cards.length > 5 && ` 他${tribal.cards.length - 5}枚`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Token Synergy */}
        {synergies.tokenSynergy && (
          <div className="border-l-4 border-l-green-500 pl-3">
            <div className="flex items-center gap-2 mb-2">
              <Coins className="h-4 w-4 text-green-500" />
              <h4 className="font-semibold text-sm">トークンシナジー</h4>
              <Badge variant="outline" className="text-xs ml-auto">
                {synergies.tokenSynergy.score}/10
              </Badge>
            </div>
            <div className="space-y-1 text-sm">
              {synergies.tokenSynergy.producers.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">生成: </span>
                  {synergies.tokenSynergy.producers.join(', ')}
                </div>
              )}
              {synergies.tokenSynergy.payoffs.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">活用: </span>
                  {synergies.tokenSynergy.payoffs.join(', ')}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Graveyard Synergy */}
        {synergies.graveyardSynergy && (
          <div className="border-l-4 border-l-gray-500 pl-3">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-4 w-4 text-gray-500" />
              <h4 className="font-semibold text-sm">墓地シナジー</h4>
              <Badge variant="outline" className="text-xs ml-auto">
                {synergies.graveyardSynergy.score}/10
              </Badge>
            </div>
            <div className="space-y-1 text-sm">
              {synergies.graveyardSynergy.graveyardFillers.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">墓地肥やし: </span>
                  {synergies.graveyardSynergy.graveyardFillers.slice(0, 3).join(', ')}
                  {synergies.graveyardSynergy.graveyardFillers.length > 3 &&
                    ` 他${synergies.graveyardSynergy.graveyardFillers.length - 3}枚`}
                </div>
              )}
              {synergies.graveyardSynergy.graveyardPayoffs.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">墓地利用: </span>
                  {synergies.graveyardSynergy.graveyardPayoffs.slice(0, 3).join(', ')}
                  {synergies.graveyardSynergy.graveyardPayoffs.length > 3 &&
                    ` 他${synergies.graveyardSynergy.graveyardPayoffs.length - 3}枚`}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Counter Synergy */}
        {synergies.counterSynergy && (
          <div className="border-l-4 border-l-orange-500 pl-3">
            <div className="flex items-center gap-2 mb-2">
              <PlusCircle className="h-4 w-4 text-orange-500" />
              <h4 className="font-semibold text-sm">+1/+1カウンターシナジー</h4>
              <Badge variant="outline" className="text-xs ml-auto">
                {synergies.counterSynergy.score}/10
              </Badge>
            </div>
            <div className="space-y-1 text-sm">
              {synergies.counterSynergy.counterCards.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">カウンター: </span>
                  {synergies.counterSynergy.counterCards.slice(0, 3).join(', ')}
                  {synergies.counterSynergy.counterCards.length > 3 &&
                    ` 他${synergies.counterSynergy.counterCards.length - 3}枚`}
                </div>
              )}
              {synergies.counterSynergy.proliferateCards.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">増殖: </span>
                  {synergies.counterSynergy.proliferateCards.join(', ')}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Threshold Synergies */}
        {synergies.thresholdSynergies.length > 0 && (
          <div className="border-l-4 border-l-indigo-500 pl-3">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-indigo-500" />
              <h4 className="font-semibold text-sm">閾値シナジー</h4>
            </div>
            <div className="space-y-2">
              {synergies.thresholdSynergies.map((threshold, index) => (
                <div key={index} className="bg-muted/30 rounded p-2 text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-medium">
                      {threshold.name}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          threshold.achievementLikelihood === 'high'
                            ? 'default'
                            : threshold.achievementLikelihood === 'medium'
                            ? 'secondary'
                            : 'outline'
                        }
                        className="text-xs"
                      >
                        {threshold.currentCount}/{threshold.requiredCount}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {threshold.score}/10
                      </Badge>
                    </div>
                  </div>
                  {threshold.payoffs.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      <span className="font-semibold">恩恵: </span>
                      {threshold.payoffs.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sacrifice Synergy */}
        {synergies.sacrificeSynergy && (
          <div className="border-l-4 border-l-red-500 pl-3">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="h-4 w-4 text-red-500" />
              <h4 className="font-semibold text-sm">生け贄シナジー（アリストクラット）</h4>
              <Badge variant="outline" className="text-xs ml-auto">
                {synergies.sacrificeSynergy.score}/10
              </Badge>
            </div>
            <div className="space-y-1 text-sm">
              {synergies.sacrificeSynergy.outlets.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">生け贄先: </span>
                  {synergies.sacrificeSynergy.outlets.join(', ')}
                </div>
              )}
              {synergies.sacrificeSynergy.fodder.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">生け贄要員: </span>
                  {synergies.sacrificeSynergy.fodder.join(', ')}
                </div>
              )}
              {synergies.sacrificeSynergy.payoffs.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">死亡誘発: </span>
                  {synergies.sacrificeSynergy.payoffs.join(', ')}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mana Acceleration Synergy */}
        {synergies.manaAccelerationSynergy && (
          <div className="border-l-4 border-l-emerald-500 pl-3">
            <div className="flex items-center gap-2 mb-2">
              <TreeDeciduous className="h-4 w-4 text-emerald-500" />
              <h4 className="font-semibold text-sm">マナ加速シナジー（ランプ）</h4>
              <Badge variant="outline" className="text-xs ml-auto">
                {synergies.manaAccelerationSynergy.score}/10
              </Badge>
            </div>
            <div className="space-y-1 text-sm">
              {synergies.manaAccelerationSynergy.manaCreatures.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">マナクリーチャー: </span>
                  {synergies.manaAccelerationSynergy.manaCreatures.join(', ')}
                </div>
              )}
              {synergies.manaAccelerationSynergy.manaArtifacts.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">マナアーティファクト: </span>
                  {synergies.manaAccelerationSynergy.manaArtifacts.join(', ')}
                </div>
              )}
              {synergies.manaAccelerationSynergy.landRamp.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">土地サーチ: </span>
                  {synergies.manaAccelerationSynergy.landRamp.join(', ')}
                </div>
              )}
              {synergies.manaAccelerationSynergy.extraLandPlays.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">追加土地プレイ: </span>
                  {synergies.manaAccelerationSynergy.extraLandPlays.join(', ')}
                </div>
              )}
              {synergies.manaAccelerationSynergy.costReduction.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">コスト軽減: </span>
                  {synergies.manaAccelerationSynergy.costReduction.join(', ')}
                </div>
              )}
              {synergies.manaAccelerationSynergy.payoffs.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">高マナ域カード: </span>
                  {[...new Set(synergies.manaAccelerationSynergy.payoffs)].slice(0, 5).join(', ')}
                  {[...new Set(synergies.manaAccelerationSynergy.payoffs)].length > 5 &&
                    ` 他${[...new Set(synergies.manaAccelerationSynergy.payoffs)].length - 5}枚`}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Spellslinger Synergy */}
        {synergies.spellslingerSynergy && (
          <div className="border-l-4 border-l-violet-500 pl-3">
            <div className="flex items-center gap-2 mb-2">
              <Wand2 className="h-4 w-4 text-violet-500" />
              <h4 className="font-semibold text-sm">スペルスリンガー（インスタント・ソーサリー）</h4>
              <Badge variant="outline" className="text-xs ml-auto">
                {synergies.spellslingerSynergy.score}/10
              </Badge>
            </div>
            <div className="space-y-1 text-sm">
              <div className="text-xs">
                <span className="text-muted-foreground">インスタント・ソーサリー: </span>
                {synergies.spellslingerSynergy.instantsAndSorceries}枚
              </div>
              {synergies.spellslingerSynergy.spellTriggers.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">呪文キャスト誘発: </span>
                  {synergies.spellslingerSynergy.spellTriggers.join(', ')}
                </div>
              )}
              {synergies.spellslingerSynergy.spellCopiers.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">呪文コピー: </span>
                  {synergies.spellslingerSynergy.spellCopiers.join(', ')}
                </div>
              )}
              {synergies.spellslingerSynergy.spellRecursion.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">墓地再利用: </span>
                  {synergies.spellslingerSynergy.spellRecursion.join(', ')}
                </div>
              )}
              {synergies.spellslingerSynergy.cardAdvantage.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">カードアドバンテージ: </span>
                  {synergies.spellslingerSynergy.cardAdvantage.join(', ')}
                </div>
              )}
              {synergies.spellslingerSynergy.costReduction.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">コスト軽減: </span>
                  {synergies.spellslingerSynergy.costReduction.join(', ')}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Attack Trigger Synergy */}
        {synergies.attackTriggerSynergy && (
          <div className="border-l-4 border-l-orange-500 pl-3">
            <div className="flex items-center gap-2 mb-2">
              <Swords className="h-4 w-4 text-orange-500" />
              <h4 className="font-semibold text-sm">攻撃トリガー（攻撃誘発）</h4>
              <Badge variant="outline" className="text-xs ml-auto">
                {synergies.attackTriggerSynergy.score}/10
              </Badge>
            </div>
            <div className="space-y-1 text-sm">
              <div className="text-xs">
                <span className="text-muted-foreground">アタッカー数: </span>
                {synergies.attackTriggerSynergy.attackers}体
              </div>
              {synergies.attackTriggerSynergy.attackTriggers.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">攻撃トリガー: </span>
                  {synergies.attackTriggerSynergy.attackTriggers.join(', ')}
                </div>
              )}
              {synergies.attackTriggerSynergy.raidCards.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">Raid: </span>
                  {synergies.attackTriggerSynergy.raidCards.join(', ')}
                </div>
              )}
              {synergies.attackTriggerSynergy.enablers.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">攻撃補助: </span>
                  {synergies.attackTriggerSynergy.enablers.join(', ')}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tap/Untap Synergy */}
        {synergies.tapUntapSynergy && (
          <div className="border-l-4 border-l-cyan-500 pl-3">
            <div className="flex items-center gap-2 mb-2">
              <RefreshCw className="h-4 w-4 text-cyan-500" />
              <h4 className="font-semibold text-sm">タップ/アンタップ（起動型能力活用）</h4>
              <Badge variant="outline" className="text-xs ml-auto">
                {synergies.tapUntapSynergy.score}/10
              </Badge>
            </div>
            <div className="space-y-1 text-sm">
              {synergies.tapUntapSynergy.tapAbilities.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">タップ能力: </span>
                  {synergies.tapUntapSynergy.tapAbilities.join(', ')}
                </div>
              )}
              {synergies.tapUntapSynergy.untappers.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">アンタップ手段: </span>
                  {synergies.tapUntapSynergy.untappers.join(', ')}
                </div>
              )}
              {synergies.tapUntapSynergy.tapTriggers.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">タップ誘発: </span>
                  {synergies.tapUntapSynergy.tapTriggers.join(', ')}
                </div>
              )}
              {synergies.tapUntapSynergy.vigilanceCards.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">警戒持ち: </span>
                  {synergies.tapUntapSynergy.vigilanceCards.join(', ')}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Enchantment/Artifact Synergy */}
        {synergies.enchantmentArtifactSynergy && (
          <div className="border-l-4 border-l-fuchsia-500 pl-3">
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-4 w-4 text-fuchsia-500" />
              <h4 className="font-semibold text-sm">エンチャント/アーティファクトテーマ</h4>
              <Badge variant="outline" className="text-xs ml-auto">
                {synergies.enchantmentArtifactSynergy.score}/10
              </Badge>
            </div>
            <div className="space-y-1 text-sm">
              <div className="text-xs">
                <span className="text-muted-foreground">エンチャント数: </span>
                {synergies.enchantmentArtifactSynergy.enchantmentCount}枚 /
                <span className="text-muted-foreground"> アーティファクト数: </span>
                {synergies.enchantmentArtifactSynergy.artifactCount}枚
              </div>
              {synergies.enchantmentArtifactSynergy.enchantmentTriggers.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">エンチャント誘発 (Constellation等): </span>
                  {synergies.enchantmentArtifactSynergy.enchantmentTriggers.join(', ')}
                </div>
              )}
              {synergies.enchantmentArtifactSynergy.enchantmentPayoffs.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">エンチャント参照: </span>
                  {synergies.enchantmentArtifactSynergy.enchantmentPayoffs.join(', ')}
                </div>
              )}
              {synergies.enchantmentArtifactSynergy.artifactTriggers.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">アーティファクト誘発: </span>
                  {synergies.enchantmentArtifactSynergy.artifactTriggers.join(', ')}
                </div>
              )}
              {synergies.enchantmentArtifactSynergy.artifactPayoffs.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">アーティファクト参照 (Affinity/Improvise等): </span>
                  {synergies.enchantmentArtifactSynergy.artifactPayoffs.join(', ')}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Library Top Synergy */}
        {synergies.libraryTopSynergy && (
          <div className="border-l-4 border-l-sky-500 pl-3">
            <div className="flex items-center gap-2 mb-2">
              <BookMarked className="h-4 w-4 text-sky-500" />
              <h4 className="font-semibold text-sm">ライブラリートップ操作</h4>
              <Badge variant="outline" className="text-xs ml-auto">
                {synergies.libraryTopSynergy.score}/10
              </Badge>
            </div>
            <div className="space-y-1 text-sm">
              {synergies.libraryTopSynergy.topManipulators.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">トップ操作 (Scry/Brainstorm等): </span>
                  {synergies.libraryTopSynergy.topManipulators.join(', ')}
                </div>
              )}
              {synergies.libraryTopSynergy.topPayoffs.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">トップ参照 (Miracle等): </span>
                  {synergies.libraryTopSynergy.topPayoffs.join(', ')}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Exile Zone Synergy */}
        {synergies.exileZoneSynergy && (
          <div className="border-l-4 border-l-amber-500 pl-3">
            <div className="flex items-center gap-2 mb-2">
              <GitBranch className="h-4 w-4 text-amber-500" />
              <h4 className="font-semibold text-sm">除外ゾーンシナジー</h4>
              <Badge variant="outline" className="text-xs ml-auto">
                {synergies.exileZoneSynergy.score}/10
              </Badge>
            </div>
            <div className="space-y-1 text-sm">
              {synergies.exileZoneSynergy.blinkEffects.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">ブリンク効果 (Flicker): </span>
                  {synergies.exileZoneSynergy.blinkEffects.join(', ')}
                </div>
              )}
              {synergies.exileZoneSynergy.exilePayoffs.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">除外参照 (Adventure/Foretell/Escape等): </span>
                  {synergies.exileZoneSynergy.exilePayoffs.join(', ')}
                </div>
              )}
              {synergies.exileZoneSynergy.exilers.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">除外効果: </span>
                  {synergies.exileZoneSynergy.exilers.join(', ')}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Keyword Clusters */}
        {synergies.keywordClusters.length > 0 && (
          <div className="border-l-4 border-l-yellow-500 pl-3">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <h4 className="font-semibold text-sm">キーワード集中</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {synergies.keywordClusters.map((cluster, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {cluster.keyword} ({cluster.count}枚)
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
