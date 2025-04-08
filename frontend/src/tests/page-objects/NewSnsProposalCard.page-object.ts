import { BasePortfolioCardPo } from "$tests/page-objects/BasePortfolioCard.page-object";
import { LinkPo } from "$tests/page-objects/Link.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NewSnsProposalCardPo extends BasePortfolioCardPo {
  private static readonly TID = "new-sns-proposal-card";

  static under(element: PageObjectElement): NewSnsProposalCardPo {
    return new NewSnsProposalCardPo(element.byTestId(NewSnsProposalCardPo.TID));
  }

  getTitle(): Promise<string> {
    return this.getText("project-name");
  }

  getProposalTitle(): Promise<string> {
    return this.getText("proposal-title");
  }

  getAdoptPercentage(): Promise<string> {
    return this.getText("adopt-percentage");
  }

  getRejectPercentage(): Promise<string> {
    return this.getText("reject-percentage");
  }

  getTimeRemaining(): Promise<string> {
    return this.getText("time-remaining");
  }

  getLinkPo(): LinkPo {
    return LinkPo.under({
      element: this.root,
      testId: "proposal-link",
    });
  }
}
