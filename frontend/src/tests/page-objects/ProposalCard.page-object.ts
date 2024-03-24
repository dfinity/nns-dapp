import { ProposalStatusTagPo } from "$tests/page-objects/ProposalStatusTag.page-object";
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

  getProposalStatusTagPo(): ProposalStatusTagPo {
    return ProposalStatusTagPo.under(this.root);
  }

  getProposalId(): Promise<string> {
    return this.getText("proposal-id");
  }

  getProposalTopicText(): Promise<string> {
    return this.getText("proposal-topic");
  }

  async getProposalStatusText(): Promise<string> {
    return (await this.getProposalStatusTagPo().getText()).trim();
  }

  getProposer(): Promise<string> {
    return this.root
      .querySelector("[data-proposer-id]")
      ?.getAttribute("data-proposer-id");
  }
}
