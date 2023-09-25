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
    // Getting the `value` directly isn't working, we get the max value instead.
    return this.root.querySelector("progress").getAttribute("value");
  }

  /**
   * Uses the slices of the linear gradient to determine the segments of the progress bar.
   *
   * Example of inline-style: "--progress-bar-background: linear-gradient(to right, var(--positive-emphasis) 0% 25%, var(--warning-emphasis) 25% 100%);"
   */
  async getProgressBarSegments(): Promise<string[][]> {
    const inlineStyle = await this.root
      .querySelector("progress")
      .getAttribute("style");
    const percentageRegex = /\d+(\.\d+)?%/g;
    return (
      inlineStyle
        // We assume that there is only a single css variable `linear-gradient` in the style.
        .split(",")
        // Remove everything before the `to right` part.
        .slice(1)
        // Match and extract the percentages of each segment.
        .map<string[]>((segment) =>
          Array.from(segment.matchAll(percentageRegex)).map(([match]) => match)
        )
    );
  }
}
