# HomeWise AI – Mobile (Expo)

React Native MVP with Expo Router, NativeWind, and Reanimated.

## Setup

```bash
cd mobile
pnpm install
# or: npm install
```

## Run

```bash
pnpm start
# Then press `i` for iOS simulator.
```

## Structure

- **`app/index.tsx`** – Login: 4-digit PIN, numeric keyboard, auto-focus.
- **`app/(tabs)/home.tsx`** – Dashboard: greeting, “big number” (month total), floating camera button, recent transactions.
- **`app/(tabs)/scan.tsx`** – Redirects to full-screen scan.
- **`app/(tabs)/insights.tsx`** – Card feed (tips / reminders).
- **`app/scan.tsx`** – Full-screen scan UI: camera placeholder, frame overlay, scanning line animation.

## Design

- **Theme:** Light (`bg-slate-50`), primary actions `bg-black` + white text.
- **One-thumb:** Main action is a large circular camera button with pulse.
- **Font:** JetBrains Mono for the “big number” on the dashboard.

## Assets

If you see missing asset errors, add `icon.png`, `splash-icon.png`, and `adaptive-icon.png` under `assets/`, or run `npx create-expo-app@latest temp --template tabs` and copy its `assets` into this project.
