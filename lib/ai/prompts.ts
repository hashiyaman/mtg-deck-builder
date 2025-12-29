import { Deck } from '@/types/deck';
import {
  simulateOpeningHands,
  simulateEarlyGame,
  simulateKeyCardDrawRate,
  OpeningHandStats,
  EarlyGameStats,
} from '@/lib/deck/simulator';

/**
 * 分析タイプ
 */
export type AnalysisType = 'manabase' | 'strategy' | 'sideboard' | 'comprehensive';

/**
 * マナベース分析プロンプト
 */
export function buildManabaseAnalysisPrompt(
  deck: Deck,
  openingHandStats: OpeningHandStats,
  earlyGameStats: EarlyGameStats
): string {
  const totalCards = deck.mainboard.reduce((sum, dc) => sum + dc.quantity, 0);
  const landCount = deck.mainboard
    .filter((dc) => dc.card.type_line.toLowerCase().includes('land'))
    .reduce((sum, dc) => sum + dc.quantity, 0);

  // 色分布（呪文の色要求）
  const colors: Record<string, number> = { W: 0, U: 0, B: 0, R: 0, G: 0 };
  deck.mainboard.forEach((dc) => {
    dc.card.colors?.forEach((color) => {
      colors[color] = (colors[color] || 0) + dc.quantity;
    });
  });

  // 土地が生成できる色マナの分布
  const manaProduction: Record<string, number> = { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 };
  deck.mainboard.forEach((dc) => {
    if (dc.card.type_line.toLowerCase().includes('land') && dc.card.produced_mana) {
      dc.card.produced_mana.forEach((mana) => {
        if (manaProduction[mana] !== undefined) {
          manaProduction[mana] += dc.quantity;
        }
      });
    }
  });

  // マナカーブ
  const manaCurve: Record<string, number> = { '0': 0, '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7+': 0 };
  deck.mainboard.forEach((dc) => {
    const cmc = dc.card.cmc || 0;
    if (cmc >= 7) {
      manaCurve['7+'] += dc.quantity;
    } else {
      manaCurve[cmc.toString()] += dc.quantity;
    }
  });

  // 土地リストを整形
  const landList = deck.mainboard
    .filter((dc) => dc.card.type_line.toLowerCase().includes('land'))
    .map((dc) => `${dc.quantity}x ${dc.card.printed_name || dc.card.name}`)
    .join(', ');

  // 初手土地分布を整形
  const landDistText = Object.entries(openingHandStats.landDistribution)
    .map(([lands, rate]) => `${lands}枚:${rate.toFixed(1)}%`)
    .join(' ');

  // 色マナ要求を整形
  const colorReqText = Object.entries(openingHandStats.colorRequirements)
    .map(([color, rate]) => `${color}:${rate.toFixed(1)}%`)
    .join(' ');

  return `【マナベース分析】${deck.name} (${deck.format})

デッキ情報:
- 総枚数: ${totalCards}枚
- 土地枚数: ${landCount}枚 (${((landCount / totalCards) * 100).toFixed(1)}%)
- 土地構成: ${landList}
- 色要求（呪文）: W:${colors.W} U:${colors.U} B:${colors.B} R:${colors.R} G:${colors.G}
- 色供給（土地）: W:${manaProduction.W} U:${manaProduction.U} B:${manaProduction.B} R:${manaProduction.R} G:${manaProduction.G} C:${manaProduction.C}
- マナカーブ: 1:${manaCurve['1']} 2:${manaCurve['2']} 3:${manaCurve['3']} 4:${manaCurve['4']} 5:${manaCurve['5']} 6:${manaCurve['6']} 7+:${manaCurve['7+']}

シミュレーション結果(1000回):
- 初手土地分布: ${landDistText}
- 平均土地: ${openingHandStats.averageLands.toFixed(2)}枚
- キープ可能率(2-5枚土地): ${openingHandStats.keepableHandRate.toFixed(1)}%
- 初手色マナ確保率: ${colorReqText}
- T1プレイ可: ${earlyGameStats.turn1PlayableSpells.toFixed(1)}% | T2: ${earlyGameStats.turn2PlayableSpells.toFixed(1)}% | T3: ${earlyGameStats.turn3PlayableSpells.toFixed(1)}%
- カーブアウト率(T1-3連続): ${earlyGameStats.curveOutRate.toFixed(1)}%

以下を分析:
1. 土地枚数の適切性（マナカーブとキープ率から評価、最適枚数を提案）
2. 色マナバランス（色要求と色供給のバランス、初手確保率から改善点を指摘）
3. マナカーブとの整合性（T1-3の動き出し確率とカーブアウト率を評価）
4. 具体的な改善案（追加・削除すべき土地、基本土地の調整、ユーティリティランド検討）`;
}

