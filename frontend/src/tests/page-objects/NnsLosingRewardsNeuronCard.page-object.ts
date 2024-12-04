import { CardPo } from "$tests/page-objects/Card.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { FolloweePo } from "./Followee.page-object";

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
}
