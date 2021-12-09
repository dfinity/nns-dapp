/**
 * An error used to ensure at compile-time that it's never reached.
 */
export class UnsupportedValueError extends Error {
  constructor(value: never) {
    super("Unsupported value: " + value);
  }
}

export function base64ToUInt8Array(base64String: string): Uint8Array {
  return Uint8Array.from(atob(base64String), (c) => c.charCodeAt(0));
}
