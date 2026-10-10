import api from "@/lib/httpClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { PinMutationResult } from "../types";

export const useResetPin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["resetPin"],
    mutationFn: async (): Promise<PinMutationResult> => {
      const response = await api.post<PinMutationResult>("/security/pin/reset");
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["security", "pinStatus"] });
      queryClient.invalidateQueries({ queryKey: ["auth", "state"] });
    },
  });
};

export default useResetPin;
