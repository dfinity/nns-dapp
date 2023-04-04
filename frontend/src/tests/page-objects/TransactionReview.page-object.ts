import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class TransactionReviewPo extends BasePageObject {
  private static readonly TID = "transaction-step-2";

  static under(element: PageObjectElement): TransactionReviewPo {
    return new TransactionReviewPo(element.byTestId(TransactionReviewPo.TID));
  }

  getDestinationAddress(): Promise<string> {
    return this.getText("destination");
  }

  clickSend(): Promise<void> {
    return this.getButton("transaction-button-execute").click();
  }
}
