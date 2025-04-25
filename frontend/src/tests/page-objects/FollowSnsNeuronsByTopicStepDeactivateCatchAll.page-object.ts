import { ButtonPo } from "$tests/page-objects/Button.page-object";
import { FollowSnsNeuronsByTopicLegacyFolloweePo } from "$tests/page-objects/FollowSnsNeuronsByTopicLegacyFollowee.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class FollowSnsNeuronsByTopicStepDeactivateCatchAllPo extends BasePageObject {
  private static readonly TID =
    "follow-sns-neurons-by-topic-step-deactivate-catch-all-component";

  static under(
    element: PageObjectElement
  ): FollowSnsNeuronsByTopicStepDeactivateCatchAllPo {
    return new FollowSnsNeuronsByTopicStepDeactivateCatchAllPo(
      element.byTestId(FollowSnsNeuronsByTopicStepDeactivateCatchAllPo.TID)
    );
  }

  async getFollowSnsNeuronsByTopicLegacyFolloweePos(): Promise<
    FollowSnsNeuronsByTopicLegacyFolloweePo[]
  > {
    return FollowSnsNeuronsByTopicLegacyFolloweePo.allUnder(this.root);
  }

  getCancelButtonPo(): ButtonPo {
    return ButtonPo.under({
      element: this.root,
      testId: "cancel-button",
    });
  }

  getConfirmButtonPo(): ButtonPo {
    return ButtonPo.under({
      element: this.root,
      testId: "confirm-button",
    });
  }

  clickConfirmButton(): Promise<void> {
    return this.getConfirmButtonPo().click();
  }

  clickCancelButton(): Promise<void> {
    return this.getCancelButtonPo().click();
  }
}
