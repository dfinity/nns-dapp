import { DisburseNnsNeuronModalPo } from "$tests/page-objects/DisburseNnsNeuronModal.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NnsNeuronModalsPo extends BasePageObject {
  private static readonly TID = "nns-neuron-modals-component";

  static under(element: PageObjectElement): NnsNeuronModalsPo {
    return new NnsNeuronModalsPo(element.byTestId(NnsNeuronModalsPo.TID));
  }

  getDisburseNnsNeuronModalPo(): DisburseNnsNeuronModalPo {
    return DisburseNnsNeuronModalPo.under(this.root);
  }
}
