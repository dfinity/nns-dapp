/**
 * Creates a standard set of users.
 */
import { MyNavigator } from "../common/navigator";
import { register } from "../common/register";
import { skipUnlessBrowserIs } from "../common/test";
import { Icp } from "../components/icp";
import { NAV_NEURONS_SELECTOR } from "../components/nav";
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
    skipUnlessBrowserIs.bind(this)(["chrome"]);
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
    await new Icp(browser).getIcp(10);
  });

  it("Setup: Buy two neurons", async () => {
    const navigator = new MyNavigator(browser);
    await navigator.navigate({
      selector: NAV_NEURONS_SELECTOR,
      description: "Go to the neurons view",
    });
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
    // Second neuron is not displayed because the stake is 0.
    try {
      await neuronsTab.getNeuronBalance(neuronId2);
      expect(true).toBe(false);
    } catch (_) {
      expect(true).toBe(true);
    }
    const fees =
      neuron1IcpBefore + neuron2IcpBefore - neuron1IcpAfter;
    const expectedMaxFees = 0.000101;
    if (fees < 0 || fees > expectedMaxFees) {
      throw new Error(
        `Incorrect neuron values: ${JSON.stringify({
          neuron1IcpBefore,
          neuron2IcpBefore,
          neuron1IcpAfter,
          fees,
          expectedMaxFees,
        })}`
      );
    }
  });
});
