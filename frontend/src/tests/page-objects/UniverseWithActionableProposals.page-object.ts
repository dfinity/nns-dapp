import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { assertNonNullish } from "$tests/utils/utils.test-utils";

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

  async getTitle(): Promise<string> {
    return (
      await assertNonNullish(this.root.querySelector("h1")).getText()
    ).trim();
  }
}
