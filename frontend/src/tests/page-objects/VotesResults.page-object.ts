import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { assertNonNullish } from "$tests/utils/utils.test-utils";

export class VotesResultPo extends BasePageObject {
  private static readonly TID = "votes-results-component";

  private constructor(root: PageObjectElement) {
    super(root);
  }

  static under(element: PageObjectElement): VotesResultPo {
    return new VotesResultPo(element.byTestId(VotesResultPo.TID));
  }

  getProgressBar(): PageObjectElement {
    return assertNonNullish(this.root.byTestId("votes-progressbar"));
  }

  async getProgressMinValue(): Promise<number> {
    return assertNonNullish(
      Number(await this.getProgressBar().getAttribute("aria-valuemin"))
    );
  }

  async getProgressMaxValue(): Promise<number> {
    return assertNonNullish(
      Number(await this.getProgressBar().getAttribute("aria-valuemax"))
    );
  }

  async getProgressNowValue(): Promise<number> {
    return assertNonNullish(
      Number(await this.getProgressBar().getAttribute("aria-valuenow"))
    );
  }

  /** @returns formatted text */
  async getAdoptVotingPower(): Promise<string> {
    return assertNonNullish(this.root.byTestId("adopt").getText());
  }

  /** @returns formatted text */
  async getRejectVotingPower(): Promise<string> {
    return assertNonNullish(this.root.byTestId("reject").getText());
  }
}
