// Session store. Token kept in memory too, because axios interceptors can't await storage.
import { getStorage } from "./storage";

const ACCESS_TOKEN_KEY = "moneytear.access-token";

export type SessionStatus = "loading" | "authenticated" | "unauthenticated";

export interface SessionState {
  status: SessionStatus;
  accessToken: string | null;
}

let state: SessionState = { status: "loading", accessToken: null };
let hydration: Promise<SessionState> | null = null;
let teardown: Promise<void> | null = null;

const listeners = new Set<(next: SessionState) => void>();

function commit(next: SessionState): SessionState {
  state = next;
  for (const listener of listeners) listener(next);
  return next;
}

export function getSessionState(): SessionState {
  return state;
}

export function getAccessToken(): string | null {
  return state.accessToken;
}

export function subscribeToSession(listener: (next: SessionState) => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// Read the saved token once; parallel callers share the same promise.
export function hydrateSession(): Promise<SessionState> {
  hydration ??= (async () => {
    const token = await getStorage().getItem(ACCESS_TOKEN_KEY);
    return commit({ status: token ? "authenticated" : "unauthenticated", accessToken: token });
  })().catch(() => commit({ status: "unauthenticated", accessToken: null }));
  return hydration;
}

export function resetSessionForTests(next?: SessionState): void {
  hydration = null;
  teardown = null;
  commit(next ?? { status: "loading", accessToken: null });
}

export async function signInWithAccessToken(token: string): Promise<void> {
  await getStorage().setItem(ACCESS_TOKEN_KEY, token);
  commit({ status: "authenticated", accessToken: token });
}

// Sign out once, even if many 401s arrive together.
export function endSession(): Promise<void> {
  teardown ??= (async () => {
    await getStorage().removeItem(ACCESS_TOKEN_KEY);
    commit({ status: "unauthenticated", accessToken: null });
  })()
    .catch(() => {
      commit({ status: "unauthenticated", accessToken: null });
    })
    .finally(() => {
      teardown = null;
    });
  return teardown;
}