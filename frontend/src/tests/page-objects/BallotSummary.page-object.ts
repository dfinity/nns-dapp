import { KeyValuePairInfoPo } from "$tests/page-objects/KeyValuePairInfo.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class BallotSummaryPo extends BasePageObject {
  static readonly TID = "ballot-summary-component";

  static under(element: PageObjectElement): BallotSummaryPo {
    return new BallotSummaryPo(element.byTestId(BallotSummaryPo.TID));
  }

  getKeyValuePairPo(): KeyValuePairInfoPo {
    return KeyValuePairInfoPo.under({
      element: this.root,
      testId: "ballot-summary",
    });
  }

  getProposalSummaryPo(): KeyValuePairInfoPo {
    return KeyValuePairInfoPo.under({
      element: this.root,
      testId: "proposal-summary",
    });
  }

  async waitForLoaded(): Promise<void> {
    await this.root.byTestId("skeleton-text").waitForAbsent();
    await this.root.byTestId("spinner").waitForAbsent();
  }

  getProposalId(): Promise<string> {
    return this.getText("proposal-id");
  }

  getVote(): Promise<string> {
    return this.getText("vote");
  }

  clickInfoIcon(): Promise<void> {
    return this.getKeyValuePairPo().clickInfoIcon();
  }

  isBallotSummaryVisible(): Promise<boolean> {
    return this.getKeyValuePairPo().isDescriptionVisible();
  }

  async getBallotSummary(): Promise<string> {
    return (await this.getKeyValuePairPo().getDescriptionText()).trim();
  }
}
