import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { ButtonPo } from "./Button.page-object";
import { ReportingPagePo } from "./ReportingPage.page-object";

export class ReportingRoutePo extends BasePageObject {
  private static readonly TID = "reporting-route-component";

  static under(element: PageObjectElement): ReportingRoutePo {
    return new ReportingRoutePo(element.byTestId(ReportingRoutePo.TID));
  }

  getLoginButtonPo(): ButtonPo {
    return ButtonPo.under({ element: this.root, testId: "login-button" });
  }

  getReportingPagePo(): ReportingPagePo {
    return ReportingPagePo.under(this.root);
  }
}
