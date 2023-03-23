import { BasePageObject } from "$tests/page-objects/base.page-object";
import { SnsNeuronCardTitlePo } from "$tests/page-objects/SnsNeuronCardTitle.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class SnsNeuronCardPo extends BasePageObject {
  static readonly tid = "sns-neuron-card-component";

  private constructor(root: PageObjectElement) {
    super(root);
  }

  static allUnder(element: PageObjectElement): SnsNeuronCardPo[] {
    return Array.from(
      element.querySelectorAll(`[data-tid=${SnsNeuronCardPo.tid}]`)
    ).map((el) => new SnsNeuronCardPo(el));
  }

  getCardTitlePo(): SnsNeuronCardTitlePo {
    return SnsNeuronCardTitlePo.under(this.root);
  }

  getNeuronId(): Promise<string> {
    return this.getCardTitlePo().getNeuronId();
  }
}
