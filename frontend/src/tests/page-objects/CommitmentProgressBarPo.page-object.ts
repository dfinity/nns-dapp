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

  hasMaxCommitmentIndicator(): Promise<boolean> {
    return this.root.byTestId("commitment-max-indicator").isPresent();
  }

  async getMinCommitment(): Promise<string> {
    return (await this.getText("commitment-min-indicator-value")).trim();
  }

  async getMaxCommitment(): Promise<string> {
    return (await this.getText("commitment-max-indicator-value")).trim();
  }

  async getTotalCommitmentE8s(): Promise<bigint> {
    // The `value` property has the value of the max value but the `value` attribute has the value of the progress.
    const valueString = await this.root
      .querySelector("progress")
      .getAttribute("value");
    return BigInt(valueString);
  }

  /**
   * Uses the slices of the linear gradient to determine the segments of the progress bar.
   *
   * Example of inline-style: "--progress-bar-background: linear-gradient(to right, var(--positive-emphasis) 0% 25%, var(--warning-emphasis) 25% 100%);"
   */
  async getNFCommitmentE8s(): Promise<bigint> {
    const inlineStyleRegex =
      /--progress-bar-background: linear-gradient\(to right, var\(.*\) 0% (\d+(?:\.\d+)?)%, var\(.*\) (\d+(?:\.\d+)?)% 100%\);/g;

    const inlineStyle = await this.root
      .querySelector("progress")
      .getAttribute("style");

    const matches = inlineStyleRegex.exec(inlineStyle);

    if (matches === null) {
      throw new Error(`Invalid inline style: ${inlineStyle}`);
    }

    const [_inlineStyle, firstPercentage, secondPercentage] = matches;

    if (firstPercentage !== secondPercentage) {
      throw new Error(
        `The first and second percentage should be the same: ${firstPercentage} !== ${secondPercentage}`
      );
    }

    const totalCommitment = Number(await this.getTotalCommitmentE8s());
    const nfPercentage = Number(firstPercentage);

    return BigInt(Math.round((totalCommitment * nfPercentage) / 100));
  }

  async getDirectCommitmentE8s(): Promise<bigint> {
    const totalCommitment = await this.getTotalCommitmentE8s();
    return BigInt(totalCommitment - (await this.getNFCommitmentE8s()));
  }
}
