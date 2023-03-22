import { NnsNeuronCardTitlePo } from "$tests/page-objects/NnsNeuronCardTitle.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NnsNeuronCardPo {
  static readonly tid = "nns-neuron-card-component";

  root: PageObjectElement;

  private constructor(root: PageObjectElement) {
    this.root = root;
  }

  static allUnder(element: PageObjectElement): NnsNeuronCardPo[] {
    return Array.from(
      element.querySelectorAll(`[data-tid=${NnsNeuronCardPo.tid}]`)
    ).map((el) => new NnsNeuronCardPo(el));
  }

  getCardTitlePo(): NnsNeuronCardTitlePo {
    return NnsNeuronCardTitlePo.under(this.root);
  }

  getNeuronId(): string {
    return this.getCardTitlePo().getNeuronId();
  }
}
