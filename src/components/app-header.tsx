import React from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

import { MoneyTearLogo } from "@/components/money-tear-logo";
import { LogoutIcon } from "@/components/tab-icons";
import { useLogout } from "@/modules/auth/hooks/useLogout";
import { useSession } from "@/modules/auth/store/session-provider";
import { background, blueAccent, primary } from "@/constants/theme";

export interface AppHeaderProps {
  onLogout?: () => void;
}

export function AppHeader({ onLogout }: AppHeaderProps) {
  const insets = useSafeAreaInsets();
  const logoutMutation = useLogout();
  const { signOut } = useSession();

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out of MoneyTear?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            if (onLogout) {
              onLogout();
              return;
            }
            try {
              await logoutMutation.mutateAsync();
            } catch (err) {
              console.warn("Logout error:", err);
              await signOut();
            } finally {
              router.replace("/(auth)/login");
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top, 12) }]}>
      <View style={styles.contentRow}>
        {/* Brand Logo in center */}
        <View style={styles.centerContainer}>
          <MoneyTearLogo width={151} height={31} />
        </View>

        {/* Right Logout Icon Button - modern borderless icon */}
        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => [
            styles.logoutButton,
            pressed && styles.logoutButtonPressed,
          ]}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Logout"
        >
          <LogoutIcon size={30} color={blueAccent} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: background,
    paddingBottom: 10,
    paddingHorizontal: 16,
  },
  contentRow: {
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  centerContainer: {
    flex: 1,
    paddingTop: 15,
    paddingLeft: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutButton: {
    padding: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutButtonPressed: {
    opacity: 0.6,
  },
});

export default AppHeader;
