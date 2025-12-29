/**
 * Supabase database types
 * This file will be auto-generated from the Supabase schema
 * For now, we define it manually
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      decks: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          format: string | null;
          created_at: string;
          updated_at: string;
          is_public: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          format?: string | null;
          created_at?: string;
          updated_at?: string;
          is_public?: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          format?: string | null;
          created_at?: string;
          updated_at?: string;
          is_public?: boolean;
        };
      };
      deck_cards: {
        Row: {
          id: string;
          deck_id: string;
          card_id: string;
          quantity: number;
          card_data: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          deck_id: string;
          card_id: string;
          quantity: number;
          card_data: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          deck_id?: string;
          card_id?: string;
          quantity?: number;
          card_data?: Json;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
