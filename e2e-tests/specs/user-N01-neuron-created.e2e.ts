/**
 * Creates a standard set of users.
 */
import { register } from "../common/register";
import { MyNavigator } from "../common/navigator";
import { Header } from "../components/header";
import { NeuronsTab } from "../components/neurons-tab";

describe("Verifies that neurons can be created", () => {
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
    await new Header(browser).getIcp(100);
  });

  it("gives_user1_a_neuron", async () => {
    const navigator = new MyNavigator(browser);
    await navigator.click(
      Header.TAB_TO_NEURONS_SELECTOR,
      "Go to the neurons tab"
    );
    const neuronsTab = new NeuronsTab(browser);
    await neuronsTab.stakeNeuron({ icp: 90 });
  });
});
