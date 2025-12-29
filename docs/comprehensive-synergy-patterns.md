# MTGシナジーパターン包括的カタログ

主要なMTGウェブサイト（EDHREC, Scryfall, Archidekt, MTG Wiki等）から収集した、
シナジー検出パターンの網羅的なリストです。

## 情報源
- Scryfall (検索構文、メカニクス分類)
- Archidekt (タグシステム)
- MTG Wiki (アーキタイプ、コンボ、メカニクス、部族)

---

## 1. アーキタイプ別シナジー

### 1.1 基本アーキタイプ
- **Aggro**: 低コストクリーチャー、バーン、ヘイスト
- **Control**: 除去、打ち消し、ドロー、フィニッシャー
- **Combo**: 2-3カードの相互作用による勝利条件
- **Midrange**: バリュークリーチャー、除去、カードアドバンテージ

### 1.2 ハイブリッドアーキタイプ
- **Aggro-Control** (Tempo): 効率的な除去 + 軽量脅威
- **Aggro-Combo**: 速攻と決定的コンボの併用
- **Combo-Control**: コンボ保護のための打ち消し/除去
- **Midrange**: AggroとControlの中間

---

## 2. メカニクス別シナジーパターン

### 2.1 リソース生成・操作

#### マナ加速
```typescript
interface ManaAccelerationSynergy {
  rampSpells: string[];      // 土地サーチ、マナクリーチャー
  payoffs: string[];         // 高マナコストの脅威
  expectedTurnAdvantage: number; // T4に6マナ等
}
```
**検出パターン**:
- `oracle:/land.*search|land.*library/` (土地サーチ)
- `oracle:/add.*mana/` かつ `cmc<=2` (マナクリーチャー/アーティファクト)
- Payoff: `cmc>=6` の強力な呪文

**例**: Llanowar Elves → Primeval Titan

---

#### カードドロー・濾過
```typescript
interface CardAdvantageSynergy {
  drawEngines: string[];     // 継続的ドローソース
  cantrips: string[];        // 1:1交換呪文
  filtering: string[];       // Scry, Surveil等
}
```
**検出パターン**:
- `oracle:/draw.*card/`
- `oracle:/scry|surveil|explore/`
- Archidekt tag: "Spellslinger"

**例**: Mystic Remora + Rhystic Study

---

### 2.2 戦闘メカニクス

#### 回避能力クラスター
```typescript
interface EvasionSynergy {
  keyword: 'Flying' | 'Menace' | 'Trample' | 'Unblockable';
  creatures: string[];
  anthems: string[];         // 全体強化
}
```
**検出パターン**:
- `keyword:flying` + `oracle:/creatures.*get \+/`
- Archidekt tag: "Flying creatures"

**Draft Archetype 例**:
- WU (白青): Flying
- RG (赤緑): Trample + Power-matters

---

#### 攻撃トリガー (Raid, Battle Cry)
```typescript
interface AttackTriggerSynergy {
  attackers: string[];       // 攻撃時トリガー
  enablers: string[];        // 攻撃を促進
}
```
**検出パターン**:
- `oracle:/whenever.*attacks/`
- `oracle:/raid/`
- Archidekt tag: "Aggro", "Attacking-matters"

**例**: Edric, Spymaster of Trest + 回避持ち小型クリーチャー

---

### 2.3 リソース変換

#### 生け贄 (Sacrifice)
```typescript
interface SacrificeSynergy {
  outlets: string[];         // 生け贄先
  fodder: string[];          // トークン生成等
  payoffs: string[];         // 死亡時トリガー
}
```
**検出パターン**:
- `oracle:/sacrifice.*creature/` (アウトレット)
- `oracle:/create.*token/` (餌)
- `oracle:/whenever.*dies/` (ペイオフ)
- Archidekt tag: "Sacrifice", "Aristocrats"

**例**: Ashnod's Altar + Squirrel Nest + Earthcraft (無限マナ)

---

