import React, { useCallback, useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  AppState,
  type AppStateStatus,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import * as LocalAuthentication from "expo-local-authentication";

import {
  background,
  backgroundElement,
  border,
  error as errorColor,
  primary,
  primaryDisabled,
  text,
  textSecondary,
} from "@/constants/theme";
import { useAuthFonts } from "@/modules/auth/components/auth-screen-layout";
import { verifyPinSchema, type VerifyPinForm } from "@/modules/auth/schemas";
import { PinInput } from "@/components/pin-input";
import { getStorage } from "@/lib/storage";
import { useVerifyPin } from "@/modules/security/hooks/useVerifyPin";
import { getErrorMessage } from "@/lib/errors";


const FINGERPRINT_ENABLED_KEY = "moneytear.fingerprint-enabled";
const LEGACY_BIOMETRIC_KEY = "moneytear.biometric-enabled";
const PIN_VERIFIED_KEY = "moneytear.pin-verified-for-biometrics";

export default function VerifyPinPage() {
  const [fontsLoaded] = useAuthFonts();
  const [fingerprintEnabled, setFingerprintEnabled] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const verifyPinMutation = useVerifyPin();
  const isAuthenticatingRef = useRef(false);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

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

  const onSubmit = async (values: VerifyPinForm) => {
    setApiError(null);
    try {
      const result = await verifyPinMutation.mutateAsync({ pin: values.pin });
      if (result.verified) {
        if (fingerprintEnabled) {
          await getStorage().setItem(PIN_VERIFIED_KEY, "true");
        }
        router.replace("/(tabs)");
      } else {
        setApiError("Invalid PIN. Please try again.");
      }
    } catch (err) {
      setApiError(getErrorMessage(err, "Invalid PIN. Please try again."));
    }
  };

  const triggerFingerprintUnlock = useCallback(async () => {
    if (isAuthenticatingRef.current) return;

    try {
      isAuthenticatingRef.current = true;

      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      const hasFingerprint = types.includes(
        LocalAuthentication.AuthenticationType.FINGERPRINT,
      );

      if (!hasHardware || !hasFingerprint || !isEnrolled) {
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Unlock MoneyTear with Fingerprint",
        cancelLabel: "Cancel",
        fallbackLabel: "Enter PIN",
        disableDeviceFallback: true,
      });

      if (result.success) {
        router.replace("/(tabs)");
      }
    } catch (error) {
      console.warn("Fingerprint authentication error:", error);
    } finally {
      isAuthenticatingRef.current = false;
    }
  }, []);

  // Load persisted fingerprint preference and trigger prompt if enabled & PIN was verified
  useEffect(() => {
    let isMounted = true;

    async function loadPreferenceAndAuthenticate() {
      try {
        const stored =
          (await getStorage().getItem(FINGERPRINT_ENABLED_KEY)) ??
          (await getStorage().getItem(LEGACY_BIOMETRIC_KEY));
        const pinVerified = await getStorage().getItem(PIN_VERIFIED_KEY);
        const enabled = stored === "true" && pinVerified === "true";

        if (isMounted) {
          setFingerprintEnabled(enabled);
        }

        if (enabled) {
          await triggerFingerprintUnlock();
        }
      } catch (err) {
        console.warn("Failed to load fingerprint preference:", err);
      }
    }

    void loadPreferenceAndAuthenticate();

    return () => {
      isMounted = false;
    };
  }, [triggerFingerprintUnlock]);

  // Handle returning to the app from background/inactive state
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (nextAppState: AppStateStatus) => {
        if (
          appStateRef.current.match(/inactive|background/) &&
          nextAppState === "active"
        ) {
          void (async () => {
            const stored =
              (await getStorage().getItem(FINGERPRINT_ENABLED_KEY)) ??
              (await getStorage().getItem(LEGACY_BIOMETRIC_KEY));
            const pinVerified = await getStorage().getItem(PIN_VERIFIED_KEY);
            if (stored === "true" && pinVerified === "true") {
              void triggerFingerprintUnlock();
            }
          })();
        }
        appStateRef.current = nextAppState;
      },
    );

    return () => {
      subscription.remove();
    };
  }, [triggerFingerprintUnlock]);

  const handleToggleFingerprint = async (value: boolean) => {
    setApiError(null);
    if (!value) {
      setFingerprintEnabled(false);
      await getStorage().setItem(FINGERPRINT_ENABLED_KEY, "false");
      await getStorage().setItem(PIN_VERIFIED_KEY, "false");
      return;
    }

    // Must enter 4-digit PIN first before enabling fingerprint
    if (pinValue.length !== 4) {
      Alert.alert(
        "Enter PIN First",
        "Please enter your 4-digit PIN first so it can be verified before enabling fingerprint unlock.",
      );
      setApiError("Please enter your 4-digit PIN above first.");
      setFingerprintEnabled(false);
      return;
    }

    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      const hasFingerprint = types.includes(
        LocalAuthentication.AuthenticationType.FINGERPRINT,
      );

      if (!hasHardware || !hasFingerprint) {
        Alert.alert(
          "Fingerprint Not Supported",
          "This device does not support fingerprint authentication.",
        );
        setFingerprintEnabled(false);
        return;
      }

      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        Alert.alert(
          "Fingerprint Not Enrolled",
          "No fingerprint found. Please register your fingerprint in device settings first.",
        );
        setFingerprintEnabled(false);
        return;
      }

      // Verify PIN initially with the API before linking fingerprint
      const verifyResult = await verifyPinMutation.mutateAsync({ pin: pinValue });
      if (!verifyResult.verified) {
        setApiError("Invalid PIN. Please try again.");
        setFingerprintEnabled(false);
        return;
      }

      // Prompt fingerprint authentication to confirm and link hardware
      const authResult = await LocalAuthentication.authenticateAsync({
        promptMessage: "Scan fingerprint to link with your PIN",
        cancelLabel: "Cancel",
        disableDeviceFallback: true,
      });

      if (authResult.success) {
        setFingerprintEnabled(true);
        await getStorage().setItem(FINGERPRINT_ENABLED_KEY, "true");
        await getStorage().setItem(PIN_VERIFIED_KEY, "true");
        // Seamlessly unlock into app
        router.replace("/(tabs)");
      } else {
        setFingerprintEnabled(false);
        await getStorage().setItem(FINGERPRINT_ENABLED_KEY, "false");
        await getStorage().setItem(PIN_VERIFIED_KEY, "false");
        Alert.alert(
          "Fingerprint Cancelled",
          "Fingerprint setup was cancelled. You can continue by verifying your PIN.",
        );
      }
    } catch (err) {
      console.warn("Error enabling fingerprint:", err);
      setFingerprintEnabled(false);
      setApiError(getErrorMessage(err, "Failed to verify PIN. Please try again."));
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

          {apiError && (
            <Text style={styles.errorText}>
              {apiError}
            </Text>
          )}

          <Pressable
            onPress={handleSubmit(onSubmit)}
            disabled={!isComplete || isSubmitting || verifyPinMutation.isPending}
            style={({ pressed }) => [
              styles.submitButton,
              pressed && styles.pressed,
              (!isComplete || isSubmitting || verifyPinMutation.isPending) && styles.disabledButton,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Verify PIN"
          >
            <Text style={styles.submitText}>
              {isSubmitting || verifyPinMutation.isPending ? "Verifying..." : "Verify & Continue"}
            </Text>
          </Pressable>


          {/* Enable Fingerprint Section at the bottom */}
          <View style={styles.biometricCard}>
            <Pressable
              style={styles.biometricInfo}
              onPress={() => {
                if (fingerprintEnabled) {
                  void triggerFingerprintUnlock();
                } else {
                  void handleToggleFingerprint(true);
                }
              }}
              accessibilityRole="button"
              accessibilityLabel={
                fingerprintEnabled
                  ? "Authenticate with fingerprint"
                  : "Enable fingerprint unlock"
              }
            >
              <View style={styles.biometricIconBadge}>
                <View style={styles.fpArc1}>
                  <View style={styles.fpArc2}>
                    <View style={styles.fpCore} />
                  </View>
                </View>
              </View>
              <View style={styles.biometricTextGroup}>
                <Text style={styles.biometricTitle}>Enable Fingerprint</Text>
                <Text style={styles.biometricSubtitle}>
                  {fingerprintEnabled
                    ? "Tap to unlock with fingerprint"
                    : pinValue.length === 4
                    ? "Verify PIN and enable fingerprint"
                    : "Enter 4-digit PIN first to enable"}
                </Text>
              </View>
            </Pressable>
            <Switch
              value={fingerprintEnabled}
              onValueChange={handleToggleFingerprint}
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
  errorText: {
    color: errorColor,
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
    marginTop: 4,
  },
});

