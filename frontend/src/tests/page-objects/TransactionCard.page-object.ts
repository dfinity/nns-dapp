import { AmountDisplayPo } from "$tests/page-objects/AmountDisplay.page-object";
import { TransactionIconPo } from "$tests/page-objects/TransactionIcon.page-object";
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

  getTransactionIconPo(): TransactionIconPo {
    return TransactionIconPo.under(this.root);
  }

  getHeadline(): Promise<string> {
    return this.getText("headline");
  }

  getIdentifier(): Promise<string> {
    return this.getText("identifier");
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

  async hasSentIcon(): Promise<boolean> {
    return this.getTransactionIconPo().isSentIcon();
  }

  async hasReceivedIcon(): Promise<boolean> {
    return this.getTransactionIconPo().isReceivedIcon();
  }

  async hasPendingReceiveIcon(): Promise<boolean> {
    return this.getTransactionIconPo().isPendingReceiveIcon();
  }

  async hasReimbursementIcon(): Promise<boolean> {
    return this.getTransactionIconPo().isReimbursementIcon();
  }

  async hasFailedIcon(): Promise<boolean> {
    return this.getTransactionIconPo().isFailedIcon();
  }
}
