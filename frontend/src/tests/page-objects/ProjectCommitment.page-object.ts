import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { CommitmentProgressBarPo } from "./CommitmentProgressBarPo.page-object";
import { KeyValuePairPo } from "./KeyValuePair.page-object";

export class ProjectCommitmentPo extends BasePageObject {
  private static readonly TID = "project-commitment-component";

  static under(element: PageObjectElement): ProjectCommitmentPo {
    return new ProjectCommitmentPo(element.byTestId(ProjectCommitmentPo.TID));
  }

  getCommitmentProgressBarPo(): CommitmentProgressBarPo {
    return CommitmentProgressBarPo.under(this.root);
  }

  getMaxCommitment(): Promise<string> {
    return this.getCommitmentProgressBarPo().getMaxCommitment();
  }

  getMinCommitment(): Promise<string> {
    return this.getCommitmentProgressBarPo().getMinCommitment();
  }

  async getParticipantsCount(): Promise<number> {
    return Number(await this.getText("sns-project-current-sale-buyer-count"));
  }

  async getCurrentTotalCommitment(): Promise<string> {
    return KeyValuePairPo.under({
      element: this.root,
      testId: "sns-project-current-commitment",
    }).getValueText();
  }

  getNeuronsFundParticipationElement(): KeyValuePairPo {
    return KeyValuePairPo.under({
      element: this.root,
      testId: "sns-project-current-nf-commitment",
    });
  }

  hasNeuronsFundParticipation(): Promise<boolean> {
    return this.getNeuronsFundParticipationElement().isPresent();
  }

  getNeuronsFundParticipation(): Promise<string> {
    return this.getNeuronsFundParticipationElement().getValueText();
  }

  getDirectParticipationElement(): KeyValuePairPo {
    return KeyValuePairPo.under({
      element: this.root,
      testId: "sns-project-current-direct-commitment",
    });
  }

  hasDirectParticipation(): Promise<boolean> {
    return this.getDirectParticipationElement().isPresent();
  }

  getDirectParticipation(): Promise<string> {
    return this.getDirectParticipationElement().getValueText();
  }
}
