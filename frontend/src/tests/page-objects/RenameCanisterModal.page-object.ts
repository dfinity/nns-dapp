import type { ButtonPo } from "$tests/page-objects/Button.page-object";
import { ModalPo } from "$tests/page-objects/Modal.page-object";
import { TextInputFormPo } from "$tests/page-objects/TextInputForm.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class RenameCanisterModalPo extends ModalPo {
  private static readonly TID = "rename-canister-modal-component";

  static under(element: PageObjectElement): RenameCanisterModalPo {
    return new RenameCanisterModalPo(
      element.byTestId(RenameCanisterModalPo.TID)
    );
  }

  getTextInputFormPo(): TextInputFormPo {
    return TextInputFormPo.under({
      element: this.root,
      testId: "rename-canister-form",
    });
  }

  enterName(name: string): Promise<void> {
    return this.getTextInputFormPo().enterText(name);
  }

  getRenameButton(): ButtonPo {
    return this.getTextInputFormPo().getConfirmButtonPo();
  }

  clickRenameButton(): Promise<void> {
    return this.getTextInputFormPo().clickSubmitButton();
  }

  async rename(newName: string): Promise<void> {
    await this.enterName(newName);
    await this.clickRenameButton();
    await this.waitForAbsent();
  }
}
