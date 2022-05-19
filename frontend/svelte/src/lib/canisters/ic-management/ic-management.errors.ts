export type HttpError = {
  kind: "httpError";
  code: number;
  message: string;
};

export function toHttpError(error: Error): HttpError {
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

  return {
    kind: "httpError",
    code: code,
    message: error.message,
  };
}

export class UserNotTheController extends Error {}
