import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  GestureResponderHandlers,
  Keyboard,
  KeyboardAvoidingView,
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
} from "@expo-google-fonts/poppins";

import { Colors, theme, handle } from "@/constants/theme";

export { theme };
export const AuthColors = Colors.dark;

export function useAuthFonts() {
  return useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
  });
}

export interface AuthScreenLayoutProps {
  /** Content to display in the upper hero/header section above the panel */
  topContent: React.ReactNode;
  /** Content displayed inside the bottom sheet */
  children: React.ReactNode;
  /** Optional heading inside the bottom sheet header */
  panelHeading?: string;
  /** Optional description inside the bottom sheet header */
  panelDescription?: string;
  /** Whether to show the top drag handle bar (default: true) */
  showHandle?: boolean;
  /** Custom drag zone renderer if custom markup is needed */
  renderDragZone?: () => React.ReactNode;
  /** Optional animated translateY value for custom panel animations (e.g. login page) */
  panelAnimY?: Animated.Value;
  /** Optional animated opacity value for custom panel animations */
  panelOpacity?: Animated.Value;
  /** Gesture pan handlers attached to the top handle / drag zone */
  panHandlers?: GestureResponderHandlers;
  /** Target height for the bottom panel (defaults to ~54% of screen height) */
  panelHeight?: number;
  /** Whether the keyboard is currently active (used to adapt top area height) */
  keyboardVisible?: boolean;
  /** Optional floating elements placed above panel (e.g. floating login trigger button) */
  floatingAction?: React.ReactNode;
  /** Whether the bottom sheet content is scrollable (default: true) */
  scrollable?: boolean;
  /** Optional container style for the scroll view content */
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** Optional style for top content wrapper */
  topAreaStyle?: StyleProp<ViewStyle>;
}

export default function AuthScreenLayout({
  topContent,
  children,
  panelHeading,
  panelDescription,
  showHandle = true,
  renderDragZone,
  panelAnimY,
  panelOpacity,
  panHandlers,
  panelHeight,
  keyboardVisible = false,
  floatingAction,
  scrollable = true,
  contentContainerStyle,
  topAreaStyle,
}: AuthScreenLayoutProps) {
  const { height: screenHeight } = useWindowDimensions();
  const [fontsLoaded] = useAuthFonts();

  const effectivePanelHeight = panelHeight ?? screenHeight * 0.54;

  const [internalKeyboardVisible, setInternalKeyboardVisible] = useState(false);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setInternalKeyboardVisible(true);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setInternalKeyboardVisible(false);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const isKeyboardActive = keyboardVisible || internalKeyboardVisible;

  // Default smooth slide-up animation if parent does not provide explicit animated values
  const internalPanelY = useRef(new Animated.Value(effectivePanelHeight)).current;
  const internalPanelOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!panelAnimY && fontsLoaded) {
      Animated.parallel([
        Animated.spring(internalPanelY, {
          toValue: 0,
          damping: 26,
          stiffness: 90,
          mass: 1,
          useNativeDriver: true,
        }),
        Animated.timing(internalPanelOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [fontsLoaded, internalPanelY, internalPanelOpacity, panelAnimY]);

  const activePanelY = panelAnimY ?? internalPanelY;
  const activePanelOpacity = panelOpacity ?? internalPanelOpacity;

  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={theme.primary} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.screen}>
          {/* Top content area */}
          <View
            style={[
              styles.topArea,
              isKeyboardActive && styles.topAreaCompact,
              topAreaStyle,
            ]}
          >
            {topContent}
          </View>

          {/* Optional floating action element */}
          {floatingAction}

          {/* Bottom sheet panel */}
          <Animated.View
            style={[
              styles.formPanel,
              {
                height: isKeyboardActive ? undefined : effectivePanelHeight,
                flex: isKeyboardActive ? 1 : undefined,
                opacity: activePanelOpacity,
                transform: [{ translateY: activePanelY }],
              },
            ]}
          >
            {renderDragZone ? (
              renderDragZone()
            ) : (
              <View {...(panHandlers ?? {})} style={styles.dragZone}>
                {showHandle && <View style={styles.panelHandle} />}
                {panelHeading ? (
                  <Text style={styles.heading}>{panelHeading}</Text>
                ) : null}
                {panelDescription ? (
                  <Text style={styles.description}>{panelDescription}</Text>
                ) : null}
              </View>
            )}

            {scrollable ? (
              <ScrollView
                style={styles.formScroll}
                contentContainerStyle={[styles.formContent, contentContainerStyle]}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode={
                  Platform.OS === "ios" ? "interactive" : "on-drag"
                }
                showsVerticalScrollIndicator={false}
              >
                {children}
              </ScrollView>
            ) : (
              <View style={[styles.formScroll, contentContainerStyle]}>
                {children}
              </View>
            )}
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: theme.background,
  },
  loading: {
    flex: 1,
    backgroundColor: theme.background,
    alignItems: "center",
    justifyContent: "center",
  },
  screen: {
    flex: 1,
    backgroundColor: theme.background,
    overflow: "hidden",
  },
  topArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  topAreaCompact: {
    flex: 0,
    minHeight: 0,
  },
  formPanel: {
    width: "100%",
    backgroundColor: theme.backgroundElement,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 26,
    paddingTop: 12,
    overflow: "hidden",
  },
  formScroll: {
    flex: 1,
  },
  formContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  dragZone: {
    paddingTop: 4,
    paddingBottom: 4,
  },
  panelHandle: {
    width: 44,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: handle,
    alignSelf: "center",
    marginBottom: 16,
  },
  heading: {
    color: theme.text,
    fontSize: 25,
    fontFamily: "Poppins_600SemiBold",
  },
  description: {
    color: theme.textSecondary,
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    marginTop: 6,
    marginBottom: 14,
  },
});
