import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class TransactionIconPo extends BasePageObject {
  private static readonly TID = "transaction-icon-component";

  static under(element: PageObjectElement): TransactionIconPo {
    return new TransactionIconPo(element.byTestId(TransactionIconPo.TID));
  }

  async hasIconClass(className: string): Promise<boolean> {
    const classNames = await this.root.getClasses();
    return classNames.includes(className);
  }

  async isSentIcon(): Promise<boolean> {
    const hasIcon = await this.isPresent("icon-up");
    const hasClass = await this.hasIconClass("sent");
    return hasIcon && hasClass && !(await this.isPendingSendIcon());
  }

  async isPendingSendIcon(): Promise<boolean> {
    const hasIcon = await this.isPresent("icon-up");
    const hasClass = await this.hasIconClass("pending");
    return hasIcon && hasClass;
  }

  async isReceivedIcon(): Promise<boolean> {
    const hasIcon = await this.isPresent("icon-down");
    const hasClass = await this.hasIconClass("received");
    return hasIcon && hasClass && !(await this.isPendingReceiveIcon());
  }

  async isPendingReceiveIcon(): Promise<boolean> {
    const hasIcon = await this.isPresent("icon-down");
    const hasClass = await this.hasIconClass("pending");
    return hasIcon && hasClass;
  }

  async isReimbursementIcon(): Promise<boolean> {
    const hasIcon = await this.isPresent("icon-reimbursed");
    const hasClass = await this.hasIconClass("reimbursed");
    return hasIcon && hasClass;
  }

  async isFailedIcon(): Promise<boolean> {
    const hasIcon = await this.isPresent("icon-error-outline");
    const hasClass = await this.hasIconClass("failed");
    return hasIcon && hasClass;
  }
}
