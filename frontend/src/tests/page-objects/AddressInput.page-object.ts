import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

// NOTE: This element is an InputWithError itself.
// DO NOT TRY TO SELECT THE INPUT WITHIN IT.
export class AddressInputPo extends BasePageObject {
  private static readonly TID = "address-input-component";

  static under(element: PageObjectElement): AddressInputPo {
    return new AddressInputPo(element.byTestId(AddressInputPo.TID));
  }

  enterAddress(address: string): Promise<void> {
    return this.getTextInput().typeText(address);
  }

  async getErrorMessage(): Promise<string> {
    return (await this.getText("input-error-message")).trim();
  }

  blur(): Promise<void> {
    return this.getTextInput().blur();
  }
}
