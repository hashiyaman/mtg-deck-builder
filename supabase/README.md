# Supabase Setup Guide

このガイドでは、MTG Deck Builderでクラウド保存機能を有効にするために、Supabaseプロジェクトをセットアップする方法を説明します。

## 1. Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com)にアクセスして、アカウントを作成（無料）
2. 「New Project」をクリック
3. プロジェクト名を入力（例：`mtg-deck-builder`）
4. データベースのパスワードを設定（メモしておいてください）
5. リージョンを選択（日本に近い場合は`Northeast Asia (Tokyo)`を推奨）
6. 「Create new project」をクリック

プロジェクトの作成には1-2分かかります。

## 2. データベーススキーマの作成

1. Supabaseダッシュボードで、左サイドバーから「SQL Editor」を選択
2. 「New query」をクリック
3. `supabase/schema.sql`ファイルの内容をコピー&ペースト
4. 「Run」ボタンをクリックして実行

これで以下のテーブルが作成されます：
- `decks`: デッキ情報
- `deck_cards`: デッキ内のカード

## 3. 認証設定

1. 左サイドバーから「Authentication」→「Providers」を選択
2. 「Email」プロバイダーが有効になっていることを確認
3. 「Confirm email」をOFFにする（開発中は確認メール不要）
   - 本番環境ではONにすることを推奨

## 4. APIキーの取得

1. 左サイドバーから「Project Settings」→「API」を選択
2. 以下の2つの値をコピー：
   - `Project URL`
   - `anon` `public` キー

## 5. 環境変数の設定

プロジェクトのルートディレクトリに`.env.local`ファイルを作成：

```bash
cp .env.example .env.local
```

`.env.local`ファイルを開いて、以下の値を設定：

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 6. 開発サーバーの再起動

環境変数を読み込むため、開発サーバーを再起動：

```bash
npm run dev
```

## 7. 動作確認

1. アプリケーションにアクセス
2. 右上の「ログイン」ボタンから新規登録
3. メールアドレスとパスワードを入力
4. デッキを作成して保存
5. Supabaseダッシュボードの「Table Editor」から`decks`テーブルを確認

## トラブルシューティング

### 認証エラーが出る場合

- `.env.local`ファイルが正しく設定されているか確認
- 開発サーバーを再起動したか確認
- ブラウザのコンソールでエラーメッセージを確認

### データが保存されない場合

- Supabaseダッシュボードの「Table Editor」でテーブルが作成されているか確認
- RLS（Row Level Security）ポリシーが正しく設定されているか確認
- ブラウザのコンソールでエラーメッセージを確認

### スキーマエラーが出る場合

- `schema.sql`を再度実行
- 既存のテーブルがある場合は削除してから再実行

## セキュリティのベストプラクティス

1. **本番環境では必ず**：
   - メール確認を有効にする
   - パスワードの強度要件を設定
   - RLSポリシーを厳格にする

2. **APIキーの管理**：
   - `.env.local`はGitにコミットしない（`.gitignore`に含まれています）
   - `anon`キーはフロントエンドで使用可能（Row Level Securityで保護）
   - `service_role`キーは絶対にフロントエンドで使用しない

3. **データベースのバックアップ**：
   - Supabaseの無料プランでは自動バックアップが含まれています
   - 定期的にエクスポートすることを推奨

## 次のステップ

- [ ] ユーザープロフィール機能の追加
- [ ] デッキの公開/共有機能
- [ ] デッキへのコメント機能
- [ ] デッキの検索機能
- [ ] 人気デッキランキング
