/**
 * Authentication session state — deliberately framework-free.
 *
 * This module is the single source of truth for "is there a usable access
 * token?". Both the HTTP client's request interceptor and the React
 * `SessionProvider` read from here, so there is never a second copy of the
 * token that can drift.
 *
 * The token is kept in memory as well as in secure storage because Axios
 * request interceptors are synchronous: they cannot await a read before the
 * request leaves the process.
 */
import { getStorage } from "./storage";

const ACCESS_TOKEN_KEY = "moneytear.access-token";

export type SessionStatus = "loading" | "authenticated" | "unauthenticated";

export interface SessionState {
  /** `loading` until secure storage has been read exactly once. */
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

/**
 * Synchronous access token read, used by the request interceptor.
 * Returns `null` until hydration has completed or when signed out.
 */
export function getAccessToken(): string | null {
  return state.accessToken;
}

export function subscribeToSession(listener: (next: SessionState) => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Reads the persisted token once. Concurrent callers share a single promise,
 * so mounting several providers can never race each other.
 */
export function hydrateSession(): Promise<SessionState> {
  hydration ??= (async () => {
    const token = await getStorage().getItem(ACCESS_TOKEN_KEY);
    return commit({ status: token ? "authenticated" : "unauthenticated", accessToken: token });
  })().catch(() => commit({ status: "unauthenticated", accessToken: null }));
  return hydration;
}

/** Test seam. Resets both the memoised promises and the in-memory value. */
export function resetSessionForTests(next?: SessionState): void {
  hydration = null;
  teardown = null;
  commit(next ?? { status: "loading", accessToken: null });
}

/** Establishes an authenticated session. Call this when sign-in succeeds. */
export async function signInWithAccessToken(token: string): Promise<void> {
  await getStorage().setItem(ACCESS_TOKEN_KEY, token);
  commit({ status: "authenticated", accessToken: token });
}

/**
 * Clears credentials and drops back to signed-out.
 *
 * Idempotent and single-flight: a burst of concurrent `401`s triggers exactly
 * one storage write and one state notification, which is what stops repeated
 * navigation while requests are still in flight.
 */
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