import { NextRequest, NextResponse } from 'next/server';
import { generateText } from '@/lib/ai/gemini';
import { Deck } from '@/types/deck';
import {
  simulateOpeningHands,
  simulateEarlyGame,
  simulateKeyCardDrawRate,
} from '@/lib/deck/simulator';
import {
  buildManabaseAnalysisPrompt,
  buildStrategyAnalysisPrompt,
  buildSideboardAnalysisPrompt,
  buildComprehensiveAnalysisPrompt,
  AnalysisType,
} from '@/lib/ai/prompts';

export async function POST(request: NextRequest) {
  try {
    const deck: Deck = await request.json();

    // URLパラメータ取得
    const url = new URL(request.url);
    const isDryRun = url.searchParams.get('dry_run') === 'true';
    const analysisType = (url.searchParams.get('type') || 'comprehensive') as AnalysisType;

    // シミュレーション実行
    const openingHandStats = simulateOpeningHands(deck.mainboard, 1000);
    const earlyGameStats = simulateEarlyGame(deck.mainboard, 1000);

    // キーカードを特定
    const keyCards = deck.mainboard
      .filter((dc) => {
        const cmc = dc.card.cmc || 0;
        const typeLine = dc.card.type_line.toLowerCase();
        return cmc >= 3 && (typeLine.includes('creature') || typeLine.includes('enchantment'));
      })
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 2);

    const keyCardStats = keyCards.map((dc) =>
      simulateKeyCardDrawRate(deck.mainboard, dc.card.name, 1000)
    );

    // 分析タイプに応じてプロンプトを生成
    let prompt: string;
    switch (analysisType) {
      case 'manabase':
        prompt = buildManabaseAnalysisPrompt(deck, openingHandStats, earlyGameStats);
        break;
      case 'strategy':
        prompt = buildStrategyAnalysisPrompt(deck, keyCardStats);
        break;
      case 'sideboard':
        prompt = buildSideboardAnalysisPrompt(deck);
        break;
      case 'comprehensive':
      default:
        prompt = buildComprehensiveAnalysisPrompt(deck, openingHandStats, earlyGameStats);
        break;
    }

    // dry_run の場合はプロンプトとシステムプロンプトを返す
    if (isDryRun) {
      // システムプロンプトを取得（gemini.tsから）
      const systemPrompt = `あなたはMagic: The Gatheringの競技プレイヤーで、デッキ構築とメタゲーム分析の専門家です。
数値データと確率統計に基づいた客観的な分析を行い、具体的で実践的な改善提案を提供します。

分析の際は以下を重視してください：
- シミュレーション結果などの数値的根拠を示す
- 具体的なカード名を挙げて提案する
- 実践的で実現可能な改善案を提示する
- 簡潔で分かりやすい日本語で回答する`;

      return NextResponse.json({
        systemPrompt,
        userPrompt: prompt,
        analysisType
      });
    }

    // Gemini APIで分析
    const analysis = await generateText(prompt);

    return NextResponse.json({ analysis, analysisType });
  } catch (error) {
    console.error('[AI Analysis] Error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze deck' },
      { status: 500 }
    );
  }
}
