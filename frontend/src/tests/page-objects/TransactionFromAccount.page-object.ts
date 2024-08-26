import { AmountDisplayPo } from "$tests/page-objects/AmountDisplay.page-object";
import { SelectAccountDropdownPo } from "$tests/page-objects/SelectAccountDropdown.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class TransactionFromAccountPo extends BasePageObject {
  private static readonly TID = "transaction-from-account";

  static under(element: PageObjectElement): TransactionFromAccountPo {
    return new TransactionFromAccountPo(
      element.byTestId(TransactionFromAccountPo.TID)
    );
  }

  getAmountDisplayPo(): AmountDisplayPo {
    return AmountDisplayPo.under(this.root);
  }

  getSelectAccountDropdownPo(): SelectAccountDropdownPo {
    return SelectAccountDropdownPo.under(this.root);
  }

  async selectAccount(accountName: string): Promise<void> {
    await this.getSelectAccountDropdownPo().select(accountName);
  }

  getAccounts(): Promise<string[]> {
    return this.getSelectAccountDropdownPo().getOptions();
  }
}
