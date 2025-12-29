'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { FileDown, Copy } from 'lucide-react';
import { Deck } from '@/types/deck';
import {
  exportDeck,
  downloadAsFile,
  copyToClipboard,
  getExportFilename,
  ExportFormat,
} from '@/lib/deck/deckExport';
import { toast } from 'sonner';

interface DeckExportProps {
  deck: Deck;
  disabled?: boolean;
}

export function DeckExport({ deck, disabled }: DeckExportProps) {
  const handleExport = (format: ExportFormat, copyOnly: boolean = false) => {
    try {
      const content = exportDeck(deck, format);

      if (copyOnly) {
        // Copy to clipboard
        copyToClipboard(content);
        toast.success(`Copied to clipboard (${format.toUpperCase()} format)`);
      } else {
        // Download as file
        const filename = getExportFilename(deck, format);
        downloadAsFile(content, filename);
        toast.success(`Downloaded: ${filename}`);
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export deck');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={disabled}>
          <FileDown className="h-4 w-4 mr-2" />
          エクスポート
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {/* Arena format */}
        <DropdownMenuItem onClick={() => handleExport('arena', false)}>
          <FileDown className="h-4 w-4 mr-2" />
          Arena形式でダウンロード
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('arena', true)}>
          <Copy className="h-4 w-4 mr-2" />
          Arena形式でコピー
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* MTGO format */}
        <DropdownMenuItem onClick={() => handleExport('mtgo', false)}>
          <FileDown className="h-4 w-4 mr-2" />
          MTGO形式でダウンロード
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('mtgo', true)}>
          <Copy className="h-4 w-4 mr-2" />
          MTGO形式でコピー
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* JSON format (backup) */}
        <DropdownMenuItem onClick={() => handleExport('json', false)}>
          <FileDown className="h-4 w-4 mr-2" />
          JSON形式でバックアップ
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
