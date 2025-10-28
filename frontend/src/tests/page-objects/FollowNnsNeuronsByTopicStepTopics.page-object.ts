import { ButtonPo } from "$tests/page-objects/Button.page-object";
import { FollowNnsNeuronsByTopicItemPo } from "$tests/page-objects/FollowNnsNeuronsByTopicItem.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class FollowNnsNeuronsByTopicStepTopicsPo extends BasePageObject {
  private static readonly TID =
    "follow-nns-neurons-by-topic-step-topics-component";

  static under(
    element: PageObjectElement
  ): FollowNnsNeuronsByTopicStepTopicsPo {
    return new FollowNnsNeuronsByTopicStepTopicsPo(
      element.byTestId(FollowNnsNeuronsByTopicStepTopicsPo.TID)
    );
  }

  async getTopicItemPos(): Promise<FollowNnsNeuronsByTopicItemPo[]> {
    return FollowNnsNeuronsByTopicItemPo.allUnder(this.root);
  }

  async getTopicItemPoByName(
    topicName: string
  ): Promise<FollowNnsNeuronsByTopicItemPo> {
    const items = await this.getTopicItemPos();
    for (const item of items) {
      const name = await item.getTopicName();
      if (name === topicName) return item;
    }
    throw new Error(`Topic item with name "${topicName}" not found`);
  }

  async clickTopicItemByName(topicName: string): Promise<void> {
    const item = await this.getTopicItemPoByName(topicName);
    await item.getCheckboxPo().click();
  }

  async getTopicSelectionByName(topicName: string): Promise<boolean> {
    const item = await this.getTopicItemPoByName(topicName);
    return item.getCheckboxPo().isChecked();
  }

  getCancelButtonPo(): ButtonPo {
    return ButtonPo.under({
      element: this.root,
      testId: "cancel-button",
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

  clickCancelButton(): Promise<void> {
    return this.getCancelButtonPo().click();
  }
}
