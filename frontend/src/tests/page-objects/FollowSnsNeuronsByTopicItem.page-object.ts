import { ButtonPo } from "$tests/page-objects/Button.page-object";
import { CheckboxPo } from "$tests/page-objects/Checkbox.page-object";
import { CollapsiblePo } from "$tests/page-objects/Collapsible.page-object";
import { FollowSnsNeuronsByTopicFolloweePo } from "$tests/page-objects/FollowSnsNeuronsByTopicFollowee.page-object";
import { FollowSnsNeuronsByTopicLegacyFolloweePo } from "$tests/page-objects/FollowSnsNeuronsByTopicLegacyFollowee.page-object";
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
      (element) => new FollowSnsNeuronsByTopicItemPo(element)
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
    return this.getText("topic-name");
  }

  getTopicDescription(): Promise<string> {
    return this.getText("topic-description");
  }

  getStatusIcon(): PageObjectElement {
    return this.getElement("topic-following-status");
  }

  getFolloweesPo(): Promise<FollowSnsNeuronsByTopicFolloweePo[]> {
    return FollowSnsNeuronsByTopicFolloweePo.allUnder(this.root);
  }

  async hasFollowingStatusIcon(): Promise<boolean> {
    return (await this.getStatusIcon().getClasses()).includes(
      "isFollowingByTopic"
    );
  }

  async getFolloweesNeuronIds(): Promise<string[]> {
    return Promise.all(
      (await this.getFolloweesPo()).map(
        async (followee) => await followee.getNeuronHashPo().getFullText()
      )
    );
  }

  async getFollowSnsNeuronsByTopicLegacyFolloweePos(): Promise<
    FollowSnsNeuronsByTopicLegacyFolloweePo[]
  > {
    return FollowSnsNeuronsByTopicLegacyFolloweePo.allUnder(this.root);
  }

  async getLegacyFolloweeNeuronIds(): Promise<string[]> {
    const pos = await this.getFollowSnsNeuronsByTopicLegacyFolloweePos();
    return Promise.all(
      pos.map(
        async (followee) =>
          await followee
            .getFollowSnsNeuronsByTopicFolloweePo()
            .getNeuronHashPo()
            .getFullText()
      )
    );
  }

  async getLegacyFolloweeNsFunctionNames(): Promise<string[]> {
    const pos = await this.getFollowSnsNeuronsByTopicLegacyFolloweePos();
    return Promise.all(
      pos.map(async (followee) => await followee.getNsFunctionName())
    );
  }
}
