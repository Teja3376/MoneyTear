/**
 * Platform-agnostic key/value storage for authentication credentials.
 *
 * Native builds use `expo-secure-store`:
 *   - iOS      -> Keychain (`kSecClassGenericPassword`), encrypted at rest.
 *   - Android  -> `SharedPreferences` encrypted with the Android Keystore.
 *
 * The web target has no secure primitive, so it falls back to `localStorage`,
 * which is readable by any script running on the origin. See the security
 * trade-offs section of FRONTEND_ARCHITECTURE_PLAN.md.
 *
 * Every read is guarded so this module is safe to import in environments
 * without a DOM (static rendering, unit tests, server tooling). Nothing outside
 * this file touches `localStorage`, `sessionStorage` or `SecureStore` directly.
 */
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

export interface KeyValueStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

const createWebStorage = (): KeyValueStorage => ({
  async getItem(key) {
    if (typeof window === "undefined") return null;
    try {
      return window.localStorage.getItem(key);
    } catch {
      // Private-browsing modes and blocked third-party storage throw on access.
      return null;
    }
  },
  async setItem(key, value) {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // A failed write must not break sign-in; the session simply stays in memory.
    }
  },
  async removeItem(key) {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(key);
    } catch {
      // See setItem.
    }
  },
});

const createSecureStorage = (): KeyValueStorage => ({
  getItem: (key) => SecureStore.getItemAsync(key),
  setItem: (key, value) => SecureStore.setItemAsync(key, value),
  removeItem: (key) => SecureStore.deleteItemAsync(key),
});

/**
 * In-memory storage. Used by unit tests and as a last-resort fallback so a
 * failing platform implementation degrades to a session-scoped store instead of
 * throwing on the sign-in path.
 */
export const createMemoryStorage = (
  initial: Record<string, string> = {},
): KeyValueStorage => {
  const entries = new Map<string, string>(Object.entries(initial));
  return {
    async getItem(key) {
      return entries.get(key) ?? null;
    },
    async setItem(key, value) {
      entries.set(key, value);
    },
    async removeItem(key) {
      entries.delete(key);
    },
  };
};

const createPlatformStorage = (): KeyValueStorage =>
  Platform.OS === "web" ? createWebStorage() : createSecureStorage();

/** The storage instance the app uses. Replaced in tests via `setStorage`. */
let storage: KeyValueStorage = createPlatformStorage();

export function getStorage(): KeyValueStorage {
  return storage;
}

/** Test seam. Production code never calls this. */
export function setStorage(next: KeyValueStorage): void {
  storage = next;
}