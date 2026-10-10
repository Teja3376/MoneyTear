import api from "@/lib/httpClient";
import { useMutation } from "@tanstack/react-query";

export interface SendOtpPayload {
  phone: string;
}

export interface SendOtpResponse {
  success: boolean;
  message: string;
}


export const useSendOtp = () => {
  return useMutation({
    mutationKey: ["sendOtp"],
    mutationFn: async (payload: SendOtpPayload): Promise<SendOtpResponse> => {
      const response = await api.post<SendOtpResponse>("/auth/send-otp", payload);
      return response.data;
    },
  });
};

export default useSendOtp;
