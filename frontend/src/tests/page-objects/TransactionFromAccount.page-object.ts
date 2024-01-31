import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { SelectAccountDropdownPo } from "./SelectAccountDropdown.page-object";

export class TransactionFromAccountPo extends BasePageObject {
  private static readonly TID = "transaction-from-account";

  static under(element: PageObjectElement): TransactionFromAccountPo {
    return new TransactionFromAccountPo(
      element.byTestId(TransactionFromAccountPo.TID)
    );
  }

  getDropdownPo(): SelectAccountDropdownPo {
    return SelectAccountDropdownPo.under(this.root);
  }

  async selectAccount(accountName: string): Promise<void> {
    await this.getDropdownPo().select(accountName);
  }

  getAccounts(): Promise<string[]> {
    return this.getDropdownPo().getOptions();
  }
}
