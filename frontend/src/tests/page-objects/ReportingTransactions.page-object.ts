import { ReportingDateRangeSelectorPo } from "$tests/page-objects/ReportingDateRangeSelector.page-object";
import { ReportingTransactionsButtonPo } from "$tests/page-objects/ReportingTransactionsButton.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ReportingTransactionsPo extends BasePageObject {
  static readonly TID = "reporting-transactions-component";

  static under(element: PageObjectElement): ReportingTransactionsPo {
    return new ReportingTransactionsPo(
      element.byTestId(ReportingTransactionsPo.TID)
    );
  }

  getReportingDateRangeSelectorPo() {
    return ReportingDateRangeSelectorPo.under(this.root);
  }

  getReportingTransactionsButtonPo() {
    return ReportingTransactionsButtonPo.under({
      element: this.root,
    });
  }
}
