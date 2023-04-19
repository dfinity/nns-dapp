import { TransactionModalPo } from "$tests/page-objects/TransactionModal.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class SnsStakeNeuronModalPo extends TransactionModalPo {
  private static readonly TID = "sns-stake-neuron-modal-component";

  static under(element: PageObjectElement): SnsStakeNeuronModalPo | null {
    return new SnsStakeNeuronModalPo(
      element.byTestId(SnsStakeNeuronModalPo.TID)
    );
  }

  async stake(amount: number): Promise<void> {
    const formPo = this.getTransactionFormPo();
    await formPo.enterAmount(amount);
    await formPo.clickContinue();
    await this.getTransactionReviewPo().clickSend();
  }
}
