type AccountNotFound = "AccountNotFound";
const accountNotFoundKind: AccountNotFound = "AccountNotFound";

export class AccountNotFoundError extends Error {
  static kind: AccountNotFound = accountNotFoundKind;
  public kind: AccountNotFound;
  constructor(message: string) {
    super(message);
    this.kind = accountNotFoundKind;
  }
}

type SubAccountLimitExceeded = "SubAccountLimitExceeded";
const subAccountLimitExceededKind: SubAccountLimitExceeded =
  "SubAccountLimitExceeded";

export class SubAccountLimitExceededError extends Error {
  static kind: SubAccountLimitExceeded = subAccountLimitExceededKind;
  public kind: SubAccountLimitExceeded;
  constructor(message: string) {
    super(message);
    this.kind = subAccountLimitExceededKind;
  }
}

type NameTooLong = "NameTooLong";
const nameTooLongKind: NameTooLong = "NameTooLong";

export class NameTooLongError extends Error {
  static kind: NameTooLong = nameTooLongKind;
  public kind: NameTooLong;
  constructor(message: string) {
    super(message);
    this.kind = nameTooLongKind;
  }
}
