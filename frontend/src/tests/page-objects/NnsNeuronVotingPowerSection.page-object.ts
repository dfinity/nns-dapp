import { NnsNeuronDissolveDelayItemActionPo } from "$tests/page-objects/NnsNeuronDissolveDelayItemAction.page-object";
import { NnsNeuronStateItemActionPo } from "$tests/page-objects/NnsNeuronStateItemAction.page-object";
import { StakeItemActionPo } from "$tests/page-objects/StakeItemAction.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { BasePageObject } from "./base.page-object";

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

  getDescription(): Promise<string> {
    return this.getText("voting-power-description");
  }

  getStakeItemActionPo(): StakeItemActionPo {
    return StakeItemActionPo.under(this.root);
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

  getNeuronDissolveDelayItemActionPo(): NnsNeuronDissolveDelayItemActionPo {
    return NnsNeuronDissolveDelayItemActionPo.under(this.root);
  }

  hasNeuronDissolveDelayItemAction(): Promise<boolean> {
    return this.getNeuronDissolveDelayItemActionPo().isPresent();
  }

  clickDisburse(): Promise<void> {
    return this.getNeuronStateItemActionPo().clickDisburse();
  }
}
