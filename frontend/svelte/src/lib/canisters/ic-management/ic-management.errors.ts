/**
 * Parses and throws convenient error class.
 *
 * @throws UserNotTheControllerError and Error.
 */
export function mapError(error: Error): Error {
  let code = 500;

  const statusLine = error.message
    .split("\n")
    .map((l) => l.trim().toLowerCase())
    .find((l) => l.startsWith("code:") || l.startsWith("http status code:"));

  if (statusLine !== undefined && statusLine.length > 0) {
    const parts = statusLine.split(":");
    if (parts.length > 1) {
      let valueText = parts[1].trim();
      const valueParts = valueText.split(" ");
      if (valueParts.length > 1) {
        valueText = valueParts[0].trim();
      }
      code = parseInt(valueText, 10);
      if (isNaN(code)) {
        code = 500;
      }
    }
  }

  if (code === 403) {
    return new UserNotTheControllerError();
  }
  return error;
}

export class UserNotTheControllerError extends Error {}
