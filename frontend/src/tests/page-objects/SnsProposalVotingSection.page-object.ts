import { VotesResultPo } from "$tests/page-objects/VotesResults.page-object";
import { VotingCardPo } from "$tests/page-objects/VotingCard.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class SnsProposalVotingSectionPo extends BasePageObject {
  private static readonly TID = "sns-proposal-voting-section-component";

  private constructor(root: PageObjectElement) {
    super(root);
  }

  static under(element: PageObjectElement): SnsProposalVotingSectionPo {
    return new SnsProposalVotingSectionPo(
      element.byTestId(SnsProposalVotingSectionPo.TID)
    );
  }

  getVotingsResultsPo(): VotesResultPo {
    return VotesResultPo.under(this.root);
  }

  getVotingCardPo(): VotingCardPo {
    return VotingCardPo.under(this.root);
  }

  hasVotingToolbar(): Promise<boolean> {
    return this.getVotingCardPo().hasVotingConfirmationToolbar();
  }
}
