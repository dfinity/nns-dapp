import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class UniversePageSummaryPo extends BasePageObject {
  private static readonly TID = "universe-page-summary-component";

  static under(element: PageObjectElement): UniversePageSummaryPo {
    return new UniversePageSummaryPo(
      element.byTestId(UniversePageSummaryPo.TID)
    );
  }

  async getLogoUrl(): Promise<string> {
    return this.root
      .byTestId("project-logo")
      .querySelector("img")
      .getAttribute("src");
  }

  async getTitle(): Promise<string> {
    return (await this.getText()).trim();
  }
}
