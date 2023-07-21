import { ButtonPo } from "$tests/page-objects/Button.page-object";
import { CheckboxPo } from "$tests/page-objects/Checkbox.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class FilterModalPo extends BasePageObject {
  private static readonly TID = "filter-modal";

  static under(element: PageObjectElement): FilterModalPo {
    return new FilterModalPo(element.byTestId(FilterModalPo.TID));
  }

  clickSelectAllButtonPo(): Promise<void> {
    return ButtonPo.under({
      element: this.root,
      testId: "filter-modal-select-all",
    }).click();
  }

  clickClearSelectionButton(): Promise<void> {
    return ButtonPo.under({
      element: this.root,
      testId: "filter-modal-clear",
    }).click();
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
    return ButtonPo.under({
      element: this.root,
      testId: "apply-filters",
    }).click();
  }

  waitForClosed(): Promise<void> {
    return this.root.waitForAbsent();
  }
}
