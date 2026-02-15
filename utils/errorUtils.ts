/**
 * Safely extracts a message from an unknown error type.
 * Useful for catch blocks where the error is typed as 'unknown'.
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;

  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}
