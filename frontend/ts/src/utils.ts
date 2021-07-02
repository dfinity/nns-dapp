/**
 * An error used to ensure at compile-time that it's never reached.
 */
export class UnsupportedValueError extends Error {
  constructor(value: never) {
    super("Unsupported value: " + value);
  }
}
