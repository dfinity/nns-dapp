import { PageBannerPo } from "$tests/page-objects/PageBanner.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ActionableProposalsNotSupportedSnsesPo extends BasePageObject {
  private static readonly TID = "actionable-proposals-not-supported-snses";

  static under(
    element: PageObjectElement
  ): ActionableProposalsNotSupportedSnsesPo {
    return new ActionableProposalsNotSupportedSnsesPo(
      element.byTestId(ActionableProposalsNotSupportedSnsesPo.TID)
    );
  }

  getBannerPo(): PageBannerPo {
    return PageBannerPo.under({
      element: this.root,
    });
  }
}
