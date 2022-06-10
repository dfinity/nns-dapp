/**
 * Creates a standard set of users.
 */
import { register } from "../common/register";
import { MyNavigator } from "../common/navigator";
import { Header } from "../components/header";
import { NeuronsTab } from "../components/neurons-tab";
import { AccountsTab } from "../components/accounts-tab";
import { skipUnlessBrowserIs } from "../common/test";

describe("Verifies that neurons can be disbursed", () => {
  let neuronId: string | undefined = undefined;
  const accountName = "Main";
  const neuronIcp = 3;
  let accountIcpBefore: number = Infinity; // This will be set to the account holding before it receives the disbursal.

  before(function () {
    skipUnlessBrowserIs.bind(this)(["chrome"]);
  });

  /**
   * Creates a user with:
   * - ICP in the main account
   * - A neuron
   */
  it("adds_user1", async () => {
    await browser.url("/");
    const userId = await register(browser);
    console.log(`Created user: ${JSON.stringify(userId)}`);
  });

  it("gives_user1_icp", async () => {
    await new Header(browser).getIcp(10);
  });

  it("gives_user1_a_neuron", async () => {
    const navigator = new MyNavigator(browser);
    await navigator.click(
      Header.TAB_TO_NEURONS_SELECTOR,
      "Go to the neurons tab"
    );
    const neuronsTab = new NeuronsTab(browser);
    neuronId = (
      await neuronsTab.stakeNeuron({ icp: neuronIcp, dissolveDelay: 0 })
    ).neuronId;
    // TODO: Sometimes an incorrect account balance is shown later.  This should be fixed in svelte.
    await browser.pause(1000);
    browser.refresh();
  });

  it("dissolves the neuron", async () => {
    if (undefined === neuronId) {
      throw new Error("neuronId is undefined");
    }
    const neuronsTab = new NeuronsTab(browser);
    const neuronCard = await neuronsTab.getNeuronById(
      neuronId,
      "Get the neuron to disburse"
    );
    await neuronCard.click();
    await neuronsTab.getElement(
      NeuronsTab.NEURON_DETAIL_SELECTOR,
      "Verify that the neuron detail page has loaded"
    );
    await neuronsTab.click(
      NeuronsTab.DISBURSE_BUTTON_SELECTOR,
      "Start disbursing flow"
    );
    await neuronsTab.waitForModalWithTitle("Disburse Neuron");
    // Note: We are on the neurons tab but the account listing is the same as on the accounts tab, so we can use that selector:
    const account = await new AccountsTab(browser).getAccountByName(
      accountName,
      "Choose an existing account as the destination"
    );
    accountIcpBefore = await AccountsTab.getAccountCardIcp(account);
    console.warn(`Account holding before dissolution: ${accountIcpBefore}`);
    await account.click();
    await neuronsTab.click(
      NeuronsTab.DISBURSE_CONFIRM_SELECTOR,
      "Confirm disbursal"
    );
    await neuronsTab.waitForGone(
      NeuronsTab.NEURON_DETAIL_SELECTOR,
      "The neuron should disappear",
      { timeout: 30_000 }
    );
    await neuronsTab.getElement(
      NeuronsTab.SELECTOR,
      "Wait for the neurons tab main page"
    );
  });

  it("Goes to the accounts tab", async () => {
    const navigator = new MyNavigator(browser);
    await navigator.click(
      Header.TAB_TO_ACCOUNTS_SELECTOR,
      "Go to the accounts tab"
    );
  });

  it("The account is credited", async () => {
    const accountsTab = await new AccountsTab(browser);
    const account = await accountsTab.getAccountByName(
      accountName,
      "Getting the credited account"
    );
    const accountIcpAfter: number = await AccountsTab.getAccountCardIcp(
      account
    );
    const losses = accountIcpBefore + neuronIcp - accountIcpAfter;
    const expectedMaxFees = 0.0001;
    if (losses < 0 || losses > expectedMaxFees) {
      throw new Error(
        `Expected to recoup most of the ICP but got: ${JSON.stringify({
          neuronIcp,
          accountIcpBefore,
          accountIcpAfter,
          losses,
          expectedMaxFees,
        })}`
      );
    }
  });
});
