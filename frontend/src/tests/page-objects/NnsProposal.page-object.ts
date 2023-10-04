import { ProposalProposerActionsEntryPo } from "$tests/page-objects/ProposalProposerActionsEntry.page-object";
import { ProposalSummarySectionPo } from "$tests/page-objects/ProposalSummarySection.page-object";
import { ProposalSystemInfoSectionPo } from "$tests/page-objects/ProposalSystemInfoSection.page-object";
import { SkeletonDetailsPo } from "$tests/page-objects/SkeletonDetails.page-object";
import { VotesResultPo } from "$tests/page-objects/VotesResults.page-object";
import { VotingCardPo } from "$tests/page-objects/VotingCard.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NnsProposalPo extends BasePageObject {
  private static readonly TID = "nns-proposal-component";

  static under(element: PageObjectElement): NnsProposalPo {
    return new NnsProposalPo(element.byTestId(NnsProposalPo.TID));
  }

  getSkeletonDetailsPo(): SkeletonDetailsPo {
    return SkeletonDetailsPo.under(this.root);
  }

  getVotesResultPo(): VotesResultPo {
    return VotesResultPo.under(this.root);
  }

  getProposalProposalSystemInfoSectionPo(): ProposalSystemInfoSectionPo {
    return ProposalSystemInfoSectionPo.under(this.root);
  }

  getProposalSummaryPo(): ProposalSummarySectionPo {
    return ProposalSummarySectionPo.under(this.root);
  }

  getVotingCardPo(): VotingCardPo {
    return VotingCardPo.under(this.root);
  }

  getProposalProposerActionsEntryPo(): ProposalProposerActionsEntryPo {
    return ProposalProposerActionsEntryPo.under(this.root);
  }

  async isContentLoaded(): Promise<boolean> {
    return (
      (await this.isPresent()) &&
      !(await this.getSkeletonDetailsPo().isPresent())
    );
  }

  async waitForContentLoaded(): Promise<void> {
    await this.waitFor();
    await this.getSkeletonDetailsPo().waitForAbsent();
  }
}
