import Link from 'next/link';

export function AppHeader() {
  return (
    <header className="border-b border-border bg-background">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-foreground hover:text-primary">
            MTG デッキビルダー
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/search"
              className="text-foreground hover:text-primary transition-colors"
            >
              カード検索
            </Link>
            <Link
              href="/deck"
              className="text-foreground hover:text-primary transition-colors"
            >
              マイデッキ
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
