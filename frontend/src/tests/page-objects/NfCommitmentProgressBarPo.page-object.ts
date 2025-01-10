import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NfCommitmentProgressBarPo extends BasePageObject {
  private static TID = "nf-commitment-progress-bar-component";

  static under(element: PageObjectElement): NfCommitmentProgressBarPo {
    return new NfCommitmentProgressBarPo(
      element.byTestId(NfCommitmentProgressBarPo.TID)
    );
  }

  async getMinCommitment(): Promise<string> {
    return (await this.getText("commitment-min-indicator-value")).trim();
  }

  async getMaxCommitment(): Promise<string> {
    return (await this.getText("commitment-max-indicator-value")).trim();
  }

  async getCommitmentE8s(): Promise<bigint> {
    // The `value` property has the value of the max value but the `value` attribute has the value of the progress.
    const valueString = await this.root
      .querySelector("progress")
      .getAttribute("value");
    return BigInt(valueString);
  }
}
