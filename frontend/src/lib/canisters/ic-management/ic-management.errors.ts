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
          .find((l) => l.startsWith("error code"))
      : "";

  // IC0512: the caller is not a controller.
  // IC0542: the caller may not read the canister status.
  if (statusLine?.includes("ic0512") || statusLine?.includes("ic0542")) {
    return new UserNotTheControllerError();
  }
  return error;
}

export class UserNotTheControllerError extends Error {}
