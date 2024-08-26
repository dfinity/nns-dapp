import { AmountDisplayPo } from "$tests/page-objects/AmountDisplay.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class TransactionFormFeePo extends BasePageObject {
  private static readonly TID = "transaction-form-fee";

  static under(element: PageObjectElement): TransactionFormFeePo {
    return new TransactionFormFeePo(element.byTestId(TransactionFormFeePo.TID));
  }

  getAmountDisplayPo(): AmountDisplayPo {
    return AmountDisplayPo.under(this.root);
  }
}
