import type { PageObjectElement } from "$tests/types/page-object.types";
import { ReportingDateRangeSelectorPo } from "./ReportingDateRangeSelector.page-object";
import { ReportingTransactionsButtonPo } from "./ReportingTransactionsButton.page-object";
import { BasePageObject } from "./base.page-object";

export class ReportingTransactionsPo extends BasePageObject {
  static readonly TID = "reporting-transactions-component";

  static under({
    element,
  }: {
    element: PageObjectElement;
  }): ReportingTransactionsPo {
    return new ReportingTransactionsPo(
      element.byTestId(ReportingTransactionsPo.TID)
    );
  }

  getReportingDateRangeSelectorPo() {
    return ReportingDateRangeSelectorPo.under({
      element: this.root,
    });
  }

  getReportingTransactionsButtonPo() {
    return ReportingTransactionsButtonPo.under({
      element: this.root,
    });
  }
}
