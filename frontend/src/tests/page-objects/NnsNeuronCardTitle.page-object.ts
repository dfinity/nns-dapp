import type { PageObjectElement } from "$tests/types/page-object.types";
export class NnsNeuronCardTitlePo {
  static readonly tid = "neuron-card-title";

  root: PageObjectElement;

  private constructor(root: PageObjectElement) {
    this.root = root;
  }

  static under(element: PageObjectElement): NnsNeuronCardTitlePo | null {
    const el = element.querySelector(`[data-tid=${NnsNeuronCardTitlePo.tid}]`);
    return el && new NnsNeuronCardTitlePo(el);
  }

  getNeuronId(): Promise<string> {
    return this.root.querySelector("[data-tid=neuron-id]").getText();
  }
}
