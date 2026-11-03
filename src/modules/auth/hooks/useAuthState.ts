import { api } from "@/lib/http-client";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "../store/session-provider";
import type { AuthState } from "../types";
import { authKeys } from "./keys";

export default function useAuthState(options?: { enabled?: boolean }) {
  const { isAuthenticated } = useSession();

  return useQuery({
    queryKey: authKeys.state(),
    queryFn: async (): Promise<AuthState> => {
      const response = await api.get<AuthState>("/auth/me");
      return response.data;
    },
    enabled: isAuthenticated && (options?.enabled ?? true),
  });
}

export { useAuthState };
