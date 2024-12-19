import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ReportingPagePo extends BasePageObject {
  private static readonly TID = "reporting-page-component";

  static under(element: PageObjectElement): ReportingPagePo {
    return new ReportingPagePo(element.byTestId(ReportingPagePo.TID));
  }
}
