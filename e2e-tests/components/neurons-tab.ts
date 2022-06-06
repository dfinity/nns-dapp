import { MyNavigator } from "../common/navigator";

export class NeuronsTab extends MyNavigator {
  static readonly SELECTOR: string = `[data-tid="neurons-body"]`; // Note: This is not quite right; this catches only the main body, not the footer.
  static readonly MODAL_SELECTOR: string = `.modal`; // TODO: This should have a data-tid
  static readonly MODAL_CLOSE_SELECTOR: string = `[data-tid="close-modal"]`;
  static readonly MODAL_HEADER_SELECTOR: string = `#modalTitle`; // TODO: This should have a data-tid
  static readonly STAKE_NEURON_BUTTON_SELECTOR: string = `[data-tid="stake-neuron-button"]`; // Note the user-visible text is plural but the data-tid is singular.  One neuron gets staked.
  static readonly STAKE_NEURON_ACCOUNT_SELECTOR = `${NeuronsTab.MODAL_SELECTOR} [data-tid="account-card"]`; // TODO: This is very imprecise
  static readonly STAKE_NEURON_AMOUNT_INPUT_SELECTOR: string = `${NeuronsTab.MODAL_SELECTOR} [data-tid="input-ui-element"]`;
  static readonly STAKE_NEURON_SUBMIT_BUTTON_SELECTOR: string = `${NeuronsTab.MODAL_SELECTOR} [data-tid="create-neuron-button"]`;
  static readonly SET_DISSOLVE_DELAY_SLIDER_SELECTOR: string = `${NeuronsTab.MODAL_SELECTOR} .select-delay-container [data-tid="input-range"]`;
  static readonly SET_DISSOLVE_DELAY_SUBMIT_SELECTOR: string = `${NeuronsTab.MODAL_SELECTOR} [data-tid="go-confirm-delay-button"]`;
  static readonly SKIP_DISSOLVE_DELAY_SELECTOR: string = `${NeuronsTab.MODAL_SELECTOR} [data-tid="cancel-neuron-delay"]`;
  static readonly SET_DISSOLVE_DELAY_CONFIRM_SELECTOR: string = `${NeuronsTab.MODAL_SELECTOR} [data-tid="confirm-delay-button"]`;
  static readonly NEURON_DETAIL_SELECTOR: string = `[data-tid="neuron-detail"]`;
  static readonly NEURON_CARD_TITLE_SELECTOR: string = `[data-tid="neuron-card-title"]`;
  static readonly MERGE_NEURONS_BUTTON_SELECTOR: string = `[data-tid="merge-neurons-button"]`;
  static readonly MERGE_NEURONS_SUBMIT_SELECTOR: string = `[data-tid="merge-neurons-confirm-selection-button"]`;
  static readonly MERGE_NEURONS_CONFIRM_SELECTOR: string = `[data-tid="confirm-merge-neurons-button"]`;
  static readonly DISBURSE_BUTTON_SELECTOR: string = `[data-tid="disburse-button"]`;
  static readonly DISBURSE_ACCOUNT_SELECTOR = `${NeuronsTab.MODAL_SELECTOR} [data-tid="account-card"]`;
  static readonly DISBURSE_CONFIRM_SELECTOR = `${NeuronsTab.MODAL_SELECTOR} [data-tid="disburse-neuron-button"]`;

  constructor(browser: WebdriverIO.Browser) {
    super(browser);
  }

  async getNeuronById(
    neuronId: string,
    description: string,
    options?: { timeout?: number; ancestor?: WebdriverIO.Element }
  ): Promise<WebdriverIO.Element> {
    const selector = `.//*[@data-tid = 'neuron-card' and .//*[@data-tid="neuron-id" and text() = '${neuronId}']]`;
    const ancestor = options?.ancestor;
    const element =
      undefined === ancestor
        ? await this.browser.$(selector)
        : await ancestor.$(selector);
    const timeout = options?.timeout ?? 5_000;
    const timeoutMsg = `Timeout after ${timeout.toLocaleString()}ms waiting for "${description}" with neuron "${neuronId}".`;
    await element.waitForExist({ timeout, timeoutMsg });
    return element;
  }

  async getNeuronBalance(neuronId: string): Promise<number> {
    const neuron = await this.getNeuronById(
      neuronId,
      `Get neuron ${neuronId} to check balance`
    );
    const icpField = await neuron.$(`[data-tid="icp-value"]`);
    const icpValue = Number(await icpField.getText());
    if (Number.isFinite(icpValue)) {
      return icpValue;
    } else {
      throw new Error(
        `Could not get ICP for neuronId ${neuronId} from ${await icpField.getHTML(
          true
        )}`
      );
    }
  }

