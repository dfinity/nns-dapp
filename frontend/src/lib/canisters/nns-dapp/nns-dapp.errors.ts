import type { I18nSubstitutions } from "../../utils/i18n.utils";

export abstract class AccountTranslateError extends Error {
  // Optional substitutions values that can be used to fill the error message
  substitutions?: I18nSubstitutions;
}

export class AccountNotFoundError extends AccountTranslateError {
  constructor(message: string, substitutions?: I18nSubstitutions) {
    super(message);

    this.substitutions = substitutions;
  }
}

export class SubAccountLimitExceededError extends Error {}

export class NameTooLongError extends AccountTranslateError {
  constructor(message: string, substitutions?: I18nSubstitutions) {
    super(message);

    this.substitutions = substitutions;
  }
}

export class HardwareWalletAttachError extends Error {}

export class CanisterAlreadyAttachedError extends AccountTranslateError {
  constructor(message: string, substitutions?: I18nSubstitutions) {
    super(message);

    this.substitutions = substitutions;
  }
}
export class CanisterNameAlreadyTakenError extends AccountTranslateError {
  constructor(message: string, substitutions?: I18nSubstitutions) {
    super(message);

    this.substitutions = substitutions;
  }
}

export class CanisterNameTooLongError extends AccountTranslateError {
  constructor(message: string, substitutions?: I18nSubstitutions) {
    super(message);

    this.substitutions = substitutions;
  }
}

export class CanisterLimitExceededError extends AccountTranslateError {}

export class CanisterNotFoundError extends AccountTranslateError {
  constructor(message: string, substitutions?: I18nSubstitutions) {
    super(message);

    this.substitutions = substitutions;
  }
}

export class UnknownProposalPayloadError extends Error {
  constructor(message?: string) {
    super(message);
  }
}

export class ProposalPayloadNotFoundError extends Error {}
export class ProposalPayloadTooLargeError extends Error {}

export class NotAuthorizedError extends Error {}
