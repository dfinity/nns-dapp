import { InProgressPo } from "$tests/page-objects/InProgress.page-object";
import { TransactionModalPo } from "$tests/page-objects/TransactionModal.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ParticipateSwapModalPo extends TransactionModalPo {
  private static readonly TID = "participate-swap-modal-component";

  static under(element: PageObjectElement): ParticipateSwapModalPo | null {
    return new ParticipateSwapModalPo(
      element.byTestId(ParticipateSwapModalPo.TID)
    );
  }

  getInProgressPo(): InProgressPo {
    return InProgressPo.under(this.root);
  }

  isSaleInProgress(): Promise<boolean> {
    return this.getInProgressPo().isPresent();
  }

  async participate({ amount }: { amount: number }): Promise<void> {
    const formPo = this.getTransactionFormPo();
    await formPo.enterAmount(amount);
    await formPo.clickContinue();
    const review = this.getTransactionReviewPo();
    await review.clickCheckbox();
    await review.clickSend();
  }
}
