import { ButtonPo } from "$tests/page-objects/Button.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class HighlightPo extends BasePageObject {
  private static readonly TID = "highlight-component";

  static under(element: PageObjectElement): HighlightPo {
    return new HighlightPo(element.byTestId(HighlightPo.TID));
  }

  getCloseButtonPo(): ButtonPo {
    return this.getButton("close-button");
  }

  async getTitle(): Promise<string> {
    return this.getText("highlight-title");
  }

  async getDescription(): Promise<string> {
    return this.getText("highlight-description");
  }

  async getLinkPo(): Promise<PageObjectElement> {
    return this.getElement("highlight-link");
  }

  async hasLink(): Promise<boolean> {
    return await (await this.getLinkPo()).isPresent();
  }

  async clickClose(): Promise<void> {
    await this.getCloseButtonPo().click();
  }
}
