import { AmountInputPo } from "$tests/page-objects/AmountInput.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { ButtonPo } from "$tests/page-objects/Button.page-object";
import { TransactionFromAccountPo } from "$tests/page-objects/TransactionFromAccount.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NnsStakeNeuronPo extends BasePageObject {
  private static readonly TID = "nns-stake-neuron-component";

  static under(element: PageObjectElement): NnsStakeNeuronPo {
    return new NnsStakeNeuronPo(element.byTestId(NnsStakeNeuronPo.TID));
  }

  getTransactionFromAccountPo(): TransactionFromAccountPo {
    return TransactionFromAccountPo.under(this.root);
  }

  getAmountInputPo(): AmountInputPo {
    return AmountInputPo.under(this.root);
  }

  getCreateButtonPo(): ButtonPo {
    return this.getButton("create-neuron-button");
  }

  enterAmount(amount: number): Promise<void> {
    return this.getAmountInputPo().enterAmount(amount);
  }

  clickCreate(): Promise<void> {
    return this.getCreateButtonPo().click();
  }

  async stake(amount: number): Promise<void> {
    await this.enterAmount(amount);
    await this.clickCreate();
  }
}
