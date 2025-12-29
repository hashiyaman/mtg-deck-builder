import { Deck } from '@/types/deck';

export type ExportFormat = 'arena' | 'mtgo' | 'json';

/**
 * Export deck to MTG Arena format
 * Format: "4 Lightning Bolt (M21) 163"
 */
export function exportToArena(deck: Deck): string {
  const lines: string[] = [];

  // Mainboard section
  if (deck.mainboard.length > 0) {
    lines.push('Deck');
    deck.mainboard.forEach(({ card, quantity }) => {
      const name = card.name;
      const setCode = card.set?.toUpperCase() || '';
      const collectorNumber = card.collector_number || '';

      if (setCode && collectorNumber) {
        lines.push(`${quantity} ${name} (${setCode}) ${collectorNumber}`);
      } else {
        lines.push(`${quantity} ${name}`);
      }
    });
  }

  // Sideboard section
  if (deck.sideboard.length > 0) {
    if (lines.length > 0) lines.push(''); // Empty line separator
    lines.push('Sideboard');
    deck.sideboard.forEach(({ card, quantity }) => {
      const name = card.name;
      const setCode = card.set?.toUpperCase() || '';
      const collectorNumber = card.collector_number || '';

      if (setCode && collectorNumber) {
        lines.push(`${quantity} ${name} (${setCode}) ${collectorNumber}`);
      } else {
        lines.push(`${quantity} ${name}`);
      }
    });
  }

  return lines.join('\n');
}

/**
 * Export deck to MTGO (Magic: The Gathering Online) format
 * Format: "4 Lightning Bolt" (no set codes)
 */
export function exportToMTGO(deck: Deck): string {
  const lines: string[] = [];

  // Mainboard section (no section header for MTGO)
  deck.mainboard.forEach(({ card, quantity }) => {
    lines.push(`${quantity} ${card.name}`);
  });

  // Sideboard section
  if (deck.sideboard.length > 0) {
    if (lines.length > 0) lines.push(''); // Empty line separator
    deck.sideboard.forEach(({ card, quantity }) => {
      lines.push(`${quantity} ${card.name}`);
    });
  }

  return lines.join('\n');
}

/**
 * Export deck to JSON format (full deck data)
 */
export function exportToJSON(deck: Deck): string {
  return JSON.stringify(deck, null, 2);
}

/**
 * Get appropriate filename for export
 */
export function getExportFilename(deck: Deck, format: ExportFormat): string {
  const safeName = deck.name.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '_');
  const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  switch (format) {
    case 'arena':
      return `${safeName}_arena_${timestamp}.txt`;
    case 'mtgo':
      return `${safeName}_mtgo_${timestamp}.txt`;
    case 'json':
      return `${safeName}_${timestamp}.json`;
  }
}

/**
 * Trigger browser download of text content
 */
export function downloadAsFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Copy content to clipboard
 */
export async function copyToClipboard(content: string): Promise<void> {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    await navigator.clipboard.writeText(content);
  } else {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = content;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }
}

/**
 * Export deck with specified format
 */
export function exportDeck(deck: Deck, format: ExportFormat): string {
  switch (format) {
    case 'arena':
      return exportToArena(deck);
    case 'mtgo':
      return exportToMTGO(deck);
    case 'json':
      return exportToJSON(deck);
  }
}
