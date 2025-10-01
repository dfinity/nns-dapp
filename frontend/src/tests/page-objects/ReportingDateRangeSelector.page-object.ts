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
    return this.getElement().byTestId("custom-range-section");
  }

  getFromDateInput() {
    return this.getElement().byTestId("custom-from-date");
  }

  getToDateInput() {
    return this.getElement().byTestId("custom-to-date");
  }

  async isCustomRangeVisible(): Promise<boolean> {
    return this.getCustomRangeSection().isPresent();
  }

  async setFromDate(date: string): Promise<void> {
    const input = this.getFromDateInput();
    await input.typeText(date);
  }

  async setToDate(date: string): Promise<void> {
    const input = this.getToDateInput();
    await input.typeText(date);
  }
}
