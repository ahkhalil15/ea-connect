# EA Connect — EA Showdowns

A React Native Expo mobile prototype for **EA Showdowns**, a real-time competitive bounty system that lets players challenge friends to stat-based races across EA titles.

**Live Demo:** [deploy-steel-delta.vercel.app](https://deploy-steel-delta.vercel.app/)

## Overview

EA Showdowns transforms passive social connections into active competitive moments. Players drop "bounties" — stat-based challenges like "First to 10 Goals Scored" — directly inside chat threads, creating persistent head-to-head races powered by EADP telemetry.

## Features

### Showdown Bounty Cards (In-Chat)
- **Live-telemetry widget** embedded in chat threads with real-time progress bars
- **State machine** with 4 visual states: Active (blue), Losing (red), Draw/Deadlock (gold), Completed (gold gradient + particles)
- Animated progress bars, floating score increments, card shake on updates
- Crown + gold particle explosion on win, confetti celebration
- REMATCH button spawns a fresh bounty inline

### Showdowns Inbox
- Dedicated tab with filter pills: **Pending**, **Active**, **Completed**
- Inbox cards with mini progress bars, score gaps, and time remaining
- **Accept / Decline** actions for pending challenges
- Tap any card to navigate to the chat thread

### Showdown Creation Sheet
- Bottom sheet with 3-step progressive disclosure:
  1. **Pick your game** — EA SPORTS FC 26, Battlefield 6, Apex Legends
  2. **Pick your stat** — game-specific metrics (Goals Scored, Eliminations, etc.)
  3. **Set the target** — preset values (5, 10, 15, 20, 25)
- "DROP THE BOUNTY" button with game-colored accent

### Simulate EADP Telemetry
- Deterministic demo arc: Press 1 → opponent scores (LOSING), Press 2 → you catch up (DRAW), Press 3+ → random (→ WIN)
- Demonstrates how real EADP MatchEndsForPlayer telemetry would drive the experience

## Project Structure

```
ea-connect/
├── App.tsx                                  # Root — Stack + Tab navigators
├── showdown-demo.html                       # Self-contained HTML demo
├── deploy/                                  # Vercel deployment (static HTML)
├── src/
│   ├── components/
│   │   ├── ShowdownWidget.tsx               # Live-telemetry bounty card (state machine)
│   │   ├── ShowdownProgressBar.tsx          # Animated progress bar per participant
│   │   ├── ShowdownInboxCard.tsx            # Inbox row (pending/active/completed)
│   │   ├── ShowdownCreationSheet.tsx        # 3-step bottom sheet
│   │   ├── Avatar.tsx                       # Player avatar with presence dot
│   │   └── ToastConfig.tsx                  # Custom toast styling
│   ├── data/
│   │   ├── eadpMock.ts                      # 6 mock bounties + CHAT_METADATA
│   │   └── mockData.ts                      # Chat/inbox mock data
│   ├── screens/
│   │   ├── ShowdownsInboxScreen.tsx         # Showdowns tab (filter + FlatList)
│   │   ├── ChatThreadScreen.tsx             # Chat with inline ShowdownWidget
│   │   └── InboxScreen.tsx                  # Chat inbox
│   ├── types/
│   │   ├── showdown.ts                      # Core types: ShowdownBounty, GameOption, etc.
│   │   ├── navigation.ts                    # Stack navigation types
│   │   └── tabNavigation.ts                 # Tab navigation types
│   └── utils/
│       ├── theme.ts                         # Design tokens
│       └── timeFormat.ts                    # Time formatting
└── assets/                                  # App icons and images
```

## Navigation Architecture

```
Stack (root)
  ├─ "Inbox" → MainTabs (bottom tab navigator)
  │    ├─ Chat      → InboxScreen
  │    └─ Showdowns → ShowdownsInboxScreen
  └─ ChatThread     → slide_from_right (contains Showdown widgets)
```

## Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator or Android Emulator (or Expo Go app)

### Installation

```bash
cd ea-connect
npm install
```

### Running the App

```bash
npm start       # Start dev server
npm run ios     # Run on iOS
npm run android # Run on Android
npm run web     # Run on web
```

## Data Model (EADP Telemetry Alignment)

```typescript
interface ShowdownBounty {
  bountyId: string;
  chatId: string;
  createdAt: string;
  expiresAt: string;
  challengeContext: {
    gameName: 'EA SPORTS FC 26' | 'Battlefield 6' | 'Apex Legends';
    gameLogoColor: string;
    metric: 'Goals Scored' | 'Eliminations' | 'Damage Dealt' | 'Wins' | 'Assists';
    targetScore: number;
  };
  status: 'pending' | 'active' | 'completed' | 'expired';
  participants: ShowdownParticipant[];
}
```

## Design System

| Token | Value | Usage |
|-------|-------|-------|
| `--bg` | `#050508` | App background |
| `--surface` | `#0A0A0F` | Screen background |
| `--card` | `#111118` | Card/header background |
| `--blue` | `#0076FF` | Primary accent, active states |
| `--gold` | `#FFB800` | Winner, crown, draw |
| `--red` | `#FF3B5C` | Losing, defeated |
| `--green` | `#00E676` | Online presence, score increments |

**Typography:** Barlow Condensed (headings), Barlow (body), JetBrains Mono (labels/scores)

## ShowdownWidget State Machine

| State | Trigger | Border | Badge | Special |
|-------|---------|--------|-------|---------|
| Active | Default | Blue glow | 🟢 LIVE | Blue progress bars |
| Losing | Local user behind | Red glow | 🔴 LIVE | Red bar, "You're behind" banner |
| Draw | Scores tied (>0) | Gold glow | ⚡ DEADLOCK | Gold bars, "Tied at X" label |
| Completed | Target reached | Gold gradient | 👑 WINNER / 💀 DEFEATED / ⚡ DRAW | Particles, confetti, FINAL SCORE + REMATCH |

## Mock Players

| EA ID | Game | Chat ID |
|-------|------|---------|
| ShadowRanger | Apex Legends | chat_shadowranger |
| NeonViper_42 | EA SPORTS FC 26 | chat_neonviper42 |
| BlazeStrike | Battlefield 6 | chat_blazestrike |
| FrostByte_X | EA SPORTS FC 26 | chat_frostbytex |
| xX_PhantomAce_Xx | Apex Legends | chat_phantomace |
| GlitchHunter99 | EA SPORTS FC 26 | chat_glitchhunter99 |
