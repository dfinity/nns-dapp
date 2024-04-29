import { BasePageObject } from "$tests/page-objects/base.page-object";
import { MyVotesPo } from "$tests/page-objects/MyVotes.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class VotedNeuronListPo extends BasePageObject {
  private static readonly TID = "voted-neurons";

  static under(element: PageObjectElement): VotedNeuronListPo {
    return new VotedNeuronListPo(element.byTestId(VotedNeuronListPo.TID));
  }

  getMyVotesPo(): MyVotesPo {
    return MyVotesPo.under(this.root);
  }

  async getHeadline(): Promise<string> {
    return (await this.getText("voted-neurons-headline")).trim();
  }

  getDisplayedTotalVotingPower(): Promise<string> {
    return this.getText("voted-voting-power");
  }
}
