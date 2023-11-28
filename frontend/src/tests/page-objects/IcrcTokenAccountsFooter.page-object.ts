import { BaseAccountsPo } from "$tests/page-objects/BaseAccounts.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class IcrcTokenAccountsFooterPo extends BaseAccountsPo {
  private static readonly TID = "icrc-token-accounts-footer-component";

  static under(element: PageObjectElement): IcrcTokenAccountsFooterPo {
    return new IcrcTokenAccountsFooterPo(
      element.byTestId(IcrcTokenAccountsFooterPo.TID)
    );
  }
}
