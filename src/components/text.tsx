import { Text as RNText, TextInput as RNTextInput, type TextInputProps, type TextProps } from "react-native";

import { Typography } from "@/constants/theme";

// Use these instead of react-native's Text/TextInput: Poppins is applied here, so styles only set fontWeight.
export function Text({ style, ...props }: TextProps) {
  return <RNText {...props} style={[{ fontFamily: Typography.fontFamily }, style]} />;
}

export function TextInput({ style, ...props }: TextInputProps) {
  return <RNTextInput {...props} style={[{ fontFamily: Typography.fontFamily }, style]} />;
}
