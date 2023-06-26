import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ProposalCardPo extends BasePageObject {
  private static readonly TID = "proposal-card";

  static async allUnder(element: PageObjectElement): Promise<ProposalCardPo[]> {
    return Array.from(await element.allByTestId(ProposalCardPo.TID)).map(
      (el) => new ProposalCardPo(el)
    );
  }

  static under(element: PageObjectElement): ProposalCardPo {
    return new ProposalCardPo(element.byTestId(ProposalCardPo.TID));
  }

  getProposalId(): Promise<string> {
    return this.getText("proposal-id");
  }
}
