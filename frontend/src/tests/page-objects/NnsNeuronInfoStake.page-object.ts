import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NnsNeuronInfoStakePo extends BasePageObject {
  private static readonly TID = "nns-neuron-info-stake-component";

  static under(element: PageObjectElement): NnsNeuronInfoStakePo {
    return new NnsNeuronInfoStakePo(element.byTestId(NnsNeuronInfoStakePo.TID));
  }

  clickDisburse(): Promise<void> {
    return this.click("disburse-button");
  }
}
