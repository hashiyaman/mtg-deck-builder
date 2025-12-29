'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDeckStore } from '@/store/deckStore';
import { DeckList } from '@/components/deck/DeckList';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { Format } from '@/types/card';

export default function DeckListPage() {
  const router = useRouter();
  const { decks, loadAllDecks, createDeck, deleteDeck } = useDeckStore();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckFormat, setNewDeckFormat] = useState<Format>('modern');

  useEffect(() => {
    loadAllDecks();
  }, [loadAllDecks]);

  const handleCreateDeck = () => {
    if (!newDeckName.trim()) return;

    const deckId = createDeck(newDeckName, newDeckFormat);
    setNewDeckName('');
    setIsCreateDialogOpen(false);
    router.push(`/deck/${deckId}`);
  };

  const handleDeleteDeck = (deckId: string) => {
    if (confirm('Are you sure you want to delete this deck?')) {
      deleteDeck(deckId);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">My Decks</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Deck
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Deck</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="deck-name">Deck Name</Label>
                <Input
                  id="deck-name"
                  placeholder="Enter deck name..."
                  value={newDeckName}
                  onChange={(e) => setNewDeckName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateDeck()}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deck-format">Format</Label>
                <select
                  id="deck-format"
                  value={newDeckFormat}
                  onChange={(e) => setNewDeckFormat(e.target.value as Format)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="standard">Standard</option>
                  <option value="modern">Modern</option>
                  <option value="pioneer">Pioneer</option>
                  <option value="legacy">Legacy</option>
                  <option value="vintage">Vintage</option>
                  <option value="commander">Commander</option>
                </select>
              </div>
              <Button onClick={handleCreateDeck} className="w-full">
                Create Deck
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <DeckList decks={decks} onDelete={handleDeleteDeck} />
    </div>
  );
}
