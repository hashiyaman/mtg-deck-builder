/**
 * Supabase server actions for authentication and deck operations
 */
'use server';

import { createClient } from './server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { Deck } from '@/types/deck';

/**
 * Sign up with email and password
 */
export async function signUp(email: string, password: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  return { data };
}

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  return { data };
}

/**
 * Sign out
 */
export async function signOut() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  redirect('/');
}

/**
 * Get current user
 */
export async function getUser() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    return { error: error.message };
  }

  return { user };
}

/**
 * Save deck to Supabase
 */
export async function saveDeck(deck: Deck) {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: 'Not authenticated' };
  }

  // Upsert deck
  const { data: deckData, error: deckError } = await supabase
    .from('decks')
    .upsert({
      id: deck.id,
      user_id: user.id,
      name: deck.name,
      description: deck.description || null,
      format: deck.format || null,
      is_public: false,
    } as any)
    .select()
    .single();

  if (deckError) {
    return { error: deckError.message };
  }

  // Delete existing cards
  await supabase.from('deck_cards').delete().eq('deck_id', deck.id);

  // Insert new cards (mainboard + sideboard)
  const allCards = [...deck.mainboard, ...deck.sideboard];
  const cardsToInsert = allCards.map((deckCard) => ({
    deck_id: deck.id,
    card_id: deckCard.card.id,
    quantity: deckCard.quantity,
    card_data: deckCard.card,
  }));

  if (cardsToInsert.length > 0) {
    const { error: cardsError } = await supabase
      .from('deck_cards')
      .insert(cardsToInsert as any);

    if (cardsError) {
      return { error: cardsError.message };
    }
  }

  revalidatePath('/deck');
  return { data: deckData };
}

/**
 * Get all decks for current user
 */
export async function getUserDecks() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: 'Not authenticated' };
  }

  const { data, error } = await supabase
    .from('decks')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (error) {
    return { error: error.message };
  }

  return { data: data as any };
}

/**
 * Get a single deck with its cards
 */
export async function getDeck(deckId: string) {
  const supabase = await createClient();

  // Get deck
  const { data: deck, error: deckError } = await supabase
    .from('decks')
    .select('*')
    .eq('id', deckId)
    .single();

  if (deckError || !deck) {
    return { error: deckError?.message || 'Deck not found' };
  }

  // Get cards
  const { data: cards, error: cardsError } = await supabase
    .from('deck_cards')
    .select('*')
    .eq('deck_id', deckId);

  if (cardsError) {
    return { error: cardsError.message };
  }

  // Convert cards to Deck format
  const deckCards = (cards || []).map((dc: any) => ({
    card: dc.card_data,
    quantity: dc.quantity,
  }));

  return {
    data: {
      id: (deck as any).id,
      name: (deck as any).name,
      description: (deck as any).description || undefined,
      format: (deck as any).format || 'standard',
      mainboard: deckCards,
      sideboard: [],
      createdAt: new Date((deck as any).created_at).getTime(),
      updatedAt: new Date((deck as any).updated_at).getTime(),
    },
  };
}

/**
 * Delete a deck
 */
export async function deleteDeck(deckId: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: 'Not authenticated' };
  }

  const { error } = await supabase.from('decks').delete().eq('id', deckId).eq('user_id', user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/deck');
  return { success: true };
}
