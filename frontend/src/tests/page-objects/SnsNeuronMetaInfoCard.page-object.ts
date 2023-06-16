import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { SnsNeuronAgePo } from "./SnsNeuronAge.page-object";

export class SnsNeuronMetaInfoCardPo extends BasePageObject {
  static readonly TID = "sns-neuron-meta-info-card-component";

  static under(element: PageObjectElement): SnsNeuronMetaInfoCardPo {
    return new SnsNeuronMetaInfoCardPo(
      element.byTestId(SnsNeuronMetaInfoCardPo.TID)
    );
  }

  getNeuronAgePo(): SnsNeuronAgePo {
    return SnsNeuronAgePo.under(this.root);
  }

  getNeuronAge(): Promise<string> {
    return this.getNeuronAgePo().getNeuronAge();
  }

  hasNeuronAge(): Promise<boolean> {
    return this.getNeuronAgePo().ageIsPresent();
  }
}
