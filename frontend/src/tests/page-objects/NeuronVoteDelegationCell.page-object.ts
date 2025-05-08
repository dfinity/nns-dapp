import { TooltipPo } from "$tests/page-objects/Tooltip.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export default class NeuronVoteDelegationCellPo extends BasePageObject {
  private static readonly TID = "neuron-vote-delegation-cell-component";

  static under(element: PageObjectElement): NeuronVoteDelegationCellPo {
    return new NeuronVoteDelegationCellPo(
      element.byTestId(NeuronVoteDelegationCellPo.TID)
    );
  }

  async getVoteDelegationState(): Promise<string> {
    return ((await this.root.getClasses()) ?? [])[0];
  }

  getTooltipPo(): TooltipPo {
    return TooltipPo.under(this.root);
  }

  getTooltipText(): Promise<string> {
    return this.getTooltipPo().getTooltipText();
  }
}
