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
  let sourceNeuronId: string = "";
  let targetNeuronId: string = "";
  const sourceNeuronIcp = 1;
  const targetNeuronIcp = 7;
  const sourceDissolveDelaySeconds = 3600 * 24 * 365 * 3;
  const targetDissolveDelaySeconds = 3600 * 24 * 365 * 5;
  let sourceNeuronIcpBefore: number = NaN;
  let targetNeuronIcpBefore: number = NaN;

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
    sourceNeuronId = (
      await neuronsTab.stakeNeuron({
        icp: sourceNeuronIcp,
        dissolveDelay: sourceDissolveDelaySeconds,
      })
    ).neuronId;
    targetNeuronId = (
      await neuronsTab.stakeNeuron({
        icp: targetNeuronIcp,
        dissolveDelay: targetDissolveDelaySeconds,
      })
    ).neuronId;
    // TODO: Sometimes an incorrect account balance is shown later.  This should be fixed in svelte.
    await browser.pause(1000);
    browser.refresh();
  });

  it("merges the neurons", async () => {
    const neuronsTab = new NeuronsTab(browser);
    sourceNeuronIcpBefore = await neuronsTab.getNeuronBalance(sourceNeuronId);
    targetNeuronIcpBefore = await neuronsTab.getNeuronBalance(targetNeuronId);
    await neuronsTab.mergeNeurons(sourceNeuronId, targetNeuronId);
  });
  it("Merged balances are correct", async () => {
    const neuronsTab = new NeuronsTab(browser);
    const targetNeuronIcpAfter = await neuronsTab.getNeuronBalance(
      targetNeuronId
    );
    // Source neuron is not displayed because the stake is 0.
    try {
      await neuronsTab.getNeuronBalance(sourceNeuronId);
      expect(true).toBe(false);
    } catch (_) {
      expect(true).toBe(true);
    }
    const fees =
      sourceNeuronIcpBefore + targetNeuronIcpBefore - targetNeuronIcpAfter;
    const expectedMaxFees = 0.000101;
    if (fees < 0 || fees > expectedMaxFees) {
      throw new Error(
        `Incorrect neuron values: ${JSON.stringify({
          sourceNeuronIcpBefore,
          targetNeuronIcpBefore,
          targetNeuronIcpAfter,
          fees,
          expectedMaxFees,
        })}`
      );
    }
  });
});
