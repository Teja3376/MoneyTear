export interface PinStatus {
  configured: boolean;
  updatedAt: string | null;
}

export interface PinVerified {
  verified: boolean;
  unlockedUntil: string | null;
}

export interface PinMutationResult {
  success: boolean;
  configured: boolean;
}

export interface SetupPinRequest {
  pin: string;
  confirmPin: string;
}

export interface ChangePinRequest {
  currentPin: string;
  newPin: string;
  confirmNewPin: string;
}

export interface VerifyPinRequest {
  pin: string;
}