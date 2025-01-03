import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { ReportingPagePo } from "./ReportingPage.page-object";

export class ReportingRoutePo extends BasePageObject {
  private static readonly TID = "reporting-route-component";

  static under(element: PageObjectElement): ReportingRoutePo {
    return new ReportingRoutePo(element.byTestId(ReportingRoutePo.TID));
  }

  getLoginButtonPo(): PageObjectElement {
    return this.getElement("login-button");
  }

  getReportingPagePo(): ReportingPagePo {
    return ReportingPagePo.under(this.root);
  }
}
