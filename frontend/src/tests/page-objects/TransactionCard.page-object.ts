import { AmountDisplayPo } from "$tests/page-objects/AmountDisplay.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class TransactionCardPo extends BasePageObject {
  private static readonly TID = "transaction-card";

  static async allUnder(
    element: PageObjectElement
  ): Promise<TransactionCardPo[]> {
    return Array.from(await element.allByTestId(TransactionCardPo.TID)).map(
      (el) => new TransactionCardPo(el)
    );
  }

  getIdentifier(): Promise<string> {
    return this.getText("identifier");
  }

  getAmountDisplayPo(): AmountDisplayPo {
    return AmountDisplayPo.under(this.root);
  }

  getAmount(): Promise<string> {
    return this.getAmountDisplayPo().getAmount();
  }
}
