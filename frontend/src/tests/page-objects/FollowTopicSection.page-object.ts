import type { Topic } from "@dfinity/nns";
import { CollapsiblePo } from "$tests/page-objects/Collapsible.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class FollowTopicSectionPo extends BasePageObject {
  private readonly topic: Topic;

  constructor({
    element,
    topic,
  }:{
    element: PageObjectElement,
    topic: Topic,
  }) {
    super(element);
    this.topic = topic;
  }

  static under({
    element
    , topic,
  }:{
    element: PageObjectElement,
    topic: Topic,
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

  async getBadgeNumber(): Promise<number> {
    return Number(await this.getText(`topic-${this.topic}-followees-badge`));
  }
}
