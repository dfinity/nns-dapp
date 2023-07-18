import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { NnsNeuronStateItemActionPo } from "./NnsNeuronStateItemAction.page-object";
import { NnsStakeItemActionPo } from "./NnsStakeItemAction.page-object";

export class NnsNeuronVotingPowerSectionPo extends BasePageObject {
  private static readonly TID = "nns-neuron-voting-power-section-component";

  static under(element: PageObjectElement): NnsNeuronVotingPowerSectionPo {
    return new NnsNeuronVotingPowerSectionPo(
      element.byTestId(NnsNeuronVotingPowerSectionPo.TID)
    );
  }

  getVotingPower(): Promise<string> {
    return this.getText("voting-power");
  }

  getStakeItemActionPo(): NnsStakeItemActionPo {
    return NnsStakeItemActionPo.under(this.root);
  }

  hasStakeItemAction(): Promise<boolean> {
    return this.getStakeItemActionPo().isPresent();
  }

  getNeuronStateItemActionPo(): NnsNeuronStateItemActionPo {
    return NnsNeuronStateItemActionPo.under(this.root);
  }

  hasNeuronStateItemAction(): Promise<boolean> {
    return this.getStakeItemActionPo().isPresent();
  }
}
