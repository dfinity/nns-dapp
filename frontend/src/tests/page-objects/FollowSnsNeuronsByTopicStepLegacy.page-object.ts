import { ButtonPo } from "$tests/page-objects/Button.page-object";
import { FollowSnsNeuronsByTopicLegacyFolloweePo } from "$tests/page-objects/FollowSnsNeuronsByTopicLegacyFollowee.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class FollowSnsNeuronsByTopicStepLegacyPo extends BasePageObject {
  private static readonly TID =
    "follow-sns-neurons-by-topic-step-legacy-component";

  static under(
    element: PageObjectElement
  ): FollowSnsNeuronsByTopicStepLegacyPo {
    return new FollowSnsNeuronsByTopicStepLegacyPo(
      element.byTestId(FollowSnsNeuronsByTopicStepLegacyPo.TID)
    );
  }

  async getTopicNames(): Promise<string[]> {
    const elements = await this.root.allByTestId("topic-name");
    return Promise.all(elements.map((po) => po.getText()));
  }

  async getFollowSnsNeuronsByTopicLegacyFolloweePos(): Promise<
    FollowSnsNeuronsByTopicLegacyFolloweePo[]
  > {
    return FollowSnsNeuronsByTopicLegacyFolloweePo.allUnder(this.root);
  }

  getBackButtonPo(): ButtonPo {
    return ButtonPo.under({
      element: this.root,
      testId: "back-button",
    });
  }

  getNextButtonPo(): ButtonPo {
    return ButtonPo.under({
      element: this.root,
      testId: "next-button",
    });
  }

  clickNextButton(): Promise<void> {
    return this.getNextButtonPo().click();
  }

  clickBackButton(): Promise<void> {
    return this.getBackButtonPo().click();
  }
}
