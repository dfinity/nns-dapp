import type { PageObjectElement } from "$tests/types/page-object.types";
import { BasePageObject } from "./base.page-object";
import { ButtonPo } from "./Button.page-object";
import { FollowSnsNeuronsByTopicItemPo } from "./FollowSnsNeuronsByTopicItem.page-object";

export class FollowSnsNeuronsByTopicStepTopicsPo extends BasePageObject {
  private static readonly TID =
    "follow-sns-neurons-by-topic-step-topics-component";

  static under(
    element: PageObjectElement
  ): FollowSnsNeuronsByTopicStepTopicsPo {
    return new FollowSnsNeuronsByTopicStepTopicsPo(
      element.byTestId(FollowSnsNeuronsByTopicStepTopicsPo.TID)
    );
  }

  getCriticalFollowSnsNeuronsByTopicItemPos(): Promise<
    FollowSnsNeuronsByTopicItemPo[]
  > {
    const groupElementPo = this.root.byTestId("critical-topic-group");
    return FollowSnsNeuronsByTopicItemPo.allUnder(groupElementPo);
  }

  getNonCriticalFollowSnsNeuronsByTopicItemPos(): Promise<
    FollowSnsNeuronsByTopicItemPo[]
  > {
    const groupElementPo = this.root.byTestId("non-critical-topic-group");
    return FollowSnsNeuronsByTopicItemPo.allUnder(groupElementPo);
  }

  async getCriticalTopicItemNames(): Promise<string[]> {
    const itemPos = await this.getCriticalFollowSnsNeuronsByTopicItemPos();
    return Promise.all(itemPos.map((itemPo) => itemPo.getTopicName()));
  }

  async getNonCriticalTopicItemNames(): Promise<string[]> {
    const itemPos = await this.getNonCriticalFollowSnsNeuronsByTopicItemPos();
    return Promise.all(itemPos.map((itemPo) => itemPo.getTopicName()));
  }

  async getCriticalTopicItemDescriptions(): Promise<string[]> {
    const itemPos = await this.getCriticalFollowSnsNeuronsByTopicItemPos();
    return Promise.all(itemPos.map((itemPo) => itemPo.getTopicDescription()));
  }

  async getNonCriticalTopicItemDescriptions(): Promise<string[]> {
    const itemPos = await this.getNonCriticalFollowSnsNeuronsByTopicItemPos();
    return Promise.all(itemPos.map((itemPo) => itemPo.getTopicDescription()));
  }

  async getTopicItemPosByName(
    topicName: string
  ): Promise<FollowSnsNeuronsByTopicItemPo> {
    const itemPos = [
      ...(await this.getCriticalFollowSnsNeuronsByTopicItemPos()),
      ...(await this.getNonCriticalFollowSnsNeuronsByTopicItemPos()),
    ];
    for (const itemPo of itemPos) {
      const name = await itemPo.getTopicName();
      if (name === topicName) {
        return itemPo;
      }
    }
    throw new Error(`Topic with name ${topicName} not found`);
  }

  async clickTopicItemByName(topicName: string): Promise<void> {
    return (await this.getTopicItemPosByName(topicName))
      .getCheckboxPo()
      .click();
  }

  async getTopicSelectionByName(topicName: string): Promise<boolean> {
    return (await this.getTopicItemPosByName(topicName))
      .getCheckboxPo()
      .isChecked();
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
