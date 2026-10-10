import api from "@/lib/httpClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "../store/session-provider";
import type { AuthState } from "../types";

export interface VerifyOtpPayload {
  phone: string;
  otp: string;
}

export interface VerifyOtpResponse {
  accessToken: string;
  authState: AuthState;
}

export const useVerifyOtp = () => {
  const { signIn } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["verifyOtp"],
    mutationFn: async (payload: VerifyOtpPayload): Promise<VerifyOtpResponse> => {
      const response = await api.post<VerifyOtpResponse>("/auth/verify-otp", payload);
      await signIn(response.data.accessToken);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["auth", "state"], data.authState);
      queryClient.invalidateQueries({ queryKey: ["user", "me"] });
    },
  });
};

export default useVerifyOtp;
