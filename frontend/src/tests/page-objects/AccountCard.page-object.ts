import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class AccountCardPo extends BasePageObject {
  private static readonly TID = "account-card";

  private constructor(root: PageObjectElement) {
    super(root);
  }

  static under(element: PageObjectElement): AccountCardPo {
    return new AccountCardPo(element.byTestId(AccountCardPo.TID));
  }

  getAccountName(): Promise<string> {
    return this.root.byTestId("account-name").getText();
  }
}
