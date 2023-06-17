import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class SnsNeuronMaturityCardPo extends BasePageObject {
  static readonly TID = "sns-neuron-maturity-card-component";

  static under(element: PageObjectElement): SnsNeuronMaturityCardPo {
    return new SnsNeuronMaturityCardPo(
      element.byTestId(SnsNeuronMaturityCardPo.TID)
    );
  }
}
