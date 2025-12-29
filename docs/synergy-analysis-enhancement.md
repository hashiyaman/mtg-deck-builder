# シナジー分析の高度化計画

## 現状（Phase 1）と今後の拡張案

### Phase 1: 基本的なパターンマッチング ✅ 完了
- 部族、トークン、墓地、カウンター、キーワードの検出
- oracle_textの正規表現マッチング
- 1-10のスコアリング

### Phase 2: グラフ理論的アプローチ（提案）

#### 2.1 シナジータイプの分類体系の拡張

レポートで示された分類を取り入れ、シナジーをより詳細に分類：

```typescript
export type SynergyType =
  // 基本シナジー（Phase 1で実装済み）
  | 'tribal'              // 部族
  | 'token'               // トークン
  | 'graveyard'           // 墓地
  | 'counter'             // +1/+1カウンター
  | 'keyword_cluster'     // キーワード集中

  // 高度なシナジー（Phase 2で実装予定）
  | 'feedback_loop'       // 正のフィードバックループ（魂の導き手 + オセロット）
  | 'threshold'           // 閾値達成（金属術、昂揚、領域など）
  | 'scaling'             // 線形スケーリング（親和、ウルザの物語）
  | 'cost_reduction'      // コスト軽減（親和、召集など）
  | 'infinite_combo'      // 無限コンボ（欠片の双子 + 欺瞞の総督）
  | 'draw_filter'         // ドロー・濾過（緑の太陽の頂点型サーチ）
  | 'mana_acceleration'   // マナ加速の複合効果
```

#### 2.2 カードグラフの構築

各カードをノード、シナジーをエッジとするグラフを構築：

```typescript
interface CardNode {
  cardId: string;
  cardName: string;
  quantity: number;
  properties: {
    types: string[];        // Creature, Artifact, etc.
    subtypes: string[];     // Elf, Equipment, etc.
    keywords: string[];     // Flying, Haste, etc.
    cmc: number;
    colors: string[];
  };
}

interface CardEdge {
  sourceCardId: string;
  targetCardId: string;
  synergyType: SynergyType;
  strength: number;         // 0.0-1.0 の相関強度
  bidirectional: boolean;   // 双方向シナジーか
  description: string;      // シナジーの説明
}

interface DeckGraph {
  nodes: Map<string, CardNode>;
  edges: CardEdge[];
}
```

#### 2.3 中心性指標の計算

**次数中心性 (Degree Centrality)**
- 多くのカードと相互作用するハブカードを検出
- 例: 《魂の導き手》はクリーチャー・エネルギー・ライフゲインで高次数

```typescript
function calculateDegreeCentrality(graph: DeckGraph): Map<string, number> {
  // 各ノードに接続するエッジ数をカウント
  // 正規化: degree / (total_nodes - 1)
}
```

**媒介中心性 (Betweenness Centrality)**
- 異なるシナジークラスター間を繋ぐカードを検出
- 例: 《ウルザの物語》はマナ基盤とアーティファクト戦略を媒介

```typescript
function calculateBetweennessCentrality(graph: DeckGraph): Map<string, number> {
  // 全ての最短経路の中で、そのノードを通過する経路の割合を計算
}
```

### Phase 3: 確率論的分析（提案）

#### 3.1 超幾何分布によるコンボ確率

Frank Karstenの手法を実装：

```typescript
/**
 * 超幾何分布: デッキから特定カードを引く確率
 * @param deckSize デッキ枚数（通常60）
 * @param copies デッキ内のコピー枚数
 * @param draws ドロー枚数
 * @param needed 必要枚数
 */
function hypergeometricProbability(
  deckSize: number,
  copies: number,
  draws: number,
  needed: number
): number {
  // P(X >= needed) = Σ[k=needed to min(copies, draws)] C(copies, k) * C(deckSize-copies, draws-k) / C(deckSize, draws)
}

/**
 * T3, T4でのコンボ成立確率
 */
function calculateComboChance(
  deck: Deck,
  comboCards: string[],  // コンボに必要なカード名
  turn: number
): {
  turn3Probability: number;
  turn4Probability: number;
  expectedTurn: number;  // コンボが揃う期待ターン
} {
  // 初手7枚 + ドロー(turn-1)枚での確率計算
  // マリガン考慮: London Mulligan戦略
}
```

#### 3.2 フィードバックループの検出

レポートの「魂の導き手 + オセロット」型の相互増幅を検出：

```typescript
function detectFeedbackLoops(deck: Deck): FeedbackLoop[] {
  // パターン:
  // Card A triggers on X → produces Y
  // Card B triggers on Y → produces X
  // 例: 導き手(クリーチャー→エネルギー+ライフ) + オセロット(ライフ→トークン/クリーチャー)

  return loops;
}
```

#### 3.3 閾値シナジーの検出

金属術、昂揚、領域などの条件達成を分析：

```typescript
interface ThresholdSynergy {
  thresholdType: 'metalcraft' | 'delirium' | 'domain' | 'threshold' | 'descend';
  requiredCount: number;       // 必要枚数（金属術なら3）
  enablers: string[];          // 条件を満たすカード
  payoffs: string[];           // 条件達成時の報酬カード
  achievementProbability: number;  // T1, T2, T3での達成確率
}

function detectThresholdSynergies(deck: Deck): ThresholdSynergy[] {
  // 金属術: アーティファクト3つ以上
  // 昂揚: 墓地のカードタイプ4種以上
  // など
}
```

### Phase 4: ベクトル空間モデル（将来的）

NLP技術を応用した高度な分析：

```typescript
/**
 * カードテキストからTF-IDF特徴ベクトルを生成
 */
function generateCardVector(card: Card): number[] {
  // oracle_textを単語に分割
  // TF-IDF計算
  // 多次元ベクトル化
}

/**
 * 2つのカードの機能的類似度を計算
 */
function calculateCosineSimilarity(vectorA: number[], vectorB: number[]): number {
  // cos(θ) = (A · B) / (||A|| ||B||)
}
```

## 実装優先順位

### 高優先度（Phase 2前半）
1. ✅ シナジータイプの拡張（型定義）
2. ✅ カードグラフの構築
3. ✅ 次数中心性の計算
4. ✅ フィードバックループ検出
5. ✅ 閾値シナジー検出（金属術、昂揚）

### 中優先度（Phase 2後半）
6. 媒介中心性の計算（より複雑なグラフアルゴリズム）
7. 超幾何分布によるコンボ確率計算
8. 無限コンボの自動検出

### 低優先度（Phase 3-4）
9. モンテカルロシミュレーション
10. ベクトル空間モデル（機械学習的アプローチ）

## 技術的考慮事項

### グラフライブラリの選択
- **graphology**: 軽量なJavaScriptグラフライブラリ
  - 中心性指標の計算機能あり
  - TypeScript対応

### 確率計算ライブラリ
- **mathjs**: 組み合わせ計算、確率関数
- **jStat**: 統計・確率分布

## 次のステップ

Phase 2の実装を開始する前に、以下を確認：
1. どの機能から実装を始めるか？（推奨: フィードバックループ + 閾値検出）
2. 外部ライブラリ（graphology, mathjs）の導入は許可するか？
3. AIプロンプトにどの程度の詳細情報を含めるか？（トークン数制約）

---

**参考文献**: 2025年12月期 モダン環境におけるカードシナジーの計算論的分析報告書
