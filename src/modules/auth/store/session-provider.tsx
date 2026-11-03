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
  status: SessionStatus;
  isAuthenticated: boolean;
  accessToken: string | null;
  signIn: (accessToken: string) => Promise<void>;
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

  // Sign out and clear the cache when the API returns 401.
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