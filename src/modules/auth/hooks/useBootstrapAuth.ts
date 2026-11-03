import { api } from "@/lib/http-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AuthState } from "../types";
import { authKeys } from "./keys";
import { userKeys } from "@/modules/users/hooks/keys";

export const useBootstrapAuth = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["bootstrapAuth"],
    mutationFn: async (): Promise<AuthState> => {
      const response = await api.post<AuthState>("/auth/bootstrap");
      return response.data;
    },
    onSuccess: (state) => {
      queryClient.setQueryData(authKeys.state(), state);
      queryClient.invalidateQueries({ queryKey: userKeys.me() });
    },
  });
};

export default useBootstrapAuth;
