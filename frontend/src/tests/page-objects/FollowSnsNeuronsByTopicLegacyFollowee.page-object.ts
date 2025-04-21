import { FollowSnsNeuronsByTopicFolloweePo } from "$tests/page-objects/FollowSnsNeuronsByTopicFollowee.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class FollowSnsNeuronsByTopicLegacyFolloweePo extends BasePageObject {
  private static readonly TID =
    "follow-sns-neurons-by-topic-legacy-followee-component";

  static under(
    element: PageObjectElement
  ): FollowSnsNeuronsByTopicLegacyFolloweePo {
    return new FollowSnsNeuronsByTopicLegacyFolloweePo(
      element.byTestId(FollowSnsNeuronsByTopicLegacyFolloweePo.TID)
    );
  }

  static async allUnder(
    element: PageObjectElement
  ): Promise<FollowSnsNeuronsByTopicLegacyFolloweePo[]> {
    return (
      await element.allByTestId(FollowSnsNeuronsByTopicLegacyFolloweePo.TID)
    ).map((element) => new FollowSnsNeuronsByTopicLegacyFolloweePo(element));
  }

  getFollowSnsNeuronsByTopicFolloweePo(): FollowSnsNeuronsByTopicFolloweePo {
    return FollowSnsNeuronsByTopicFolloweePo.under(this.root);
  }

  getNsFunctionName(): Promise<string> {
    return this.getText("ns-function");
  }
}
