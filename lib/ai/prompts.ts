import { Deck } from '@/types/deck';
import {
  simulateOpeningHands,
  simulateEarlyGame,
  simulateKeyCardDrawRate,
  OpeningHandStats,
  EarlyGameStats,
} from '@/lib/deck/simulator';
import { analyzeDeckSynergies } from '@/lib/deck/synergyAnalyzer';

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

  // シナジー分析を実行
  const synergyAnalysis = analyzeDeckSynergies(deck.mainboard);

  // シナジー情報を整形
  let synergyText = '';

  // 部族シナジー
  if (synergyAnalysis.tribalSynergies.length > 0) {
    synergyText += '\n部族シナジー:\n';
    synergyAnalysis.tribalSynergies.forEach((tribal) => {
      synergyText += `- ${tribal.type}: ${tribal.count}枚 (スコア:${tribal.score}/10)\n`;
      synergyText += `  カード: ${tribal.cards.join(', ')}\n`;
    });
  }

  // トークンシナジー
  if (synergyAnalysis.tokenSynergy) {
    const ts = synergyAnalysis.tokenSynergy;
    synergyText += '\nトークンシナジー (スコア:' + ts.score + '/10):\n';
    if (ts.producers.length > 0) {
      synergyText += `- 生成: ${ts.producers.join(', ')}\n`;
    }
    if (ts.payoffs.length > 0) {
      synergyText += `- 活用: ${ts.payoffs.join(', ')}\n`;
    }
  }

  // 墓地シナジー
  if (synergyAnalysis.graveyardSynergy) {
    const gs = synergyAnalysis.graveyardSynergy;
    synergyText += '\n墓地シナジー (スコア:' + gs.score + '/10):\n';
    if (gs.graveyardFillers.length > 0) {
      synergyText += `- 墓地肥やし: ${gs.graveyardFillers.join(', ')}\n`;
    }
    if (gs.graveyardPayoffs.length > 0) {
      synergyText += `- 墓地利用: ${gs.graveyardPayoffs.join(', ')}\n`;
    }
  }

  // カウンターシナジー
  if (synergyAnalysis.counterSynergy) {
    const cs = synergyAnalysis.counterSynergy;
    synergyText += '\n+1/+1カウンターシナジー (スコア:' + cs.score + '/10):\n';
    if (cs.counterCards.length > 0) {
      synergyText += `- カウンター: ${cs.counterCards.join(', ')}\n`;
    }
    if (cs.proliferateCards.length > 0) {
      synergyText += `- 増殖: ${cs.proliferateCards.join(', ')}\n`;
    }
  }

  // キーワード集中
  if (synergyAnalysis.keywordClusters.length > 0) {
    synergyText += '\nキーワード集中:\n';
    synergyAnalysis.keywordClusters.forEach((cluster) => {
      synergyText += `- ${cluster.keyword}: ${cluster.count}枚 (${cluster.cards.join(', ')})\n`;
    });
  }

  // フィードバックループ（相互増幅）
  if (synergyAnalysis.feedbackLoops.length > 0) {
    synergyText += '\nフィードバックループ（相互増幅）:\n';
    synergyAnalysis.feedbackLoops.forEach((loop) => {
      synergyText += `- ${loop.cardA} ⇄ ${loop.cardB} (スコア:${loop.score}/10)\n`;
      synergyText += `  ${loop.cardA}: ${loop.triggerA} → ${loop.outputA}\n`;
      synergyText += `  ${loop.cardB}: ${loop.triggerB} → ${loop.outputB}\n`;
      synergyText += `  説明: ${loop.description}\n`;
    });
  }

  // 閾値シナジー (Threshold-based)
  if (synergyAnalysis.thresholdSynergies.length > 0) {
    synergyText += '\n閾値シナジー:\n';
    synergyAnalysis.thresholdSynergies.forEach((ts) => {
      synergyText += `- ${ts.name}: ${ts.currentCount}/${ts.requiredCount} (スコア:${ts.score}/10, 達成可能性:${ts.achievementLikelihood})\n`;
      if (ts.enablers.length > 0) {
        synergyText += `  条件達成: ${ts.enablers.slice(0, 5).join(', ')}${ts.enablers.length > 5 ? ` 他${ts.enablers.length - 5}枚` : ''}\n`;
      }
      if (ts.payoffs.length > 0) {
        synergyText += `  恩恵: ${ts.payoffs.join(', ')}\n`;
      }
    });
  }

  // 生け贄シナジー (Sacrifice/Aristocrats)
  if (synergyAnalysis.sacrificeSynergy) {
    const ss = synergyAnalysis.sacrificeSynergy;
    synergyText += '\n生け贄シナジー (アリストクラット型) (スコア:' + ss.score + '/10):\n';
    if (ss.outlets.length > 0) {
      synergyText += `- 生け贄先: ${ss.outlets.join(', ')}\n`;
    }
    if (ss.fodder.length > 0) {
      synergyText += `- 生け贄要員: ${ss.fodder.join(', ')}\n`;
    }
    if (ss.payoffs.length > 0) {
      synergyText += `- 死亡誘発: ${ss.payoffs.join(', ')}\n`;
    }
  }

  // マナ加速シナジー (Ramp)
  if (synergyAnalysis.manaAccelerationSynergy) {
    const ms = synergyAnalysis.manaAccelerationSynergy;
    synergyText += '\nマナ加速シナジー (ランプ型) (スコア:' + ms.score + '/10):\n';
    if (ms.manaCreatures.length > 0) {
      synergyText += `- マナクリーチャー: ${ms.manaCreatures.join(', ')}\n`;
    }
    if (ms.manaArtifacts.length > 0) {
      synergyText += `- マナアーティファクト: ${ms.manaArtifacts.join(', ')}\n`;
    }
    if (ms.landRamp.length > 0) {
      synergyText += `- 土地サーチ: ${ms.landRamp.join(', ')}\n`;
    }
    if (ms.extraLandPlays.length > 0) {
      synergyText += `- 追加土地プレイ: ${ms.extraLandPlays.join(', ')}\n`;
    }
    if (ms.costReduction.length > 0) {
      synergyText += `- コスト軽減: ${ms.costReduction.join(', ')}\n`;
    }
    if (ms.payoffs.length > 0) {
      const uniquePayoffs = [...new Set(ms.payoffs)];
      synergyText += `- 高マナ域カード(CMC5+): ${uniquePayoffs.slice(0, 5).join(', ')}${uniquePayoffs.length > 5 ? ` 他${uniquePayoffs.length - 5}枚` : ''}\n`;
    }
  }

  // スペルスリンガーシナジー (Spellslinger)
  if (synergyAnalysis.spellslingerSynergy) {
    const sp = synergyAnalysis.spellslingerSynergy;
    synergyText += '\nスペルスリンガーシナジー (インスタント・ソーサリー型) (スコア:' + sp.score + '/10):\n';
    synergyText += `- インスタント・ソーサリー枚数: ${sp.instantsAndSorceries}枚\n`;
    if (sp.spellTriggers.length > 0) {
      synergyText += `- 呪文キャスト誘発: ${sp.spellTriggers.join(', ')}\n`;
    }
    if (sp.spellCopiers.length > 0) {
      synergyText += `- 呪文コピー: ${sp.spellCopiers.join(', ')}\n`;
    }
    if (sp.spellRecursion.length > 0) {
      synergyText += `- 墓地再利用: ${sp.spellRecursion.join(', ')}\n`;
    }
    if (sp.cardAdvantage.length > 0) {
      synergyText += `- カードアドバンテージ: ${sp.cardAdvantage.join(', ')}\n`;
    }
    if (sp.costReduction.length > 0) {
      synergyText += `- コスト軽減: ${sp.costReduction.join(', ')}\n`;
    }
  }

  // 攻撃トリガーシナジー (Attack Triggers)
  if (synergyAnalysis.attackTriggerSynergy) {
    const at = synergyAnalysis.attackTriggerSynergy;
    synergyText += '\n攻撃トリガーシナジー (攻撃誘発型) (スコア:' + at.score + '/10):\n';
    synergyText += `- アタッカー数: ${at.attackers}体\n`;
    if (at.attackTriggers.length > 0) {
      synergyText += `- 攻撃トリガー: ${at.attackTriggers.join(', ')}\n`;
    }
    if (at.raidCards.length > 0) {
      synergyText += `- Raidカード: ${at.raidCards.join(', ')}\n`;
    }
    if (at.enablers.length > 0) {
      synergyText += `- 攻撃補助 (速攻/回避/追加戦闘): ${at.enablers.join(', ')}\n`;
    }
  }

  // タップ/アンタップシナジー (Tap/Untap)
  if (synergyAnalysis.tapUntapSynergy) {
    const tu = synergyAnalysis.tapUntapSynergy;
    synergyText += '\nタップ/アンタップシナジー (起動型能力活用型) (スコア:' + tu.score + '/10):\n';
    if (tu.tapAbilities.length > 0) {
      synergyText += `- タップ能力: ${tu.tapAbilities.join(', ')}\n`;
    }
    if (tu.untappers.length > 0) {
      synergyText += `- アンタップ手段: ${tu.untappers.join(', ')}\n`;
    }
    if (tu.tapTriggers.length > 0) {
      synergyText += `- タップ誘発: ${tu.tapTriggers.join(', ')}\n`;
    }
    if (tu.vigilanceCards.length > 0) {
      synergyText += `- 警戒持ち: ${tu.vigilanceCards.join(', ')}\n`;
    }
  }

  // エンチャント/アーティファクトシナジー (Enchantment/Artifact)
  if (synergyAnalysis.enchantmentArtifactSynergy) {
    const ea = synergyAnalysis.enchantmentArtifactSynergy;
    synergyText += '\nエンチャント/アーティファクトテーマ (スコア:' + ea.score + '/10):\n';
    synergyText += `- エンチャント数: ${ea.enchantmentCount}枚 / アーティファクト数: ${ea.artifactCount}枚\n`;
    if (ea.enchantmentTriggers.length > 0) {
      synergyText += `- エンチャント誘発 (Constellation等): ${ea.enchantmentTriggers.join(', ')}\n`;
    }
    if (ea.enchantmentPayoffs.length > 0) {
      synergyText += `- エンチャント参照: ${ea.enchantmentPayoffs.join(', ')}\n`;
    }
    if (ea.artifactTriggers.length > 0) {
      synergyText += `- アーティファクト誘発: ${ea.artifactTriggers.join(', ')}\n`;
    }
    if (ea.artifactPayoffs.length > 0) {
      synergyText += `- アーティファクト参照 (Affinity/Improvise等): ${ea.artifactPayoffs.join(', ')}\n`;
    }
  }

  // ライブラリートップ操作シナジー (Library Top Manipulation)
  if (synergyAnalysis.libraryTopSynergy) {
    const lt = synergyAnalysis.libraryTopSynergy;
    synergyText += '\nライブラリートップ操作 (スコア:' + lt.score + '/10):\n';
    if (lt.topManipulators.length > 0) {
      synergyText += `- トップ操作 (Scry/Brainstorm等): ${lt.topManipulators.join(', ')}\n`;
    }
    if (lt.topPayoffs.length > 0) {
      synergyText += `- トップ参照 (Miracle等): ${lt.topPayoffs.join(', ')}\n`;
    }
  }

  // 除外ゾーンシナジー (Exile Zone Synergies)
  if (synergyAnalysis.exileZoneSynergy) {
    const ez = synergyAnalysis.exileZoneSynergy;
    synergyText += '\n除外ゾーンシナジー (スコア:' + ez.score + '/10):\n';
    if (ez.blinkEffects.length > 0) {
      synergyText += `- ブリンク効果 (Flicker): ${ez.blinkEffects.join(', ')}\n`;
    }
    if (ez.exilePayoffs.length > 0) {
      synergyText += `- 除外参照 (Adventure/Foretell/Escape等): ${ez.exilePayoffs.join(', ')}\n`;
    }
    if (ez.exilers.length > 0) {
      synergyText += `- 除外効果: ${ez.exilers.join(', ')}\n`;
    }
  }

  return `【戦略・シナジー分析】${deck.name} (${deck.format})

カードリスト:
${mainboardList}

構成:
- クリーチャー:${typeDistribution['クリーチャー']} インスタント:${typeDistribution['インスタント']} ソーサリー:${typeDistribution['ソーサリー']}
- エンチャント:${typeDistribution['エンチャント']} アーティファクト:${typeDistribution['アーティファクト']} PW:${typeDistribution['プレインズウォーカー']} 土地:${typeDistribution['土地']}

キーカード到達率: ${keyCardText}

デッキシナジースコア: ${synergyAnalysis.overallScore}/10
${synergyText}

以下を分析:
1. アーキタイプ判定と構成の整合性
2. 検出されたシナジー・コンボの評価と成立確率、追加で強化できるシナジー
3. ゲームプラン（序盤・中盤・終盤）と実現可能性
4. 改善提案（追加・削除カード、メタゲーム評価、シナジー強化案）`;
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
