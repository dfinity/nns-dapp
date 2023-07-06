import { NnsProposalListPo } from "$tests/page-objects/NnsProposalList.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ProposalsPo extends BasePageObject {
  private static readonly TID = "proposals-component";

  static under(element: PageObjectElement): ProposalsPo {
    return new ProposalsPo(element.byTestId(ProposalsPo.TID));
  }

  getNnsProposalListPo(): NnsProposalListPo {
    return NnsProposalListPo.under(this.root);
  }

  async waitForContentLoaded(): Promise<void> {
    return this.getNnsProposalListPo().waitForContentLoaded();
  }
}
