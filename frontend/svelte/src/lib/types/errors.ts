export class NotFoundError extends Error {
  readonly message: string;
  constructor(message?: string) {
    super(message);
    this.message = message ?? "";
    // https://www.typescriptlang.org/docs/handbook/2/classes.html#inheriting-built-in-types
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class NotAuthorizedError extends Error {
  message: string;
  constructor(message?: string) {
    super(message);
    Object.setPrototypeOf(this, NotAuthorizedError.prototype);
  }
}

export class InvalidAmountError extends Error {
  message: string;
  constructor(message?: string) {
    super(message);
    Object.setPrototypeOf(this, InvalidAmountError.prototype);
  }
}

export class InsufficientAmountError extends Error {
  message: string;
  constructor(message?: string) {
    super(message);
    Object.setPrototypeOf(this, InsufficientAmountError.prototype);
  }
}
