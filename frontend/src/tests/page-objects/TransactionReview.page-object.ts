import type { ButtonPo } from "$tests/page-objects/Button.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class TransactionReviewPo extends BasePageObject {
  private static readonly TID = "transaction-step-2";

  static under(element: PageObjectElement): TransactionReviewPo {
    return new TransactionReviewPo(element.byTestId(TransactionReviewPo.TID));
  }

  getSendButtonPo(): ButtonPo {
    return this.getButton("transaction-button-execute");
  }

  getDestinationAddress(): Promise<string> {
    return this.getText("destination");
  }

  getSendingAmount(): Promise<string> {
    return this.getText("transaction-summary-sending-amount");
  }

  getReceivedAmount(): Promise<string> {
    return this.getText("transaction-summary-total-received");
  }

  async isSendButtonEnabled(): Promise<boolean> {
    return !(await this.getSendButtonPo().isDisabled());
  }

  clickSend(): Promise<void> {
    return this.getSendButtonPo().click();
  }
}
