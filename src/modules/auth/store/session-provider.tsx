/**
 * The single React source of truth for authentication state.
 *
 * It is a thin projection of `src/lib/session.ts` — which owns the token — so
 * there is exactly one place where "am I signed in?" is answered. Route guards,
 * the HTTP client's `401` handler and any page that needs the session all read
 * from here.
 *
 * Authentication logic lives here rather than in pages, so no screen has to
 * re-implement a check.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

import { setUnauthorizedHandler } from "@/lib/http-client";
import { queryClient } from "@/lib/query-client";
import {
  endSession,
  getSessionState,
  hydrateSession,
  signInWithAccessToken,
  subscribeToSession,
  type SessionStatus,
} from "@/lib/session";

export interface SessionContextValue {
  /** `loading` until secure storage has been read; guards must wait for this. */
  status: SessionStatus;
  /** True only for a fully resolved, authenticated session. */
  isAuthenticated: boolean;
  accessToken: string | null;
  /** Stores a freshly issued access token and marks the session active. */
  signIn: (accessToken: string) => Promise<void>;
  /** Clears credentials and every cached, user-scoped query. */
  signOut: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState(getSessionState);

  useEffect(() => {
    const unsubscribe = subscribeToSession(setState);
    void hydrateSession();
    return unsubscribe;
  }, []);

  // Bridges the HTTP layer's `401` handling to the session without making
  // `lib/` depend on React. `endSession()` is single-flight, so a burst of
  // parallel failures results in one teardown and one guard re-evaluation.
  useEffect(() => {
    setUnauthorizedHandler(async () => {
      await endSession();
      queryClient.clear();
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  const signIn = useCallback((accessToken: string) => signInWithAccessToken(accessToken), []);

  const signOut = useCallback(async () => {
    await endSession();
    queryClient.clear();
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({
      status: state.status,
      isAuthenticated: state.status === "authenticated",
      accessToken: state.accessToken,
      signIn,
      signOut,
    }),
    [state, signIn, signOut],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used inside <SessionProvider>.");
  }
  return context;
}

export default SessionProvider;