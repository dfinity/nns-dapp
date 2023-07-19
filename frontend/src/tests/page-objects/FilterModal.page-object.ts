import { ButtonPo } from "$tests/page-objects/Button.page-object";
import { CheckboxPo } from "$tests/page-objects/Checkbox.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class FilterModalPo extends BasePageObject {
  private static readonly TID = "filter-modal-component";

  static under(element: PageObjectElement): FilterModalPo {
    return new FilterModalPo(element.byTestId(FilterModalPo.TID));
  }

  getSelectAllButtonPo(): ButtonPo {
    return ButtonPo.under({
      element: this.root,
      testId: "filter-modal-select-all",
    });
  }

  getClearSelectionButtonPo(): ButtonPo {
    return ButtonPo.under({
      element: this.root,
      testId: "filter-modal-clear",
    });
  }

  getFilterEntryPos(): Promise<CheckboxPo[]> {
    return CheckboxPo.allUnder(this.root);
  }
}
