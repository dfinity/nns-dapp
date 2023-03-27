import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

import { NnsAccountsFooterPo } from "$tests/page-objects/NnsAccountsFooter.page-object";

export class AccountsPo extends BasePageObject {
  static readonly tid = "accounts-component";

  constructor(root: PageObjectElement) {
    super(root);
  }

  static under(element: PageObjectElement): AccountsPo | null {
    return new AccountsPo(element.byTestId(AccountsPo.tid));
  }

  getNnsAccountsFooterPo(): NnsAccountsFooterPo {
    return NnsAccountsFooterPo.under(this.root);
  }

  clickSend(): Promise<void> {
    return this.getNnsAccountsFooterPo().clickSend();
  }
}
