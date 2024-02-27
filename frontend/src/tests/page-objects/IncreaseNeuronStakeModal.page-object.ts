import { TransactionModalBasePo } from "$tests/page-objects/TransactionModal.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class IncreaseNeuronStakeModalPo extends TransactionModalBasePo {
  private static readonly TID = "increase-neuron-stake-modal-component";

  static under(element: PageObjectElement): IncreaseNeuronStakeModalPo {
    return new IncreaseNeuronStakeModalPo(
      element.byTestId(IncreaseNeuronStakeModalPo.TID)
    );
  }

  async increaseStake({ amount }: { amount: number }): Promise<void> {
    const form = this.getTransactionFormPo();
    await form.enterAmount(amount);
    await form.clickContinue();
    await this.getTransactionReviewPo().clickSend();
  }
}
