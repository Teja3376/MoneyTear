import api from "@/lib/httpClient";
import { useMutation } from "@tanstack/react-query";
import type { PinVerified, VerifyPinRequest } from "../types";

export const useVerifyPin = () => {
  return useMutation({
    mutationKey: ["verifyPin"],
    mutationFn: async (payload: VerifyPinRequest): Promise<PinVerified> => {
      const response = await api.post<PinVerified>("/security/pin/verify", payload);
      return response.data;
    },
  });
};

export default useVerifyPin;
