import api from "@/lib/httpClient";
import { useQuery } from "@tanstack/react-query";
import type { PinStatus } from "../types";

export default function usePinStatus(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["security", "pinStatus"],
    queryFn: async (): Promise<PinStatus> => {
      const response = await api.get<PinStatus>("/security/pin/status");
      return response.data;
    },
    enabled: options?.enabled ?? true,
  });
}

export { usePinStatus };
