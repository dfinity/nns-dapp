import { AmountInputPo } from "$tests/page-objects/AmountInput.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { ButtonPo } from "$tests/page-objects/Button.page-object";
import { SelectDestinationAddressPo } from "$tests/page-objects/SelectDestinationAddress.page-object";
import { TransactionFromAccountPo } from "$tests/page-objects/TransactionFromAccount.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class TransactionFormPo extends BasePageObject {
  private static readonly TID = "transaction-step-1";

  static under(element: PageObjectElement): TransactionFormPo {
    return new TransactionFormPo(element.byTestId(TransactionFormPo.TID));
  }

  getTransactionFromAccountPo(): TransactionFromAccountPo {
    return TransactionFromAccountPo.under(this.root);
  }

  getSelectDestinationAddressPo(): SelectDestinationAddressPo {
    return SelectDestinationAddressPo.under(this.root);
  }

  getAmountInputPo(): AmountInputPo {
    return AmountInputPo.under(this.root);
  }

  getContinueButtonPo(): ButtonPo {
    return this.getButton("transaction-button-next");
  }

  enterAmount(amount: number): Promise<void> {
    return this.getAmountInputPo().enterAmount(amount);
  }

  async isContinueButtonEnabled(): Promise<boolean> {
    return !(await this.getContinueButtonPo().isDisabled());
  }

  clickContinue(): Promise<void> {
    return this.getContinueButtonPo().click();
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
    await this.getAdditionalInfoFormPo().toggleConditionsAccepted();
    await this.clickContinue();
  }
}
