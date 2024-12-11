import { ButtonPo } from "$tests/page-objects/Button.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ReportingNeuronsButtonPo extends ButtonPo {
  static readonly TID = "reporting-neurons-button-component";

  static under({
    element,
  }: {
    element: PageObjectElement;
  }): ReportingNeuronsButtonPo {
    return new ReportingNeuronsButtonPo(
      element.byTestId(ReportingNeuronsButtonPo.TID)
    );
  }
}
