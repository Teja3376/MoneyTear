import api from "@/lib/httpClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AuthState } from "../types";

export const useBootstrapAuth = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["bootstrapAuth"],
    mutationFn: async (): Promise<AuthState> => {
      const response = await api.post<AuthState>("/auth/bootstrap");
      return response.data;
    },
    onSuccess: (state) => {
      queryClient.setQueryData(["auth", "state"], state);
      queryClient.invalidateQueries({ queryKey: ["user", "me"] });
    },
  });
};

export default useBootstrapAuth;
