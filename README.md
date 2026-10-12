# BudFree 🌱

Quit weed with a buddy. Track clean days, beat cravings, earn rewards.

A frutiger-aero-flavored quit tracker for Android (iOS-ready) built with Expo + React Native.

## Features
- ⏱️ Live sobriety counter + money saved
- 🤖 Bud — a personal quit buddy (offline brain, optional Groq AI upgrade with your own free key)
- 🆘 Panic button with guided breathing
- 🌊 Craving log with product-type icons
- 📊 12-week heatmap + intensity trend
- 🏅 Achievements, XP levels, daily check-in streaks with freeze cards
- 🛍️ Coin shop with unlockable themes
- 🔔 Local notifications for check-ins and milestones
- 🔒 100% local data — no account, no tracking

## Run it
```bash
npm install
npx expo start
```
Scan the QR with Expo Go on Android.

## Build for Play Store
```bash
npm install -g eas-cli
eas login
eas build:configure   # links the project (uses eas.json)
eas build -p android --profile production   # → .aab for Play Console
```

See `PLAY_STORE.md` for the listing copy and `PRIVACY_POLICY.md` for the policy you'll need to host (GitHub Pages works fine).
