-- MTG Deck Builder Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Decks table
CREATE TABLE decks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  format TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_public BOOLEAN DEFAULT false
);

-- Deck cards table
CREATE TABLE deck_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deck_id UUID NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
  card_id TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  card_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_decks_user_id ON decks(user_id);
CREATE INDEX idx_decks_updated_at ON decks(updated_at DESC);
CREATE INDEX idx_deck_cards_deck_id ON deck_cards(deck_id);
CREATE INDEX idx_deck_cards_card_id ON deck_cards(card_id);

-- Row Level Security (RLS) policies

-- Enable RLS
ALTER TABLE decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE deck_cards ENABLE ROW LEVEL SECURITY;

-- Decks policies
-- Users can view their own decks and public decks
CREATE POLICY "Users can view own decks"
  ON decks FOR SELECT
  USING (auth.uid() = user_id OR is_public = true);

-- Users can insert their own decks
CREATE POLICY "Users can insert own decks"
  ON decks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own decks
CREATE POLICY "Users can update own decks"
  ON decks FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own decks
CREATE POLICY "Users can delete own decks"
  ON decks FOR DELETE
  USING (auth.uid() = user_id);

-- Deck cards policies
-- Users can view cards from their own decks and public decks
CREATE POLICY "Users can view own deck cards"
  ON deck_cards FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM decks
      WHERE decks.id = deck_cards.deck_id
      AND (decks.user_id = auth.uid() OR decks.is_public = true)
    )
  );

-- Users can insert cards into their own decks
CREATE POLICY "Users can insert own deck cards"
  ON deck_cards FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM decks
      WHERE decks.id = deck_cards.deck_id
      AND decks.user_id = auth.uid()
    )
  );

-- Users can update cards in their own decks
CREATE POLICY "Users can update own deck cards"
  ON deck_cards FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM decks
      WHERE decks.id = deck_cards.deck_id
      AND decks.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM decks
      WHERE decks.id = deck_cards.deck_id
      AND decks.user_id = auth.uid()
    )
  );

-- Users can delete cards from their own decks
CREATE POLICY "Users can delete own deck cards"
  ON deck_cards FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM decks
      WHERE decks.id = deck_cards.deck_id
      AND decks.user_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_decks_updated_at
  BEFORE UPDATE ON decks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
