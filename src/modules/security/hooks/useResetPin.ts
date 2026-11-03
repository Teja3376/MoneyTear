import { api } from "@/lib/http-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { PinMutationResult } from "../types";
import { authKeys } from "@/modules/auth/hooks/keys";
import { securityKeys } from "./keys";

export const useResetPin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["resetPin"],
    mutationFn: async (): Promise<PinMutationResult> => {
      const response = await api.post<PinMutationResult>("/security/pin/reset");
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: securityKeys.pinStatus() });
      queryClient.invalidateQueries({ queryKey: authKeys.state() });
    },
  });
};

export default useResetPin;