#### タップ/アンタップ
```typescript
interface TapSynergy {
  tapAbilities: string[];    // タップ能力持ち
  untappers: string[];       // アンタップ効果
}
```
**検出パターン**:
- `oracle:/{T}:/` (タップシンボル)
- `oracle:/untap.*creature|permanent/`
- Archidekt tag: "Tap/Untap"

**例**: Basalt Monolith + Rings of Brighthearth (無限マナ)

---

### 2.4 領域シナジー

#### 墓地 (既に実装済み、拡張案)
```typescript
interface GraveyardSynergyExtended {
  // 既存
  graveyardFillers: string[];
  graveyardPayoffs: string[];

  // 追加
  selfMill: string[];        // 自分のライブラリー削り
  reanimation: string[];     // 墓地から戦場へ
  recursion: string[];       // 墓地から手札へ
  threshold: string[];       // 墓地枚数参照
  delirium: string[];        // カードタイプ4種以上
}
```
**検出パターン**:
- `oracle:/mill/` (セルフミル)
- `oracle:/return.*from.*graveyard.*battlefield/` (リアニメイト)
- `oracle:/return.*from.*graveyard.*hand/` (リカージョン)
- `oracle:/threshold|delirium/` (閾値メカニクス)
- Archidekt tag: "Reanimator", "Self-Mill"

---

#### 除外 (Exile)
```typescript
interface ExileSynergy {
  exilers: string[];         // 除外効果
  exilePayoffs: string[];    // 除外領域参照
  blinkEffects: string[];    // 一時除外→戦場復帰
}
```
**検出パターン**:
- `oracle:/exile/`
- `oracle:/adventure|foretell|escape/` (除外ゾーン利用メカニクス)
- Scryfall: `is:adventure`

**例**: Blink (Flickerwisp) + ETBクリーチャー

---

#### ライブラリートップ操作
```typescript
interface LibraryTopSynergy {
  topManipulators: string[]; // Scry, Brainstorm等
  topPayoffs: string[];      // ライブラリートップ参照
}
```
**検出パターン**:
- `oracle:/scry|fateseal/`
- `oracle:/top.*library/`
- `oracle:/miracle/`

---

### 2.5 カウンター・トークンメカニクス

#### +1/+1カウンター (既に実装済み、拡張案)
```typescript
interface CounterSynergyExtended {
  // 既存
  counterCards: string[];
  proliferateCards: string[];

  // 追加
  modularCards: string[];    // Modular
  graftCards: string[];      // Graft
  evolveCards: string[];     // Evolve
  adaptCards: string[];      // Adapt
  renownCards: string[];     // Renown
  movementEffects: string[]; // カウンター移動
}
```
**検出パターン**:
- `oracle:/modular|graft|evolve|adapt|renown/`
- `oracle:/move.*counter/`
- Archidekt tag: "+1/+1 Counters"

---

#### その他のカウンター
```typescript
interface AlternativeCounterSynergy {
  type: 'charge' | 'loyalty' | 'time' | 'poison' | 'energy';
  generators: string[];
  consumers: string[];
}
```
**検出パターン**:
- `oracle:/charge counter/`
- `oracle:/energy counter|{E}/` (エナジー)
- `oracle:/poison counter/` (毒)
- `type:planeswalker` (忠誠度カウンター)

**例**: Energy (Aether Hub + Harnessed Lightning)

---

#### トークン (既に実装済み、拡張案)
```typescript
interface TokenSynergyExtended {
  // 既存
  producers: string[];
  payoffs: string[];

  // 追加
  doubling: string[];        // トークン倍化
  specificTokens: {          // トークンタイプ別
    treasures: string[];     // 宝物
    clues: string[];         // 手がかり
    food: string[];          // 食物
  };
}
```
**検出パターン**:
- `oracle:/twice that many.*token/` (倍化)
- `oracle:/Treasure|Clue|Food token/` (特定トークン)
- Archidekt tag: "Tokens"

---

### 2.6 呪文シナジー

