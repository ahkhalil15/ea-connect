# EA Connect - EA Echo Feature

A React Native Expo mobile prototype for the "EA Echo" smart catch-up engine.

## Overview

EA Echo solves a critical business problem: improving organic push notification opt-in rates (currently at 22%) by showing users exactly who they missed game invites from through a contextual "While You Were Away" experience.

## Features

### EA Echo Carousel
- **"While You Were Away"** horizontal carousel at the top of the Inbox
- Premium Echo Cards with animated glowing borders (EA primary blue)
- Highly contextual missed interaction displays:
  - Missed game invites (lobby invitations)
  - Missed messages

### Quick Message System
- Frictionless, keyboardless reply options
- Pre-written contextual responses ("Yeah! I'm down", "Need a minute", etc.)
- Pill-shaped buttons with press-state feedback

### Production-Ready Interactions
- Haptic feedback on user actions
- Smooth fade-out animations when cards are dismissed
- Toast notifications for successful actions
- Telemetry event logging (console-based for prototype)

## Project Structure

```
ea-connect/
├── App.tsx                     # Main application entry
├── src/
│   ├── components/
│   │   ├── Avatar.tsx          # Player avatar with presence indicator
│   │   ├── EchoCard.tsx        # Premium missed interaction card
│   │   ├── EchoCarousel.tsx    # Horizontal FlatList carousel
│   │   ├── InboxMessageItem.tsx # Standard inbox message row
│   │   ├── QuickMessagePill.tsx # Frictionless reply button
│   │   └── ToastConfig.tsx     # Custom toast styling
│   ├── data/
│   │   └── mockData.ts         # EADP-aligned mock state
│   ├── hooks/
│   │   └── useEchoState.ts     # State management hook
│   ├── screens/
│   │   └── InboxScreen.tsx     # Main inbox view
│   ├── types/
│   │   └── index.ts            # TypeScript type definitions
│   └── utils/
│       ├── theme.ts            # Design tokens and constants
│       └── timeFormat.ts       # Time formatting utilities
└── assets/                     # App icons and images
```

## Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator or Android Emulator (or Expo Go app on device)

### Installation

```bash
cd ea-connect
npm install
```

### Running the App

```bash
# Start the development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## Mock Data Schema (EADP Telemetry Alignment)

```typescript
interface MissedInteraction {
  eventId: string;              // Unique event identifier
  eventType: 'missed_game_invite' | 'missed_message';
  player: {
    eaId: string;               // e.g., "ShadowRanger"
    avatarUrl: string;
    presenceStatus: 'online' | 'away' | 'in_game' | 'offline';
  };
  gameContext: {
    gameName: string;           // e.g., "EA SPORTS FC 26"
    gameImage: string;
  };
  timestamp: string;            // ISO 8601 format
  messagePreview?: string;      // Optional for missed_message type
}
```

## Design System

- **Background**: Deep, rich black (#0a0a0a)
- **Cards**: Dark grey (#1a1a1a) with EA primary blue glow
- **Accent Color**: EA Primary Blue (#0074e4)
- **Typography**: Clean, legible with proper truncation for long EA IDs

## Telemetry Events

The prototype logs the following events (console-based):
- `Send Message click event triggered` - When a Quick Message is sent
- Interaction dismissed events
- Navigation events

## Edge Cases Handled

- Long EA IDs truncate with ellipsis
- Empty state: Carousel cleanly collapses when all interactions are dismissed
- Smooth layout animations when cards are removed
