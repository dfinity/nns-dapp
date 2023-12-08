import { ButtonPo } from "$tests/page-objects/Button.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
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
  async getAdoptVotingPower(): Promise<number> {
    return Number(
      await assertNonNullish(this.root.byTestId("adopt").getText())
    );
  }

  /** @returns formatted text */
  async getRejectVotingPower(): Promise<number> {
    return Number(
      await assertNonNullish(this.root.byTestId("reject").getText())
    );
  }

  /** @returns formatted text */
  async getAdoptCastVotesValue(): Promise<string> {
    return this.root.byTestId("adopt-cast-votes").getText();
  }

  /** @returns formatted text */
  async getRejectCastVotesValue(): Promise<string> {
    return this.root.byTestId("reject-cast-votes").getText();
  }

  /** @returns formatted text */
  async getExpirationDateText(): Promise<string> {
    return assertNonNullish(this.root.byTestId("remain").getText());
  }

  async expandMajorityDescriptions(): Promise<void> {
    await Promise.all([
      ButtonPo.under({
        element: this.root,
        testId: "immediate-majority-toggle",
      }).click(),
      ButtonPo.under({
        element: this.root,
        testId: "standard-majority-toggle",
      }).click(),
    ]);
    await runResolvedPromises();
  }

  async getImmediateMajorityTitle(): Promise<string> {
    return (
      await this.root.byTestId("immediate-majority-title").getText()
    )?.trim();
  }

  async getImmediateMajorityDescription(): Promise<string> {
    return assertNonNullish(
      this.root.byTestId("immediate-majority-description").getText()
    );
  }
  async getStandardMajorityTitle(): Promise<string> {
    return (
      await this.root.byTestId("standard-majority-title").getText()
    )?.trim();
  }
  async getStandardMajorityDescription(): Promise<string> {
    return assertNonNullish(
      this.root.byTestId("standard-majority-description").getText()
    );
  }
}
