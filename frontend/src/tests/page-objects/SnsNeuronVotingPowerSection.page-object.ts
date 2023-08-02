import { SnsNeuronDissolveDelayItemActionPo } from "$tests/page-objects/SnsNeuronDissolveDelayItemAction.page-object";
import { SnsNeuronStateItemActionPo } from "$tests/page-objects/SnsNeuronStateItemAction.page-object";
import { SnsStakeItemActionPo } from "$tests/page-objects/SnsStakeItemAction.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { BasePageObject } from "./base.page-object";

export class SnsNeuronVotingPowerSectionPo extends BasePageObject {
  private static readonly TID = "sns-neuron-voting-power-section-component";

  static under(element: PageObjectElement): SnsNeuronVotingPowerSectionPo {
    return new SnsNeuronVotingPowerSectionPo(
      element.byTestId(SnsNeuronVotingPowerSectionPo.TID)
    );
  }

  getVotingPower(): Promise<string> {
    return this.getText("voting-power");
  }

  getDescription(): Promise<string> {
    return this.getText("voting-power-description");
  }

  getStakeItemActionPo(): SnsStakeItemActionPo {
    return SnsStakeItemActionPo.under(this.root);
  }

  hasStakeItemAction(): Promise<boolean> {
    return this.getStakeItemActionPo().isPresent();
  }

  getStateItemActionPo(): SnsNeuronStateItemActionPo {
    return SnsNeuronStateItemActionPo.under(this.root);
  }

  hasStateItemAction(): Promise<boolean> {
    return this.getStateItemActionPo().isPresent();
  }

  getDisslveDelayItemActionPo(): SnsNeuronDissolveDelayItemActionPo {
    return SnsNeuronDissolveDelayItemActionPo.under(this.root);
  }

  hasDissolveDelayItemActionPo(): Promise<boolean> {
    return this.getDisslveDelayItemActionPo().isPresent();
  }

  getStakeAmount(): Promise<string> {
    return this.getStakeItemActionPo().getStake();
  }

  clickIncrease(): Promise<void> {
    return this.getStakeItemActionPo().clickIncrease();
  }
}
