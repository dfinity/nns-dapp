import type { ButtonPo } from "$tests/page-objects/Button.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ProposalNavigationPo extends BasePageObject {
  private static readonly TID = "proposal-nav";

  static under(element: PageObjectElement): ProposalNavigationPo {
    return new ProposalNavigationPo(element.byTestId(ProposalNavigationPo.TID));
  }

  getPreviousButtonPo(): ButtonPo {
    return this.getButton("proposal-nav-previous");
  }

  getNextButtonPo(): ButtonPo {
    return this.getButton("proposal-nav-next");
  }

  async isPreviousButtonHidden(): Promise<boolean> {
    return (
      await this.getPreviousButtonPo().root.getAttribute("class")
    ).includes("hidden");
  }

  async isNextButtonHidden(): Promise<boolean> {
    return (await this.getNextButtonPo().root.getAttribute("class")).includes(
      "hidden"
    );
  }

  clickPrevious(): Promise<void> {
    return this.getPreviousButtonPo().click();
  }

  clickNext(): Promise<void> {
    return this.getNextButtonPo().click();
  }
}
