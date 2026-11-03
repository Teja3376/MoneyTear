import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  LayoutChangeEvent,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { Text } from "@/components/text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { ClipPath, Defs, Path } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import type { BottomTabBarProps } from "expo-router/tabs";

import {
  Gradients,
  Typography,
  activeAccent,
  background,
  navBorder,
  primaryForeground,
  textSecondary,
} from "@/constants/theme";
import {
  CategoryIcon,
  HistoryIcon,
  HomeIcon,
  PlusIcon,
  ProfileIcon,
} from "@/components/tab-icons";

export type BottomNavigationProps = BottomTabBarProps & {
  onPressAdd?: () => void;
};

interface TabItemConfig {
  key: string;
  name: string;
  route: string;
  IconComponent: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
}

const TABS: TabItemConfig[] = [
  { key: "index", name: "Home", route: "index", IconComponent: HomeIcon },
  { key: "category", name: "Category", route: "category", IconComponent: CategoryIcon },
  { key: "history", name: "History", route: "history", IconComponent: HistoryIcon },
  { key: "profile", name: "Profile", route: "profile", IconComponent: ProfileIcon },
];

export function BottomNavigation(props: BottomNavigationProps) {
  const insets = useSafeAreaInsets();
  const screenWidth = Dimensions.get("window").width;
  const [barWidth, setBarWidth] = useState(screenWidth - 16);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Highlight the tab of the screen that's showing
  const activeRouteName = props.state.routes[props.state.index]?.name ?? "index";
  const activeTabIndex = Math.max(0, TABS.findIndex((t) => t.route === activeRouteName));

  // X center of each tab, skipping the middle button slot
  const getTabCenterX = (index: number, width: number) => {
    const tabWidth = (width - 68) / 4;
    if (index === 0) return tabWidth * 0.5;
    if (index === 1) return tabWidth * 1.5;
    if (index === 2) return 2 * tabWidth + 68 + tabWidth * 0.5;
    if (index === 3) return 2 * tabWidth + 68 + tabWidth * 1.5;
    return tabWidth * 0.5;
  };

  // Indicator slide to the active tab
  const glideAnim = useRef(
    new Animated.Value(getTabCenterX(0, screenWidth - 16))
  ).current;

  useEffect(() => {
    const targetX = getTabCenterX(activeTabIndex, barWidth);
    Animated.spring(glideAnim, {
      toValue: targetX,
      stiffness: 260,
      damping: 24,
      mass: 0.8,
      useNativeDriver: true,
    }).start();
  }, [activeTabIndex, barWidth, glideAnim]);

  // Rotate the add button from + to x
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const handleToggleAdd = () => {
    const nextState = !isAddOpen;
    setIsAddOpen(nextState);
    Animated.spring(rotateAnim, {
      toValue: nextState ? 1 : 0,
      stiffness: 300,
      damping: 20,
      mass: 0.7,
      useNativeDriver: true,
    }).start();
    props.onPressAdd?.();
  };

  const plusRotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "45deg"],
  });

  // Re-measure the bar when its width changes
  const onLayoutBar = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    if (width > 0 && Math.abs(width - barWidth) > 1) {
      setBarWidth(width);
    }
  };

  // Same as expo-router's default tab bar: emit tabPress, then switch by route key
  const handleTabPress = (routeName: string) => {
    const route = props.state.routes.find((r) => r.name === routeName);
    if (!route) return;
    const event = props.emitter.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
    if (routeName !== activeRouteName && !event.defaultPrevented) {
      props.navigateToTab(route.key);
    }
  };

  const h = 70;
  const w = barWidth;
  const r = 26;
  const cx = w / 2;
  const notchWidth = 58;
  const notchDepth = 48;

  // Bar shape with a notch cut for the add button
  const notchSvgPath = [
    `M ${r} 0`,
    `L ${cx - notchWidth} 0`,
    `C ${cx - 43} 0, ${cx - 43} ${notchDepth}, ${cx} ${notchDepth}`,
    `C ${cx + 43} ${notchDepth}, ${cx + 43} 0, ${cx + notchWidth} 0`,
    `L ${w - r} 0`,
    `A ${r} ${r} 0 0 1 ${w} ${r}`,
    `L ${w} ${h - r}`,
    `A ${r} ${r} 0 0 1 ${w - r} ${h}`,
    `L ${r} ${h}`,
    `A ${r} ${r} 0 0 1 0 ${h - r}`,
    `L 0 ${r}`,
    `A ${r} ${r} 0 0 1 ${r} 0`,
    `Z`,
  ].join(" ");

  const bottomInset = insets.bottom > 0 ? insets.bottom : 12;

  return (
    <View
      pointerEvents="box-none"
      style={[styles.outerContainer, { bottom: bottomInset }]}
    >
      <View
        style={styles.navBarWrapper}
        onLayout={onLayoutBar}
      >
        <Svg width={w} height={h} style={StyleSheet.absoluteFill}>
          <Defs>
            <ClipPath id="notchClip">
              <Path d={notchSvgPath} />
            </ClipPath>
          </Defs>
          <Path d={notchSvgPath} fill={background} />
          {/* Border drawn inside the shape only */}
          <Path
            d={notchSvgPath}
            fill="none"
            stroke={navBorder}
            strokeWidth={3}
            clipPath="url(#notchClip)"
          />
        </Svg>

        {/* Add button */}
        <View style={[styles.addButtonContainer, { left: cx - 29 }]}>
          <Pressable
            onPress={handleToggleAdd}
            style={({ pressed }) => [
              styles.addButton,
              pressed && styles.addButtonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Toggle Add Action"
          >
            <LinearGradient
              colors={Gradients.primaryButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1.4, y: 0 }}
              style={styles.addButtonGradient}
            >
              <Animated.View style={{ transform: [{ rotate: plusRotation }] }}>
                <PlusIcon size={24} color={primaryForeground} strokeWidth={2.0} />
              </Animated.View>
            </LinearGradient>
          </Pressable>
        </View>

        <View style={styles.tabRow}>
          {/* Glow under the active tab */}
          <Animated.View
            pointerEvents="none"
            style={[
              styles.glidingGlow,
              {
                transform: [{ translateX: glideAnim }],
              },
            ]}
          />

          {/* Active tab indicator */}
          <Animated.View
            pointerEvents="none"
            style={[
              styles.glidingIndicator,
              {
                transform: [{ translateX: glideAnim }],
              },
            ]}
          />

          {renderTabButton(TABS[0], activeRouteName === TABS[0].route, handleTabPress)}

          {renderTabButton(TABS[1], activeRouteName === TABS[1].route, handleTabPress)}

          {/* Space under the add button */}
          <View style={styles.centerSpacer} />

          {renderTabButton(TABS[2], activeRouteName === TABS[2].route, handleTabPress)}

          {renderTabButton(TABS[3], activeRouteName === TABS[3].route, handleTabPress)}
        </View>
      </View>
    </View>
  );
}

