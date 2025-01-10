import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { DropdownPo } from "$tests/page-objects/Dropdown.page-object";

export class SelectAccountDropdownPo extends BasePageObject {
  private static readonly TID = "select-account-dropdown-component";

  static under(element: PageObjectElement): SelectAccountDropdownPo {
    return new SelectAccountDropdownPo(
      element.byTestId(SelectAccountDropdownPo.TID)
    );
  }

  getDropdown() {
    return DropdownPo.under(this.root);
  }

  select(option: string): Promise<void> {
    return this.getDropdown().select(option);
  }

  getOptions(): Promise<string[]> {
    return this.getDropdown().getOptions();
  }

  hasDropdown(): Promise<boolean> {
    return this.getDropdown().isPresent();
  }
}
