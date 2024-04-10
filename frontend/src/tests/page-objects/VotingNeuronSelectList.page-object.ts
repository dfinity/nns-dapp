import { VotingNeuronListItemPo } from "$tests/page-objects/VotingNeuronListItem.page-object";
<<<<<<< HEAD
=======
import { NnsProposalFiltersPo } from "$tests/page-objects/NnsProposalFilters.page-object";
import { PageBannerPo } from "$tests/page-objects/PageBanner.page-object";
import { ProposalCardPo } from "$tests/page-objects/ProposalCard.page-object";
import { SkeletonCardPo } from "$tests/page-objects/SkeletonCard.page-object";
>>>>>>> 42e4305c7 (Use page objects in VotingNeuronSelectList)
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
