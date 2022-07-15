/**
 * Creates a standard set of users.
 */
import { MyNavigator } from "../common/navigator";
import { register } from "../common/register";
import { skipUnlessBrowserIs } from "../common/test";
import { AccountsTab } from "../components/accounts-tab";
import { Icp } from "../components/icp";
import { NAV_NEURONS_SELECTOR } from "../components/nav";
import { NeuronsTab } from "../components/neurons-tab";

describe("Verifies that neurons can be created", () => {
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
    await new Icp(browser).getIcp(100);
  });

  it("gives_user1_a_neuron", async () => {
    const navigator = new MyNavigator(browser);
    await navigator.navigate({
      selector: NAV_NEURONS_SELECTOR,
      description: "Go to the neurons view",
    });
    const neuronsTab = new NeuronsTab(browser);
    await neuronsTab.stakeNeuron({ icp: 90 });
  });
});
