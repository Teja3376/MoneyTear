import React from "react";
import { StyleSheet, View } from "react-native";
import { Image } from "expo-image";

interface MoneyTearLogoProps {
  width?: number;
  height?: number;
}

export function MoneyTearLogo({ width = 151, height = 31 }: MoneyTearLogoProps) {
  return (
    <View style={[styles.container, { width, height }]}>
      <Image
        source={require("@/assets/moneytear-wordmark.svg")}
        style={{ width, height }}
        contentFit="contain"
        accessibilityLabel="MoneyTear"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});

export default MoneyTearLogo;