#### インスタント/ソーサリー重視
```typescript
interface SpellslingerSynergy {
  spellTriggers: string[];   // 呪文キャストでトリガー
  spells: string[];          // インスタント/ソーサリー
  cost_reduction: string[];  // コスト軽減
  flashback: string[];       // 再利用
}
```
**検出パターン**:
- `oracle:/whenever.*cast.*instant or sorcery/`
- `oracle:/prowess|storm/`
- `oracle:/flashback/`
- Archidekt tag: "Spellslinger"

**例**: Young Pyromancer + Cantrips

---

### 2.7 アーティファクト/エンチャント

#### アーティファクト
```typescript
interface ArtifactSynergy {
  artifacts: string[];
  metalcraft: string[];      // AF3つ以上
  affinity: string[];        // 親和
  modular: string[];         // モジュラー
}
```
**検出パターン**:
- `type:artifact`
- `oracle:/metalcraft|affinity|improvise/`
- Archidekt tag: "Artifacts"

**例**: Urza's Saga + 0マナAF (Mox Opal等)

---

#### エンチャント
```typescript
interface EnchantmentSynergy {
  enchantments: string[];
  constellation: string[];   // エンチャント着地トリガー
  enchantresses: string[];   // エンチャントドロー
}
```
**検出パターン**:
- `type:enchantment`
- `oracle:/constellation/`
- `oracle:/whenever.*enchantment.*draw/`

---

### 2.8 土地

#### 土地枚数参照
```typescript
interface LandMattersSynergy {
  landfall: string[];        // 土地着地トリガー
  landCount: string[];       // 土地枚数参照
  landAnimation: string[];   // 土地クリーチャー化
}
```
**検出パターン**:
- `oracle:/landfall/`
- `oracle:/lands you control/`
- `oracle:/land.*creature/`

---

#### 土地タイプ参照 (Domain)
```typescript
interface DomainSynergy {
  domainCards: string[];     // 基本土地タイプ数参照
  landTypes: number;         // デッキの基本土地タイプ数
}
```
**検出パターン**:
- `oracle:/domain/`
- `oracle:/basic land type/`

---

## 3. 部族 (Tribal) シナジー (既に実装済み、拡張案)

### 3.1 主要クリーチャータイプ

#### ロード効果 (Lords)
```typescript
interface TribalSynergyExtended {
  // 既存
  type: string;
  count: number;
  cards: string[];

  // 追加
  lords: string[];           // タイプ強化
  typalSpells: string[];     // 部族呪文
  changelings: string[];     // 全タイプ持ち
}
```

**重要クリーチャータイプ** (競技環境):
- **Elf**: マナ加速、ロード効果
- **Goblin**: トークン、犠牲、バーン
- **Merfolk**: ロード、タップ妨害
- **Human**: 多様な能力、シナジー広範
- **Wizard**: 呪文シナジー、タップ能力
- **Zombie**: リアニメイト、トークン
- **Vampire**: ライフロス、+1/+1カウンター
- **Dragon**: 高パワー、フライヤー
- **Angel**: ライフゲイン、フライヤー
- **Elemental**: Evoke、ETB効果

**検出パターン**:
- `type:creature` + 特定サブタイプ8枚以上 (既存)
- `oracle:/[Type] you control get \+/` (ロード)
- `oracle:/changeling/` (全タイプ)

**Lorwyn block 重要タイプ**:
- Elemental, Elf, Faerie, Giant, Goblin, Kithkin, Merfolk, Treefolk

**クラスタイプ** (Morningtide):
- Rogue, Shaman, Soldier, Warrior, Wizard

---

## 4. コンボパターン

### 4.1 無限コンボ
```typescript
interface InfiniteCombo {
  cards: string[];           // 必要カード (通常2-3枚)
  produces: 'mana' | 'creatures' | 'damage' | 'mill' | 'life';
  difficulty: 'easy' | 'medium' | 'hard'; // セットアップ難易度
}
```

