import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
export class NnsNeuronCardTitlePo extends BasePageObject {
  static readonly tid = "neuron-card-title";

  private constructor(root: PageObjectElement) {
    super(root);
  }

  static under(element: PageObjectElement): NnsNeuronCardTitlePo | null {
    const el = element.querySelector(`[data-tid=${NnsNeuronCardTitlePo.tid}]`);
    return el && new NnsNeuronCardTitlePo(el);
  }

  getNeuronId(): Promise<string> {
    return this.root.querySelector("[data-tid=neuron-id]").getText();
  }
}
