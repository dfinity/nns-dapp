import type { PageObjectElement } from "$tests/types/page-object.types";
import { BasePageObject } from "./base.page-object";

export class CommitmentProgressBarPo extends BasePageObject {
  private static TID = "commitment-progress-bar-component";

  static under(element: PageObjectElement): CommitmentProgressBarPo {
    return new CommitmentProgressBarPo(
      element.byTestId(CommitmentProgressBarPo.TID)
    );
  }

  hasMinCommitmentIndicator(): Promise<boolean> {
    return this.root.byTestId("commitment-min-indicator").isPresent();
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
