import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class TransactionSummaryPo extends BasePageObject {
  private static readonly TID = "transaction-summary-component";

  static under(element: PageObjectElement): TransactionSummaryPo {
    return new TransactionSummaryPo(element.byTestId(TransactionSummaryPo.TID));
  }

  async getTransactionSummarySendignAmount(): Promise<{
    label: string;
    amount: string;
  }> {
    const block = this.getElement("transaction-summary-sending-amount");

    const label = await block.querySelector("span").getText();
    const amount = await block.querySelector("div").getText();
    return { label, amount };
  }

  async getTransactionFee(): Promise<{
    label: string;
    amount: string;
  }> {
    const block = this.getElement("transaction-summary-fee");

    const label = await block.querySelector("span").getText();
    const amount = await block.querySelector("div").getText();
    return { label, amount };
  }

  async getTransactionSummaryTotalDeducted(): Promise<{
    label: string;
    amount: string;
  }> {
    const block = this.getElement("transaction-summary-total-deducted");
    const ps = await block.querySelectorAll("p");

    const label = await ps[0].getText();
    const amount = await ps[1].getText();
    return { label, amount };
  }
}
