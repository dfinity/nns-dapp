import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class BannerPo extends BasePageObject {
  private static readonly TID = "banner-component";

  static under(element: PageObjectElement): BannerPo {
    return new BannerPo(element.byTestId(BannerPo.TID));
  }

  async getTitle(): Promise<string> {
    return this.root.byTestId("title").getText();
  }

  async getText(): Promise<string> {
    return this.root.byTestId("text").getText();
  }

  async getHtmlText(): Promise<string> {
    return this.root.byTestId("html-text").getText();
  }

  private getCloseButton(): PageObjectElement {
    return this.root.byTestId("close-button");
  }

  async clickClose(): Promise<void> {
    await this.getCloseButton().click();
  }

  async isClosable(): Promise<boolean> {
    return this.getCloseButton().isPresent();
  }

  async isCritical(): Promise<boolean> {
    return (await this.root.getClasses()).includes("isCritical");
  }
}
