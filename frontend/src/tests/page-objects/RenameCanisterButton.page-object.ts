import { ButtonPo } from "$tests/page-objects/Button.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class RenameCanisterButtonPo extends ButtonPo {
  static readonly TID = "rename-canister-button-component";

  static under({
    element,
  }: {
    element: PageObjectElement;
  }): RenameCanisterButtonPo {
    return ButtonPo.under({
      element,
      testId: RenameCanisterButtonPo.TID,
    });
  }
}
