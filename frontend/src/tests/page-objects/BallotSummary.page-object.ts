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
