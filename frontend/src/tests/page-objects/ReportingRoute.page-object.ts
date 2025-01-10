import { ButtonPo } from "$tests/page-objects/Button.page-object";
import { ReportingPagePo } from "$tests/page-objects/ReportingPage.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ReportingRoutePo extends BasePageObject {
  private static readonly TID = "reporting-route-component";

  static under(element: PageObjectElement): ReportingRoutePo {
    return new ReportingRoutePo(element.byTestId(ReportingRoutePo.TID));
  }

  getLoginButtonPo(): ButtonPo {
    return this.getButton("login-button");
  }

  getReportingPagePo(): ReportingPagePo {
    return ReportingPagePo.under(this.root);
  }
}
