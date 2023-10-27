import { KeyValuePairPo } from "$tests/page-objects/KeyValuePair.page-object";
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

  getProposalTopicText(): Promise<string> {
    return KeyValuePairPo.under({
      element: this.root,
      testId: "proposal-topic",
    }).getValueText();
  }

  async getProposalStatusText(): Promise<string> {
    return (
      await KeyValuePairPo.under({
        element: this.root,
        testId: "proposal-status",
      }).getValueText()
    ).trim();
  }

  getProposer(): Promise<string> {
    return this.root
      .querySelector("[data-proposer-id]")
      ?.getAttribute("data-proposer-id");
  }
}
