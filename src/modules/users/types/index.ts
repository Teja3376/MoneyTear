import type { AccountStatus } from "@/modules/auth/types";

export interface UserProfile {
  id: string;
  phone: string | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  dateOfBirth: string | null;
  role: string;
  status: AccountStatus;
  onboardingCompletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// Send at least one field; the API rejects an empty body.
export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  dateOfBirth?: string;
}