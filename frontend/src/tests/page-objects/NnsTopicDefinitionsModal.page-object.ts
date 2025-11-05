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

  async getRequiredTopicTitles(): Promise<string[]> {
    const groupPo = this.getRequiredTopicGroupPo();
    return Promise.all(
      (await groupPo.allByTestId("topic-name")).map(async (element) => {
        return (await element?.getText()) ?? "";
      })
    );
  }

  async getOtherTopicTitles(): Promise<string[]> {
    const groupPo = this.getOtherTopicGroupPo();
    return Promise.all(
      (await groupPo.allByTestId("topic-name")).map(async (element) => {
        return element?.getText() ?? "";
      })
    );
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
