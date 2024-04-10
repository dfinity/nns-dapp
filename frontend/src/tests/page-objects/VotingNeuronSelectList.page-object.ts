import { VotingNeuronListItemPo } from "$tests/page-objects/VotingNeuronListItem.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class VotingNeuronSelectListPo extends BasePageObject {
  private static readonly TID = "voting-neuron-select-list-component";

  static under(element: PageObjectElement): VotingNeuronSelectListPo {
    return new VotingNeuronSelectListPo(
      element.byTestId(VotingNeuronSelectListPo.TID)
    );
  }

  getVotingNeuronListItemPos(): Promise<VotingNeuronListItemPo[]> {
    return VotingNeuronListItemPo.allUnder(this.root);
  }
}
