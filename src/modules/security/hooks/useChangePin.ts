import { api } from "@/lib/http-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ChangePinRequest, PinMutationResult } from "../types";
import { authKeys } from "@/modules/auth/hooks/keys";
import { securityKeys } from "./keys";

export const useChangePin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["changePin"],
    mutationFn: async (payload: ChangePinRequest): Promise<PinMutationResult> => {
      const response = await api.post<PinMutationResult>("/security/pin/change", payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: securityKeys.pinStatus() });
      queryClient.invalidateQueries({ queryKey: authKeys.state() });
    },
  });
};

export default useChangePin;
