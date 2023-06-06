import type { ButtonPo } from "$tests/page-objects/Button.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ProposalNavigationPo extends BasePageObject {
  private static readonly TID = "proposal-nav";

  static under(element: PageObjectElement): ProposalNavigationPo {
    return new ProposalNavigationPo(element.byTestId(ProposalNavigationPo.TID));
  }

  getNextButtonPo(): ButtonPo {
    return this.getButton("proposal-nav-next");
  }

  getPreviousButtonPo(): ButtonPo {
    return this.getButton("proposal-nav-previous");
  }

  clickNextProposal(): Promise<void> {
    return this.getNextButtonPo().click();
  }

  clickPreviousProposal(): Promise<void> {
    return this.getPreviousButtonPo().click();
  }
}
