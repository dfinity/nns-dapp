import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ProposalNavigationPo extends BasePageObject {
  private static readonly TID = "proposal-nav";

  static under(element: PageObjectElement): ProposalNavigationPo {
    return new ProposalNavigationPo(element.byTestId(ProposalNavigationPo.TID));
  }

  getNextButtonPo = () => this.getButton("proposal-nav-next");
  getPreviousButtonPo = () => this.getButton("proposal-nav-previous");
  clickNextProposal = () => this.getNextButtonPo().click();
  clickPreviousProposal = () => this.getPreviousButtonPo().click();
}
