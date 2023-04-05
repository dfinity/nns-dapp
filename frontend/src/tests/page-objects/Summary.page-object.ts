import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { assertNonNullish } from "$tests/utils/utils.test-utils";

export class SummaryPo extends BasePageObject {
  static readonly TID = "projects-summary";

  static under(element: PageObjectElement): SummaryPo {
    return new SummaryPo(element.byTestId(SummaryPo.TID));
  }

  getTitle(): Promise<string> {
    return assertNonNullish(this.root.querySelector("h1")).getText();
  }
}
