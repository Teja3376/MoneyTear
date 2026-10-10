
import { useEffect, useMemo, useRef, useState } from "react";
import { router } from "expo-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import {
    Animated,
    Keyboard,
    PanResponder,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    LayoutAnimation,
    TextInput,
    View,
    useWindowDimensions,
} from "react-native";

import AuthScreenLayout, {
    useAuthFonts,
    theme,
} from "@/modules/auth/components/auth-screen-layout";
import { mobileSchema, type MobileForm } from "@/modules/auth/schemas";
import { primaryDisabled } from "@/constants/theme";
import { useSendOtp } from "@/modules/auth/hooks/useSendOtp";
import { getErrorMessage } from "@/lib/errors";

export default function LoginPage() {
    const { height: screenHeight } = useWindowDimensions();
    const [keyboardVisible, setKeyboardVisible] = useState(false);

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

    const [fontsLoaded] = useAuthFonts();

    const tagline1 = useRef(new Animated.Value(0)).current;
    const tagline2 = useRef(new Animated.Value(0)).current;
    const tagline3 = useRef(new Animated.Value(0)).current;

    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const loginBtnAnim = useRef(new Animated.Value(0)).current;

    const panelY = useRef(new Animated.Value(screenHeight)).current;
    const panelOpacity = useRef(new Animated.Value(0)).current;

    const brandCenterOffset = (screenHeight * 0.58) / 2;
    const brandTranslateY = useMemo(
        () =>
            panelY.interpolate({
                inputRange: [0, screenHeight],
                outputRange: [0, brandCenterOffset],
                extrapolate: "clamp",
            }),
        [panelY, screenHeight, brandCenterOffset]
    );

    const screenHeightRef = useRef(screenHeight);
    useEffect(() => {
        screenHeightRef.current = screenHeight;
    }, [screenHeight]);

    const closePanelRef = useRef<() => void>(() => { });
    const openPanelRef = useRef<() => void>(() => { });

    const closePanel = () => {
        Keyboard.dismiss();
        Animated.parallel([
            Animated.timing(panelY, {
                toValue: screenHeightRef.current,
                duration: 280,
                useNativeDriver: true,
            }),
            Animated.timing(panelOpacity, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }),
            Animated.timing(loginBtnAnim, {
                toValue: 1,
                duration: 280,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setIsPanelOpen(false);
        });
    };

    const openPanel = () => {
        setIsPanelOpen(true);
        Animated.parallel([
            Animated.spring(panelY, {
                toValue: 0,
                damping: 26,
                stiffness: 90,
                mass: 1,
                useNativeDriver: true,
            }),
            Animated.timing(panelOpacity, {
                toValue: 1,
                duration: 350,
                useNativeDriver: true,
            }),
            Animated.timing(loginBtnAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start();
    };

    closePanelRef.current = closePanel;
    openPanelRef.current = openPanel;

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gestureState) => {
                return Math.abs(gestureState.dy) > 4;
            },
            onPanResponderGrant: () => {
                Keyboard.dismiss();
                panelY.stopAnimation();
            },
            onPanResponderMove: (_, gestureState) => {
                if (gestureState.dy > 0) {
                    panelY.setValue(gestureState.dy);
                } else {
                    panelY.setValue(gestureState.dy * 0.15);
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dy > 80 || gestureState.vy > 0.5) {
                    closePanelRef.current();
                } else {
                    openPanelRef.current();
                }
            },
        })
    ).current;

    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<MobileForm>({
        resolver: zodResolver(mobileSchema),
        defaultValues: { mobile: "" },
    });

    useEffect(() => {
        if (!fontsLoaded) return;

        let openTimer: ReturnType<typeof setTimeout> | null = null;
        const timer = setTimeout(() => {
            Animated.stagger(400, [tagline1, tagline2, tagline3].map((value) =>
                Animated.timing(value, {
                    toValue: 1,
                    duration: 450,
                    useNativeDriver: true,
                })
            )).start(({ finished }) => {
                if (!finished) return;

                openTimer = setTimeout(() => {
                    Animated.parallel([
                        Animated.spring(panelY, {
                            toValue: 0,
                            damping: 26,
                            stiffness: 90,
                            mass: 1,
                            useNativeDriver: true,
                        }),
                        Animated.timing(panelOpacity, {
                            toValue: 1,
                            duration: 350,
                            useNativeDriver: true,
                        }),
                    ]).start(({ finished: panelFinished }) => {
                        if (panelFinished) {
                            setIsPanelOpen(true);
                        }
                    });
                }, 350);
            });
        }, 3050);

        return () => {
            clearTimeout(timer);
            if (openTimer) clearTimeout(openTimer);
        };
    }, [fontsLoaded, tagline1, tagline2, tagline3, panelY, panelOpacity]);

    const sendOtpMutation = useSendOtp();
    const [apiError, setApiError] = useState<string | null>(null);

    const onSubmit = async (values: MobileForm) => {
        setApiError(null);
        try {
            await sendOtpMutation.mutateAsync({ phone: values.mobile });
            router.push({
                pathname: "/(auth)/otp",
                params: { mobile: values.mobile },
            });
        } catch (err) {
            setApiError(getErrorMessage(err));
        }

    };


    return (
        <AuthScreenLayout
            keyboardVisible={keyboardVisible}
            panelHeight={screenHeight * 0.58}
            panelAnimY={panelY}
            panelOpacity={panelOpacity}
            panHandlers={panResponder.panHandlers}
            panelHeading="Let's get started"
            panelDescription="Enter your mobile number to continue."
            floatingAction={
                <Animated.View
                    style={[
                        styles.loginTriggerContainer,
                        {
                            opacity: loginBtnAnim,
                            transform: [
                                {
                                    translateY: loginBtnAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [24, 0],
                                    }),
                                },
                            ],
                        },
                    ]}
                    pointerEvents={isPanelOpen ? "none" : "auto"}
                >
                    <Pressable
                        onPress={() => openPanelRef.current()}
                        style={({ pressed }) => [
                            styles.loginTriggerButton,
                            pressed && styles.buttonPressed,
                        ]}
                        accessibilityRole="button"
                        accessibilityLabel="Log in"
                    >
                        <Text style={styles.loginTriggerText}>Log In</Text>
                    </Pressable>
                </Animated.View>
            }
            topContent={
                <Animated.View
                    pointerEvents="box-none"
                    style={[
                        styles.brandSection,
                        keyboardVisible && styles.brandSectionCompact,
                        {
                            transform: [{ translateY: brandTranslateY }],
                        },
                    ]}
                >
                    <Animated.Text
                        style={[
                            styles.heroTagline,
                            keyboardVisible && styles.heroTaglineCompact,
                            { opacity: tagline1 },
                        ]}
                    >
                        Every payment.
                    </Animated.Text>

                    <Animated.Text
                        style={[
                            styles.heroTagline,
                            keyboardVisible && styles.heroTaglineCompact,
                            { opacity: tagline2 },
                        ]}
                    >
                        Every rupee.
                    </Animated.Text>

                    <Animated.Text
                        style={[
                            styles.heroTagline,
                            styles.heroTaglineAccent,
                            keyboardVisible && styles.heroTaglineCompact,
                            { opacity: tagline3 },
                        ]}
                    >
                        Always in control.
                    </Animated.Text>
                </Animated.View>
            }
        >
            <Text style={styles.label}>Mobile number</Text>

            <View
                style={[
                    styles.inputContainer,
                    errors.mobile && styles.inputError,
                ]}
            >
                <Text style={styles.countryCode}>+91</Text>
                <View style={styles.divider} />

                <Controller
                    control={control}
                    name="mobile"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            style={styles.input}
                            value={value}
                            onChangeText={(text) =>
                                onChange(text.replace(/\D/g, "").slice(0, 10))
                            }
                            onBlur={onBlur}
                            placeholder="Enter mobile number"
                            placeholderTextColor={theme.textSecondary}
                            keyboardType="number-pad"
                            maxLength={10}
                            autoComplete="tel-national"
                            accessibilityLabel="Mobile number"
                        />
                    )}
                />
            </View>

            {errors.mobile && (
                <Text style={styles.errorText}>
                    {errors.mobile.message}
                </Text>
            )}

            {apiError && (
                <Text style={styles.errorText}>
                    {apiError}
                </Text>
            )}

            <Pressable
                onPress={handleSubmit(onSubmit)}
                disabled={isSubmitting || sendOtpMutation.isPending}
                style={({ pressed }) => [
                    styles.button,
                    pressed && styles.buttonPressed,
                    (isSubmitting || sendOtpMutation.isPending) && styles.buttonDisabled,
                ]}
            >
                <Text style={styles.buttonText}>
                    {isSubmitting || sendOtpMutation.isPending ? "Please wait..." : "Continue"}
                </Text>
            </Pressable>


            <Text style={styles.terms}>
                By continuing, you agree to our{" "}
                <Text style={styles.termsHighlight}>
                    Terms of Service
                </Text>{" "}
                and{" "}
                <Text style={styles.termsHighlight}>
                    Privacy Policy
                </Text>
                .
            </Text>
        </AuthScreenLayout>
    );
}

