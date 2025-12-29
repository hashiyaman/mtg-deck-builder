'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { parseArenaDeckList } from '@/lib/deck/deckImport';
import { useDeckStore } from '@/store/deckStore';
import { toast } from 'sonner';
import { AlertCircle, FileText } from 'lucide-react';

interface DeckImportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deckId?: string; // If provided, import to existing deck
}

export function DeckImport({ open, onOpenChange, deckId }: DeckImportProps) {
  const [text, setText] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const { currentDeck, loadDeck } = useDeckStore();

  const handleImport = async () => {
    if (!text.trim()) {
      toast.error('Please enter a deck list');
      return;
    }

    if (!currentDeck && !deckId) {
      toast.error('No deck selected');
      return;
    }

    setIsImporting(true);
    setErrors([]);

    try {
      const result = await parseArenaDeckList(text);

      if (result.errors.length > 0) {
        setErrors(result.errors);
      }

      if (result.mainboard.length === 0 && result.sideboard.length === 0) {
        toast.error('No valid cards found in the deck list');
        setIsImporting(false);
        return;
      }

      // Get target deck
      const targetDeck = currentDeck;
      if (!targetDeck) {
        toast.error('Deck not found');
        setIsImporting(false);
        return;
      }

      // Update deck with imported cards
      const updatedDeck = {
        ...targetDeck,
        mainboard: [...targetDeck.mainboard, ...result.mainboard],
        sideboard: [...targetDeck.sideboard, ...result.sideboard],
        updatedAt: Date.now(),
      };

      // Save to store
      useDeckStore.setState({ currentDeck: updatedDeck });
      useDeckStore.getState().saveDeck();

      const totalImported = result.mainboard.reduce((sum, dc) => sum + dc.quantity, 0) +
                           result.sideboard.reduce((sum, dc) => sum + dc.quantity, 0);

      toast.success(
        `Successfully imported ${totalImported} cards` +
        (result.errors.length > 0 ? ` (${result.errors.length} errors)` : '')
      );

      if (result.errors.length === 0) {
        setText('');
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import deck list');
    } finally {
      setIsImporting(false);
    }
  };

  const exampleText = `Deck
4 Lightning Bolt (M21) 163
4 Shock (M21) 159
20 Mountain

Sideboard
3 Abrade (M21) 130`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Deck</DialogTitle>
          <DialogDescription>
            Paste your MTG Arena deck list below. The format should include quantities and card names.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Text Area */}
          <div>
            <Textarea
              placeholder={exampleText}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[300px] font-mono text-sm"
              disabled={isImporting}
            />
          </div>

          {/* Format Example */}
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              <strong>Supported format:</strong>
              <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-x-auto">
                {exampleText}
              </pre>
            </AlertDescription>
          </Alert>

          {/* Errors */}
          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Import errors:</strong>
                <ul className="mt-2 text-xs space-y-1 max-h-40 overflow-y-auto">
                  {errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isImporting}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={isImporting || !text.trim()}>
            {isImporting ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Importing...
              </>
            ) : (
              'Import'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
