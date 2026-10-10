/**
 * Mounts the application's single `QueryClient`.
 *
 * Placed inside `SessionProvider` in the root layout so that session teardown
 * can clear the cache, and so no screen ever has to create its own provider.
 */
import { QueryClientProvider } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";

import { queryClient } from "@/lib/query-client";

export function QueryProvider({ children }: PropsWithChildren) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

export default QueryProvider;