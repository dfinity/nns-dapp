import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { BannerIconPo } from "$tests/page-objects/BannerIcon.page-object";
import type { ButtonPo } from "$tests/page-objects/Button.page-object";

export class BannerPo extends BasePageObject {
  private static readonly TID = "banner-component";

  static under(element: PageObjectElement): BannerPo {
    return new BannerPo(element.byTestId(BannerPo.TID));
  }

  getBannerIcon(): BannerIconPo {
    return BannerIconPo.under(this.root);
  }

  getActions(): PageObjectElement {
    return this.root.byTestId("actions");
  }

  getCloseButton(): ButtonPo {
    return this.getButton("close-button");
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

  async clickClose(): Promise<void> {
    await this.getCloseButton().click();
  }

  async isCritical(): Promise<boolean> {
    return (await this.root.getClasses()).includes("isCritical");
  }
}
