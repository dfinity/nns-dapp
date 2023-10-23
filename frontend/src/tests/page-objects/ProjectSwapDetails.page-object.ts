import { AmountDisplayPo } from "$tests/page-objects/AmountDisplay.page-object";
import { KeyValuePairPo } from "$tests/page-objects/KeyValuePair.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { normalizeWhitespace } from "$tests/utils/utils.test-utils";

export class ProjectSwapDetailsPo extends BasePageObject {
  private static readonly TID = "project-swap-details-component";

  static under(element: PageObjectElement): ProjectSwapDetailsPo {
    return new ProjectSwapDetailsPo(element.byTestId(ProjectSwapDetailsPo.TID));
  }

  getTotalSupply(): Promise<string> {
    return AmountDisplayPo.under(
      this.root.querySelector("[data-tid=sns-total-token-supply]")
    ).getAmount();
  }

  getTokensDistributed(): Promise<string> {
    return AmountDisplayPo.under(
      this.root.querySelector("[data-tid=sns-tokens-distributed]")
    ).getAmount();
  }

  getExcludedCountriesPo(): KeyValuePairPo {
    return KeyValuePairPo.under({
      element: this.root,
      testId: "excluded-countries",
    });
  }

  getMinParticipants(): Promise<string> {
    return KeyValuePairPo.under({
      element: this.root,
      testId: "project-swap-min-participants",
    }).getValueText();
  }

  async getMinParticipantCommitment(): Promise<string> {
    return (
      await KeyValuePairPo.under({
        element: this.root,
        testId: "sns-min-participant-commitment",
      }).getValueText()
    ).trim();
  }

  async getMaxParticipantCommitment(): Promise<string> {
    return (
      await KeyValuePairPo.under({
        element: this.root,
        testId: "sns-max-participant-commitment",
      }).getValueText()
    ).trim();
  }

  async getMaxNfCommitment(): Promise<string> {
    return (
      await KeyValuePairPo.under({
        element: this.root,
        testId: "sns-max-nf-commitment",
      }).getValueText()
    ).trim();
  }

  async getSaleEnd(): Promise<string> {
    return normalizeWhitespace(
      await KeyValuePairPo.under({
        element: this.root,
        testId: "sns-sale-end",
      }).getValueText()
    );
  }
}
