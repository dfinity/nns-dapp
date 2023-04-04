import { AmountInputPo } from "$tests/page-objects/AmountInput.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import { SelectDestinationAddressPo } from "$tests/page-objects/SelectDestinationAddress.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class TransactionFormPo extends BasePageObject {
  private static readonly TID = "transaction-step-1";

  static under(element: PageObjectElement): TransactionFormPo {
    return new TransactionFormPo(element.byTestId(TransactionFormPo.TID));
  }

  getSelectDestinationAddressPo(): SelectDestinationAddressPo {
    return SelectDestinationAddressPo.under(this.root);
  }

  getAmountInputPo(): AmountInputPo {
    return AmountInputPo.under(this.root);
  }

  enterAmount(amount: number): Promise<void> {
    return this.getAmountInputPo().enterAmount(amount);
  }

  clickContinue(): Promise<void> {
    return this.getButton("transaction-button-next").click();
  }

  async transferToAccount({
    accountName,
    amount,
  }: {
    accountName: string;
    amount: number;
  }): Promise<void> {
    await this.getSelectDestinationAddressPo().selectAccount(accountName);
    await this.enterAmount(amount);
    await this.clickContinue();
  }
}