/**
 * 戦略・シナジー分析プロンプト
 */
export function buildStrategyAnalysisPrompt(
  deck: Deck,
  keyCardStats: Array<{ cardName: string; turn3Rate: number; turn4Rate: number }>
): string {
  // カードリストを整形
  const mainboardList = deck.mainboard
    .map((dc) => `${dc.quantity}x ${dc.card.printed_name || dc.card.name}`)
    .join('\n');

  // カードタイプ分布
  const typeDistribution: Record<string, number> = {
    'クリーチャー': 0,
    '土地': 0,
    'インスタント': 0,
    'ソーサリー': 0,
    'エンチャント': 0,
    'アーティファクト': 0,
    'プレインズウォーカー': 0,
  };

  deck.mainboard.forEach((dc) => {
    const typeLine = dc.card.type_line.toLowerCase();
    if (typeLine.includes('creature')) typeDistribution['クリーチャー'] += dc.quantity;
    if (typeLine.includes('land')) typeDistribution['土地'] += dc.quantity;
    if (typeLine.includes('instant')) typeDistribution['インスタント'] += dc.quantity;
    if (typeLine.includes('sorcery')) typeDistribution['ソーサリー'] += dc.quantity;
    if (typeLine.includes('enchantment')) typeDistribution['エンチャント'] += dc.quantity;
    if (typeLine.includes('artifact')) typeDistribution['アーティファクト'] += dc.quantity;
    if (typeLine.includes('planeswalker')) typeDistribution['プレインズウォーカー'] += dc.quantity;
  });

  const keyCardText = keyCardStats
    .map((stat) => `${stat.cardName}(T3:${stat.turn3Rate.toFixed(1)}% T4:${stat.turn4Rate.toFixed(1)}%)`)
    .join(', ');

  return `【戦略・シナジー分析】${deck.name} (${deck.format})

カードリスト:
${mainboardList}

構成:
- クリーチャー:${typeDistribution['クリーチャー']} インスタント:${typeDistribution['インスタント']} ソーサリー:${typeDistribution['ソーサリー']}
- エンチャント:${typeDistribution['エンチャント']} アーティファクト:${typeDistribution['アーティファクト']} PW:${typeDistribution['プレインズウォーカー']} 土地:${typeDistribution['土地']}

キーカード到達率: ${keyCardText}

以下を分析:
1. アーキタイプ判定と構成の整合性
2. 主要シナジー・コンボの特定と成立確率
3. ゲームプラン（序盤・中盤・終盤）と実現可能性
4. 改善提案（追加・削除カード、メタゲーム評価）`;
}

/**
 * サイドボード分析プロンプト
 */
export function buildSideboardAnalysisPrompt(deck: Deck): string {
  const mainboardList = deck.mainboard
    .map((dc) => `${dc.quantity}x ${dc.card.printed_name || dc.card.name}`)
    .join(', ');

  const sideboardList = deck.sideboard
    .map((dc) => `${dc.quantity}x ${dc.card.printed_name || dc.card.name}`)
    .join(', ');

  return `【サイドボード分析】${deck.name} (${deck.format})

メインボード: ${mainboardList}

サイドボード(${deck.sideboard.reduce((sum, dc) => sum + dc.quantity, 0)}枚): ${sideboardList}

以下を分析:
1. サイドボード構成評価（対アグロ/ミッドレンジ/コントロール/コンボ、カバー範囲）
2. サイドボードガイド（主要マッチアップ別のIn/Out例、ゲームプラン変化）
3. 改善提案（追加・削除すべきカード、メイン⇔サイド入替候補）`;
}

/**
 * 総合分析プロンプト（簡易版）
 */
export function buildComprehensiveAnalysisPrompt(
  deck: Deck,
  openingHandStats: OpeningHandStats,
  earlyGameStats: EarlyGameStats
): string {
  const mainboardList = deck.mainboard
    .map((dc) => `${dc.quantity}x ${dc.card.printed_name || dc.card.name}`)
    .join('\n');

  const totalCards = deck.mainboard.reduce((sum, dc) => sum + dc.quantity, 0);

  return `【総合分析】${deck.name} (${deck.format})

カードリスト(${totalCards}枚):
${mainboardList}

シミュレーション:
- キープ率: ${openingHandStats.keepableHandRate.toFixed(1)}%
- T1-3プレイ可: ${earlyGameStats.turn1PlayableSpells.toFixed(1)}% / ${earlyGameStats.turn2PlayableSpells.toFixed(1)}% / ${earlyGameStats.turn3PlayableSpells.toFixed(1)}%

以下を簡潔に:
1. アーキタイプと強み・弱み
2. 主要な問題点（マナベース/シナジー/バランス）
3. 最優先の改善案（3-5点、具体的なカード名）`;
}
