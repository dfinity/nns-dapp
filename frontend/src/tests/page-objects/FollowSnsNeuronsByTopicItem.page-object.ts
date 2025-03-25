import type { PageObjectElement } from "$tests/types/page-object.types";
import { BasePageObject } from "./base.page-object";
import { ButtonPo } from "./Button.page-object";
import { CheckboxPo } from "./Checkbox.page-object";
import { CollapsiblePo } from "./Collapsible.page-object";

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
}
