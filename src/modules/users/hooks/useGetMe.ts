import { api } from "@/lib/http-client";
import { useQuery } from "@tanstack/react-query";
import type { UserProfile } from "../types";
import { userKeys } from "./keys";

export default function useGetMe(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: userKeys.me(),
    queryFn: async (): Promise<UserProfile> => {
      const response = await api.get<UserProfile>("/users/me");
      return response.data;
    },
    enabled: options?.enabled ?? true,
    staleTime: 5 * 60 * 1000,
  });
}

export { useGetMe };
