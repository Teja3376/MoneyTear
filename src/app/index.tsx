import { Redirect } from "expo-router";

import { useSession } from "@/modules/auth/store/session-provider";
import { usePinStatus } from "@/modules/security/hooks/usePinStatus";

// Send the user to login, set-pin or the PIN unlock screen.
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