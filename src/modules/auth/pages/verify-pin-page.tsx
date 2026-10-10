import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";

import {
  background,
  backgroundElement,
  border,
  primary,
  primaryDisabled,
  text,
  textSecondary,
} from "@/constants/theme";
import { useAuthFonts } from "@/modules/auth/components/auth-screen-layout";
import { PinInput } from "@/components/pin-input";

const verifyPinSchema = z.object({
  pin: z.string().regex(/^\d{4}$/, "Enter your 4-digit PIN."),
});

type VerifyPinForm = z.infer<typeof verifyPinSchema>;

export default function VerifyPinPage() {
  const [fontsLoaded] = useAuthFonts();
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<VerifyPinForm>({
    resolver: zodResolver(verifyPinSchema),
    defaultValues: {
      pin: "",
    },
  });

  const pinValue = watch("pin");
  const isComplete = pinValue.length === 4;

  const onSubmit = (values: VerifyPinForm) => {
    console.log("Verify PIN details:", {
      pin: values.pin,
      biometricEnabled,
    });
    router.replace("/(tabs)");
  };

  if (!fontsLoaded) return <View style={styles.loading} />;

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.pageContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Enter your PIN</Text>
          <Text style={styles.subtitle}>
            Enter your 4-digit security PIN to continue.
          </Text>
        </View>

        <View style={styles.form}>
          <Controller
            control={control}
            name="pin"
            render={({ field }) => (
              <PinInput
                label="4-digit PIN"
                value={field.value}
                onChange={field.onChange}
                error={errors.pin?.message}
                autoFocus
              />
            )}
          />

          <View style={styles.forgotRow}>
            <Pressable
              onPress={() => router.push("/(auth)/reset-pin")}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Forgot PIN"
            >
              <Text style={styles.forgotText}>Forgot PIN?</Text>
            </Pressable>
          </View>

          <Pressable
            onPress={handleSubmit(onSubmit)}
            disabled={!isComplete || isSubmitting}
            style={({ pressed }) => [
              styles.submitButton,
              pressed && styles.pressed,
              (!isComplete || isSubmitting) && styles.disabledButton,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Verify PIN"
          >
            <Text style={styles.submitText}>
              {isSubmitting ? "Verifying..." : "Verify & Continue"}
            </Text>
          </Pressable>

          {/* Enable Biometric Section at the bottom */}
          <View style={styles.biometricCard}>
            <View style={styles.biometricInfo}>
              <View style={styles.biometricIconBadge}>
                <View style={styles.fpArc1}>
                  <View style={styles.fpArc2}>
                    <View style={styles.fpCore} />
                  </View>
                </View>
              </View>
              <View style={styles.biometricTextGroup}>
                <Text style={styles.biometricTitle}>Enable Biometric</Text>
                <Text style={styles.biometricSubtitle}>
                  Use fingerprint or Face ID to verify
                </Text>
              </View>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={(value) => {
                setBiometricEnabled(value);
                console.log("Biometric toggle:", value);
              }}
              trackColor={{ false: border, true: primary }}
              thumbColor="#FFFFFF"
              ios_backgroundColor={border}
            />
          </View>

          <Text style={styles.privacyNote}>
            Need help? Contact MoneyTear support.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: background },
  loading: { flex: 1, backgroundColor: background },
  pageContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 28,
  },
  header: { marginBottom: 28 },
  title: {
    color: text,
    fontSize: 27,
    lineHeight: 36,
    fontFamily: "Poppins_600SemiBold",
  },
  subtitle: {
    color: textSecondary,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 6,
    fontFamily: "Poppins_400Regular",
  },
  form: { gap: 20 },
  forgotRow: {
    alignItems: "flex-end",
    marginTop: -4,
  },
  forgotText: {
    color: textSecondary,
    fontSize: 13,
    fontFamily: "Poppins_500Medium",
  },
  submitButton: {
    minHeight: 56,
    marginTop: 4,
    backgroundColor: primary,
    borderRadius: 30,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  submitText: {
    color: text,
    fontSize: 15,
    fontFamily: "Poppins_600SemiBold",
  },
  biometricCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: backgroundElement,
    borderWidth: 1,
    borderColor: border,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 2,
  },
  biometricInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    marginRight: 12,
  },
  biometricIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#0D518C1F",
    borderWidth: 1,
    borderColor: "#0D518C33",
    alignItems: "center",
    justifyContent: "center",
  },
  fpArc1: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.6,
    borderColor: primary,
    borderBottomColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  fpArc2: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.6,
    borderColor: primary,
    borderBottomColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  fpCore: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: primary,
  },
  biometricTextGroup: {
    flex: 1,
  },
  biometricTitle: {
    color: text,
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
  },
  biometricSubtitle: {
    color: textSecondary,
    fontSize: 11,
    lineHeight: 16,
    fontFamily: "Poppins_400Regular",
    marginTop: 1,
  },
  privacyNote: {
    color: textSecondary,
    textAlign: "center",
    fontSize: 11,
    lineHeight: 18,
    fontFamily: "Poppins_400Regular",
    marginTop: -4,
  },
  pressed: { opacity: 0.78 },
  disabledButton: { backgroundColor: primaryDisabled, opacity: 0.7 },
});
