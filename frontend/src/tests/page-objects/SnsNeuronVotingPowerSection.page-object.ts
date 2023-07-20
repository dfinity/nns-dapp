import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { SnsStakeItemActionPo } from "./SnsStakeItemAction.page-object";

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

  getStakeItemActionPo(): SnsStakeItemActionPo {
    return SnsStakeItemActionPo.under(this.root);
  }

  hasStakeItemAction(): Promise<boolean> {
    return this.getStakeItemActionPo().isPresent();
  }
}
