export type AccountStatus = "active" | "suspended" | "disabled";

export interface AuthUser {
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

// GET /auth/me and POST /auth/bootstrap
export interface AuthState {
  user: AuthUser;
  // first name, last name and date of birth are all set
  profileComplete: boolean;
  pinConfigured: boolean;
  accountStatus: AccountStatus;
  // bootstrap only: a new account was created
  created?: boolean;
}

export interface LogoutResult {
  loggedOut: boolean;
  scope: string;
}