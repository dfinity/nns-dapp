/**
 * Parses and throws convenient error class.
 *
 * @throws UserNotTheControllerError and Error.
 */
export function mapError(error: Error | unknown): Error | unknown {
  const statusLine =
    error instanceof Error
      ? error.message
      : ""
          .split("\n")
          .map((l) => l.trim().toLowerCase())
          .find(
            (l) => l.startsWith("code:") || l.startsWith("http status code:")
          );

  if (statusLine?.includes("403")) {
    return new UserNotTheControllerError();
  }
  return error;
}

export class UserNotTheControllerError extends Error {}
