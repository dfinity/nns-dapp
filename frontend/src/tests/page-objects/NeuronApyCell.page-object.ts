import { ApyDisplayPo } from "$tests/page-objects/ApyDisplay.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NeuronApyCellPo extends BasePageObject {
  private static readonly TID = "neuron-apy-cell-component";

  static under(element: PageObjectElement): NeuronApyCellPo {
    return new NeuronApyCellPo(element.byTestId(NeuronApyCellPo.TID));
  }

  getApyDisplayPo(): ApyDisplayPo {
    return ApyDisplayPo.under(this.root);
  }
}
