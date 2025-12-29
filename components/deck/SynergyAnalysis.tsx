'use client';

import { memo, useMemo, Suspense, lazy } from 'react';
import { SynergyAnalysis as SynergyAnalysisType } from '@/lib/deck/synergyAnalyzer';
import { DeckCard } from '@/types/deck';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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
  GitBranch,
  HelpCircle,
  Layers,
  Box,
  Swords as Combat,
  Shuffle,
  Network
} from 'lucide-react';

// Lazy load the network graph component
const SynergyNetwork = lazy(() =>
  import('./SynergyNetwork').then((mod) => ({ default: mod.SynergyNetwork }))
);

interface SynergyAnalysisProps {
  synergies: SynergyAnalysisType;
  cards?: DeckCard[];
}

/**
 * Helper component to display a label with a tooltip explanation
 */
const LabelWithTooltip = ({ label, tooltip }: { label: string; tooltip: string }) => (
  <Tooltip delayDuration={300}>
    <TooltipTrigger asChild>
      <span className="inline-flex items-center gap-1 cursor-help">
        {label}
        <HelpCircle className="h-3 w-3 text-muted-foreground" />
      </span>
    </TooltipTrigger>
    <TooltipContent side="top" className="max-w-xs">
      <p>{tooltip}</p>
    </TooltipContent>
  </Tooltip>
);

/**
 * Category section header component
 */
const CategoryHeader = ({ title, description }: { title: string; description: string }) => (
  <div className="mb-3 pb-2 border-b">
    <h4 className="font-semibold text-sm flex items-center gap-2">
      {title}
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p>{description}</p>
        </TooltipContent>
      </Tooltip>
    </h4>
  </div>
);

/**
 * Define synergy categories
 */
interface SynergyCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  hasSynergy: (synergies: SynergyAnalysisType) => boolean;
  getMaxScore: (synergies: SynergyAnalysisType) => number;
}

const SYNERGY_CATEGORIES: SynergyCategory[] = [
  {
    id: 'core',
    title: 'コア戦略',
    description: 'デッキの核となる強力な相乗効果。フィードバックループや部族テーマなど、デッキ全体を支える戦略です。',
    icon: Layers,
    hasSynergy: (s) => s.feedbackLoops.length > 0 || s.tribalSynergies.length > 0,
    getMaxScore: (s) => Math.max(
      ...s.feedbackLoops.map(f => f.score),
      ...s.tribalSynergies.map(t => t.score),
      0
    ),
  },
  {
    id: 'tokens',
    title: 'トークン戦略',
    description: 'クリーチャー・トークン、宝物、食物など、トークンを生成・活用する戦略です。',
    icon: Coins,
    hasSynergy: (s) =>
      s.tokenSynergy !== null ||
      s.treasureSynergy !== null ||
      s.foodSynergy !== null,
    getMaxScore: (s) => Math.max(
      s.tokenSynergy?.score ?? 0,
      s.treasureSynergy?.score ?? 0,
      s.foodSynergy?.score ?? 0,
      0
    ),
  },
  {
    id: 'graveyard',
    title: '墓地戦略',
    description: '墓地を活用する戦略。墓地肥やし、蘇生、生け贄などで墓地をリソースとして利用します。',
    icon: BookOpen,
    hasSynergy: (s) =>
      s.graveyardSynergy !== null ||
      s.sacrificeSynergy !== null,
    getMaxScore: (s) => Math.max(
      s.graveyardSynergy?.score ?? 0,
      s.sacrificeSynergy?.score ?? 0,
      0
    ),
  },
  {
    id: 'counters',
    title: 'カウンター戦略',
    description: '+1/+1カウンター、エネルギーカウンター、閾値など、カウンターを活用する戦略です。',
    icon: PlusCircle,
    hasSynergy: (s) =>
      s.counterSynergy !== null ||
      s.energySynergy !== null ||
      s.thresholdSynergies.length > 0,
    getMaxScore: (s) => Math.max(
      s.counterSynergy?.score ?? 0,
      s.energySynergy?.score ?? 0,
      ...s.thresholdSynergies.map(t => t.score),
      0
    ),
  },
  {
    id: 'mana',
    title: 'マナ戦略',
    description: 'マナ加速やランドフォールなど、マナ・土地を活用する戦略です。',
    icon: TreeDeciduous,
    hasSynergy: (s) =>
      s.manaAccelerationSynergy !== null ||
      s.landfallSynergy !== null,
    getMaxScore: (s) => Math.max(
      s.manaAccelerationSynergy?.score ?? 0,
      s.landfallSynergy?.score ?? 0,
      0
    ),
  },
  {
    id: 'spells',
    title: '呪文戦略',
    description: 'インスタント・ソーサリーを活用する戦略。スペルスリンガーやストームデッキです。',
    icon: Wand2,
    hasSynergy: (s) =>
      s.spellslingerSynergy !== null ||
      s.stormSynergy !== null,
    getMaxScore: (s) => Math.max(
      s.spellslingerSynergy?.score ?? 0,
      s.stormSynergy?.score ?? 0,
      0
    ),
  },
  {
    id: 'equipment',
    title: '装備/強化戦略',
    description: '装備品やオーラでクリーチャーを強化する戦略。ヴォルトロンやボーグルデッキです。',
    icon: Package,
    hasSynergy: (s) =>
      s.equipmentAuraSynergy !== null ||
      s.enchantmentArtifactSynergy !== null,
    getMaxScore: (s) => Math.max(
      s.equipmentAuraSynergy?.score ?? 0,
      s.enchantmentArtifactSynergy?.score ?? 0,
      0
    ),
  },
  {
    id: 'combat',
    title: '戦闘戦略',
    description: '攻撃トリガー、タップ能力、ライフゲインなど、戦闘やクリーチャー中心の戦略です。',
    icon: Combat,
    hasSynergy: (s) =>
      s.attackTriggerSynergy !== null ||
      s.tapUntapSynergy !== null ||
      s.lifegainSynergy !== null,
    getMaxScore: (s) => Math.max(
      s.attackTriggerSynergy?.score ?? 0,
      s.tapUntapSynergy?.score ?? 0,
      s.lifegainSynergy?.score ?? 0,
      0
    ),
  },
  {
    id: 'zones',
    title: 'ゾーン操作',
    description: 'ライブラリーのトップ、除外ゾーン、戦場出入りなど、特殊なゾーンを活用する戦略です。',
    icon: Shuffle,
    hasSynergy: (s) =>
      s.libraryTopSynergy !== null ||
      s.exileZoneSynergy !== null ||
      s.etbSynergy !== null,
    getMaxScore: (s) => Math.max(
      s.libraryTopSynergy?.score ?? 0,
      s.exileZoneSynergy?.score ?? 0,
      s.etbSynergy?.score ?? 0,
      0
    ),
  },
  {
    id: 'keywords',
    title: 'キーワード能力',
    description: '同じキーワード能力を持つカードが多数含まれています。',
    icon: Zap,
    hasSynergy: (s) => s.keywordClusters.length > 0,
    getMaxScore: () => 5, // Keywords don't have individual scores
  },
];

