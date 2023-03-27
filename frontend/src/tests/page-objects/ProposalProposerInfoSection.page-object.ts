import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ProposalProposerInfoSectionPo extends BasePageObject {
  static readonly tid = "proposal-proposer-info-component";

  private constructor(root: PageObjectElement) {
    super(root);
  }

  static under(element: PageObjectElement): ProposalProposerInfoSectionPo {
    return new ProposalProposerInfoSectionPo(
      element.byTestId(ProposalProposerInfoSectionPo.tid)
    );
  }

  getProposalTitle(): Promise<string> {
    return this.root.querySelector("h1").getText();
  }

  getProposalUrlText(): Promise<string> {
    return this.root.byTestId("proposal-proposer-info-url").getText();
  }

  hasContent(): Promise<boolean> {
    return this.root.isPresent();
  }
}
