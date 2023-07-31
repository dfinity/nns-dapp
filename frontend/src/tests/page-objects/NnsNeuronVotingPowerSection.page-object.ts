import { NnsNeuronDissolveDelayActionItemPo } from "$tests/page-objects/NnsNeuronDissolveDelayActionItem.page-object";
import { NnsNeuronStateItemActionPo } from "$tests/page-objects/NnsNeuronStateItemAction.page-object";
import { NnsStakeItemActionPo } from "$tests/page-objects/NnsStakeItemAction.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { ExpandableSectionPo } from "./ExpandableSection.page-object";

export class NnsNeuronVotingPowerSectionPo extends ExpandableSectionPo {
  private static readonly TID = "nns-neuron-voting-power-section-component";

  static under({
    element,
  }: {
    element: PageObjectElement;
  }): NnsNeuronVotingPowerSectionPo {
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

  clickDisburse(): Promise<void> {
    return this.getNeuronStateItemActionPo().clickDisburse();
  }
}
