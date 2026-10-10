/**
 * Application PIN contracts.
 *
 * The PIN is the app's own lock, separate from the access token: it is hashed
 * server-side with Argon2id, and unlock state lives on the server, never in the
 * client. Hashes, attempt counters and lockout state are never exposed.
 *
 * Sources:
 *   backend `src/modules/security/dto/pin.dto.ts`
 *   backend `src/modules/security/security.controller.ts`
 */

/** `pinStatusSchema` */
export interface PinStatus {
  configured: boolean;
  /** ISO-8601 timestamp of the last PIN change, or `null`. */
  updatedAt: string | null;
}

/** `pinVerifiedSchema` */
export interface PinVerified {
  verified: boolean;
  /** ISO-8601 server-side unlock expiry; reflects API state, not a local flag. */
  unlockedUntil: string | null;
}

/** `pinMutationResultSchema` */
export interface PinMutationResult {
  success: boolean;
  configured: boolean;
}

/** `setupPinSchema` */
export interface SetupPinRequest {
  pin: string;
  confirmPin: string;
}

/** `changePinSchema` */
export interface ChangePinRequest {
  currentPin: string;
  newPin: string;
  confirmNewPin: string;
}

/** `verifyPinSchema` */
export interface VerifyPinRequest {
  pin: string;
}