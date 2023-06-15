import { ButtonPo } from "$tests/page-objects/Button.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ConfirmDissolveDelayPo extends BasePageObject {
  private static readonly TID = "confirm-dissolve-delay-container";

  static under(element: PageObjectElement): ConfirmDissolveDelayPo {
    return new ConfirmDissolveDelayPo(
      element.byTestId(ConfirmDissolveDelayPo.TID)
    );
  }

  getConfirmButtonPo(): ButtonPo {
    return ButtonPo.under({
      element: this.root,
      testId: "confirm-delay-button",
    });
  }

  clickConfirm(): Promise<void> {
    return this.getConfirmButtonPo().click();
  }
}
