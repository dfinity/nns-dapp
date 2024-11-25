import { ButtonPo } from "$tests/page-objects/Button.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ExportNeuronsButtonPo extends ButtonPo {
  static readonly TID = "export-neurons-button-component";

  static under({
    element,
  }: {
    element: PageObjectElement;
  }): ExportNeuronsButtonPo {
    return ButtonPo.under({
      element,
      testId: ExportNeuronsButtonPo.TID,
    });
  }
}
