import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ConfirmCyclesCanisterPo extends BasePageObject {
  private static readonly TID = "confirm-cycles-canister-screen";

  static under(element: PageObjectElement): ConfirmCyclesCanisterPo {
    return new ConfirmCyclesCanisterPo(
      element.byTestId(ConfirmCyclesCanisterPo.TID)
    );
  }

  clickConfirm(): Promise<void> {
    return this.click("confirm-cycles-canister-button");
  }
}
