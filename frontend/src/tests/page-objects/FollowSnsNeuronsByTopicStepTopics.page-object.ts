import { ButtonPo } from "$tests/page-objects/Button.page-object";
import type { FollowSnsNeuronsByTopicFolloweePo } from "$tests/page-objects/FollowSnsNeuronsByTopicFollowee.page-object";
import { FollowSnsNeuronsByTopicItemPo } from "$tests/page-objects/FollowSnsNeuronsByTopicItem.page-object";
import { FollowSnsNeuronsByTopicLegacyFolloweePo } from "$tests/page-objects/FollowSnsNeuronsByTopicLegacyFollowee.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

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
    const groupElementPo = this.getElement("critical-topic-group");
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

  async getTopicItemPoByName(
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
    return (await this.getTopicItemPoByName(topicName)).getCheckboxPo().click();
  }

  async getTopicSelectionByName(topicName: string): Promise<boolean> {
    return (await this.getTopicItemPoByName(topicName))
      .getCheckboxPo()
      .isChecked();
  }

  async getTopicFolloweePos(
    topicName: string
  ): Promise<FollowSnsNeuronsByTopicFolloweePo[]> {
    return (await this.getTopicItemPoByName(topicName)).getFolloweesPo();
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

  getDeactivateCatchAllButtonPo(): ButtonPo {
    return ButtonPo.under({
      element: this.root,
      testId: "deactivate-catch-all-button",
    });
  }

  async getFollowSnsNeuronsByTopicLegacyFolloweePos(): Promise<
    FollowSnsNeuronsByTopicLegacyFolloweePo[]
  > {
    return FollowSnsNeuronsByTopicLegacyFolloweePo.allUnder(this.root);
  }

  clickNextButton(): Promise<void> {
    return this.getNextButtonPo().click();
  }

  clickCancelButton(): Promise<void> {
    return this.getCancelButtonPo().click();
  }

  clickDeactivateCatchAllButton(): Promise<void> {
    return this.getDeactivateCatchAllButtonPo().click();
  }
}
