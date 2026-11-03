import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
} from "@expo-google-fonts/poppins";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { DarkTheme, Stack, ThemeProvider } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { Typography } from "@/constants/theme";
import { SessionProvider, useSession } from "@/modules/auth/store/session-provider";
import { QueryProvider } from "@/providers/query-provider";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Load every Poppins weight once, under one family name; styles pick the weight with fontWeight.
  const [fontsLoaded, fontError] = useFonts([
    {
      fontFamily: Typography.fontFamily,
      fontDefinitions: [
        { path: Poppins_400Regular, weight: 400, style: "normal" },
        { path: Poppins_500Medium, weight: 500, style: "normal" },
        { path: Poppins_600SemiBold, weight: 600, style: "normal" },
      ],
    },
  ]);

  // Splash stays up until fonts are ready (or failed, then system font is used).
  if (!fontsLoaded && !fontError) return null;

  return (
    // Session first, so guards and the HTTP client share it.
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

// Hide the splash once the saved session is loaded.
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
      {/* Entry: redirects based on session */}
      <Stack.Screen name="index" />

      {/* Signed-in app, hidden until authenticated */}
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>

      {/* Sign-in and PIN screens, always reachable */}
      <Stack.Screen name="(auth)" />
    </Stack>
  );
}