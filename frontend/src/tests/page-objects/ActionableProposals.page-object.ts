import { ActionableNnsProposalsPo } from "$tests/page-objects/ActionableNnsProposals.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ActionableProposalsPo extends BasePageObject {
  private static readonly TID = "actionable-proposals-component";

  static under(element: PageObjectElement): ActionableProposalsPo {
    return new ActionableProposalsPo(
      element.byTestId(ActionableProposalsPo.TID)
    );
  }

  getActionableNnsProposalsPo(): ActionableNnsProposalsPo {
    return ActionableNnsProposalsPo.under(this.root);
  }

  hasActionableNnsProposals(): Promise<boolean> {
    return this.getActionableNnsProposalsPo()
      .getUniverseWithActionableProposalsPo()
      .isPresent();
  }
}
