import type { ButtonPo } from "$tests/page-objects/Button.page-object";
import { NnsNeuronCardPo } from "$tests/page-objects/NnsNeuronCard.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NnsNeuronInfoPo extends BasePageObject {
  static under({element, testId}: {
  element: PageObjectElement;
  testId: string;
  }): NnsNeuronInfoPo {
    return new NnsNeuronInfoPo(element.byTestId(testId));
  }

  getNeuronId(): Promise<string> {
    return this.getText("neuron-id");
  }
}
