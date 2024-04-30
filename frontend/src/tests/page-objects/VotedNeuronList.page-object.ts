import { MyVotesPo } from "$tests/page-objects/MyVotes.page-object";
import { VotingPowerDisplayPo } from "$tests/page-objects/VotingPowerDisplay.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class VotedNeuronListPo extends BasePageObject {
  private static readonly TID = "voted-neurons";

  static under(element: PageObjectElement): VotedNeuronListPo {
    return new VotedNeuronListPo(element.byTestId(VotedNeuronListPo.TID));
  }

  // There are multiple VotingPowerDisplays in the component but the first one
  // has the total voted voting power.
  getTotalVotingPowerDisplayPo(): VotingPowerDisplayPo {
    return VotingPowerDisplayPo.under(this.root);
  }

  getMyVotesPo(): MyVotesPo {
    return MyVotesPo.under(this.root);
  }

  async getHeadline(): Promise<string> {
    return (await this.getText("voted-neurons-headline")).trim();
  }

  getDisplayedTotalVotingPower(): Promise<string> {
    return this.getTotalVotingPowerDisplayPo().getDisplayedVotingPower();
  }

  getExactTotalVotingPower(): Promise<string> {
    return this.getTotalVotingPowerDisplayPo().getExactVotingPower();
  }
}
