import type { ReportingTransactionsSource } from "$lib/types/reporting";
import { SimpleBasePageObject } from "$tests/page-objects/simple-base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ReportingSourceSelectorPo extends SimpleBasePageObject {
  static readonly TID = "transactions-source-selector";

  static under(element: PageObjectElement): ReportingSourceSelectorPo {
    return new ReportingSourceSelectorPo(
      element.byTestId(ReportingSourceSelectorPo.TID)
    );
  }

  getAllOptions() {
    return this.getElement().querySelectorAll('input[type="radio"]');
  }

  getSelectedOption() {
    return this.getElement().querySelector('input[type="radio"]:checked');
  }

  async selectProvidedOption(option: ReportingTransactionsSource) {
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
}
