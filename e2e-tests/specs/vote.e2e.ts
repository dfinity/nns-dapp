import { loginWithIdentity } from "../common/login";
import {
  getNeuronsBody,
  getStakingButton,
  createProposal,
} from "../components/neurons";
import { waitForLoad } from "../common/waitForLoad";
import {
  getVotingTabButton,
  getNeuronTabButton,
} from "../components/header.ts";

describe("vote", () => {
  it("login", async () => {
    await browser.url("/");
    await waitForLoad(browser);
    await loginWithIdentity(browser, "10000");
  });

  it("getIcp", async () => {
    const balanceField = await browser.$(
      '[data-tid="card"] [data-tid="icp-value"]'
    );
    await balanceField.waitForExist({ timeout: 10000 });
    const balance = Number(await balanceField.getText());
    if (balance < 20) {
      const getIcpButton = await browser.$('[data-tid="get-icp-button"]');
      await getIcpButton.waitForExist();
      await getIcpButton.click();
      const numIcp = await browser.$('[data-tid="get-icp-form"] input');
      await numIcp.waitForExist();
      await numIcp.setValue("10");
      const submitButton = await browser.$('[data-tid="get-icp-submit"]');
      await submitButton.waitForExist();
      await browser.waitUntil(async () => submitButton.isClickable(), {
        timeoutMsg: "Timeout waiting for submitButton to be clickable.",
      });
      await browser["screenshot"]("get-icp-form");
      await submitButton.click();
      //browser.pause(10000);
      await browser.waitUntil(
        async () =>
          !(await browser.$('[data-tid="get-icp-form"]').isExisting()),
        {
          timeout: 20000,
          timeoutMsg: "Timeout waiting for the GetICP form to disappear.",
        }
      );
      await browser["screenshot"]("get-icp-finished");
    } else {
      console.log("Balance is already sufficient:", balance);
    }
  });

  it("goToNeuronTab", async () => {
    const tabButton = await getNeuronTabButton(browser);
    await tabButton.waitForExist();
    await browser.waitUntil(async () => tabButton.isClickable(), {
      timeoutMsg: "Timeout waiting for the neuron tab button.",
    });
    await tabButton.click();
    const neuronsTab = await getNeuronsBody(browser);
    await neuronsTab.waitForExist();
  });

  it("waitForNeuronsToLoad", async () => {
    // const loadingSpinner = await browser.$('[data-tid="spinner"]');
    // await browser.waitUntil(async () => !loadingSpinner.isExisting(), {timeout: 10000});
    browser.pause(3000);
  });
  it("createNeuronIfNone", async () => {
    await browser["screenshot"]("looking-for-neuron");
    const neuron = await browser.$(
      '[data-tid="neurons-body"] [data-tid="card"]'
    );
    if (await neuron.isExisting()) {
      console.log("We already have a neuron");
    } else {
      const stakingButton = await getStakingButton(browser);
      await stakingButton.waitForExist();
      await stakingButton.click();
      const accountButton = await browser.$('#modalContent [data-tid="card"]');
      await accountButton.waitForExist();
      await browser["screenshot"]("selecting-account");
      await accountButton.click();
      const stakeValue = await browser.$('#modalContent input[type="number"]');
      await stakeValue.waitForExist();
      await stakeValue.setValue(1);
      await browser.pause(1000);
      const createButton = await browser.$(
        '#modalContent [data-tid="create-neuron-button"]'
      );
      await createButton.waitForExist();
      await browser["screenshot"]("entered-neuron-amount");
      await createButton.click();
      await browser.waitUntil(
        async () =>
          !(await browser
            .$('#modalContent [data-tid="create-neuron-button"]')
            .isExisting()),
        {
          timeout: 60000,
          timeoutMsg:
            "Timeout waiting for the create neuron button to disappear.",
        }
      );
      await browser["screenshot"]("neuron-created");
      const dissolveDelaySlider = await browser.$(
        '#modalContent input[type="range"]'
      );
      await dissolveDelaySlider.waitForExist();
      const maxDissolveDelay = await dissolveDelaySlider.getAttribute("max");
      await dissolveDelaySlider.setValue(maxDissolveDelay);
      const updateDissolveDelayButton = await browser.$(
        "#modalContent button.primary"
      );
      await browser.waitUntil(
        async () => updateDissolveDelayButton.isClickable(),
        {
          timeoutMsg:
            "Timeout waiting for updateDissolveDelayButton to be clickable.",
        }
      );
      updateDissolveDelayButton.click();
      const confirmUpdateButton = await browser.$(
        '#modalContent [data-tid="confirm-delay-button"]'
      );
      await browser.waitUntil(async () => confirmUpdateButton.isClickable(), {
        timeoutMsg: "Timeout waiting for confirmUpdateButton to be clickable.",
      });
      confirmUpdateButton.click();
      await browser.waitUntil(
        async () =>
          !(await browser
            .$('#modalContent [data-tid="confirm-delay-button"]')
            .isExisting()),
        {
          timeout: 60000,
          timeoutMsg: "Timeout waiting for confirmUpdateButton to disappear.",
        }
      );
      const closeFollowingModal = await browser.$('[data-tid="close-modal"]');
      closeFollowingModal.waitForExist();
      await browser.waitUntil(async () => closeFollowingModal.isClickable(), {
        timeoutMsg:
          "Timeout waiting for the closeFollowingModal button to be clickable.",
      });
      await closeFollowingModal.click();
      await browser.waitUntil(
        async () => !(await browser.$('[data-tid="close-modal"]').isExisting()),
        {
          timeout: 60000,
          timeoutMsg: "Timeout waiting for the modal to disappear.",
        }
      );
    }
  });
  it("create-proposal", async () => {
    await createProposal();
  });
  it("navigateToVotingTab", async () => {
    const votingTabButton = await getVotingTabButton(browser);
    await votingTabButton.waitForExist();
    await votingTabButton.click();
    await browser["screenshot"]("voting-page");
  });
  it("hide-unavailable-proposals", async () => {
    // TODO: Only click if the checkbox is not checked.
    const hideUnavailableCheckbox = await browser.$(
      'label[for="hide-unavailable-proposals"]'
    );
    await hideUnavailableCheckbox.waitForExist();
    await hideUnavailableCheckbox.click();
    // TODO: How to check whether the reload has already taken place?
    await browser.pause(3000);
    await browser["screenshot"]("hide-unavailable");
  });
  it("votes", async () => {
    const proposalCard = await browser.$('[data-tid="card"]');
    await proposalCard.waitForExist();
    await proposalCard.click();
    // TODO: data-tid for the whole page, so we know when it has loaded.
    const yesMan = await browser.$('[data-tid="vote-yes"]');
    await yesMan.waitForExist();
    await browser.waitUntil(async () => yesMan.isClickable(), {
      timeoutMsg: "Timeout waiting for the yes vote button to be clickable.",
    });
    await browser["screenshot"]("ready-to-vote");
    await yesMan.click();

    const confirmButton = await browser.$('[data-tid="confirm-yes"]');
    await confirmButton.waitForExist();
    await browser.waitUntil(async () => confirmButton.isClickable(), {
      timeoutMsg: "Timeout waiting for the confirm-yes button to be clickable.",
    });
    await browser["screenshot"]("confirming-yes-vote");
    await confirmButton.click();
    await browser.pause(6000);
    await browser["screenshot"]("voted");
  });
});
