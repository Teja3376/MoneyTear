import api from "@/lib/httpClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UserProfile } from "./useGetme";

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  dateOfBirth?: string;
}

export type UpdateProfileRequest = UpdateProfilePayload;

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["updateProfile"],
    mutationFn: async (payload: UpdateProfilePayload): Promise<UserProfile> => {
      const response = await api.patch<UserProfile>("/users/me", payload);
      return response.data;
    },
    onSuccess: (profile) => {
      queryClient.setQueryData(["user", "me"], profile);
      queryClient.invalidateQueries({ queryKey: ["auth", "state"] });
    },
  });
};

export default useUpdateProfile;
