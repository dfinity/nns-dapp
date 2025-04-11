import { ButtonPo } from "$tests/page-objects/Button.page-object";
import { CheckboxPo } from "$tests/page-objects/Checkbox.page-object";
import { CollapsiblePo } from "$tests/page-objects/Collapsible.page-object";
import { FollowSnsNeuronsByTopicFolloweePo } from "$tests/page-objects/FollowSnsNeuronsByTopicFollowee.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class FollowSnsNeuronsByTopicItemPo extends BasePageObject {
  private static readonly TID = "follow-sns-neurons-by-topic-item-component";

  static under(element: PageObjectElement): FollowSnsNeuronsByTopicItemPo {
    return new FollowSnsNeuronsByTopicItemPo(
      element.byTestId(FollowSnsNeuronsByTopicItemPo.TID)
    );
  }

  static async allUnder(
    element: PageObjectElement
  ): Promise<FollowSnsNeuronsByTopicItemPo[]> {
    return (await element.allByTestId(FollowSnsNeuronsByTopicItemPo.TID)).map(
      (element) => FollowSnsNeuronsByTopicItemPo.under(element)
    );
  }

  getCollapsiblePo(): CollapsiblePo {
    return CollapsiblePo.under({
      element: this.root,
      testId: "topic-collapsible",
    });
  }

  getExpandButtonPo(): ButtonPo {
    return ButtonPo.under({
      element: this.root,
      testId: "expand-button",
    });
  }

  clickExpandButton(): Promise<void> {
    return this.getExpandButtonPo().click();
  }

  getCheckboxPo(): CheckboxPo {
    return CheckboxPo.under({ element: this.root });
  }

  getTopicName(): Promise<string> {
    return this.root.byTestId("topic-name").getText();
  }

  getTopicDescription(): Promise<string> {
    return this.root.byTestId("topic-description").getText();
  }

  getFolloweesPo(): Promise<FollowSnsNeuronsByTopicFolloweePo[]> {
    return FollowSnsNeuronsByTopicFolloweePo.allUnder(this.root);
  }

  async getFolloweesNeuronIds(): Promise<string[]> {
    return Promise.all(
      (await this.getFolloweesPo()).map(
        async (followee) => await followee.getNeuronHashPo().getFullText()
      )
    );
  }
}
