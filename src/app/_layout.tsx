import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { DarkTheme, Stack, ThemeProvider } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { SessionProvider, useSession } from "@/modules/auth/store/session-provider";
import { QueryProvider } from "@/providers/query-provider";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    // `SessionProvider` is outermost so the navigator's guards, the HTTP
    // client's `401` handling and every screen read the same session.
    <SessionProvider>
      <QueryProvider>
        <ThemeProvider value={DarkTheme}>
          <StatusBar style="light" />
          <AnimatedSplashOverlay />
          <RootNavigator />
          <SplashScreenController />
        </ThemeProvider>
      </QueryProvider>
    </SessionProvider>
  );
}

/**
 * Holds the splash screen until secure storage has been read.
 *
 * Without this the guard below would evaluate against an unresolved session and
 * the user could see a flash of the sign-in screen before an existing session
 * takes effect.
 */
function SplashScreenController() {
  const { status } = useSession();

  useEffect(() => {
    if (status !== "loading") {
      void SplashScreen.hideAsync();
    }
  }, [status]);

  return null;
}

function RootNavigator() {
  const { isAuthenticated } = useSession();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Anchor route. Resolves to the tab shell when signed in, sign-in when
          not, and is also the fallback a denied protected screen redirects to. */}
      <Stack.Screen name="index" />

      {/* The authenticated application. `Stack.Protected` removes the screen
          from the stack entirely while the guard is false, so a deep link into
          it redirects to the anchor instead of rendering — and the user never
          sees protected content before the session resolves. */}
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>

      {/* The entry journey: sign-in, OTP verification, onboarding and PIN
          recovery. Intentionally unguarded — this is where a session is
          obtained, so it must stay reachable while signed out. */}
      <Stack.Screen name="(auth)" />
    </Stack>
  );
}