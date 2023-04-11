import { BasePageObject } from "$tests/page-objects/base.page-object";
import { VotesResultPo } from "$tests/page-objects/VotesResults.page-object";
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

  async getVotingsResultsPo(): Promise<VotesResultPo> {
    return VotesResultPo.under(this.root);
  }
}
