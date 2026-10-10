import api from "@/lib/httpClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { PinMutationResult, SetupPinRequest } from "../types";

export const useSetupPin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["setupPin"],
    mutationFn: async (payload: SetupPinRequest): Promise<PinMutationResult> => {
      const response = await api.post<PinMutationResult>("/security/pin/setup", payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["security", "pinStatus"] });
      queryClient.invalidateQueries({ queryKey: ["auth", "state"] });
    },
  });
};

export default useSetupPin;
