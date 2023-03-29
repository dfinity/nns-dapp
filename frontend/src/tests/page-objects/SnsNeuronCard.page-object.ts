import { BasePageObject } from "$tests/page-objects/base.page-object";
import { SnsNeuronCardTitlePo } from "$tests/page-objects/SnsNeuronCardTitle.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class SnsNeuronCardPo extends BasePageObject {
  private static readonly TID = "sns-neuron-card-component";

  private constructor(root: PageObjectElement) {
    super(root);
  }

  static async allUnder(
    element: PageObjectElement
  ): Promise<SnsNeuronCardPo[]> {
    return Array.from(await element.allByTestId(SnsNeuronCardPo.TID)).map(
      (el) => new SnsNeuronCardPo(el)
    );
  }

  getCardTitlePo(): SnsNeuronCardTitlePo {
    return SnsNeuronCardTitlePo.under(this.root);
  }

  getNeuronId(): Promise<string> {
    return this.getCardTitlePo().getNeuronId();
  }
}
