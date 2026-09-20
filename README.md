# BETWEEN US

A private digital memory space and scrapbook designed exclusively for two friends.

> **Open → remember → scroll through your story → add another memory.**

---

## Visual & Emotional Philosophy

BETWEEN US is built as an intimate, editorial photography journal and digital scrapbook rather than a social media feed or SaaS dashboard.

* **Editorial Dark Theme**: Near-black background (`#0C0C0E`), very dark charcoal surfaces (`#18181C`), subtle hairlines (`#24242B`), warm parchment off-white typography (`#F5F2EC`), and a restrained bronze accent (`#C79A72`).
* **Calm & Tactile**: Generous vertical spacing, chapter-like date overlines, serif titles, and minimal border geometry.
* **Photo Presentation**: Unbalanced editorial photo layouts for 1, 2, 3, and multiple images rather than generic thumbnail grids.
* **Double-Blind Intimacy**: Sealed time capsules that remain locked until a future date, and shared questions whose answers only unlock once both friends have answered.

---

## Features

1. **Memory Timeline**:
   - Editorial physical scrapbook feed grouped by year.
   - Dynamic photo layouts (1 large photo, 1 large + 1 small, 1 large + 2 small, or balanced gallery).
   - "On This Day" banner querying memories from the exact same calendar date in past years.
   - High-resolution full-screen photo viewer with zoom and swipe.
   - Embedded voice notes with waveform audio player and song attribution tags.

2. **Journal Composer**:
   - Fast full-screen memory creator.
   - Multi-photo picker & camera capture with preview, reordering, and removal.
   - Contextual GPS location tagging using Expo Location with reverse geocoding.
   - In-app voice note recording and preview with Expo Audio.
   - Offline local draft resilience so memories are never lost on network interruption.

3. **Memory Detail**:
   - Book-like page presentation with complete story, media gallery, location metadata, voice note player, and creator attribution.
   - Native-styled edit and delete confirmation dialogs.

4. **Our Places**:
   - Geographies of memories organized by location name, visit dates, and coordinate badges.
   - Tap any location to view all memories that took place there.

5. **Little Things**:
   - Ephemera that doesn't need an entire memory: inside jokes, quotes, random moments, notes, screenshots, and song references.

6. **Time Capsules**:
   - Sealed letters locked until a future date (e.g. 1 year, 2 years, or 5 years).
   - Sealed state keeps the contents strictly confidential. Unsealed state reveals message, date, and media.

7. **Things We Still Have to Do (Plans)**:
   - Shared bucket list of future adventures.
   - "TURN INTO MEMORY" action that completes a plan and pre-fills the memory composer.

8. **Shared Questions**:
   - Double-blind prompts (answers remain secret until both friends have contributed).

9. **Duo Model & Security**:
   - Exclusive 2-person space with partner invite codes.
   - Supabase PostgreSQL with strict Row Level Security (RLS) policies and private storage buckets.
   - Zero configuration demo mode for immediate evaluation with the "Kunal × Sam" space.

---

## Technology Stack

* **Framework**: React Native with Expo SDK 57 (Managed Workflow)
* **Routing**: Expo Router (file-based navigation)
* **Language**: TypeScript
* **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
* **Native Modules**:
  * `expo-image-picker` & `expo-camera`
  * `expo-location` (contextual permission on demand)
  * `expo-av` (audio voice notes recording & playback)
  * `expo-file-system`
  * `lucide-react-native` & `react-native-svg`
  * `@react-native-async-storage/async-storage`

---

## Directory Structure

