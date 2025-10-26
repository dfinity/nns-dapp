import { ButtonPo } from "$tests/page-objects/Button.page-object";
import { ModalPo } from "$tests/page-objects/Modal.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NnsTopicDefinitionsModalPo extends ModalPo {
  private static readonly TID = "nns-topic-definitions-modal-component";

  static under(element: PageObjectElement): NnsTopicDefinitionsModalPo {
    return new NnsTopicDefinitionsModalPo(
      element.byTestId(NnsTopicDefinitionsModalPo.TID)
    );
  }

  getRequiredTopicGroupPo(): PageObjectElement {
    return this.root.byTestId("required-topic-group");
  }

  getOtherTopicGroupPo(): PageObjectElement {
    return this.root.byTestId("other-topic-group");
  }

  async getRequiredTopicElements(): Promise<PageObjectElement[]> {
    const groupPo = this.getRequiredTopicGroupPo();
    return groupPo.querySelectorAll(".topic-definition");
  }

  async getOtherTopicElements(): Promise<PageObjectElement[]> {
    const groupPo = this.getOtherTopicGroupPo();
    return groupPo.querySelectorAll(".topic-definition");
  }

  async getRequiredTopicTitles(): Promise<string[]> {
    const topicElements = await this.getRequiredTopicElements();
    return Promise.all(
      topicElements.map(async (element) => {
        const titleElement = await element.querySelector(".topic-title");
        return titleElement?.getText() ?? "";
      })
    );
  }

  async getOtherTopicTitles(): Promise<string[]> {
    const topicElements = await this.getOtherTopicElements();
    return Promise.all(
      topicElements.map(async (element) => {
        const titleElement = await element.querySelector(".topic-title");
        return titleElement?.getText() ?? "";
      })
    );
  }

  async getTopicByTestId(testId: string): Promise<PageObjectElement | null> {
    return this.root.byTestId(testId);
  }

  async getTopicTitle(testId: string): Promise<string> {
    const topicElement = await this.getTopicByTestId(testId);
    const titleElement = await topicElement?.querySelector(".topic-title");
    return titleElement?.getText() ?? "";
  }

  async getTopicDescription(testId: string): Promise<string> {
    const topicElement = await this.getTopicByTestId(testId);
    const descElement = await topicElement?.querySelector(".topic-description");
    return descElement?.getText() ?? "";
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