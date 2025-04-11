import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { HashPo } from "./Hash.page-object";

export class FollowSnsNeuronsByTopicFolloweePo extends BasePageObject {
  private static readonly TID =
    "follow-sns-neurons-by-topic-followee-component";

  static under(element: PageObjectElement): FollowSnsNeuronsByTopicFolloweePo {
    return new FollowSnsNeuronsByTopicFolloweePo(
      element.byTestId(FollowSnsNeuronsByTopicFolloweePo.TID)
    );
  }

  static async allUnder(
    element: PageObjectElement
  ): Promise<FollowSnsNeuronsByTopicFolloweePo[]> {
    return (
      await element.allByTestId(FollowSnsNeuronsByTopicFolloweePo.TID)
    ).map((element) => FollowSnsNeuronsByTopicFolloweePo.under(element));
  }

  getNeuronHashPo(): HashPo {
    return HashPo.under(this.root);
  }

  clickRemoveButton(): Promise<void> {
    return this.click("remove-button");
  }
}
