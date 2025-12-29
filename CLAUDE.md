# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an MTG (Magic: The Gathering) deck builder application built with Next.js, TypeScript, and Tailwind CSS.

## Core Features

- Card search powered by Scryfall API
- Deck creation and management with localStorage persistence
- Advanced manabase analysis with land classification
- Deck statistics and mana curve visualization
- AI-powered deck analysis using Google Gemini
- Japanese card support

## Coding Standards

### Comments

**All code comments must be written in English.**

- Use clear, concise English for all comments
- Document complex logic and algorithms
- Add JSDoc comments for exported functions and types
- Single-line comments for brief explanations
- Multi-line comments for detailed documentation

Example:
```typescript
/**
 * Classify a land card into one of four categories
 * based on its oracle text and gameplay characteristics
 */
export function classifyLand(card: Card): LandClassification {
  // Basic lands always enter untapped
  if (card.type_line.toLowerCase().includes('basic')) {
    return { category: 'untapped', reason: 'Basic land' };
  }
  // ...
}
```

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run tests
- `npm run lint` - Run ESLint

## Architecture

### Directory Structure

- `/app` - Next.js app router pages
- `/components` - React components
- `/lib` - Utility functions and business logic
- `/store` - Zustand state management
- `/types` - TypeScript type definitions

### Key Modules

- `lib/deck/landClassifier.ts` - Land card classification system
- `lib/deck/simulator.ts` - Deck simulation and statistics
- `lib/scryfall/` - Scryfall API integration
- `store/deckStore.ts` - Deck state management
