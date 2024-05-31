import { ProposalCardPo } from "$tests/page-objects/ProposalCard.page-object";
import { UniverseWithActionableProposalsPo } from "$tests/page-objects/UniverseWithActionableProposals.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ActionableSnsProposalsPo extends BasePageObject {
  static readonly TID = "actionable-sns-proposals-component";

  static under(element: PageObjectElement): ActionableSnsProposalsPo {
    return new ActionableSnsProposalsPo(
      element.byTestId(ActionableSnsProposalsPo.TID)
    );
  }

  static async allUnder(
    element: PageObjectElement
  ): Promise<ActionableSnsProposalsPo[]> {
    return Array.from(
      await element.allByTestId(ActionableSnsProposalsPo.TID)
    ).map((el) => new ActionableSnsProposalsPo(el));
  }

  getUniverseWithActionableProposalsPo(): UniverseWithActionableProposalsPo {
    return UniverseWithActionableProposalsPo.under(this.root);
  }

  getProposalCardPos(): Promise<ProposalCardPo[]> {
    return ProposalCardPo.allUnder(this.root);
  }
}
