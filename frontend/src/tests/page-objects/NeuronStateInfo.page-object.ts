import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NeuronStateInfoPo extends BasePageObject {
  private static readonly TID = "neuron-state-info";

  static under(element: PageObjectElement): NeuronStateInfoPo {
    return new NeuronStateInfoPo(element.byTestId(NeuronStateInfoPo.TID));
  }

  async getState(): Promise<string> {
    return (await this.getText()).trim();
  }
}
