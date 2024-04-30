import { VotingPowerDisplayPo } from "$tests/page-objects/VotingPowerDisplay.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class MyVotesPo extends BasePageObject {
  private static readonly TID = "my-votes-component";

  static under(element: PageObjectElement): MyVotesPo {
    return new MyVotesPo(element.byTestId(MyVotesPo.TID));
  }

  getVotingPowerDisplayPosition(): Promise<VotingPowerDisplayPo[]> {
    return VotingPowerDisplayPo.allUnder(this.root);
  }

  async getNeuronIds(): Promise<string[]> {
    const elements = await this.root.allByTestId("neuron-id");
    return Promise.all(elements.map((el) => el.getText()));
  }

  async getDisplayedVotingPowers(): Promise<string[]> {
    const votingPowerDisplaydPos = await this.getVotingPowerDisplayPosition();
    return Promise.all(
      votingPowerDisplaydPos.map((po) => po.getDisplayedVotingPower())
    );
  }

  async getExactVotingPowers(): Promise<string[]> {
    const votingPowerDisplaydPos = await this.getVotingPowerDisplayPosition();
    return Promise.all(
      votingPowerDisplaydPos.map((po) => po.getExactVotingPower())
    );
  }
}
