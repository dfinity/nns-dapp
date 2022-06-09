/**
 * Creates a standard set of users.
 */
import { register } from "../common/register";
import { MyNavigator } from "../common/navigator";
import { Header } from "../components/header";
import { NeuronsTab } from "../components/neurons-tab";

describe("Verifies that neurons can be merged", () => {
  let neuronId1: string = "";
  let neuronId2: string = "";
  const neuronIcp1 = 1;
  const neuronIcp2 = 7;
  const dissolveDelaySeconds1 = 3600 * 24 * 365 * 3;
  const dissolveDelaySeconds2 = 3600 * 24 * 365 * 5;
  let neuron1IcpBefore: number = NaN;
  let neuron2IcpBefore: number = NaN;

  before(function () {
    if (!["chrome"].includes(browser.capabilities.browserName)) this.skip();
  });

  /**
   * Setup creates a user with:
   * - ICP in the main account
   * - Two neurons
   */
  it("Setup: Create user", async () => {
    await browser.url("/");
    const userId = await register(browser);
    console.log(`Created user: ${JSON.stringify(userId)}`);
  });

  it("Setup: Give user ICP", async () => {
    await new Header(browser).getIcp(10);
  });

  it("Setup: Buy two neurons", async () => {
    const navigator = new MyNavigator(browser);
    await navigator.click(
      Header.TAB_TO_NEURONS_SELECTOR,
      "Go to the neurons tab"
    );
    const neuronsTab = new NeuronsTab(browser);
    neuronId1 = (
      await neuronsTab.stakeNeuron({
        icp: neuronIcp1,
        dissolveDelay: dissolveDelaySeconds1,
      })
    ).neuronId;
    neuronId2 = (
      await neuronsTab.stakeNeuron({
        icp: neuronIcp2,
        dissolveDelay: dissolveDelaySeconds2,
      })
    ).neuronId;
    // TODO: Sometimes an incorrect account balance is shown later.  This should be fixed in svelte.
    await browser.pause(1000);
    browser.refresh();
  });

  it("merges the neurons", async () => {
    const neuronsTab = new NeuronsTab(browser);
    neuron1IcpBefore = await neuronsTab.getNeuronBalance(neuronId1);
    neuron2IcpBefore = await neuronsTab.getNeuronBalance(neuronId2);
    await neuronsTab.mergeNeurons(neuronId1, neuronId2);
  });
  it("Merged balances are correct", async () => {
    const neuronsTab = new NeuronsTab(browser);
    const neuron1IcpAfter = await neuronsTab.getNeuronBalance(neuronId1);
    const neuron2IcpAfter = await neuronsTab.getNeuronBalance(neuronId2);
    expect(neuron2IcpAfter).toBe(0);
    const fees =
      neuron1IcpBefore + neuron2IcpBefore - neuron1IcpAfter - neuron2IcpAfter;
    const expectedMaxFees = 0.000101;
    if (fees < 0 || fees > expectedMaxFees || neuron2IcpAfter !== 0) {
      throw new Error(
        `Incorrect neuron values: ${JSON.stringify({
          neuron1IcpBefore,
          neuron2IcpBefore,
          neuron1IcpAfter,
          neuron2IcpAfter,
          fees,
          expectedMaxFees,
        })}`
      );
    }
  });
});
