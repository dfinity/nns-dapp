import { ButtonPo } from "$tests/page-objects/Button.page-object";
import { CheckboxPo } from "$tests/page-objects/Checkbox.page-object";
import { CollapsiblePo } from "$tests/page-objects/Collapsible.page-object";
import { FollowNnsNeuronsByTopicFolloweePo } from "$tests/page-objects/FollowNnsNeuronsByTopicFollowee.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class FollowNnsNeuronsByTopicItemPo extends BasePageObject {
  private static readonly TID = "follow-nns-neurons-by-topic-item-component";

  static under(element: PageObjectElement): FollowNnsNeuronsByTopicItemPo {
    return new FollowNnsNeuronsByTopicItemPo(
      element.byTestId(FollowNnsNeuronsByTopicItemPo.TID)
    );
  }

  static async allUnder(
    element: PageObjectElement
  ): Promise<FollowNnsNeuronsByTopicItemPo[]> {
    return (await element.allByTestId(FollowNnsNeuronsByTopicItemPo.TID)).map(
      (element) => new FollowNnsNeuronsByTopicItemPo(element)
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

  getFolloweesPo(): Promise<FollowNnsNeuronsByTopicFolloweePo[]> {
    return FollowNnsNeuronsByTopicFolloweePo.allUnder(this.root);
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
}
