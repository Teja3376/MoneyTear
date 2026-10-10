import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";

import {
  background,
  border,
  error as errorColor,
  primary,
  primaryDisabled,
  text,
  textSecondary,
} from "@/constants/theme";
import { useAuthFonts } from "@/modules/auth/components/auth-screen-layout";
import { setPinSchema, type SetPinForm } from "@/modules/auth/schemas";
import { PinInput } from "@/components/pin-input";
import { useSetupPin } from "@/modules/security/hooks/useSetupPin";
import { getErrorMessage } from "@/lib/errors";


export default function SetPinPage() {
  const [fontsLoaded] = useAuthFonts();
  const setupPinMutation = useSetupPin();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SetPinForm>({
    resolver: zodResolver(setPinSchema),
    defaultValues: {
      newPin: "",
      confirmPin: "",
    },
  });

  const newPinValue = watch("newPin");
  const confirmPinValue = watch("confirmPin");
  const isComplete = newPinValue.length === 4 && confirmPinValue.length === 4;

  const onSubmit = async (values: SetPinForm) => {
    setApiError(null);
    try {
      await setupPinMutation.mutateAsync({
        pin: values.newPin,
        confirmPin: values.confirmPin,
      });
      router.replace("/(auth)/pin");
    } catch (err) {
      setApiError(getErrorMessage(err, "Failed to set PIN. Please try again."));
    }

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
          <Text style={styles.title}>Set your PIN</Text>
          <Text style={styles.subtitle}>
            Create a 4-digit security PIN for your MoneyTear account.
          </Text>
        </View>

        <View style={styles.form}>
          <Controller
            control={control}
            name="newPin"
            render={({ field }) => (
              <PinInput
                label="New PIN"
                value={field.value}
                onChange={field.onChange}
                error={errors.newPin?.message}
                autoFocus
              />
            )}
          />

          <Controller
            control={control}
            name="confirmPin"
            render={({ field }) => (
              <PinInput
                label="Confirm PIN"
                value={field.value}
                onChange={field.onChange}
                error={errors.confirmPin?.message}
              />
            )}
          />

          {apiError && (
            <Text style={styles.errorText}>
              {apiError}
            </Text>
          )}

          <Pressable
            onPress={handleSubmit(onSubmit)}
            disabled={!isComplete || isSubmitting || setupPinMutation.isPending}
            style={({ pressed }) => [
              styles.submitButton,
              pressed && styles.pressed,
              (!isComplete || isSubmitting || setupPinMutation.isPending) && styles.disabledButton,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Set PIN"
          >
            <Text style={styles.submitText}>
              {isSubmitting || setupPinMutation.isPending ? "Setting PIN..." : "Set PIN"}
            </Text>
          </Pressable>

          <Text style={styles.privacyNote}>
            Your PIN protects your transactions and account security.
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
  form: { gap: 24 },
  submitButton: {
    minHeight: 56,
    marginTop: 8,
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
  privacyNote: {
    color: textSecondary,
    textAlign: "center",
    fontSize: 11,
    lineHeight: 18,
    fontFamily: "Poppins_400Regular",
    marginTop: -8,
  },
  pressed: { opacity: 0.78 },
  disabledButton: { backgroundColor: primaryDisabled, opacity: 0.7 },
  errorText: {
    color: errorColor,
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
    marginTop: 4,
  },
});

