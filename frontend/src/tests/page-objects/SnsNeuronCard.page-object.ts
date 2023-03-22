import { SnsNeuronCardTitlePo } from "$tests/page-objects/SnsNeuronCardTitle.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class SnsNeuronCardPo {
  static readonly tid = "sns-neuron-card-component";

  root: PageObjectElement;

  private constructor(root: PageObjectElement) {
    this.root = root;
  }

  static allUnder(element: PageObjectElement): SnsNeuronCardPo[] {
    return Array.from(
      element.querySelectorAll(`[data-tid=${SnsNeuronCardPo.tid}]`)
    ).map((el) => new SnsNeuronCardPo(el));
  }

  getCardTitlePo(): SnsNeuronCardTitlePo {
    return SnsNeuronCardTitlePo.under(this.root);
  }

  getNeuronId(): string {
    return this.getCardTitlePo().getNeuronId();
  }
}
