import api from "@/lib/httpClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ChangePinRequest, PinMutationResult } from "../types";

export const useChangePin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["changePin"],
    mutationFn: async (payload: ChangePinRequest): Promise<PinMutationResult> => {
      const response = await api.post<PinMutationResult>("/security/pin/change", payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["security", "pinStatus"] });
      queryClient.invalidateQueries({ queryKey: ["auth", "state"] });
    },
  });
};

export default useChangePin;
