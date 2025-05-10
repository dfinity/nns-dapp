import { BasePortfolioCardPo } from "$tests/page-objects/BasePortfolioCard.page-object";
import { LinkPo } from "$tests/page-objects/Link.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class AdoptedProposalCardPo extends BasePortfolioCardPo {
  private static readonly TID = "adopted-proposal-card";

  static under(element: PageObjectElement): AdoptedProposalCardPo {
    return new AdoptedProposalCardPo(
      element.byTestId(AdoptedProposalCardPo.TID)
    );
  }

  getTitle(): Promise<string> {
    return this.getText("project-name");
  }

  getDescription(): Promise<string> {
    return this.getText("project-description");
  }

  getTimeRemaining(): Promise<string> {
    return this.getText("time-remaining");
  }

  getLinkPo(): LinkPo {
    return LinkPo.under({
      element: this.root,
      testId: "project-link",
    });
  }
}
