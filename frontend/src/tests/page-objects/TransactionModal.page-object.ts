import { BasePageObject } from "$tests/page-objects/base.page-object";
import { TransactionFormPo } from "$tests/page-objects/TransactionForm.page-object";
import { TransactionReviewPo } from "$tests/page-objects/TransactionReview.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

// This should not be used directly but rather as a base class for specific
// transaction modals.
export class TransactionModalBasePo extends BasePageObject {
  getTransactionFormPo(): TransactionFormPo {
    return TransactionFormPo.under(this.root);
  }

  getTransactionReviewPo(): TransactionReviewPo {
    return TransactionReviewPo.under(this.root);
  }

  async transferToAccount({
    accountName,
    expectedAccountAddress,
    amount,
  }: {
    accountName: string;
    expectedAccountAddress: string;
    amount: number;
  }): Promise<void> {
    await this.getTransactionFormPo().transferToAccount({
      accountName,
      amount,
    });
    const review = this.getTransactionReviewPo();
    const destinationAddress = await review.getDestinationAddress();
    if (destinationAddress.trim() !== expectedAccountAddress.trim()) {
      throw new Error(
        `Destination address should be ${expectedAccountAddress} but was ${destinationAddress}.`
      );
    }
    await review.clickSend();
  }
}

export class TransactionModalPo extends TransactionModalBasePo {
  private static readonly TID = "transaction-modal-component";

  static under(element: PageObjectElement): TransactionModalPo | null {
    return new TransactionModalPo(element.byTestId(TransactionModalPo.TID));
  }
}
