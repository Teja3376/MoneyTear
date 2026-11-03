import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  GestureResponderHandlers,
  Keyboard,
  KeyboardAvoidingView,
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
  useWindowDimensions,
} from "react-native";
import { Text } from "@/components/text";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors, theme, handle } from "@/constants/theme";

export { theme };
export const AuthColors = Colors.dark;

export interface AuthScreenLayoutProps {
  topContent: React.ReactNode;
  children: React.ReactNode;
  panelHeading?: string;
  panelDescription?: string;
  showHandle?: boolean;
  renderDragZone?: () => React.ReactNode;
  // pass your own animated values to drive the panel (login page does)
  panelAnimY?: Animated.Value;
  panelOpacity?: Animated.Value;
  panHandlers?: GestureResponderHandlers;
  // default ~54% of screen height
  panelHeight?: number;
  // shrinks the top area while the keyboard is open
  keyboardVisible?: boolean;
  floatingAction?: React.ReactNode;
  scrollable?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
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

  const effectivePanelHeight = panelHeight ?? screenHeight * 0.54;

  const [internalKeyboardVisible, setInternalKeyboardVisible] = useState(false);

  // Track the keyboard so the top area can shrink while typing
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

  // Panel slide-up animation, used when the page doesn't pass its own
  const internalPanelY = useRef(new Animated.Value(effectivePanelHeight)).current;
  const internalPanelOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!panelAnimY) {
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
  }, [internalPanelY, internalPanelOpacity, panelAnimY]);

  const activePanelY = panelAnimY ?? internalPanelY;
  const activePanelOpacity = panelOpacity ?? internalPanelOpacity;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.screen}>
          <View
            style={[
              styles.topArea,
              isKeyboardActive && styles.topAreaCompact,
              topAreaStyle,
            ]}
          >
            {topContent}
          </View>

          {floatingAction}

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
    fontWeight: "600",
  },
  description: {
    color: theme.textSecondary,
    fontSize: 13,
    marginTop: 6,
    marginBottom: 14,
  },
});
