import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class AdditionalInfoReviewPo extends BasePageObject {
  private static readonly TID = "additional-info-review-component";

  static under(element: PageObjectElement): AdditionalInfoReviewPo | null {
    return new AdditionalInfoReviewPo(
      element.byTestId(AdditionalInfoReviewPo.TID)
    );
  }

  async clickCheckbox(): Promise<void> {
    return this.click("checkbox");
  }
}
