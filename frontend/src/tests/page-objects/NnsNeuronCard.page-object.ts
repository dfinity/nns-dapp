import { BasePageObject } from "$tests/page-objects/base.page-object";
import { NnsNeuronCardTitlePo } from "$tests/page-objects/NnsNeuronCardTitle.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NnsNeuronCardPo extends BasePageObject {
  static readonly tid = "nns-neuron-card-component";

  private constructor(root: PageObjectElement) {
    super(root);
  }

  static async allUnder(
    element: PageObjectElement
  ): Promise<NnsNeuronCardPo[]> {
    return Array.from(await element.allByTestId(NnsNeuronCardPo.tid)).map(
      (el) => new NnsNeuronCardPo(el)
    );
  }

  getCardTitlePo(): NnsNeuronCardTitlePo {
    return NnsNeuronCardTitlePo.under(this.root);
  }

  getNeuronId(): Promise<string> {
    return this.getCardTitlePo().getNeuronId();
  }
}
