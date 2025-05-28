import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class IneligibleNeuronListPo extends BasePageObject {
  private static readonly TID = "ineligible-neurons";

  private constructor(root: PageObjectElement) {
    super(root);
  }

  static under(element: PageObjectElement): IneligibleNeuronListPo {
    return new IneligibleNeuronListPo(
      element.byTestId(IneligibleNeuronListPo.TID)
    );
  }

  async getNeuronIdTexts(): Promise<string[]> {
    return Promise.all(
      (await this.root.allByTestId("ineligible-neuron-id")).map((el) =>
        el.getText()
      )
    );
  }

  async getIneligibleReasonTexts(): Promise<string[]> {
    return Promise.all(
      (await this.root.allByTestId("ineligible-neuron-reason")).map((el) =>
        el.getText()
      )
    );
  }
}
