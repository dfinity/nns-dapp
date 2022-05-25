import { MyNavigator } from "../common/navigator";
import { execFile } from "node:child_process";

export class ProposalsTab extends MyNavigator {
  static readonly SELECTOR: string = `[data-tid="proposals-tab"]`;
  static readonly PROPOSAL_TALLY_SELECTOR: string = ".latest-tally";
  static readonly PROPOSAL_FILTER_APPLY_SELECTOR: string = `[data-tid="apply-proposals-filter"]`;
  static readonly BACK_TO_PROPOSAL_LIST_SELECTOR: string = "button.back";

  public static proposalIdSelector(proposalId: number): string {
    return `[data-tid="proposal-id"][data-proposal-id="${proposalId}"]`;
  }

  /**
   * Creates a proposal via the command line tool.
   */
  public static async propose(proposalName: string): Promise<number> {
    console.warn("Creating proposal...");
    const proposalId: number = await new Promise((yay, nay) =>
      execFile(
        "../scripts/propose",
        ["--to", proposalName, "--jfdi"],
        {},
        (error, stdout, stderr) => {
          if (error) {
            nay(new Error(`${error}\nstdout: ${stdout}\nstderr: ${stderr}`));
          } else {
            const proposalId = Number(
              stdout
                .split(/[\n\r]/)
                .map((line) => line.split(/[ \t]+/))
                .filter(
                  (fields) => fields.length === 2 && fields[0] === "proposal"
                )
                .map((fields) => fields[1])[0]
            );
            if (Number.isSafeInteger(proposalId)) {
              yay(proposalId);
            } else {
              nay(
                new Error(
                  `No proposal was made.\nstdout:\n${stdout}\nstderr: ${stderr}`
                )
              );
            }
          }
        }
      )
    );
    console.warn(`Proposed proposalId ${proposalId}`);
    return proposalId;
  }

  /**
   * Enable (or disable) a set of values in one filter.
   *
   * @param {string} filterTid = the test ID of the filter.
   * @param {bool} enable = select the given values, otherwise they will be deselected.
   */
  async filter(
    filterTid: string,
    values: Array<string>,
    enable: boolean = true
  ): Promise<void> {
    // The default window is too small, so some checkboxes and buttons are not shown in screenshots.
    const {width, height} = await browser.getWindowSize();
    await browser.setWindowSize(800, 1000);

    // Open filter modal:
    await this.click(
      `[data-tid="${filterTid}"]`,
      `Open filter modal for ${filterTid}`
    );

    // Set filter:
    console.warn(`Setting filter ${filterTid} to ${enable?"enable":"disable"} ${JSON.stringify(values)}`);
    await this.browser.execute(
      (values: Array<string>, enable) =>
        Array.from(document.querySelectorAll(`.modal .checkbox`)).forEach(
          (element) => {
            const checkbox = element.querySelector("input");
            if (checkbox === null) {
              throw new Error(
                `No checkbox in filter item: ${element.outerHTML}`
              );
            }
            if (
              (checkbox.checked === enable) !==
              values.includes(element.querySelector("label")?.innerText ?? "")
            ) {
              checkbox.click();
            }
          }
        ),
      values,
      enable
    );

    // Submit filter
    await this.click(
      ProposalsTab.PROPOSAL_FILTER_APPLY_SELECTOR,
      "Apply filter"
    );

    // Verify that the filter at least looks as if it has been applied
    await this.waitForGone(".modal", "Wait for the filter modal to go away");
    await this.browser.waitUntil(
      async () => {
        const filterCountElement = await this.getElement(
          `[data-tid="${filterTid}"] small`,
          "Getting the element with the number of selected filter options"
        );
        const filterCountText = await filterCountElement.getText();
        const [num_selected, of_available] = filterCountText
          .replace(/.*\(([0-9]+)\/([0-9]+).*/, "$1 $2")
          .split(" ")
          .map((field) => Number(field));
        return (
          values.length ===
          (enable ? num_selected : of_available - num_selected)
        );
      },
      {
        timeoutMsg: `Waiting for the number of filter elements to be correct.`,
        timeout: 5_000,
      }
    );

    // Restore the former window size.
    await browser.setWindowSize(width, height);
  }

  constructor(browser: WebdriverIO.Browser) {
    super(browser);
  }
}
