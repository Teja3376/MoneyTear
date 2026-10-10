
/**
 * The one and only HTTP client.
 *
 * `API_BASE_URL` below is the single, explicit API origin for the whole app.
 * There is intentionally no environment variable, no `NODE_ENV` branch and no
 * separate development/production client: exactly one value exists, and every
 * feature hook calls `api` with a relative path such as `api.get("/users/me")`.
 *
 * Pointing the app at a different environment is a one-line change to this
 * constant and nothing else.
 *
 * The MoneyTear API serves everything under a single `/api` global prefix and
 * does not version paths, so that prefix belongs here rather than being
 * repeated in every hook.
 *
 * Note for device testing: `localhost` resolves to the phone itself on a
 * physical device. Use `10.0.2.2` on an Android emulator, or your machine's LAN
 * IP on a device — as a one-line change to this constant.
 *
 * Successful responses are returned untouched — no global reshaping — so each
 * hook returns exactly the data its consumers expect. Failures are normalised
 * once, here, into `ApiRequestError`. This file never renders UI.
 */
import { create } from "axios";
import Constants from "expo-constants";
import { Platform } from "react-native";

import { ApiRequestError, normalizeError } from "./errors";
import { getAccessToken } from "./session";

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


/** Long enough for a mobile round trip, short enough to fail visibly. */
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

/**
 * Set by `SessionProvider` so the HTTP layer can end a dead session without
 * importing React or the router. Keeps `lib/` free of UI dependencies.
 */
let unauthorizedHandler: UnauthorizedHandler | null = null;
let unauthorizedInFlight = false;

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  unauthorizedHandler = handler;
}

function notifyUnauthorized(): void {
  const handler = unauthorizedHandler;
  // Only meaningful when there is something to invalidate. A 401 from an
  // anonymous request must not wipe an unrelated signed-in session.
  if (unauthorizedInFlight || !handler || !getAccessToken()) return;

  unauthorizedInFlight = true;
  void Promise.resolve()
    .then(handler)
    .finally(() => {
      unauthorizedInFlight = false;
    });
}

/**
 * Attach the current access token to authenticated requests.
 *
 * Reads go through `getAccessToken()`, so hooks never touch storage themselves.
 * The header is omitted entirely when signed out — no empty or `Bearer null`
 * value is ever sent. Tokens and request bodies are never logged.
 */
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

/**
 * Normalise failures in one place.
 *
 * The session policy for this app is deliberately simple: the API issues
 * Supabase access tokens and exposes no refresh endpoint, so a `401` cannot be
 * recovered from and ends the session instead. `403` is never treated as an
 * expiry — it means "authenticated but not allowed", which is a page-level
 * concern. There is no retry here, therefore no possibility of a refresh loop.
 */
api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const normalized = new ApiRequestError(normalizeError(error));
    if (normalized.code === "unauthorized") notifyUnauthorized();
    return Promise.reject(normalized);
  },
);