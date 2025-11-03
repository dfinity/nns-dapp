import { InputWithErrorPo } from "$tests/page-objects/InputWithError.page-object";
import { ModalPo } from "$tests/page-objects/Modal.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class AddAddressModalPo extends ModalPo {
  private static readonly TID = "add-address-modal";

  static under(element: PageObjectElement): AddAddressModalPo {
    return new AddAddressModalPo(element.byTestId(AddAddressModalPo.TID));
  }

  getNicknameInputPo(): InputWithErrorPo {
    return InputWithErrorPo.under({
      element: this.root,
      testId: "nickname-input",
    });
  }

  getAddressInputPo(): InputWithErrorPo {
    return InputWithErrorPo.under({
      element: this.root,
      testId: "address-input",
    });
  }

  clickSaveAddress(): Promise<void> {
    return this.click("save-address-button");
  }

  clickCancel(): Promise<void> {
    return this.click("cancel-button");
  }

  async addAddress(nickname: string, address: string): Promise<void> {
    await this.getNicknameInputPo().typeText(nickname);
    await this.getAddressInputPo().typeText(address);
    await this.clickSaveAddress();
  }

  async updateAddress(nickname: string, address: string): Promise<void> {
    await this.getNicknameInputPo().typeText(nickname);
    await this.getAddressInputPo().typeText(address);
    await this.clickSaveAddress();
  }
}
