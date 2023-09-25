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

  getProgressBarValue(): Promise<string> {
    // The `value` property has the value of the max value but the `value` attribute has the value of the progress.
    return this.root.querySelector("progress").getAttribute("value");
  }

  /**
   * Uses the slices of the linear gradient to determine the segments of the progress bar.
   *
   * Example of inline-style: "--progress-bar-background: linear-gradient(to right, var(--positive-emphasis) 0% 25%, var(--warning-emphasis) 25% 100%);"
   */
  async getNFCommitmentPercentage(): Promise<number> {
    const inlineStyleRegex =
      /--progress-bar-background: linear-gradient\(to right, var\(.*\) 0% (\d+(?:\.\d+)?)%, var\(.*\) (\d+(?:\.\d+)?)% 100%\);/g;

    const inlineStyle = await this.root
      .querySelector("progress")
      .getAttribute("style");

    const matches = inlineStyleRegex.exec(inlineStyle);

    if (matches === null) {
      throw new Error("Invalid inline style");
    }

    const [_inlineStyle, firstPercentage, secondPercentage] = matches;

    if (firstPercentage !== secondPercentage) {
      throw new Error(
        `The first and second percentage should be the same: ${firstPercentage} !== ${secondPercentage}`
      );
    }

    return Number(firstPercentage);
  }

  async getDirectCommitmentPercentage(): Promise<number> {
    return 100 - (await this.getNFCommitmentPercentage());
  }
}
