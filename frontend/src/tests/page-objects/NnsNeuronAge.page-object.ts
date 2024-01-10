import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NnsNeuronAgePo extends BasePageObject {
  private static readonly TID = "nns-neuron-age-component";

  static under(element: PageObjectElement): NnsNeuronAgePo {
    return new NnsNeuronAgePo(element.byTestId(NnsNeuronAgePo.TID));
  }

  neuronAge(): Promise<string> {
    return this.getText("nns-neuron-age");
  }
}
