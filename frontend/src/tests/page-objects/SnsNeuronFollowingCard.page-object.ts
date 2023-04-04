import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class SnsNeuronFollowingCardPo extends BasePageObject {
  static readonly TID = "sns-neuron-following-card-component";

  static under(element: PageObjectElement): SnsNeuronFollowingCardPo {
    return new SnsNeuronFollowingCardPo(
      element.byTestId(SnsNeuronFollowingCardPo.TID)
    );
  }
}
