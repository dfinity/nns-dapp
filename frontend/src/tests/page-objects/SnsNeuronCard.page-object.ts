import { AmountDisplayPo } from "$tests/page-objects/AmountDisplay.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import { SnsNeuronCardTitlePo } from "$tests/page-objects/SnsNeuronCardTitle.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class SnsNeuronCardPo extends BasePageObject {
  private static readonly TID = "sns-neuron-card-component";

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

  getAmountDisplayPo(): AmountDisplayPo {
    return AmountDisplayPo.under(this.root);
  }

  getNeuronId(): Promise<string> {
    return this.getCardTitlePo().getNeuronId();
  }

  getStake(): Promise<string> {
    return this.getAmountDisplayPo().getAmount();
  }
}