const styles = StyleSheet.create({
    flex: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
        backgroundColor: theme.background,
    },
    loading: {
        flex: 1,
        backgroundColor: theme.background,
        alignItems: "center",
        justifyContent: "center",
    },
    screen: {
        flex: 1,
        backgroundColor: theme.background,
        overflow: "hidden",
    },
    brandSection: {
        flex: 1,
        minHeight: 180,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
        paddingVertical: 12,
        gap: 12,
    },
    // Compact container when keyboard opens
    brandSectionCompact: {
        flex: 0,
        minHeight: 0,
        paddingVertical: 6,
        gap: 2,
    },
    heroTagline: {
        color: theme.text,
        fontSize: 25,
        lineHeight: 36,
        fontFamily: "Poppins_600SemiBold",
        textAlign: "center",
        includeFontPadding: false,
    },
    // Smaller font size & line height when keyboard opens
    heroTaglineCompact: {
        fontSize: 15,
        lineHeight: 20,
    },

    heroTaglineAccent: {
        color: "#3C9FFE",
    },
    formPanel: {
        width: "100%",
        backgroundColor: theme.backgroundElement,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 26,
        paddingTop: 12,
        overflow: "hidden",
    },
    formScroll: {
        flex: 1,
    },
    formContent: {
        flexGrow: 1,
        paddingBottom: 24,
    },
    dragZone: {
        paddingTop: 4,
        paddingBottom: 4,
    },
    panelHandle: {
        width: 44,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: "#3A3A3C",
        alignSelf: "center",
        marginBottom: 16,
    },
    heading: {
        color: theme.text,
        fontSize: 25,
        fontFamily: "Poppins_600SemiBold",
    },
    description: {
        color: theme.textSecondary,
        fontSize: 13,
        fontFamily: "Poppins_400Regular",
        marginTop: 6,
        marginBottom: 14,
    },
    loginTriggerContainer: {
        position: "absolute",
        bottom: Platform.OS === "ios" ? 40 : 28,
        left: 24,
        right: 24,
        alignItems: "center",
    },
    loginTriggerButton: {
        width: "40%",
        minHeight: 45,
        backgroundColor: theme.primary,
        borderRadius: 50,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: theme.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 8,
    },
    loginTriggerText: {
        color: theme.text,
        fontSize: 16,
        fontFamily: "Poppins_600SemiBold",
    },
    loginTriggerArrow: {
        color: theme.text,
        fontSize: 22,
        marginLeft: 8,
    },
    label: {
        color: theme.text,
        fontSize: 13,
        fontFamily: "Poppins_500Medium",
        marginBottom: 10,
    },
    inputContainer: {
        minHeight: 58,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: theme.background,
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: 13,
        paddingHorizontal: 15,
    },
    countryCode: {
        color: theme.text,
        fontSize: 14,
        fontFamily: "Poppins_500Medium",
    },
    divider: {
        width: 1,
        height: 23,
        backgroundColor: theme.border,
        marginHorizontal: 13,
    },
    input: {
        flex: 1,
        color: theme.text,
        fontSize: 14,
        fontFamily: "Poppins_400Regular",
        paddingVertical: 15,
    },
    inputError: {
        borderColor: theme.error,
    },
    errorText: {
        color: theme.error,
        fontSize: 11,
        fontFamily: "Poppins_400Regular",
        marginTop: 7,
    },
    button: {
        minHeight: 56,
        backgroundColor: theme.primary,
        borderRadius: 50,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 24,
    },
    buttonPressed: {
        opacity: 0.8,
    },
    buttonDisabled: {
        backgroundColor: primaryDisabled,
    },
    buttonText: {
        color: theme.text,
        fontSize: 15,
        fontFamily: "Poppins_600SemiBold",
    },
    arrow: {
        color: theme.text,
        fontSize: 23,
        marginLeft: 10,
    },
    terms: {
        color: theme.textSecondary,
        fontSize: 10,
        fontFamily: "Poppins_400Regular",
        textAlign: "center",
        lineHeight: 18,
        marginTop: 20,
    },
    termsHighlight: {
        color: theme.text,
        fontFamily: "Poppins_500Medium",
    },
    footer: {
        marginTop: 24,
        paddingTop: 12,
        alignItems: "center",
    },
    footerLine: {
        width: 38,
        height: 3,
        borderRadius: 2,
        backgroundColor: theme.primary,
        marginBottom: 13,
    },
    footerText: {
        color: theme.textSecondary,
        fontSize: 9,
        letterSpacing: 1.5,
        fontFamily: "Poppins_500Medium",
    },
});
