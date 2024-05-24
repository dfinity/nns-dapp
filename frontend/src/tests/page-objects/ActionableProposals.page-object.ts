import { UniverseWithActionableProposalsPo } from "$tests/page-objects/UniverseWithActionableProposals.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ActionableProposalsPo extends BasePageObject {
  private static readonly TID = "actionable-proposals-component";

  static under(element: PageObjectElement): ActionableProposalsPo {
    return new ActionableProposalsPo(
      element.byTestId(ActionableProposalsPo.TID)
    );
  }

  async getUniverseWithActionableProposalsPos(): Promise<
    UniverseWithActionableProposalsPo[]
  > {
    return UniverseWithActionableProposalsPo.allUnder(this.root);
  }
}
