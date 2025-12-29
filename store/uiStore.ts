import { create } from 'zustand';
import { Card } from '@/types/card';
import { ViewMode } from '@/types/filter';

interface UIState {
  // State
  sidebarOpen: boolean;
  viewMode: ViewMode;
  selectedCard: Card | null;

  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setViewMode: (mode: ViewMode) => void;
  selectCard: (card: Card | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  // Initial state
  sidebarOpen: true,
  viewMode: 'grid',
  selectedCard: null,

  // Toggle sidebar
  toggleSidebar: () => {
    set((state) => ({ sidebarOpen: !state.sidebarOpen }));
  },

  // Set sidebar open state
  setSidebarOpen: (open) => {
    set({ sidebarOpen: open });
  },

  // Set view mode
  setViewMode: (mode) => {
    set({ viewMode: mode });
  },

  // Select a card (for modal/detail view)
  selectCard: (card) => {
    set({ selectedCard: card });
  },
}));
