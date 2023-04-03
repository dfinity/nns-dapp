import { BasePageObject } from "$tests/page-objects/base.page-object";
import { HashPo } from "$tests/page-objects/Hash.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class AccountCardPo extends BasePageObject {
  private static readonly TID = "account-card";

  private constructor(root: PageObjectElement) {
    super(root);
  }

  static under(element: PageObjectElement): AccountCardPo {
    return new AccountCardPo(element.byTestId(AccountCardPo.TID));
  }

  static async allUnder(element: PageObjectElement): Promise<AccountCardPo[]> {
    return Array.from(await element.allByTestId(AccountCardPo.TID)).map(
      (el) => new AccountCardPo(el)
    );
  }

  getHashPo(): HashPo {
    return HashPo.under(this.root);
  }

  getAccountName(): Promise<string> {
    return this.root.byTestId("account-name").getText();
  }

  getAccountAddress(): Promise<string> {
    return this.getHashPo().getText();
  }
}
