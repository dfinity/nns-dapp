import { MyNavigator } from "../common/navigator";

export class ProposalsTab extends MyNavigator {
  static readonly SELECTOR: string = `[data-tid="proposals-tab"]`;
  static readonly PROPOSAL_TALLY_SELECTOR: string = ".latest-tally";
  static readonly BACK_TO_PROPOSAL_LIST_SELECTOR: string = "button.back";

  public static proposalIdSelector(proposalId: number): string {
    return `[data-tid="proposal-id"][data-proposal-id="${proposalId}"]`;
  }

  constructor(browser: WebdriverIO.Browser) {
    super(browser);
  }
}