```
between-us/
├── app.json                      # Production metadata, permissions, dark splash
├── package.json
├── tsconfig.json
├── .env.example                  # Supabase environment variable template
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql # Tables, indexes, RLS policies, Storage buckets
│   └── seed.sql                  # Kunal x Friend development seed data
├── src/
│   ├── app/                      # Expo Router navigation routes
│   │   ├── _layout.tsx           # Root provider layout (Auth, Duo, Dark Theme)
│   │   ├── index.tsx             # Route resolver (Timeline or Landing)
│   │   ├── (auth)/
│   │   │   ├── _layout.tsx
│   │   │   ├── landing.tsx       # "BETWEEN US - Kunal x Friend - [ENTER OUR SPACE]"
│   │   │   ├── login.tsx         # Clean dark sign in
│   │   │   └── signup.tsx        # Sign up & Duo creation/pairing
│   │   └── (app)/
│   │       ├── _layout.tsx
│   │       ├── (timeline)/
│   │       │   ├── index.tsx     # Flagship memory timeline
│   │       │   └── memory/
│   │       │       ├── [id].tsx  # Memory detail page
│   │       │       ├── create.tsx# Fullscreen journal composer
│   │       │       └── edit.tsx  # Edit memory
│   │       ├── places/
│   │       │   └── index.tsx     # Our Places
│   │       ├── little-things/
│   │       │   └── index.tsx     # Inside jokes, quotes, notes
│   │       └── more/
│   │           ├── index.tsx     # More hub
│   │           ├── capsules.tsx  # Time capsules
│   │           ├── plans.tsx     # Future plans & Turn into Memory
│   │           ├── questions.tsx # Double-blind shared questions
│   │           └── duo-settings.tsx # Space settings, invite code, demo reset
│   ├── components/
│   │   ├── memory/               # EditorialPhotoGrid, AudioPlayerWidget
│   │   ├── navigation/           # BottomNavBar with center '+'
│   │   └── shared/               # PhotoViewerModal, ConfirmModal
│   ├── constants/
│   │   ├── theme.ts              # Editorial dark palette & typography scale
│   │   └── mock-data.ts          # Default Kunal x Friend demo memories
│   ├── context/
│   │   ├── auth-context.tsx      # Session, profile & duo resolution
│   │   └── duo-context.tsx       # Live data cache, mutations & offline sync
│   ├── lib/
│   │   ├── supabase.ts           # Supabase client with AsyncStorage session
│   │   ├── audio.ts              # Recording & playback helpers
│   │   ├── location.ts           # Contextual GPS & reverse geocoding
│   │   ├── storage.ts            # Media upload to private buckets
│   │   └── local-drafts.ts       # Offline draft persistence
│   └── types/
│       └── index.ts              # Core TypeScript interfaces
```

---

## Getting Started

### 1. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 2. Configure Environment (Optional for Live Supabase)
To use a live Supabase backend, copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Provide your Supabase URL and Anon Key:
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```
> **Note**: If `.env` is omitted or empty, BETWEEN US automatically runs in **Offline / Demo Space Mode** with full functionality (memories, voice notes, places, capsules, plans, questions, and drafts work seamlessly with local persistence).

### 3. Run Development Server
```bash
npm start
```
From the Expo CLI menu, press:
- `a` to run on an Android emulator or device
- `i` to run on an iOS simulator (macOS required)
- `w` to run on web

---

## Supabase Database Setup

When connecting your live Supabase project:
1. Open your Supabase project dashboard.
2. Navigate to **SQL Editor**.
3. Run the schema migration from [supabase/migrations/001_initial_schema.sql](file:///c:/Users/kashy/Desktop/between-us/supabase/migrations/001_initial_schema.sql).
   - This sets up all 12 tables, indexes, Row Level Security policies (ensuring only duo members can access their data), and private storage buckets (`memories`, `capsules`).
4. (Optional) Run the seed script from [supabase/seed.sql](file:///c:/Users/kashy/Desktop/between-us/supabase/seed.sql) to populate initial sample memories.

---

## Android Build Instructions

To generate a standalone Android APK or AAB:
1. Install EAS CLI:
   ```bash
   npm install -g eas-cli
   ```
2. Log into Expo:
   ```bash
   eas login
   ```
3. Configure build credentials:
   ```bash
   eas build:configure
   ```
4. Build APK for preview testing:
   ```bash
   eas build --platform android --profile preview
   ```

---

## iOS Build Instructions

To build for iOS (simulator or TestFlight):
1. On a macOS machine with Xcode installed, run:
   ```bash
   npx expo run:ios
   ```
2. Or use EAS Cloud Build:
   ```bash
   eas build --platform ios --profile preview
   ```

---

## Testing & Quality Assurance

* **Type Safety**: Verified zero TypeScript errors across the entire codebase with `npx tsc --noEmit`.
* **Permissions Policy**: Camera, photo gallery, location, and microphone permissions are requested strictly on-demand during intentional user actions, never at app launch.
* **Offline Resilience**: Memory drafts are automatically saved to AsyncStorage as the user writes, protecting against accidental app closes or network hiccups.
* **Editorial Standards**: Dark theme surfaces, restrained typography, and non-generic layout geometry strictly adhere to the physical scrapbook aesthetic.
