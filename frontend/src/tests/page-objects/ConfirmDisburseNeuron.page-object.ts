import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ConfirmDisburseNeuronPo extends BasePageObject {
  private static readonly TID = "confirm-disburse-screen";

  static under(element: PageObjectElement): ConfirmDisburseNeuronPo {
    return new ConfirmDisburseNeuronPo(
      element.byTestId(ConfirmDisburseNeuronPo.TID)
    );
  }

  clickConfirm(): Promise<void> {
    return this.click("disburse-neuron-button");
  }
}
