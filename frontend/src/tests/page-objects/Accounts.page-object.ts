import { BasePageObject } from "$tests/page-objects/base.page-object";
import { NnsAccountsPo } from "$tests/page-objects/NnsAccounts.page-object";
import { NnsAccountsFooterPo } from "$tests/page-objects/NnsAccountsFooter.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class AccountsPo extends BasePageObject {
  static readonly tid = "accounts-component";

  constructor(root: PageObjectElement) {
    super(root);
  }

  static under(element: PageObjectElement): AccountsPo | null {
    return new AccountsPo(element.byTestId(AccountsPo.tid));
  }

  getNnsAccountsPo(): NnsAccountsPo {
    return NnsAccountsPo.under(this.root);
  }

  getNnsAccountsFooterPo(): NnsAccountsFooterPo {
    return NnsAccountsFooterPo.under(this.root);
  }

  clickSend(): Promise<void> {
    return this.getNnsAccountsFooterPo().clickSend();
  }
}
