import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class UniverseSummaryPo extends BasePageObject {
  private static readonly TID = "universe-page-summary-component";

  static under(element: PageObjectElement): UniverseSummaryPo {
    return new UniverseSummaryPo(element.byTestId(UniverseSummaryPo.TID));
  }

  async getLogoUrl(): Promise<string> {
    return this.root
      .byTestId("project-logo")
      .querySelector("img")
      .getAttribute("src");
  }

  async getLogoAlt(): Promise<string> {
    return this.root
      .byTestId("project-logo")
      .querySelector("img")
      .getAttribute("alt");
  }

  async getTitle(): Promise<string> {
    return (await this.getText()).trim();
  }
}
