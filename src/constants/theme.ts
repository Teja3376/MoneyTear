import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    background: "#101010",
    text: "#FFFFFF",
    textSecondary: "#A7ADB8",
    primary: "#0D518C",
    primaryForeground: "#FFFFFF",
    primaryDisabled: "#0D518CB3",
    primaryMuted: "#0D518CB3",
    primary70: "#0D518CB3",
    activeAccent: "#168BFF",
    blueAccent: "#168BFF",
    navBorder: "rgba(29, 117, 201, 0.72)",
    card: "#181818",
    backgroundElement: "#181818",
    backgroundSelected: "#202020",
    border: "#2A2A2A",
    input: "#2A2A2A",
    handle: "#3A3A3C",
    ring: "#0D518C",
    error: "#FF6B6B",
  },
  dark: {
    background: "#101010",
    text: "#FFFFFF",
    textSecondary: "#A7ADB8",
    primary: "#0D518C",
    primaryForeground: "#FFFFFF",
    primaryDisabled: "#0D518CB3",
    primaryMuted: "#0D518CB3",
    primary70: "#0D518CB3",
    activeAccent: "#168BFF",
    blueAccent: "#168BFF",
    navBorder: "rgba(29, 117, 201, 0.72)",
    card: "#181818",
    backgroundElement: "#181818",
    backgroundSelected: "#202020",
    border: "#2A2A2A",
    input: "#2A2A2A",
    handle: "#3A3A3C",
    ring: "#0D518C",
    error: "#FF6B6B",
  },
} as const;

export const theme = Colors.dark;

export const {
  background,
  text,
  textSecondary,
  primary,
  primaryForeground,
  primaryDisabled,
  primaryMuted,
  primary70,
  activeAccent,
  blueAccent,
  navBorder,
  card,
  backgroundElement,
  backgroundSelected,
  border,
  input,
  handle,
  ring,
  error,
} = Colors.dark;

// Aliases used by the navigation bar
export const navBackground = background;
export const navInactive = textSecondary;

export const Gradients = {
  primaryButton: ["#168BFF", "#064AAB"] as const,
  tearBlue: ["#168BFF", "#0875E8"] as const,
} as const;

export const Typography = {
  // Loaded once in the root layout; weights 400, 500, 600.
  fontFamily: "Poppins",
  tabLabel: {
    fontSize: 11,
    lineHeight: 13,
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;


export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
