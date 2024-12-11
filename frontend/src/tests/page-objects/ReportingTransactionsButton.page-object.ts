import { ButtonPo } from "$tests/page-objects/Button.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ReportingTransactionsButtonPo extends ButtonPo {
  static readonly TID = "reporting-transactions-button-component";

  static under({
    element,
  }: {
    element: PageObjectElement;
  }): ReportingTransactionsButtonPo {
    return ButtonPo.under({
      element,
      testId: ReportingTransactionsButtonPo.TID,
    });
  }
}
