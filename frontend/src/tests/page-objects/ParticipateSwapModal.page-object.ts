import { AdditionalInfoFormPo } from "$tests/page-objects/AdditionalInfoForm.page-object";
import { AdditionalInfoReviewPo } from "$tests/page-objects/AdditionalInfoReview.page-object";
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

  getAdditionalInfoFormPo(): AdditionalInfoFormPo {
    return AdditionalInfoFormPo.under(this.root);
  }

  getAdditionalInfoReviewPo(): AdditionalInfoReviewPo {
    return AdditionalInfoReviewPo.under(this.root);
  }

  getInProgressPo(): InProgressPo {
    return InProgressPo.under(this.root);
  }

  isSaleInProgress(): Promise<boolean> {
    return this.getInProgressPo().isPresent();
  }

  async participate({
    amount,
    acceptConditions,
  }: {
    amount: number;
    acceptConditions: boolean;
  }): Promise<void> {
    const formPo = this.getTransactionFormPo();
    await formPo.enterAmount(amount);
    const info = this.getAdditionalInfoFormPo();
    if (acceptConditions) {
      await info.toggleConditionsAccepted();
    }
    await formPo.clickContinue();
    await this.getAdditionalInfoReviewPo().clickCheckbox();
    await this.getTransactionReviewPo().clickSend();
  }
}
