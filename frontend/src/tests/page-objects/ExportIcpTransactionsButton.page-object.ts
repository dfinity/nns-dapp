import { ButtonPo } from "$tests/page-objects/Button.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ExportIcpTransactionsButtonPo extends ButtonPo {
  static readonly TID = "export-icp-transactions-button-component";

  static under({
    element,
  }: {
    element: PageObjectElement;
  }): ExportIcpTransactionsButtonPo {
    return ButtonPo.under({
      element,
      testId: ExportIcpTransactionsButtonPo.TID,
    });
  }
}
