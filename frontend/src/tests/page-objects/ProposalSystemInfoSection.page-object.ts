import { KeyValuePairPo } from "$tests/page-objects/KeyValuePair.page-object";
import { NnsProposalPo } from "$tests/page-objects/NnsProposal.page-object";
import { ProposalSystemInfoProposerEntryPo } from "$tests/page-objects/ProposalSystemInfoProposerEntry.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ProposalSystemInfoSectionPo extends BasePageObject {
  private static readonly TID = "proposal-system-info-details";

  static under(element: PageObjectElement): ProposalSystemInfoSectionPo {
    return new ProposalSystemInfoSectionPo(
      element.byTestId(ProposalSystemInfoSectionPo.TID)
    );
  }

  getNnsProposalPo(): NnsProposalPo {
    return NnsProposalPo.under(this.root);
  }

  async getKeyValuePairValueText(testId: string): Promise<string> {
    return KeyValuePairPo.under({
      element: this.root,
      testId,
    }).getValueText();
  }

  async getProposalTypeText(): Promise<string> {
    return (
      await this.getKeyValuePairValueText("proposal-system-info-type")
    )?.trim();
  }

  async getProposalTopicText(): Promise<string> {
    return (
      await this.getKeyValuePairValueText("proposal-system-info-topic")
    )?.trim();
  }

  async getProposalStatusText(): Promise<string> {
    return (
      await this.getKeyValuePairValueText("proposal-system-info-status")
    )?.trim();
  }

  async getProposalRewardText(): Promise<string> {
    return (
      await this.getKeyValuePairValueText("proposal-system-info-reward")
    )?.trim();
  }

  async getProposalProposerNeuronIdText(): Promise<string> {
    return ProposalSystemInfoProposerEntryPo.under(this.root).getNeuronId();
  }
}
