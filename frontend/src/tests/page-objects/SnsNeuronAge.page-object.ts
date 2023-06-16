import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { KeyValuePairPo } from "./KeyValuePair.page-object";

export class SnsNeuronAgePo extends BasePageObject {
  static readonly TID = "sns-neuron-age-component";

  static under(element: PageObjectElement): SnsNeuronAgePo {
    return new SnsNeuronAgePo(element.byTestId(SnsNeuronAgePo.TID));
  }

  getKeyValuePairPo(): KeyValuePairPo {
    return KeyValuePairPo.under({
      element: this.root,
      testId: "sns-neuron-age",
    });
  }

  getNeuronAge(): Promise<string> {
    return this.getKeyValuePairPo().getValueText();
  }

  ageIsPresent(): Promise<boolean> {
    return this.getKeyValuePairPo().isPresent();
  }
}
