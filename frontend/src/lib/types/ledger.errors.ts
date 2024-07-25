import type { I18nSubstitutions } from "$lib/utils/i18n.utils";

export class LedgerErrorKey extends Error {
  // Optional substitutions values that can be used to fill the error message
  substitutions?: I18nSubstitutions;
  // Whether to render the error message as HTML.
  renderAsHtml: boolean;

  constructor({
    message,
    substitutions,
    renderAsHtml = false,
  }: {
    message?: string;
    substitutions?: I18nSubstitutions;
    renderAsHtml?: boolean;
  }) {
    super(message);

    this.substitutions = substitutions;
    this.renderAsHtml = renderAsHtml;
  }
}

export class LedgerErrorMessage extends Error {}

// TransportError is exposed as a function not an interface from @ledgerhq/errors so we redeclare it
// Neither is CustomError exposed
export interface LedgerHQTransportError {
  name: string;
  message: string;
  id: string;
}
