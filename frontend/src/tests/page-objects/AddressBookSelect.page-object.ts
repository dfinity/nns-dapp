import { DropdownPo } from "$tests/page-objects/Dropdown.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class AddressBookSelectPo extends BasePageObject {
  private static readonly TID = "address-book-select";

  static under(element: PageObjectElement): AddressBookSelectPo {
    return new AddressBookSelectPo(element.byTestId(AddressBookSelectPo.TID));
  }

  getDropdownPo(): DropdownPo {
    return DropdownPo.under(this.root);
  }

  async selectAddress(nickname: string): Promise<void> {
    await this.getDropdownPo().select(nickname);
  }

  getOptions(): Promise<string[]> {
    return this.getDropdownPo().getOptions();
  }
}
