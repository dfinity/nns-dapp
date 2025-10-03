import type { ReportingPeriod } from "$lib/types/reporting";
import { SimpleBasePageObject } from "$tests/page-objects/simple-base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ReportingDateRangeSelectorPo extends SimpleBasePageObject {
  static readonly TID = "reporting-data-range-selector-component";

  static under(element: PageObjectElement): ReportingDateRangeSelectorPo {
    return new ReportingDateRangeSelectorPo(
      element.byTestId(ReportingDateRangeSelectorPo.TID)
    );
  }

  getAllOptions() {
    return this.getElement().querySelectorAll('input[type="radio"]');
  }

  getSelectedOption() {
    return this.getElement().querySelector('input[type="radio"]:checked');
  }

  async selectProvidedOption(option: ReportingPeriod) {
    const allOptions = await this.getAllOptions();

    for (const opt of allOptions) {
      const value = await opt.getValue();
      if (value === option) {
        await opt.click();
        return;
      }
    }

    throw new Error(`Option ${option} not found`);
  }

  getCustomRangeSection() {
    return this.getElement("range-selection");
  }

  getFromDateInput() {
    return this.getElement("from-date");
  }

  getToDateInput() {
    return this.getElement("to-date");
  }

  async setFromDate(date: string): Promise<void> {
    const field = this.getFromDateInput();
    await field.input(date, "change");
  }

  async setToDate(date: string): Promise<void> {
    const field = this.getToDateInput();
    await field.input(date, "change");
  }
}
