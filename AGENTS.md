This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md

---

## Progress & Architecture (Completed Work)

### 1. Design System & Theme Tokens
- **Centralized Colors** (`src/constants/theme.ts` & `src/global.css`):
  - `primary`: `#0D518C`
  - `primaryDisabled` / `primary70`: `#0D518CB3` (8-digit hex format for 70% opacity)
  - `background`: `#101010`
  - `backgroundElement`: `#181818`
  - `backgroundSelected`: `#202020`
  - `text`: `#FFFFFF`
  - `textSecondary`: `#A3A3A3`
  - `border`: `#2A2A2A`
  - `handle`: `#3A3A3C`
  - `error`: `#FF6B6B`
- **Typography**: `@expo-google-fonts/poppins` (`Poppins_400Regular`, `Poppins_500Medium`, `Poppins_600SemiBold`).

### 2. Core Reusable Layout & Components
- **`AuthScreenLayout`** (`src/modules/auth/components/auth-screen-layout.tsx`):
  - Shared authentication screen layout with dark theme, safe-area insets, and bottom sheet animation.
  - Automatic keyboard detection (listens directly to `keyboardDidShow` / `keyboardWillShow`).
  - Adaptive keyboard handling (`KeyboardAvoidingView` with `behavior="height"` on Android and `"padding"` on iOS).
  - When the software keyboard opens, `topArea` collapses to compact mode (`flex: 0`) and `formPanel` becomes `flex: 1` so inputs and submit buttons are never obscured.
- **`DatePickerSheet` & `Calendar`** (`src/components/date-picker-sheet.tsx` & `src/components/calendar.tsx`):
  - Standalone `<Calendar />` view and bottom-sheet `<DatePickerSheet />` modal.
  - Wrapped in native React Native `<Modal transparent>` to guarantee anchoring to the bottom of the device window regardless of container nesting.
  - 3 view modes: Days grid, Months grid (3 columns), Years scrollable list with auto-scroll to the selected year.
  - Timezone safety: exports `formatDateYMD(date)` and sets noon local time (`12:00:00`) to prevent UTC date rollover bugs (e.g. June 12 rolling back to June 11 in IST).
  - Theme-matched vector-less `<CalendarIcon />`.
- **`PinInput`** (`src/components/pin-input.tsx`):
  - 4-digit PIN input with 4 styled digit boxes, active focus border, and masked dots (`●`).
  - Built-in "Show / Hide" PIN toggle button.
  - Android IME safe hidden input (`opacity: 1`, `color: "transparent"`, `fontSize: 1`) to guarantee Android keyboards (such as Gboard) never drop keystrokes.

### 3. Authentication Screens Flow
All screens are registered under `src/app/(auth)/_layout.tsx` with smooth horizontal slide transitions:

1. **Login Page** (`src/modules/auth/pages/login-page.tsx`, route `/(auth)/login`):
   - Centered animated hero taglines with staggered entrance animation.
   - Interactive sliding bottom panel with gesture pan handling.
   - Mobile number input (+91 prefix) with 10-digit validation.
   - Submitting routes to `/(auth)/otp`.

2. **OTP Verification Page** (`src/modules/auth/pages/otp-page.tsx`, route `/(auth)/otp`):
   - 6-digit OTP input with custom blinking cursor and autofill/SMS support.
   - Resend countdown timer (30 seconds).
   - Keyboard checkmark action (`returnKeyType="done"`) triggering verification.
   - Submitting routes to `/(auth)/profile`.

3. **Profile Details Page** (`src/modules/auth/pages/profile-page.tsx`, route `/(auth)/profile`):
   - First name, Last name, Email address, and Date of birth fields with Zod validation.
   - Date picker trigger connected to the common `DatePickerSheet`.
   - Submitting routes to `/(auth)/set-pin`.

4. **Set PIN Page** (`src/modules/auth/pages/set-pin-page.tsx`, route `/(auth)/set-pin`):
   - Sets a 4-digit security PIN: **New PIN** and **Confirm PIN**.
   - Validates that both fields are 4 digits and match.
   - Submitting routes to `/(auth)/pin`.

5. **Verify PIN Page** (`src/modules/auth/pages/verify-pin-page.tsx`, routes `/(auth)/pin` & `/(auth)/verify-pin`):
   - Verification screen for the 4-digit PIN.
   - "Forgot PIN?" link routing to `/(auth)/reset-pin`.
   - **Biometric toggle card** at the bottom: features a custom biometric fingerprint sensor badge in `#0D518C` and a native `Switch` toggle to enable biometric login.
   - Submitting routes to `/(tabs)`.

6. **Reset PIN Page** (`src/modules/auth/pages/reset-pin-page.tsx`, route `/(auth)/reset-pin`):
   - 3 fields: **Current PIN**, **New PIN**, and **Confirm New PIN** (all 4 digits).
   - Validates that New PIN differs from Current PIN, and Confirm New PIN matches New PIN.
   - Submitting updates PIN and routes back to `/(auth)/pin`.
