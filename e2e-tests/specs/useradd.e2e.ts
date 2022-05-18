/**
 * Creates a standard set of users.
 */
import { register } from "../common/register";
import { MyNavigator } from "../common/navigator";
import { Header } from "../components/header";
import { NeuronsTab } from "../components/neurons-tab";


describe("", () => {
  /**
   * Creates a user with:
   * - ICP in the main account
   * - A neuron
   */
  it("adds_user1", async () => {
    const navigator = new MyNavigator(browser);
    await browser.url("/");
    const userId = await register(browser);
    console.log(`Created user: ${userId}`);
    // Get ICP

// For debugging; remove before merging.
await browser.execute(() => {
  window.onerror = function (errorMsg, url, lineNumber) {
    alert('Error: ' + errorMsg + ' Script: ' + url + ' Line: ' + lineNumber);
  }
});

    // Get ICP
    await new Header(browser).getIcp(100);
    // Create a neuron
    await navigator.click(Header.TAB_TO_NEURONS_SELECTOR, "Go to the neurons tab");
    const neuronsTab = new NeuronsTab(browser);
    neuronsTab.stakeNeuron({icp: 1});
  });
});
