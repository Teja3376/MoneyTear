import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="otp" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="set-pin" />
      <Stack.Screen name="pin" />
      <Stack.Screen name="verify-pin" />
      <Stack.Screen name="reset-pin" />
    </Stack>
  );
}
