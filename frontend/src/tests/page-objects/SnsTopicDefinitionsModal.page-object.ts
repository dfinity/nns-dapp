import { ButtonPo } from "$tests/page-objects/Button.page-object";
import { SnsTopicDefinitionsTopicPo } from "$tests/page-objects/SnsTopicDefinitionsTopic.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class SnsTopicDefinitionsModalPo extends BasePageObject {
  private static readonly TID = "sns-topic-definitions-modal-component";

  static under(element: PageObjectElement): SnsTopicDefinitionsModalPo {
    return new SnsTopicDefinitionsModalPo(
      element.byTestId(SnsTopicDefinitionsModalPo.TID)
    );
  }

  getCriticalTopicPos(): Promise<SnsTopicDefinitionsTopicPo[]> {
    const groupElementPo = this.root.byTestId("critical-topic-group");
    return SnsTopicDefinitionsTopicPo.allUnder(groupElementPo);
  }

  getNonCriticalTopicPos(): Promise<SnsTopicDefinitionsTopicPo[]> {
    const groupElementPo = this.root.byTestId("non-critical-topic-group");
    return SnsTopicDefinitionsTopicPo.allUnder(groupElementPo);
  }

  async getCriticalTopicNames(): Promise<string[]> {
    const topicPos = await this.getCriticalTopicPos();
    return Promise.all(topicPos.map((pos) => pos.getTopicName()));
  }

  async getNonCriticalTopicNames(): Promise<string[]> {
    const topicPos = await this.getNonCriticalTopicPos();
    return Promise.all(topicPos.map((pos) => pos.getTopicName()));
  }

  getCloseButtonPo(): ButtonPo {
    return ButtonPo.under({
      element: this.root,
      testId: "close-button",
    });
  }

  clickCloseButton(): Promise<void> {
    return this.getCloseButtonPo().click();
  }
}
