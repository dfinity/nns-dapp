import { ConfirmDisburseNeuronPo } from "$tests/page-objects/ConfirmDisburseNeuron.page-object";
import { NnsDestinationAddressPo } from "$tests/page-objects/NnsDestinationAddress.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class DisburseNnsNeuronModalPo extends BasePageObject {
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
    await this.getNnsDestinationAddressPo().selectMainAccount();
    await this.getConfirmDisburseNeuronPo().clickConfirm();
  }
}
