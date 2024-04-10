import { CheckboxPo } from "$tests/page-objects/Checkbox.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class VotingNeuronListItemPo extends BasePageObject {
  private static readonly TID = "voting-neuron-list-item-component";

  static under(element: PageObjectElement): VotingNeuronListItemPo {
    return new VotingNeuronListItemPo(
      element.byTestId(VotingNeuronListItemPo.TID)
    );
  }

  getCheckboxPo(): CheckboxPo {
    return CheckboxPo.under({ element: this.root });
  }

  getNeuronId(): Promise<string> {
    return this.getText("neuron-id");
  }

  getDisplayedVotingPower(): Promise<string> {
    return this.getText("voting-neuron-select-voting-power");
  }
}
