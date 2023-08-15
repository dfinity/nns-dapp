import { TransactionModalBasePo } from "$tests/page-objects/TransactionModal.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class SnsIncreaseStakeNeuronModalPo extends TransactionModalBasePo {
  private static readonly TID = "sns-increase-stake-neuron-modal-component";

  static under(
    element: PageObjectElement
  ): SnsIncreaseStakeNeuronModalPo | null {
    return new SnsIncreaseStakeNeuronModalPo(
      element.byTestId(SnsIncreaseStakeNeuronModalPo.TID)
    );
  }

  async increase(amount: number): Promise<void> {
    const formPo = this.getTransactionFormPo();
    await formPo.waitFor();
    await formPo.enterAmount(amount);
    await formPo.clickContinue();
    await this.getTransactionReviewPo().clickSend();
  }
}
