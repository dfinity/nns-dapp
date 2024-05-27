import { ProposalCardPo } from "$tests/page-objects/ProposalCard.page-object";
import { UniverseWithActionableProposalsPo } from "$tests/page-objects/UniverseWithActionableProposals.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ActionableNnsProposalsPo extends BasePageObject {
  static readonly TID = "actionable-nns-proposals-component";

  static under(element: PageObjectElement): ActionableNnsProposalsPo {
    return new ActionableNnsProposalsPo(
      element.byTestId(ActionableNnsProposalsPo.TID)
    );
  }

  getUniverseWithActionableProposalsPo(): UniverseWithActionableProposalsPo {
    return UniverseWithActionableProposalsPo.under(this.root);
  }

  getProposalCardPos(): Promise<ProposalCardPo[]> {
    return ProposalCardPo.allUnder(this.root);
  }
}
