export class AccountNotFoundError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class SubAccountLimitExceededError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class NameTooLongError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class HardwareWalletAttachError extends Error {
  constructor(message: string) {
    super(message);
  }
}
