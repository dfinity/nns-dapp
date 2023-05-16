import { AdditionalInfoReviewPo } from "$tests/page-objects/AdditionalInfoReview.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class TransactionReviewPo extends BasePageObject {
  private static readonly TID = "transaction-step-2";

  static under(element: PageObjectElement): TransactionReviewPo {
    return new TransactionReviewPo(element.byTestId(TransactionReviewPo.TID));
  }

  getAdditionalInfoReviewPo(): AdditionalInfoReviewPo {
    return AdditionalInfoReviewPo.under(this.root);
  }

  getDestinationAddress(): Promise<string> {
    return this.getText("destination");
  }

  clickSend(): Promise<void> {
    return this.getButton("transaction-button-execute").click();
  }

  clickCheckbox(): Promise<void> {
    return this.getAdditionalInfoReviewPo().clickCheckbox();
  }
}
