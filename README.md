# MTG Deck Builder

A modern web application for building and analyzing Magic: The Gathering decks with advanced manabase analysis powered by AI.

## Features

### 🔍 Card Search
- Powered by Scryfall API
- Advanced filtering by color, type, rarity, and stats
- Japanese card support with automatic translation lookup
- Grid and list view modes

### 🎴 Deck Management
- Create and manage multiple decks
- Support for mainboard and sideboard (60+15 cards)
- Import decks from text lists
- localStorage persistence
- Export functionality

### 📊 Advanced Manabase Analysis
- **Land Classification System**
  - Untapped lands (basic lands, fetchlands, etc.)
  - Conditional lands (shock lands, check lands, pain lands)
  - Tapped lands (triomes, temples)
  - Restricted lands (Cavern of Souls, etc.)
- **Detailed Statistics**
  - Color production breakdown by land category
  - Opening hand simulation (1000+ iterations)
  - Color availability rates considering T1-playable lands
  - Mana curve analysis
  - Keepable hand probability

### 🤖 AI-Powered Deck Analysis
- Manabase optimization suggestions
- Strategy and synergy analysis
- Sideboard recommendations
- Comprehensive deck evaluation
- Powered by Google Gemini AI

### 📈 Statistics & Visualization
- Mana curve chart
- Color distribution
- Type breakdown
- Average CMC calculation
- Early game simulation (T1-T3 playability)

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Charts**: Recharts
- **State Management**: Zustand
- **Testing**: Jest + React Testing Library
- **AI**: Google Generative AI (Gemini)
- **Data Source**: Scryfall API

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/hashiyaman/mtg-deck-builder.git
cd mtg-deck-builder
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables

Create a `.env.local` file in the root directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

You can get a Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey).

4. Run the development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm test             # Run all tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

### Project Structure

```
mtg-deck-builder/
├── app/                    # Next.js app router pages
│   ├── api/               # API routes
│   ├── deck/              # Deck pages
│   └── search/            # Card search page
├── components/            # React components
│   ├── cards/            # Card-related components
│   ├── deck/             # Deck-related components
│   ├── search/           # Search-related components
│   └── ui/               # Reusable UI components
├── lib/                   # Utility functions and business logic
│   ├── ai/               # AI integration
│   ├── deck/             # Deck utilities (classifier, simulator)
│   ├── scryfall/         # Scryfall API client
│   └── storage/          # localStorage utilities
├── store/                 # Zustand stores
├── types/                 # TypeScript type definitions
└── public/                # Static assets
```

### Testing

The project uses Jest and React Testing Library for testing.

Run tests:
```bash
npm test
```

Test coverage:
```bash
npm run test:coverage
```

Key test suites:
- `lib/deck/__tests__/landClassifier.test.ts` - Land classification (13 tests)
- `lib/deck/__tests__/simulator.test.ts` - Deck simulation (9 tests)

## Coding Standards

### Comments
All code comments must be written in English. Use clear, concise language and add JSDoc comments for exported functions and types.

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

## How It Works

### Land Classification Algorithm

The land classifier analyzes card oracle text to categorize lands:

1. **Basic Lands**: Always untapped (e.g., Plains, Island)
2. **Conditional Lands**: Can enter untapped under conditions
   - Shock lands: Pay 2 life (e.g., Steam Vents)
   - Check lands: Control basic land type (e.g., Glacial Fortress)
   - Pain lands: Deal damage for colored mana (e.g., Caves of Koilos)
3. **Tapped Lands**: Always enter tapped (e.g., Triomes, Temples)
4. **Restricted Lands**: Mana usage restrictions (e.g., Cavern of Souls)

### Opening Hand Simulation

The simulator runs 1000+ iterations to calculate:
- Land distribution probability (0-7 lands)
- Average lands in opening hand
- Keepable hand rate (2-5 lands)
- Color availability on T1 (considering only untapped/conditional lands)
- Early game playability (T1-T3)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- Card data provided by [Scryfall](https://scryfall.com/)
- AI analysis powered by [Google Gemini](https://ai.google.dev/)
- Mana symbols from Scryfall's public assets

## Contact

- GitHub: [@hashiyaman](https://github.com/hashiyaman)
- Project Link: [https://github.com/hashiyaman/mtg-deck-builder](https://github.com/hashiyaman/mtg-deck-builder)
