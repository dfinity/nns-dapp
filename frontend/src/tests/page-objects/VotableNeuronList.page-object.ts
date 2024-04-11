import { TooltipPo } from "$tests/page-objects/Tooltip.page-object";
import { VotingNeuronSelectListPo } from "$tests/page-objects/VotingNeuronSelectList.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class VotableNeuronListPo extends BasePageObject {
  private static readonly TID = "votable-neurons";

  static under(element: PageObjectElement): VotableNeuronListPo {
    return new VotableNeuronListPo(element.byTestId(VotableNeuronListPo.TID));
  }

  getVotingNeuronSelectListPo(): VotingNeuronSelectListPo {
    return VotingNeuronSelectListPo.under(this.root);
  }

  getTooltipPo(): TooltipPo {
    return TooltipPo.under(this.root);
  }

  getTitle() {
    return this.getText("voting-collapsible-toolbar-neurons");
  }

  getDisplayedTotalSelectedVotingPower(): Promise<string> {
    return this.getText("voting-collapsible-toolbar-voting-power");
  }
}
