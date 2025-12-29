'use client';

import { use, useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDeckStore } from '@/store/deckStore';
import { useUIStore } from '@/store/uiStore';
import { DeckCardList } from '@/components/deck/DeckCardList';
import { DeckStats } from '@/components/deck/DeckStats';
import { ManaCurve } from '@/components/deck/ManaCurve';
import { ColorDistribution } from '@/components/deck/ColorDistribution';
import { SynergyAnalysis } from '@/components/deck/SynergyAnalysis';
import { DeckImport } from '@/components/deck/DeckImport';
import { DeckExport } from '@/components/deck/DeckExport';
import { CardDetail } from '@/components/cards/CardDetail';
import { analyzeDeckSynergies } from '@/lib/deck/synergyAnalyzer';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save, FileUp, Languages, Sparkles, Copy, Check } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface DeckEditorPageProps {
  params: Promise<{ deckId: string }>;
}

export default function DeckEditorPage({ params }: DeckEditorPageProps) {
  const { deckId } = use(params);
  const router = useRouter();
  const { currentDeck, loadDeck, updateQuantity, removeCard, updateDeckInfo, getDeckStats, enrichAllCardsWithJapanese, isLoading, enrichmentProgress } = useDeckStore();
  const { selectedCard, selectCard } = useUIStore();
  const [deckName, setDeckName] = useState('');
  const [deckDescription, setDeckDescription] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [isEnriching, setIsEnriching] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisType, setAnalysisType] = useState<'manabase' | 'strategy' | 'sideboard' | 'comprehensive'>('manabase');
  const [systemPrompt, setSystemPrompt] = useState<string | null>(null);
  const [userPrompt, setUserPrompt] = useState<string | null>(null);
  const [copiedSystem, setCopiedSystem] = useState(false);
  const [copiedUser, setCopiedUser] = useState(false);

  useEffect(() => {
    console.log('Loading deck with ID:', deckId);
    loadDeck(deckId);
  }, [deckId, loadDeck]);

  useEffect(() => {
    if (currentDeck) {
      console.log('Current deck loaded:', currentDeck);
      setDeckName(currentDeck.name);
      setDeckDescription(currentDeck.description || '');
    } else {
      console.log('Current deck is null');
    }
  }, [currentDeck]);

  // useMemoでメモ化して無限ループを防ぐ（条件分岐の前に配置）
  const stats = useMemo(() => {
    if (!currentDeck) return null;
    return getDeckStats();
  }, [currentDeck, getDeckStats]);

  // シナジー分析も同様にメモ化
  const synergies = useMemo(() => {
    if (!currentDeck) return null;
    return analyzeDeckSynergies(currentDeck.mainboard);
  }, [currentDeck]);

  // All hooks must be called before any conditional returns
  const handleSaveDeckInfo = useCallback(() => {
    updateDeckInfo({
      name: deckName,
      description: deckDescription,
    });
  }, [deckName, deckDescription, updateDeckInfo]);

  const handleEnrichWithJapanese = useCallback(async () => {
    console.log('Starting Japanese enrichment...');
    setIsEnriching(true);
    try {
      await enrichAllCardsWithJapanese();
      console.log('Japanese enrichment completed successfully');
      toast.success('日本語情報の取得が完了しました！');
    } catch (error) {
      console.error('Error enriching with Japanese:', error);
      toast.error('エラーが発生しました。一部のカードの日本語情報を取得できませんでした。');
    } finally {
      setIsEnriching(false);
    }
  }, [enrichAllCardsWithJapanese]);

  const handleAnalyzeDeck = useCallback(async (dryRun = false, type?: string) => {
    if (!currentDeck) return;

    const selectedType = type || analysisType;

    setIsAnalyzing(true);
    setShowAnalysis(true);
    setAnalysisResult(dryRun ? 'プロンプト確認中...' : '分析中...');

    try {
      const params = new URLSearchParams();
      if (dryRun) params.append('dry_run', 'true');
      params.append('type', selectedType);

      const url = `/api/ai/analyze-deck?${params.toString()}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentDeck),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze deck');
      }

      const data = await response.json();
      if (dryRun) {
        setSystemPrompt(data.systemPrompt);
        setUserPrompt(data.userPrompt);
        setAnalysisResult(null); // プロンプト確認モードでは分析結果をクリア
      } else {
        setSystemPrompt(null);
        setUserPrompt(null);
        setAnalysisResult(data.analysis);
      }
    } catch (error) {
      console.error('Error analyzing deck:', error);
      setAnalysisResult('エラーが発生しました。もう一度お試しください。');
    } finally {
      setIsAnalyzing(false);
    }
  }, [currentDeck, analysisType]);

  const getAnalysisTypeName = useCallback((type: string) => {
    switch (type) {
      case 'manabase': return 'マナベース分析';
      case 'strategy': return '戦略・シナジー分析';
      case 'sideboard': return 'サイドボード分析';
      case 'comprehensive': return '総合分析';
      default: return '分析';
    }
  }, []);

  const handleCopySystemPrompt = useCallback(async () => {
    if (!systemPrompt) return;

    try {
      await navigator.clipboard.writeText(systemPrompt);
      setCopiedSystem(true);
      setTimeout(() => setCopiedSystem(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }, [systemPrompt]);

  const handleCopyUserPrompt = useCallback(async () => {
    if (!userPrompt) return;

    try {
      await navigator.clipboard.writeText(userPrompt);
      setCopiedUser(true);
      setTimeout(() => setCopiedUser(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }, [userPrompt]);

  const handleCopyAnalysis = useCallback(async () => {
    if (!analysisResult) return;

    try {
      await navigator.clipboard.writeText(analysisResult);
      setCopiedUser(true);
      setTimeout(() => setCopiedUser(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }, [analysisResult]);

  if (!currentDeck) {
    console.log('Waiting for deck to load...');
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Loading deck...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/deck">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              デッキ一覧に戻る
            </Button>
          </Link>
          <div>
            <Input
              value={deckName}
              onChange={(e) => setDeckName(e.target.value)}
              onBlur={handleSaveDeckInfo}
              className="text-2xl font-bold h-auto border-none px-2 py-1 focus-visible:ring-1"
            />
            <p className="text-sm text-muted-foreground ml-2">
              {currentDeck.format.charAt(0).toUpperCase() + currentDeck.format.slice(1)}
            </p>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <select
            value={analysisType}
            onChange={(e) => setAnalysisType(e.target.value as any)}
            className="border rounded px-2 py-1 text-sm"
            disabled={isAnalyzing}
          >
            <option value="manabase">マナベース分析</option>
            <option value="strategy">戦略・シナジー分析</option>
            <option value="sideboard">サイドボード分析</option>
            <option value="comprehensive">総合分析</option>
          </select>
          <Button
            variant="outline"
            onClick={() => handleAnalyzeDeck(true)}
            disabled={isAnalyzing}
            size="sm"
          >
            プロンプト確認
          </Button>
          <Button
            variant="outline"
            onClick={() => handleAnalyzeDeck(false)}
            disabled={isAnalyzing}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {isAnalyzing ? 'AI分析中...' : 'AI分析'}
          </Button>
          <Button
            variant="outline"
            onClick={handleEnrichWithJapanese}
            disabled={isEnriching}
          >
            <Languages className="h-4 w-4 mr-2" />
            {enrichmentProgress
              ? `取得中... (${enrichmentProgress.current}/${enrichmentProgress.total})`
              : isEnriching
              ? '取得中...'
              : '日本語取得'}
          </Button>
          <Button variant="outline" onClick={() => setShowImport(true)}>
            <FileUp className="h-4 w-4 mr-2" />
            インポート
          </Button>
          <DeckExport deck={currentDeck} />
          <Button onClick={handleSaveDeckInfo}>
            <Save className="h-4 w-4 mr-2" />
            保存
          </Button>
        </div>
      </div>

      {/* Description */}
      <div className="mb-6">
        <Label htmlFor="description" className="text-sm text-muted-foreground">
          説明
        </Label>
        <Input
          id="description"
          placeholder="デッキの説明を入力..."
          value={deckDescription}
          onChange={(e) => setDeckDescription(e.target.value)}
          onBlur={handleSaveDeckInfo}
        />
      </div>

      {/* Main Content - Split Layout */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Card Lists */}
        <div className="lg:col-span-2 space-y-4">
          <Tabs defaultValue="mainboard" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="mainboard">
                メインボード ({stats?.cardCount.mainboard || 0})
              </TabsTrigger>
              <TabsTrigger value="sideboard">
                サイドボード ({stats?.cardCount.sideboard || 0})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="mainboard" className="mt-4">
              <DeckCardList
                cards={currentDeck.mainboard}
                onQuantityChange={(cardId, newQuantity) =>
                  updateQuantity(cardId, newQuantity, 'mainboard')
                }
                onRemove={(cardId) => removeCard(cardId, 'mainboard')}
                onCardClick={(card) => selectCard(card)}
                synergies={synergies}
              />
            </TabsContent>
            <TabsContent value="sideboard" className="mt-4">
              <DeckCardList
                cards={currentDeck.sideboard}
                onQuantityChange={(cardId, newQuantity) =>
                  updateQuantity(cardId, newQuantity, 'sideboard')
                }
                onRemove={(cardId) => removeCard(cardId, 'sideboard')}
                onCardClick={(card) => selectCard(card)}
                synergies={synergies}
              />
            </TabsContent>
          </Tabs>

          {/* Add Cards Link */}
          <div className="border-2 border-dashed rounded-lg p-6 text-center">
            <p className="text-muted-foreground mb-2">カードを追加しますか？</p>
            <Link href="/search">
              <Button variant="outline">カード検索</Button>
            </Link>
          </div>
        </div>

        {/* Right: Statistics */}
        <div className="space-y-4">
          {stats && (
            <>
              <DeckStats stats={stats} />
              <ManaCurve data={stats.manaCurve} />
              <ColorDistribution data={stats.colorDistribution} />
            </>
          )}
          {synergies && <SynergyAnalysis synergies={synergies} cards={currentDeck.mainboard} />}
        </div>
      </div>

      {/* Card Detail Modal */}
      <CardDetail
        card={selectedCard}
        open={!!selectedCard}
        onOpenChange={(open) => !open && selectCard(null)}
      />

      {/* Import Dialog */}
      <DeckImport
        open={showImport}
        onOpenChange={setShowImport}
        deckId={deckId}
      />

      {/* AI Analysis Dialog */}
      <Dialog open={showAnalysis} onOpenChange={setShowAnalysis}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI デッキ分析
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            {/* プロンプト確認モード */}
            {systemPrompt && userPrompt && (
              <>
                {/* システムプロンプト */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-sm">システムプロンプト</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopySystemPrompt}
                    >
                      {copiedSystem ? (
                        <>
                          <Check className="h-3 w-3 mr-1" />
                          コピー済み
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3 mr-1" />
                          コピー
                        </>
                      )}
                    </Button>
                  </div>
                  <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed bg-muted p-3 rounded">
                    {systemPrompt}
                  </pre>
                </div>

                {/* ユーザープロンプト */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-sm">ユーザープロンプト</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyUserPrompt}
                    >
                      {copiedUser ? (
                        <>
                          <Check className="h-3 w-3 mr-1" />
                          コピー済み
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3 mr-1" />
                          コピー
                        </>
                      )}
                    </Button>
                  </div>
                  <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed bg-muted p-3 rounded">
                    {userPrompt}
                  </pre>
                </div>
              </>
            )}

            {/* AI分析結果 */}
            {analysisResult && (
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sm">分析結果</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyAnalysis}
                  >
                    {copiedUser ? (
                      <>
                        <Check className="h-3 w-3 mr-1" />
                        コピー済み
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3 mr-1" />
                        コピー
                      </>
                    )}
                  </Button>
                </div>
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                    {analysisResult}
                  </pre>
                </div>
              </div>
            )}

            {/* ローディング */}
            {!systemPrompt && !userPrompt && !analysisResult && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
