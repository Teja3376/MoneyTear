import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import {
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  background,
  backgroundElement,
  border,
  error,
  primary,
  text,
  textSecondary,
} from "@/constants/theme";
import { useAuthFonts } from "@/modules/auth/components/auth-screen-layout";
import { profileSchema, type ProfileForm } from "@/modules/auth/schemas";
import {
  CalendarIcon,
  DatePickerSheet,
  formatDate,
  formatDateYMD,
} from "@/components/date-picker-sheet";
import { router } from "expo-router";
import { useUpdateProfile } from "@/modules/users/hooks/useUpdateProfile";
import { getErrorMessage } from "@/lib/errors";


export default function ProfilePage() {
  const [fontsLoaded] = useAuthFonts();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const updateProfileMutation = useUpdateProfile();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      dateOfBirth: null,
    },
  });
  const dob = useWatch({ control, name: "dateOfBirth" });

  const onSubmit = async (values: ProfileForm) => {
    setApiError(null);
    try {
      await updateProfileMutation.mutateAsync({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email || undefined,
        dateOfBirth: values.dateOfBirth ? formatDateYMD(values.dateOfBirth) : undefined,
      });
      setSubmitted(true);
      router.replace("/(auth)/set-pin");
    } catch (err) {
      setApiError(getErrorMessage(err, "Failed to update profile. Please try again."));
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
          <Text style={styles.title}>Let&apos;s get to know you</Text>
          <Text style={styles.subtitle}>
            Add a few details to set up your profile.
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.nameRow}>
            <Controller
              control={control}
              name="firstName"
              render={({ field, fieldState }) => (
                <View style={styles.halfField}>
                  <Text style={styles.label}>First name</Text>
                  <TextInput
                    value={field.value}
                    onBlur={field.onBlur}
                    onChangeText={(value) => {
                      field.onChange(value);
                      setSubmitted(false);
                    }}
                    placeholder="e.g. Alex"
                    placeholderTextColor={textSecondary}
                    autoCapitalize="words"
                    returnKeyType="next"
                    style={styles.input}
                  />
                  {fieldState.error && (
                    <Text style={styles.errorText}>
                      {fieldState.error.message}
                    </Text>
                  )}
                </View>
              )}
            />
            <Controller
              control={control}
              name="lastName"
              render={({ field, fieldState }) => (
                <View style={styles.halfField}>
                  <Text style={styles.label}>Last name</Text>
                  <TextInput
                    value={field.value}
                    onBlur={field.onBlur}
                    onChangeText={(value) => {
                      field.onChange(value);
                      setSubmitted(false);
                    }}
                    placeholder="e.g. Morgan"
                    placeholderTextColor={textSecondary}
                    autoCapitalize="words"
                    returnKeyType="next"
                    style={styles.input}
                  />
                  {fieldState.error && (
                    <Text style={styles.errorText}>
                      {fieldState.error.message}
                    </Text>
                  )}
                </View>
              )}
            />
          </View>

          <Controller
            control={control}
            name="email"
            render={({ field, fieldState }) => (
              <View style={styles.field}>
                <Text style={styles.label}>Email address</Text>
                <TextInput
                  value={field.value}
                  onBlur={field.onBlur}
                  onChangeText={(value) => {
                    field.onChange(value);
                    setSubmitted(false);
                  }}
                  placeholder="you@example.com"
                  placeholderTextColor={textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  style={styles.input}
                />
                {fieldState.error && (
                  <Text style={styles.errorText}>
                    {fieldState.error.message}
                  </Text>
                )}
              </View>
            )}
          />

          <Controller
            control={control}
            name="dateOfBirth"
            render={({ field, fieldState }) => (
              <View style={styles.field}>
                <Text style={styles.label}>Date of birth</Text>
                <Pressable
                  onPress={() => {
                    Keyboard.dismiss();
                    setPickerOpen(true);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Choose date of birth"
                  style={({ pressed }) => [
                    styles.dateInput,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.dateText,
                      !field.value && styles.placeholder,
                    ]}
                  >
                    {field.value
                      ? formatDate(field.value)
                      : "Select your date of birth"}
                  </Text>
                  <CalendarIcon color={primary} />
                </Pressable>
                {fieldState.error && (
                  <Text style={styles.errorText}>
                    {fieldState.error.message}
                  </Text>
                )}

              </View>
            )}
          />

          {submitted && (
            <Text style={styles.successText}>
              Your profile details are ready.
            </Text>
          )}

          {apiError && (
            <Text style={styles.errorText}>
              {apiError}
            </Text>
          )}

          <Pressable
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting || updateProfileMutation.isPending}
            style={({ pressed }) => [
              styles.submitButton,
              pressed && styles.pressed,
              (isSubmitting || updateProfileMutation.isPending) && styles.disabledButton,
            ]}
            accessibilityRole="button"
          >
            <Text style={styles.submitText}>
              {isSubmitting || updateProfileMutation.isPending ? "Submitting..." : "Submit"}
            </Text>
          </Pressable>

          <Text style={styles.privacyNote}>
            Your details help us personalize your MoneyTear experience.
          </Text>
        </View>
      </ScrollView>

      <DatePickerSheet
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        value={dob}
        onSelect={(date) => {
          setValue("dateOfBirth", date, { shouldDirty: true, shouldValidate: true });
          setSubmitted(false);
        }}
        title="Date of birth"
        maxDate={new Date()}
      />
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
  header: { marginBottom: 24 },
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
  nameRow: { flexDirection: "row", gap: 12 },
  halfField: { flex: 1, gap: 8 },
  field: { gap: 8 },
  label: { color: text, fontSize: 13, fontFamily: "Poppins_500Medium" },
  input: {
    minHeight: 54,
    borderWidth: 1,
    borderColor: border,
    borderRadius: 14,
    backgroundColor: backgroundElement,
    paddingHorizontal: 15,
    color: text,
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
  },
  dateInput: {
    minHeight: 54,
    borderWidth: 1,
    borderColor: border,
    borderRadius: 14,
    backgroundColor: backgroundElement,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateText: { color: text, fontSize: 14, fontFamily: "Poppins_400Regular" },
  placeholder: { color: textSecondary },
  errorText: {
    color: error,
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    marginTop: -4,
  },
  successText: {
    color: "#7ED6A7",
    fontSize: 12,
    fontFamily: "Poppins_500Medium",
    marginTop: -4,
  },
  submitButton: {
    minHeight: 56,
    marginTop: 4,
    backgroundColor: primary,
    borderRadius: 30,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 9,
  },
  submitText: {
    color: text,
    fontSize: 15,
    fontFamily: "Poppins_600SemiBold",
  },
  submitArrow: { color: text, fontSize: 19 },
  privacyNote: {
    color: textSecondary,
    textAlign: "center",
    fontSize: 11,
    lineHeight: 18,
    fontFamily: "Poppins_400Regular",
    marginTop: -8,
  },
  pressed: { opacity: 0.78 },
  disabledButton: { opacity: 0.65 },
});
