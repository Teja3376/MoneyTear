import api from "@/lib/httpClient";
import { useQuery } from "@tanstack/react-query";
import type { AccountStatus } from "@/modules/auth/types";

export interface UserProfile {
  id: string;
  phone: string | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  dateOfBirth: string | null;
  role: string;
  status: AccountStatus;
  onboardingCompletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function useGetme(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["user", "me"],
    queryFn: async (): Promise<UserProfile> => {
      const response = await api.get<UserProfile>("/users/me");
      return response.data;
    },
    enabled: options?.enabled ?? true,
    staleTime: 5 * 60 * 1000,
  });
}

export const useGetMe = useGetme;
export const useMyProfile = useGetme;
