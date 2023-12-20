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

  getDate(): Promise<string> {
    return this.getText("transaction-date");
  }

  getAmountDisplayPo(): AmountDisplayPo {
    return AmountDisplayPo.under(this.root);
  }

  getAmount(): Promise<string> {
    return this.getAmountDisplayPo().getAmount();
  }

  async hasIconClass(className: string): Promise<boolean> {
    const classNames = await this.root.byTestId("icon").getClasses();
    return classNames.includes(className);
  }

  async hasSentIcon(): Promise<boolean> {
    const hasIcon = await this.isPresent("icon-up");
    const hasClass = await this.hasIconClass("send");
    return hasIcon && hasClass;
  }

  async hasReceivedIcon(): Promise<boolean> {
    const hasIcon = await this.isPresent("icon-down");
    const hasClass = await this.hasIconClass("send");
    return hasIcon && !hasClass;
  }

  async hasPendingReceiveIcon(): Promise<boolean> {
    const hasIcon = await this.isPresent("icon-down");
    const hasClass = await this.hasIconClass("pending");
    return hasIcon && hasClass;
  }

  async hasReimbursementIcon(): Promise<boolean> {
    const hasIcon = await this.isPresent("icon-reimbursed");
    const hasClass = await this.hasIconClass("reimbursed");
    return hasIcon && hasClass;
  }
}
