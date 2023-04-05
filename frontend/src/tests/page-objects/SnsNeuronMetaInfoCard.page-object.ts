import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class SnsNeuronMetaInfoCardPo extends BasePageObject {
  static readonly TID = "sns-neuron-meta-info-card-component";

  static under(element: PageObjectElement): SnsNeuronMetaInfoCardPo {
    return new SnsNeuronMetaInfoCardPo(
      element.byTestId(SnsNeuronMetaInfoCardPo.TID)
    );
  }
}
