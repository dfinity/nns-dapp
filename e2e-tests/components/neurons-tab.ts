import { MyNavigator } from "../common/navigator";

export class NeuronsTab extends MyNavigator {
  static readonly SELECTOR: string = `[data-tid="neurons-body"]`; // Note: This is not quite right; this catches only the main body, not the footer.
  static readonly MODAL_SELECTOR: string = `.modal`; // TODO: This should have a data-tid
  static readonly MODAL_HEADER_SELECTOR: string = `#modalTitle`; // TODO: This should have a data-tid
  static readonly STAKE_NEURON_BUTTON_SELECTOR: string = `[data-tid="stake-neuron-button"]`; // Note the user-visible text is plural but the data-tid is singular.  One neuron gets staked.
  static readonly STAKE_NEURON_ACCOUNT_SELECTOR = `${NeuronsTab.MODAL_SELECTOR} [data-tid="card"]`; // TODO: This is very imprecise
  static readonly STAKE_NEURON_AMOUNT_INPUT_SELECTOR: string = `${NeuronsTab.MODAL_SELECTOR} [data-tid="input-ui-element"]`;
  static readonly STAKE_NEURON_SUBMIT_BUTTON_SELECTOR: string = `${NeuronsTab.MODAL_SELECTOR} data-tid="create-neuron-button"`;
  static readonly MERGE_NEURONS_BUTTON_SELECTOR: string = `[data-tid="merge-neurons-button"]`;

  constructor(browser: WebdriverIO.Browser) {
    super(browser);
  }

    // TODO: There is no good way to make sure that the browser has displayed the expected modal.  The text can change due to internationalisation.
    // Ideally the modal body would have a specific data-tid so that we can be sure that we have the expected modal and are sure that any further selectors are inside that expected modal.
  async waitForModalWithTitle(title: string, options?: { timeout?: number }
) {
    const timeout = options?.timeout ?? 5_000;
    const timeoutMsg = `Timeout after ${timeout.toLocaleString()}ms waiting for modal with title "${title}".`;
    await this.browser.waitUntil(async () =>
      this.getElement(NeuronsTab.MODAL_HEADER_SELECTOR, "Get modal header").then(async (element) => title === await element.getText())
    , {timeout, timeoutMsg});
  }

  async stakeNeuron(options?:{icp: number}) {
    // WARNING: If we start before the accounts have loaded this fails.  Why?  No idea.
    // Waiting later does not help, it seems as if the wait has to be before we open the getIcp modal.
    // TODO: The getICP button should not be clickable until it works.
    await this.browser.pause(6000);
    // Ok, now the accounts should have loaded.

    const icp = options?.icp ?? 1;

    await this.click(NeuronsTab.STAKE_NEURON_BUTTON_SELECTOR, "Click to start staking neuron");
    await this.getElement(NeuronsTab.MODAL_SELECTOR, "Wait for modal");
    await this.waitForModalWithTitle("Select Source Account");
    await this.click(NeuronsTab.STAKE_NEURON_ACCOUNT_SELECTOR, "Choose to pay with the first account");
    await this.waitForModalWithTitle("Stake Neuron");
    await this.getElement(NeuronsTab.STAKE_NEURON_AMOUNT_INPUT_SELECTOR, "Get stake amount input field").then(element => element.setValue(icp.toString()));
    await this.click(NeuronsTab.STAKE_NEURON_SUBMIT_BUTTON_SELECTOR, "Submit neuron creation");
    await this.waitForModalWithTitle("Set Dissolve Delay");
  }
}
