import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  LayoutChangeEvent,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { ClipPath, Defs, Path } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";

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

export interface BottomNavigationProps {
  state?: {
    index: number;
    routes: { key: string; name: string }[];
  };
  navigation?: {
    navigate: (name: string) => void;
    emit?: (event: any) => any;
  };
  descriptors?: Record<string, any>;
  onPressAdd?: () => void;
  onTabPress?: (route: string) => void;
}

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

export function BottomNavigation(props?: BottomNavigationProps) {
  const insets = useSafeAreaInsets();
  const screenWidth = Dimensions.get("window").width;
  const [barWidth, setBarWidth] = useState(screenWidth - 16);
  const [selectedTab, setSelectedTab] = useState("index");
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Active tab state for testing transitions without changing the screen
  const activeRouteName = selectedTab;
  const activeTabIndex = Math.max(0, TABS.findIndex((t) => t.route === activeRouteName));

  // Compute horizontal center X for each tab
  const getTabCenterX = (index: number, width: number) => {
    const tabWidth = (width - 68) / 4;
    if (index === 0) return tabWidth * 0.5;
    if (index === 1) return tabWidth * 1.5;
    if (index === 2) return 2 * tabWidth + 68 + tabWidth * 0.5;
    if (index === 3) return 2 * tabWidth + 68 + tabWidth * 1.5;
    return tabWidth * 0.5;
  };

  // Gliding indicator animation
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

  // + to x rotation animation
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
    props?.onPressAdd?.();
  };

  const plusRotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "45deg"],
  });

  const onLayoutBar = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    if (width > 0 && Math.abs(width - barWidth) > 1) {
      setBarWidth(width);
    }
  };

  // Tab switch for testing without route navigation
  const handleTabPress = (route: string) => {
    setSelectedTab(route);
    if (props?.onTabPress) {
      props.onTabPress(route);
    }
  };

  // Dimensions
  const h = 70;
  const w = barWidth;
  const r = 26; // Corner radius
  const cx = w / 2;
  const notchWidth = 58; // Scoop reaches from cx - 42 to cx + 42
  const notchDepth = 48; // Scoop depth

  // Shallow crescent notch curve
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
        {/* SVG Background with Shallow Crescent Notch and Inside Stroke */}
        <Svg width={w} height={h} style={StyleSheet.absoluteFill}>
          <Defs>
            <ClipPath id="notchClip">
              <Path d={notchSvgPath} />
            </ClipPath>
          </Defs>
          {/* Base fill - common #101010 */}
          <Path d={notchSvgPath} fill={background} />
          {/* Inside stroke (outer half clipped out, leaving only inside stroke) */}
          <Path
            d={notchSvgPath}
            fill="none"
            stroke={navBorder}
            strokeWidth={3}
            clipPath="url(#notchClip)"
          />
        </Svg>

        {/* Primary Floating Action Add Button with smooth + to x rotation */}
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

        {/* 5-Column Navigation Row with smooth glide effect */}
        <View style={styles.tabRow}>
          {/* Soft ambient glow gliding smoothly under active tab icon */}
          <Animated.View
            pointerEvents="none"
            style={[
              styles.glidingGlow,
              {
                transform: [{ translateX: glideAnim }],
              },
            ]}
          />

          {/* Gliding active indicator bar under active tab */}
          <Animated.View
            pointerEvents="none"
            style={[
              styles.glidingIndicator,
              {
                transform: [{ translateX: glideAnim }],
              },
            ]}
          />

          {/* Tab 1: Home */}
          {renderTabButton(TABS[0], activeRouteName === TABS[0].route, handleTabPress)}

          {/* Tab 2: Category */}
          {renderTabButton(TABS[1], activeRouteName === TABS[1].route, handleTabPress)}

          {/* Center Spacer for Floating Button Notch */}
          <View style={styles.centerSpacer} />

          {/* Tab 3: History */}
          {renderTabButton(TABS[2], activeRouteName === TABS[2].route, handleTabPress)}

          {/* Tab 4: Profile */}
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
  addAmbientGlow: {
    position: "absolute",
    top: -40,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: activeAccent,
    opacity: 0.15,
    zIndex: 5,
    ...(Platform.OS === "web" ? { filter: "blur(9px)" } : {}),
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
    fontFamily: Typography.tabLabel.fontFamily,
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
