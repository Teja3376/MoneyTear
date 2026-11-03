// Token storage: SecureStore on native, localStorage on web.
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
      // Private browsing throws on access.
      return null;
    }
  },
  async setItem(key, value) {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // Ignore; the session stays in memory.
    }
  },
  async removeItem(key) {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignore; nothing to remove.
    }
  },
});

const createSecureStorage = (): KeyValueStorage => ({
  getItem: (key) => SecureStore.getItemAsync(key),
  setItem: (key, value) => SecureStore.setItemAsync(key, value),
  removeItem: (key) => SecureStore.deleteItemAsync(key),
});

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

let storage: KeyValueStorage = createPlatformStorage();

export function getStorage(): KeyValueStorage {
  return storage;
}

export function setStorage(next: KeyValueStorage): void {
  storage = next;
}