import { NnsProposalPo } from "$tests/page-objects/NnsProposal.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ProposalDetailPo extends BasePageObject {
  private static readonly TID = "proposal-detail-component";

  static under(element: PageObjectElement): ProposalDetailPo {
    return new ProposalDetailPo(element.byTestId(ProposalDetailPo.TID));
  }

  getNnsProposalPo(): NnsProposalPo {
    return NnsProposalPo.under(this.root);
  }

  async waitForContentLoaded(): Promise<void> {
    return this.getNnsProposalPo().waitForContentLoaded();
  }
}
