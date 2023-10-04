import { CheckboxPo } from "$tests/page-objects/Checkbox.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class FilterModalPo extends BasePageObject {
  private static readonly TID = "filter-modal";

  static under(element: PageObjectElement): FilterModalPo {
    return new FilterModalPo(element.byTestId(FilterModalPo.TID));
  }

  clickSelectAllButton(): Promise<void> {
    return this.click("filter-modal-select-all");
  }

  clickClearSelectionButton(): Promise<void> {
    return this.click("filter-modal-clear");
  }

  getFilterEntryPos(): Promise<CheckboxPo[]> {
    return CheckboxPo.allUnder(this.root);
  }

  getFilterEntryByIdPo(testId: string): CheckboxPo {
    return CheckboxPo.under({
      element: this.root,
      testId,
    });
  }

  clickConfirmButton(): Promise<void> {
    return this.click("apply-filters");
  }
}
