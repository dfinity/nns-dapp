import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NnsNeuronMetaInfoCardPageObjectPo extends BasePageObject {
  private static readonly TID = "nns-neuron-meta-info-card-component";

  static under(element: PageObjectElement): NnsNeuronMetaInfoCardPageObjectPo {
    return new NnsNeuronMetaInfoCardPageObjectPo(
      element.byTestId(NnsNeuronMetaInfoCardPageObjectPo.TID)
    );
  }

  async getVotingPower(): Promise<number> {
    return Number(this.getText("voting-power-value"));
  }
}
