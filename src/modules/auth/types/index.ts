/**
 * Authentication contracts.
 *
 * These mirror the MoneyTear API DTOs one-to-one. The API issues Supabase
 * access tokens and exposes no refresh endpoint, so a token is obtained
 * out-of-band (the OTP exchange) and merely *presented* to these endpoints.
 *
 * Sources:
 *   backend `src/modules/auth/dto/auth.dto.ts`
 *   backend `src/modules/auth/auth.controller.ts`
 */

/** `ACCOUNT_STATUSES` from the API. */
export type AccountStatus = "active" | "suspended" | "disabled";

/** `authUserSchema` */
export interface AuthUser {
  id: string;
  phone: string | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  /** `YYYY-MM-DD` */
  dateOfBirth: string | null;
  role: string;
  status: AccountStatus;
  onboardingCompletedAt: string | null;
  /** ISO-8601 */
  createdAt: string;
  /** ISO-8601 */
  updatedAt: string;
}

/** `authStateSchema` — returned by `GET /auth/me` and `POST /auth/bootstrap`. */
export interface AuthState {
  user: AuthUser;
  /** True when firstName, lastName and dateOfBirth are all set. */
  profileComplete: boolean;
  pinConfigured: boolean;
  accountStatus: AccountStatus;
  /** Bootstrap only: true when a new application row was created. */
  created?: boolean;
}

/** `logoutResultSchema` */
export interface LogoutResult {
  loggedOut: boolean;
  /** What the server actually did. The client disposes of its own tokens. */
  scope: string;
}