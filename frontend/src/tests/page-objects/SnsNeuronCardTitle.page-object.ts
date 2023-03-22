import { HashPo } from "$tests/page-objects/Hash.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class SnsNeuronCardTitlePo {
  static readonly tid = "sns-neuron-card-title";

  root: PageObjectElement;

  private constructor(root: PageObjectElement) {
    this.root = root;
  }

  static under(element: PageObjectElement): SnsNeuronCardTitlePo | null {
    const el = element.querySelector(`[data-tid=${SnsNeuronCardTitlePo.tid}]`);
    return el && new SnsNeuronCardTitlePo(el);
  }

  getNeuronId(): string {
    return HashPo.under(
      this.root.querySelector("[data-tid=neuron-id-container]")
    ).getText();
  }
}
