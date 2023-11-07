/**
 * Parses and throws convenient error class.
 *
 * @throws UserNotTheControllerError and Error.
 */
export function mapError(error: Error | unknown): Error | unknown {
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
