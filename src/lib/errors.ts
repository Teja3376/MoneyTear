/**
 * Centralised error normalisation.
 *
 * Every rejection produced by the HTTP client is an `ApiRequestError`, so pages
 * never have to reach into `error.response.data` and never have to guess which
 * status codes exist. Nothing in this module renders UI: it only turns a
 * transport failure into a small, predictable shape that a page can present.
 *
 * The shape mirrors the MoneyTear API error envelope (`AllExceptionsFilter`),
 * which is guaranteed to carry a safe `message` and a correlation `requestId`
 * instead of a stack trace.
 */
import { AxiosError, isAxiosError, isCancel } from "axios";

export type ApiErrorCode =
  | "bad_request"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "unprocessable_entity"
  | "too_many_requests"
  | "internal_server_error"
  | "network_error"
  | "canceled"
  | "unknown_error";

export interface ApiErrorShape {
  /** Stable machine-readable code. Safe to branch on. */
  code: ApiErrorCode;
  /** User-presentable summary. Never contains a stack trace. */
  message: string;
  /** HTTP status, or `null` when the request never reached the server. */
  status: number | null;
  /** Per-field validation messages, when the API returned them. */
  fieldErrors: Record<string, string[]>;
  /** Correlation id, also present in the API logs. */
  requestId: string | null;
  /** Seconds to wait before retrying, from the `Retry-After` header. */
  retryAfterSeconds: number | null;
}

const CODE_BY_STATUS: Record<number, ApiErrorCode> = {
  400: "bad_request",
  401: "unauthorized",
  403: "forbidden",
  404: "not_found",
  409: "conflict",
  422: "unprocessable_entity",
  429: "too_many_requests",
};

const FALLBACK_MESSAGE_BY_CODE: Record<ApiErrorCode, string> = {
  bad_request: "Please check your details and try again.",
  unauthorized: "Your session expired. Please sign in again to continue.",
  forbidden: "You don't have access to complete this action.",
  not_found: "We couldn't find what you were looking for.",
  conflict: "This record already exists. Please review your details.",
  unprocessable_entity: "Please double-check the information entered and try again.",
  too_many_requests: "Too many attempts. Please wait a moment and try again.",
  internal_server_error: "We're experiencing a brief issue. Please try again in a moment.",
  network_error: "Unable to reach the server. Please check your internet connection or server connection.",
  canceled: "The request was cancelled.",
  unknown_error: "Something went wrong. Please try again.",
};


const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

/** Reads `Record<string, string[]>` out of the API envelope, ignoring junk. */
const readFieldErrors = (value: unknown): Record<string, string[]> => {
  if (!isRecord(value)) return {};
  const entries = Object.entries(value).filter(
    (entry): entry is [string, string[]] =>
      Array.isArray(entry[1]) && entry[1].every((item) => typeof item === "string"),
  );
  return Object.fromEntries(entries);
};

const readRetryAfter = (headers: unknown): number | null => {
  if (!isRecord(headers)) return null;
  const raw = headers["retry-after"];
  if (typeof raw !== "string") return null;
  const seconds = Number.parseInt(raw, 10);
  return Number.isFinite(seconds) && seconds >= 0 ? seconds : null;
};

const resolveCode = (status: number | null): ApiErrorCode => {
  if (status === null) return "network_error";
  const known = CODE_BY_STATUS[status];
  if (known) return known;
  return status >= 500 ? "internal_server_error" : "unknown_error";
};

const emptyShape = (code: ApiErrorCode): Omit<ApiErrorShape, "message"> => ({
  code,
  status: null,
  fieldErrors: {},
  requestId: null,
  retryAfterSeconds: null,
});

/** The single error type rejected by the HTTP client. */
export class ApiRequestError extends Error implements ApiErrorShape {
  readonly code: ApiErrorCode;
  readonly status: number | null;
  readonly fieldErrors: Record<string, string[]>;
  readonly requestId: string | null;
  readonly retryAfterSeconds: number | null;

  constructor(shape: ApiErrorShape) {
    super(shape.message);
    this.name = "ApiRequestError";
    this.code = shape.code;
    this.status = shape.status;
    this.fieldErrors = shape.fieldErrors;
    this.requestId = shape.requestId;
    this.retryAfterSeconds = shape.retryAfterSeconds;
    // Keeps `instanceof` working when the class is down-levelled to ES5.
    Object.setPrototypeOf(this, ApiRequestError.prototype);
  }

  toShape(): ApiErrorShape {
    return {
      code: this.code,
      message: this.message,
      status: this.status,
      fieldErrors: this.fieldErrors,
      requestId: this.requestId,
      retryAfterSeconds: this.retryAfterSeconds,
    };
  }
}

/** Turns any thrown value into an `ApiErrorShape`. */
export function normalizeError(error: unknown): ApiErrorShape {
  if (isCancel(error)) {
    return { ...emptyShape("canceled"), message: FALLBACK_MESSAGE_BY_CODE.canceled };
  }

  if (!isAxiosError(error)) {
    if (error instanceof ApiRequestError) return error.toShape();
    return { ...emptyShape("unknown_error"), message: FALLBACK_MESSAGE_BY_CODE.unknown_error };
  }

  const axiosError = error as AxiosError<unknown>;
  const status = axiosError.response?.status ?? null;

  // No `response` means the request never completed: DNS failure, TLS failure,
  // timeout, offline device. There is no server message to surface.
  if (status === null) {
    const code = axiosError.code === AxiosError.ERR_CANCELED ? "canceled" : "network_error";
    return { ...emptyShape(code), message: FALLBACK_MESSAGE_BY_CODE[code] };
  }

  const code = resolveCode(status);
  const body = axiosError.response?.data;
  const serverMessage = isRecord(body) && typeof body.message === "string" && body.message.length > 0
    ? body.message
    : null;

  return {
    code,
    message: serverMessage ?? FALLBACK_MESSAGE_BY_CODE[code],
    status,
    fieldErrors: isRecord(body) ? readFieldErrors(body.errors) : {},
    requestId: isRecord(body) && typeof body.requestId === "string" ? body.requestId : null,
    retryAfterSeconds: readRetryAfter(axiosError.response?.headers),
  };
}

export function isApiError(error: unknown): error is ApiRequestError {
  return error instanceof ApiRequestError;
}

/**
 * Message to display for a failed operation.
 *
 * `fallback` covers values that never went through the HTTP client (a Zod
 * failure, a thrown `TypeError`, …) so callers always have something to render.
 */
export function getErrorMessage(error: unknown, fallback?: string): string {
  if (isApiError(error)) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return fallback ?? FALLBACK_MESSAGE_BY_CODE.unknown_error;
}

/**
 * First server-side validation message for a form field, if any.
 *
 * Lets a page map API field errors onto React Hook Form with `setError`
 * instead of showing one generic toast for the whole form.
 */
export function getFieldError(error: unknown, field: string): string | undefined {
  return isApiError(error) ? error.fieldErrors[field]?.[0] : undefined;
}

/** True when the failure means the session can no longer be recovered. */
export function isUnauthorized(error: unknown): boolean {
  return isApiError(error) && error.code === "unauthorized";
}