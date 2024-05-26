import { ActionableSnsesPo } from "$tests/page-objects/ActionableSnses.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ActionableProposalsPo extends BasePageObject {
  private static readonly TID = "actionable-proposals-component";

  static under(element: PageObjectElement): ActionableProposalsPo {
    return new ActionableProposalsPo(
      element.byTestId(ActionableProposalsPo.TID)
    );
  }

  getActionableSnses(): ActionableSnsesPo {
    return ActionableSnsesPo.under(this.root);
  }
}
