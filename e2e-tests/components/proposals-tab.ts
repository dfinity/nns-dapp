import { MyNavigator } from "../common/navigator";
import { execFile } from "node:child_process";

export class ProposalsTab extends MyNavigator {
  static readonly SELECTOR: string = `[data-tid="proposals-tab"]`;
  static readonly PROPOSAL_TALLY_SELECTOR: string = ".latest-tally";
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

  constructor(browser: WebdriverIO.Browser) {
    super(browser);
  }
}
