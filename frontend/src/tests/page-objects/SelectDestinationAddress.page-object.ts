import { BasePageObject } from "$tests/page-objects/base.page-object";
import { DropdownPo } from "$tests/page-objects/Dropdown.page-object";
import { TogglePo } from "$tests/page-objects/Toggle.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class SelectDestinationAddressPo extends BasePageObject {
  private static readonly TID = "select-destination";

  static under(element: PageObjectElement): SelectDestinationAddressPo {
    return new SelectDestinationAddressPo(
      element.byTestId(SelectDestinationAddressPo.TID)
    );
  }

  getTogglePo(): TogglePo {
    return TogglePo.under(this.root);
  }

  getDropdownPo(): DropdownPo {
    return DropdownPo.under(this.root);
  }

  async toggleSelect(): Promise<void> {
    return this.getTogglePo().toggle();
  }

  async selectAccount(accountName: string): Promise<void> {
    // TODO: Only toggle if necessary.
    await this.toggleSelect();
    await this.getDropdownPo().select(accountName);
  }
}
