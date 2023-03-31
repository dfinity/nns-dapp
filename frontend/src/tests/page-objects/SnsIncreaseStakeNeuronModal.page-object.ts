import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { TransactionModalPo } from "./TransactionModal.page-object";

export class SnsIncreaseStakeNeuronModalPo extends BasePageObject {
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

  getTransactionModalPo(): TransactionModalPo | null {
    return TransactionModalPo.under({
      element: this.root,
      testId: SnsIncreaseStakeNeuronModalPo.TID,
    });
  }
}
