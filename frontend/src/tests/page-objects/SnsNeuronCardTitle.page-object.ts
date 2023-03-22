import { BasePageObject } from "$tests/page-objects/base.page-object";
import { HashPo } from "$tests/page-objects/Hash.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class SnsNeuronCardTitlePo extends BasePageObject {
  static readonly tid = "sns-neuron-card-title";

  private constructor(root: PageObjectElement) {
    super(root);
  }

  static under(element: PageObjectElement): SnsNeuronCardTitlePo {
    return new SnsNeuronCardTitlePo(
      element.querySelector(`[data-tid=${SnsNeuronCardTitlePo.tid}]`)
    );
  }

  getNeuronId(): Promise<string> {
    return HashPo.under(
      this.root.querySelector("[data-tid=neuron-id-container]")
    ).getText();
  }
}
