import { ProposalSummarySectionPo } from "$tests/page-objects/ProposalSummarySection.page-object";
import { SkeletonDetailsPo } from "$tests/page-objects/SkeletonDetails.page-object";
import { SnsProposalVotingSectionPo } from "$tests/page-objects/SnsProposalVotingSection.page-object";
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

  getVotingPo(): SnsProposalVotingSectionPo {
    return SnsProposalVotingSectionPo.under(this.root);
  }

  getProposalSummaryPo(): ProposalSummarySectionPo {
    return ProposalSummarySectionPo.under(this.root);
  }

  getVotingCardPo(): VotingCardPo {
    return VotingCardPo.under(this.root);
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
