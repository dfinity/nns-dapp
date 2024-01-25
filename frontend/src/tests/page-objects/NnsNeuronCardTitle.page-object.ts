import { NeuronTagPo } from "$tests/page-objects/NeuronTag.page-object";
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
    const pos = await this.getNeuronTagPos();
    return Promise.all(pos.map((po) => po.getTagText()));
  }

  getNeuronTagPos(): Promise<NeuronTagPo[]> {
    return NeuronTagPo.allUnder(this.root);
  }
}
