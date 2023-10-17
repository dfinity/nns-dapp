import { BasePageObject } from "$tests/page-objects/base.page-object";
import { KeyValuePairPo } from "$tests/page-objects/KeyValuePair.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class SnsProposalSystemInfoSectionPo extends BasePageObject {
  private static readonly TID = "proposal-system-info-details-component";

  static under(
    element: PageObjectElement
  ): SnsProposalSystemInfoSectionPo | null {
    const el = element.querySelector(
      `[data-tid=${SnsProposalSystemInfoSectionPo.TID}]`
    );
    return el && new SnsProposalSystemInfoSectionPo(el);
  }

  getTitleText(): Promise<string> {
    return this.root.querySelector("h1").getText();
  }

  async getTypeText(): Promise<string> {
    return (
      await KeyValuePairPo.under({
        element: this.root,
        testId: "proposal-system-info-type",
      }).getValueText()
    )?.trim();
  }

  async getDecisionStatusText(): Promise<string> {
    return (
      await KeyValuePairPo.under({
        element: this.root,
        testId: "proposal-system-info-status",
      }).getValueText()
    )?.trim();
  }

  async getRewardStatusText(): Promise<string> {
    return (
      await KeyValuePairPo.under({
        element: this.root,
        testId: "proposal-system-info-reward",
      }).getValueText()
    )?.trim();
  }

  async getCreatedText(): Promise<string> {
    return (
      await KeyValuePairPo.under({
        element: this.root,
        testId: "proposal-system-info-created",
      }).getValueText()
    )?.trim();
  }

  async getDecidedText(): Promise<string | undefined> {
    return (
      await KeyValuePairPo.under({
        element: this.root,
        testId: "proposal-system-info-decided",
      }).getValueText()
    )?.trim();
  }

  async getExecutedText(): Promise<string | undefined> {
    return (
      await KeyValuePairPo.under({
        element: this.root,
        testId: "proposal-system-info-executed",
      }).getValueText()
    )?.trim();
  }

  async getFailedText(): Promise<string | undefined> {
    return (
      await KeyValuePairPo.under({
        element: this.root,
        testId: "proposal-system-info-failed",
      }).getValueText()
    )?.trim();
  }

  getProposerText(): Promise<string> {
    return KeyValuePairPo.under({
      element: this.root,
      testId: "proposal-system-info-proposer",
    }).getValueText();
  }
}
