import { AddressInputPo } from "$tests/page-objects/AddressInput.page-object";
import { DropdownPo } from "$tests/page-objects/Dropdown.page-object";
import { TogglePo } from "$tests/page-objects/Toggle.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class SelectDestinationAddressPo extends BasePageObject {
  private static readonly TID = "select-destination";

  static under(element: PageObjectElement): SelectDestinationAddressPo {
    return new SelectDestinationAddressPo(
      element.byTestId(SelectDestinationAddressPo.TID)
    );
  }

  getAddressInputPo(): AddressInputPo {
    return AddressInputPo.under(this.root);
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

  async enableSelect(): Promise<void> {
    return this.getTogglePo().setDisabled();
  }

  async enableTextInput(): Promise<void> {
    return this.getTogglePo().setEnabled();
  }

  async selectAccount(accountName: string): Promise<void> {
    await this.enableSelect();
    await this.getDropdownPo().select(accountName);
  }

  getOptions(): Promise<string[]> {
    return this.getDropdownPo().getOptions();
  }

  async enterAddress(address: string): Promise<void> {
    await this.enableTextInput();
    await this.getAddressInputPo().enterAddress(address);
  }

  async getErrorMessage(): Promise<string> {
    return this.getAddressInputPo().getErrorMessage();
  }

  blurInput(): Promise<void> {
    return this.getAddressInputPo().blur();
  }
}
