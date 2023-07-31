import { NnsNeuronCardTitlePo } from "$tests/page-objects/NnsNeuronCardTitle.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NnsNeuronMetaInfoCardPageObjectPo extends BasePageObject {
  private static readonly TID = "nns-neuron-meta-info-card-component";

  static under(element: PageObjectElement): NnsNeuronMetaInfoCardPageObjectPo {
    return new NnsNeuronMetaInfoCardPageObjectPo(
      element.byTestId(NnsNeuronMetaInfoCardPageObjectPo.TID)
    );
  }

  getNnsNeuronCardTitlePo(): NnsNeuronCardTitlePo {
    return NnsNeuronCardTitlePo.under(this.root);
  }

  getNeuronId(): Promise<string> {
    return this.getNnsNeuronCardTitlePo().getNeuronId();
  }

  async getVotingPower(): Promise<number> {
    return Number(await this.getText("voting-power-value"));
  }
}
