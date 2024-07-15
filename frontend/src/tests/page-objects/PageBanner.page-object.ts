import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class PageBannerPo extends BasePageObject {
  static under({
    element,
    testId,
  }: {
    element: PageObjectElement;
    testId: string;
  }): PageBannerPo {
    return new PageBannerPo(element.byTestId(testId));
  }

  getTitle(): PageObjectElement {
    return this.root.querySelector("h1");
  }

  getDescription(): PageObjectElement {
    return this.root.querySelector("[slot='description']");
  }

  getBannerActions(): PageObjectElement {
    return this.root.querySelector(".banner-actions");
  }

  getTitleText(): Promise<string> {
    return this.getTitle().getText();
  }

  getDescriptionText(): Promise<string> {
    return this.getDescription().getText();
  }

  async getBannerActionsText(): Promise<string> {
    return (await this.getBannerActions().getText()).trim();
  }
}
