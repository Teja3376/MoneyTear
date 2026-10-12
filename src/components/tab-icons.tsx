import React from "react";
import Svg, { Circle, Path } from "react-native-svg";
import { activeAccent, primary, primaryForeground, textSecondary } from "@/constants/theme";

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export function HomeIcon({ size = 24, color = activeAccent }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2.3C11.2 2.3 10.6 2.7 10.1 3.2L3.4 9.4C3.1 9.7 3 10.1 3 10.6V18.5C3 19.9 4.1 21 5.5 21H18.5C19.9 21 21 19.9 21 18.5V10.6C21 10.1 20.9 9.7 20.6 9.4L13.9 3.2C13.4 2.7 12.8 2.3 12 2.3Z"
        fill={color}
      />
    </Svg>
  );
}

export function CategoryIcon({ size = 24, color = textSecondary, strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3.5 7A1.5 1.5 0 0 1 5 5.5H9.5L11.5 8H19A1.5 1.5 0 0 1 20.5 9.5V17.5A1.5 1.5 0 0 1 19 19H5A1.5 1.5 0 0 1 3.5 17.5V7Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function HistoryIcon({ size = 24, color = textSecondary, strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Receipt body with zigzag bottom */}
      <Path
        d="M5.5 4C5.5 3.44772 5.94772 3 6.5 3H17.5C18.0523 3 18.5 3.44772 18.5 4V19.5L16.2 18.2L14 19.5L12 18.2L10 19.5L7.8 18.2L5.5 19.5V4Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Horizontal text lines */}
      <Path
        d="M8.5 8H15.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Path
        d="M8.5 12H13.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function ProfileIcon({ size = 24, color = textSecondary, strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Outer Circle */}
      <Circle
        cx="12"
        cy="12"
        r="9"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      {/* Head */}
      <Circle
        cx="12"
        cy="9.5"
        r="3"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      {/* Shoulders */}
      <Path
        d="M6.8 18.2C7.8 15.6 9.7 14.5 12 14.5C14.3 14.5 16.2 15.6 17.2 18.2"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function PlusIcon({ size = 24, color = primaryForeground, strokeWidth = 2.0 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 5V19M5 12H19"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function LogoutIcon({ size = 22, color = primary, strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Door frame */}
      <Path
        d="M14 4H7.5C6.4 4 5.5 4.9 5.5 6V18C5.5 19.1 6.4 20 7.5 20H14"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Arrow shaft */}
      <Path
        d="M10.5 12H19.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {/* Arrow head */}
      <Path
        d="M16 8.5L19.5 12L16 15.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