  // TODO: There is no good way to make sure that the browser has displayed the expected modal.  The text can change due to internationalisation.
  // Ideally the modal body would have a specific data-tid so that we can be sure that we have the expected modal and are sure that any further selectors are inside that expected modal.
  async waitForModalWithTitle(
    title: string,
    options?: { timeout?: number }
  ): Promise<void> {
    const timeout = options?.timeout ?? 5_000;
    const timeoutMsg = `Timeout after ${timeout.toLocaleString()}ms waiting for modal with title "${title}".`;
    await this.browser.waitUntil(
      async () =>
        this.getElement(
          NeuronsTab.MODAL_HEADER_SELECTOR,
          "Get modal header"
        ).then(async (element) => title === (await element.getText())),
      { timeout, timeoutMsg }
    );
  }

  async stakeNeuron(options?: {
    icp?: number;
    dissolveDelay?: number;
  }): Promise<{ neuronId: string }> {
    // WARNING: If we start before the accounts have loaded this fails.  Why?  No idea.
    // Waiting later does not help, it seems as if the wait has to be before we open the getIcp modal.
    // TODO: The getICP button should not be clickable until it works.
    await this.browser.pause(6000);
    // Ok, now the accounts should have loaded.

    const icp = options?.icp ?? 1;
    const dissolveDelay = options?.dissolveDelay ?? 100000000;

    console.log("Start staking neuron:");
    await this.click(
      NeuronsTab.STAKE_NEURON_BUTTON_SELECTOR,
      "Click to start staking neuron"
    );
    await this.getElement(NeuronsTab.MODAL_SELECTOR, "Wait for modal");

    console.log("Choose account");
    await this.waitForModalWithTitle("Select Source Account");
    await this.click(
      NeuronsTab.STAKE_NEURON_ACCOUNT_SELECTOR,
      "Choose to pay with the first account"
    );

    console.log("Input the amount");
    await this.waitForModalWithTitle("Stake Neuron");
    await this.getElement(
      NeuronsTab.STAKE_NEURON_AMOUNT_INPUT_SELECTOR,
      "Get stake amount input field"
    ).then((element) => element.setValue(icp.toString()));
    await this.click(
      NeuronsTab.STAKE_NEURON_SUBMIT_BUTTON_SELECTOR,
      "Submit neuron creation"
    );

    console.log("Setting dissolve delay...");
    await this.waitForModalWithTitle("Set Dissolve Delay", { timeout: 70_000 });
    if (dissolveDelay > 0) {
      await this.getElement(
        NeuronsTab.SET_DISSOLVE_DELAY_SLIDER_SELECTOR,
        "Get dissolve delay slider"
      ).then(async (element) => element.setValue(dissolveDelay));
      await this.click(
        NeuronsTab.SET_DISSOLVE_DELAY_SUBMIT_SELECTOR,
        "Submit dissolve delay"
      );

      console.log("Confirming dissolve delay...");
      await this.waitForModalWithTitle("Confirm Dissolve Delay");
      await this.click(
        NeuronsTab.SET_DISSOLVE_DELAY_CONFIRM_SELECTOR,
        "Confirm dissolve delay"
      );
    } else {
      this.click(
        NeuronsTab.SKIP_DISSOLVE_DELAY_SELECTOR,
        "Skip dissolve delay"
      );
    }

    console.log("Following neurons - skip");
    await this.waitForModalWithTitle("Follow neurons", { timeout: 30_000 });
    await this.click(NeuronsTab.MODAL_CLOSE_SELECTOR, "Close modal");
    await this.waitForGone(
      NeuronsTab.MODAL_SELECTOR,
      "Wait for modal to disappear",
      { timeout: 30_000 }
    );

    const neuronId = await this.getElement(
      NeuronsTab.NEURON_CARD_TITLE_SELECTOR,
      "Wait for neuron details"
    ).then((element) => element.getText());
    console.log(`Created neuronId ${neuronId}`);
    return { neuronId };
  }

  async mergeNeurons(neuronId1: string, neuronId2: string): Promise<void> {
    await this.click(
      NeuronsTab.MERGE_NEURONS_BUTTON_SELECTOR,
      "Start merge neurons flow"
    );
    const modal = await this.getElement(
      NeuronsTab.MODAL_SELECTOR,
      "Get the modal"
    );
    const neuronElement1 = await this.getNeuronById(
      neuronId1,
      "Get the first neuron to merge",
      { ancestor: modal }
    );
    await neuronElement1.click();
    const neuronElement2 = await this.getNeuronById(
      neuronId2,
      "Get the second neuron to merge",
      { ancestor: modal }
    );
    await neuronElement2.click();
    await this.click(
      `${NeuronsTab.MODAL_SELECTOR} ${NeuronsTab.MERGE_NEURONS_SUBMIT_SELECTOR}`,
      "Click to request merge"
    );
    await this.click(
      `${NeuronsTab.MODAL_SELECTOR} ${NeuronsTab.MERGE_NEURONS_CONFIRM_SELECTOR}`,
      "Click to confirm merge"
    );
    await this.waitForGone(
      NeuronsTab.MODAL_SELECTOR,
      "Waiting for the merge neurons modal to disappear"
    );
    await browser["screenshot"]("Merge neurons complete");
  }
}
