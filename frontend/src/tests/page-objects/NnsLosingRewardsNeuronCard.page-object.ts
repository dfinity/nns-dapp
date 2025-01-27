import { CardPo } from "$tests/page-objects/Card.page-object";
import { FolloweePo } from "$tests/page-objects/Followee.page-object";
import { NeuronTagPo } from "$tests/page-objects/NeuronTag.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NnsLosingRewardsNeuronCardPo extends CardPo {
  private static readonly TID = "nns-loosing-rewards-neuron-card-component";

  static under(element: PageObjectElement): NnsLosingRewardsNeuronCardPo {
    return new NnsLosingRewardsNeuronCardPo(
      element.byTestId(NnsLosingRewardsNeuronCardPo.TID)
    );
  }

  static async allUnder(
    element: PageObjectElement
  ): Promise<NnsLosingRewardsNeuronCardPo[]> {
    return Array.from(
      await element.allByTestId(NnsLosingRewardsNeuronCardPo.TID)
    ).map((el) => new NnsLosingRewardsNeuronCardPo(el));
  }

  async getFolloweePos(): Promise<FolloweePo[]> {
    return FolloweePo.allUnder(this.root);
  }

  async hasNoFollowingMessage(): Promise<boolean> {
    return this.isPresent("no-following");
  }

  async getNeuronId(): Promise<string> {
    return this.getElement("neuron-id").getText();
  }

  getNeuronTagPos(): Promise<NeuronTagPo[]> {
    return NeuronTagPo.allUnder(this.root);
  }

  async getNeuronTags(): Promise<string[]> {
    const pos = await this.getNeuronTagPos();
    return Promise.all(pos.map((po) => po.getText()));
  }
}
