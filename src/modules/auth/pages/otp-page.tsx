import React, { useEffect, useRef, useState } from "react";
import {
  Keyboard,
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import AuthScreenLayout from "@/modules/auth/components/auth-screen-layout";
import { theme, primary, primaryDisabled, error as errorColor } from "@/constants/theme";
import { useVerifyOtp } from "@/modules/auth/hooks/useVerifyOtp";
import { useSendOtp } from "@/modules/auth/hooks/useSendOtp";
import { getErrorMessage } from "@/lib/errors";

const OTP_LENGTH = 6;


const RESEND_SECONDS = 30;

function getMaskedMobile(rawMobile?: string): string {
  if (rawMobile && rawMobile.length >= 4) {
    const digits = rawMobile.replace(/\D/g, "");
    const last4 = digits.slice(-4);
    return `+91 •••••• ${last4}`;
  }
  return "+91 •••••• 3376";
}

export default function OtpPage() {
  const { mobile } = useLocalSearchParams<{ mobile?: string }>();
  const { height: screenHeight } = useWindowDimensions();
  const inputRef = useRef<TextInput>(null);

  const [otp, setOtp] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [isFocused, setIsFocused] = useState(true);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // Monitor keyboard visibility for smooth compacting of top header
  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setKeyboardVisible(true);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setKeyboardVisible(false);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Smooth auto-focus numeric keyboard upon entering screen
  useEffect(() => {
    const focusTimer = setTimeout(() => {
      inputRef.current?.focus();
    }, 200);

    return () => clearTimeout(focusTimer);
  }, []);

  // Resend countdown timer
  useEffect(() => {
    if (secondsLeft <= 0) return;

    const timer = setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft]);

  // Smooth blinking cursor indicator on active empty box
  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible((visible) => !visible);
    }, 530);

    return () => clearInterval(interval);
  }, []);

  const verifyOtpMutation = useVerifyOtp();
  const sendOtpMutation = useSendOtp();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleOtpChange = (value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, OTP_LENGTH);
    setOtp(cleaned);
    setErrorMessage(null);
  };

  const handleVerify = async () => {
    if (!mobile || otp.length !== OTP_LENGTH) return;
    setErrorMessage(null);
    try {
      const result = await verifyOtpMutation.mutateAsync({
        phone: mobile,
        otp,
      });
      if (!result.authState?.profileComplete) {
        router.replace("/(auth)/profile");
      } else if (!result.authState?.pinConfigured) {
        router.replace("/(auth)/set-pin");
      } else {
        router.replace("/(auth)/pin");
      }
    } catch (err) {
      setErrorMessage(getErrorMessage(err, "Invalid verification code. Please try again."));
    }
  };


  const handleResend = async () => {
    if (secondsLeft > 0 || !mobile) return;
    try {
      await sendOtpMutation.mutateAsync({ phone: mobile });
      setSecondsLeft(RESEND_SECONDS);
      setErrorMessage(null);
    } catch (err) {
      setErrorMessage(getErrorMessage(err, "Failed to resend code"));
    }
  };


  const formattedTime = `00:${String(secondsLeft).padStart(2, "0")}`;
  const isOtpComplete = otp.length === OTP_LENGTH;
  const maskedMobile = getMaskedMobile(mobile);

  return (
    <AuthScreenLayout
      keyboardVisible={keyboardVisible}
      panelHeight={screenHeight * 0.53}
      panelHeading="Enter verification code"
      topContent={
        <View
          style={[
            styles.headerContainer,
            keyboardVisible && styles.headerContainerCompact,
          ]}
        >
          <Text
            style={[
              styles.headerTitle,
              keyboardVisible && styles.headerTitleCompact,
            ]}
          >
            Verify your number
          </Text>
          <Text
            style={[
              styles.headerSubtitle,
              keyboardVisible && styles.headerSubtitleCompact,
            ]}
          >
            Enter the 6-digit verification code sent to
          </Text>
          <Text
            style={[
              styles.headerMobile,
              keyboardVisible && styles.headerMobileCompact,
            ]}
          >
            {maskedMobile}
          </Text>
        </View>
      }
    >


      {/* 6-digit OTP Box Row */}
      <View
        style={[
          styles.otpSection,
          keyboardVisible && styles.otpSectionCompact,
        ]}
      >
        <Pressable
          style={styles.otpRow}
          onPress={() => inputRef.current?.focus()}
          accessible={false}
        >
          {Array.from({ length: OTP_LENGTH }).map((_, index) => {
            const digit = otp[index] ?? "";
            const isCurrentActive =
              isFocused && index === Math.min(otp.length, OTP_LENGTH - 1);
            const isFilled = digit !== "";

            return (
              <View
                key={index}
                style={[
                  styles.otpBox,
                  isCurrentActive && styles.otpBoxActive,
                  isFilled && styles.otpBoxFilled,
                ]}
              >
                {digit !== "" ? (
                  <Text style={styles.otpDigit}>{digit}</Text>
                ) : isCurrentActive && cursorVisible ? (
                  <View style={styles.cursor} />
                ) : null}
              </View>
            );
          })}

          {/* Hidden TextInput handling keyboard input, autofill and paste */}
          <TextInput
            ref={inputRef}
            value={otp}
            onChangeText={handleOtpChange}
            onKeyPress={({ nativeEvent }) => {
              if (nativeEvent.key === "Backspace" && otp.length > 0) {
                setOtp((prev) => prev.slice(0, -1));
              }
            }}
            onFocus={() => {
              setIsFocused(true);
              setKeyboardVisible(true);
            }}
            onBlur={() => {
              setIsFocused(false);
              setKeyboardVisible(false);
            }}
            keyboardType="number-pad"
            maxLength={OTP_LENGTH}
            caretHidden
            contextMenuHidden={false}
            selectTextOnFocus={false}
            textContentType="oneTimeCode"
            autoComplete={
              Platform.OS === "android" ? "sms-otp" : "one-time-code"
            }
            importantForAutofill="yes"
            accessibilityLabel="6-digit verification code"
            returnKeyType="done"
            onSubmitEditing={() => {
              if (otp.length === OTP_LENGTH) {
                void handleVerify();
              }
            }}
            style={styles.hiddenInput}
          />
        </Pressable>
      </View>

      {errorMessage && (
        <Text style={styles.errorText}>{errorMessage}</Text>
      )}

      {/* Minimal Resend Section */}
      <View
        style={[
          styles.resendSection,
          keyboardVisible && styles.resendSectionCompact,
        ]}
      >
        <Text style={styles.resendPrompt}>Didn&apos;t receive the code?</Text>
        {secondsLeft > 0 ? (
          <Text style={styles.resendTimer}>
            Resend code in{" "}
            <Text style={styles.resendTimerHighlight}>{formattedTime}</Text>
          </Text>
        ) : (
          <Pressable
            onPress={handleResend}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Resend code"
            disabled={sendOtpMutation.isPending}
          >
            <Text style={styles.resendAction}>
              {sendOtpMutation.isPending ? "Sending..." : "Resend code"}
            </Text>
          </Pressable>
        )}
      </View>

      {/* Verify & Continue Button */}
      <Pressable
        onPress={() => void handleVerify()}
        disabled={!isOtpComplete || verifyOtpMutation.isPending}
        style={({ pressed }) => [
          styles.verifyButton,
          keyboardVisible && styles.verifyButtonCompact,
          pressed && styles.buttonPressed,
          (!isOtpComplete || verifyOtpMutation.isPending) && styles.verifyButtonDisabled,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Verify and continue"
      >
        <Text style={styles.verifyButtonText}>
          {verifyOtpMutation.isPending ? "Verifying..." : "Verify & Continue"}
        </Text>
      </Pressable>

    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  // Minimal Top Section Header
  headerContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerContainerCompact: {
    paddingVertical: 4,
  },
  headerTitle: {
    color: theme.text,
    fontSize: 24,
    fontFamily: "Poppins_600SemiBold",
    textAlign: "center",
    marginBottom: 6,
  },
  headerTitleCompact: {
    fontSize: 18,
    marginBottom: 2,
  },
  headerSubtitle: {
    color: theme.textSecondary,
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
  headerSubtitleCompact: {
    fontSize: 12,
    lineHeight: 16,
  },
  headerMobile: {
    color: theme.text,
    fontSize: 15,
    fontFamily: "Poppins_600SemiBold",
    textAlign: "center",
    marginTop: 6,
    letterSpacing: 0.5,
  },
  headerMobileCompact: {
    fontSize: 13,
    marginTop: 2,
  },

  // OTP 6-box row
  otpSection: {
    marginTop: 18,
    marginBottom: 24,
  },
  otpSectionCompact: {
    marginTop: 10,
    marginBottom: 16,
  },
  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    width: "100%",
    position: "relative",
  },
  otpBox: {
    flex: 1,
    height: 54,
    borderRadius: 14,
    backgroundColor: theme.background,
    borderWidth: 1.5,
    borderColor: theme.border,
    alignItems: "center",
    justifyContent: "center",
  },
  otpBoxActive: {
    borderColor: primary,
    borderWidth: 1.5,
    backgroundColor: "#0D518C1F",
  },
  otpBoxFilled: {
    borderColor: primary,
    backgroundColor: theme.background,
  },
  otpDigit: {
    color: theme.text,
    fontSize: 22,
    fontFamily: "Poppins_600SemiBold",
  },
  cursor: {
    width: 2,
    height: 22,
    borderRadius: 1,
    backgroundColor: primary,
  },
  hiddenInput: {
    ...StyleSheet.absoluteFill,
    opacity: 1,
    color: "transparent",
    backgroundColor: "transparent",
    fontSize: 1,
  },

  // Resend Section
  resendSection: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 26,
    gap: 6,
  },
  resendSectionCompact: {
    marginBottom: 16,
    gap: 4,
  },
  resendPrompt: {
    color: theme.textSecondary,
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
  },
  resendTimer: {
    color: theme.textSecondary,
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
  },
  resendTimerHighlight: {
    color: primary,
    fontFamily: "Poppins_500Medium",
  },
  resendAction: {
    color: primary,
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
  },

  // Verify Button
  verifyButton: {
    minHeight: 56,
    backgroundColor: primary,
    borderRadius: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  verifyButtonCompact: {
    minHeight: 50,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  verifyButtonDisabled: {
    backgroundColor: primaryDisabled,
  },
  verifyButtonText: {
    color: theme.text,
    fontSize: 15,
    fontFamily: "Poppins_600SemiBold",
  },
  errorText: {
    color: errorColor,
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
    marginBottom: 12,
  },
});


