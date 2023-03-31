import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ProposalSummarySectionPo extends BasePageObject {
  private static readonly TID = "proposal-summary-section-component";

  private constructor(root: PageObjectElement) {
    super(root);
  }

  static under(element: PageObjectElement): ProposalSummarySectionPo {
    return new ProposalSummarySectionPo(
      element.byTestId(ProposalSummarySectionPo.TID)
    );
  }

  getProposalTitle(): Promise<string> {
    return this.root.querySelector("h1").getText();
  }

  getProposalUrlText(): Promise<string> {
    return this.root.byTestId("proposal-summary-url").getText();
  }

  getProposalSummary(): Promise<string> {
    return this.root.byTestId("proposal-summary-component").getText();
  }
}
