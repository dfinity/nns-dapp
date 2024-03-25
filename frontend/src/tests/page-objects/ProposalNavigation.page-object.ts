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

  getNewerButtonPo(): ButtonPo {
    return this.getButton("proposal-nav-newer");
  }

  getOlderButtonPo(): ButtonPo {
    return this.getButton("proposal-nav-older");
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

  async getNewerButtonProposalId(): Promise<string> {
    return (await this.getNewerButtonPo().getElement()).getAttribute(
      "data-test-proposal-id"
    );
  }

  async getOlderButtonProposalId(): Promise<string> {
    return (await this.getOlderButtonPo().getElement()).getAttribute(
      "data-test-proposal-id"
    );
  }

  async isNewerButtonHidden(): Promise<boolean> {
    return ProposalNavigationPo.isButtonHidden(this.getNewerButtonPo());
  }

  async isOlderButtonHidden(): Promise<boolean> {
    return ProposalNavigationPo.isButtonHidden(this.getOlderButtonPo());
  }

  clickNewer(): Promise<void> {
    return this.getNewerButtonPo().click();
  }

  clickOlder(): Promise<void> {
    return this.getOlderButtonPo().click();
  }
}
