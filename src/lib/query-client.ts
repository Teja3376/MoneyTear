/**
 * The application's single `QueryClient`.
 *
 * Exported as a module singleton rather than created inside a component so a
 * re-render can never swap the cache out from under mounted hooks. The
 * `QueryClientProvider` is mounted exactly once, in the root layout.
 */
import { QueryClient } from "@tanstack/react-query";

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Mobile round trips are slow; refetching on every focus wastes data and
        // produces visible flicker. 30s keeps lists fresh without being noisy.
        staleTime: 30_000,
        // One retry covers a transient blip. `retry` is deliberately not applied
        // to mutations: they are writes and are not assumed to be idempotent.
        retry: 1,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

/** The one client used by the running app. */
export const queryClient = createQueryClient();