import { TransactionModalPo } from "$tests/page-objects/TransactionModal.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ParticipateSwapModalPo extends TransactionModalPo {
  private static readonly TID = "participate-swap-modal-component";

  static under(element: PageObjectElement): ParticipateSwapModalPo | null {
    return new ParticipateSwapModalPo(
      element.byTestId(ParticipateSwapModalPo.TID)
    );
  }

  async participate({ amount }: { amount: number }): Promise<void> {
    const formPo = this.getTransactionFormPo();
    // Needed for Jest
    await formPo.waitFor();
    await formPo.enterAmount(amount);
    await formPo.clickContinue();
    const review = this.getTransactionReviewPo();
    // Needed for Jest
    await review.waitFor();
    await review.clickCheckbox();
    await review.clickSend();
  }
}