**有名な無限コンボ**:
1. **Splinter Twin + Deceiver Exarch** (無限クリーチャー)
2. **Devoted Druid + Vizier of Remedies** (無限マナ)
3. **Heliod + Walking Ballista** (無限ダメージ)
4. **Basalt Monolith + Rings of Brighthearth** (無限マナ)
5. **Underworld Breach + Lion's Eye Diamond** (ストーム)

**検出方法**:
- フィードバックループ検出の拡張
- 既知のコンボデータベース照合

---

### 4.2 2カードコンボ vs エンジン

**2カードコンボ**: 2枚で即座に勝利
**エンジン**: 継続的なアドバンテージ生成

```typescript
interface ComboVsEngine {
  isWincon: boolean;         // 即勝利か
  isRepeatable: boolean;     // 繰り返し可能か
  requiresSetup: boolean;    // セットアップが必要か
}
```

---

## 5. Scryfallの高度な検索パターン

### 5.1 function: タグ
- `function:removal` - 除去
- `function:tutor` - サーチ
- `function:draw` - ドロー
- `function:ramp` - マナ加速

### 5.2 is: フラグ
- `is:vanilla` - 能力なしクリーチャー
- `is:historic` - 歴史的 (伝説、アーティファクト、Saga)
- `is:party` - パーティー (Cleric, Rogue, Warrior, Wizard)
- `is:companion` - 相棒
- `is:adventure` - 出来事

---

## 6. Archidektタグシステム

### 6.1 戦略タグ
- Combo
- Aggro
- Control
- Reanimator
- Self-Mill
- Spellslinger
- Stompy (大型クリーチャービートダウン)

### 6.2 メカニクスタグ
- Artifacts
- Tokens
- +1/+1 Counters
- Sacrifice
- Tap/Untap
- Burn
- Proliferate

### 6.3 フレーバータグ
- Budget
- Casual
- Jank (ファン/ネタデッキ)
- Snow
- Sea Creatures
- Dragons
- Zombies

---

## 7. 実装優先順位

### 高優先度 (Phase 2)
1. ✅ フィードバックループ (実装済み)
2. 🔄 閾値シナジー: Metalcraft, Delirium, Domain, Threshold
3. 🔄 生け贄シナジー: アウトレット + 餌 + ペイオフ
4. 🔄 マナ加速: Ramp + 高マナコストペイオフ
5. 🔄 Spellslinger: 呪文トリガー + インスタント/ソーサリー

### 中優先度 (Phase 3)
6. 攻撃トリガーシナジー (Raid等)
7. タップ/アンタップシナジー
8. エンチャント/アーティファクトテーマ
9. ライブラリートップ操作
10. 除外ゾーンシナジー

### 低優先度 (Phase 4)
11. 既知の無限コンボデータベース
12. ドメイン/土地タイプ参照
13. 特定トークンシナジー (Treasure, Clue, Food)
14. エナジーカウンター
15. 呪文コスト軽減シナジー

---

## 8. データベース構造案

```typescript
// 既知のシナジーパターンDB
interface SynergyPatternDatabase {
  patterns: {
    id: string;
    name: string;
    category: string;
    detection: {
      oracle_patterns: RegExp[];
      type_patterns: string[];
      keyword_patterns: string[];
      tags: string[];
    };
    examples: {
      cardA: string;
      cardB: string;
      description: string;
    }[];
  }[];
}
```

---

## 9. 次のステップ

1. **Phase 2-A Part 2**: 閾値シナジー (Metalcraft, Delirium等) の実装
2. **Phase 2-B**: 生け贄シナジーの実装
3. **Phase 2-C**: マナ加速シナジーの実装
4. **Phase 3**: 既知コンボデータベースの構築

---

## 参考文献
- Scryfall Search Syntax: https://scryfall.com/docs/syntax
- Archidekt Tag System: https://archidekt.com
- MTG Wiki - Archetype: https://mtg.fandom.com/wiki/Archetype
- MTG Wiki - Combo: https://mtg.fandom.com/wiki/Combo
- MTG Wiki - Mechanic: https://mtg.fandom.com/wiki/Mechanic
- MTG Wiki - Tribal: https://mtg.fandom.com/wiki/Tribal
