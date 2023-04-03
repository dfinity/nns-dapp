import type { PageObjectElement } from "$tests/types/page-object.types";
import { TransactionModalPo } from "./TransactionModal.page-object";

export class SnsIncreaseStakeNeuronModalPo extends TransactionModalPo {
  private static readonly TID = "sns-increase-stake-neuron-modal-component";

  private constructor(root: PageObjectElement) {
    super(root);
  }

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
