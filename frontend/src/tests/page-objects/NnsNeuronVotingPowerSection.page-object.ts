import { NnsNeuronDissolveDelayActionItemPo } from "$tests/page-objects/NnsNeuronDissolveDelayItemAction.page-object";
import { NnsNeuronStateItemActionPo } from "$tests/page-objects/NnsNeuronStateItemAction.page-object";
import { NnsStakeItemActionPo } from "$tests/page-objects/NnsStakeItemAction.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

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
    return this.getNeuronStateItemActionPo().isPresent();
  }

  getNeuronDissolveDelayItemActionPo(): NnsNeuronDissolveDelayActionItemPo {
    return NnsNeuronDissolveDelayActionItemPo.under(this.root);
  }

  hasNeuronDissolveDelayItemAction(): Promise<boolean> {
    return this.getNeuronDissolveDelayItemActionPo().isPresent();
  }
}
