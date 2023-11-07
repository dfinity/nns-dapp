/**
 * Parses and throws convenient error class.
 *
 * @throws UserNotTheControllerError and Error.
 */
export function mapError(error: Error | unknown): Error | unknown {
  // As per IC Specification: https://internetcomputer.org/docs/current/references/ic-interface-spec#error-codes
  // Specification might change and then we might need to change this as well.
  const statusLine =
    error instanceof Error
      ? error.message
          .split("\n")
          .map((l) => l.trim().toLowerCase())
          .find((l) => l.startsWith('"error code"'))
      : "";

  if (statusLine?.includes("ic0512")) {
    return new UserNotTheControllerError();
  }
  return error;
}

export class UserNotTheControllerError extends Error {}
