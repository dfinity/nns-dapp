import type { ButtonPo } from "$tests/page-objects/Button.page-object";
import { ProposalStatusTagPo } from "$tests/page-objects/ProposalStatusTag.page-object";
import { UniverseLogoPo } from "$tests/page-objects/UniverseLogo.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ProposalNavigationPo extends BasePageObject {
  private static readonly TID = "proposal-nav";

  static under(element: PageObjectElement): ProposalNavigationPo {
    return new ProposalNavigationPo(element.byTestId(ProposalNavigationPo.TID));
  }

  private static async isButtonHidden({ root }: ButtonPo): Promise<boolean> {
    return (await root.getClasses()).includes("hidden");
  }

  getPreviousButtonPo(): ButtonPo {
    return this.getButton("proposal-nav-previous");
  }

  getNextButtonPo(): ButtonPo {
    return this.getButton("proposal-nav-next");
  }

  getLogoPo(): UniverseLogoPo {
    return UniverseLogoPo.under(this.root);
  }

  getLogoSource(): Promise<string> {
    return this.getLogoPo().getLogoSource();
  }

  getProposalStatusTag(): ProposalStatusTagPo {
    return ProposalStatusTagPo.under(this.root);
  }

  getProposalStatus(): Promise<string> {
    return this.getProposalStatusTag().getText();
  }

  getTitle(): Promise<string> {
    return this.root.byTestId("title").getText();
  }

  async getPreviousButtonProposalId(): Promise<string> {
    return (await this.getPreviousButtonPo().getElement()).getAttribute(
      "data-test-proposal-id"
    );
  }

  async getPreviousButtonProposalUniverse(): Promise<string> {
    return (await this.getPreviousButtonPo().getElement()).getAttribute(
      "data-test-proposal-u"
    );
  }

  async getNextButtonProposalId(): Promise<string> {
    return (await this.getNextButtonPo().getElement()).getAttribute(
      "data-test-proposal-id"
    );
  }

  async getNextButtonProposalUniverse(): Promise<string> {
    return (await this.getNextButtonPo().getElement()).getAttribute(
      "data-test-proposal-u"
    );
  }

  async isPreviousButtonHidden(): Promise<boolean> {
    return ProposalNavigationPo.isButtonHidden(this.getPreviousButtonPo());
  }

  async isNextButtonHidden(): Promise<boolean> {
    return ProposalNavigationPo.isButtonHidden(this.getNextButtonPo());
  }

  clickPrevious(): Promise<void> {
    return this.getPreviousButtonPo().click();
  }

  clickNext(): Promise<void> {
    return this.getNextButtonPo().click();
  }
}
