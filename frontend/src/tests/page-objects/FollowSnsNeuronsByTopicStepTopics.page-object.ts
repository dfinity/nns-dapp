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

  getFollowSnsNeuronsByTopicItemPos(): Promise<
    FollowSnsNeuronsByTopicItemPo[]
  > {
    return FollowSnsNeuronsByTopicItemPo.allUnder(this.root);
  }

  async getFollowSnsNeuronsByTopicItemNames(): Promise<string[]> {
    const itemPos = await this.getFollowSnsNeuronsByTopicItemPos();
    return Promise.all(itemPos.map((itemPo) => itemPo.getTopicName()));
  }

  async getFollowSnsNeuronsByTopicItemDescriptions(): Promise<string[]> {
    const itemPos = await this.getFollowSnsNeuronsByTopicItemPos();
    return Promise.all(itemPos.map((itemPo) => itemPo.getTopicDescription()));
  }

  async getFollowSnsNeuronsByTopicItemSelections(): Promise<boolean[]> {
    const itemPos = await this.getFollowSnsNeuronsByTopicItemPos();
    return Promise.all(
      itemPos.map((itemPo) => itemPo.getCheckboxPo().isChecked())
    );
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
