/**
 * Zod schemas for the authentication journey's forms.
 *
 * These were previously declared inline in each page. Extracting them keeps the
 * rules and the user-facing messages byte-for-byte identical while giving one
 * place to test them and to derive form value types.
 *
 * Convention:
 *   - `z.infer` is the form value type; no hand-written duplicates.
 *   - Validation messages are written for the user, never for the log.
 *   - These schemas describe the *form*, not the API payload. Mapping a form to
 *     a request body happens in the hook that owns the operation.
 */
import { z } from "zod";

/** Mobile number screen. */
export const mobileSchema = z.object({
  mobile: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
});

export type MobileForm = z.infer<typeof mobileSchema>;

/** Profile details screen. */
export const profileSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required."),
  lastName: z.string().trim().min(1, "Last name is required."),
  email: z.string().trim().email("Enter a valid email address."),
  dateOfBirth: z
    .date()
    .nullable()
    .refine(
      (date) => date !== null && date <= new Date(),
      "Select your date of birth.",
    ),
});

export type ProfileForm = z.infer<typeof profileSchema>;

/** Set PIN screen. */
export const setPinSchema = z
  .object({
    newPin: z.string().regex(/^\d{4}$/, "Enter a 4-digit PIN."),
    confirmPin: z.string().regex(/^\d{4}$/, "Confirm your 4-digit PIN."),
  })
  .refine((data) => data.newPin === data.confirmPin, {
    message: "PINs do not match.",
    path: ["confirmPin"],
  });

export type SetPinForm = z.infer<typeof setPinSchema>;

/** Verify PIN screen. */
export const verifyPinSchema = z.object({
  pin: z.string().regex(/^\d{4}$/, "Enter your 4-digit PIN."),
});

export type VerifyPinForm = z.infer<typeof verifyPinSchema>;

/** Reset PIN screen. */
export const resetPinSchema = z
  .object({
    oldPin: z.string().regex(/^\d{4}$/, "Enter your current 4-digit PIN."),
    newPin: z.string().regex(/^\d{4}$/, "Enter your new 4-digit PIN."),
    confirmNewPin: z.string().regex(/^\d{4}$/, "Confirm your new 4-digit PIN."),
  })
  .refine((data) => data.newPin !== data.oldPin, {
    message: "New PIN must be different from current PIN.",
    path: ["newPin"],
  })
  .refine((data) => data.newPin === data.confirmNewPin, {
    message: "PINs do not match.",
    path: ["confirmNewPin"],
  });

export type ResetPinForm = z.infer<typeof resetPinSchema>;