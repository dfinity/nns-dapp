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
    await browser.pause(2_000);
    await this.click(
      `[data-tid="${filterTid}"]`,
      `Open filter modal for ${filterTid}`
    );
    await browser.pause(1_000);
    console.warn("Setting filter");
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
            checkbox.checked =
              enable ===
              values.includes(element.querySelector("label")?.innerText ?? "");
          }
        ),
      values,
      enable
    );
    await browser.pause(2_000);
    console.warn("Applying filter", ProposalsTab.PROPOSAL_FILTER_APPLY_SELECTOR);
    await this.click(ProposalsTab.PROPOSAL_FILTER_APPLY_SELECTOR, "Apply filter");
    await this.waitForGone(".modal", "Wait for the filter modal to go away");
    await this.browser.waitUntil(async () => {
      let filterCountElement = await this.getElement(`[data-tid="${filterTid}"] small`);
      let filterCountText = await filterCountElement.getText();
      return Number(filterCountText.replace(/.*\(([0-9]+)\/.*/, "$1")) === values.length;
    }, {timeoutMsg: `Waiting for the number of filter elements to be correct.`, timeout: 5_000});
    await browser.pause(1_000);
  }

  constructor(browser: WebdriverIO.Browser) {
    super(browser);
  }
}
