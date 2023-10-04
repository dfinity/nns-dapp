import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NnsNeuronCardTitlePo extends BasePageObject {
  private static readonly TID = "neuron-card-title";

  static under(element: PageObjectElement): NnsNeuronCardTitlePo {
    return new NnsNeuronCardTitlePo(element.byTestId(NnsNeuronCardTitlePo.TID));
  }

  getNeuronId(): Promise<string> {
    return this.root.querySelector("[data-tid=neuron-id]").getText();
  }

  async getNeuronTags(): Promise<string[]> {
    const elements = await this.root.allByTestId("neuron-tag");
    return Promise.all(elements.map((tag) => tag.getText()));
  }
}
