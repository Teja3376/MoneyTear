import { create } from "axios";
import Constants from "expo-constants";
import { Platform } from "react-native";

import { ApiRequestError, normalizeError } from "./errors";
import { getAccessToken } from "./session";

// Web uses localhost; a device uses the dev machine's IP from Expo.
function getApiBaseUrl(): string {
  const hostUri = Constants.expoConfig?.hostUri;
  const host = hostUri ? hostUri.split(":")[0] : null;

  if (Platform.OS === "web") {
    return "http://localhost:3000/api";
  }

  if (host) {
    return `http://${host}:3000/api`;
  }

  return "http://192.168.1.9:3000/api";
}

export const API_BASE_URL = getApiBaseUrl();

export const API_TIMEOUT_MS = 20_000;

export const api = create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

export default api;

type UnauthorizedHandler = () => void | Promise<void>;

// Set by SessionProvider to sign the user out on a 401.
let unauthorizedHandler: UnauthorizedHandler | null = null;
let unauthorizedInFlight = false;

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  unauthorizedHandler = handler;
}

function notifyUnauthorized(): void {
  const handler = unauthorizedHandler;
  // Run once at a time, and only when someone is signed in.
  if (unauthorizedInFlight || !handler || !getAccessToken()) return;

  unauthorizedInFlight = true;
  void Promise.resolve()
    .then(handler)
    .finally(() => {
      unauthorizedInFlight = false;
    });
}

// Attach the access token to every request.
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

// Turn every failure into ApiRequestError; a 401 ends the session.
api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const normalized = new ApiRequestError(normalizeError(error));
    if (normalized.code === "unauthorized") notifyUnauthorized();
    return Promise.reject(normalized);
  },
);