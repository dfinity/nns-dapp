import { BasePageObject } from "$tests/page-objects/base.page-object";
import { NnsNeuronCardTitlePo } from "$tests/page-objects/NnsNeuronCardTitle.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NnsNeuronCardPo extends BasePageObject {
  private static readonly TID = "nns-neuron-card-component";

  static async allUnder(
    element: PageObjectElement
  ): Promise<NnsNeuronCardPo[]> {
    return Array.from(await element.allByTestId(NnsNeuronCardPo.TID)).map(
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
