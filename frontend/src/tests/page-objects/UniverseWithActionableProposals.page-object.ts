import { UniversePageSummaryPo } from "$tests/page-objects/UniversePageSummary.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class UniverseWithActionableProposalsPo extends BasePageObject {
  static readonly TID = "universe-with-actionable-proposals-component";

  static under(element: PageObjectElement): UniverseWithActionableProposalsPo {
    return new UniverseWithActionableProposalsPo(
      element.byTestId(UniverseWithActionableProposalsPo.TID)
    );
  }

  static async allUnder(
    element: PageObjectElement
  ): Promise<UniverseWithActionableProposalsPo[]> {
    return Array.from(
      await element.allByTestId(UniverseWithActionableProposalsPo.TID)
    ).map((el) => new UniverseWithActionableProposalsPo(el));
  }

  getSummaryPo(): UniversePageSummaryPo {
    return UniversePageSummaryPo.under(this.root);
  }

  getTitle(): Promise<string> {
    return this.getSummaryPo().getTitle();
  }
}
