import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Text } from "@/components/text";
import { router } from "expo-router";

import {
  background,
  primary,
  primaryDisabled,
  text,
  textSecondary,
} from "@/constants/theme";
import { resetPinSchema, type ResetPinForm } from "@/modules/auth/schema";
import { PinInput } from "@/modules/auth/ui/pin-input";

export default function ResetPinPage() {

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPinForm>({
    resolver: zodResolver(resetPinSchema),
    defaultValues: {
      oldPin: "",
      newPin: "",
      confirmNewPin: "",
    },
  });

  const oldPinValue = watch("oldPin");
  const newPinValue = watch("newPin");
  const confirmNewPinValue = watch("confirmNewPin");
  const isComplete =
    oldPinValue.length === 4 &&
    newPinValue.length === 4 &&
    confirmNewPinValue.length === 4;

  const onSubmit = (_values: ResetPinForm) => {
    // TODO: call useChangePin once the API flow is ready.
    router.replace("/(auth)/pin");
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.pageContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Reset your PIN</Text>
          <Text style={styles.subtitle}>
            Enter your current PIN and choose a new 4-digit PIN.
          </Text>
        </View>

        <View style={styles.form}>
          <Controller
            control={control}
            name="oldPin"
            render={({ field }) => (
              <PinInput
                label="Current PIN"
                value={field.value}
                onChange={field.onChange}
                error={errors.oldPin?.message}
                autoFocus
              />
            )}
          />

          <Controller
            control={control}
            name="newPin"
            render={({ field }) => (
              <PinInput
                label="New PIN"
                value={field.value}
                onChange={field.onChange}
                error={errors.newPin?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="confirmNewPin"
            render={({ field }) => (
              <PinInput
                label="Confirm New PIN"
                value={field.value}
                onChange={field.onChange}
                error={errors.confirmNewPin?.message}
              />
            )}
          />

          <Pressable
            onPress={handleSubmit(onSubmit)}
            disabled={!isComplete || isSubmitting}
            style={({ pressed }) => [
              styles.submitButton,
              pressed && styles.pressed,
              (!isComplete || isSubmitting) && styles.disabledButton,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Reset PIN"
          >
            <Text style={styles.submitText}>
              {isSubmitting ? "Updating PIN..." : "Reset PIN"}
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
    fontWeight: "600",
  },
  subtitle: {
    color: textSecondary,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 6,
  },
  form: { gap: 20 },
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
    fontWeight: "600",
  },
  privacyNote: {
    color: textSecondary,
    textAlign: "center",
    fontSize: 11,
    lineHeight: 18,
    marginTop: -4,
  },
  pressed: { opacity: 0.78 },
  disabledButton: { backgroundColor: primaryDisabled, opacity: 0.7 },
});
