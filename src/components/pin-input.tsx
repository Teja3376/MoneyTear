import React, { useRef, useState } from "react";
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
} from "react-native";

import {
  background,
  backgroundElement,
  border,
  error as errorColor,
  primary,
  text,
  textSecondary,
} from "@/constants/theme";

export interface PinInputProps {
  label?: string;
  value: string;
  onChange: (pin: string) => void;
  error?: string;
  maxLength?: number; // Defaults to 4
  secureTextEntry?: boolean;
  style?: StyleProp<ViewStyle>;
  autoFocus?: boolean;
}

/**
 * Reusable 4-digit PIN input with styled digit boxes and Android IME-safe hidden input.
 */
export function PinInput({
  label,
  value,
  onChange,
  error,
  maxLength = 4,
  secureTextEntry = true,
  style,
  autoFocus = false,
}: PinInputProps) {
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [showPin, setShowPin] = useState(!secureTextEntry);

  const handleChange = (text: string) => {
    const cleaned = text.replace(/\D/g, "").slice(0, maxLength);
    onChange(cleaned);
  };

  return (
    <View style={[styles.container, style]}>
      {label ? (
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          {secureTextEntry ? (
            <Pressable
              onPress={() => setShowPin((prev) => !prev)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={showPin ? "Hide PIN" : "Show PIN"}
            >
              <Text style={styles.toggleText}>{showPin ? "Hide" : "Show"}</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      <Pressable
        style={styles.boxesRow}
        onPress={() => inputRef.current?.focus()}
        accessible={false}
      >
        {Array.from({ length: maxLength }).map((_, index) => {
          const digit = value[index] ?? "";
          const isFilled = digit !== "";
          const isActive = isFocused && index === Math.min(value.length, maxLength - 1);

          return (
            <View
              key={index}
              style={[
                styles.box,
                isActive && styles.boxActive,
                isFilled && styles.boxFilled,
                error ? styles.boxError : null,
              ]}
            >
              {isFilled ? (
                showPin ? (
                  <Text style={styles.digitText}>{digit}</Text>
                ) : (
                  <View style={styles.maskDot} />
                )
              ) : null}
            </View>
          );
        })}

        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          keyboardType="number-pad"
          maxLength={maxLength}
          autoFocus={autoFocus}
          caretHidden
          contextMenuHidden={false}
          selectTextOnFocus={false}
          accessibilityLabel={label ?? "4-digit PIN"}
          style={styles.hiddenInput}
        />
      </Pressable>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

export default PinInput;

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    color: text,
    fontSize: 13,
    fontFamily: "Poppins_500Medium",
  },
  toggleText: {
    color: textSecondary,
    fontSize: 12,
    fontFamily: "Poppins_500Medium",
  },
  boxesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    width: "100%",
    position: "relative",
  },
  box: {
    flex: 1,
    height: 56,
    borderRadius: 14,
    backgroundColor: backgroundElement,
    borderWidth: 1.5,
    borderColor: border,
    alignItems: "center",
    justifyContent: "center",
  },
  boxActive: {
    borderColor: primary,
    backgroundColor: "#0D518C14",
  },
  boxFilled: {
    borderColor: primary,
    backgroundColor: backgroundElement,
  },
  boxError: {
    borderColor: errorColor,
  },
  digitText: {
    color: text,
    fontSize: 22,
    fontFamily: "Poppins_600SemiBold",
  },
  maskDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: text,
  },
  hiddenInput: {
    ...StyleSheet.absoluteFill,
    opacity: 1,
    color: "transparent",
    backgroundColor: "transparent",
    fontSize: 1,
  },
  errorText: {
    color: errorColor,
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    marginTop: -2,
  },
});
