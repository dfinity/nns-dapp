import type { PageObjectElement } from "$tests/types/page-object.types";
import { SimpleBasePageObject } from "./simple-base.page-object";

export class ReportingDateRangeSelectorPo extends SimpleBasePageObject {
  static readonly TID = "reporting-data-range-selector-component";

  static under({
    element,
  }: {
    element: PageObjectElement;
  }): ReportingDateRangeSelectorPo {
    return new ReportingDateRangeSelectorPo(
      element.byTestId(ReportingDateRangeSelectorPo.TID)
    );
  }

  getLegend() {
    return this.getElement().querySelector("legend").getText();
  }

  getAllOptions() {
    return this.getElement().querySelectorAll('input[type="radio"]');
  }

  getSelectedOption() {
    return this.getElement().querySelector('input[type="radio"]:checked');
  }
}
