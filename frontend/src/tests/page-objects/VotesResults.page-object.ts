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

  async getProgressBar(): Promise<PageObjectElement> {
    return assertNonNullish(await this.root.byRole("progressbar"));
  }

  async getProgressMinValue(): Promise<bigint> {
    return assertNonNullish(
      BigInt(await (await this.getProgressBar()).getAttribute("aria-valuemin"))
    );
  }

  async getProgressMaxValue(): Promise<bigint> {
    return assertNonNullish(
      BigInt(await (await this.getProgressBar()).getAttribute("aria-valuemax"))
    );
  }

  async getProgressNowValue(): Promise<bigint> {
    return assertNonNullish(
      BigInt(await (await this.getProgressBar()).getAttribute("aria-valuenow"))
    );
  }
}
