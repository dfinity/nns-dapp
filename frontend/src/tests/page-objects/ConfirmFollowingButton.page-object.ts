import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ConfirmFollowingButtonPo extends BasePageObject {
  private static readonly TID = "confirm-following-button-component";

  static under(element: PageObjectElement): ConfirmFollowingButtonPo {
    return new ConfirmFollowingButtonPo(
      element.byTestId(ConfirmFollowingButtonPo.TID)
    );
  }
}
