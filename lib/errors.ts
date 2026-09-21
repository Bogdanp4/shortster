// Shared application error shape. A future service layer / real backend
// should throw or return these instead of ad-hoc strings, so every caller
// (toasts, form field errors) can branch on `code` rather than message text.
export type ErrorCode =
  | "invalid_credentials"
  | "email_not_verified"
  | "account_suspended"
  | "account_banned"
  | "email_taken"
  | "not_found"
  | "forbidden"
  | "validation_error"
  | "duplicate_video"
  | "insufficient_budget"
  | "below_min_withdrawal"
  | "unknown_error"

export interface AppError {
  code: ErrorCode
  message?: string
  field?: string
}

export class AppErrorException extends Error {
  code: ErrorCode
  field?: string

  constructor(error: AppError) {
    super(error.message ?? error.code)
    this.code = error.code
    this.field = error.field
  }
}

export function toAppError(code: ErrorCode, message?: string, field?: string): AppError {
  return { code, message, field }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof AppErrorException) return error.message
  if (error instanceof Error) return error.message
  return "Something went wrong. Please try again."
}
