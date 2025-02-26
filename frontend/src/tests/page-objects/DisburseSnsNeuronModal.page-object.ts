import { ConfirmDisburseNeuronPo } from "$tests/page-objects/ConfirmDisburseNeuron.page-object";
import { ModalPo } from "$tests/page-objects/Modal.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class DisburseSnsNeuronModalPo extends ModalPo {
  private static readonly TID = "disburse-sns-neuron-modal-component";

  static under(element: PageObjectElement): DisburseSnsNeuronModalPo {
    return new DisburseSnsNeuronModalPo(
      element.byTestId(DisburseSnsNeuronModalPo.TID)
    );
  }

  getConfirmDisburseNeuronPo(): ConfirmDisburseNeuronPo {
    return ConfirmDisburseNeuronPo.under(this.root);
  }
}
