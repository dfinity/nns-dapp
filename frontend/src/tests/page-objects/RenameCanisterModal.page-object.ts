import type { ButtonPo } from "$tests/page-objects/Button.page-object";
import { TextInputFormPo } from "$tests/page-objects/TextInputForm.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class RenameCanisterModalPo extends BasePageObject {
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

  enterNewName(name: string): Promise<void> {
    return this.getTextInputFormPo().enterText(name);
  }

  getRenameButton(): ButtonPo {
    return this.getTextInputFormPo().getConfirmButtonPo();
  }

  clickRenameButton(): Promise<void> {
    return this.getTextInputFormPo().clickSubmitButton();
  }
}
