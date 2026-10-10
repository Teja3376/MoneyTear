import api from "@/lib/httpClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { endSession } from "@/lib/session";
import type { LogoutResult } from "../types";

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["logout"],
    mutationFn: async (): Promise<LogoutResult> => {
      const response = await api.post<LogoutResult>("/auth/logout");
      return response.data;
    },
    onSettled: async () => {
      await endSession();
      queryClient.clear();
    },
  });
};

export default useLogout;