export const SynergyAnalysis = memo(function SynergyAnalysis({ synergies, cards }: SynergyAnalysisProps) {
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
    synergies.exileZoneSynergy !== null ||
    synergies.etbSynergy !== null ||
    synergies.landfallSynergy !== null ||
    synergies.energySynergy !== null ||
    synergies.treasureSynergy !== null ||
    synergies.stormSynergy !== null ||
    synergies.equipmentAuraSynergy !== null ||
    synergies.lifegainSynergy !== null ||
    synergies.foodSynergy !== null;

  // Calculate which categories should be open by default (score >= 7)
  const defaultOpenCategories = useMemo(() => {
    return SYNERGY_CATEGORIES
      .filter(cat => cat.hasSynergy(synergies) && cat.getMaxScore(synergies) >= 7)
      .map(cat => cat.id);
  }, [synergies]);

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
    <TooltipProvider>
    <div className="border rounded-lg p-4">
      {/* Header with overall score */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          <h3 className="font-semibold">シナジー分析</h3>
        </div>
        <div className="flex items-center gap-2">
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <span className="text-sm text-muted-foreground cursor-help inline-flex items-center gap-1">
                総合スコア
                <HelpCircle className="h-3 w-3" />
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <div className="space-y-1">
                <p className="font-semibold">シナジースコアについて</p>
                <p>1-10の範囲で、デッキ内のカード間の相乗効果の強さを評価します。</p>
                <ul className="text-xs space-y-0.5 mt-2">
                  <li>• 7-10: 強力なシナジー（デッキの核となる戦略）</li>
                  <li>• 5-6: 中程度のシナジー（有効な補助戦略）</li>
                  <li>• 1-4: 弱いシナジー（改善の余地あり）</li>
                </ul>
              </div>
            </TooltipContent>
          </Tooltip>
          <Badge
            variant={synergies.overallScore >= 7 ? 'default' : synergies.overallScore >= 5 ? 'secondary' : 'outline'}
            className="text-base font-bold"
          >
            {synergies.overallScore}/10
          </Badge>
        </div>
      </div>

      {/* Categorized Synergies */}
      <Accordion
        type="multiple"
        defaultValue={defaultOpenCategories}
        className="space-y-2"
      >
        {/* Core Strategy Category */}
        {SYNERGY_CATEGORIES[0].hasSynergy(synergies) && (
          <AccordionItem value="core" className="border rounded-lg px-3">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                <span className="font-semibold">コア戦略</span>
                <Badge variant="outline" className="ml-2 text-xs">
                  最高スコア: {SYNERGY_CATEGORIES[0].getMaxScore(synergies)}/10
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
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
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Token Strategy Category */}
        {SYNERGY_CATEGORIES[1].hasSynergy(synergies) && (
          <AccordionItem value="tokens" className="border rounded-lg px-3">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4" />
                <span className="font-semibold">トークン戦略</span>
                <Badge variant="outline" className="ml-2 text-xs">
                  最高スコア: {SYNERGY_CATEGORIES[1].getMaxScore(synergies)}/10
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
        {/* Token Synergy */}
        {synergies.tokenSynergy && (
          <div className="border-l-4 border-l-green-500 pl-3">
            <div className="flex items-center gap-2 mb-2">
              <Coins className="h-4 w-4 text-green-500" />
              <h4 className="font-semibold text-sm">クリーチャートークン</h4>
              <Badge variant="outline" className="text-xs ml-auto">
                {synergies.tokenSynergy.score}/10
              </Badge>
            </div>
            <div className="space-y-1 text-sm">
              {synergies.tokenSynergy.producers.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">
                    <LabelWithTooltip
                      label="生成:"
                      tooltip="トークンを生成するカード。クリーチャー・トークンやその他のトークンを戦場に出す効果を持ちます。"
                    />
                  </span>{' '}
                  {synergies.tokenSynergy.producers.join(', ')}
                </div>
              )}
              {synergies.tokenSynergy.payoffs.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">
                    <LabelWithTooltip
                      label="活用:"
                      tooltip="トークンや他のパーマネントを活用するカード。トークンの数を参照したり、トークンを生け贄に捧げることで効果を発揮します。"
                    />
                  </span>{' '}
                  {synergies.tokenSynergy.payoffs.join(', ')}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Treasure Synergy */}
        {synergies.treasureSynergy && (
          <div className="border-l-4 border-l-yellow-600 pl-3">
            <div className="flex items-center gap-2 mb-2">
              <Coins className="h-4 w-4 text-yellow-600" />
              <h4 className="font-semibold text-sm">宝物トークン</h4>
              <Badge variant="outline" className="text-xs ml-auto">
                {synergies.treasureSynergy.score}/10
              </Badge>
            </div>
            <div className="space-y-1 text-sm">
              {synergies.treasureSynergy.treasureProducers.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">
                    <LabelWithTooltip
                      label="宝物生成:"
                      tooltip="宝物トークンを生成するカード。一時的なマナ加速やアーティファクトシナジーに利用できます。"
                    />
                  </span>{' '}
                  {synergies.treasureSynergy.treasureProducers.join(', ')}
                </div>
              )}
              {synergies.treasureSynergy.treasurePayoffs.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">
                    <LabelWithTooltip
                      label="宝物活用:"
                      tooltip="宝物トークンや宝物を生け贄に捧げることで恩恵を得るカード。"
                    />
                  </span>{' '}
                  {synergies.treasureSynergy.treasurePayoffs.join(', ')}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Food Synergy */}
        {synergies.foodSynergy && (
          <div className="border-l-4 border-l-amber-600 pl-3">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="h-4 w-4 text-amber-600" />
              <h4 className="font-semibold text-sm">食物トークン</h4>
              <Badge variant="outline" className="text-xs ml-auto">
                {synergies.foodSynergy.score}/10
              </Badge>
            </div>
            <div className="space-y-1 text-sm">
              {synergies.foodSynergy.foodProducers.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">
                    <LabelWithTooltip
                      label="食物生成:"
                      tooltip="食物トークンを生成するカード。ライフゲインやアーティファクトシナジーに利用できます。"
                    />
                  </span>{' '}
                  {synergies.foodSynergy.foodProducers.join(', ')}
                </div>
              )}
              {synergies.foodSynergy.foodPayoffs.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">
                    <LabelWithTooltip
                      label="食物活用:"
                      tooltip="食物トークンを活用するカード。アーティファクトや生け贄シナジーと組み合わせて使います。"
                    />
                  </span>{' '}
                  {synergies.foodSynergy.foodPayoffs.join(', ')}
                </div>
              )}
              {synergies.foodSynergy.sacrificeOutlets.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">
                    <LabelWithTooltip
                      label="生け贄先:"
                      tooltip="食物トークンを生け贄に捧げられる追加の手段。"
                    />
                  </span>{' '}
                  {synergies.foodSynergy.sacrificeOutlets.join(', ')}
                </div>
              )}
            </div>
          </div>
        )}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Graveyard Strategy Category */}
        {SYNERGY_CATEGORIES[2].hasSynergy(synergies) && (
          <AccordionItem value="graveyard" className="border rounded-lg px-3">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span className="font-semibold">墓地戦略</span>
                <Badge variant="outline" className="ml-2 text-xs">
                  最高スコア: {SYNERGY_CATEGORIES[2].getMaxScore(synergies)}/10
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">

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
                  <span className="text-muted-foreground">
                    <LabelWithTooltip
                      label="墓地肥やし:"
                      tooltip="墓地にカードを送る効果を持つカード。ミル、ディスカード、自己ミル、サイクリングなどで墓地を充実させます。"
                    />
                  </span>{' '}
                  {synergies.graveyardSynergy.graveyardFillers.slice(0, 3).join(', ')}
                  {synergies.graveyardSynergy.graveyardFillers.length > 3 &&
                    ` 他${synergies.graveyardSynergy.graveyardFillers.length - 3}枚`}
                </div>
              )}
              {synergies.graveyardSynergy.graveyardPayoffs.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">
                    <LabelWithTooltip
                      label="墓地利用:"
                      tooltip="墓地のカードを利用するカード。墓地から唱える、蘇生、墓地の枚数を参照するなどの効果があります。"
                    />
                  </span>{' '}
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
                  <span className="text-muted-foreground">
                    <LabelWithTooltip
                      label="カウンター:"
                      tooltip="+1/+1カウンターを置く効果を持つカード。クリーチャーを強化し、時間経過とともに脅威が増大します。"
                    />
                  </span>{' '}
                  {synergies.counterSynergy.counterCards.slice(0, 3).join(', ')}
                  {synergies.counterSynergy.counterCards.length > 3 &&
                    ` 他${synergies.counterSynergy.counterCards.length - 3}枚`}
                </div>
              )}
              {synergies.counterSynergy.proliferateCards.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">
                    <LabelWithTooltip
                      label="増殖:"
                      tooltip="すべてのカウンターを1つずつ増やす増殖メカニクス。+1/+1カウンターを爆発的に増やせます。"
                    />
                  </span>{' '}
                  {synergies.counterSynergy.proliferateCards.join(', ')}
                </div>
              )}
            </div>
          </div>
        )}

              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Counter Strategy Category */}
        {SYNERGY_CATEGORIES[3].hasSynergy(synergies) && (
          <AccordionItem value="counters" className="border rounded-lg px-3">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />
                <span className="font-semibold">カウンター戦略</span>
                <Badge variant="outline" className="ml-2 text-xs">
                  最高スコア: {SYNERGY_CATEGORIES[3].getMaxScore(synergies)}/10
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">

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
                  <span className="text-muted-foreground">
                    <LabelWithTooltip
                      label="カウンター:"
                      tooltip="+1/+1カウンターを置く効果を持つカード。クリーチャーを強化し、時間経過とともに脅威が増大します。"
                    />
                  </span>{' '}
                  {synergies.counterSynergy.counterCards.slice(0, 3).join(', ')}
                  {synergies.counterSynergy.counterCards.length > 3 &&
                    ` 他${synergies.counterSynergy.counterCards.length - 3}枚`}
                </div>
              )}
              {synergies.counterSynergy.proliferateCards.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">
                    <LabelWithTooltip
                      label="増殖:"
                      tooltip="すべてのカウンターを1つずつ増やす増殖メカニクス。+1/+1カウンターを爆発的に増やせます。"
                    />
                  </span>{' '}
                  {synergies.counterSynergy.proliferateCards.join(', ')}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Energy Synergy */}
        {synergies.energySynergy && (
          <div className="border-l-4 border-l-blue-500 pl-3">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-blue-500" />
              <h4 className="font-semibold text-sm">エネルギーカウンター</h4>
              <Badge variant="outline" className="text-xs ml-auto">
                {synergies.energySynergy.score}/10
              </Badge>
            </div>
            <div className="space-y-1 text-sm">
              {synergies.energySynergy.energyProducers.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">
                    <LabelWithTooltip
                      label="エネルギー獲得:"
                      tooltip="エネルギーカウンター（{E}）を得るカード。プレイヤーにエネルギーを蓄積します。"
                    />
                  </span>{' '}
                  {synergies.energySynergy.energyProducers.join(', ')}
                </div>
              )}
              {synergies.energySynergy.energyPayoffs.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">
                    <LabelWithTooltip
                      label="エネルギー消費:"
                      tooltip="エネルギーカウンターを支払って効果を発動するカード。蓄積したエネルギーを有効活用します。"
                    />
                  </span>{' '}
                  {synergies.energySynergy.energyPayoffs.join(', ')}
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
                      <Tooltip delayDuration={300}>
                        <TooltipTrigger asChild>
                          <Badge
                            variant={
                              threshold.achievementLikelihood === 'high'
                                ? 'default'
                                : threshold.achievementLikelihood === 'medium'
                                ? 'secondary'
                                : 'outline'
                            }
                            className="text-xs cursor-help"
                          >
                            {threshold.currentCount}/{threshold.requiredCount}
                            {threshold.type === 'metalcraft' && '個'}
                            {threshold.type === 'delirium' && '種類'}
                            {threshold.type === 'domain' && '色'}
                            {(threshold.type === 'threshold' || threshold.type === 'descend') && '枚'}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <div className="space-y-1">
                            <p className="font-semibold">{threshold.name}</p>
                            {threshold.type === 'metalcraft' && (
                              <>
                                <p><strong>現在:</strong> {threshold.currentCount}個のアーティファクト</p>
                                <p><strong>必要:</strong> {threshold.requiredCount}個のアーティファクト</p>
                                <p className="text-xs">戦場にアーティファクトを3つ以上コントロールしている状態を金属術と呼びます。</p>
                              </>
                            )}
                            {threshold.type === 'delirium' && (
                              <>
                                <p><strong>現在:</strong> {threshold.currentCount}種類のカードタイプ</p>
                                <p><strong>必要:</strong> {threshold.requiredCount}種類のカードタイプ</p>
                                <p className="text-xs">墓地に4種類以上のカードタイプ（アーティファクト、クリーチャー、エンチャント、インスタント、土地、プレインズウォーカー、ソーサリー）があると昂揚が有効になります。</p>
                              </>
                            )}
                            {threshold.type === 'domain' && (
                              <>
                                <p><strong>現在:</strong> {threshold.currentCount}つの基本土地タイプ</p>
                                <p><strong>必要:</strong> {threshold.requiredCount}つの基本土地タイプ</p>
                                <p className="text-xs">コントロールしている基本土地タイプの種類数（平地、島、沼、山、森）を参照します。5色揃えると最大効果を発揮します。</p>
                              </>
                            )}
                            {threshold.type === 'threshold' && (
                              <>
                                <p><strong>現在:</strong> 約{threshold.currentCount}枚（墓地肥やしカード数）</p>
                                <p><strong>必要:</strong> 墓地に{threshold.requiredCount}枚以上</p>
                                <p className="text-xs">墓地に7枚以上カードがある状態を絶対値と呼びます。墓地肥やしカードの数から達成可能性を推定しています。</p>
                              </>
                            )}
                            {threshold.type === 'descend' && (
                              <>
                                <p><strong>現在:</strong> 約{threshold.currentCount}枚（墓地肥やしカード数）</p>
                                <p><strong>必要:</strong> 墓地に{threshold.requiredCount}枚以上</p>
                                <p className="text-xs">墓地に8枚以上の永続物カードがある状態を下降8と呼びます。墓地肥やしカードの数から達成可能性を推定しています。</p>
                              </>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip delayDuration={300}>
                        <TooltipTrigger asChild>
                          <Badge variant="outline" className="text-xs cursor-help">
                            {threshold.score}/10
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <div className="space-y-1">
                            <p className="font-semibold">シナジースコア</p>
                            <p>
                              このシナジーの強さを示すスコア（1-10）。
                              現在のデッキ構成での相乗効果の評価値です。
                            </p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
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
                  <span className="text-muted-foreground">
                    <LabelWithTooltip
                      label="生け贄先:"
                      tooltip="パーマネントを生け贄に捧げることができるカード。コストとして生け贄を要求したり、能力で生け贄効果を持ちます。"
                    />
                  </span>{' '}
                  {synergies.sacrificeSynergy.outlets.join(', ')}
                </div>
              )}
              {synergies.sacrificeSynergy.fodder.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">
                    <LabelWithTooltip
                      label="生け贄要員:"
                      tooltip="生け贄に適したカード。トークンや蘇生可能なクリーチャー、生け贄時に追加効果があるカードなど。"
                    />
                  </span>{' '}
                  {synergies.sacrificeSynergy.fodder.join(', ')}
                </div>
              )}
              {synergies.sacrificeSynergy.payoffs.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">
                    <LabelWithTooltip
                      label="死亡誘発:"
                      tooltip="クリーチャーが死亡したときに誘発する効果を持つカード。アリストクラット戦略の核となる効果です。"
                    />
                  </span>{' '}
                  {synergies.sacrificeSynergy.payoffs.join(', ')}
                </div>
              )}
            </div>
          </div>
        )}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Mana Strategy Category */}
        {SYNERGY_CATEGORIES[4].hasSynergy(synergies) && (
          <AccordionItem value="mana" className="border rounded-lg px-3">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <TreeDeciduous className="h-4 w-4" />
                <span className="font-semibold">マナ戦略</span>
                <Badge variant="outline" className="ml-2 text-xs">
                  最高スコア: {SYNERGY_CATEGORIES[4].getMaxScore(synergies)}/10
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">

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
                  <span className="text-muted-foreground">
                    <LabelWithTooltip
                      label="高マナ域カード:"
                      tooltip="マナ加速で早期にプレイしたい高コストのカード（5マナ以上）。強力な脅威やフィニッシャーとなるカードです。"
                    />
                  </span>{' '}
                  {[...new Set(synergies.manaAccelerationSynergy.payoffs)].slice(0, 5).join(', ')}
                  {[...new Set(synergies.manaAccelerationSynergy.payoffs)].length > 5 &&
                    ` 他${[...new Set(synergies.manaAccelerationSynergy.payoffs)].length - 5}枚`}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Landfall Synergy */}
        {synergies.landfallSynergy && (
          <div className="border-l-4 border-l-lime-500 pl-3">
            <div className="flex items-center gap-2 mb-2">
              <TreeDeciduous className="h-4 w-4 text-lime-500" />
              <h4 className="font-semibold text-sm">ランドフォール（上陸）</h4>
              <Badge variant="outline" className="text-xs ml-auto">
                {synergies.landfallSynergy.score}/10
              </Badge>
            </div>
            <div className="space-y-1 text-sm">
              <div className="text-xs">
                <span className="text-muted-foreground">土地数: </span>
                {synergies.landfallSynergy.landCount}枚
              </div>
              {synergies.landfallSynergy.landfallTriggers.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">
                    <LabelWithTooltip
                      label="ランドフォールトリガー:"
                      tooltip="土地が戦場に出た時に誘発する能力を持つカード。土地プレイで追加の価値を得られます。"
                    />
                  </span>{' '}
                  {synergies.landfallSynergy.landfallTriggers.join(', ')}
                </div>
              )}
              {synergies.landfallSynergy.landRamp.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">
                    <LabelWithTooltip
                      label="土地サーチ:"
                      tooltip="土地をライブラリーから戦場に出すカード。ランドフォールトリガーを発動させます。"
                    />
                  </span>{' '}
                  {synergies.landfallSynergy.landRamp.join(', ')}
                </div>
              )}
              {synergies.landfallSynergy.extraLandPlays.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">
                    <LabelWithTooltip
                      label="追加土地プレイ:"
                      tooltip="1ターンに複数の土地をプレイできるカード。ランドフォールトリガーを複数回発動できます。"
                    />
                  </span>{' '}
                  {synergies.landfallSynergy.extraLandPlays.join(', ')}
                </div>
              )}
            </div>
          </div>
        )}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Spell Strategy Category */}
        {SYNERGY_CATEGORIES[5].hasSynergy(synergies) && (
          <AccordionItem value="spells" className="border rounded-lg px-3">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <Wand2 className="h-4 w-4" />
                <span className="font-semibold">呪文戦略</span>
                <Badge variant="outline" className="ml-2 text-xs">
                  最高スコア: {SYNERGY_CATEGORIES[5].getMaxScore(synergies)}/10
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">

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
                  <span className="text-muted-foreground">
                    <LabelWithTooltip
                      label="呪文キャスト誘発:"
                      tooltip="インスタントやソーサリーを唱えたときに誘発する能力を持つカード。呪文を唱えるたびに追加の効果を得られます。"
                    />
                  </span>{' '}
                  {synergies.spellslingerSynergy.spellTriggers.join(', ')}
                </div>
              )}
              {synergies.spellslingerSynergy.spellCopiers.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">
                    <LabelWithTooltip
                      label="呪文コピー:"
                      tooltip="インスタントやソーサリーをコピーできるカード。1枚の呪文から2倍の効果を得られます。"
                    />
                  </span>{' '}
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

        {/* Storm Synergy */}
        {synergies.stormSynergy && (
          <div className="border-l-4 border-l-purple-600 pl-3">
            <div className="flex items-center gap-2 mb-2">
              <Wand2 className="h-4 w-4 text-purple-600" />
              <h4 className="font-semibold text-sm">ストーム（嵐）</h4>
              <Badge variant="outline" className="text-xs ml-auto">
                {synergies.stormSynergy.score}/10
              </Badge>
            </div>
            <div className="space-y-1 text-sm">
              <div className="text-xs">
                <span className="text-muted-foreground">インスタント・ソーサリー: </span>
                {synergies.stormSynergy.instantsAndSorceries}枚
              </div>
              {synergies.stormSynergy.stormCards.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">
                    <LabelWithTooltip
                      label="ストームカード:"
                      tooltip="ストーム能力を持つカード。このターン唱えた呪文の数だけコピーされます。"
                    />
                  </span>{' '}
                  {synergies.stormSynergy.stormCards.join(', ')}
                </div>
              )}
              {synergies.stormSynergy.rituals.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">
                    <LabelWithTooltip
                      label="リチュアル（マナ生成）:"
                      tooltip="一時的に大量のマナを生成する儀式カード。1ターンに複数の呪文を唱えることができます。"
                    />
                  </span>{' '}
                  {synergies.stormSynergy.rituals.join(', ')}
                </div>
              )}
              {synergies.stormSynergy.cantrips.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">
                    <LabelWithTooltip
                      label="キャントリップ:"
                      tooltip="呪文を唱えながらカードを引く低コスト呪文。ストームカウントを増やしながらデッキを掘り進めます。"
                    />
                  </span>{' '}
                  {synergies.stormSynergy.cantrips.join(', ')}
                </div>
              )}
              {synergies.stormSynergy.costReduction.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">
                    <LabelWithTooltip
                      label="コスト軽減:"
                      tooltip="呪文のコストを軽減するカード。より多くの呪文を1ターンに唱えられます。"
                    />
                  </span>{' '}
                  {synergies.stormSynergy.costReduction.join(', ')}
                </div>
              )}
            </div>
          </div>
        )}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Equipment/Enhancement Strategy Category */}
        {SYNERGY_CATEGORIES[6].hasSynergy(synergies) && (
          <AccordionItem value="equipment" className="border rounded-lg px-3">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                <span className="font-semibold">装備/強化戦略</span>
                <Badge variant="outline" className="ml-2 text-xs">
                  最高スコア: {SYNERGY_CATEGORIES[6].getMaxScore(synergies)}/10
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">

        {/* Equipment/Aura Synergy */}
        {synergies.equipmentAuraSynergy && (
          <div className="border-l-4 border-l-pink-500 pl-3">
            <div className="flex items-center gap-2 mb-2">
              <Swords className="h-4 w-4 text-pink-500" />
              <h4 className="font-semibold text-sm">装備品/オーラ（ヴォルトロン/ボーグル）</h4>
              <Badge variant="outline" className="text-xs ml-auto">
                {synergies.equipmentAuraSynergy.score}/10
              </Badge>
            </div>
            <div className="space-y-1 text-sm">
              {synergies.equipmentAuraSynergy.equipments.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">
                    <LabelWithTooltip
                      label="装備品:"
                      tooltip="クリーチャーに装備してパワーアップする装備品カード。付け替え可能で柔軟性が高いです。"
                    />
                  </span>{' '}
                  {synergies.equipmentAuraSynergy.equipments.join(', ')}
                </div>
              )}
              {synergies.equipmentAuraSynergy.auras.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">
                    <LabelWithTooltip
                      label="オーラ:"
                      tooltip="クリーチャーにエンチャントして強化するオーラカード。コスト効率が良いです。"
                    />
                  </span>{' '}
                  {synergies.equipmentAuraSynergy.auras.join(', ')}
                </div>
              )}
              {synergies.equipmentAuraSynergy.equipmentPayoffs.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">
                    <LabelWithTooltip
                      label="装備品シナジー:"
                      tooltip="装備品を参照したり、装備コストを軽減するカード。装備品戦略を強化します。"
                    />
                  </span>{' '}
                  {synergies.equipmentAuraSynergy.equipmentPayoffs.join(', ')}
                </div>
              )}
              {synergies.equipmentAuraSynergy.auraPayoffs.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">
                    <LabelWithTooltip
                      label="オーラシナジー:"
                      tooltip="オーラを参照したり、オーラを再利用できるカード。オーラ戦略を支援します。"
                    />
                  </span>{' '}
                  {synergies.equipmentAuraSynergy.auraPayoffs.join(', ')}
                </div>
              )}
              {synergies.equipmentAuraSynergy.equipmentEnablers.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">
                    <LabelWithTooltip
                      label="装備補助:"
                      tooltip="装備品を探したり、戦場に出すカード。装備戦略を円滑にします。"
                    />
                  </span>{' '}
                  {synergies.equipmentAuraSynergy.equipmentEnablers.join(', ')}
                </div>
              )}
              {synergies.equipmentAuraSynergy.hexproofCreatures.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">
                    <LabelWithTooltip
                      label="呪禁持ちクリーチャー:"
                      tooltip="呪禁を持つクリーチャー。オーラや装備品を安全に付けられる理想的なターゲットです。"
                    />
                  </span>{' '}
                  {synergies.equipmentAuraSynergy.hexproofCreatures.join(', ')}
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
                  <span className="text-muted-foreground">
                    <LabelWithTooltip
                      label="エンチャント誘発 (Constellation等):"
                      tooltip="エンチャントが戦場に出たときに誘発する能力を持つカード。エンチャント中心のデッキで継続的な価値を生み出します。"
                    />
                  </span>{' '}
                  {synergies.enchantmentArtifactSynergy.enchantmentTriggers.join(', ')}
                </div>
              )}
              {synergies.enchantmentArtifactSynergy.enchantmentPayoffs.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">
                    <LabelWithTooltip
                      label="エンチャント参照:"
                      tooltip="エンチャントの数を参照するカード。エンチャントが多いほど強力な効果を発揮します。"
                    />
                  </span>{' '}
                  {synergies.enchantmentArtifactSynergy.enchantmentPayoffs.join(', ')}
                </div>
              )}
              {synergies.enchantmentArtifactSynergy.artifactTriggers.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">
                    <LabelWithTooltip
                      label="アーティファクト誘発:"
                      tooltip="アーティファクトが戦場に出たときに誘発する能力を持つカード。アーティファクト中心のデッキで追加の価値を得ます。"
                    />
                  </span>{' '}
                  {synergies.enchantmentArtifactSynergy.artifactTriggers.join(', ')}
                </div>
              )}
              {synergies.enchantmentArtifactSynergy.artifactPayoffs.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">
                    <LabelWithTooltip
                      label="アーティファクト参照 (Affinity/Improvise等):"
                      tooltip="アーティファクトの数を参照したり、アーティファクトをタップして軽減できるカード。アーティファクトが多いほど有利になります。"
                    />
                  </span>{' '}
                  {synergies.enchantmentArtifactSynergy.artifactPayoffs.join(', ')}
                </div>
              )}
            </div>
          </div>
        )}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Combat Strategy Category */}
        {SYNERGY_CATEGORIES[7].hasSynergy(synergies) && (
          <AccordionItem value="combat" className="border rounded-lg px-3">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <Combat className="h-4 w-4" />
                <span className="font-semibold">戦闘戦略</span>
                <Badge variant="outline" className="ml-2 text-xs">
                  最高スコア: {SYNERGY_CATEGORIES[7].getMaxScore(synergies)}/10
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">

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
                  <span className="text-muted-foreground">
                    <LabelWithTooltip
                      label="攻撃トリガー:"
                      tooltip="クリーチャーが攻撃したときに誘発する能力を持つカード。積極的に攻撃することで追加の価値を得られます。"
                    />
                  </span>{' '}
                  {synergies.attackTriggerSynergy.attackTriggers.join(', ')}
                </div>
              )}
              {synergies.attackTriggerSynergy.raidCards.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">
                    <LabelWithTooltip
                      label="Raid:"
                      tooltip="そのターンにクリーチャーで攻撃していた場合に追加効果を得るRaidメカニクス。攻撃的な戦略を報酬します。"
                    />
                  </span>{' '}
                  {synergies.attackTriggerSynergy.raidCards.join(', ')}
                </div>
              )}
              {synergies.attackTriggerSynergy.enablers.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">
                    <LabelWithTooltip
                      label="攻撃補助:"
                      tooltip="攻撃を容易にするカード。速攻、回避能力、追加戦闘、警戒などで攻撃戦略を支援します。"
                    />
                  </span>{' '}
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
                  <span className="text-muted-foreground">
                    <LabelWithTooltip
                      label="タップ能力:"
                      tooltip="タップすることで起動できる能力を持つカード（マナ能力以外）。継続的に価値を生み出します。"
                    />
                  </span>{' '}
                  {synergies.tapUntapSynergy.tapAbilities.join(', ')}
                </div>
              )}
              {synergies.tapUntapSynergy.untappers.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">
                    <LabelWithTooltip
                      label="アンタップ手段:"
                      tooltip="パーマネントをアンタップできるカード。タップ能力を1ターンに複数回使用可能にします。"
                    />
                  </span>{' '}
                  {synergies.tapUntapSynergy.untappers.join(', ')}
                </div>
              )}
              {synergies.tapUntapSynergy.tapTriggers.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">
                    <LabelWithTooltip
                      label="タップ誘発:"
                      tooltip="タップやアンタップ時に誘発する能力を持つカード（Inspiredなど）。タップアクションから追加の価値を得ます。"
                    />
                  </span>{' '}
                  {synergies.tapUntapSynergy.tapTriggers.join(', ')}
                </div>
              )}
              {synergies.tapUntapSynergy.vigilanceCards.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">
                    <LabelWithTooltip
                      label="警戒持ち:"
                      tooltip="警戒を持つクリーチャー。攻撃してもタップしないため、タップ能力と攻撃を両立できます。"
                    />
                  </span>{' '}
                  {synergies.tapUntapSynergy.vigilanceCards.join(', ')}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Lifegain Synergy */}
        {synergies.lifegainSynergy && (
          <div className="border-l-4 border-l-rose-500 pl-3">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="h-4 w-4 text-rose-500" />
              <h4 className="font-semibold text-sm">ライフゲイン（ソウルシスターズ）</h4>
              <Badge variant="outline" className="text-xs ml-auto">
                {synergies.lifegainSynergy.score}/10
              </Badge>
            </div>
            <div className="space-y-1 text-sm">
              {synergies.lifegainSynergy.lifegainTriggers.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">
                    <LabelWithTooltip
                      label="ライフゲイン誘発:"
                      tooltip="ライフを得た時に誘発する能力を持つカード。ライフゲイン戦略の核となるカードです。"
                    />
                  </span>{' '}
                  {synergies.lifegainSynergy.lifegainTriggers.join(', ')}
                </div>
              )}
              {synergies.lifegainSynergy.lifegainSources.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">
                    <LabelWithTooltip
                      label="ライフゲイン源:"
                      tooltip="ライフを得る効果を持つカード。ライフゲイントリガーを発動させます。"
                    />
                  </span>{' '}
                  {synergies.lifegainSynergy.lifegainSources.join(', ')}
                </div>
              )}
              {synergies.lifegainSynergy.lifelinkCreatures.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">
                    <LabelWithTooltip
                      label="絆魂クリーチャー:"
                      tooltip="絆魂を持つクリーチャー。ダメージを与えるたびにライフを得られます。"
                    />
                  </span>{' '}
                  {synergies.lifegainSynergy.lifelinkCreatures.join(', ')}
                </div>
              )}
            </div>
          </div>
        )}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Zone Manipulation Category */}
        {SYNERGY_CATEGORIES[8].hasSynergy(synergies) && (
          <AccordionItem value="zones" className="border rounded-lg px-3">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <Shuffle className="h-4 w-4" />
                <span className="font-semibold">ゾーン操作</span>
                <Badge variant="outline" className="ml-2 text-xs">
                  最高スコア: {SYNERGY_CATEGORIES[8].getMaxScore(synergies)}/10
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">

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
                  <span className="text-muted-foreground">
                    <LabelWithTooltip
                      label="トップ操作 (Scry/Brainstorm等):"
                      tooltip="ライブラリーのトップを操作できるカード（占術、Brainstormなど）。次に引くカードをコントロールできます。"
                    />
                  </span>{' '}
                  {synergies.libraryTopSynergy.topManipulators.join(', ')}
                </div>
              )}
              {synergies.libraryTopSynergy.topPayoffs.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">
                    <LabelWithTooltip
                      label="トップ参照 (Miracle等):"
                      tooltip="ライブラリーのトップのカードを参照したり、トップから唱えられるカード（奇跡など）。トップ操作と組み合わせて強力です。"
                    />
                  </span>{' '}
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
                  <span className="text-muted-foreground">
                    <LabelWithTooltip
                      label="ブリンク効果 (Flicker):"
                      tooltip="パーマネントを一時的に除外して戦場に戻すブリンク効果。戦場に出た時の能力を再利用できます。"
                    />
                  </span>{' '}
                  {synergies.exileZoneSynergy.blinkEffects.join(', ')}
                </div>
              )}
              {synergies.exileZoneSynergy.exilePayoffs.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">
                    <LabelWithTooltip
                      label="除外参照 (Adventure/Foretell/Escape等):"
                      tooltip="除外ゾーンから唱えられるカードや、除外ゾーンを利用するメカニクス（出来事、予顕、脱出など）。"
                    />
                  </span>{' '}
                  {synergies.exileZoneSynergy.exilePayoffs.join(', ')}
                </div>
              )}
              {synergies.exileZoneSynergy.exilers.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">
                    <LabelWithTooltip
                      label="除外効果:"
                      tooltip="カードを除外するカード。脱出などの除外参照メカニクスと組み合わせると有効です。"
                    />
                  </span>{' '}
                  {synergies.exileZoneSynergy.exilers.join(', ')}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ETB Synergy */}
        {synergies.etbSynergy && (
          <div className="border-l-4 border-l-indigo-500 pl-3">
            <div className="flex items-center gap-2 mb-2">
              <RefreshCw className="h-4 w-4 text-indigo-500" />
              <h4 className="font-semibold text-sm">ETBシナジー（戦場出入り）</h4>
              <Badge variant="outline" className="text-xs ml-auto">
                {synergies.etbSynergy.score}/10
              </Badge>
            </div>
            <div className="space-y-1 text-sm">
              {synergies.etbSynergy.etbTriggers.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">
                    <LabelWithTooltip
                      label="ETBトリガー:"
                      tooltip="戦場に出た時（Enter the Battlefield）に誘発する能力を持つカード。ブリンクやリアニメイトで繰り返し使えます。"
                    />
                  </span>{' '}
                  {synergies.etbSynergy.etbTriggers.slice(0, 5).join(', ')}
                  {synergies.etbSynergy.etbTriggers.length > 5 &&
                    ` 他${synergies.etbSynergy.etbTriggers.length - 5}枚`}
                </div>
              )}
              {synergies.etbSynergy.blinkEffects.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">
                    <LabelWithTooltip
                      label="ブリンク効果:"
                      tooltip="クリーチャーを一時的に除外して戦場に戻す効果。ETBトリガーを何度も使えます。"
                    />
                  </span>{' '}
                  {synergies.etbSynergy.blinkEffects.join(', ')}
                </div>
              )}
              {synergies.etbSynergy.reanimation.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">
                    <LabelWithTooltip
                      label="リアニメイト:"
                      tooltip="墓地からクリーチャーを戦場に出す効果。ETBトリガーを再利用できます。"
                    />
                  </span>{' '}
                  {synergies.etbSynergy.reanimation.join(', ')}
                </div>
              )}
              {synergies.etbSynergy.cheatIntoPlay.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">
                    <LabelWithTooltip
                      label="直接戦場へ:"
                      tooltip="カードを直接戦場に出す効果（Show and Tell、Aether Vialなど）。ETBトリガーを活用できます。"
                    />
                  </span>{' '}
                  {synergies.etbSynergy.cheatIntoPlay.join(', ')}
                </div>
              )}
              {synergies.etbSynergy.clones.length > 0 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">
                    <LabelWithTooltip
                      label="クローン効果:"
                      tooltip="クリーチャーをコピーして戦場に出る効果。ETBトリガーを持つクリーチャーをコピーすればトリガーも発動します。"
                    />
                  </span>{' '}
                  {synergies.etbSynergy.clones.join(', ')}
                </div>
              )}
            </div>
          </div>
        )}

              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Keywords Category */}
        {SYNERGY_CATEGORIES[9].hasSynergy(synergies) && (
          <AccordionItem value="keywords" className="border rounded-lg px-3">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                <span className="font-semibold">キーワード能力</span>
                <Badge variant="outline" className="ml-2 text-xs">
                  {synergies.keywordClusters.length}個のクラスター
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
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
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>

      {/* Network Graph Visualization */}
      {cards && cards.length > 0 && (
        <div className="mt-4">
          <Suspense fallback={
            <div className="border rounded-lg p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">ネットワークグラフを読み込み中...</p>
            </div>
          }>
            <SynergyNetwork synergies={synergies} cards={cards} />
          </Suspense>
        </div>
      )}
    </div>
    </TooltipProvider>
  );
});
