import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NnsNeuronInfoPo extends BasePageObject {
  static under({
    element,
    testId,
  }: {
    element: PageObjectElement;
    testId: string;
  }): NnsNeuronInfoPo {
    return new NnsNeuronInfoPo(element.byTestId(testId));
  }

  getNeuronId(): Promise<string> {
    return this.getText("neuron-id");
  }
}
