import { api } from "@/lib/http-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authKeys } from "@/modules/auth/hooks/keys";
import type { UpdateProfileRequest, UserProfile } from "../types";
import { userKeys } from "./keys";

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["updateProfile"],
    mutationFn: async (payload: UpdateProfileRequest): Promise<UserProfile> => {
      const response = await api.patch<UserProfile>("/users/me", payload);
      return response.data;
    },
    onSuccess: (profile) => {
      queryClient.setQueryData(userKeys.me(), profile);
      queryClient.invalidateQueries({ queryKey: authKeys.state() });
    },
  });
};

export default useUpdateProfile;
