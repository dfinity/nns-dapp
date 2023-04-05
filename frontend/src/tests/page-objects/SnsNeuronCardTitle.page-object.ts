import { BasePageObject } from "$tests/page-objects/base.page-object";
import { HashPo } from "$tests/page-objects/Hash.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class SnsNeuronCardTitlePo extends BasePageObject {
  private static readonly TID = "sns-neuron-card-title";

  static under(element: PageObjectElement): SnsNeuronCardTitlePo {
    return new SnsNeuronCardTitlePo(element.byTestId(SnsNeuronCardTitlePo.TID));
  }

  getNeuronId(): Promise<string> {
    return HashPo.under(
      this.root.querySelector("[data-tid=neuron-id-container]")
    ).getText();
  }
}
