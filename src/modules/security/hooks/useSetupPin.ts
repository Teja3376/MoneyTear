import { api } from "@/lib/http-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { PinMutationResult, SetupPinRequest } from "../types";
import { authKeys } from "@/modules/auth/hooks/keys";
import { securityKeys } from "./keys";

export const useSetupPin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["setupPin"],
    mutationFn: async (payload: SetupPinRequest): Promise<PinMutationResult> => {
      const response = await api.post<PinMutationResult>("/security/pin/setup", payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: securityKeys.pinStatus() });
      queryClient.invalidateQueries({ queryKey: authKeys.state() });
    },
  });
};

export default useSetupPin;
