import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ConfirmFollowingBannerPo extends BasePageObject {
  private static readonly TID = "confirm-following-banner-component";

  static under(element: PageObjectElement): ConfirmFollowingBannerPo {
    return new ConfirmFollowingBannerPo(
      element.byTestId(ConfirmFollowingBannerPo.TID)
    );
  }
}
