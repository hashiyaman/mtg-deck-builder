import { SearchFilters } from '@/types/filter';

/**
 * 日本語文字が含まれているかチェック
 */
function containsJapanese(text: string): boolean {
  return /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(text);
}

/**
 * フィルターをScryfall検索構文に変換
 * Scryfall API Documentation: https://scryfall.com/docs/syntax
 */
export function buildScryfallQuery(query: string, filters: SearchFilters): string {
  const parts: string[] = [];

  // テキスト検索
  if (query.trim()) {
    // 日本語が含まれている場合でも、そのまま検索クエリとして使用
    // （Scryfallのfuzzy検索が対応する）
    parts.push(query.trim());
  }

  // 色フィルター
  if (filters.colors && filters.colors.length > 0) {
    const colorString = filters.colors.join('').toLowerCase();
    const operator = filters.colorMode === 'exact' ? '=' : filters.colorMode === 'atMost' ? '<=' : ':';
    parts.push(`c${operator}${colorString}`);
  }

  // タイプフィルター
  if (filters.types && filters.types.length > 0) {
    const typeQuery = filters.types.map(t => `t:${t}`).join(' OR ');
    parts.push(`(${typeQuery})`);
  }

  // CMCフィルター
  if (filters.cmc?.min !== undefined) {
    parts.push(`cmc>=${filters.cmc.min}`);
  }
  if (filters.cmc?.max !== undefined) {
    parts.push(`cmc<=${filters.cmc.max}`);
  }

  // パワー/タフネス
  if (filters.power?.min !== undefined) {
    parts.push(`pow>=${filters.power.min}`);
  }
  if (filters.power?.max !== undefined) {
    parts.push(`pow<=${filters.power.max}`);
  }
  if (filters.toughness?.min !== undefined) {
    parts.push(`tou>=${filters.toughness.min}`);
  }
  if (filters.toughness?.max !== undefined) {
    parts.push(`tou<=${filters.toughness.max}`);
  }

  // セットフィルター
  if (filters.sets && filters.sets.length > 0) {
    const setQuery = filters.sets.map(s => `e:${s}`).join(' OR ');
    parts.push(`(${setQuery})`);
  }

  // レアリティ
  if (filters.rarity && filters.rarity.length > 0) {
    const rarityQuery = filters.rarity.map(r => `r:${r}`).join(' OR ');
    parts.push(`(${rarityQuery})`);
  }

  // フォーマット適正
  if (filters.format) {
    parts.push(`f:${filters.format}`);
  }

  return parts.join(' ');
}
