import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ConfirmFollowingActionButtonPo extends BasePageObject {
  private static readonly TID = "confirm-following-action-button-component";

  static under(element: PageObjectElement): ConfirmFollowingActionButtonPo {
    return new ConfirmFollowingActionButtonPo(
      element.byTestId(ConfirmFollowingActionButtonPo.TID)
    );
  }
}
