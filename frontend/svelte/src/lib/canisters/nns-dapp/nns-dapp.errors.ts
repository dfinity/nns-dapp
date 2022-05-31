import type {I18nSubstitutions} from '../../utils/i18n.utils';

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

export class SubAccountLimitExceededError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class NameTooLongError extends AccountTranslateError {
  constructor(message: string, substitutions?: I18nSubstitutions) {
    super(message);

    this.substitutions = substitutions;
  }
}

export class HardwareWalletAttachError extends Error {
  constructor(message: string) {
    super(message);
  }
}
