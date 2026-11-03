import { api } from "@/lib/http-client";
import { useQuery } from "@tanstack/react-query";
import type { PinStatus } from "../types";
import { securityKeys } from "./keys";

export default function usePinStatus(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: securityKeys.pinStatus(),
    queryFn: async (): Promise<PinStatus> => {
      const response = await api.get<PinStatus>("/security/pin/status");
      return response.data;
    },
    enabled: options?.enabled ?? true,
  });
}

export { usePinStatus };
