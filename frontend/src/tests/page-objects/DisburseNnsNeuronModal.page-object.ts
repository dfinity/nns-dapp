import { ConfirmDisburseNeuronPo } from "$tests/page-objects/ConfirmDisburseNeuron.page-object";
import { ModalPo } from "$tests/page-objects/Modal.page-object";
import { NnsDestinationAddressPo } from "$tests/page-objects/NnsDestinationAddress.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class DisburseNnsNeuronModalPo extends ModalPo {
  private static readonly TID = "disburse-nns-neuron-modal-component";

  static under(element: PageObjectElement): DisburseNnsNeuronModalPo {
    return new DisburseNnsNeuronModalPo(
      element.byTestId(DisburseNnsNeuronModalPo.TID)
    );
  }

  getNnsDestinationAddressPo(): NnsDestinationAddressPo {
    return NnsDestinationAddressPo.under(this.root);
  }

  getConfirmDisburseNeuronPo(): ConfirmDisburseNeuronPo {
    return ConfirmDisburseNeuronPo.under(this.root);
  }

  async disburseNeuron(): Promise<void> {
    // Main account is selected by default.
    await this.getNnsDestinationAddressPo().clickContinue();
    await this.getConfirmDisburseNeuronPo().clickConfirm();
  }
}
