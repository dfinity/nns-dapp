import type { ButtonPo } from "$tests/page-objects/Button.page-object";
import { CollapsiblePo } from "$tests/page-objects/Collapsible.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class FollowTopicSectionPo extends BasePageObject {
  private readonly topic: number;

  constructor({
    element,
    topic,
  }: {
    element: PageObjectElement;
    topic: number;
  }) {
    super(element);
    this.topic = topic;
  }

  static under({
    element,
    topic,
  }: {
    element: PageObjectElement;
    topic: number;
  }): FollowTopicSectionPo {
    return new FollowTopicSectionPo({
      element: element.byTestId(`follow-topic-${topic}-section`),
      topic,
    });
  }

  getCollapsiblePo(): CollapsiblePo {
    return CollapsiblePo.under({
      element: this.root,
      testId: "collapsible",
    });
  }

  getAddFolloweeButtonPo(): ButtonPo {
    return this.getButton("open-new-followee-modal");
  }

  async getBadgeNumber(): Promise<number> {
    return Number(await this.getText(`topic-${this.topic}-followees-badge`));
  }
}
