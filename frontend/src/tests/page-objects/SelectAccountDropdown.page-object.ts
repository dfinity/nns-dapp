import { DropdownPo } from "$tests/page-objects/Dropdown.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

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

  selectAccountName(option: string): Promise<void> {
    return this.getDropdown().select(option);
  }

  selectAccountId(option: string): Promise<void> {
    return this.getDropdown().selectOptionValue(option);
  }

  getOptions(): Promise<string[]> {
    return this.getDropdown().getOptions();
  }

  hasDropdown(): Promise<boolean> {
    return this.getDropdown().isPresent();
  }
}
