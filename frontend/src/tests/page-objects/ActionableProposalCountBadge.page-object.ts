import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ActionableProposalCountBadgePo extends BasePageObject {
  private static readonly TID = "actionable-proposal-count-badge-component";

  static under(element: PageObjectElement): ActionableProposalCountBadgePo {
    return new ActionableProposalCountBadgePo(
      element.byTestId(ActionableProposalCountBadgePo.TID)
    );
  }
}
