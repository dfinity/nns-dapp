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

  getTypeText(): Promise<string> {
    return KeyValuePairPo.under({
      element: this.root,
      testId: "proposal-system-info-type",
    }).getValueText();
  }

  getDecisionStatusText(): Promise<string> {
    return KeyValuePairPo.under({
      element: this.root,
      testId: "proposal-system-info-status",
    }).getValueText();
  }

  getRewardStatusText(): Promise<string> {
    return KeyValuePairPo.under({
      element: this.root,
      testId: "proposal-system-info-reward",
    }).getValueText();
  }

  getCreatedText(): Promise<string> {
    return KeyValuePairPo.under({
      element: this.root,
      testId: "proposal-system-info-created",
    }).getValueText();
  }

  getDecidedText(): Promise<string> {
    return KeyValuePairPo.under({
      element: this.root,
      testId: "proposal-system-info-decided",
    }).getValueText();
  }

  getExecutedText(): Promise<string> {
    return KeyValuePairPo.under({
      element: this.root,
      testId: "proposal-system-info-executed",
    }).getValueText();
  }

  getFailedText(): Promise<string> {
    return KeyValuePairPo.under({
      element: this.root,
      testId: "proposal-system-info-failed",
    }).getValueText();
  }

  getProposerText(): Promise<string> {
    return KeyValuePairPo.under({
      element: this.root,
      testId: "proposal-system-info-proposer",
    }).getValueText();
  }
}
