import { AmountDisplayPo } from "$tests/page-objects/AmountDisplay.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class TransactionCardPo extends BasePageObject {
  private static readonly TID = "transaction-card";

  static under(element: PageObjectElement): TransactionCardPo {
    return new TransactionCardPo(element.byTestId(TransactionCardPo.TID));
  }

  static async allUnder(
    element: PageObjectElement
  ): Promise<TransactionCardPo[]> {
    return Array.from(await element.allByTestId(TransactionCardPo.TID)).map(
      (el) => new TransactionCardPo(el)
    );
  }

  getHeadline(): Promise<string> {
    return this.getText("headline");
  }

  getIdentifier(): Promise<string> {
    return this.getText("identifier");
  }

  getDescription(): Promise<string> {
    return this.getText("transaction-description");
  }

  getDate(): Promise<string> {
    return this.getText("transaction-date");
  }

  getAmountDisplayPo(): AmountDisplayPo {
    return AmountDisplayPo.under(this.root);
  }

  getAmount(): Promise<string> {
    return this.getAmountDisplayPo().getAmount();
  }
}
