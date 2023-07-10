import type { ButtonPo } from "$tests/page-objects/Button.page-object";
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