function renderTabButton(
  tab: TabItemConfig,
  isActive: boolean,
  onPress: (route: string) => void
) {
  const Icon = tab.IconComponent;
  const color = isActive ? activeAccent : textSecondary;

  return (
    <Pressable
      key={tab.key}
      onPress={() => onPress(tab.route)}
      style={styles.tabItem}
      hitSlop={6}
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
      accessibilityLabel={tab.name}
    >
      <View style={styles.iconContainer}>
        <Icon size={24} color={color} strokeWidth={1.8} />
      </View>

      <Text
        style={[
          styles.tabLabel,
          isActive ? styles.tabLabelActive : styles.tabLabelInactive,
        ]}
      >
        {tab.name}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    position: "absolute",
    left: 8,
    right: 8,
    alignItems: "center",
    zIndex: 100,
  },
  navBarWrapper: {
    width: "100%",
    height: 70,
    position: "relative",
  },

  addButtonContainer: {
    position: "absolute",
    top: -24,
    width: 58,
    height: 58,
    zIndex: 10,
  },
  addButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 1,
    borderColor: activeAccent,
    overflow: "hidden",
    shadowColor: activeAccent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  },
  addButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }],
  },
  addButtonGradient: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  tabRow: {
    width: "100%",
    height: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 8,
    position: "relative",
  },
  tabItem: {
    paddingBottom: 4,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    zIndex: 2,
  },
  centerSpacer: {
    width: 68,
  },
  iconContainer: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  glidingGlow: {
    position: "absolute",
    top: 5,
    left: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: activeAccent,
    opacity: 0.12,
    zIndex: 1,
    ...(Platform.OS === "web" ? { filter: "blur(6px)" } : {}),
  },
  glidingIndicator: {
    position: "absolute",
    bottom: 4,
    left: -9,
    width: 18,
    height: 3,
    backgroundColor: activeAccent,
    borderRadius: 2,
    zIndex: 3,
  },
  tabLabel: {
    fontSize: Typography.tabLabel.fontSize,
    lineHeight: Typography.tabLabel.lineHeight,
    textAlign: "center",
    marginTop: 5,
  },
  tabLabelActive: {
    fontWeight: "500",
    color: activeAccent,
  },
  tabLabelInactive: {
    fontWeight: "400",
    color: textSecondary,
  },
});

export default BottomNavigation;
