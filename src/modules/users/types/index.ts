/**
 * Profile contracts.
 *
 * Mirror the MoneyTear API DTOs. `role`, `status`, `id` and every security
 * counter are server-owned and are read-only here.
 *
 * Sources:
 *   backend `src/modules/users/dto/user.dto.ts`
 *   backend `src/modules/users/users.controller.ts`
 */
import type { AccountStatus } from "@/modules/auth/types";

/** `userResponseSchema` */
export interface UserProfile {
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

/**
 * `updateProfileSchema`
 *
 * The API rejects unknown keys and requires at least one field, so an empty
 * payload must never be sent.
 */
export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  /** `YYYY-MM-DD` */
  dateOfBirth?: string;
}