import { Redirect } from "expo-router";

import { useSession } from "@/modules/auth/store/session-provider";
import { usePinStatus } from "@/modules/security/hooks/usePinStatus";

/**
 * Anchor route.
 *
 * Sends a signed-in user with a configured PIN to the PIN / biometric unlock screen,
 * users without a PIN to set-pin, and unauthenticated users to login.
 */
export default function Index() {
  const { status, isAuthenticated } = useSession();
  const { data: pinStatus, isLoading: isPinLoading } = usePinStatus({
    enabled: isAuthenticated,
  });

  if (status === "loading" || (isAuthenticated && isPinLoading)) {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  if (pinStatus && !pinStatus.configured) {
    return <Redirect href="/(auth)/set-pin" />;
  }

  return <Redirect href="/(auth)/pin" />;
}