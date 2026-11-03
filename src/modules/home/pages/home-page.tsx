import { StyleSheet, View } from "react-native";

import { Text } from "@/components/text";
import { theme } from "@/constants/theme";

export default function HomePage() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello Home</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.background,
  },
  title: {
    color: theme.text,
    fontSize: 20,
    fontWeight: "600",
  },
});
